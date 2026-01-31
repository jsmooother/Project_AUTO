# Templates and Rendering

## Template config
Stored as JSON:
- canvas size
- overlay positions
- font family + size
- color
- logo image key
- rules: fields to display (price/title), truncation, etc.

## Rendering pipeline
- Input: template config + item image + item fields
- Output:
  - preview image (storage key)
  - creative variants (optional)
- Must be deterministic.

## Storage
All assets and outputs go through storage adapter:
- templates/*
- repro/*
- creatives/*