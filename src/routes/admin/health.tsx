import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, CheckCircle2, Server } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Dot, PageHeader, Panel, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/admin/health")({
  head: () => ({
    meta: [
      { title: "System Health | Super Admin" },
      { name: "description", content: "Live status of platform services, queues and third-party providers." },
      { property: "og:title", content: "System Health | Super Admin" },
      { property: "og:description", content: "Live status of services, queues and providers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthPage,
});

const services: [string, string, "green" | "orange" | "red", string][] = [
  ["Application", "Operational", "green", "99.99% · 30 days"],
  ["Database", "Operational", "green", "p95 18 ms"],
  ["Telecom (Telnyx)", "Operational", "green", "Webhook lag 240 ms"],
  ["Practice Fusion sync", "Degraded", "orange", "Queue depth 412"],
  ["File storage", "Operational", "green", "99.98% · 30 days"],
  ["Email / SMS delivery", "Operational", "green", "Delivery 99.4%"],
];

const incidents = [
  ["Sep 16", "Telnyx webhook latency spike", "Resolved in 38 min"],
  ["Sep 9", "Elevated Practice Fusion sync errors", "Resolved in 2 hrs"],
  ["Aug 28", "Scheduled database maintenance", "Completed"],
];

function HealthPage() {
  return (
    <AppShell variant="admin" searchPlaceholder="Search services and incidents...">
      <PageHeader title="System Health" subtitle="Last updated today at 9:42 AM" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="size-5" />} tone="green" value="5 / 6" label="Services operational" />
        <StatCard icon={<AlertTriangle className="size-5" />} tone="orange" value="1" label="Degraded service" />
        <StatCard icon={<Activity className="size-5" />} tone="blue" value="99.97%" label="30-day uptime" />
        <StatCard icon={<Server className="size-5" />} tone="purple" value="412" label="Queued sync jobs" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Services" bodyClassName="p-0">
          <ul>
            {services.map(([name, status, tone, meta]) => (
              <li key={name} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <Dot tone={tone} />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{name}</span>
                  <span className="block text-xs text-muted-foreground">{meta}</span>
                </span>
                <span
                  className={`text-xs font-semibold ${
                    tone === "green" ? "text-success-foreground" : "text-warning-foreground"
                  }`}
                >
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent Incidents" bodyClassName="p-0">
          <ul>
            {incidents.map(([date, title, outcome]) => (
              <li key={title} className="border-b border-border px-5 py-4 last:border-0">
                <div className="text-sm font-medium text-foreground">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {date} · {outcome}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
