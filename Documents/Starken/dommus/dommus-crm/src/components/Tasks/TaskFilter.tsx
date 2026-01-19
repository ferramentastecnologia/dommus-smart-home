import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { useTaskStatuses } from "@/hooks/useTaskStatuses";

interface TaskFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
}

export function TaskFilter({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusChange,
  priorityFilter,
  onPriorityChange
}: TaskFilterProps) {
  const { defaultStatuses, getStatusColor } = useTaskStatuses();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-8 w-full sm:w-[250px] border-green-200 focus:border-green-400 focus:ring-green-400"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px] border-green-200 focus:border-green-400 focus:ring-green-400">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
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

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[160px] border-green-200 focus:border-green-400 focus:ring-green-400">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="border-green-200 hover:border-green-300 hover:bg-green-50">
          <Filter size={18} className="text-green-500" />
        </Button>
      </div>
    </div>
  );
}
