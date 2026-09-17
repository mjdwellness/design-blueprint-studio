import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  DollarSign,
  LifeBuoy,
  MessageSquare,
  Phone,
  ServerCog,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Dot, Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Platform Dashboard | Super Admin" },
      {
        name: "description",
        content: "Platform-wide view of organizations, users, telecom usage, revenue and system health.",
      },
      { property: "og:title", content: "Platform Dashboard | Super Admin" },
      { property: "og:description", content: "Organizations, users, usage, revenue and system health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

const growth = [
  { m: "Apr", v: 44 },
  { m: "May", v: 52 },
  { m: "Jun", v: 60 },
  { m: "Jul", v: 68 },
  { m: "Aug", v: 82 },
  { m: "Sep", v: 96 },
];

const distribution = [
  { label: "Primary Care", pct: 42, cls: "bg-primary" },
  { label: "Dental", pct: 21, cls: "bg-success" },
  { label: "Behavioral Health", pct: 17, cls: "bg-warning" },
  { label: "Specialty", pct: 12, cls: "bg-purple" },
  { label: "Other", pct: 8, cls: "bg-muted-foreground" },
];

const orgs = [
  { name: "MJD Wellness", plan: "Professional", users: 24, created: "Jan 12, 2025", status: "Active", tone: "green" as const },
  { name: "Riverbend Dental", plan: "Starter", users: 9, created: "Aug 2, 2025", status: "Active", tone: "green" as const },
  { name: "Summit Behavioral", plan: "Professional", users: 31, created: "Aug 21, 2025", status: "Trial", tone: "orange" as const },
  { name: "Harbor Family Care", plan: "Enterprise", users: 68, created: "Sep 4, 2025", status: "Active", tone: "green" as const },
  { name: "Lakeside Pediatrics", plan: "Starter", users: 12, created: "Sep 11, 2025", status: "Onboarding", tone: "blue" as const },
];

const activity = [
  { text: "Harbor Family Care upgraded to Enterprise", time: "22 min ago", tone: "green" as const },
  { text: "Support access session opened for Summit Behavioral", time: "1 hr ago", tone: "orange" as const },
  { text: "New organization created: Lakeside Pediatrics", time: "3 hrs ago", tone: "blue" as const },
  { text: "Telnyx webhook latency spike resolved", time: "5 hrs ago", tone: "green" as const },
  { text: "Feature flag ‘fax-pilot’ enabled for 2 orgs", time: "Yesterday", tone: "purple" as const },
];

const tickets = [
  { subject: "Call routing not applying after hours", org: "Riverbend Dental", pri: "High", tone: "red" as const },
  { subject: "Practice Fusion sync delay", org: "MJD Wellness", pri: "Medium", tone: "orange" as const },
  { subject: "Invoice question", org: "Summit Behavioral", pri: "Low", tone: "blue" as const },
];

const health = [
  ["API", "Operational", "green"],
  ["Voice / SMS (Telnyx)", "Operational", "green"],
  ["Database", "Operational", "green"],
  ["Practice Fusion sync", "Degraded", "orange"],
  ["Payments (Stripe)", "Operational", "green"],
];

function AdminDashboard() {
  return (
    <AppShell variant="admin" searchPlaceholder="Search organizations, users or tickets...">
      <PageHeader
        title="Platform Dashboard"
        subtitle="Everything running across all customer organizations."
        actions={
          <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create Organization
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<Building2 className="size-5" />} tone="blue" value="24" label="Organizations" sub="3 in trial" />
        <StatCard icon={<Users className="size-5" />} tone="green" value="342" label="Users" delta="+18" />
        <StatCard icon={<Phone className="size-5" />} tone="purple" value="12,580" label="Calls this month" />
        <StatCard icon={<MessageSquare className="size-5" />} tone="orange" value="28,431" label="SMS this month" />
        <StatCard icon={<DollarSign className="size-5" />} tone="green" value="$28,450" label="Monthly revenue" delta="+9%" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Platform Growth">
          <div className="flex h-56 items-end gap-4">
            {growth.map((g) => (
              <div key={g.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-xl bg-primary/85" style={{ height: `${g.v}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{g.m}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Organization Distribution">
          <ul className="space-y-4">
            {distribution.map((d) => (
              <li key={d.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{d.label}</span>
                  <span className="font-medium text-muted-foreground">{d.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${d.cls}`} style={{ width: `${d.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Recent Organizations" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Organization</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Users</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.name} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Initials name={o.name} />
                        <span className="font-medium text-foreground">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o.plan}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.users}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.created}</td>
                    <td className="px-5 py-3">
                      <Pill tone={o.tone}>{o.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="System Health" action={<ServerCog className="size-4 text-muted-foreground" />} bodyClassName="p-0">
          <ul>
            {health.map(([name, status, tone]) => (
              <li key={name} className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-0">
                <Dot tone={tone as "green"} />
                <span className="flex-1 text-sm text-foreground">{name}</span>
                <span
                  className={`text-xs font-medium ${
                    tone === "green" ? "text-success-foreground" : "text-warning-foreground"
                  }`}
                >
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent Platform Activity" bodyClassName="p-0" className="xl:col-span-2">
          <ul>
            {activity.map((a) => (
              <li key={a.text} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <Dot tone={a.tone} />
                <span className="flex-1 text-sm text-foreground">{a.text}</span>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Support Tickets" action={<LifeBuoy className="size-4 text-muted-foreground" />} bodyClassName="p-0">
          <ul>
            {tickets.map((t) => (
              <li key={t.subject} className="border-b border-border px-5 py-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{t.subject}</span>
                  <Pill tone={t.tone}>{t.pri}</Pill>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t.org}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
