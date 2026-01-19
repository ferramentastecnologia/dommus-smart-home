import React, { useState, useEffect } from "react";
import { Client, ClientStatus } from "@/types/Client";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStatus } from "@/contexts/StatusContext";
import { cn } from "@/lib/utils";
import { useDrag, useDrop } from 'react-dnd';
import { ColumnSort } from "@/components/ui/column-sort";

// Type definition for drag item
type DragItem = {
  type: string;
  id: string;
  originalStatusId: string;
};

interface DraggableClientCardProps {
  client: Client;
  onClick: () => void;
  onDrop: (id: string, statusId: string) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

function DraggableClientCard({ client, onClick, onDrop, onEditClient, onDeleteClient }: DraggableClientCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CLIENT',
    item: () => ({ 
      type: 'CLIENT', 
      id: client.id, 
      originalStatusId: client.statusId || ''
    }) as DragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={drag} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-grab active:cursor-grabbing"
      onClick={() => onClick()}
    >
      <Card className="bg-card hover:shadow-md transition-shadow mb-2">
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-medium truncate">
              {client.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEditClient?.(client);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClient?.(client.id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-sm text-muted-foreground">
            {client.email}
          </div>
          {client.company && (
            <div className="text-sm text-muted-foreground mt-1">
              {client.company}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between items-center text-xs text-muted-foreground">
          <div>
            {client.agent?.name ? `Assigned: ${client.agent.name}` : "Unassigned"}
          </div>
          <div>
            {client.notesCount ? `${client.notesCount} notes` : "No notes"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

interface KanbanColumnProps {
  status: ClientStatus;
  clients: Client[];
  onClientClick: (client: Client) => void;
  onAddClient: () => void;
  onDrop: (id: string, statusId: string) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
}

function KanbanColumn({
  status,
  clients,
  onClientClick,
  onAddClient,
  onDrop,
  onEditClient,
  onDeleteClient,
  sortOption,
  onSortChange
}: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CLIENT',
    drop: (item: DragItem) => {
      if (item.originalStatusId !== status.id) {
        onDrop(item.id, status.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  // Sort clients based on the selected option
  const sortedClients = [...clients].sort((a, b) => {
    switch (sortOption) {
      case 'alpha_asc':
        return a.name.localeCompare(b.name);
      case 'alpha_desc':
        return b.name.localeCompare(a.name);
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'position_desc':
        return -1; // New items at top
      case 'position_asc':
      default:
        return 1; // New items at bottom
    }
  });

  const columnStyle = {
    backgroundColor: status.backgroundColor || 'var(--muted)',
    borderColor: status.color ? `${status.color}40` : 'var(--border)', // 40% opacity
  };

  const columnHoverStyle = {
    backgroundColor: status.color ? `${status.color}30` : 'var(--muted)', // 30% opacity
  };

  return (
    <div 
      ref={drop}
      className={cn(
        "flex flex-col rounded-lg border p-3 min-w-80 transition-colors duration-200 h-full max-h-[calc(100vh-200px)]", 
        isOver && "ring-2",
        isOver && `ring-[${status.color}]`
      )}
      style={isOver ? {...columnStyle, ...columnHoverStyle} : columnStyle}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: status.color }} 
          />
          <h3 className="font-medium text-foreground">{status.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-background/40 dark:bg-background/60 px-2 py-0.5 rounded-full">
            {clients.length}
          </span>
          <ColumnSort value={sortOption} onValueChange={onSortChange} />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onAddClient} 
            className="h-6 w-6 hover:bg-background/30"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 overflow-auto flex-1 min-h-[50px]">
        {sortedClients.map((client) => (
          <DraggableClientCard 
            key={client.id} 
            client={client} 
            onClick={() => onClientClick(client)}
            onDrop={onDrop}
            onEditClient={onEditClient}
            onDeleteClient={onDeleteClient}
          />
        ))}
        {clients.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-4">
            No clients in this status
          </div>
        )}
      </div>
    </div>
  );
}

interface ClientsKanbanProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  onAddClient: (statusId: string) => void;
  onStatusChange: (clientId: string, statusId: string) => void;
  searchQuery?: string;
  statusFilter?: string;
  agentFilter?: string;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export function ClientsKanban({
  clients,
  onClientClick,
  onAddClient,
  onStatusChange,
  searchQuery,
  statusFilter,
  agentFilter,
  onEditClient,
  onDeleteClient
}: ClientsKanbanProps) {
  const { clientStatuses } = useStatus();
  const [columns, setColumns] = useState<{ [key: string]: Client[] }>({});
  
  // Track sort option for each column
  const [columnSortOptions, setColumnSortOptions] = useState<Record<string, string>>(() => {
    const options: Record<string, string> = {};
    clientStatuses.forEach(status => {
      options[status.id] = 'position_asc'; // Default sort option
    });
    return options;
  });

  // Filter and organize clients into columns by status
  useEffect(() => {
    const filteredClients = clients.filter((client) => {
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

    // Group clients by status
    const newColumns: { [key: string]: Client[] } = {};
    
    // Initialize empty arrays for all statuses
    clientStatuses.forEach(status => {
      newColumns[status.id] = [];
    });
    
    // Add clients to their respective columns
    filteredClients.forEach(client => {
      const statusId = client.statusId || '';
      if (newColumns[statusId]) {
        newColumns[statusId].push(client);
      } else if (clientStatuses.length > 0) {
        // If client has no status or invalid status, put in first column
        newColumns[clientStatuses[0].id].push(client);
      }
    });
    
    setColumns(newColumns);
  }, [clients, searchQuery, statusFilter, agentFilter, clientStatuses]);

  // Handle client status change
  const handleDrop = (clientId: string, newStatusId: string) => {
    console.log(`Changing status for client ${clientId} to ${newStatusId}`);
    onStatusChange(clientId, newStatusId);
  };

  const handleSortChange = (statusId: string, value: string) => {
    setColumnSortOptions(prev => ({
      ...prev,
      [statusId]: value
    }));
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 p-1 -mx-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      {clientStatuses.map((status) => (
        <KanbanColumn
          key={status.id}
          status={status}
          clients={columns[status.id] || []}
          onClientClick={onClientClick}
          onAddClient={() => onAddClient(status.id)}
          onDrop={handleDrop}
          onEditClient={onEditClient}
          onDeleteClient={onDeleteClient}
          sortOption={columnSortOptions[status.id]}
          onSortChange={(value) => handleSortChange(status.id, value)}
        />
      ))}
    </div>
  );
} 