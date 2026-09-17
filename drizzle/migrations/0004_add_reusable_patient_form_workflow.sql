CREATE TABLE public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_templates TO authenticated;
GRANT ALL ON public.form_templates TO service_role;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view organization form templates" ON public.form_templates FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff create form templates" ON public.form_templates FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update form templates" ON public.form_templates FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Admins delete form templates" ON public.form_templates FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

ALTER TABLE public.patient_forms ADD COLUMN template_id uuid REFERENCES public.form_templates(id) ON DELETE SET NULL;
ALTER TABLE public.patient_forms ADD COLUMN responses jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.patient_forms ADD COLUMN submitted_at timestamptz;

CREATE TABLE public.form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text' CHECK (field_type IN ('text','textarea','date','email','phone','yes_no','signature')),
  required boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_fields TO authenticated;
GRANT ALL ON public.form_fields TO service_role;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view organization form fields" ON public.form_fields FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.form_templates t WHERE t.id = template_id AND public.has_org_access(auth.uid(), t.organization_id) AND NOT public.has_role(auth.uid(), 'patient')));
CREATE POLICY "Patients view assigned form fields" ON public.form_fields FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patient_forms pf JOIN public.patients p ON p.id = pf.patient_id WHERE pf.template_id = template_id AND p.profile_id = auth.uid()));
CREATE POLICY "Staff create organization form fields" ON public.form_fields FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.form_templates t WHERE t.id = template_id AND public.has_org_access(auth.uid(), t.organization_id) AND NOT public.has_role(auth.uid(), 'patient')));
CREATE POLICY "Staff update organization form fields" ON public.form_fields FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.form_templates t WHERE t.id = template_id AND public.has_org_access(auth.uid(), t.organization_id) AND NOT public.has_role(auth.uid(), 'patient'))) WITH CHECK (EXISTS (SELECT 1 FROM public.form_templates t WHERE t.id = template_id AND public.has_org_access(auth.uid(), t.organization_id) AND NOT public.has_role(auth.uid(), 'patient')));
CREATE POLICY "Admins delete organization form fields" ON public.form_fields FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.form_templates t WHERE t.id = template_id AND public.is_org_admin(auth.uid(), t.organization_id)));

CREATE OR REPLACE FUNCTION public.submit_patient_form(_form_id uuid, _responses jsonb)
RETURNS public.patient_forms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owned_form public.patient_forms;
  required_missing boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT pf.* INTO owned_form
  FROM public.patient_forms pf
  JOIN public.patients p ON p.id = pf.patient_id
  WHERE pf.id = _form_id AND p.profile_id = auth.uid();
  IF owned_form.id IS NULL THEN RAISE EXCEPTION 'Form not found or access denied'; END IF;
  IF owned_form.status = 'completed' THEN RAISE EXCEPTION 'This form has already been submitted'; END IF;
  IF jsonb_typeof(_responses) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Responses must be an object'; END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.form_fields ff
    WHERE ff.template_id = owned_form.template_id
      AND ff.required
      AND (NOT (_responses ? ff.id::text) OR NULLIF(trim(_responses ->> ff.id::text), '') IS NULL)
  ) INTO required_missing;
  IF required_missing THEN RAISE EXCEPTION 'Complete all required fields'; END IF;
  UPDATE public.patient_forms
  SET responses = _responses, status = 'completed', completed_at = now(), submitted_at = now(), updated_at = now()
  WHERE id = _form_id
  RETURNING * INTO owned_form;
  RETURN owned_form;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_patient_form(uuid, jsonb) TO authenticated;

CREATE INDEX form_templates_org_status_idx ON public.form_templates(organization_id, status);
CREATE INDEX form_fields_template_position_idx ON public.form_fields(template_id, position);
CREATE INDEX patient_forms_template_idx ON public.patient_forms(template_id);