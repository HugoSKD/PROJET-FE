-- Create test user account with proper password hash
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  -- Password hash for 'Test1234!'
  '$2a$10$RgZM5fXHGvxTMUJ5d5QHUu4GPB8Sm9uJqZ7c4XSn1T0KQ9WMqJsOC',
  now(),
  '{"username": "test_user"}'::jsonb
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