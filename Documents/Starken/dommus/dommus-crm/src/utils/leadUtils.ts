import { toast } from "sonner";
import { Lead, Task } from "@/types/crm";
import { supabase } from "@/services/supabase/client";

/**
 * Save lead edit changes
 */
export const saveLeadEdit = async (lead: Lead, editedLead: Partial<Lead>) => {
  try {
    await updateLead(lead.id, editedLead);
    
    const updatedLead = {
      ...lead,
      ...editedLead
    };
    
    toast.success("Lead information updated successfully");
    return updatedLead;
  } catch (error) {
    toast.error("Error updating lead information");
    console.error(error);
    throw error;
  }
};

/**
 * Add a note to lead history
 */
export const addNoteToLead = async (lead: Lead, noteText: string) => {
  if (!noteText.trim() || !lead) return null;
  
  try {
    const updatedHistory = [
      ...(lead.history || []),
      {
        id: Date.now().toString(),
        action: "Note added",
        date: new Date(),
        description: noteText
      }
    ];
    
    await updateLead(lead.id, { 
      history: updatedHistory,
      updatedAt: new Date()
    });
    
    const updatedLead = {
      ...lead,
      history: updatedHistory,
      updatedAt: new Date()
    };
    
    toast.success("Note added successfully");
    return updatedLead;
  } catch (error) {
    toast.error("Error adding note");
    console.error(error);
    throw error;
  }
};

/**
 * Remove a note from lead history
 */
export const removeNoteFromLead = async (lead: Lead, noteId: string) => {
  if (!lead) return null;
  
  try {
    const updatedHistory = lead.history?.filter(item => item.id !== noteId) || [];
    
    await updateLead(lead.id, { 
      history: updatedHistory,
      updatedAt: new Date()
    });
    
    const updatedLead = {
      ...lead,
      history: updatedHistory,
      updatedAt: new Date()
    };
    
    toast.success("Note removed successfully");
    return updatedLead;
  } catch (error) {
    toast.error("Error removing note");
    console.error(error);
    throw error;
  }
};

/**
 * Add a task for the lead
 */
export const addTaskForLead = async (
  lead: Lead, 
  taskDetails: { description: string; agentId: string; dueDate: string }
) => {
  if (!taskDetails.description || !taskDetails.agentId || !taskDetails.dueDate || !lead) {
    toast.error("Fill in all task fields");
    return null;
  }
  
  try {
    const dueDate = new Date(taskDetails.dueDate);
    
    await createTask({
      leadId: lead.id,
      agentId: taskDetails.agentId,
      description: taskDetails.description,
      type: "Other",
      status: "Pending",
      dueDate
    });
    
    // Add task to lead history
    const updatedHistory = [
      ...(lead.history || []),
      {
        id: Date.now().toString(),
        action: "Task created",
        date: new Date(),
        description: `New task: ${taskDetails.description}`
      }
    ];
    
    await updateLead(lead.id, { 
      history: updatedHistory,
      updatedAt: new Date()
    });
    
    const updatedLead = {
      ...lead,
      history: updatedHistory,
      updatedAt: new Date()
    };
    
    toast.success("Task added successfully");
    return updatedLead;
  } catch (error) {
    toast.error("Error adding task");
    console.error(error);
    throw error;
  }
};

export async function updateLead(leadId: string, data: Partial<Lead>) {
  const { error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', leadId);

  if (error) throw error;
}

export async function createTask(task: Partial<Task>) {
  const { error } = await supabase
    .from('tasks')
    .insert(task);

  if (error) throw error;
}
