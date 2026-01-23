import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { supabase } from '@/services/supabase/client';

// Fallback de emails admin (usado se a tabela não existir ou estiver vazia)
const FALLBACK_ADMIN_EMAILS = [
  'ferramentas.starken@gmail.com',
  'leonardo.pickler@hotmail.com'
];

export function useUserRole() {
  const { user, loading: userLoading } = useUser();
  const [role, setRole] = useState<string>('agent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (userLoading) return;

      if (!user) {
        setRole('guest');
        setLoading(false);
        return;
      }

      const normalizedEmail = user?.email?.toLowerCase();

      try {
        setLoading(true);
        setError(null);

        // 1. Verificar na tabela admin_emails do banco
        try {
          const { data: adminData, error: adminError } = await supabase
            .from('admin_emails')
            .select('email')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (!adminError && adminData) {
            console.log('✅ Admin email found in database:', normalizedEmail);
            setRole('admin');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log('⚠️ admin_emails table not available, using fallback');
        }

        // 2. Fallback: verificar lista hardcoded
        if (normalizedEmail && FALLBACK_ADMIN_EMAILS.includes(normalizedEmail)) {
          console.log('✅ Admin email detected (fallback):', normalizedEmail);
          setRole('admin');
          setLoading(false);
          return;
        }

        // 3. Verificar user_metadata
        const metaRole = user.user_metadata?.role || user.user_metadata?.position;
        if (metaRole && ["admin", "manager", "agent"].includes(metaRole.toLowerCase())) {
          console.log('✅ Role from metadata:', metaRole.toLowerCase());
          setRole(metaRole.toLowerCase());
          setLoading(false);
          return;
        }

        // 4. Buscar na tabela agents
        const { data, error: agentError } = await supabase
          .from("agents")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!agentError && data?.role && ["admin", "manager", "agent"].includes(data.role.toLowerCase())) {
          console.log('✅ Role from agents table:', data.role.toLowerCase());
          setRole(data.role.toLowerCase());
        } else {
          console.log('⚠️ No role found, defaulting to: agent');
          setRole('agent');
        }
      } catch (err) {
        console.error('❌ Error in fetchUserRole:', err);
        setError('Failed to fetch user role');
        setRole('agent');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, userLoading]);

  return { role, loading, error };
}
