import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  CreditCard,
  FileText,
  Headphones,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Phone,
  Plug,
  Printer,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Users,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LeafMark } from "./logo";

type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  badge?: string;
  badgeTone?: "red" | "blue";
};

const staffPrimary: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Inbox", to: "/inbox", icon: MessageSquare, badge: "12", badgeTone: "red" },
  { label: "Calls", to: "/calls", icon: Phone },
  { label: "Patients", to: "/patients", icon: Users },
  { label: "Schedule", to: "/schedule", icon: CalendarDays },
  { label: "Forms", to: "/forms", icon: FileText },
  { label: "Payments", to: "/payments", icon: CreditCard },
  { label: "Reviews", to: "/reviews", icon: Star },
  { label: "Analytics", to: "/analytics", icon: ChartNoAxesColumn },
];

const staffSecondary: NavItem[] = [
  { label: "Phone Settings", to: "/phone-settings", icon: Phone },
  { label: "Fax", to: "/fax", icon: Printer },
  { label: "Time & Labor", to: "/time-labor", icon: Timer },
  { label: "Team", to: "/team", icon: Users2 },
  { label: "Integrations", to: "/integrations", icon: Plug },
  { label: "Settings", to: "/settings", icon: Settings },
];

const adminPrimary: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Organizations", to: "/admin/organizations", icon: Building2 },
  { label: "Locations", to: "/admin/locations", icon: MapPin },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Subscriptions", to: "/admin/subscriptions", icon: CreditCard },
  { label: "Phone & Telecom", to: "/admin/telecom", icon: Phone },
  { label: "Integrations", to: "/admin/integrations", icon: Plug },
  { label: "Analytics", to: "/admin/analytics", icon: ChartNoAxesColumn },
  { label: "Support & Tickets", to: "/admin/support", icon: LifeBuoy, badge: "3", badgeTone: "red" },
  { label: "Audit Logs", to: "/admin/audit", icon: ScrollText },
  { label: "System Health", to: "/admin/health", icon: ShieldCheck },
  { label: "Feature Management", to: "/admin/features", icon: Sparkles },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "group flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-3.5 shrink-0 opacity-80" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground",
                  item.badgeTone === "red" ? "bg-danger" : "bg-primary",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  variant = "staff",
  searchPlaceholder = "Search patients, appointments, or settings...",
}: {
  children: ReactNode;
  variant?: "staff" | "admin";
  searchPlaceholder?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = variant === "admin";
  const railItems = (isAdmin ? adminPrimary : staffPrimary).slice(0, 7);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center border-r border-sidebar-border bg-sidebar py-3 lg:flex">
        <Link to={isAdmin ? "/admin" : "/"} className="mb-5 flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LeafMark className="size-5" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {railItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  "relative flex size-8 items-center justify-center rounded text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent text-primary",
                )}
              >
                <Icon className="size-4" />
                {item.badge ? <span className="absolute -right-1 -top-1 size-2 rounded-full bg-danger" /> : null}
              </Link>
            );
          })}
        </nav>
        <Settings className="size-4 text-sidebar-foreground" />
      </aside>

      <aside className="fixed inset-y-0 left-14 z-30 hidden w-44 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Link to={isAdmin ? "/admin" : "/"} className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 text-primary">
          <LeafMark className="size-6" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">MJD Wellness</span>
            <span className="block text-[9px] text-sidebar-foreground">Practice workspace</span>
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-2 px-2 text-[9px] font-semibold uppercase text-sidebar-foreground/60">Workspace</div>
          {isAdmin ? (
            <NavLinks items={adminPrimary} pathname={pathname} />
          ) : (
            <>
              <NavLinks items={staffPrimary} pathname={pathname} />
              <div className="my-3 border-t border-sidebar-border" />
              <div className="mb-2 px-2 text-[9px] font-semibold uppercase text-sidebar-foreground/60">Management</div>
              <NavLinks items={staffSecondary} pathname={pathname} />
            </>
          )}
        </div>

        <div className="border-t border-sidebar-border p-2">
          <div className="rounded bg-sidebar-accent p-2.5">
            <div className="flex items-center gap-3">
              <Headphones className="size-4 text-primary" />
              <div className="leading-tight">
                <div className="text-xs font-medium text-foreground">Need Help?</div>
                <div className="text-[10px] text-sidebar-foreground/70">
                  {isAdmin ? "Platform Support" : "Support & Resources"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[14rem]">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-surface px-3 lg:px-4">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded border border-border bg-background pl-8 pr-14 text-xs text-foreground outline-hidden placeholder:text-muted-foreground focus:border-primary/50"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
              ⌘ K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-danger" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-info-soft text-[10px] font-semibold text-primary">
                {isAdmin ? "SA" : "AA"}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-xs font-medium text-foreground">
                  {isAdmin ? "Super Admin" : "Alex Admin"}
                </span>
                <span className="block text-[9px] text-muted-foreground">
                  {isAdmin ? "Platform Administrator" : "MJD Wellness"}
                </span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="px-3 py-4 lg:px-4">{children}</main>
      </div>
    </div>
  );
}

