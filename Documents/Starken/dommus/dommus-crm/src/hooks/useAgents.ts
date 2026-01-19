import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { Agent } from "@/types/crm";
import { toast } from "sonner";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedAgents: Agent[] = data.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone || undefined,
          position: agent.position || "Vendedor",
          status: agent.status,
          photoUrl: agent.photo_url || undefined,
          role: agent.role || undefined,
        }));
        setAgents(formattedAgents);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Erro ao carregar agentes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    loading,
    fetchAgents,
  };
}
