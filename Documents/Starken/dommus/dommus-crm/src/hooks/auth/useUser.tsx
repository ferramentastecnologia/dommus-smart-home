import { useState, useEffect } from 'react';

// Simple types to avoid import issues
type User = any;

// Declare supabase as global - it will be available at runtime
declare global {
  var supabase: any;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        
        // Get supabase from global context
        const supabase = (globalThis as any).supabase || (window as any).supabase;
        if (!supabase) {
          // Fallback: dynamic import
          const { supabase: sb } = await import('../../services/supabase/client');
          (globalThis as any).supabase = sb;
          return getUser(); // Retry
        }
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    // Get the user on mount
    getUser();

    // Set up a listener for auth state changes with fallback
    const setupListener = async () => {
      const supabase = (globalThis as any).supabase || (window as any).supabase;
      if (!supabase) return;
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupListener();
  }, []);

  return { user, loading, error };
}

// Utilitário para obter o papel do usuário (admin, manager, agent)
export async function getUserRole(user: User | null): Promise<string> {
  if (!user) return "guest";
  
  // Email privilegiado: sempre admin, independente do banco
  const privilegedAdminEmails = ['leonardo.pickler@hotmail.com'];
  const normalizedEmail = user?.email?.toLowerCase();
  if (normalizedEmail && privilegedAdminEmails.includes(normalizedEmail)) {
    console.log('✅ Privileged admin email detected:', normalizedEmail);
    return "admin";
  }
  
  try {
    // Import supabase client
    const { supabase } = await import('../../services/supabase/client');
    
    // 1. Tenta pegar do user_metadata
    const metaRole = user.user_metadata?.role || user.user_metadata?.position;
    if (metaRole && ["admin", "manager", "agent"].includes(metaRole.toLowerCase())) {
      return metaRole.toLowerCase();
    }
    
    // 2. Busca na tabela agents pelo id
    const { data, error } = await supabase
      .from("agents")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (error) {
      console.log('Error fetching user role from agents table:', error);
      return "agent"; // fallback
    }
    
    if (data?.role && ["admin", "manager", "agent"].includes(data.role.toLowerCase())) {
      return data.role.toLowerCase();
    }
  } catch (error) {
    console.error('Error in getUserRole:', error);
  }
  
  return "agent"; // fallback
} 