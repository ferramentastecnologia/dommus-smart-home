import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsKanban } from "./ClientsKanban";
import { ClientsList } from "./ClientsList";
import { Client, ClientStatus } from "@/types/Client";

interface ClientsTabsProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  onAddClient: (status: ClientStatus) => void;
  onStatusChange: (clientId: string, status: ClientStatus) => void;
  searchQuery: string;
  statusFilter: string;
  agentFilter: string;
  viewMode: "list" | "kanban";
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export function ClientsTabs({
  clients,
  onClientClick,
  onAddClient,
  onStatusChange,
  searchQuery,
  statusFilter,
  agentFilter,
  viewMode,
  onEditClient,
  onDeleteClient
}: ClientsTabsProps) {
  return (
    <div>
      {viewMode === "kanban" ? (
        <ClientsKanban
          clients={clients}
          onClientClick={onClientClick}
          onAddClient={onAddClient}
          onStatusChange={onStatusChange}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          agentFilter={agentFilter}
          onEditClient={onEditClient}
          onDeleteClient={onDeleteClient}
        />
      ) : (
        <ClientsList
          clients={clients}
          onClientClick={onClientClick}
          onStatusChange={onStatusChange}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          agentFilter={agentFilter}
          onEditClient={onEditClient}
          onDeleteClient={onDeleteClient}
        />
      )}
    </div>
  );
} 