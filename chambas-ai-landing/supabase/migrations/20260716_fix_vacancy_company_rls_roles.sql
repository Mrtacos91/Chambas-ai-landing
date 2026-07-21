drop policy if exists vacancies_company_manage on public.vacancies;
create policy vacancies_company_manage
  on public.vacancies
  for all
  to authenticated
  using (
    company_id is not null
    and public.is_company_admin(company_id)
  )
  with check (
    company_id is not null
    and public.is_company_admin(company_id)
  );

drop policy if exists vacancies_admin_all on public.vacancies;
create policy vacancies_admin_all
  on public.vacancies
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists company_users_owner_manage on public.company_users;
create policy company_users_admin_manage
  on public.company_users
  for all
  to authenticated
  using (
    exists (
      select 1 from public.company_users cu
      where cu.company_id = company_users.company_id
        and cu.user_id = auth.uid()
        and cu.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.company_users cu
      where cu.company_id = company_users.company_id
        and cu.user_id = auth.uid()
        and cu.role = 'admin'
    )
  );

drop policy if exists company_users_admin_all on public.company_users;
create policy company_users_platform_admin_all
  on public.company_users
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
