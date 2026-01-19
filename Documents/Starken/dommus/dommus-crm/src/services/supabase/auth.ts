import { toast } from "sonner";
import { supabase } from "./config";

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    toast.success("Login successful");
    return data.user;
  } catch (error: any) {
    console.error("Error during login:", error);
    toast.error("Login failed: " + (error.message || "Check your credentials"));
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "agent", // Adicionando role padrão como "agent"
        },
      },
    });

    if (error) throw error;
    
    toast.success("Registration successful");
    return data.user;
  } catch (error: any) {
    console.error("Error registering user:", error);
    toast.error("Registration failed: " + (error.message || "Try again with a different email"));
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast.success("Logout successful");
  } catch (error: any) {
    console.error("Error during logout:", error);
    toast.error("Logout failed: " + (error.message || "Please try again"));
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast.success("Password reset email sent. Please check your inbox.");
    return true;
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    toast.error("Failed to send reset email: " + (error.message || "Please try again"));
    throw error;
  }
};

export const auth = {
  currentUser: () => supabase.auth.getUser(),
  onAuthStateChange: (callback: (event: any, session: any) => void) => 
    supabase.auth.onAuthStateChange(callback),
  signIn: async (email: string, password: string) => 
    await supabase.auth.signInWithPassword({ email, password }),
  signUp: async (email: string, password: string) => 
    await supabase.auth.signUp({ email, password }),
  signOut: async () => await supabase.auth.signOut(),
}; 