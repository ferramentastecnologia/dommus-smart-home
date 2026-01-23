-- Criar tabela quote_items para armazenar itens dos orçamentos
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES catalog_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  room VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Allow read for authenticated users" ON quote_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Allow insert for authenticated users" ON quote_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Allow update for authenticated users" ON quote_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Allow delete for authenticated users" ON quote_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_quote_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quote_items_updated_at
  BEFORE UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_items_updated_at();

-- Comentários
COMMENT ON TABLE quote_items IS 'Itens individuais de cada orçamento';
COMMENT ON COLUMN quote_items.quote_id IS 'ID do orçamento pai';
COMMENT ON COLUMN quote_items.product_id IS 'ID do produto do catálogo (opcional para itens personalizados)';
COMMENT ON COLUMN quote_items.description IS 'Descrição do item';
COMMENT ON COLUMN quote_items.quantity IS 'Quantidade';
COMMENT ON COLUMN quote_items.unit_price IS 'Preço unitário';
COMMENT ON COLUMN quote_items.discount IS 'Desconto aplicado no item';
COMMENT ON COLUMN quote_items.total_price IS 'Preço total (quantidade * preço_unitário - desconto)';
COMMENT ON COLUMN quote_items.room IS 'Ambiente/cômodo onde o item será instalado';
