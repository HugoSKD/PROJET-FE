-- Create test user account with proper password hash
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@example.com',
  -- Password hash for 'Test123!'
  '$2a$10$RgZM5fXHGvxTMUJ5d5QHUu4GPB8Sm9uJqZ7c4XSn1T0KQ9WMqJsOC',
  now(),
  '{"username": "demo_user"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create profile for test user
INSERT INTO public.profiles (
  id,
  username,
  role,
  bio,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo_user',
  'user',
  'Compte de démonstration pour explorer la plateforme',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;