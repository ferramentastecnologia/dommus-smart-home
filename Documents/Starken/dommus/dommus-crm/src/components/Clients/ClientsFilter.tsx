import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/services/supabase/client";
import { useStatus } from "@/contexts/StatusContext";

interface ClientsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAgentFilterChange: (value: string) => void;
  agents?: { id: string; name: string }[];
  userRole?: string;
}

export function ClientsFilter({
  searchQuery,
  onSearchChange,
  onStatusFilterChange,
  onAgentFilterChange,
  agents = [],
  userRole = 'agent'
}: ClientsFilterProps) {
  const { clientStatuses } = useStatus();
  
  return (
    <Card className="border rounded-lg">
      <CardContent className="px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 flex-1 sm:flex-[0.7]">
            <div className="w-1/2">
              <Label htmlFor="status-filter" className="sr-only">
                Filter by status
              </Label>
              <Select onValueChange={onStatusFilterChange} defaultValue="all">
                <SelectTrigger id="status-filter" className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {clientStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userRole === 'admin' && (
              <div className="w-1/2">
                <Label htmlFor="agent-filter" className="sr-only">
                  Filter by agent
                </Label>
                <Select onValueChange={onAgentFilterChange} defaultValue="all">
                  <SelectTrigger id="agent-filter" className="h-10">
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 