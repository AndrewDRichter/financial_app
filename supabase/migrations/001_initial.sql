-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type         TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
  category_id  UUID        REFERENCES categories(id) ON DELETE SET NULL,
  amount       INTEGER     NOT NULL CHECK (amount > 0),
  currency     TEXT        NOT NULL CHECK (currency IN ('PYG', 'USD')),
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_type        ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_currency    ON transactions(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at  ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

-- RLS: allow full public access (personal app)
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_all"   ON categories   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "transactions_all" ON transactions  FOR ALL USING (true) WITH CHECK (true);

-- Default categories
INSERT INTO categories (name, type) VALUES
  ('Salário',            'income'),
  ('Freelance',          'income'),
  ('Outros Rendimentos', 'income'),
  ('Mercado',            'expense'),
  ('Compras',            'expense'),
  ('Transporte',         'expense'),
  ('Lazer',              'expense'),
  ('Saúde',              'expense'),
  ('Educação',           'expense'),
  ('Moradia',            'expense'),
  ('Outros',             'both')
ON CONFLICT DO NOTHING;
