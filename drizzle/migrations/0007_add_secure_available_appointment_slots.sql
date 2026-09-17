CREATE OR REPLACE FUNCTION public.get_available_appointment_slots(
  _service_id uuid,
  _from_date date DEFAULT CURRENT_DATE,
  _days integer DEFAULT 21
)
RETURNS TABLE (
  availability_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  provider_name text,
  location_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _patient public.patients%ROWTYPE;
  _service public.appointment_services%ROWTYPE;
BEGIN
  SELECT * INTO _patient FROM public.patients WHERE profile_id = auth.uid() AND status = 'active' LIMIT 1;
  IF _patient.id IS NULL THEN RAISE EXCEPTION 'Active patient account not found'; END IF;
  SELECT * INTO _service FROM public.appointment_services WHERE id = _service_id AND organization_id = _patient.organization_id AND status = 'active';
  IF _service.id IS NULL THEN RAISE EXCEPTION 'Appointment service is unavailable'; END IF;

  RETURN QUERY
  WITH days AS (
    SELECT generate_series(_from_date, _from_date + LEAST(GREATEST(_days, 1), 90) - 1, interval '1 day')::date AS local_date
  ), slots AS (
    SELECT pa.id AS availability_id,
           ((d.local_date + pa.starts_at + make_interval(mins => n.minute_offset)) AT TIME ZONE 'America/New_York') AS starts_at,
           ((d.local_date + pa.starts_at + make_interval(mins => n.minute_offset + _service.duration_minutes)) AT TIME ZONE 'America/New_York') AS ends_at,
           pa.provider_name,
           pa.location_id
    FROM days d
    JOIN public.provider_availability pa ON pa.organization_id = _patient.organization_id AND pa.active AND pa.day_of_week = EXTRACT(DOW FROM d.local_date)::integer
    CROSS JOIN LATERAL generate_series(0, GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (pa.ends_at - pa.starts_at)) / 60)::integer - _service.duration_minutes), pa.slot_minutes) AS n(minute_offset)
  )
  SELECT s.availability_id, s.starts_at, s.ends_at, s.provider_name, s.location_id
  FROM slots s
  WHERE s.starts_at > now() + interval '2 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.organization_id = _patient.organization_id
        AND a.provider_name = s.provider_name
        AND a.status <> 'cancelled'
        AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(s.starts_at, s.ends_at, '[)')
    )
  ORDER BY s.starts_at;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_available_appointment_slots(uuid, date, integer) TO authenticated;