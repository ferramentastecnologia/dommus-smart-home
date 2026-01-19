-- Script para corrigir os triggers relacionados a leads convertidos e descartados, e tarefas canceladas
BEGIN;

-- Desativar temporariamente todos os triggers existentes
DROP TRIGGER IF EXISTS track_lead_changes ON leads;
DROP TRIGGER IF EXISTS track_lead_tasks ON tasks;
DROP TRIGGER IF EXISTS track_lead_notes ON notes;
DROP TRIGGER IF EXISTS track_lead_emails ON email_queue;

-- Substituir a função de registro de eventos de timeline para usar is_converted e is_discarded
CREATE OR REPLACE FUNCTION register_lead_timeline_event()
RETURNS TRIGGER AS $$
DECLARE
    timeline_data jsonb;
    current_user_id uuid;
    old_status_converted boolean;
    new_status_converted boolean;
    old_status_discarded boolean;
    new_status_discarded boolean;
    old_status_completed boolean;
    new_status_completed boolean;
    old_status_canceled boolean;
    new_status_canceled boolean;
BEGIN
    -- Pegar o ID do usuário atual
    current_user_id := auth.uid();
    
    CASE TG_TABLE_NAME
        -- Quando um lead muda de status
        WHEN 'leads' THEN
            -- When a new lead is created
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'name', NEW.name,
                    'email', NEW.email
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'details_updated', timeline_data, current_user_id);
                
                -- Return early since we don't need to check other conditions for INSERT
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
                    'content', substring(NEW.content from 1 for 100)
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'note_added', timeline_data, NEW.created_by);
            END IF;
            
        -- Quando uma tarefa é adicionada ou atualizada
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

-- Recriar os triggers
CREATE TRIGGER track_lead_changes
AFTER INSERT OR UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION register_lead_timeline_event();

CREATE TRIGGER track_lead_tasks
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION register_lead_timeline_event();

CREATE TRIGGER track_lead_notes
AFTER INSERT ON notes
FOR EACH ROW
EXECUTE FUNCTION register_lead_timeline_event();

CREATE TRIGGER track_lead_emails
AFTER INSERT ON email_queue
FOR EACH ROW
EXECUTE FUNCTION register_lead_timeline_event();

-- Concluir a transação
COMMIT; 