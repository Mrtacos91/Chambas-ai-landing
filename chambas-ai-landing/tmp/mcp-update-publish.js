const fs = require('fs');
const path = require('path');

const MCP_URL = 'https://bot.jalector.com/mcp-server/http';
const AUTH =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZGRmMGQ1MC0xODE1LTRlODItYThhMS1kMWUwYTdlNTdlYTUiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImJiYzdjMjdkLWQ3NDktNDg5OS1hYmM2LWMwYWMxMmQxMjU0OSIsImlhdCI6MTc4Mjc5NjExMX0._AJB538A3IzQbbrKLu07SOceOQE786PgPiV4j6oA4C0';
const WORKFLOW_ID = 'zphHtNEzhuCM2J6W';

const code = fs.readFileSync(path.join(__dirname, 'cerebro.js'), 'utf8');

function parseSseOrJson(text) {
  if (text.trim().startsWith('{')) {
    return JSON.parse(text);
  }
  const lines = text.split(/\r?\n/);
  let data = '';
  for (const line of lines) {
    if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  }
  if (!data) throw new Error('No SSE data: ' + text.slice(0, 500));
  return JSON.parse(data);
}

async function mcpCall(name, args, sessionId) {
  const headers = {
    Authorization: AUTH,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });

  const newSession = res.headers.get('mcp-session-id') || sessionId;
  const text = await res.text();
  let parsed;
  try {
    parsed = parseSseOrJson(text);
  } catch (e) {
    throw new Error('Parse fail (' + res.status + '): ' + text.slice(0, 800));
  }

  if (parsed.error) {
    throw new Error(name + ' error: ' + JSON.stringify(parsed.error));
  }

  return { parsed, sessionId: newSession };
}

function extractText(result) {
  const content = result?.result?.content;
  if (Array.isArray(content)) {
    return content.map((c) => (c && c.text) || JSON.stringify(c)).join('\n');
  }
  return JSON.stringify(result);
}

function walk(o, pred, acc = []) {
  if (!o || typeof o !== 'object') return acc;
  if (pred(o)) acc.push(o);
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object') walk(v, pred, acc);
  }
  return acc;
}

async function main() {
  console.log('jsCode chars:', code.length);

  // initialize session
  let sessionId;
  {
    const headers = {
      Authorization: AUTH,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'cerebro-updater', version: '1.0.0' },
        },
      }),
    });
    sessionId = res.headers.get('mcp-session-id');
    await res.text();
    console.log('session:', sessionId);
  }

  const update = await mcpCall(
    'update_workflow',
    {
      workflowId: WORKFLOW_ID,
      operations: [
        {
          type: 'setNodeParameter',
          nodeName: 'Cerebro Jalector',
          path: '/jsCode',
          value: code,
        },
      ],
    },
    sessionId
  );
  sessionId = update.sessionId || sessionId;
  console.log('UPDATE:', extractText(update.parsed).slice(0, 500));

  const publish = await mcpCall(
    'publish_workflow',
    { workflowId: WORKFLOW_ID },
    sessionId
  );
  sessionId = publish.sessionId || sessionId;
  const publishText = extractText(publish.parsed);
  console.log('PUBLISH:', publishText.slice(0, 800));
  fs.writeFileSync(path.join(__dirname, 'mcp-publish-result.json'), publishText, 'utf8');

  const details = await mcpCall(
    'get_workflow_details',
    { workflowId: WORKFLOW_ID },
    sessionId
  );
  const detailsText = extractText(details.parsed);
  fs.writeFileSync(path.join(__dirname, 'mcp-details-result.json'), detailsText, 'utf8');

  let data;
  try {
    data = JSON.parse(detailsText);
  } catch {
    data = { raw: detailsText };
  }

  const cerebroNodes = walk(data, (n) => n.name === 'Cerebro Jalector');
  const enviarNodes = walk(data, (n) => n.name === 'Enviar vacantes por whatsapp');
  const guardarNodes = walk(data, (n) => n.name === 'Guardar candidato');

  let cerebroCode = '';
  for (const n of cerebroNodes) {
    const c = n.parameters?.jsCode || n.parameters?.jsCode || '';
    if (typeof c === 'string' && c.length > cerebroCode.length) cerebroCode = c;
  }

  // also search stringified
  const fullStr = typeof data === 'string' ? data : JSON.stringify(data);
  if (!cerebroCode || cerebroCode.length < 1000) {
    const m = fullStr.match(/"jsCode"\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (m) {
      try {
        cerebroCode = JSON.parse('"' + m[1] + '"');
      } catch {
        cerebroCode = m[1];
      }
    }
  }

  let jsonBody = '';
  for (const n of enviarNodes) {
    const jb = n.parameters?.jsonBody || n.parameters?.body || '';
    if (typeof jb === 'string') jsonBody = jb;
    else if (jb) jsonBody = JSON.stringify(jb);
  }
  if (!jsonBody.includes('Construir mensaje de vacantes')) {
    if (fullStr.includes('Construir mensaje de vacantes')) {
      jsonBody = 'FOUND_IN_FULL_STR';
    }
  }

  let queryReplacement = '';
  for (const n of guardarNodes) {
    const qr =
      n.parameters?.options?.queryReplacement ||
      n.parameters?.queryReplacement ||
      '';
    if (typeof qr === 'string') queryReplacement = qr;
  }
  if (!queryReplacement.startsWith('={{ [')) {
    const idx = fullStr.indexOf('queryReplacement');
    if (idx >= 0) {
      const snip = fullStr.slice(idx, idx + 200);
      const m = snip.match(/queryReplacement"\s*:\s*"((?:\\.|[^"\\])*)"/);
      if (m) {
        try {
          queryReplacement = JSON.parse('"' + m[1] + '"');
        } catch {
          queryReplacement = m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }
    }
  }

  // activeVersionId
  let activeVersionId =
    data.activeVersionId ||
    data.workflow?.activeVersionId ||
    data.data?.activeVersionId ||
    null;
  if (!activeVersionId) {
    const m = fullStr.match(/"activeVersionId"\s*:\s*"([^"]+)"/);
    if (m) activeVersionId = m[1];
  }
  // also from publish
  const pubM = publishText.match(/"activeVersionId"\s*:\s*"([^"]+)"/);
  if (pubM) activeVersionId = pubM[1];
  const pubM2 = publishText.match(/"versionId"\s*:\s*"([^"]+)"/);
  if (!activeVersionId && pubM2) activeVersionId = pubM2[1];

  const checks = {
    corruptSalary: cerebroCode.includes('corruptSalary'),
    'Menos de $10000': cerebroCode.includes('Menos de $10000'),
    'Si completa': cerebroCode.includes('Si completa'),
    optionNumber: cerebroCode.includes('optionNumber'),
    enviarJsonBody_ConstruirMensaje: jsonBody.includes('Construir mensaje de vacantes') || jsonBody === 'FOUND_IN_FULL_STR',
    guardarQueryReplacement_startsWith: queryReplacement.startsWith('={{ ['),
  };

  const report = {
    cerebroCodeLength: cerebroCode.length,
    queryReplacementStart: queryReplacement.slice(0, 20),
    jsonBodyHasMarker: checks.enviarJsonBody_ConstruirMensaje,
    activeVersionId,
    checks: Object.fromEntries(
      Object.entries(checks).map(([k, v]) => [k, v ? 'PASS' : 'FAIL'])
    ),
  };

  console.log(JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(__dirname, 'mcp-verify-report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
