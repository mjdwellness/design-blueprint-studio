import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, FileText, ListPlus, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader, Panel, Pill, StatCard, type Tone } from "@/components/app/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { MJD_ORG_ID } from "@/lib/platform-data";

export const Route = createFileRoute("/forms")({
  head: () => ({ meta: [
    { title: "Forms | MJD Wellness Practice Platform" },
    { name: "description", content: "Create, assign, and track digital patient forms for MJD Wellness." },
    { property: "og:title", content: "Forms | MJD Wellness Practice Platform" },
    { property: "og:description", content: "Create patient forms and track portal submissions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: FormsPage,
});

type FieldDraft = { label: string; field_type: "text" | "textarea" | "date" | "email" | "phone" | "yes_no" | "signature"; required: boolean };
const blankField = (): FieldDraft => ({ label: "", field_type: "text", required: false });
const statusTone = (status: string): Tone => status === "completed" || status === "published" ? "green" : status === "expired" || status === "archived" ? "red" : "orange";

async function loadFormsWorkspace() {
  const [templatesResult, assignmentsResult, patientsResult] = await Promise.all([
    supabase.from("form_templates").select("*, form_fields(*)").order("created_at", { ascending: false }),
    supabase.from("patient_forms").select("*, patients(first_name,last_name,patient_number)").order("created_at", { ascending: false }),
    supabase.from("patients").select("id,organization_id,first_name,last_name,patient_number,status").eq("status", "active").order("last_name"),
  ]);
  const error = templatesResult.error ?? assignmentsResult.error ?? patientsResult.error;
  if (error) throw error;
  return { templates: templatesResult.data ?? [], assignments: assignmentsResult.data ?? [], patients: patientsResult.data ?? [] };
}

function FormsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["forms-workspace"], queryFn: loadFormsWorkspace });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([blankField()]);
  const [templateId, setTemplateId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const createTemplate = useMutation({
    mutationFn: async () => {
      const validFields = fields.filter((field) => field.label.trim());
      if (!name.trim() || !validFields.length) throw new Error("Add a form name and at least one field.");
      const { data: user } = await supabase.auth.getUser();
      const { data: template, error } = await supabase.from("form_templates").insert({ organization_id: MJD_ORG_ID, name: name.trim(), description: description.trim() || null, status: "published", created_by: user.user?.id ?? null }).select().single();
      if (error) throw error;
      const { error: fieldError } = await supabase.from("form_fields").insert(validFields.map((field, position) => ({ template_id: template.id, label: field.label.trim(), field_type: field.field_type, required: field.required, position })));
      if (fieldError) throw fieldError;
    },
    onSuccess: async () => { toast.success("Form template published"); setBuilderOpen(false); setName(""); setDescription(""); setFields([blankField()]); await queryClient.invalidateQueries({ queryKey: ["forms-workspace"] }); },
    onError: (error) => toast.error(error.message),
  });

  const assignForm = useMutation({
    mutationFn: async () => {
      const template = data?.templates.find((item) => item.id === templateId);
      const patient = data?.patients.find((item) => item.id === patientId);
      if (!template || !patient) throw new Error("Choose a form and patient.");
      const { error } = await supabase.from("patient_forms").insert({ organization_id: patient.organization_id, patient_id: patient.id, template_id: template.id, form_name: template.name, description: template.description, status: "pending", due_at: dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : null });
      if (error) throw error;
    },
    onSuccess: async () => { toast.success("Form sent to patient portal"); setAssignOpen(false); setTemplateId(""); setPatientId(""); setDueDate(""); await queryClient.invalidateQueries({ queryKey: ["forms-workspace"] }); },
    onError: (error) => toast.error(error.message),
  });

  const templates = data?.templates ?? [];
  const assignments = data?.assignments ?? [];
  const completed = assignments.filter((item) => item.status === "completed").length;
  const awaiting = assignments.filter((item) => item.status === "pending" || item.status === "in_progress").length;
  const completionRate = assignments.length ? Math.round(completed / assignments.length * 100) : 0;
  const selectedTemplate = useMemo(() => templates.find((item) => item.id === templateId), [templates, templateId]);

  return <AppShell searchPlaceholder="Search forms and submissions...">
    <PageHeader title="Forms" subtitle="Create reusable forms, send them to patients, and follow every submission." actions={<><Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}><Send className="size-4"/>Send form</Button><Button size="sm" onClick={() => setBuilderOpen(true)}><Plus className="size-4"/>New form</Button></>}/>
    <div className="grid overflow-hidden border border-border sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={<FileText/>} tone="blue" value={String(templates.length)} label="Published templates"/><StatCard icon={<CheckCircle2/>} tone="green" value={String(completed)} label="Completed"/><StatCard icon={<Clock/>} tone="orange" value={String(awaiting)} label="Awaiting completion"/><StatCard icon={<ListPlus/>} tone="purple" value={`${completionRate}%`} label="Completion rate"/></div>
    {isLoading ? <p className="py-12 text-sm text-muted-foreground">Loading forms…</p> : <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel title="Templates" bodyClassName="p-0">{templates.length ? templates.map((template) => <button key={template.id} type="button" onClick={() => { setTemplateId(template.id); setAssignOpen(true); }} className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted"><span className="flex size-9 items-center justify-center rounded bg-info-soft text-primary"><FileText className="size-4"/></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{template.name}</b><span className="text-xs text-muted-foreground">{template.form_fields.length} fields · {template.description || "No description"}</span></span><Pill tone={statusTone(template.status)}>{template.status}</Pill></button>) : <Empty text="No templates yet. Create the first patient form."/>}</Panel>
      <Panel title="Patient assignments" bodyClassName="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-border text-left text-[11px] text-muted-foreground"><th className="px-4 py-3 font-medium">Patient</th><th className="font-medium">Form</th><th className="font-medium">Assigned</th><th className="font-medium">Due</th><th className="font-medium">Status</th></tr></thead><tbody>{assignments.map((assignment) => { const patient = Array.isArray(assignment.patients) ? assignment.patients[0] : assignment.patients; return <tr key={assignment.id} className="border-b border-border last:border-0"><td className="px-4 py-3 font-medium">{patient ? `${patient.first_name} ${patient.last_name}` : "Patient"}</td><td className="text-muted-foreground">{assignment.form_name}</td><td className="text-muted-foreground">{new Date(assignment.created_at).toLocaleDateString([], { dateStyle: "medium" })}</td><td className="text-muted-foreground">{assignment.due_at ? new Date(assignment.due_at).toLocaleDateString([], { dateStyle: "medium" }) : "—"}</td><td><Pill tone={statusTone(assignment.status)}>{assignment.status.replace("_", " ")}</Pill></td></tr>; })}</tbody></table>{!assignments.length ? <Empty text="No forms have been assigned."/> : null}</div></Panel>
    </div>}

    <Dialog open={builderOpen} onOpenChange={setBuilderOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Create form template</DialogTitle><DialogDescription>Add the fields patients will complete in their portal.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); createTemplate.mutate(); }} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="form-name">Form name</Label><Input id="form-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Annual health update" required/></div><div className="space-y-1.5"><Label htmlFor="form-description">Description</Label><Input id="form-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What the patient should know"/></div></div><div className="space-y-3"><div className="flex items-center justify-between"><Label>Form fields</Label><Button type="button" size="sm" variant="outline" onClick={() => setFields((current) => [...current, blankField()])}><Plus className="size-4"/>Add field</Button></div>{fields.map((field, index) => <div key={index} className="grid gap-2 border border-border p-3 sm:grid-cols-[1fr_150px_auto_auto]"><Input aria-label={`Field ${index + 1} label`} value={field.label} onChange={(event) => setFields((current) => current.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} placeholder="Question or field label"/><Select value={field.field_type} onValueChange={(value: FieldDraft["field_type"]) => setFields((current) => current.map((item, i) => i === index ? { ...item, field_type: value } : item))}><SelectTrigger aria-label={`Field ${index + 1} type`}><SelectValue/></SelectTrigger><SelectContent>{[{v:"text",l:"Short text"},{v:"textarea",l:"Long text"},{v:"date",l:"Date"},{v:"email",l:"Email"},{v:"phone",l:"Phone"},{v:"yes_no",l:"Yes / No"},{v:"signature",l:"Signature"}].map((option) => <SelectItem key={option.v} value={option.v}>{option.l}</SelectItem>)}</SelectContent></Select><label className="flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground"><input type="checkbox" checked={field.required} onChange={(event) => setFields((current) => current.map((item, i) => i === index ? { ...item, required: event.target.checked } : item))}/>Required</label><Button type="button" size="icon" variant="ghost" aria-label={`Remove field ${index + 1}`} disabled={fields.length === 1} onClick={() => setFields((current) => current.filter((_, i) => i !== index))}><Trash2 className="size-4"/></Button></div>)}</div><DialogFooter><Button type="button" variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button><Button disabled={createTemplate.isPending}>{createTemplate.isPending ? "Publishing…" : "Publish template"}</Button></DialogFooter></form></DialogContent></Dialog>

    <Dialog open={assignOpen} onOpenChange={setAssignOpen}><DialogContent><DialogHeader><DialogTitle>Send form to patient</DialogTitle><DialogDescription>The form will appear in the patient’s private portal immediately.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); assignForm.mutate(); }} className="space-y-4"><div className="space-y-1.5"><Label>Form template</Label><Select value={templateId} onValueChange={setTemplateId}><SelectTrigger><SelectValue placeholder="Choose a published form"/></SelectTrigger><SelectContent>{templates.filter((item) => item.status === "published").map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent></Select>{selectedTemplate ? <p className="text-xs text-muted-foreground">{selectedTemplate.form_fields.length} fields</p> : null}</div><div className="space-y-1.5"><Label>Patient</Label><Select value={patientId} onValueChange={setPatientId}><SelectTrigger><SelectValue placeholder="Choose a patient"/></SelectTrigger><SelectContent>{(data?.patients ?? []).map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name} · {patient.patient_number}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label htmlFor="due-date">Due date</Label><Input id="due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)}/></div><DialogFooter><Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button disabled={assignForm.isPending}><Send className="size-4"/>{assignForm.isPending ? "Sending…" : "Send to portal"}</Button></DialogFooter></form></DialogContent></Dialog>
  </AppShell>;
}

function Empty({ text }: { text: string }) { return <div className="px-4 py-10 text-center text-sm text-muted-foreground">{text}</div>; }