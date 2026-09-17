import { createFileRoute } from "@tanstack/react-router";
import { Building2, MapPin, Phone, Users } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({
    meta: [
      { title: "Locations | Super Admin" },
      { name: "description", content: "Every practice location across all organizations on the platform." },
      { property: "og:title", content: "Locations | Super Admin" },
      { property: "og:description", content: "Practice locations across all organizations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Locations"
      subtitle="Physical sites belonging to customer organizations."
      action="Add Location"
      stats={[
        { icon: <MapPin className="size-5" />, value: "57", label: "Locations", tone: "blue" },
        { icon: <Building2 className="size-5" />, value: "24", label: "Organizations", tone: "purple" },
        { icon: <Users className="size-5" />, value: "342", label: "Staff on site", tone: "green" },
        { icon: <Phone className="size-5" />, value: "88", label: "Provisioned numbers", tone: "orange" },
      ]}
      columns={["Location", "Organization", "City", "Staff", "Numbers", "Status"]}
      statusIndex={5}
      statusTones={["green", "green", "green", "orange", "green"]}
      rows={[
        ["Newark — Main", "MJD Wellness", "Newark, NJ", "18", "2", "Active"],
        ["Elizabeth", "MJD Wellness", "Elizabeth, NJ", "6", "1", "Active"],
        ["Riverbend Main", "Riverbend Dental", "Trenton, NJ", "9", "1", "Active"],
        ["Summit North", "Summit Behavioral", "Paterson, NJ", "11", "1", "Provisioning"],
        ["Harbor Downtown", "Harbor Family Care", "Boston, MA", "24", "3", "Active"],
      ]}
    />
  ),
});
