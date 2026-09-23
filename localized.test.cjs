const assert=require('node:assert/strict');
const L=require('./localized.js');
const age=(lang,start,end)=>L.calculate('age',lang,{start,end});
assert.equal(L.parseLocal('29/02/2025','id'),null);
assert.equal(L.parseLocal('01/01/0000','id'),null);
assert.equal(L.parseLocal('05/18/1990','id'),null);
assert.equal(L.parseLocal('18.05.1990','de').toISOString(),'1990-05-18T00:00:00.000Z');
assert.match(age('id','18/05/1990','19/09/2026').html,/<b>36<\/b><span>tahun/);
assert.match(age('id','18/05/1990','19/09/2026').html,/13.273/);
assert.match(age('de','29.02.2000','28.02.2025').html,/Alles Gute zum Geburtstag/);
assert.match(age('de','31.01.2023','01.03.2023').html,/<b>1<\/b><span>Monat/);
assert.ok(age('de','01.01.2030','01.01.2026').error);
assert.ok(age('id','01/01/9999','31/12/9999').error);
assert.match(L.calculate('between','id',{start:'19/09/2026',end:'01/09/2026'}).html,/18 hari/);
assert.match(L.calculate('between','id',{start:'19/09/2026',end:'01/09/2026'}).html,/Urutan tanggal dibalik/);
assert.match(L.calculate('between','id',{start:'05/10/2026',end:'05/10/2026',inclusive:true}).html,/1 hari/);
assert.match(L.calculate('between','id',{start:'28/02/2024',end:'01/03/2024'}).html,/2 hari/);
for(const [start,amount,unit,direction,expected]of [
 ['31/01/2025','1','months','add','28 de fevereiro de 2025'],
 ['31/01/2025','2','months','add','31 de março de 2025'],
 ['10/03/2024','2','weeks','subtract','25 de fevereiro de 2024'],
 ['01/09/2026','30','days','add','1 de outubro de 2026'],
 ['29/02/2024','1','years','add','28 de fevereiro de 2025'],
 ['01/09/2026','0','days','add','1 de setembro de 2026']
])assert.ok(L.calculate('date','pt-BR',{start,amount,unit,direction}).html.includes(expected));
for(const amount of ['-1','1.5','', '999999999999999999999999'])assert.ok(L.calculate('date','pt-BR',{start:'01/01/2026',amount,unit:'days'}).error);
assert.ok(L.calculate('date','pt-BR',{start:'31/12/9999',amount:'1',unit:'days'}).error);
console.log('Localized dates, age, inclusive/reversed ranges, month ends and range errors passed.');
