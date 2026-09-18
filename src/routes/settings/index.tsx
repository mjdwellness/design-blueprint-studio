import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { AlertTriangle, Building2, Globe, Loader2, Palette, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel } from "@/components/app/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";

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

type GeneralSettings = {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  website: string;
  practice_size: string;
  address: string;
  timezone: string;
};

const defaultGeneralSettings: GeneralSettings = {
  name: "MJD Wellness and Community Center Inc",
  specialty: "Primary Care",
  phone: "",
  email: "info@mjdwellness.org",
  website: "",
  practice_size: "5-10 providers",
  address: "822 NE 125th St, North Miami, FL 33161",
  timezone: "America/New_York",
};

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange?: (value: string) => void; type?: string; required?: boolean }) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        id={inputId}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={!onChange}
        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function SettingsPage() {
  const account = useAccount();
  const organizationId = account.organization?.id;
  const [tab, setTab] = useState("General");
  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneralSettings);
  const queryClient = useQueryClient();
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["organization-settings", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      if (!organizationId) throw new Error("No practice is linked to this account.");
      const [organizationResult, locationsResult, membersResult, subscriptionResult] = await Promise.all([
        supabase.from("organizations").select("id,name,specialty,phone,email,website,practice_size,address,timezone,created_at").eq("id", organizationId).single(),
        supabase.from("locations").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
        supabase.from("organization_memberships").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "active"),
        supabase.from("subscriptions").select("plan_name").eq("organization_id", organizationId).maybeSingle(),
      ]);
      if (organizationResult.error) throw organizationResult.error;
      return {
        organization: organizationResult.data,
        locationCount: locationsResult.count ?? 0,
        memberCount: membersResult.count ?? 0,
        plan: subscriptionResult.data?.plan_name ?? "Not configured",
      };
    },
  });

  useEffect(() => {
    const organization = settingsData?.organization;
    if (!organization) return;
    setGeneral({
      name: organization.name,
      specialty: organization.specialty,
      phone: organization.phone ?? defaultGeneralSettings.phone,
      email: organization.email ?? defaultGeneralSettings.email,
      website: organization.website ?? defaultGeneralSettings.website,
      practice_size: organization.practice_size ?? defaultGeneralSettings.practice_size,
      address: organization.address ?? defaultGeneralSettings.address,
      timezone: organization.timezone ?? defaultGeneralSettings.timezone,
    });
  }, [settingsData]);

  const updateField = (field: keyof GeneralSettings) => (value: string) => {
    setGeneral((current) => ({ ...current, [field]: value }));
  };

  const saveGeneral = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No practice is linked to this account.");
      const name = general.name.trim();
      const specialty = general.specialty.trim();
      if (!name || !specialty) throw new Error("Practice name and specialty are required.");
      const { error } = await supabase.from("organizations").update({
        name,
        specialty,
        phone: general.phone.trim() || null,
        email: general.email.trim() || null,
        website: general.website.trim() || null,
        practice_size: general.practice_size.trim() || null,
        address: general.address.trim() || null,
        timezone: general.timezone,
        updated_at: new Date().toISOString(),
      }).eq("id", organizationId);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Settings saved");
      await account.refreshOrganization();
      await queryClient.invalidateQueries({ queryKey: ["organization-settings", organizationId] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AppShell searchPlaceholder="Search settings...">
      <PageHeader
        title="Settings"
        subtitle={account.organization?.name ?? "Practice workspace"}
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
            <form onSubmit={(event) => { event.preventDefault(); saveGeneral.mutate(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Practice name" value={general.name} onChange={updateField("name")} required />
              <Field label="Specialty" value={general.specialty} onChange={updateField("specialty")} required />
              <Field label="Phone" value={general.phone} onChange={updateField("phone")} type="tel" />
              <Field label="Email" value={general.email} onChange={updateField("email")} type="email" />
              <Field label="Website" value={general.website} onChange={updateField("website")} type="url" />
              <Field label="Practice size" value={general.practice_size} onChange={updateField("practice_size")} />
              <div className="sm:col-span-2">
                <Field label="Address" value={general.address} onChange={updateField("address")} />
              </div>
              <div>
                <label htmlFor="organization-timezone" className="text-xs font-medium text-muted-foreground">Timezone</label>
                <select id="organization-timezone" value={general.timezone} onChange={(event) => updateField("timezone")(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="mt-6" disabled={isLoading || saveGeneral.isPending}>
              {saveGeneral.isPending ? <><Loader2 className="animate-spin" /> Saving…</> : "Save changes"}
            </Button>
            </form>
          </Panel>

          <div className="space-y-6">
            <Panel title="Organization">
              <dl className="space-y-3 text-sm">
                {[
                  ["Organization ID", "ORG-001"],
                  ["Plan", settingsData?.plan ?? "—"],
                  ["Locations", String(settingsData?.locationCount ?? 0)],
                  ["Team members", String(settingsData?.memberCount ?? 0)],
                  ["Created", settingsData?.organization.created_at ? new Date(settingsData.organization.created_at).toLocaleDateString() : "—"],
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
