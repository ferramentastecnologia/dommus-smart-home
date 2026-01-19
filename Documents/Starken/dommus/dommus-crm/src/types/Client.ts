import { Agent } from "./crm";

export type ClientStatus = string; // Will be dynamically generated from client_statuses table

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  position?: string;
  website?: string;
  status: ClientStatus;
  statusId?: string; // Reference to client_statuses table id
  sourceId?: string;
  source?: string; // Name of the source as text
  agentId?: string;
  agent?: Agent | null;
  notesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientNote {
  id: string;
  content: string;
  client_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClientStatusConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  order_index: number;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
} 