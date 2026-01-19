-- Início da transação
BEGIN;

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionando índices faltantes
DO $$ 
BEGIN 
    -- Índices para leads
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_status_id') THEN
        CREATE INDEX idx_leads_status_id ON leads USING btree (status_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_source_id') THEN
        CREATE INDEX idx_leads_source_id ON leads USING btree (source_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_assigned_to') THEN
        CREATE INDEX idx_leads_assigned_to ON leads USING btree (assigned_to);
    END IF;

    -- Índices para tasks
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status_id') THEN
        CREATE INDEX idx_tasks_status_id ON tasks USING btree (status_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_assigned_to') THEN
        CREATE INDEX idx_tasks_assigned_to ON tasks USING btree (assigned_to);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_lead_id') THEN
        CREATE INDEX idx_tasks_lead_id ON tasks USING btree (lead_id);
    END IF;

    -- Índice para notes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_lead_id') THEN
        CREATE INDEX idx_notes_lead_id ON notes USING btree (lead_id);
    END IF;
END $$;

-- Corrigindo a coluna created_by em notes
DO $$ 
BEGIN
    -- Primeiro, criar uma coluna temporária
    ALTER TABLE notes ADD COLUMN IF NOT EXISTS created_by_new uuid;
    
    -- Atualizar registros existentes onde created_by é um UUID válido
    UPDATE notes 
    SET created_by_new = created_by::uuid 
    WHERE created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Dropar a coluna antiga e renomear a nova
    ALTER TABLE notes DROP COLUMN created_by;
    ALTER TABLE notes RENAME COLUMN created_by_new TO created_by;
    
    -- Adicionar a foreign key
    ALTER TABLE notes 
    ADD CONSTRAINT notes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);
END $$;

-- Adicionando triggers faltantes
DO $$ 
BEGIN
    -- Para lead_statuses
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lead_statuses_updated_at') THEN
        CREATE TRIGGER update_lead_statuses_updated_at 
        BEFORE UPDATE ON lead_statuses 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Para task_statuses
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_task_statuses_updated_at') THEN
        CREATE TRIGGER update_task_statuses_updated_at 
        BEFORE UPDATE ON task_statuses 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Para notes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notes_updated_at') THEN
        CREATE TRIGGER update_notes_updated_at 
        BEFORE UPDATE ON notes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Para settings
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
        CREATE TRIGGER update_settings_updated_at 
        BEFORE UPDATE ON settings 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Padronizando os defaults de timestamp
DO $$ 
BEGIN
    -- Atualizar defaults para usar timezone('utc'::text, now())
    ALTER TABLE lead_statuses 
    ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

    ALTER TABLE task_statuses 
    ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

    ALTER TABLE notes 
    ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

    ALTER TABLE settings 
    ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

    ALTER TABLE lead_sources 
    ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now()),
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());
END $$;

-- Criando tabela de histórico de status
CREATE TABLE IF NOT EXISTS public.status_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    old_status_id uuid,
    new_status_id uuid NOT NULL,
    changed_by uuid NOT NULL,
    changed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT status_history_pkey PRIMARY KEY (id),
    CONSTRAINT status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id),
    CONSTRAINT status_history_entity_type_check CHECK (entity_type IN ('lead', 'task'))
);

-- Criando índice para status_history
CREATE INDEX IF NOT EXISTS idx_status_history_entity ON status_history(entity_type, entity_id);

-- Criando tabela de timeline
CREATE TABLE IF NOT EXISTS public.lead_timeline (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    lead_id uuid NOT NULL,
    event_type text NOT NULL,
    event_data jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT lead_timeline_pkey PRIMARY KEY (id),
    CONSTRAINT lead_timeline_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT lead_timeline_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT lead_timeline_event_type_check CHECK (event_type IN (
        'status_change',
        'note_added',
        'task_created',
        'task_completed',
        'task_status_change',
        'email_sent',
        'source_change',
        'agent_assigned',
        'details_updated'
    ))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_timeline_lead_id ON lead_timeline(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_created_at ON lead_timeline(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status_id ON leads(status_id);
CREATE INDEX IF NOT EXISTS idx_leads_source_id ON leads(source_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);

-- Função para registrar eventos na timeline
CREATE OR REPLACE FUNCTION register_lead_timeline_event()
RETURNS TRIGGER AS $$
DECLARE
    timeline_data jsonb;
    current_user_id uuid;
BEGIN
    -- Pegar o ID do usuário atual
    current_user_id := auth.uid();
    
    CASE TG_TABLE_NAME
        -- Quando um lead muda de status
        WHEN 'leads' THEN
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

            -- Quando muda a fonte
            IF (TG_OP = 'UPDATE' AND OLD.source_id IS DISTINCT FROM NEW.source_id) THEN
                timeline_data := jsonb_build_object(
                    'old_source_id', OLD.source_id,
                    'new_source_id', NEW.source_id
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
                    'content', NEW.content
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
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'old_status_id', OLD.status_id,
                    'new_status_id', NEW.status_id
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_status_change', timeline_data, current_user_id);
            END IF;

            -- Quando uma task é completada
            IF (TG_OP = 'UPDATE' AND NOT OLD.completed AND NEW.completed) THEN
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'title', NEW.title
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_completed', timeline_data, current_user_id);
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

-- Criando triggers para timeline
DO $$ 
BEGIN
    -- Trigger para leads
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_lead_changes') THEN
        CREATE TRIGGER track_lead_changes
        AFTER INSERT OR UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION register_lead_timeline_event();
    END IF;

    -- Trigger para notes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_lead_notes') THEN
        CREATE TRIGGER track_lead_notes
        AFTER INSERT ON notes
        FOR EACH ROW
        EXECUTE FUNCTION register_lead_timeline_event();
    END IF;

    -- Trigger para tasks
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_lead_tasks') THEN
        CREATE TRIGGER track_lead_tasks
        AFTER INSERT OR UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION register_lead_timeline_event();
    END IF;

    -- Trigger para email_queue
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_lead_emails') THEN
        CREATE TRIGGER track_lead_emails
        AFTER INSERT ON email_queue
        FOR EACH ROW
        EXECUTE FUNCTION register_lead_timeline_event();
    END IF;
END $$;

-- Adicionando triggers de updated_at para todas as tabelas relevantes
DO $$
BEGIN
    -- Para leads
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_leads_updated_at') THEN
        CREATE TRIGGER set_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Para tasks
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_tasks_updated_at') THEN
        CREATE TRIGGER set_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Para notes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_notes_updated_at') THEN
        CREATE TRIGGER set_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Para email_queue
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_email_queue_updated_at') THEN
        CREATE TRIGGER set_email_queue_updated_at
        BEFORE UPDATE ON email_queue
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

COMMIT; 