import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, FileText, LogOut, Receipt, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";
import { LeafMark } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Panel, Pill, StatCard, type Tone } from "@/components/app/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      const [appointmentsResult, formsResult, paymentsResult] = await Promise.all([
        supabase.from("appointments").select("*").eq("patient_id", patient.id).order("starts_at"),
        supabase.from("patient_forms").select("*").eq("patient_id", patient.id).order("due_at"),
        supabase.from("patient_payments").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false }),
      ]);
      const queryError = appointmentsResult.error ?? formsResult.error ?? paymentsResult.error;
      if (queryError) throw queryError;
      return { patient, appointments: appointmentsResult.data ?? [], forms: formsResult.data ?? [], payments: paymentsResult.data ?? [] };
    },
  });
  const pendingForms = data?.forms.filter((form) => form.status !== "completed").length ?? 0;
  const balance = data?.payments.filter((payment) => payment.status === "pending" || payment.status === "overdue").reduce((sum, payment) => sum + payment.amount_cents, 0) ?? 0;
  return <main className="min-h-screen bg-background">
    <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-5"><div className="flex items-center gap-3 text-primary"><LeafMark/><span className="font-semibold text-foreground">MJD Wellness Patient Portal</span></div><Button size="sm" variant="ghost" onClick={() => void account.signOut()}><LogOut/>Sign out</Button></header>
    <div className="mx-auto max-w-6xl p-4 sm:p-5">
      <div className="border-b border-border pb-5"><p className="text-[11px] uppercase text-primary">Private patient account</p><h1 className="mt-1 text-2xl font-semibold">Welcome, {data?.patient.first_name ?? account.displayName}</h1><p className="mt-1 text-sm text-muted-foreground">Your appointments, required forms, and payment activity in one place.</p></div>
      {isLoading ? <p className="py-12 text-sm text-muted-foreground">Loading your records…</p> : data ? <>
        <div className="grid overflow-hidden border border-border sm:grid-cols-3"><StatCard icon={<CalendarDays/>} value={String(data.appointments.length)} label="Appointments" sub="Linked to your care"/><StatCard icon={<FileText/>} tone="orange" value={String(pendingForms)} label="Forms due"/><StatCard icon={<WalletCards/>} tone="green" value={money(balance)} label="Current balance"/></div>
        <Tabs defaultValue="appointments" className="mt-5">
          <TabsList className="h-10 w-full justify-start rounded-md border border-border bg-surface p-1 sm:w-auto"><TabsTrigger value="appointments"><CalendarDays className="mr-2 size-4"/>Appointments</TabsTrigger><TabsTrigger value="forms"><FileText className="mr-2 size-4"/>Forms</TabsTrigger><TabsTrigger value="payments"><Receipt className="mr-2 size-4"/>Payments</TabsTrigger></TabsList>
          <TabsContent value="appointments" className="mt-4"><Panel title="Your appointments" bodyClassName="p-0"><div>{data.appointments.length ? data.appointments.map((appointment) => <div key={appointment.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0"><div className="flex size-10 items-center justify-center rounded bg-info-soft text-primary"><CalendarDays className="size-5"/></div><div className="min-w-48 flex-1"><b className="block text-sm">{new Date(appointment.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</b><span className="text-xs text-muted-foreground">{appointment.appointment_type} · {appointment.provider_name}</span>{appointment.notes ? <p className="mt-1 text-xs text-muted-foreground">{appointment.notes}</p> : null}</div><Pill tone={statusTone(appointment.status)}>{appointment.status.replace("_", " ")}</Pill></div>) : <Empty label="No appointments scheduled"/>}</div></Panel></TabsContent>
          <TabsContent value="forms" className="mt-4"><Panel title="Forms assigned to you" bodyClassName="p-0">{data.forms.length ? data.forms.map((form) => <div key={form.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0"><div className="flex size-10 items-center justify-center rounded bg-warning-soft text-warning"><FileText className="size-5"/></div><div className="min-w-48 flex-1"><b className="block text-sm">{form.form_name}</b><span className="text-xs text-muted-foreground">{form.description}</span>{form.due_at ? <p className="mt-1 text-[11px] text-muted-foreground">Due {new Date(form.due_at).toLocaleDateString([], { dateStyle: "medium" })}</p> : null}</div><Pill tone={statusTone(form.status)}>{form.status.replace("_", " ")}</Pill></div>) : <Empty label="No forms assigned"/>}</Panel></TabsContent>
          <TabsContent value="payments" className="mt-4"><div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]"><Panel title="Payment history" bodyClassName="p-0">{data.payments.length ? data.payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0"><div className="flex size-10 items-center justify-center rounded bg-success-soft text-success"><Receipt className="size-5"/></div><div className="min-w-48 flex-1"><b className="block text-sm">{payment.description}</b><span className="text-xs text-muted-foreground">{payment.paid_at ? `Paid ${new Date(payment.paid_at).toLocaleDateString([], { dateStyle: "medium" })}` : payment.due_at ? `Due ${new Date(payment.due_at).toLocaleDateString([], { dateStyle: "medium" })}` : "Account activity"}</span></div><b className="text-sm">{money(payment.amount_cents)}</b><Pill tone={statusTone(payment.status)}>{payment.status}</Pill></div>) : <Empty label="No payment activity"/>}</Panel><Panel title="Account balance"><div className="flex items-center gap-3"><WalletCards className="size-5 text-primary"/><div><p className="text-2xl font-semibold">{money(balance)}</p><p className="text-xs text-muted-foreground">Outstanding balance</p></div></div><div className="mt-5 border-t border-border pt-4"><p className="text-xs text-muted-foreground">Card details are handled by the payment processor and are never stored here.</p></div></Panel></div></TabsContent>
        </Tabs>
        <Panel className="mt-5" title="Contact details"><div className="grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-[11px] text-muted-foreground">Email</p><p>{data.patient.email ?? "—"}</p></div><div><p className="text-[11px] text-muted-foreground">Phone</p><p>{data.patient.phone ?? "—"}</p></div><div><p className="text-[11px] text-muted-foreground">Provider</p><p>{data.patient.provider_name ?? "—"}</p></div></div></Panel>
      </> : <Panel className="mt-6" title="Account setup"><p className="text-sm text-muted-foreground">Your login is active, but a patient record has not been linked yet. Please contact MJD Wellness.</p></Panel>}
    </div>
  </main>;
}

function Empty({ label }: { label: string }) { return <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground"><Clock3 className="size-4"/><span>{label}</span><CheckCircle2 className="ml-auto size-4"/></div>; }