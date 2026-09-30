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
assert.deepEqual(L.yearAge('1997','2026'),{min:28,max:29});
assert.deepEqual(L.yearAge('1991','2026'),{min:34,max:35});
assert.deepEqual(L.yearAge('2026','2026'),{min:0,max:0});
assert.deepEqual(L.yearAge('1','9999'),{min:9997,max:9998});
for(const [birth,target] of [['2027','2026'],['0','2026'],['1997','10000'],['1997.5','2026'],['','2026'],['1e3','2026']])assert.equal(L.yearAge(birth,target),null);
for(const [start,end,inclusive,expected] of [
 ['01/09/2026','19/09/2026',false,'18 dias'],
 ['19/09/2026','01/09/2026',false,'18 dias'],
 ['05/10/2026','05/10/2026',true,'1 dia'],
 ['05/10/2026','05/10/2026',false,'0 dias'],
 ['28/02/2024','01/03/2024',false,'2 dias']
]){
 const result=L.calculate('between','pt-BR',{start,end,inclusive});
 assert.ok(result.html.includes(expected));
 assert.ok(!result.html.includes('undefined'));
 assert.ok(!result.html.includes('NaN'));
}
assert.match(L.calculate('between','pt-BR',{start:'19/09/2026',end:'01/09/2026'}).html,/As datas foram invertidas/);
assert.ok(L.calculate('between','pt-BR',{start:'29/02/2025',end:'01/03/2025'}).error);
console.log('Birth-year ranges and Portuguese date differences passed.');

// Numeric mobile keyboards can enter exactly eight digits in day-month-year order.
for(const lang of ['id','de','pt-BR']){
 const sep=lang==='de'?'.':'/';
 for(const [compact,formatted] of [['18051990',['18','05','1990'].join(sep)],['29022024',['29','02','2024'].join(sep)],['01010001',['01','01','0001'].join(sep)],['31129999',['31','12','9999'].join(sep)]]){
  assert.equal(L.parseLocal(compact,lang).toISOString(),L.parseLocal(formatted,lang).toISOString());
 }
 assert.equal(L.parseLocal(' 18051990 ',lang).toISOString(),'1990-05-18T00:00:00.000Z');
 for(const invalid of ['29022025','31042026','00012026','01132026','01010000','1805199','180519900','1805 1990','18a51990','19900518'])assert.equal(L.parseLocal(invalid,lang),null);
}
for(const [tool,lang] of [['age','id'],['age','de'],['between','id'],['between','pt-BR'],['date','pt-BR']]){
 const sep=lang==='de'?'.':'/';
 const base={start:['18','05','1990'].join(sep),end:['19','09','2026'].join(sep),amount:'30',unit:'days',direction:'add'};
 assert.deepEqual(L.calculate(tool,lang,{...base,start:'18051990',end:'19092026'}),L.calculate(tool,lang,base));
}
console.log('Eight-digit dates match formatted dates on all five tools; invalid and ambiguous input is rejected.');
