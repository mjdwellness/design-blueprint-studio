CREATE TABLE public.appointment_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 15 AND 240),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_services TO authenticated;
GRANT ALL ON public.appointment_services TO service_role;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view organization appointment services" ON public.appointment_services FOR SELECT TO authenticated USING (
  public.has_org_access(auth.uid(), organization_id)
  OR EXISTS (SELECT 1 FROM public.patients p WHERE p.organization_id = appointment_services.organization_id AND p.profile_id = auth.uid())
);
CREATE POLICY "Staff create appointment services" ON public.appointment_services FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update appointment services" ON public.appointment_services FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Admins delete appointment services" ON public.appointment_services FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE TABLE public.provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  slot_minutes integer NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 15 AND 240),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  UNIQUE (organization_id, location_id, provider_name, day_of_week, starts_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_availability TO authenticated;
GRANT ALL ON public.provider_availability TO service_role;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view organization provider availability" ON public.provider_availability FOR SELECT TO authenticated USING (
  public.has_org_access(auth.uid(), organization_id)
  OR EXISTS (SELECT 1 FROM public.patients p WHERE p.organization_id = provider_availability.organization_id AND p.profile_id = auth.uid())
);
CREATE POLICY "Staff create provider availability" ON public.provider_availability FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update provider availability" ON public.provider_availability FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Admins delete provider availability" ON public.provider_availability FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE INDEX appointment_services_org_status_idx ON public.appointment_services (organization_id, status);
CREATE INDEX provider_availability_org_day_idx ON public.provider_availability (organization_id, day_of_week) WHERE active;
CREATE INDEX appointments_provider_time_idx ON public.appointments (organization_id, provider_name, starts_at, ends_at) WHERE status <> 'cancelled';

CREATE OR REPLACE FUNCTION public.book_patient_appointment(
  _service_id uuid,
  _availability_id uuid,
  _starts_at timestamptz,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _patient public.patients%ROWTYPE;
  _service public.appointment_services%ROWTYPE;
  _availability public.provider_availability%ROWTYPE;
  _ends_at timestamptz;
  _appointment_id uuid;
  _local_start timestamp;
BEGIN
  SELECT * INTO _patient FROM public.patients WHERE profile_id = auth.uid() AND status = 'active' LIMIT 1;
  IF _patient.id IS NULL THEN RAISE EXCEPTION 'Active patient account not found'; END IF;

  SELECT * INTO _service FROM public.appointment_services WHERE id = _service_id AND organization_id = _patient.organization_id AND status = 'active';
  IF _service.id IS NULL THEN RAISE EXCEPTION 'Appointment service is unavailable'; END IF;

  SELECT * INTO _availability FROM public.provider_availability WHERE id = _availability_id AND organization_id = _patient.organization_id AND active;
  IF _availability.id IS NULL THEN RAISE EXCEPTION 'Provider availability is unavailable'; END IF;

  _local_start := _starts_at AT TIME ZONE 'America/New_York';
  IF _starts_at <= now() + interval '2 hours' OR _starts_at > now() + interval '90 days' THEN RAISE EXCEPTION 'Choose a time between two hours and 90 days from now'; END IF;
  IF EXTRACT(DOW FROM _local_start)::integer <> _availability.day_of_week THEN RAISE EXCEPTION 'The selected day is unavailable'; END IF;
  IF _local_start::time < _availability.starts_at OR (_local_start::time + make_interval(mins => _service.duration_minutes)) > _availability.ends_at THEN RAISE EXCEPTION 'The selected time is outside provider hours'; END IF;
  IF EXTRACT(MINUTE FROM _local_start)::integer % _availability.slot_minutes <> 0 THEN RAISE EXCEPTION 'Choose a valid appointment time'; END IF;

  _ends_at := _starts_at + make_interval(mins => _service.duration_minutes);
  IF EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.organization_id = _patient.organization_id
      AND a.provider_name = _availability.provider_name
      AND a.status <> 'cancelled'
      AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(_starts_at, _ends_at, '[)')
  ) THEN RAISE EXCEPTION 'That appointment time was just booked'; END IF;

  INSERT INTO public.appointments (organization_id, location_id, patient_id, provider_name, appointment_type, starts_at, ends_at, status, notes)
  VALUES (_patient.organization_id, _availability.location_id, _patient.id, _availability.provider_name, _service.name, _starts_at, _ends_at, 'unconfirmed', NULLIF(trim(_notes), ''))
  RETURNING id INTO _appointment_id;
  RETURN _appointment_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.book_patient_appointment(uuid, uuid, timestamptz, text) TO authenticated;