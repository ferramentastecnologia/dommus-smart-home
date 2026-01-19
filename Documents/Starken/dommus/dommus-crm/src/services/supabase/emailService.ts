import { supabase } from './config';
import { toast } from 'sonner';

// URL base do Supabase para as funções Edge
const SUPABASE_URL = 'https://jlxtqlqzjcofqetrwnea.supabase.co';

/**
 * Formats a date string in a user-friendly format
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export interface EmailQueueItem {
  id: string;
  lead_id: string;
  template_id: string;
  status: 'pending' | 'sent' | 'failed';
  to: string;
  subject: string;
  content: string;
  created_at: string;
  send_at?: string;
  sent_at?: string;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  trigger_type: 'birthday' | 'new_lead' | 'meeting' | 'manual' | 'agent_new_lead_notification';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QueuedEmail {
  id: string;
  lead: Lead;
  template: EmailTemplate;
  status: 'pending' | 'sent' | 'failed';
  to: string;
  subject: string;
  content: string;
  created_at: string;
  send_at?: string;
  sent_at?: string;
  error?: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  birthday?: string;
  company?: string;
}

export interface EmailTrigger {
  id: string;
  trigger_type: 'birthday' | 'new_lead' | 'meeting';
  description: string;
  is_active: boolean;
  last_run?: string;
  created_at: string;
  updated_at: string;
}

export interface SMTPConfig {
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

/**
 * Busca emails na fila com suporte a paginação e filtros
 */
export const getEmailQueue = async (
  page = 1, 
  pageSize = 10,
  status?: 'pending' | 'sent' | 'failed',
  leadId?: string
): Promise<{
  data: EmailQueueItem[],
  count: number
}> => {
  try {
    let query = supabase
      .from('email_queue')
      .select('*, lead:leads(*), template:email_templates(*)', { count: 'exact' });
    
    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    
    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    
    // Aplicar paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error("Error fetching email queue:", error);
    throw error;
  }
};

/**
 * Fetches pending emails that need to be processed
 */
export const getPendingEmails = async (limit: number = 10): Promise<QueuedEmail[]> => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select(`
        *,
        lead:leads(*),
        template:email_templates(*)
      `)
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching pending emails:", error);
    throw error;
  }
};

/**
 * Adds an email to the queue
 */
export const queueEmail = async (
  leadId: string, 
  templateId: string, 
  to: string, 
  subject: string, 
  content: string,
  sendAt?: string
): Promise<EmailQueueItem> => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .insert([{
        lead_id: leadId,
        template_id: templateId,
        status: 'pending',
        to,
        subject,
        content,
        send_at: sendAt || new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error queueing email:", error);
    throw error;
  }
};

/**
 * Updates the status of an email in the queue
 */
export const updateEmailStatus = async (
  emailId: string, 
  status: 'pending' | 'sent' | 'failed',
  error?: string
): Promise<void> => {
  try {
    const updates: Record<string, any> = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
    }
    
    if (status === 'failed' && error) {
      updates.error = error;
    }
    
    const { error: updateError } = await supabase
      .from('email_queue')
      .update(updates)
      .eq('id', emailId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error updating email status:", error);
    throw error;
  }
};

/**
 * Fetches all email templates
 */
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw error;
  }
};

/**
 * Fetches active email templates for a specific trigger type
 */
export const getActiveTemplatesByTrigger = async (triggerType: string): Promise<EmailTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('trigger_type', triggerType)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${triggerType} templates:`, error);
    throw error;
  }
};

/**
 * Creates a new email template
 */
export const createEmailTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating email template:", error);
    throw error;
  }
};

/**
 * Updates an existing email template
 */
export const updateEmailTemplate = async (
  templateId: string, 
  templateData: Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .update({
        ...templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating email template:", error);
    throw error;
  }
};

/**
 * Deletes an email template
 */
export const deleteEmailTemplate = async (templateId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting email template:", error);
    throw error;
  }
};

/**
 * Toggles the active status of an email template
 */
export const toggleTemplateActive = async (templateId: string, isActive: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error toggling template active status:", error);
    throw error;
  }
};

/**
 * Processes triggers for birthday emails
 */
export const processBirthdayTriggers = async (): Promise<number> => {
  try {
    // Get today's date and format it as MM-DD (ignoring year)
    const today = new Date();
    const monthDay = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Find leads with birthdays today
    const { data: birthdayLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .filter('birthday', 'ilike', `%${monthDay}`);
    
    if (leadsError) throw leadsError;
    
    // Get active birthday email templates
    const birthdayTemplates = await getActiveTemplatesByTrigger('birthday');
    
    if (!birthdayLeads?.length || !birthdayTemplates.length) {
      return 0;
    }
    
    // Queue birthday emails
    let sentCount = 0;
    for (const lead of birthdayLeads) {
      for (const template of birthdayTemplates) {
        // Replace variables in subject and content
        const subject = template.subject.replace(/{{name}}/g, lead.name);
        const content = template.content
          .replace(/{{name}}/g, lead.name)
          .replace(/{{birthday}}/g, formatDate(lead.birthday || ''));
        
        await queueEmail(
          lead.id,
          template.id,
          lead.email,
          subject,
          content
        );
        
        sentCount++;
      }
    }
    
    // Update the trigger last run time
    await updateTriggerLastRun('birthday');
    
    return sentCount;
  } catch (error) {
    console.error("Error processing birthday triggers:", error);
    throw error;
  }
};

/**
 * Processes triggers for new lead emails
 */
export const processNewLeadTriggers = async (leadId: string): Promise<number> => {
  try {
    // Get the new lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (leadError) throw leadError;
    
    // Get active new lead email templates
    const newLeadTemplates = await getActiveTemplatesByTrigger('new_lead');
    
    if (!lead || !newLeadTemplates.length) {
      return 0;
    }
    
    // Skip if lead has no email
    if (!lead.email) {
      console.log(`Lead ${leadId} has no email, skipping email notifications`);
      return 0;
    }
    
    // Queue new lead emails
    let sentCount = 0;
    for (const template of newLeadTemplates) {
      // Replace variables in subject and content
      const subject = template.subject.replace(/{{name}}/g, lead.name);
      const content = template.content
        .replace(/{{name}}/g, lead.name)
        .replace(/{{signup_date}}/g, formatDate(lead.created_at || ''));
      
      await queueEmail(
        lead.id,
        template.id,
        lead.email,
        subject,
        content
      );
      
      sentCount++;
    }
    
    // Update the trigger last run time
    await updateTriggerLastRun('new_lead');
    
    return sentCount;
  } catch (error) {
    console.error("Error processing new lead triggers:", error);
    throw error;
  }
};

/**
 * Processes triggers for meeting confirmation emails
 */
export const processMeetingTriggers = async (leadId: string, meetingData: any): Promise<number> => {
  try {
    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (leadError) throw leadError;
    
    // Get active meeting email templates
    const meetingTemplates = await getActiveTemplatesByTrigger('meeting');
    
    if (!lead || !meetingTemplates.length) {
      return 0;
    }
    
    // Skip if lead has no email
    if (!lead.email) {
      console.log(`Lead ${leadId} has no email, skipping meeting notifications`);
      return 0;
    }
    
    // Queue meeting emails
    let sentCount = 0;
    for (const template of meetingTemplates) {
      // Replace variables in subject and content
      const subject = template.subject.replace(/{{name}}/g, lead.name);
      const content = template.content
        .replace(/{{name}}/g, lead.name)
        .replace(/{{date}}/g, formatDate(meetingData.date || ''))
        .replace(/{{time}}/g, meetingData.time || '')
        .replace(/{{link}}/g, meetingData.link || '');
      
      await queueEmail(
        lead.id,
        template.id,
        lead.email,
        subject,
        content,
        // Send the email 24 hours before the meeting
        new Date(new Date(meetingData.date).getTime() - 24 * 60 * 60 * 1000).toISOString()
      );
      
      sentCount++;
    }
    
    // Update the trigger last run time
    await updateTriggerLastRun('meeting');
    
    return sentCount;
  } catch (error) {
    console.error("Error processing meeting triggers:", error);
    throw error;
  }
};

/**
 * Fetches all email triggers
 */
export const getEmailTriggers = async (): Promise<EmailTrigger[]> => {
  try {
    const { data, error } = await supabase
      .from('email_triggers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching email triggers:", error);
    throw error;
  }
};

/**
 * Toggles the active status of an email trigger
 */
export const toggleTriggerActive = async (triggerId: string, isActive: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_triggers')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', triggerId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error toggling trigger active status:", error);
    throw error;
  }
};

const updateTriggerLastRun = async (triggerType: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_triggers')
      .update({ 
        last_run: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('trigger_type', triggerType);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error updating ${triggerType} trigger last run:`, error);
    throw error;
  }
};

/**
 * Fetches SMTP configuration
 */
export const getSMTPConfig = async (): Promise<SMTPConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('smtp_config')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      // If no config exists, return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching SMTP config:", error);
    throw error;
  }
};

/**
 * Updates SMTP configuration
 */
export const updateSMTPConfig = async (config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  try {
    // Check if a config already exists
    const existingConfig = await getSMTPConfig();
    
    if (existingConfig) {
      // Update existing config
      const { error } = await supabase
        .from('smtp_config')
        .update({ 
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);
      
      if (error) throw error;
    } else {
      // Create new config
      const { error } = await supabase
        .from('smtp_config')
        .insert([{ 
          ...config,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error updating SMTP config:", error);
    throw error;
  }
};

/**
 * Send a one-time email campaign to multiple leads
 * @param subject - Email subject
 * @param content - Email content (HTML)
 * @param leadIds - Array of lead IDs to send the email to
 * @returns Promise resolving to the number of emails queued
 */
export const sendEmailCampaign = async (
  subject: string,
  content: string,
  leadIds: string[]
): Promise<number> => {
  try {
    console.log("Iniciando envio de campanha:", { subject, leadIds });
    
    // Get the leads we need to email
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, email, company')
      .in('id', leadIds)
      .not('email', 'is', null);
    
    if (leadsError) {
      console.error("Erro ao buscar leads:", leadsError);
      throw leadsError;
    }
    
    if (!leads || leads.length === 0) {
      console.log("Nenhum lead encontrado com os IDs fornecidos ou todos os leads selecionados não têm email");
      return 0;
    }
    
    // Filtra novamente para garantir que todos os leads têm email (proteção extra)
    const leadsWithEmail = leads.filter(lead => lead.email && lead.email.trim() !== '');
    
    if (leadsWithEmail.length === 0) {
      console.log("Nenhum lead com email válido encontrado entre os selecionados");
      return 0;
    }
    
    console.log(`Encontrados ${leadsWithEmail.length} leads com email válido para envio`);
    
    // Criar um template específico para esta campanha
    const now = new Date().toISOString();
    const campaignName = `Campaign: ${subject.substring(0, 30)}${subject.length > 30 ? '...' : ''} - ${now}`;
    
    console.log("Criando template para campanha:", campaignName);
    
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .insert({
        name: campaignName,
        subject: subject,
        content: content,
        trigger_type: 'manual', // Alterado para 'manual' em vez de 'new_lead'
        is_active: true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (templateError) {
      console.error('Erro ao criar template para campanha:', templateError);
      throw templateError;
    }
    
    console.log("Template criado com sucesso:", template.id);
    
    // Vamos inserir os emails diretamente com marcação manual na timeline
    let successCount = 0;
    
    for (const lead of leadsWithEmail) {
      try {
        if (!lead.email) {
          console.log(`Lead ${lead.id} sem email, pulando...`);
          continue;
        }
        
        // Personalizar o email
        const personalizedSubject = subject
          .replace(/{{name}}/g, lead.name || '')
          .replace(/{{company}}/g, lead.company || '')
          .replace(/{{email}}/g, lead.email || '');
        
        const personalizedContent = content
          .replace(/{{name}}/g, lead.name || '')
          .replace(/{{company}}/g, lead.company || '')
          .replace(/{{email}}/g, lead.email || '');
        
        // Log detalhado do que vamos inserir
        console.log('Tentando inserir email na fila:', {
          lead_id: lead.id,
          template_id: template.id,
          status: 'pending',
          to: lead.email,
          subject: personalizedSubject,
          // Mostrar primeiros 50 caracteres do conteúdo para debugging
          content_preview: personalizedContent.substring(0, 50) + '...'
        });
        
        // 1. Inserir o email na fila
        const { data: emailResult, error: emailError } = await supabase
          .from('email_queue')
          .insert({
            lead_id: lead.id,
            template_id: template.id,
            status: 'pending',
            to: lead.email,
            subject: personalizedSubject,
            content: personalizedContent
          })
          .select('id')
          .single();
        
        if (emailError) {
          console.error(`Erro ao inserir email para ${lead.email}:`, emailError);
          console.error('Detalhes completos do erro:', JSON.stringify(emailError));
          continue;
        }
        
        console.log(`Email inserido com sucesso, ID: ${emailResult.id}`);
        
        // 2. Forçar inserção direta na timeline com evento valid 'email_queued'
        const { error: timelineError } = await supabase
          .from('lead_timeline')
          .insert({
            lead_id: lead.id,
            event_type: 'email_queued', 
            event_data: {
              email_id: emailResult.id,
              subject: personalizedSubject
            }
          });
        
        if (timelineError) {
          console.error(`Erro ao criar entrada na timeline para ${lead.email}:`, timelineError);
          // Continuar mesmo com erro na timeline
        }
        
        successCount++;
        console.log(`Email ${successCount} inserido para ${lead.email}`);
      } catch (error) {
        console.error(`Erro inesperado para ${lead.email}:`, error);
      }
    }
    
    console.log(`Campanha concluída: ${successCount} emails inseridos`);
    return successCount;
  } catch (error) {
    console.error("Erro enviando campanha de email:", error);
    throw error;
  }
};

/**
 * Processa a fila de emails pendentes manualmente
 * @param limit - Número máximo de emails a serem processados
 * @returns Resultado do processamento
 */
export const processEmailQueue = async (limit = 10): Promise<{ success: boolean, processed: number, errors?: any[] }> => {
  try {
    // Get the current authentication token
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token || '';
    
    // We might have configured a service key in the environment
    // Supabase doesn't allow access to service keys directly from the frontend,
    // so we're using the Edge Function to do this safely
    
    // Call the Supabase Edge Function to process emails
    const response = await fetch(`${SUPABASE_URL}/functions/v1/email-worker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      // Adding a body to identify that the request comes from the frontend
      body: JSON.stringify({
        source: 'manual',
        limit: limit
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error calling email worker function:', errorData);
      toast.error('Error processing email queue');
      return { success: false, processed: 0, errors: [errorData] };
    }

    const result = await response.json();
    toast.success(`Email queue processing started successfully!`);
    
    return {
      success: result.success || true,
      processed: result.processed || 0,
      errors: result.error ? [result.error] : undefined
    };
  } catch (error) {
    console.error('Error processing email queue:', error);
    toast.error('Error processing email queue');
    return { success: false, processed: 0, errors: [error] };
  }
}; 