export const REMOTE_LOCATION = "Remoto";
export const CITY_OTHER = "Otra ciudad";

export type MexicoState = {
  name: string;
  cities: readonly string[];
  aliases: readonly string[];
};

const clean = (value: string): string =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const buildState = (
  name: string,
  cities: readonly string[],
  aliases: readonly string[] = [],
): MexicoState => {
  const cleanedName = clean(name);
  const uniqueCities = cities
    .map((city) => city.trim())
    .filter((city) => city.length > 0 && clean(city) !== cleanedName)
    .filter((city, index, list) => list.findIndex((item) => clean(item) === clean(city)) === index);

  return {
    name,
    cities: uniqueCities,
    aliases: [cleanedName, ...aliases.map(clean)].filter(
      (alias, index, list) => alias && list.indexOf(alias) === index,
    ),
  };
};

export const MEXICO_STATES: readonly MexicoState[] = [
  buildState("Aguascalientes", ["Aguascalientes"]),
  buildState("Baja California", ["Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate"], [
    "bc",
    "bcn",
  ]),
  buildState(
    "Baja California Sur",
    ["La Paz", "Los Cabos", "Cabo San Lucas", "San Jose del Cabo"],
    ["bcs"],
  ),
  buildState("Campeche", ["Campeche", "Ciudad del Carmen"], ["camp"]),
  buildState("Chiapas", ["Tuxtla", "Tapachula", "San Cristobal"], ["chis"]),
  buildState(
    "Chihuahua",
    ["Chihuahua", "Ciudad Juarez", "Cd. Juarez", "Delicias", "Parral"],
    ["chih"],
  ),
  buildState(
    "Ciudad de México",
    [
      "Polanco",
      "Coyoacan",
      "Iztapalapa",
      "Gustavo A. Madero",
      "Alvaro Obregon",
      "Benito Juarez",
      "Azcapotzalco",
      "Tlalpan",
      "Xochimilco",
      "Venustiano Carranza",
      "Miguel Hidalgo",
      "Iztacalco",
      "Magdalena Contreras",
      "Milpa Alta",
      "Tlahuac",
      "Cuajimalpa",
      "Condesa",
      "Santa Fe",
      "Centro Historico",
      "Roma Norte",
      "Roma Sur",
    ],
    ["cdmx", "df", "distrito federal"],
  ),
  buildState(
    "Coahuila",
    ["Saltillo", "Torreon", "Monclova", "Piedras Negras", "Ramos Arizpe"],
    ["coah"],
  ),
  buildState("Colima", ["Colima", "Manzanillo", "Tecoman"], ["col"]),
  buildState("Durango", ["Durango", "Gomez Palacio", "Lerdo"], ["dgo"]),
  buildState(
    "Estado de México",
    [
      "Toluca",
      "Ecatepec",
      "Naucalpan",
      "Tlalnepantla",
      "Nezahualcoyotl",
      "Chalco",
      "Cuautitlan",
      "Cuautitlan Izcalli",
      "Atizapan",
      "Tultitlan",
      "Coacalco",
      "Huixquilucan",
      "Metepec",
      "Texcoco",
      "Zumpango",
      "Ixtapaluca",
      "Chimalhuacan",
      "Valle de Chalco",
      "Nicolas Romero",
      "Tecamac",
      "Lerma",
      "San Martin Obispo",
      "Lecheria",
    ],
    ["edomex", "edo mex", "edo. mex", "edo de mexico", "mex"],
  ),
  buildState("Guanajuato", ["Leon", "Irapuato", "Celaya", "Salamanca", "Silao"], ["gto"]),
  buildState("Guerrero", ["Acapulco", "Chilpancingo", "Zihuatanejo"], ["gro"]),
  buildState("Hidalgo", ["Pachuca", "Tulancingo", "Tizayuca"], ["hgo"]),
  buildState(
    "Jalisco",
    ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonala", "Tlajomulco", "Puerto Vallarta"],
    ["jal"],
  ),
  buildState("Michoacán", ["Morelia", "Uruapan", "Zamora", "Lazaro Cardenas"], ["mich"]),
  buildState("Morelos", ["Cuernavaca", "Jiutepec", "Cuautla"], ["mor"]),
  buildState("Nayarit", ["Tepic", "Bahia de Banderas"], ["nay"]),
  buildState(
    "Nuevo León",
    [
      "Monterrey",
      "Apodaca",
      "San Nicolas",
      "Santa Catarina",
      "Escobedo",
      "San Pedro Garza",
      "Garza Garcia",
      "Salinas Victoria",
      "Cienega de Flores",
      "Pesqueria",
      "Guadalupe",
    ],
    ["nl", "n.l.", "n l"],
  ),
  buildState("Oaxaca", ["Oaxaca", "Salina Cruz", "Tuxtepec", "Juchitan"], ["oax"]),
  buildState("Puebla", ["Puebla", "Tehuacan", "Cholula", "Atlixco"], ["pue"]),
  buildState("Querétaro", ["Queretaro", "El Marques", "Corregidora", "San Juan del Rio"], [
    "qro",
  ]),
  buildState(
    "Quintana Roo",
    ["Cancun", "Playa del Carmen", "Cozumel", "Tulum", "Chetumal"],
    ["qroo", "q roo"],
  ),
  buildState("San Luis Potosí", ["San Luis Potosi", "Soledad de Graciano"], ["slp"]),
  buildState("Sinaloa", ["Culiacan", "Mazatlan", "Los Mochis", "Guasave"], ["sin"]),
  buildState(
    "Sonora",
    ["Hermosillo", "Ciudad Obregon", "Nogales", "Guaymas", "Empalme"],
    ["son"],
  ),
  buildState("Tabasco", ["Villahermosa"], ["tab"]),
  buildState(
    "Tamaulipas",
    [
      "Reynosa",
      "Matamoros",
      "Nuevo Laredo",
      "Tampico",
      "Altamira",
      "Ciudad Madero",
      "Ciudad Victoria",
    ],
    ["tamps"],
  ),
  buildState("Tlaxcala", ["Tlaxcala", "Apizaco", "Huamantla"], ["tlax"]),
  buildState(
    "Veracruz",
    [
      "Veracruz",
      "Xalapa",
      "Coatzacoalcos",
      "Cordoba",
      "Orizaba",
      "Poza Rica",
      "Boca del Rio",
    ],
    ["ver"],
  ),
  buildState("Yucatán", ["Merida", "Valladolid", "Progreso"], ["yuc"]),
  buildState("Zacatecas", ["Zacatecas", "Fresnillo"], ["zac"]),
] as const;

export const MEXICO_STATE_NAMES = MEXICO_STATES.map((state) => state.name);

export const isMexicoState = (value: string): boolean =>
  MEXICO_STATES.some((state) => state.name === value.trim());

export const getCitiesForState = (stateName: string): readonly string[] => {
  const state = MEXICO_STATES.find((item) => item.name === stateName.trim());
  return state?.cities ?? [];
};

export type ComposeVacancyLocationInput = {
  state: string;
  city?: string;
  cityCustom?: string | null;
};

export const composeVacancyLocation = ({
  state,
  city,
  cityCustom,
}: ComposeVacancyLocationInput): string | null => {
  const selectedState = state.trim();
  if (!selectedState) return null;

  if (selectedState === REMOTE_LOCATION) return REMOTE_LOCATION;

  if (!isMexicoState(selectedState)) return null;

  const selectedCity = (city ?? "").trim();
  if (!selectedCity) return null;

  if (selectedCity === CITY_OTHER) {
    const custom = (cityCustom ?? "").trim().replace(/\s+/g, " ");
    if (!custom) return null;
    return `${custom}, ${selectedState}`;
  }

  const cities = getCitiesForState(selectedState);
  if (!cities.includes(selectedCity)) return null;

  return `${selectedCity}, ${selectedState}`;
};

export type ParsedVacancyLocation = {
  state: string;
  city: string;
  cityCustom: string;
  isRemote: boolean;
};

const emptyParsedLocation = (): ParsedVacancyLocation => ({
  state: "",
  city: "",
  cityCustom: "",
  isRemote: false,
});

const resolveStateFromText = (value: string): MexicoState | null => {
  const cleaned = clean(value);
  if (!cleaned) return null;

  const byName = MEXICO_STATES.find((state) => clean(state.name) === cleaned);
  if (byName) return byName;

  const byAlias = MEXICO_STATES.find((state) =>
    state.aliases.some((alias) => alias === cleaned),
  );
  if (byAlias) return byAlias;

  let best: MexicoState | null = null;
  let bestLength = 0;

  for (const state of MEXICO_STATES) {
    for (const alias of state.aliases) {
      if (alias.length <= bestLength) continue;
      if (!cleaned.includes(alias)) continue;
      best = state;
      bestLength = alias.length;
    }

    for (const city of state.cities) {
      const cleanedCity = clean(city);
      if (cleanedCity.length <= bestLength) continue;
      if (!cleaned.includes(cleanedCity)) continue;
      best = state;
      bestLength = cleanedCity.length;
    }
  }

  return best;
};

const resolveCityInState = (
  state: MexicoState,
  cityText: string,
): { city: string; cityCustom: string } => {
  const cleanedCity = clean(cityText);
  if (!cleanedCity) {
    return { city: "", cityCustom: "" };
  }

  const exact = state.cities.find((city) => clean(city) === cleanedCity);
  if (exact) {
    return { city: exact, cityCustom: "" };
  }

  const partial = state.cities.find(
    (city) => cleanedCity.includes(clean(city)) || clean(city).includes(cleanedCity),
  );
  if (partial) {
    return { city: partial, cityCustom: "" };
  }

  return {
    city: CITY_OTHER,
    cityCustom: cityText.trim().replace(/\s+/g, " "),
  };
};

export const parseVacancyLocation = (
  location: string | null | undefined,
): ParsedVacancyLocation => {
  const raw = (location ?? "").trim().replace(/\s+/g, " ");
  if (!raw) return emptyParsedLocation();

  const cleaned = clean(raw);
  if (
    cleaned === "remoto" ||
    cleaned.startsWith("remoto ") ||
    cleaned.startsWith("remoto/") ||
    cleaned.includes(" home office") ||
    cleaned.includes("homeoffice") ||
    cleaned.includes("teletrabajo") ||
    cleaned.includes("/ remoto") ||
    cleaned.includes(" remoto")
  ) {
    return {
      state: REMOTE_LOCATION,
      city: "",
      cityCustom: "",
      isRemote: true,
    };
  }

  const state = resolveStateFromText(raw);
  if (!state) {
    return {
      state: "",
      city: CITY_OTHER,
      cityCustom: raw,
      isRemote: false,
    };
  }

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  let cityText = "";

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1] ?? "";
    if (clean(lastPart).includes(clean(state.name)) || state.aliases.includes(clean(lastPart))) {
      cityText = parts.slice(0, -1).join(", ");
    } else {
      cityText = parts[0] ?? "";
    }
  } else {
    cityText = raw;
    const cleanedStateName = clean(state.name);
    if (clean(cityText) === cleanedStateName) {
      cityText = "";
    } else if (clean(cityText).includes(cleanedStateName)) {
      cityText = cityText
        .replace(new RegExp(state.name, "ig"), "")
        .replace(/,\s*$/, "")
        .trim();
    }
  }

  if (!cityText) {
    return {
      state: state.name,
      city: "",
      cityCustom: "",
      isRemote: false,
    };
  }

  const cityParts = resolveCityInState(state, cityText);
  return {
    state: state.name,
    city: cityParts.city,
    cityCustom: cityParts.cityCustom,
    isRemote: false,
  };
};

export const isCanonicalVacancyLocation = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed === REMOTE_LOCATION) return true;

  const match = trimmed.match(/^(.+), (.+)$/);
  if (!match) return false;

  const stateName = match[2] ?? "";
  return isMexicoState(stateName);
};
