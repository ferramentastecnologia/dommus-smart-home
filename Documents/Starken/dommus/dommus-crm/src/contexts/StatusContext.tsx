import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/services/supabase/client";
import { LeadStatusConfig, TaskStatusConfig } from "@/types/crm";
import { ClientStatusConfig } from "@/types/Client";

// Fallback status padrão caso o banco não tenha dados
const fallbackLeadStatuses: LeadStatusConfig[] = [
  { id: "1", name: "Novo", color: "#3b82f6", order_index: 0, is_default: true, is_converted: false, is_discarded: false },
  { id: "2", name: "Qualificado", color: "#8b5cf6", order_index: 1, is_default: false, is_converted: false, is_discarded: false },
  { id: "3", name: "Em Contato", color: "#f59e0b", order_index: 2, is_default: false, is_converted: false, is_discarded: false },
  { id: "4", name: "Proposta", color: "#06b6d4", order_index: 3, is_default: false, is_converted: false, is_discarded: false },
  { id: "5", name: "Convertido", color: "#22c55e", order_index: 4, is_default: false, is_converted: true, is_discarded: false },
  { id: "6", name: "Perdido", color: "#ef4444", order_index: 5, is_default: false, is_converted: false, is_discarded: true },
];

const fallbackTaskStatuses: TaskStatusConfig[] = [
  { id: "1", name: "Pendente", color: "#f59e0b", order_index: 0, is_default: true },
  { id: "2", name: "Em Andamento", color: "#3b82f6", order_index: 1, is_default: false },
  { id: "3", name: "Concluída", color: "#22c55e", order_index: 2, is_default: false },
];

const fallbackClientStatuses: ClientStatusConfig[] = [
  { id: "1", name: "Ativo", color: "#22c55e", order_index: 0, is_default: true },
  { id: "2", name: "Prospecto", color: "#3b82f6", order_index: 1, is_default: false },
  { id: "3", name: "Em Negociação", color: "#f59e0b", order_index: 2, is_default: false },
  { id: "4", name: "Inativo", color: "#6b7280", order_index: 3, is_default: false },
];

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
  const [leadStatuses, setLeadStatuses] = useState<LeadStatusConfig[]>(fallbackLeadStatuses);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusConfig[]>(fallbackTaskStatuses);
  const [clientStatuses, setClientStatuses] = useState<ClientStatusConfig[]>(fallbackClientStatuses);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatuses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch lead statuses
      const { data: leadStatusData, error: leadStatusError } = await supabase
        .from("lead_statuses")
        .select("*")
        .order("order_index");

      if (leadStatusError) {
        console.warn("Error fetching lead_statuses:", leadStatusError.message);
      } else if (leadStatusData && leadStatusData.length > 0) {
        console.log("Lead statuses loaded from DB:", leadStatusData.length);
        setLeadStatuses(leadStatusData);
      } else {
        console.log("No lead statuses in DB, using fallback");
      }

      // Fetch task statuses - com tratamento de erro separado
      try {
        const { data: taskStatusData, error: taskStatusError } = await supabase
          .from("task_statuses")
          .select("*")
          .order("order_index");

        if (taskStatusError) {
          console.warn("Error fetching task_statuses:", taskStatusError.message);
        } else if (taskStatusData && taskStatusData.length > 0) {
          console.log("Task statuses loaded from DB:", taskStatusData.length);
          setTaskStatuses(taskStatusData);
        } else {
          console.log("No task statuses in DB, using fallback");
        }
      } catch (taskErr) {
        console.warn("Task statuses table might not exist:", taskErr);
        // Mantém o fallback
      }

      // Fetch client statuses
      const { data: clientStatusData, error: clientStatusError } = await supabase
        .from("client_statuses")
        .select("*")
        .order("order_index");

      if (clientStatusError) {
        console.warn("Error fetching client_statuses:", clientStatusError.message);
      } else if (clientStatusData && clientStatusData.length > 0) {
        console.log("Client statuses loaded from DB:", clientStatusData.length);
        setClientStatuses(clientStatusData);
      } else {
        console.log("No client statuses in DB, using fallback");
      }

    } catch (err) {
      console.error("Error fetching statuses:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch statuses"));
      // Não mostrar toast de erro - usamos fallback silenciosamente
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
