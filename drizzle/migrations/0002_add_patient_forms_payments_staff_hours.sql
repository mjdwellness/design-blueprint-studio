CREATE TABLE public.patient_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  form_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','expired')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_forms TO authenticated;
GRANT ALL ON public.patient_forms TO service_role;
ALTER TABLE public.patient_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own forms" ON public.patient_forms FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.profile_id = auth.uid()));
CREATE POLICY "Staff view organization forms" ON public.patient_forms FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff create forms" ON public.patient_forms FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update forms" ON public.patient_forms FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Admins delete forms" ON public.patient_forms FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE TABLE public.patient_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','failed','refunded')),
  due_at timestamptz,
  paid_at timestamptz,
  external_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_payments TO authenticated;
GRANT ALL ON public.patient_payments TO service_role;
ALTER TABLE public.patient_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own payments" ON public.patient_payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.profile_id = auth.uid()));
CREATE POLICY "Staff view organization payments" ON public.patient_payments FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff create payments" ON public.patient_payments FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update payments" ON public.patient_payments FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Admins delete payments" ON public.patient_payments FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE TABLE public.staff_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  clocked_in_at timestamptz NOT NULL,
  clocked_out_at timestamptz,
  break_minutes integer NOT NULL DEFAULT 0 CHECK (break_minutes >= 0),
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('open','pending','approved','rejected')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (clocked_out_at IS NULL OR clocked_out_at > clocked_in_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_time_entries TO authenticated;
GRANT ALL ON public.staff_time_entries TO service_role;
ALTER TABLE public.staff_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view own time" ON public.staff_time_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view organization time" ON public.staff_time_entries FOR SELECT TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Staff create own time" ON public.staff_time_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update own time" ON public.staff_time_entries FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (user_id = auth.uid() AND public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Admins manage organization time" ON public.staff_time_entries FOR ALL TO authenticated USING (public.is_org_admin(auth.uid(), organization_id)) WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

CREATE INDEX patient_forms_patient_due_idx ON public.patient_forms(patient_id, due_at);
CREATE INDEX patient_forms_org_status_idx ON public.patient_forms(organization_id, status);
CREATE INDEX patient_payments_patient_created_idx ON public.patient_payments(patient_id, created_at DESC);
CREATE INDEX patient_payments_org_status_idx ON public.patient_payments(organization_id, status);
CREATE INDEX staff_time_entries_org_clocked_idx ON public.staff_time_entries(organization_id, clocked_in_at DESC);
CREATE INDEX staff_time_entries_user_clocked_idx ON public.staff_time_entries(user_id, clocked_in_at DESC);