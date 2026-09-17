import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Building2, Globe, Palette, ShieldCheck, Upload } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel } from "@/components/app/kit";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Practice details, branding, locations and account controls for MJD Wellness.",
      },
      { property: "og:title", content: "Settings | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Practice profile, branding and account controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const tabs = ["General", "Branding", "Locations", "Notifications", "Security"];

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState("General");

  return (
    <AppShell searchPlaceholder="Search settings...">
      <PageHeader
        title="Settings"
        subtitle="Organization #001 · MJD Wellness"
        actions={
          <Link
            to="/settings/roles"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <ShieldCheck className="size-4" /> Role Management
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Practice Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Practice name" value="MJD Wellness" />
              <Field label="Specialty" value="Primary Care" />
              <Field label="Phone" value="(908) 555-0142" />
              <Field label="Email" value="info@mjdwellness.com" />
              <Field label="Website" value="https://www.mjdwellness.com" />
              <Field label="Practice size" value="5-10 providers" />
              <div className="sm:col-span-2">
                <Field label="Address" value="123 Wellness Ave, Suite 200, Newark, NJ 07102" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                <select className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                  <option>Eastern Time (GMT-05:00)</option>
                  <option>Central Time (GMT-06:00)</option>
                  <option>Pacific Time (GMT-08:00)</option>
                </select>
              </div>
            </div>
            <button className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Save changes
            </button>
          </Panel>

          <div className="space-y-6">
            <Panel title="Organization">
              <dl className="space-y-3 text-sm">
                {[
                  ["Organization ID", "ORG-001"],
                  ["Plan", "Professional"],
                  ["Locations", "2"],
                  ["Team members", "24"],
                  ["Created", "Jan 12, 2025"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel title="Danger Zone" className="border-danger/40">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border border-danger/40 bg-danger-soft p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-danger-foreground">
                      <AlertTriangle className="size-4" /> Deactivate organization
                    </div>
                    <p className="mt-1 text-xs text-danger-foreground/80">
                      Staff lose access immediately. Patient data is retained for 90 days.
                    </p>
                  </div>
                  <button className="shrink-0 rounded-xl bg-danger px-3 py-2 text-xs font-medium text-white">
                    Deactivate
                  </button>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-xl border border-danger/40 bg-danger-soft p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-danger-foreground">
                      <AlertTriangle className="size-4" /> Delete all data
                    </div>
                    <p className="mt-1 text-xs text-danger-foreground/80">
                      Permanently removes messages, forms and payment records. Cannot be undone.
                    </p>
                  </div>
                  <button className="shrink-0 rounded-xl bg-danger px-3 py-2 text-xs font-medium text-white">
                    Delete
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === "Branding" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Brand" action={<Palette className="size-4 text-muted-foreground" />}>
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-5">
              <Upload className="size-6 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">Upload logo</div>
                <div className="text-xs text-muted-foreground">PNG or SVG, at least 240 × 240</div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Primary color" value="#2563EB" />
              <Field label="Accent color" value="#10B981" />
              <Field label="Email sender name" value="MJD Wellness" />
              <Field label="Reply-to address" value="info@mjdwellness.com" />
            </div>
          </Panel>
          <Panel title="Domain" action={<Globe className="size-4 text-muted-foreground" />}>
            <div className="space-y-4">
              <Field label="Branded subdomain" value="mjdwellness.carehub.app" />
              <Field label="Custom domain" value="portal.mjdwellness.com" />
              <p className="text-xs text-muted-foreground">
                Custom domains are verified before they go live. White labeling applies to patient-facing pages only.
              </p>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "Locations" ? (
        <Panel title="Locations" bodyClassName="p-0">
          <ul>
            {[
              ["Newark — Main", "123 Wellness Ave, Suite 200, Newark, NJ 07102", "18 staff"],
              ["Elizabeth", "45 Maple St, Elizabeth, NJ 07201", "6 staff"],
            ].map(([name, addr, staff]) => (
              <li key={name} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <span className="flex size-9 items-center justify-center rounded-full bg-info-soft text-primary">
                  <Building2 className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{name}</span>
                  <span className="block text-xs text-muted-foreground">{addr}</span>
                </span>
                <span className="text-xs text-muted-foreground">{staff}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {tab === "Notifications" ? (
        <Panel title="Notifications">
          <ul className="text-sm">
            {[
              ["Missed call alerts", "Email + in-app"],
              ["New form submissions", "In-app"],
              ["Failed payments", "Email"],
              ["Daily summary", "Email at 6:00 PM"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <span className="text-foreground">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {tab === "Security" ? (
        <Panel title="Security">
          <ul className="text-sm">
            {[
              ["Multi-factor authentication", "Required for admins and billing"],
              ["Session timeout", "30 minutes of inactivity"],
              ["Audit logging", "Enabled for all staff actions"],
              ["Support access", "Time-limited, reason-bound, fully audited"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-6 border-b border-border py-3 last:border-0">
                <span className="text-foreground">{k}</span>
                <span className="text-right text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </AppShell>
  );
}
