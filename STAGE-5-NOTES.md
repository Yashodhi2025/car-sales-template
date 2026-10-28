# Stage 5 — services, stories, FAQ and vehicle details

## Latest vehicle card correction — automotive layout and hover outline

Restored the previous edge-to-edge vehicle photography, 14px outer corners,
original blue-grey typography and plain specification rows with fine dividers.
The inset-image treatment and tinted specification tiles were removed after
visual review. Cards now transition to a blue outline with a fine outer ring,
subtle lift and slow image zoom on hover; keyboard focus receives the same outline.
Reduced motion and editor/disabled-motion previews suppress the transforms.
Neutral CTA buttons, tight price/caption spacing, source bindings and the existing
three/four-column Inventory behavior are preserved.

## Previous vehicle card finish and neutral actions (visual treatment superseded)

The shared Deneb vehicle cards now use inset rounded photography, warmer paper
surfaces, restrained borders/shadows, neutral typography and a compact tinted
specification strip. Prices and their editable demo labels sit together above
aligned charcoal View details and outlined Enquire actions. Narrow cards adapt
their specification layout without truncating the mileage. Featured and Similar
Vehicles reuse the same finish; the existing Inventory column counts are retained.

Bright blue card and Inventory primary buttons are replaced with charcoal actions;
the dark navbar's viewing CTA uses soft off-white. Blue remains for navigation and
keyboard focus. Existing source paths, images, prices, availability, links, saved
styles, filtering and reduced-motion behavior are preserved. No schema additions,
dependencies or framework changes were needed.

TypeScript passed. Focused browser checks passed at 320–1920px for price/action
fit, open three-column layout, filtering, eight detail/enquiry action pairs and
mounted Deneb field targets. Desktop/mobile screenshots were reviewed and the
price-to-caption gap corrected. No full build or large Lab suite was run.

## Latest Inventory density adjustment

Wide desktops (1200px and above) now show three cards with filters open and four
with filters hidden. The sidebar is 288px wide, with reduced padding, paired
marque/body fields and compact controls. All filters remain in document flow with
no capped height or internal scrolling. Short desktop viewports use normal page
scrolling rather than trapping the lower controls in a sticky panel.

Smaller desktops adapt to two/three columns, tablets two and phones one. Inventory
card spacing is tighter while preserving complete prices, specifications and both
actions. Existing filtering, URL state, source bindings and layout animations are
unchanged. TypeScript and focused 320–1920px layout/filter checks passed, including
all desktop controls fitting the checked 900px viewport and no price/action clipping.

## Latest Inventory update — collapsible filters

Inventory now has a compact Filters button with Show/Hide accessible labels, a
single refined sort control and a sidebar close button. The sidebar groups search,
vehicle type, budget and equipment controls, with paired fuel/transmission fields,
compact inputs, custom chevrons, active-value styling and a grouped action footer.
Existing off-white/blue styling and native input behavior remain intact. Desktop
uses two vehicle columns with filters open and three with filters collapsed;
tablet uses two columns and mobile one, with the existing native filter disclosure.
The form stays mounted and keeps its selections, query parameters and sorting.
Collapsed desktop filters are inert and hidden from assistive technology; Escape
closes the sidebar and returns focus to the toolbar toggle.

Existing card elements animate into their new positions/sizes using a lightweight
FLIP transition. Rapid toggles start from their current visual position. Reduced
motion, disabled site motion and editor previews skip these layout animations.
No animation dependency was added. Lab field focus reopens collapsed filters;
the new source-backed toggle labels are included in the synchronized schema.

TypeScript and focused browser/Lab checks passed for 2/3-column toggling, filter
and URL preservation, reset/sorting, focus return, reduced motion, mobile Apply,
320–1440px layouts and editor label changes. Additional checks confirmed the
three-column layout fits 901/1024px desktop widths without clipped prices/actions.
No full build/suite, Core change, commit or push was run.

## Latest card finish and Sri Lankan display values

The shared Deneb vehicle card now has cleaner borders, rounded image corners,
aligned specification rows, clearer price hierarchy and equal-height View details
and Enquire buttons. Available/reserved badges have distinct green/amber treatment.
Source fields, whole-card navigation and editor selection behavior remain intact.

All eight example prices now use LKR with full comma-grouped amounts, synchronized
with `catalog.priceValue`. These are deliberately labelled **demo asking prices**,
not verified market valuations or converted GBP quotes. Existing demonstration
mileage was converted from miles to kilometres and rounded to the nearest 100 km.
Home, Inventory, Similar Vehicles and vehicle details read the same values.
Inventory budget labels and active filter chips now use the editable LKR currency
code. The country/contact details were outside this price/card change.

New caption/action labels and currency code are source-backed and in the synced
Fivora schema. TypeScript, seven existing price/filter unit tests and targeted
browser checks passed, including numeric price filters/sorting, source consistency,
vehicle details and 320/390px card layout. A focused Lab check verified live LKR
price, caption and action-label editing; temporary preview values were restored.
No full suite/build, dependency, backend, commit or push was introduced.

## Latest brand-icon reference adjustment

Brands now use compact flat monochrome emblem/name tiles, matching the supplied
icon-grid reference. Seven flat SVG symbols are local assets from Simple Icons
v11 (`https://github.com/simple-icons/simple-icons/tree/11.0.0/icons`); the existing
Porsche image shows only its crest through a default-asset-specific CSS viewport.
Custom replacement Porsche images use the standard contained-image layout.
Desktop uses eight compact tiles, tablet four columns and mobile two columns.
Supporting taglines stay mounted/source-backed and editable in Fivora controls,
but are omitted visually. Decorative arrows were removed. Image paths, names and
Inventory filter links remain intact. Motion remains subtle and honors reduced
motion. TypeScript passed and the logo layout was checked in the local preview.

## Latest correction — organized search and brand logos

Search heading and helper copy now share one left-aligned group. Reset filters
is a separate secondary header action, enabled when there is a selection or
keyword; the three fields and primary search action align at equal height.
Dropdowns are compact charcoal text lists with selection ticks, without images,
counts or decorative option icons. Hover, touch and keyboard behavior remains.

The eight brand tiles now use actual logo assets instead of vehicle photographs.
The locally stored PNGs come from
`https://github.com/filippofilip95/car-logos-dataset/tree/master/logos/optimized`.
Tiles use bounded, contained logos, monochrome presentation, subtle color/scale
on hover and reduced-motion support. Existing editable image paths now point to
these logo files, with matching alt text and a neutral cleared-image fallback.
Site data and Fivora schema remain synchronized.

TypeScript and five targeted browser checks passed: plain-text hover menus,
reset enable/clear behavior, eight loaded logos and mobile fit. Desktop/mobile
screenshots were inspected. No full test suite/build, commit or push was run.

## Latest navigation and discovery refinement

- Desktop navigation now has animated rounded hover/focus pills and a blue active
  pill. The compact navbar search is always visible and submits to Inventory.
- Home search now separates its heading/helper copy from clearly labelled fields
  and prominent selected values. Custom photograph-backed choice lists open on
  desktop hover, or click/tap, and support arrow keys, Home/End, Enter and Escape.
  Native GET selects remain as the no-JavaScript fallback and submitted values;
  reset clears both the custom UI and native values.
- All eight brand cards now include editable matching vehicle photographs,
  image zoom, lift/arrow hover effects and existing scroll reveals. Original
  brand names, supporting text, filter links and saved-style targets remain.
- New brand images/alt text, search helper copy and navbar placeholder are in
  site-data and the synchronized Fivora schema. Dropdown label copies use the
  live source values without hidden duplicate editable targets.
- TypeScript and 12 focused interaction/layout checks passed, including desktop
  hover, keyboard selection, Inventory query submission, reset, navbar search,
  all eight images and 320/390px layouts. No full suite or production build was
  repeated. Reduced motion and native mobile tap behavior are preserved.

## Latest implementation — cohesive premium frontend

This supersedes the visual-review state described below. The shared system now
uses charcoal navigation/footer, off-white editorial content, dark photographic
and request sections, readable type and consistent blue actions across all pages.

- Floating rounded navbar: compact working vehicle search, active links (including
  Inventory on car routes), scroll treatment, mobile menu and a viewing-request
  CTA that preselects Contact's inquiry type.
- Shared vehicle cards: light surfaces, large images, year/trim, price, mileage,
  fuel, transmission, availability, View details and enquiry actions. Home,
  Inventory and Similar Vehicles use the same component. The details link covers
  the card for visitors; that overlay is disabled inside the editor.
- Home: cinematic Porsche hero, quick search, image-based categories, brand strip,
  featured collection, short Services preview, existing review carousel and CTA.
- All eight vehicle pages: organized light overview/specifications with editable
  icons, preserved gallery/fullscreen controls, enquiry/viewing/test-drive actions,
  a dealer contact link, an interactive photo explorer and shared related cards.
- Services: six editorial sections now explain each offering with a detailed demo
  description and three editable inclusions. Individual inquiry links and closing
  Contact CTA remain functional.
- About: cinematic brand introduction, story, dark philosophy section, editorial
  photography, customer journey and CTAs. Contact: clear light inquiry form and
  showroom details, existing preselection/email-draft flow and dark native FAQ.
  Review carousel keyboard/touch controls and demo labels are preserved.

There are **no matched 360-degree image sequences** among the available assets.
Each car currently has its primary image and a model-reference photograph, which
can represent a different trim/finish. The new explorer is explicitly labelled a
multi-angle demo gallery, not a 360 scan. It supports pointer dragging, touch
swipes, arrow keys, previous/next controls and view buttons without synthesizing
angles. Both galleries use the existing editable photo paths. Lab focus now
reveals inactive photographs in both the main gallery and explorer.

New content (Services inclusions, Home preview summaries, explorer copy, dealer
CTA, specification icons and search label) is source-backed in site-data and the
synchronized Fivora manifest. Existing paths and saved-style mechanisms remain.
Deneb's VehicleCard, ServiceCard, BodyTypeCard, BrandCard, ShowroomCard, Dialog,
Image, Text, Icon and Link components are reused. No Core component is required.

Implementation is primarily in `src/app/premium.css` (imported after globals),
the existing shared shell/listing/page components, the new
`vehicle-image-explorer.tsx` and `use-vehicle-photo-focus.ts`, plus site-data and
the schema generator/manifest. The additional stylesheet keeps the shared
editorial system separate from the working Tailwind entry and its integration.

Focused checks only: TypeScript passed; a short desktop/mobile preview pass
covered all page types, Inventory URL filtering/reset, fullscreen gallery,
explorer navigation, all service photographs/inclusions and inquiry preselection.
A small Lab check verified the new inclusion binding, explorer copy/photo editing
and inactive photo focus. Compact search and the mobile viewing CTA were exercised.
No full browser, Lab, validation or export test suite was rerun. Temporary preview
edits were restored. One production build passed, exporting all eight car routes
and the five main pages.

Review on [Home](http://127.0.0.1:4173/),
[Inventory](http://127.0.0.1:4173/inventory),
[Vehicle details](http://127.0.0.1:4173/cars/porsche-panamera),
[Services](http://127.0.0.1:4173/services),
[About](http://127.0.0.1:4173/about) and
[Contact](http://127.0.0.1:4173/contact).
Demo contact details and illustrative photography remain; email delivery requires
the visitor's email application. Physical-device/Safari testing was not repeated.
Frontend only; no dependency, Core/node_modules edit, backend, commit or push.
Stopped for visual review.

## Stage 5.1 — focused automotive UI refinement

Completed for visual review. The reference informed photography, clear typography,
blue accents and selective light surfaces. Vanguard branding, dealership content,
all six services and existing navigation remain intact.

### Visual and interaction changes

- Services retains its cinematic hero, with a locally stored 2400px version of
  the original Mercedes photograph, a smaller readable heading, editable
  supporting copy, clearer CTAs and a mobile crop focused toward the car's front.
- A soft light surface introduces the services, the large sales split and the
  offset trade-in/financing pair. The test-drive image banner, sourcing split and
  reversed after-sales section stay dark. Spacing is tighter and supporting text
  is larger. Wide photographs replace the unsuitable portrait sourcing/support
  crops. A light closing section provides an editable Contact CTA.
- The existing Home carousel now pairs large automotive imagery with a light
  quote panel, stronger quote/author typography, explicit demonstration labels
  and nearby arrow/counter/indicator controls. Tablet/mobile stack the photograph
  above the quote. Existing keyboard, pointer-swipe, inert-slide and Lab focus
  behavior is preserved.
- Contact FAQ keeps the same six native disclosures and editable answers. Larger
  copy, aligned rows, subtle hover/open backgrounds and a blue active edge improve
  readability. The indicator now changes from plus to minus. Native keyboard
  toggling and reduced-motion behavior remain intact.
- A small template media wrapper reuses Deneb `EditableImage`, retaining the real
  editable target when the value is empty or its URL fails. A local automotive
  placeholder prevents a broken-image display. Changing the URL restores the
  merchant image. Non-hero media is lazy-loaded with reserved image dimensions.

### Deneb / Fivora coverage

Existing source paths, values and style mechanisms are preserved. Services still
uses `EditableServiceCard` for its editable name/description/body, composed with
the existing image, icon, text and link primitives. No new Core API is required.

Six new source-backed Services fields were added: `heroDescription`,
`closingEyebrow`, `closingTitle`, `closingDescription`, `closingButtonLabel` and
`closingButtonLink`. Site data and the generated manifest are synchronized. FAQ
answers use textarea controls and collection entries show their questions in the
editor, instead of numeric labels.

Focused Lab checks verified all **60 Services on-canvas schema paths** have real
targets, live changes to supporting/closing copy and CTA destinations, saved text
style application, cleared images, failed URL recovery and mounted zero/false
values. Checks also verified editing an inactive review's quote/image, automatic
slide selection and opening/editing a closed FAQ answer. Temporary preview data
was restored. This used the real local Lab iframe/message bridge; it did not
repeat the earlier full save/read/disk suite or claim a new portal save test.

### Focused verification

```text
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-stage51.mjs http://127.0.0.1:4173 --lab
npm run build
```

TypeScript passed. All **25 focused browser/Lab checks passed**, with no browser
exceptions or unexpected console errors. Coverage includes all service images,
distinct layouts, service CTA inquiry preselection, FAQ keyboard/minus states,
carousel arrows/indicators/keyboard/touch, widths 320/390/768/1440px, bounded icons,
reduced motion and the editing cases above. Desktop/mobile screenshots were
visually inspected; results/screenshots are in ignored `.qa/`.

The **single production build passed** and exported Home, Inventory, Services,
About, Contact and all eight vehicle routes. The full Inventory/gallery/export
browser suites were intentionally not repeated for this scoped refinement.

The local preview initially served the previous compiled CSS despite hot reload
and a server restart. Only this repository's generated development Turbopack cache
was cleared; the Lab-managed preview was restarted on its original 4173/4174 ports.
No source integration or Next configuration was changed.

### Files updated in Stage 5.1

- `src/components/vanguard-services.tsx`
- `src/components/vanguard-reviews.tsx`
- `src/components/vanguard-faq.tsx`
- `src/components/vanguard-image.tsx` (new thin media wrapper)
- `src/app/globals.css` (scoped Services/reviews/FAQ rules)
- `src/data/site-data.json`
- `fivora-template.json`
- `scripts/sync-editor-schema.mjs`
- `scripts/check-stage51.mjs` (new focused checks)
- `public/images/services-hero.jpg` (2400px local photograph)
- `public/placeholder.svg` (new local fallback)
- `STAGE-5-NOTES.md`

The hero photo uses the existing Mercedes Unsplash source listed in the Phase 1
notes: `photo-1618843479313-40f8afb4b4d8`. The local JPEG is about 480 KiB; the site
does not fetch Unsplash during rendering. Service photography remains illustrative.

### Preview and limitations

- [Services](http://127.0.0.1:4173/services)
- [Home testimonials](http://127.0.0.1:4173/#testimonials)
- [Contact FAQ](http://127.0.0.1:4173/contact#faq)
- [Deneb Lab](http://127.0.0.1:4174/__fivora_local_preview)

Browser checks used installed Chromium, including mobile viewport emulation;
physical-device/Safari testing was not repeated. Older browsers may open native
FAQ disclosures without the modern height transition. Services and reviews remain
clearly marked demo content. Existing frontend email/contact behavior is unchanged.

**DENEB CORE COMPONENT REQUESTS:** none. No dependency, Core/package edit, backend,
commit, push or Stage 6 work was introduced. Stop here for Stage 5.1 visual review.

## Visual review

- [Dedicated Services](http://127.0.0.1:4173/services)
- [Services editorial sections](http://127.0.0.1:4173/services#offerings)
- [Home customer stories](http://127.0.0.1:4173/#testimonials)
- [Contact FAQ](http://127.0.0.1:4173/contact#faq)
- [About](http://127.0.0.1:4173/about)
- [Vehicle details](http://127.0.0.1:4173/cars/porsche-panamera)
- [Deneb Local Lab](http://127.0.0.1:4174/__fivora_local_preview)

The existing port-3000 development process prevented Lab from starting a second
Next instance for this repository. Only this project's identified Next/Lab
processes were consolidated into one Lab-managed preview on 4173, with controller
4174. Use that preview during review; running another `npm run dev` alongside it
will encounter Next's existing-server lock. Dependencies were not reinstalled.

## Dedicated Services redesign

`/services` is now its own statically exported page, registered in both site-data
page lists and the Fivora manifest. Services appears in desktop, mobile and footer
navigation, with active states and selected-page visibility preserved. About
returns to brand storytelling and its existing customer journey.

The six original service names, descriptions, icons and inquiry destinations
remain intact. Their presentation now uses local automotive photography:

- A full-bleed Mercedes hero, oversized headline and two editable CTAs.
- A large split image/text feature for luxury vehicle sales.
- Asymmetric, offset trade-in and financing stories.
- A cinematic full-width test-drive feature.
- Alternating sourcing and after-sales image/text sections.

There is no repetitive six-card grid. The installed `EditableServiceCard` is still
the source-backed renderer; its image slot and template-specific CSS provide the
editorial compositions. Framework price/status promotions are suppressed, and the
explicit illustrative-service notice remains visible. Photography, kickers, hero
copy and CTA content/destinations have editable source paths. No business promise,
credit product, rate or approval mechanism is introduced.

## Customer stories and FAQ

The original single Home testimonial section now has a balanced heading/control
row followed by a wide image-and-quote carousel. Automotive images are large;
names, quotes, initials, supporting labels and source paths remain unchanged.
Previous/next buttons, direct pagination, keyboard arrows and touch swipes are
preserved. There is no autoplay or invented rating/review count. Demonstration
labels remain explicit.

Editor focus accepts trusted parent messages and same-origin iframe relays,
normalizes dot/bracket paths and reveals the requested slide before the framework
resolves the target. Focus is checked against every slide and against inactive
image fields, including the same-origin relay case. Nonactive public slides remain
inert and hidden from assistive technology.

Contact retains all six original FAQ questions/answers. The native disclosures
now have refined typography, numbered rows, blue active indicators, improved
spacing and progressive height/opacity transitions. Native Enter/Space behavior
and focus rings remain; disclosure behavior works without JavaScript. Older
browsers can use the native disclosure if they lack animated intrinsic sizing.

Reduced-motion preferences disable the relevant entrance, hover and accordion
animations. Images reserve their layout space. All icons retain explicit bounds.

## Vehicle audit retained from the functional Stage 5 work

All eight cars retain price, availability, make/model, supplied model year,
mileage, engine/motor, fuel, transmission, body style, description, equipment,
gallery, viewer, inquiry/viewing forms and three related vehicles. Make/model
already exists in the brand/title data, so no duplicate model field was added.

| Vehicle route | Model year | Gallery photos | Availability |
| --- | --- | --- | --- |
| `/cars/porsche-panamera` | 2018 | 2 | Available |
| `/cars/bmw-m5` | 2019 | 2 | Available |
| `/cars/mercedes-amg` | 2020 | 2 | Available |
| `/cars/audi-rs6` | 2017 | 2 | Available |
| `/cars/tesla-model-3` | 2021 | 2 | Available |
| `/cars/honda-crv` | 2016 | 2 | Available |
| `/cars/chevrolet-camaro` | 2018 | 2 | Available |
| `/cars/ferrari-458` | 2014 | 2 | Reserved |

The genuinely missing `interiorColor` and `exteriorColor` fields are blank for all
eight vehicles, displayed as “Confirm with our team” in a separate Finish & cabin
group. They were not inferred from demonstration photographs. There are ten
displayed specification fields per car. Unconfirmed power/drivetrain values stay
unconfirmed, and existing model-reference photography notices remain.

Each car also has an editable test-drive inquiry link. It opens Contact with both
the vehicle and `test-drive` inquiry selected. Service links similarly preselect
financing/trade-in/sourcing/support inquiry types. These reuse the existing
validated email-draft form; they do not send mail, confirm availability or book
anything. The existing demonstration email/phone must be replaced before launch.

## Deneb / Fivora

Installed service, FAQ and testimonial APIs were inspected before implementation.
The service card is reused. Existing testimonial primitives preserve the original
`name`/`detail` paths and avoid framework defaults for stars/verified buyers. Native
FAQ disclosures compose Deneb editable text/link primitives for progressive
keyboard/accessibility behavior and unrestricted answer height. No new reusable
Core component is essential.

Source data and the reproducible editor schema remain synchronized. All 706
content leaves have declared schema fields; all 13 page keys match the source
requirements. Nonvisual values such as target-page names and alt text are explicit
controls rather than fake on-canvas targets.

Real Lab checks cover the Services hero/image/CTA fields, six editorial image
slots and kickers, saved typography styles, blank images, zero text and every
review slide's field focus. The earlier functional Stage 5 checks cover all 86
new on-canvas fields, live service/FAQ/review/finish edits, empty/false/zero values
and a temporary Lab save/read/disk/fresh-preview round trip. Original source data
was restored byte-for-byte afterward. The redesign preserves that save mechanism.

## Focused verification

```text
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/check-stage5-redesign.mjs http://127.0.0.1:4173 --lab
```

TypeScript and the production build passed, including `/services` and all eight
car routes. All 40 focused redesign checks passed with no browser exceptions or
console errors. They cover page/navigation structure, image loading, distinct
layouts, inquiry preselection, native FAQ keyboard behavior, carousel controls,
touch swipes, widths 320–1440px, reduced motion, real Lab edits, source targets,
saved styles and inactive-slide focus. Screenshots/results are in ignored `.qa/`.
The large Inventory/export suite was not repeated for this visual change.

Existing focused scripts were adjusted for the new Services route and the ten
vehicle specifications, so their future assertions match the final structure.

## Updated files

- `src/app/services/page.tsx` (new route)
- `src/components/vanguard-services.tsx`
- `src/components/vanguard-reviews.tsx`
- `src/components/vanguard-faq.tsx`
- `src/components/vanguard-shell.tsx`
- `src/components/vanguard-home.tsx`
- `src/components/vanguard-contact.tsx`
- `src/components/vanguard-about.tsx` (Services removed; storytelling retained)
- `src/components/vanguard-vehicle.tsx`
- `src/components/inquiry-form.tsx`
- `src/app/globals.css`
- `src/data/site-data.json`
- `fivora-template.json`
- `scripts/sync-editor-schema.mjs`
- `scripts/check-stage5-redesign.mjs`
- `scripts/check-stage5.mjs`
- `scripts/check-stage5-save.mjs`
- `scripts/check-vehicles.mjs`
- `scripts/check-inventory.mjs`
- `scripts/check-export.mjs`
- `STAGE-5-NOTES.md`

## DENEB CORE COMPONENT REQUESTS

None essential. No Core or `node_modules` modifications, new dependency, backend,
API, authentication, payment or additional stage was introduced. No commit/push.
