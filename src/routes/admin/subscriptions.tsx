import { createFileRoute } from "@tanstack/react-router";
import { DatabaseAdminPage } from "@/components/app/database-admin-page";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [
    { title: "Subscriptions | Super Admin" }, { name: "description", content: "Plans, seats, renewal dates, and billing status." },
    { property: "og:title", content: "Subscriptions | Super Admin" }, { property: "og:description", content: "Plans, seats, renewal dates, and billing status." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <DatabaseAdminPage kind="subscriptions" />,
});
