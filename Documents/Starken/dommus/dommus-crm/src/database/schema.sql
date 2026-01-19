-- ============================================================================
-- AGILE CRM - SCHEMA COMPLETO
-- ============================================================================
-- Este arquivo contém todo o schema do banco de dados consolidado
-- Última atualização: 2024
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABELAS DE STATUS
-- ============================================================================

-- Tabela de status de leads
CREATE TABLE IF NOT EXISTS public.lead_statuses (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    color text NOT NULL DEFAULT '#0D8A6C'::text,
    description text NULL,
    order_index integer NOT NULL,
    is_default boolean NULL DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT lead_statuses_pkey PRIMARY KEY (id)
);

-- Tabela de status de tarefas
CREATE TABLE IF NOT EXISTS public.task_statuses (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    color text NOT NULL DEFAULT '#0D8A6C'::text,
    description text NULL,
    order_index integer NOT NULL,
    is_completed boolean DEFAULT false,
    is_canceled boolean DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT task_statuses_pkey PRIMARY KEY (id)
);

-- Tabela de status de clientes
CREATE TABLE IF NOT EXISTS public.client_statuses (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    color text NOT NULL DEFAULT '#0D8A6C'::text,
    description text NULL,
    order_index integer NOT NULL,
    is_default boolean NULL DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT client_statuses_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 3. TABELAS DE FONTES
-- ============================================================================

-- Tabela de fontes de leads
CREATE TABLE IF NOT EXISTS public.lead_sources (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    description text NULL,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT lead_sources_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 4. TABELAS DE AGENTES
-- ============================================================================

-- Tabela de agentes
CREATE TABLE IF NOT EXISTS public.agents (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NULL,
    role text NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'manager', 'agent')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    user_id uuid NULL,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT agents_pkey PRIMARY KEY (id),
    CONSTRAINT agents_email_unique UNIQUE (email)
);

-- Índice para user_id em agents
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- ============================================================================
-- 5. TABELAS PRINCIPAIS (LEADS, TASKS, NOTES)
-- ============================================================================

-- Tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NULL,
    company text NULL,
    position text NULL,
    website text NULL,
    status_id uuid NULL,
    source_id uuid NULL,
    source text NULL,
    assigned_to uuid NULL,
    birthday date NULL,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT leads_pkey PRIMARY KEY (id),
    CONSTRAINT leads_status_id_fkey FOREIGN KEY (status_id) REFERENCES lead_statuses(id),
    CONSTRAINT leads_source_id_fkey FOREIGN KEY (source_id) REFERENCES lead_sources(id),
    CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES agents(id)
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    lead_id uuid NOT NULL,
    title text NOT NULL,
    description text NULL,
    due_date timestamp with time zone NULL,
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status_id uuid NULL,
    assigned_to uuid NULL,
    completed boolean DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT tasks_pkey PRIMARY KEY (id),
    CONSTRAINT tasks_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT tasks_status_id_fkey FOREIGN KEY (status_id) REFERENCES task_statuses(id),
    CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES agents(id)
);

-- Tabela de notas
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    lead_id uuid NOT NULL,
    content text NOT NULL,
    created_by uuid NULL,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT notes_pkey PRIMARY KEY (id),
    CONSTRAINT notes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- ============================================================================
-- 6. TABELAS DE CLIENTES
-- ============================================================================

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NULL,
    company text NULL,
    position text NULL,
    website text NULL,
    status_id uuid NULL,
    source_id uuid NULL,
    agent_id uuid NULL,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT clients_pkey PRIMARY KEY (id),
    CONSTRAINT clients_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id),
    CONSTRAINT clients_status_id_fkey FOREIGN KEY (status_id) REFERENCES client_statuses(id),
    CONSTRAINT clients_source_id_fkey FOREIGN KEY (source_id) REFERENCES lead_sources(id)
);

-- Tabela de notas de clientes
CREATE TABLE IF NOT EXISTS public.client_notes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content text NOT NULL,
    client_id uuid NOT NULL,
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    created_by uuid NULL,
    CONSTRAINT client_notes_pkey PRIMARY KEY (id),
    CONSTRAINT client_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT client_notes_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. TABELAS DE EMAIL
-- ============================================================================

-- Tabela de triggers de email
CREATE TABLE IF NOT EXISTS email_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('birthday', 'new_lead', 'meeting')),
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_trigger_type UNIQUE (trigger_type)
);

-- Tabela de templates de email
CREATE TABLE IF NOT EXISTS public.email_templates (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name varchar(255) NOT NULL,
    subject varchar(255) NOT NULL,
    content text NOT NULL,
    trigger_type varchar(50) CHECK (trigger_type IN (
        'birthday', 
        'new_lead', 
        'meeting', 
        'custom', 
        'agent_new_lead_notification', 
        'manual', 
        'email_update_notification'
    )),
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (id),
    CONSTRAINT email_templates_name_unique UNIQUE (name)
);

-- Tabela de configuração SMTP
CREATE TABLE IF NOT EXISTS smtp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    from_email TEXT NOT NULL,
    from_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Tabela de fila de emails
CREATE TABLE IF NOT EXISTS public.email_queue (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
    template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    "to" TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    send_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    sent_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (id)
);

-- ============================================================================
-- 8. TABELAS DE HISTÓRICO E TIMELINE
-- ============================================================================

-- Tabela de histórico de status
CREATE TABLE IF NOT EXISTS public.status_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    entity_type text NOT NULL CHECK (entity_type IN ('lead', 'task')),
    entity_id uuid NOT NULL,
    old_status_id uuid,
    new_status_id uuid NOT NULL,
    changed_by uuid NOT NULL,
    changed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT status_history_pkey PRIMARY KEY (id),
    CONSTRAINT status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id)
);

-- Tabela de timeline de leads
CREATE TABLE IF NOT EXISTS public.lead_timeline (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    lead_id uuid NOT NULL,
    event_type text NOT NULL CHECK (event_type IN (
        'status_change',
        'note_added',
        'task_created',
        'task_completed',
        'task_canceled',
        'task_status_change',
        'email_sent',
        'source_change',
        'agent_assigned',
        'details_updated',
        'lead_created',
        'lead_status_changed'
    )),
    event_data jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT lead_timeline_pkey PRIMARY KEY (id),
    CONSTRAINT lead_timeline_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT lead_timeline_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- ============================================================================
-- 9. ÍNDICES
-- ============================================================================

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_status_id ON leads USING btree (status_id);
CREATE INDEX IF NOT EXISTS idx_leads_source_id ON leads USING btree (source_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads USING btree (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_birthday ON leads(birthday);

-- Índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON tasks USING btree (status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks USING btree (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks USING btree (lead_id);

-- Índices para notes
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes USING btree (lead_id);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON clients USING btree (agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status_id ON clients USING btree (status_id);
CREATE INDEX IF NOT EXISTS idx_clients_source_id ON clients USING btree (source_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes USING btree (client_id);

-- Índices para email
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead_id ON email_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_send_at ON email_queue(send_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_trigger_type ON email_templates(trigger_type, is_active);

-- Índices para histórico e timeline
CREATE INDEX IF NOT EXISTS idx_status_history_entity ON status_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_lead_id ON lead_timeline(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_created_at ON lead_timeline(created_at);

-- Índice único para lead_statuses default
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_statuses_default ON lead_statuses (is_default) WHERE is_default = TRUE;

-- ============================================================================
-- 10. TRIGGERS DE UPDATED_AT
-- ============================================================================

-- Triggers para atualizar updated_at automaticamente
DO $$
BEGIN
    -- Lead statuses
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lead_statuses_updated_at') THEN
        CREATE TRIGGER update_lead_statuses_updated_at 
        BEFORE UPDATE ON lead_statuses 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Task statuses
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_task_statuses_updated_at') THEN
        CREATE TRIGGER update_task_statuses_updated_at 
        BEFORE UPDATE ON task_statuses 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Client statuses
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_statuses_updated_at') THEN
        CREATE TRIGGER update_client_statuses_updated_at 
        BEFORE UPDATE ON client_statuses 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Notes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notes_updated_at') THEN
        CREATE TRIGGER update_notes_updated_at 
        BEFORE UPDATE ON notes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Leads
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_leads_updated_at') THEN
        CREATE TRIGGER set_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Tasks
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_tasks_updated_at') THEN
        CREATE TRIGGER set_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Email queue
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_email_queue_updated_at') THEN
        CREATE TRIGGER set_email_queue_updated_at
        BEFORE UPDATE ON email_queue
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Email triggers
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_timestamp_email_triggers') THEN
        CREATE TRIGGER set_updated_at_timestamp_email_triggers
        BEFORE UPDATE ON email_triggers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Email templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_timestamp_email_templates') THEN
        CREATE TRIGGER set_updated_at_timestamp_email_templates
        BEFORE UPDATE ON email_templates
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- SMTP config
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_timestamp_smtp_config') THEN
        CREATE TRIGGER set_updated_at_timestamp_smtp_config
        BEFORE UPDATE ON smtp_config
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Clients
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at 
        BEFORE UPDATE ON clients 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Client notes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_notes_updated_at') THEN
        CREATE TRIGGER update_client_notes_updated_at 
        BEFORE UPDATE ON client_notes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Lead sources
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lead_sources_updated_at') THEN
        CREATE TRIGGER update_lead_sources_updated_at 
        BEFORE UPDATE ON lead_sources 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 11. FUNÇÕES DE TRIGGER ESPECIAIS
-- ============================================================================

-- Função para garantir apenas um status default em lead_statuses
CREATE OR REPLACE FUNCTION update_lead_status_default()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE lead_statuses SET is_default = FALSE WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para lead_statuses default
DROP TRIGGER IF EXISTS tr_lead_status_default ON lead_statuses;
CREATE TRIGGER tr_lead_status_default
    BEFORE INSERT OR UPDATE ON lead_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_status_default();

-- Função para registrar eventos na timeline
CREATE OR REPLACE FUNCTION register_lead_timeline_event()
RETURNS TRIGGER AS $$
DECLARE
    timeline_data jsonb;
    current_user_id uuid;
    old_status_completed boolean;
    new_status_completed boolean;
    old_status_canceled boolean;
    new_status_canceled boolean;
BEGIN
    -- Pegar o ID do usuário atual
    current_user_id := auth.uid();
    
    -- Handle null user ID (for system operations)
    IF current_user_id IS NULL THEN
        current_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    CASE TG_TABLE_NAME
        -- Quando um lead muda de status
        WHEN 'leads' THEN
            -- Handle INSERT operation (new lead creation)
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'name', NEW.name,
                    'email', NEW.email
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'details_updated', timeline_data, current_user_id);
                
                RETURN NEW;
            END IF;
            
            IF (TG_OP = 'UPDATE' AND (OLD.status_id IS DISTINCT FROM NEW.status_id)) THEN
                timeline_data := jsonb_build_object(
                    'old_status_id', OLD.status_id,
                    'new_status_id', NEW.status_id
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'status_change', timeline_data, current_user_id);
            END IF;

            -- Quando muda o agente designado
            IF (TG_OP = 'UPDATE' AND (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)) THEN
                timeline_data := jsonb_build_object(
                    'old_assigned_to', OLD.assigned_to,
                    'new_assigned_to', NEW.assigned_to
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'agent_assigned', timeline_data, current_user_id);
            END IF;

            -- Quando muda a fonte (source ou source_id)
            IF (TG_OP = 'UPDATE' AND (
                (OLD.source_id IS DISTINCT FROM NEW.source_id) OR
                (OLD.source IS DISTINCT FROM NEW.source)
            )) THEN
                timeline_data := jsonb_build_object(
                    'old_source_id', OLD.source_id,
                    'new_source_id', NEW.source_id,
                    'old_source', OLD.source,
                    'new_source', NEW.source
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'source_change', timeline_data, current_user_id);
            END IF;

            -- Quando detalhes são atualizados
            IF (TG_OP = 'UPDATE' AND (
                OLD.name IS DISTINCT FROM NEW.name OR
                OLD.email IS DISTINCT FROM NEW.email OR
                OLD.phone IS DISTINCT FROM NEW.phone OR
                OLD.company IS DISTINCT FROM NEW.company OR
                OLD.position IS DISTINCT FROM NEW.position OR
                OLD.website IS DISTINCT FROM NEW.website
            )) THEN
                timeline_data := jsonb_build_object(
                    'changes', jsonb_build_object(
                        'name', CASE WHEN OLD.name IS DISTINCT FROM NEW.name 
                            THEN jsonb_build_object('old', OLD.name, 'new', NEW.name) ELSE NULL END,
                        'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email 
                            THEN jsonb_build_object('old', OLD.email, 'new', NEW.email) ELSE NULL END,
                        'phone', CASE WHEN OLD.phone IS DISTINCT FROM NEW.phone 
                            THEN jsonb_build_object('old', OLD.phone, 'new', NEW.phone) ELSE NULL END,
                        'company', CASE WHEN OLD.company IS DISTINCT FROM NEW.company 
                            THEN jsonb_build_object('old', OLD.company, 'new', NEW.company) ELSE NULL END,
                        'position', CASE WHEN OLD.position IS DISTINCT FROM NEW.position 
                            THEN jsonb_build_object('old', OLD.position, 'new', NEW.position) ELSE NULL END,
                        'website', CASE WHEN OLD.website IS DISTINCT FROM NEW.website 
                            THEN jsonb_build_object('old', OLD.website, 'new', NEW.website) ELSE NULL END
                    )
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'details_updated', timeline_data, current_user_id);
            END IF;
        
        -- Quando uma nota é adicionada
        WHEN 'notes' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'note_id', NEW.id,
                    'content', substring(NEW.content from 1 for 100)
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'note_added', timeline_data, NEW.created_by);
            END IF;
            
        -- Quando uma task é criada ou atualizada
        WHEN 'tasks' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'title', NEW.title,
                    'description', NEW.description,
                    'due_date', NEW.due_date,
                    'priority', NEW.priority
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_created', timeline_data, current_user_id);
            END IF;

            -- Quando uma task muda de status
            IF (TG_OP = 'UPDATE' AND OLD.status_id IS DISTINCT FROM NEW.status_id) THEN
                -- Verificar se o status antigo era completado
                SELECT is_completed INTO old_status_completed 
                FROM task_statuses 
                WHERE id = OLD.status_id;
                
                -- Verificar se o novo status é completado
                SELECT is_completed INTO new_status_completed 
                FROM task_statuses 
                WHERE id = NEW.status_id;
                
                -- Verificar se o status antigo era cancelado
                SELECT is_canceled INTO old_status_canceled 
                FROM task_statuses 
                WHERE id = OLD.status_id;
                
                -- Verificar se o novo status é cancelado
                SELECT is_canceled INTO new_status_canceled 
                FROM task_statuses 
                WHERE id = NEW.status_id;
                
                -- Criar dados do evento de mudança de status
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'title', NEW.title,
                    'old_status_id', OLD.status_id,
                    'new_status_id', NEW.status_id
                );
                
                -- Evento de mudança de status
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_status_change', timeline_data, current_user_id);
                
                -- Evento adicional se a tarefa foi completada
                IF (NOT COALESCE(old_status_completed, false) AND COALESCE(new_status_completed, false)) THEN
                    timeline_data := jsonb_build_object(
                        'task_id', NEW.id,
                        'title', NEW.title
                    );
                    
                    INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                    VALUES (NEW.lead_id, 'task_completed', timeline_data, current_user_id);
                END IF;
                
                -- Evento adicional se a tarefa foi cancelada
                IF (NOT COALESCE(old_status_canceled, false) AND COALESCE(new_status_canceled, false)) THEN
                    timeline_data := jsonb_build_object(
                        'task_id', NEW.id,
                        'title', NEW.title
                    );
                    
                    INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                    VALUES (NEW.lead_id, 'task_canceled', timeline_data, current_user_id);
                END IF;
            END IF;

        -- Quando um email é enviado
        WHEN 'email_queue' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'email_id', NEW.id,
                    'subject', NEW.subject,
                    'template_id', NEW.template_id
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'email_sent', timeline_data, current_user_id);
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. TRIGGERS DE TIMELINE
-- ============================================================================

-- Triggers para timeline
DO $$
BEGIN
    -- Trigger para leads
    DROP TRIGGER IF EXISTS track_lead_changes ON leads;
    CREATE TRIGGER track_lead_changes
    AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION register_lead_timeline_event();

    -- Trigger para notes
    DROP TRIGGER IF EXISTS track_lead_notes ON notes;
    CREATE TRIGGER track_lead_notes
    AFTER INSERT ON notes
    FOR EACH ROW
    EXECUTE FUNCTION register_lead_timeline_event();

    -- Trigger para tasks
    DROP TRIGGER IF EXISTS track_lead_tasks ON tasks;
    CREATE TRIGGER track_lead_tasks
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION register_lead_timeline_event();

    -- Trigger para email_queue
    DROP TRIGGER IF EXISTS track_lead_emails ON email_queue;
    CREATE TRIGGER track_lead_emails
    AFTER INSERT ON email_queue
    FOR EACH ROW
    EXECUTE FUNCTION register_lead_timeline_event();
END $$;

-- ============================================================================
-- 13. FUNÇÕES DE EMAIL
-- ============================================================================

-- Função para tratar emails de novos leads
CREATE OR REPLACE FUNCTION public.handle_new_lead_email()
RETURNS TRIGGER AS $$
DECLARE
  template_record RECORD;
  agent_record RECORD;
  agent_template_record RECORD;
BEGIN
  -- 1. Busca o template ativo para novos leads (email para o lead)
  SELECT * INTO template_record
  FROM public.email_templates
  WHERE trigger_type = 'new_lead' AND is_active = TRUE
  LIMIT 1;
  
  -- Se encontrou um template ativo para o lead
  IF FOUND THEN
    -- Insere na fila de emails (notificação para o lead)
    INSERT INTO public.email_queue
    (lead_id, template_id, status, "to", subject, content, created_at, updated_at)
    VALUES
    (
      NEW.id,
      template_record.id,
      'pending',
      NEW.email,
      REPLACE(template_record.subject, '{{name}}', COALESCE(NEW.name, '')),
      REPLACE(template_record.content, '{{name}}', COALESCE(NEW.name, '')),
      NOW(),
      NOW()
    );
  END IF;
  
  -- 2. Busca o template ativo para notificar agentes sobre novos leads
  SELECT * INTO agent_template_record
  FROM public.email_templates
  WHERE trigger_type = 'agent_new_lead_notification' AND is_active = TRUE
  LIMIT 1;
  
  -- Se encontrou um template ativo para agentes
  IF FOUND THEN
    -- Para cada agente ativo, adiciona um email na fila
    FOR agent_record IN 
      SELECT * FROM public.agents WHERE status = 'active'
    LOOP
      -- Prepara o assunto e conteúdo com dados do lead e do agente
      INSERT INTO public.email_queue
      (lead_id, template_id, status, "to", subject, content, created_at, updated_at)
      VALUES
      (
        NEW.id,
        agent_template_record.id,
        'pending',
        agent_record.email,
        REPLACE(
          REPLACE(agent_template_record.subject, '{{lead_name}}', COALESCE(NEW.name, '')),
          '{{agent_name}}', COALESCE(agent_record.name, '')
        ),
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(agent_template_record.content, 
                  '{{lead_name}}', COALESCE(NEW.name, '')
                ),
                '{{lead_email}}', COALESCE(NEW.email, '')
              ),
              '{{lead_phone}}', COALESCE(NEW.phone, 'Não informado')
            ),
            '{{lead_company}}', COALESCE(NEW.company, 'Não informado')
          ),
          '{{agent_name}}', COALESCE(agent_record.name, '')
        ),
        NOW(),
        NOW()
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para notificar agentes sobre alteração de email de lead
CREATE OR REPLACE FUNCTION public.handle_lead_email_update()
RETURNS TRIGGER AS $$
DECLARE
  agent_record RECORD;
  agent_template_record RECORD;
BEGIN
  -- Verificar se o email foi realmente alterado
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    -- Buscar o template ativo para notificação de alteração de email
    SELECT * INTO agent_template_record
    FROM public.email_templates
    WHERE trigger_type = 'email_update_notification' AND is_active = TRUE
    LIMIT 1;
    
    -- Se encontrou um template ativo
    IF FOUND THEN
      -- Para cada agente ativo, adicionar um email na fila
      FOR agent_record IN
        SELECT * FROM public.agents WHERE status = 'active'
      LOOP
        -- Inserir na fila de emails (notificação para o agente)
        INSERT INTO public.email_queue
        (lead_id, template_id, status, "to", subject, content, created_at, updated_at)
        VALUES
        (
          NEW.id,
          agent_template_record.id,
          'pending',
          agent_record.email,
          REPLACE(
            REPLACE(agent_template_record.subject, 
              '{{lead_name}}', COALESCE(NEW.name, '')
            ),
            '{{agent_name}}', COALESCE(agent_record.name, '')
          ),
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(agent_template_record.content,
                      '{{lead_name}}', COALESCE(NEW.name, '')
                    ),
                    '{{old_email}}', COALESCE(OLD.email, 'Não informado')
                  ),
                  '{{new_email}}', COALESCE(NEW.email, 'Não informado')
                ),
                '{{lead_phone}}', COALESCE(NEW.phone, 'Não informado')
              ),
              '{{lead_company}}', COALESCE(NEW.company, 'Não informado')
            ),
            '{{agent_name}}', COALESCE(agent_record.name, '')
          ),
          NOW(),
          NOW()
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de email
DROP TRIGGER IF EXISTS new_lead_email_trigger ON public.leads;
CREATE TRIGGER new_lead_email_trigger
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_lead_email();

DROP TRIGGER IF EXISTS lead_email_update_notification_trigger ON public.leads;
CREATE TRIGGER lead_email_update_notification_trigger
AFTER UPDATE ON public.leads
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.handle_lead_email_update();

-- ============================================================================
-- 14. DADOS INICIAIS (SEEDS)
-- ============================================================================

-- Inserir triggers de email padrão
INSERT INTO email_triggers (trigger_type, description, is_active)
VALUES 
  ('birthday', 'Sends emails to leads on their birthdays', TRUE),
  ('new_lead', 'Sends emails when a new lead is created', TRUE),
  ('meeting', 'Sends emails before scheduled meetings', TRUE)
ON CONFLICT (trigger_type) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

-- Inserir templates de email padrão
INSERT INTO email_templates (name, subject, content, trigger_type, is_active)
VALUES (
  'Birthday Wishes', 
  'Happy Birthday {{name}}!', 
  '<p>Hello {{name}},</p><p>The entire team at our company wishes you a very happy birthday! We hope your day is filled with joy.</p><p>As a token of our appreciation, we''d like to offer you a special birthday discount on our services. Feel free to reach out to learn more.</p><p>Best wishes,<br>Your Account Manager</p>', 
  'birthday', 
  TRUE
),
(
  'Welcome New Lead', 
  'Welcome to {{company_name}}', 
  '<p>Hello {{name}},</p><p>Thank you for your interest in our services! We''re excited to have you join our community.</p><p>Over the next few days, your account manager will reach out to discuss how we can best serve your needs.</p><p>In the meantime, feel free to explore our website or reply to this email if you have any questions.</p><p>Best regards,<br>The Team</p>', 
  'new_lead', 
  TRUE
),
(
  'Meeting Confirmation', 
  'Your upcoming meeting on {{date}}', 
  '<p>Hello {{name}},</p><p>This is a friendly reminder about our meeting scheduled for {{date}} at {{time}}.</p><p>You can join the meeting using this link: <a href="{{link}}">{{link}}</a></p><p>If you need to reschedule, please let us know as soon as possible.</p><p>Looking forward to our conversation!</p><p>Best regards,<br>Your Account Manager</p>', 
  'meeting', 
  TRUE
),
(
  'Nova Notificação de Lead para Agentes',
  'Novo Lead: {{lead_name}} - Atribuído ao Sistema',
  '<p>Olá {{agent_name}},</p>
  <p>Um novo lead foi adicionado ao sistema:</p>
  <ul>
    <li><strong>Nome:</strong> {{lead_name}}</li>
    <li><strong>Email:</strong> {{lead_email}}</li>
    <li><strong>Telefone:</strong> {{lead_phone}}</li>
    <li><strong>Empresa:</strong> {{lead_company}}</li>
  </ul>
  <p>Acesse o sistema para verificar mais detalhes e assumir a responsabilidade por esse lead, caso necessário.</p>
  <p>Atenciosamente,<br>Agile CRM</p>',
  'agent_new_lead_notification',
  TRUE
),
(
  'Notificação de Alteração de Email para Agentes',
  'Lead com Email Alterado: {{lead_name}}',
  '<p>Olá {{agent_name}},</p>
  <p>Um lead teve seu email alterado no sistema:</p>
  <ul>
    <li><strong>Nome:</strong> {{lead_name}}</li>
    <li><strong>Email Anterior:</strong> {{old_email}}</li>
    <li><strong>Novo Email:</strong> {{new_email}}</li>
    <li><strong>Telefone:</strong> {{lead_phone}}</li>
    <li><strong>Empresa:</strong> {{lead_company}}</li>
  </ul>
  <p>Acesse o sistema para verificar mais detalhes.</p>
  <p>Atenciosamente,<br>Agile CRM</p>',
  'email_update_notification',
  TRUE
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 15. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS nas tabelas de email
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Políticas para email_templates
DROP POLICY IF EXISTS read_email_templates ON public.email_templates;
CREATE POLICY read_email_templates ON public.email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS manage_email_templates ON public.email_templates;
CREATE POLICY manage_email_templates ON public.email_templates
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Políticas para email_queue
DROP POLICY IF EXISTS read_email_queue ON public.email_queue;
CREATE POLICY read_email_queue ON public.email_queue
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS manage_email_queue ON public.email_queue;
CREATE POLICY manage_email_queue ON public.email_queue
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

COMMIT;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

