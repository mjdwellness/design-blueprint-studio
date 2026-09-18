// Server function that pulls this organization's patient panel from
// Practice Fusion and upserts it into our own `patients` table. Called from
// the org-scoped Integrations page's "Sync now" button — never runs
// automatically yet, so a connected organization controls when it happens.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getPracticeFusionConfig } from "./config.server";
import { fetchPracticeFusionPatients } from "./client.server";

type SyncInput = {
  organizationId: string;
  // The caller's current Supabase access token (from supabase.auth.getSession()
  // on the client) — used to check they're actually allowed to sync this
  // organization before we touch anything with the service role.
  accessToken: string;
};

async function assertCanSync(organizationId: string, accessToken: string): Promise<void> {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_ANON_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured on the server.");

  const asUser = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await asUser.auth.getUser();
  if (userError || !userData.user) throw new Error("Not signed in.");

  const [{ data: isOrgAdmin }, { data: roles }] = await Promise.all([
    asUser.rpc("is_org_admin", { _organization_id: organizationId, _user_id: userData.user.id }),
    asUser.from("user_roles").select("role").eq("user_id", userData.user.id),
  ]);
  const isSuperAdmin = (roles ?? []).some((r) => r.role === "super_admin");
  if (!isOrgAdmin && !isSuperAdmin) {
    throw new Error("Only this organization's admin, or the platform owner, can sync Practice Fusion.");
  }
}

export const syncPracticeFusionPatients = createServerFn({ method: "POST" })
  .validator((data: SyncInput) => data)
  .handler(async ({ data }) => {
    const { organizationId, accessToken } = data;
    await assertCanSync(organizationId, accessToken);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const config = getPracticeFusionConfig();
      const patients = await fetchPracticeFusionPatients(config);

      for (const patient of patients) {
        const { error } = await supabaseAdmin.from("patients").upsert(
          {
            organization_id: organizationId,
            ehr_reference: patient.fhirId,
            patient_number: `PF-${patient.fhirId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}`,
            first_name: patient.firstName,
            last_name: patient.lastName,
            date_of_birth: patient.dateOfBirth,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            status: "active",
          },
          { onConflict: "organization_id,ehr_reference" },
        );
        if (error) throw error;
      }

      // Upsert (not update) so the very first successful sync creates this
      // organization's connection row — nothing has to pre-create it.
      await supabaseAdmin.from("ehr_connections").upsert(
        { organization_id: organizationId, provider: "practice_fusion", status: "connected", last_synced_at: new Date().toISOString(), last_sync_error: null, patients_synced: patients.length },
        { onConflict: "organization_id,provider" },
      );

      return { synced: patients.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error";
      await supabaseAdmin.from("ehr_connections").upsert(
        { organization_id: organizationId, provider: "practice_fusion", status: "error", last_sync_error: message },
        { onConflict: "organization_id,provider" },
      );
      throw error;
    }
  });
