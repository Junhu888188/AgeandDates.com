"""Presentation copy and HTML for the localized calculators."""
from html import escape
import json

COPY = {
 'id': dict(eyebrow='HITUNG WAKTU, DENGAN MUDAH',form='Mulai dari tanggal Anda',trust=['Tanpa akun','Dihitung di perangkat Anda','Tahun kabisat diperhitungkan'],steps='Tiga langkah sederhana',examples='Coba satu contoh',tryit='Coba perhitungan',method='Tentang perhitungan ini',related='Temukan alat berikutnya',related_intro='Perhitungan kecil untuk rencana sehari-hari.',open='Buka kalkulator',year='HANYA TAHU TAHUN LAHIR?',privacy='Tanggal Anda tetap di perangkat Anda',jump='Hitung dari tahun lahir',faq_intro='Jawaban singkat sebelum Anda mulai.'),
 'de': dict(eyebrow='ZEIT VERSTEHEN. EINFACH RECHNEN.',form='Deine Daten, dein Ergebnis',trust=['Ohne Konto','Lokal auf deinem Gerät','Schaltjahre berücksichtigt'],steps='In drei Schritten zum Ergebnis',examples='Probiere ein Beispiel aus',tryit='Beispiel berechnen',method='Über diese Berechnung',related='Noch mehr Möglichkeiten',related_intro='Kleine Rechner für deine nächsten Pläne.',open='Rechner öffnen',year='NUR DAS GEBURTSJAHR BEKANNT?',privacy='Deine Daten bleiben auf deinem Gerät',jump='Mit Geburtsjahr rechnen',faq_intro='Die wichtigsten Antworten auf einen Blick.'),
 'pt-BR': dict(eyebrow='DATAS MAIS CLARAS. PLANOS MAIS SIMPLES.',form='Comece pelas suas datas',trust=['Sem cadastro','Cálculo no seu dispositivo','Anos bissextos incluídos'],steps='Seu resultado em três passos',examples='Experimente um exemplo',tryit='Calcular exemplo',method='Sobre este cálculo',related='Continue seus cálculos',related_intro='Mais ferramentas para organizar suas datas.',open='Abrir calculadora',year='',privacy='Suas datas ficam no seu dispositivo',jump='',faq_intro='Respostas rápidas para as dúvidas mais comuns.')
}
STEPS = {
 ('id','age'):[('Masukkan tanggal lahir','Gunakan format hari, bulan, dan tahun.'),('Pilih tanggal acuan','Gunakan hari ini atau tanggal pilihan.'),('Lihat usia lengkap','Tahun, bulan, hari, dan ulang tahun berikutnya.')],
 ('de','age'):[('Geburtsdatum eingeben','Tag, Monat und Jahr im Format TT.MM.JJJJ.'),('Stichtag auswählen','Heute oder ein Datum deiner Wahl.'),('Alter entdecken','Jahre, Monate, Tage und dein nächster Geburtstag.')],
 ('id','between'):[('Pilih dua tanggal','Isi tanggal awal dan tanggal akhir.'),('Atur cara menghitung','Pilih apakah kedua tanggal ikut dihitung.'),('Lihat selisihnya','Jumlah hari, minggu, dan rincian kalender.')],
 ('pt-BR','between'):[('Informe as datas','Escolha uma data inicial e uma final.'),('Escolha a contagem','Inclua as duas datas se precisar.'),('Veja a diferença','Dias corridos, semanas e detalhes do calendário.')],
 ('pt-BR','date'):[('Escolha a data inicial','Use hoje ou outra data de referência.'),('Defina a operação','Some ou subtraia dias, semanas, meses ou anos.'),('Descubra a nova data','Confira a data final e o dia da semana.')]
}
SAMPLES = {
 'age':[dict(start='18/05/1990',end='19/09/2026'),dict(start='29/02/2000',end='28/02/2025'),dict(start='31/01/2023',end='01/03/2023')],
 'between':[dict(start='01/09/2026',end='19/09/2026'),dict(start='05/10/2026',end='05/10/2026'),dict(start='28/02/2024',end='01/03/2024')],
 'date':[dict(start='01/09/2026',amount='30',unit='days',direction='add'),dict(start='31/01/2025',amount='1',unit='months',direction='add'),dict(start='10/03/2024',amount='2',unit='weeks',direction='subtract')]
}

def icon(tool):
 paths={
  'age':'<rect x="4" y="5" width="24" height="23" rx="5"/><path d="M10 3v5m12-5v5M4 13h24m-18 6h4m4 0h4m-12 5h4"/>',
  'between':'<rect x="3" y="5" width="26" height="23" rx="5"/><path d="M9 3v5m14-5v5M3 13h26m-18 4-4 4 4 4m10-8 4 4-4 4M8 21h16"/>',
  'date':'<rect x="4" y="5" width="24" height="23" rx="5"/><path d="M10 3v5m12-5v5M4 13h24m-18 8h6m-3-3v6m7-3h4"/>'
 }
 return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[tool]+'</svg>'

def introduction(p):
 c=COPY[p['lang']];tool=p['tool']
 jump=f'<a class="year-jump" href="#year-heading">{c["jump"]} <span aria-hidden="true">↗</span></a>' if tool=='age' else ''
 return f'<div class="local-intro"><span class="hero-icon">{icon(tool)}</span><p class="local-eyebrow">{c["eyebrow"]}</p><h1>{p["h1"]}</h1><p class="local-lead">{p["lead"]}</p>{jump}</div>'

def trust(lang):
 return '<div class="local-trust">'+''.join(f'<span><span aria-hidden="true">✓</span> {escape(t)}</span>' for t in COPY[lang]['trust'])+'</div>'

def content(p,c):
 lang=p['lang'];d=COPY[lang]
 steps=''.join(f'<li><span class="step-number" aria-hidden="true">0{i+1}</span><h3>{escape(h)}</h3><p>{escape(t)}</p></li>' for i,(h,t) in enumerate(STEPS[(lang,p['tool'])]))
 examples=''
 for i,(text,sample) in enumerate(zip(p['examples'],SAMPLES[p['tool']])):
  values=dict(sample)
  if lang=='de':values={k:v.replace('/','.') for k,v in values.items()}
  data=escape(json.dumps(values),quote=True)
  examples+=f'<article class="example-card"><span class="example-number" aria-hidden="true">0{i+1}</span><p>{escape(text)}</p><button class="example-button" type="button" data-example="{data}">{d["tryit"]} <span aria-hidden="true">↗</span><span class="sr-only"> {i+1}</span></button></article>'
 faqs=''.join(f'<details><summary>{escape(q)}</summary><p>{escape(a)}</p></details>' for q,a in p['faq'])
 return f'''<section class="local-section" aria-labelledby="steps-heading"><p class="local-eyebrow">{d['steps']}</p><h2 id="steps-heading">{p['how']}</h2><ol class="steps-grid">{steps}</ol></section>
<section class="local-section" aria-labelledby="examples-heading"><p class="local-eyebrow">{d['examples']}</p><h2 id="examples-heading">{p['examples_title']}</h2><div class="examples-grid">{examples}</div></section>
<section class="local-section detail-grid"><div class="method-card"><span class="method-icon">{icon(p['tool'])}</span><h2>{d['method']}</h2><p>{p['context']}</p><details><summary>{p['rules']}</summary><p>{p['rule']}</p></details><details><summary>{p['how']}</summary><p>{p['steps']}</p></details></div><div class="local-faq"><h2>{c['faq']}</h2><p class="section-intro">{d['faq_intro']}</p>{faqs}</div></section>
<section class="privacy-card"><span aria-hidden="true">✓</span><div><h2>{d['privacy']}</h2><p>{c['private']}</p><a href="/privacy.html">{c['legal']}</a></div></section>'''

def related_cards(p,related,pages):
 c=COPY[p['lang']];cards=''
 for url,title in related:
  peer=next((x for x in pages if x['url']==url),None)
  tool=peer['tool'] if peer else ('between' if 'between' in url else 'date')
  description=peer['lead'] if peer else ('Auf Englisch verfügbar.' if p['lang']=='de' else 'Disponível em inglês.')
  cards+=f'<a class="related-card" href="{url}"><span class="related-icon">{icon(tool)}</span><span class="related-title">{escape(title)}</span><span class="related-description">{escape(description)}</span><span class="related-cta">{c["open"]} <span aria-hidden="true">↗</span></span></a>'
 return f'<section class="local-section" id="related"><h2>{c["related"]}</h2><p class="section-intro">{c["related_intro"]}</p><div class="related-grid">{cards}</div></section>'
