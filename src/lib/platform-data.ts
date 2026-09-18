import { supabase } from "@/integrations/supabase/client";

export async function getPatients(organizationId?: string) {
  let query = supabase.from("patients").select("*").order("last_name");
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAppointments(organizationId?: string) {
  let query = supabase.from("appointments").select("*, patients(first_name,last_name,patient_number)").order("starts_at");
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCalls(organizationId?: string) {
  let query = supabase.from("calls").select("*, patients(first_name,last_name)").order("started_at", { ascending: false });
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getInbox() {
  const { data, error } = await supabase.from("conversations").select("*, patients(*)").order("last_message_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("sent_at");
  if (error) throw error;
  return data;
}

export async function getAdminRecords(kind: "organizations" | "locations" | "users" | "subscriptions" | "telecom") {
  if (kind === "organizations") return (await supabase.from("organizations").select("*").order("created_at", { ascending: false })).data ?? [];
  if (kind === "locations") return (await supabase.from("locations").select("*, organizations(name)").order("created_at", { ascending: false })).data ?? [];
  if (kind === "subscriptions") return (await supabase.from("subscriptions").select("*, organizations(name)").order("updated_at", { ascending: false })).data ?? [];
  if (kind === "telecom") return (await supabase.from("phone_numbers").select("*, organizations(name), locations(name)").order("created_at", { ascending: false })).data ?? [];
  return (await supabase.from("profiles").select("*, user_roles(role), organization_memberships(title, organizations(name))").order("created_at", { ascending: false })).data ?? [];
}

export async function getPlatformOverview() {
  const [
    { data: organizations, error: orgError },
    { data: profiles, error: profileError },
    { data: calls, error: callError },
    { count: messageCount, error: messageError },
    { data: payments, error: paymentError },
    { data: subscriptions, error: subError },
  ] = await Promise.all([
    supabase.from("organizations").select("id,name,slug,specialty,status,practice_size,created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,display_name,status,created_at"),
    supabase.from("calls").select("id,organization_id,started_at,status,duration_seconds,direction,organizations(name)").order("started_at", { ascending: false }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("patient_payments").select("id,organization_id,amount_cents,status,paid_at,created_at,organizations(name)").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("id,organization_id,plan_name,monthly_amount_cents,status,organizations(name)"),
  ]);
  const error = orgError ?? profileError ?? callError ?? messageError ?? paymentError ?? subError;
  if (error) throw error;
  return {
    organizations: organizations ?? [],
    profiles: profiles ?? [],
    calls: calls ?? [],
    messageCount: messageCount ?? 0,
    payments: payments ?? [],
    subscriptions: subscriptions ?? [],
  };
}

// organizationId scopes every table to one practice — required for org-level
// staff (org_admin, provider, nurse, front_desk, billing) so nobody outside
// the platform owner (super_admin) sees another organization's patients,
// appointments, payments, hours, or forms.
export async function getStaffDashboardMetrics(organizationId?: string) {
  const scoped = <T extends { eq: (column: "organization_id", value: string) => T }>(query: T): T =>
    organizationId ? query.eq("organization_id", organizationId) : query;

  const [{ data: patients, error: patientError }, { data: appointments, error: appointmentError }, { data: payments, error: paymentError }, { data: hours, error: hoursError }, { data: forms, error: formsError }] = await Promise.all([
    scoped(supabase.from("patients").select("id,status,created_at")),
    scoped(supabase.from("appointments").select("id,status,starts_at,ends_at,appointment_type,provider_name,patients(first_name,last_name)")).order("starts_at"),
    scoped(supabase.from("patient_payments").select("id,amount_cents,status,paid_at,due_at,description,patients(first_name,last_name)")).order("created_at", { ascending: false }),
    scoped(supabase.from("staff_time_entries").select("id,user_id,clocked_in_at,clocked_out_at,break_minutes,status,profiles!staff_time_entries_user_id_fkey(display_name)")).order("clocked_in_at", { ascending: false }),
    scoped(supabase.from("patient_forms").select("id,form_name,status,due_at,patients(first_name,last_name)")).not("due_at", "is", null).order("due_at"),
  ]);
  const error = patientError ?? appointmentError ?? paymentError ?? hoursError ?? formsError;
  if (error) throw error;
  return { patients: patients ?? [], appointments: appointments ?? [], payments: payments ?? [], hours: hours ?? [], forms: forms ?? [] };
}