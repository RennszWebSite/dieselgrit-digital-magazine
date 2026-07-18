
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

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
CREATE POLICY "Users see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- FEATURES
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_number INT NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT false,
  publish_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_instagram TEXT NOT NULL,
  title TEXT NOT NULL,
  truck_year INT,
  make TEXT NOT NULL,
  model TEXT,
  engine TEXT,
  story TEXT,
  build_specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.features TO authenticated;
GRANT ALL ON public.features TO service_role;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published features" ON public.features FOR SELECT TO anon USING (published = true);
CREATE POLICY "Authenticated can view published features" ON public.features FOR SELECT TO authenticated USING (published = true);
CREATE POLICY "Admins can view all features" ON public.features FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert features" ON public.features FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update features" ON public.features FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete features" ON public.features FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX features_number_idx ON public.features (feature_number DESC);
CREATE INDEX features_published_idx ON public.features (published, publish_date DESC);

-- SUBMISSIONS
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  instagram TEXT NOT NULL,
  email TEXT NOT NULL,
  truck_year INT,
  make TEXT NOT NULL,
  model TEXT,
  engine TEXT,
  wheel_setup TEXT,
  suspension TEXT,
  build_list TEXT,
  story TEXT,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.submission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit" ON public.submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can submit" ON public.submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view submissions" ON public.submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update submissions" ON public.submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete submissions" ON public.submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER features_updated_at BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
