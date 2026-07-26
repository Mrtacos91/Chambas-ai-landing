const fs = require('fs');
const path = require('path');
const vm = require('vm');

function runCerebro(input) {
  const code = fs.readFileSync(path.join(__dirname, 'cerebro.js'), 'utf8');
  const sandbox = {
    $json: input,
    console,
  };
  vm.createContext(sandbox);
  const wrapped = `(function(){\n${code}\n})()`;
  return vm.runInContext(wrapped, sandbox);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function step(label, input) {
  const result = runCerebro(input);
  const out = result[0].json;
  console.log(
    `OK ${label} -> next=${out.next_step} search=${out.should_search_vacancies} upsert=${out.should_upsert_candidate} stage=${out.vacancy_stage} estado=${out.estado || '-'}`
  );
  return out;
}

const baseProfile = {
  nombre_completo: 'Ana López',
  ubicacion: 'Monterrey, Nuevo León',
  puesto_buscado: 'Mesera',
  experiencia: '1 a 2 años',
  disponibilidad: 'Esta semana',
  turno_preferido: 'Vespertino',
  expectativa_salarial: '$10000 a $15000',
  documentacion: 'Si completa',
  ultimo_empleo: 'Mesera',
};

let failed = 0;

try {
  let out = step('bienvenida nuevo', {
    telefono: '5215550000001',
    incoming_text: 'hola',
    current_step: 'bienvenida',
    data: {},
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.next_step === 'esperando_puesto_inicial', 'bienvenida va a puesto');
  assert(out.should_search_vacancies === false, 'bienvenida no busca');

  out = step('elige puesto Cajero', {
    telefono: '5215550000001',
    incoming_text: '9',
    current_step: 'esperando_puesto_inicial',
    data: {},
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.data.puesto_buscado === 'Cajero', 'puesto Cajero');
  assert(out.next_step === 'esperando_estado_inicial', 'tras puesto pregunta estado');
  assert(out.should_search_vacancies === false, 'no busca sin estado');
  assert(out.reply.includes('estado'), 'pregunta estado');
  assert(out.reply.includes('Nuevo León'), 'lista incluye Nuevo Leon');

  out = step('estado invalido', {
    telefono: '5215550000001',
    incoming_text: 'zzzz',
    current_step: 'esperando_estado_inicial',
    data: { puesto_buscado: 'Cajero' },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.next_step === 'esperando_estado_inicial', 'estado invalido repregunta');
  assert(out.should_search_vacancies === false, 'estado invalido no busca');

  out = step('estado por numero', {
    telefono: '5215550000001',
    incoming_text: '19',
    current_step: 'esperando_estado_inicial',
    data: { puesto_buscado: 'Cajero' },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.data.estado === 'Nuevo León', 'estado 19 es Nuevo Leon');
  assert(out.should_search_vacancies === true, 'con estado busca');
  assert(out.vacancy_stage === 'preview', 'stage preview');
  assert(out.next_step === 'esperando_vacante_previa', 'va a vacante previa');
  assert(out.estado_pattern.includes('monterrey'), 'patron incluye monterrey');
  assert(out.estado_pattern.startsWith('\\y'), 'patron con word boundary');
  assert(out.estado_pattern.includes('\\ynuevo leon\\y'), 'patron con alias del estado');

  out = step('estado por texto libre', {
    telefono: '5215550000001',
    incoming_text: 'vivo en Guadalajara',
    current_step: 'esperando_estado_inicial',
    data: { puesto_buscado: 'Mesero' },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.data.estado === 'Jalisco', 'Guadalajara resuelve Jalisco');

  out = step('estado edomex abreviado', {
    telefono: '5215550000001',
    incoming_text: 'edomex',
    current_step: 'esperando_estado_inicial',
    data: { puesto_buscado: 'Almacenista' },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.data.estado === 'Estado de México', 'edomex resuelve Estado de Mexico');

  out = step('cambiar zona', {
    telefono: '5215550000001',
    incoming_text: 'cambiar zona',
    current_step: 'esperando_vacante_previa',
    data: {
      puesto_buscado: 'Cajero',
      estado: 'Nuevo León',
      last_vacancies: [{ id: '1', title: 'X', company_name: 'Y', location: 'Monterrey' }],
    },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.next_step === 'esperando_estado_inicial', 'cambiar zona repregunta estado');
  assert(!out.data.estado, 'cambiar zona limpia estado');

  out = step('elige vacante 1', {
    telefono: '5215550000001',
    incoming_text: '1',
    current_step: 'esperando_vacante_previa',
    data: {
      puesto_buscado: 'Cajero',
      estado: 'Nuevo León',
      last_vacancies: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Cajero Tienda Norte',
          company_name: 'Demo SA',
          location: 'Monterrey, Nuevo León',
        },
      ],
    },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.next_step === 'esperando_nombre', 'elegir vacante inicia registro');
  assert(out.data.pending_vacancy.id === '11111111-1111-1111-1111-111111111111', 'pending guardada');
  assert(out.data.estado === 'Nuevo León', 'estado preservado');

  out = step('pregunta ubicacion con estado', {
    telefono: '5215550000001',
    incoming_text: '28',
    current_step: 'esperando_edad',
    data: { puesto_buscado: 'Cajero', estado: 'Nuevo León', nombre_completo: 'Juan Pérez García' },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.next_step === 'esperando_ubicacion', 'edad va a ubicacion');
  assert(out.reply.includes('Nuevo León'), 'ubicacion contextualizada al estado');

  out = step('guarda ubicacion con estado', {
    telefono: '5215550000001',
    incoming_text: 'Apodaca',
    current_step: 'esperando_ubicacion',
    data: { puesto_buscado: 'Cajero', estado: 'Nuevo León', nombre_completo: 'Juan Pérez García', edad: 28 },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.data.ubicacion === 'Apodaca, Nuevo León', 'ubicacion incluye estado');

  out = step('no duplica estado en ubicacion', {
    telefono: '5215550000001',
    incoming_text: 'Apodaca, Nuevo León',
    current_step: 'esperando_ubicacion',
    data: { puesto_buscado: 'Cajero', estado: 'Nuevo León' },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.data.ubicacion === 'Apodaca, Nuevo León', 'no duplica estado');

  out = step('salta puesto si ya existe', {
    telefono: '5215550000001',
    incoming_text: 'Cajero en Oxxo',
    current_step: 'esperando_ultimo_empleo',
    data: {
      puesto_buscado: 'Cajero',
      estado: 'Nuevo León',
      nombre_completo: 'Juan Pérez García',
      edad: 25,
      ubicacion: 'Apodaca, Nuevo León',
    },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.next_step === 'esperando_experiencia', 'salta puesto_buscado');

  out = step('confirmacion con pending', {
    telefono: '5215550000001',
    incoming_text: 'si',
    current_step: 'confirmacion_resumen',
    data: {
      nombre_completo: 'Juan Pérez García',
      edad: 25,
      ubicacion: 'Apodaca, Nuevo León',
      estado: 'Nuevo León',
      ultimo_empleo: 'Cajero',
      puesto_buscado: 'Cajero',
      experiencia: '1 a 2 años',
      disponibilidad: 'Inmediatamente',
      turno_preferido: 'Matutino',
      expectativa_salarial: '$10000 a $15000',
      documentacion: 'Si completa',
      curp: 'PEGJ900101HDFRRN09',
      pending_vacancy: {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Cajero Tienda Norte',
        company_name: 'Demo SA',
        location: 'Monterrey, Nuevo León',
        selected_number: 1,
      },
    },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.should_upsert_candidate === true, 'confirmacion upsert');
  assert(out.should_save_selected_vacancy === true, 'guarda interes');
  assert(out.next_step === 'contacto_reclutador', 'va a contacto');

  out = step('confirmacion sin pending', {
    telefono: '5215550000001',
    incoming_text: 'si continuar',
    current_step: 'confirmacion_resumen',
    data: {
      nombre_completo: 'Juan Pérez García',
      puesto_buscado: 'Cajero',
      ubicacion: 'Apodaca, Nuevo León',
      estado: 'Nuevo León',
      turno_preferido: 'Matutino',
    },
    candidate_exists: false,
    candidate_profile: null,
  });
  assert(out.should_search_vacancies === true, 'sin pending busca');
  assert(out.vacancy_stage === 'post_registro', 'stage post_registro');
  assert(out.estado_pattern.includes('apodaca'), 'patron desde estado');

  out = step('candidato existente menu', {
    telefono: '5215550000001',
    incoming_text: 'hola',
    current_step: 'bienvenida',
    data: {},
    candidate_exists: true,
    candidate_profile: baseProfile,
  });
  assert(out.next_step === 'menu_candidato_existente', 'existente ve menu');
  assert(out.data.estado === 'Nuevo León', 'estado inferido del perfil');

  out = step('existente ve vacantes', {
    telefono: '5215550000001',
    incoming_text: '1',
    current_step: 'menu_candidato_existente',
    data: { ...baseProfile, estado: 'Nuevo León' },
    candidate_exists: true,
    candidate_profile: baseProfile,
  });
  assert(out.should_search_vacancies === true, 'existente busca');
  assert(out.vacancy_stage === 'post_registro', 'existente post_registro');
  assert(out.reply.includes('Nuevo León'), 'menciona estado');
  assert(out.estado_pattern.includes('nuevo leon'), 'patron con estado');

  out = step('existente sin estado resoluble', {
    telefono: '5215550000001',
    incoming_text: '1',
    current_step: 'menu_candidato_existente',
    data: {},
    candidate_exists: true,
    candidate_profile: { ...baseProfile, ubicacion: 'Zona centro' },
  });
  assert(out.next_step === 'esperando_estado_inicial', 'sin estado pregunta estado');
  assert(out.should_search_vacancies === false, 'sin estado no busca');

  out = step('existente responde estado', {
    telefono: '5215550000001',
    incoming_text: 'Jalisco',
    current_step: 'esperando_estado_inicial',
    data: { ...baseProfile, ubicacion: 'Zona centro' },
    candidate_exists: true,
    candidate_profile: { ...baseProfile, ubicacion: 'Zona centro' },
  });
  assert(out.next_step === 'esperando_interes_vacante', 'existente va a interes');
  assert(out.vacancy_stage === 'post_registro', 'existente stage post');
  assert(out.should_upsert_candidate === true, 'existente upsert');

  console.log('\nAll cerebro flow tests passed');
} catch (error) {
  failed = 1;
  console.error('\nFAILED:', error.message);
}

process.exit(failed);
