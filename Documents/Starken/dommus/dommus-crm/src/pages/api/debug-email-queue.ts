import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/services/supabase/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 1. Verificar a estrutura da tabela email_queue
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { 
        table_name: 'email_queue' 
      });
    
    if (tableError) {
      return res.status(500).json({
        error: 'Erro ao obter informações da tabela',
        details: tableError
      });
    }
    
    // 2. Verificar se existem emails na fila
    const { data: emailCount, error: countError } = await supabase
      .from('email_queue')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      return res.status(500).json({
        error: 'Erro ao contar emails',
        details: countError
      });
    }
    
    // 3. Buscar alguns emails recentes
    const { data: recentEmails, error: emailsError } = await supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (emailsError) {
      return res.status(500).json({
        error: 'Erro ao buscar emails recentes',
        details: emailsError
      });
    }
    
    // 4. Verificar se a função de processamento está configurada
    let functionStatus = 'Não detectada';
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-email-queue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`
          }
        }
      );
      
      if (response.ok) {
        functionStatus = 'Função de processamento está ativa';
      } else {
        functionStatus = `Erro na função: ${await response.text()}`;
      }
    } catch (err) {
      functionStatus = `Erro ao chamar a função: ${err}`;
    }
    
    // 5. Testar inserção de email na fila
    const testEmail = {
      lead_id: '00000000-0000-0000-0000-000000000000', // ID fictício
      template_id: '00000000-0000-0000-0000-000000000000', // ID fictício
      status: 'pending',
      to: 'teste@example.com',
      subject: 'Teste diagnóstico',
      content: '<p>Teste de diagnóstico da fila de emails</p>'
    };
    
    const { data: testResult, error: testError } = await supabase
      .from('email_queue')
      .insert([testEmail])
      .select()
      .single();
    
    // Remover o email de teste logo após o teste
    if (testResult?.id) {
      await supabase
        .from('email_queue')
        .delete()
        .eq('id', testResult.id);
    }
    
    // Resultado final
    return res.status(200).json({
      table_structure: tableInfo,
      email_count: emailCount?.count || 0,
      recent_emails: recentEmails,
      function_status: functionStatus,
      test_insertion: testError ? { error: testError } : { success: true }
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: error
    });
  }
} 