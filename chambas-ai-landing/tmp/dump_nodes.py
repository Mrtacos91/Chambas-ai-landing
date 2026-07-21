import json

p = r"C:\Users\tacos\.cursor\projects\c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing\agent-tools\3e5fcdcb-ae75-4182-9978-0c028b126619.txt"
d = json.load(open(p, encoding="utf-8"))
nodes = {n["name"]: n for n in d["workflow"]["nodes"]}
out = {}
for name, n in nodes.items():
    if any(x in name.lower() for x in ["construir", "actualizar", "buscar vacantes", "guardar candidato"]):
        out[name] = n.get("parameters", {})
open(r"c:\Users\tacos\OneDrive\Documentos\GitHub\Chambas-ai-landing\chambas-ai-landing\tmp\nodes_dump.json", "w", encoding="utf-8").write(
    json.dumps(out, ensure_ascii=False, indent=2)
)
print("wrote", len(out), "nodes")
