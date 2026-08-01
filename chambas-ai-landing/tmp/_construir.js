const candidato = $('Cerebro Jalector').item.json;
const vacantes = $input.all().map(item => item.json);

const nombre = candidato.data.nombre_completo?.split(' ')[0] || 'candidato';

let reply = '';

if (vacantes.length === 0) {
  reply = `🎯 Listo, ${nombre} ya formas parte de la comunidad Jalector.\n\nPor ahora no encontré una vacante exacta para tu perfil, pero ya tengo tu registro.\n\nMantente atento a este WhatsApp. Te avisaré cuando encontremos una oportunidad compatible.`;

  return [
    {
      json: {
        telefono: candidato.telefono,
        reply,
        found_vacancies: false,
        vacancies: [],
        last_vacancies: [],
      },
    },
  ];
}

reply = `🎯 Listo, ${nombre} ya formas parte de la comunidad Jalector.\n\nEncontré estas vacantes que pueden interesarte:\n\n`;

vacantes.forEach((v, index) => {
  const salario = v.salary_min && v.salary_max
    ? `$${Number(v.salary_min).toLocaleString('es-MX')} a $${Number(v.salary_max).toLocaleString('es-MX')}`
    : 'Salario por confirmar';

  reply += `${index + 1}️⃣ ${v.title}\n🏢 Empresa: ${v.company_name}\n📍 Zona: ${v.location || 'Por confirmar'}\n🕒 Horario: ${v.schedule || 'Por confirmar'}\n💰 Salario: ${salario}\n✅ Beneficios: ${v.benefits || 'Por confirmar'}\n\n`;
});

reply += `¿Cuál te interesa?\n\nResponde con el número de la vacante.\nEjemplo: 1`;

return [
  {
    json: {
      telefono: candidato.telefono,
      reply,
      found_vacancies: true,
      vacancies: vacantes,
      last_vacancies: vacantes,
    },
  },
];