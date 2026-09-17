import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  CalendarClock,
  Check,
  Clock,
  Coffee,
  Download,
  LogOut,
  Users,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/time-labor")({
  head: () => ({
    meta: [
      { title: "Time & Labor | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Time clock, attendance, approvals and labor hours for the MJD Wellness workforce.",
      },
      { property: "og:title", content: "Time & Labor | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Time clock, approvals and labor hours reporting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimeLaborPage,
});

const approvals = [
  { name: "Dana Reed", type: "Missed punch · Sep 16", detail: "Clock out 5:04 PM", tone: "orange" as const },
  { name: "Carla Ruiz", type: "Overtime · Sep 15", detail: "2.5 hrs over", tone: "red" as const },
  { name: "Nina Oduya", type: "PTO request · Sep 25–26", detail: "16 hrs", tone: "blue" as const },
  { name: "Tom Becker", type: "Shift swap · Sep 19", detail: "with Dana Reed", tone: "purple" as const },
];

const attendance = [
  { name: "Dana Reed", role: "Front Desk", in: "7:58 AM", status: "Clocked In", tone: "green" as const, hours: "6:12" },
  { name: "Carla Ruiz", role: "Medical Assistant", in: "8:02 AM", status: "On Break", tone: "orange" as const, hours: "5:48" },
  { name: "Nina Oduya", role: "Nurse", in: "—", status: "Absent", tone: "red" as const, hours: "0:00" },
  { name: "Tom Becker", role: "Billing", in: "8:30 AM", status: "Clocked In", tone: "green" as const, hours: "5:20" },
  { name: "Alex Admin", role: "Org Admin", in: "7:45 AM", status: "Clocked In", tone: "green" as const, hours: "6:25" },
];

const chart = [
  { d: "Mon", v: 72 },
  { d: "Tue", v: 88 },
  { d: "Wed", v: 64 },
  { d: "Thu", v: 94 },
  { d: "Fri", v: 78 },
  { d: "Sat", v: 34 },
  { d: "Sun", v: 10 },
];

function TimeLaborPage() {
  return (
    <AppShell searchPlaceholder="Search employees and timesheets...">
      <PageHeader
        title="Time & Labor"
        subtitle="Hours tracked here can be exported for payroll. This platform does not run payroll."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted">
              <Download className="size-4" /> Export timesheets
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <CalendarClock className="size-4" /> Build schedule
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users className="size-5" />} tone="blue" value="78" label="Employees" />
        <StatCard icon={<CalendarClock className="size-5" />} tone="purple" value="64" label="Scheduled today" />
        <StatCard icon={<UserCheck className="size-5" />} tone="green" value="62" label="Clocked in" />
        <StatCard icon={<Clock className="size-5" />} tone="orange" value="4" label="Pending approvals" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="Time Clock">
          <div className="rounded-2xl bg-info-soft p-5 text-center">
            <div className="text-xs font-medium text-primary">Alex Admin · Org Admin</div>
            <div className="mt-1 text-4xl font-bold tracking-tight text-foreground">6:25:14</div>
            <div className="mt-1 text-xs text-muted-foreground">Clocked in at 7:45 AM · Newark</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1 rounded-xl bg-danger px-3 py-3 text-xs font-medium text-white">
              <LogOut className="size-4" /> Clock Out
            </button>
            <button className="flex flex-col items-center gap-1 rounded-xl border border-border px-3 py-3 text-xs font-medium hover:bg-muted">
              <Coffee className="size-4" /> Start Break
            </button>
            <button className="flex flex-col items-center gap-1 rounded-xl border border-border px-3 py-3 text-xs font-medium hover:bg-muted">
              <ArrowLeftRight className="size-4" /> Transfer
            </button>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            {[
              ["This week", "32:10 hrs"],
              ["Overtime", "0:00 hrs"],
              ["PTO balance", "48 hrs"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-3 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="space-y-6">
          <Panel title="Pending Approvals" bodyClassName="p-0">
            <ul>
              {approvals.map((a) => (
                <li key={a.name + a.type} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                  <Initials name={a.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{a.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {a.type} · {a.detail}
                    </span>
                  </span>
                  <Pill tone={a.tone}>Review</Pill>
                  <button className="rounded-lg bg-success-soft p-2 text-success">
                    <Check className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Labor Hours · This week">
            <div className="flex h-40 items-end gap-3">
              {chart.map((b) => (
                <div key={b.d} className="flex h-full flex-1 flex-col justify-end items-center gap-2">
                  <div className="flex w-full flex-1 items-end pb-1">
                    <div className="w-full rounded-t-lg bg-purple/80" style={{ height: `${b.v}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{b.d}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="mt-6" title="Attendance Overview" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Clock in</th>
                <th className="px-5 py-3 font-medium">Hours today</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.name} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Initials name={a.name} />
                      <span className="font-medium text-foreground">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.role}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.in}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.hours}</td>
                  <td className="px-5 py-3">
                    <Pill tone={a.tone}>{a.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
