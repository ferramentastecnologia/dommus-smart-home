import React from "react";
import { Lead } from "@/types/crm";
import { ClientInformationCard } from "./ClientInformationCard";
import { StatusDetailsCard } from "./StatusDetailsCard";

interface DialogInfoTabProps {
  lead: Lead;
  isEditing: boolean;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
  agents: { id: string; name: string }[];
}

export function DialogInfoTab({ 
  lead, 
  isEditing, 
  editedLead, 
  setEditedLead, 
  agents 
}: DialogInfoTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Client Information */}
      <ClientInformationCard
        lead={lead}
        isEditing={isEditing}
        editedLead={editedLead}
        setEditedLead={setEditedLead}
      />
      
      {/* Status and Details */}
      <StatusDetailsCard 
        lead={lead} 
        agents={agents} 
        isEditing={isEditing} 
        editedLead={editedLead} 
        setEditedLead={setEditedLead}
      />
    </div>
  );
}
