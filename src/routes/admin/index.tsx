import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "@/lib/auth";
import { PlatformDashboard } from "@/components/app/platform-dashboard";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Super Admin Dashboard | MJD Wellness" },
      { name: "description", content: "Platform-wide organizations, users, and system health for the system owner." },
      { property: "og:title", content: "Super Admin Dashboard | MJD Wellness" },
      { property: "og:description", content: "Platform-wide administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

// /admin/* is reserved for super_admin (the system owner) — the central
// guard in auth.tsx redirects anyone else back to "/", their own
// organization-scoped dashboard. This check just avoids a flash of
// platform-wide data while that redirect is in flight.
function Dashboard() {
  const account = useAccount();
  if (account.role !== "super_admin") return null;
  return <PlatformDashboard />;
}
