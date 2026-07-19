# Task 4 Report: Growth provider, storefront instrumentation, and treatment UIs

## Status

Implemented Task 4 on `feature/growth-engineering`. The root provider initializes after hydration without gating children, all public storefront events use the existing strict schema and fail-open transport, and control branches preserve the storefront's existing visible behavior. Nothing was pushed, deployed, or sent to an external service.

## TDD evidence

### RED

Created `__tests__/growth/provider.test.ts` and `__tests__/growth/instrumentation.test.ts` before either pure production module existed.

Command:

```text
npm.cmd test -- __tests__/growth/provider.test.ts __tests__/growth/instrumentation.test.ts --pool=threads --maxWorkers=1
```

Result: FAIL as expected. Both suites failed import resolution because `@/lib/growth/provider` and `@/lib/growth/instrumentation` did not exist. No tests collected, establishing that the required provider initialization and event-building behavior was absent.

### GREEN

Added the minimal pure provider initialization/context builder and storefront instrumentation helpers, then reran the same focused command.

Result: PASS — 2 files, 8/8 tests.

Behaviors proved in the cycle:

- every registered experiment receives a deterministic assignment;
- assignments persist under `rype-growth-assignments-v1` and reload unchanged;
- assignments that do not match the current anonymous session are replaced;
- disabled storage is fail-open;
- public events receive session ID, all active assignments, first-touch attribution, event ID, and timestamp;
- price-band boundaries are stable;
- product-view properties use only the strict allowlist;
- add-to-cart properties use the post-mutation cart state, including existing quantities;
- checkout start and validated step properties use current catalog/cart totals.

### Compiler regression cycle

The first integrated typecheck failed at `PDPClient.tsx` because the React 19 `useRef` overload required an explicit initial value. Inspection confirmed the new once-only product-view ref was the sole source. Initializing it with `undefined` was the only change; the immediate typecheck rerun passed.

## Implementation

- Added one root `GrowthProvider` inside the existing session boundary and outside the existing catalog/storefront content. Children render on the first pass; analytics initializes in an effect.
- The provider exposes `ready`, `variant`, `track`, and `expose`. It attaches the existing anonymous identity, persisted assignments, attribution, generated event ID, and ISO time to every event before parsing it through `publicGrowthEventSchema` and sending it through the existing transport.
- Exposure delivery is deduplicated at provider scope before using the existing fail-open exposure transport. `ExperimentExposure` requests exposure only after the relevant rendered section mounts and the provider is ready.
- PDP product views and checkout starts use refs to remain once-only under Strict Mode effect replay and rerenders.
- PDP and card add-to-cart handlers read Zustand immediately after the existing synchronous mutation, then calculate subtotal and quantity from the real resulting cart plus current catalog.
- Related-product control order remains unchanged. Treatment uses the existing deterministic `rankRelatedProducts` copy and labels card adds as `recommendation`.
- The cart's existing progress presentation and `Checkout` CTA remain unchanged for control. Treatment renders the concise free-delivery treatment and uses `Continue to secure checkout`.
- Checkout exposes the two relevant checkout experiments only for a non-empty cart. It emits address after successful validation, delivery when advancing, and payment immediately inside the validated submit callback.
- Checkout reassurance is treatment-only and contains concise delivery, no-surprise-fees, and freshness-guarantee copy.

## Verification

- Focused Task 4 tests:
  - Command: `npm.cmd test -- __tests__/growth/provider.test.ts __tests__/growth/instrumentation.test.ts --pool=threads --maxWorkers=1`
  - Result: PASS — 2 files, 8/8 tests.
- Typecheck:
  - Command: `npm.cmd run typecheck`
  - Result: PASS — exit code 0.
- Lint:
  - Command: `npm.cmd run lint`
  - Result: PASS — exit code 0.
- Full unit suite:
  - Command: `npm.cmd test -- --pool=threads --maxWorkers=1 --reporter=dot`
  - Result: PASS — 16 files, 129/129 tests, exit code 0.
- Production build:
  - Command: `npm.cmd run build`
  - Result: PASS — exit code 0; 52 static pages generated. Prisma logged the expected missing-`DATABASE_URL` validation messages while the catalog queries used their existing static fallback.
- Storefront E2E, first sandbox attempt:
  - Command: `npm.cmd run e2e -- e2e/storefront.spec.ts`
  - Result: BLOCKED by the execution sandbox: `browserType.launch: spawn EPERM`. The stuck server child processes were identified by their exact PIDs and stopped before retrying.
- Storefront E2E, permitted browser retry with a disposable process-only secret:
  - Command: `$env:AUTH_SECRET='test-only-rype-growth-secret-2026'; npm.cmd run e2e -- e2e/storefront.spec.ts`
  - Result: PASS — Chromium 1/1, 7.6 s test time, 13.8 s overall, exit code 0. The secret was not saved or committed. Growth endpoint persistence logged missing-`DATABASE_URL` errors, while fail-open tracking preserved the full shopper flow.

## Files

Created:

- `lib/growth/GrowthProvider.tsx`
- `lib/growth/provider.ts`
- `lib/growth/instrumentation.ts`
- `components/growth/ExperimentExposure.tsx`
- `components/growth/FreeShippingProgress.tsx`
- `components/growth/CheckoutReassurance.tsx`
- `__tests__/growth/provider.test.ts`
- `__tests__/growth/instrumentation.test.ts`
- `.superpowers/sdd/task-4-report.md`

Modified:

- `app/layout.tsx`
- `app/products/[slug]/PDPClient.tsx`
- `app/checkout/page.tsx`
- `components/layout/CartDrawer.tsx`
- `components/product/ProductCard.tsx`

## Self-review

- React review: all new hooks are unconditional; effect dependencies are complete; effect replay is guarded; no subscription cleanup is required; treatment-only components use semantic text/list markup and existing design tokens.
- Provider review: assignments are compared with deterministic server-compatible values before reuse; storage, initialization, schema, and transport failures cannot gate or interrupt shopping; exposure keys are deduplicated only after readiness.
- Event review: all event builders return the discriminated public input type; the provider performs runtime schema validation; no customer, form, query-string, product name, or other free-form data is added.
- Cart review: metrics use subtotal (the existing event convention) and quantity count from known catalog items after mutation, not a stale render snapshot.
- Experiment review: control preserves the original related array, original cart progress markup, original CTA copy, checkout markup, prices, shipping math, and static catalog fallback.
- Scope review: no dependency, database schema, API route, auth flow, unrelated component, deployment, or external service was changed.
- Diff hygiene: final `git diff --check` is recorded below before commit; Windows line-ending notices are expected and not whitespace errors.

## Concerns

No known implementation blockers. In an environment without `DATABASE_URL`, growth POSTs return fail-open failures and therefore are not persisted even though the static storefront and E2E path work. A configured database is required to verify stored events/exposures end to end; that prerequisite is outside Task 4 and was deliberately not added.
