
ALTER TABLE public.features
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS instagram_post_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category text;

UPDATE public.features SET status = 'published' WHERE published = true AND status = 'draft';

CREATE UNIQUE INDEX IF NOT EXISTS features_slug_unique ON public.features (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.build_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  instagram text,
  website text,
  logo_url text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.build_partners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.build_partners TO authenticated;
GRANT ALL ON public.build_partners TO service_role;

ALTER TABLE public.build_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partners" ON public.build_partners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert partners" ON public.build_partners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update partners" ON public.build_partners FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete partners" ON public.build_partners FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER build_partners_set_updated
  BEFORE UPDATE ON public.build_partners
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.feature_partners (
  feature_id uuid NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.build_partners(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (feature_id, partner_id)
);

GRANT SELECT ON public.feature_partners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feature_partners TO authenticated;
GRANT ALL ON public.feature_partners TO service_role;

ALTER TABLE public.feature_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature partners" ON public.feature_partners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert feature partners" ON public.feature_partners FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update feature partners" ON public.feature_partners FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete feature partners" ON public.feature_partners FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
