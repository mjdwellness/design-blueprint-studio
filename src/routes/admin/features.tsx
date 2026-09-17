import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Sparkles, ToggleLeft, Users } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/features")({
  head: () => ({
    meta: [
      { title: "Feature Management | Super Admin" },
      { name: "description", content: "Feature flags and phased rollouts per organization across the platform." },
      { property: "og:title", content: "Feature Management | Super Admin" },
      { property: "og:description", content: "Feature flags and phased rollouts per organization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Feature Management"
      subtitle="Turn capabilities on for specific organizations while they are still in pilot."
      action="Create Flag"
      stats={[
        { icon: <Sparkles className="size-5" />, value: "18", label: "Feature flags", tone: "purple" },
        { icon: <ToggleLeft className="size-5" />, value: "11", label: "Enabled globally", tone: "green" },
        { icon: <FlaskConical className="size-5" />, value: "5", label: "In pilot", tone: "orange" },
        { icon: <Users className="size-5" />, value: "9", label: "Organizations in pilots", tone: "blue" },
      ]}
      columns={["Flag", "Description", "Rollout", "Organizations", "Status"]}
      statusIndex={4}
      statusTones={["orange", "green", "orange", "gray", "green"]}
      rows={[
        ["fax-pilot", "Inbound and outbound fax", "Pilot", "2", "Pilot"],
        ["time-labor", "Time clock and scheduling", "Phased", "6", "Enabled"],
        ["white-label-domains", "Custom domains for patient pages", "Pilot", "3", "Pilot"],
        ["ai-summaries", "AI call summaries", "Internal", "0", "Disabled"],
        ["online-booking", "Patient self-scheduling", "General", "24", "Enabled"],
      ]}
    />
  ),
});
