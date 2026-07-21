from pathlib import Path
import re

path = Path(__file__).with_name("cerebro.js")
code = path.read_text(encoding="utf-8")

# --- parsers ---
old_parsers = """function parseExperiencia(text) {
  if (text.includes('1') || text.includes('menos')) return 'Menos de 1 año';
  if (text.includes('2') || text.includes('1 a 2')) return '1 a 2 años';
  if (text.includes('3') || text.includes('3 a 5')) return '3 a 5 años';
  if (text.includes('4') || text.includes('mas')) return 'Más de 5 años';
  return null;
}

function parseDisponibilidad(text) {
  if (text.includes('1') || text.includes('inmediatamente')) return 'Inmediatamente';
  if (text.includes('2') || text.includes('esta semana')) return 'Esta semana';
  if (text.includes('3') || text.includes('15')) return 'En 15 días';
  if (text.includes('4') || text.includes('mes')) return 'En un mes';
  return null;
}

function parseTurno(text) {
  if (text.includes('matutino') || text.includes('manana')) return 'Matutino';
  if (text.includes('vespertino') || text.includes('tarde')) return 'Vespertino';
  if (text.includes('nocturno') || text.includes('noche')) return 'Nocturno';
  if (text.includes('cualquiera')) return 'Cualquiera';
  return null;
}

function parseSalario(text) {
  if (text.includes('1') || text.includes('menos')) return 'Menos de $10,000';
  if (text.includes('2') || text.includes('10000') || text.includes('10,000')) return '$10,000 a $15,000';
  if (text.includes('3') || text.includes('15000') || text.includes('15,000')) return '$15,000 a $20,000';
  if (text.includes('4') || text.includes('20000') || text.includes('mas')) return 'Más de $20,000';
  return null;
}

function parseDocumentacion(text) {
  if (text.includes('si') || text.includes('completa')) return 'Sí, completa';
  if (text.includes('faltan') || text.includes('algunos')) return 'Me faltan algunos documentos';
  if (text.includes('no')) return 'No la tengo completa';
  return null;
}"""

new_parsers = """function optionNumber(text) {
  const raw = String(text || '').trim();
  const cleaned = clean(raw);
  const match = cleaned.match(/^([1-4])(?![0-9])/);
  if (match) return Number(match[1]);
  return null;
}

function parseExperiencia(text) {
  const n = optionNumber(text);
  if (n === 1 || text.includes('menos')) return 'Menos de 1 año';
  if (n === 2 || text.includes('1 a 2')) return '1 a 2 años';
  if (n === 3 || text.includes('3 a 5')) return '3 a 5 años';
  if (n === 4 || text.includes('mas')) return 'Más de 5 años';
  return null;
}

function parseDisponibilidad(text) {
  const n = optionNumber(text);
  if (n === 1 || text.includes('inmediatamente')) return 'Inmediatamente';
  if (n === 2 || text.includes('esta semana')) return 'Esta semana';
  if (n === 3 || text.includes('15')) return 'En 15 días';
  if (n === 4 || text.includes('mes')) return 'En un mes';
  return null;
}

function parseTurno(text) {
  const n = optionNumber(text);
  if (n === 1 || text.includes('matutino') || text.includes('manana')) return 'Matutino';
  if (n === 2 || text.includes('vespertino') || text.includes('tarde')) return 'Vespertino';
  if (n === 3 || text.includes('nocturno') || text.includes('noche')) return 'Nocturno';
  if (n === 4 || text.includes('cualquiera')) return 'Cualquiera';
  if (text.includes('matutino') || text.includes('manana')) return 'Matutino';
  if (text.includes('vespertino') || text.includes('tarde')) return 'Vespertino';
  if (text.includes('nocturno') || text.includes('noche')) return 'Nocturno';
  if (text.includes('cualquiera')) return 'Cualquiera';
  return null;
}

function parseSalario(text) {
  const n = optionNumber(text);
  if (n === 1 || text.includes('menos')) return 'Menos de $10000';
  if (n === 2 || text.includes('10000') || text.includes('10,000') || text.includes('10.000')) return '$10000 a $15000';
  if (n === 3 || text.includes('15000') || text.includes('15,000') || text.includes('15.000')) return '$15000 a $20000';
  if (n === 4 || text.includes('20000') || text.includes('20,000') || text.includes('20.000') || text.includes('mas')) return 'Más de $20000';
  return null;
}

function parseDocumentacion(text) {
  if (text.includes('faltan') || text.includes('algunos')) return 'Me faltan algunos documentos';
  if (text.includes('completa') || text.includes('si')) return 'Si completa';
  if (text.includes('no')) return 'No la tengo completa';
  return null;
}"""

if old_parsers not in code:
    raise SystemExit("parsers block not found")
code = code.replace(old_parsers, new_parsers, 1)

# salary labels in prompts
code = code.replace("Menos de $10,000", "Menos de $10000")
code = code.replace("$10,000 a $15,000", "$10000 a $15000")
code = code.replace("$15,000 a $20,000", "$15000 a $20000")
code = code.replace("Más de $20,000", "Más de $20000")
code = code.replace("Sí, completa", "Si completa")
code = code.replace("✅ Sí, completa", "✅ Si completa")

# menu data merge - ensure profile fields used for matching
old_menu = """  case 'menu_candidato_existente':
    data = Object.keys(data || {}).length
      ? data
      : profileToData(candidateProfile);

    if (
      normalized === '1' ||
      normalized.includes('vacante') ||
      normalized.includes('trabajo') ||
      normalized.includes('empleo')
    ) {
      shouldUpsertCandidate = true;
      shouldSearchVacancies = true;
      candidateStatus = 'registered';"""

new_menu = """  case 'menu_candidato_existente': {
    const profileData = profileToData(candidateProfile);
    data = {
      ...profileData,
      ...(data || {}),
      nombre_completo: (data && data.nombre_completo) || profileData.nombre_completo,
      ubicacion: (data && data.ubicacion) || profileData.ubicacion,
      puesto_buscado: (data && data.puesto_buscado) || profileData.puesto_buscado,
      turno_preferido: (data && data.turno_preferido) || profileData.turno_preferido,
      experiencia: (data && data.experiencia) || profileData.experiencia,
      expectativa_salarial: (data && data.expectativa_salarial) || profileData.expectativa_salarial,
      documentacion: (data && data.documentacion) || profileData.documentacion,
      last_vacancies: (data && data.last_vacancies) || [],
    };

    if (
      normalized === '1' ||
      normalized.includes('vacante') ||
      normalized.includes('trabajo') ||
      normalized.includes('empleo')
    ) {
      shouldUpsertCandidate = true;
      shouldSearchVacancies = true;
      candidateStatus = 'registered';"""

if old_menu not in code:
    raise SystemExit("menu block not found")
code = code.replace(old_menu, new_menu, 1)

# close the menu case - find break before esperando_inicio and ensure brace
# The menu case previously ended without extra brace. Find the end of menu case.
marker = """    reply = buildExistingProfileMenu(data);
    nextStep = 'menu_candidato_existente';
    break;

  case 'esperando_inicio':"""

replacement = """    reply = buildExistingProfileMenu(data);
    nextStep = 'menu_candidato_existente';
    break;
  }

  case 'esperando_inicio':"""

if marker not in code:
    raise SystemExit("menu end marker not found")
code = code.replace(marker, replacement, 1)

# Also merge profile when confirming search from confirmacion - data should already be full

# Fix isYes: '1' alone is dangerous in menu context but menu checks normalized === '1' first.
# Keep isYes but remove text === '1' to avoid false positives in other steps? 
# Actually for confirmacion "SI" works. For salary step user sends 1 - isYes isn't used there.
# Menu uses normalized === '1' before other checks. OK leave isYes.

path.write_text(code, encoding="utf-8", newline="\n")
print("ok", len(code))
print("Menos de $10000" in code, "Si completa" in code, "optionNumber" in code)
print("comma salary left", "$10,000" in code)
print("Sí, completa left", "Sí, completa" in code)
