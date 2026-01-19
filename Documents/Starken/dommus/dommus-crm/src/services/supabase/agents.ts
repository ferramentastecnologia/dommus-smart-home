import { toast } from "sonner";
import { supabase } from "./config";
import type { Database } from "@/types/supabase";

type Agent = Database['public']['Tables']['agents']['Row'];
type NewAgent = Database['public']['Tables']['agents']['Insert'];
type UpdateAgent = Database['public']['Tables']['agents']['Update'];

export const getAgents = async () => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching agents:", error);
    toast.error("Failed to load agents");
    throw error;
  }
};

export const getAgent = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching agent:", error);
    toast.error("Failed to load agent");
    throw error;
  }
};

export const createAgent = async (agent: NewAgent) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Agent created successfully");
    return data;
  } catch (error) {
    console.error("Error creating agent:", error);
    toast.error("Failed to create agent");
    throw error;
  }
};

export const updateAgent = async (id: string, updates: UpdateAgent) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Agent updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating agent:", error);
    toast.error("Failed to update agent");
    throw error;
  }
};

export const deleteAgent = async (id: string) => {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Agent deleted successfully");
  } catch (error) {
    console.error("Error deleting agent:", error);
    toast.error("Failed to delete agent");
    throw error;
  }
}; 