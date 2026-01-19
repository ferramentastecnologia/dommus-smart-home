import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { useUser } from "@/hooks/auth/useUser";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { toast } from "sonner";
import { Client, ClientStatus } from "@/types/Client";
import { camelToSnake, snakeToCamel } from "@/utils/stringUtils";

export function useClientsData() {
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // Fetch clients from database
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // Aguarda o role carregar antes de aplicar filtros
      if (roleLoading) {
        console.log('⏳ Waiting for role to load...');
        return;
      }
      
      // Filtro por role - usando o role do hook centralizado
      let query = supabase
        .from("clients")
        .select(`
          *,
          agent:agents(id, name),
          client_notes:client_notes(id, content, created_at, created_by)
        `)
        .order("created_at", { ascending: false });
      
      console.log('🔍 Clients Filter Debug:', { role, userId: user?.id });
      if (role === 'agent' && user) {
        console.log('📝 Applying clients filter for agent (only assigned):', user.id);
        // Agents veem APENAS clients atribuídos a eles (não veem sem atribuição)
        query = query.eq('agent_id', user.id);
      }
      else {
        console.log('👑 Admin/Manager - showing all clients');
      }
      // Admin e manager veem tudo
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      if (data) {
        const transformedClients = data.map((client: any) => {
          const notesCount = client.client_notes ? client.client_notes.length : 0;
          delete client.client_notes;
          return {
            ...snakeToCamel(client),
            notesCount
          };
        });
        setClients(transformedClients);
        setFilteredClients(transformedClients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients");
    } finally {
      setIsLoading(false);
    }
  }, [user, role, roleLoading]);

  // Filter clients when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  // Fetch clients on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, fetchClients]);

  // Handle client click to show details
  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  // Handle status change
  const updateClientStatus = async (clientId: string, newStatus: ClientStatus) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update({ status_id: newStatus })
        .eq("id", clientId)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const updatedClient = {
          ...snakeToCamel(data[0])
        };
        
        // Update clients state with the updated client
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === clientId ? updatedClient : c))
        );
        
        return updatedClient;
      }
      
      return null;
    } catch (error) {
      console.error("Error updating client status:", error);
      toast.error("Failed to update client status");
      throw error;
    }
  };

  // Update client source
  const updateClientSource = async (clientId: string, sourceId: string) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update({ source_id: sourceId })
        .eq("id", clientId)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const updatedClient = {
          ...snakeToCamel(data[0])
        };
        
        // Update clients state with the updated client
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === clientId ? updatedClient : c))
        );
        
        return updatedClient;
      }
      
      return null;
    } catch (error) {
      console.error("Error updating client source:", error);
      toast.error("Failed to update client source");
      throw error;
    }
  };

  // Update client
  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const snakeCaseUpdates = camelToSnake(updates);
      
      const { data, error } = await supabase
        .from("clients")
        .update(snakeCaseUpdates)
        .eq("id", clientId)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const updatedClient = {
          ...snakeToCamel(data[0])
        };
        
        // Update clients state with the updated client
        setClients((prevClients) =>
          prevClients.map((c) => (c.id === clientId ? updatedClient : c))
        );
        
        return updatedClient;
      }
      
      return null;
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
      throw error;
    }
  };

  // Add client
  const addClient = async (client: Partial<Client>) => {
    try {
      const snakeCaseClient = camelToSnake(client);
      
      const { data, error } = await supabase
        .from("clients")
        .insert(snakeCaseClient)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newClient = {
          ...snakeToCamel(data[0])
        };
        
        // Add new client to state
        setClients((prevClients) => [newClient, ...prevClients]);
        
        return newClient;
      }
      
      return null;
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
      throw error;
    }
  };

  // Delete client
  const deleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) {
        throw error;
      }

      // Remove client from state
      setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
      
      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
      throw error;
    }
  };

  return {
    clients,
    setClients,
    selectedClient,
    setSelectedClient,
    showClientDetails,
    setShowClientDetails,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredClients,
    handleClientClick,
    updateClientStatus,
    updateClientSource,
    updateClient,
    addClient,
    deleteClient,
    fetchClients
  };
} 