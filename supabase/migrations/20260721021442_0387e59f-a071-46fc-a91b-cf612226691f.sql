
CREATE OR REPLACE FUNCTION public.tg_assign_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_first_admin ON auth.users;
CREATE TRIGGER assign_first_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.tg_assign_first_admin();

-- Backfill: if any user exists but no admin, promote the earliest user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT DO NOTHING;
