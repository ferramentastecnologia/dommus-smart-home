import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, User, Calendar, Clock, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select as SelectUI, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { useLeadSources } from "@/hooks/useLeadSources";

interface StatusDetailsCardProps {
  lead: Lead;
  agents: { id: string; name: string }[];
  isEditing?: boolean;
  editedLead?: Partial<Lead>;
  setEditedLead?: (lead: Partial<Lead>) => void;
}

export function StatusDetailsCard({ 
  lead, 
  agents, 
  isEditing = false, 
  editedLead = {}, 
  setEditedLead = () => {} 
}: StatusDetailsCardProps) {
  const { leadStatuses, getStatusColor } = useLeadStatuses();
  const { leadSources, isLoading: isLoadingSources, getSourceColor } = useLeadSources();
  
  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "dd 'of' MMMM 'of' yyyy 'at' HH:mm", { locale: ptBR });
  };
  
  // Simplified source color lookup
  const getSourceInfo = (sourceName: string | null | undefined) => {
    if (!sourceName) return { name: "Not informed", color: "#64748b" };
    return { 
      name: sourceName,
      color: getSourceColor(sourceName)
    };
  };
  
  const sourceInfo = getSourceInfo(lead.source);
  
  return (
    <Card className="border-t-4 shadow-sm transition-all hover:shadow-md" style={{ borderTopColor: getStatusColor(lead.status) }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Status and Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Field - Editable when in edit mode */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 rounded-full bg-green-50 text-green-600">
            <Tag className="h-5 w-5" />
          </div>
          <div className="w-full">
            <p className="text-sm font-medium">Status</p>
            {!isEditing ? (
              <div className="mt-1">
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getStatusColor(lead.status)}25`,
                    color: getStatusColor(lead.status)
                  }}
                >
                  {lead.status}
                </span>
              </div>
            ) : (
              <div className="mt-1 w-full">
                <SelectUI 
                  value={editedLead.status || lead.status}
                  onValueChange={(value) => {
                    console.log("Status changed:", { 
                      from: editedLead.status || lead.status,
                      to: value,
                      editedLeadBefore: {...editedLead} 
                    });
                    setEditedLead({...editedLead, status: value});
                    console.log("EditedLead after status change:", {
                      status: value,
                      editedLeadAfter: {...editedLead, status: value}
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent aria-describedby="status-selection-description">
                    <span id="status-selection-description" className="sr-only">Select a status for this lead</span>
                    <div className="pb-1 text-xs text-muted-foreground px-2">Select status</div>
                    {leadStatuses.map((status) => (
                      <SelectItem 
                        key={status.id} 
                        value={status.name}
                        className="flex items-center"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: status.color }}
                          />
                          {status.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectUI>
              </div>
            )}
          </div>
        </div>
        
        {/* Source Field - Moved up and editable when in edit mode */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 rounded-full bg-green-50 text-green-600">
            <Globe className="h-5 w-5" />
          </div>
          <div className="w-full">
            <p className="text-sm font-medium">Source</p>
            {!isEditing ? (
              <div className="flex items-center mt-1">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: sourceInfo.color }}
                />
                <p className="text-sm text-muted-foreground">
                  {sourceInfo.name}
                </p>
              </div>
            ) : (
              <div className="mt-1 w-full">
                <SelectUI 
                  value={editedLead.sourceId || lead.sourceId || ""}
                  onValueChange={(value) => {
                    // Se value estiver vazio, limpa o sourceId
                    if (!value) {
                      setEditedLead({...editedLead, sourceId: null});
                      return;
                    }
                    
                    // Atualiza apenas o sourceId, o trigger do banco atualizará o source automaticamente
                    setEditedLead({...editedLead, sourceId: value});
                  }}
                  disabled={isLoadingSources}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not Provided</SelectItem>
                    {leadSources.map((source) => (
                      <SelectItem 
                        key={source.id} 
                        value={source.id}
                        className="flex items-center"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: source.color }}
                          />
                          {source.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectUI>
              </div>
            )}
          </div>
        </div>
        
        {/* Responsible Field - Editable when in edit mode */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 rounded-full bg-green-50 text-green-600">
            <User className="h-5 w-5" />
          </div>
          <div className="w-full">
            <p className="text-sm font-medium">Responsible</p>
            {!isEditing ? (
              <p className="text-sm text-muted-foreground">
                {agents.find(a => a.id === lead.agentId)?.name || "Not assigned"}
              </p>
            ) : (
              <div className="mt-1 w-full">
                <SelectUI 
                  value={editedLead.agentId || lead.agentId || "unassigned"}
                  onValueChange={(value) => setEditedLead({...editedLead, agentId: value === "unassigned" ? "" : value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Not assigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectUI>
              </div>
            )}
          </div>
        </div>
        
        {/* Creation date - Read only */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 rounded-full bg-green-50 text-green-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Creation date</p>
            <p className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</p>
          </div>
        </div>
        
        {/* Last interaction - Read only */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 rounded-full bg-green-50 text-green-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Last interaction</p>
            <p className="text-sm text-muted-foreground">
              {lead.lastInteraction ? formatDate(lead.lastInteraction) : "No interactions"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
