-- supabase/migrations/20240712100000_create_complete_provider_registration_function.sql

create or replace function public.complete_provider_registration(
    p_business_name text,
    p_business_type text,
    p_business_address text,
    p_years_of_experience int,
    p_license_number text,
    p_tax_id text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
begin
    -- Check if a provider record already exists for the user
    if exists (select 1 from public.providers where user_id = v_user_id) then
        raise exception 'Provider profile already exists for this user.';
    end if;

    -- Insert the new provider record
    insert into public.providers (
        user_id,
        business_name,
        business_type,
        business_address,
        years_of_experience,
        license_number,
        tax_id
    )
    values (
        v_user_id,
        p_business_name,
        p_business_type,
        p_business_address,
        p_years_of_experience,
        p_license_number,
        p_tax_id
    );

    -- Update the user's profile to 'provider' and verification to 'pending'
    update public.profiles
    set
        user_type = 'provider',
        verification_status = 'pending'
    where id = v_user_id;
end;
$$;
