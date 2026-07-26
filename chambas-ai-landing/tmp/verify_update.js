const fs = require('fs');
const crypto = require('crypto');

const expected = fs.readFileSync('tmp/cerebro.js', 'utf8');
const expectedHash = crypto.createHash('sha256').update(expected, 'utf8').digest('hex');
const text = fs.readFileSync('tmp/wf_details_raw.txt', 'utf8');

const lines = text.split(/\r?\n/);
const dataLines = lines.filter((l) => l.startsWith('data: ')).map((l) => l.slice(6));
console.log('dataLines', dataLines.length);
console.log('checks', {
  hasPlaceholder: text.includes('PLACEHOLDER'),
  hasClean: text.includes('function clean'),
  hasResolvePuesto: text.includes('resolvePuestoBuscado'),
  hasEsperandoVacantePrevia: text.includes('esperando_vacante_previa'),
  hasJOB_TITLES: text.includes('JOB_TITLES'),
  hasReturnBlock: text.includes('should_save_selected_vacancy'),
  expectedLen: expected.length,
  expectedHash,
});

if (dataLines.length) {
  const rpc = JSON.parse(dataLines[dataLines.length - 1]);
  const payload = rpc.result?.structuredContent
    || JSON.parse(rpc.result.content[0].text);
  const wf = payload.workflow || payload;
  const cerebro = (wf.nodes || []).find((n) => n.name === 'Cerebro Jalector');
  if (!cerebro) {
    console.log('no cerebro node, keys', Object.keys(payload));
    process.exit(1);
  }
  const code = cerebro.parameters.jsCode;
  const actualHash = crypto.createHash('sha256').update(code, 'utf8').digest('hex');
  console.log(JSON.stringify({
    codeLen: code.length,
    expectedLen: expected.length,
    matchExact: code === expected,
    matchHash: actualHash === expectedHash,
    hasPlaceholder: code.includes('PLACEHOLDER'),
    starts: code.slice(0, 40),
    ends: code.slice(-50),
  }, null, 2));
}
