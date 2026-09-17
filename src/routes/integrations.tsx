import { createFileRoute } from "@tanstack/react-router";
import { Activity, Calendar, CreditCard, HeartPulse, MessageSquare, Plug, Printer, Video } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Dot, PageHeader, Panel, Pill } from "@/components/app/kit";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Connect Practice Fusion, Telnyx, Stripe, Google Calendar and other services to MJD Wellness.",
      },
      { property: "og:title", content: "Integrations | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Connected services powering scheduling, communications and payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

const integrations = [
  { name: "Practice Fusion", desc: "Clinical system of record. Patients, appointments and documents sync one way.", icon: HeartPulse, tone: "green", status: "Connected", pill: "green" as const, meta: "Last sync 4 minutes ago" },
  { name: "Telnyx", desc: "Voice and SMS for practice phone numbers, routing and messaging.", icon: MessageSquare, tone: "blue", status: "Connected", pill: "green" as const, meta: "3 numbers active" },
  { name: "Stripe", desc: "Card payments, payment links and refunds. Cards are tokenized by Stripe.", icon: CreditCard, tone: "purple", status: "Connected", pill: "green" as const, meta: "Payouts daily" },
  { name: "Google Calendar", desc: "Two-way sync of provider availability and appointments.", icon: Calendar, tone: "orange", status: "Action needed", pill: "orange" as const, meta: "Re-authorize access" },
  { name: "Fax Provider", desc: "Inbound and outbound fax via provider abstraction layer.", icon: Printer, tone: "gray", status: "Not connected", pill: "gray" as const, meta: "Pending healthcare review" },
  { name: "Telehealth", desc: "Video visits launched from the schedule and patient portal.", icon: Video, tone: "gray", status: "Not connected", pill: "gray" as const, meta: "Available in a later phase" },
];

const iconTone: Record<string, string> = {
  green: "bg-success-soft text-success",
  blue: "bg-info-soft text-primary",
  purple: "bg-purple-soft text-purple",
  orange: "bg-warning-soft text-warning",
  gray: "bg-muted text-muted-foreground",
};

const events = [
  { text: "Practice Fusion · 128 appointments synced", time: "4 min ago", tone: "green" as const },
  { text: "Telnyx · Inbound SMS webhook delivered", time: "9 min ago", tone: "green" as const },
  { text: "Google Calendar · Token expired", time: "2 hrs ago", tone: "orange" as const },
  { text: "Stripe · Payout $2,140.00 initiated", time: "Yesterday", tone: "green" as const },
];

function IntegrationsPage() {
  return (
    <AppShell searchPlaceholder="Search integrations...">
      <PageHeader
        title="Integrations"
        subtitle="Connect the services your practice already uses. Practice Fusion stays the clinical system of record."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plug className="size-4" /> Browse directory
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.name} className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <div className="flex items-start gap-3">
                <span className={`flex size-11 items-center justify-center rounded-xl ${iconTone[i.tone]}`}>
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{i.name}</h3>
                    <Pill tone={i.pill}>{i.status}</Pill>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{i.desc}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">{i.meta}</span>
                <button
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium ${
                    i.pill === "gray"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {i.pill === "gray" ? "Connect" : "Manage"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Sync Activity" bodyClassName="p-0">
          <ul>
            {events.map((e) => (
              <li key={e.text} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <Dot tone={e.tone} />
                <span className="flex-1 text-sm text-foreground">{e.text}</span>
                <span className="text-xs text-muted-foreground">{e.time}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Practice Fusion" action={<Activity className="size-4 text-muted-foreground" />}>
          <dl className="space-y-3 text-sm">
            {[
              ["Connection", "Healthy"],
              ["Direction", "Read from EHR, write-back disabled"],
              ["Records in scope", "Demographics, appointments, documents"],
              ["Last full sync", "Today, 6:00 AM"],
              ["Next scheduled sync", "Today, 12:00 PM"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Charting, prescribing and clinical notes remain in Practice Fusion. Staff open the chart with “Open in EHR”.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
