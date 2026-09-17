import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/bootstrap-mjd")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
        if (listError) return Response.json({ error: listError.message }, { status: 500 });
        if (existing.users.length > 0) return Response.json({ error: "Initial accounts already exist" }, { status: 409 });

        const organizationId = "10000000-0000-0000-0000-000000000001";
        const locationId = "20000000-0000-0000-0000-000000000001";
        const origin = new URL("http://localhost:8080");
        const accounts = [
          { email: "info@mjdwellness.org", name: "Emmanuella Fleurimont", role: "org_admin" as const, title: "Organization Administrator" },
          { email: "acerneau.97@gmail.com", name: "Marie Antoine", role: "patient" as const, title: "Patient" },
        ];

        for (const account of accounts) {
          const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(account.email, {
            redirectTo: `${origin.origin}/reset-password`,
            data: { display_name: account.name },
          });
          if (error || !data.user) return Response.json({ error: error?.message ?? "Account invitation failed" }, { status: 500 });
          const userId = data.user.id;
          const { error: profileError } = await supabaseAdmin.from("profiles").upsert({ id: userId, email: account.email, display_name: account.name, status: "pending" });
          if (profileError) return Response.json({ error: profileError.message }, { status: 500 });
          const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: account.role }, { onConflict: "user_id,role" });
          if (roleError) return Response.json({ error: roleError.message }, { status: 500 });
          const { error: membershipError } = await supabaseAdmin.from("organization_memberships").upsert({ organization_id: organizationId, user_id: userId, location_id: locationId, title: account.title, status: "active" }, { onConflict: "organization_id,user_id" });
          if (membershipError) return Response.json({ error: membershipError.message }, { status: 500 });
          if (account.role === "patient") {
            const { error: patientError } = await supabaseAdmin.from("patients").update({ profile_id: userId }).eq("organization_id", organizationId).eq("email", account.email);
            if (patientError) return Response.json({ error: patientError.message }, { status: 500 });
          }
        }
        return Response.json({ ok: true });
      },
    },
  },
});