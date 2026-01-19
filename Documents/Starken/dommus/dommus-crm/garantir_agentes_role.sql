-- Garantir que todos os AGENTES na tabela agents tenham role 'agent'
-- Execute este script no Supabase SQL Editor

-- ==================================================
-- 1. VER QUAIS AGENTES EXISTEM
-- ==================================================
SELECT 
    id,
    name as "Nome",
    email as "Email",
    role as "Role Atual",
    status as "Status"
FROM agents
ORDER BY name;

-- ==================================================
-- 2. ATUALIZAR TODOS para 'agent' (exceto se já for admin/manager)
-- ==================================================
-- Descomente a linha abaixo para executar:
-- UPDATE agents 
-- SET role = 'agent'
-- WHERE role IS NULL OR role NOT IN ('admin', 'manager');

-- ==================================================
-- 3. OU atualizar TODOS para 'agent' (sobrescreve tudo)
-- ==================================================
-- CUIDADO: Isso vai sobrescrever TODOS os roles, inclusive admins/managers
-- Só use se tiver certeza que nenhum agente deve ser admin/manager
-- UPDATE agents 
-- SET role = 'agent';

-- ==================================================
-- 4. VERIFICAR APÓS ATUALIZAR
-- ==================================================
SELECT 
    role as "Role",
    COUNT(*) as "Quantidade"
FROM agents
GROUP BY role;

-- ==================================================
-- LEMBRETE:
-- ==================================================
-- ✅ contado@profortuna NÃO deve estar nesta tabela
-- ✅ Ele terá role 'admin' via user_metadata no Auth
-- ✅ Todos os AGENTES devem ter role 'agent' nesta tabela

