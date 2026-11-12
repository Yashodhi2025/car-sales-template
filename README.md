This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sri Lankan content

Site copy and editable fields live in `src/data/site-data.json`. The template
uses English for Sri Lanka, LKR prices, kilometres and Sri Lanka viewing times.
Vehicle specifications and demo prices have not been changed to imply local
registration, import status or current market values.

Before launch, configure `content.common.business` (phone/email),
`content.home.contact` (matching telephone/email links) and
`content.showrooms.flagship` (actual showroom address). The `+94 XX XXX XXXX`
placeholder opens the enquiry form instead of a phone dialler. No real local
address, telephone number or WhatsApp account is assumed.

The calculator uses sample editable defaults for a reducing-balance loan;
it is not a leasing quotation or an advertised lender rate. Viewing requests
open an email draft for the visitor to send and require dealership confirmation.

## Template validation and packaging

Run `npm run validate` to check an isolated source snapshot, or
`npm run validate-and-zip` to validate and create the upload ZIP.

Browser QA scripts store screenshots, reports, and browser profiles in
`.cache/qa/`. Deneb excludes `.cache/` from validation snapshots and ZIPs;
it does not use `.gitignore` to exclude `.qa/`. Keep generated QA files under
`.cache/qa/` so they do not count toward the 2,000-entry template ZIP limit.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
