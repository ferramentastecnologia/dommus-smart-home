import { supabase } from "@/services/supabase/client";
import { LeadStatusConfig, TaskStatusConfig } from "@/types/crm";
import { toast } from "sonner";

// Default lead statuses with colors and order
const defaultLeadStatuses: Omit<LeadStatusConfig, "id">[] = [
  {
    name: "New",
    color: "#3B82F6", // Blue
    description: "Lead has just been created",
    order_index: 1,
    is_default: true,
    is_converted: false,
    is_discarded: false
  },
  {
    name: "Contacted",
    color: "#8B5CF6", // Purple
    description: "Initial contact has been made",
    order_index: 2,
    is_default: false,
    is_converted: false,
    is_discarded: false
  },
  {
    name: "Qualified",
    color: "#6366F1", // Indigo
    description: "Lead fits our target customer profile",
    order_index: 3,
    is_default: false,
    is_converted: false,
    is_discarded: false
  },
  {
    name: "Proposal",
    color: "#F97316", // Orange
    description: "Proposal has been sent",
    order_index: 4,
    is_default: false,
    is_converted: false,
    is_discarded: false
  },
  {
    name: "Negotiation",
    color: "#EAB308", // Yellow
    description: "Negotiating terms",
    order_index: 5,
    is_default: false,
    is_converted: false,
    is_discarded: false
  },
  {
    name: "Won",
    color: "#22C55E", // Green
    description: "Deal has been closed successfully",
    order_index: 6,
    is_default: false,
    is_converted: true,
    is_discarded: false
  },
  {
    name: "Lost",
    color: "#EF4444", // Red
    description: "Deal has been lost",
    order_index: 7,
    is_default: false,
    is_converted: false,
    is_discarded: true
  }
];

// Default task statuses with colors and order
const defaultTaskStatuses: Omit<TaskStatusConfig, "id">[] = [
  {
    name: "Pending",
    color: "#EAB308", // Yellow
    description: "Task has not been started yet",
    order_index: 1,
    is_default: true,
    is_completed: false,
    is_canceled: false
  },
  {
    name: "In Progress",
    color: "#3B82F6", // Blue
    description: "Task is currently being worked on",
    order_index: 2,
    is_default: false,
    is_completed: false,
    is_canceled: false
  },
  {
    name: "Completed",
    color: "#22C55E", // Green
    description: "Task has been completed",
    order_index: 3,
    is_default: false,
    is_completed: true,
    is_canceled: false
  }
];

// Default client statuses with colors and order
const defaultClientStatuses = [
  {
    name: "New",
    color: "#3B82F6", // Blue
    description: "New client",
    order_index: 1,
    is_default: true
  },
  {
    name: "Active",
    color: "#10B981", // Green
    description: "Active client",
    order_index: 2,
    is_default: false
  },
  {
    name: "Inactive",
    color: "#F59E0B", // Yellow
    description: "Inactive client",
    order_index: 3,
    is_default: false
  },
  {
    name: "Former",
    color: "#8B5CF6", // Purple
    description: "Former client",
    order_index: 4,
    is_default: false
  }
];

// Initialize the lead statuses if they don't exist
export const initLeadStatuses = async (): Promise<void> => {
  try {
    // Check if table already has data
    const { data: existing, error: checkError } = await supabase
      .from('lead_statuses')
      .select('id')
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If there are no statuses yet, insert the default ones
    if (!existing || existing.length === 0) {
      console.log("Initializing lead statuses with default values");
      const { error } = await supabase
        .from('lead_statuses')
        .insert(defaultLeadStatuses);
      
      if (error) throw error;
      console.log("Lead statuses initialized successfully");
    } else {
      console.log("Lead statuses already exist, skipping initialization");
    }
  } catch (error) {
    console.error("Error initializing lead statuses:", error);
    toast.error("Failed to initialize lead statuses");
  }
};

// Initialize the task statuses if they don't exist
export const initTaskStatuses = async (): Promise<void> => {
  try {
    // Check if table already has data
    const { data: existing, error: checkError } = await supabase
      .from('task_statuses')
      .select('id')
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If there are no statuses yet, insert the default ones
    if (!existing || existing.length === 0) {
      console.log("Initializing task statuses with default values");
      const { error } = await supabase
        .from('task_statuses')
        .insert(defaultTaskStatuses);
      
      if (error) throw error;
      console.log("Task statuses initialized successfully");
    } else {
      console.log("Task statuses already exist, skipping initialization");
    }
  } catch (error) {
    console.error("Error initializing task statuses:", error);
    toast.error("Failed to initialize task statuses");
  }
};

// Initialize the client statuses if they don't exist
export const initClientStatuses = async (): Promise<void> => {
  try {
    // Check if table already has data
    const { data: existing, error: checkError } = await supabase
      .from('client_statuses')
      .select('id')
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If there are no statuses yet, insert the default ones
    if (!existing || existing.length === 0) {
      console.log("Initializing client statuses with default values");
      const { error } = await supabase
        .from('client_statuses')
        .insert(defaultClientStatuses);
      
      if (error) throw error;
      console.log("Client statuses initialized successfully");
    } else {
      console.log("Client statuses already exist, skipping initialization");
    }
  } catch (error) {
    console.error("Error initializing client statuses:", error);
    toast.error("Failed to initialize client statuses");
  }
};

// Initialize all status tables
export const initStatusTables = async (): Promise<void> => {
  await initLeadStatuses();
  await initTaskStatuses();
  await initClientStatuses();
}; 