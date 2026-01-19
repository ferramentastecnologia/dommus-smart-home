
import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit } from "lucide-react";

interface LeadHeaderProps {
  lead: Lead;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSaveEdit: () => void;
}

export function LeadHeader({ lead, isEditing, setIsEditing, handleSaveEdit }: LeadHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-2 mb-6">
      <Button 
        variant="ghost" 
        className="rounded-full" 
        onClick={() => navigate("/leads")}
      >
        <ChevronLeft size={20} />
      </Button>
      <h1 className="text-3xl font-bold">
        {lead.name}
        <span className="ml-2 text-base font-normal text-muted-foreground">{lead.company}</span>
      </h1>
      
      <div className="ml-auto flex space-x-2">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit size={16} className="mr-2" /> Editar
          </Button>
        ) : (
          <>
            <Button onClick={() => setIsEditing(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
