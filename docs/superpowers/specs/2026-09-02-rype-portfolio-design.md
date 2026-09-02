# Rype standalone portfolio presentation — design

## Purpose

Create a standalone HTML case-study presentation for **Deepak** that positions Rype as a thoughtful, end-to-end product build for prospective employers and clients. The presentation must be independent of the Next.js application runtime while using the project's existing, public visual assets.

## Deliverable

Add `portfolio.html` at the repository root. It will be a self-contained responsive document with embedded CSS and minimal progressive-enhancement JavaScript. Opening the file directly or serving the repository statically must render the presentation; no build, API, database, authentication, or JavaScript framework is required.

Images will use repository-relative paths to the existing storefront and dashboard captures. The presentation will link to:

- Live demo: `https://rype-one.vercel.app/`
- Source: `https://github.com/deepakpk-dev/rype`

## Audience and narrative

The primary audience is prospective employers and clients. The page uses an editorial case-study arc, giving equal weight to product judgment and engineering rigor:

1. **Opening statement** — Rype as “a grocery storefront built to learn,” credited to Deepak, with live-demo and source actions.
2. **The product** — a polished seasonal-grocery shopping experience, supported by the existing storefront image and a concise summary of customer-facing flows.
3. **The question** — how a small commerce team can learn where shoppers drop out without adding a third-party analytics platform or compromising privacy.
4. **The system** — the first-party growth layer: deterministic experiment assignment, exposure tracking, validated client events, trusted server-side order conversion, and admin-only reporting.
5. **Evidence and quality** — three clearly named experiments, synthetic-demo disclaimer, technology stack, tests, accessibility, and CI signals.
6. **Closing** — a concise invitation to explore the live product or source.

The presentation must never describe seeded demo numbers as real customer outcomes, causal proof, or a winning treatment.

## Visual direction

Use Rype's existing editorial product language rather than a generic developer-template aesthetic:

- warm cream background, dark ink text, leafy greens, orange, and yellow accents;
- large serif display headlines paired with a clean system sans-serif body face;
- broad whitespace, fine rules, ordinal labels, rounded media frames, and restrained color blocks;
- product photography/screenshots as proof points, not decorative wallpaper;
- content constrained to a readable desktop measure and stacked naturally on small screens.

The hero will establish the case-study pace, while later sections alternate between editorial text, media, capability cards, and one lightweight inline architecture diagram. The design remains readable with JavaScript disabled.

## Structure and components

`portfolio.html` will contain these semantically structured regions:

| Region | Content and behavior |
| --- | --- |
| Header | Deepak identification, project label, compact source link, and in-page navigation that collapses or wraps on small screens. |
| Hero | Project title, short positioning statement, category/role tags, live-demo and GitHub calls to action, and a storefront image. |
| Overview | Brief outcome-oriented introduction and a small capability summary. |
| Product chapter | Storefront screenshot and the public commerce features: catalog, cart, checkout, and admin operations. |
| Growth chapter | The product hypothesis plus an accessible, text-backed diagram of assignment, events, validation, persistence, and reporting. |
| Experiment cards | Three named, presentation-only cards with controlled-scope descriptions and primary metrics. |
| Quality chapter | Privacy boundaries, stack, and verification evidence, including the synthetic-data qualification. |
| Footer / CTA | Deepak attribution and repeated live-demo and source links. |

The document uses native anchors, buttons only where an action is local, accessible focus states, visible link labels, semantic headings, and descriptive alt text. It avoids custom animation controls or state that could interfere with keyboard users.

## Data, assets, and errors

All content is static and derived from the repository's current README and public assets. There are no dynamic requests or data transformations. The two screenshots are non-sensitive, repository-owned portfolio assets. If an image cannot load, its surrounding section remains understandable through the image alt text and adjacent copy.

## Responsive and quality requirements

- Start from a single-column mobile layout; introduce two-column grids only when adequate width is available.
- Keep headings, body text, buttons, and navigation comfortably tappable and readable at narrow widths.
- Respect `prefers-reduced-motion`; any motion is optional, subtle, and nonessential.
- Provide sufficient color contrast and avoid relying on color alone to convey meaning.
- Verify the standalone document has no broken local asset paths, links to the specified destinations, and remains usable at mobile and desktop viewport widths.

## Scope boundaries

This task creates a portfolio presentation only. It does not alter the storefront, database, growth implementation, production deployment, application routes, or README. It will not introduce a new dependency, build step, analytics integration, or personal contact detail beyond Deepak's provided GitHub project link.
