import type { Metadata } from "next";
import { notFound } from "next/navigation";
import initialSiteData from "@/data/site-data.json";
import { VanguardVehicle } from "@/components/vanguard-vehicle";
import type { VehicleId } from "@/lib/site-content";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(initialSiteData.content.cards.vehicles).map(slug => ({ slug }));
}
function knownVehicle(slug: string): slug is VehicleId {
  return Object.hasOwn(initialSiteData.content.cards.vehicles, slug);
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!knownVehicle(slug)) return {};
  return {
    title: `${initialSiteData.content.cards.vehicles[slug].name} | ${initialSiteData.content.common.websiteTitle}`,
    description: initialSiteData.content.vehicles[slug].description,
  };
}
export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!knownVehicle(slug)) notFound();
  return <VanguardVehicle key={slug} vehicleId={slug} />;
}
