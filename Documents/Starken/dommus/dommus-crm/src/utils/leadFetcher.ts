import { Lead, Agent } from "@/types/crm";
import { supabase } from "@/services/supabase/client";

/**
 * Fetch lead data by ID
 */
export const fetchLeadById = async (id: string | undefined) => {
  if (!id) {
    throw new Error("Lead ID not provided");
  }
  
  try {
    console.log("Fetching lead with ID:", id);
    const leadData = await getLead(id);
    console.log("Lead found:", leadData);
    
    if (!leadData) {
      throw new Error("Lead not found");
    }
    
    return leadData;
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    throw error;
  }
};

/**
 * Initialize edited lead data from lead
 */
export const initializeEditedLead = (leadData: Lead): Partial<Lead> => {
  return {
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone || "",
    company: leadData.company || "",
    position: leadData.position || "",
    address: leadData.address || "",
    website: leadData.website || ""
  };
};

/**
 * Load agents list
 */
export const loadAgentsList = async () => {
  try {
    const agentsList = await getAgents();
    return agentsList.map(agent => ({ id: agent.id, name: agent.name }));
  } catch (error) {
    console.error("Error loading agents:", error);
    throw error;
  }
};

export async function getLead(leadId: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*');

  if (error) throw error;
  return data;
}
