import json
from pathlib import Path

agent = Path(
    r"C:\Users\tacos\.cursor\projects\c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing\agent-tools\841037cf-5739-4424-8809-8fb41a7f9fbb.txt"
)
d = json.loads(agent.read_text(encoding="utf-8"))
out = Path(r"c:\Users\tacos\OneDrive\Documentos\GitHub\Chambas-ai-landing\chambas-ai-landing\tmp")
for n in d["workflow"]["nodes"]:
    name = n.get("name", "")
    if "Guardar candidato" in name or "candidato" in name.lower():
        payload = {
            "name": name,
            "type": n.get("type"),
            "parameters": n.get("parameters", {}),
        }
        safe = "".join(ch if ch.isalnum() else "-" for ch in name)
        (out / f"node-{safe}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(name)

# IF buscar vacantes
for n in d["workflow"]["nodes"]:
    if n.get("name") in ("Buscar vacantes?", "¿Buscar vacantes compatibles?"):
        print("IF", n["name"], json.dumps(n.get("parameters"), ensure_ascii=False)[:500])

# connections
con = d["workflow"]["connections"]
for src in ["Cerebro Jalector", "Guardar sesión", "Buscar vacantes?", "Guardar candidato", "¿Buscar vacantes compatibles?"]:
    if src in con:
        print("CONN", src, "->", con[src])
