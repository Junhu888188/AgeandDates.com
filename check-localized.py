from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import json,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.links=[];self.ids=[];self.alt={};self.canonical='';self.lang='';self.h1=0;self.feed(text)
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='html':self.lang=a.get('lang')
  if t=='h1':self.h1+=1
  if 'id'in a:self.ids.append(a['id'])
  if t=='link' and a.get('rel')=='canonical':self.canonical=a['href']
  if t=='link' and a.get('rel')=='alternate':self.alt[a['hreflang']]=a['href']
  if t in ('a','link','script','img'):self.links.append(a.get('href',a.get('src','')))
def resolve(url):
 p=urlparse(url).path
 return root/(p.lstrip('/')+('index.html'if p.endswith('/')else ''))
localized=list(root.glob('id/*/index.html'))+list(root.glob('de/*/index.html'))+list(root.glob('pt-br/*/index.html'))
assert len(localized)==4
sitemap=ET.parse(root/'sitemap.xml');urls={e.text for e in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
for f in localized:
 s=f.read_text();p=Page(s);expected='https://ageanddates.com/'+str(f.parent.relative_to(root))+'/'
 assert p.h1==1 and len(p.ids)==len(set(p.ids)),f
 assert p.canonical==expected and expected in urls,f
 assert p.alt[p.lang]==expected and 'x-default'in p.alt,f
 for lang,url in p.alt.items():assert Page(resolve(url).read_text()).alt==p.alt,(f,url)
 for url in p.links:
  if url.startswith('#') or url.startswith(('mailto:','https:','http:')):continue
  target=resolve(url) if url.startswith('/')else f.parent/url
  assert target.exists(),(f,url)
 assert all(x in p.ids for x in ['localized-form','localized-result','copy-result','localized-error']),f
 assert 'googletagmanager' not in s and 'localStorage' not in s,f
 import re
 for schema in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s):json.loads(schema)
print('4 static pages: self-canonicals, reciprocal hreflang, sitemap, local links and JSON-LD passed.')
