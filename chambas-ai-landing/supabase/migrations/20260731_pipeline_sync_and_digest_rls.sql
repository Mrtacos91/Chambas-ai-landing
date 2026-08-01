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
after insert or update on public.candidate_vacancy_matches
for each row
execute function public.sync_vacancy_candidate_pipeline_from_match();

drop trigger if exists trg_sync_pipeline_from_interest on public.candidate_selected_vacancies;
create trigger trg_sync_pipeline_from_interest
after insert or update on public.candidate_selected_vacancies
for each row
execute function public.sync_vacancy_candidate_pipeline_from_interest();

insert into public.candidate_vacancy_matches (
  candidate_phone,
  vacancy_id,
  match_status,
  created_at
)
select
  s.telefono,
  (s.data->'pending_vacancy'->>'id')::uuid,
  'shown',
  coalesce(s.updated_at, now())
from public.candidate_sessions s
where jsonb_typeof(s.data->'pending_vacancy') = 'object'
  and nullif(s.data->'pending_vacancy'->>'id', '') is not null
on conflict (candidate_phone, vacancy_id) do nothing;

insert into public.vacancy_candidate_pipeline (
  vacancy_id,
  candidate_phone,
  stage,
  has_interest,
  source,
  last_activity_at
)
select
  sel.vacancy_id,
  sel.candidate_phone,
  'interesado',
  true,
  'interest',
  coalesce(sel.created_at, now())
from public.candidate_selected_vacancies sel
where sel.vacancy_id is not null
  and sel.candidate_phone is not null
on conflict (vacancy_id, candidate_phone) do update set
  has_interest = true,
  source = 'interest',
  stage = case
    when public.vacancy_candidate_pipeline.stage = 'nuevo' then 'interesado'
    else public.vacancy_candidate_pipeline.stage
  end,
  last_activity_at = greatest(
    public.vacancy_candidate_pipeline.last_activity_at,
    excluded.last_activity_at
  ),
  updated_at = now();

alter table public.company_digest_logs enable row level security;

drop policy if exists company_digest_logs_admin_all on public.company_digest_logs;
create policy company_digest_logs_admin_all
  on public.company_digest_logs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists company_digest_logs_service_role on public.company_digest_logs;
create policy company_digest_logs_service_role
  on public.company_digest_logs
  for all
  to service_role
  using (true)
  with check (true);
