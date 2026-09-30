const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('./calendar.js');
function setup(lang,tool){
 const nodes={};
 for(const id of ['localized-form','localized-result','localized-error','copy-result','copy-status','year-form','birth-year','target-year','year-result','year-error']){
  nodes[id]={hidden:true,textContent:'',innerHTML:'',value:'',events:{},addEventListener(type,fn){this.events[type]=fn;},focus(){}};
 }
 const form=nodes['localized-form'];
 form.values={start:lang==='de'?'18.05.1990':'18/05/1990',end:lang==='de'?'19.09.2026':'19/09/2026',amount:'1',unit:'days',direction:'add'};
 form.querySelector=()=>null;
 let finishCopy;
 const document={documentElement:{lang},body:{dataset:{localized:tool}},getElementById:id=>nodes[id],querySelectorAll:()=>[],addEventListener(type,fn){fn();}};
 vm.runInNewContext(fs.readFileSync('localized.js','utf8'),{document,window:{ADCalendar:C},FormData:class{constructor(f){this.f=f;}forEach(fn){Object.entries(this.f.values).forEach(([k,v])=>fn(v,k));}},navigator:{clipboard:{writeText:()=>new Promise(resolve=>{finishCopy=resolve;})}}});
 return {nodes,submit:()=>form.events.submit({preventDefault(){}}),finishCopy:()=>finishCopy()};
}
(async()=>{
 for(const [lang,tool] of [['de','age'],['id','age'],['id','between'],['pt-BR','between'],['pt-BR','date']]){
  const {nodes:n,submit,finishCopy}=setup(lang,tool);
  submit();assert.equal(n['localized-result'].hidden,false);
  const copying=n['copy-result'].events.click();
  n['localized-form'].events.input();
  assert.equal(n['localized-result'].hidden,true);
  assert.equal(n['localized-result'].innerHTML,'');
  assert.equal(n['copy-result'].hidden,true);
  const notice=n['copy-status'].textContent;assert.ok(notice);
  finishCopy();await copying;assert.equal(n['copy-status'].textContent,notice);
  submit();assert.equal(n['localized-result'].hidden,false);assert.equal(n['copy-status'].textContent,'');
  n['localized-form'].events.change();assert.equal(n['localized-result'].hidden,true);
  n['localized-form'].values.start='invalid';submit();assert.equal(n['localized-error'].hidden,false);
  n['localized-form'].events.input();assert.equal(n['localized-error'].hidden,true);
  if(tool==='age'){
   n['birth-year'].value='1990';n['target-year'].value='2026';
   n['year-form'].events.submit({preventDefault(){}});assert.match(n['year-result'].textContent,/36/);
   n['year-form'].events.input();assert.equal(n['year-result'].textContent,notice);
   n['birth-year'].value='2000';n['year-form'].events.submit({preventDefault(){}});assert.match(n['year-result'].textContent,/26/);
  }
 }
 console.log('All five localized forms invalidate stale results, clear errors and recover after recalculation; delayed copy cannot overwrite the update notice.');
})().catch(e=>{console.error(e);process.exitCode=1;});
