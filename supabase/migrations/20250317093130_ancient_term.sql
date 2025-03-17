-- Create test user and profile with proper cleanup
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000005';
  test_email text := 'test@example.com';
  test_username text := 'test_user';
  test_password text := 'Test123!';
BEGIN
  -- First try to delete any existing data for this test user
  DELETE FROM public.profiles WHERE id = test_user_id OR username = test_username;
  DELETE FROM auth.users WHERE id = test_user_id OR email = test_email;
  
  -- Create the test user with proper auth fields
  INSERT INTO auth.users (
    id,
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    instance_id,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    recovery_token,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_token_current,
    email_change_token_new,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
  ) VALUES (
    test_user_id,
    test_email,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('username', test_username),
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000',
    crypt(test_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    0,
    null,
    encode(gen_random_bytes(32), 'base64'),
    now()
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
    test_username,
    'user',
    'Test account for exploring the platform',
    now(),
    now()
  );

EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the migration
  RAISE NOTICE 'Error creating test user: %', SQLERRM;
END $$;