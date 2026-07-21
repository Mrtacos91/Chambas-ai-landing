create unique index if not exists candidate_selected_vacancies_phone_vacancy_uidx
  on public.candidate_selected_vacancies (candidate_phone, vacancy_id);

create unique index if not exists candidate_vacancy_matches_phone_vacancy_uidx
  on public.candidate_vacancy_matches (candidate_phone, vacancy_id);

create table if not exists public.company_digest_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  period_start date not null,
  channel text not null check (channel in ('whatsapp', 'email')),
  candidates_count integer not null default 0,
  sent_at timestamptz not null default now(),
  unique (company_id, period_start, channel)
);

create index if not exists company_digest_logs_period_idx
  on public.company_digest_logs (period_start desc);
