-- Script para corrigir o trigger de timeline para tarefas completadas
BEGIN;

-- Desativar temporariamente o trigger existente
DROP TRIGGER IF EXISTS track_lead_tasks ON tasks;

-- Substituir a função de registro de eventos de timeline para usar status_id em vez de completed
CREATE OR REPLACE FUNCTION register_lead_timeline_event()
RETURNS TRIGGER AS $$
DECLARE
    timeline_data jsonb;
    current_user_id uuid;
    old_status_completed boolean;
    new_status_completed boolean;
BEGIN
    -- Obter o ID do usuário atual
    current_user_id := (SELECT current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid;
    
    -- Fallback para um valor padrão se não estiver definido
    IF current_user_id IS NULL THEN
        current_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    CASE TG_TABLE_NAME
        -- Quando uma alteração ocorre em um lead
        WHEN 'leads' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'lead_id', NEW.id,
                    'name', NEW.name,
                    'email', NEW.email
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'lead_created', timeline_data, current_user_id);
            
            ELSIF (TG_OP = 'UPDATE' AND OLD.status_id IS DISTINCT FROM NEW.status_id) THEN
                timeline_data := jsonb_build_object(
                    'lead_id', NEW.id,
                    'old_status_id', OLD.status_id,
                    'new_status_id', NEW.status_id
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.id, 'lead_status_changed', timeline_data, current_user_id);
            END IF;
        
        -- Quando uma nota é adicionada a um lead
        WHEN 'notes' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'note_id', NEW.id,
                    'content', substring(NEW.content from 1 for 100)
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'note_added', timeline_data, current_user_id);
            END IF;
            
        -- Quando uma tarefa é adicionada ou atualizada
        WHEN 'tasks' THEN
            IF (TG_OP = 'INSERT') THEN
                timeline_data := jsonb_build_object(
                    'task_id', NEW.id,
                    'title', NEW.title,
                    'due_date', NEW.due_date
                );
                
                INSERT INTO lead_timeline (lead_id, event_type, event_data, created_by)
                VALUES (NEW.lead_id, 'task_created', timeline_data, current_user_id);
            
            ELSIF (TG_OP = 'UPDATE' AND OLD.status_id IS DISTINCT FROM NEW.status_id) THEN
                -- Verificar se o status antigo era um status completado
                SELECT is_completed INTO old_status_completed 
                FROM task_statuses 
                WHERE id = OLD.status_id;
                
                -- Verificar se o novo status é um status completado
                SELECT is_completed INTO new_status_completed 
                FROM task_statuses 
                WHERE id = NEW.status_id;
                
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

-- Recriar o trigger
CREATE TRIGGER track_lead_tasks
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION register_lead_timeline_event();

-- Concluir a transação
COMMIT; 