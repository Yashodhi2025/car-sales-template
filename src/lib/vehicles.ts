import type { VanguardData, VehicleId } from "./site-content";
import { priceNumber } from "./inventory";

export const carPageKey = (id: string) => `car-${id}`;
export const carHref = (id: string) => `/cars/${encodeURIComponent(id)}`;
export const vehicleYear = (meta: unknown) => String(meta ?? "").match(/\b(?:19|20)\d{2}\b/)?.[0] || "";

export function vehiclePhotos(content: VanguardData["content"], id: VehicleId) {
  const photo = content.photos.vehicles[id];
  const prefix = `photos.vehicles.${id}`;
  // Keep empty gallery entries: merchants must still be able to select them.
  return [
    { image: photo.image0, imageAlt: photo.imageAlt, caption: photo.caption, imagePath: `${prefix}.image0`, captionPath: `${prefix}.caption` },
    ...(photo.gallery || []).map((entry, index) => ({ ...entry, imagePath: `${prefix}.gallery.${index}.image`, captionPath: `${prefix}.gallery.${index}.caption` })),
  ];
}

export function relatedVehicles(content: VanguardData["content"], id: VehicleId, limit = 3): VehicleId[] {
  const current = content.catalog[id];
  const price = priceNumber(content.cards.vehicles[id].price);
  const ids = Object.keys(content.cards.vehicles) as VehicleId[];
  const score = (other: VehicleId) => Number(content.catalog[other]?.brand === current?.brand) * 4 + Number(content.catalog[other]?.bodyType === current?.bodyType) * 2;
  const distance = (other: VehicleId) => {
    const candidate = priceNumber(content.cards.vehicles[other].price);
    return candidate === null || price === null ? Infinity : Math.abs(candidate - price);
  };
  return ids.filter(other => other !== id).sort((a, b) => score(b) - score(a) || distance(a) - distance(b) || ids.indexOf(a) - ids.indexOf(b)).slice(0, limit);
}
