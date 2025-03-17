-- Create test user and profile with proper error handling
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000002';
BEGIN
  -- First try to delete any existing data for this test user
  DELETE FROM auth.users WHERE id = test_user_id;
  
  -- Create the test user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    test_user_id,
    'test@demo.com',
    -- Password hash for 'Test123!'
    '$2a$10$RgZM5fXHGvxTMUJ5d5QHUu4GPB8Sm9uJqZ7c4XSn1T0KQ9WMqJsOC',
    now(),
    '{"username": "test_user"}'::jsonb
  );

  -- Create the profile
  INSERT INTO public.profiles (
    id,
    username,
    role,
    bio,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    'test_user',
    'user',
    'Compte de test pour explorer la plateforme',
    now(),
    now()
  );

EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the migration
  RAISE NOTICE 'Error creating test user: %', SQLERRM;
END $$;