import { createFileRoute } from "@tanstack/react-router";
import { FileUp, Inbox, Printer, Send } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/fax")({
  head: () => ({
    meta: [
      { title: "Fax | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Send and receive documents by fax from the MJD Wellness practice number.",
      },
      { property: "og:title", content: "Fax | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Inbound and outbound fax for referrals and records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaxPage,
});

const faxes = [
  { dir: "Received", from: "Newark Imaging Center", pages: 3, time: "Today, 8:40 AM", status: "New", tone: "blue" as const },
  { dir: "Sent", from: "Aetna Prior Auth", pages: 5, time: "Today, 8:02 AM", status: "Delivered", tone: "green" as const },
  { dir: "Received", from: "Dr. Alvarez Office", pages: 2, time: "Yesterday", status: "Filed", tone: "green" as const },
  { dir: "Sent", from: "Elizabeth Labs", pages: 1, time: "Yesterday", status: "Failed", tone: "red" as const },
];

function FaxPage() {
  return (
    <AppShell searchPlaceholder="Search faxes...">
      <PageHeader
        title="Fax"
        subtitle="Fax runs through a provider abstraction layer, pending healthcare and reliability review."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Send className="size-4" /> New Fax
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Inbox className="size-5" />} tone="blue" value="6" label="Received today" sub="2 unread" />
        <StatCard icon={<Send className="size-5" />} tone="green" value="9" label="Sent today" />
        <StatCard icon={<Printer className="size-5" />} tone="orange" value="1" label="Failed" />
        <StatCard icon={<FileUp className="size-5" />} tone="purple" value="(908) 555-0166" label="Fax number" sub="Provisioning" />
      </div>

      <Panel className="mt-6" title="Fax Activity" bodyClassName="p-0">
        <ul>
          {faxes.map((f, i) => (
            <li key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Printer className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{f.from}</span>
                <span className="block text-xs text-muted-foreground">
                  {f.dir} · {f.pages} pages · {f.time}
                </span>
              </span>
              <Pill tone={f.tone}>{f.status}</Pill>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}
