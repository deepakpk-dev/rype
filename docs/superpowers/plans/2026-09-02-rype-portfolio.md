# Rype Standalone Portfolio Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, standalone HTML portfolio case study that presents Rype to prospective employers and clients.

**Architecture:** The deliverable is a root-level `portfolio.html` that contains all layout, styles, and static copy. It references only existing public repository images and external project URLs, so it remains independent from the Next.js runtime, API routes, authentication, and database. A focused Vitest file treats the presentation as a parsed HTML document and guards its required story, links, asset paths, accessibility hooks, and synthetic-data disclosure.

**Tech Stack:** Semantic HTML5, embedded CSS, native responsive design, repository public assets, Vitest 4, jsdom.

**Spec:** `docs/superpowers/specs/2026-09-02-rype-portfolio-design.md`

## Global Constraints

- Add `portfolio.html` at the repository root; it must open directly or be served statically without a build, API, database, auth, JavaScript framework, or new dependency.
- Attribute the work to `Deepak` and link exactly to `https://rype-one.vercel.app/` and `https://github.com/deepakpk-dev/rype`.
- Use only current repository-owned public assets through repository-relative paths.
- Do not alter the storefront, growth implementation, production deployment, application routes, or README.
- Do not portray seeded demo data as real customer outcomes, causal proof, or a winning treatment.
- Use a mobile-first, accessible layout with visible focus states, descriptive image alt text, and a `prefers-reduced-motion` fallback.
- Do not add dependencies, a build step, analytics integration, or unprovided personal contact details.

---

## File structure

- `portfolio.html`: Independent editorial case-study presentation, including semantic markup and all CSS.
- `__tests__/portfolio.test.ts`: Static presentation contract that parses `portfolio.html`, asserts mandatory content/links/accessibility hooks, and confirms referenced local assets exist.

---

### Task 1: Define the standalone presentation contract and editorial structure

**Files:**
- Create: `__tests__/portfolio.test.ts`
- Create: `portfolio.html`

**Interfaces:**
- Consumes: `public/readme-homepage.png`, `public/readme-growth-dashboard.png`, the approved design spec, and no application modules.
- Produces: a statically parseable `portfolio.html` with sections identified by `#overview`, `#product`, `#system`, and `#quality`.

- [ ] **Step 1: Write the failing static-contract test**

```ts
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const portfolioPath = resolve(process.cwd(), "portfolio.html");
const html = readFileSync(portfolioPath, "utf8");
const document = new DOMParser().parseFromString(html, "text/html");

describe("standalone Rype portfolio", () => {
  it("presents the approved case-study narrative", () => {
    expect(document.title).toContain("Rype");
    expect(document.querySelector("main h1")?.textContent).toMatch(/grocery storefront built to learn/i);
    expect(document.body.textContent).toContain("Deepak");
    expect(document.querySelectorAll("main section").length).toBeGreaterThanOrEqual(4);
    expect(document.querySelector("#overview")).not.toBeNull();
    expect(document.querySelector("#product")).not.toBeNull();
    expect(document.querySelector("#system")).not.toBeNull();
    expect(document.querySelector("#quality")).not.toBeNull();
  });

  it("links to the demo and source with safe new-tab behavior", () => {
    const urls = [...document.querySelectorAll<HTMLAnchorElement>("a")];
    for (const href of ["https://rype-one.vercel.app/", "https://github.com/deepakpk-dev/rype"]) {
      const link = urls.find((anchor) => anchor.href === href);
      expect(link).toBeDefined();
      expect(link?.target).toBe("_blank");
      expect(link?.rel).toContain("noopener");
    }
  });

  it("keeps image proof, accessibility hooks, and synthetic-data context intact", () => {
    const images = [...document.querySelectorAll<HTMLImageElement>("img")];
    expect(images.map((image) => image.getAttribute("src"))).toEqual(expect.arrayContaining([
      "public/readme-homepage.png",
      "public/readme-growth-dashboard.png",
    ]));
    expect(images.every((image) => image.alt.trim().length > 0)).toBe(true);
    expect(html).toContain("prefers-reduced-motion");
    expect(document.body.textContent).toMatch(/synthetic demo data/i);
    for (const image of images) {
      expect(existsSync(resolve(process.cwd(), image.getAttribute("src")!))).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the focused test to confirm the presentation is absent**

Run: `npm test -- __tests__/portfolio.test.ts`

Expected: FAIL with an `ENOENT` error for `portfolio.html`.

- [ ] **Step 3: Add the semantic, dependency-free HTML document**

Create `portfolio.html` with this document outline and no script requirement:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rype — Grocery storefront case study | Deepak</title>
    <style>
      /* all presentation CSS lives here */
    </style>
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to case study</a>
    <header>
      <a href="#content">Deepak <span>— Rype case study</span></a>
      <nav aria-label="Case study sections">
        <a href="#overview">Overview</a>
        <a href="#product">Product</a>
        <a href="#system">System</a>
        <a href="#quality">Quality</a>
      </nav>
    </header>
    <main id="content">
      <section id="overview"><h1>A grocery storefront built to learn.</h1></section>
      <section id="product"><h2>A market experience with operational depth.</h2></section>
      <section id="system"><h2>Learning is part of the product.</h2></section>
      <section id="quality"><h2>Measured engineering, stated honestly.</h2></section>
    </main>
    <footer><a href="https://github.com/deepakpk-dev/rype">Explore Rype on GitHub</a></footer>
  </body>
</html>
```

Use these exact narrative facts:

- Headline: `A grocery storefront built to learn.`
- Hero framing: an end-to-end commerce demo with a first-party, privacy-conscious growth layer.
- Product scope: catalog discovery, persistent cart, validated checkout, Prisma/Postgres order flow, and role-aware admin operations.
- Growth question: learn where shoppers drop out and test improvements without a third-party analytics platform or customer privacy compromise.
- System path: deterministic assignment → rendered exposure → allowlisted event → strict validation → Prisma/Postgres persistence → admin-only reporting.
- Experiment names: `Checkout reassurance`, `Free-shipping progress`, and `Related-product ranking`.
- Quality signals: Next.js 15, React 19, TypeScript, Prisma/PostgreSQL, Vitest, Playwright, and CI.
- Evidence qualification: seeded dashboard values are `Synthetic demo data`, plausible but non-conclusive, and must not be read as customer outcomes or a treatment winner.

Use `public/readme-homepage.png` in the hero/product chapter and `public/readme-growth-dashboard.png` in the evidence chapter. Set concise, descriptive `alt` values that state what each capture shows.

- [ ] **Step 4: Add navigation and outbound project actions**

Add a compact header with Deepak attribution, anchors to the four section identifiers, and repeat the two project destinations in the hero and footer:

```html
<a class="button button--primary" href="https://rype-one.vercel.app/" target="_blank" rel="noopener noreferrer">
  Explore the live demo <span aria-hidden="true">↗</span>
</a>
<a class="button button--secondary" href="https://github.com/deepakpk-dev/rype" target="_blank" rel="noopener noreferrer">
  View the source <span aria-hidden="true">↗</span>
</a>
```

Use visible, descriptive labels rather than icon-only links. Keep in-page links ordinary hash anchors so the presentation works without JavaScript.

- [ ] **Step 5: Run the focused test to verify the content contract**

Run: `npm test -- __tests__/portfolio.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the structural case study**

```text
git add portfolio.html __tests__/portfolio.test.ts
git commit -m "feat: add standalone Rype portfolio"
```

### Task 2: Apply the approved editorial visual system and responsive behavior

**Files:**
- Modify: `portfolio.html`
- Modify: `__tests__/portfolio.test.ts`

**Interfaces:**
- Consumes: semantic regions and project actions created in Task 1.
- Produces: an independently usable mobile and desktop presentation with keyboard-visible navigation and motion-safe styling.

- [ ] **Step 1: Extend the test with presentation hooks before styling**

Add these assertions to `__tests__/portfolio.test.ts`:

```ts
it("includes responsive and keyboard-accessible presentation hooks", () => {
  expect(document.querySelector(".skip-link")?.getAttribute("href")).toBe("#content");
  expect(html).toContain(":focus-visible");
  expect(html).toContain("@media (min-width: 768px)");
  expect(html).toContain("@media (prefers-reduced-motion: reduce)");
  expect(document.querySelector("[aria-label='Rype growth-system flow']")).not.toBeNull();
});
```

- [ ] **Step 2: Run the focused test and confirm the new visual hooks fail**

Run: `npm test -- __tests__/portfolio.test.ts`

Expected: FAIL because the desktop media query and accessible growth-system diagram are not yet present.

- [ ] **Step 3: Implement mobile-first visual tokens and editorial spacing**

In the document’s existing `<style>` block, define the Rype system with CSS custom properties and base rules:

```css
:root {
  --cream: #fff8ec;
  --ink: #1b2a1f;
  --muted: #6b7a6e;
  --line: #e8e3d6;
  --leaf: #558b2f;
  --orange: #f39c12;
  --yellow: #f4d03f;
  --page: min(1120px, calc(100% - 2rem));
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--cream); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
.display { font-family: Georgia, "Times New Roman", serif; letter-spacing: -0.055em; }
.skip-link { position: fixed; left: 1rem; top: -4rem; z-index: 10; }
.skip-link:focus { top: 1rem; }
a:focus-visible { outline: 3px solid var(--orange); outline-offset: 4px; }
```

Build the hero as a cream editorial field with a narrow colored rule, large serif headline, compact ordinal/kicker, and a rounded storefront image frame. Style chapter labels, capability cards, experiment cards, and the footer with restrained borders and green/orange/yellow highlights. Do not use a font request, CSS framework, or external asset.

- [ ] **Step 4: Add the accessible text-backed system diagram and quality grid**

Inside `#system`, add a visual sequence with an explicit label and text that remains readable if styles are unavailable:

```html
<div class="system-flow" aria-label="Rype growth-system flow" role="img">
  <div><span>01</span><strong>Assign</strong><p>Stable control or treatment.</p></div>
  <span aria-hidden="true">→</span>
  <div><span>02</span><strong>Expose</strong><p>Count only rendered UI.</p></div>
  <span aria-hidden="true">→</span>
  <div><span>03</span><strong>Validate</strong><p>Allowlisted first-party events.</p></div>
  <span aria-hidden="true">→</span>
  <div><span>04</span><strong>Learn</strong><p>Trusted conversion and reporting.</p></div>
</div>
```

In `#quality`, render the technology signals as ordinary text, pair the dashboard image with its caption, and make the synthetic-demo caveat visually prominent without turning it into a success claim.

- [ ] **Step 5: Implement narrow-to-wide layouts and motion preferences**

Keep sections single-column by default. At 768px and above, use grids only for hero, feature/media, system-flow, experiment cards, and the quality evidence pair. Ensure media uses `max-width: 100%; height: auto`, the header wraps safely, card copy does not rely on fixed heights, and actions remain at least comfortably tappable.

Add the exact motion safeguard:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 6: Run focused verification and inspect the standalone file**

Run:

```text
npm test -- __tests__/portfolio.test.ts
npm run lint
```

Expected: Both commands exit 0. Then open `portfolio.html` directly in a desktop browser and at a narrow mobile viewport. Verify the two images load, all four navigation anchors land on their sections, each external action opens the approved URL, keyboard focus is visible, and no section overflows horizontally.

- [ ] **Step 7: Commit the finished visual presentation**

```text
git add portfolio.html __tests__/portfolio.test.ts
git commit -m "style: polish Rype portfolio case study"
```

### Task 3: Final standalone quality gate

**Files:**
- Verify only: `portfolio.html`, `__tests__/portfolio.test.ts`

**Interfaces:**
- Consumes: the completed static presentation and its content contract.
- Produces: recorded proof that the presentation remains standalone, scoped, and repository-clean.

- [ ] **Step 1: Verify the HTML contains no application-runtime dependency**

Run:

```text
rg -n "next/|react|<script|api/|DATABASE_URL|AUTH_SECRET" portfolio.html
```

Expected: no matches. The file is static and does not depend on the application runtime, API, database, or auth.

- [ ] **Step 2: Run project checks proportionate to the static addition**

Run:

```text
npm test -- __tests__/portfolio.test.ts
npm run lint
npm run typecheck
```

Expected: all commands exit 0. If typecheck reports missing generated `.next/types`, run `npm run build` once and repeat `npm run typecheck` as documented in `AGENTS.md`.

- [ ] **Step 3: Check scope and accidental generated artifacts**

Run:

```text
git diff --check
git status --short
```

Expected: no whitespace errors. The committed presentation changes are limited to `portfolio.html` and `__tests__/portfolio.test.ts`; do not stage `.superpowers/brainstorm/`, `AGENTS.md`, local environment files, or generated output.

- [ ] **Step 4: Commit final verification changes only if any were necessary**

If a verification change was necessary, commit only the intentional presentation/test files:

```text
git add portfolio.html __tests__/portfolio.test.ts
git commit -m "test: verify standalone portfolio presentation"
```

If no files changed during verification, do not create an empty commit.

## Final acceptance evidence

- `portfolio.html` opens directly and needs no runtime or added dependency.
- The case study is visibly attributed to Deepak and links to the live demo and source repository.
- The case study includes product scope, growth premise, system path, all three experiments, quality stack, and synthetic-demo qualification.
- The visual system reflects Rype’s cream, ink, leaf, orange, and yellow editorial language and works from mobile to desktop.
- Images use existing local project assets and preserve descriptive alternative text.
- Keyboard navigation, visible focus, reduced-motion preference, and responsive styling are covered by the static contract and manual browser check.
- Focused tests, lint, and TypeScript checks have successful recorded output before handoff.
