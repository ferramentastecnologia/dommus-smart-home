-- Script para aplicar manualmente a notificação de agentes para novos leads
-- Execute este script diretamente no banco de dados do Supabase 

-- Primeiro, remover a constraint existente para permitir atualizações
ALTER TABLE public.email_templates DROP CONSTRAINT IF EXISTS email_templates_trigger_type_check;

-- Agora, atualizar registros incompatíveis para um valor válido
UPDATE public.email_templates
SET trigger_type = 'custom'
WHERE trigger_type NOT IN ('birthday', 'new_lead', 'meeting', 'custom', 'agent_new_lead_notification', 'manual')
AND trigger_type IS NOT NULL;

-- Recriar a constraint com a nova definição
ALTER TABLE public.email_templates ADD CONSTRAINT email_templates_trigger_type_check 
CHECK (trigger_type IN ('birthday', 'new_lead', 'meeting', 'custom', 'agent_new_lead_notification', 'manual'));

-- Cria um template para notificação de agentes se não existir
DO $$
DECLARE
  template_exists INTEGER;
BEGIN
  -- Verificar se o template já existe
  SELECT COUNT(*) INTO template_exists
  FROM public.email_templates
  WHERE name = 'Nova Notificação de Lead para Agentes';
  
  -- Se não existir, criar
  IF template_exists = 0 THEN
    INSERT INTO public.email_templates 
    (name, subject, content, trigger_type, is_active, created_at, updated_at)
    VALUES 
    (
      'Nova Notificação de Lead para Agentes',
      'Novo Lead: {{lead_name}} - Atribuído ao Sistema',
      '<p>Olá {{agent_name}},</p>
      <p>Um novo lead foi adicionado ao sistema:</p>
      <ul>
        <li><strong>Nome:</strong> {{lead_name}}</li>
        <li><strong>Email:</strong> {{lead_email}}</li>
        <li><strong>Telefone:</strong> {{lead_phone}}</li>
        <li><strong>Empresa:</strong> {{lead_company}}</li>
      </ul>
      <p>Acesse o sistema para verificar mais detalhes e assumir a responsabilidade por esse lead, caso necessário.</p>
      <p>Atenciosamente,<br>Agile CRM</p>',
      'agent_new_lead_notification',
      TRUE,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Template "Nova Notificação de Lead para Agentes" criado com sucesso.';
  ELSE
    RAISE NOTICE 'Template "Nova Notificação de Lead para Agentes" já existe.';
  END IF;
END $$;

-- Atualiza a função de trigger para incluir notificações para os agentes
CREATE OR REPLACE FUNCTION public.handle_new_lead_email()
RETURNS TRIGGER AS $$
DECLARE
  template_record RECORD;
  agent_record RECORD;
  agent_template_record RECORD;
BEGIN
  -- 1. Busca o template ativo para novos leads (email para o lead)
  SELECT * INTO template_record
  FROM public.email_templates
  WHERE trigger_type = 'new_lead' AND is_active = TRUE
  LIMIT 1;
  
  -- Se encontrou um template ativo para o lead
  IF FOUND THEN
    -- Insere na fila de emails (notificação para o lead)
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
  
  -- 2. Busca o template ativo para notificar agentes sobre novos leads
  SELECT * INTO agent_template_record
  FROM public.email_templates
  WHERE trigger_type = 'agent_new_lead_notification' AND is_active = TRUE
  LIMIT 1;
  
  -- Se encontrou um template ativo para agentes
  IF FOUND THEN
    -- Para cada agente ativo, adiciona um email na fila
    FOR agent_record IN 
      SELECT * FROM public.agents WHERE status = 'active'
    LOOP
      -- Prepara o assunto e conteúdo com dados do lead e do agente
      INSERT INTO public.email_queue
      (lead_id, template_id, status, "to", subject, content, created_at, updated_at)
      VALUES
      (
        NEW.id,
        agent_template_record.id,
        'pending',
        agent_record.email,
        REPLACE(
          REPLACE(agent_template_record.subject, '{{lead_name}}', COALESCE(NEW.name, '')),
          '{{agent_name}}', COALESCE(agent_record.name, '')
        ),
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(agent_template_record.content, 
                  '{{lead_name}}', COALESCE(NEW.name, '')
                ),
                '{{lead_email}}', COALESCE(NEW.email, '')
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 