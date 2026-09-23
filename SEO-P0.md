# P0 multilingual rollout

Implements the four approved validation pages from the 2026-09-19 second-round brief. No P1/P2 expansion or business-day calculator is included.

| Language | Page | English equivalent |
| --- | --- | --- |
| id | /id/kalkulator-umur/ | / |
| id | /id/kalkulator-selisih-tanggal/ | /days-between-dates.html |
| pt-BR | /pt-br/somar-dias-a-uma-data/ | /date-calculator.html |
| de | /de/altersrechner/ | / |

Each page contains static localized content, 3 worked examples, 5 distinct FAQs, local input/result/error/copy text, a self-canonical, reciprocal language alternates including x-default, and WebApplication/BreadcrumbList JSON-LD. Existing English pages expose language links; the homepage links to all four pages. Sitemap includes the four canonical URLs. Legal documents linked from local footers are explicitly labeled English.

Generate with `python build-localized.py`. Runtime uses shared `calendar.js` and isolated `localized.js`; English calculator behavior is unchanged. Input formats are DD/MM/YYYY (ID), DD/MM/AAAA (BR), and TT.MM.JJJJ (DE). Browser date pickers are intentionally replaced by labeled numeric text fields so browser locale cannot silently change these formats.

Run `node localized.test.cjs`, `python check-localized.py`, `node calendar.test.cjs`, and `node app.test.cjs`. Localized checks passed under default time zone, America/Sao_Paulo, Europe/Berlin, and Asia/Jakarta. DOM interaction and real device layout require browser checks in addition to these tests. No independent native-speaker review or Core Web Vitals measurement is claimed.

Dates are processed locally and do not appear in URLs, persistent browser storage, or analytics. Local pages do not load GA4. Copying results writes the calculated text to the user's clipboard only on explicit click. Existing English GA4 is unchanged. Behavioral event tracking is deferred; this batch can be assessed by page/country/query in Search Console.

SEO reference: https://developers.google.com/search/docs/specialty/international/localized-versions (checked 2026-09-23). Only equivalent tool pages are grouped, and each group includes identical reciprocal annotations.

After release, inspect the four URLs in Search Console and check crawl/index status after 7–14 days. At 30 days compare impressions, queries, countries, clicks and average position per page. Do not claim indexing from deployment success. Search Console access and observations have not been fabricated. Expand only after real query signals support the next batch.
