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