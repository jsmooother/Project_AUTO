/**
 * Extractor layer: parse detail HTML into base fields + attributes + images.
 */

export interface ExtractResult {
  baseFields: {
    title: string | null;
    descriptionText: string | null;
    priceAmount: number | null;
    priceCurrency: string | null;
    primaryImageUrl: string | null;
  };
  attributesJson: Record<string, unknown>;
  imageUrls: string[];
}
