const fs = require('fs');
const path = require('path');

async function main() {
  const mcpConfig = JSON.parse(
    fs.readFileSync('C:/Users/tacos/.cursor/mcp.json', 'utf8')
  );
  const server = mcpConfig.mcpServers['n8n-mcp'];
  if (!server || !server.url) {
    throw new Error('n8n-mcp server config missing');
  }

  const payload = JSON.parse(
    fs.readFileSync(
      path.join(
        'c:/Users/tacos/OneDrive/Documentos/GitHub/Chambas-ai-landing/chambas-ai-landing/tmp/n8n-cerebro-op.json'
      ),
      'utf8'
    )
  );

  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'update_workflow',
      arguments: payload,
    },
  };

  const res = await fetch(server.url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...(server.headers || {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log('status', res.status);
  console.log(text.slice(0, 4000));
}

main().catch((err) => {
  console.error('ERROR', err.message);
  process.exit(1);
});
