// CRM type definitions
export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string; // Nome da fonte do lead como texto
  status: LeadStatus;
  statusId?: string; // Reference to lead_statuses table id
  agentId?: string;
  agent?: { id: string; name: string } | null;
  // Notes foram movidas para uma tabela separada
  tasksCount?: number;
  notesCount?: number;
  tags?: Tag[];
  history?: { 
    id?: string; 
    action: string; 
    date: Date; 
    description?: string 
  }[];
  createdAt: Date;
  updatedAt: Date;
  lastInteraction?: Date;
  position?: string;  // Job title
  address?: string;   // Address
  website?: string;   // Website
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string; // Salesperson, Supervisor, etc.
  status: string;   // active, inactive, etc.
  photoUrl?: string;
  role?: string; // For compatibility
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  statusId?: string; // Reference to task_statuses table id
  priority: TaskPriority;
  dueDate: Date;
  assignedTo: string;
  leadId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface Automation {
  id: string;
  name: string;
  triggerStatus: "New" | "Qualified" | "Proposal" | "Closed" | "Lost";
  active: boolean;
  actionType: "email" | "task";
  emailTemplateId?: string;
  taskType?: "Email" | "Call" | "Meeting" | "Other";
  taskDescription?: string;
  taskDueDays?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface EmailLog {
  id: string;
  leadId: string;
  to: string;
  subject: string;
  content: string;
  sentAt: Date;
  status: "sent" | "failed" | "pending";
  error?: string;
}

export interface DashboardStats {
  leadsTotal: number;
  leadsThisMonth: number;
  activeLeads: number;
  conversionRate: number;
  leadsByStatus: {
    status: string;
    count: number;
  }[];
  topAgents: {
    agentId: string;
    name: string;
    leadsCount: number;
    closedLeads: number;
  }[];
  recentLeads: Lead[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: "admin" | "agent";
}

// Add missing types used in components
export type LeadStatus = string; // Will be dynamically generated from lead_statuses table

export interface AgentPerformance {
  id?: string;
  agentId: string;
  name: string;
  photo?: string;
  leadsCount?: number;
  closedLeads?: number;
  conversionRate?: number;
  leadsConverted: number;
  tasksCompleted: number;
}

export type TaskStatus = string; // Will be dynamically generated from task_statuses table

export type TaskPriority = "Low" | "Medium" | "High";

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TagOption {
  label: string;
  value: string;
  color: string;
}

// Adicionar as interfaces para status de leads e tasks
export interface LeadStatusConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  order_index: number;
  is_default: boolean;
  is_converted: boolean;
  is_discarded: boolean;
  created_at: string;
}

export interface TaskStatusConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  order_index: number;
  is_default: boolean;
  is_completed: boolean;
  is_canceled: boolean;
}

// ============================================
// DOMMUS SMART HOME - TIPOS ESPECÍFICOS
// ============================================

// Projetos de Automação
export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  client?: Client;
  status: ProjectStatus;
  statusId?: string;
  type: ProjectType;
  estimatedValue?: number;
  finalValue?: number;
  startDate?: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  agentId?: string;
  agent?: Agent;
  notes?: string;
  rooms?: ProjectRoom[];
  products?: ProjectProduct[];
  quotes?: Quote[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = "Orçamento" | "Aprovado" | "Em Execução" | "Instalação" | "Finalizado" | "Cancelado";
export type ProjectType = "Residencial" | "Comercial" | "Corporativo" | "Academia" | "Hotel" | "Restaurante" | "Outro";

export interface ProjectRoom {
  id: string;
  projectId: string;
  name: string; // Ex: "Sala de Estar", "Home Theater", "Quarto Master"
  description?: string;
  products?: ProjectProduct[];
}

export interface ProjectProduct {
  id: string;
  projectId: string;
  roomId?: string;
  productId: string;
  product?: CatalogProduct;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
  notes?: string;
}

// Catálogo de Produtos
export interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  brand?: string;
  category: ProductCategory;
  subcategory?: string;
  costPrice?: number;
  salePrice: number;
  suggestedMarkup?: number;
  imageUrl?: string;
  specifications?: Record<string, string>;
  supplier?: string;
  inStock: boolean;
  stockQuantity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory =
  | "Automação"
  | "Iluminação"
  | "Áudio"
  | "Vídeo"
  | "Home Theater"
  | "Climatização"
  | "Segurança"
  | "Cortinas"
  | "Infraestrutura"
  | "Acessórios"
  | "Outro";

// Orçamentos
export interface Quote {
  id: string;
  number: string; // Ex: "ORC-2024-001"
  projectId?: string;
  project?: Project;
  clientId: string;
  client?: Client;
  status: QuoteStatus;
  validUntil?: Date;
  items: QuoteItem[];
  subtotal: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  laborCost?: number;
  installationCost?: number;
  totalValue: number;
  notes?: string;
  terms?: string;
  paymentConditions?: string;
  agentId?: string;
  agent?: Agent;
  sentAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus = "Rascunho" | "Enviado" | "Visualizado" | "Aprovado" | "Rejeitado" | "Expirado" | "Convertido";

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId?: string;
  product?: CatalogProduct;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
  room?: string;
}

// Posts do Instagram para o Site
export interface InstagramPost {
  id: string;
  instagramUrl: string;
  imageUrl?: string; // URL local da imagem/thumbnail
  videoUrl?: string; // URL local do vídeo (se for reel)
  caption?: string;
  type: "image" | "video" | "carousel";
  category?: InstagramPostCategory;
  isActive: boolean;
  displayOrder: number;
  showInSection: InstagramSection[];
  createdAt: Date;
  updatedAt: Date;
}

export type InstagramPostCategory = "Residencial" | "Corporativo" | "Home Theater" | "Automação" | "Áudio" | "Geral";
export type InstagramSection = "feed" | "projects" | "hero";

// Cliente (extensão do existente)
export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  cpfCnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: ClientStatus;
  statusId?: string;
  type: "Pessoa Física" | "Pessoa Jurídica";
  source?: string;
  agentId?: string;
  agent?: Agent;
  notes?: string;
  projects?: Project[];
  quotes?: Quote[];
  totalRevenue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientStatus = string;

// Status configs para projetos e orçamentos
export interface ProjectStatusConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  order_index: number;
  is_default: boolean;
  is_completed: boolean;
  is_canceled: boolean;
}

export interface QuoteStatusConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  order_index: number;
  is_default: boolean;
  is_approved: boolean;
  is_rejected: boolean;
}
