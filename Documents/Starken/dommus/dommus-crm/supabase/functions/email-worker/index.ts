// @deno-types is not needed when using Deno Deploy
// Supabase Edge Function para processar e-mails pendentes e gatilhos de e-mail
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as nodemailer from "npm:nodemailer@6.9.9";

// Declare Deno types for the Deno namespace
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Variáveis de ambiente que devem ser configuradas na plataforma do Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Interface para tipagem dos e-mails
interface EmailQueueItem {
  id: string;
  lead_id: string;
  template_id: string;
  status: 'pending' | 'sent' | 'failed';
  to: string;
  subject: string;
  content: string;
  html_body?: string;
  created_at: string;
  send_at?: string;
  sent_at?: string;
  error?: string;
  attempts?: number;
  leads?: {
    id: string;
    name: string;
    email: string;
  };
}

// Interface para configuração SMTP
interface SMTPConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para resultados do processamento
interface EmailResult {
  id: string;
  status: string;
  to: string;
  error?: string;
}

/**
 * Essa função executa o worker de e-mail
 */
async function processEmails(limit: number) {
  // Cria cliente Supabase com a chave de serviço (necessária para funcionalidades administrativas)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('Iniciando processamento de e-mails...');
  
  try {
    // 1. Busca configuração SMTP
    const { data: smtpConfig, error: smtpError } = await supabase
      .from('smtp_config')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (smtpError || !smtpConfig) {
      console.error('Configuração SMTP não encontrada:', smtpError);
      return { error: 'Configuração SMTP não encontrada' };
    }
    
    console.log('Configuração SMTP encontrada');

    // 2. Processa gatilhos de aniversário
    const birthdayCount = await processBirthdayTriggers(supabase);
    console.log(`${birthdayCount} e-mails de aniversário agendados`);
    
    // 3. Busca e-mails pendentes
    const { data: pendingEmails, error: emailsError } = await supabase
      .from('email_queue')
      .select(`
        *,
        leads(id, name, email)
      `)
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (emailsError) {
      console.error('Erro ao buscar e-mails pendentes:', emailsError);
      return { error: 'Erro ao buscar e-mails pendentes' };
    }
    
    console.log(`${pendingEmails?.length || 0} e-mails pendentes encontrados`);
    
    if (!pendingEmails || pendingEmails.length === 0) {
      return { processed: 0 };
    }
    
    // 4. Configura o transportador de e-mail
    console.log('Configurando SMTP com:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.username
    });
    
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false, // TLS requer secure: false
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      tls: {
        // Não rejeita certificados não autorizados
        rejectUnauthorized: false
      },
      logger: true, // Habilita logs mais detalhados
      debug: true // Habilita logs de debug
    });
    
    // Verificar conexão SMTP antes de enviar
    try {
      await transporter.verify();
      console.log('Conexão SMTP verificada com sucesso');
      
      // Registrar IP da função para diagnóstico
      try {
        const ipResponse = await fetch('https://ipinfo.io/json');
        const ipData = await ipResponse.json();
        console.log('Função executando a partir do IP:', ipData.ip);
        console.log('IP completo info:', ipData);
      } catch (ipError) {
        console.error('Erro ao verificar IP da função:', ipError);
      }
    } catch (verifyError) {
      console.error('Erro ao verificar conexão SMTP:', verifyError);
      return { error: `Erro na conexão SMTP: ${verifyError.message}` };
    }
    
    // 5. Processa cada e-mail
    const results: EmailResult[] = [];
    for (const email of pendingEmails as EmailQueueItem[]) {
      try {
        console.log(`Enviando e-mail para ${email.to}`);
        
        // Envia o e-mail
        await transporter.sendMail({
          from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
          to: email.to,
          subject: email.subject,
          html: email.content,
        });
        
        // Atualiza status para enviado
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            error: null
          })
          .eq('id', email.id);
        
        console.log(`E-mail ${email.id} enviado com sucesso`);
        
        results.push({
          id: email.id,
          status: 'sent',
          to: email.to,
        });
      } catch (error) {
        console.error(`Erro ao enviar e-mail ${email.id}:`, error);
        
        // Atualiza status para falha com mensagem de erro
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            updated_at: new Date().toISOString(),
            attempts: (email.attempts || 0) + 1
          })
          .eq('id', email.id);
          
        results.push({
          id: email.id,
          status: 'failed',
          to: email.to,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return { success: true, processed: pendingEmails.length, results };
  } catch (error) {
    console.error('Erro no processamento de e-mails:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Processa gatilhos de aniversário
 */
async function processBirthdayTriggers(supabase: any) {
  try {
    // Obtém a data de hoje no formato MM-DD (ignorando o ano)
    const today = new Date();
    const monthDay = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Encontra leads com aniversário hoje
    const { data: birthdayLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .filter('birthday', 'ilike', `%${monthDay}`);
    
    if (leadsError) throw leadsError;
    
    // Obtém templates de e-mail de aniversário ativos
    const { data: birthdayTemplates, error: templatesError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('trigger_type', 'birthday')
      .eq('is_active', true);
    
    if (templatesError) throw templatesError;
    
    if (!birthdayLeads?.length || !birthdayTemplates?.length) {
      return 0;
    }
    
    // Agenda e-mails de aniversário
    let sentCount = 0;
    const emailQueue: any[] = [];
    
    for (const lead of birthdayLeads) {
      for (const template of birthdayTemplates) {
        // Substitui variáveis no assunto e conteúdo
        const subject = template.subject.replace(/{{name}}/g, lead.name || '');
        const content = template.content
          .replace(/{{name}}/g, lead.name || '')
          .replace(/{{birthday}}/g, formatDate(lead.birthday || ''));
        
        emailQueue.push({
          lead_id: lead.id,
          template_id: template.id,
          status: 'pending',
          to: lead.email,
          subject: subject,
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        sentCount++;
      }
    }
    
    // Insere todos os e-mails na fila
    if (emailQueue.length > 0) {
      const { error: queueError } = await supabase
        .from('email_queue')
        .insert(emailQueue);
      
      if (queueError) throw queueError;
    }
    
    // Atualiza a última execução do gatilho
    await supabase
      .from('email_triggers')
      .update({ 
        last_run: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('trigger_type', 'birthday');
    
    return sentCount;
  } catch (error) {
    console.error('Erro ao processar gatilhos de aniversário:', error);
    return 0;
  }
}

/**
 * Formata uma data para exibição
 */
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (error) {
    return dateString;
  }
}

// Manipulador HTTP para a Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verifica se é uma requisição agendada ou manual
  const isScheduled = req.headers.get('Authorization') === `Bearer ${Deno.env.get('FUNCTION_SECRET')}`;
  let isManualRequest = false;
  // Definindo o tipo do requestBody
  let requestBody: { source?: string; limit?: number } = {};

  // Verifica se temos um corpo na requisição
  if (req.method === 'POST') {
    try {
      requestBody = await req.json();
      // Verificar se é uma requisição manual
      isManualRequest = requestBody.source === 'manual';
    } catch (error) {
      // Ignora erros de parsing do corpo da requisição
      console.log('Erro ao fazer parse do corpo da requisição:', error);
    }
  }
  
  // Aceita requisições programadas OU manuais autenticadas (mesmo sem ser admin)
  if (!isScheduled && !isManualRequest) {
    // Para requisições não autorizadas, verifica token de autenticação
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Autorização necessária');
      }
      
      // Extrai token do cabeçalho Authorization
      const token = authHeader.replace('Bearer ', '');
      
      // Cria cliente Supabase
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Verifica sessão
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verifica se o usuário tem permissão de admin - apenas para requisições não manuais
      if (!isManualRequest) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!profile || profile.role !== 'admin') {
          throw new Error('Permissão de administrador necessária');
        }
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado', details: error instanceof Error ? error.message : String(error) }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  try {
    // Extrai o limite de emails a serem processados do corpo da requisição
    const limit = typeof requestBody.limit === 'number' ? requestBody.limit : 50;
    
    // Processa os e-mails
    const result = await processEmails(limit);
    
    // Retorna o resultado
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Email worker error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 