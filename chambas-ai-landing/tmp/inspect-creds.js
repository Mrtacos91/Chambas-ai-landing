const fs = require("fs");
const j = JSON.parse(
  fs.readFileSync(
    "C:/Users/tacos/.cursor/projects/c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing/agent-tools/e1710345-4b9e-44c4-b2ef-c868b716735e.txt",
    "utf8",
  ),
);
const pg = j.workflow.nodes.find((n) => n.name === "Leer memoria candidato");
const http = j.workflow.nodes.find((n) => n.name === "Enviar whattsapp");
console.log("pg creds", JSON.stringify(pg.credentials));
console.log("http", JSON.stringify({ creds: http?.credentials, auth: http?.parameters?.authentication, generic: http?.parameters?.genericAuthType, url: http?.parameters?.url, never: http?.parameters?.options }));
