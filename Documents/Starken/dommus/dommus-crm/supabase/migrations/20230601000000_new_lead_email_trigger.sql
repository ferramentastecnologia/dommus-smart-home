-- Cria a função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_lead_email()
RETURNS TRIGGER AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Busca o template ativo para novos leads
  SELECT * INTO template_record
  FROM public.email_templates
  WHERE trigger_type = 'new_lead' AND is_active = TRUE
  LIMIT 1;
  
  -- Se encontrou um template ativo
  IF FOUND THEN
    -- Insere na fila de emails
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o trigger que é acionado para novos leads
DROP TRIGGER IF EXISTS new_lead_email_trigger ON public.leads;

CREATE TRIGGER new_lead_email_trigger
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_lead_email(); 