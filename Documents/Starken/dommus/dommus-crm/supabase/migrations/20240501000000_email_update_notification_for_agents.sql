-- Atualiza o sistema para notificar agentes quando o email de um lead é alterado
BEGIN;

-- 1. Primeiro, criar um novo template de email para notificação de alteração de email
DO $$ 
DECLARE
  template_exists INTEGER;
BEGIN
  -- Verificar se o template já existe
  SELECT COUNT(*) INTO template_exists
  FROM public.email_templates
  WHERE name = 'Notificação de Alteração de Email para Agentes';
  
  -- Se não existir, criar
  IF template_exists = 0 THEN
    INSERT INTO public.email_templates 
    (name, subject, content, trigger_type, is_active, created_at, updated_at)
    VALUES 
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
      TRUE,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Template "Notificação de Alteração de Email para Agentes" criado com sucesso.';
  ELSE
    RAISE NOTICE 'Template "Notificação de Alteração de Email para Agentes" já existe.';
  END IF;
END $$;

-- 2. Adicionar o novo tipo de trigger à constraint de validação de trigger_type
ALTER TABLE public.email_templates DROP CONSTRAINT IF EXISTS email_templates_trigger_type_check;

-- Atualizar tipos de trigger que não estão na lista para 'custom'
UPDATE public.email_templates
SET trigger_type = 'custom'
WHERE trigger_type NOT IN ('birthday', 'new_lead', 'meeting', 'custom', 'agent_new_lead_notification', 'manual', 'email_update_notification')
AND trigger_type IS NOT NULL;

-- Recriar a constraint com o novo tipo
ALTER TABLE public.email_templates ADD CONSTRAINT email_templates_trigger_type_check
CHECK (trigger_type IN ('birthday', 'new_lead', 'meeting', 'custom', 'agent_new_lead_notification', 'manual', 'email_update_notification'));

-- 3. Criar função para notificar agentes sobre alteração de email de lead
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

-- 4. Criar o trigger para alteração de email
DROP TRIGGER IF EXISTS lead_email_update_notification_trigger ON public.leads;

CREATE TRIGGER lead_email_update_notification_trigger
AFTER UPDATE ON public.leads
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.handle_lead_email_update();

COMMIT; 