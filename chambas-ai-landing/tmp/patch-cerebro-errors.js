const fs = require("fs");
const path = "tmp/cerebro.js";
let code = fs.readFileSync(path, "utf8");

if (!code.includes("function registerInvalid(")) {
  const insertAfter = `function resolveInterestVacancy(data) {
  const pending = data && data.pending_vacancy;
  if (pending && pending.id) return pending;
  const last = getLastVacancies(data);
  if (last.length > 0 && last[0] && last[0].id) return last[0];
  return null;
}`;

  const helpers = `${insertAfter}

function isPlaceLikeName(value) {
  const lower = clean(value);
  return (
    lower.includes('estado de') ||
    lower.includes('municipio') ||
    lower.includes('ciudad de') ||
    lower === 'cdmx' ||
    lower === 'edomex' ||
    !!resolveEstado(value)
  );
}

function isQuestionLike(value) {
  const text = cleanDisplayText(value);
  const lower = clean(text);
  if (text.includes('?')) return true;
  return (
    lower.includes('disculp') ||
    lower.includes('informacion') ||
    lower.includes('informes') ||
    lower.includes('tendra') ||
    lower.includes('donde') ||
    lower.includes('cuando') ||
    lower.includes('como') ||
    lower.includes('cuanto') ||
    lower.startsWith('me interesa') ||
    lower.startsWith('quiero') ||
    lower.includes('regala') ||
    lower.includes('podria')
  );
}

function isVacancyHelpQuestion(value) {
  const lower = clean(value);
  return (
    lower.includes('vacante') ||
    lower.includes('empresa') ||
    lower.includes('ubicacion') ||
    lower.includes('ubicacion') ||
    lower.includes('direccion') ||
    lower.includes('horario') ||
    lower.includes('sueldo') ||
    lower.includes('salario') ||
    (lower.includes('donde') && (lower.includes('queda') || lower.includes('esta')))
  );
}

function isEscapeCommand(normalized) {
  return (
    normalized === 'ayuda' ||
    normalized === 'menu' ||
    normalized === 'menú' ||
    normalized.includes('empezar de nuevo') ||
    normalized.includes('reiniciar') ||
    normalized === '0'
  );
}

function isSkipCurp(normalized) {
  return (
    normalized.includes('continuar sin curp') ||
    normalized.includes('sin curp') ||
    normalized.includes('omitir curp') ||
    normalized === 'saltar'
  );
}

function registerInvalid(data, reason) {
  const attempts = Number(data.invalid_attempts || 0) + 1;
  data.invalid_attempts = attempts;
  data.last_invalid_reason = reason;
  return attempts;
}

function resetInvalid(data) {
  data.invalid_attempts = 0;
  data.last_invalid_reason = null;
}

function escapeMenuReply() {
  return \`Para ayudarte, elige una opcion:

1️ Empezar de nuevo
2️ Hablar con un reclutador
3️ Seguir con la pregunta actual

Tambien puedes escribir: ayuda\`;
}

function buildRetryReply(base, attempts) {
  if (attempts >= 2) {
    return base + '\\n\\n' + escapeMenuReply();
  }
  return base;
}
`;

  if (!code.includes(insertAfter)) throw new Error("resolveInterestVacancy block missing");
  code = code.replace(insertAfter, helpers);
}

// Strengthen sanitizePersonName for places
if (!code.includes("lower.includes('estado de')")) {
  code = code.replace(
    `function sanitizePersonName(value) {
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
}`,
    `function sanitizePersonName(value) {
  const text = cleanDisplayText(value);
  if (text.length < 5 || text.length > 80) return '';
  if (/^\\d+$/.test(text)) return '';
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
    lower.includes('podria') ||
    lower.includes('estado de') ||
    lower.includes('municipio') ||
    lower.includes('ciudad de') ||
    lower === 'cdmx' ||
    text.includes('?')
  ) {
    return '';
  }
  return text;
}`,
  );
}

if (!code.includes("lower.includes('disculp')")) {
  code = code.replace(
    `function sanitizePuesto(value) {
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
}`,
    `function sanitizePuesto(value) {
  const text = cleanDisplayText(value);
  if (text.length < 2 || text.length > 80) return '';
  const lower = clean(text);
  if (
    text.includes('?') ||
    lower.includes('informacion') ||
    lower.includes('informes') ||
    lower.includes('regalar') ||
    lower.includes('podria') ||
    lower.includes('disculp') ||
    lower.includes('tendra') ||
    lower.includes('interesa la vacante') ||
    lower.startsWith('me ') ||
    lower.startsWith('el 1') ||
    lower.includes('cualquiera de esos')
  ) {
    return '';
  }
  return text;
}`,
  );
}

// Inject pre-switch handling after variable init
const preSwitchAnchor = `let selectedVacancy = null;
let selectedVacancyId = null;`;

if (!code.includes("MEDIA_SIN_TEXTO") && code.includes(preSwitchAnchor)) {
  // Find switch start
  const switchMarker = "switch (currentStep) {";
  const idx = code.indexOf(switchMarker);
  if (idx < 0) throw new Error("switch missing");

  const preLogic = `
const MEDIA_SIN_TEXTO = '__media_sin_texto__';

if (!data || typeof data !== 'object') data = {};
if (typeof data.invalid_attempts !== 'number') data.invalid_attempts = 0;

if (text === MEDIA_SIN_TEXTO || normalized === MEDIA_SIN_TEXTO) {
  const attempts = registerInvalid(data, 'media_sin_texto');
  reply = buildRetryReply(
    'Por ahora solo puedo leer texto. Escribe tu respuesta con teclado, por favor.',
    attempts,
  );
  nextStep = currentStep;
} else if (isEscapeCommand(normalized)) {
  if (normalized.includes('empezar de nuevo') || normalized.includes('reiniciar') || normalized === '1') {
    data = { invalid_attempts: 0 };
    reply = 'De acuerdo. Empezamos de nuevo.\\n\\n' + buildPuestoPrompt();
    nextStep = 'esperando_puesto_inicial';
  } else if (
    normalized.includes('reclutador') ||
    normalized === '2' ||
    normalized.includes('hablar')
  ) {
    const interestVacancy = resolveInterestVacancy(data);
    shouldUpsertCandidate = true;
    candidateStatus = 'interested';
    notifyRecruiter = true;
    if (interestVacancy && interestVacancy.id) {
      selectedVacancy = interestVacancy;
      selectedVacancyId = interestVacancy.id;
      shouldSaveSelectedVacancy = true;
    }
    reply = 'Perfecto. En breve te contactara uno de nuestros reclutadores.';
    nextStep = 'contacto_reclutador';
  } else {
    reply = escapeMenuReply();
    nextStep = currentStep;
  }
} else if (
  isVacancyHelpQuestion(text) &&
  currentStep !== 'esperando_vacante_previa' &&
  currentStep !== 'esperando_interes_vacante' &&
  currentStep !== 'confirmacion_resumen'
) {
  const attempts = registerInvalid(data, 'pregunta_fuera_de_contexto');
  reply = buildRetryReply(
    'Puedo ayudarte con eso en un momento. Primero necesito completar este dato del perfil.',
    attempts,
  );
  nextStep = currentStep;
} else

`;

  // We need to wrap switch in if-else - cleaner to inject a flag
  // Actually replace the approach: use early handling before switch with a flag handledEarly
}

// Better approach: inject handledEarly pattern before switch
if (!code.includes("let handledEarly = false")) {
  const switchIdx = code.indexOf("switch (currentStep) {");
  if (switchIdx < 0) throw new Error("switch not found");

  const earlyBlock = `let handledEarly = false;
const MEDIA_SIN_TEXTO = '__media_sin_texto__';

if (!data || typeof data !== 'object') data = {};
if (typeof data.invalid_attempts !== 'number') data.invalid_attempts = Number(data.invalid_attempts) || 0;

if (text === MEDIA_SIN_TEXTO || normalized === 'mediasintexto' || normalized === MEDIA_SIN_TEXTO) {
  handledEarly = true;
  const attempts = registerInvalid(data, 'media_sin_texto');
  reply = buildRetryReply(
    'Por ahora solo puedo leer texto. Escribe tu respuesta con teclado, por favor.',
    attempts,
  );
  nextStep = currentStep;
} else if (isEscapeCommand(normalized)) {
  handledEarly = true;
  if (normalized.includes('empezar de nuevo') || normalized.includes('reiniciar')) {
    data = { invalid_attempts: 0 };
    reply = 'De acuerdo. Empezamos de nuevo.\\n\\n' + buildPuestoPrompt();
    nextStep = 'esperando_puesto_inicial';
  } else if (normalized.includes('reclutador') || normalized.includes('hablar con')) {
    const interestVacancy = resolveInterestVacancy(data);
    shouldUpsertCandidate = true;
    candidateStatus = 'interested';
    notifyRecruiter = true;
    if (interestVacancy && interestVacancy.id) {
      selectedVacancy = interestVacancy;
      selectedVacancyId = interestVacancy.id;
      shouldSaveSelectedVacancy = true;
    }
    reply = 'Perfecto. En breve te contactara uno de nuestros reclutadores.';
    nextStep = 'contacto_reclutador';
  } else if (normalized === '1' && Number(data.invalid_attempts || 0) >= 2) {
    data = { invalid_attempts: 0 };
    reply = 'De acuerdo. Empezamos de nuevo.\\n\\n' + buildPuestoPrompt();
    nextStep = 'esperando_puesto_inicial';
  } else if (normalized === '2' && Number(data.invalid_attempts || 0) >= 2) {
    const interestVacancy = resolveInterestVacancy(data);
    shouldUpsertCandidate = true;
    candidateStatus = 'interested';
    notifyRecruiter = true;
    if (interestVacancy && interestVacancy.id) {
      selectedVacancy = interestVacancy;
      selectedVacancyId = interestVacancy.id;
      shouldSaveSelectedVacancy = true;
    }
    reply = 'Perfecto. En breve te contactara uno de nuestros reclutadores.';
    nextStep = 'contacto_reclutador';
  } else {
    reply = escapeMenuReply();
    nextStep = currentStep;
  }
} else if (
  isVacancyHelpQuestion(text) &&
  currentStep !== 'esperando_vacante_previa' &&
  currentStep !== 'esperando_interes_vacante' &&
  currentStep !== 'confirmacion_resumen' &&
  currentStep !== 'menu_candidato_existente'
) {
  handledEarly = true;
  const attempts = registerInvalid(data, 'pregunta_fuera_de_contexto');
  reply = buildRetryReply(
    'Puedo ayudarte con la vacante en cuanto terminemos este dato. Responde la pregunta actual, por favor.',
    attempts,
  );
  nextStep = currentStep;
}

if (!handledEarly) switch (currentStep) {`;

  code = code.replace("switch (currentStep) {", earlyBlock);
}

// Fix esperando_nombre
const nombreOld = `  case 'esperando_nombre':
    if (text.length < 5) {
      reply = 'Por favor escribe tu nombre completo. Ejemplo: Juan Pérez García';
      break;
    }

    data.nombre_completo = text;
    reply = \`Mucho gusto, \${firstName(text)} 😊

¿Cuántos años tienes?

Ejemplo:
25\`;
    nextStep = 'esperando_edad';
    break;`;

const nombreNew = `  case 'esperando_nombre': {
    if (isPlaceLikeName(text) || resolveEstado(text)) {
      const attempts = registerInvalid(data, 'nombre_parece_lugar');
      reply = buildRetryReply(
        'Eso parece un estado o municipio. Escribe tu nombre completo. Ejemplo: Juan Perez Garcia',
        attempts,
      );
      break;
    }

    if (isQuestionLike(text) || isVacancyHelpQuestion(text)) {
      const attempts = registerInvalid(data, 'nombre_parece_pregunta');
      reply = buildRetryReply(
        'Necesito tu nombre completo para continuar. Ejemplo: Juan Perez Garcia',
        attempts,
      );
      break;
    }

    const safeName = sanitizePersonName(text);
    if (!safeName) {
      const attempts = registerInvalid(data, 'nombre_invalido');
      reply = buildRetryReply(
        'Por favor escribe tu nombre completo. Ejemplo: Juan Perez Garcia',
        attempts,
      );
      break;
    }

    resetInvalid(data);
    data.nombre_completo = safeName;
    reply = \`Mucho gusto, \${firstName(safeName)}.

Cuantos anos tienes?

Ejemplo:
25\`;
    nextStep = 'esperando_edad';
    break;
  }`;

if (code.includes(nombreOld)) {
  code = code.replace(nombreOld, nombreNew);
} else {
  console.warn("nombre block not exact match, trying loose");
}

// CURP skip on 2nd fail
const curpOld = `  case 'esperando_curp': {
    const curp = text.toUpperCase().replace(/\\s/g, '');

    if (!isValidCurp(curp)) {
      reply = 'La CURP no parece tener un formato válido. Escríbela nuevamente en mayúsculas, por favor.';
      break;
    }

    data.curp = curp;
    reply = buildSummary(data);
    nextStep = 'confirmacion_resumen';
    break;
  }`;

const curpNew = `  case 'esperando_curp': {
    if (isSkipCurp(normalized) || (Number(data.invalid_attempts || 0) >= 2 && isYes(normalized))) {
      resetInvalid(data);
      data.curp = null;
      reply = buildSummary(data);
      nextStep = 'confirmacion_resumen';
      break;
    }

    const curp = text.toUpperCase().replace(/\\s/g, '');

    if (!isValidCurp(curp)) {
      const attempts = registerInvalid(data, 'curp_invalida');
      reply = buildRetryReply(
        attempts >= 2
          ? 'La CURP no es valida. Puedes escribir \"continuar sin CURP\" para seguir, o intenta de nuevo en mayusculas.'
          : 'La CURP no parece tener un formato valido. Escribela nuevamente en mayusculas, por favor.',
        attempts,
      );
      break;
    }

    resetInvalid(data);
    data.curp = curp;
    reply = buildSummary(data);
    nextStep = 'confirmacion_resumen';
    break;
  }`;

if (code.includes(curpOld)) {
  code = code.replace(curpOld, curpNew);
} else {
  console.warn("curp block not exact");
}

// Age: accept "25 años" already via replace(/\D/g) - add resetInvalid on success
code = code.replace(
  `    if (!Number.isInteger(edad) || edad < 18 || edad > 65) {
      reply = 'Por favor escribe una edad válida entre 18 y 65 años. Ejemplo: 25';
      break;
    }

    data.edad = edad;`,
  `    if (!Number.isInteger(edad) || edad < 18 || edad > 65) {
      const attempts = registerInvalid(data, 'edad_invalida');
      reply = buildRetryReply(
        'Por favor escribe una edad valida entre 18 y 65 anos. Ejemplo: 25',
        attempts,
      );
      break;
    }

    resetInvalid(data);
    data.edad = edad;`,
);

// Vacancy empty recovery - inject at start of esperando_vacante_previa
const vacPrevStart = `  case 'esperando_vacante_previa': {
    const lastVacancies = getLastVacancies(data);
    const selected = parseVacancySelection(normalized, data);`;

const vacPrevNew = `  case 'esperando_vacante_previa': {
    const lastVacancies = getLastVacancies(data);
    const selected = parseVacancySelection(normalized, data);

    if (lastVacancies.length === 0) {
      shouldSearchVacancies = true;
      vacancyStage = 'preview';
      reply = 'No tengo vacantes cargadas en este momento. Voy a buscar de nuevo para ti...';
      nextStep = 'esperando_vacante_previa';
      break;
    }`;

if (code.includes(vacPrevStart) && !code.includes("No tengo vacantes cargadas en este momento. Voy a buscar de nuevo para ti...")) {
  code = code.replace(vacPrevStart, vacPrevNew);
}

const interesStart = `  case 'esperando_interes_vacante': {
    const selected = parseVacancySelection(normalized, data);
    const lastVacancies = getLastVacancies(data);`;

const interesNew = `  case 'esperando_interes_vacante': {
    const selected = parseVacancySelection(normalized, data);
    const lastVacancies = getLastVacancies(data);

    if (lastVacancies.length === 0) {
      shouldUpsertCandidate = true;
      shouldSearchVacancies = true;
      candidateStatus = 'registered';
      vacancyStage = 'post_registro';
      reply = 'No tengo vacantes cargadas. Voy a buscar opciones compatibles con tu perfil...';
      nextStep = 'esperando_interes_vacante';
      break;
    }`;

if (code.includes(interesStart) && !code.includes("No tengo vacantes cargadas. Voy a buscar opciones compatibles")) {
  code = code.replace(interesStart, interesNew);
}

// Puesto inicial - reject questions
code = code.replace(
  `  case 'esperando_puesto_inicial': {
    const puestoInicial = resolvePuestoBuscado(text, normalized);

    if (!puestoInicial || puestoInicial.length < 2) {
      reply = \`Elige un número de la lista o escribe el puesto que buscas:

\` + formatJobTitlesList();
      break;
    }

    data.puesto_buscado = puestoInicial;
    data.pending_vacancy = null;
    data.last_vacancies = [];

    reply = buildEstadoPrompt(puestoInicial);
    nextStep = 'esperando_estado_inicial';
    break;
  }`,
  `  case 'esperando_puesto_inicial': {
    if (isQuestionLike(text)) {
      const attempts = registerInvalid(data, 'puesto_parece_pregunta');
      reply = buildRetryReply(
        'Elige un numero de la lista o escribe el puesto que buscas:\\n\\n' + formatJobTitlesList(),
        attempts,
      );
      break;
    }

    const puestoInicial = sanitizePuesto(resolvePuestoBuscado(text, normalized) || '');

    if (!puestoInicial || puestoInicial.length < 2) {
      const attempts = registerInvalid(data, 'puesto_invalido');
      reply = buildRetryReply(
        'Elige un numero de la lista o escribe el puesto que buscas:\\n\\n' + formatJobTitlesList(),
        attempts,
      );
      break;
    }

    resetInvalid(data);
    data.puesto_buscado = puestoInicial;
    data.pending_vacancy = null;
    data.last_vacancies = [];

    reply = buildEstadoPrompt(puestoInicial);
    nextStep = 'esperando_estado_inicial';
    break;
  }`,
);

// When nextStep changes from currentStep successfully through cases, we already resetInvalid on success paths

fs.writeFileSync(path, code);
console.log(
  JSON.stringify({
    ok: true,
    len: code.length,
    registerInvalid: code.includes("function registerInvalid"),
    handledEarly: code.includes("handledEarly"),
    emptyVac: code.includes("No tengo vacantes cargadas"),
    curpSkip: code.includes("isSkipCurp"),
    nombreGuard: code.includes("nombre_parece_lugar"),
  }),
);
