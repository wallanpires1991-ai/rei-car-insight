CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  placa TEXT NOT NULL,
  preference_id TEXT,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metodo TEXT,
  valor_centavos INTEGER NOT NULL DEFAULT 4990,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve seus pagamentos"
ON public.pagamentos FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_pagamentos_placa ON public.pagamentos (placa, status);
CREATE INDEX idx_pagamentos_payment_id ON public.pagamentos (payment_id);