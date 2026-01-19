-- Script para adicionar uma coluna user_id à tabela agents
-- e estabelecer uma relação direta com auth.users

-- Iniciar uma transação para garantir que todas as alterações sejam aplicadas juntas
BEGIN;

-- Adicionar coluna user_id à tabela agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS user_id UUID NULL;

-- Adicionar um comentário explicativo
COMMENT ON COLUMN agents.user_id IS 'ID do usuário correspondente na tabela auth.users';

-- Adicionar índice para melhorar a performance de consultas
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Executar uma atualização para associar cada agente ao respectivo usuário
-- usando o email como campo de junção
UPDATE agents a
SET user_id = u.id
FROM auth.users u
WHERE a.email = u.email;

-- Adicionar constraint de chave estrangeira (opcional - dependendo das políticas de segurança)
-- ALTER TABLE agents 
-- ADD CONSTRAINT fk_agents_auth_users 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Opcional: Adicionar validação para novos registros (requer que user_id seja preenchido)
-- ALTER TABLE agents ALTER COLUMN user_id SET NOT NULL;

-- Confirmar alterações
COMMIT;

-- Instruções para uso após a execução:
-- 1. Verifique se todos os agentes têm user_id atribuído:
--    SELECT id, name, email, user_id FROM agents WHERE user_id IS NULL;
--
-- 2. Se necessário, atualize manualmente os registros que não puderam ser associados:
--    UPDATE agents SET user_id = 'uuid-específico' WHERE id = 'id-do-agente'; 