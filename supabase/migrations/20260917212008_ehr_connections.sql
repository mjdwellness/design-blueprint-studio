-- Tracks each organization's connection to an external EHR (starting with
-- Practice Fusion). No secrets live in this table — the Practice Fusion
-- client ID and signing key are server-only environment variables
-- (PRACTICE_FUSION_CLIENT_ID, PRACTICE_FUSION_PRIVATE_KEY, ...). This row is
-- just connection status, so the UI can show "Connected" / "Setup required"
-- and a sync history, and so the sync job knows which Practice Fusion
-- practice a given organization maps to.
create table if not exists public.ehr_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null default 'practice_fusion',
  status text not null default 'disconnected' check (status in ('disconnected', 'connected', 'error')),
  -- Practice Fusion's practice identifier this organization syncs from.
  external_practice_id text,
  -- SMART on FHIR scopes actually granted by Practice Fusion for this
  -- connection, e.g. {system/Patient.read}. Recorded for audit purposes.
  granted_scopes text[] not null default '{}',
  last_synced_at timestamptz,
  last_sync_error text,
  patients_synced integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

alter table public.ehr_connections enable row level security;

-- Anyone with access to the organization can see its connection status.
create policy "org members can view their ehr connection"
  on public.ehr_connections for select
  using (public.has_org_access(organization_id, auth.uid()));

-- Only that organization's admin can create/update/remove the connection
-- (e.g. trigger a manual sync, or disconnect). The sync job itself runs as
-- the service role and bypasses RLS entirely.
create policy "org admins can manage their ehr connection"
  on public.ehr_connections for all
  using (public.is_org_admin(organization_id, auth.uid()))
  with check (public.is_org_admin(organization_id, auth.uid()));

create or replace function public.ehr_connections_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_ehr_connections_updated_at
  before update on public.ehr_connections
  for each row execute function public.ehr_connections_set_updated_at();

-- Lets the sync job upsert idempotently: re-running a sync updates the same
-- patient row (matched by organization + the Practice Fusion FHIR id)
-- instead of creating duplicates. Partial (WHERE ehr_reference IS NOT NULL)
-- so it never constrains the many existing patients with no EHR link.
create unique index if not exists patients_org_ehr_reference_key
  on public.patients (organization_id, ehr_reference)
  where ehr_reference is not null;
