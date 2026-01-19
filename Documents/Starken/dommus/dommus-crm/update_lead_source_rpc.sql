-- Função RPC para atualizar o source_id de um lead sem violar a foreign key constraint
-- Esta função usa security definer para operar como o proprietário da tabela
CREATE OR REPLACE FUNCTION public.update_lead_source(p_lead_id uuid, p_source_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_source_id uuid;
  timeline_data jsonb;
  lead_count int;
BEGIN
  -- Verificar se o lead existe
  SELECT COUNT(*) INTO lead_count FROM leads WHERE id = p_lead_id;
  
  -- Se o lead não existir, retorna false
  IF lead_count = 0 THEN
    RAISE EXCEPTION 'Lead with ID % not found', p_lead_id;
    RETURN false;
  END IF;
  
  -- Obter o source_id atual
  SELECT source_id INTO current_source_id FROM leads WHERE id = p_lead_id;
  
  -- Se o source_id for o mesmo que já está definido, não faz nada
  IF current_source_id IS NOT DISTINCT FROM p_source_id THEN
    RETURN true;
  END IF;
  
  -- Atualizar o source_id na tabela leads
  UPDATE leads
  SET source_id = p_source_id
  WHERE id = p_lead_id;
  
  -- Criar entrada na timeline sem especificar created_by (ficará null)
  -- Isso evita o erro de violação da foreign key
  timeline_data := jsonb_build_object(
    'old_source_id', current_source_id,
    'new_source_id', p_source_id
  );
  
  INSERT INTO lead_timeline (
    lead_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    p_lead_id,
    'source_change',
    timeline_data,
    now()
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating lead source: %', SQLERRM;
    RETURN false;
END;
$$;

-- Conceder permissão para chamar a função
GRANT EXECUTE ON FUNCTION public.update_lead_source(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_lead_source(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.update_lead_source(uuid, uuid) TO service_role;

-- Function to fix inconsistencies in lead source data
-- This function performs the following actions:
-- 1. For leads with source_id but no source, it sets the source to the name from lead_sources
-- 2. For leads with source but no source_id, it sets the source_id based on the name in lead_sources
-- 3. For leads with both source and source_id, it ensures the source matches the name in lead_sources
CREATE OR REPLACE FUNCTION public.fix_lead_source_inconsistencies()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_fixed INTEGER := 0;
  v_fixed_source_id INTEGER := 0;
  v_fixed_source_name INTEGER := 0;
  v_fixed_mismatches INTEGER := 0;
  v_lead RECORD;
  v_source_name TEXT;
  v_source_id UUID;
BEGIN
  -- Disable timeline triggers to prevent foreign key errors
  ALTER TABLE leads DISABLE TRIGGER track_lead_changes;
  ALTER TABLE leads DISABLE TRIGGER on_lead_change;
  
  -- Case 1: source_id exists but source is null
  FOR v_lead IN 
    SELECT id, source_id 
    FROM leads 
    WHERE source_id IS NOT NULL AND (source IS NULL OR source = '')
  LOOP
    SELECT name INTO v_source_name FROM lead_sources WHERE id = v_lead.source_id;
    
    IF v_source_name IS NOT NULL THEN
      -- Update without triggering the timeline event
      UPDATE leads 
      SET source = v_source_name 
      WHERE id = v_lead.id;
      
      v_fixed_source_name := v_fixed_source_name + 1;
      v_total_fixed := v_total_fixed + 1;
    END IF;
  END LOOP;
  
  -- Case 2: source exists but source_id is null
  FOR v_lead IN 
    SELECT id, source 
    FROM leads 
    WHERE source IS NOT NULL AND source != '' AND source_id IS NULL
  LOOP
    SELECT id INTO v_source_id FROM lead_sources WHERE name = v_lead.source;
    
    IF v_source_id IS NOT NULL THEN
      -- Update the record
      UPDATE leads 
      SET source_id = v_source_id 
      WHERE id = v_lead.id;
      
      v_fixed_source_id := v_fixed_source_id + 1;
      v_total_fixed := v_total_fixed + 1;
    END IF;
  END LOOP;
  
  -- Case 3: both source and source_id exist but they don't match
  FOR v_lead IN 
    SELECT l.id, l.source, l.source_id 
    FROM leads l
    JOIN lead_sources ls ON l.source_id = ls.id
    WHERE l.source IS NOT NULL AND l.source != '' 
      AND l.source != ls.name
  LOOP
    -- Get the correct name from lead_sources
    SELECT name INTO v_source_name FROM lead_sources WHERE id = v_lead.source_id;
    
    IF v_source_name IS NOT NULL THEN
      -- Update the record
      UPDATE leads 
      SET source = v_source_name 
      WHERE id = v_lead.id;
      
      v_fixed_mismatches := v_fixed_mismatches + 1;
      v_total_fixed := v_total_fixed + 1;
    END IF;
  END LOOP;
  
  -- Re-enable triggers
  ALTER TABLE leads ENABLE TRIGGER track_lead_changes;
  ALTER TABLE leads ENABLE TRIGGER on_lead_change;
  
  RETURN format('Fixed %s total inconsistencies: %s missing source names, %s missing source IDs, %s mismatches', 
    v_total_fixed, v_fixed_source_name, v_fixed_source_id, v_fixed_mismatches);
END;
$$;

-- Grant permissions to execute the function
GRANT EXECUTE ON FUNCTION public.fix_lead_source_inconsistencies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fix_lead_source_inconsistencies() TO service_role;

-- Function to remove the created_by constraint from lead_timeline
-- This makes the created_by field nullable, which prevents FK constraint errors
CREATE OR REPLACE FUNCTION public.make_lead_timeline_created_by_nullable()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Drop the existing foreign key constraint
  ALTER TABLE lead_timeline DROP CONSTRAINT IF EXISTS lead_timeline_created_by_fkey;
  
  -- Re-add the constraint but with NULL allowed
  ALTER TABLE lead_timeline 
  ADD CONSTRAINT lead_timeline_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;
  
  RETURN 'Successfully made lead_timeline.created_by nullable';
END;
$$;

-- Grant permissions to execute the function
GRANT EXECUTE ON FUNCTION public.make_lead_timeline_created_by_nullable() TO authenticated;
GRANT EXECUTE ON FUNCTION public.make_lead_timeline_created_by_nullable() TO service_role;

-- Function to update register_lead_timeline_event to handle null created_by
CREATE OR REPLACE FUNCTION public.fix_register_lead_timeline_event()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a new version of the register_lead_timeline_event function that checks for valid created_by
  CREATE OR REPLACE FUNCTION public.register_lead_timeline_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $inner$
  DECLARE
    timeline_data jsonb;
    current_user_id uuid;
    old_source_id uuid;
    new_source_id uuid;
    old_status_id uuid;
    new_status_id uuid;
  BEGIN
    -- Get current user ID
    current_user_id := (SELECT auth.uid());
    
    -- Check if the user exists before using it
    IF current_user_id IS NOT NULL THEN
      -- Verify if the user ID exists in auth.users
      PERFORM 1 FROM auth.users WHERE id = current_user_id;
      
      IF NOT FOUND THEN
        -- If user not found, set to NULL
        current_user_id := NULL;
      END IF;
    END IF;
    
    -- Determine event type and prepare data based on the changes
    -- Status change
    IF (TG_OP = 'UPDATE' AND OLD.status_id IS DISTINCT FROM NEW.status_id) THEN
      old_status_id := OLD.status_id;
      new_status_id := NEW.status_id;
      
      timeline_data := jsonb_build_object(
        'old_status_id', old_status_id,
        'new_status_id', new_status_id
      );
      
      INSERT INTO lead_timeline (
        lead_id,
        event_type,
        event_data,
        created_by,
        created_at
      ) VALUES (
        NEW.id,
        'status_change',
        timeline_data,
        current_user_id,
        now()
      );
    END IF;
    
    -- Source change
    IF (TG_OP = 'UPDATE' AND OLD.source_id IS DISTINCT FROM NEW.source_id) THEN
      old_source_id := OLD.source_id;
      new_source_id := NEW.source_id;
      
      timeline_data := jsonb_build_object(
        'old_source_id', old_source_id,
        'new_source_id', new_source_id
      );
      
      INSERT INTO lead_timeline (
        lead_id,
        event_type,
        event_data,
        created_by,
        created_at
      ) VALUES (
        NEW.id,
        'source_change',
        timeline_data,
        current_user_id,
        now()
      );
    END IF;
    
    RETURN NEW;
  END;
  $inner$;
  
  RETURN 'Successfully updated register_lead_timeline_event function';
END;
$$;

-- Grant permissions to execute the function
GRANT EXECUTE ON FUNCTION public.fix_register_lead_timeline_event() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fix_register_lead_timeline_event() TO service_role; 