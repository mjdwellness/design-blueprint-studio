import { createFileRoute } from "@tanstack/react-router";
import { Building2, DollarSign, MessageSquare, Phone } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Platform Analytics | Super Admin" },
      { name: "description", content: "Usage, adoption and revenue trends across every organization on the platform." },
      { property: "og:title", content: "Platform Analytics | Super Admin" },
      { property: "og:description", content: "Usage, adoption and revenue trends platform-wide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAnalytics,
});

const revenue = [
  { m: "Apr", v: 46 },
  { m: "May", v: 54 },
  { m: "Jun", v: 61 },
  { m: "Jul", v: 70 },
  { m: "Aug", v: 84 },
  { m: "Sep", v: 97 },
];

const adoption = [
  { label: "Communications", pct: 96, cls: "bg-primary" },
  { label: "Scheduling", pct: 88, cls: "bg-success" },
  { label: "Forms", pct: 71, cls: "bg-warning" },
  { label: "Payments", pct: 58, cls: "bg-purple" },
  { label: "Time & Labor", pct: 22, cls: "bg-muted-foreground" },
];

function AdminAnalytics() {
  return (
    <AppShell variant="admin" searchPlaceholder="Search analytics...">
      <PageHeader title="Platform Analytics" subtitle="Last 6 months across 24 organizations." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Building2 className="size-5" />} tone="blue" value="24" label="Organizations" delta="+20%" />
        <StatCard icon={<Phone className="size-5" />} tone="green" value="12,580" label="Calls" delta="+18%" />
        <StatCard icon={<MessageSquare className="size-5" />} tone="purple" value="28,431" label="SMS" delta="+25%" />
        <StatCard icon={<DollarSign className="size-5" />} tone="orange" value="$28,450" label="Revenue" delta="+22%" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Revenue trend">
          <div className="flex h-56 items-end gap-4">
            {revenue.map((b) => (
              <div key={b.m} className="flex h-full flex-1 flex-col justify-end items-center gap-2">
                <div className="flex w-full flex-1 items-end pb-1">
                  <div className="w-full rounded-t-xl bg-primary/85" style={{ height: `${b.v}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{b.m}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Feature adoption">
          <ul className="space-y-4">
            {adoption.map((a) => (
              <li key={a.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{a.label}</span>
                  <span className="font-medium text-muted-foreground">{a.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${a.cls}`} style={{ width: `${a.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
