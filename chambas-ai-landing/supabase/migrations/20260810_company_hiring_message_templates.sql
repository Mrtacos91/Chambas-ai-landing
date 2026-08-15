create table if not exists public.company_hiring_message_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  stage text not null
    check (stage in ('contactado', 'entrevista', 'contratado', 'descartado')),
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_hiring_message_templates_company_stage_uidx
    unique (company_id, stage)
);

create index if not exists company_hiring_message_templates_company_idx
  on public.company_hiring_message_templates (company_id);

alter table public.company_hiring_message_templates enable row level security;

drop policy if exists company_hiring_message_templates_select
  on public.company_hiring_message_templates;
create policy company_hiring_message_templates_select
  on public.company_hiring_message_templates
  for select
  to authenticated
  using (
    public.user_belongs_to_company(company_id)
    or public.is_admin()
  );

drop policy if exists company_hiring_message_templates_insert
  on public.company_hiring_message_templates;
create policy company_hiring_message_templates_insert
  on public.company_hiring_message_templates
  for insert
  to authenticated
  with check (
    public.is_company_admin(company_id)
    or public.is_admin()
  );

drop policy if exists company_hiring_message_templates_update
  on public.company_hiring_message_templates;
create policy company_hiring_message_templates_update
  on public.company_hiring_message_templates
  for update
  to authenticated
  using (
    public.is_company_admin(company_id)
    or public.is_admin()
  )
  with check (
    public.is_company_admin(company_id)
    or public.is_admin()
  );

drop policy if exists company_hiring_message_templates_delete
  on public.company_hiring_message_templates;
create policy company_hiring_message_templates_delete
  on public.company_hiring_message_templates
  for delete
  to authenticated
  using (
    public.is_company_admin(company_id)
    or public.is_admin()
  );
