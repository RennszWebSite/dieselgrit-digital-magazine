
CREATE OR REPLACE FUNCTION public.increment_feature_views(_feature_number integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.features
  SET view_count = view_count + 1
  WHERE feature_number = _feature_number AND published = true;
$$;

GRANT EXECUTE ON FUNCTION public.increment_feature_views(integer) TO anon, authenticated;
