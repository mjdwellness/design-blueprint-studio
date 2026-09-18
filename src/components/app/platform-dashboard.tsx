import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Building2,
  CreditCard,
  DollarSign,
  LifeBuoy,
  MessageSquare,
  Phone,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard, type Tone } from "@/components/app/kit";
import { getPlatformOverview } from "@/lib/platform-data";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

const statusTone: Record<string, Tone> = {
  active: "green",
  trial: "blue",
  pending: "orange",
  suspended: "red",
  inactive: "gray",
};

const monthKey = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short" });

function lastSixMonths() {
  const months: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleDateString("en-US", { month: "short" }));
  }
  return months;
}

const quickLinks = [
  { to: "/admin/organizations", icon: Building2, label: "Organizations", desc: "All customer practices" },
  { to: "/admin/users", icon: Users, label: "Users", desc: "Accounts & roles" },
  { to: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions", desc: "Plans & billing" },
  { to: "/admin/health", icon: ShieldCheck, label: "System Health", desc: "Services & incidents" },
  { to: "/admin/support", icon: LifeBuoy, label: "Support & Tickets", desc: "Open customer issues" },
  { to: "/admin/audit", icon: ScrollText, label: "Audit Logs", desc: "Privileged actions" },
];

export function PlatformDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["platform-overview"], queryFn: getPlatformOverview });
  const organizations = data?.organizations ?? [];
  const profiles = data?.profiles ?? [];
  const calls = data?.calls ?? [];
  const messageCount = data?.messageCount ?? 0;
  const payments = data?.payments ?? [];
  const subscriptions = data?.subscriptions ?? [];

  const mrr = subscriptions.filter((s) => s.status === "active" || s.status === "trial").reduce((sum, s) => sum + s.monthly_amount_cents, 0);
  const collected = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount_cents, 0);

  const months = lastSixMonths();
  const growthCounts = months.map((label) => organizations.filter((o) => monthKey(o.created_at) === label).length);
  const maxGrowth = Math.max(1, ...growthCounts);

  const distribution = Object.entries(
    organizations.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const recentOrganizations = organizations.slice(0, 5);

  const activity = [
    ...calls.slice(0, 5).map((c) => ({
      id: `call-${c.id}`,
      icon: Phone,
      tone: "blue" as Tone,
      title: `${c.direction === "inbound" ? "Inbound" : "Outbound"} call`,
      org: Array.isArray(c.organizations) ? c.organizations[0]?.name : c.organizations?.name,
      time: c.started_at,
    })),
    ...payments.slice(0, 5).map((p) => ({
      id: `pay-${p.id}`,
      icon: DollarSign,
      tone: "green" as Tone,
      title: `Payment ${p.status} · ${money(p.amount_cents)}`,
      org: Array.isArray(p.organizations) ? p.organizations[0]?.name : p.organizations?.name,
      time: p.created_at,
    })),
    ...organizations.slice(0, 3).map((o) => ({
      id: `org-${o.id}`,
      icon: Building2,
      tone: "purple" as Tone,
      title: "Organization joined the platform",
      org: o.name,
      time: o.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  return (
    <AppShell variant="admin" searchPlaceholder="Search organizations, users, or settings...">
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Manage your platform, organizations, and system health — power better care everywhere."
        actions={
          <Link to="/admin/organizations" className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <Building2 className="size-3.5" />
            Manage organizations
          </Link>
        }
      />
      {isLoading ? (
        <p className="py-12 text-sm text-muted-foreground">Loading platform metrics…</p>
      ) : (
        <>
          <div className="grid overflow-hidden rounded-md border border-border sm:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={<Building2 className="size-4" />} tone="blue" value={String(organizations.length)} label="Organizations" />
            <StatCard icon={<Users className="size-4" />} tone="purple" value={String(profiles.length)} label="Total users" />
            <StatCard icon={<Phone className="size-4" />} tone="green" value={String(calls.length)} label="Total calls" />
            <StatCard icon={<MessageSquare className="size-4" />} tone="orange" value={String(messageCount)} label="Total messages" />
            <StatCard icon={<DollarSign className="size-4" />} tone="green" value={money(mrr)} label="Monthly recurring revenue" sub={`${money(collected)} collected to date`} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <Panel title="Platform growth" action={<span className="text-[10px] text-muted-foreground">Organizations by month</span>}>
              <div className="flex h-48 items-end gap-4">
                {months.map((label, i) => {
                  const count = growthCounts[i] ?? 0;
                  return (
                    <div key={`${label}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div className="flex w-full flex-1 items-end pb-1">
                        <div
                          className="w-full rounded-t-md bg-primary/85"
                          style={{ height: `${Math.max(6, (count / maxGrowth) * 100)}%` }}
                          title={`${count} organizations`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Organization status">
              {distribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No organizations yet.</p>
              ) : (
                <ul className="space-y-4">
                  {distribution.map(([status, count]) => {
                    const pct = Math.round((count / organizations.length) * 100);
                    const tone = statusTone[status] ?? "gray";
                    return (
                      <li key={status}>
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-foreground">{status}</span>
                          <span className="font-medium text-muted-foreground">{count} · {pct}%</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${tone === "green" ? "bg-success" : tone === "blue" ? "bg-primary" : tone === "orange" ? "bg-warning" : tone === "red" ? "bg-danger" : "bg-muted-foreground"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Recent organizations" action={<Link to="/admin/organizations" className="flex items-center gap-1 text-xs font-medium text-primary">View all<ArrowRight className="size-3" /></Link>} bodyClassName="p-0">
              {recentOrganizations.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No organizations yet.</p>
              ) : (
                recentOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                    <Initials name={org.name} />
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{org.name}</b>
                      <span className="block truncate text-xs text-muted-foreground">{org.specialty} · {org.practice_size ?? "size unknown"}</span>
                    </div>
                    <Pill tone={statusTone[org.status] ?? "gray"}>{org.status}</Pill>
                  </div>
                ))
              )}
            </Panel>

            <Panel title="Recent platform activity" bodyClassName="p-0">
              {activity.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                activity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded ${item.tone === "green" ? "bg-success-soft text-success" : item.tone === "blue" ? "bg-info-soft text-primary" : "bg-purple-soft text-purple"}`}>
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="block truncate text-sm">{item.title}</b>
                        <span className="block truncate text-xs text-muted-foreground">{item.org ?? "Unknown organization"}</span>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(item.time).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>
                  );
                })
              )}
            </Panel>
          </div>

          <Panel title="Platform resources" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to} className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:border-primary/50 hover:bg-muted">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded bg-info-soft text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-sm">{link.label}</b>
                      <span className="block truncate text-xs text-muted-foreground">{link.desc}</span>
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </Panel>

          <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-surface p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded bg-success-soft text-success">
              <Activity className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-sm">Build a healthier tomorrow, together.</b>
              <span className="block text-xs text-muted-foreground">Support your organizations with the tools, data, and insights they need to deliver exceptional care.</span>
            </div>
            <Link to="/admin/settings" className="flex shrink-0 items-center gap-1.5 rounded border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted">
              <Sparkles className="size-3.5" />
              System settings
            </Link>
          </div>
        </>
      )}
    </AppShell>
  );
}
