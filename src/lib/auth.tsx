import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Account = {
  session: Session | null;
  loading: boolean;
  role: string | null;
  displayName: string;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Account | null>(null);
const PUBLIC_PATHS = new Set(["/auth", "/reset-password"]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Account");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const loadAccount = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setRole(null);
        setLoading(false);
        return;
      }
      const fallback = nextSession.user.email?.split("@")[0] || "Account";
      await supabase.rpc("bootstrap_current_account", { _display_name: fallback });
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", nextSession.user.id),
        supabase.from("profiles").select("display_name").eq("id", nextSession.user.id).maybeSingle(),
      ]);
      if (!mounted) return;
      const names = roles?.map((item) => item.role) ?? [];
      setRole(names.includes("super_admin") ? "super_admin" : names[0] ?? null);
      setDisplayName(profile?.display_name ?? fallback);
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
    if (session && location.pathname === "/auth") void navigate({ to: role === "patient" ? "/portal" : role === "super_admin" ? "/admin" : "/", replace: true });
    if (session && location.pathname.startsWith("/admin") && role !== "super_admin") void navigate({ to: role === "patient" ? "/portal" : "/", replace: true });
  }, [loading, location.pathname, navigate, role, session]);

  const value = useMemo<Account>(() => ({
    session,
    loading,
    role,
    displayName,
    signOut: async () => {
      await supabase.auth.signOut();
      await navigate({ to: "/auth", replace: true });
    },
  }), [displayName, loading, navigate, role, session]);

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