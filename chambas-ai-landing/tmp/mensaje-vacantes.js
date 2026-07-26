const candidato = $('Cerebro Jalector').item.json;
const vacantes = $input.all().map(item => item.json);
const vacancyStage = candidato.vacancy_stage || 'post_registro';
const puesto = candidato.data?.puesto_buscado || 'tu perfil';
const estado = candidato.estado || candidato.data?.estado || '';
const nombre = candidato.data?.nombre_completo?.split(' ')[0] || 'candidato';
const zona = estado ? ` en ${estado}` : '';

let reply = '';

if (vacantes.length === 0) {
  if (vacancyStage === 'preview') {
    reply = `Por ahora no encontré vacantes abiertas de ${puesto}${zona}.

Vamos a completar tu perfil para avisarte cuando publiquemos una oportunidad en tu zona.

¿Cómo te llamas?

Escribe tu nombre completo.`;
  } else {
    reply = `🎯 Listo, ${nombre} ya formas parte de la comunidad Jalector.

Por ahora no encontré una vacante${zona} para tu perfil, pero ya tengo tu registro.

Mantente atento a este WhatsApp. Te avisaré cuando encontremos una oportunidad compatible.`;
  }

  return [
    {
      json: {
        telefono: candidato.telefono,
        reply,
        found_vacancies: false,
        vacancies: [],
        last_vacancies: [],
        vacancy_stage: vacancyStage,
        session_next_step: vacancyStage === 'preview' ? 'esperando_nombre' : '',
      },
    },
  ];
}

if (vacancyStage === 'preview') {
  reply = `Encontré estas vacantes de ${puesto}${zona} que pueden interesarte:

`;
} else {
  reply = `🎯 Listo, ${nombre} ya formas parte de la comunidad Jalector.

Encontré estas vacantes${zona} que pueden interesarte:

`;
}

vacantes.forEach((v, index) => {
  const salario = v.salary_min && v.salary_max
    ? `$${Number(v.salary_min).toLocaleString('es-MX')} a $${Number(v.salary_max).toLocaleString('es-MX')}`
    : 'Salario por confirmar';

  reply += `${index + 1}️⃣ ${v.title}
🏢 Empresa: ${v.company_name}
📍 Zona: ${v.location || 'Por confirmar'}
🕒 Horario: ${v.schedule || 'Por confirmar'}
💰 Salario: ${salario}
✅ Beneficios: ${v.benefits || 'Por confirmar'}

`;
});

if (vacancyStage === 'preview') {
  reply += `¿Cuál te interesa?

Responde con el número de la vacante para continuar con tu registro.
Ejemplo: 1

También puedes escribir:
- "otro puesto"
- "cambiar zona"
- "continuar"`;
} else {
  reply += `¿Cuál te interesa?

Responde con el número de la vacante.
Ejemplo: 1`;
}

return [
  {
    json: {
      telefono: candidato.telefono,
      reply,
      found_vacancies: true,
      vacancies: vacantes,
      last_vacancies: vacantes,
      vacancy_stage: vacancyStage,
      session_next_step: '',
    },
  },
];
