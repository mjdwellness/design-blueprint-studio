import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Calendar, CreditCard, HeartPulse, MessageSquare, Plug, Printer, RefreshCw, ShieldCheck, Video } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Dot, PageHeader, Panel, Pill, type Tone } from "@/components/app/kit";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/auth";
import { getEhrConnection } from "@/lib/platform-data";
import { supabase } from "@/integrations/supabase/client";
import { syncPracticeFusionPatients } from "@/integrations/practice-fusion/sync.server";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Connect Practice Fusion, Telnyx, Stripe, Google Calendar and other services to MJD Wellness.",
      },
      { property: "og:title", content: "Integrations | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Connected services powering scheduling, communications and payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

// Everything except Practice Fusion is still the honest static preview used
// elsewhere in the app for features with no real backing system yet.
const otherIntegrations = [
  { name: "Telnyx", desc: "Voice and SMS for practice phone numbers, routing and messaging.", icon: MessageSquare, tone: "blue", status: "Connected", pill: "green" as const, meta: "3 numbers active", action: "Manage" },
  { name: "Stripe", desc: "Card payments, payment links and refunds. Cards are tokenized by Stripe.", icon: CreditCard, tone: "purple", status: "Connected", pill: "green" as const, meta: "Payouts daily", action: "Manage" },
  { name: "Google Calendar", desc: "Two-way sync of provider availability and appointments.", icon: Calendar, tone: "orange", status: "Action needed", pill: "orange" as const, meta: "Re-authorize access", action: "Manage" },
  { name: "Fax Provider", desc: "Inbound and outbound fax via provider abstraction layer.", icon: Printer, tone: "gray", status: "Not connected", pill: "gray" as const, meta: "Pending healthcare review", action: "Connect" },
  { name: "Telehealth", desc: "Video visits launched from the schedule and patient portal.", icon: Video, tone: "gray", status: "Not connected", pill: "gray" as const, meta: "Available in a later phase", action: "Connect" },
];

const iconTone: Record<string, string> = {
  green: "bg-success-soft text-success",
  blue: "bg-info-soft text-primary",
  purple: "bg-purple-soft text-purple",
  orange: "bg-warning-soft text-warning",
  gray: "bg-muted text-muted-foreground",
};

const events = [
  { text: "Telnyx · Inbound SMS webhook delivered", time: "9 min ago", tone: "green" as const },
  { text: "Google Calendar · Token expired", time: "2 hrs ago", tone: "orange" as const },
  { text: "Stripe · Payout $2,140.00 initiated", time: "Yesterday", tone: "green" as const },
];

function IntegrationsPage() {
  const account = useAccount();
  const organizationId = account.organization?.id;
  const qc = useQueryClient();

  const { data: connection, isLoading } = useQuery({
    queryKey: ["ehr-connection", organizationId],
    queryFn: () => getEhrConnection(organizationId),
    enabled: Boolean(organizationId),
  });

  const sync = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No practice is linked to this account.");
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Your session expired — sign in again.");
      return syncPracticeFusionPatients({ data: { organizationId, accessToken } });
    },
    onSuccess: async (result) => {
      toast.success(`Synced ${result.synced} patient${result.synced === 1 ? "" : "s"} from Practice Fusion`);
      await qc.invalidateQueries({ queryKey: ["ehr-connection", organizationId] });
      await qc.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pfStatus = isLoading ? "Loading…" : connection?.status === "connected" ? "Connected" : connection?.status === "error" ? "Sync failed" : "Setup required";
  const pfPill: Tone = connection?.status === "connected" ? "green" : connection?.status === "error" ? "red" : "orange";
  const pfMeta = connection?.status === "connected"
    ? connection.last_synced_at
      ? `Last synced ${new Date(connection.last_synced_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
      : "Connected — not yet synced"
    : connection?.status === "error"
      ? (connection.last_sync_error ?? "Last sync failed")
      : "Secure access not connected";

  const events2 = connection?.status === "connected"
    ? [{ text: `Practice Fusion · Synced ${connection.patients_synced} patient${connection.patients_synced === 1 ? "" : "s"}`, time: connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—", tone: "green" as const }, ...events]
    : connection?.status === "error"
      ? [{ text: `Practice Fusion · ${connection.last_sync_error ?? "Sync failed"}`, time: "Needs attention", tone: "red" as const }, ...events]
      : [{ text: "Practice Fusion · Secure connection awaiting setup", time: "Not connected", tone: "orange" as const }, ...events];

  return (
    <AppShell searchPlaceholder="Search integrations...">
      <PageHeader
        title="Integrations"
        subtitle="Connect the services your practice already uses. Practice Fusion stays the clinical system of record."
        actions={
          <Button size="sm">
            <Plug className="size-4" /> Browse directory
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <div className="flex items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <HeartPulse className="size-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground">Practice Fusion</h3>
                <Pill tone={pfPill}>{pfStatus}</Pill>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">Clinical system of record — patient demographics sync from here. Charting and prescribing stay in Practice Fusion.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">{pfMeta}</span>
            {/* No OAuth redirect needed here — this is a system-to-system (backend
                services) connection, so "Connect" and "Sync now" are the same
                action: it succeeds once Practice Fusion credentials are set on
                the server, and fails with a clear reason until then. */}
            <Button size="sm" variant={connection?.status === "connected" ? "outline" : "default"} onClick={() => sync.mutate()} disabled={sync.isPending}>
              <RefreshCw className={`size-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
              {sync.isPending ? "Syncing…" : connection?.status === "connected" ? "Sync now" : "Connect & sync"}
            </Button>
          </div>
        </div>

        {otherIntegrations.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.name} className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <div className="flex items-start gap-3">
                <span className={`flex size-11 items-center justify-center rounded-xl ${iconTone[i.tone]}`}>
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{i.name}</h3>
                    <Pill tone={i.pill}>{i.status}</Pill>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{i.desc}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">{i.meta}</span>
                <Button size="sm" variant={i.pill === "gray" ? "default" : "outline"}>
                  {i.action}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Sync Activity" bodyClassName="p-0">
          <ul>
            {events2.map((e) => (
              <li key={e.text} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
                <Dot tone={e.tone} />
                <span className="flex-1 text-sm text-foreground">{e.text}</span>
                <span className="text-xs text-muted-foreground">{e.time}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Practice Fusion" action={<Activity className="size-4 text-muted-foreground" />}>
          <dl className="space-y-3 text-sm">
            {[
              ["Connection", pfStatus],
              ["Direction", "Read from Practice Fusion; write-back disabled"],
              ["Scope", "Patient demographics only (FHIR System app, no clinical notes or scheduling)"],
              ["Security", "Minimum-necessary access"],
              ["Clinical record", "Remains in Practice Fusion"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-3 border-t border-border pt-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-xs text-muted-foreground">Charting, prescribing and clinical notes remain in Practice Fusion. Practice Fusion's API doesn't expose scheduling, so appointments are still managed here directly.</p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
