const fs = require('fs');
const path = 'c:/Users/tacos/OneDrive/Documentos/GitHub/Chambas-ai-landing/chambas-ai-landing/tmp/cerebro.js';
const jsCode = fs.readFileSync(path, 'utf8');
const payload = {
  workflowId: 'zphHtNEzhuCM2J6W',
  operations: [{
    type: 'setNodeParameter',
    nodeName: 'Cerebro Jalector',
    path: '/jsCode',
    value: jsCode
  }]
};
const out = 'c:/Users/tacos/OneDrive/Documentos/GitHub/Chambas-ai-landing/chambas-ai-landing/tmp/update-payload.json';
fs.writeFileSync(out, JSON.stringify(payload), 'utf8');
console.log('chars', jsCode.length);
console.log('has corruptSalary', jsCode.includes('corruptSalary'));
console.log('has Menos de $10000', jsCode.includes('Menos de $10000'));
console.log('has Si completa', jsCode.includes('Si completa'));
console.log('has optionNumber', jsCode.includes('optionNumber'));
console.log('payload bytes', fs.statSync(out).size);
