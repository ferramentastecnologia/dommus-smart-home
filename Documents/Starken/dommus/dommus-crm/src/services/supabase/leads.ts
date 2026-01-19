import { toast } from "sonner";
import { supabase } from "./client";

// Define basic types without depending on the generated Database type
type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status_id?: string;
  source_id?: string;
  agent_id?: string;
  position?: string;
  address?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
};

type NewLead = Omit<Lead, 'id'> & { id?: string };
type UpdateLead = Partial<Lead>;

export const getLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    toast.error("Failed to load leads");
    throw error;
  }
};

export const getLead = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching lead:", error);
    toast.error("Failed to load lead");
    throw error;
  }
};

export const createLead = async (lead: NewLead) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Lead created successfully");
    return data;
  } catch (error) {
    console.error("Error creating lead:", error);
    toast.error("Failed to create lead");
    throw error;
  }
};

export const updateLead = async (id: string, updates: UpdateLead) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Lead updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating lead:", error);
    toast.error("Failed to update lead");
    throw error;
  }
};

export const deleteLead = async (id: string) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Lead deleted successfully");
  } catch (error) {
    console.error("Error deleting lead:", error);
    toast.error("Failed to delete lead");
    throw error;
  }
};

export const getLeadTimeline = async (leadId: string) => {
  try {
    const { data, error } = await supabase
      .from('lead_timeline')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error details:", error);
      throw error;
    }
    
    console.log("Timeline data fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching lead timeline:", error);
    toast.error("Failed to load lead timeline");
    throw error;
  }
}; 