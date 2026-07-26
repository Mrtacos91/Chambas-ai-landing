select
  v.id,
  v.title,
  v.description,
  v.location,
  v.schedule,
  v.salary_min,
  v.salary_max,
  v.preferred_shift,
  v.experience_required,
  v.benefits,
  v.requirements,
  c.name as company_name
from public.vacancies v
join public.companies c on c.id = v.company_id
where
  v.active = true
  and c.active = true
  and (
    extensions.unaccent(lower(coalesce(v.title, ''))) like '%' || extensions.unaccent(lower(coalesce($1, ''))) || '%'
    or extensions.unaccent(lower(coalesce(v.description, ''))) like '%' || extensions.unaccent(lower(coalesce($1, ''))) || '%'
    or extensions.unaccent(lower(coalesce(v.requirements, ''))) like '%' || extensions.unaccent(lower(coalesce($1, ''))) || '%'
  )
  and (
    v.preferred_shift is null
    or btrim(v.preferred_shift) = ''
    or lower(v.preferred_shift) = 'cualquiera'
    or coalesce(btrim($2), '') = ''
    or lower(coalesce($2, '')) = 'cualquiera'
    or lower(v.preferred_shift) = lower(coalesce($2, ''))
  )
  and (
    coalesce(btrim($4), '') = ''
    or v.location is null
    or btrim(v.location) = ''
    or extensions.unaccent(lower(v.location)) ~ $4
    or extensions.unaccent(lower(v.location)) ~ '\y(remoto|home office|homeoffice|teletrabajo|hibrido)\y'
  )
order by
  case
    when coalesce(btrim($3), '') <> ''
      and extensions.unaccent(lower(coalesce(v.location, ''))) like '%' || extensions.unaccent(lower(coalesce($3, ''))) || '%'
    then 1
    else 2
  end,
  v.created_at desc
limit 3;
