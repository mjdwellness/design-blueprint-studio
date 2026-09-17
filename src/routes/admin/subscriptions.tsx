import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, DollarSign, RefreshCcw, TrendingUp } from "lucide-react";
import { AdminListPage } from "@/components/app/admin-page";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions | Super Admin" },
      { name: "description", content: "Plans, billing cycles and revenue for every organization on the platform." },
      { property: "og:title", content: "Subscriptions | Super Admin" },
      { property: "og:description", content: "Plans, billing cycles and platform revenue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminListPage
      title="Subscriptions"
      subtitle="Plan assignments and billing status per organization."
      action="New Subscription"
      stats={[
        { icon: <DollarSign className="size-5" />, value: "$28,450", label: "Monthly recurring revenue", tone: "green" },
        { icon: <TrendingUp className="size-5" />, value: "+22%", label: "Growth vs last month", tone: "blue" },
        { icon: <CreditCard className="size-5" />, value: "21", label: "Paid subscriptions", tone: "purple" },
        { icon: <RefreshCcw className="size-5" />, value: "2", label: "Renewals this week", tone: "orange" },
      ]}
      columns={["Organization", "Plan", "Seats", "MRR", "Renews", "Status"]}
      statusIndex={5}
      statusTones={["green", "green", "orange", "green", "red"]}
      rows={[
        ["MJD Wellness", "Professional", "24", "$1,200", "Oct 12, 2025", "Paid"],
        ["Harbor Family Care", "Enterprise", "68", "$4,080", "Oct 4, 2025", "Paid"],
        ["Summit Behavioral", "Professional", "31", "$0", "Trial ends Oct 5", "Trial"],
        ["Riverbend Dental", "Starter", "9", "$270", "Oct 2, 2025", "Paid"],
        ["Cedar Clinic", "Starter", "5", "$150", "Sep 3, 2025", "Past due"],
      ]}
    />
  ),
});
