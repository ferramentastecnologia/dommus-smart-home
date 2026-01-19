import { toast } from "sonner";
import { supabase } from "./config";
import type { Database } from "@/types/supabase";

export type EmailQueue = Database['public']['Tables']['email_queue']['Row'];
export type EmailQueueInsert = Database['public']['Tables']['email_queue']['Insert'];
export type EmailQueueUpdate = Database['public']['Tables']['email_queue']['Update'];

export const getEmailQueue = async () => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select(`
        *,
        lead:leads(name, email),
        template:email_templates(name, subject, content)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching email queue:", error);
    toast.error("Failed to load email queue");
    throw error;
  }
};

export const getPendingEmails = async () => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select(`
        *,
        lead:leads(name, email),
        template:email_templates(name, subject, content)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching pending emails:", error);
    toast.error("Failed to load pending emails");
    throw error;
  }
};

export const queueEmail = async (email: EmailQueueInsert) => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .insert([email])
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Email queued successfully");
    return data;
  } catch (error) {
    console.error("Error queueing email:", error);
    toast.error("Failed to queue email");
    throw error;
  }
};

export const updateEmailStatus = async (id: string, status: 'sent' | 'failed' | 'cancelled') => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Email status updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating email status:", error);
    toast.error("Failed to update email status");
    throw error;
  }
};

export const createEmailQueueItem = async (data: EmailQueueInsert) => {
  try {
    const { data: emailQueue, error } = await supabase
      .from('email_queue')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return emailQueue
  } catch (error: any) {
    toast.error(error.message)
    return null
  }
}

export const getEmailQueueItems = async () => {
  try {
    const { data: emailQueue, error } = await supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return emailQueue
  } catch (error: any) {
    toast.error(error.message)
    return []
  }
}

export const getEmailQueueItemsByLeadId = async (leadId: string) => {
  try {
    const { data: emailQueue, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return emailQueue
  } catch (error: any) {
    toast.error(error.message)
    return []
  }
}

export const updateEmailQueueItem = async (id: string, data: EmailQueueUpdate) => {
  try {
    const { data: emailQueue, error } = await supabase
      .from('email_queue')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return emailQueue
  } catch (error: any) {
    toast.error(error.message)
    return null
  }
}

export const deleteEmailQueueItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('email_queue')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error: any) {
    toast.error(error.message)
    return false
  }
} 