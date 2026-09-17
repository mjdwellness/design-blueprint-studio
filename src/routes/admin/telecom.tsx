import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Phone, PhoneCall, Printer } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/telecom")({
  head: () => ({
    meta: [
      { title: "Phone & Telecom | Super Admin" },
      { name: "description", content: "Provisioned numbers, call and SMS volume, and telecom provider status." },
      { property: "og:title", content: "Phone & Telecom | Super Admin" },
      { property: "og:description", content: "Numbers, usage and telecom provider status across the platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Phone & Telecom"
      subtitle="Numbers provisioned through Telnyx and their usage across organizations."
      action="Provision Number"
      stats={[
        { icon: <Phone className="size-5" />, value: "88", label: "Active numbers", tone: "blue" },
        { icon: <PhoneCall className="size-5" />, value: "12,580", label: "Calls this month", tone: "green" },
        { icon: <MessageSquare className="size-5" />, value: "28,431", label: "SMS this month", tone: "purple" },
        { icon: <Printer className="size-5" />, value: "4", label: "Fax pilots", tone: "orange" },
      ]}
      columns={["Number", "Organization", "Type", "Calls (30d)", "SMS (30d)", "Status"]}
      statusIndex={5}
      statusTones={["green", "green", "green", "orange", "green"]}
      rows={[
        ["(908) 555-0142", "MJD Wellness", "Voice + SMS", "742", "1,204", "Active"],
        ["(908) 555-0143", "MJD Wellness", "Voice", "168", "0", "Active"],
        ["(609) 555-0110", "Riverbend Dental", "Voice + SMS", "421", "906", "Active"],
        ["(908) 555-0166", "MJD Wellness", "Fax", "0", "0", "Provisioning"],
        ["(617) 555-0188", "Harbor Family Care", "Voice + SMS", "1,904", "3,220", "Active"],
      ]}
    />
  ),
});
