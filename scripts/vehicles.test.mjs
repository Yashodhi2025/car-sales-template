import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Resolve Next's extensionless import for Node without changing application code.
const source = fs.readFileSync("src/lib/vehicles.ts", "utf8").replace('"./inventory"', JSON.stringify(pathToFileURL(path.resolve("src/lib/inventory.ts")).href));
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { carHref, carPageKey, relatedVehicles, vehiclePhotos, vehicleYear } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
const content = data.content;
const ids = Object.keys(content.cards.vehicles);
test("eight stable routes are selected and source-backed", () => {
  assert.equal(ids.length, 8);
  for (const id of ids) {
    assert.equal(content.vehicles[id].detailLink, carHref(id));
    assert(data.requirements.requiredPages.includes(carPageKey(id)));
    assert.match(vehicleYear(content.cards.vehicles[id].meta), /^20\d{2}$/);
  }
});
test("each gallery has distinct local images, editable captions and paths", () => {
  for (const id of ids) {
    const photos = vehiclePhotos(content, id);
    assert(photos.length >= 2);
    assert.equal(new Set(photos.map(photo => photo.image)).size, photos.length);
    for (const photo of photos) {
      assert(fs.existsSync(`public${photo.image}`));
      assert(photo.imagePath.startsWith(`photos.vehicles.${id}.`));
      assert(photo.captionPath.startsWith(`photos.vehicles.${id}.`));
      assert(photo.caption);
    }
  }
});
test("empty gallery entries remain mounted data instead of being filtered out", () => {
  const edited = structuredClone(content);
  edited.photos.vehicles[ids[0]].gallery[0] = { image: "", imageAlt: "", caption: "" };
  assert.equal(vehiclePhotos(edited, ids[0]).length, 2);
  assert.equal(vehiclePhotos(edited, ids[0])[1].image, "");
});
test("engine and drivetrain values come from supplied listing data; power is unconfirmed", () => {
  for (const id of ids) {
    const vehicle = content.vehicles[id];
    assert(content.cards.vehicles[id].details.includes(vehicle.engine));
    assert.equal(vehicle.power, "");
    if (vehicle.drivetrain) assert(content.cards.vehicles[id].details.includes(vehicle.drivetrain));
    assert(vehicle.features.length > 0);
  }
});
test("related vehicles exclude self and duplicates and prefer the same body style", () => {
  for (const id of ids) {
    const related = relatedVehicles(content, id);
    assert.equal(related.length, 3);
    assert(!related.includes(id));
    assert.equal(new Set(related).size, related.length);
    related.forEach(other => assert(ids.includes(other)));
  }
  assert.equal(content.catalog[relatedVehicles(content, "porsche-panamera")[0]].bodyType, "sedan");
});
test("viewing actions prepare an honest vehicle-specific request", () => {
  for (const id of ids) {
    const link = new URL(content.vehicles[id].viewingLink);
    assert.equal(link.protocol, "mailto:");
    assert(link.searchParams.get("subject").includes(content.cards.vehicles[id].name));
    assert(link.searchParams.get("body").includes("Please confirm availability"));
  }
});
