"""Run with python3 tools/new_de_page_test.py. All mutations use temporary directories."""
import copy
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unittest

import new_de_page as generator

ROOT = generator.ROOT


class GeneratorTest(unittest.TestCase):
    def fixture(self, slug='alter-in-monaten'):
        return json.loads((ROOT / 'tools/de_pages' / f'{slug}.json').read_text(encoding='utf-8'))

    def test_existing_pages_are_byte_identical(self):
        for slug in ('alter-in-monaten', 'kalenderwoche'):
            with self.subTest(slug=slug):
                self.assertEqual(generator.render(self.fixture(slug)).encode(),
                                 (ROOT / 'de' / slug / 'index.html').read_bytes())

    def test_new_page_schema_and_escaping(self):
        for layout in ('expanded', 'compact'):
            data = self.fixture()
            data.update(slug='neuer-rechner', layout=layout, title='Titel " & <Test>',
                        h1='Andere Überschrift {{title}}', description='Beschreibung " & < >',
                        related_description='Weitere & Rechner',
                        faq=[{'q': 'Frage < & "?', 'a': '</script> & Antwort'}])
            data.pop('faq_schema')
            output = generator.render(data)
            self.assertIn('<h1>Andere Überschrift {{title}}</h1>', output)
            self.assertIn('https://ageanddates.com/de/neuer-rechner/', output)
            self.assertIn('/de/neuer-rechner/alter-in-monaten.js', output)
            self.assertIn('content="Beschreibung &quot; &amp; &lt; &gt;"', output)
            blocks = [json.loads(block) for block in re.findall(
                r'<script type="application/ld\+json">(.*?)</script>', output, re.S)]
            self.assertEqual(blocks[0]['@graph'][0]['name'], data['title'])
            self.assertEqual(blocks[1]['@type'], 'FAQPage')
            self.assertEqual(blocks[1]['mainEntity'][0]['acceptedAnswer']['text'], data['faq'][0]['a'])

    def test_cli_flags_are_idempotent_and_scoped(self):
        # Only extract the authorized related section from the age calculator.
        page = (ROOT / 'de/altersrechner/index.html').read_text(encoding='utf-8')
        section = '\n'.join(m.group(0) for line in page.splitlines()
                             if (m := re.search(r'<section[^>]*related[^>]*>.*</section>', line)))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'de/altersrechner').mkdir(parents=True)
            age = root / 'de/altersrechner/index.html'
            age.write_text('PREFIX\n' + section + '\nSUFFIX', encoding='utf-8')
            sitemap = root / 'sitemap.xml'
            sitemap.write_bytes((ROOT / 'sitemap.xml').read_bytes())
            data = self.fixture('kalenderwoche')
            data.update(slug='neuer-rechner', title='Neu', h1='Neu & gut', lead='Beschreibung')
            data.pop('faq_schema')
            source = root / 'content.json'
            source.write_text(json.dumps(data), encoding='utf-8')
            # Run the real argument parser and CLI against an isolated root.
            wrapper = ('import sys; sys.path.insert(0, sys.argv.pop(1)); '
                       'import new_de_page as g; from pathlib import Path; '
                       'g.generate.__kwdefaults__["root"] = Path(sys.argv.pop(1)); g.main()')
            command = ['python3', '-c', wrapper, str(ROOT / 'tools'), str(root),
                       str(source), '--sitemap', '--link']
            subprocess.run(command, check=True, capture_output=True)
            before = {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file()}
            subprocess.run(command, check=True, capture_output=True)
            after = {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file()}
            self.assertEqual(before, after)
            self.assertEqual(set(after), {Path('content.json'), Path('sitemap.xml'),
                                          Path('de/altersrechner/index.html'),
                                          Path('de/neuer-rechner/index.html')})
            self.assertEqual(sitemap.read_text().count('<loc>https://ageanddates.com/de/neuer-rechner/</loc>'), 1)
            actual = age.read_text()
            self.assertTrue(actual.startswith('PREFIX\n' + section[:-len('</div></section>')]))
            self.assertTrue(actual.endswith('</div></section>\nSUFFIX'))
            self.assertEqual(actual.count('href="/de/neuer-rechner/"'), 1)
            self.assertIn('Neu &amp; gut', actual)
            for slug in ('alter-in-monaten', 'kalenderwoche'):
                fixture = self.fixture(slug)
                self.assertEqual(generator.add_sitemap(sitemap.read_text(), slug), sitemap.read_text())
                self.assertEqual(generator.add_link(actual, fixture), actual)

    def test_invalid_input(self):
        for field, invalid in [('slug', '../escape'), ('slug', '/absolute'),
                               ('script', '../escape.js'), ('layout', 'unknown'),
                               ('faq', [{'q': 'missing answer'}])]:
            data = copy.deepcopy(self.fixture())
            data[field] = invalid
            with self.subTest(field=field, invalid=invalid), self.assertRaises(ValueError):
                generator.render(data)
        with self.assertRaises(ValueError):
            generator.add_link('<main></main>', self.fixture())


if __name__ == '__main__':
    unittest.main()
