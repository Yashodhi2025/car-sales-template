"use client";

import { useEffect } from "react";
import { SiteDataProvider, ThemeStyles, syncThemeToDocument, useSiteData } from "@deneb-ui/ui";
import initialSiteData from "@/data/site-data.json";

// Deneb's CommonJS barrel mixes server-safe and client components. Keep its
// provider boundary explicit for Next 16's server renderer/static exporter.
export function SiteProviders({ children }: { children: React.ReactNode }) {
  return <SiteDataProvider initialSiteData={initialSiteData}>
    <LiveTheme />
    {children}
  </SiteDataProvider>;
}

function LiveTheme() {
  const data = useSiteData<typeof initialSiteData>();
  const theme = data.template.structure.theme;
  useEffect(() => { syncThemeToDocument(theme); }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.vanguardMotion = String(Boolean(data.content.motion.enabled));
  }, [data.content.motion.enabled]);
  return <ThemeStyles theme={theme} enableDualMode={false} />;
}
