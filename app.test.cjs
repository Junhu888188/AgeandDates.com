const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),C=require('./calendar.js');
function run(tool,values){
 const nodes=Object.fromEntries(['#result','#form-error','.calc-method',...Object.keys(values)].map(k=>[k,{value:values[k]||'',checked:values[k]===true,hidden:false,textContent:'',innerHTML:'',classList:{add(){},remove(){}}}]));
 let submit;nodes['#calculator-form']={addEventListener(e,f){submit=f;}};
 const document={body:{dataset:{tool}},querySelector:k=>nodes[k],querySelectorAll:()=>[],addEventListener(e,f){f();}};
 vm.runInNewContext(fs.readFileSync('app-v2.js','utf8'),{document,window:{ADCalendar:C}});
 submit({preventDefault(){}});return nodes;
}
const cases=[
 ['home',{'#dob':'1990-05-18','#asof':'2026-09-19'},/241/],
 ['age-specific',{'#dob':'2023-01-31','#target':'2023-03-01'},/<b>1<\/b><span>month/],
 ['future-age',{'#dob':'2000-02-29','#target':'2025-02-28'},/<b>25<\/b>/],
 ['days-alive',{'#dob':'2026-09-01','#asof':'2026-09-19'},/18 days/],
 ['weeks',{'#dob':'2026-09-01','#asof':'2026-09-19'},/2 complete weeks/],
 ['birthday',{'#dob':'1990-05-18','#asof':'2026-09-19'},/241 days/],
 ['weekday',{'#dob':'1990-05-18'},/Friday/],
 ['difference',{'#dob':'2020-01-01','#dob2':'2019-01-01'},/365 total days/],
 ['milestones',{'#dob':'2000-01-01'},/1 January 2100/],
 ['10000',{'#dob':'2000-01-01'},/19 May 2027/],
 ['date',{'#start':'2024-03-31','#amount':'1','#unit':'months','#direction':'subtract'},/29 February 2024/],
 ['between',{'#start':'2026-09-01','#end':'2026-09-01','#inclusive':true},/1 days/]
];
for(const [tool,input,expected]of cases)assert.match(run(tool,input)['#result'].innerHTML,expected,tool);
const real=run('home',{'#dob':'1990-05-18','#asof':'2026-09-19'});assert.match(real['.calc-method'].textContent,/Born 18 May/);
assert.match(run('home',{'#dob':'9999-01-01','#asof':'9999-12-31'})['#form-error'].textContent,/9999/);
assert.match(run('home',{'#dob':'2030-01-01','#asof':'2026-01-01'})['#form-error'].textContent,/on or after/);
console.log('All 12 calculator handlers and error cases passed');
