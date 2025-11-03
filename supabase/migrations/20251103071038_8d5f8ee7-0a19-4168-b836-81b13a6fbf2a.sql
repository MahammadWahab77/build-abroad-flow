-- Insert admin user: gundluru.mahammadwahab@nxtwave.co.in
INSERT INTO public.users (name, email, password, role, is_active, phone)
VALUES (
  'Gundluru Mahammad Wahab',
  'gundluru.mahammadwahab@nxtwave.co.in',
  'NxtWave@123',
  'admin',
  true,
  NULL
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Insert admin user: likhitha.nyasala@nxtwave.co.in
INSERT INTO public.users (name, email, password, role, is_active, phone)
VALUES (
  'Likhitha Nyasala',
  'likhitha.nyasala@nxtwave.co.in',
  'NxtWave@123',
  'admin',
  true,
  NULL
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;