import React from "react";
import { Lead, LeadStatus } from "@/types/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/Leads/KanbanBoard";
import { LeadsList } from "@/components/Leads/LeadsList";

interface LeadsTabsProps {
  leads: Lead[] | undefined;
  onLeadClick: (lead: Lead) => void;
  onAddLead: (status: LeadStatus) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  searchQuery?: string;
  statusFilter?: string;
  agentFilter?: string;
  viewMode: "list" | "kanban";
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadsTabs({ 
  leads = [], 
  onLeadClick, 
  onAddLead, 
  onStatusChange,
  searchQuery = "",
  statusFilter = "all",
  agentFilter = "all",
  viewMode = "kanban",
  onEditLead,
  onDeleteLead
}: LeadsTabsProps) {
  // Add console log to check lead IDs
  const safeLeads = leads || [];
  
  console.log("LeadsTabs received leads:", safeLeads.length);
  console.log("LeadsTabs onStatusChange is defined:", !!onStatusChange);
  
  // Create a wrapped version of onStatusChange to add logging
  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    console.log(`LeadsTabs handleStatusChange called with leadId: ${leadId}, status: ${status}`);
    onStatusChange(leadId, status);
    console.log(`LeadsTabs handleStatusChange completed call to parent onStatusChange`);
  };
  
  // Filter leads by status and agent
  const filteredLeads = safeLeads.filter(lead => {
    // Safety check for null/undefined leads
    if (!lead) {
      console.warn("Null/undefined lead found in leads array");
      return false;
    }
    
    // Logging for debugging
    if (!lead.status) {
      console.warn(`Lead ${lead.id} has no status:`, lead);
    }
    
    const statusMatch = statusFilter === "all" || lead.status === statusFilter;
    const agentMatch = agentFilter === "all" || 
                    (agentFilter === "unassigned" && !lead.agentId) || 
                    lead.agentId === agentFilter;
    
    return statusMatch && agentMatch;
  });
  
  console.log("Leads in LeadsTabs after filtering:", filteredLeads.length);
  console.log("Filtered from:", safeLeads.length, "to:", filteredLeads.length);
  
  if (filteredLeads.length === 0 && safeLeads.length > 0) {
    console.log("Warning: Filtered all leads out. Check filter criteria.");
  }
  
  return (
    <>
      {viewMode === "kanban" ? (
        <KanbanBoard 
          leads={filteredLeads} 
          onLeadClick={onLeadClick}
          onAddLead={onAddLead}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
        />
      ) : (
        <LeadsList 
          leads={filteredLeads}
          onLeadClick={onLeadClick}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onEditLead={onEditLead}
          onDeleteLead={onDeleteLead}
        />
      )}
    </>
  );
}
