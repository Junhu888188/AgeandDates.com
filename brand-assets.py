from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image
import subprocess

out=Path('assets')
logo=(out/'logo.svg').read_text()
for name,colors in [('logo-monochrome.svg',{'#345ce3':'#182640','#ff8066':'#182640'}),('logo-reversed.svg',{'#182640':'#ffffff','#345ce3':'#ffffff','#ff8066':'#ffffff'})]:
    s=logo
    for a,b in colors.items(): s=s.replace(a,b)
    (out/name).write_text(s)
# Small-size mark has a heavier stroke, fewer gaps and an opaque navy backing.
favicon='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#182640"/><path d="M27 51H19Q10 51 10 42V23Q10 15 19 15H43Q51 15 51 23M22 9V15M40 9V15" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/><path d="M51 37Q51 53 35 54" fill="none" stroke="#7898ff" stroke-width="6" stroke-linecap="round"/><circle cx="51" cy="30" r="4" fill="#ff8066"/></svg>'''
(out/'favicon.svg').write_text(favicon)
# Outlined wordmark: no font installation required by the eventual viewer.
font=TTFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'); glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); scale=38/font['head'].unitsPerEm
paths=[];x=0
for char in 'Age & Dates':
    glyph=glyphs[cmap[ord(char)]];pen=SVGPathPen(glyphs);glyph.draw(pen)
    paths.append(f'<path transform="translate({x} 0)" d="{pen.getCommands()}"/>');x+=glyph.width
mark=logo[logo.index('>')+1:logo.rindex('</svg>')]
word=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" role="img" aria-label="Age and Dates">{mark}<g fill="#182640" transform="translate(113 63) scale({scale} {-scale})">'+''.join(paths)+'</g></svg>'
(out/'logo-horizontal.svg').write_text(word)
(out/'logo-horizontal-reversed.svg').write_text(word.replace('#182640','#ffffff').replace('#345ce3','#ffffff').replace('#ff8066','#ffffff'))
for size,name in [(16,'favicon-16.png'),(32,'favicon-32.png'),(180,'apple-touch-icon.png'),(512,'brand-icon-512.png')]:
    subprocess.run(['inkscape',str(out/'favicon.svg'),'--export-type=png',f'--export-filename={out/name}',f'--export-width={size}',f'--export-height={size}'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
Image.open(out/'brand-icon-512.png').save(out/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])
print('Created SVG logo family, outlined wordmarks, PNG icons and ICO.')
