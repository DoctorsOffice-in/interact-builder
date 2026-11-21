import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeartPulse, LoaderCircle } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AuthPage = () => {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = typeof location.state?.from === "string" && location.state.from.startsWith("/")
    ? location.state.from
    : "/";

  useEffect(() => {
    if (user) navigate(destination, { replace: true });
  }, [user, destination, navigate]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const cleanName = displayName.trim();
        if (!cleanName) throw new Error("Enter your name to create a doctor profile.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: cleanName },
          },
        });
        if (error) throw error;
        if (!data.session) setMessage("Check your email for a confirmation link. Your profile will be ready after you confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We couldn’t complete that request.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "lovable") => {
    setErrorMessage("");
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) {
      setErrorMessage(result.error.message);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-3 text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><HeartPulse className="h-5 w-5" /></span>
          <span className="text-lg font-semibold">Doctors Buddy</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{mode === "sign-up" ? "Create your doctor account" : "Welcome back"}</CardTitle>
            <CardDescription>{mode === "sign-up" ? "Save and manage interactive content for your practice." : "Sign in to manage your practice content and patient leads."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="h-11 w-full justify-center gap-2 border-[#747775] bg-white text-[#1F1F1F] hover:bg-white/90"
                onClick={() => void signInWithProvider("google")}
                disabled={busy}
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                Continue with Google
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => void signInWithProvider("lovable")} disabled={busy}>
                Continue with Lovable
              </Button>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div><div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">or use email</span></div></div>
            <form className="space-y-4" onSubmit={submit}>
              {mode === "sign-up" && <div className="space-y-2"><Label htmlFor="doctor-name">Display name</Label><Input id="doctor-name" autoComplete="name" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></div>}
              <div className="space-y-2"><Label htmlFor="doctor-email">Email</Label><Input id="doctor-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="doctor-password">Password</Label><Input id="doctor-password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
              {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
              {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Please wait</> : mode === "sign-up" ? "Create account" : "Sign in"}</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "sign-up" ? "Already have an account?" : "New to Doctors Buddy?"}{" "}
              <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => { setMode(mode === "sign-up" ? "sign-in" : "sign-up"); setMessage(""); setErrorMessage(""); }}>
                {mode === "sign-up" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};