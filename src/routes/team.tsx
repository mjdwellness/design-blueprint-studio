import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Mail, ShieldCheck, UserPlus, Users2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Dot, Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Manage MJD Wellness staff members, their roles, locations and access status.",
      },
      { property: "og:title", content: "Team | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Staff members, roles, locations and access status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

const team = [
  { name: "Alex Admin", email: "alex@mjdwellness.com", role: "Org Admin", location: "Newark", status: "Active", tone: "green" as const, online: true },
  { name: "Dr. Jane Smith", email: "jsmith@mjdwellness.com", role: "Provider", location: "Newark", status: "Active", tone: "green" as const, online: true },
  { name: "Dr. Ravi Patel", email: "rpatel@mjdwellness.com", role: "Provider", location: "Newark", status: "Active", tone: "green" as const, online: false },
  { name: "Dana Reed", email: "dreed@mjdwellness.com", role: "Front Desk", location: "Newark", status: "Active", tone: "green" as const, online: true },
  { name: "Carla Ruiz", email: "cruiz@mjdwellness.com", role: "Medical Assistant", location: "Elizabeth", status: "Active", tone: "green" as const, online: false },
  { name: "Tom Becker", email: "tbecker@mjdwellness.com", role: "Billing", location: "Newark", status: "Invited", tone: "orange" as const, online: false },
  { name: "Nina Oduya", email: "noduya@mjdwellness.com", role: "Nurse", location: "Elizabeth", status: "Suspended", tone: "red" as const, online: false },
];

function TeamPage() {
  return (
    <AppShell searchPlaceholder="Search team members...">
      <PageHeader
        title="Team"
        subtitle="People with access to MJD Wellness. Permissions come from their assigned role."
        actions={
          <>
            <Link
              to="/settings/roles"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <ShieldCheck className="size-4" /> Manage Roles
            </Link>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <UserPlus className="size-4" /> Invite Member
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users2 className="size-5" />} tone="blue" value="24" label="Team members" />
        <StatCard icon={<Dot tone="green" />} tone="green" value="18" label="Active today" />
        <StatCard icon={<Mail className="size-5" />} tone="orange" value="2" label="Pending invitations" />
        <StatCard icon={<ShieldCheck className="size-5" />} tone="purple" value="6" label="Roles in use" />
      </div>

      <Panel className="mt-6" title="Members" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.email} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative">
                        <Initials name={m.name} />
                        {m.online ? (
                          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success" />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-medium text-foreground">{m.name}</span>
                        <span className="block text-xs text-muted-foreground">{m.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{m.role}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.location}</td>
                  <td className="px-5 py-3">
                    <Pill tone={m.tone}>{m.status}</Pill>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
