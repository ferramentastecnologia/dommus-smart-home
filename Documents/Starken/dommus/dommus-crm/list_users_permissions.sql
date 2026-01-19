-- Lista todos os usuários e suas permissões
-- Execute este script no Supabase SQL Editor

-- Consulta completa de usuários e roles
SELECT 
    a.id,
    a.name as "Nome",
    a.email as "Email",
    a.role as "Role (Permissão)",
    a.status as "Status",
    a.position as "Cargo",
    CASE 
        WHEN a.role = 'admin' THEN '✅ VÊ TUDO + Settings + Admin Dashboard'
        WHEN a.role = 'manager' THEN '✅ VÊ TUDO (todos leads, tasks, clients)'
        WHEN a.role = 'agent' THEN '❌ Vê APENAS seus dados atribuídos'
        ELSE '⚠️ Role não definido (comportamento: agent)'
    END as "Descrição da Permissão",
    a.created_at as "Criado em"
FROM agents a
ORDER BY 
    CASE a.role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'agent' THEN 3
        ELSE 4
    END,
    a.name;

-- Contagem por role
SELECT 
    COALESCE(role, 'undefined') as "Role",
    COUNT(*) as "Total de Usuários"
FROM agents
GROUP BY role
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'agent' THEN 3
        ELSE 4
    END;

