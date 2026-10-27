# Stage 4 — contact, viewing and editorial polish

The template remains frontend-only. No API, database, booking service, payment,
authentication, additional dependency, commit or push was introduced.

## Browser review

- [Contact](http://127.0.0.1:4173/contact)
- [Contact with a selected BMW](http://127.0.0.1:4173/contact?vehicle=bmw-m5)
- [Porsche viewing request](http://127.0.0.1:4173/cars/porsche-panamera#request-viewing)
- [About](http://127.0.0.1:4173/about)
- [Deneb Local Test Lab](http://127.0.0.1:4174)

The existing Lab/development servers on 4174/4173 were reused. Do not start a
second development server alongside Lab. QA closes only its temporary browser.

## Implemented behavior

Contact has an editorial hero, local automotive imagery, showroom/email/phone
details, explicit demo notices and a validated inquiry composer. The composer
includes name, email, optional phone, inquiry type, optional selected vehicle and
message. Vehicle-detail inquiries preselect the vehicle from the existing query
parameter. Unknown IDs are ignored and visitors can change the selection.

Every vehicle page now has an inline viewing panel. Existing editable viewing CTA
paths point to `#request-viewing`. The panel shows that vehicle's supplied name,
year and specification and accepts name, email, phone, preferred date/time and an
optional message. Required fields and email/phone formats are checked. Past dates
are rejected both by the native date minimum and submission validation. The date
minimum uses the visitor's local calendar day; time is explicitly a preferred
local showroom time, not a live availability slot. Submission rechecks today's
date, including when a page has remained open overnight.

Valid submissions construct an encoded `mailto:` URI with the entered details and
vehicle context, then open it using a real link. The website sends nothing and
confirms no appointment. A visible draft state explains that the visitor must send
the email, offers another draft link and provides selectable draft text if no mail
application is configured. Changing form values clears the previous draft state.
Form data is not persisted in browser storage or submitted to a remote service.

About retains existing philosophy/benefit/experience fields and adds editorial
photography, a point-of-view section, an honest demonstration disclosure, a
three-step customer journey and Inventory/Contact CTAs. No history, awards,
certifications or additional reviews were invented.

Shared polish adds staggered scroll reveals, editorial image hover, keyboard card
focus, active navigation and refined interactions. Merchant motion controls enable
or disable motion and adjust scroll-reveal duration. The duration is constrained
to 150–1200ms; zero/invalid duration uses the default. Content is visible by default,
reduced motion is respected and editing iframes do not run page animations.

## Deneb / Fivora

The installed `EditableContactForm` API and implementation were inspected. Its
built-in transport assumes WhatsApp or an API, fixes the field layout and reports
delivery success. The required mailto flow and automotive fields are composed
with native controls and existing Deneb `EditableText`, `EditableLink`,
`EditableImage` and `EditableShowroomCard` primitives instead. This is
template-specific form logic, not a duplicate framework form abstraction.

Existing provider, gallery/dialog, card fields, page keys and selected-page link
behavior are preserved. New copy lives in `contact`, `about`, `requests`, `viewing`
and `motion` source objects. The schema exposes image controls, journey collections,
boolean motion and numeric duration controls. Placeholders, select-option copy,
email subjects and nonvisual labels are explicitly control-only fields. On-canvas
labels/headings/helpers/errors use actual Deneb components. Error and draft targets
remain mounted when hidden or empty; zero values are rendered as text.

The real Lab iframe verifies live Contact headings, form labels/placeholders,
helper text, button copy, hero imagery, saved text styles, viewing copy/date labels,
About story/journey/photo/CTA edits, click selection, empty/zero targets and a false
motion setting. Across all 12 routes, all 480 expected source-backed on-canvas
fields are mounted. QA changes are ephemeral and restored without saving over the
merchant data file. Site-data source values are also checked in the static build.

Regenerate the manifest after changing content structure with:

```text
node scripts/sync-editor-schema.mjs
```

## Changed files

Application and content:

- `src/components/vanguard-contact.tsx`
- `src/components/vanguard-about.tsx`
- `src/components/vanguard-vehicle.tsx`
- `src/components/inquiry-form.tsx` (new)
- `src/components/vehicle-viewing.tsx` (new)
- `src/lib/inquiries.ts` (new)
- `src/components/use-page-effects.ts`
- `src/components/site-providers.tsx`
- `src/app/globals.css`
- `src/data/site-data.json`
- `fivora-template.json`

Schema and verification:

- `scripts/sync-editor-schema.mjs`
- `scripts/browser-session.mjs` (textarea support)
- `scripts/check-stage4.mjs` (new)
- `scripts/inquiries.test.mjs` (new)
- `scripts/check-vehicles.mjs`
- `scripts/vehicles.test.mjs`
- `scripts/check-inventory.mjs`
- `scripts/check-export.mjs`
- `STAGE-4-NOTES.md` (new)

## Focused verification

```text
node node_modules/typescript/bin/tsc --noEmit
npm run build
node --test --test-isolation=none scripts/inventory.test.mjs scripts/vehicles.test.mjs scripts/inquiries.test.mjs
node scripts/check-stage4.mjs http://127.0.0.1:4173 --lab
node scripts/check-vehicles.mjs http://127.0.0.1:4173 --lab
node scripts/check-home.mjs http://127.0.0.1:4173
node scripts/check-inventory.mjs http://127.0.0.1:4173 --lab
node scripts/check-export.mjs
```

Run browser scripts sequentially; they share a temporary browser debugging port.
Results/screenshots are in ignored `.qa/`. Tests intercept mailto clicks only in
the QA browser, verify the actual generated URI and avoid launching a mail app or
sending a message. Production checks serve emitted files, including all eight
vehicle routes. With JavaScript disabled, forms stay disabled, explain their
limitation and retain direct email links; vehicle specifications/gallery links
remain available. No repeated full Deneb CLI validation is needed for this stage.

Final results: TypeScript and the static production build passed, along with
18 logic tests, 41 Stage 4 browser/Lab checks, 75 vehicle/Lab checks, 23 homepage
checks, 42 Inventory/Lab checks and 42 production-export checks. Browser checks
reported no uncaught exceptions or console errors. Responsive checks cover
320, 390, 768, 1024 and 1440px widths with bounded SVGs and no horizontal overflow.

## Remaining limitations

Mailto behavior depends on the visitor's configured email application and its URI
length limits. The selectable draft text provides a manual fallback. Contact
details remain clearly labelled demonstration data; replace the reserved
`.example` address and demo phone before launch. Viewing dates/times are requests
only and require a human confirmation. Advanced business scheduling and delivery
are intentionally outside this frontend template. Existing demonstration and
model-reference vehicle photography remains labelled accordingly.

## DENEB CORE COMPONENT REQUESTS

None essential. Existing editable primitives and template-specific composition
fulfill Stage 4. No work in `deneb-core`, published packages or `node_modules`
is required.
