import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, Clock3, FileText, LogOut, Plus, Receipt, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";
import { LeafMark } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Panel, Pill, StatCard, type Tone } from "@/components/app/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [
    { title: "My Patient Portal | MJD Wellness" },
    { name: "description", content: "Private MJD Wellness appointments, forms, and payments." },
    { property: "og:title", content: "My Patient Portal | MJD Wellness" },
    { property: "og:description", content: "Private patient appointments, forms, and payments." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Portal,
});

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const statusTone = (status: string): Tone => status === "paid" || status === "completed" || status === "confirmed" ? "green" : status === "failed" || status === "overdue" || status === "expired" ? "red" : "orange";

function Portal() {
  const account = useAccount();
  const userId = account.session?.user.id;
  const { data, isLoading } = useQuery({
    queryKey: ["my-portal", userId], enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return null;
      const { data: patient, error } = await supabase.from("patients").select("*").eq("profile_id", userId).maybeSingle();
      if (error) throw error;
      if (!patient) return null;
      const [organizationResult, appointmentsResult, formsResult, paymentsResult, servicesResult] = await Promise.all([
        supabase.from("organizations").select("id,name,phone,email,website,address,timezone").eq("id", patient.organization_id).single(),
        supabase.from("appointments").select("*").eq("patient_id", patient.id).order("starts_at"),
        supabase.from("patient_forms").select("*, form_templates(form_fields(*))").eq("patient_id", patient.id).order("due_at"),
        supabase.from("patient_payments").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false }),
        supabase.from("appointment_services").select("*").eq("organization_id", patient.organization_id).eq("status", "active").order("name"),
      ]);
      const queryError = organizationResult.error ?? appointmentsResult.error ?? formsResult.error ?? paymentsResult.error ?? servicesResult.error;
      if (queryError) throw queryError;
      return { organization: organizationResult.data, patient, appointments: appointmentsResult.data ?? [], forms: formsResult.data ?? [], payments: paymentsResult.data ?? [], services: servicesResult.data ?? [] };
    },
  });
  const pendingForms = data?.forms.filter((form) => form.status !== "completed").length ?? 0;
  const balance = data?.payments.filter((payment) => payment.status === "pending" || payment.status === "overdue").reduce((sum, payment) => sum + payment.amount_cents, 0) ?? 0;
  const queryClient = useQueryClient();
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [bookingOpen, setBookingOpen] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [slotValue, setSlotValue] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const activeForm = data?.forms.find((form) => form.id === activeFormId);
  const activeTemplate = activeForm && !Array.isArray(activeForm.form_templates) ? activeForm.form_templates : Array.isArray(activeForm?.form_templates) ? activeForm.form_templates[0] : null;
  const activeFields = [...(activeTemplate?.form_fields ?? [])].sort((a, b) => a.position - b.position);
  const submitForm = useMutation({ mutationFn: async () => { if (!activeFormId) throw new Error("Choose a form."); const { error } = await supabase.rpc("submit_patient_form", { _form_id: activeFormId, _responses: responses }); if (error) throw error; }, onSuccess: async () => { toast.success("Form submitted"); setActiveFormId(null); setResponses({}); await queryClient.invalidateQueries({ queryKey: ["my-portal", userId] }); }, onError: (error) => toast.error(error.message) });
  const { data: slots = [], isFetching: slotsLoading } = useQuery({ queryKey: ["appointment-slots", serviceId], enabled: Boolean(serviceId && bookingOpen), queryFn: async () => { const { data: available, error } = await supabase.rpc("get_available_appointment_slots", { _service_id: serviceId, _days: 21 }); if (error) throw error; return available ?? []; } });
  const slotsByDay = useMemo(() => slots.reduce<Record<string, typeof slots>>((groups, slot) => { const key = new Date(slot.starts_at).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }); (groups[key] ??= []).push(slot); return groups; }, {}), [slots]);
  const bookAppointment = useMutation({ mutationFn: async () => { const slot = slots.find((item) => `${item.availability_id}|${item.starts_at}` === slotValue); if (!slot || !serviceId) throw new Error("Choose an available time."); const { error } = await supabase.rpc("book_patient_appointment", { _service_id: serviceId, _availability_id: slot.availability_id, _starts_at: slot.starts_at, _notes: bookingNotes }); if (error) throw error; }, onSuccess: async () => { toast.success("Appointment requested"); setBookingOpen(false); setServiceId(""); setSlotValue(""); setBookingNotes(""); await queryClient.invalidateQueries({ queryKey: ["my-portal", userId] }); }, onError: (error) => toast.error(error.message) });
  return <main className="min-h-screen bg-background">
    <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-5"><div className="flex items-center gap-3 text-primary"><LeafMark/><span className="font-semibold text-foreground">{data?.organization.name ?? account.organization?.name ?? "Patient"} Portal</span></div><Button size="sm" variant="ghost" onClick={() => void account.signOut()}><LogOut/>Sign out</Button></header>
    <div className="mx-auto max-w-6xl p-4 sm:p-5">
      <div className="border-b border-border pb-5"><p className="text-[11px] uppercase text-primary">Private patient account</p><h1 className="mt-1 text-2xl font-semibold">Welcome, {data?.patient.first_name ?? account.displayName}</h1><p className="mt-1 text-sm text-muted-foreground">Your appointments, required forms, and payment activity in one place.</p></div>
      {isLoading ? <p className="py-12 text-sm text-muted-foreground">Loading your records…</p> : data ? <>
        <div className="grid overflow-hidden border border-border sm:grid-cols-3"><StatCard icon={<CalendarDays/>} value={String(data.appointments.length)} label="Appointments" sub="Linked to your care"/><StatCard icon={<FileText/>} tone="orange" value={String(pendingForms)} label="Forms due"/><StatCard icon={<WalletCards/>} tone="green" value={money(balance)} label="Current balance"/></div>
        <Tabs defaultValue="appointments" className="mt-5">
          <TabsList className="h-10 w-full justify-start rounded-md border border-border bg-surface p-1 sm:w-auto"><TabsTrigger value="appointments"><CalendarDays className="mr-2 size-4"/>Appointments</TabsTrigger><TabsTrigger value="forms"><FileText className="mr-2 size-4"/>Forms</TabsTrigger><TabsTrigger value="payments"><Receipt className="mr-2 size-4"/>Payments</TabsTrigger></TabsList>
          <TabsContent value="appointments" className="mt-4"><Panel title="Your appointments" action={<Button size="sm" onClick={() => setBookingOpen(true)}><Plus/>Book a visit</Button>} bodyClassName="p-0"><div>{data.appointments.length ? data.appointments.map((appointment) => <div key={appointment.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0"><div className="flex size-10 items-center justify-center rounded bg-info-soft text-primary"><CalendarDays className="size-5"/></div><div className="min-w-48 flex-1"><b className="block text-sm">{new Date(appointment.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</b><span className="text-xs text-muted-foreground">{appointment.appointment_type} · {appointment.provider_name}</span>{appointment.notes ? <p className="mt-1 text-xs text-muted-foreground">{appointment.notes}</p> : null}</div><Pill tone={statusTone(appointment.status)}>{appointment.status.replace("_", " ")}</Pill></div>) : <Empty label="No appointments scheduled"/>}</div></Panel></TabsContent>
          <TabsContent value="forms" className="mt-4"><Panel title="Forms assigned to you" bodyClassName="p-0">{data.forms.length ? data.forms.map((form) => <div key={form.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0"><div className="flex size-10 items-center justify-center rounded bg-warning-soft text-warning"><FileText className="size-5"/></div><div className="min-w-48 flex-1"><b className="block text-sm">{form.form_name}</b><span className="text-xs text-muted-foreground">{form.description}</span>{form.due_at ? <p className="mt-1 text-[11px] text-muted-foreground">Due {new Date(form.due_at).toLocaleDateString([], { dateStyle: "medium" })}</p> : null}</div><Pill tone={statusTone(form.status)}>{form.status.replace("_", " ")}</Pill>{form.status !== "completed" && form.template_id ? <Button size="sm" onClick={() => { setActiveFormId(form.id); setResponses({}); }}>Open form</Button> : form.submitted_at ? <span className="text-[11px] text-muted-foreground">Submitted {new Date(form.submitted_at).toLocaleDateString()}</span> : null}</div>) : <Empty label="No forms assigned"/>}</Panel></TabsContent>
          <TabsContent value="payments" className="mt-4"><div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]"><Panel title="Payment history" bodyClassName="p-0">{data.payments.length ? data.payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0"><div className="flex size-10 items-center justify-center rounded bg-success-soft text-success"><Receipt className="size-5"/></div><div className="min-w-48 flex-1"><b className="block text-sm">{payment.description}</b><span className="text-xs text-muted-foreground">{payment.paid_at ? `Paid ${new Date(payment.paid_at).toLocaleDateString([], { dateStyle: "medium" })}` : payment.due_at ? `Due ${new Date(payment.due_at).toLocaleDateString([], { dateStyle: "medium" })}` : "Account activity"}</span></div><b className="text-sm">{money(payment.amount_cents)}</b><Pill tone={statusTone(payment.status)}>{payment.status}</Pill></div>) : <Empty label="No payment activity"/>}</Panel><Panel title="Account balance"><div className="flex items-center gap-3"><WalletCards className="size-5 text-primary"/><div><p className="text-2xl font-semibold">{money(balance)}</p><p className="text-xs text-muted-foreground">Outstanding balance</p></div></div><div className="mt-5 border-t border-border pt-4"><p className="text-xs text-muted-foreground">Card details are handled by the payment processor and are never stored here.</p></div></Panel></div></TabsContent>
        </Tabs>
        <Panel className="mt-5" title="Contact details"><div className="grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-[11px] text-muted-foreground">Email</p><p>{data.patient.email ?? "—"}</p></div><div><p className="text-[11px] text-muted-foreground">Phone</p><p>{data.patient.phone ?? "—"}</p></div><div><p className="text-[11px] text-muted-foreground">Provider</p><p>{data.patient.provider_name ?? "—"}</p></div></div></Panel>
      </> : <Panel className="mt-6" title="Account setup"><p className="text-sm text-muted-foreground">Your login is active, but a patient record has not been linked yet. Please contact your practice.</p></Panel>}
    </div>
    <Dialog open={Boolean(activeFormId)} onOpenChange={(open) => { if (!open) { setActiveFormId(null); setResponses({}); } }}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{activeForm?.form_name ?? "Patient form"}</DialogTitle><DialogDescription>{activeForm?.description ?? "Complete all required fields before submitting."}</DialogDescription></DialogHeader><form onSubmit={(event: FormEvent) => { event.preventDefault(); submitForm.mutate(); }} className="space-y-4">{activeFields.map((field) => <div key={field.id} className="space-y-1.5"><Label htmlFor={`response-${field.id}`}>{field.label}{field.required ? " *" : ""}</Label>{field.field_type === "textarea" || field.field_type === "signature" ? <Textarea id={`response-${field.id}`} required={field.required} placeholder={field.field_type === "signature" ? "Type your full legal name" : undefined} value={responses[field.id] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [field.id]: event.target.value }))}/> : field.field_type === "yes_no" ? <Select required={field.required} value={responses[field.id] ?? ""} onValueChange={(value) => setResponses((current) => ({ ...current, [field.id]: value }))}><SelectTrigger id={`response-${field.id}`}><SelectValue placeholder="Choose yes or no"/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent></Select> : <Input id={`response-${field.id}`} required={field.required} type={field.field_type === "phone" ? "tel" : field.field_type} value={responses[field.id] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [field.id]: event.target.value }))}/>}</div>)}{activeFields.length ? <DialogFooter><Button type="button" variant="outline" onClick={() => setActiveFormId(null)}>Cancel</Button><Button disabled={submitForm.isPending}>{submitForm.isPending ? "Submitting…" : "Submit form"}</Button></DialogFooter> : <p className="text-sm text-muted-foreground">This form does not have any fields yet. Please contact your practice.</p>}</form></DialogContent></Dialog>
    <Dialog open={bookingOpen} onOpenChange={(open) => { setBookingOpen(open); if (!open) { setServiceId(""); setSlotValue(""); setBookingNotes(""); } }}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Book a visit</DialogTitle><DialogDescription>Choose a visit type and an available time with your provider.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); bookAppointment.mutate(); }}><div className="space-y-1.5"><Label>Visit type</Label><Select value={serviceId} onValueChange={(value) => { setServiceId(value); setSlotValue(""); }}><SelectTrigger><SelectValue placeholder="Choose a visit type"/></SelectTrigger><SelectContent>{data?.services.map((service) => <SelectItem key={service.id} value={service.id}>{service.name} · {service.duration_minutes} min</SelectItem>)}</SelectContent></Select></div>{serviceId ? <div className="space-y-2"><Label>Available times</Label>{slotsLoading ? <p className="text-xs text-muted-foreground">Finding available times…</p> : Object.keys(slotsByDay).length ? <div className="max-h-64 space-y-3 overflow-y-auto rounded border border-border p-3">{Object.entries(slotsByDay).map(([day, daySlots]) => <div key={day}><p className="mb-2 text-xs font-semibold">{day}</p><div className="flex flex-wrap gap-2">{daySlots.map((slot) => { const value = `${slot.availability_id}|${slot.starts_at}`; return <Button key={value} size="sm" type="button" variant={slotValue === value ? "default" : "outline"} onClick={() => setSlotValue(value)}>{new Date(slot.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Button>; })}</div></div>)}</div> : <p className="rounded border border-border p-4 text-xs text-muted-foreground">No available times in the next three weeks.</p>}</div> : null}<div className="space-y-1.5"><Label htmlFor="booking-notes">Reason for visit</Label><Textarea id="booking-notes" value={bookingNotes} onChange={(event) => setBookingNotes(event.target.value)} placeholder="Share anything your provider should know"/></div><DialogFooter><Button type="button" variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button><Button disabled={!slotValue || bookAppointment.isPending}>{bookAppointment.isPending ? "Booking…" : "Request appointment"}</Button></DialogFooter></form></DialogContent></Dialog>
  </main>;
}

function Empty({ label }: { label: string }) { return <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground"><Clock3 className="size-4"/><span>{label}</span><CheckCircle2 className="ml-auto size-4"/></div>; }