(function(){'use strict';
const C=typeof module==='object'?require('./calendar.js'):window.ADCalendar;
const words={
 id:{locale:'id-ID',units:[['tahun','tahun'],['bulan','bulan'],['hari','hari']],days:'hari',weeks:'minggu penuh',months:'bulan penuh',total:'Total hari',born:'Hari lahir',next:'Ulang tahun berikutnya',left:'hari lagi',turn:'Usia pada ulang tahun berikutnya',happy:'Selamat ulang tahun!',result:'Hasil perhitungan',bad:'Masukkan tanggal yang valid dengan format DD/MM/YYYY.',order:'Tanggal perhitungan tidak boleh sebelum tanggal lahir.',range:'Hasil harus berada antara tahun 0001 dan 9999.',copy:'Salin hasil',copied:'Hasil disalin.',failed:'Tidak dapat menyalin otomatis. Pilih teks hasil lalu salin.',inclusive:'Kedua tanggal dihitung. Tanggal yang sama dihitung sebagai 1 hari.',exclusive:'Selisih hari berlalu; tanggal yang sama menghasilkan 0 hari.',calendar:'Selisih kalender tanpa tambahan hari inklusif',reverse:'Urutan tanggal dibalik; selisih ditampilkan sebagai nilai positif.',remainder:'sisa hari',asof:'Dihitung sampai'},
 de:{locale:'de-DE',units:[['Jahr','Jahre'],['Monat','Monate'],['Tag','Tage']],days:'Tage',weeks:'volle Wochen',months:'volle Monate',total:'Gesamte Tage',born:'Geboren am',next:'Dein nächster Geburtstag',left:'Tage verbleiben',turn:'Alter am nächsten Geburtstag',happy:'Alles Gute zum Geburtstag!',result:'Dein Ergebnis',bad:'Bitte gib ein gültiges Datum im Format TT.MM.JJJJ ein.',order:'Der Stichtag darf nicht vor dem Geburtsdatum liegen.',range:'Das Ergebnis muss zwischen den Jahren 0001 und 9999 liegen.',copy:'Ergebnis kopieren',copied:'Ergebnis kopiert.',failed:'Automatisches Kopieren ist nicht möglich. Markiere und kopiere den Ergebnistext.',asof:'Berechnet bis'},
 'pt-BR':{locale:'pt-BR',result:'Data resultante',bad:'Digite uma data válida no formato DD/MM/AAAA.',range:'O resultado deve estar entre os anos 0001 e 9999.',amount:'Digite uma quantidade inteira maior ou igual a zero.',copy:'Copiar resultado',copied:'Resultado copiado.',failed:'Não foi possível copiar automaticamente. Selecione e copie o texto do resultado.',add:'Somar',subtract:'Subtrair',units:{days:['dia','dias'],weeks:['semana','semanas'],months:['mês','meses'],years:['ano','anos']}}
};
function parseLocal(value,lang){const sep=lang==='de'?'.':'/';const parts=(value||'').trim().split(sep);if(parts.length!==3||!/^\d{1,2}$/.test(parts[0])||!/^\d{1,2}$/.test(parts[1])||!/^\d{4}$/.test(parts[2]))return null;return C.parse(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);}
function inputDate(d,lang){const [y,m,day]=C.iso(d).split('-');return [day,m,y].join(lang==='de'?'.':'/');}
function calculate(tool,lang,v){
 const w=words[lang],n=x=>x.toLocaleString(w.locale),fmt=d=>d.toLocaleDateString(w.locale,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}),weekday=d=>d.toLocaleDateString(w.locale,{weekday:'long',timeZone:'UTC'});
 const fail=message=>({error:message});
 const cols=a=>`<div class="age-columns">${[a.y,a.m,a.d].map((x,i)=>`<div><b>${n(x)}</b><span>${w.units[i][x===1?0:1]}</span></div>`).join('')}</div>`;
 const a=parseLocal(v.start,lang),b=parseLocal(v.end,lang);
 if(!a||(tool!=='date'&&!b))return fail(w.bad);
 let html='';
 if(tool==='age'){
  if(a>b)return fail(w.order);
  const age=C.age(a,b),days=C.days(a,b),next=C.nextBirthday(a,b);if(!C.inRange(next))return fail(w.range);
  const left=C.days(b,next),prev=C.anniversary(a,next.getUTCFullYear()-1),progress=left===0?100:Math.max(0,Math.min(100,100*C.days(prev,b)/C.days(prev,next)));
  html=`<div class="age-summary"><div class="result-heading">${w.result}</div>${cols(age)}<div class="age-facts"><span><b>${n(days)}</b> ${w.days}</span><span>${w.born}: <b>${weekday(a)}</b></span></div><div class="stats"><div class="stat"><b>${n(Math.floor(days/7))}</b><span>${w.weeks}</span></div><div class="stat"><b>${n(age.y*12+age.m)}</b><span>${w.months}</span></div></div><p class="note">${w.asof}: ${fmt(b)}</p></div><div class="birthday-panel"><div class="birthday-ring" style="--progress:${progress}%"><div><b>${left}</b><span>${w.left}</span></div></div><div class="birthday-copy"><h3>${w.next}</h3><p>${weekday(next)}, ${fmt(next)}</p><p>${left===0?w.happy:w.turn+': '+(next.getUTCFullYear()-a.getUTCFullYear())}</p></div></div>`;
 }else if(tool==='between'){
  const x=a<b?a:b,y=a<b?b:a,days=C.days(x,y)+(v.inclusive?1:0);
  html=`<div class="age-summary"><div class="result-heading">${w.result}</div><div class="big">${n(days)} ${w.days}</div><p>${n(Math.floor(days/7))} ${w.weeks}; ${days%7} ${w.remainder}.</p><p class="note">${v.inclusive?w.inclusive:w.exclusive}</p>${a>b?`<p class="note">${w.reverse}</p>`:''}<h3>${w.calendar}</h3>${cols(C.age(x,y))}<p>${fmt(a)} → ${fmt(b)}</p></div>`;
 }else if(tool==='date'){
  const amount=Number(v.amount),unit=v.unit,sign=v.direction==='subtract'?-1:1;
  if(!/^\d+$/.test(v.amount||'')||!Number.isSafeInteger(amount)||!w.units[unit])return fail(w.amount);
  const result=unit==='days'||unit==='weeks'?C.addDays(a,amount*sign*(unit==='weeks'?7:1)):C.addMonths(a,amount*sign*(unit==='years'?12:1));
  if(!C.inRange(result))return fail(w.range);
  html=`<div class="age-summary"><div class="result-heading">${w.result}</div><div class="big">${fmt(result)}</div><p>${weekday(result)}</p><p>${fmt(a)} ${sign===1?'+':'−'} ${n(amount)} ${w.units[unit][amount===1?0:1]} = ${fmt(result)}</p></div>`;
 }
 return {html};
}
if(typeof module==='object'){module.exports={calculate,parseLocal,inputDate};return;}
document.addEventListener('DOMContentLoaded',()=>{
 const lang=document.documentElement.lang,tool=document.body.dataset.localized,w=words[lang],form=document.getElementById('localized-form'),result=document.getElementById('localized-result'),error=document.getElementById('localized-error'),copy=document.getElementById('copy-result'),status=document.getElementById('copy-status');
 if(!form)return;
 document.querySelectorAll('[data-today]').forEach(el=>el.value=inputDate(C.today(),lang));
 form.addEventListener('submit',e=>{e.preventDefault();const v={};new FormData(form).forEach((value,key)=>v[key]=value);v.inclusive=!!form.querySelector('[name=inclusive]:checked');const r=calculate(tool,lang,v);status.textContent='';error.hidden=!r.error;error.textContent=r.error||'';result.hidden=!!r.error;copy.hidden=!!r.error;if(r.error){error.focus();return;}result.innerHTML=r.html;});
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.innerText);status.textContent=w.copied;}catch{status.textContent=w.failed;}});
});
})();
