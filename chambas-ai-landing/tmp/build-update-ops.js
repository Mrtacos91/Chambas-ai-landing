const fs = require('fs');
const path = __dirname;

const normalizar = fs.readFileSync(`${path}/normalizar-mensaje.js`, 'utf8');
const cerebro = fs.readFileSync(`${path}/cerebro.js`, 'utf8');

const ops = [
  {
    type: 'setNodeParameter',
    nodeName: 'Normalizar mensaje',
    path: '/jsCode',
    value: normalizar,
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Cerebro Jalector',
    path: '/jsCode',
    value: cerebro,
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Crear o buscar sesión',
    path: '/options/queryReplacement',
    value:
      "={{ [ $('Normalizar mensaje').item.json.telefono, $('Normalizar mensaje').item.json.message_id, $('Normalizar mensaje').item.json.text || '', $('Normalizar mensaje').item.json.message_type || 'text' ] }}",
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Leer memoria candidato',
    path: '/options/queryReplacement',
    value:
      "={{ [ $('Normalizar mensaje').item.json.telefono, $('Normalizar mensaje').item.json.text || '', $('Normalizar mensaje').item.json.message_type || 'text' ] }}",
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Buscar email empresa',
    path: '/options/queryReplacement',
    value:
      "={{ [ $('Cerebro Jalector').item.json.selected_vacancy_id || '00000000-0000-0000-0000-000000000000' ] }}",
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Enviar whattsapp',
    path: '/options',
    value: { response: { response: { neverError: true } } },
  },
  {
    type: 'setNodeParameter',
    nodeName: 'Enviar vacantes por whatsapp',
    path: '/options',
    value: { response: { response: { neverError: true } } },
  },
];

const payload = { workflowId: 'zphHtNEzhuCM2J6W', operations: ops };
const out = `${path}/update-ops.json`;
fs.writeFileSync(out, JSON.stringify(payload));
console.log(
  JSON.stringify({
    ops: ops.length,
    bytes: fs.statSync(out).size,
    media: normalizar.includes('__media_sin_texto__'),
    registerInvalid: cerebro.includes('registerInvalid'),
    handledEarly: cerebro.includes('handledEarly'),
    crearStarts: ops[2].value.startsWith('={{ ['),
  })
);
