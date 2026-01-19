import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatus } from "@/types/crm";
import { useTaskStatuses } from "@/hooks/useTaskStatuses";

interface TasksFilterProps {
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onPriorityFilterChange: (priority: string) => void;
  onAssigneeFilterChange?: (assignee: string) => void;
  agents?: { id: string; name: string }[];
  userRole?: string;
}

export function TasksFilter({ 
  onSearchChange, 
  onStatusFilterChange, 
  onPriorityFilterChange,
  onAssigneeFilterChange,
  agents = [],
  userRole = 'agent'
}: TasksFilterProps) {
  const { defaultStatuses, getStatusColor } = useTaskStatuses();
  
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex-1">
        <Input
          placeholder="Search tasks..."
          className="w-full"
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
      <Select defaultValue="all" onValueChange={(value) => onPriorityFilterChange(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>
      {userRole === 'admin' && onAssigneeFilterChange && (
        <Select defaultValue="all" onValueChange={(value) => onAssigneeFilterChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
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