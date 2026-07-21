import json
from pathlib import Path

root = Path(r"c:\Users\tacos\OneDrive\Documentos\GitHub\Chambas-ai-landing\chambas-ai-landing\tmp")
agent = Path(
    r"C:\Users\tacos\.cursor\projects\c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing\agent-tools\841037cf-5739-4424-8809-8fb41a7f9fbb.txt"
)
d = json.loads(agent.read_text(encoding="utf-8"))
nodes = {n["name"]: n for n in d["workflow"]["nodes"]}
c = nodes["Cerebro Jalector"]["parameters"]["jsCode"]
(root / "cerebro.js").write_text(c, encoding="utf-8")
q = nodes["Buscar vacantes compatibles"]["parameters"]["query"]
(root / "sql.txt").write_text(q, encoding="utf-8")

lines = c.splitlines()
out = []
for i, line in enumerate(lines):
    if any(
        k in line
        for k in [
            "function parseSalario",
            "function parseDocumentacion",
            "function isYes",
            "menu_candidato_existente",
            "shouldSearchVacancies",
            "esperando_expectativa",
            "esperando_documentacion",
            "case '1'",
        ]
    ):
        start = max(0, i - 1)
        end = min(len(lines), i + 12)
        out.append(f"--- around {i+1} ---")
        out.extend(f"{j+1}:{lines[j]}" for j in range(start, end))
(root / "keys.txt").write_text("\n".join(out), encoding="utf-8")

# IF conditions
for name, node in nodes.items():
    if "Buscar vacantes" in name:
        (root / f"if-{name.replace('?','').replace('¿','')}.json").write_text(
            json.dumps(node.get("parameters", {}), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

print("ok")
print("cualquiera in sql", "cualquiera" in q)
print("JOB titles count", c.count("'Ayudante general'"))
