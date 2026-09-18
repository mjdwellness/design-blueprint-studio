import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Plug, RefreshCcw } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";
import { useAccount } from "@/lib/auth";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | Super Admin" },
      { name: "description", content: "Integration connections and sync health across all customer organizations." },
      { property: "og:title", content: "Integrations | Super Admin" },
      { property: "og:description", content: "Integration connections and sync health platform-wide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsAdminPage,
});

// This page spans every customer organization, so it's reserved for the
// super_admin (the platform/system owner). org_admin is redirected back to
// /admin by the central guard in auth.tsx; this check just avoids a flash
// of cross-tenant data while that redirect is in flight.
function IntegrationsAdminPage() {
  const account = useAccount();
  if (account.role !== "super_admin") return null;
  return (
    <AdminListPage
      title="Integrations"
      subtitle="Connections each organization has enabled, and their current sync health."
      stats={[
        { icon: <Plug className="size-5" />, value: "61", label: "Active connections", tone: "blue" },
        { icon: <CheckCircle2 className="size-5" />, value: "58", label: "Healthy", tone: "green" },
        { icon: <AlertTriangle className="size-5" />, value: "3", label: "Needs attention", tone: "orange" },
        { icon: <RefreshCcw className="size-5" />, value: "4 min", label: "Median sync lag", tone: "purple" },
      ]}
      columns={["Integration", "Organization", "Scope", "Last sync", "Health"]}
      statusIndex={4}
      statusTones={["green", "orange", "green", "green", "red"]}
      rows={[
        ["Practice Fusion", "MJD Wellness", "Patients, appointments", "4 min ago", "Healthy"],
        ["Google Calendar", "MJD Wellness", "Availability", "2 hrs ago", "Token expired"],
        ["Stripe", "Harbor Family Care", "Payments", "1 min ago", "Healthy"],
        ["Telnyx", "Riverbend Dental", "Voice, SMS", "Just now", "Healthy"],
        ["Practice Fusion", "Cedar Clinic", "Patients", "6 days ago", "Disconnected"],
      ]}
    />
  );
}
