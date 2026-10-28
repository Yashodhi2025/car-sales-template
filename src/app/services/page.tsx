import type { Metadata } from "next";
import { VanguardServices } from "@/components/vanguard-services";
import siteData from "@/data/site-data.json";

export const metadata: Metadata = {
  title: `Services | ${siteData.content.common.websiteTitle}`,
  description: siteData.content.services.description,
};
export default function ServicesPage() { return <VanguardServices />; }
