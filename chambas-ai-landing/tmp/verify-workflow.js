const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(process.argv[2], 'utf8');
const j = JSON.parse(raw.slice(raw.indexOf('{')));
const wf = j.workflow || j;
const active = wf.activeVersion || {};
const nodes = active.nodes || wf.nodes || [];
const conns = active.connections || wf.connections || {};

console.log('active', wf.active);
console.log('versionId === activeVersionId', wf.versionId === wf.activeVersionId);

const interesting = [
  'Buscar vacantes?',
  '¿Registrar antes de buscar?',
  'Guardar candidato',
  'Buscar vacantes compatibles',
  'Construir mensaje de vacantes',
  'Actualizar sesión con last_vacancies',
];

for (const name of interesting) {
  const v = conns[name];
  if (!v) {
    console.log(name, '(no outbound)');
    continue;
  }
  const outs = (v.main || [])
    .map((br, i) => '  [' + i + '] -> ' + (br || []).map((x) => x.node).join(', '))
    .join('\n');
  console.log(name);
  console.log(outs || '  (empty)');
}

const cerebro = nodes.find((n) => n.name === 'Cerebro Jalector');
const msg = nodes.find((n) => n.name === 'Construir mensaje de vacantes');
const sql = nodes.find((n) => n.name === 'Buscar vacantes compatibles');
const localCerebro = fs.readFileSync(path.join(__dirname, 'cerebro.js'), 'utf8');

const cerebroCode = (cerebro && cerebro.parameters && cerebro.parameters.jsCode) || '';
const sqlParams = JSON.stringify((sql && sql.parameters) || {});

console.log('--- checks activeVersion ---');
console.log('cerebro identico al repo', cerebroCode === localCerebro);
console.log('cerebro MEXICO_STATES', cerebroCode.includes('MEXICO_STATES'));
console.log('cerebro esperando_estado_inicial', cerebroCode.includes('esperando_estado_inicial'));
console.log('cerebro estado_pattern', cerebroCode.includes('estado_pattern'));
console.log('sql filtra por $4', sqlParams.includes('~ $4'));
console.log('sql recibe estado_pattern', sqlParams.includes('estado_pattern'));
console.log('msg usa estado', ((msg && msg.parameters && msg.parameters.jsCode) || '').includes('candidato.estado'));
