const fs = require('fs');
const path = require('path');

const dumpPath = process.argv[2];
const raw = fs.readFileSync(dumpPath, 'utf8');
const j = JSON.parse(raw);
const wf = j.workflow || j;

const wanted = [
  'Guardar candidato',
  '¿Guardar candidato final?',
  'Buscar vacantes?',
  '¿Registrar antes de buscar?',
  'Buscar vacantes compatibles',
  'Construir mensaje de vacantes',
  'Actualizar sesión con last_vacancies',
  '¿Buscar vacantes compatibles?',
  'Cerebro Jalector',
];

const out = {};
for (const name of wanted) {
  const n = wf.nodes.find((x) => x.name === name);
  if (!n) {
    console.log('missing', name);
    continue;
  }
  out[name] = {
    type: n.type,
    typeVersion: n.typeVersion,
    position: n.position,
    parameters: n.parameters,
  };
}

out.__connections = {};
for (const name of wanted) {
  if (wf.connections[name]) {
    out.__connections[name] = wf.connections[name];
  }
}

fs.writeFileSync(path.join(__dirname, 'nodes_dump.json'), JSON.stringify(out, null, 2));
console.log('Updated nodes_dump.json with', Object.keys(out).filter((k) => k !== '__connections').length, 'nodes');
