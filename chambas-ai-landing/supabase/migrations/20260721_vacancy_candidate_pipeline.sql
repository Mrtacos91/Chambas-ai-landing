create table if not exists public.vacancy_candidate_pipeline (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references public.vacancies (id) on delete cascade,
  candidate_phone text not null,
  stage text not null default 'nuevo'
    check (stage in (
      'nuevo',
      'interesado',
      'contactado',
      'entrevista',
      'oferta',
      'contratado',
      'descartado'
    )),
  notes text not null default '',
  has_interest boolean not null default false,
  source text not null default 'match'
    check (source in ('match', 'interest', 'manual')),
  last_activity_at timestamptz not null default now(),
  updated_by uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vacancy_candidate_pipeline_vacancy_phone_uidx
    unique (vacancy_id, candidate_phone)
);

create index if not exists vacancy_candidate_pipeline_vacancy_idx
  on public.vacancy_candidate_pipeline (vacancy_id);

create index if not exists vacancy_candidate_pipeline_stage_idx
  on public.vacancy_candidate_pipeline (stage);

create index if not exists vacancy_candidate_pipeline_phone_idx
  on public.vacancy_candidate_pipeline (candidate_phone);

create index if not exists vacancy_candidate_pipeline_activity_idx
  on public.vacancy_candidate_pipeline (last_activity_at desc);

alter table public.vacancy_candidate_pipeline enable row level security;

drop policy if exists vacancy_candidate_pipeline_company_select
  on public.vacancy_candidate_pipeline;
create policy vacancy_candidate_pipeline_company_select
  on public.vacancy_candidate_pipeline
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.vacancies v
      where v.id = vacancy_candidate_pipeline.vacancy_id
        and v.company_id is not null
        and public.user_belongs_to_company(v.company_id)
    )
    or public.is_admin()
  );

drop policy if exists vacancy_candidate_pipeline_company_insert
  on public.vacancy_candidate_pipeline;
create policy vacancy_candidate_pipeline_company_insert
  on public.vacancy_candidate_pipeline
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.vacancies v
      where v.id = vacancy_candidate_pipeline.vacancy_id
        and v.company_id is not null
        and public.user_belongs_to_company(v.company_id)
    )
    or public.is_admin()
  );

drop policy if exists vacancy_candidate_pipeline_company_update
  on public.vacancy_candidate_pipeline;
create policy vacancy_candidate_pipeline_company_update
  on public.vacancy_candidate_pipeline
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.vacancies v
      where v.id = vacancy_candidate_pipeline.vacancy_id
        and v.company_id is not null
        and public.user_belongs_to_company(v.company_id)
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1
      from public.vacancies v
      where v.id = vacancy_candidate_pipeline.vacancy_id
        and v.company_id is not null
        and public.user_belongs_to_company(v.company_id)
    )
    or public.is_admin()
  );

drop policy if exists vacancy_candidate_pipeline_company_delete
  on public.vacancy_candidate_pipeline;
create policy vacancy_candidate_pipeline_company_delete
  on public.vacancy_candidate_pipeline
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.vacancies v
      where v.id = vacancy_candidate_pipeline.vacancy_id
        and v.company_id is not null
        and public.user_belongs_to_company(v.company_id)
    )
    or public.is_admin()
  );

insert into public.vacancy_candidate_pipeline (
  vacancy_id,
  candidate_phone,
  stage,
  has_interest,
  source,
  last_activity_at
)
select
  coalesce(m.vacancy_id, s.vacancy_id) as vacancy_id,
  coalesce(m.candidate_phone, s.candidate_phone) as candidate_phone,
  case when s.candidate_phone is not null then 'interesado' else 'nuevo' end as stage,
  s.candidate_phone is not null as has_interest,
  case when s.candidate_phone is not null then 'interest' else 'match' end as source,
  greatest(
    coalesce(m.created_at, 'epoch'::timestamptz),
    coalesce(s.created_at, 'epoch'::timestamptz)
  ) as last_activity_at
from (
  select candidate_phone, vacancy_id, max(created_at) as created_at
  from public.candidate_vacancy_matches
  where vacancy_id is not null
  group by candidate_phone, vacancy_id
) m
full outer join (
  select candidate_phone, vacancy_id, max(created_at) as created_at
  from public.candidate_selected_vacancies
  where vacancy_id is not null
  group by candidate_phone, vacancy_id
) s
  on s.candidate_phone = m.candidate_phone
 and s.vacancy_id = m.vacancy_id
where coalesce(m.vacancy_id, s.vacancy_id) is not null
  and coalesce(m.candidate_phone, s.candidate_phone) is not null
on conflict (vacancy_id, candidate_phone) do update set
  has_interest = excluded.has_interest or public.vacancy_candidate_pipeline.has_interest,
  source = case
    when excluded.has_interest or public.vacancy_candidate_pipeline.has_interest then 'interest'
    else public.vacancy_candidate_pipeline.source
  end,
  stage = case
    when public.vacancy_candidate_pipeline.stage = 'nuevo'
      and (excluded.has_interest or public.vacancy_candidate_pipeline.has_interest)
      then 'interesado'
    else public.vacancy_candidate_pipeline.stage
  end,
  last_activity_at = greatest(
    public.vacancy_candidate_pipeline.last_activity_at,
    excluded.last_activity_at
  ),
  updated_at = now();

create or replace function public.sync_vacancy_candidate_pipeline_from_match()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.vacancy_id is null or new.candidate_phone is null then
    return new;
  end if;

  insert into public.vacancy_candidate_pipeline (
    vacancy_id,
    candidate_phone,
    stage,
    has_interest,
    source,
    last_activity_at
  )
  values (
    new.vacancy_id,
    new.candidate_phone,
    'nuevo',
    false,
    'match',
    coalesce(new.created_at, now())
  )
  on conflict (vacancy_id, candidate_phone) do update set
    last_activity_at = greatest(
      public.vacancy_candidate_pipeline.last_activity_at,
      coalesce(excluded.last_activity_at, now())
    ),
    updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_vacancy_candidate_pipeline_from_interest()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.vacancy_id is null or new.candidate_phone is null then
    return new;
  end if;

  insert into public.vacancy_candidate_pipeline (
    vacancy_id,
    candidate_phone,
    stage,
    has_interest,
    source,
    last_activity_at
  )
  values (
    new.vacancy_id,
    new.candidate_phone,
    'interesado',
    true,
    'interest',
    coalesce(new.created_at, now())
  )
  on conflict (vacancy_id, candidate_phone) do update set
    has_interest = true,
    source = 'interest',
    stage = case
      when public.vacancy_candidate_pipeline.stage = 'nuevo' then 'interesado'
      else public.vacancy_candidate_pipeline.stage
    end,
    last_activity_at = greatest(
      public.vacancy_candidate_pipeline.last_activity_at,
      coalesce(excluded.last_activity_at, now())
    ),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_pipeline_from_match on public.candidate_vacancy_matches;
create trigger trg_sync_pipeline_from_match
after insert on public.candidate_vacancy_matches
for each row
execute function public.sync_vacancy_candidate_pipeline_from_match();

drop trigger if exists trg_sync_pipeline_from_interest on public.candidate_selected_vacancies;
create trigger trg_sync_pipeline_from_interest
after insert on public.candidate_selected_vacancies
for each row
execute function public.sync_vacancy_candidate_pipeline_from_interest();
