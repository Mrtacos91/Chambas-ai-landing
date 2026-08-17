alter table public.vacancies
  add column if not exists interview_at timestamptz null,
  add column if not exists interview_address text null,
  add column if not exists interview_details text null,
  add column if not exists work_start_on date null;

alter table public.vacancy_candidate_pipeline
  add column if not exists confirmation_status text not null default 'none',
  add column if not exists confirmation_sent_at timestamptz null,
  add column if not exists reminder_sent_at timestamptz null;

alter table public.vacancy_candidate_pipeline
  drop constraint if exists vacancy_candidate_pipeline_confirmation_status_check;

alter table public.vacancy_candidate_pipeline
  add constraint vacancy_candidate_pipeline_confirmation_status_check
  check (confirmation_status in ('none', 'sent', 'confirmed', 'declined'));

create index if not exists vacancy_candidate_pipeline_confirmation_reminder_idx
  on public.vacancy_candidate_pipeline (confirmation_status, reminder_sent_at);

create index if not exists vacancies_interview_at_idx
  on public.vacancies (interview_at)
  where interview_at is not null;
