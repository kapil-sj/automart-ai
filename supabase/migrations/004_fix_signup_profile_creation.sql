-- Migration: 004_fix_signup_profile_creation.sql
-- Fix signup profile creation and restrict direct table permissions.

BEGIN;

REVOKE ALL PRIVILEGES
ON TABLE public.app_profiles
FROM PUBLIC, anon;

REVOKE DELETE, TRUNCATE, TRIGGER, REFERENCES
ON TABLE public.app_profiles
FROM authenticated;

GRANT SELECT, INSERT, UPDATE
ON TABLE public.app_profiles
TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    signup_user_id text;
BEGIN
    IF coalesce(auth.role(), '') = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.role IS DISTINCT FROM 'customer'::public.app_role THEN
            RAISE EXCEPTION 'New profiles must have the customer role';
        END IF;

        IF auth.uid() IS NOT NULL THEN
            IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
                RAISE EXCEPTION 'Customers may only create their own profile';
            END IF;
        ELSE
            signup_user_id := current_setting('automart.signup_user_id', true);

            IF signup_user_id IS DISTINCT FROM NEW.user_id::text THEN
                RAISE EXCEPTION
                    'Profile creation without a user session is only allowed during signup';
            END IF;
        END IF;

    ELSIF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION
            'Profile identity, role, and creation time are immutable';
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    previous_signup_user_id text;
BEGIN
    previous_signup_user_id :=
        current_setting('automart.signup_user_id', true);

    PERFORM set_config('automart.signup_user_id', NEW.id::text, true);

    INSERT INTO public.app_profiles (user_id, display_name, role)
    VALUES (
        NEW.id,
        coalesce(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        'customer'::public.app_role
    )
    ON CONFLICT (user_id) DO NOTHING;

    PERFORM set_config(
        'automart.signup_user_id',
        coalesce(previous_signup_user_id, ''),
        true
    );

    RETURN NEW;
END;
$function$;

COMMIT;
