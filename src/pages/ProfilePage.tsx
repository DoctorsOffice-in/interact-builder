import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const name = displayName.trim();
    if (!name || name.length > 80) {
      toast.error("Enter a display name up to 80 characters.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name, updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Profile could not be saved.");
    else {
      await refreshProfile();
      toast.success("Profile saved.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background"><Header /><div className="flex"><Sidebar /><main className="flex-1 p-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="max-w-xl"><CardHeader><CardTitle>Doctor profile</CardTitle></CardHeader><CardContent>
        <form className="space-y-4" onSubmit={saveProfile}>
          <div className="space-y-2"><Label htmlFor="profile-name">Display name</Label><Input id="profile-name" value={displayName} maxLength={80} onChange={(event) => setDisplayName(event.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="profile-email">Account email</Label><Input id="profile-email" value={user?.email ?? ""} readOnly /></div>
          <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save profile"}</Button>
        </form>
      </CardContent></Card>
    </main></div></div>
  );
};