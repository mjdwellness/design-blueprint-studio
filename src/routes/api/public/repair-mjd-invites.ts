import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/repair-mjd-invites")({
  server: { handlers: { POST: async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expected = new Set(["info@mjdwellness.org", "acerneau.97@gmail.com"]);
    const { data: current, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 20 });
    if (listError) return Response.json({ error: listError.message }, { status: 500 });
    if (current.users.some((user) => !user.email || !expected.has(user.email))) return Response.json({ error: "Account set is no longer eligible for initial repair" }, { status: 409 });
    const organizationId = "10000000-0000-0000-0000-000000000001";
    const locationId = "20000000-0000-0000-0000-000000000001";
    const accounts = [
      { email: "info@mjdwellness.org", name: "Emmanuella Fleurimont", role: "org_admin" as const, title: "Organization Administrator" },
      { email: "acerneau.97@gmail.com", name: "Marie Antoine", role: "patient" as const, title: "Patient" },
    ];
    for (const user of current.users) {
      await supabaseAdmin.from("patients").update({ profile_id: null }).eq("profile_id", user.id);
      await supabaseAdmin.from("organization_memberships").delete().eq("user_id", user.id);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id);
      await supabaseAdmin.from("profiles").delete().eq("id", user.id);
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
    for (const account of accounts) {
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(account.email, { redirectTo: "https://id-preview--04f458ee-f120-4e10-af8a-482b8bb51b5e.lovable.app/reset-password", data: { display_name: account.name } });
      if (error || !data.user) return Response.json({ error: error?.message ?? "Invitation failed" }, { status: 500 });
      const userId = data.user.id;
      await supabaseAdmin.from("profiles").upsert({ id: userId, email: account.email, display_name: account.name, status: "pending" });
      await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: account.role }, { onConflict: "user_id,role" });
      await supabaseAdmin.from("organization_memberships").upsert({ organization_id: organizationId, user_id: userId, location_id: locationId, title: account.title, status: "active" }, { onConflict: "organization_id,user_id" });
      if (account.role === "patient") await supabaseAdmin.from("patients").update({ profile_id: userId }).eq("organization_id", organizationId).eq("email", account.email);
    }
    return Response.json({ ok: true });
  } } },
});