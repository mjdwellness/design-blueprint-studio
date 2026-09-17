import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings | Super Admin" },
      { name: "description", content: "Platform-wide defaults, security policy and provider configuration." },
      { property: "og:title", content: "Platform Settings | Super Admin" },
      { property: "og:description", content: "Platform defaults, security policy and providers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <AppShell variant="admin" searchPlaceholder="Search platform settings...">
      <PageHeader title="Platform Settings" subtitle="Defaults applied to every customer organization." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Security Policy">
          <ul className="text-sm">
            {[
              ["MFA for platform staff", "Required"],
              ["MFA for organization admins", "Required"],
              ["Session timeout", "30 minutes"],
              ["Support access max duration", "4 hours"],
              ["Audit retention", "7 years"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                <span className="text-foreground">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Providers">
          <ul className="text-sm">
            {[
              ["Voice & SMS", "Telnyx"],
              ["Payments", "Stripe"],
              ["Fax", "Provider abstraction (pilot)"],
              ["Identity", "Entra External ID"],
              ["Hosting", "Azure Container Apps"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                <span className="text-foreground">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Organization Defaults">
          <ul className="text-sm">
            {[
              ["Default plan for new organizations", "Starter"],
              ["Trial length", "14 days"],
              ["Default timezone", "Eastern Time (GMT-05:00)"],
              ["Data residency", "United States"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                <span className="text-foreground">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="White Label">
          <ul className="text-sm">
            {[
              ["Branded subdomains", "Enabled"],
              ["Custom domains", "Pilot (3 organizations)"],
              ["Branded emails", "Enabled"],
              ["Super admin portal branding", "Never white-labeled"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                <span className="text-foreground">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
