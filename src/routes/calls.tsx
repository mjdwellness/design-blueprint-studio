import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Download,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  PlayCircle,
  Voicemail,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/calls")({
  head: () => ({
    meta: [
      { title: "Calls | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Call log, voicemails and recordings for the MJD Wellness front desk.",
      },
      { property: "og:title", content: "Calls | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Review inbound and outbound calls, voicemails and recordings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CallsPage,
});

const calls = [
  { dir: "in", name: "Marie Jean", number: "(908) 555-0142", time: "Today, 9:12 AM", dur: "4:12", status: "Completed", tone: "green" as const, agent: "Alex Admin" },
  { dir: "missed", name: "Unknown", number: "(973) 555-0188", time: "Today, 8:55 AM", dur: "—", status: "Missed", tone: "red" as const, agent: "—" },
  { dir: "out", name: "Robert Chen", number: "(201) 555-0119", time: "Today, 8:40 AM", dur: "2:31", status: "Completed", tone: "green" as const, agent: "Dana Reed" },
  { dir: "in", name: "Emily Davis", number: "(908) 555-0177", time: "Today, 8:22 AM", dur: "0:42", status: "Voicemail", tone: "orange" as const, agent: "—" },
  { dir: "in", name: "Sarah Johnson", number: "(908) 555-0155", time: "Yesterday, 4:48 PM", dur: "6:05", status: "Completed", tone: "green" as const, agent: "Alex Admin" },
  { dir: "missed", name: "Michael Brown", number: "(862) 555-0102", time: "Yesterday, 3:31 PM", dur: "—", status: "Missed", tone: "red" as const, agent: "—" },
];

const icons = {
  in: { Icon: PhoneIncoming, cls: "bg-success-soft text-success" },
  out: { Icon: PhoneOutgoing, cls: "bg-info-soft text-primary" },
  missed: { Icon: PhoneMissed, cls: "bg-danger-soft text-danger" },
} as const;

function CallsPage() {
  return (
    <AppShell searchPlaceholder="Search calls by name or number...">
      <PageHeader
        title="Calls"
        subtitle="Every inbound and outbound call for your practice numbers."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted">
              <Download className="size-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Phone className="size-4" /> New Call
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Phone className="size-5" />} tone="blue" value="38" label="Total calls" sub="Today" />
        <StatCard icon={<PhoneMissed className="size-5" />} tone="red" value="4" label="Missed calls" sub="10.5% of total" />
        <StatCard icon={<Voicemail className="size-5" />} tone="orange" value="2" label="Voicemails" sub="1 unheard" />
        <StatCard icon={<Clock className="size-5" />} tone="green" value="3m 48s" label="Avg. talk time" sub="+6% vs last week" />
      </div>

      <Panel className="mt-6" title="Call Log" bodyClassName="p-0">
        <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3 text-xs">
          {["All", "Inbound", "Outbound", "Missed", "Voicemail"].map((f, i) => (
            <span
              key={f}
              className={
                i === 0
                  ? "rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                  : "rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground"
              }
            >
              {f}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Caller</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Handled by</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Recording</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c, i) => {
                const { Icon, cls } = icons[c.dir as keyof typeof icons];
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex size-9 items-center justify-center rounded-full ${cls}`}>
                          <Icon className="size-4" />
                        </span>
                        <span>
                          <span className="block font-medium text-foreground">{c.name}</span>
                          <span className="block text-xs text-muted-foreground">{c.number}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.time}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.dur}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.agent}</td>
                    <td className="px-5 py-3">
                      <Pill tone={c.tone}>{c.status}</Pill>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {c.dur === "—" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <button className="inline-flex items-center gap-1.5 text-primary">
                          <PlayCircle className="size-4" /> Play
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Call Pop preview">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <Initials name="Marie Jean" className="size-12 text-sm" />
              <div>
                <div className="font-semibold text-foreground">Marie Jean</div>
                <div className="text-xs text-muted-foreground">(908) 555-0142 · Existing patient</div>
              </div>
              <Pill tone="green" className="ml-auto">
                Incoming
              </Pill>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Next appointment</dt>
                <dd className="font-medium text-foreground">Sep 21, 10:30 AM</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Forms</dt>
                <dd className="font-medium text-success-foreground">Complete</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Balance</dt>
                <dd className="font-medium text-foreground">$45.00</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last contact</dt>
                <dd className="font-medium text-foreground">Text · 2 days ago</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Call Pop shows only the minimum necessary information. Clinical records stay in Practice Fusion.
            </p>
          </div>
        </Panel>

        <Panel title="Voicemails" bodyClassName="p-0">
          <ul>
            {[
              { name: "Emily Davis", time: "Today, 8:22 AM", dur: "0:42", unheard: true },
              { name: "Unknown", time: "Yesterday, 5:02 PM", dur: "0:18", unheard: false },
              { name: "Linda Alvarez", time: "Mon, 11:14 AM", dur: "1:05", unheard: false },
            ].map((v) => (
              <li key={v.name + v.time} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <span className="flex size-9 items-center justify-center rounded-full bg-warning-soft text-warning">
                  <Voicemail className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{v.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {v.time} · {v.dur}
                  </span>
                </span>
                {v.unheard ? <Pill tone="red">New</Pill> : null}
                <PlayCircle className="size-5 text-primary" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
