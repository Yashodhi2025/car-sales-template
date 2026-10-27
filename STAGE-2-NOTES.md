# Vanguard Motors — routes and Inventory review

The requested review stage is complete: shared page structure, navigation and a
working Inventory page. The Phase 1 palette, type, photography, source field paths,
carousel, motion and Deneb integration are retained.

## Current routes

| Route | Current scope |
| --- | --- |
| `/` | Cinematic home, GET search into Inventory, three featured cars, marque/body browsing, customer stories and contact CTA. |
| `/inventory` | Eight demo vehicles, search, combined filters, counts, chips, reset, sorting and empty states. |
| `/about` | Route foundation using the existing introduction, benefits and dealership experience content. Expanded story/services/milestones remain for the later stage. |
| `/contact` | Route foundation using the existing showroom, email/telephone actions and selected-vehicle context. Validated inquiry/viewing forms remain for the later stage. |
| `/cars/[slug]` | Deliberately deferred until Inventory approval. No current link points to an unimplemented detail page. |

Navbar/footer navigate to the real routes. Navigation labels retain the stable
`common.navLabels.collection` and `common.navLabels.experience` paths. Required-page
selection filters navigation and page content. The shared chrome uses Next Link
for client navigation; its text and URLs read the live Deneb provider. Existing
Deneb links and asset helpers preserve deployment base paths elsewhere.

Inventory inquiries open `/contact?vehicle=<id>` and display the selected vehicle.
This is an actual contact route, not a simulated submission or a hidden placeholder
detail page. Existing demonstration phone/email details are still identified as
samples. No form is claimed to deliver messages.

## Inventory behavior

- Keyword search matches multiple words across name, model/year, trim, fuel and
  transmission, ignoring case and accents.
- Marque, body style, minimum/maximum price, fuel, transmission and availability
  filters combine with AND. Budgets are inclusive and support zero. Invalid ranges
  produce a validation message.
- Curated order, both price directions, newest/oldest year and lowest mileage work.
  Sorting and prices use numeric values. Unpriced cars sort last and stay out of
  explicit numeric budgets.
- Filters and sorting persist in the URL, work after refresh, and can be shared.
  Home search/marque/body links use the same query parameters. Reset clears the
  complete state; individual chips remove one filter.
- Price/fuel/transmission/mileage changes in Fivora affect the same values used by
  the filters and sort. The legacy `catalog.*.priceValue` paths are retained for
  compatibility; the visible card price is authoritative for budget filtering.
- Mobile filters use native disclosure. All vehicle targets stay mounted while
  filtering; nonmatching cards are hidden, rather than deleted from the editor DOM.

## Fivora and Deneb

- `SiteDataProvider`, the live theme bridge and source JSON remain intact.
- The manifest now defines four static pages and 27 editor sections. There are 288
  editable source leaves and 60 explicit control-only leaves: filter metadata,
  option/accessible labels, alt text and the no-JavaScript explanation.
- Original homepage content moved to another route retains its data path. Editor
  section `pageKey` values point to the current owning page. The two existing empty
  result strings are now owned by the Inventory editor section.
- Installed exports and APIs were inspected: `EditableNavbar`,
  `EditableVehicleCard`, `EditableBrandCard`, `EditableBodyTypeCard`,
  `EditableShowroomCard`, `EditableFilterSidebar`, `EditableGrid`, editable text,
  images, icons and links. Existing cards/primitives are reused.
- Template-only shared chrome and vehicle presentation avoid copying the Deneb
  component implementation. The existing header design and binding paths are
  preserved. The installed navbar's fixed contact CTA does not expose an editable
  destination, so it would regress the existing `common.headerCtaLink` binding.
- The installed filter sidebar models commerce categories/sizes and lacks
  automotive fields. The Inventory form composes labelled native controls and
  Deneb text bindings; it does not create a new framework filter abstraction.
- The existing automotive component's empty-field omissions are still composed
  with Deneb primitives. Empty, zero and false targets and associated specification
  icons stay mounted. Saved legacy-card text styles use the official patch API.
- No Deneb initialization, Core changes, `node_modules` changes, new dependency,
  commit or push was performed. Full final-template CLI validation/packaging is
  deferred until the remaining pages are implemented.

## Motion and styling

The Tailwind entry remains restricted to `globals.css`; the Phase 1 loader fix is
preserved. Explicit icon dimensions and scoped maximum sizes remain in place.
Inventory adds staggered filtered-card entrances, image reveals/parallax, hover
motion, responsive disclosure and route entrances. Content is visible by default,
motion respects reduced-motion preferences, and effects are disabled in the Lab
iframe. Cross-document View Transition opt-in was removed after it caused browser
errors during iframe navigation; the CSS route entrances work with Next navigation.

The selected-page stylesheet always contains a comment even when every page is
selected. This prevents an empty-style removal from causing a hydration mismatch.

## Focused verification

```text
node --test scripts/inventory.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/check-home.mjs http://127.0.0.1:4173
node scripts/check-inventory.mjs http://127.0.0.1:4173 --lab
node scripts/check-export.mjs
```

The seven focused logic tests cover combined filters, every sort mode, inclusive
budgets, invalid ranges, live edits, unpriced values and URL round-tripping.
Browser checks use installed Chrome/Edge and Node's CDP/WebSocket support, without
an added dependency. Screenshots/results go to ignored `.qa/` files.

The actual Deneb Lab iframe verifies all 288 editable source leaves across all four
routes, click selection, live text/image/link/price/spec edits, saved styles,
empty/zero/false fields and selected-page navigation. Edits are ephemeral and are
restored without saving over source data. Production checks serve only emitted
files, verify direct routes, and check styling/content without JavaScript.

An existing Lab server was reused. This stage does not start another persistent
development/Lab process. Run only one of `npm run dev` and `npm run lab`; Lab starts
its own development server.

## Additional demonstration photography

Images are stored locally, and their subjects were inspected to match the sample
vehicle names. Additional Unsplash source assets:

- Tesla Model 3: https://images.unsplash.com/photo-1560958089-b8a1929cea89
- Honda CR-V: https://images.unsplash.com/photo-1519641471654-76ce0107ad1b
- Chevrolet Camaro: https://images.unsplash.com/photo-1552519507-da3b142c6e3d

## DENEB CORE COMPONENT REQUESTS

None essential for this review stage. Existing Deneb components plus
template-specific composition fulfill Inventory. There is no dependent feature
waiting for a framework PR.
