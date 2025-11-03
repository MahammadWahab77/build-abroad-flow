import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  is_active: boolean;
}

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored session
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        localStorage.removeItem("user_profile");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Fetch the user by email
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Login error:", error);
        return { error: { message: "An error occurred during login" } };
      }

      if (!user) {
        return { error: { message: "Invalid email or password" } };
      }

      // Validate password (plain text comparison - in production use bcrypt)
      if (user.password !== password) {
        return { error: { message: "Invalid email or password" } };
      }

      // Store user profile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
      };

      setProfile(userProfile);
      localStorage.setItem("user_profile", JSON.stringify(userProfile));

      // Navigate based on role
      navigate(user.role === "admin" ? "/admin" : "/counselor");

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || "An error occurred" } };
    }
  };

  const signOut = async () => {
    setProfile(null);
    localStorage.removeItem("user_profile");
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
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
