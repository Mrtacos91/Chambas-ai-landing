const fs = require('fs');
const path = require('path');

const root = __dirname;
const cerebro = fs.readFileSync(path.join(root, 'cerebro.js'), 'utf8');
const msg = fs.readFileSync(path.join(root, 'mensaje-vacantes.js'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'buscar.sql'), 'utf8');

const queryReplacementVacantes =
  "={{ [\n" +
  "  $('Cerebro Jalector').item.json.data.puesto_buscado || '',\n" +
  "  $('Cerebro Jalector').item.json.data.turno_preferido || '',\n" +
  "  $('Cerebro Jalector').item.json.data.ubicacion || ''\n" +
  "] }}";

const queryReplacementSession =
  "={{ [\n" +
  "  JSON.stringify($('Construir mensaje de vacantes').item.json.vacancies),\n" +
  "  $('Construir mensaje de vacantes').item.json.telefono,\n" +
  "  $('Construir mensaje de vacantes').item.json.session_next_step || ''\n" +
  "] }}";

const ops = [
  {
    type: 'addNode',
    node: {
      name: '¿Registrar antes de buscar?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2.3,
      position: [1408, -240],
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '',
            typeValidation: 'strict',
            version: 3,
          },
          conditions: [
            {
              id: 'reg-before-search-1',
              leftValue: "={{ $('Cerebro Jalector').item.json.should_upsert_candidate }}",
              rightValue: '',
              operator: {
                type: 'boolean',
                operation: 'true',
                singleValue: true,
              },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
    },
  },
  {
    type: 'removeConnection',
    source: 'Buscar vacantes?',
    target: 'Guardar candidato',
    sourceIndex: 0,
  },
  {
    type: 'addConnection',
    source: 'Buscar vacantes?',
    target: '¿Registrar antes de buscar?',
    sourceIndex: 0,
  },
  {
    type: 'addConnection',
    source: '¿Registrar antes de buscar?',
    target: 'Guardar candidato',
    sourceIndex: 0,
  },
  {
    type: 'addConnection',
    source: '¿Registrar antes de buscar?',
    target: 'Buscar vacantes compatibles',
    sourceIndex: 1,
  },
  {
    type: 'updateNodeParameters',
    nodeName: 'Cerebro Jalector',
    replace: true,
    parameters: {
      jsCode: cerebro,
    },
  },
  {
    type: 'updateNodeParameters',
    nodeName: 'Construir mensaje de vacantes',
    replace: true,
    parameters: {
      jsCode: msg,
    },
  },
  {
    type: 'updateNodeParameters',
    nodeName: 'Buscar vacantes compatibles',
    parameters: {
      query: sql,
      options: {
        queryReplacement: queryReplacementVacantes,
      },
    },
  },
  {
    type: 'updateNodeParameters',
    nodeName: 'Actualizar sesión con last_vacancies',
    parameters: {
      query:
        "update public.candidate_sessions set data = data || jsonb_build_object('last_vacancies', $1::jsonb), current_step = coalesce(nullif($3, ''), current_step), updated_at = now() where telefono = $2;",
      options: {
        queryReplacement: queryReplacementSession,
      },
    },
  },
];

const payload = {
  workflowId: 'zphHtNEzhuCM2J6W',
  operations: ops,
};

fs.writeFileSync(path.join(root, 'n8n-update-ops.json'), JSON.stringify(payload));
console.log('Wrote tmp/n8n-update-ops.json');
console.log('ops', ops.length);
console.log('cerebro chars', cerebro.length);
console.log('msg chars', msg.length);
console.log('sql chars', sql.length);
console.log('file bytes', fs.statSync(path.join(root, 'n8n-update-ops.json')).size);
