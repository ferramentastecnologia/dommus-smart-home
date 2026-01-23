import React, { useState, useEffect } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Lead, LeadStatus } from "@/types/crm";
import { SearchBar } from "@/components/Leads/SearchBar";
import { LeadsHeader } from "@/components/Leads/LeadsHeader";
import { LeadDetailsDialog } from "@/components/Leads/LeadDetailsDialog";
import { LeadsTabs } from "@/components/Leads/LeadsTabs";
import { AddLeadDialog } from "@/components/Leads/AddLeadDialog";
import { useLeadsData } from "@/hooks/useLeadsData";
import { toast } from "sonner";
import { Plus, Search, List, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadsFilter } from "@/components/Leads/LeadsFilter";
import { supabase } from "@/services/supabase/client";
import { useUser, getUserRole } from "@/hooks/auth/useUser";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";

export default function Leads() {
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
    selectedLead,
    showLeadDetails,
    setShowLeadDetails,
    searchQuery,
    setSearchQuery,
    leads,
    setLeads,
    filteredLeads,
    handleLeadClick,
    handleStatusChange: originalHandleStatusChange,
    handleLeadUpdate,
    addLead,
    deleteLead,
    fetchLeads,
    updateLeadStatus,
    updateLeadSource,
    updateLead
  } = useLeadsData();
  
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLeadStatus, setNewLeadStatus] = useState<LeadStatus>("New");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  // Log leads when component mounts to check if we have correct IDs
  useEffect(() => {
    console.log("Leads page - Current leads state:", leads);
    if (leads.length > 0) {
      console.log("Leads loaded in Leads page:", 
        leads.map(lead => ({ id: lead.id, name: lead.name, status: lead.status }))
      );
    } else {
      console.log("No leads found in leads state. Checking filteredLeads:", filteredLeads);
    }
  }, [leads, filteredLeads]);
  
  // After the leads are loaded, add this log:
  useEffect(() => {
    console.log("Lead IDs in UI:", leads.map(lead => lead.id));
  }, [leads]);
  
  // Wrap handleStatusChange to add extra logging and ensure leads are refreshed if needed
  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      console.log(`Updating lead status: ${leadId} -> ${status}`);
      
      if (!leadId || !status) {
        console.error("Invalid leadId or status in handleStatusChange");
        return;
      }
      
      // IMPORTANTE: Não verificar se o lead existe localmente antes de atualizar
      // Vamos direto chamar a função updateLeadStatus que agora está mais robusta
      try {
        const updatedLead = await updateLeadStatus(leadId, status);
        console.log("Lead status updated successfully:", updatedLead);

        // Forçar atualização da lista de leads para garantir sincronização
        fetchLeads();
        toast.success("Status atualizado com sucesso!");
      } catch (error) {
        console.error("Error updating lead status:", error);
        toast.error("Erro ao atualizar status do lead");
      }
    } catch (err) {
      console.error("Error in handleStatusChange:", err);
      toast.error("Erro ao atualizar status do lead");
    }
  };

  // Handle edit lead - opens the dialog in edit mode
  const handleEditLead = (lead: Lead) => {
    handleLeadClick(lead);
    setIsEditing(true);
  };

  // Handle delete lead
  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast.success("Lead excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };
  
  const handleAddLead = (status: LeadStatus) => {
    setNewLeadStatus(status);
    setIsAddLeadOpen(true);
  };
  
  const handleOpenAddLeadDialog = () => {
    setNewLeadStatus("New");
    setIsAddLeadOpen(true);
  };
  
  const handleCreateLead = async (leadData: Partial<Lead>) => {
    try {
      const newLead = {
        id: crypto.randomUUID(),
        ...leadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addLead(newLead);
      setIsAddLeadOpen(false);
      toast.success("Lead criado com sucesso!");
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error("Erro ao criar lead");
    }
  };
  
  // Handle dialog close and reset editing mode
  const handleDialogClose = () => {
    setShowLeadDetails(false);
    setIsEditing(false);
  };
  
  const handleSaveEdit = async () => {
    setIsSaving(true);
    
    try {
      console.log(`**DEBUG** Lead a ser atualizado:`, { leadId: selectedLead?.id, editedLead });
      
      // Verificação especial para source/sourceId
      if (editedLead.source || editedLead.sourceId) {
        console.log(`**DEBUG** Detectada alteração em source/sourceId:`, { 
          source: editedLead.source, 
          sourceId: editedLead.sourceId 
        });
      }
      
      if (selectedLead?.id && editedLead) {
        // Se temos um sourceId, usar a função específica para atualizar source
        if (editedLead.sourceId !== undefined) {
          console.log(`**DEBUG** Usando updateLeadSource para atualizar sourceId: ${editedLead.sourceId}`);
          await updateLeadSource(selectedLead.id, editedLead.sourceId);
          
          // Remover sourceId e source do editedLead para evitar duplicação
          const { sourceId, source, ...restOfEdits } = editedLead;
          
          // Se só tinha source para atualizar, não precisa chamar updateLead
          if (Object.keys(restOfEdits).length === 0) {
            console.log(`**DEBUG** Apenas source foi atualizado, pulando updateLead`);
            setIsSaving(false);
            setIsEditing(false);
            setEditedLead({});
            return;
          }
          
          // Continuar com as outras alterações
          console.log(`**DEBUG** Continuando com outras alterações:`, restOfEdits);
          // Atualizar o lead com as mudanças restantes (sem sourceId/source)
          const updatedLead = await updateLead(selectedLead.id, restOfEdits);
          console.log(`**DEBUG** Lead atualizado com sucesso:`, updatedLead);
        } else {
          // Atualizar o lead com todas as mudanças
          const updatedLead = await updateLead(selectedLead.id, editedLead);
          console.log(`**DEBUG** Lead atualizado com sucesso:`, updatedLead);
        }
      }
      
      setIsEditing(false);
      setEditedLead({});
      
      toast.success("Lead atualizado com sucesso!");
    } catch (error) {
      console.error("**DEBUG** Erro ao atualizar lead:", error);
      toast.error("Erro ao atualizar lead.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">
              Gerencie seus leads e oportunidades de vendas
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
                Lista
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
            <Button onClick={handleOpenAddLeadDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </div>
        </div>
        
        <LeadsFilter 
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onAgentFilterChange={setAgentFilter}
          searchQuery={searchQuery}
          agents={agents}
          userRole={role}
        />
        
        <LeadsTabs 
          leads={filteredLeads} 
          onLeadClick={handleLeadClick}
          onAddLead={handleAddLead}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          agentFilter={agentFilter}
          viewMode={viewMode}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
        />
        
        {/* Lead Details Dialog */}
        <LeadDetailsDialog
          lead={selectedLead}
          isOpen={showLeadDetails}
          onClose={handleDialogClose}
          onUpdate={(updatedLead) => {
            setLeads(leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)));
          }}
        />
        
        {/* Add Lead Dialog */}
        <AddLeadDialog
          open={isAddLeadOpen}
          onOpenChange={setIsAddLeadOpen}
          onAddLead={handleCreateLead}
        />
      </div>
    </DndProvider>
  );
}
