/**
 * CREATIVE_GENERATE job: Generate creative images with overlays for Meta ads.
 * 
 * Generates images in multiple formats:
 * - feed: 1.91:1 (e.g., 1200x628)
 * - story/reel: 9:16 (e.g., 1080x1920)
 * - square: 1:1 (e.g., 1080x1080) - optional
 */

import { db } from "../lib/db.js";
import { inventoryItems, creativeAssets, customerBranding } from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";
import { eq, and, inArray } from "drizzle-orm";
import sharp from "sharp";
import { uploadBuffer, CREATIVES_BUCKET, isStorageConfigured } from "../lib/storage.js";

export interface CreativeGeneratePayload {
  customerId: string;
  inventoryItemIds: string[];
  variants?: Array<"feed" | "story" | "reel" | "square">;
}

const DEFAULT_VARIANTS: Array<"feed" | "story" | "reel" | "square"> = ["feed", "story"];

// Target dimensions for each variant
const VARIANT_DIMENSIONS = {
  feed: { width: 1200, height: 628 }, // 1.91:1
  story: { width: 1080, height: 1920 }, // 9:16
  reel: { width: 1080, height: 1920 }, // 9:16 (same as story)
  square: { width: 1080, height: 1080 }, // 1:1
} as const;

export async function processCreativeGenerate(job: QueuedJob<CreativeGeneratePayload>): Promise<void> {
  const { payload, correlation } = job;
  const { customerId } = correlation;
  const { inventoryItemIds, variants = DEFAULT_VARIANTS } = payload;

  if (!customerId) {
    await job.deadLetter("Missing correlation: customerId required");
    return;
  }

  if (!isStorageConfigured()) {
    await job.deadLetter("STORAGE_NOT_CONFIGURED: Supabase Storage required for creative generation");
    return;
  }

  if (!inventoryItemIds || inventoryItemIds.length === 0) {
    await job.deadLetter("No inventory items provided");
    return;
  }

  try {
    // Get customer branding (logo)
    const [branding] = await db
      .select()
      .from(customerBranding)
      .where(eq(customerBranding.customerId, customerId))
      .limit(1);

    const logoUrl = branding?.logoUrl ?? null;

    // Get inventory items
    const items = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          inArray(inventoryItems.id, inventoryItemIds)
        )
      );

    if (items.length === 0) {
      await job.deadLetter("No inventory items found");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      // Extract image URL from detailsJson
      const detailsJson = item.detailsJson as Record<string, unknown> | null;
      let sourceImageUrl: string | null = null;

      if (detailsJson?.primaryImageUrl && typeof detailsJson.primaryImageUrl === "string") {
        sourceImageUrl = detailsJson.primaryImageUrl;
      } else if (detailsJson?.images && Array.isArray(detailsJson.images) && detailsJson.images.length > 0) {
        const firstImage = detailsJson.images[0];
        sourceImageUrl = typeof firstImage === "string" ? firstImage : String(firstImage);
      }

      if (!sourceImageUrl || !sourceImageUrl.startsWith("http")) {
        console.log(
          JSON.stringify({
            event: "creative_generate_skipped",
            customerId,
            inventoryItemId: item.id,
            reason: "No valid source image URL",
          })
        );
        failCount++;
        continue;
      }

      // Generate each variant
      for (const variant of variants) {
        try {
          const result = await generateCreativeVariant({
            customerId,
            inventoryItemId: item.id,
            sourceImageUrl,
            variant,
            logoUrl,
            item,
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.log(
            JSON.stringify({
              event: "creative_generate_failed",
              customerId,
              inventoryItemId: item.id,
              variant,
              error: message,
            })
          );
          failCount++;
        }
      }
    }

    console.log(
      JSON.stringify({
        event: "creative_generate_complete",
        customerId,
        successCount,
        failCount,
        totalItems: items.length,
      })
    );

    await job.ack();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await job.deadLetter(`Creative generation failed: ${message}`);
  }
}

async function generateCreativeVariant({
  customerId,
  inventoryItemId,
  sourceImageUrl,
  variant,
  logoUrl,
  item,
}: {
  customerId: string;
  inventoryItemId: string;
  sourceImageUrl: string;
  variant: "feed" | "story" | "reel" | "square";
  logoUrl: string | null;
  item: typeof inventoryItems.$inferSelect;
}): Promise<{ success: boolean; error?: string }> {
  const dimensions = VARIANT_DIMENSIONS[variant];
  const { width, height } = dimensions;

  try {
    // Download source image
    const imageResponse = await fetch(sourceImageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProjectAuto/1.0)",
      },
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!imageResponse.ok) {
      return { success: false, error: `Failed to download image: ${imageResponse.status}` };
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Load image with sharp
    let image = sharp(imageBuffer);

    // Resize and crop to target aspect ratio (cover strategy)
    image = image.resize(width, height, {
      fit: "cover",
      position: "center",
    });

    // Extract item data for overlay text
    const detailsJson = item.detailsJson as Record<string, unknown> | null;
    const title = item.title ?? (detailsJson?.title as string) ?? "Vehicle";
    const price = item.price ?? (detailsJson?.priceAmount as number) ?? null;
    const mileageKm = detailsJson?.mileageKm as number | undefined;

    // Format price (assume SEK)
    const priceText = price ? `${Math.round(price).toLocaleString("sv-SE")} SEK` : "";
    const mileageText = mileageKm ? `${mileageKm.toLocaleString("sv-SE")} km` : "";

    // Create overlay SVG for text and logo
    const svgOverlay = createOverlaySvg({
      width,
      height,
      logoUrl,
      title: title.substring(0, 50), // Truncate long titles
      priceText,
      mileageText,
      variant,
    });

    // Composite overlay onto image
    const finalImage = await image
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Upload to storage
    const storagePath = `${customerId}/${inventoryItemId}/${variant}.png`;
    const publicUrl = await uploadBuffer({
      bucket: CREATIVES_BUCKET,
      path: storagePath,
      contentType: "image/png",
      buffer: finalImage,
    });

    // Upsert creative_assets record
    const [existing] = await db
      .select()
      .from(creativeAssets)
      .where(
        and(
          eq(creativeAssets.inventoryItemId, inventoryItemId),
          eq(creativeAssets.variant, variant)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(creativeAssets)
        .set({
          generatedImageUrl: publicUrl,
          width,
          height,
          status: "generated",
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(creativeAssets.id, existing.id));
    } else {
      await db.insert(creativeAssets).values({
        customerId,
        inventoryItemId,
        type: "image",
        variant,
        sourceImageUrl,
        generatedImageUrl: publicUrl,
        width,
        height,
        status: "generated",
        updatedAt: new Date(),
      });
    }

    console.log(
      JSON.stringify({
        event: "creative_generated",
        customerId,
        inventoryItemId,
        variant,
        url: publicUrl,
      })
    );

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    
    // Update or create failed record
    const [existing] = await db
      .select()
      .from(creativeAssets)
      .where(
        and(
          eq(creativeAssets.inventoryItemId, inventoryItemId),
          eq(creativeAssets.variant, variant)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(creativeAssets)
        .set({
          status: "failed",
          errorMessage: message,
          updatedAt: new Date(),
        })
        .where(eq(creativeAssets.id, existing.id));
    } else {
      await db.insert(creativeAssets).values({
        customerId,
        inventoryItemId,
        type: "image",
        variant,
        sourceImageUrl,
        status: "failed",
        errorMessage: message,
        updatedAt: new Date(),
      });
    }

    return { success: false, error: message };
  }
}

function createOverlaySvg({
  width,
  height,
  logoUrl,
  title,
  priceText,
  mileageText,
  variant,
}: {
  width: number;
  height: number;
  logoUrl: string | null;
  title: string;
  priceText: string;
  mileageText: string;
  variant: string;
}): string {
  // Simple overlay design:
  // - Top-left: Logo (if available)
  // - Bottom area: Title, price, mileage
  // - Optional badge for new items

  const padding = 40;
  const logoSize = 80;
  const fontSize = variant === "feed" ? 32 : 28;
  const titleFontSize = variant === "feed" ? 48 : 36;

  // Background gradient for text readability
  const textBgHeight = variant === "feed" ? 200 : 250;
  const textBgY = height - textBgHeight;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Semi-transparent background for text area
  svg += `<rect x="0" y="${textBgY}" width="${width}" height="${textBgHeight}" fill="rgba(0,0,0,0.6)"/>`;

  // Logo (top-left)
  if (logoUrl) {
    svg += `<image href="${logoUrl}" x="${padding}" y="${padding}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  // Title (bottom area, left-aligned)
  svg += `<text x="${padding}" y="${textBgY + padding + titleFontSize}" font-family="Arial, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="white">${escapeXml(title)}</text>`;

  // Price and mileage (below title)
  let textY = textBgY + padding + titleFontSize + fontSize + 20;
  if (priceText) {
    svg += `<text x="${padding}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#FFD700">${escapeXml(priceText)}</text>`;
    textY += fontSize + 10;
  }
  if (mileageText) {
    svg += `<text x="${padding}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize - 4}" fill="white">${escapeXml(mileageText)}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
