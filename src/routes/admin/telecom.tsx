import { createFileRoute } from "@tanstack/react-router";
import { DatabaseAdminPage } from "@/components/app/database-admin-page";

export const Route = createFileRoute("/admin/telecom")({
  head: () => ({ meta: [
    { title: "Phone & Telecom | Super Admin" }, { name: "description", content: "Provisioned numbers and saved telecom usage records." },
    { property: "og:title", content: "Phone & Telecom | Super Admin" }, { property: "og:description", content: "Provisioned numbers and saved telecom usage records." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <DatabaseAdminPage kind="telecom" />,
});
