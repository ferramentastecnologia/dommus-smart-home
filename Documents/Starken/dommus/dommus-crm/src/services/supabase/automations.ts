import { toast } from "sonner";
import { supabase } from "./config";
import type { Database } from "@/types/supabase";
import type { Lead } from "@/types/crm";

export const checkAutomationsForStatus = async (lead: Lead) => {
  try {
    // Get email templates for the lead's status
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('trigger_status', lead.status);

    if (error) throw error;

    // If there are templates, queue emails
    if (templates && templates.length > 0) {
      const emailPromises = templates.map(template => 
        supabase
          .from('email_queue')
          .insert([{
            lead_id: lead.id,
            template_id: template.id,
            status: 'pending',
            to: lead.email,
            subject: template.subject.replace('{name}', lead.name),
            content: template.content.replace('{name}', lead.name),
          }])
      );

      await Promise.all(emailPromises);
      console.log('Automated emails queued for lead:', lead.id);
    }

    return templates;
  } catch (error) {
    console.error("Error checking automations:", error);
    toast.error("Failed to process automations");
    throw error;
  }
}; 