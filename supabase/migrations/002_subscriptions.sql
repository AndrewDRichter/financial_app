CREATE TABLE IF NOT EXISTS subscriptions (
  id                          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                      TEXT        NOT NULL CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  abacatepay_billing_id       TEXT        UNIQUE,
  current_period_end          TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription
CREATE POLICY "subscriptions_read_own"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());
