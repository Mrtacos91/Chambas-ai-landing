const fs = require("fs");
const j = JSON.parse(
  fs.readFileSync(
    "C:/Users/tacos/.cursor/projects/c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing/agent-tools/e1710345-4b9e-44c4-b2ef-c868b716735e.txt",
    "utf8",
  ),
);
const names = ["Leer memoria candidato", "Cerebro Jalector", "Guardar sesión"];
for (const n of j.workflow.nodes) {
  if (names.includes(n.name) || n.name.includes("memoria") || n.name.includes("Cerebro")) {
    console.log("---", n.name, n.type);
    console.log(JSON.stringify({ credentials: n.credentials, query: n.parameters?.query, options: n.parameters?.options }, null, 2).slice(0, 1200));
  }
}
console.log("FROM memoria", JSON.stringify(j.workflow.connections["Leer memoria candidato"]));
console.log("FROM cerebro", JSON.stringify(j.workflow.connections["Cerebro Jalector"]));
console.log("FROM guardar", JSON.stringify(j.workflow.connections["Guardar sesión"]));
