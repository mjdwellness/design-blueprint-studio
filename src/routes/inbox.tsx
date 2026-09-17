import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, Paperclip, Phone, Send, Smile, Star, Voicemail } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, Panel, Pill } from "@/components/app/kit";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Unified inbox for patient texts, voicemails and web messages at MJD Wellness.",
      },
      { property: "og:title", content: "Inbox | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Patient texts, voicemails and web messages in one thread view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InboxPage,
});

const threads = [
  { name: "Marie Jean", preview: "Can I move my Thursday appointment?", time: "2m", unread: 2, channel: "SMS" },
  { name: "Robert Chen", preview: "Running 10 minutes late", time: "18m", unread: 1, channel: "SMS" },
  { name: "Emily Davis", preview: "Voicemail · 0:42", time: "1h", unread: 1, channel: "Voicemail" },
  { name: "Sarah Johnson", preview: "Thank you! See you then.", time: "3h", unread: 0, channel: "SMS" },
  { name: "Michael Brown", preview: "Do you accept Aetna?", time: "Yesterday", unread: 0, channel: "Web" },
  { name: "Linda Alvarez", preview: "Refill request for lisinopril", time: "Yesterday", unread: 0, channel: "SMS" },
];

const messages = [
  { from: "them", text: "Hi! Can I move my Thursday appointment to next week?", time: "9:12 AM" },
  { from: "us", text: "Hi Marie, of course. We have Tuesday 10:30 AM or Wednesday 2:00 PM open.", time: "9:15 AM" },
  { from: "them", text: "Tuesday 10:30 works great.", time: "9:18 AM" },
  { from: "us", text: "All set — you're booked for Tue, Sep 23 at 10:30 AM. A confirmation text is on the way.", time: "9:19 AM" },
];

function InboxPage() {
  const [active, setActive] = useState(0);
  const thread = threads[active]!;

  return (
    <AppShell searchPlaceholder="Search conversations...">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr_300px]">
        <Panel
          title="Conversations"
          action={<Filter className="size-4 text-muted-foreground" />}
          bodyClassName="p-0"
          className="overflow-hidden"
        >
          <div className="flex gap-2 border-b border-border px-4 py-3 text-xs">
            {["All", "Unread", "Texts", "Voicemail"].map((t, i) => (
              <span
                key={t}
                className={
                  i === 0
                    ? "rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                    : "rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground"
                }
              >
                {t}
              </span>
            ))}
          </div>
          <ul className="max-h-[560px] overflow-y-auto">
            {threads.map((t, i) => (
              <li key={t.name}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted ${
                    i === active ? "bg-info-soft" : ""
                  }`}
                >
                  <Initials name={t.name} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.time}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-xs text-muted-foreground">{t.preview}</span>
                      {t.unread ? (
                        <span className="ml-auto rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white">
                          {t.unread}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel bodyClassName="p-0" className="flex min-h-[620px] flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Initials name={thread.name} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{thread.name}</div>
              <div className="text-xs text-muted-foreground">(908) 555-0142 · {thread.channel}</div>
            </div>
            <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted">
              <Phone className="size-4" />
            </button>
            <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted">
              <Star className="size-4" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-background/60 p-5">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "us" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "us"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground border border-border"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[11px] ${m.from === "us" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <Paperclip className="size-4 text-muted-foreground" />
              <input
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Smile className="size-4 text-muted-foreground" />
              <button className="rounded-lg bg-primary p-2 text-primary-foreground">
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Patient">
            <div className="flex items-center gap-3">
              <Initials name={thread.name} className="size-12 text-sm" />
              <div>
                <div className="font-semibold text-foreground">{thread.name}</div>
                <div className="text-xs text-muted-foreground">PT-001284 · DOB Mar 14, 1985</div>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Next visit</dt>
                <dd className="text-right font-medium text-foreground">Sep 21, 10:30 AM</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="font-medium text-foreground">Dr. Smith</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Insurance</dt>
                <dd className="font-medium text-foreground">Aetna</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Balance</dt>
                <dd className="font-medium text-foreground">$45.00</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone="green">Forms complete</Pill>
              <Pill tone="blue">Portal active</Pill>
            </div>
          </Panel>

          <Panel title="Quick replies" bodyClassName="p-0">
            <ul className="text-sm">
              {[
                "We'll confirm and text you back shortly.",
                "Your appointment is confirmed.",
                "Please complete your intake form.",
                "Our office hours are 8 AM – 5 PM.",
              ].map((q) => (
                <li key={q} className="border-b border-border px-5 py-3 text-muted-foreground last:border-0 hover:bg-muted">
                  {q}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Voicemails" bodyClassName="p-0">
            <ul className="text-sm">
              {["Emily Davis · 0:42", "Unknown · 0:18"].map((v) => (
                <li key={v} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0">
                  <Voicemail className="size-4 text-primary" />
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
