// Mechanical bundle of the actual site, for offline review without analytics.
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve('..','ageanddates-review.html');
let css=fs.readFileSync('styles.css','utf8')+'\n'+fs.readFileSync('redesign.css','utf8');
css=css.replace(/(^|\})\s*([^@{}][^{}]*)\{/g,(all,sep,selectors)=>sep+selectors.split(',').map(s=>{
 s=s.trim();if(s===':root'||s==='html'||s==='body')return '#ad-review';return '#ad-review '+s;
}).join(',')+'{');
// Rules immediately following media-query opening braces need the same scope.
css=css.replace(/(@media[^{}]+\{)\s*([^{}]+)\{/g,(_,media,s)=>media+s.split(',').map(x=>'#ad-review '+x.trim()).join(',')+'{');
css=css.replaceAll('--card','--ad-card');
const pages={};
for(const file of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');
 let body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g,'');
 body=body.replace(/src="(assets\/[^\"]+)"/g,(_,p)=>'src="data:image/svg+xml;base64,'+fs.readFileSync(p).toString('base64')+'"');
 pages[file]={tool:html.match(/data-tool="([^"]+)"/)?.[1]||'static',html:body};
}
let app=fs.readFileSync('app-v2.js','utf8').replaceAll('document.querySelector','root.querySelector').replaceAll('document.body.dataset','root.dataset');
app=app.replace("document.addEventListener('DOMContentLoaded',",'initialize(');
const calendar=fs.readFileSync('calendar.js','utf8');
const script=`(function(){const root=document.getElementById('ad-review');const pages=${JSON.stringify(pages).replaceAll('</','<\/')};function initialize(fn){fn();}function mount(file,anchor){const page=pages[file];if(!page)return;root.dataset.tool=page.tool;root.innerHTML=page.html;${app}\nif(anchor)root.querySelector('#'+anchor)?.scrollIntoView();else root.scrollIntoView({block:'start'});}root.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href');if(!href||href.startsWith('http')||href.startsWith('mailto:'))return;const [file,anchor]=href.split('#');if(pages[file||'index.html']){e.preventDefault();mount(file||'index.html',anchor);}});mount('index.html');})();`;
const fragment=`<style>${css}\n#ad-review{font:16px/1.6 system-ui,sans-serif;background:#f7f8fc;color:#182640;padding-bottom:1px;color-scheme:light;}#ad-review *{box-sizing:border-box;}#ad-review .navlinks a{padding:12px 0;}</style>\n<div id="ad-review"></div>\n<script>${calendar}\n${script}</script>\n`;
fs.writeFileSync('/workspace/ageanddates-review.html',fragment);
fs.writeFileSync(out,'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Age & Dates — redesign review</title><body style="margin:0">'+fragment+'</body></html>');
console.log(out);
