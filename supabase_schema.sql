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
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Admins can update any profile." on profiles;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Helper function to safely check admin status without recursion/TOCTOU
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can update any profile." on profiles for update using (
  public.is_admin()
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
create table if not exists public.notifications_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  type text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications_log add column if not exists user_id uuid references public.profiles(id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — ALL TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- POSTS
alter table public.posts enable row level security;
drop policy if exists "Posts are viewable by everyone" on public.posts;
drop policy if exists "Users can insert their own posts" on public.posts;
drop policy if exists "Users can update their own posts" on public.posts;
drop policy if exists "Users can delete their own posts" on public.posts;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);
create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- COMMENTS
alter table public.comments enable row level security;
drop policy if exists "Comments are viewable by everyone" on public.comments;
drop policy if exists "Users can insert their own comments" on public.comments;
drop policy if exists "Users can update their own comments" on public.comments;
drop policy if exists "Users can delete their own comments" on public.comments;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);
create policy "Users can insert their own comments"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update their own comments"
  on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- LIKES
alter table public.likes enable row level security;
drop policy if exists "Likes are viewable by everyone" on public.likes;
drop policy if exists "Users can insert their own likes" on public.likes;
drop policy if exists "Users can delete their own likes" on public.likes;

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);
create policy "Users can insert their own likes"
  on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- FOLLOWERS
alter table public.followers enable row level security;
drop policy if exists "Followers are viewable by everyone" on public.followers;
drop policy if exists "Users can follow others (insert own follower_id)" on public.followers;
drop policy if exists "Users can unfollow (delete own follower_id)" on public.followers;

create policy "Followers are viewable by everyone"
  on public.followers for select using (true);
create policy "Users can follow others (insert own follower_id)"
  on public.followers for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow (delete own follower_id)"
  on public.followers for delete using (auth.uid() = follower_id);

-- SQUADS
alter table public.squads enable row level security;
drop policy if exists "Squads are viewable by everyone" on public.squads;
drop policy if exists "Users can create squads" on public.squads;
drop policy if exists "Squad creators can update their squads" on public.squads;
drop policy if exists "Squad creators can delete their squads" on public.squads;

create policy "Squads are viewable by everyone"
  on public.squads for select using (true);
create policy "Users can create squads"
  on public.squads for insert with check (auth.uid() = created_by);
create policy "Squad creators can update their squads"
  on public.squads for update using (auth.uid() = created_by);
create policy "Squad creators can delete their squads"
  on public.squads for delete using (auth.uid() = created_by);

-- SQUAD MEMBERS
alter table public.squad_members enable row level security;
drop policy if exists "Squad members are viewable by everyone" on public.squad_members;
drop policy if exists "Users can join squads (insert own user_id)" on public.squad_members;
drop policy if exists "Users can leave squads (delete own user_id)" on public.squad_members;

create policy "Squad members are viewable by everyone"
  on public.squad_members for select using (true);
create policy "Users can join squads (insert own user_id)"
  on public.squad_members for insert with check (auth.uid() = user_id);
create policy "Users can leave squads (delete own user_id)"
  on public.squad_members for delete using (auth.uid() = user_id);

-- HOLDINGS
alter table public.holdings enable row level security;
drop policy if exists "Users can view their own holdings" on public.holdings;
drop policy if exists "Users can insert their own holdings" on public.holdings;
drop policy if exists "Users can update their own holdings" on public.holdings;
drop policy if exists "Users can delete their own holdings" on public.holdings;

create policy "Users can view their own holdings"
  on public.holdings for select using (auth.uid() = user_id);
create policy "Users can insert their own holdings"
  on public.holdings for insert with check (auth.uid() = user_id);
create policy "Users can update their own holdings"
  on public.holdings for update using (auth.uid() = user_id);
create policy "Users can delete their own holdings"
  on public.holdings for delete using (auth.uid() = user_id);

-- SUBSCRIPTIONS
alter table public.subscriptions enable row level security;
drop policy if exists "Users can view subscriptions they are part of" on public.subscriptions;
drop policy if exists "Users can create their own subscriptions" on public.subscriptions;
drop policy if exists "Users can update their own subscriptions" on public.subscriptions;
drop policy if exists "Users can cancel their own subscriptions" on public.subscriptions;

create policy "Users can view subscriptions they are part of"
  on public.subscriptions for select
  using (auth.uid() = subscriber_id or auth.uid() = creator_id);
create policy "Users can create their own subscriptions"
  on public.subscriptions for insert with check (auth.uid() = subscriber_id);
create policy "Users can update their own subscriptions"
  on public.subscriptions for update using (auth.uid() = subscriber_id);
create policy "Users can cancel their own subscriptions"
  on public.subscriptions for delete using (auth.uid() = subscriber_id);

-- NOTIFICATIONS LOG
alter table public.notifications_log enable row level security;
drop policy if exists "Users can view their own notifications" on public.notifications_log;
drop policy if exists "System can insert notifications (service role only)" on public.notifications_log;
drop policy if exists "Users can mark their own notifications as read" on public.notifications_log;
drop policy if exists "Users can delete their own notifications" on public.notifications_log;

create policy "Users can view their own notifications"
  on public.notifications_log for select using (auth.uid() = user_id);
create policy "System can insert notifications (service role only)"
  on public.notifications_log for insert with check (auth.uid() = user_id);
create policy "Users can mark their own notifications as read"
  on public.notifications_log for update using (auth.uid() = user_id);
create policy "Users can delete their own notifications"
  on public.notifications_log for delete using (auth.uid() = user_id);
