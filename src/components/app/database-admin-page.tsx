import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminRecords } from "@/lib/platform-data";
import { AppShell } from "./app-shell";
import { PageHeader, Panel, Pill, StatCard } from "./kit";
import { Button } from "@/components/ui/button";
import { RecordDialog, type Field } from "./record-dialog";

type Kind = "organizations" | "locations" | "users" | "subscriptions" | "telecom";
type Config = { title: string; subtitle: string; fields: Field[]; columns: string[]; table: "organizations" | "locations" | "subscriptions" | "phone_numbers"; map: (r: any) => string[]; payload: (v: Record<string,string>) => Record<string,unknown> };
const configs: Record<Exclude<Kind,"users">, Config> = {
  organizations: { title:"Organizations", subtitle:"Customer practices and their current platform status.", table:"organizations", fields:[{key:"name",label:"Name",required:true},{key:"slug",label:"Slug",required:true},{key:"specialty",label:"Specialty",required:true},{key:"status",label:"Status",required:true}], columns:["Organization","Specialty","Status"], map:r=>[r.name,r.specialty,r.status], payload:v=>v },
  locations: { title:"Locations", subtitle:"Physical practice sites across organizations.", table:"locations", fields:[{key:"organization_id",label:"Organization ID",required:true},{key:"name",label:"Name",required:true},{key:"address_line1",label:"Address"},{key:"city",label:"City",required:true},{key:"region",label:"State",required:true},{key:"postal_code",label:"Postal code"},{key:"phone",label:"Phone"}], columns:["Location","Organization","City","Status"], map:r=>[r.name,r.organizations?.name??"—",`${r.city}, ${r.region}`,r.status], payload:v=>v },
  subscriptions: { title:"Subscriptions", subtitle:"Plan assignments, seats, renewal dates, and billing state.", table:"subscriptions", fields:[{key:"organization_id",label:"Organization ID",required:true},{key:"plan_name",label:"Plan",required:true},{key:"seats",label:"Seats",type:"number",required:true},{key:"monthly_amount_cents",label:"Monthly amount (cents)",type:"number",required:true},{key:"renews_at",label:"Renewal date",type:"date"},{key:"status",label:"Status",required:true}], columns:["Organization","Plan","Seats","Monthly","Status"], map:r=>[r.organizations?.name??"—",r.plan_name,String(r.seats),new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(r.monthly_amount_cents/100),r.status], payload:v=>({...v,seats:Number(v["seats"]),monthly_amount_cents:Number(v["monthly_amount_cents"])}) },
  telecom: { title:"Phone & Telecom", subtitle:"Provisioned numbers and saved usage records.", table:"phone_numbers", fields:[{key:"organization_id",label:"Organization ID",required:true},{key:"location_id",label:"Location ID"},{key:"phone_number",label:"Phone number",required:true},{key:"capabilities",label:"Capabilities (voice,sms)",required:true},{key:"calls_30d",label:"Calls (30 days)",type:"number"},{key:"sms_30d",label:"SMS (30 days)",type:"number"},{key:"status",label:"Status",required:true}], columns:["Number","Organization","Capabilities","Calls","SMS","Status"], map:r=>[r.phone_number,r.organizations?.name??"—",r.capabilities.join(" + "),String(r.calls_30d),String(r.sms_30d),r.status], payload:v=>({...v,location_id:v["location_id"]||null,capabilities:(v["capabilities"] ?? "").split(",").map(x=>x.trim()),calls_30d:Number(v["calls_30d"]||0),sms_30d:Number(v["sms_30d"]||0)}) },
};

export function DatabaseAdminPage({ kind }: { kind: Kind }) {
  const queryClient=useQueryClient(); const [editing,setEditing]=useState<any>(null); const [open,setOpen]=useState(false);
  const {data=[],isLoading}=useQuery({queryKey:["admin",kind],queryFn:()=>getAdminRecords(kind)});
  const config=kind==="users"?null:configs[kind];
  const mutation=useMutation({mutationFn:async(values:Record<string,string>)=>{
    if(!config) throw new Error("User account creation is deferred. Existing user profiles are managed here after they sign in.");
    const payload=config.payload(values); const query=editing?.id?(supabase.from(config.table) as any).update(payload).eq("id",editing.id):(supabase.from(config.table) as any).insert(payload); const {error}=await query; if(error) throw error;
  },onSuccess:async()=>{toast.success("Record saved");setOpen(false);setEditing(null);await queryClient.invalidateQueries({queryKey:["admin",kind]});},onError:(e)=>toast.error(e.message)});
  const rows=useMemo(()=>data as any[],[data]);
  const title=config?.title??"Users"; const subtitle=config?.subtitle??"Signed-in accounts, assigned roles, and organization membership.";
  const columns=config?.columns??["User","Email","Role","Organization","Status"];
  const mapped=(row:any)=>config?config.map(row):[row.display_name,row.email,row.user_roles?.map((x:any)=>x.role).join(", ")||"Unassigned",row.organization_memberships?.map((x:any)=>x.organizations?.name).join(", ")||"—",row.status];
  return <AppShell variant="admin"><PageHeader title={title} subtitle={subtitle} actions={config?<Button size="sm" onClick={()=>{setEditing(null);setOpen(true)}}><Plus />Add record</Button>:undefined}/>
    <div className="grid gap-4 sm:grid-cols-3"><StatCard value={String(rows.length)} label={`Total ${title.toLowerCase()}`} /><StatCard value={String(rows.filter((r)=>r.status==="active"||r.status==="paid").length)} label="Active" tone="green" /><StatCard value="Live" label="Database connection" tone="purple" /></div>
    <Panel className="mt-4" title={title} bodyClassName="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">{columns.map(c=><th key={c} className="px-4 py-3 font-medium">{c}</th>)}{config?<th className="px-4 py-3 text-right">Edit</th>:null}</tr></thead><tbody>{isLoading?<tr><td className="px-4 py-8 text-muted-foreground" colSpan={columns.length+1}>Loading records…</td></tr>:rows.map(row=><tr key={row.id} className="border-b border-border last:border-0">{mapped(row).map((cell,i)=><td key={i} className="px-4 py-3">{String(cell).toLowerCase().match(/active|paid|trial|pending|suspended/)?<Pill tone={String(cell).toLowerCase().match(/active|paid/)?"green":"orange"}>{cell}</Pill>:cell}</td>)}{config?<td className="px-4 py-3 text-right"><Button size="icon" variant="ghost" onClick={()=>{setEditing(row);setOpen(true)}} aria-label={`Edit ${mapped(row)[0]}`}><Pencil /></Button></td>:null}</tr>)}</tbody></table></div></Panel>
    {config?<RecordDialog open={open} onOpenChange={setOpen} title={editing?`Edit ${config.title.slice(0,-1)}`:`Add ${config.title.slice(0,-1)}`} description="Changes save immediately to the platform database." fields={config.fields} initial={editing??{status:"active"}} busy={mutation.isPending} onSave={async(v)=>mutation.mutateAsync(v)}/>:null}
  </AppShell>;
}