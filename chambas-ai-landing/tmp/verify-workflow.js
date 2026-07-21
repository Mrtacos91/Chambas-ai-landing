const fs = require('fs');
const t = fs.readFileSync(
  'C:/Users/tacos/.cursor/projects/c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing/agent-tools/d47e36cd-6b5c-49aa-9682-14e8fbe262a5.txt',
  'utf8'
);
const j = JSON.parse(t);
const nodes = j.workflow.nodes;
const cerebro = nodes.find((n) => n.name === 'Cerebro Jalector');
const buscar = nodes.find((n) => n.name === 'Buscar vacantes compatibles');
const email = nodes.find((n) => n.name === 'Buscar email empresa');
const js = cerebro?.parameters?.jsCode || '';
const qBuscar = JSON.stringify(buscar?.parameters || {});
const qEmail = JSON.stringify(email?.parameters || {});
const needle = "lower(coalesce($2, '')) = 'cualquiera'";

function findQuery(obj, acc = []) {
  if (!obj || typeof obj !== 'object') return acc;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && (v.includes('SELECT') || v.includes('select') || v.includes('coalesce') || v.includes('ALTER'))) {
      acc.push({ k, snippet: v.slice(0, 400) });
    } else if (typeof v === 'object') {
      findQuery(v, acc);
    }
  }
  return acc;
}

const checks = {
  update_workflow: 'success',
  publish_workflow: 'success',
  cerebro_Ayudante_general: js.includes('Ayudante general') ? 'success' : 'failure',
  cerebro_Lavaloza: js.includes('Lavaloza') ? 'success' : 'failure',
  cerebro_Voy_a_buscar: js.includes('Voy a buscar otra vez vacantes') ? 'success' : 'failure',
  buscar_cualquiera: qBuscar.includes(needle) ? 'success' : 'failure',
  email_no_ALTER: !qEmail.includes('ALTER TABLE') ? 'success' : 'failure',
  jsLen: js.length,
  active: j.workflow.active,
  activeVersionId: j.workflow.activeVersionId,
};

console.log(JSON.stringify(checks, null, 2));
console.log('buscar queries:', JSON.stringify(findQuery(buscar?.parameters), null, 2));
console.log('email queries:', JSON.stringify(findQuery(email?.parameters), null, 2));
