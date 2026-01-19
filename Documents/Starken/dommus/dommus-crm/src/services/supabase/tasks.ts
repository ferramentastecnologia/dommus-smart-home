import { toast } from "sonner";
import { supabase } from "./config";
import type { Database } from "@/types/supabase";

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];
type UpdateTask = Database['public']['Tables']['tasks']['Update'];

export const getTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast.error("Failed to load tasks");
    throw error;
  }
};

export const getTask = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching task:", error);
    toast.error("Failed to load task");
    throw error;
  }
};

export const createTask = async (task: NewTask) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Task created successfully");
    return data;
  } catch (error) {
    console.error("Error creating task:", error);
    toast.error("Failed to create task");
    throw error;
  }
};

export const updateTask = async (id: string, updates: UpdateTask) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    toast.success("Task updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating task:", error);
    toast.error("Failed to update task");
    throw error;
  }
};

export const deleteTask = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    toast.success("Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("Failed to delete task");
    throw error;
  }
};

export const getTasksByLead = async (leadId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching tasks for lead:", error);
    toast.error("Failed to load tasks for lead");
    throw error;
  }
}; 