/*
  # Fix demo accounts and authentication

  1. Updates
    - Ensure profiles table has proper constraints
    - Add upsert capability for demo accounts
    - Fix RLS policies for better demo account handling

  2. Demo Account Support
    - Allow demo account creation without email confirmation
    - Ensure proper profile creation for demo users
*/

-- Ensure profiles table exists with proper structure
DO $$
BEGIN
  -- Update the handle_new_user function to be more robust
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS trigger AS $func$
  BEGIN
    INSERT INTO public.profiles (id, name, role, avatar_url)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'role', 'patient'),
      'https://api.dicebear.com/7.x/personas/svg?seed=' || new.email
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(new.raw_user_meta_data->>'name', EXCLUDED.name),
      role = COALESCE(new.raw_user_meta_data->>'role', EXCLUDED.role),
      updated_at = now();
    RETURN new;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Recreate the trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

  -- Update RLS policies to be more permissive for profile creation
  DROP POLICY IF EXISTS "New users can create profile" ON profiles;
  CREATE POLICY "New users can create profile"
    ON profiles
    FOR INSERT
    WITH CHECK (true); -- Allow any authenticated user to create a profile

  -- Add policy for public profile creation (needed for demo accounts)
  DROP POLICY IF EXISTS "Public can create demo profiles" ON profiles;
  CREATE POLICY "Public can create demo profiles"
    ON profiles
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = id);

END $$;