create table if not exists public.public_audits (
  public_id text primary key,
  total_monthly_savings_usd numeric(12,2) not null,
  total_annual_savings_usd numeric(12,2) not null,
  primary_use_case text not null,
  tool_count integer not null,
  audit_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_public_audits_created_at
  on public.public_audits (created_at desc);
