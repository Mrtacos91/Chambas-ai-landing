const fs = require('fs');
const path = require('path');

const WORKFLOW_ID = 'zphHtNEzhuCM2J6W';
const MARKERS = [
  'puesto_parece_pregunta',
  'experiencia_invalida',
  'registerInvalid',
  'No tengo vacantes cargadas',
];

function parseSseOrJson(text) {
  if (text.trim().startsWith('{')) {
    return JSON.parse(text);
  }
  const lines = text.split(/\r?\n/);
  let data = '';
  for (const line of lines) {
    if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!data) throw new Error('No SSE data: ' + text.slice(0, 500));
  return JSON.parse(data);
}

function extractText(result) {
  const content = result?.result?.content;
  if (Array.isArray(content)) {
    return content.map((c) => (c && c.text) || JSON.stringify(c)).join('\n');
  }
  return JSON.stringify(result);
}

async function main() {
  const mcpConfig = JSON.parse(
    fs.readFileSync('C:/Users/tacos/.cursor/mcp.json', 'utf8')
  );
  const server = mcpConfig.mcpServers['n8n-mcp'] || mcpConfig.mcpServers['user-n8n-mcp'];
  if (!server || !server.url) {
    throw new Error('n8n-mcp server config missing');
  }

  const code = fs.readFileSync(path.join(__dirname, 'cerebro.js'), 'utf8');

  async function mcpCall(name, args) {
    const res = await fetch(server.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        ...(server.headers || {}),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    });
    const text = await res.text();
    const parsed = parseSseOrJson(text);
    if (parsed.error) {
      throw new Error(name + ' error: ' + JSON.stringify(parsed.error));
    }
    return { status: res.status, text: extractText(parsed), parsed };
  }

  const update = await mcpCall('update_workflow', {
    workflowId: WORKFLOW_ID,
    operations: [
      {
        type: 'setNodeParameter',
        nodeName: 'Cerebro Jalector',
        path: '/jsCode',
        value: code,
      },
    ],
  });

  const publish = await mcpCall('publish_workflow', {
    workflowId: WORKFLOW_ID,
  });

  const details = await mcpCall('get_workflow_details', {
    workflowId: WORKFLOW_ID,
  });

  let detailsObj;
  try {
    detailsObj = JSON.parse(details.text);
  } catch {
    detailsObj = details.parsed;
  }

  const workflow = detailsObj.workflow || detailsObj;
  const node = (workflow.nodes || []).find((n) => n.name === 'Cerebro Jalector');
  const jsCode = (node && node.parameters && node.parameters.jsCode) || '';

  const report = {
    updateStatus: update.status,
    publishStatus: publish.status,
    updatePreview: update.text.slice(0, 500),
    publishPreview: publish.text.slice(0, 500),
    activeVersionId: workflow.activeVersionId || null,
    versionId: workflow.versionId || null,
    jsCodeLen: jsCode.length,
    localLen: code.length,
    identical: jsCode === code,
    markers: Object.fromEntries(MARKERS.map((k) => [k, jsCode.includes(k)])),
    success:
      jsCode === code &&
      MARKERS.every((k) => jsCode.includes(k)) &&
      Boolean(workflow.activeVersionId),
  };

  fs.writeFileSync(
    path.join(__dirname, 'cerebro-restore-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('ERROR', err.message);
  process.exit(1);
});
