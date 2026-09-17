import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, PhoneForwarded, Plus, Voicemail } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, Pill } from "@/components/app/kit";

export const Route = createFileRoute("/phone-settings")({
  head: () => ({
    meta: [
      { title: "Phone Settings | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Manage practice phone numbers, call routing, call pop, voicemail and text auto-replies.",
      },
      { property: "og:title", content: "Phone Settings | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Numbers, routing, voicemail and auto-reply configuration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhoneSettingsPage,
});

function Toggle({ label, desc, defaultOn = false }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc ? <div className="text-xs text-muted-foreground">{desc}</div> : null}
      </div>
      <button
        onClick={() => setOn(!on)}
        aria-label={label}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

const numbers = [
  { number: "(908) 555-0142", label: "Main line", type: "Voice + SMS", status: "Active", tone: "green" as const },
  { number: "(908) 555-0143", label: "Billing", type: "Voice", status: "Active", tone: "green" as const },
  { number: "(908) 555-0166", label: "Fax line", type: "Fax", status: "Provisioning", tone: "orange" as const },
];

const routing = [
  { step: "1", target: "Front Desk ring group", detail: "Ring 20 seconds · 3 members" },
  { step: "2", target: "Nurse queue", detail: "Ring 15 seconds · 2 members" },
  { step: "3", target: "Voicemail", detail: "Play main greeting" },
];

function PhoneSettingsPage() {
  return (
    <AppShell searchPlaceholder="Search phone settings...">
      <PageHeader
        title="Phone Settings"
        subtitle="Voice and SMS are delivered through Telnyx for MJD Wellness."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Add Number
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Phone Numbers" bodyClassName="p-0">
          <ul>
            {numbers.map((n) => (
              <li key={n.number} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <span className="flex size-9 items-center justify-center rounded-full bg-info-soft text-primary">
                  <Phone className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{n.number}</span>
                  <span className="block text-xs text-muted-foreground">
                    {n.label} · {n.type}
                  </span>
                </span>
                <Pill tone={n.tone}>{n.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Call Routing" action={<PhoneForwarded className="size-4 text-muted-foreground" />}>
          <ol className="space-y-3">
            {routing.map((r) => (
              <li key={r.step} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {r.step}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{r.target}</span>
                  <span className="block text-xs text-muted-foreground">{r.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <button className="mt-4 w-full rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
            + Add routing step
          </button>
        </Panel>

        <Panel title="Call Pop">
          <Toggle label="Enable Call Pop" desc="Show a patient card to staff on inbound calls" defaultOn />
          <Toggle label="Show upcoming appointment" defaultOn />
          <Toggle label="Show forms status" defaultOn />
          <Toggle label="Show outstanding balance" defaultOn />
          <Toggle label="Show recent communication history" />
          <p className="pt-4 text-xs text-muted-foreground">
            Call Pop uses the minimum necessary information. Clinical charting stays in Practice Fusion.
          </p>
        </Panel>

        <Panel title="Voicemail" action={<Voicemail className="size-4 text-muted-foreground" />}>
          <Toggle label="Voicemail enabled" defaultOn />
          <Toggle label="Email voicemail notifications" desc="Send to info@mjdwellness.com" defaultOn />
          <Toggle label="Voicemail transcription" defaultOn />
          <div className="pt-4">
            <label className="text-xs font-medium text-muted-foreground">Greeting</label>
            <textarea
              rows={3}
              defaultValue="You've reached MJD Wellness. Please leave your name, number and reason for calling and we'll return your call within one business day."
              className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </Panel>

        <Panel title="Business Hours">
          <ul className="text-sm">
            {[
              ["Monday – Thursday", "8:00 AM – 5:00 PM"],
              ["Friday", "8:00 AM – 3:00 PM"],
              ["Saturday", "9:00 AM – 12:00 PM"],
              ["Sunday", "Closed"],
            ].map(([d, h]) => (
              <li key={d} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <span className="text-muted-foreground">{d}</span>
                <span className="font-medium text-foreground">{h}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Timezone: Eastern Time (GMT-05:00)</p>
        </Panel>

        <Panel title="Text Auto-Reply">
          <Toggle label="Auto-reply after hours" defaultOn />
          <Toggle label="Auto-reply to missed calls" defaultOn />
          <div className="pt-4">
            <label className="text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              rows={3}
              defaultValue="Thanks for contacting MJD Wellness! We're currently closed. Reply here and our team will respond during business hours. For emergencies, call 911."
              className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <button className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Save changes
          </button>
        </Panel>
      </div>
    </AppShell>
  );
}
