import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { defaultFilters, filterQuery, invalidPrices, matchingVehicles, parseFilters, priceNumber } from "../src/lib/inventory.ts";

const content = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8")).content;
const find = (overrides = {}, source = content) => matchingVehicles(source, { ...defaultFilters, ...overrides });

test("all stock, multi-word search and empty results", () => {
  assert.equal(find().length, 8);
  assert.deepEqual(find({ q: "  PORSCHE turbo  " }), ["porsche-panamera"]);
  assert.deepEqual(find({ q: "not a vehicle" }), []);
});
test("brand, body, fuel, transmission and availability combine with AND", () => {
  assert.deepEqual(find({ brand: "tesla", fuel: "Electric", bodyType: "sedan", transmission: "Automatic" }), ["tesla-model-3"]);
  assert.deepEqual(find({ bodyType: "coupe", fuel: "Petrol", transmission: "Manual", minPrice: "40000", maxPrice: "45000" }), ["chevrolet-camaro"]);
  assert.deepEqual(find({ fuel: "Diesel" }), ["honda-crv"]);
  assert.deepEqual(find({ availability: "Reserved" }), ["ferrari-458"]);
  assert.equal(find({ availability: "Available" }).length, 7);
});
test("inclusive price boundaries, zero and invalid ranges", () => {
  assert.deepEqual(find({ minPrice: "19950", maxPrice: "19950" }), ["honda-crv"]);
  assert.deepEqual(find({ maxPrice: "0" }), []);
  assert(invalidPrices({ ...defaultFilters, minPrice: "80000", maxPrice: "20000" }));
  assert(invalidPrices({ ...defaultFilters, minPrice: "-1" }));
  assert(invalidPrices({ ...defaultFilters, minPrice: "Infinity" }));
  assert.deepEqual(find({ minPrice: "80000", maxPrice: "20000" }), []);
});
test("all sort modes use numeric values, not lexical ordering", () => {
  const asc = ["honda-crv", "tesla-model-3", "chevrolet-camaro", "audi-rs6", "bmw-m5", "porsche-panamera", "mercedes-amg", "ferrari-458"];
  assert.deepEqual(find({ sort: "price-low" }), asc);
  assert.deepEqual(find({ sort: "price-high" }), [...asc].reverse());
  assert.equal(find({ sort: "newest" })[0], "tesla-model-3");
  assert.equal(find({ sort: "oldest" })[0], "ferrari-458");
  assert.equal(find({ sort: "mileage" })[0], "ferrari-458");
});
test("live editable price/spec changes also affect filtering and sorting", () => {
  const edited = structuredClone(content);
  edited.cards.vehicles["bmw-m5"].price = "GBP 10,000";
  edited.cards.vehicles["bmw-m5"].fuel = "Electric";
  assert.deepEqual(find({ maxPrice: "15000", fuel: "Electric" }, edited), ["bmw-m5"]);
  assert.equal(find({ sort: "price-low" }, edited)[0], "bmw-m5");
  assert.equal(edited.catalog["bmw-m5"].priceValue, 49950);
});
test("unpriced vehicles sort last and stay out of numeric budgets", () => {
  const edited = structuredClone(content);
  edited.cards.vehicles["porsche-panamera"].price = "Price on application";
  assert.equal(find({ sort: "price-high" }, edited).at(-1), "porsche-panamera");
  assert(!find({ minPrice: "0" }, edited).includes("porsche-panamera"));
  assert.equal(priceNumber(""), null);
  assert.equal(priceNumber(false), null);
  assert.equal(priceNumber(0), 0);
  assert.equal(priceNumber("GBP 0"), 0);
});
test("URL state round-trips and ignores unknown sort values", () => {
  const filters = { ...defaultFilters, q: "V8 turbo", brand: "bmw", minPrice: "0", sort: "price-low" };
  assert.deepEqual(parseFilters(filterQuery(filters)), filters);
  assert.equal(filterQuery(defaultFilters), "");
  assert.equal(parseFilters("?sort=unknown").sort, "featured");
  assert.equal(parseFilters("?q=" + "x".repeat(300)).q.length, 200);
});
