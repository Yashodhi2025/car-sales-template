import fs from "node:fs";

// Keep Fivora's controls aligned with the actual, source-backed template data.
// This does not initialize Deneb or alter its configuration/integrations.
const data = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8").replace(/^\uFEFF/, ""));
const manifest = JSON.parse(fs.readFileSync("fivora-template.json", "utf8").replace(/^\uFEFF/, ""));
const label = key => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_.]/g, " ").replace(/^./, char => char.toUpperCase());
const controls = new Set();

function fields(object, prefix) {
  return Object.entries(object).map(([key, value]) => {
    const path = `${prefix}.${key}`;
    if (value && typeof value === "object") return { key, type: "object", label: label(key), fields: fields(value, path) };
    let type = "text";
    if (typeof value === "number") type = "number";
    else if (/^(image\d*|logoUrl)$/.test(key)) type = "image";
    else if (/Link$/.test(key) || prefix === "common.navLinks") type = "url";
    else if (/email$/i.test(key)) type = "email";
    else if (/phone|whatsapp/i.test(key)) type = "tel";
    else if (/description|quote|text|shortDescription|demoNotice/i.test(key)) type = "textarea";
    if (path.startsWith("catalog.") || /imageAlt$|previousLabel$|nextLabel$|allBrands$|allBodies$/.test(path)
      || /^inventory\.filters\.(any\w+|availableLabel|reservedLabel|removeLabel|minPlaceholder|maxPlaceholder)$/.test(path)
      || /^inventory\.results\.(sort(?!Label)\w+|noScript)$/.test(path)) controls.add(path);
    return { key, type, label: label(key), ...(key === "icon" ? { control: "icon-picker" } : {}) };
  });
}
function owner(path) {
  if (/^(inventory|catalog|photos\.vehicles|cards\.vehicles)/.test(path) || path === "home.collection.emptyTitle" || path === "home.collection.emptyDescription") return "inventory";
  if (/^about|^home\.(promise|benefits|experience)/.test(path)) return "about";
  if (/^contact|^showrooms|^home\.contact/.test(path)) return "contact";
  return "home";
}
function objectSection(path, value) {
  return { id: path, path, type: "object", label: label(path), fields: fields(value, path), ...(path === "common" ? {} : { pageKey: owner(path) }) };
}
function collection(path, value) {
  return { id: path, path, type: "collection", label: label(path), collectionType: Array.isArray(value) ? "list" : "keyed", pageKey: owner(path), items: Object.entries(value).map(([key, item]) => ({ key, label: item.name || item.displayName || item.title || label(key), fields: fields(item, `${path}.${key}`) })) };
}
const intake = manifest.editorSchema.sections.find(section => section.id === "__fivoraIntake");
const sections = [objectSection("common", data.content.common)];
for (const [key, value] of Object.entries(data.content.home)) {
  if (key === "collection") {
    const { emptyTitle, emptyDescription, ...homeFields } = value;
    sections.push(objectSection("home.collection", homeFields));
    sections.push({ ...objectSection("home.collection", { emptyTitle, emptyDescription }), id: "inventory.emptyState", label: "Inventory empty results", pageKey: "inventory" });
  } else sections.push(Array.isArray(value) ? collection(`home.${key}`, value) : objectSection(`home.${key}`, value));
}
for (const [key, value] of Object.entries(data.content.inventory)) sections.push(objectSection(`inventory.${key}`, value));
sections.push(objectSection("about", data.content.about), objectSection("contact", data.content.contact));
for (const [key, value] of Object.entries(data.content.cards)) sections.push(collection(`cards.${key}`, value));
sections.push(collection("photos.vehicles", data.content.photos.vehicles), collection("catalog", data.content.catalog), collection("showrooms", data.content.showrooms));
if (intake) sections.push(intake);
manifest.name = "Vanguard Motors";
manifest.pages = [
  { id: "home", label: "Home", route: "/", required: true },
  { id: "inventory", label: "Inventory", route: "/inventory", required: true },
  { id: "about", label: "About", route: "/about", required: true },
  { id: "contact", label: "Contact", route: "/contact", required: true },
];
manifest.editorSchema.sections = sections;
manifest.visualEditing = { ...manifest.visualEditing, contractVersion: 1, mode: "strict", controlOnlyPaths: [...new Set([...(manifest.visualEditing.controlOnlyPaths || []).filter(path => path.startsWith("__fivoraIntake.")), ...controls])].sort() };
fs.writeFileSync("fivora-template.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Synced ${sections.length} editor sections; ${controls.size} explicit control-only fields.`);
