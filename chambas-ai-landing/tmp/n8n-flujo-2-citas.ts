import {
  workflow,
  node,
  trigger,
  sticky,
  newCredential,
  ifElse,
  expr,
} from '@n8n/workflow-sdk';

const notes = sticky({
  version: 1,
  config: {
    name: 'Notas Flujo 2',
    position: [0, -280],
    parameters: {
      width: 560,
      height: 260,
      color: 4,
      content:
        '## WA Citas Flujo 2\n\nPlantillas Meta (lang es, UTILITY, UNA linea, 4 variables):\njalector_cita_confirmacion: 1 nombre, 2 empresa, 3 vacante, 4 datos.\njalector_cita_recordatorio: 1 nombre, 2 puesto, 3 fecha, 4 lugar.',
    },
  },
});

const webhookCita = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  output: [{ headers: { 'x-jalector-secret': 'secret' }, body: { pipelineId: '00000000-0000-0000-0000-000000000001', phone: '5215512345678' } }],
  config: {
    name: 'Webhook confirmar cita',
    parameters: {
      httpMethod: 'POST',
      path: 'cita-confirmacion',
      authentication: 'none',
      responseMode: 'lastNode',
      responseData: 'firstEntryJson',
    },
  },
});

const verificarAuth = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  output: [{ ok: true, pipelineId: '00000000-0000-0000-0000-000000000001', phone: '5215512345678', nombre: 'Ana', vacante: 'Ayudante', empresa: 'Clarios', interview_at: '2026-08-20T16:00:00.000Z', interview_address: 'Av 1', interview_details: 'INE', work_start_on: '2026-09-01', last_seen_at: '2026-08-16T12:00:00.000Z' }],
  config: {
    name: 'Validar y normalizar cita',
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode:
        "const item = $input.item.json;\nconst headers = item.headers || {};\nconst secret = String($env.N8N_CITA_WEBHOOK_SECRET || '').trim();\nconst got = String(headers['x-jalector-secret'] || headers['X-Jalector-Secret'] || '').trim();\nif (!secret || got !== secret) {\n  throw new Error('Webhook de cita no autorizado');\n}\nconst body = item.body && typeof item.body === 'object' ? item.body : item;\nfunction clean(value) {\n  return String(value || '').replace(/[\\n\\r\\t]+/g, ' ').replace(/\\s+/g, ' ').trim();\n}\nfunction sanitize(value) {\n  return clean(value).slice(0, 900) || '-';\n}\nfunction normalizePhone(raw) {\n  let d = String(raw || '').replace(/\\D/g, '');\n  if (d.startsWith('521') && d.length >= 13) return d;\n  if (d.startsWith('52') && d.length === 12) return '521' + d.slice(2);\n  if (d.length === 10) return '521' + d;\n  return d;\n}\nconst lastSeen = body.last_seen_at ? new Date(body.last_seen_at).getTime() : 0;\nconst inWindow = lastSeen > 0 && Date.now() - lastSeen < 24 * 60 * 60 * 1000;\nlet fecha = sanitize(body.interview_at);\ntry {\n  fecha = DateTime.fromISO(String(body.interview_at), { zone: 'utc' }).setZone('America/Mexico_City').toFormat('dd/LL/yyyy HH:mm');\n} catch (e) {}\nconst inicio = sanitize(body.work_start_on);\nreturn {\n  pipelineId: body.pipelineId,\n  vacancyId: body.vacancyId,\n  phone: normalizePhone(body.phone),\n  nombre: sanitize(body.nombre),\n  vacante: sanitize(body.vacante),\n  empresa: sanitize(body.empresa),\n  fecha: sanitize(fecha),\n  sede: sanitize(body.interview_address),\n  indicaciones: sanitize(body.interview_details),\n  inicio: inicio === '-' ? 'Por confirmar' : inicio,\n  use_text: inWindow,\n  wa_lang: 'es',\n  wa_template: 'jalector_cita_confirmacion',\n};",
    },
  },
});

const enviarTextoCita = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  output: [{ messages: [{ id: 'wamid.text' }] }],
  config: {
    name: 'WhatsApp texto confirmacion',
    credentials: { httpBearerAuth: newCredential('Bearer Auth account') },
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://graph.facebook.com/v25.0/1162357053625483/messages',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpBearerAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr(
        '{{ JSON.stringify({ messaging_product: "whatsapp", to: $json.phone, type: "text", text: { body: "Hola " + $json.nombre + ", te escribe " + $json.empresa + ". Te invitamos a la cita de " + $json.vacante + ". Fecha: " + $json.fecha + ". Sede: " + $json.sede + ". Indicaciones: " + $json.indicaciones + ". Inicio: " + $json.inicio + ". Responde 1 para confirmar o 2 si no puedes." } }) }}',
      ),
      options: { response: { response: { neverError: true } } },
    },
  },
});

const enviarPlantillaCita = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  output: [{ messages: [{ id: 'wamid.tpl' }] }],
  config: {
    name: 'WhatsApp plantilla confirmacion',
    credentials: { httpBearerAuth: newCredential('Bearer Auth account') },
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://graph.facebook.com/v25.0/1162357053625483/messages',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpBearerAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr(
        '{{ JSON.stringify({ messaging_product: "whatsapp", to: $json.phone, type: "template", template: { name: $json.wa_template, language: { code: $json.wa_lang }, components: [{ type: "body", parameters: [{ type: "text", text: String($json.nombre) }, { type: "text", text: String($json.empresa) }, { type: "text", text: String($json.vacante) }, { type: "text", text: String($json.datos) }] }] } }) }}',
      ),
      options: { response: { response: { neverError: true } } },
    },
  },
});

const marcarEnviada = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.6,
  output: [{ id: '00000000-0000-0000-0000-000000000001', confirmation_status: 'sent' }],
  config: {
    name: 'Marcar cita enviada',
    credentials: { postgres: newCredential('Supabase - Jalector') },
    onError: 'continueRegularOutput',
    parameters: {
      operation: 'executeQuery',
      query:
        "update public.vacancy_candidate_pipeline\nset stage = 'entrevista',\n    confirmation_status = 'sent',\n    confirmation_sent_at = coalesce(confirmation_sent_at, now()),\n    last_activity_at = now(),\n    updated_at = now()\nwhere id = $1::uuid\nreturning id, confirmation_status;",
      options: {
        queryReplacement: expr("{{ [ $('Validar y normalizar cita').item.json.pipelineId ] }}"),
      },
    },
  },
});

const usarTexto = ifElse({
  version: 2.3,
  config: {
    name: 'Enviar texto libre?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [
          {
            id: 'use-text',
            leftValue: expr('{{ $json.use_text }}'),
            rightValue: true,
            operator: { type: 'boolean', operation: 'true', singleValue: true },
          },
        ],
        combinator: 'and',
      },
      looseTypeValidation: true,
      options: {},
    },
  },
});

const cronRecordatorio = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  output: [{ timestamp: '2026-08-16T18:00:00.000Z' }],
  config: {
    name: 'Cada hora CDMX',
    parameters: {
      rule: { interval: [{ field: 'hours', hoursInterval: 1 }] },
    },
  },
});

const buscarRecordatorios = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.6,
  output: [
    {
      pipeline_id: '00000000-0000-0000-0000-000000000001',
      phone: '5512345678',
      nombre: 'Ana',
      vacante: 'Ayudante',
      empresa: 'Clarios',
      interview_at: '2026-08-20T16:00:00.000Z',
      interview_address: 'Av 1',
      interview_details: 'INE',
      last_seen_at: '2026-08-16T12:00:00.000Z',
    },
  ],
  config: {
    name: 'Citas a recordar 24h',
    credentials: { postgres: newCredential('Supabase - Jalector') },
    parameters: {
      operation: 'executeQuery',
      query:
        "select p.id as pipeline_id,\n  p.candidate_phone as phone,\n  coalesce(c.nombre_completo, 'candidato') as nombre,\n  v.title as vacante,\n  co.name as empresa,\n  v.interview_at,\n  v.interview_address,\n  v.interview_details,\n  c.last_seen_at\nfrom public.vacancy_candidate_pipeline p\njoin public.vacancies v on v.id = p.vacancy_id\njoin public.companies co on co.id = v.company_id\nleft join public.candidates c on c.telefono = p.candidate_phone\nwhere p.confirmation_status = 'confirmed'\n  and p.reminder_sent_at is null\n  and v.active = true\n  and v.interview_at is not null\n  and v.interview_at between now() + interval '23 hours' and now() + interval '25 hours';",
      options: {},
    },
  },
});

const armarRecordatorio = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  output: [{ pipeline_id: '00000000-0000-0000-0000-000000000001', phone: '5215512345678', nombre: 'Ana', use_text: false }],
  config: {
    name: 'Armar recordatorio',
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode:
        "const row = $input.item.json;\nfunction clean(value) {\n  return String(value || '').replace(/[\\n\\r\\t]+/g, ' ').replace(/\\s+/g, ' ').trim();\n}\nfunction sanitize(value) {\n  return clean(value).slice(0, 900) || '-';\n}\nfunction normalizePhone(raw) {\n  let d = String(raw || '').replace(/\\D/g, '');\n  if (d.startsWith('521') && d.length >= 13) return d;\n  if (d.startsWith('52') && d.length === 12) return '521' + d.slice(2);\n  if (d.length === 10) return '521' + d;\n  return d;\n}\nconst lastSeen = row.last_seen_at ? new Date(row.last_seen_at).getTime() : 0;\nconst inWindow = lastSeen > 0 && Date.now() - lastSeen < 24 * 60 * 60 * 1000;\nlet fecha = sanitize(row.interview_at);\ntry {\n  fecha = DateTime.fromISO(String(row.interview_at), { zone: 'utc' }).setZone('America/Mexico_City').toFormat('dd/LL/yyyy HH:mm');\n} catch (e) {}\nreturn {\n  pipeline_id: row.pipeline_id,\n  phone: normalizePhone(row.phone),\n  nombre: sanitize(row.nombre),\n  vacante: sanitize(row.vacante),\n  empresa: sanitize(row.empresa),\n  fecha: sanitize(fecha),\n  sede: sanitize(row.interview_address),\n  indicaciones: sanitize(row.interview_details),\n  use_text: inWindow,\n  wa_lang: 'es',\n  wa_template: 'jalector_cita_recordatorio',\n};",
    },
  },
});

const usarTextoRecordatorio = ifElse({
  version: 2.3,
  config: {
    name: 'Recordatorio texto libre?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
        conditions: [
          {
            id: 'use-text-rem',
            leftValue: expr('{{ $json.use_text }}'),
            rightValue: true,
            operator: { type: 'boolean', operation: 'true', singleValue: true },
          },
        ],
        combinator: 'and',
      },
      looseTypeValidation: true,
      options: {},
    },
  },
});

const enviarTextoRecordatorio = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  output: [{ messages: [{ id: 'wamid.rem.text' }] }],
  config: {
    name: 'WhatsApp texto recordatorio',
    credentials: { httpBearerAuth: newCredential('Bearer Auth account') },
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://graph.facebook.com/v25.0/1162357053625483/messages',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpBearerAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr(
        '{{ JSON.stringify({ messaging_product: "whatsapp", to: $json.phone, type: "text", text: { body: "Hola " + $json.nombre + ", te recordamos tu cita de " + $json.vacante + " con " + $json.empresa + ". Fecha: " + $json.fecha + ". Sede: " + $json.sede + ". Indicaciones: " + $json.indicaciones + "." } }) }}',
      ),
      options: { response: { response: { neverError: true } } },
    },
  },
});

const enviarPlantillaRecordatorio = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  output: [{ messages: [{ id: 'wamid.rem.tpl' }] }],
  config: {
    name: 'WhatsApp plantilla recordatorio',
    credentials: { httpBearerAuth: newCredential('Bearer Auth account') },
    onError: 'continueRegularOutput',
    parameters: {
      method: 'POST',
      url: 'https://graph.facebook.com/v25.0/1162357053625483/messages',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpBearerAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr(
        '{{ JSON.stringify({ messaging_product: "whatsapp", to: $json.phone, type: "template", template: { name: $json.wa_template, language: { code: $json.wa_lang }, components: [{ type: "body", parameters: [{ type: "text", text: String($json.nombre) }, { type: "text", text: String($json.puesto) }, { type: "text", text: String($json.fecha) }, { type: "text", text: String($json.lugar) }] }] } }) }}',
      ),
      options: { response: { response: { neverError: true } } },
    },
  },
});

const marcarRecordatorio = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.6,
  output: [{ id: '00000000-0000-0000-0000-000000000001', reminder_sent_at: '2026-08-19T16:00:00.000Z' }],
  config: {
    name: 'Marcar recordatorio enviado',
    credentials: { postgres: newCredential('Supabase - Jalector') },
    onError: 'continueRegularOutput',
    parameters: {
      operation: 'executeQuery',
      query:
        'update public.vacancy_candidate_pipeline\nset reminder_sent_at = now(), last_activity_at = now(), updated_at = now()\nwhere id = $1::uuid\nreturning id, reminder_sent_at;',
      options: {
        queryReplacement: expr("{{ [ $('Armar recordatorio').item.json.pipeline_id ] }}"),
      },
    },
  },
});

export default workflow('wa-jalector-citas-flujo-2', 'WA - Jalector Citas (Flujo 2)')
  .add(notes)
  .add(webhookCita)
  .to(verificarAuth)
  .to(
    usarTexto
      .onTrue(enviarTextoCita.to(marcarEnviada))
      .onFalse(enviarPlantillaCita.to(marcarEnviada)),
  )
  .add(cronRecordatorio)
  .to(buscarRecordatorios)
  .to(armarRecordatorio)
  .to(
    usarTextoRecordatorio
      .onTrue(enviarTextoRecordatorio.to(marcarRecordatorio))
      .onFalse(enviarPlantillaRecordatorio.to(marcarRecordatorio)),
  );
