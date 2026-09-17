import { createFileRoute } from "@tanstack/react-router";
import { DatabaseAdminPage } from "@/components/app/database-admin-page";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [
    { title: "Locations | Super Admin" }, { name: "description", content: "Practice locations across all organizations." },
    { property: "og:title", content: "Locations | Super Admin" }, { property: "og:description", content: "Practice locations across all organizations." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <DatabaseAdminPage kind="locations" />,
});
