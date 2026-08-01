const fs = require('fs');
const raw = JSON.parse(
  fs.readFileSync(
    'C:/Users/tacos/.cursor/projects/c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing/agent-tools/794ad31e-4ad6-4453-84fb-3d46eeb38e61.txt',
    'utf8'
  )
);
const wf = raw.workflow || raw;
const names = [
  'Cerebro Jalector',
  'Actualizar sesión con last_vacancies',
  'Guardar sesión',
  'Guardar interés empresa',
  'Guardar matches vacantes',
  'Enviar vacantes por whatsapp',
];

const report = {
  id: wf.id,
  active: wf.active,
  versionId: wf.versionId,
  activeVersionId: wf.activeVersionId,
  nodeCount: (wf.nodes || []).length,
  nodes: {},
  connections: {},
};

for (const n of wf.nodes || []) {
  if (!names.includes(n.name)) continue;
  const entry = {
    type: n.type,
    typeVersion: n.typeVersion,
    position: n.position,
    hasCredentials: !!(n.credentials && Object.keys(n.credentials).length),
    credentialNames: n.credentials
      ? Object.fromEntries(
          Object.entries(n.credentials).map(([k, v]) => [k, v && v.name])
        )
      : null,
    operation: n.parameters && n.parameters.operation,
    queryReplacement: n.parameters && n.parameters.options && n.parameters.options.queryReplacement,
  };
  if (n.parameters && n.parameters.query) {
    entry.queryHasPreserveLastVacancies = n.parameters.query.includes(
      "jsonb_array_length($1::jsonb) > 0"
    );
    entry.queryHasMatchesInsert = n.parameters.query.includes('candidate_vacancy_matches');
  }
  if (n.name === 'Cerebro Jalector') {
    const js = (n.parameters && n.parameters.jsCode) || '';
    entry.jsCodeLen = js.length;
    entry.hasSanitizePersonName = js.includes('sanitizePersonName');
    entry.hasResolveInterestVacancy = js.includes('resolveInterestVacancy');
    entry.hasSanitizePuesto = js.includes('sanitizePuesto');
    entry.hasSanitizeSalary = js.includes('sanitizeSalary');
    entry.hasSanitizeCandidateStatus = js.includes('sanitizeCandidateStatus');
    entry.hasEarlyInterest =
      js.includes("shouldSaveSelectedVacancy = true") &&
      js.includes("candidateStatus = 'interested'") &&
      js.includes('esperando_vacante_previa');
  }
  report.nodes[n.name] = entry;
}

report.connections['Actualizar sesión con last_vacancies'] =
  wf.connections && wf.connections['Actualizar sesión con last_vacancies'];
report.connections['Guardar matches vacantes'] =
  wf.connections && wf.connections['Guardar matches vacantes'];

const matchesOk =
  report.connections['Actualizar sesión con last_vacancies'] &&
  JSON.stringify(report.connections['Actualizar sesión con last_vacancies']).includes(
    'Guardar matches vacantes'
  ) &&
  report.connections['Guardar matches vacantes'] &&
  JSON.stringify(report.connections['Guardar matches vacantes']).includes(
    'Enviar vacantes por whatsapp'
  );

const directOld =
  report.connections['Actualizar sesión con last_vacancies'] &&
  JSON.stringify(report.connections['Actualizar sesión con last_vacancies']).includes(
    'Enviar vacantes por whatsapp'
  );

report.verification = {
  matchesChainOk: matchesOk,
  oldDirectLinkStillPresent: directOld,
  allNodesPresent: names.every((n) => !!report.nodes[n] || n === 'Enviar vacantes por whatsapp' ? !!report.nodes[n] || n === 'Enviar vacantes por whatsapp' : false),
};

report.verification.allRequiredNodesExist = [
  'Cerebro Jalector',
  'Actualizar sesión con last_vacancies',
  'Guardar sesión',
  'Guardar interés empresa',
  'Guardar matches vacantes',
  'Enviar vacantes por whatsapp',
].every((n) => report.nodes[n]);

console.log(JSON.stringify(report, null, 2));
