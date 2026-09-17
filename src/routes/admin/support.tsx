import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, LifeBuoy, ShieldCheck } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";
import { Panel, Pill } from "@/components/app/kit";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support & Tickets | Super Admin" },
      { name: "description", content: "Customer support tickets and time-limited support access sessions." },
      { property: "og:title", content: "Support & Tickets | Super Admin" },
      { property: "og:description", content: "Support tickets and audited support access sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Support & Tickets"
      subtitle="Customer issues and the audited support access sessions opened to resolve them."
      action="New Ticket"
      stats={[
        { icon: <LifeBuoy className="size-5" />, value: "3", label: "Open tickets", tone: "red" },
        { icon: <Clock className="size-5" />, value: "5", label: "In progress", tone: "orange" },
        { icon: <CheckCircle2 className="size-5" />, value: "12", label: "Resolved (7 days)", tone: "green" },
        { icon: <ShieldCheck className="size-5" />, value: "1", label: "Active access session", tone: "purple" },
      ]}
      columns={["Ticket", "Organization", "Opened", "Priority", "Status"]}
      statusIndex={4}
      statusTones={["red", "orange", "blue", "green", "green"]}
      rows={[
        ["#4582 · Call routing not applying after hours", "Riverbend Dental", "2 hrs ago", "High", "Open"],
        ["#4579 · Practice Fusion sync delay", "MJD Wellness", "6 hrs ago", "Medium", "In progress"],
        ["#4575 · Invoice question", "Summit Behavioral", "Yesterday", "Low", "Waiting on customer"],
        ["#4570 · SMS delivery failures", "Harbor Family Care", "2 days ago", "High", "Resolved"],
        ["#4566 · Add second location", "Lakeside Pediatrics", "3 days ago", "Low", "Resolved"],
      ]}
      aside={
        <Panel title="Support Access Sessions" bodyClassName="p-0">
          <ul>
            {[
              ["Summit Behavioral", "Ticket #4575 · billing review", "Expires in 42 min", "orange"],
              ["MJD Wellness", "Ticket #4579 · sync investigation", "Ended Sep 16", "gray"],
              ["Harbor Family Care", "Ticket #4570 · SMS logs", "Ended Sep 15", "gray"],
            ].map(([org, reason, when, tone]) => (
              <li key={reason} className="border-b border-border px-5 py-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{org}</span>
                  <Pill tone={tone as "gray"}>{when}</Pill>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{reason}</div>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
            Every session is reason-bound, time-limited and fully audited. Platform staff have no standing access to
            patient data.
          </p>
        </Panel>
      }
    />
  ),
});
