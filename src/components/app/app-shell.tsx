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
    <nav className="space-y-1">
      {items.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold text-white",
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

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-sidebar lg:flex">
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 px-5 py-5">
          <LeafMark className="size-9" />
          <span className="leading-tight">
            <span className="block text-[17px] font-bold text-white">MJD Wellness</span>
            <span className="block whitespace-nowrap text-[9px] text-sidebar-foreground/70">
              Care Today, Healthier Tomorrow.
            </span>
          </span>
        </Link>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {isAdmin ? (
            <NavLinks items={adminPrimary} pathname={pathname} />
          ) : (
            <>
              <NavLinks items={staffPrimary} pathname={pathname} />
              <div className="my-4 border-t border-sidebar-border" />
              <NavLinks items={staffSecondary} pathname={pathname} />
            </>
          )}
        </div>

        <div className="p-3">
          <div className="rounded-xl bg-sidebar-accent p-4">
            <div className="flex items-center gap-3">
              <Headphones className="size-5 text-sidebar-foreground" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Need Help?</div>
                <div className="text-xs text-sidebar-foreground/70">
                  {isAdmin ? "Platform Support" : "Support & Resources"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-surface px-4 lg:px-6">
          <div className="relative flex-1 max-w-3xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl bg-muted pl-9 pr-16 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-surface px-1.5 py-0.5 text-[11px] text-muted-foreground">
              ⌘ K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-danger" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-info-soft text-xs font-semibold text-primary">
                {isAdmin ? "SA" : "AA"}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-semibold text-foreground">
                  {isAdmin ? "Super Admin" : "Alex Admin"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {isAdmin ? "Platform Administrator" : "MJD Wellness"}
                </span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

