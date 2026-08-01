const fs = require('fs');
const cerebro = fs.readFileSync('c:/Users/tacos/OneDrive/Documentos/GitHub/Chambas-ai-landing/chambas-ai-landing/tmp/cerebro.js', 'utf8');

const queryActualizar = `update public.candidate_sessions
set
  data = case
    when jsonb_typeof($1::jsonb) = 'array' and jsonb_array_length($1::jsonb) > 0
      then data || jsonb_build_object('last_vacancies', $1::jsonb)
    else data
  end,
  current_step = coalesce(nullif($3, ''), current_step),
  updated_at = now()
where telefono = $2;`;

const queryMatches = `insert into public.candidate_vacancy_matches (candidate_phone, vacancy_id, match_status, created_at)
select
  $1,
  nullif(v->>'id', '')::uuid,
  'shown',
  now()
from jsonb_array_elements(coalesce($2::jsonb, '[]'::jsonb)) as v
where nullif(v->>'id', '') is not null
on conflict (candidate_phone, vacancy_id) do nothing
returning *;`;

const operations = [
  {
    type: 'setNodeParameter',
    nodeName: 'Cerebro Jalector',
    path: '/jsCode',
    value: cerebro,
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Actualizar sesión con last_vacancies',
    path: '/query',
    value: queryActualizar,
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Actualizar sesión con last_vacancies',
    path: '/options/queryReplacement',
    value: "={{ [ JSON.stringify($('Construir mensaje de vacantes').item.json.vacancies || []), $('Construir mensaje de vacantes').item.json.telefono, $('Construir mensaje de vacantes').item.json.session_next_step || '' ] }}",
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Guardar sesión',
    path: '/options/queryReplacement',
    value: "={{ [ $('Cerebro Jalector').item.json.next_step, JSON.stringify($('Cerebro Jalector').item.json.data || {}), $('Cerebro Jalector').item.json.telefono ] }}",
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Guardar interés empresa',
    path: '/options/queryReplacement',
    value: "={{ [ $('Cerebro Jalector').item.json.telefono, $('Cerebro Jalector').item.json.selected_vacancy_id ] }}",
  },
  {
    type: 'addNode',
    node: {
      name: 'Guardar matches vacantes',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [2304, -480],
      parameters: {
        operation: 'executeQuery',
        query: queryMatches,
        options: {
          queryReplacement: "={{ [ $('Construir mensaje de vacantes').item.json.telefono, JSON.stringify($('Construir mensaje de vacantes').item.json.vacancies || []) ] }}",
        },
      },
    },
  },
  {
    type: 'setNodeCredential',
    nodeName: 'Guardar matches vacantes',
    credentialKey: 'postgres',
    credentialId: 'iT4DrZXE2s2CUgkM',
    credentialName: 'Supabase - Jalector',
  },
  {
    type: 'removeConnection',
    source: 'Actualizar sesión con last_vacancies',
    target: 'Enviar vacantes por whatsapp',
  },
  {
    type: 'addConnection',
    source: 'Actualizar sesión con last_vacancies',
    target: 'Guardar matches vacantes',
  },
  {
    type: 'addConnection',
    source: 'Guardar matches vacantes',
    target: 'Enviar vacantes por whatsapp',
  },
];

fs.writeFileSync(
  'c:/Users/tacos/OneDrive/Documentos/GitHub/Chambas-ai-landing/chambas-ai-landing/tmp/n8n-ops.json',
  JSON.stringify({ workflowId: 'zphHtNEzhuCM2J6W', operations }, null, 0)
);
console.log('ops=', operations.length);
console.log('payload_bytes=', fs.statSync('c:/Users/tacos/OneDrive/Documentos/GitHub/Chambas-ai-landing/chambas-ai-landing/tmp/n8n-ops.json').size);
console.log('cerebro_has_sanitize=', cerebro.includes('sanitizePersonName'));
console.log('cerebro_has_resolve=', cerebro.includes('resolveInterestVacancy'));
