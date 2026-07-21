
CREATE TABLE public.giveaways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  prize TEXT NOT NULL,
  prize_value TEXT,
  hero_image TEXT,
  rules TEXT,
  entry_method TEXT NOT NULL DEFAULT 'form',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  winner_entry_id UUID,
  drawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX giveaways_active_idx ON public.giveaways (active, ends_at DESC);

GRANT SELECT ON public.giveaways TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.giveaways TO authenticated;
GRANT ALL ON public.giveaways TO service_role;

ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active giveaways"
  ON public.giveaways FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can view all giveaways"
  ON public.giveaways FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert giveaways"
  ON public.giveaways FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update giveaways"
  ON public.giveaways FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete giveaways"
  ON public.giveaways FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER giveaways_updated_at
  BEFORE UPDATE ON public.giveaways
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.giveaway_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (giveaway_id, email)
);

CREATE INDEX giveaway_entries_giveaway_idx ON public.giveaway_entries (giveaway_id, created_at DESC);

GRANT INSERT ON public.giveaway_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.giveaway_entries TO authenticated;
GRANT ALL ON public.giveaway_entries TO service_role;

ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can enter an active giveaway"
  ON public.giveaway_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.giveaways g
      WHERE g.id = giveaway_id
        AND g.active = true
        AND g.ends_at > now()
    )
  );

CREATE POLICY "Admins can view entries"
  ON public.giveaway_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete entries"
  ON public.giveaway_entries FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.giveaways
  ADD CONSTRAINT giveaways_winner_fk
  FOREIGN KEY (winner_entry_id) REFERENCES public.giveaway_entries(id) ON DELETE SET NULL;
