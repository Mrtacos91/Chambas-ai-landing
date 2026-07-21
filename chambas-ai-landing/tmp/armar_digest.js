const cfg = $('Config digest').first().json;
const enableWhatsapp = cfg.enable_whatsapp === true || cfg.enable_whatsapp === 'true';
const panelUrl = cfg.panel_url || 'https://jalector.com/cliente?modulo=candidatos';
const maxCandidates = Number(cfg.max_candidates) || 5;
const row = $json;

let candidates = row.candidates;
if (typeof candidates === 'string') {
  try {
    candidates = JSON.parse(candidates);
  } catch (e) {
    candidates = [];
  }
}
if (!Array.isArray(candidates)) candidates = [];

const total = Number(row.candidates_count) || candidates.length;
const shown = candidates.slice(0, maxCandidates);
const companyName = row.company_name || 'Empresa';

function normalizePhone(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('521') && d.length >= 13) return d;
  if (d.startsWith('52') && d.length === 12) return '521' + d.slice(2);
  if (d.length === 10) return '521' + d;
  return d;
}

function cleanText(value) {
  return String(value || '')
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function encodeEmailText(value) {
  return escapeHtml(value)
    .replace(/á/g, '&aacute;')
    .replace(/é/g, '&eacute;')
    .replace(/í/g, '&iacute;')
    .replace(/ó/g, '&oacute;')
    .replace(/ú/g, '&uacute;')
    .replace(/ñ/g, '&ntilde;')
    .replace(/Á/g, '&Aacute;')
    .replace(/É/g, '&Eacute;')
    .replace(/Í/g, '&Iacute;')
    .replace(/Ó/g, '&Oacute;')
    .replace(/Ú/g, '&Uacute;')
    .replace(/Ñ/g, '&Ntilde;')
    .replace(/ü/g, '&uuml;')
    .replace(/Ü/g, '&Uuml;');
}

function formatPhoneDisplay(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length >= 10) {
    const local = d.slice(-10);
    return local.slice(0, 2) + ' ' + local.slice(2, 6) + ' ' + local.slice(6);
  }
  return cleanText(phone) || 'Sin telefono';
}

function sanitizeTemplateParam(value) {
  return cleanText(value)
    .replace(/[·•]/g, '-')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900);
}

const waBlocks = shown.map((c, i) => {
  const name = cleanText(c.candidate_name) || 'Candidato';
  const vac = cleanText(c.vacancy_title) || 'Vacante sin titulo';
  const phone = formatPhoneDisplay(c.candidate_phone);
  const ubicacion = cleanText(c.ubicacion);
  const salary = cleanText(c.expectativa);
  const parts = [
    i + 1 + ') ' + name,
    'Vacante: ' + vac,
    ubicacion ? 'Zona: ' + ubicacion : null,
    salary ? 'Salario: ' + salary : null,
    'Tel: ' + phone,
  ].filter(Boolean);
  return parts.join(' - ');
});

let digestSummary = waBlocks.join(' // ');
if (total > maxCandidates) {
  digestSummary +=
    ' // +' + (total - maxCandidates) + ' mas en tu panel Jalector';
}
if (!digestSummary) {
  digestSummary =
    'Sin detalle disponible. Abre el panel Jalector para revisar candidatos.';
}
digestSummary = sanitizeTemplateParam(digestSummary);

const toPhone = normalizePhone(row.contact_phone);
const toEmail = (row.contact_email || '').trim();

const candidateCardsHtml = shown
  .map((c) => {
    const name = encodeEmailText(cleanText(c.candidate_name) || 'Candidato');
    const vac = encodeEmailText(cleanText(c.vacancy_title) || 'Vacante sin titulo');
    const phone = encodeEmailText(formatPhoneDisplay(c.candidate_phone));
    const ubicacion = encodeEmailText(cleanText(c.ubicacion) || 'Zona por confirmar');
    const experiencia = encodeEmailText(
      cleanText(c.experiencia) || 'Experiencia por confirmar',
    );
    const turno = encodeEmailText(cleanText(c.turno) || 'Turno abierto');
    const salario = encodeEmailText(cleanText(c.expectativa) || 'Por confirmar');
    return (
      '<tr>' +
      '<td style="padding:0 0 14px 0;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border:1px solid #dbe3ee;border-radius:14px;background:#ffffff;">' +
      '<tr><td style="padding:18px 18px 16px 18px;font-family:Arial,Helvetica,sans-serif;">' +
      '<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#059669;">Candidato interesado</p>' +
      '<p style="margin:8px 0 0 0;font-size:18px;line-height:1.35;font-weight:700;color:#0f172a;">' +
      name +
      '</p>' +
      '<p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#0f172a;">' +
      '<span style="color:#64748b;">Vacante:</span> <strong style="font-weight:700;color:#0f172a;">' +
      vac +
      '</strong></p>' +
      '<p style="margin:12px 0 0 0;font-size:13px;line-height:1.65;color:#475569;">' +
      ubicacion +
      ' &middot; ' +
      experiencia +
      ' &middot; ' +
      turno +
      '<br />Expectativa: ' +
      salario +
      '<br />Tel: ' +
      phone +
      '</p>' +
      '</td></tr></table></td></tr>'
    );
  })
  .join('');

const moreHtml =
  total > maxCandidates
    ? '<tr><td style="padding:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#64748b;">+' +
      (total - maxCandidates) +
      ' candidatos m&aacute;s disponibles en tu panel.</td></tr>'
    : '';

const companyHtml = encodeEmailText(companyName);
const panelHref = escapeHtml(panelUrl);

const emailHtml =
  '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head>' +
  '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
  '<meta charset="UTF-8" />' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
  '<title>Resumen semanal de candidatos</title>' +
  '</head>' +
  '<body style="margin:0;padding:0;background:#f1f5f9;color:#0f172a;">' +
  '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' +
  'Jalector: ' +
  total +
  ' candidatos interesados esta semana.</div>' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f1f5f9;padding:24px 12px;">' +
  '<tr><td align="center">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dbe3ee;border-radius:18px;">' +
  '<tr><td style="padding:26px 28px 22px 28px;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">' +
  '<p style="margin:0;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6ee7b7;">Jalector</p>' +
  '<h1 style="margin:10px 0 0 0;font-size:26px;line-height:1.25;font-weight:700;color:#ffffff;">Resumen semanal de candidatos</h1>' +
  '<p style="margin:10px 0 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">Capta por WhatsApp. Decide desde tu panel.</p>' +
  '</td></tr>' +
  '<tr><td style="padding:24px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;">' +
  '<p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">Hola, equipo de <strong style="color:#0f172a;">' +
  companyHtml +
  '</strong>.</p>' +
  '<p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#64748b;">Esta semana el chatbot de Jalector capt&oacute; perfiles con inter&eacute;s declarado en tus vacantes.</p>' +
  '</td></tr>' +
  '<tr><td style="padding:12px 28px 20px 28px;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;">' +
  '<tr><td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;">' +
  '<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#047857;">Inter&eacute;s esta semana</p>' +
  '<p style="margin:8px 0 0 0;font-size:34px;line-height:1;font-weight:700;color:#0f172a;">' +
  total +
  '</p>' +
  '<p style="margin:8px 0 0 0;font-size:13px;line-height:1.5;color:#64748b;">Candidatos listos para revisar en tu CRM</p>' +
  '</td></tr></table>' +
  '</td></tr>' +
  '<tr><td style="padding:4px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;">' +
  '<p style="margin:0 0 12px 0;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#059669;">Destacados</p>' +
  '</td></tr>' +
  '<tr><td style="padding:0 28px 8px 28px;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">' +
  (candidateCardsHtml ||
    '<tr><td style="padding:12px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#64748b;">Sin detalle de candidatos en este env&iacute;o.</td></tr>') +
  moreHtml +
  '</table></td></tr>' +
  '<tr><td style="padding:18px 28px 28px 28px;text-align:center;font-family:Arial,Helvetica,sans-serif;">' +
  '<a href="' +
  panelHref +
  '" style="display:inline-block;background:#10b981;color:#041026;text-decoration:none;font-size:14px;line-height:1.4;font-weight:700;padding:14px 22px;border-radius:999px;">Abrir panel de candidatos</a>' +
  '<p style="margin:14px 0 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">Jalector &middot; Capta candidatos por WhatsApp &middot; Decide desde tu panel</p>' +
  '</td></tr>' +
  '</table>' +
  '</td></tr></table>' +
  '</body></html>';

const useWhatsapp = enableWhatsapp && !!toPhone;
const useEmail = !!toEmail;

return {
  company_id: row.company_id,
  company_name: sanitizeTemplateParam(companyName),
  candidates_count: String(total),
  digest_summary: digestSummary,
  to_phone: toPhone,
  to_email: toEmail,
  email_html: emailHtml,
  email_subject:
    'Jalector - ' + total + ' candidatos interesados - ' + companyName,
  use_whatsapp: useWhatsapp,
  use_email: useEmail,
  period_start: row.period_start,
  panel_url: panelUrl,
  wa_template: cfg.wa_template || 'jalector_digest_semanal',
  wa_lang: cfg.wa_lang || 'es',
};
