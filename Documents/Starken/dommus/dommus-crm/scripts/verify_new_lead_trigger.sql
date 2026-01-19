-- Script para verificar e corrigir o trigger de notificação para novos leads
-- Verifica se o trigger existe e o recria se necessário

-- Verifica se o trigger existe
DO $$
DECLARE
  trigger_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_exists
  FROM pg_trigger 
  WHERE tgname = 'new_lead_email_trigger';
  
  -- Se o trigger não existir, cria-o
  IF trigger_exists = 0 THEN
    -- Remover qualquer versão antiga do trigger que possa existir
    DROP TRIGGER IF EXISTS new_lead_email_trigger ON public.leads;
    
    -- Criar o trigger novamente
    CREATE TRIGGER new_lead_email_trigger
    AFTER INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_lead_email();
    
    RAISE NOTICE 'Trigger new_lead_email_trigger foi criado/recriado com sucesso.';
  ELSE
    RAISE NOTICE 'Trigger new_lead_email_trigger já existe. Nenhuma ação necessária.';
  END IF;
END $$; 