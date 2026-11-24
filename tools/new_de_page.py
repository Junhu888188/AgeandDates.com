#!/usr/bin/env python3
"""Generate a German tool page: python3 tools/new_de_page.py tools/de_pages/SLUG.json [--sitemap] [--link].

Content HTML fields are trusted author-supplied markup. Plain text fields are escaped.
Use layout expanded (default) or compact to preserve the two existing page formats.
New pages include FAQPage JSON-LD by default; legacy fixtures opt out for byte parity.
related_title/description describe the page's related section; link_title/description
optionally override the incoming card (default: h1/lead). No build step is invoked.
"""
import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TEMPLATES = {
    'expanded': """<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  <link rel="canonical" href="{{canonical}}">
  <meta name="robots" content="index,follow">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/redesign.css">
  <link rel="stylesheet" href="/localized.css?v=20260930">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": {{json_title}},
        "url": "{{canonical}}",
        "inLanguage": "de",
        "description": {{json_description}},
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "isAccessibleForFree": true
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Age & Dates", "item": "https://ageanddates.com/"},
          {"@type": "ListItem", "position": 2, "name": {{json_title}}, "item": "{{canonical}}"}
        ]
      }
    ]
  }
  </script>
  <script src="/calendar.js" defer></script>
  <script src="{{script_url}}" defer></script>
{{faq_schema_html}}</head>
<body class="localized-page" data-localized="{{localized}}">
  <header class="site-header"><div class="wrap nav">
    <a class="brand" href="/de/altersrechner/"><img src="/assets/logo.svg" alt="" width="39" height="39">Age &amp; Dates<span class="brand-dot">.</span></a>
    <nav class="navlinks" aria-label="Weitere Rechner"><a href="#related">Weitere Rechner</a></nav>
  </div></header>
  <main><div class="wrap">
    <section class="local-hero">
      <div class="local-intro">
        <span class="hero-icon">{{hero_icon_html}}</span>
        <h1>{{h1}}</h1>
        <p class="local-lead">{{lead}}</p>
      </div>
      {{form_html}}
    </section>
    <section class="local-section detail-grid">
      <div class="method-card">{{method_html}}</div>
      <div class="local-faq">
        <h2>Häufige Fragen</h2>
        {{faq_html}}
      </div>
    </section>
    <section class="local-section" id="related">
      <h2>{{related_title}}</h2>
      <div class="related-grid">
        <a class="related-card" href="/de/altersrechner/"><span class="related-icon"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="24" height="23" rx="5"/><path d="M10 3v5m12-5v5M4 13h24m-18 6h4m4 0h4m-12 5h4"/></svg></span><span class="related-title">{{related_card_title}}</span><span class="related-description">{{related_card_description}}</span><span class="related-cta">Rechner öffnen <span aria-hidden="true">↗</span></span></a>
      </div>
    </section>
  </div></main>
  <footer class="footer"><div class="wrap"><div class="footerlinks"><a href="/de/altersrechner/">Startseite</a><a href="/privacy.html">Datenschutzerklärung (Englisch)</a><a href="/terms.html">Nutzungsbedingungen (Englisch)</a><a href="/contact.html">Kontakt (Englisch)</a></div>© 2026 Age &amp; Dates. Allgemeine Information, keine rechtliche Altersfeststellung.</div></footer>
</body>
</html>
""",
    'compact': """<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{title}}</title><meta name="description" content="{{description}}"><link rel="canonical" href="{{canonical}}"><meta name="robots" content="index,follow">

<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/redesign.css"><link rel="stylesheet" href="/localized.css?v=20260930"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<script type="application/ld+json">{"@context": "https://schema.org", "@graph": [{"@type": "WebApplication", "name": {{json_title}}, "url": "{{canonical}}", "inLanguage": "de", "description": {{json_description}}, "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "browserRequirements": "Requires JavaScript", "isAccessibleForFree": true}, {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Age & Dates", "item": "https://ageanddates.com/"}, {"@type": "ListItem", "position": 2, "name": {{json_title}}, "item": "{{canonical}}"}]}]}</script><script src="/calendar.js" defer></script><script src="{{script_url}}" defer></script>{{faq_schema_html}}</head>
<body class="localized-page" data-localized="{{localized}}"><header class="site-header"><div class="wrap nav"><a class="brand" href="/de/altersrechner/"><img src="/assets/logo.svg" alt="" width="39" height="39">Age &amp; Dates<span class="brand-dot">.</span></a><nav class="navlinks" aria-label="Weitere Rechner"><a href="#related">Weitere Rechner</a></nav></div></header>
<main><div class="wrap"><section class="local-hero"><div class="local-intro"><span class="hero-icon">{{hero_icon_html}}</span>{{eyebrow_html}}<h1>{{h1}}</h1><p class="local-lead">{{lead}}</p></div>
{{form_html}}
</section>{{after_hero_html}}


<section class="local-section detail-grid"><div class="method-card">{{method_html}}</div>
<div class="local-faq"><h2>Häufige Fragen</h2>{{faq_html}}</div></section>
<section class="local-section" id="related"><h2>{{related_title}}</h2><p class="section-intro">{{related_description}}</p><div class="related-grid"><a class="related-card" href="/de/altersrechner/"><span class="related-icon"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="24" height="23" rx="5"/><path d="M10 3v5m12-5v5M4 13h24m-18 6h4m4 0h4m-12 5h4"/></svg></span><span class="related-title">{{related_card_title}}</span><span class="related-description">{{related_card_description}}</span><span class="related-cta">Rechner öffnen <span aria-hidden="true">↗</span></span></a></div></section></div></main>
<footer class="footer"><div class="wrap"><div class="footerlinks"><a href="/de/altersrechner/">Startseite</a><a href="/privacy.html">Datenschutzerklärung (Englisch)</a><a href="/terms.html">Nutzungsbedingungen (Englisch)</a><a href="/contact.html">Kontakt (Englisch)</a></div>© 2026 Age &amp; Dates. Allgemeine Information, keine rechtliche Altersfeststellung.</div></footer></body></html>
""",
}


def validate(data):
    for key in ('slug', 'title', 'description', 'h1', 'lead', 'form_html',
                'method_html', 'localized', 'script', 'hero_icon_html',
                'related_title', 'related_description', 'related_card_title',
                'related_card_description'):
        if not isinstance(data.get(key), str):
            raise ValueError(f'{key} must be a string')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', data['slug']):
        raise ValueError('slug must contain lowercase letters, digits and single hyphens')
    if not re.fullmatch(r'[A-Za-z0-9_-]+\.js', data['script']):
        raise ValueError('script must be a JavaScript filename, without a path')
    if data.get('layout', 'expanded') not in TEMPLATES:
        raise ValueError('unknown layout')
    if not isinstance(data.get('faq'), list) or not all(
        isinstance(item, dict) and isinstance(item.get('q'), str)
        and isinstance(item.get('a'), str) for item in data['faq']
    ):
        raise ValueError('faq must be a list of {q, a} strings')
    if not isinstance(data.get('faq_schema', True), bool):
        raise ValueError('faq_schema must be a boolean')


def json_text(value):
    # Prevent an author string from closing the JSON-LD script element.
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')


def render(data):
    validate(data)
    layout = data.get('layout', 'expanded')
    values = {key: html.escape(value, quote=True) for key, value in data.items()
              if isinstance(value, str)}
    for key in ('form_html', 'method_html', 'hero_icon_html', 'eyebrow_html', 'after_hero_html'):
        values[key] = data.get(key, '')
    values['canonical'] = f'https://ageanddates.com/de/{data["slug"]}/'
    values['script_url'] = f'/de/{data["slug"]}/{data["script"]}'
    values['json_title'] = json_text(data['title'])
    values['json_description'] = json_text(data['description'])
    separator = '\n        ' if layout == 'expanded' else ''
    values['faq_html'] = separator.join(
        f'<details><summary>{html.escape(item["q"])}</summary><p>{html.escape(item["a"])}</p></details>'
        for item in data['faq'])
    schema = {'@context': 'https://schema.org', '@type': 'FAQPage',
              'mainEntity': [{'@type': 'Question', 'name': item['q'],
                              'acceptedAnswer': {'@type': 'Answer', 'text': item['a']}}
                             for item in data['faq']]}
    values['faq_schema_html'] = (
        '<script type="application/ld+json">' + json_text(schema) + '</script>\n'
        if data.get('faq_schema', True) else '')
    template = TEMPLATES[layout]
    if layout == 'expanded':
        template = template.replace('</span>\n        <h1>', '</span>{{eyebrow_html}}\n        <h1>', 1)
        template = template.replace('    </section>\n    <section class="local-section detail-grid">',
                                    '    </section>{{after_hero_html}}\n    <section class="local-section detail-grid">', 1)
        template = template.replace('<h2>{{related_title}}</h2>', '<h2>{{related_title}}</h2>{{related_intro_html}}')
    else:
        template = template.replace('<p class="section-intro">{{related_description}}</p>', '{{related_intro_html}}')
    values['related_intro_html'] = ('<p class="section-intro">' + values['related_description'] + '</p>'
                                    if data['related_description'] else '')
    # One substitution pass: literal placeholder-like strings in author content stay literal.
    return re.sub(r'\{\{([a-z0-9_]+)\}\}', lambda match: values[match[1]], template)


def add_sitemap(source, slug):
    from xml.etree import ElementTree
    url = f'https://ageanddates.com/de/{slug}/'
    tree = ElementTree.fromstring(source)
    if any((element.text or '').strip() == url for element in tree.iter()
           if element.tag.rsplit('}', 1)[-1] == 'loc'):
        return source
    if source.count('</urlset>') != 1:
        raise ValueError('expected one sitemap urlset closing tag')
    return source.replace('</urlset>', f'<url><loc>{url}</loc></url>\n</urlset>')


def add_link(source, data):
    match = re.search(r'<section\b[^>]*\bid="related"[^>]*>.*?</section>', source, re.S)
    if not match:
        raise ValueError('related section not found')
    section = match[0]
    href = f'/de/{data["slug"]}/'
    if re.search(r'\bhref=[\"\']' + re.escape(href) + r'[\"\']', section):
        return source
    # Reuse the existing card structure, including its CTA, and replace its content.
    card_match = re.search(r'<a class="related-card".*?</a>', section, re.S)
    if not card_match:
        raise ValueError('related card template not found')
    card = re.sub(r'href="[^"]*"', lambda _: f'href="{href}"', card_match[0], count=1)
    for cls, content in [('related-icon', data['hero_icon_html']),
                         ('related-title', html.escape(data.get('link_title', data['h1']))),
                         ('related-description', html.escape(data.get('link_description', data['lead'])))]:
        card = re.sub(r'(<span class="' + cls + r'">).*?(</span>)',
                      lambda m: m[1] + content + m[2], card, count=1, flags=re.S)
    end = section.rfind('</div>')
    if end < 0 or 'class="related-grid"' not in section:
        raise ValueError('related grid not found')
    return source[:match.start()] + section[:end] + card + section[end:] + source[match.end():]


def generate(input_path, *, root=ROOT, sitemap=False, link=False):
    data = json.loads(Path(input_path).read_text(encoding='utf-8'))
    page = render(data)
    output = root / 'de' / data['slug'] / 'index.html'
    updates = [(output, page)]
    if sitemap:
        path = root / 'sitemap.xml'
        updates.append((path, add_sitemap(path.read_text(encoding='utf-8'), data['slug'])))
    if link:
        path = root / 'de/altersrechner/index.html'
        updates.append((path, add_link(path.read_text(encoding='utf-8'), data)))
    # Prepare every update before writing so invalid input/markup does not leave partial output.
    for path, content in updates:
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists() or path.read_text(encoding='utf-8') != content:
            path.write_text(content, encoding='utf-8')
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path, help='tools/de_pages/<slug>.json')
    parser.add_argument('--sitemap', action='store_true', help='append sitemap entry if missing')
    parser.add_argument('--link', action='store_true', help='append related card if missing')
    args = parser.parse_args()
    try:
        print(generate(args.input, sitemap=args.sitemap, link=args.link))
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f'new_de_page: {error}\n')


if __name__ == '__main__':
    main()
