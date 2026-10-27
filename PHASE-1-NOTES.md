# Vanguard Motors — Phase 1

This records the Phase 1 checkpoint. See [Stage 2 notes](STAGE-2-NOTES.md) for the
current multi-page routes and Inventory implementation.

The foundation and homepage are implemented. Inventory, vehicle detail, about and
contact routes remain for the approved later phases. No commit, push, Deneb
initialization, framework contribution, or deployment was performed.

## Preview

Run `npm run lab` to start the existing Deneb Local Test Lab integration:

- Website: http://127.0.0.1:4173
- Lab preview: http://127.0.0.1:4174/__fivora_local_preview

Use the controller URL and connection token printed by Lab in Developer Portal →
Local Test Lab for interactive authoring and Save local. The token remains local;
the controller is bound to loopback. Alternatively, use `npm run dev` for the
normal Next.js development server.

## Foundation fixes

- Imported the previously disconnected global stylesheet in the root layout.
- Restricted the installed Tailwind v4 Turbopack loader to `globals.css`. With the
  original `*.css` rule, development served font CSS and utilities while dropping
  the custom layout rules. Both compiled utilities and custom CSS are now checked
  in a real browser. Deneb's installed package is explicitly included via `@source`.
- Removed `cacheComponents` and `partialPrefetching`: Next 16.4.3 rejects partial
  prerendering when `output: "export"` is enabled. Static export and base-path
  configuration remain intact.
- Added an explicit client boundary for Deneb's mixed CommonJS exports. This fixes
  the undefined component error during server prerendering.
- Retained `SiteDataProvider` and use its live state for content, images, links,
  theme and saved styles. Deneb's default template identifier, `template-validation`,
  prevents requests to a nonexistent merchant catalog during local authoring.
- Deneb typography variables provide defaults that merchants can override through
  the editor. The live theme consumes the provider rather than only the initial JSON.

## Editing contract

`src/data/site-data.json` is the source of merchant-facing content. The manifest
contains 19 editor sections, including keyed vehicle, brand, body-type, photo and
showroom collections, and list-based benefits and customer stories. Existing
platform-managed intake configuration is retained. Run
`node scripts/sync-editor-schema.mjs` after intentionally changing the content
schema; it updates controls without initializing Deneb.

The homepage currently exposes 172 source-backed editable fields. The 25 explicit
control-only fields are filter metadata, image alt text, select-option text and
accessible carousel labels. These are actual editor controls, rather than
unbound attributes pretending to provide editability. The Lab's global theme
payload mirrors its top-level `theme` into `template.structure.theme`; keep both
copies synchronized when editing palette values directly in JSON.

The installed `EditableVehicleCard`, `EditableBrandCard`, `EditableBodyTypeCard`,
`EditableShowroomCard`, `EditableImage`, `EditableText`, `EditableLink` and
`EditableIcon` are reused. Older automotive components omit some empty fields;
homepage composition supplies Deneb primitives only when those fields are omitted.
Those targets persist for empty, zero and false values. Saved automotive text
styles are replayed using Deneb's exported `patchStyleByPath` API.

The installed `EditableNavbar`, `EditableHeroSplit` and `EditableFooter` were also
inspected. The navbar binds its main CTA to a contact page that does not yet exist
in Phase 1; the split hero fixes its heading, fallback and page-based CTA layout.
This cinematic homepage therefore composes the installed editable primitives for
its anchor navigation, hero and footer. No additional generic editable component
system was created. All current navigation targets are on the required home page.

## Behavior and motion

- Keyword, marque and body-style controls filter the featured vehicles; brand and
  body-style cards select the same filters. Reset and empty results work.
- Vehicle CTAs lead to the homepage contact section while detail routes await
  Phase 3. Email and telephone actions use their actual URI schemes.
- Customer stories advance with accessible previous/next controls. All slides
  remain mounted; inactive slides are inert.
- Hero entrances, staggered type, image reveals, scroll reveals, restrained
  parallax, card/image hover motion, filters and mobile navigation are implemented
  without an animation dependency. Content is visible without JavaScript.
- Reduced motion is respected. Scroll effects do not run inside an editing iframe.
  Native `details` makes the mobile menu usable without JavaScript.
- SVGs have explicit sizes and a scoped maximum size. Images have reserved aspect
  ratios. Native anchors, focus outlines and a skip link support keyboard access.

## Verification

- `npm run build` verifies the production static export.
- `node node_modules/typescript/bin/tsc --noEmit` checks types.
- `node scripts/check-home.mjs http://127.0.0.1:4173 --lab` uses installed Chrome
  or Edge and Node's native CDP/WebSocket support; it adds no dependency. Set
  `QA_BROWSER` if the browser is installed elsewhere.
- Browser checks cover 320, 390, 768, 1024 and 1440px layouts, SVG dimensions,
  overflow, photos, navigation, filters, reset, empty results, carousel and reduced
  motion. The real Lab iframe checks source-path coverage, selection messages,
  live text/image/link/specification/price edits, saved styles, theme updates and
  empty/zero/false targets. These edits are ephemeral and do not change source data.
- Screenshots and browser reports are written to ignored `.qa/` artifacts.
- The full `deneb validate`/packaging pass is deferred to Phase 5 as requested.

## Demo content and assets

This is a concept brand. Vehicles, specifications, prices and reviews are
illustrative. Reviews and the footer identify the sample content. Contact details
use a demonstration phone number and the reserved `.example` email domain.
Replace them before launch. No inquiry is claimed to have been delivered and no
form submission backend is implied.

Photos are downloaded into `public/images/` so the site does not depend on a
third-party image service at runtime. Unsplash source photos:

- Porsche: https://images.unsplash.com/photo-1503376780353-7e6692767b70
- BMW: https://images.unsplash.com/photo-1555215695-3004980ad54e
- Mercedes: https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8
- Audi: https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6
- Driving experience: https://images.unsplash.com/photo-1503736334956-4c8f8e92946d

## DENEB CORE COMPONENT REQUESTS

None required for Phase 1. Existing Deneb components and template-specific
composition fulfill the homepage. The conditional mounting behavior of the older
automotive components is handled locally and documented above; Deneb Core and
`node_modules` are unchanged.
