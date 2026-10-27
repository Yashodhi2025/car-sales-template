# Stage 3 — vehicle details

Stage 3 adds eight statically exported vehicle pages to the approved Vanguard
design. About and Contact retain their Stage 2 implementation. No commit or push
has been made.

## Review

Reuse the existing Deneb Lab development server at `http://127.0.0.1:4173` and its
controller at `http://127.0.0.1:4174`; do not start a second server on those ports.

- `/cars/porsche-panamera`
- `/cars/bmw-m5`
- `/cars/mercedes-amg`
- `/cars/audi-rs6`
- `/cars/tesla-model-3`
- `/cars/honda-crv`
- `/cars/chevrolet-camaro`
- `/cars/ferrari-458`

Inventory, homepage and related-vehicle photographs and names open these pages.
Each page includes the original price/availability, editorial introduction,
specifications, equipment, inquiries and three related vehicles. Related stock
prefers the same brand/body style, then the nearest displayed price. Page keys
are `car-<vehicle-id>` and remain consistent with selected-page requirements.
Next's `generateStaticParams` exports every supplied slug; unknown slugs return
404. Adding vehicles requires updating source data/schema and rebuilding.

## Gallery, accessibility and motion

Each vehicle has two distinct local photos, editable captions, thumbnails,
wrapping previous/next controls, keyboard arrows, touch swipes and an enlarged
viewer. The viewer composes the installed Deneb dialog with a body portal,
background inertness, focus trap/restoration, Escape and backdrop dismissal.
Navigation waits for image decoding, preserving the current image during loading.
Every gallery entry stays mounted, including entries with blank image values.

The page adds staggered entrances, a gentle hero image reveal/parallax,
scroll-triggered reveals, gallery crossfades and existing card/button interactions.
Content is visible by default. Motion respects reduced-motion preferences and is
disabled in the editing iframe. Without JavaScript, all specifications/equipment,
the primary photo, related links and inquiries remain usable, with explicit links
to open the other gallery photographs.

## Data and contact behavior

No horsepower, acceleration figures or additional equipment were invented.
Engine and drivetrain text only reuse facts already present in the approved demo
listings. Power is blank for all eight vehicles; unprovided drivetrain/power values
show an editable target with “Confirm with our team” as its presentation fallback.
Equipment entries reuse the original trim/details text. The year remains backed
by the original `meta` field; body style reuses the existing catalog classification.

Inquiry links preserve the selected vehicle on the existing Contact page.
Viewing requests open a vehicle-specific `mailto:` draft and clearly require
dealership confirmation. They do not send mail or reserve a viewing. The existing
reserved `.example` email and demonstration phone must be replaced by the merchant
before launch. No new contact form/backend is introduced in Stage 3.

Images are explicitly labelled demonstration/model-reference photography; exact
stock, trim, finish and model year may differ. Merchants should replace them with
actual stock photos. Additional gallery sources inspected for the matching model:

- [Porsche Panamera](https://unsplash.com/photos/a-black-porsche-sits-in-a-parking-lot-8jsqB3f9SrI)
- [BMW M5](https://unsplash.com/photos/a-white-car-parked-in-a-parking-garage-iXHHhfwJD1E)
- [Mercedes AMG GT](https://unsplash.com/photos/a-matte-grey-mercedes-amg-gt-is-parked-on-the-street-uNib1mrJPlY)
- [Audi RS6](https://unsplash.com/photos/a-black-audi-rs6-avant-parked-on-a-street-F5HYhQDcpn4)
- [Tesla Model 3](https://unsplash.com/photos/a-white-car-parked-in-front-of-a-building-gz6LZo4IAQ8)
- [Honda CR-V](https://unsplash.com/photos/the-back-of-a-gray-honda-cr-v-is-visible-yqXpNMrywnI)
- [Chevrolet Camaro](https://unsplash.com/photos/blue-chevrolet-camaro-091ZDT8qdPw)
- [Ferrari 458](https://unsplash.com/photos/yellow-ferrari-458-italia-on-road-AguwH2bQ8tQ)

## Deneb and Fivora coverage

The installed `EditableProductDetail`, `PlatformProductDetail`, `EditableDialog`,
vehicle cards and editable primitives were inspected first. The product layouts
assume commerce/cart/variant flows; template-specific automotive composition
preserves the approved design and source paths without duplicating framework code.

Existing `SiteDataProvider`, Lab integration, card/photo bindings and style patch
behavior are preserved. The detail pages reuse `EditableText`, `EditableImage`,
`EditableIcon`, `EditableLink`, `EditableVehicleCard` and `EditableDialog`.
`site-data.json` and `fivora-template.json` include per-vehicle detail objects,
equipment collections and gallery collections. Schema generation is reproducible
with `node scripts/sync-editor-schema.mjs`. Nonvisual accessibility/catalog fields
are declared control-only instead of falsely claiming on-canvas editability.

Actual Lab iframe checks verify all 414 source-backed on-canvas fields mount
across the 12 routes. Checks select a specification through the Lab bridge and
apply live name, price, description, engine, equipment, gallery image/caption,
viewing link and saved-style edits. Empty gallery/equipment/specification values
and zero values retain their editable targets. QA edits are ephemeral and restored;
they do not overwrite source data.

## Focused verification

```text
node --test scripts/inventory.test.mjs scripts/vehicles.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/check-home.mjs http://127.0.0.1:4173
node scripts/check-inventory.mjs http://127.0.0.1:4173 --lab
node scripts/check-vehicles.mjs http://127.0.0.1:4173 --lab
node scripts/check-export.mjs
```

Run browser scripts sequentially because they share one temporary Chrome debug
port/profile. They close their own browser afterward and leave the existing Lab
server running. Results/screenshots are written under ignored `.qa/`.
The export check serves emitted files only, verifies direct access to all 12 routes,
404 behavior and useful content without JavaScript. Browser checks cover all eight
detail routes, gallery interaction/focus, responsive widths from 320–1440px,
bounded SVGs, reduced motion, inquiry context, related navigation and Lab editing.
Final CLI validation/packaging remains deferred until the template's later stages.

The final run passed TypeScript, the production build, 13 logic tests, 23 homepage
checks, 42 Inventory/Lab checks, 75 vehicle/Lab checks and 40 production-export
checks. Browser checks reported no uncaught exceptions or console errors.

## DENEB CORE COMPONENT REQUESTS

None required for Stage 3. Installed Deneb components and template-specific
composition fulfill the detail experience. No Core files, `node_modules`,
framework initialization or new dependencies were changed.
