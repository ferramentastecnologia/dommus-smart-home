-- Versão simplificada da função que apenas atualiza o source_id
-- sem tentar inserir na timeline - útil quando há problemas com o trigger
CREATE OR REPLACE FUNCTION public.simple_update_lead_source(p_lead_id uuid, p_source_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar o source_id na tabela leads
  UPDATE leads
  SET source_id = p_source_id
  WHERE id = p_lead_id;
  
  -- Verificar se a atualização afetou alguma linha
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating lead source: %', SQLERRM;
    RETURN false;
END;
$$;

-- Conceder permissão para chamar a função
GRANT EXECUTE ON FUNCTION public.simple_update_lead_source(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simple_update_lead_source(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.simple_update_lead_source(uuid, uuid) TO service_role;

-- Function to properly update lead source information
-- Ensures both source_id and source fields are updated consistently
CREATE OR REPLACE FUNCTION public.update_lead_source(
  lead_id UUID, 
  source_id UUID DEFAULT NULL,
  source_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_name TEXT;
  v_source_id UUID;
BEGIN
  -- If only source_id is provided, retrieve the source name
  IF source_id IS NOT NULL AND source_name IS NULL THEN
    SELECT name INTO v_source_name FROM lead_sources WHERE id = source_id;
    IF v_source_name IS NULL THEN
      RAISE EXCEPTION 'Source ID % not found', source_id;
    END IF;
    
    UPDATE leads 
    SET 
      source_id = source_id,
      source = v_source_name,
      updated_at = now()
    WHERE id = lead_id;
    
  -- If only source_name is provided, retrieve the source_id
  ELSIF source_id IS NULL AND source_name IS NOT NULL THEN
    SELECT id INTO v_source_id FROM lead_sources WHERE name = source_name;
    IF v_source_id IS NULL THEN
      RAISE EXCEPTION 'Source name % not found', source_name;
    END IF;
    
    UPDATE leads 
    SET 
      source_id = v_source_id,
      source = source_name,
      updated_at = now()
    WHERE id = lead_id;
    
  -- If both are provided, use them directly
  ELSIF source_id IS NOT NULL AND source_name IS NOT NULL THEN
    UPDATE leads 
    SET 
      source_id = source_id,
      source = source_name,
      updated_at = now()
    WHERE id = lead_id;
    
  -- If both are NULL, clear the source information
  ELSE
    UPDATE leads 
    SET 
      source_id = NULL,
      source = NULL,
      updated_at = now()
    WHERE id = lead_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Conceder permissão para chamar a função
GRANT EXECUTE ON FUNCTION public.update_lead_source(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_lead_source(uuid, uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_lead_source(uuid, uuid, text) TO service_role; 