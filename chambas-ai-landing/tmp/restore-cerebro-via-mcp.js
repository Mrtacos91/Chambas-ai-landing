const fs = require('fs');
const path = require('path');

const cerebro = fs.readFileSync(path.join(__dirname, 'cerebro.js'), 'utf8');
const args = {
  workflowId: 'zphHtNEzhuCM2J6W',
  operations: [
    {
      type: 'setNodeParameter',
      nodeName: 'Cerebro Jalector',
      path: '/jsCode',
      value: cerebro,
    },
  ],
};

fs.writeFileSync(path.join(__dirname, 'op-cerebro-restore.json'), JSON.stringify(args));
process.stdout.write(JSON.stringify({
  ok: true,
  len: cerebro.length,
  markers: {
    puesto_parece_pregunta: cerebro.includes('puesto_parece_pregunta'),
    experiencia_invalida: cerebro.includes('experiencia_invalida'),
    registerInvalid: cerebro.includes('registerInvalid'),
    vacantes: cerebro.includes('No tengo vacantes cargadas'),
  },
}));
