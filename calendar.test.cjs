const assert=require('node:assert/strict');
const C=require('./calendar.js');
const p=C.parse;
assert.equal(p('2025-02-29'),null);
assert.equal(p('0000-01-01'),null);
assert.equal(C.iso(p('0099-01-01')),'0099-01-01');
assert.deepEqual(C.age(p('1990-05-18'),p('2026-09-19')),{y:36,m:4,d:1});
assert.deepEqual(C.age(p('2023-01-31'),p('2023-03-01')),{y:0,m:1,d:1});
assert.deepEqual(C.age(p('2024-02-29'),p('2025-02-28')),{y:1,m:0,d:0});
assert.deepEqual(C.age(p('2026-09-23'),p('2026-09-23')),{y:0,m:0,d:0});
assert.equal(C.age(p('2026-09-23'),p('2026-09-22')),null);
assert.equal(C.iso(C.nextBirthday(p('2000-02-29'),p('2025-03-01'))),'2026-02-28');
assert.equal(C.days(p('2026-09-19'),C.nextBirthday(p('1990-05-18'),p('2026-09-19'))),241);
assert.equal(C.days(p('2024-03-09'),p('2024-03-11')),2);
assert.equal(C.iso(C.addMonths(p('2024-03-31'),-1)),'2024-02-29');
assert.equal(C.iso(C.addDays(p('2000-01-01'),10000)),'2027-05-19');
assert.equal(C.inRange(C.addDays(p('9999-12-31'),1)),false);
assert.match(C.fmt(p('1990-05-18'),{weekday:'long'}),/Friday/);
// Calendar decomposition must reconstruct the original target without negative parts.
for(let year=1996;year<=2030;year++)for(let month=1;month<=12;month++){
 const start=p(`${year}-${String(month).padStart(2,'0')}-28`);
 for(const n of [0,1,29,31,59,365,366,800]){
  const end=C.addDays(start,n),a=C.age(start,end);
  assert.ok(a.y>=0&&a.m>=0&&a.m<12&&a.d>=0&&a.d<=31);
  assert.equal(+C.addDays(C.addMonths(start,a.y*12+a.m),a.d),+end);
 }
}
console.log('Calendar regression checks passed');
