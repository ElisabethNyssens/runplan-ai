-- profiles: one row per user, the answers from the intake form
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  objective text not null check (objective in ('5k', '10k', 'half_marathon', 'marathon', 'return_to_running')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  sessions_per_week smallint not null check (sessions_per_week between 2 and 6),
  date_mode text not null check (date_mode in ('weeks', 'date')),
  weeks smallint check (weeks between 1 and 24),
  target_date date,
  constraints text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- plans: one row per generated plan, keeps history across regenerations
create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  view_mode text not null default 'list' check (view_mode in ('list', 'calendar')),
  created_at timestamptz not null default now()
);

create index plans_user_id_idx on plans (user_id);

-- sessions: one row per training session within a plan
create table sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans (id) on delete cascade,
  week_number smallint not null,
  day smallint not null check (day between 0 and 6),
  type text not null check (type in ('easy_run', 'intervals', 'long_run', 'recovery', 'rest')),
  title text not null,
  meta text,
  description text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index sessions_plan_id_idx on sessions (plan_id);

-- Row Level Security: every user only sees/edits their own data
alter table profiles enable row level security;
alter table plans enable row level security;
alter table sessions enable row level security;

create policy "profiles are owned by their user" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "plans are owned by their user" on plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sessions are owned via their plan" on sessions
  for all using (
    exists (select 1 from plans where plans.id = sessions.plan_id and plans.user_id = auth.uid())
  ) with check (
    exists (select 1 from plans where plans.id = sessions.plan_id and plans.user_id = auth.uid())
  );
