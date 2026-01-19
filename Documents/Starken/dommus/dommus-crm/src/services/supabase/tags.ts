import { toast } from "sonner";
import { supabase } from "./config";
import type { Database } from "@/types/supabase";

type Tag = Database['public']['Tables']['tags']['Row'];
type NewTag = Database['public']['Tables']['tags']['Insert'];
type UpdateTag = Database['public']['Tables']['tags']['Update'];

export const getTags = async () => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    toast.error("Failed to load tags");
    throw error;
  }
};

export const createTag = async (tag: NewTag) => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Tag created successfully");
    return data;
  } catch (error) {
    console.error("Error creating tag:", error);
    toast.error("Failed to create tag");
    throw error;
  }
};

export const updateTag = async (id: string, updates: UpdateTag) => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Tag updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating tag:", error);
    toast.error("Failed to update tag");
    throw error;
  }
};

export const deleteTag = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Tag deleted successfully");
  } catch (error) {
    console.error("Error deleting tag:", error);
    toast.error("Failed to delete tag");
    throw error;
  }
}; 