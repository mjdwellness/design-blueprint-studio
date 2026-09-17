import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users | Super Admin" },
      { name: "description", content: "Platform and organization user accounts, their roles and access status." },
      { property: "og:title", content: "Users | Super Admin" },
      { property: "og:description", content: "Platform and organization user accounts and roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Users"
      subtitle="Platform staff and organization members. Platform roles are separate from organization roles."
      action="Invite User"
      stats={[
        { icon: <Users className="size-5" />, value: "342", label: "Total users", tone: "blue" },
        { icon: <UserCheck className="size-5" />, value: "298", label: "Active", tone: "green" },
        { icon: <UserPlus className="size-5" />, value: "36", label: "Added this month", tone: "purple" },
        { icon: <ShieldCheck className="size-5" />, value: "7", label: "Platform staff", tone: "orange" },
      ]}
      columns={["User", "Organization", "Role", "Last active", "MFA", "Status"]}
      statusIndex={5}
      statusTones={["green", "green", "green", "orange", "red"]}
      rows={[
        ["Alex Admin", "MJD Wellness", "Org Admin", "2 min ago", "Enabled", "Active"],
        ["Dr. Jane Smith", "MJD Wellness", "Provider", "14 min ago", "Enabled", "Active"],
        ["Priya Nair", "Platform", "Platform Support", "1 hr ago", "Enabled", "Active"],
        ["Tom Becker", "MJD Wellness", "Billing", "Never", "Pending", "Invited"],
        ["Nina Oduya", "MJD Wellness", "Nurse", "6 days ago", "Enabled", "Suspended"],
      ]}
    />
  ),
});
