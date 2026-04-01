-- Coach Mode PIN access control stored server-side.

create table if not exists public.coach_mode_codes (
  id integer primary key default 1,
  pin_code char(6) not null check (pin_code ~ '^[0-9]{6}$'),
  is_active boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint coach_mode_codes_single_row check (id = 1)
);

create table if not exists public.coach_mode_authorisations (
  player_id uuid primary key references auth.users(id) on delete cascade,
  verified_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists coach_mode_authorisations_expires_idx
  on public.coach_mode_authorisations (expires_at);

alter table public.coach_mode_codes enable row level security;
alter table public.coach_mode_authorisations enable row level security;

-- Browser clients use Edge Functions only; direct table access remains blocked.
revoke all on public.coach_mode_codes from anon, authenticated;
revoke all on public.coach_mode_authorisations from anon, authenticated;

grant select, insert, update, delete on public.coach_mode_codes to service_role;
grant select, insert, update, delete on public.coach_mode_authorisations to service_role;

insert into public.coach_mode_codes (id, pin_code, is_active)
values (1, '000000', true)
on conflict (id) do nothing;
