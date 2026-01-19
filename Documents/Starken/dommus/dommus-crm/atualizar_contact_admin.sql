-- Atualizar metadata do contact@profortunagroup.com para ADMIN
-- Execute este script no Supabase SQL Editor linha por linha

-- ==================================================
-- 1. VERIFICAR O ESTADO ATUAL
-- ==================================================
SELECT 
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'role' as "role atual",
    raw_user_meta_data->>'name' as "name atual"
FROM auth.users 
WHERE email = 'contact@profortunagroup.com';

-- ==================================================
-- 2. ATUALIZAR PARA ADMIN (EXECUTE ESTA LINHA)
-- ==================================================
UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin", "name": "Contact ProFortuna"}'::jsonb
WHERE email = 'contact@profortunagroup.com';

-- ==================================================
-- 3. VERIFICAR SE ATUALIZOU (DEVE MOSTRAR "admin")
-- ==================================================
SELECT 
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'role' as "role atualizado",
    raw_user_meta_data->>'name' as "name atualizado"
FROM auth.users 
WHERE email = 'contact@profortunagroup.com';

-- ==================================================
-- RESULTADO ESPERADO:
-- ==================================================
-- email: contact@profortunagroup.com
-- raw_user_meta_data: {"role": "admin", "name": "Contact ProFortuna"}
-- role atualizado: admin
-- name atualizado: Contact ProFortuna

