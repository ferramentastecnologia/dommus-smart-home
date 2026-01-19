import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/services/supabase/client";
import { LeadStatusConfig, TaskStatusConfig } from "@/types/crm";
import { ClientStatusConfig } from "@/types/Client";
import { toast } from "sonner";
import { initStatusTables } from "@/services/supabase/initStatusTables";

interface StatusContextType {
  leadStatuses: LeadStatusConfig[];
  taskStatuses: TaskStatusConfig[];
  clientStatuses: ClientStatusConfig[];
  isLoading: boolean;
  error: Error | null;
  refreshStatuses: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const [leadStatuses, setLeadStatuses] = useState<LeadStatusConfig[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusConfig[]>([]);
  const [clientStatuses, setClientStatuses] = useState<ClientStatusConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatuses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First, ensure we have default statuses if tables are empty
      await initStatusTables();

      // Then fetch lead statuses
      const { data: leadStatusData, error: leadStatusError } = await supabase
        .from("lead_statuses")
        .select("*")
        .order("order_index");

      if (leadStatusError) throw new Error(leadStatusError.message);
      
      // Fetch task statuses
      const { data: taskStatusData, error: taskStatusError } = await supabase
        .from("task_statuses")
        .select("*")
        .order("order_index");

      if (taskStatusError) throw new Error(taskStatusError.message);
      
      // Fetch client statuses
      const { data: clientStatusData, error: clientStatusError } = await supabase
        .from("client_statuses")
        .select("*")
        .order("order_index");

      if (clientStatusError) throw new Error(clientStatusError.message);

      setLeadStatuses(leadStatusData || []);
      setTaskStatuses(taskStatusData || []);
      setClientStatuses(clientStatusData || []);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch statuses"));
      toast.error("Failed to load status configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const refreshStatuses = async () => {
    await fetchStatuses();
  };

  const value = {
    leadStatuses,
    taskStatuses,
    clientStatuses,
    isLoading,
    error,
    refreshStatuses,
  };

  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error("useStatus must be used within a StatusProvider");
  }
  return context;
}; 