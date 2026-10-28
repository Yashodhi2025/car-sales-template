import '../fonts/deneb-fonts.css';
import './globals.css';
import './premium.css';
import { SiteProviders } from "@/components/site-providers";
import { VanguardShell } from "@/components/vanguard-shell";
import initialSiteData from "@/data/site-data.json";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: initialSiteData.content.common.websiteTitle,
  description: initialSiteData.content.common.shortDescription,
  icons: { icon: `${process.env.NEXT_PUBLIC_SITE_BASE_PATH || ""}/images/vanguard-mark.svg` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteProviders><VanguardShell>{children}</VanguardShell></SiteProviders>
      </body>
    </html>
  );
}
