-- =====================================================
-- DOMMUS SMART HOME CRM - CORREÇÃO DE TABELAS FALTANTES
-- Execute este script para corrigir tabelas ausentes
-- =====================================================

-- =====================================================
-- TABELA: task_statuses (FALTAVA!)
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
-- TABELA: tasks (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pendente',
  status_id UUID REFERENCES task_statuses(id),
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES agents(id),
  created_by UUID,
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  lead_id UUID REFERENCES leads(id),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HABILITAR RLS
-- =====================================================
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================
DROP POLICY IF EXISTS "Allow all for authenticated users" ON task_statuses;
CREATE POLICY "Allow all for authenticated users" ON task_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON tasks;
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- =====================================================
-- INSERIR STATUS PADRÃO DE TAREFAS
-- =====================================================
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
-- VERIFICAR SE lead_statuses e client_statuses TÊM DADOS
-- =====================================================

-- Garantir que lead_statuses tem dados
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

-- Garantir que client_statuses tem dados
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

-- =====================================================
SELECT 'Tabelas faltantes criadas com sucesso!' AS resultado;
