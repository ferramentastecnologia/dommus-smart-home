import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Building, Calendar, Mail, Phone, User } from "lucide-react";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { useLeadSources } from "@/hooks/useLeadSources";

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { getStatusColor, getStatusBackgroundColor } = useLeadStatuses();
  const { getSourceById, isLoading: isLoadingSources } = useLeadSources();
  
  const statusColor = getStatusColor(lead.status);
  const statusBgColor = getStatusBackgroundColor(lead.status);
  
  const badgeStyle = {
    backgroundColor: statusBgColor || 'bg-gray-100',
    color: statusColor || 'text-gray-800',
  };
  
  const iconStyle = {
    color: statusColor || '#71717a',
  };
  
  const gradientStyle = {
    background: `linear-gradient(to right, ${statusBgColor}40, ${statusBgColor}60)`,
  };
  
  const footerStyle = {
    backgroundColor: `${statusBgColor}30`,
  };

  // Obter o nome da fonte a partir do ID
  let sourceName = lead.source || "Not Provided";
  
  // Usar o hook para buscar o nome da fonte pelo ID
  if (!isLoadingSources && lead.sourceId) {
    const sourceObj = getSourceById(lead.sourceId);
    if (sourceObj) {
      sourceName = sourceObj.name;
    }
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-0 shadow-sm"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="p-3 flex items-start justify-between" style={gradientStyle}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <User size={14} style={iconStyle} />
              <h3 className="font-medium text-foreground">{lead.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building size={12} style={iconStyle} />
              <span>{lead.company}</span>
            </div>
          </div>
          <Badge style={badgeStyle}>
            {lead.status}
          </Badge>
        </div>
        
        <div className="px-3 py-2">
          <div className="grid grid-cols-1 gap-1 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail size={12} style={iconStyle} />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={12} style={iconStyle} />
              <span>{lead.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center px-3 py-1.5 text-[10px] text-muted-foreground" style={footerStyle}>
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{format(lead.createdAt, "dd/MM/yyyy")}</span>
          </div>
          <span className="bg-background dark:bg-background/50 px-1.5 py-0.5 rounded-full text-[10px] border text-foreground">{sourceName}</span>
        </div>
      </CardContent>
    </Card>
  );
}
