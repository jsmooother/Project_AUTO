# Next.js and SWC Version Pinning (Deterministic Builds)

## Why This Matters

Next.js uses platform-specific `@next/swc-*` binaries (e.g. `@next/swc-darwin-arm64` on Mac M1/M2). If Next.js and these SWC packages are not **exactly** the same version, you can get:

- **404 when downloading SWC tarball:** Next tries to fetch a version that doesn’t exist on npm
- **Mismatch warnings:** Build logs show `Mismatching @next/swc version, detected: X while Next.js is on Y`
- **Flaky builds:** Works on some machines, fails on others depending on cache or installed versions

## Solution: Version Alignment

Next.js and **all** `@next/swc-*` packages must use the **same exact version**. This is enforced via `pnpm.overrides` in the root `package.json`:

- `next`
- `eslint-config-next`
- `@next/swc-darwin-arm64`
- `@next/swc-darwin-x64`
- `@next/swc-linux-x64-gnu`
- `@next/swc-linux-x64-musl`
- `@next/swc-linux-arm64-gnu`
- `@next/swc-linux-arm64-musl`
- `@next/swc-win32-x64-msvc`
- `@next/swc-win32-arm64-msvc`

**Current pinned version:** `15.5.2` (chosen because `@next/swc-darwin-arm64@15.5.2` is published; `15.5.11` was not available and caused 404 on Mac).

## If You See a 404 for an SWC Tarball

1. **Confirm the failing version** (e.g. `@next/swc-darwin-arm64@15.5.11`).
2. **Check npm** that the SWC package exists for that version:  
   https://www.npmjs.com/package/@next/swc-darwin-arm64?activeTab=versions
3. **Pick a published version** (e.g. `15.5.2`) and update:
   - Root `package.json` → `pnpm.overrides` (all `next` and `@next/swc-*` entries)
   - `apps/web/package.json` → `next` dependency
4. **Reinstall:**
   ```bash
   pnpm install
   ```
5. **Verify:**
   ```bash
   cd apps/web && rm -rf .next && cd ../.. && pnpm --filter @repo/web build
   ```

## Clean Build Commands

- **Clear cache and build:**
  ```bash
  pnpm --filter @repo/web build:clean
  ```
  Or manually:
  ```bash
  cd apps/web && rm -rf .next && cd ../.. && pnpm --filter @repo/web build
  ```
- **Clear cache and start dev:**
  ```bash
  pnpm --filter @repo/web dev:clean
  ```
