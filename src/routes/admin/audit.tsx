import { createFileRoute } from "@tanstack/react-router";
import { Eye, ScrollText, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs | Super Admin" },
      { name: "description", content: "Immutable record of privileged actions taken across the platform." },
      { property: "og:title", content: "Audit Logs | Super Admin" },
      { property: "og:description", content: "Immutable record of privileged platform actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Audit Logs"
      subtitle="Who did what, where and when. Entries cannot be edited or deleted."
      action="Export log"
      stats={[
        { icon: <ScrollText className="size-5" />, value: "18,402", label: "Events (30 days)", tone: "blue" },
        { icon: <Eye className="size-5" />, value: "24", label: "Support access events", tone: "purple" },
        { icon: <ShieldCheck className="size-5" />, value: "100%", label: "Privileged actions logged", tone: "green" },
        { icon: <ShieldAlert className="size-5" />, value: "2", label: "Flagged for review", tone: "orange" },
      ]}
      columns={["Time", "Actor", "Action", "Organization", "Scope", "Result"]}
      statusIndex={5}
      statusTones={["green", "green", "orange", "green", "red"]}
      rows={[
        ["Today, 10:12 AM", "Priya Nair (Support)", "Opened support access session", "Summit Behavioral", "Billing", "Allowed"],
        ["Today, 9:41 AM", "Alex Admin", "Updated role permissions", "MJD Wellness", "Front Desk role", "Allowed"],
        ["Today, 8:55 AM", "System", "Google Calendar token expired", "MJD Wellness", "Integration", "Warning"],
        ["Yesterday", "Super Admin", "Enabled feature flag fax-pilot", "2 organizations", "Feature flags", "Allowed"],
        ["Yesterday", "Unknown", "Failed sign-in (5 attempts)", "Cedar Clinic", "Auth", "Blocked"],
      ]}
    />
  ),
});
