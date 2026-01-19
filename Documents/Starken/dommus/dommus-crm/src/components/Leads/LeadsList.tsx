import React from "react";
import { Lead, LeadStatus } from "@/types/crm";
import { LeadCard } from "./LeadCard";
import { LeadsListView } from "./LeadsListView";

interface LeadsListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  searchQuery?: string;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadsList({ 
  leads, 
  onLeadClick, 
  onStatusChange, 
  searchQuery = "",
  onEditLead,
  onDeleteLead
}: LeadsListProps) {
  return (
    <LeadsListView 
      leads={leads}
      onLeadClick={onLeadClick}
      onStatusChange={onStatusChange}
      searchQuery={searchQuery}
      onEditLead={onEditLead}
      onDeleteLead={onDeleteLead}
    />
  );
}
