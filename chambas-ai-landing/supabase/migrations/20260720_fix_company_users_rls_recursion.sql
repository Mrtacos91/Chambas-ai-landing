create or replace function public.is_company_admin(target_company uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.company_users
    where company_id = target_company
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists company_users_admin_manage on public.company_users;

create policy company_users_admin_manage
  on public.company_users
  for all
  to authenticated
  using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

drop policy if exists companies_owner_update on public.companies;
create policy companies_admin_update
  on public.companies
  for update
  to authenticated
  using (public.is_company_admin(id))
  with check (public.is_company_admin(id));

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

create or replace function public.get_access_context(p_user_id uuid)
returns table(
  user_id uuid,
  platform_role text,
  company_role text,
  phase text,
  company_id uuid,
  company_name text,
  company_active boolean,
  redirect_path text
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_platform text;
  v_company_id uuid;
  v_company_name text;
  v_company_active boolean;
  v_company_role text;
  v_phase text;
  v_redirect text;
begin
  if auth.uid() is distinct from p_user_id
     and not public.is_admin()
     and coalesce(auth.jwt() ->> 'role', '') is distinct from 'service_role' then
    raise exception 'not authorized';
  end if;

  select up.user_type into v_platform
  from public.user_profiles up
  where up.id = p_user_id;

  if v_platform is null then
    return;
  end if;

  if v_platform = 'admin' then
    user_id := p_user_id;
    platform_role := 'admin';
    company_role := null;
    phase := 'admin_panel';
    company_id := null;
    company_name := null;
    company_active := false;
    redirect_path := '/ejecutivo';
    return next;
    return;
  end if;

  select cu.company_id, cu.role, c.name, coalesce(c.active, false)
  into v_company_id, v_company_role, v_company_name, v_company_active
  from public.company_users cu
  join public.companies c on c.id = cu.company_id
  where cu.user_id = p_user_id
  order by cu.created_at asc
  limit 1;

  if v_company_id is null then
    v_phase := 'needs_registration';
    v_redirect := '/registro';
  elsif v_company_active then
    v_phase := 'active_user';
    v_redirect := '/cliente';
  else
    v_phase := 'pending_activation';
    v_redirect := '/registro/pendiente';
  end if;

  user_id := p_user_id;
  platform_role := 'usuario';
  company_role := v_company_role;
  phase := v_phase;
  company_id := v_company_id;
  company_name := v_company_name;
  company_active := coalesce(v_company_active, false);
  redirect_path := v_redirect;
  return next;
end;
$$;
