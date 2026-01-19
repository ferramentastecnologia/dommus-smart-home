export type AgentRole = 'agent' | 'senior_agent' | 'admin';
export type AgentStatus = 'active' | 'inactive';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
} 