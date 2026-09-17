import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  MessageSquare,
  Phone,
  PhoneMissed,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Dot, Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home | MJD Wellness Practice Platform" },
      {
        name: "description",
        content:
          "Daily overview for MJD Wellness staff: calls, messages, appointments, forms and payments in one place.",
      },
      { property: "og:title", content: "Home | MJD Wellness Practice Platform" },
      {
        property: "og:description",
        content: "Daily overview of calls, messages, appointments, forms and payments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const appointments = [
  { time: "9:00 AM", name: "Sarah Johnson", type: "Annual Physical", status: "Checked In", tone: "green" as const },
  { time: "10:30 AM", name: "Marie Jean", type: "Follow-up Visit", status: "Confirmed", tone: "blue" as const },
  { time: "11:15 AM", name: "Robert Chen", type: "New Patient", status: "Forms Pending", tone: "orange" as const },
  { time: "1:00 PM", name: "Emily Davis", type: "Lab Review", status: "Confirmed", tone: "blue" as const },
  { time: "2:30 PM", name: "Michael Brown", type: "Consultation", status: "Unconfirmed", tone: "gray" as const },
];

const activity = [
  { icon: PhoneMissed, tone: "red" as const, title: "Missed call from Marie Jean", meta: "(908) 555-0142 · 6 min ago" },
  { icon: MessageSquare, tone: "blue" as const, title: "New text from Robert Chen", meta: "“Running 10 minutes late” · 18 min ago" },
  { icon: FileText, tone: "green" as const, title: "New Patient Intake submitted", meta: "Emily Davis · 42 min ago" },
  { icon: CreditCard, tone: "purple" as const, title: "Payment received — $85.00", meta: "Sarah Johnson · 1 hr ago" },
  { icon: CalendarDays, tone: "orange" as const, title: "Appointment rescheduled", meta: "Michael Brown → Sep 24 · 2 hrs ago" },
];

const tasks = [
  { label: "Review 3 pending intake forms", due: "Due today", tone: "orange" as const },
  { label: "Call back 2 missed patients", due: "Due today", tone: "red" as const },
  { label: "Confirm tomorrow's 14 appointments", due: "Tomorrow", tone: "blue" as const },
  { label: "Send statements for 5 balances", due: "This week", tone: "gray" as const },
];

function HomePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Wednesday, September 17, 2025"
        title="Good morning, Alex"
        subtitle="Here's what's happening at MJD Wellness today."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              <UserPlus className="size-4" /> New Patient
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> New Appointment
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Phone className="size-5" />} tone="blue" value="38" label="Calls today" sub="4 missed · 2 voicemails" delta="+12%" />
        <StatCard icon={<MessageSquare className="size-5" />} tone="green" value="12" label="Unread messages" sub="Avg reply 4m 20s" />
        <StatCard icon={<CalendarDays className="size-5" />} tone="orange" value="18" label="Appointments today" sub="3 awaiting confirmation" />
        <StatCard icon={<CreditCard className="size-5" />} tone="purple" value="$2,480" label="Collected today" sub="6 payments" delta="+8%" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Today's Schedule"
          action={
            <Link to="/schedule" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              View schedule <ArrowRight className="size-4" />
            </Link>
          }
          bodyClassName="p-0"
        >
          <ul>
            {appointments.map((a) => (
              <li key={a.time} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                <span className="w-20 shrink-0 text-sm font-semibold text-foreground">{a.time}</span>
                <Initials name={a.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{a.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{a.type}</span>
                </span>
                <Pill tone={a.tone}>{a.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent Activity" bodyClassName="p-0">
          <ul>
            {activity.map((item) => {
              const Icon = item.icon;
              const bg = {
                red: "bg-danger-soft text-danger",
                blue: "bg-info-soft text-primary",
                green: "bg-success-soft text-success",
                purple: "bg-purple-soft text-purple",
                orange: "bg-warning-soft text-warning",
              }[item.tone];
              return (
                <li key={item.title} className="flex items-start gap-3 border-b border-border px-5 py-4 last:border-0">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{item.title}</span>
                    <span className="block text-xs text-muted-foreground">{item.meta}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Tasks" bodyClassName="p-0" className="xl:col-span-2">
          <ul>
            {tasks.map((t) => (
              <li key={t.label} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <CheckCircle2 className="size-5 text-muted-foreground" />
                <span className="flex-1 text-sm text-foreground">{t.label}</span>
                <Pill tone={t.tone}>{t.due}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Practice Snapshot">
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Active patients</dt>
              <dd className="font-semibold text-foreground">1,284</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">New this month</dt>
              <dd className="font-semibold text-foreground">46</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">No-show rate</dt>
              <dd className="font-semibold text-foreground">3.2%</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Outstanding balances</dt>
              <dd className="font-semibold text-foreground">$8,412</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Dot tone="green" /> Practice Fusion sync
              </dt>
              <dd className="font-semibold text-success-foreground">Healthy</dd>
            </div>
          </dl>
          <Link
            to="/patients"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Users className="size-4" /> View all patients
          </Link>
        </Panel>
      </div>
    </AppShell>
  );
}
