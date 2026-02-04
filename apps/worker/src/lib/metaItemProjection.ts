/**
 * Meta-ready item projection
 * 
 * Projects inventory_items with details_json into Meta ad-ready format.
 */

import type { inventoryItems } from "@repo/db/schema";

type InventoryItem = {
  id: string;
  title: string | null;
  url: string | null;
  price: number | null;
  detailsJson: Record<string, unknown> | null;
};

export interface MetaProjectedItem {
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  destinationUrl: string;
  vehicleId: string;
}

/**
 * Project an inventory item for Meta ads
 */
export function projectInventoryItemForMeta(item: InventoryItem): MetaProjectedItem | null {
  if (!item.detailsJson) {
    return null;
  }

  // Extract title (from main field or details_json)
  let title = item.title?.trim() ?? "";
  if (!title && item.detailsJson.title && typeof item.detailsJson.title === "string") {
    title = item.detailsJson.title.trim();
  }
  if (!title) {
    return null; // Title is required
  }

  // Extract price (prefer details_json.priceAmount, fallback to main price field)
  let price = 0;
  if (item.detailsJson.priceAmount) {
    price = typeof item.detailsJson.priceAmount === "number" 
      ? item.detailsJson.priceAmount 
      : parseInt(String(item.detailsJson.priceAmount), 10);
  } else if (item.price) {
    price = item.price;
  }
  
  if (!price || price < 50000) {
    return null; // Price must be valid and >= 50k SEK
  }

  // Extract currency (default to SEK)
  const currency = (item.detailsJson.currency as string)?.toUpperCase() || "SEK";

  // Extract image URL (prefer primaryImageUrl, fallback to first image in array)
  let imageUrl = "";
  if (item.detailsJson.primaryImageUrl && typeof item.detailsJson.primaryImageUrl === "string") {
    imageUrl = item.detailsJson.primaryImageUrl;
  } else if (item.detailsJson.images && Array.isArray(item.detailsJson.images) && item.detailsJson.images.length > 0) {
    const firstImage = item.detailsJson.images[0];
    imageUrl = typeof firstImage === "string" ? firstImage : String(firstImage);
  }
  
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return null; // Image URL is required and must be absolute
  }

  // Extract destination URL
  const destinationUrl = item.url?.trim() ?? "";
  if (!destinationUrl || !destinationUrl.startsWith("http")) {
    return null; // Destination URL is required and must be absolute
  }

  // Generate stable vehicle ID (use inventory item ID)
  const vehicleId = item.id;

  return {
    title,
    price: Math.round(price),
    currency,
    imageUrl,
    destinationUrl,
    vehicleId,
  };
}

/**
 * Validate inventory item quality for Meta ads
 */
export function validateItemForMeta(item: InventoryItem): { valid: boolean; reason?: string } {
  if (!item.detailsJson) {
    return { valid: false, reason: "Missing details_json" };
  }

  // Check title
  const title = item.title?.trim() ?? (item.detailsJson.title as string)?.trim() ?? "";
  if (!title) {
    return { valid: false, reason: "Missing title" };
  }

  // Check price
  let price = 0;
  if (item.detailsJson.priceAmount) {
    price = typeof item.detailsJson.priceAmount === "number" 
      ? item.detailsJson.priceAmount 
      : parseInt(String(item.detailsJson.priceAmount), 10);
  } else if (item.price) {
    price = item.price;
  }
  
  if (!price || price < 50000) {
    return { valid: false, reason: `Invalid price: ${price} (must be >= 50,000)` };
  }

  // Check image
  let imageUrl = "";
  if (item.detailsJson.primaryImageUrl && typeof item.detailsJson.primaryImageUrl === "string") {
    imageUrl = item.detailsJson.primaryImageUrl;
  } else if (item.detailsJson.images && Array.isArray(item.detailsJson.images) && item.detailsJson.images.length > 0) {
    const firstImage = item.detailsJson.images[0];
    imageUrl = typeof firstImage === "string" ? firstImage : String(firstImage);
  }
  
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return { valid: false, reason: "Missing or invalid image URL" };
  }

  // Check URL
  const url = item.url?.trim() ?? "";
  if (!url || !url.startsWith("https")) {
    return { valid: false, reason: "Missing or invalid URL (must be HTTPS)" };
  }

  return { valid: true };
}
