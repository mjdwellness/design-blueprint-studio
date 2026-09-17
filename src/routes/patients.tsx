import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Initials, PageHeader, Panel, Pill, StatCard } from "@/components/app/kit";
import marieJeanProfile from "@/assets/marie-jean-profile.jpg";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients | MJD Wellness Practice Platform" },
      {
        name: "description",
        content: "Search the MJD Wellness patient directory and open a patient's contact, forms and visit summary.",
      },
      { property: "og:title", content: "Patients | MJD Wellness Practice Platform" },
      { property: "og:description", content: "Patient directory with contact details, forms status and balances." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientsPage,
});

const patients = [
  { id: "PT-001284", name: "Marie Jean", dob: "Mar 14, 1985", phone: "(908) 555-0142", provider: "Dr. Smith", next: "Sep 21, 10:30 AM", balance: "$45.00", status: "Active", tone: "green" as const },
  { id: "PT-001291", name: "Robert Chen", dob: "Jul 2, 1978", phone: "(201) 555-0119", provider: "Dr. Patel", next: "Sep 17, 11:15 AM", balance: "$0.00", status: "Forms Pending", tone: "orange" as const },
  { id: "PT-001210", name: "Sarah Johnson", dob: "Jan 9, 1992", phone: "(908) 555-0155", provider: "Dr. Smith", next: "Sep 17, 9:00 AM", balance: "$0.00", status: "Active", tone: "green" as const },
  { id: "PT-001305", name: "Emily Davis", dob: "Nov 28, 1966", phone: "(908) 555-0177", provider: "Dr. Nguyen", next: "Sep 17, 1:00 PM", balance: "$120.00", status: "Balance Due", tone: "red" as const },
  { id: "PT-001188", name: "Michael Brown", dob: "May 5, 1989", phone: "(862) 555-0102", provider: "Dr. Patel", next: "Sep 24, 2:30 PM", balance: "$0.00", status: "Active", tone: "green" as const },
  { id: "PT-001099", name: "Linda Alvarez", dob: "Feb 17, 1954", phone: "(973) 555-0188", provider: "Dr. Smith", next: "—", balance: "$32.50", status: "Inactive", tone: "gray" as const },
];

const tabs = ["Overview", "Appointments", "Forms", "Messages", "Payments"];

function PatientsPage() {
  const [selected, setSelected] = useState(patients[0]!);
  const [tab, setTab] = useState("Overview");

  return (
    <AppShell searchPlaceholder="Search patients by name, phone or ID...">
      <PageHeader
        title="Patients"
        subtitle="1,284 active patients synced from Practice Fusion."
        actions={
          <>
            <button className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-surface px-3 text-xs font-medium hover:bg-muted">
              <Filter className="size-3.5" /> Filters
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              <UserPlus className="size-3.5" /> Add Patient
            </button>
          </>
        }
      />

      <div className="grid overflow-hidden rounded-md border border-border sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users className="size-5" />} tone="blue" value="1,284" label="Active patients" />
        <StatCard icon={<UserPlus className="size-5" />} tone="green" value="46" label="New this month" delta="+11%" />
        <StatCard icon={<FileText className="size-5" />} tone="orange" value="9" label="Forms pending" />
        <StatCard icon={<CalendarDays className="size-5" />} tone="purple" value="18" label="Scheduled today" />
      </div>

      <div className="mt-4 grid min-h-[calc(100vh-12rem)] overflow-hidden rounded-md border border-border min-[900px]:grid-cols-[minmax(500px,1.55fr)_minmax(320px,1fr)]">
        <Panel title="Patient Directory" bodyClassName="p-0" className="rounded-none border-0 min-[900px]:border-r">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[9px] uppercase text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Patient</th>
                  <th className="px-4 py-2 font-medium">Provider</th>
                  <th className="px-4 py-2 font-medium">Next visit</th>
                  <th className="px-4 py-2 font-medium">Balance</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`cursor-pointer border-b border-border text-xs last:border-0 hover:bg-muted/40 ${
                      selected.id === p.id ? "bg-primary/8" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Initials name={p.name} />
                        <span>
                          <span className="block font-medium text-foreground">{p.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {p.id} · {p.phone}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.provider}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.next}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{p.balance}</td>
                    <td className="px-4 py-2.5">
                      <Pill tone={p.tone}>{p.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel bodyClassName="p-0" className="rounded-none border-0 bg-background">
          <div className="relative border-b border-border px-5 pb-5 pt-4 text-center">
            <div className="absolute right-4 top-4 flex items-center gap-1">
              <button aria-label="Call patient" title="Call patient" className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Phone className="size-4" />
              </button>
              <button aria-label="More patient actions" title="More patient actions" className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <MoreVertical className="size-4" />
              </button>
            </div>

            <div className="relative mx-auto mt-3 w-fit">
              {selected.id === "PT-001284" ? (
                <img
                  src={marieJeanProfile}
                  alt="Marie Jean"
                  width={816}
                  height={816}
                  className="size-24 rounded-full border-2 border-border object-cover"
                />
              ) : (
                <Initials name={selected.name} className="size-24 border-2 border-border text-xl" />
              )}
              <span className="absolute bottom-1 right-1 size-4 rounded-full border-[3px] border-background bg-success" aria-label="Active patient" />
            </div>

            <h2 className="mt-3 text-xl font-semibold text-foreground">{selected.name}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{selected.id} · DOB {selected.dob}</p>
            <p className="mx-auto mt-3 max-w-[270px] text-xs leading-5 text-muted-foreground">
              Patient of {selected.provider} · Next visit {selected.next}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-surface px-3 text-[11px] font-medium text-foreground hover:bg-muted">
                <MessageSquare className="size-3.5" /> Text
              </button>
              <button className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-surface px-3 text-[11px] font-medium text-foreground hover:bg-muted">
                <Mail className="size-3.5" /> Email
              </button>
              <button className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-surface px-3 text-[11px] font-medium text-foreground hover:bg-muted">
                <ExternalLink className="size-3.5" /> Open in EHR
              </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto border-b border-border px-4 text-xs">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-0 py-3 font-medium ${
                  tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === "Overview" ? (
              <dl className="space-y-3 text-sm">
                {[
                  ["Phone", selected.phone],
                  ["Email", "marie.jean@example.com"],
                  ["Address", "123 Maple St, Elizabeth, NJ 07201"],
                  ["Insurance", "Aetna · Member #W12345678"],
                  ["Primary provider", selected.provider],
                  ["Next appointment", selected.next],
                  ["Balance", selected.balance],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {tab === "Appointments" ? (
              <ul className="space-y-3 text-sm">
                {[
                  ["Sep 21, 2025 · 10:30 AM", "Follow-up Visit · Dr. Smith", "Confirmed", "blue"],
                  ["Aug 12, 2025 · 9:15 AM", "Annual Physical · Dr. Smith", "Completed", "green"],
                  ["May 3, 2025 · 2:00 PM", "Lab Review · Dr. Nguyen", "Completed", "green"],
                ].map(([when, what, status, tone]) => (
                  <li key={when} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                    <span>
                      <span className="block font-medium text-foreground">{when}</span>
                      <span className="block text-xs text-muted-foreground">{what}</span>
                    </span>
                    <Pill tone={tone as "blue"}>{status}</Pill>
                  </li>
                ))}
              </ul>
            ) : null}

            {tab === "Forms" ? (
              <ul className="space-y-3 text-sm">
                {[
                  ["New Patient Intake", "Submitted Aug 12, 2025", "Complete", "green"],
                  ["HIPAA Consent", "Submitted Aug 12, 2025", "Complete", "green"],
                  ["Health History Update", "Sent Sep 15, 2025", "Pending", "orange"],
                ].map(([name, meta, status, tone]) => (
                  <li key={name} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                    <span>
                      <span className="block font-medium text-foreground">{name}</span>
                      <span className="block text-xs text-muted-foreground">{meta}</span>
                    </span>
                    <Pill tone={tone as "green"}>{status}</Pill>
                  </li>
                ))}
              </ul>
            ) : null}

            {tab === "Messages" ? (
              <ul className="space-y-3 text-sm">
                {[
                  ["Text · Today 9:18 AM", "Tuesday 10:30 works great."],
                  ["Text · Sep 12", "Reminder: appointment on Sep 21 at 10:30 AM."],
                  ["Call · Sep 5", "Inbound, 4:12 — appointment rescheduling."],
                ].map(([meta, text]) => (
                  <li key={meta} className="border-b border-border pb-3 last:border-0">
                    <div className="text-xs text-muted-foreground">{meta}</div>
                    <div className="text-foreground">{text}</div>
                  </li>
                ))}
              </ul>
            ) : null}

            {tab === "Payments" ? (
              <ul className="space-y-3 text-sm">
                {[
                  ["Sep 2, 2025", "Copay · Visa ••4242", "$25.00", "Paid", "green"],
                  ["Aug 12, 2025", "Office visit", "$45.00", "Outstanding", "red"],
                  ["May 3, 2025", "Lab fee · Visa ••4242", "$60.00", "Paid", "green"],
                ].map(([date, what, amt, status, tone]) => (
                  <li key={date} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                    <span>
                      <span className="block font-medium text-foreground">{amt}</span>
                      <span className="block text-xs text-muted-foreground">
                        {date} · {what}
                      </span>
                    </span>
                    <Pill tone={tone as "green"}>{status}</Pill>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
