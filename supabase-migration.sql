-- run this in your Supabase SQL Editor
-- 1. Create a public 'profiles' table that mirrors auth.users
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text not null unique,
  username text not null unique,
  role text default 'user',
  tier text default 'Basic',
  artist_name text,
  bio text,
  profile_pic_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Trigger function to automatically create a profile for new users
-- Also intercepts the 'sxvxgemelo' logic!
create function public.handle_new_user()
returns trigger as $$
declare
  starting_tier text;
begin
  -- Assign Tier based on custom rules
  starting_tier := 'Basic';
  if new.raw_user_meta_data->>'username' = 'sxvxgemelo' then
    starting_tier := 'Pro DJ';
  end if;

  insert into public.profiles (id, email, username, tier)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    starting_tier
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- That's it! Sequelize will handle creating the 'audio_tracks' and 'subscriptions' tables automatically since we left sync() on in server.js!
