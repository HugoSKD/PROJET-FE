-- Create test user account
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  encrypted_password
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  '{"username": "test_user"}'::jsonb,
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12'
) ON CONFLICT (id) DO NOTHING;

-- Create profile for test user
INSERT INTO public.profiles (
  id,
  username,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test_user',
  'user'
) ON CONFLICT (id) DO NOTHING;