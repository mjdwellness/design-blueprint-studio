import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download, DollarSign, Plus, Receipt, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Collect copays, send payment requests and track outstanding balances at MJD Wellness.",
      },
      { property: "og:title", content: "Payments | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Copays, payment requests and outstanding patient balances." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentsPage,
});

const transactions = [
  { name: "Sarah Johnson", desc: "Copay · Visa ••4242", date: "Today, 9:20 AM", amount: "$25.00", status: "Paid", tone: "green" as const },
  { name: "Marie Jean", desc: "Office visit balance", date: "Today, 8:41 AM", amount: "$45.00", status: "Pending", tone: "orange" as const },
  { name: "Emily Davis", desc: "Lab fee · Mastercard ••8810", date: "Yesterday", amount: "$120.00", status: "Paid", tone: "green" as const },
  { name: "Michael Brown", desc: "Copay · Amex ••1007", date: "Yesterday", amount: "$35.00", status: "Failed", tone: "red" as const },
  { name: "Robert Chen", desc: "New patient visit", date: "Sep 15, 2025", amount: "$180.00", status: "Refunded", tone: "gray" as const },
  { name: "Linda Alvarez", desc: "Statement balance", date: "Sep 12, 2025", amount: "$32.50", status: "Overdue", tone: "red" as const },
];

const bars = [
  { d: "Mon", v: 62 },
  { d: "Tue", v: 84 },
  { d: "Wed", v: 48 },
  { d: "Thu", v: 96 },
  { d: "Fri", v: 72 },
  { d: "Sat", v: 30 },
  { d: "Sun", v: 12 },
];

function PaymentsPage() {
  return (
    <AppShell searchPlaceholder="Search payments by patient or amount...">
      <PageHeader
        title="Payments"
        subtitle="Card payments are processed by Stripe; no card numbers are stored in the platform."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted">
              <Download className="size-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> Request Payment
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<DollarSign className="size-5" />} tone="green" value="$2,480" label="Collected today" delta="+8%" />
        <StatCard icon={<TrendingUp className="size-5" />} tone="blue" value="$38,920" label="Collected this month" delta="+12%" />
        <StatCard icon={<Receipt className="size-5" />} tone="orange" value="$8,412" label="Outstanding balances" sub="42 patients" />
        <StatCard icon={<CreditCard className="size-5" />} tone="purple" value="96.4%" label="Payment success rate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Transactions" bodyClassName="p-0">
          <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3 text-xs">
            {["All", "Paid", "Pending", "Failed", "Refunded"].map((f, i) => (
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
          <ul>
            {transactions.map((t) => (
              <li key={t.name + t.date} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                <Initials name={t.name} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{t.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.desc} · {t.date}
                  </span>
                </span>
                <span className="text-sm font-semibold text-foreground">{t.amount}</span>
                <Pill tone={t.tone}>{t.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Collections this week">
            <div className="flex h-44 items-end gap-3">
              {bars.map((b) => (
                <div key={b.d} className="flex h-full flex-1 flex-col justify-end items-center gap-2">
                  <div className="flex w-full flex-1 items-end pb-1">
                    <div className="w-full rounded-t-lg bg-primary/85" style={{ height: `${b.v}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{b.d}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Request a payment">
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Patient</label>
                <input
                  defaultValue="Marie Jean"
                  className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Amount</label>
                  <input
                    defaultValue="$45.00"
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Send via</label>
                  <select className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 outline-none focus:ring-2 focus:ring-ring/40">
                    <option>Text message</option>
                    <option>Email</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Note</label>
                <textarea
                  rows={3}
                  defaultValue="Balance for your Aug 12 office visit."
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Send payment link
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
