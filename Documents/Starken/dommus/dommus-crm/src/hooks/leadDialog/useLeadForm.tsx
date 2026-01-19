import { useState, useEffect } from "react";
import { Lead } from "@/types/crm";
import { toast } from "sonner";
import { supabase } from "@/services/supabase/client";

export function useLeadForm(lead: Lead | null, onLeadUpdate?: (updatedLead: Lead) => void) {
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (lead) {
      console.log("**DEBUG** Setting initial editedLead from lead:", lead);
      setEditedLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company || "",
        position: lead.position || "",
        address: lead.address || "",
        website: lead.website || "",
        status: lead.status,
        statusId: lead.statusId,
        agentId: lead.agentId || "",
        sourceId: lead.sourceId || "",
        source: lead.source || ""
      });
    }
  }, [lead]);
  
  // Function to update source directly
  const updateSourceDirect = async (leadId: string, source: string) => {
    if (!leadId) {
      console.error("Invalid lead ID provided for source update");
      return null;
    }
    
    try {
      console.log(`**DEBUG** Atualizando source do lead ${leadId} para ${source}`);
      
      // Update source field directly
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          source: source,
          updated_at: new Date().toISOString() 
        })
        .eq('id', leadId)
        .select('id, source')
        .single();
      
      if (error) {
        console.error("**DEBUG** Erro ao atualizar source:", error);
        throw error;
      }
      
      console.log(`**DEBUG** Source atualizado com sucesso:`, data);
      return data;
    } catch (err) {
      console.error("**DEBUG** Erro na função updateSourceDirect:", err);
      return null;
    }
  };
  
  // Função específica para atualizar apenas o source_id diretamente
  const updateSourceIdDirect = async (leadId: string, sourceId: string | null) => {
    try {
      console.log(`**DEBUG** Atualizando source_id diretamente: ${leadId} -> ${sourceId}`);
      
      if (!leadId) {
        console.error("**DEBUG** ID do lead inválido (vazio ou nulo)");
        return null;
      }
      
      // Tentar usar o RPC para atualização segura
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('update_lead_source', {
          p_lead_id: leadId,
          p_source_id: sourceId
        });
        
        if (!rpcError) {
          console.log(`**DEBUG** Atualização via RPC bem-sucedida:`, rpcData);
          
          // Buscar o lead atualizado com os dados da source
          const { data: updatedData, error: fetchError } = await supabase
            .from('leads')
            .select('id, source_id, lead_sources(id, name)')
            .eq('id', leadId)
            .single();
            
          if (!fetchError && updatedData) {
            console.log(`**DEBUG** Lead atualizado:`, updatedData);
            
            // Forçar uma recarga completa dos leads
            // Esta linha é importante para garantir que todas as partes da UI 
            // estejam sincronizadas com o estado mais recente do lead
            supabase
              .from('leads')
              .select('*')
              .eq('id', leadId)
              .then(() => {
                console.log(`**DEBUG** Revalidação forçada do lead ${leadId} realizada`);
              })
              .catch(err => {
                console.warn(`**DEBUG** Erro na revalidação: ${err}`);
              });
              
            return updatedData;
          }
          
          return { id: leadId, source_id: sourceId };
        }
        
        console.warn(`**DEBUG** RPC falhou, tentando método direto: ${rpcError.message}`);
      } catch (rpcErr) {
        console.warn(`**DEBUG** Erro no RPC: ${rpcErr}`);
      }
      
      // MÉTODO DIRETO: Usar atualização direta simples como fallback
      const updateData = {
        source_id: sourceId,
        updated_at: new Date().toISOString()
      };
      
      console.log(`**DEBUG** Enviando atualização direta:`, updateData);
      
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select('*')
        .single();
        
      if (error) {
        console.error(`**DEBUG** Erro na atualização direta: ${error.message}`);
        throw error;
      }
      
      console.log(`**DEBUG** Atualização direta bem-sucedida:`, data);
      return data;
    } catch (err: any) {
      console.error(`**DEBUG** Erro em updateSourceIdDirect: ${err?.message || 'Erro desconhecido'}`);
      throw err;
    }
  };
  
  // Function to save edits
  const handleSaveEdit = async () => {
    if (!lead) return;
    
    console.log("**DEBUG** Lead edit state:", {
      originalStatus: lead.status,
      editedStatus: editedLead.status,
      editedStatusId: editedLead.statusId,
      completeEditedState: editedLead
    });
    
    console.log("**DEBUG** Source info:", {
      original: {
        sourceId: lead.sourceId,
        source: lead.source,
      },
      edited: {
        sourceId: editedLead.sourceId,
        source: editedLead.source
      }
    });
    
    setIsLoading(true);
    
    try {
      // Tratar source_id separadamente antes de qualquer outra atualização
      if (editedLead.sourceId !== undefined) {
        console.log(`**DEBUG** Processando sourceId: original=${lead.sourceId}, editado=${editedLead.sourceId}, tipo=${typeof editedLead.sourceId}`);
        
        // Verificar se realmente houve mudança
        const sourceChanged = lead.sourceId !== editedLead.sourceId;
        if (sourceChanged) {
          console.log(`**DEBUG** Detectada alteração em sourceId: ${lead.sourceId} -> ${editedLead.sourceId}`);
          
          try {
            // Validar o valor do sourceId antes de enviar
            let finalSourceId = editedLead.sourceId;
            
            // Converter string vazia para null
            if (finalSourceId === "") {
              finalSourceId = null;
              console.log(`**DEBUG** Convertendo string vazia para null`);
            }
            
            // Chamar a função local para atualizar o source_id
            const result = await updateSourceIdDirect(lead.id, finalSourceId);
            console.log(`**DEBUG** Resultado da atualização do source_id:`, result);
            
            // Forçar atualização do lead com as novas informações
            try {
              const { data: refreshedLead } = await supabase
                .from('leads')
                .select('*, lead_sources(id, name, color)')
                .eq('id', lead.id)
                .single();
                
              if (refreshedLead) {
                console.log(`**DEBUG** Lead atualizado após source change:`, refreshedLead);
                
                // Atualizar o lead original e o source no editedLead para consistência
                const sourceName = refreshedLead.lead_sources?.name || "";
                if (lead && onLeadUpdate) {
                  // Criar uma versão atualizada do lead para atualizar a UI
                  const updatedLead: Lead = {
                    ...lead,
                    sourceId: finalSourceId,
                    source: sourceName
                  };
                  onLeadUpdate(updatedLead);
                }
              }
            } catch (refreshErr) {
              console.warn(`**DEBUG** Erro ao atualizar informações do lead após source change: ${refreshErr}`);
            }
          } catch (sourceErr) {
            console.error(`**DEBUG** Erro ao atualizar source_id:`, sourceErr);
            toast.error("Erro ao atualizar a fonte do lead");
          }
        } else {
          console.log(`**DEBUG** sourceId não foi alterado, ignorando atualização`);
        }
      }
      
      // Convert to Supabase format (snake_case)
      const supabaseData: Record<string, any> = {};
      
      // Handle status changes - modified for better logging
      if (editedLead.status !== undefined && editedLead.status !== lead.status) {
        try {
          console.log(`**DEBUG** Processing status change from '${lead.status}' to '${editedLead.status}'`);
          
          // Get the status_id based on status name
          const { data: statusData, error: statusError } = await supabase
            .from('lead_statuses')
            .select('id, color')
            .eq('name', editedLead.status)
            .single();
            
          if (statusError) {
            console.error("**DEBUG** Error getting status_id:", statusError);
            throw statusError;
          }
          
          if (statusData) {
            supabaseData.status_id = statusData.id;
            editedLead.statusId = statusData.id;
            console.log(`**DEBUG** Status updated to '${editedLead.status}' with ID ${statusData.id} and color ${statusData.color}`);
          } else {
            console.warn(`**DEBUG** No status found with name '${editedLead.status}'`);
          }
        } catch (statusErr) {
          console.error("**DEBUG** Error getting status_id:", statusErr);
        }
      } else if (editedLead.statusId !== undefined && editedLead.statusId !== lead.statusId) {
        // If statusId is directly specified
        supabaseData.status_id = editedLead.statusId;
        
        // Buscar o nome do status a partir do ID
        try {
          const { data: statusData } = await supabase
            .from('lead_statuses')
            .select('name')
            .eq('id', editedLead.statusId)
            .single();
            
          if (statusData) {
            editedLead.status = statusData.name;
          }
        } catch (err) {
          console.error("**DEBUG** Error getting status name from ID:", err);
        }
        
        console.log(`**DEBUG** Status ID directly updated to ${editedLead.statusId}`);
      }
      
      // Handle agent changes
      if (editedLead.agentId !== undefined && editedLead.agentId !== lead.agentId) {
        if (editedLead.agentId === "") {
          // Remove agent association
          supabaseData.assigned_to = null;
          supabaseData.agent_id = null;
          console.log("Agent association removed");
        } else {
          try {
            // Get agent data to find user_id for assigned_to
            const { data: agentData, error: agentError } = await supabase
              .from('agents')
              .select('id, email, user_id')
              .eq('id', editedLead.agentId)
              .single();

            if (agentError) {
              console.error("Error fetching agent data:", agentError);
              throw agentError;
            }

            if (agentData) {
              // Set agent_id to the agent's ID
              supabaseData.agent_id = agentData.id;
              
              // If agent has user_id, use as assigned_to
              if (agentData.user_id) {
                supabaseData.assigned_to = agentData.user_id;
                console.log(`Using user_id ${agentData.user_id} as assigned_to for agent ${agentData.email}`);
              } else {
                // Otherwise use email as assigned_to (for compatibility)
                supabaseData.assigned_to = agentData.email;
                console.log(`Using email ${agentData.email} as assigned_to (user_id not available)`);
              }
            } else {
              console.error(`Agent with ID ${editedLead.agentId} not found`);
              supabaseData.agent_id = editedLead.agentId;
            }
          } catch (err) {
            console.error("Error processing agentId:", err);
            // In case of error, try to use original value as fallback
            supabaseData.agent_id = editedLead.agentId;
          }
        }
      }
      
      // Não incluir source_id no objeto supabaseData, já que foi tratado separadamente
      if ('sourceId' in editedLead) {
        console.log("**DEBUG** sourceId foi tratado separadamente, removendo do objeto de atualização");
        delete supabaseData.source_id;
      }
      
      // Add standard fields that were modified
      const fieldMappings = {
        name: 'name',
        email: 'email',
        phone: 'phone',
        company: 'company',
        position: 'position',
        address: 'address',
        website: 'website',
      };

      // Add each modified field to supabaseData
      Object.entries(fieldMappings).forEach(([clientField, dbField]) => {
        if (editedLead[clientField as keyof typeof editedLead] !== undefined) {
          supabaseData[dbField] = editedLead[clientField as keyof typeof editedLead];
        }
      });
      
      // Always update modification date
      supabaseData.updated_at = new Date().toISOString();
      
      // DEBUG: Verificação de segurança para o source_id
      if (editedLead.sourceId && !supabaseData.source_id) {
        supabaseData.source_id = editedLead.sourceId;
        console.log("**DEBUG** Forced source_id into supabaseData:", editedLead.sourceId);
      }
      
      console.log("Sending data for update:", supabaseData);
      
      // Primeiro verificar se o lead já tem um source_id correto no banco
      console.log("**DEBUG** Verificando estado atual do lead no banco antes de atualizar");
      const { data: currentLeadData, error: fetchError } = await supabase
        .from('leads')
        .select(`id, source`)
        .eq('id', lead.id)
        .single();
        
      if (fetchError) {
        console.error("**DEBUG** Erro ao buscar estado atual do lead:", fetchError);
      } else {
        console.log("**DEBUG** Estado atual do lead no banco:", currentLeadData);
        
        // Se estamos tentando atualizar o source e ele já está diferente do que temos em cache
        if (editedLead.source !== undefined && 
            currentLeadData.source !== lead.source) {
          console.log("**DEBUG** Detectada inconsistência entre o banco e o cache local do source");
          console.log(`**DEBUG** Banco: ${currentLeadData.source}, Cache: ${lead.source}, Nova atualização: ${editedLead.source}`);
        }
      }
      
      // Remove source_id from supabaseData if present
      if ('source_id' in supabaseData) {
        console.log("**DEBUG** Removing source_id from update data - no longer used");
        delete supabaseData.source_id;
      }
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('leads')
        .update(supabaseData)
        .eq('id', lead.id)
        // Join with related tables to get names
        .select(`*, 
          lead_statuses(id, name, color),
          agents(id, name, email)
        `);
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Supabase response:", data);
      
      if (!data || data.length === 0) {
        throw new Error("No data returned from update operation");
      }
      
      const updatedData = data[0];
      
      // Map the response back to our client model
      const updatedLead: Lead = {
        ...lead,
        ...editedLead,
        // Ensure fields from response are updated correctly
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone || "",
        company: updatedData.company || "",
        position: updatedData.position || "",
        address: updatedData.address || "",
        website: updatedData.website || "",
        // Status fields - garantir que os valores do status sejam atualizados corretamente
        status: updatedData.lead_statuses?.name || editedLead.status || lead.status,
        statusId: updatedData.status_id || editedLead.statusId || lead.statusId,
        // Source fields - now using direct source field
        source: updatedData.source || editedLead.source || lead.source,
        sourceId: null, // No longer using sourceId
        // Agent fields
        agentId: updatedData.agent_id || null,
        agent: updatedData.agents ? {
          id: updatedData.agents.id,
          name: updatedData.agents.name
        } : null,
        // Update timestamps
        updatedAt: new Date()
      };
      
      console.log("**DEBUG** Updated lead:", updatedLead);
      console.log("**DEBUG** Status before update:", lead.status);
      console.log("**DEBUG** Status after update:", updatedLead.status);
      console.log("**DEBUG** Source before update:", { id: lead.sourceId, name: lead.source });
      console.log("**DEBUG** Source after update:", { id: updatedLead.sourceId, name: updatedLead.source });
      
      if (onLeadUpdate) {
        onLeadUpdate(updatedLead as Lead);
      }
      
      toast.success("Lead information updated successfully");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Error updating lead information");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    editedLead,
    setEditedLead,
    handleSaveEdit,
    isLoading
  };
}
