import React, { useState, useEffect } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Client, ClientStatus } from "@/types/Client";
import { ClientsFilter } from "@/components/Clients/ClientsFilter";
import { ClientsTabs } from "@/components/Clients/ClientsTabs";
import { ClientDetailsDialog } from "@/components/Clients/ClientDetailsDialog";
import { AddClientDialog } from "@/components/Clients/AddClientDialog";
import { useClientsData } from "@/hooks/useClientsData";
import { toast } from "sonner";
import { Plus, Search, List, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/services/supabase/client";
import { useUser, getUserRole } from "@/hooks/auth/useUser";

export default function Clients() {
  const { user } = useUser();
  const [role, setRole] = useState('agent');
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userRole = await getUserRole(user);
        setRole(userRole);
      }
    };
    fetchUserRole();
  }, [user]);

  const {
    selectedClient,
    showClientDetails,
    setShowClientDetails,
    searchQuery,
    setSearchQuery,
    clients,
    setClients,
    filteredClients,
    handleClientClick,
    updateClientStatus,
    updateClient,
    addClient,
    deleteClient,
    fetchClients
  } = useClientsData();
  
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClientStatus, setNewClientStatus] = useState<ClientStatus>("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name');
          
        if (error) {
          console.error('Error fetching agents:', error);
        } else {
          setAgents(data || []);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    
    fetchAgents();
  }, []);
  
  // Handle status change
  const handleStatusChange = async (clientId: string, status: ClientStatus) => {
    try {
      console.log(`Updating client status: ${clientId} -> ${status}`);
      
      if (!clientId || !status) {
        console.error("Invalid clientId or status in handleStatusChange");
        return;
      }
      
      try {
        const updatedClient = await updateClientStatus(clientId, status);
        console.log("Client status updated successfully:", updatedClient);
        
        // Force update of the clients list to ensure synchronization
        fetchClients();
      } catch (error) {
        console.error("Error updating client status:", error);
        toast.error("Failed to update client status");
      }
    } catch (err) {
      console.error("Error in handleStatusChange:", err);
      toast.error("There was an error updating the client status");
    }
  };

  // Handle edit client
  const handleEditClient = (client: Client) => {
    handleClientClick(client);
  };

  // Handle delete client
  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      toast.success("Client deleted successfully");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    }
  };
  
  const handleAddClient = (status: ClientStatus) => {
    setNewClientStatus(status);
    setIsAddClientOpen(true);
  };
  
  const handleOpenAddClientDialog = () => {
    setNewClientStatus("");
    setIsAddClientOpen(true);
  };
  
  const handleCreateClient = async (newClientData: Partial<Client>): Promise<void> => {
    try {
      // Generate a proper GUID for the client
      const clientId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      console.log("Creating new client with ID:", clientId);
      
      // Handle special values for sourceId and agentId
      const sourceId = newClientData.sourceId === "none" ? null : newClientData.sourceId;
      const agentId = newClientData.agentId === "unassigned" ? null : newClientData.agentId;
      
      const client: Partial<Client> = {
        id: clientId,
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        company: newClientData.company,
        position: newClientData.position,
        website: newClientData.website,
        statusId: newClientData.statusId,
        sourceId: sourceId,
        agentId: agentId,
        createdAt: now,
        updatedAt: now
      };
      
      console.log("Client data being sent to addClient:", client);
      await addClient(client);
      setIsAddClientOpen(false);
      
      toast.success("Client created successfully");
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
      throw error;
    }
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setShowClientDetails(false);
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your clients and their information
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 border rounded-md">
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button 
                variant={viewMode === "kanban" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("kanban")}
                className="rounded-l-none"
              >
                <Layout className="h-4 w-4 mr-1" />
                Kanban
              </Button>
            </div>
            <Button onClick={handleOpenAddClientDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>
        
        <ClientsFilter 
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onAgentFilterChange={setAgentFilter}
          searchQuery={searchQuery}
          agents={agents}
          userRole={role}
        />
        
        <ClientsTabs 
          clients={filteredClients} 
          onClientClick={handleClientClick}
          onAddClient={handleAddClient}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          agentFilter={agentFilter}
          viewMode={viewMode}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
        />
        
        {/* Client Details Dialog */}
        <ClientDetailsDialog
          client={selectedClient}
          isOpen={showClientDetails}
          onClose={handleDialogClose}
          onUpdate={(updatedClient) => {
            setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)));
          }}
        />
        
        {/* Add Client Dialog */}
        <AddClientDialog 
          open={isAddClientOpen}
          onOpenChange={setIsAddClientOpen}
          onAddClient={handleCreateClient}
          defaultStatus={newClientStatus}
        />
      </div>
    </DndProvider>
  );
} 