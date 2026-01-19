import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { supabase } from '@/services/supabase/client';

export function useUserRole() {
  const { user, loading: userLoading } = useUser();
  const [role, setRole] = useState<string>('agent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (userLoading) return; // Aguarda o usuário carregar
      
      if (!user) {
        setRole('guest');
        setLoading(false);
        return;
      }

      // Email privilegiado: sempre admin, independente do banco
      const privilegedAdminEmails = ['leonardo.pickler@hotmail.com'];
      const normalizedEmail = user?.email?.toLowerCase();
      if (normalizedEmail && privilegedAdminEmails.includes(normalizedEmail)) {
        console.log('✅ Privileged admin email detected:', normalizedEmail);
        setRole('admin');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching user role for:', user.id);
        console.log('📧 User email:', user.email);
        console.log('📋 Full user_metadata:', user.user_metadata);

        // 1. Tenta pegar do user_metadata primeiro (mais rápido)
        const metaRole = user.user_metadata?.role || user.user_metadata?.position;
        console.log('🔍 metaRole found:', metaRole);
        if (metaRole && ["admin", "manager", "agent"].includes(metaRole.toLowerCase())) {
          console.log('✅ Role from metadata:', metaRole.toLowerCase());
          setRole(metaRole.toLowerCase());
          setLoading(false);
          return;
        }
        console.log('⚠️ No valid role in metadata, checking agents table...');

        // 2. Busca na tabela agents pelo id
        console.log('🔍 Checking agents table for role...');
        const { data, error } = await supabase
          .from("agents")
          .select("role")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.log('⚠️ Error fetching user role from agents table:', error);
          setRole('agent'); // fallback
        } else if (data?.role && ["admin", "manager", "agent"].includes(data.role.toLowerCase())) {
          console.log('✅ Role from agents table:', data.role.toLowerCase());
          setRole(data.role.toLowerCase());
        } else {
          console.log('⚠️ No valid role found, using fallback: agent');
          setRole('agent');
        }
      } catch (err) {
        console.error('❌ Error in fetchUserRole:', err);
        setError('Failed to fetch user role');
        setRole('agent'); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, userLoading]);

  return { role, loading, error };
}
