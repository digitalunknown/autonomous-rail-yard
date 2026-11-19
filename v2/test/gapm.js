const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(()=>{__yard.advance(3600);const S=__yard.S;const by={};for(const v of S.veh){const e=v.route[v.ri];(by[e]=by[e]||[]).push(v);}
 const stopped=[],moving=[];for(const k in by){const a=by[k].sort((x,y)=>x.s-y.s);for(let i=1;i<a.length;i++){const g=(a[i].s-a[i].len)-a[i-1].s;(a[i].v<0.05&&a[i-1].v<0.05?stopped:moving).push(+g.toFixed(2));}}
 const st=a=>{a.sort((x,y)=>x-y);return {n:a.length,min:a[0],med:a[a.length>>1],p90:a[Math.floor(a.length*.9)]};};return {stopped:st(stopped),moving:st(moving)};});
console.log(JSON.stringify(r));await b.close();})();
