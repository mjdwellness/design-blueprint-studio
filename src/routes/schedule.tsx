import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";
import { CheckCircle2, Clock, UserX } from "lucide-react";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Day, week and list views of the MJD Wellness appointment calendar across providers.",
      },
      { property: "og:title", content: "Schedule | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Appointment calendar across providers with confirmation status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchedulePage,
});

const hours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];
const days = ["Mon 15", "Tue 16", "Wed 17", "Thu 18", "Fri 19"];

type Block = { day: number; hour: number; span: number; title: string; sub: string; tone: "blue" | "green" | "orange" | "purple" };

const blocks: Block[] = [
  { day: 0, hour: 1, span: 1, title: "Sarah Johnson", sub: "Annual Physical", tone: "green" },
  { day: 0, hour: 4, span: 1, title: "Team Huddle", sub: "All staff", tone: "purple" },
  { day: 1, hour: 2, span: 2, title: "Robert Chen", sub: "New Patient", tone: "orange" },
  { day: 2, hour: 0, span: 1, title: "Emily Davis", sub: "Lab Review", tone: "blue" },
  { day: 2, hour: 2, span: 1, title: "Marie Jean", sub: "Follow-up", tone: "blue" },
  { day: 2, hour: 6, span: 1, title: "Michael Brown", sub: "Consultation", tone: "green" },
  { day: 3, hour: 3, span: 2, title: "Linda Alvarez", sub: "Wellness Visit", tone: "purple" },
  { day: 4, hour: 1, span: 1, title: "Walk-in block", sub: "Front desk", tone: "orange" },
  { day: 4, hour: 5, span: 1, title: "James Wu", sub: "Follow-up", tone: "blue" },
];

const toneCls = {
  blue: "bg-info-soft border-l-4 border-primary text-primary",
  green: "bg-success-soft border-l-4 border-success text-success-foreground",
  orange: "bg-warning-soft border-l-4 border-warning text-warning-foreground",
  purple: "bg-purple-soft border-l-4 border-purple text-purple",
};

const list = [
  { time: "9:00 AM", name: "Sarah Johnson", type: "Annual Physical", provider: "Dr. Smith", status: "Checked In", tone: "green" as const },
  { time: "10:30 AM", name: "Marie Jean", type: "Follow-up Visit", provider: "Dr. Smith", status: "Confirmed", tone: "blue" as const },
  { time: "11:15 AM", name: "Robert Chen", type: "New Patient", provider: "Dr. Patel", status: "Forms Pending", tone: "orange" as const },
  { time: "1:00 PM", name: "Emily Davis", type: "Lab Review", provider: "Dr. Nguyen", status: "Confirmed", tone: "blue" as const },
  { time: "2:30 PM", name: "Michael Brown", type: "Consultation", provider: "Dr. Patel", status: "Unconfirmed", tone: "gray" as const },
];

function SchedulePage() {
  const [view, setView] = useState("Week");

  return (
    <AppShell searchPlaceholder="Search appointments...">
      <PageHeader
        title="Schedule"
        subtitle="September 15 – 19, 2025 · All providers"
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
              {["Day", "Week", "Month", "List"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> New Appointment
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CalendarDays className="size-5" />} tone="blue" value="18" label="Appointments today" />
        <StatCard icon={<CheckCircle2 className="size-5" />} tone="green" value="15" label="Confirmed" />
        <StatCard icon={<Clock className="size-5" />} tone="orange" value="3" label="Awaiting confirmation" />
        <StatCard icon={<UserX className="size-5" />} tone="red" value="1" label="No-shows this week" />
      </div>

      {view === "List" ? (
        <Panel className="mt-6" title="Wednesday, September 17" bodyClassName="p-0">
          <ul>
            {list.map((a) => (
              <li key={a.time} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                <span className="w-20 shrink-0 text-sm font-semibold text-foreground">{a.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{a.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {a.type} · {a.provider}
                  </span>
                </span>
                <Pill tone={a.tone}>{a.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <Panel
          className="mt-6"
          title={
            <span className="flex items-center gap-2">
              <button className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted">
                <ChevronLeft className="size-4" />
              </button>
              <button className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted">
                <ChevronRight className="size-4" />
              </button>
              <span>September 2025</span>
            </span>
          }
          action={
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" /> Follow-up
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-success" /> Physical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-warning" /> New patient
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-purple" /> Other
              </span>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
                <div className="px-3 py-2" />
                {days.map((d) => (
                  <div key={d} className="px-3 py-2 text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="relative grid grid-cols-[80px_repeat(5,1fr)]">
                <div>
                  {hours.map((h) => (
                    <div key={h} className="h-16 border-b border-border px-3 py-1 text-xs text-muted-foreground">
                      {h}
                    </div>
                  ))}
                </div>
                {days.map((d, dayIdx) => (
                  <div key={d} className="relative border-l border-border">
                    {hours.map((h) => (
                      <div key={h} className="h-16 border-b border-border" />
                    ))}
                    {blocks
                      .filter((b) => b.day === dayIdx)
                      .map((b) => (
                        <div
                          key={b.title + b.hour}
                          className={`absolute inset-x-1 rounded-lg p-2 text-xs ${toneCls[b.tone]}`}
                          style={{ top: b.hour * 64 + 2, height: b.span * 64 - 6 }}
                        >
                          <span className="block font-semibold">{b.title}</span>
                          <span className="block opacity-80">{b.sub}</span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
