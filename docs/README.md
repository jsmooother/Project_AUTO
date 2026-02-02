# Docs

## Quick reference

### Getting started
- **Architecture:** [02_architecture_overview.md](02_architecture_overview.md)
- **Local dev setup:** [18_local_dev_setup.md](18_local_dev_setup.md) · [23_local_docker_setup.md](23_local_docker_setup.md)

### Auth & Web App
- **Auth (Phase 1):** [31_phase1_auth_test_guide.md](31_phase1_auth_test_guide.md) — Signup, login, logout, session, `/auth/me`
- **UI phases 2–4:** [32_phases_2_4_ui_checklist.md](32_phases_2_4_ui_checklist.md) — App shell, pages, shared API client, manual test checklist

### Admin
- **Admin testing:** [29_admin_testing.md](29_admin_testing.md) — Admin API + UI, `x-admin-key`, curl examples
- **Admin Figma:** [28_admin_figma_discovery.md](28_admin_figma_discovery.md)

### Templates & Runs
- **Templates testing:** [27_templates_testing.md](27_templates_testing.md) — Config, previews, approve workflow
- **Templates spec:** [08_templates_and_rendering.md](08_templates_and_rendering.md)

### API & Data
- **API spec:** [16_api_spec.md](16_api_spec.md) — Current endpoints (auth, onboarding, inventory, runs, templates, admin)
- **Data model:** [04_data_model.md](04_data_model.md)
- **Queue / jobs:** [05_queue_and_jobs.md](05_queue_and_jobs.md)

### Validation & Testing
- **Local validation:** [22_local_validation.md](22_local_validation.md)
- **Onboarding testing:** [24_onboarding_testing.md](24_onboarding_testing.md)
- **Stub crawl:** [26_stub_crawl_testing.md](26_stub_crawl_testing.md)

---

## Run commands

- **Install:** `pnpm install`
- **Build:** `pnpm build` (web: `NODE_ENV=production next build` for clean prod build)
- **Migrations:** `pnpm --filter @repo/db db:migrate`
- **Dev (all):** `pnpm dev`
- **API only:** `pnpm --filter @repo/api dev` (port 3001)
- **Web only:** `pnpm --filter @repo/web dev` (port 3000)
- **Worker only:** `pnpm --filter @repo/worker dev`

## Env (packages)

- **@repo/db:** `DATABASE_URL`
- **@repo/queue:** `REDIS_URL`
- **API:** `COOKIE_SECRET`, `PORT`
- **Web:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SHOW_ADMIN_LINK`
- **Admin:** `ADMIN_API_KEY`, `ALLOW_INSECURE_ADMIN` (dev)
- **Worker:** `HEADLESS_ENABLED`, `HEADLESS_PROVIDER`, `WORKER_CONCURRENCY`, etc.

---

## Branch summaries

- **task-2-guard-removals-on-low-discovery:** [branch-task-2-guard-removals.md](branch-task-2-guard-removals.md)
- **review/codex-findings/tasks-3-5:** [branch-review-codex-findings-tasks-3-5.md](branch-review-codex-findings-tasks-3-5.md)
