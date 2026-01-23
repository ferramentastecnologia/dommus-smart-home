import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatus } from "@/types/crm";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { Search, Filter, Users } from "lucide-react";

interface LeadsFilterProps {
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onAgentFilterChange: (agentId: string) => void;
  searchQuery: string;
  agents: { id: string; name: string }[];
  userRole?: string;
}

export function LeadsFilter({
  onSearchChange,
  onStatusFilterChange,
  onAgentFilterChange,
  searchQuery,
  agents,
  userRole = 'agent'
}: LeadsFilterProps) {
  const { defaultStatuses, getStatusColor } = useLeadStatuses();

  // Admin e manager podem ver filtro de agentes
  const canFilterByAgent = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar leads..."
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select defaultValue="all" onValueChange={(value) => onStatusFilterChange(value)}>
        <SelectTrigger className="w-[180px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          {defaultStatuses.map(status => (
            <SelectItem
              key={status}
              value={status}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span>{status}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canFilterByAgent && (
        <Select defaultValue="all" onValueChange={(value) => onAgentFilterChange(value)}>
          <SelectTrigger className="w-[200px]">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Responsáveis</SelectItem>
            <SelectItem value="unassigned">Sem Atribuição</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 