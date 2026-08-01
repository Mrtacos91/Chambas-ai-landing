const fs = require("fs");
const path = "tmp/cerebro.js";
let code = fs.readFileSync(path, "utf8");

if (!code.includes("function sanitizePersonName")) {
  const anchor = "function firstName(nombre) {";
  const helpers = `function cleanDisplayText(value) {
  return String(value || '')
    .replace(/[\\n\\r\\t]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

function sanitizePersonName(value) {
  const text = cleanDisplayText(value);
  if (text.length < 3 || text.length > 80) return '';
  const lower = clean(text);
  if (
    lower.startsWith('hola') ||
    lower.startsWith('buenos') ||
    lower.startsWith('buenas') ||
    lower.startsWith('me ') ||
    lower.includes('informacion') ||
    lower.includes('vacante') ||
    lower.includes('empleo') ||
    lower.includes('trabajo') ||
    lower.includes('continuar') ||
    lower.includes('podria')
  ) {
    return '';
  }
  return text;
}

function sanitizePuesto(value) {
  const text = cleanDisplayText(value);
  if (text.length < 2 || text.length > 80) return '';
  const lower = clean(text);
  if (
    lower.includes('informacion') ||
    lower.includes('informes') ||
    lower.includes('regalar') ||
    lower.includes('podria') ||
    lower.startsWith('me ')
  ) {
    return '';
  }
  return text;
}

function sanitizeSalary(value) {
  const text = cleanDisplayText(value).replace(/,/g, '');
  if (!text) return '';
  if (text === 'Menos de $10' || text === 'Menos de $15' || /^\\$\\d{1,2}$/.test(text)) {
    if (text.includes('15') || text === '$15') return 'Menos de $15000';
    if (text.includes('10') || text === '$10') return 'Menos de $10000';
  }
  return text;
}

function sanitizeCandidateStatus(value) {
  const allowed = new Set(['draft', 'registered', 'interested', 'active']);
  const raw = cleanDisplayText(value).toLowerCase();
  if (allowed.has(raw)) return raw;
  if (raw === 'si' || raw === 'sí') return 'interested';
  return 'registered';
}

function resolveInterestVacancy(data) {
  const pending = data && data.pending_vacancy;
  if (pending && pending.id) return pending;
  const last = getLastVacancies(data);
  if (last.length > 0 && last[0] && last[0].id) return last[0];
  return null;
}

` + anchor;
  if (!code.includes(anchor)) throw new Error("firstName anchor missing");
  code = code.replace(anchor, helpers);
}

const previewSelect = `    if (selected) {
      data.pending_vacancy = {
        id: selected.vacancy.id || null,
        title: selected.vacancy.title || '',
        company_name: selected.vacancy.company_name || '',
        location: selected.vacancy.location || '',
        selected_number: selected.selected_number,
      };

      reply = \`Excelente 👍
Registré tu interés en:`;

const previewSelectNew = `    if (selected) {
      data.pending_vacancy = {
        id: selected.vacancy.id || null,
        title: selected.vacancy.title || '',
        company_name: selected.vacancy.company_name || '',
        location: selected.vacancy.location || '',
        selected_number: selected.selected_number,
      };

      if (selected.vacancy.id) {
        selectedVacancy = selected.vacancy;
        selectedVacancyId = selected.vacancy.id;
        shouldSaveSelectedVacancy = true;
        candidateStatus = 'interested';
      }

      reply = \`Excelente 👍
Registré tu interés en:`;

if (!code.includes(previewSelect)) throw new Error("preview select block missing");
code = code.replace(previewSelect, previewSelectNew);

const recruiterOld = `    if (
      normalized === '3' ||
      normalized.includes('reclutador') ||
      normalized.includes('contacto') ||
      normalized.includes('asesor')
    ) {
      data = buildProfileSessionData(candidateProfile, data);

      shouldUpsertCandidate = true;
      candidateStatus = 'interested';
      notifyRecruiter = true;

      reply = \`Perfecto 👍

En breve te contactará uno de nuestros reclutadores.\`;

      nextStep = 'contacto_reclutador';
      break;
    }`;

const recruiterNew = `    if (
      normalized === '3' ||
      normalized.includes('reclutador') ||
      normalized.includes('contacto') ||
      normalized.includes('asesor')
    ) {
      data = buildProfileSessionData(candidateProfile, data);

      const interestVacancy = resolveInterestVacancy(data);
      shouldUpsertCandidate = true;
      candidateStatus = 'interested';
      notifyRecruiter = true;

      if (interestVacancy && interestVacancy.id) {
        selectedVacancy = interestVacancy;
        selectedVacancyId = interestVacancy.id;
        shouldSaveSelectedVacancy = true;
        data.selected_vacancy = {
          id: interestVacancy.id,
          title: interestVacancy.title || '',
          company_name: interestVacancy.company_name || '',
          location: interestVacancy.location || '',
          selected_number: interestVacancy.selected_number || 1,
        };
      }

      reply = interestVacancy && interestVacancy.title
        ? \`Perfecto 👍

Registré tu interés en \${interestVacancy.title} y en breve te contactará uno de nuestros reclutadores.\`
        : \`Perfecto 👍

En breve te contactará uno de nuestros reclutadores.\`;

      nextStep = 'contacto_reclutador';
      break;
    }`;

if (!code.includes(recruiterOld)) throw new Error("recruiter block missing");
code = code.replace(recruiterOld, recruiterNew);

const returnBlock = `const estadoResuelto = data.estado || resolveEstadoName(data.ubicacion);
const estadoPattern = buildEstadoPattern(estadoResuelto);

if (estadoResuelto && !data.estado) {
  data.estado = estadoResuelto;
}

return [`;

const returnBlockNew = `const estadoResuelto = data.estado || resolveEstadoName(data.ubicacion);
const estadoPattern = buildEstadoPattern(estadoResuelto);

if (estadoResuelto && !data.estado) {
  data.estado = estadoResuelto;
}

if (data.nombre_completo) {
  const safeName = sanitizePersonName(data.nombre_completo);
  if (safeName) data.nombre_completo = safeName;
  else delete data.nombre_completo;
}

if (data.puesto_buscado) {
  const safePuesto = sanitizePuesto(data.puesto_buscado);
  if (safePuesto) data.puesto_buscado = safePuesto;
}

if (data.expectativa_salarial) {
  data.expectativa_salarial = sanitizeSalary(data.expectativa_salarial);
}

candidateStatus = sanitizeCandidateStatus(candidateStatus);

if (shouldSaveSelectedVacancy && !selectedVacancyId) {
  shouldSaveSelectedVacancy = false;
}

return [`;

if (!code.includes(returnBlock)) throw new Error("return block missing");
code = code.replace(returnBlock, returnBlockNew);

fs.writeFileSync(path, code);
console.log(
  JSON.stringify({
    ok: true,
    len: code.length,
    sanitize: code.includes("sanitizePersonName"),
    resolve: code.includes("resolveInterestVacancy"),
    early: code.includes("shouldSaveSelectedVacancy = true"),
  }),
);
