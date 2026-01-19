-- ============================================
-- DOMMUS SMART HOME - SCHEMA DO BANCO DE DADOS
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS BASE (AGENTES E CLIENTES)
-- ============================================

-- Agentes/Usuários do sistema
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    position VARCHAR(100) DEFAULT 'Vendedor',
    status VARCHAR(50) DEFAULT 'active',
    photo_url TEXT,
    role VARCHAR(50) DEFAULT 'agent',
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Status de Clientes
CREATE TABLE IF NOT EXISTS client_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6366f1',
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_active_client BOOLEAN DEFAULT false,
    is_inactive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir status padrão de clientes
INSERT INTO client_statuses (name, color, order_index, is_default, is_active_client, is_inactive) VALUES
    ('Prospect', '#f59e0b', 0, true, false, false),
    ('Ativo', '#22c55e', 1, false, true, false),
    ('Inativo', '#6b7280', 2, false, false, true),
    ('VIP', '#8b5cf6', 3, false, true, false)
ON CONFLICT DO NOTHING;

-- Clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    secondary_phone VARCHAR(50),
    cpf_cnpj VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    status VARCHAR(100) DEFAULT 'Prospect',
    status_id UUID REFERENCES client_statuses(id),
    type VARCHAR(50) DEFAULT 'Pessoa Física',
    source VARCHAR(100),
    source_id UUID,
    agent_id UUID REFERENCES agents(id),
    notes TEXT,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_agent ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status_id);

-- Notas de Clientes
CREATE TABLE IF NOT EXISTS client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);

-- ============================================
-- TABELAS DE STATUS
-- ============================================

-- Status de Projetos
CREATE TABLE IF NOT EXISTS project_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6366f1',
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    is_canceled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir status padrão de projetos
INSERT INTO project_statuses (name, color, order_index, is_default, is_completed, is_canceled) VALUES
    ('Orçamento', '#f59e0b', 0, true, false, false),
    ('Aprovado', '#10b981', 1, false, false, false),
    ('Em Execução', '#3b82f6', 2, false, false, false),
    ('Instalação', '#8b5cf6', 3, false, false, false),
    ('Finalizado', '#22c55e', 4, false, true, false),
    ('Cancelado', '#ef4444', 5, false, false, true)
ON CONFLICT DO NOTHING;

-- Status de Orçamentos
CREATE TABLE IF NOT EXISTS quote_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6366f1',
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    is_rejected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir status padrão de orçamentos
INSERT INTO quote_statuses (name, color, order_index, is_default, is_approved, is_rejected) VALUES
    ('Rascunho', '#6b7280', 0, true, false, false),
    ('Enviado', '#3b82f6', 1, false, false, false),
    ('Visualizado', '#f59e0b', 2, false, false, false),
    ('Aprovado', '#22c55e', 3, false, true, false),
    ('Rejeitado', '#ef4444', 4, false, false, true),
    ('Expirado', '#9ca3af', 5, false, false, false),
    ('Convertido', '#10b981', 6, false, true, false)
ON CONFLICT DO NOTHING;

-- Categorias de Produtos
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO product_categories (name, icon, order_index) VALUES
    ('Automação', 'cpu', 0),
    ('Iluminação', 'lightbulb', 1),
    ('Áudio', 'speaker', 2),
    ('Vídeo', 'tv', 3),
    ('Home Theater', 'film', 4),
    ('Climatização', 'thermometer', 5),
    ('Segurança', 'shield', 6),
    ('Cortinas', 'blinds', 7),
    ('Infraestrutura', 'cable', 8),
    ('Acessórios', 'box', 9)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATÁLOGO DE PRODUTOS
-- ============================================

CREATE TABLE IF NOT EXISTS catalog_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    brand VARCHAR(100),
    category_id UUID REFERENCES product_categories(id),
    category VARCHAR(100), -- Para compatibilidade
    subcategory VARCHAR(100),
    cost_price DECIMAL(10,2),
    sale_price DECIMAL(10,2) NOT NULL,
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

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category ON catalog_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON catalog_products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON catalog_products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON catalog_products(is_active);

-- ============================================
-- PROJETOS
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id),
    status_id UUID REFERENCES project_statuses(id),
    status VARCHAR(100) DEFAULT 'Orçamento',
    type VARCHAR(100) DEFAULT 'Residencial',
    estimated_value DECIMAL(12,2),
    final_value DECIMAL(12,2),
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    agent_id UUID REFERENCES agents(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para projetos
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status_id);
CREATE INDEX IF NOT EXISTS idx_projects_agent ON projects(agent_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, estimated_end_date);

-- Ambientes do Projeto
CREATE TABLE IF NOT EXISTS project_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_rooms_project ON project_rooms(project_id);

-- Produtos do Projeto
CREATE TABLE IF NOT EXISTS project_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    room_id UUID REFERENCES project_rooms(id) ON DELETE SET NULL,
    product_id UUID REFERENCES catalog_products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_products_project ON project_products(project_id);
CREATE INDEX IF NOT EXISTS idx_project_products_room ON project_products(room_id);

-- ============================================
-- ORÇAMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id),
    client_id UUID REFERENCES clients(id),
    status_id UUID REFERENCES quote_statuses(id),
    status VARCHAR(100) DEFAULT 'Rascunho',
    valid_until DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'fixed', -- 'percentage' ou 'fixed'
    labor_cost DECIMAL(12,2) DEFAULT 0,
    installation_cost DECIMAL(12,2) DEFAULT 0,
    total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
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

-- Índices para orçamentos
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status_id);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON quotes(number);

-- Itens do Orçamento
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES catalog_products(id),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    room VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

-- Função para gerar número do orçamento
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 10 FOR 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM quotes
    WHERE number LIKE 'ORC-' || year_part || '-%';

    NEW.number := 'ORC-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número automaticamente
DROP TRIGGER IF EXISTS trigger_generate_quote_number ON quotes;
CREATE TRIGGER trigger_generate_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    WHEN (NEW.number IS NULL OR NEW.number = '')
    EXECUTE FUNCTION generate_quote_number();

-- ============================================
-- INSTAGRAM POSTS (para o site)
-- ============================================

CREATE TABLE IF NOT EXISTS instagram_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instagram_url TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    caption TEXT,
    type VARCHAR(20) DEFAULT 'image', -- 'image', 'video', 'carousel'
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    show_in_sections TEXT[] DEFAULT ARRAY['feed'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instagram_posts_active ON instagram_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_order ON instagram_posts(display_order);

-- ============================================
-- HISTÓRICO DE PROJETOS
-- ============================================

CREATE TABLE IF NOT EXISTS project_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    old_value TEXT,
    new_value TEXT,
    created_by UUID REFERENCES agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_history_project ON project_history(project_id);

-- ============================================
-- TRIGGERS DE ATUALIZAÇÃO
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_catalog_products_updated_at ON catalog_products;
CREATE TRIGGER update_catalog_products_updated_at
    BEFORE UPDATE ON catalog_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instagram_posts_updated_at ON instagram_posts;
CREATE TRIGGER update_instagram_posts_updated_at
    BEFORE UPDATE ON instagram_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (usuários autenticados podem ver tudo)
CREATE POLICY "Authenticated users can view agents" ON agents
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage agents" ON agents
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view clients" ON clients
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage clients" ON clients
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view client_notes" ON client_notes
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage client_notes" ON client_notes
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view client_statuses" ON client_statuses
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage client_statuses" ON client_statuses
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view catalog_products" ON catalog_products
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage catalog_products" ON catalog_products
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view projects" ON projects
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage projects" ON projects
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view project_rooms" ON project_rooms
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage project_rooms" ON project_rooms
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view project_products" ON project_products
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage project_products" ON project_products
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view quotes" ON quotes
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage quotes" ON quotes
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view quote_items" ON quote_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage quote_items" ON quote_items
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view instagram_posts" ON instagram_posts
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage instagram_posts" ON instagram_posts
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view project_history" ON project_history
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage project_history" ON project_history
    FOR ALL TO authenticated USING (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de projetos com detalhes
CREATE OR REPLACE VIEW projects_with_details AS
SELECT
    p.*,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    a.name as agent_name,
    ps.name as status_name,
    ps.color as status_color,
    (SELECT COUNT(*) FROM project_rooms pr WHERE pr.project_id = p.id) as rooms_count,
    (SELECT COUNT(*) FROM project_products pp WHERE pp.project_id = p.id) as products_count,
    (SELECT COUNT(*) FROM quotes q WHERE q.project_id = p.id) as quotes_count
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN agents a ON p.agent_id = a.id
LEFT JOIN project_statuses ps ON p.status_id = ps.id;

-- View de orçamentos com detalhes
CREATE OR REPLACE VIEW quotes_with_details AS
SELECT
    q.*,
    c.name as client_name,
    c.email as client_email,
    p.name as project_name,
    a.name as agent_name,
    qs.name as status_name,
    qs.color as status_color,
    (SELECT COUNT(*) FROM quote_items qi WHERE qi.quote_id = q.id) as items_count
FROM quotes q
LEFT JOIN clients c ON q.client_id = c.id
LEFT JOIN projects p ON q.project_id = p.id
LEFT JOIN agents a ON q.agent_id = a.id
LEFT JOIN quote_statuses qs ON q.status_id = qs.id;
