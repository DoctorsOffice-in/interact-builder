import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type DoctorProfile = Tables<"profiles">;

interface AuthContextValue {
  user: User | null;
  profile: DoctorProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, preferences, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (currentUserId.current === userId) setProfile(error ? null : data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (currentUserId.current) await loadProfile(currentUserId.current);
  }, [loadProfile]);

  useEffect(() => {
    let active = true;
    let authEventVersion = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion += 1;
      const nextUser = session?.user ?? null;
      currentUserId.current = nextUser?.id ?? null;
      setUser(nextUser);
      setProfile(null);
      setLoading(false);
      if (nextUser) window.setTimeout(() => { void loadProfile(nextUser.id); }, 0);
    });

    const eventVersionAtStart = authEventVersion;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active || authEventVersion !== eventVersionAtStart) return;
      const nextUser = error ? null : data.user;
      currentUserId.current = nextUser?.id ?? null;
      setUser(nextUser);
      setLoading(false);
      if (nextUser) void loadProfile(nextUser.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    refreshProfile,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [user, profile, loading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};