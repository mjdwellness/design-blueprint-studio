import { supabase } from "@/integrations/supabase/client";

export const MJD_ORG_ID = "10000000-0000-0000-0000-000000000001";

export async function getPatients() {
  const { data, error } = await supabase.from("patients").select("*").order("last_name");
  if (error) throw error;
  return data;
}

export async function getAppointments() {
  const { data, error } = await supabase.from("appointments").select("*, patients(first_name,last_name,patient_number)").order("starts_at");
  if (error) throw error;
  return data;
}

export async function getCalls() {
  const { data, error } = await supabase.from("calls").select("*, patients(first_name,last_name)").order("started_at", { ascending: false });
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

export async function getStaffDashboardMetrics() {
  const [{ data: patients, error: patientError }, { data: appointments, error: appointmentError }, { data: payments, error: paymentError }, { data: hours, error: hoursError }, { data: forms, error: formsError }] = await Promise.all([
    supabase.from("patients").select("id,status,created_at"),
    supabase.from("appointments").select("id,status,starts_at,ends_at,appointment_type,provider_name,patients(first_name,last_name)").order("starts_at"),
    supabase.from("patient_payments").select("id,amount_cents,status,paid_at,due_at,description,patients(first_name,last_name)").order("created_at", { ascending: false }),
    supabase.from("staff_time_entries").select("id,user_id,clocked_in_at,clocked_out_at,break_minutes,status,profiles!staff_time_entries_user_id_fkey(display_name)").order("clocked_in_at", { ascending: false }),
    supabase.from("patient_forms").select("id,form_name,status,due_at,patients(first_name,last_name)").not("due_at", "is", null).order("due_at"),
  ]);
  const error = patientError ?? appointmentError ?? paymentError ?? hoursError ?? formsError;
  if (error) throw error;
  return { patients: patients ?? [], appointments: appointments ?? [], payments: payments ?? [], hours: hours ?? [], forms: forms ?? [] };
}