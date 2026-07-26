const fs = require('fs');
const path = require('path');
const vm = require('vm');

function run(candidato, vacantes) {
  const code = fs.readFileSync(path.join(__dirname, 'mensaje-vacantes.js'), 'utf8');
  const sandbox = {
    $: () => ({ item: { json: candidato } }),
    $input: { all: () => vacantes.map((v) => ({ json: v })) },
    console,
  };
  vm.createContext(sandbox);
  return vm.runInContext('(function(){\n' + code + '\n})()', sandbox);
}

const preview = run(
  {
    telefono: '1',
    vacancy_stage: 'preview',
    estado: 'Nuevo León',
    data: { puesto_buscado: 'Cajero', estado: 'Nuevo León' },
  },
  [
    {
      id: 'a',
      title: 'Cajero',
      company_name: 'X',
      location: 'Monterrey, Nuevo León',
      schedule: null,
      salary_min: 10000,
      salary_max: 12000,
      benefits: null,
    },
  ]
);

if (!preview[0].json.found_vacancies) throw new Error('preview should find');
if (!preview[0].json.reply.includes('registro')) throw new Error('preview copy');
if (!preview[0].json.reply.includes('en Nuevo León')) throw new Error('preview menciona estado');
if (!preview[0].json.reply.includes('cambiar zona')) throw new Error('preview ofrece cambiar zona');
if (preview[0].json.session_next_step !== '') throw new Error('preview next empty');

const empty = run(
  {
    telefono: '1',
    vacancy_stage: 'preview',
    estado: 'Yucatán',
    data: { puesto_buscado: 'Cajero', estado: 'Yucatán' },
  },
  []
);
if (empty[0].json.found_vacancies) throw new Error('empty should not find');
if (empty[0].json.session_next_step !== 'esperando_nombre') throw new Error('empty next');
if (!empty[0].json.reply.includes('nombre')) throw new Error('empty asks name');
if (!empty[0].json.reply.includes('Yucatán')) throw new Error('empty menciona estado');

const post = run(
  {
    telefono: '1',
    vacancy_stage: 'post_registro',
    estado: 'Jalisco',
    data: { puesto_buscado: 'Cajero', nombre_completo: 'Ana Lopez', estado: 'Jalisco' },
  },
  [{ id: 'a', title: 'Cajero', company_name: 'X', location: 'Guadalajara, Jalisco' }]
);
if (!post[0].json.reply.includes('comunidad Jalector')) throw new Error('post copy');
if (!post[0].json.reply.includes('en Jalisco')) throw new Error('post menciona estado');
if (post[0].json.session_next_step !== '') throw new Error('post next');

const sinEstado = run(
  { telefono: '1', vacancy_stage: 'preview', data: { puesto_buscado: 'Cajero' } },
  [{ id: 'a', title: 'Cajero', company_name: 'X', location: 'CDMX' }]
);
if (sinEstado[0].json.reply.includes(' en undefined')) throw new Error('sin estado no imprime undefined');

console.log('All mensaje-vacantes tests passed');
