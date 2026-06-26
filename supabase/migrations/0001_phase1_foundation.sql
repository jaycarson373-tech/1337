create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  public_key text not null,
  encrypted_private_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  cost_usd numeric,
  burned_1337 numeric,
  burn_signature text,
  created_at timestamptz not null default now()
);

create table if not exists public.query_charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chat_id uuid references public.chats(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  status text not null,
  actual_llm_usd numeric,
  charged_usd numeric,
  token_price_usd numeric,
  burn_amount_ui numeric,
  burn_amount_raw text,
  burn_signature text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  public_key text not null,
  token_mint text not null,
  raw_amount text not null,
  ui_amount numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists user_wallets_user_id_idx on public.user_wallets(user_id);
create index if not exists chats_user_id_created_at_idx on public.chats(user_id, created_at desc);
create index if not exists messages_chat_id_created_at_idx on public.messages(chat_id, created_at asc);
create index if not exists messages_user_id_created_at_idx on public.messages(user_id, created_at desc);
create index if not exists query_charges_user_id_created_at_idx on public.query_charges(user_id, created_at desc);
create index if not exists balance_snapshots_user_id_created_at_idx on public.balance_snapshots(user_id, created_at desc);

drop trigger if exists set_query_charges_updated_at on public.query_charges;
create trigger set_query_charges_updated_at
before update on public.query_charges
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_wallets enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.query_charges enable row level security;
alter table public.balance_snapshots enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can create own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own wallets"
on public.user_wallets for select
using (auth.uid() = user_id);

create policy "Users can read own chats"
on public.chats for select
using (auth.uid() = user_id);

create policy "Users can create own chats"
on public.chats for insert
with check (auth.uid() = user_id);

create policy "Users can update own chats"
on public.chats for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own chats"
on public.chats for delete
using (auth.uid() = user_id);

create policy "Users can read own messages"
on public.messages for select
using (auth.uid() = user_id);

create policy "Users can create own messages"
on public.messages for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.chats
    where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
  )
);

create policy "Users can read own query charges"
on public.query_charges for select
using (auth.uid() = user_id);

create policy "Users can read own balance snapshots"
on public.balance_snapshots for select
using (auth.uid() = user_id);
