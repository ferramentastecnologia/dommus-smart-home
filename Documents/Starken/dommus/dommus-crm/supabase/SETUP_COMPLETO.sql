-- =====================================================
-- DOMMUS SMART HOME CRM - SETUP COMPLETO
-- Execute este script INTEIRO no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABELAS DE STATUS
-- =====================================================

-- Lead Statuses
CREATE TABLE IF NOT EXISTS lead_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#888888',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_converted BOOLEAN DEFAULT false,
  is_discarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Statuses
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#888888',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  is_canceled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Statuses
CREATE TABLE IF NOT EXISTS client_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#888888',
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE AGENTS (Equipe)
-- =====================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'manager', 'agent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice único para email (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agents_email') THEN
    CREATE UNIQUE INDEX idx_agents_email ON agents(email);
  END IF;
END $$;

-- =====================================================
-- 3. TABELA DE ADMIN EMAILS (Gerenciamento de Admins)
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  added_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE LEAD SOURCES
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE LEADS
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  website TEXT,
  address TEXT,
  status TEXT DEFAULT 'Novo',
  status_id UUID REFERENCES lead_statuses(id),
  source TEXT,
  source_id UUID REFERENCES lead_sources(id),
  agent_id UUID REFERENCES agents(id),
  assigned_to UUID,
  notes TEXT,
  tags TEXT[],
  last_interaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_status_id ON leads(status_id);
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- =====================================================
-- 6. TABELA DE TASKS
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pendente',
  status_id UUID REFERENCES task_statuses(id),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  assigned_to UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- =====================================================
-- 7. TABELA DE NOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES agents(id),
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);

-- =====================================================
-- 8. TABELA DE CLIENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  document TEXT,
  type TEXT DEFAULT 'Pessoa Física' CHECK (type IN ('Pessoa Física', 'Pessoa Jurídica')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  status TEXT DEFAULT 'Ativo',
  status_id UUID REFERENCES client_statuses(id),
  agent_id UUID REFERENCES agents(id),
  lead_id UUID REFERENCES leads(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- =====================================================
-- 9. TABELA DE PROJECTS
-- =====================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  agent_id UUID REFERENCES agents(id),
  status TEXT DEFAULT 'Orçamento' CHECK (status IN ('Orçamento', 'Aprovado', 'Em Execução', 'Instalação', 'Finalizado', 'Cancelado')),
  type TEXT DEFAULT 'Residencial' CHECK (type IN ('Residencial', 'Comercial', 'Industrial', 'Condomínio')),
  address TEXT,
  estimated_value DECIMAL(12, 2),
  final_value DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_agent_id ON projects(agent_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- =====================================================
-- 10. TABELA DE CATALOG PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS catalog_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  sku TEXT UNIQUE,
  cost_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products(category);

-- =====================================================
-- 11. TABELA DE QUOTES (Orçamentos)
-- =====================================================

CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  agent_id UUID REFERENCES agents(id),
  status TEXT DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Enviado', 'Aprovado', 'Rejeitado', 'Expirado')),
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  valid_until DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- =====================================================
-- 12. TABELA DE QUOTE ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES catalog_products(id),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

-- =====================================================
-- 13. TABELA DE INSTAGRAM POSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_id TEXT,
  caption TEXT,
  image_url TEXT,
  permalink TEXT,
  post_type TEXT DEFAULT 'feed' CHECK (post_type IN ('feed', 'story', 'reel')),
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendado', 'publicado')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. TABELA DE SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_website TEXT,
  company_address TEXT,
  company_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- =====================================================
-- 15. TABELA DE LEAD HISTORY (Timeline)
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  user_id UUID,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id ON lead_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_created_at ON lead_history(created_at DESC);

-- =====================================================
-- 16. INSERIR DADOS PADRÃO
-- =====================================================

-- Lead Statuses
INSERT INTO lead_statuses (name, color, order_index, is_default, is_converted, is_discarded) VALUES
  ('Novo', '#3b82f6', 0, true, false, false),
  ('Qualificado', '#8b5cf6', 1, false, false, false),
  ('Em Contato', '#f59e0b', 2, false, false, false),
  ('Proposta', '#06b6d4', 3, false, false, false),
  ('Convertido', '#22c55e', 4, false, true, false),
  ('Perdido', '#ef4444', 5, false, false, true)
ON CONFLICT DO NOTHING;

-- Task Statuses
INSERT INTO task_statuses (name, color, order_index, is_default, is_completed, is_canceled) VALUES
  ('Pendente', '#f59e0b', 0, true, false, false),
  ('Em Andamento', '#3b82f6', 1, false, false, false),
  ('Concluída', '#22c55e', 2, false, true, false),
  ('Cancelada', '#ef4444', 3, false, false, true)
ON CONFLICT DO NOTHING;

-- Client Statuses
INSERT INTO client_statuses (name, color, order_index, is_default) VALUES
  ('Ativo', '#22c55e', 0, true),
  ('Prospecto', '#3b82f6', 1, false),
  ('Em Negociação', '#f59e0b', 2, false),
  ('Inativo', '#6b7280', 3, false)
ON CONFLICT DO NOTHING;

-- Lead Sources
INSERT INTO lead_sources (name, color) VALUES
  ('Site', '#3b82f6'),
  ('Instagram', '#e1306c'),
  ('Facebook', '#1877f2'),
  ('Google', '#4285f4'),
  ('Indicação', '#22c55e'),
  ('WhatsApp', '#25d366'),
  ('Telefone', '#6366f1'),
  ('Evento', '#f59e0b'),
  ('Outro', '#6b7280')
ON CONFLICT DO NOTHING;

-- Admin inicial - Ferramentas Starken
INSERT INTO admin_emails (email, notes) VALUES
  ('ferramentas.starken@gmail.com', 'Admin principal - Ferramentas Tecnologia')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 17. HABILITAR RLS (Row Level Security)
-- =====================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 18. POLÍTICAS RLS
-- =====================================================

-- Agents
DROP POLICY IF EXISTS "Allow all for authenticated" ON agents;
CREATE POLICY "Allow all for authenticated" ON agents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Leads
DROP POLICY IF EXISTS "Allow all for authenticated" ON leads;
CREATE POLICY "Allow all for authenticated" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tasks
DROP POLICY IF EXISTS "Allow all for authenticated" ON tasks;
CREATE POLICY "Allow all for authenticated" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notes
DROP POLICY IF EXISTS "Allow all for authenticated" ON notes;
CREATE POLICY "Allow all for authenticated" ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Clients
DROP POLICY IF EXISTS "Allow all for authenticated" ON clients;
CREATE POLICY "Allow all for authenticated" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "Allow all for authenticated" ON projects;
CREATE POLICY "Allow all for authenticated" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quotes
DROP POLICY IF EXISTS "Allow all for authenticated" ON quotes;
CREATE POLICY "Allow all for authenticated" ON quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quote Items
DROP POLICY IF EXISTS "Allow all for authenticated" ON quote_items;
CREATE POLICY "Allow all for authenticated" ON quote_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Catalog Products
DROP POLICY IF EXISTS "Allow all for authenticated" ON catalog_products;
CREATE POLICY "Allow all for authenticated" ON catalog_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Lead Statuses (público para leitura)
DROP POLICY IF EXISTS "Allow read for all" ON lead_statuses;
CREATE POLICY "Allow read for all" ON lead_statuses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write for authenticated" ON lead_statuses;
CREATE POLICY "Allow write for authenticated" ON lead_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Task Statuses
DROP POLICY IF EXISTS "Allow read for all" ON task_statuses;
CREATE POLICY "Allow read for all" ON task_statuses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write for authenticated" ON task_statuses;
CREATE POLICY "Allow write for authenticated" ON task_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Client Statuses
DROP POLICY IF EXISTS "Allow read for all" ON client_statuses;
CREATE POLICY "Allow read for all" ON client_statuses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write for authenticated" ON client_statuses;
CREATE POLICY "Allow write for authenticated" ON client_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Lead Sources
DROP POLICY IF EXISTS "Allow read for all" ON lead_sources;
CREATE POLICY "Allow read for all" ON lead_sources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write for authenticated" ON lead_sources;
CREATE POLICY "Allow write for authenticated" ON lead_sources FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings
DROP POLICY IF EXISTS "Allow all for authenticated" ON settings;
CREATE POLICY "Allow all for authenticated" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Lead History
DROP POLICY IF EXISTS "Allow all for authenticated" ON lead_history;
CREATE POLICY "Allow all for authenticated" ON lead_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Instagram Posts
DROP POLICY IF EXISTS "Allow all for authenticated" ON instagram_posts;
CREATE POLICY "Allow all for authenticated" ON instagram_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin Emails - leitura pública, escrita apenas para autenticados
DROP POLICY IF EXISTS "Allow read for all" ON admin_emails;
CREATE POLICY "Allow read for all" ON admin_emails FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write for authenticated" ON admin_emails;
CREATE POLICY "Allow write for authenticated" ON admin_emails FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 19. DADOS DE TESTE - AUTOMAÇÃO RESIDENCIAL
-- =====================================================

-- Produtos do catálogo de automação
INSERT INTO catalog_products (name, description, category, brand, sale_price, cost_price, stock_quantity) VALUES
  ('Kit Iluminação Inteligente', 'Kit com 4 lâmpadas LED RGB Wi-Fi + controlador', 'Iluminação', 'Dommus', 899.00, 450.00, 50),
  ('Interruptor Touch 4 Canais', 'Interruptor de vidro touch screen 4 canais', 'Iluminação', 'Dommus', 299.00, 150.00, 100),
  ('Dimmer Inteligente', 'Dimmer Wi-Fi para controle de intensidade', 'Iluminação', 'Dommus', 199.00, 100.00, 80),
  ('Fechadura Digital Biométrica', 'Fechadura com biometria, senha e app', 'Segurança', 'Yale', 1899.00, 1200.00, 30),
  ('Câmera IP 360', 'Câmera de segurança Wi-Fi com visão 360 graus', 'Segurança', 'Intelbras', 599.00, 350.00, 60),
  ('Sensor de Presença PIR', 'Sensor de movimento infravermelho', 'Segurança', 'Dommus', 149.00, 75.00, 120),
  ('Central de Automação', 'Hub central para integração de dispositivos', 'Automação', 'Dommus', 1299.00, 700.00, 25),
  ('Tomada Inteligente 10A', 'Tomada Wi-Fi com medição de consumo', 'Automação', 'Dommus', 129.00, 65.00, 150),
  ('Ar Condicionado Split Inverter', 'Split 12000 BTUs Wi-Fi integrado', 'Climatização', 'Samsung', 2899.00, 2000.00, 20),
  ('Controlador IR Universal', 'Controla TVs, ar-condicionado via Wi-Fi', 'Automação', 'Broadlink', 199.00, 100.00, 80),
  ('Cortina Motorizada', 'Motor para cortinas com controle por app', 'Conforto', 'Somfy', 1499.00, 900.00, 15),
  ('Assistente Virtual Alexa', 'Echo Dot 5a geração', 'Assistentes', 'Amazon', 399.00, 280.00, 100),
  ('Termostato Inteligente', 'Controle de temperatura por app', 'Climatização', 'Nest', 899.00, 600.00, 25),
  ('Campainha com Câmera', 'Video doorbell Wi-Fi HD', 'Segurança', 'Ring', 799.00, 500.00, 40),
  ('Sistema de Som Multiroom', 'Caixa de som Wi-Fi para ambientes', 'Audio', 'Sonos', 1299.00, 850.00, 30)
ON CONFLICT DO NOTHING;

-- Leads de exemplo
INSERT INTO leads (name, email, phone, company, status, source, address) VALUES
  ('Carlos Mendes', 'carlos.mendes@email.com', '(47) 99123-4567', 'Residencial', 'Novo', 'Site', 'Rua das Palmeiras, 123 - Blumenau/SC'),
  ('Ana Paula Silva', 'anapaula@empresa.com.br', '(47) 98765-4321', 'Silva Incorporadora', 'Qualificado', 'Instagram', 'Av. Brasil, 500 - Joinville/SC'),
  ('Roberto Almeida', 'roberto.almeida@gmail.com', '(47) 99876-5432', 'Residencial', 'Em Contato', 'Indicação', 'Rua XV de Novembro, 800 - Blumenau/SC'),
  ('Fernanda Costa', 'fernanda.costa@hotmail.com', '(47) 98234-5678', 'Costa Construções', 'Proposta', 'Google', 'Rua Hermann Hering, 1200 - Blumenau/SC'),
  ('Marcos Oliveira', 'marcos@oliveira.com', '(47) 99345-6789', 'Residencial', 'Novo', 'Facebook', 'Rua Bahia, 450 - Itajai/SC'),
  ('Patricia Santos', 'patricia.santos@outlook.com', '(47) 98456-7890', 'Residencial', 'Qualificado', 'WhatsApp', 'Av. Atlantica, 2000 - Balneario Camboriu/SC'),
  ('Eduardo Lima', 'eduardo.lima@empresa.com', '(47) 99567-8901', 'Lima Engenharia', 'Em Contato', 'Evento', 'Rua Sao Paulo, 300 - Florianopolis/SC'),
  ('Juliana Ferreira', 'juliana@ferreira.com.br', '(47) 98678-9012', 'Residencial', 'Proposta', 'Site', 'Rua Amazonas, 150 - Blumenau/SC'),
  ('Ricardo Gomes', 'ricardo.gomes@gmail.com', '(47) 99789-0123', 'Gomes e Associados', 'Convertido', 'Indicação', 'Av. Beira Mar, 3500 - Florianopolis/SC'),
  ('Camila Rodrigues', 'camila.r@yahoo.com', '(47) 98890-1234', 'Residencial', 'Perdido', 'Instagram', 'Rua Itajai, 890 - Blumenau/SC')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT 'Setup completo executado com sucesso!' as resultado;
