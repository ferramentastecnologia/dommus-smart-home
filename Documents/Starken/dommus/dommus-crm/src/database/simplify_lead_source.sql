-- Script para simplificar a relação entre leads e lead_sources
-- Alteração na tabela leads para manter apenas o campo source como texto

-- 0. Primeiro, adicionar a coluna source se ela não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'source'
  ) THEN
    ALTER TABLE leads ADD COLUMN source TEXT;
  END IF;
END $$;

-- 1. Garantir que todos os leads tenham o campo source preenchido com o nome correspondente
UPDATE leads 
SET source = (
  SELECT name FROM lead_sources WHERE lead_sources.id = leads.source_id
)
WHERE source_id IS NOT NULL AND (source IS NULL OR source = '');

-- 2. Remover constraint de foreign key para source_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_source_id_fkey' 
    AND table_name = 'leads'
  ) THEN
    ALTER TABLE leads DROP CONSTRAINT leads_source_id_fkey;
  END IF;
END $$;

-- 3. Manter o campo source_id temporariamente, mas não como FK
-- Isso será removido posteriormente quando todo o código estiver adaptado

-- 4. Atualizar o trigger que registra alterações no source para usar o campo source (texto) ao invés de source_id

-- Primeiro, vamos criar ou substituir a função do trigger
CREATE OR REPLACE FUNCTION public.register_lead_timeline_event()
RETURNS TRIGGER AS $$
DECLARE
    timeline_data jsonb;
    current_user_id uuid;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Handle null user ID (for system operations)
    IF current_user_id IS NULL THEN
        current_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    CASE TG_TABLE_NAME
        WHEN 'leads' THEN
            -- Handle INSERT operation (new lead creation)
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'name', NEW.name,
                    'email', NEW.email
                );
                
                -- Use an event type that exists in the constraint
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'details_updated', timeline_data, current_user_id);
                
                RETURN NEW;
            END IF;
            
            -- Handle status changes
            IF (TG_OP = 'UPDATE' AND (OLD.status_id IS DISTINCT FROM NEW.status_id)) THEN
                timeline_data := jsonb_build_object(
                    'old_status_id', OLD.status_id,
                    'new_status_id', NEW.status_id
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'status_change', timeline_data, current_user_id);
            END IF;

            -- Handle agent assignment changes
            IF (TG_OP = 'UPDATE' AND (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to)) THEN
                timeline_data := jsonb_build_object(
                    'old_assigned_to', OLD.assigned_to,
                    'new_assigned_to', NEW.assigned_to
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'agent_assigned', timeline_data, current_user_id);
            END IF;

            -- Handle source changes - MODIFICADO para usar o campo source (texto) em vez de source_id
            IF (TG_OP = 'UPDATE' AND OLD.source IS DISTINCT FROM NEW.source) THEN
                timeline_data := jsonb_build_object(
                    'old_source', OLD.source,
                    'new_source', NEW.source
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'source_change', timeline_data, current_user_id);
            END IF;

            -- Handle detail updates
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

        -- Outras partes do trigger permanecem inalteradas...
        -- Handle notes
        WHEN 'notes' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'note_id', NEW.id,
                    'content', NEW.content
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'note_added', timeline_data, NEW.created_by);
            END IF;

        -- Handle tasks
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

            -- Handle task status changes
            IF (TG_OP = 'UPDATE' AND OLD.status_id IS DISTINCT FROM NEW.status_id) THEN
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'old_status_id', OLD.status_id,
                    'new_status_id', NEW.status_id
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_status_change', timeline_data, current_user_id);
            END IF;

            -- Handle task completion
            IF (TG_OP = 'UPDATE' AND NOT OLD.completed AND NEW.completed) THEN
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'title', NEW.title
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_completed', timeline_data, current_user_id);
            END IF;

        -- Handle emails
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

-- Recrear os triggers correspondentes
DROP TRIGGER IF EXISTS on_lead_change ON leads;
CREATE TRIGGER on_lead_change
AFTER INSERT OR UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION register_lead_timeline_event();

-- Os outros triggers permanecem inalterados 