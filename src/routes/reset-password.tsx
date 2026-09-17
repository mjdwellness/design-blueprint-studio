import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password | MJD Wellness" }, { name: "description", content: "Choose a new MJD Wellness account password." },
    { property: "og:title", content: "Reset password | MJD Wellness" }, { property: "og:description", content: "Secure password recovery." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ResetPassword,
});
function ResetPassword() {
  const navigate = useNavigate(); const [password, setPassword] = useState(""); const [valid, setValid] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { setValid(window.location.hash.includes("type=recovery")); }, []);
  async function submit(e: FormEvent) { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password }); if (error) setMessage(error.message); else await navigate({ to: "/", replace: true }); }
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><form onSubmit={submit} className="w-full max-w-sm border border-border bg-surface p-7"><h1 className="text-xl font-semibold">Choose a new password</h1>{valid ? <><Input className="mt-5" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /><Button className="mt-4 w-full">Update password</Button></> : <p className="mt-4 text-sm text-muted-foreground">Open the recovery link from your email to continue.</p>}{message ? <p className="mt-3 text-xs text-danger">{message}</p> : null}</form></main>;
}