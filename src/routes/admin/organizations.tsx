import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations | Super Admin" },
      { name: "description", content: "All customer organizations on the platform, their plans, users and status." },
      { property: "og:title", content: "Organizations | Super Admin" },
      { property: "og:description", content: "Customer organizations, plans, users and status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Organizations"
      subtitle="Every practice using the platform. MJD Wellness is Organization #001."
      action="Create Organization"
      stats={[
        { icon: <Building2 className="size-5" />, value: "24", label: "Total organizations", tone: "blue" },
        { icon: <CheckCircle2 className="size-5" />, value: "19", label: "Active", tone: "green" },
        { icon: <Clock className="size-5" />, value: "3", label: "In trial", tone: "orange" },
        { icon: <DollarSign className="size-5" />, value: "$28,450", label: "Monthly revenue", tone: "purple" },
      ]}
      columns={["Organization", "Plan", "Locations", "Users", "Created", "Status"]}
      statusIndex={5}
      statusTones={["green", "green", "orange", "green", "blue", "gray"]}
      rows={[
        ["MJD Wellness", "Professional", "2", "24", "Jan 12, 2025", "Active"],
        ["Riverbend Dental", "Starter", "1", "9", "Aug 2, 2025", "Active"],
        ["Summit Behavioral", "Professional", "3", "31", "Aug 21, 2025", "Trial"],
        ["Harbor Family Care", "Enterprise", "6", "68", "Sep 4, 2025", "Active"],
        ["Lakeside Pediatrics", "Starter", "1", "12", "Sep 11, 2025", "Onboarding"],
        ["Cedar Clinic", "Starter", "1", "5", "Mar 3, 2025", "Suspended"],
      ]}
    />
  ),
});
