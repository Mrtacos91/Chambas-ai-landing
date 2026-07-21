import json

p = r"C:\Users\tacos\.cursor\projects\c-Users-tacos-OneDrive-Documentos-GitHub-Chambas-ai-landing-chambas-ai-landing\agent-tools\3e5fcdcb-ae75-4182-9978-0c028b126619.txt"
with open(p, encoding="utf-8") as f:
    d = json.load(f)

wf = d.get("workflow", d)
nodes = wf.get("nodes", [])
print("nodes", len(nodes))

for n in nodes:
    name = n.get("name")
    if name not in ("Guardar candidato", "Cerebro Jalector", "Buscar vacantes compatibles"):
        continue
    params = n.get("parameters", {})
    if name == "Guardar candidato":
        qr = params.get("options", {}).get("queryReplacement", "")
        print("Guardar QR prefix:", repr(qr[:150]))
        print("is_array:", qr.strip().startswith("={{ [") or qr.strip().startswith("={{["))
    if name == "Cerebro Jalector":
        code = params.get("jsCode", "")
        checks = {
            "optionNumber": "optionNumber" in code,
            "salary_no_comma": "Menos de $10000" in code,
            "docs_ok": "Si completa" in code,
            "no_salary_comma": "Menos de $10,000" not in code,
            "no_docs_comma": "Sí, completa" not in code and "Si, completa" not in code,
            "menu_merge": "puesto_buscado: (data && data.puesto_buscado) || profileData.puesto_buscado" in code,
        }
        for k, v in checks.items():
            print(k, v)
    if name == "Buscar vacantes compatibles":
        q = params.get("query", "")
        print("has_cualquiera:", "cualquiera" in q.lower())
        print("has_unaccent:", "unaccent" in q.lower())
        qr = params.get("options", {}).get("queryReplacement", "")
        print("Buscar QR:", repr(qr[:200]))
