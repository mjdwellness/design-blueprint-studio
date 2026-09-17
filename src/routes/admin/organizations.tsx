import { createFileRoute } from "@tanstack/react-router";
import { DatabaseAdminPage } from "@/components/app/database-admin-page";

export const Route = createFileRoute("/admin/organizations")({
  head: () => ({ meta: [
    { title: "Organizations | Super Admin" }, { name: "description", content: "All customer organizations and their saved platform records." },
    { property: "og:title", content: "Organizations | Super Admin" }, { property: "og:description", content: "All customer organizations and their saved platform records." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <DatabaseAdminPage kind="organizations" />,
});
