import type { VanguardData, VehicleId } from "./site-content";

export const defaultFilters = {
  q: "", brand: "", bodyType: "", minPrice: "", maxPrice: "",
  fuel: "", transmission: "", availability: "", sort: "featured",
};
export type InventoryFilters = typeof defaultFilters;
export const sortKeys = ["featured", "price-low", "price-high", "newest", "oldest", "mileage"] as const;

export function parseFilters(search: string): InventoryFilters {
  const params = new URLSearchParams(search);
  const result = { ...defaultFilters };
  for (const key of Object.keys(result) as (keyof InventoryFilters)[]) {
    result[key] = (params.get(key) || result[key]).slice(0, 200);
  }
  if (!sortKeys.some(key => key === result.sort)) result.sort = "featured";
  return result;
}

export function filterQuery(filters: InventoryFilters) {
  const query = new URLSearchParams();
  for (const key of Object.keys(defaultFilters) as (keyof InventoryFilters)[]) {
    if (filters[key] !== defaultFilters[key]) query.set(key, filters[key]);
  }
  return query.toString();
}

export function priceNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string" || !value.trim() || !/\d/.test(value)) return null;
  const cleaned = value.replace(/[^\d.,-]/g, "").replaceAll(",", "");
  const number = Number(cleaned);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function invalidPrices(filters: InventoryFilters) {
  const min = filters.minPrice === "" ? null : Number(filters.minPrice);
  const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  return (min !== null && (!Number.isFinite(min) || min < 0))
    || (max !== null && (!Number.isFinite(max) || max < 0))
    || (min !== null && max !== null && min > max);
}

const normalized = (value: unknown) => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Filter against the same live editable fields the customer sees on each card. */
export function matchingVehicles(content: VanguardData["content"], filters: InventoryFilters): VehicleId[] {
  if (invalidPrices(filters)) return [];
  const cards = content.cards.vehicles;
  const ids = Object.keys(cards) as VehicleId[];
  const tokens = normalized(filters.q).trim().split(/\s+/).filter(Boolean);
  const matches = ids.filter(id => {
    const card = cards[id];
    const meta = content.catalog[id];
    if (filters.brand && meta?.brand !== filters.brand) return false;
    if (filters.bodyType && meta?.bodyType !== filters.bodyType) return false;
    if (filters.fuel && normalized(card.fuel) !== normalized(filters.fuel)) return false;
    if (filters.transmission && normalized(card.transmission) !== normalized(filters.transmission)) return false;
    if (filters.availability && normalized(card.availability) !== normalized(filters.availability)) return false;
    const price = priceNumber(card.price);
    if (filters.minPrice !== "" && (price === null || price < Number(filters.minPrice))) return false;
    if (filters.maxPrice !== "" && (price === null || price > Number(filters.maxPrice))) return false;
    const text = normalized([card.name, card.meta, card.details, card.fuel, card.transmission, meta?.brand, meta?.bodyType].join(" "));
    return tokens.every(token => text.includes(token));
  });
  const year = (id: VehicleId) => Number(String(cards[id].meta).match(/\b(?:19|20)\d{2}\b/)?.[0]) || 0;
  const mileage = (id: VehicleId) => priceNumber(cards[id].mileage);
  const compareNumbers = (a: number | null, b: number | null, descending = false) => {
    if (a === null) return b === null ? 0 : 1;
    if (b === null) return -1;
    return descending ? b - a : a - b;
  };
  return matches.sort((a, b) => {
    switch (filters.sort) {
      case "price-low": return compareNumbers(priceNumber(cards[a].price), priceNumber(cards[b].price));
      case "price-high": return compareNumbers(priceNumber(cards[a].price), priceNumber(cards[b].price), true);
      case "newest": return year(b) - year(a);
      case "oldest": return year(a) - year(b);
      case "mileage": return compareNumbers(mileage(a), mileage(b));
      default: return ids.indexOf(a) - ids.indexOf(b);
    }
  });
}
