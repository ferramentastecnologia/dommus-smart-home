import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis do .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Usando a service key ao invés da anon key

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
  console.log('Por favor, crie um arquivo .env na raiz do projeto com essas variáveis');
  console.log('Você pode encontrar a SERVICE_ROLE_KEY no dashboard do Supabase em Project Settings > API');
  process.exit(1);
}

// Criar cliente Supabase com a service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateExistingUsersRole() {
  try {
    // Buscar todos os usuários
    const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('Erro ao buscar usuários:', fetchError);
      return;
    }

    console.log(`Found ${users.length} users`);
    
    // Filtrar usuários sem role
    const usersWithoutRole = users.filter(user => 
      !user.user_metadata?.role && !user.user_metadata?.position
    );

    console.log(`Found ${usersWithoutRole.length} users without role`);

    // Buscar agentes existentes para não duplicar
    const { data: existingAgents, error: agentsError } = await supabase
      .from('agents')
      .select('user_id, email');

    if (agentsError) {
      console.error('Erro ao buscar agentes existentes:', agentsError);
      return;
    }

    const existingAgentEmails = new Set(existingAgents?.map(agent => agent.email) || []);
    const existingAgentUserIds = new Set(existingAgents?.map(agent => agent.user_id) || []);

    // Atualizar cada usuário
    for (const user of usersWithoutRole) {
      try {
        // 1. Atualizar metadata do usuário
        const { data, error } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              role: 'agent'
            }
          }
        );

        if (error) {
          console.error(`Erro ao atualizar usuário ${user.email}:`, error);
          continue;
        }

        console.log(`✅ Atualizado metadata do usuário: ${user.email}`);

        // 2. Criar registro na tabela agents se não existir
        if (!existingAgentEmails.has(user.email) && !existingAgentUserIds.has(user.id)) {
          const { error: agentError } = await supabase
            .from('agents')
            .insert({
              id: crypto.randomUUID(), // Gerando um novo ID para o agente
              user_id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
              email: user.email,
              role: 'agent',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (agentError) {
            console.error(`Erro ao criar agente para ${user.email}:`, agentError);
            continue;
          }

          console.log(`✅ Criado registro de agente para: ${user.email}`);
        } else {
          console.log(`ℹ️ Agente já existe para: ${user.email}`);
        }
      } catch (updateError) {
        console.error(`Erro ao processar usuário ${user.email}:`, updateError);
      }
    }

    console.log('Script finalizado!');
  } catch (error) {
    console.error('Erro durante a execução do script:', error);
  }
}

// Executar o script
updateExistingUsersRole(); 