REVOKE ALL ON TABLE
  public.features,
  public.submissions,
  public.giveaways,
  public.giveaway_entries,
  public.announcements,
  public.site_settings,
  public.build_partners,
  public.feature_partners,
  public.newsletter_subscribers,
  public.user_roles
FROM anon;

GRANT SELECT ON TABLE
  public.features,
  public.giveaways,
  public.announcements,
  public.site_settings,
  public.build_partners,
  public.feature_partners
TO anon;

GRANT INSERT ON TABLE
  public.submissions,
  public.giveaway_entries,
  public.newsletter_subscribers
TO anon;