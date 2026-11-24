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

// Keep the page open across New Year's Day and exercise its midnight refresh.
{
 const page = fs.readFileSync('days-until-new-year.html', 'utf8');
 const [, script] = page.match(/<script id="new-year-countdown">([\s\S]*?)<\/script>/);
 const result = {}, faq = {};
 const elements = {'new-year-result': result, 'new-year-2027-result': faq};
 let localDate = '2026-12-31';
 let refresh;
 vm.runInNewContext(script, {
   window: {ADCalendar: {...C, today: () => C.parse(localDate)}},
   document: {getElementById: id => elements[id], addEventListener() {}},
   setTimeout(callback) { refresh = callback; },
   clearTimeout() {}
 });
 assert.equal(result.textContent, '1 day until January 1, 2027');
 assert.equal(faq.textContent, '1 day to go.');
 localDate = '2027-01-01';
 refresh();
 assert.equal(result.textContent, '0 days until January 1, 2027');
 assert.equal(faq.textContent, 'Today is New Year’s Day 2027.');
 localDate = '2027-01-02';
 refresh();
 assert.equal(result.textContent, '364 days until January 1, 2028');
 assert.equal(faq.textContent, '1 day ago.');
}
console.log('New Year countdown and 2027 FAQ rollover passed');

// Business-day counts use UTC calendar dates and independently selectable endpoints.
{
 const page = fs.readFileSync('business-days-calculator.html', 'utf8');
 const [, script] = page.match(/<script id="business-days-calculation">([\s\S]*?)<\/script>/);
 const window = {ADCalendar: C};
 vm.runInNewContext(script, {window});
 const count = window.calculateBusinessDays;
 function check(start, end, includeStart, includeEnd, expected) {
   assert.deepEqual(JSON.parse(JSON.stringify(count(start, end, includeStart, includeEnd))),
     {businessDays: expected[0], weekendDays: expected[1], calendarDays: expected[2]});
 }
 check('2026-01-05', '2026-01-05', true, true, [1, 0, 1]);
 check('2026-01-03', '2026-01-03', true, true, [0, 1, 1]);
 for (const [start, end] of [[true, false], [false, true], [false, false]]) {
   check('2026-01-05', '2026-01-05', start, end, [0, 0, 0]);
   check('2026-01-03', '2026-01-03', start, end, [0, 0, 0]);
 }
 check('2026-01-02', '2026-01-05', true, true, [2, 2, 4]);
 check('2026-01-02', '2026-01-05', true, false, [1, 2, 3]);
 check('2026-01-02', '2026-01-05', false, true, [1, 2, 3]);
 check('2026-01-02', '2026-01-05', false, false, [0, 2, 2]);
 check('2026-01-03', '2026-01-05', false, true, [1, 1, 2]);
 check('2026-12-31', '2027-01-04', true, true, [3, 2, 5]);
 check('2026-01-01', '2026-12-31', true, true, [261, 104, 365]);
 assert.equal(count('2026-01-01', '2026-12-31').businessDays, 261);
 assert.throws(() => count('2026-01-05', '2026-01-02'), /Start date must be on or before end date/);
 assert.throws(() => count('2026-02-30', '2026-03-01'), /Enter a valid start date and end date/);

 const elements = Object.fromEntries(['start-date', 'end-date', 'include-start', 'include-end',
   'business-days-result', 'business-days-error', 'business-days-form'].map(id => [id, {}]));
 elements['include-start'].checked = elements['include-end'].checked = true;
 const handlers = {};
 elements['business-days-form'].addEventListener = (name, handler) => { handlers[name] = handler; };
 const [, uiScript] = page.match(/<script id="business-days-ui">([\s\S]*?)<\/script>/);
 vm.runInNewContext(uiScript, {window, document: {getElementById: id => elements[id]}});
 elements['start-date'].value = '2026-01-01';
 elements['end-date'].value = '2026-12-31';
 handlers.submit({preventDefault() {}});
 assert.equal(elements['business-days-result'].textContent,
   'Business days (Monday–Friday): 261 · Weekend days: 104 · Total calendar days: 365');
 elements['end-date'].value = '2025-12-31';
 handlers.change();
 assert.equal(elements['business-days-error'].textContent, 'Start date must be on or before end date.');
 assert.equal(elements['business-days-result'].textContent, '');
}
console.log('Business days calculator counts, endpoints, and validation passed');
