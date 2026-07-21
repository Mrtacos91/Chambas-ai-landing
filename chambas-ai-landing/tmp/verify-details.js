const fs = require('fs');
const raw = fs.readFileSync(
  'C:/Users/tacos/.cursor/projects/c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing/agent-tools/3c0bbba4-9179-473d-b98a-4b5f9264a7ee.txt',
  'utf8'
);
const data = JSON.parse(raw);
const str = JSON.stringify(data);

function walk(o, pred, acc = []) {
  if (!o || typeof o !== 'object') return acc;
  if (pred(o)) acc.push(o);
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object') walk(v, pred, acc);
  }
  return acc;
}

const cerebro = walk(data, (n) => n.name === 'Cerebro Jalector')[0];
const enviar = walk(data, (n) => n.name === 'Enviar vacantes por whatsapp')[0];
const guardar = walk(data, (n) => n.name === 'Guardar candidato')[0];

const code = (cerebro && cerebro.parameters && cerebro.parameters.jsCode) || '';
const jsonBody = (enviar && enviar.parameters && enviar.parameters.jsonBody) || '';
const qr =
  (guardar &&
    guardar.parameters &&
    guardar.parameters.options &&
    guardar.parameters.options.queryReplacement) ||
  '';

let avid =
  (data.workflow && data.workflow.activeVersionId) || data.activeVersionId || null;
if (!avid) {
  const m = str.match(/"activeVersionId"\s*:\s*"([^"]+)"/);
  if (m) avid = m[1];
}

const checks = {
  corruptSalary: code.includes('corruptSalary'),
  'Menos de $10000': code.includes('Menos de $10000'),
  'Si completa': code.includes('Si completa'),
  optionNumber: code.includes('optionNumber'),
  'Enviar vacantes jsonBody has Construir mensaje de vacantes': String(
    jsonBody
  ).includes('Construir mensaje de vacantes'),
  'Guardar candidato queryReplacement starts with ={{ [': String(qr).startsWith(
    '={{ ['
  ),
};

console.log(
  JSON.stringify(
    {
      codeLen: code.length,
      qrStart: String(qr).slice(0, 20),
      activeVersionId: avid,
      checks: Object.fromEntries(
        Object.entries(checks).map(([k, v]) => [k, v ? 'PASS' : 'FAIL'])
      ),
    },
    null,
    2
  )
);
