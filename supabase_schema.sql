-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  email text,
  first_name text,
  last_name text,
  phone text,
  interests text[],
  notifications jsonb default '{}'::jsonb,
  two_fa_enabled boolean default false,
  referral_code text,
  verified boolean default false,
  subscription_price numeric default 0,
  win_rate numeric,
  avg_hold_days numeric,
  risk_profile text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'user';
create unique index if not exists profiles_email_unique on public.profiles (lower(email)) where email is not null;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

-- Turn on Row Level Security
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
create policy "Admins can update any profile." on profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- TRIGGER for auto-creating profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  base_username text;
  final_username text;
  safe_interests jsonb;
begin
  -- Generate a fallback username from email if not provided in meta_data
  base_username := coalesce(
    new.raw_user_meta_data->>'username', 
    split_part(new.email, '@', 1)
  );
  
  -- If username from metadata is missing (e.g. OAuth), append a suffix to avoid collisions
  if new.raw_user_meta_data->>'username' is null then
    final_username := base_username || '_' || substr(md5(new.id::text), 1, 5);
  else
    final_username := new.raw_user_meta_data->>'username';
  end if;

  -- Safely handle interests array so jsonb_array_elements_text doesn't throw on null
  if jsonb_typeof(new.raw_user_meta_data->'interests') = 'array' then
    safe_interests := new.raw_user_meta_data->'interests';
  else
    safe_interests := '[]'::jsonb;
  end if;

  insert into public.profiles (id, username, email, first_name, last_name, phone, two_fa_enabled, interests)
  values (
    new.id, 
    final_username, 
    new.email,
    new.raw_user_meta_data->>'firstName', 
    new.raw_user_meta_data->>'lastName',
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'twoFA')::boolean, false),
    coalesce(
      (select array_agg(t.v) from jsonb_array_elements_text(safe_interests) as t(v)),
      array[]::text[]
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SOCIAL GRAPH: POSTS
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  silo text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. COMMENTS
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. LIKES
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- 5. FOLLOWERS
create table public.followers (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- 6. INVESTMENT SQUADS
create table public.squads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SQUAD MEMBERS
create table public.squad_members (
  id uuid default uuid_generate_v4() primary key,
  squad_id uuid references public.squads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(squad_id, user_id)
);

-- 8. HOLDINGS (PORTFOLIO)
create table public.holdings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  symbol text not null,
  asset_type text not null,
  amount numeric not null,
  avg_buy_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. SUBSCRIPTIONS (MARKETPLACE)
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  subscriber_id uuid references public.profiles(id) not null,
  creator_id uuid references public.profiles(id) not null,
  amount numeric not null,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(subscriber_id, creator_id)
);

-- 10. NOTIFICATIONS LOG
create table public.notifications_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Basic Read Policies (Ensure table data is viewable by default APIs)
alter table public.posts enable row level security;
create policy "Posts are viewable by everyone" on public.posts for select using (true);

alter table public.squads enable row level security;
create policy "Squads are viewable by everyone" on public.squads for select using (true);
