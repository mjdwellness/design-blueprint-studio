import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CalendarCheck2, Clock3, DollarSign, Receipt, UserRoundCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard, type Tone } from "@/components/app/kit";
import { getStaffDashboardMetrics } from "@/lib/platform-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [
    { title: "Staff Dashboard | MJD Wellness" },
    { name: "description", content: "Live MJD Wellness patient, appointment, payment, and staff-hour metrics." },
    { property: "og:title", content: "Staff Dashboard | MJD Wellness" },
    { property: "og:description", content: "Live practice operations dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Dashboard,
});

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const toneFor = (status: string): Tone => status === "paid" || status === "completed" || status === "confirmed" || status === "approved" ? "green" : status === "failed" || status === "overdue" || status === "cancelled" ? "red" : "orange";

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["staff-dashboard-metrics"], queryFn: getStaffDashboardMetrics });
  const patients = data?.patients ?? [];
  const appointments = data?.appointments ?? [];
  const payments = data?.payments ?? [];
  const timeEntries = data?.hours ?? [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(todayStart); tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const todayAppointments = appointments.filter((item) => { const start = new Date(item.starts_at); return start >= todayStart && start < tomorrow; });
  const collected = payments.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount_cents, 0);
  const outstanding = payments.filter((item) => item.status === "pending" || item.status === "overdue").reduce((sum, item) => sum + item.amount_cents, 0);
  const hours = timeEntries.filter((entry) => new Date(entry.clocked_in_at) >= weekStart).reduce((sum, entry) => {
    const end = entry.clocked_out_at ? new Date(entry.clocked_out_at).getTime() : now.getTime();
    return sum + Math.max(0, (end - new Date(entry.clocked_in_at).getTime()) / 3600000 - entry.break_minutes / 60);
  }, 0);
  return <AppShell variant="admin">
    <PageHeader title="Staff Dashboard" subtitle="Live MJD Wellness activity across patients, care, collections, and labor." actions={<Link to="/admin/users" className="rounded bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Manage staff</Link>}/>
    {isLoading ? <p className="py-12 text-sm text-muted-foreground">Loading practice metrics…</p> : <>
      <div className="grid overflow-hidden rounded-md border border-border sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={<Users/>} value={String(patients.length)} label="Active patients" tone="blue"/><StatCard icon={<CalendarCheck2/>} value={String(todayAppointments.length)} label="Appointments today" tone="purple" sub={`${appointments.length} total scheduled`}/><StatCard icon={<DollarSign/>} value={money(collected)} label="Payments collected" tone="green" sub={`${money(outstanding)} outstanding`}/><StatCard icon={<Clock3/>} value={`${hours.toFixed(1)}h`} label="Staff hours this week" tone="orange" sub={`${timeEntries.length} approved entries`}/></div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Upcoming appointments" bodyClassName="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground"><th className="px-4 py-3 font-medium">Patient</th><th className="font-medium">Date & time</th><th className="font-medium">Visit</th><th className="font-medium">Provider</th><th className="font-medium">Status</th></tr></thead><tbody>{appointments.filter((item) => new Date(item.starts_at) >= todayStart).slice(0, 6).map((item) => { const patient = Array.isArray(item.patients) ? item.patients[0] : item.patients; const name = patient ? `${patient.first_name} ${patient.last_name}` : "Unassigned"; return <tr key={item.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><span className="flex items-center gap-3"><Initials name={name}/><b>{name}</b></span></td><td className="text-muted-foreground">{new Date(item.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</td><td className="text-muted-foreground">{item.appointment_type}</td><td className="text-muted-foreground">{item.provider_name}</td><td><Pill tone={toneFor(item.status)}>{item.status.replace("_", " ")}</Pill></td></tr>; })}</tbody></table></div></Panel>
        <Panel title="Payment overview"><div className="space-y-4"><Metric label="Collected" value={money(collected)} icon={<DollarSign className="size-4"/>}/><Metric label="Outstanding" value={money(outstanding)} icon={<Receipt className="size-4"/>}/><Metric label="Transactions" value={String(payments.length)} icon={<UserRoundCheck className="size-4"/>}/></div><div className="mt-5 border-t border-border pt-4"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Collection rate</span><b className="text-foreground">{collected + outstanding ? Math.round(collected / (collected + outstanding) * 100) : 0}%</b></div><div className="mt-2 h-1.5 overflow-hidden rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${collected + outstanding ? Math.round(collected / (collected + outstanding) * 100) : 0}%` }}/></div></Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Recent payments" bodyClassName="p-0">{payments.slice(0, 5).map((payment) => { const patient = Array.isArray(payment.patients) ? payment.patients[0] : payment.patients; const name = patient ? `${patient.first_name} ${patient.last_name}` : "Patient"; return <div key={payment.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"><Initials name={name}/><div className="min-w-0 flex-1"><b className="block text-sm">{name}</b><span className="block truncate text-xs text-muted-foreground">{payment.description}</span></div><b className="text-sm">{money(payment.amount_cents)}</b><Pill tone={toneFor(payment.status)}>{payment.status}</Pill></div>; })}</Panel><Panel title="Staff hours this week" bodyClassName="p-0">{timeEntries.filter((entry) => new Date(entry.clocked_in_at) >= weekStart).map((entry) => { const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles; const end = entry.clocked_out_at ? new Date(entry.clocked_out_at).getTime() : now.getTime(); const duration = Math.max(0, (end - new Date(entry.clocked_in_at).getTime()) / 3600000 - entry.break_minutes / 60); return <div key={entry.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"><Initials name={profile?.display_name ?? "Staff"}/><div className="flex-1"><b className="block text-sm">{profile?.display_name ?? "Staff member"}</b><span className="text-xs text-muted-foreground">{new Date(entry.clocked_in_at).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</span></div><b className="text-sm">{duration.toFixed(1)}h</b><Pill tone={toneFor(entry.status)}>{entry.status}</Pill></div>; })}</Panel></div>
    </>}
  </AppShell>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded bg-muted text-muted-foreground">{icon}</span><span className="flex-1 text-sm text-muted-foreground">{label}</span><b className="text-sm">{value}</b></div>; }