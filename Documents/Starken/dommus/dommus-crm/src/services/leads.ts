import { supabase } from "./supabase/client";
import { LeadStatusConfig } from "@/types/crm";

/**
 * Fetches all lead status configurations from the database
 */
export async function fetchLeadStatusConfigs(): Promise<LeadStatusConfig[]> {
  const { data, error } = await supabase
    .from('lead_statuses')
    .select('*')
    .order('order_index', { ascending: true });
    
  if (error) {
    console.error("Error fetching lead status configs:", error);
    throw error;
  }
  
  return data || [];
} 