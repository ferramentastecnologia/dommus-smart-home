-- =====================================================
-- DOMMUS SMART HOME CRM - CRIAÇÃO DE TABELAS
-- Execute este script PRIMEIRO no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABELA: leads
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Novo',
  status_id UUID,
  agent_id UUID,
  notes TEXT,
  position VARCHAR(255),
  address TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: agents
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(100) DEFAULT 'Vendedor',
  status VARCHAR(50) DEFAULT 'active',
  photo_url TEXT,
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: clients
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  secondary_phone VARCHAR(50),
  cpf_cnpj VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  status VARCHAR(50) DEFAULT 'Ativo',
  status_id UUID,
  type VARCHAR(50) DEFAULT 'Pessoa Física',
  source VARCHAR(100),
  source_id UUID,
  agent_id UUID REFERENCES agents(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: catalog_products
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  brand VARCHAR(100),
  category VARCHAR(100) DEFAULT 'Outro',
  subcategory VARCHAR(100),
  cost_price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  suggested_markup DECIMAL(5,2),
  image_url TEXT,
  specifications JSONB DEFAULT '{}',
  supplier VARCHAR(255),
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: projects
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  status VARCHAR(50) DEFAULT 'Orçamento',
  status_id UUID,
  type VARCHAR(50) DEFAULT 'Residencial',
  estimated_value DECIMAL(12,2),
  final_value DECIMAL(12,2),
  start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  agent_id UUID REFERENCES agents(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: quotes
-- =====================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  status VARCHAR(50) DEFAULT 'Rascunho',
  valid_until DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'fixed',
  labor_cost DECIMAL(12,2) DEFAULT 0,
  installation_cost DECIMAL(12,2) DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  payment_conditions TEXT,
  agent_id UUID REFERENCES agents(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: quote_items
-- =====================================================
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES catalog_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  room VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: instagram_posts
-- =====================================================
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_url TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  caption TEXT,
  type VARCHAR(20) DEFAULT 'image',
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  show_in_sections TEXT[] DEFAULT ARRAY['feed'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: lead_sources (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: lead_statuses (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_converted BOOLEAN DEFAULT false,
  is_discarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: client_statuses (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: task_statuses
-- =====================================================
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pendente',
  status_id UUID,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID,
  client_id UUID,
  project_id UUID,
  lead_id UUID,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: client_notes
-- =====================================================
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_agent_id ON projects(agent_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_display_order ON instagram_posts(display_order);

-- =====================================================
-- HABILITAR RLS (Row Level Security)
-- =====================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS (permitir tudo para usuários autenticados)
-- =====================================================

-- Leads
DROP POLICY IF EXISTS "Allow all for authenticated users" ON leads;
CREATE POLICY "Allow all for authenticated users" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Agents
DROP POLICY IF EXISTS "Allow all for authenticated users" ON agents;
CREATE POLICY "Allow all for authenticated users" ON agents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Clients
DROP POLICY IF EXISTS "Allow all for authenticated users" ON clients;
CREATE POLICY "Allow all for authenticated users" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Catalog Products
DROP POLICY IF EXISTS "Allow all for authenticated users" ON catalog_products;
CREATE POLICY "Allow all for authenticated users" ON catalog_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "Allow all for authenticated users" ON projects;
CREATE POLICY "Allow all for authenticated users" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quotes
DROP POLICY IF EXISTS "Allow all for authenticated users" ON quotes;
CREATE POLICY "Allow all for authenticated users" ON quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quote Items
DROP POLICY IF EXISTS "Allow all for authenticated users" ON quote_items;
CREATE POLICY "Allow all for authenticated users" ON quote_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Instagram Posts
DROP POLICY IF EXISTS "Allow all for authenticated users" ON instagram_posts;
CREATE POLICY "Allow all for authenticated users" ON instagram_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Lead Sources
DROP POLICY IF EXISTS "Allow all for authenticated users" ON lead_sources;
CREATE POLICY "Allow all for authenticated users" ON lead_sources FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Lead Statuses
DROP POLICY IF EXISTS "Allow all for authenticated users" ON lead_statuses;
CREATE POLICY "Allow all for authenticated users" ON lead_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Client Statuses
DROP POLICY IF EXISTS "Allow all for authenticated users" ON client_statuses;
CREATE POLICY "Allow all for authenticated users" ON client_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Task Statuses
DROP POLICY IF EXISTS "Allow all for authenticated users" ON task_statuses;
CREATE POLICY "Allow all for authenticated users" ON task_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tasks
DROP POLICY IF EXISTS "Allow all for authenticated users" ON tasks;
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Client Notes
DROP POLICY IF EXISTS "Allow all for authenticated users" ON client_notes;
CREATE POLICY "Allow all for authenticated users" ON client_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- INSERIR STATUS PADRÃO
-- =====================================================
INSERT INTO lead_statuses (name, color, order_index, is_default)
SELECT 'Novo', '#3b82f6', 0, true
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Novo');

INSERT INTO lead_statuses (name, color, order_index)
SELECT 'Qualificado', '#8b5cf6', 1
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Qualificado');

INSERT INTO lead_statuses (name, color, order_index)
SELECT 'Em Contato', '#f59e0b', 2
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Em Contato');

INSERT INTO lead_statuses (name, color, order_index)
SELECT 'Proposta', '#06b6d4', 3
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Proposta');

INSERT INTO lead_statuses (name, color, order_index, is_converted)
SELECT 'Convertido', '#22c55e', 4, true
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Convertido');

INSERT INTO lead_statuses (name, color, order_index, is_discarded)
SELECT 'Perdido', '#ef4444', 5, true
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Perdido');

-- Client Statuses
INSERT INTO client_statuses (name, color, order_index, is_default)
SELECT 'Ativo', '#22c55e', 0, true
WHERE NOT EXISTS (SELECT 1 FROM client_statuses WHERE name = 'Ativo');

INSERT INTO client_statuses (name, color, order_index)
SELECT 'Prospecto', '#3b82f6', 1
WHERE NOT EXISTS (SELECT 1 FROM client_statuses WHERE name = 'Prospecto');

INSERT INTO client_statuses (name, color, order_index)
SELECT 'Em Negociação', '#f59e0b', 2
WHERE NOT EXISTS (SELECT 1 FROM client_statuses WHERE name = 'Em Negociação');

INSERT INTO client_statuses (name, color, order_index)
SELECT 'Inativo', '#6b7280', 3
WHERE NOT EXISTS (SELECT 1 FROM client_statuses WHERE name = 'Inativo');

-- Lead Sources
INSERT INTO lead_sources (name, color)
SELECT 'Site', '#3b82f6'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'Site');

INSERT INTO lead_sources (name, color)
SELECT 'Instagram', '#e11d48'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'Instagram');

INSERT INTO lead_sources (name, color)
SELECT 'Facebook', '#1877f2'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'Facebook');

INSERT INTO lead_sources (name, color)
SELECT 'Google', '#ea4335'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'Google');

INSERT INTO lead_sources (name, color)
SELECT 'Indicação', '#22c55e'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'Indicação');

INSERT INTO lead_sources (name, color)
SELECT 'LinkedIn', '#0077b5'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'LinkedIn');

INSERT INTO lead_sources (name, color)
SELECT 'Feira', '#8b5cf6'
WHERE NOT EXISTS (SELECT 1 FROM lead_sources WHERE name = 'Feira');

-- Task Statuses
INSERT INTO task_statuses (name, color, order_index, is_default)
SELECT 'Pendente', '#f59e0b', 0, true
WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE name = 'Pendente');

INSERT INTO task_statuses (name, color, order_index)
SELECT 'Em Andamento', '#3b82f6', 1
WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE name = 'Em Andamento');

INSERT INTO task_statuses (name, color, order_index)
SELECT 'Em Revisão', '#8b5cf6', 2
WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE name = 'Em Revisão');

INSERT INTO task_statuses (name, color, order_index)
SELECT 'Concluída', '#22c55e', 3
WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE name = 'Concluída');

INSERT INTO task_statuses (name, color, order_index)
SELECT 'Cancelada', '#ef4444', 4
WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE name = 'Cancelada');

-- =====================================================
SELECT 'Tabelas criadas com sucesso!' AS resultado;
