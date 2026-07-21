
-- features
GRANT SELECT ON public.features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.features TO authenticated;
GRANT ALL ON public.features TO service_role;

-- submissions (anon can insert per policy; only admins can read)
GRANT INSERT ON public.submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;

-- build_partners
GRANT SELECT ON public.build_partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.build_partners TO authenticated;
GRANT ALL ON public.build_partners TO service_role;

-- feature_partners (join table)
GRANT SELECT ON public.feature_partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_partners TO authenticated;
GRANT ALL ON public.feature_partners TO service_role;

-- user_roles (auth-only; used by has_role security definer function)
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
