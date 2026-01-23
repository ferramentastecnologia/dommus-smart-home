-- =====================================================
-- DOMMUS SMART HOME CRM - CORREÇÃO STATUS_ID DOS LEADS
-- Execute este script para corrigir leads que não têm status_id definido
-- =====================================================

-- 1. Primeiro, garantir que todos os status padrão existem
INSERT INTO lead_statuses (name, color, order_index, is_default)
SELECT 'Novo', '#3b82f6', 0, true
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Novo');

INSERT INTO lead_statuses (name, color, order_index)
SELECT 'Qualificado', '#8b5cf6', 1
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Qualificado');

INSERT INTO lead_statuses (name, color, order_index)
SELECT 'Em Contato', '#f59e0b', 2
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Em Contato');

INSERT INTO lead_statuses (name, color, order_index)
SELECT 'Proposta', '#06b6d4', 3
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Proposta');

INSERT INTO lead_statuses (name, color, order_index, is_converted)
SELECT 'Convertido', '#22c55e', 4, true
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Convertido');

INSERT INTO lead_statuses (name, color, order_index, is_discarded)
SELECT 'Perdido', '#ef4444', 5, true
WHERE NOT EXISTS (SELECT 1 FROM lead_statuses WHERE name = 'Perdido');

-- 2. Atualizar leads existentes que têm status texto mas não têm status_id
UPDATE leads l
SET status_id = ls.id
FROM lead_statuses ls
WHERE l.status = ls.name
  AND l.status_id IS NULL;

-- 3. Verificar leads que ainda não têm status_id e definir como 'Novo'
UPDATE leads l
SET
  status_id = (SELECT id FROM lead_statuses WHERE name = 'Novo' LIMIT 1),
  status = 'Novo'
WHERE l.status_id IS NULL;

-- 4. Garantir que todos os leads têm o campo status preenchido corretamente
UPDATE leads l
SET status = ls.name
FROM lead_statuses ls
WHERE l.status_id = ls.id
  AND (l.status IS NULL OR l.status = '' OR l.status != ls.name);

-- 5. Mostrar resultado
SELECT
  'Leads corrigidos com sucesso!' AS resultado,
  COUNT(*) AS total_leads,
  COUNT(status_id) AS leads_com_status_id,
  COUNT(*) FILTER (WHERE status IS NOT NULL AND status != '') AS leads_com_status_texto
FROM leads;

-- 6. Mostrar distribuição por status
SELECT
  ls.name AS status,
  ls.color,
  COUNT(l.id) AS quantidade
FROM lead_statuses ls
LEFT JOIN leads l ON l.status_id = ls.id
GROUP BY ls.id, ls.name, ls.color, ls.order_index
ORDER BY ls.order_index;
