CREATE OR REPLACE FUNCTION public.bootstrap_current_account(_display_name text)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text := COALESCE(auth.jwt() ->> 'email', '');
  assigned_role public.app_role;
  mjd_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  INSERT INTO public.profiles (id, email, display_name, last_active_at)
  VALUES (current_user_id, current_email, COALESCE(NULLIF(trim(_display_name), ''), split_part(current_email, '@', 1)), now())
  ON CONFLICT (id) DO UPDATE SET last_active_at = now(), updated_at = now();

  SELECT role INTO assigned_role FROM public.user_roles WHERE user_id = current_user_id ORDER BY CASE role WHEN 'super_admin' THEN 0 ELSE 1 END LIMIT 1;
  IF assigned_role IS NULL AND NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    assigned_role := 'super_admin';
    INSERT INTO public.user_roles (user_id, role) VALUES (current_user_id, assigned_role);
    SELECT id INTO mjd_id FROM public.organizations WHERE slug = 'mjd-wellness' LIMIT 1;
    IF mjd_id IS NOT NULL THEN
      INSERT INTO public.organization_memberships (organization_id, user_id, title)
      VALUES (mjd_id, current_user_id, 'Platform Administrator')
      ON CONFLICT (organization_id, user_id) DO NOTHING;
    END IF;
  END IF;
  RETURN assigned_role;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bootstrap_current_account(text) TO authenticated;

CREATE POLICY "Super admins manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Organization members view profiles" ON public.profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_memberships mine JOIN public.organization_memberships theirs ON theirs.organization_id = mine.organization_id WHERE mine.user_id = auth.uid() AND theirs.user_id = profiles.id AND mine.status = 'active'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;