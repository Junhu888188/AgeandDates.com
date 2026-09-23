(function(root){'use strict';
const DAY=86400000;
function make(y,m,d){const x=new Date(0);x.setUTCFullYear(y,m,d);x.setUTCHours(0,0,0,0);return x;}
function parse(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return null;const [y,m,d]=v.split('-').map(Number);const x=make(y,m-1,d);return y>=1&&y<=9999&&x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d?x:null;}
function today(){const d=new Date();return make(d.getFullYear(),d.getMonth(),d.getDate());}
function iso(d){return `${String(d.getUTCFullYear()).padStart(4,'0')}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;}
function days(a,b){return Math.round((b-a)/DAY);}
function addDays(d,n){return new Date(+d+n*DAY);}
function addMonths(d,n){const x=make(d.getUTCFullYear(),d.getUTCMonth()+n,1);const last=make(x.getUTCFullYear(),x.getUTCMonth()+1,0).getUTCDate();x.setUTCDate(Math.min(d.getUTCDate(),last));return x;}
function age(a,b){if(!a||!b||b<a)return null;let total=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth();if(addMonths(a,total)>b)total--;return{y:Math.floor(total/12),m:total%12,d:days(addMonths(a,total),b)};}
// Anniversary policy: 29 February is observed on 28 February in non-leap years.
function anniversary(d,y){return addMonths(d,(y-d.getUTCFullYear())*12);}
function nextBirthday(d,from){let x=anniversary(d,from.getUTCFullYear());if(x<from)x=anniversary(d,from.getUTCFullYear()+1);return x;}
function fmt(d,options){return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC',...options});}
function inRange(d){return Number.isFinite(+d)&&d.getUTCFullYear()>=1&&d.getUTCFullYear()<=9999;}
const api={parse,today,iso,days,addDays,addMonths,age,anniversary,nextBirthday,fmt,inRange};if(typeof module!=='undefined')module.exports=api;else root.ADCalendar=api;
})(typeof window==='undefined'?this:window);
