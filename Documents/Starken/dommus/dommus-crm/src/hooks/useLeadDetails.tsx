import { useState, useEffect } from "react";
import { Lead } from "@/types/crm";
import { supabase } from "@/services/supabase/client";
import { useLeadDialog } from "./useLeadDialog";
import { toast } from "sonner";

export function useLeadDetails(leadId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!leadId) {
      setIsLoading(false);
      setError("ID do lead não fornecido");
      return;
    }
    
    const fetchLead = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select(`
            *,
            agent:agents(id, name),
            tasks:tasks(count),
            notes:notes(count)
          `)
          .eq('id', leadId)
          .single();

        if (error) throw error;
        
        if (data) {
          setLead(data);
          setError(null);
        } else {
          setError("Lead não encontrado");
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError("Erro ao carregar o lead");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);
  
  // Get all lead dialog functionality
  const leadDialogFunctions = useLeadDialog();
  
  // Return both the lead data and all the functions from useLeadDialog
  return {
    lead,
    isLoading,
    error,
    ...leadDialogFunctions
  };
}
