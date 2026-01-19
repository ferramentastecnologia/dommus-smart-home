import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatus } from "@/types/crm";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";

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
  
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex-1">
        <Input
          placeholder="Search leads..."
          className="w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select defaultValue="all" onValueChange={(value) => onStatusFilterChange(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
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
      {userRole === 'admin' && (
        <Select defaultValue="all" onValueChange={(value) => onAgentFilterChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 