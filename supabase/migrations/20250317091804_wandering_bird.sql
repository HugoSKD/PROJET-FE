-- Create test user and profile with proper cleanup
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- First try to delete any existing data for this test user
  DELETE FROM public.profiles WHERE id = test_user_id OR username = 'test_user';
  DELETE FROM auth.users WHERE id = test_user_id OR email = 'test@demo.com';
  
  -- Create the test user
  INSERT INTO auth.users (
    id,
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    test_user_id,
    'test@demo.com',
    '{"provider":"email","providers":["email"]}',
    '{"username":"test_user"}',
    'authenticated',
    'authenticated',
    -- Password hash for 'Test123!'
    crypt('Test123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
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