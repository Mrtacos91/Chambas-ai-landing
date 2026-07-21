# Plantilla Meta WhatsApp — jalector_digest_semanal

## Estado
Pendiente de crear y aprobar en Meta Business Manager / WhatsApp Manager.
Hasta que esté APPROVED, el workflow `WA - Digest semanal empresas` usa **solo email** (`enable_whatsapp = false`).

## Datos sugeridos para crear la plantilla

| Campo | Valor |
|---|---|
| Nombre | `jalector_digest_semanal` |
| Idioma | `es_MX` |
| Categoría | Utility (preferible) o Marketing |
| Header | ninguno o texto fijo `Jalector` |
| Body | ver abajo |
| Footer | `Panel: jalector.com/cliente` |
| Buttons | URL opcional a `https://jalector.com/cliente?modulo=candidatos` |

## Body (3 variables)

```
Hola {{1}}, este es tu resumen semanal de Jalector.

Candidatos interesados esta semana: {{2}}

{{3}}

Entra al panel para ver el detalle completo.
```

Variables en el envío Graph API:
1. `company_name`
2. `candidates_count` (número como string)
3. `digest_summary` (hasta ~900 caracteres; máx. 5 candidatos)

## Ejemplo de payload Graph API

```json
{
  "messaging_product": "whatsapp",
  "to": "52155XXXXXXXX",
  "type": "template",
  "template": {
    "name": "jalector_digest_semanal",
    "language": { "code": "es_MX" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Max" },
          { "type": "text", "text": "3" },
          { "type": "text", "text": "1) Ana López — Cajera — Tel 52155...\\n2) ..." }
        ]
      }
    ]
  }
}
```

## Activación en n8n

Cuando Meta apruebe la plantilla:
1. Abrir workflow `WA - Digest semanal empresas`
2. En el nodo `Config digest`, poner `enable_whatsapp` = `true`
3. Confirmar que el nombre de plantilla en el HTTP Request coincide
