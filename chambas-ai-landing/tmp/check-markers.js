const fs = require('fs');
const v = fs.readFileSync('tmp/cerebro.js', 'utf8');
const checks = {
  optionNumber: v.includes('optionNumber'),
  menos10000: v.includes('Menos de $10000'),
  siCompleta: v.includes('Si completa'),
  menuCase: v.includes("menu_candidato_existente': {"),
  badComma: v.includes('Menos de $10,000'),
  badSi: v.includes('Sí, completa'),
};
console.log(JSON.stringify(checks, null, 2));
console.log('len', v.length);
