import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LeafMark } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in | MJD Wellness" },
    { name: "description", content: "Secure account access for MJD Wellness staff, patients, and platform administrators." },
    { property: "og:title", content: "Sign in | MJD Wellness" },
    { property: "og:description", content: "Secure MJD Wellness account access." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "forgot">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMessage(error?.message ?? "Check your email for the password reset link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message); else await navigate({ to: "/", replace: true });
    }
    setBusy(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-4">
    <section className="w-full max-w-sm border border-border bg-surface p-7 shadow-2xl">
      <div className="mb-7 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded bg-primary text-primary-foreground"><LeafMark className="size-6" /></span><div><h1 className="text-xl font-semibold">MJD Wellness</h1><p className="text-xs text-muted-foreground">Secure practice workspace</p></div></div>
      <h2 className="text-lg font-semibold">{mode === "sign-in" ? "Sign in" : "Reset password"}</h2>
      <p className="mt-1 text-xs text-muted-foreground">Use your authorized practice or patient account.</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        {mode !== "forgot" ? <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div> : null}
        {message ? <p className="rounded border border-border bg-muted p-3 text-xs text-foreground">{message}</p> : null}
        <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Send reset link"}</Button>
      </form>
      <div className="mt-5 flex justify-end text-xs">
        <button className="text-muted-foreground" onClick={() => setMode(mode === "forgot" ? "sign-in" : "forgot")}>{mode === "forgot" ? "Back" : "Forgot password?"}</button>
      </div>
    </section>
  </main>;
}