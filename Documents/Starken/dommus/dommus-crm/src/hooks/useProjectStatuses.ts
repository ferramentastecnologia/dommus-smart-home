import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { ProjectStatusConfig } from "@/types/crm";
import { toast } from "sonner";

// Default project statuses (used as fallback)
const defaultStatuses: ProjectStatusConfig[] = [
  { id: "1", name: "Orçamento", color: "#f59e0b", order_index: 0, is_default: true, is_completed: false, is_canceled: false },
  { id: "2", name: "Aprovado", color: "#10b981", order_index: 1, is_default: false, is_completed: false, is_canceled: false },
  { id: "3", name: "Em Execução", color: "#3b82f6", order_index: 2, is_default: false, is_completed: false, is_canceled: false },
  { id: "4", name: "Instalação", color: "#8b5cf6", order_index: 3, is_default: false, is_completed: false, is_canceled: false },
  { id: "5", name: "Finalizado", color: "#22c55e", order_index: 4, is_default: false, is_completed: true, is_canceled: false },
  { id: "6", name: "Cancelado", color: "#ef4444", order_index: 5, is_default: false, is_completed: false, is_canceled: true },
];

export function useProjectStatuses() {
  const [statuses, setStatuses] = useState<ProjectStatusConfig[]>(defaultStatuses);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_statuses")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching project statuses:", error);
        // Use default statuses on error
        setStatuses(defaultStatuses);
      } else if (data && data.length > 0) {
        setStatuses(data.map((status: any) => ({
          id: status.id,
          name: status.name,
          color: status.color,
          description: status.description,
          order_index: status.order_index,
          is_default: status.is_default,
          is_completed: status.is_completed,
          is_canceled: status.is_canceled,
        })));
      } else {
        // No data from DB, use defaults
        setStatuses(defaultStatuses);
      }
    } catch (error) {
      console.error("Error in fetchStatuses:", error);
      setStatuses(defaultStatuses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Get status by name
  const getStatusByName = (name: string) => {
    return statuses.find((s) => s.name === name);
  };

  // Get status color by name
  const getStatusColor = (name: string) => {
    const status = getStatusByName(name);
    return status?.color || "#6366f1";
  };

  // Get default status
  const getDefaultStatus = () => {
    return statuses.find((s) => s.is_default) || statuses[0];
  };

  // Get ordered status names (for Kanban columns)
  const getOrderedStatusNames = () => {
    return statuses
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => s.name);
  };

  return {
    statuses,
    loading,
    fetchStatuses,
    getStatusByName,
    getStatusColor,
    getDefaultStatus,
    getOrderedStatusNames,
  };
}
