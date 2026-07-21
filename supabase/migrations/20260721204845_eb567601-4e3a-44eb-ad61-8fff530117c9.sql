
-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Feature likes + truck of the month
ALTER TABLE public.features ADD COLUMN like_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.features ADD COLUMN truck_of_month boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.increment_feature_likes(_feature_number integer)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.features
  SET like_count = like_count + 1
  WHERE feature_number = _feature_number AND published = true
  RETURNING like_count;
$$;
GRANT EXECUTE ON FUNCTION public.increment_feature_likes(integer) TO anon, authenticated;
