/**
 * Vehicle detail extractor (minimal): Swedish keys + equipment list.
 * Uses generic extractor for base fields, augments attributes_json with vehicle-specific parsing.
 */

import type { FetchResult } from "../drivers/types.js";
import { extractGeneric } from "./generic.js";
import type { ExtractResult } from "./types.js";

const SWEDISH_LABELS: Array<{ key: string; patterns: RegExp[] }> = [
  { key: "regNr", patterns: [/reg\.?\s*nr\.?/i, /registreringsnummer/i] },
  { key: "miltal", patterns: [/miltal/i, /mil/i] },
  { key: "bransle", patterns: [/bränsle/i, /bransle/i] },
  { key: "vaxellada", patterns: [/växellåda/i, /vaxellada/i, /gearbox/i] },
  { key: "arsmodell", patterns: [/årsmodell/i, /arsmodell/i, /modellår/i] },
  { key: "fordonstyp", patterns: [/fordonstyp/i] },
  { key: "farg", patterns: [/färg/i, /farg/i] },
  { key: "marke", patterns: [/märke/i, /marke/i] },
  { key: "modell", patterns: [/modell/i] },
];

function extractLabelValue(html: string, labelPatterns: RegExp[]): string | null {
  for (const re of labelPatterns) {
    const escaped = re.source.replace(/\s+/g, "\\s+");
    const combined = new RegExp(`(?:${escaped})[\\s:]*([^<\\n]+)`, "i");
    const m = html.match(combined);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractEquipmentList(html: string): string[] {
  const features: string[] = [];
  const utrustningMatch = html.match(/utrustning[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (utrustningMatch?.[1]) {
    const liRegex = /<li[^>]*>([^<]*)<\/li>/gi;
    let m: RegExpExecArray | null;
    while ((m = liRegex.exec(utrustningMatch[1])) !== null) {
      const text = m[1]?.trim() ?? "";
      if (text.length > 0) features.push(text);
    }
  }
  const liRegex = /<li[^>]*>([^<]+)<\/li>/gi;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = liRegex.exec(html)) !== null && count < 50) {
    const text = (m[1] ?? "").replace(/<[^>]+>/g, "").trim();
    if (text.length > 2 && text.length < 200 && !features.includes(text)) {
      features.push(text);
      count++;
    }
  }
  return features.slice(0, 30);
}

export function extractVehicle(fetchResult: FetchResult): ExtractResult {
  const generic = extractGeneric(fetchResult);
  const html = fetchResult.body;
  const attrs: Record<string, unknown> = { ...generic.attributesJson };

  for (const { key, patterns } of SWEDISH_LABELS) {
    const value = extractLabelValue(html, patterns);
    if (value) attrs[key] = value;
  }

  const features = extractEquipmentList(html);
  if (features.length > 0) attrs.features = features;

  return {
    ...generic,
    attributesJson: attrs,
  };
}
