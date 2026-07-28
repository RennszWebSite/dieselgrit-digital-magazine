DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read of site media buckets') THEN
    CREATE POLICY "Public read of site media buckets" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id IN ('feature-images', 'partner-logos', 'submission-photos'));
  END IF;
END $$;