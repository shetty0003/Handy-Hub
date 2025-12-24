-- supabase/migrations/20240712000000_create_user_profile_trigger.sql

-- 1. Create the function to be called by the trigger
create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert a new profile record for the new user
  insert into public.profiles (id, email, user_type, full_name)
  values (
    new.id,
    new.email,
    -- Extract user_type from metadata, default to 'customer'
    new.raw_user_meta_data->>'user_type',
    -- Extract full_name from metadata, default to 'New User'
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- 2. Create the trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_user_profile();
