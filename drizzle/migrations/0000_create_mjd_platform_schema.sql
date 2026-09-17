CREATE TYPE public.app_role AS ENUM ('super_admin', 'org_admin', 'staff', 'provider', 'billing', 'patient');
CREATE TYPE public.record_status AS ENUM ('active', 'inactive', 'pending', 'suspended', 'trial');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  specialty text NOT NULL DEFAULT 'Primary Care',
  status public.record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address_line1 text,
  city text NOT NULL,
  region text NOT NULL,
  postal_code text,
  phone text,
  status public.record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  phone text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.record_status NOT NULL DEFAULT 'active',
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  title text,
  status public.record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_memberships TO authenticated;
GRANT ALL ON public.organization_memberships TO service_role;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_org_access(_user_id uuid, _organization_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(_user_id, 'super_admin') OR EXISTS (
  SELECT 1 FROM public.organization_memberships
  WHERE user_id = _user_id AND organization_id = _organization_id AND status = 'active'
) $$;
GRANT EXECUTE ON FUNCTION public.has_org_access(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _organization_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(_user_id, 'super_admin') OR (
  public.has_role(_user_id, 'org_admin') AND EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE user_id = _user_id AND organization_id = _organization_id AND status = 'active'
  )
) $$;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid, uuid) TO authenticated;

CREATE POLICY "Members view organizations" ON public.organizations FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), id));
CREATE POLICY "Super admins create organizations" ON public.organizations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins update organizations" ON public.organizations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete organizations" ON public.organizations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members view locations" ON public.locations FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id));
CREATE POLICY "Admins create locations" ON public.locations FOR INSERT TO authenticated WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Admins update locations" ON public.locations FOR UPDATE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id)) WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Admins delete locations" ON public.locations FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Members view memberships" ON public.organization_memberships FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_org_access(auth.uid(), organization_id));
CREATE POLICY "Admins create memberships" ON public.organization_memberships FOR INSERT TO authenticated WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Admins update memberships" ON public.organization_memberships FOR UPDATE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id)) WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Admins delete memberships" ON public.organization_memberships FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id uuid,
  patient_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  phone text,
  email text,
  address text,
  insurance text,
  provider_name text,
  balance_cents integer NOT NULL DEFAULT 0,
  status public.record_status NOT NULL DEFAULT 'active',
  avatar_url text,
  ehr_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, patient_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view organization patients" ON public.patients FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) OR profile_id = auth.uid());
CREATE POLICY "Staff create patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update patients" ON public.patients FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id));
CREATE POLICY "Admins delete patients" ON public.patients FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('sms','voicemail','web','email')),
  subject text,
  unread_count integer NOT NULL DEFAULT 0,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view conversations" ON public.conversations FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.profile_id = auth.uid()));
CREATE POLICY "Members create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.profile_id = auth.uid()));
CREATE POLICY "Members update conversations" ON public.conversations FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id)) WITH CHECK (public.has_org_access(auth.uid(), organization_id));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid,
  sender_type text NOT NULL CHECK (sender_type IN ('patient','staff','system')),
  body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c LEFT JOIN public.patients p ON p.id = c.patient_id WHERE c.id = conversation_id AND (public.has_org_access(auth.uid(), c.organization_id) OR p.profile_id = auth.uid())));
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c LEFT JOIN public.patients p ON p.id = c.patient_id WHERE c.id = conversation_id AND (public.has_org_access(auth.uid(), c.organization_id) OR p.profile_id = auth.uid())));
CREATE POLICY "Staff update messages" ON public.messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND public.has_org_access(auth.uid(), c.organization_id)));

CREATE TABLE public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  handled_by uuid,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  phone_number text NOT NULL,
  status text NOT NULL CHECK (status IN ('completed','missed','voicemail','initiated')),
  started_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer NOT NULL DEFAULT 0,
  recording_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calls TO authenticated;
GRANT ALL ON public.calls TO service_role;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view calls" ON public.calls FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.profile_id = auth.uid()));
CREATE POLICY "Staff create calls" ON public.calls FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update calls" ON public.calls FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id));

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  provider_id uuid,
  provider_name text NOT NULL,
  appointment_type text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('confirmed','unconfirmed','checked_in','completed','cancelled','no_show','forms_pending')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id) OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.profile_id = auth.uid()));
CREATE POLICY "Staff create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient'));
CREATE POLICY "Staff update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_org_access(auth.uid(), organization_id) AND NOT public.has_role(auth.uid(), 'patient')) WITH CHECK (public.has_org_access(auth.uid(), organization_id));
CREATE POLICY "Admins delete appointments" ON public.appointments FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), organization_id));

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  seats integer NOT NULL DEFAULT 1,
  monthly_amount_cents integer NOT NULL DEFAULT 0,
  renews_at date,
  status text NOT NULL CHECK (status IN ('paid','trial','past_due','cancelled')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.is_org_admin(auth.uid(), organization_id));
CREATE POLICY "Super admins create subscriptions" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins update subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete subscriptions" ON public.subscriptions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  phone_number text NOT NULL UNIQUE,
  capabilities text[] NOT NULL DEFAULT ARRAY['voice','sms']::text[],
  calls_30d integer NOT NULL DEFAULT 0,
  sms_30d integer NOT NULL DEFAULT 0,
  status public.record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_numbers TO authenticated;
GRANT ALL ON public.phone_numbers TO service_role;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view numbers" ON public.phone_numbers FOR SELECT TO authenticated USING (public.has_org_access(auth.uid(), organization_id));
CREATE POLICY "Super admins create numbers" ON public.phone_numbers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins update numbers" ON public.phone_numbers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete numbers" ON public.phone_numbers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id)));
CREATE POLICY "Authenticated users create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

CREATE INDEX locations_organization_idx ON public.locations(organization_id);
CREATE INDEX memberships_user_idx ON public.organization_memberships(user_id);
CREATE INDEX memberships_org_idx ON public.organization_memberships(organization_id);
CREATE INDEX patients_org_idx ON public.patients(organization_id);
CREATE INDEX patients_profile_idx ON public.patients(profile_id);
CREATE INDEX conversations_org_last_idx ON public.conversations(organization_id, last_message_at DESC);
CREATE INDEX messages_conversation_sent_idx ON public.messages(conversation_id, sent_at);
CREATE INDEX calls_org_started_idx ON public.calls(organization_id, started_at DESC);
CREATE INDEX appointments_org_start_idx ON public.appointments(organization_id, starts_at);
CREATE INDEX audit_logs_org_created_idx ON public.audit_logs(organization_id, created_at DESC);