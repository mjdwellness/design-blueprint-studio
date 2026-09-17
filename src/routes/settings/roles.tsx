import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, Pill } from "@/components/app/kit";

export const Route = createFileRoute("/settings/roles")({
  head: () => ({
    meta: [
      { title: "Role Management | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Define organization roles and the permissions each role grants at MJD Wellness.",
      },
      { property: "og:title", content: "Role Management | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Roles as permission collections for staff access control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesPage,
});

const roles = [
  { name: "Org Admin", members: 2, desc: "Full access to the organization, billing and settings.", active: true },
  { name: "Provider", members: 6, desc: "Schedule, patients, forms and clinical workflows.", active: true },
  { name: "Nurse", members: 4, desc: "Patients, schedule and messaging.", active: true },
  { name: "Front Desk", members: 7, desc: "Calls, inbox, scheduling and check-in.", active: true },
  { name: "Billing", members: 3, desc: "Payments, statements and financial reports.", active: true },
  { name: "Limited Access", members: 0, desc: "Read-only access for temporary staff.", active: false },
];

const categories: { name: string; perms: { label: string; on: boolean }[] }[] = [
  {
    name: "Communications",
    perms: [
      { label: "View inbox", on: true },
      { label: "Send messages", on: true },
      { label: "Place and receive calls", on: true },
      { label: "Listen to recordings", on: false },
    ],
  },
  {
    name: "Patients",
    perms: [
      { label: "View patient directory", on: true },
      { label: "Edit patient contact details", on: true },
      { label: "Open chart in EHR", on: true },
      { label: "Merge or delete patients", on: false },
    ],
  },
  {
    name: "Scheduling",
    perms: [
      { label: "View schedule", on: true },
      { label: "Create and edit appointments", on: true },
      { label: "Manage provider availability", on: false },
    ],
  },
  {
    name: "Billing & Payments",
    perms: [
      { label: "View payments", on: true },
      { label: "Take payments", on: true },
      { label: "Issue refunds", on: false },
      { label: "Manage payout settings", on: false },
    ],
  },
  {
    name: "Administration",
    perms: [
      { label: "Manage team members", on: false },
      { label: "Manage roles and permissions", on: false },
      { label: "Manage integrations", on: false },
      { label: "View audit logs", on: false },
    ],
  },
];

function RolesPage() {
  const [selected, setSelected] = useState(roles[3]!);

  return (
    <AppShell searchPlaceholder="Search roles and permissions...">
      <PageHeader
        title="Role Management"
        subtitle="Roles are collections of permissions. Changing a role updates everyone assigned to it."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Create Role
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Panel title="Roles" bodyClassName="p-0">
          <ul>
            {roles.map((r) => (
              <li key={r.name}>
                <button
                  onClick={() => setSelected(r)}
                  className={`flex w-full items-start gap-3 border-b border-border px-5 py-4 text-left last:border-0 hover:bg-muted/50 ${
                    selected.name === r.name ? "bg-info-soft" : ""
                  }`}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ShieldCheck className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{r.name}</span>
                      <Pill tone={r.active ? "green" : "gray"}>{r.active ? "Active" : "Inactive"}</Pill>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{r.desc}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{r.members} members</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={`${selected.name} permissions`}
          action={
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                <Copy className="size-3.5" /> Duplicate
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-xl border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger-foreground hover:bg-danger-soft">
                <Trash2 className="size-3.5" /> Delete
              </button>
            </div>
          }
          bodyClassName="p-0"
        >
          {categories.map((c) => (
            <div key={c.name} className="border-b border-border last:border-0">
              <div className="bg-muted/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c.name}
              </div>
              <ul>
                {c.perms.map((p) => (
                  <li key={p.label} className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-0">
                    <span className="text-sm text-foreground">{p.label}</span>
                    <span
                      className={`flex size-6 items-center justify-center rounded-full ${
                        p.on ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.on ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex justify-end gap-2 p-5">
            <button className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Save role
            </button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
