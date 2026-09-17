import { createFileRoute } from "@tanstack/react-router";
import { Activity, Calendar, CreditCard, ExternalLink, HeartPulse, MessageSquare, Plug, Printer, ShieldCheck, Video } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Dot, PageHeader, Panel, Pill } from "@/components/app/kit";
import { Button } from "@/components/ui/button";

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
  { name: "Practice Fusion", desc: "Clinical system of record for charting, prescriptions, demographics and appointments.", icon: HeartPulse, tone: "orange", status: "Setup required", pill: "orange" as const, meta: "Secure access not connected", action: "Open EHR" },
  { name: "Telnyx", desc: "Voice and SMS for practice phone numbers, routing and messaging.", icon: MessageSquare, tone: "blue", status: "Connected", pill: "green" as const, meta: "3 numbers active", action: "Manage" },
  { name: "Stripe", desc: "Card payments, payment links and refunds. Cards are tokenized by Stripe.", icon: CreditCard, tone: "purple", status: "Connected", pill: "green" as const, meta: "Payouts daily", action: "Manage" },
  { name: "Google Calendar", desc: "Two-way sync of provider availability and appointments.", icon: Calendar, tone: "orange", status: "Action needed", pill: "orange" as const, meta: "Re-authorize access", action: "Manage" },
  { name: "Fax Provider", desc: "Inbound and outbound fax via provider abstraction layer.", icon: Printer, tone: "gray", status: "Not connected", pill: "gray" as const, meta: "Pending healthcare review", action: "Connect" },
  { name: "Telehealth", desc: "Video visits launched from the schedule and patient portal.", icon: Video, tone: "gray", status: "Not connected", pill: "gray" as const, meta: "Available in a later phase", action: "Connect" },
];

const iconTone: Record<string, string> = {
  green: "bg-success-soft text-success",
  blue: "bg-info-soft text-primary",
  purple: "bg-purple-soft text-purple",
  orange: "bg-warning-soft text-warning",
  gray: "bg-muted text-muted-foreground",
};

const events = [
  { text: "Practice Fusion · Secure connection awaiting setup", time: "Not connected", tone: "orange" as const },
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
          <Button size="sm">
            <Plug className="size-4" /> Browse directory
          </Button>
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
                <Button
                  size="sm"
                  variant={i.pill === "gray" ? "default" : "outline"}
                  onClick={() => {
                    if (i.name === "Practice Fusion") window.open("https://www.practicefusion.com/", "_blank", "noopener,noreferrer");
                  }}
                >
                  {i.action}{i.name === "Practice Fusion" ? <ExternalLink className="size-3.5" /> : null}
                </Button>
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
              ["Connection", "Setup required"],
              ["Planned direction", "Read from EHR; write-back disabled"],
              ["Planned scope", "Demographics, appointments, documents"],
              ["Security", "Minimum-necessary access"],
              ["Clinical record", "Remains in Practice Fusion"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-3 border-t border-border pt-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-xs text-muted-foreground">Charting, prescribing and clinical notes remain in Practice Fusion. Authorized staff use “Open EHR” until secure data access is approved and connected.</p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
