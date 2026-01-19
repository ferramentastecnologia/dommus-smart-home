-- Script para corrigir problemas de chave estrangeira entre tasks e leads

-- 1. Encontrar tasks que apontam para leads inexistentes
CREATE OR REPLACE FUNCTION public.find_orphaned_tasks()
RETURNS TABLE(
  task_id UUID,
  task_description TEXT,
  invalid_lead_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS task_id,
    t.description AS task_description,
    t.lead_id AS invalid_lead_id
  FROM 
    tasks t
  LEFT JOIN 
    leads l ON t.lead_id = l.id
  WHERE 
    t.lead_id IS NOT NULL 
    AND l.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar função para corrigir o problema removendo ou ajustando as tarefas órfãs
CREATE OR REPLACE FUNCTION public.fix_orphaned_tasks(fix_method TEXT DEFAULT 'remove_lead_id')
RETURNS TEXT AS $$
DECLARE
  v_orphaned_count INTEGER := 0;
  v_task RECORD;
  v_result TEXT;
BEGIN
  -- Verificar método de correção válido
  IF fix_method NOT IN ('remove_lead_id', 'delete_tasks') THEN
    RETURN 'Método de correção inválido. Use "remove_lead_id" ou "delete_tasks"';
  END IF;
  
  -- Processar cada tarefa órfã
  FOR v_task IN SELECT * FROM public.find_orphaned_tasks()
  LOOP
    v_orphaned_count := v_orphaned_count + 1;
    
    IF fix_method = 'remove_lead_id' THEN
      -- Desvincula a tarefa do lead inexistente
      UPDATE tasks
      SET lead_id = NULL
      WHERE id = v_task.task_id;
    ELSIF fix_method = 'delete_tasks' THEN
      -- Exclui a tarefa
      DELETE FROM tasks
      WHERE id = v_task.task_id;
    END IF;
  END LOOP;
  
  v_result := format('Processadas %s tarefas órfãs usando o método "%s"', v_orphaned_count, fix_method);
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 3. Modificar a trigger para tarefas para lidar com leads inexistentes
CREATE OR REPLACE FUNCTION public.fix_task_triggers()
RETURNS TEXT AS $$
BEGIN
  -- Localizar e desativar triggers existentes que estejam causando problemas
  DROP TRIGGER IF EXISTS update_task_in_timeline ON tasks;
  
  -- Criar uma nova versão da trigger que valida o lead_id antes de inserir no timeline
  CREATE OR REPLACE FUNCTION public.safe_task_update_in_timeline()
  RETURNS TRIGGER 
  LANGUAGE plpgsql
  AS $INNER$
  DECLARE
    lead_exists BOOLEAN;
    timeline_data JSONB;
  BEGIN
    -- Verificar se o lead existe antes de tentar inserir no timeline
    IF NEW.lead_id IS NOT NULL THEN
      SELECT EXISTS(SELECT 1 FROM leads WHERE id = NEW.lead_id) INTO lead_exists;
      
      IF lead_exists THEN
        -- O lead existe, podemos registrar no timeline
        IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
          timeline_data := jsonb_build_object(
            'task_id', NEW.id,
            'task_description', NEW.description,
            'old_status', OLD.status,
            'new_status', NEW.status
          );
          
          INSERT INTO lead_timeline (
            lead_id,
            event_type,
            event_data,
            created_at
          ) VALUES (
            NEW.lead_id,
            'task_status_change',
            timeline_data,
            NOW()
          );
        END IF;
      ELSE
        -- O lead não existe, mas permitimos a operação no task sem registrar no timeline
        RAISE NOTICE 'Tentativa de atualizar tarefa com lead_id inválido: %', NEW.lead_id;
      END IF;
    END IF;
    
    RETURN NEW;
  END;
  $INNER$;
  
  -- Criar a nova trigger
  CREATE TRIGGER safe_task_update_in_timeline
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.safe_task_update_in_timeline();
  
  RETURN 'Triggers de tarefas atualizadas com verificação de lead_id';
END;
$$ LANGUAGE plpgsql;

-- 4. Executar as correções
SELECT fix_task_triggers();
SELECT fix_orphaned_tasks('remove_lead_id'); 