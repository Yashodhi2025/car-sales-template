"use client";
"use client";
import { useSiteData } from "@deneb-ui/ui";
import siteData from "@/data/site-data.json";
import Image from "next/image";

export default function Home() {
  const siteData = useSiteData();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main
        data-preview-page-key="home"
        className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src={siteData?.content?.home?.nextJsLogoImage ?? "/next.svg"}
          alt={siteData?.content?.home?.imageAlt ?? "Next.js logo"}
          width={100}
          height={20}
          priority
          data-preview-field-path="home.nextJsLogoImage" />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1
            className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50"
            data-preview-field-path="home.title"
            data-preview-style-target="home.title"
            data-preview-style-type="text">{siteData?.content?.home?.title ?? "To get started, edit the file."}{siteData?.content?.home?.title ?? "To get started, edit the file."}
            <code
              className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]"
              data-preview-field-path="home.pageTsx"
              data-preview-style-target="home.pageTsx"
              data-preview-style-type="text">{siteData?.content?.home?.pageTsx ?? "page.tsx"}</code>{siteData?.content?.home?.title ?? "To get started, edit the file."}{siteData?.content?.home?.title ?? "To get started, edit the file."}</h1>
          <p
            className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400"
            data-preview-field-path="home.subtitle"
            data-preview-style-target="home.subtitle"
            data-preview-style-type="text">{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}
            <a
              href={siteData?.content?.home?.templatesUrl ?? "https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"}
              className="font-medium text-zinc-950 dark:text-zinc-50"
              target="_blank"
              rel="noopener noreferrer"
              data-preview-field-path={"home.templatesUrl"}
              data-preview-style-target="home.templatesLabel"
              data-preview-style-type="text">
              <span
                data-preview-field-path="home.templatesLabel"
                data-preview-style-target="home.templatesLabel"
                data-preview-style-type="text">{siteData?.content?.home?.templatesLabel ?? "Templates"}</span>
            </a>{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}
            <a
              href={siteData?.content?.home?.learningUrl ?? "https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"}
              className="font-medium text-zinc-950 dark:text-zinc-50"
              target="_blank"
              rel="noopener noreferrer"
              data-preview-field-path={"home.learningUrl"}
              data-preview-style-target="home.learningLabel"
              data-preview-style-type="text">
              <span
                data-preview-field-path="home.learningLabel"
                data-preview-style-target="home.learningLabel"
                data-preview-style-type="text">{siteData?.content?.home?.learningLabel ?? "Learning"}</span>
            </a>{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}{siteData?.content?.home?.subtitle ?? "Looking for a starting point or more instructions? Head over to or the center."}</p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href={siteData?.content?.home?.deployNowUrl ?? "https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"}
            target="_blank"
            rel="noopener noreferrer"
            data-preview-field-path={"home.deployNowUrl"}
            data-preview-style-target="home.deployNowLabel"
            data-preview-style-type="text">
            <Image
              className="dark:invert h-[14px] w-4"
              src={siteData?.content?.home?.vercelLogomarkImage ?? "/vercel.svg"}
              alt={siteData?.content?.home?.imageAlt2 ?? "Vercel logomark"}
              width={16}
              height={14}
              data-preview-field-path="home.vercelLogomarkImage" />
            <span
              data-preview-field-path="home.deployNowLabel"
              data-preview-style-target="home.deployNowLabel"
              data-preview-style-type="text">{siteData?.content?.home?.deployNowLabel ?? "Deploy Now"}</span>
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href={siteData?.content?.home?.documentationUrl ?? "https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"}
            target="_blank"
            rel="noopener noreferrer"
            data-preview-field-path={"home.documentationUrl"}
            data-preview-style-target="home.documentationLabel"
            data-preview-style-type="text">
            <span
              data-preview-field-path="home.documentationLabel"
              data-preview-style-target="home.documentationLabel"
              data-preview-style-type="text">{siteData?.content?.home?.documentationLabel ?? "Documentation"}</span>
          </a>
        </div>
      </main>
    </div>
  );
}
