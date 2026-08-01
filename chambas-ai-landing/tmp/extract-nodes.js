const fs = require('fs');
const path = 'C:/Users/tacos/.cursor/projects/c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing/agent-tools/94a189dc-983a-4386-9387-e63a00fc81d3.txt';
const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
const wf = raw.workflow || raw.data || raw;
const nodes = wf.nodes || [];
const names = [
  'Actualizar sesión con last_vacancies',
  'Guardar sesión',
  'Guardar interés empresa',
  'Enviar vacantes por whatsapp',
  'Cerebro Jalector',
  'Guardar matches vacantes',
];
for (const n of nodes) {
  if (!names.includes(n.name)) continue;
  console.log('====', n.name);
  console.log('type=', n.type, 'ver=', n.typeVersion);
  console.log('pos=', JSON.stringify(n.position));
  console.log('credentials=', JSON.stringify(n.credentials || null));
  console.log('operation=', n.parameters?.operation);
  console.log('queryReplacement=', n.parameters?.queryReplacement);
  if (n.parameters?.query) console.log('query=\n' + n.parameters.query);
  if (n.parameters?.options) console.log('options=', JSON.stringify(n.parameters.options));
  if (n.name === 'Cerebro Jalector') {
    const js = n.parameters?.jsCode || '';
    console.log('jsCode_len=', js.length);
    console.log('has_sanitizePersonName=', js.includes('sanitizePersonName'));
    console.log('has_resolveInterestVacancy=', js.includes('resolveInterestVacancy'));
  }
}
console.log('==== CONNECTIONS actualizar');
console.log(JSON.stringify(wf.connections?.['Actualizar sesión con last_vacancies'] || null, null, 2));
console.log('==== sample postgres creds');
const pg = nodes.find((n) => n.type === 'n8n-nodes-base.postgres' && n.credentials);
console.log(pg ? JSON.stringify({ name: pg.name, credentials: pg.credentials }, null, 2) : 'none');
