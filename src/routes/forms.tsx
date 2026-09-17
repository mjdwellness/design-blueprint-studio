import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileText, Link2, Plus, Send, Share2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";
import { CheckCircle2, Clock, Eye } from "lucide-react";

export const Route = createFileRoute("/forms")({
  head: () => ({
    meta: [
      { title: "Forms | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Build, share and track digital intake and consent forms for MJD Wellness patients.",
      },
      { property: "og:title", content: "Forms | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Digital intake and consent forms with submission tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FormsPage,
});

const templates = [
  { name: "New Patient Intake", pages: 4, fields: 32, submissions: 214, status: "Published", tone: "green" as const },
  { name: "HIPAA Consent", pages: 1, fields: 6, submissions: 198, status: "Published", tone: "green" as const },
  { name: "Health History Update", pages: 3, fields: 24, submissions: 87, status: "Published", tone: "green" as const },
  { name: "Telehealth Consent", pages: 1, fields: 5, submissions: 41, status: "Draft", tone: "orange" as const },
  { name: "Financial Policy", pages: 2, fields: 9, submissions: 160, status: "Published", tone: "green" as const },
];

const submissions = [
  { patient: "Emily Davis", form: "New Patient Intake", sent: "Sep 17, 8:05 AM", status: "Completed", tone: "green" as const },
  { patient: "Robert Chen", form: "New Patient Intake", sent: "Sep 16, 4:22 PM", status: "In Progress", tone: "orange" as const },
  { patient: "Marie Jean", form: "Health History Update", sent: "Sep 15, 9:00 AM", status: "Pending", tone: "orange" as const },
  { patient: "Michael Brown", form: "HIPAA Consent", sent: "Sep 14, 11:31 AM", status: "Completed", tone: "green" as const },
  { patient: "Linda Alvarez", form: "Financial Policy", sent: "Sep 12, 2:10 PM", status: "Expired", tone: "red" as const },
];

function FormsPage() {
  return (
    <AppShell searchPlaceholder="Search forms and submissions...">
      <PageHeader
        title="Forms"
        subtitle="Digital intake, consent and history forms patients can complete before their visit."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted">
              <Send className="size-4" /> Send Form
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> New Form
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FileText className="size-5" />} tone="blue" value="12" label="Form templates" sub="9 published" />
        <StatCard icon={<CheckCircle2 className="size-5" />} tone="green" value="184" label="Completed this month" delta="+14%" />
        <StatCard icon={<Clock className="size-5" />} tone="orange" value="9" label="Awaiting completion" />
        <StatCard icon={<Eye className="size-5" />} tone="purple" value="93%" label="Completion rate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Templates" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Form</th>
                  <th className="px-5 py-3 font-medium">Pages</th>
                  <th className="px-5 py-3 font-medium">Fields</th>
                  <th className="px-5 py-3 font-medium">Submissions</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.name} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium text-foreground">{t.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.pages}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.fields}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.submissions}</td>
                    <td className="px-5 py-3">
                      <Pill tone={t.tone}>{t.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Share form"
          action={<Share2 className="size-4 text-muted-foreground" />}
        >
          <label className="text-xs font-medium text-muted-foreground">Public link</label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 text-sm">
            <Link2 className="size-4 text-muted-foreground" />
            <span className="flex-1 truncate text-muted-foreground">
              forms.mjdwellness.com/new-patient-intake
            </span>
            <button className="inline-flex items-center gap-1 text-primary">
              <Copy className="size-4" /> Copy
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Send to patient</label>
              <input
                defaultValue="Marie Jean · (908) 555-0142"
                className="mt-2 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex gap-2">
              {["Text message", "Email", "Both"].map((c, i) => (
                <span
                  key={c}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Send className="size-4" /> Send form
            </button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent Submissions" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Form</th>
                  <th className="px-5 py-3 font-medium">Sent</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.patient + s.form} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium text-foreground">{s.patient}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.form}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.sent}</td>
                    <td className="px-5 py-3">
                      <Pill tone={s.tone}>{s.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Preview · New Patient Intake">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Page 1 of 4</span>
              <span>Patient Information</span>
            </div>
            <div className="mt-4 space-y-3">
              {["Full name", "Date of birth", "Phone number", "Email address"].map((f) => (
                <div key={f}>
                  <div className="text-xs font-medium text-muted-foreground">{f}</div>
                  <div className="mt-1 h-9 rounded-lg border border-border bg-muted" />
                </div>
              ))}
              <div>
                <div className="text-xs font-medium text-muted-foreground">Reason for visit</div>
                <div className="mt-1 h-20 rounded-lg border border-border bg-muted" />
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground">Back</button>
              <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Continue
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
