# Plantilla Meta WhatsApp — jalector_digest_semanal

## Estado
**APPROVED** en Meta. Workflow `WA - Digest semanal empresas` con `enable_whatsapp = true`.

## Datos de la plantilla

| Campo | Valor |
|---|---|
| Nombre | `jalector_digest_semanal` |
| Idioma | `es` (no `es_MX`; Meta devolvió 132001 si se usa es_MX) |
| Body vars | `{{1}}` empresa, `{{2}}` conteo, `{{3}}` resumen |

## Activación en n8n

1. Workflow: `WA - Digest semanal empresas` (`LW9YXlA758ca3PiU`)
2. Nodo `Config digest`: `enable_whatsapp` = `true`
3. Plantilla HTTP: `jalector_digest_semanal` / idioma `es`

## Cómo probar

### Requisitos
- Empresa `active = true`
- `companies.contact_phone` con 10 dígitos MX (ej. `5519018376`) → el flujo lo normaliza a `521...`
- Al menos 1 fila en `candidate_selected_vacancies` de esa empresa en los últimos 7 días
- Que no exista ya un log de digest para la semana actual en `company_digest_logs` (mismo `company_id` + `period_start`)

### Pasos
1. Abre [WA - Digest semanal empresas](https://bot.jalector.com/workflow/LW9YXlA758ca3PiU)
2. Click **Probar manual** (manual trigger) → Execute workflow
3. Revisa la ejecución:
   - `Armar digest` → `use_whatsapp: true`, `to_phone` con `521...`
   - `WhatsApp template digest` → HTTP 200 de Graph API
   - `Log envio WhatsApp` → insert en `company_digest_logs`
4. Confirma el mensaje en el WhatsApp del `contact_phone` de la empresa

### Si no envía
- Sin intereses 7d → el SQL no devuelve filas
- Ya hay log de esa semana → borrar el log de prueba:
  `delete from company_digest_logs where company_id = '<uuid>' and period_start = (date_trunc('week', timezone('America/Mexico_City', now())))::date;`
- Sin `contact_phone` → cae a email si hay `contact_email`
- Error Graph 132001 → el idioma no coincide. En WhatsApp Manager abre la plantilla y copia el **Language code** exacto (`es`, `es_MX`, etc.) a `wa_lang` en Config digest.

### Producción
Corre solo los **lunes 09:00** (`America/Mexico_City`).

Si la empresa tiene `contact_phone` y `contact_email`, recibe **WhatsApp y email** en paralelo.

### Contenido
- WhatsApp (`{{3}}`): una sola linea por Meta (sin saltos). Formato: `1) Nombre - Vacante: X - Zona: Y - Tel: Z // 2) ...`
- Email: HTML con entidades UTF-8 (`&oacute;`, `&eacute;`), tipografia Arial, vacante etiquetada en cada card, contador de interes y CTA al panel.
