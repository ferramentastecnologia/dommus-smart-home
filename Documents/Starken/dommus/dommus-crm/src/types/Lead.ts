export type LeadStatus = 'new' | 'in_progress' | 'qualified' | 'closed_won' | 'closed_lost';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assigned_agent_id: string;
  created_at: string;
  updated_at: string;
} 