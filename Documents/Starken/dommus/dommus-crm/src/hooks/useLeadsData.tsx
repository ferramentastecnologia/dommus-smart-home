import { useState, useEffect } from 'react';
import { Lead, LeadStatus, LeadSource } from '@/types/crm';
import { supabase } from '@/services/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/hooks/auth/useUser';
import { useUserRole } from '@/hooks/auth/useUserRole';

export function useLeadsData() {
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sources, setSources] = useState<LeadSource[]>([]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log('Fetching leads from Supabase...');

      // Aguarda o role carregar antes de aplicar filtros
      if (roleLoading) {
        console.log('⏳ Waiting for role to load...');
        return;
      }

      // Buscar leads com JOIN para statuses (uma única query)
      let query = supabase
        .from('leads')
        .select(`
          *,
          lead_statuses(id, name)
        `);

      console.log('🔍 Leads Filter Debug:', { role, userId: user?.id });
      if (role === 'agent' && user) {
        console.log('📝 Applying leads filter for agent (only assigned):', user.id);
        query = query.eq('agent_id', user.id);
      } else {
        console.log('👑 Admin/Manager - showing all leads');
      }

      const { data, error } = await query;

      console.log('Supabase response:', { data: data ? data.length : 0, error });

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log('No leads found in database.');
        setLeads([]);
        return;
      }

      // Processar leads diretamente sem queries adicionais
      const enhancedLeads = data.map((lead) => ({
        ...lead,
        agent: null, // Agente será carregado lazy se necessário
        tasksCount: 0,
        notesCount: 0
      }));

      // Convert the data to the expected Lead format
      const formattedLeads = enhancedLeads.map(lead => {
        // Determinar o status - priorizar lead_statuses.name se disponível,
        // senão usar o campo status diretamente, senão 'Novo' como fallback
        let statusName = 'Novo';
        if (lead.lead_statuses && lead.lead_statuses.name) {
          statusName = lead.lead_statuses.name;
        } else if (lead.status) {
          statusName = lead.status;
        }

        return {
          id: lead.id,
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          address: lead.address || '',
          company: lead.company || '',
          position: lead.position || '',
          website: lead.website || '',
          status: statusName,
          statusId: lead.status_id,
          source: lead.source || '',
          sourceId: lead.source_id,
          agentId: lead.agent_id,
          agent: lead.agent,
          tasksCount: lead.tasksCount,
          notesCount: lead.notesCount,
          notes: lead.notes || [],
          tags: lead.tags || [],
          history: lead.history || [],
          createdAt: new Date(lead.created_at),
          updatedAt: new Date(lead.updated_at),
          lastInteraction: lead.last_interaction ? new Date(lead.last_interaction) : undefined
        };
      });

      console.log('Formatted leads:', formattedLeads.length);
      setLeads(formattedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads');
      
      // Fallback to mock data if there's an error
      const mockLeads: Lead[] = [
        {
          id: "1",
          name: "Pedro Oliveira",
          email: "pedro@email.com",
          phone: "(47) 99999-1234",
          address: "Av. Paulista, 1000, São Paulo",
          company: "Tech Solutions",
          status: "Qualificado",
          source: "Site",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastInteraction: new Date()
        },
        {
          id: "2",
          name: "João Silva",
          email: "joao@email.com",
          phone: "(47) 99999-5678",
          address: "Rua Augusta, 500, São Paulo",
          company: "Marketing Pro",
          status: "Novo",
          source: "Indicação",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastInteraction: new Date()
        },
        {
          id: "3",
          name: "Maria Santos",
          email: "maria@email.com",
          phone: "(47) 99999-9012",
          address: "Av. Rebouças, 300, São Paulo",
          company: "Design Agency",
          status: "Proposta",
          source: "Instagram",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastInteraction: new Date()
        }
      ];

      console.log('Using fallback mock leads:', mockLeads);
      setLeads(mockLeads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user, role, roleLoading]);

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const { data, error } = await supabase
          .from("lead_sources")
          .select("*");
          
        if (error) {
          console.error("Error fetching lead sources:", error);
          return;
        }
        
        if (data) {
          setSources(data);
        }
      } catch (error) {
        console.error("Error in fetchLeadSources:", error);
      }
    };
    
    fetchLeadSources();
  }, []);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    console.log(`🔄 handleStatusChange: lead=${leadId}, newStatus=${status}`);

    // 1. Atualização otimista local primeiro (UI imediata)
    const currentLeads = [...leads];
    const leadIndex = currentLeads.findIndex(l => l.id === leadId);

    if (leadIndex !== -1) {
      // Atualiza UI imediatamente
      const updatedLeads = [...currentLeads];
      updatedLeads[leadIndex] = { ...updatedLeads[leadIndex], status };
      setLeads(updatedLeads);
      console.log(`✅ UI atualizada para lead ${leadId}`);
    }

    try {
      // 2. Buscar status_id (opcional)
      let statusId: string | null = null;
      const { data: statusData } = await supabase
        .from('lead_statuses')
        .select('id')
        .eq('name', status)
        .maybeSingle();

      if (statusData) {
        statusId = statusData.id;
        console.log(`📌 Status ID encontrado: ${statusId}`);
      } else {
        console.log(`⚠️ Status "${status}" não encontrado na tabela, usando apenas campo texto`);
      }

      // 3. Atualizar no banco
      const updatePayload: Record<string, any> = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if (statusId) {
        updatePayload.status_id = statusId;
      }

      const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId);

      if (error) {
        console.error('❌ Erro no Supabase:', error);
        // Reverter UI em caso de erro
        setLeads(currentLeads);
        toast.error(`Erro ao atualizar: ${error.message}`);
        return;
      }

      console.log(`✅ Lead ${leadId} atualizado no banco para status "${status}"`);
      toast.success(`Status atualizado para ${status}`);

    } catch (err: any) {
      console.error('❌ Exceção:', err);
      // Reverter UI em caso de erro
      setLeads(currentLeads);
      toast.error('Falha ao atualizar status do lead');
    }
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(leads.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setSelectedLead(updatedLead);
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query) ||
      lead.status?.toLowerCase().includes(query)
    );
  });

  const addLead = async (newLead: Partial<Lead>) => {
    try {
      console.log("Adding lead to Supabase:", newLead);
      
      // Get the status_id for the status
      const { data: statusData, error: statusError } = await supabase
        .from('lead_statuses')
        .select('id')
        .eq('name', newLead.status || 'Novo')
        .single();
        
      if (statusError) throw statusError;
      
      // Handle agent assignment - if agentId is provided, get user_id
      let assigned_to = null;
      let agent_id = null;
      
      if (newLead.agentId) {
        try {
          const { data: agentData, error: agentError } = await supabase
            .from('agents')
            .select('id, email, user_id')
            .eq('id', newLead.agentId)
            .single();
            
          if (agentError) {
            console.error("Error fetching agent data:", agentError);
          } else if (agentData) {
            agent_id = agentData.id;
            
            // Use user_id if available, otherwise use email
            if (agentData.user_id) {
              assigned_to = agentData.user_id;
              console.log(`Using user_id ${agentData.user_id} as assigned_to for agent ${agentData.email}`);
            } else {
              assigned_to = agentData.email;
              console.log(`Using email ${agentData.email} as assigned_to (user_id not available)`);
            }
          }
        } catch (err) {
          console.error("Error processing agentId:", err);
        }
      }
      
      // Convert Lead object to Supabase format
      const supabaseLead = {
        id: newLead.id,
        name: newLead.name,
        email: newLead.email || '',
        phone: newLead.phone || '',
        address: newLead.address || '',
        company: newLead.company || '',
        position: newLead.position || '',
        website: newLead.website || '',
        status: newLead.status || 'Novo', // Campo texto para fallback
        status_id: statusData.id, // UUID do status
        source: newLead.source || '',
        agent_id: agent_id,
        assigned_to: assigned_to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Formatted lead for Supabase:", supabaseLead);

      const { data, error } = await supabase
        .from('leads')
        .insert(supabaseLead)
        .select('*, lead_statuses(id, name)')
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Successfully added lead, response:", data);

      // Determinar o status name
      let statusName = newLead.status || 'Novo';
      if (data.lead_statuses && data.lead_statuses.name) {
        statusName = data.lead_statuses.name;
      }

      // Convert back to our Lead format
      const newFormattedLead: Lead = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company: data.company || '',
        position: data.position || '',
        website: data.website || '',
        status: statusName,
        statusId: data.status_id,
        source: data.source || '',
        agentId: data.agent_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        lastInteraction: data.last_interaction ? new Date(data.last_interaction) : undefined
      };

      setLeads(prev => [newFormattedLead, ...prev]);
      return newFormattedLead;
    } catch (err) {
      console.error('Error adding lead:', err);
      throw err;
    }
  };

  const updateLeadSource = async (leadId: string, source: string): Promise<boolean> => {
    console.log(`Updating lead ${leadId} source to: ${source}`);
    
    if (!leadId) {
      console.error("Invalid lead ID provided for updateLeadSource");
      return false;
    }
    
    // Retrieve current lead source to check if update is needed
    const { data: currentLead, error: fetchError } = await supabase
      .from('leads')
      .select('source')
      .eq('id', leadId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching current lead for source update:", fetchError);
      return false;
    }
    
    // If source is the same, no need to update
    if (currentLead.source === source) {
      console.log(`Lead ${leadId} already has source '${source}', skipping update`);
      return true; // Return success, but no update needed
    }
    
    // Update source in database
    const updateData = {
      source: source,
      updated_at: new Date().toISOString()
    };
    
    // Remove source_id since we're no longer using it
    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId);
      
    if (updateError) {
      console.error("Error updating lead source:", updateError);
      return false;
    }
    
    // Update local state
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId
          ? { 
              ...lead, 
              source: source,
              sourceId: null, // Set sourceId to null since we're not using it anymore
              updated_at: updateData.updated_at
            }
          : lead
      )
    );
    
    console.log(`Successfully updated lead ${leadId} source to '${source}'`);
    return true;
  };

  // Update the updateLead function to handle the source text field
  const updateLead = async (leadId: string, updates: Partial<Lead>): Promise<Lead | null> => {
    try {
      console.log(`Updating lead ${leadId}:`, updates);
      
      // Extract source from updates to handle separately
      const { source, ...otherUpdates } = updates;
      
      // If there's a source update, handle it first
      if (source !== undefined) {
        const sourceUpdated = await updateLeadSource(leadId, source);
        if (!sourceUpdated) {
          console.warn("Source update failed, but continuing with other updates");
        }
      }
      
      // Don't include sourceId in updates since we're not using it anymore
      const { sourceId, ...remainingUpdates } = otherUpdates;
      
      // Create an object with only the fields we want to update in Supabase
      const supabaseUpdates: any = { ...remainingUpdates };
      
      // If status is being updated, get the status_id
      let status_id = undefined;
      if (supabaseUpdates.status) {
        const { data: statusData, error: statusError } = await supabase
          .from('lead_statuses')
          .select('id')
          .eq('name', supabaseUpdates.status)
          .single();
          
        if (statusError) {
          console.error('Error fetching status ID:', statusError);
          throw statusError;
        }
        
        status_id = statusData.id;
        
        // Remove status and add status_id
        delete supabaseUpdates.status;
        supabaseUpdates.status_id = status_id;
      }
      
      // Add updated timestamp
      supabaseUpdates.updated_at = new Date().toISOString();
      
      // Remove non-database fields from supabaseUpdates
      const fieldsToRemove = ['createdAt', 'updatedAt', 'lastInteraction', 'agent', 'notes', 'tasksCount', 'notesCount', 'history', 'tags'];
      fieldsToRemove.forEach(field => {
        if (field in supabaseUpdates) {
          delete supabaseUpdates[field];
        }
      });
      
      // Update the lead in the database
      const { error: updateError } = await supabase
        .from('leads')
        .update(supabaseUpdates)
        .eq('id', leadId);
        
      if (updateError) {
        console.error('Error updating lead in database:', updateError);
        throw updateError;
      }
      
      // Create the updated lead object for state update
      const updatedLead = leads.find(lead => lead.id === leadId);
      if (!updatedLead) {
        console.error(`Lead with ID ${leadId} not found in local state`);
        return null;
      }
      
      // Update leads state with the new values
      const newUpdatedLead = { ...updatedLead, ...updates, updatedAt: new Date() };
      setLeads(prevLeads => prevLeads.map(lead => 
        lead.id === leadId ? newUpdatedLead : lead
      ));
      
      return newUpdatedLead;
    } catch (err) {
      console.error('Error updating lead:', err);
      throw err;
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
    } catch (err) {
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      console.log(`**ATUALIZAÇÃO** Atualizando status do lead ${leadId} para ${newStatus}`);

      // 1. Verificar se o ID é válido
      if (!leadId) {
        console.error("ID do lead inválido");
        return null;
      }

      // 2. Tentar obter o status_id para o status (mas não falhar se não encontrar)
      let statusId: string | null = null;
      try {
        const { data: statusData, error: statusError } = await supabase
          .from('lead_statuses')
          .select('id')
          .eq('name', newStatus)
          .single();

        if (statusError) {
          console.warn("Status não encontrado na tabela lead_statuses:", statusError.message);
          console.log("Continuando com atualização apenas do campo 'status'...");
        } else if (statusData) {
          statusId = statusData.id;
          console.log(`Status ID para ${newStatus}: ${statusId}`);
        }
      } catch (err) {
        console.warn("Erro ao buscar status_id, usando fallback:", err);
      }

      // 3. Atualizar o banco de dados
      console.log(`Enviando atualização para o banco...`);

      // Preparar dados de atualização - sempre atualiza o campo 'status' string
      // e opcionalmente o status_id se encontrado
      const updateData: any = {
        status: newStatus, // Sempre atualizar o campo de texto
        updated_at: new Date().toISOString()
      };

      // Só incluir status_id se foi encontrado
      if (statusId) {
        updateData.status_id = statusId;
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select('*')
        .single();

      if (error) {
        console.error("Erro na atualização:", error);
        throw error;
      }

      console.log(`Banco atualizado com sucesso:`, data);

      // 4. Atualizar o cache local
      const updatedLeads = leads.map(lead => {
        if (lead.id === leadId) {
          console.log(`Atualizando lead no cache: ${lead.name}`);
          return {
            ...lead,
            status: newStatus,
            statusId: statusId || lead.statusId,
            updatedAt: new Date()
          };
        }
        return lead;
      });

      // 5. Atualizar o estado com todos os leads atualizados
      setLeads(updatedLeads);

      // 6. Fazer um fetchLeads para sincronizar tudo (opcional)
      setTimeout(() => {
        fetchLeads().catch(err => console.error("Erro ao recarregar leads:", err));
      }, 500);

      return data;
    } catch (error) {
      console.error("Erro na atualização de status:", error);
      toast.error("Falha ao atualizar status do lead");
      throw error;
    }
  };


  return {
    leads,
    loading,
    error,
    selectedLead,
    showLeadDetails,
    setShowLeadDetails,
    searchQuery,
    setSearchQuery,
    filteredLeads,
    handleLeadClick,
    handleStatusChange,
    handleLeadUpdate,
    fetchLeads,
    addLead,
    updateLead,
    deleteLead,
    setLeads,
    updateLeadStatus,
    updateLeadSource
  };
} 