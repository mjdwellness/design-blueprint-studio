import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Download, MessageSquare, Phone, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Practice performance: call volume, response times, visit mix and revenue trends for MJD Wellness.",
      },
      { property: "og:title", content: "Analytics | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Call volume, response times, visit mix and revenue trends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const months = [
  { m: "Apr", v: 52 },
  { m: "May", v: 61 },
  { m: "Jun", v: 58 },
  { m: "Jul", v: 74 },
  { m: "Aug", v: 82 },
  { m: "Sep", v: 95 },
];

const mix = [
  { label: "Follow-up", pct: 38, cls: "bg-primary" },
  { label: "Annual physical", pct: 24, cls: "bg-success" },
  { label: "New patient", pct: 18, cls: "bg-warning" },
  { label: "Lab review", pct: 12, cls: "bg-purple" },
  { label: "Other", pct: 8, cls: "bg-muted-foreground" },
];

function AnalyticsPage() {
  return (
    <AppShell searchPlaceholder="Search reports...">
      <PageHeader
        title="Analytics"
        subtitle="Last 6 months · Newark and Elizabeth"
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted">
            <Download className="size-4" /> Export report
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Phone className="size-5" />} tone="blue" value="742" label="Calls this month" delta="+12%" />
        <StatCard icon={<MessageSquare className="size-5" />} tone="green" value="4m 20s" label="Avg. response time" delta="-18%" />
        <StatCard icon={<CalendarDays className="size-5" />} tone="orange" value="3.2%" label="No-show rate" delta="-0.6%" />
        <StatCard icon={<TrendingUp className="size-5" />} tone="purple" value="$38,920" label="Revenue collected" delta="+12%" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Appointment volume">
          <div className="flex h-56 items-end gap-4">
            {months.map((b) => (
              <div key={b.m} className="flex h-full flex-1 flex-col justify-end items-center gap-2">
                <div className="flex w-full flex-1 items-end pb-1">
                  <div className="w-full rounded-t-xl bg-primary/85" style={{ height: `${b.v}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{b.m}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Visit mix">
          <ul className="space-y-4">
            {mix.map((m) => (
              <li key={m.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{m.label}</span>
                  <span className="font-medium text-muted-foreground">{m.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${m.cls}`} style={{ width: `${m.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
