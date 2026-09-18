import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Account = {
  session: Session | null;
  loading: boolean;
  role: string | null;
  displayName: string;
  organization: {
    id: string;
    name: string;
    specialty: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    timezone: string;
  } | null;
  refreshOrganization: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Account | null>(null);
const PUBLIC_PATHS = new Set(["/auth", "/reset-password"]);
// Platform-wide pages the system owner (super_admin) can see but an
// organization-level admin (org_admin) should not — org_admin is scoped
// to their own organization, not every customer on the platform.
const SUPER_ADMIN_ONLY_PATHS = ["/admin/integrations"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Account");
  const [organization, setOrganization] = useState<Account["organization"]>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const loadAccount = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setRole(null);
        setOrganization(null);
        setLoading(false);
        return;
      }
      const fallback = nextSession.user.email?.split("@")[0] || "Account";
      await supabase.rpc("bootstrap_current_account", { _display_name: fallback });
      const [{ data: roles }, { data: profile }, { data: memberships }, { data: patient }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", nextSession.user.id),
        supabase.from("profiles").select("display_name").eq("id", nextSession.user.id).maybeSingle(),
        supabase.from("organization_memberships").select("organization_id, organizations(id,name,specialty,phone,email,website,address,timezone)").eq("user_id", nextSession.user.id).eq("status", "active").limit(1),
        supabase.from("patients").select("organization_id, organizations(id,name,specialty,phone,email,website,address,timezone)").eq("profile_id", nextSession.user.id).eq("status", "active").limit(1),
      ]);
      if (!mounted) return;
      const names = roles?.map((item) => item.role) ?? [];
      const nextRole = names.includes("super_admin") ? "super_admin" : names[0] ?? null;
      const nextName = profile?.display_name ?? fallback;
      const organizationRelation = memberships?.[0]?.organizations ?? patient?.[0]?.organizations ?? null;
      const nextOrganization = Array.isArray(organizationRelation) ? organizationRelation[0] ?? null : organizationRelation;
      setRole(nextRole);
      setDisplayName(nextName);
      setOrganization(nextOrganization);
      setLoading(false);
    };
    void supabase.auth.getSession().then(({ data }) => loadAccount(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => void loadAccount(nextSession));
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.has(location.pathname);
    if (!session && !isPublic) void navigate({ to: "/auth", replace: true });
    if (session && location.pathname === "/auth") void navigate({ to: role === "patient" ? "/portal" : role === "super_admin" || role === "org_admin" ? "/admin" : "/", replace: true });
    if (session && location.pathname.startsWith("/admin") && role !== "super_admin" && role !== "org_admin") void navigate({ to: role === "patient" ? "/portal" : "/", replace: true });
    if (session && role !== "super_admin" && SUPER_ADMIN_ONLY_PATHS.some((path) => location.pathname.startsWith(path))) void navigate({ to: "/admin", replace: true });
    if (session && role === "patient" && !location.pathname.startsWith("/portal") && !isPublic) void navigate({ to: "/portal", replace: true });
  }, [loading, location.pathname, navigate, role, session]);

  const value = useMemo<Account>(() => ({
    session,
    loading,
    role,
    displayName,
    organization,
    refreshOrganization: async () => {
      if (!organization) return;
      const { data } = await supabase.from("organizations").select("id,name,specialty,phone,email,website,address,timezone").eq("id", organization.id).maybeSingle();
      if (data) setOrganization(data);
    },
    signOut: async () => {
      await supabase.auth.signOut();
      await navigate({ to: "/auth", replace: true });
    },
  }), [displayName, loading, navigate, organization, role, session]);

  if (loading && !PUBLIC_PATHS.has(location.pathname)) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading your workspace…</div>;
  }
  if (!session && !PUBLIC_PATHS.has(location.pathname)) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAccount() {
  const account = useContext(AuthContext);
  if (!account) throw new Error("useAccount must be used inside AuthProvider");
  return account;
}