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
    if (path === "common.currencyCode") controls.add(path);
    if (value && typeof value === "object") return { key, type: "object", label: label(key), fields: fields(value, path) };
    let type = "text";
    if (typeof value === "number") type = "number";
    else if (typeof value === "boolean") type = "boolean";
    else if (/^(image\d*|imageUrl|logoUrl)$|Image$/.test(key)) type = "image";
    else if (/Link$/.test(key) || prefix === "common.navLinks") type = "url";
    else if (/email$/i.test(key) && !prefix.endsWith(".errors")) type = "email";
    else if (/^(phone|whatsapp)$/i.test(key) && !prefix.endsWith(".errors")) type = "tel";
    else if (/description|quote|text|shortDescription|demoNotice|answer/i.test(key)) type = "textarea";
    if (/^home\.search\.(eyebrow|title|description|resetLabel)$/.test(path)) controls.add(path);
    if (/^cards\.brands\.[^.]+\.countLabel$/.test(path) || path === "common.searchPlaceholder" || path === "common.searchLabel" || path.startsWith("catalog.") || /imageAlt$|previousLabel$|nextLabel$|allBrands$|allBodies$/i.test(path)
      || /^inventory\.filters\.(any\w+|availableLabel|reservedLabel|removeLabel|minPlaceholder|maxPlaceholder)$/.test(path)
      || /^inventory\.results\.(sort(?!Label)\w+|noScript)$/.test(path)) controls.add(path);
    if (/^vehicleDetails\.gallery\.(previousLabel|nextLabel|closeLabel|thumbnailLabel|openImageLabel)$/.test(path) || path === "vehicleDetails.notSupplied") controls.add(path);
    if (/^requests\.(fields\.[^.]+\.placeholder|types\.|contactSubject$|viewingSubject$|noVehicle$|draftTextLabel$|noScript$)/.test(path) || path === "viewing.messagePlaceholder" || path.startsWith("motion.")) controls.add(path);
    if (/^home\.testimonials\.(carouselLabel|storyLabel)$/.test(path) || /^services\.items\.\d+\.targetPage$/.test(path)) controls.add(path);
    return { key, type, label: label(key), ...(key === "icon" || prefix === "vehicleDetails.specIcons" ? { control: "icon-picker" } : {}) };
  });
}
function owner(path) {
  if(path.startsWith("services")) return "services";
  if(path.startsWith("faq")) return "contact";
  const vehicle = path.match(/^(?:vehicles|photos\.vehicles)\.([^.]+)/)?.[1];
  if (vehicle && Object.hasOwn(data.content.vehicles, vehicle)) return `car-${vehicle}`;
  if (path === "vehicleDetails") return `car-${Object.keys(data.content.vehicles)[0]}`;
  if (/^viewing|^requests\.fields\.(date|time)/.test(path)) return `car-${Object.keys(data.content.vehicles)[0]}`;
  if (path.startsWith("requests")) return "contact";
  if (/^(inventory|catalog|photos\.vehicles|cards\.vehicles)/.test(path) || path === "home.collection.emptyTitle" || path === "home.collection.emptyDescription") return "inventory";
  if (/^about|^home\.(promise|benefits|experience)/.test(path)) return "about";
  if (/^contact|^showrooms|^home\.contact/.test(path)) return "contact";
  return "home";
}
function objectSection(path, value) {
  return { id: path, path, type: "object", label: label(path), fields: fields(value, path), ...(path === "common" ? {} : { pageKey: owner(path) }) };
}
function collection(path, value) {
  return { id: path, path, type: "collection", label: label(path), collectionType: Array.isArray(value) ? "list" : "keyed", pageKey: owner(path), items: Object.entries(value).map(([key, item]) => ({ key, label: item.name || item.displayName || item.title || item.question || label(key), fields: fields(item, `${path}.${key}`) })) };
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
const { journey, ...about } = data.content.about;
sections.push(objectSection("about", about), collection("about.journey", journey), objectSection("contact", data.content.contact));
for(const key of ["services","faq"]){const {items,...copy}=data.content[key];sections.push(objectSection(key,copy),collection(`${key}.items`,items));}
const { fields: requestFields, types, errors, ...requestCopy } = data.content.requests;
const { date: dateError, pastDate, time: timeError, ...sharedErrors } = errors;
sections.push(objectSection("requests", { ...requestCopy, errors: sharedErrors }), collection("requests.types", types));
for (const [key, value] of Object.entries(requestFields)) sections.push(objectSection(`requests.fields.${key}`, value));
sections.push({ ...objectSection("requests.errors", { date: dateError, pastDate, time: timeError }), id: "viewing.errors", pageKey: `car-${Object.keys(data.content.vehicles)[0]}` }, objectSection("viewing", data.content.viewing), objectSection("motion", data.content.motion));
for (const [key, value] of Object.entries(data.content.cards)) sections.push(collection(`cards.${key}`, value));
sections.push(collection("catalog", data.content.catalog), collection("showrooms", data.content.showrooms), objectSection("vehicleDetails", data.content.vehicleDetails));
for (const [id, vehicle] of Object.entries(data.content.vehicles)) {
  const { features, ...details } = vehicle;
  const { gallery, ...photos } = data.content.photos.vehicles[id];
  sections.push(objectSection(`vehicles.${id}`, details), collection(`vehicles.${id}.features`, features), objectSection(`photos.vehicles.${id}`, photos), collection(`photos.vehicles.${id}.gallery`, gallery));
}
if (intake) sections.push(intake);
manifest.name = "Vanguard Motors";
manifest.pages = [
  { id: "home", label: "Home", route: "/", required: true },
  { id: "inventory", label: "Inventory", route: "/inventory", required: true },
  { id: "services", label: "Services", route: "/services", required: true },
  { id: "about", label: "About", route: "/about", required: true },
  { id: "contact", label: "Contact", route: "/contact", required: true },
  ...Object.keys(data.content.vehicles).map(id => ({ id: `car-${id}`, label: data.content.cards.vehicles[id].name, route: `/cars/${id}`, required: true })),
];
manifest.editorSchema.sections = sections;
manifest.visualEditing = { ...manifest.visualEditing, contractVersion: 1, mode: "strict", controlOnlyPaths: [...new Set([...(manifest.visualEditing.controlOnlyPaths || []).filter(path => path.startsWith("__fivoraIntake.")), ...controls])].sort() };
fs.writeFileSync("fivora-template.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Synced ${sections.length} editor sections; ${controls.size} explicit control-only fields.`);
