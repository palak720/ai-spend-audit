create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size integer,
  total_monthly_savings_usd numeric(12,2) not null,
  total_annual_savings_usd numeric(12,2) not null,
  audit_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_created_at on public.leads (created_at desc);
