
-- Fix search_path on trigger function
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke public execute on has_role; only used internally by RLS (SECURITY DEFINER already bypasses invoker perms in policy context)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated;

-- Storage policies (feature-images: admin write, public read via signed URLs handled via policy on objects)
CREATE POLICY "Public read feature images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'feature-images');
CREATE POLICY "Admins upload feature images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'feature-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update feature images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'feature-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete feature images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'feature-images' AND public.has_role(auth.uid(), 'admin'));

-- submission-photos: admins read, anyone upload
CREATE POLICY "Admins read submission photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'submission-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone upload submission photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'submission-photos');
