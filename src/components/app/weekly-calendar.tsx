import { useMemo, useState } from "react";
import { CalendarCheck2, ChevronLeft, ChevronRight, Clock3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, Pill } from "@/components/app/kit";

type Person = { first_name: string; last_name: string } | null;
type Appointment = { id: string; starts_at: string; ends_at: string; appointment_type: string; provider_name: string; status: string; patients: Person | Person[] };
type FormDue = { id: string; form_name: string; due_at: string | null; status: string; patients: Person | Person[] };
type TimeEntry = { id: string; clocked_in_at: string; clocked_out_at: string | null; break_minutes: number; status: string; profiles: { display_name: string } | { display_name: string }[] | null };

const mondayOf = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};

const sameDay = (left: Date, right: Date) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
const personName = (person: Person | Person[]) => {
  const record = Array.isArray(person) ? person[0] : person;
  return record ? `${record.first_name} ${record.last_name}` : "Patient";
};

export function WeeklyCalendar({ appointments, forms, hours }: { appointments: Appointment[]; forms: FormDue[]; hours: TimeEntry[] }) {
  const [anchor, setAnchor] = useState(() => new Date());
  const week = useMemo(() => {
    const start = mondayOf(anchor);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [anchor]);
  const changeWeek = (offset: number) => setAnchor((current) => { const next = new Date(current); next.setDate(next.getDate() + offset * 7); return next; });
  const rangeLabel = `${week[0]?.toLocaleDateString([], { month: "short", day: "numeric" })} – ${week[6]?.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  return <Panel className="mt-4" title="Weekly operations calendar" action={<div className="flex items-center gap-1"><Button size="icon" variant="ghost" aria-label="Previous week" onClick={() => changeWeek(-1)}><ChevronLeft/></Button><Button size="sm" variant="ghost" onClick={() => setAnchor(new Date())}>Today</Button><Button size="icon" variant="ghost" aria-label="Next week" onClick={() => changeWeek(1)}><ChevronRight/></Button></div>} bodyClassName="p-0">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3"><b className="text-sm">{rangeLabel}</b><div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><CalendarCheck2 className="size-3 text-primary"/>Appointments</span><span className="flex items-center gap-1"><FileText className="size-3 text-warning"/>Forms due</span><span className="flex items-center gap-1"><Clock3 className="size-3 text-success"/>Staff hours</span></div></div>
    <div className="overflow-x-auto"><div className="grid min-w-[980px] grid-cols-7 divide-x divide-border">
      {week.map((day) => {
        const dayAppointments = appointments.filter((item) => sameDay(new Date(item.starts_at), day));
        const dayForms = forms.filter((item) => item.due_at && sameDay(new Date(item.due_at), day));
        const dayHours = hours.filter((item) => sameDay(new Date(item.clocked_in_at), day));
        return <section key={day.toISOString()} className="min-h-56 bg-surface">
          <header className="border-b border-border px-3 py-2"><p className="text-[10px] uppercase text-muted-foreground">{day.toLocaleDateString([], { weekday: "short" })}</p><p className="mt-0.5 text-sm font-semibold">{day.toLocaleDateString([], { month: "short", day: "numeric" })}</p></header>
          <div className="space-y-2 p-2">
            {dayAppointments.map((item) => <CalendarItem key={`appointment-${item.id}`} tone="blue" icon={<CalendarCheck2/>} title={item.appointment_type} detail={`${new Date(item.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${personName(item.patients)}`} status={item.status}/>) }
            {dayForms.map((item) => <CalendarItem key={`form-${item.id}`} tone="orange" icon={<FileText/>} title={item.form_name} detail={personName(item.patients)} status={item.status}/>) }
            {dayHours.map((item) => { const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles; const end = item.clocked_out_at ? new Date(item.clocked_out_at).getTime() : Date.now(); const duration = Math.max(0, (end - new Date(item.clocked_in_at).getTime()) / 3600000 - item.break_minutes / 60); return <CalendarItem key={`hours-${item.id}`} tone="green" icon={<Clock3/>} title={profile?.display_name ?? "Staff"} detail={`${duration.toFixed(1)} hours`} status={item.status}/>; })}
            {!dayAppointments.length && !dayForms.length && !dayHours.length ? <p className="px-1 py-5 text-center text-[11px] text-muted-foreground">No activity</p> : null}
          </div>
        </section>;
      })}
    </div></div>
  </Panel>;
}

function CalendarItem({ icon, title, detail, status, tone }: { icon: React.ReactNode; title: string; detail: string; status: string; tone: "blue" | "orange" | "green" }) {
  const colors = tone === "blue" ? "border-primary/30 bg-info-soft" : tone === "orange" ? "border-warning/30 bg-warning-soft" : "border-success/30 bg-success-soft";
  return <div className={`rounded border p-2 ${colors}`}><div className="flex items-start gap-1.5"><span className="mt-0.5 [&>svg]:size-3">{icon}</span><div className="min-w-0 flex-1"><b className="block truncate text-[11px]">{title}</b><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</p><Pill className="mt-1.5">{status.replace("_", " ")}</Pill></div></div></div>;
}