import React, { useState } from "react";
import { Client, ClientStatus } from "@/types/Client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStatus } from "@/contexts/StatusContext";
import { Edit, Trash, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ClientsListProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  onStatusChange: (clientId: string, status: ClientStatus) => void;
  searchQuery: string;
  statusFilter: string;
  agentFilter: string;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export function ClientsList({
  clients,
  onClientClick,
  onStatusChange,
  searchQuery,
  statusFilter,
  agentFilter,
  onEditClient,
  onDeleteClient
}: ClientsListProps) {
  const { clientStatuses } = useStatus();
  
  // Get status name by ID
  const getStatusName = (statusId: string | undefined) => {
    if (!statusId) return "No Status";
    const status = clientStatuses.find(s => s.id === statusId);
    return status ? status.name : "Unknown Status";
  };
  
  // Get status color by ID
  const getStatusColor = (statusId: string | undefined) => {
    if (!statusId) return "#888888";
    const status = clientStatuses.find(s => s.id === statusId);
    return status ? status.color : "#888888";
  };
  
  // Filter clients based on search query, status filter, and agent filter
  const filteredClients = clients.filter(client => {
    // Apply status filter
    if (statusFilter !== "all" && client.statusId !== statusFilter) {
      return false;
    }
    
    // Apply agent filter
    if (agentFilter !== "all" && client.agentId !== agentFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[150px]">Phone</TableHead>
            <TableHead className="w-[150px]">Company</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[150px]">Agent</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.map((client) => (
              <TableRow 
                key={client.id}
                className="cursor-pointer"
                onClick={() => onClientClick(client)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.company || "-"}</TableCell>
                <TableCell>
                  <Badge 
                    style={{ 
                      backgroundColor: getStatusColor(client.statusId),
                      color: "#ffffff" 
                    }}
                  >
                    {getStatusName(client.statusId)}
                  </Badge>
                </TableCell>
                <TableCell>{client.agent?.name || "Unassigned"}</TableCell>
                <TableCell>
                  {client.createdAt 
                    ? format(new Date(client.createdAt), "MMM d, yyyy") 
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEditClient(client);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClient(client.id);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 