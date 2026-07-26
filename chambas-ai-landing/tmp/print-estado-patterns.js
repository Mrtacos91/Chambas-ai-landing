const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, 'cerebro.js'), 'utf8');

function patternFor(estado) {
  const sandbox = {
    $json: {
      telefono: '1',
      incoming_text: estado,
      current_step: 'esperando_estado_inicial',
      data: { puesto_buscado: '' },
      candidate_exists: false,
      candidate_profile: null,
    },
    console,
  };
  vm.createContext(sandbox);
  const result = vm.runInContext('(function(){\n' + code + '\n})()', sandbox);
  return result[0].json.estado_pattern;
}

const targets = process.argv.slice(2);
const states = targets.length ? targets : ['Nuevo Leon', 'Estado de Mexico', 'Ciudad de Mexico', 'Guanajuato', 'Jalisco'];

const output = {};
for (const state of states) {
  output[state] = patternFor(state);
}

fs.writeFileSync(path.join(__dirname, 'estado-patterns.json'), JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
