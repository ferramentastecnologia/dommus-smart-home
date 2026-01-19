import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, LeadStatusConfig } from "@/types/crm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentLeadsListProps {
  leads: any[];
  statusConfigs: LeadStatusConfig[];
}

const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export function RecentLeadsList({ leads, statusConfigs }: RecentLeadsListProps) {
  // Preparar um mapa de cores de status para acesso rápido
  const statusColorMap = statusConfigs.reduce((acc, status) => {
    acc[status.name.toLowerCase()] = status.color;
    return acc;
  }, {} as Record<string, string>);

  // Obter o nome do status a partir do lead
  const getStatusName = (lead: any): string => {
    if (lead.lead_statuses && lead.lead_statuses.name) {
      return lead.lead_statuses.name;
    }
    
    // Fallback para o status_id
    if (lead.status_id) {
      const matchingStatus = statusConfigs.find(s => s.id === lead.status_id);
      if (matchingStatus) return matchingStatus.name;
    }
    
    return "Unknown";
  };

  // Obter a cor do status
  const getStatusColor = (lead: any): string => {
    const statusName = getStatusName(lead).toLowerCase();
    return statusColorMap[statusName] || "#888888";
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Recent Leads</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {leads.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No leads to display</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback style={{ backgroundColor: getStatusColor(lead), color: "#FFF" }}>
                    {lead.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{lead.name || "No name"}</p>
                    <span className="text-xs text-muted-foreground">
                      {lead.created_at 
                        ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }) 
                        : "Unknown date"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{lead.email || "No email"}</p>
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: `${getStatusColor(lead)}20`, 
                        color: getStatusColor(lead),
                        borderColor: `${getStatusColor(lead)}40`
                      }}
                    >
                      {getStatusName(lead)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
