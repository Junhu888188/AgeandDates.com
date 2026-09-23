# Redesign preview

This branch is a review version. Do not deploy until the owner approves the preview.

Changes: responsive homepage and shared English tool styling; equal-width year/month/day results; retained birthday countdown panel; SVG logo and favicon assets; calendar calculation corrections and inline validation.

Run `node calendar.test.cjs` and `node app.test.cjs`. The calendar tests also pass with TZ set to America/Los_Angeles and Pacific/Auckland. Handler tests use a DOM stub, not a browser. Static checks validate local links and required calculator elements.

Browser rendering is still pending: the cloud browser denied local-file navigation. Actual Safari/mobile testing is required before release. Review the equal-width age result, lower birthday panel and narrow-screen date fields.

`node build-preview.cjs` generates a self-contained offline review with all 16 pages and working calculators. Analytics is excluded from that review. The production homepage retains its existing GA4 tag.

Calendar convention: complete clamped calendar months followed by remaining days; 29 February anniversaries are observed on 28 February in non-leap years. This is not a legal age determination.

Brand assets are in `assets/`: scalable standalone and horizontal SVG marks, monochrome and reversed marks, SVG/ICO favicon, PNG sizes 16/32, and Apple touch icon 180. Horizontal wordmark glyphs are outlines based on DejaVu Sans; see the included font license.

Baseline: 868190d. Existing URLs and sitemap retained; tool-page canonical links now include their actual .html suffix. This release covers English pages. The four non-English P0 pages are outside this preview.
