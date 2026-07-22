
-- Grant Data API access to all public tables. RLS already restricts what each role can actually do.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.features TO authenticated;
GRANT SELECT ON public.features TO anon;
GRANT ALL ON public.features TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT INSERT ON public.submissions TO anon;
GRANT ALL ON public.submissions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.giveaways TO authenticated;
GRANT SELECT ON public.giveaways TO anon;
GRANT ALL ON public.giveaways TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.giveaway_entries TO authenticated;
GRANT SELECT, INSERT ON public.giveaway_entries TO anon;
GRANT ALL ON public.giveaway_entries TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT SELECT ON public.announcements TO anon;
GRANT ALL ON public.announcements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.build_partners TO authenticated;
GRANT SELECT ON public.build_partners TO anon;
GRANT ALL ON public.build_partners TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_partners TO authenticated;
GRANT SELECT ON public.feature_partners TO anon;
GRANT ALL ON public.feature_partners TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
