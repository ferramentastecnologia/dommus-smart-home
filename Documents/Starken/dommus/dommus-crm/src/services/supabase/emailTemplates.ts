import { toast } from "sonner";
import { supabase } from "./config";

// Use the existing type definitions
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  trigger_type?: string;
  created_by: string;
  created_at: string;
};

type NewEmailTemplate = Omit<EmailTemplate, 'id' | 'created_at'>;
type UpdateEmailTemplate = Partial<EmailTemplate>;

/**
 * Fetches all email templates
 */
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email templates:', error);
      toast.error("Failed to load email templates");
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmailTemplates:', error);
    throw error;
  }
};

/**
 * Fetches a single email template by ID
 */
export const getEmailTemplateById = async (id: string): Promise<EmailTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching email template:', error);
      toast.error("Failed to load email template");
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getEmailTemplateById:', error);
    throw error;
  }
};

/**
 * Creates a new email template
 */
export const createEmailTemplate = async (template: NewEmailTemplate): Promise<EmailTemplate> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      console.error('Error creating email template:', error);
      toast.error("Failed to create email template");
      throw error;
    }

    toast.success("Email template created successfully");
    return data;
  } catch (error) {
    console.error('Error in createEmailTemplate:', error);
    throw error;
  }
};

/**
 * Updates an existing email template
 */
export const updateEmailTemplate = async (id: string, updates: UpdateEmailTemplate): Promise<EmailTemplate> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email template:', error);
      toast.error("Failed to update email template");
      throw error;
    }

    toast.success("Email template updated successfully");
    return data;
  } catch (error) {
    console.error('Error in updateEmailTemplate:', error);
    throw error;
  }
};

/**
 * Deletes an email template
 */
export const deleteEmailTemplate = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting email template:', error);
      toast.error("Failed to delete email template");
      throw error;
    }
    
    toast.success("Email template deleted successfully");
  } catch (error) {
    console.error('Error in deleteEmailTemplate:', error);
    throw error;
  }
};

/**
 * Gets email templates by trigger type
 */
export const getTemplatesByTrigger = async (triggerType: string): Promise<EmailTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('trigger_type', triggerType);

    if (error) {
      console.error('Error fetching templates by trigger:', error);
      toast.error("Failed to load templates by trigger");
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTemplatesByTrigger:', error);
    throw error;
  }
}; 