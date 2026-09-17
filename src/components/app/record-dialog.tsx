import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Field = { key: string; label: string; type?: string; required?: boolean; placeholder?: string };

export function RecordDialog({ open, onOpenChange, title, description, fields, initial = {}, onSave, busy }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; fields: Field[];
  initial?: Record<string, string | number | null | undefined>; onSave: (values: Record<string, string>) => Promise<void>; busy?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => { if (open) setValues(Object.fromEntries(fields.map((field) => [field.key, String(initial[field.key] ?? "")]))); }, [open, initial, fields]);
  async function submit(event: FormEvent) { event.preventDefault(); await onSave(values); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="space-y-4">
      {fields.map((field) => <div key={field.key} className="space-y-1.5"><Label htmlFor={field.key}>{field.label}</Label><Input id={field.key} type={field.type ?? "text"} required={field.required} placeholder={field.placeholder} value={values[field.key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /></div>)}
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save"}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}