-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'lojista', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES ------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile select" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CONSULTAS -----------------------------------------------------------
CREATE TABLE public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  placa TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  fonte TEXT NOT NULL DEFAULT 'demo',
  provedor TEXT,
  custo_centavos INTEGER NOT NULL DEFAULT 0,
  preco_centavos INTEGER NOT NULL DEFAULT 4990,
  relatorio JSONB,
  erro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX consultas_user_idx ON public.consultas (user_id, created_at DESC);
CREATE INDEX consultas_placa_idx ON public.consultas (placa, created_at DESC);
GRANT SELECT ON public.consultas TO authenticated;
GRANT ALL ON public.consultas TO service_role;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own consultas" ON public.consultas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read consultas" ON public.consultas
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- PROVEDORES (config de custo/prioridade, sem segredos) -----------------
CREATE TABLE public.provedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  prioridade INTEGER NOT NULL DEFAULT 100,
  custo_centavos INTEGER NOT NULL DEFAULT 0,
  env_var TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provedores TO authenticated;
GRANT ALL ON public.provedores TO service_role;
ALTER TABLE public.provedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage provedores" ON public.provedores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.provedores (slug, nome, prioridade, custo_centavos, env_var) VALUES
  ('infosimples', 'Infosimples', 10, 350, 'INFOSIMPLES_TOKEN'),
  ('apibrasil', 'API Brasil', 20, 250, 'APIBRASIL_TOKEN'),
  ('consultasprime', 'Consultas Prime', 30, 300, 'CONSULTASPRIME_TOKEN');
