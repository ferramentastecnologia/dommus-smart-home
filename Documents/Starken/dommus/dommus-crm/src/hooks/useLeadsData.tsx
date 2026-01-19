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
      
      // Get status mapping for later use
      const { data: statusesData, error: statusesError } = await supabase
        .from('lead_statuses')
        .select('id, name')
        .order('order_index', { ascending: true });
        
      if (statusesError) throw statusesError;
      
      // Create a mapping from status_id to status name
      const statusMap = statusesData.reduce((map, status) => {
        map[status.id] = status.name;
        return map;
      }, {} as Record<string, string>);
      
      // Filtro por role - usando o role do hook centralizado
      let query = supabase
        .from('leads')
        .select('*, lead_statuses!inner(id, name)');
      
      console.log('🔍 Leads Filter Debug:', { role, userId: user?.id });
      if (role === 'agent' && user) {
        console.log('📝 Applying leads filter for agent (only assigned):', user.id);
        // Agents veem APENAS leads atribuídos a eles (não veem sem atribuição)
        query = query.eq('agent_id', user.id);
      }
      else {
        console.log('👑 Admin/Manager - showing all leads');
      }
      // Admin e manager veem tudo
      const { data, error } = await query;

      console.log('Supabase response:', { data: data ? data.length : 0, error });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log('No leads found in database.');
        setLeads([]);
        return;
      }

      // Agora vamos buscar os dados complementares em consultas separadas
      const enhancedLeads = await Promise.all((data || []).map(async (lead) => {
        // Buscar o agente associado se houver um agent_id
        let agent = null;
        if (lead.agent_id) {
          const { data: agentData } = await supabase
            .from('agents')
            .select('id, name')
            .eq('id', lead.agent_id)
            .single();
          
          if (agentData) {
            agent = agentData;
          }
        }
        
        // Contar tarefas
        let tasksCount = 0;
        try {
          const { count } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('lead_id', lead.id);
          
          tasksCount = count || 0;
        } catch (error) {
          console.warn("Falha ao consultar tarefas, a tabela pode não existir:", error);
          // Não propaga o erro
        }
        
        // Contar notas
        let notesCount = 0;
        try {
          const { count } = await supabase
            .from('notes')
            .select('id', { count: 'exact', head: true })
            .eq('lead_id', lead.id);
          
          notesCount = count || 0;
        } catch (error) {
          console.warn("Falha ao consultar notas, a tabela pode não existir:", error);
          // Não propaga o erro
        }
          
        return {
          ...lead,
          agent,
          tasksCount: tasksCount,
          notesCount: notesCount
        };
      }));

      // Convert the data to the expected Lead format
      const formattedLeads = enhancedLeads.map(lead => {
        // Validar se temos os dados necessários de status
        if (!lead.lead_statuses || !lead.lead_statuses.name) {
          console.warn(`Lead ${lead.id} has missing status information:`, lead);
        }
        
        return {
          id: lead.id,
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          address: lead.address || '',
          company: lead.company || '',
          status: lead.lead_statuses?.name || 'New', // Use status name from the join, fallback to New
          statusId: lead.status_id, // Store the status_id for future operations
          source: lead.source || 'System',
          sourceId: lead.source_id, // Store the source_id for future operations
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
          phone: "555-123-4567",
          address: "Av. Paulista, 1000, São Paulo",
          company: "Tech Solutions",
          status: "Qualified",
          source: "Website",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastInteraction: new Date()
        },
        {
          id: "2",
          name: "João Silva",
          email: "joao@email.com", 
          phone: "555-765-4321",
          address: "Rua Augusta, 500, São Paulo",
          company: "Marketing Pro",
          status: "New",
          source: "Referral",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastInteraction: new Date()
        },
        {
          id: "3",
          name: "Maria Santos",
          email: "maria@email.com",
          phone: "555-987-6543",
          address: "Av. Rebouças, 300, São Paulo",
          company: "Design Agency",
          status: "Proposal",
          source: "Email",
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
    try {
      console.log(`Changing lead ${leadId} status to ${status}`);
      
      // Make a local copy of the current leads before making any changes
      const currentLeads = [...leads];
      console.log("Current leads count before update:", currentLeads.length);
      
      // Verifique se o lead existe no estado local
      const leadToUpdate = currentLeads.find(l => l.id === leadId);
      if (!leadToUpdate) {
        console.warn(`Lead with ID ${leadId} not found in local state. Cannot update status locally.`);
        // Não retorne aqui, tente atualizar no banco de dados mesmo assim
      } else {
        console.log(`Found lead to update: ${leadToUpdate.name}, current status: ${leadToUpdate.status}`);
      }
      
      // First, get the status_id from the status name
      const { data: statusData, error: statusError } = await supabase
        .from('lead_statuses')
        .select('id')
        .eq('name', status)
        .single();
        
      if (statusError) {
        console.error('Error getting status_id:', statusError);
        throw statusError;
      }
      
      console.log(`Got status_id ${statusData.id} for status ${status}`);

      // Update in database
      const { data, error } = await supabase
        .from('leads')
        .update({ status_id: statusData.id })
        .eq('id', leadId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating lead status:', error);
        throw error;
      }
      
      console.log(`Successfully updated lead ${leadId} to status ${status}`, data);

      // Se não encontramos o lead no estado local, vamos recarregar todos os leads
      if (!leadToUpdate) {
        console.log('Lead not found in local state, reloading all leads...');
        await fetchLeads();
        return;
      }

      // Update local state with new status
      const updatedLeads = currentLeads.map(lead => 
        lead.id === leadId ? { ...lead, status, statusId: statusData.id } : lead
      );
      
      console.log("Updated leads count:", updatedLeads.length);
      
      // Set the updated array to state
      setLeads(updatedLeads);
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update lead status');
      // Recarregar leads para garantir sincronização
      await fetchLeads();
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
        .eq('name', newLead.status || 'New')
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
        email: newLead.email,
        phone: newLead.phone || '',
        address: newLead.address || '',
        company: newLead.company || '',
        status_id: statusData.id, // Use status_id instead of status
        source: newLead.source || 'Website', // Usar diretamente o campo source como texto
        agent_id: agent_id, // Use the agent_id we fetched
        assigned_to: assigned_to, // Use the assigned_to we determined
        created_at: newLead.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: newLead.updatedAt?.toISOString() || new Date().toISOString(),
        last_interaction: newLead.lastInteraction?.toISOString()
      };
      
      console.log("Formatted lead for Supabase:", supabaseLead);

      const { data, error } = await supabase
        .from('leads')
        .insert(supabaseLead)
        .select('*, lead_statuses!inner(id, name)')
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Successfully added lead, response:", data);
      
      // Convert back to our Lead format
      const newFormattedLead: Lead = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        company: data.company || '',
        status: data.lead_statuses.name, // Use status name from the join
        statusId: data.status_id,
        source: data.source || 'Website',
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
      
      // 2. Obter o status_id para o status
      const { data: statusData, error: statusError } = await supabase
        .from('lead_statuses')
        .select('id')
        .eq('name', newStatus)
        .single();
        
      if (statusError) {
        console.error("Erro ao obter status_id:", statusError);
        throw statusError;
      }
      
      const statusId = statusData.id;
      console.log(`Status ID para ${newStatus}: ${statusId}`);
      
      // 3. Atualizar o banco de dados PRIMEIRO
      console.log(`Enviando atualização para o banco...`);
      
      // Atualização DIRETA e SIMPLES no banco - apenas o necessário
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status_id: statusId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select(`*, lead_statuses(*)`)
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
            statusId: statusId,
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