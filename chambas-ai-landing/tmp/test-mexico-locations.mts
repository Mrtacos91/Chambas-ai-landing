import assert from "node:assert/strict";
import {
  CITY_OTHER,
  REMOTE_LOCATION,
  composeVacancyLocation,
  getCitiesForState,
  isCanonicalVacancyLocation,
  parseVacancyLocation,
} from "../lib/vacancies/domain/mexico-locations.ts";
import { vacancyFormSchema } from "../lib/validators/vacancy.ts";

assert.equal(
  composeVacancyLocation({
    state: "Nuevo León",
    city: "Apodaca",
  }),
  "Apodaca, Nuevo León",
);

assert.equal(
  composeVacancyLocation({
    state: REMOTE_LOCATION,
  }),
  REMOTE_LOCATION,
);

assert.equal(
  composeVacancyLocation({
    state: "Nuevo León",
    city: CITY_OTHER,
    cityCustom: "San Pedro",
  }),
  "San Pedro, Nuevo León",
);

assert.equal(
  composeVacancyLocation({
    state: "Nuevo León",
    city: "",
  }),
  null,
);

assert.ok(getCitiesForState("Nuevo León").includes("Apodaca"));
assert.ok(getCitiesForState("Ciudad de México").includes("Polanco"));

const parsedNl = parseVacancyLocation("Salinas Victoria, Nuevo León");
assert.equal(parsedNl.state, "Nuevo León");
assert.equal(parsedNl.city, "Salinas Victoria");

const parsedLegacyTypo = parseVacancyLocation("Salinas Victorina, Nuevo León");
assert.equal(parsedLegacyTypo.state, "Nuevo León");
assert.equal(parsedLegacyTypo.city, CITY_OTHER);
assert.equal(parsedLegacyTypo.cityCustom, "Salinas Victorina");

const parsedPolanco = parseVacancyLocation("Polanco");
assert.equal(parsedPolanco.state, "Ciudad de México");
assert.equal(parsedPolanco.city, "Polanco");

const parsedRemote = parseVacancyLocation("Remoto / Estado de México / CDMX");
assert.equal(parsedRemote.state, REMOTE_LOCATION);
assert.equal(parsedRemote.isRemote, true);

const parsedCustom = parseVacancyLocation("Colonia Centro, Jalisco");
assert.equal(parsedCustom.state, "Jalisco");
assert.equal(parsedCustom.city, CITY_OTHER);
assert.equal(parsedCustom.cityCustom, "Colonia Centro");

assert.equal(isCanonicalVacancyLocation("Apodaca, Nuevo León"), true);
assert.equal(isCanonicalVacancyLocation("Remoto"), true);
assert.equal(isCanonicalVacancyLocation("Polanco, CDMX"), false);
assert.equal(isCanonicalVacancyLocation("texto libre"), false);

const valid = vacancyFormSchema.safeParse({
  title: "Cajero",
  location: "Apodaca, Nuevo León",
  salaryMin: "",
  salaryMax: "",
  active: true,
});
assert.equal(valid.success, true);

const invalid = vacancyFormSchema.safeParse({
  title: "Cajero",
  location: "Polanco, CDMX",
  salaryMin: "",
  salaryMax: "",
  active: true,
});
assert.equal(invalid.success, false);

const empty = vacancyFormSchema.safeParse({
  title: "Cajero",
  location: "",
  salaryMin: "",
  salaryMax: "",
  active: true,
});
assert.equal(empty.success, true);
assert.equal(empty.data?.location, null);


console.log("All mexico-locations and vacancy validator tests passed");
