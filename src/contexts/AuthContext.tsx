import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "counselor";
  phone?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch CRM profile after auth success
          setTimeout(async () => {
            try {
              const { data: userRoles } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .limit(1)
                .maybeSingle();

              const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (profileData && userRoles) {
                const userProfile: UserProfile = {
                  id: profileData.id,
                  email: session.user.email!,
                  name: profileData.name,
                  role: userRoles.role as "admin" | "counselor",
                  phone: profileData.phone,
                  is_active: profileData.is_active,
                };
                setProfile(userProfile);
              }
            } catch (error) {
              console.error("Error fetching profile:", error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with Supabase Auth:", email);

      // Use proper Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase Auth error:", error);
        return { error: { message: error.message } };
      }

      if (!data.user) {
        return { error: { message: "Invalid email or password" } };
      }

      console.log("Auth successful, fetching profile...");

      // Fetch role and profile
      const { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .limit(1)
        .maybeSingle();

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (roleError || profileError || !profileData || !userRoles) {
        console.error("Profile fetch error:", { roleError, profileError });
        return { error: { message: "User profile not found" } };
      }

      if (!profileData.is_active) {
        await supabase.auth.signOut();
        return { error: { message: "Your account has been deactivated" } };
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        email: data.user.email!,
        name: profileData.name,
        role: userRoles.role as "admin" | "counselor",
        phone: profileData.phone,
        is_active: profileData.is_active,
      };

      setProfile(userProfile);
      console.log("Profile loaded, navigating...");

      // Navigate based on role
      navigate(userProfile.role === "admin" ? "/admin" : "/counselor");

      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error:", error);
      return { error: { message: error.message || "An error occurred" } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
