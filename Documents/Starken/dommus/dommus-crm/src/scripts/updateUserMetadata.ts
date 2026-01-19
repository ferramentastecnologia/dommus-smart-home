import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Script para atualizar metadata de usuário
// Execute: npm run update-user-metadata

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.log('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateUserMetadata() {
  const targetEmail = 'leonardo.pickler@hotmail.com';
  
  try {
    console.log('🔍 Buscando usuário:', targetEmail);
    
    // 1. Buscar o usuário
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email === targetEmail);
    
    if (!user) {
      console.error('❌ Usuário não encontrado:', targetEmail);
      return;
    }
    
    console.log('✅ Usuário encontrado!');
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    console.log('📋 Metadata atual:', user.user_metadata);
    
    // 2. Atualizar o metadata
    console.log('\n🔄 Atualizando metadata...');
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          role: 'admin',
          name: 'Leonardo Pickler'
        }
      }
    );
    
    if (error) {
      console.error('❌ Erro ao atualizar:', error);
      return;
    }
    
    console.log('✅ Metadata atualizado com sucesso!');
    console.log('📋 Novo metadata:', data.user.user_metadata);
    console.log('\n🎉 Pronto! O usuário agora tem permissões de ADMIN');
    console.log('⚠️  O usuário precisa fazer logout e login novamente para as mudanças terem efeito.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar
updateUserMetadata();

