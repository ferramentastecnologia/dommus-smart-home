-- Fix for the lead_timeline trigger to handle INSERT operations correctly
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

            -- Handle source changes
            IF (TG_OP = 'UPDATE' AND OLD.source_id IS DISTINCT FROM NEW.source_id) THEN
                timeline_data := jsonb_build_object(
                    'old_source_id', OLD.source_id,
                    'new_source_id', NEW.source_id
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