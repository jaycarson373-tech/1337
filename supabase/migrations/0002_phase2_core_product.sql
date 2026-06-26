create table if not exists public.request_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chat_id uuid references public.chats(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  status text not null,
  intent text,
  degraded boolean not null default false,
  failure_reason text,
  idempotency_key text unique not null,
  transitions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.adapter_runs (
  id uuid primary key default gen_random_uuid(),
  request_run_id uuid references public.request_runs(id) on delete cascade,
  adapter_id text not null,
  status text not null,
  source_count integer not null default 0,
  confidence text,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.burn_attempts (
  id uuid primary key default gen_random_uuid(),
  request_run_id uuid references public.request_runs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null,
  burn_amount_raw text not null,
  burn_amount_ui numeric not null,
  token_mint text not null,
  signature text,
  idempotency_key text unique not null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_usage (
  id uuid primary key default gen_random_uuid(),
  request_run_id uuid references public.request_runs(id) on delete cascade,
  provider text not null,
  model text not null,
  provider_request_id text,
  input_tokens integer,
  output_tokens integer,
  actual_cost_usd numeric,
  created_at timestamptz not null default now()
);

alter table public.query_charges
  add column if not exists request_run_id uuid references public.request_runs(id) on delete set null,
  add column if not exists preflight_balance_raw text,
  add column if not exists estimated_cost_usd numeric,
  add column if not exists burn_destination text,
  add column if not exists idempotency_key text unique,
  add column if not exists pricing_inputs jsonb not null default '{}'::jsonb;

create index if not exists request_runs_user_id_created_at_idx on public.request_runs(user_id, created_at desc);
create index if not exists request_runs_chat_id_created_at_idx on public.request_runs(chat_id, created_at desc);
create index if not exists adapter_runs_request_run_id_idx on public.adapter_runs(request_run_id);
create index if not exists burn_attempts_request_run_id_idx on public.burn_attempts(request_run_id);
create index if not exists burn_attempts_user_id_created_at_idx on public.burn_attempts(user_id, created_at desc);
create index if not exists model_usage_request_run_id_idx on public.model_usage(request_run_id);
create index if not exists query_charges_request_run_id_idx on public.query_charges(request_run_id);

drop trigger if exists set_request_runs_updated_at on public.request_runs;
create trigger set_request_runs_updated_at
before update on public.request_runs
for each row
execute function public.set_updated_at();

drop trigger if exists set_burn_attempts_updated_at on public.burn_attempts;
create trigger set_burn_attempts_updated_at
before update on public.burn_attempts
for each row
execute function public.set_updated_at();

alter table public.request_runs enable row level security;
alter table public.adapter_runs enable row level security;
alter table public.burn_attempts enable row level security;
alter table public.model_usage enable row level security;

drop policy if exists "Users can read own request runs" on public.request_runs;
create policy "Users can read own request runs"
on public.request_runs for select
using (auth.uid() = user_id);

drop policy if exists "Users can read own adapter runs" on public.adapter_runs;
create policy "Users can read own adapter runs"
on public.adapter_runs for select
using (
  exists (
    select 1
    from public.request_runs
    where request_runs.id = adapter_runs.request_run_id
      and request_runs.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own burn attempts" on public.burn_attempts;
create policy "Users can read own burn attempts"
on public.burn_attempts for select
using (auth.uid() = user_id);

drop policy if exists "Users can read own model usage" on public.model_usage;
create policy "Users can read own model usage"
on public.model_usage for select
using (
  exists (
    select 1
    from public.request_runs
    where request_runs.id = model_usage.request_run_id
      and request_runs.user_id = auth.uid()
  )
);
