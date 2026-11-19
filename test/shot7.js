const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
await p.goto('file:///workspace/yard-sim/index.html');await p.waitForTimeout(600);
const c=await p.evaluate(()=>{__yard.advance(50*60);const S=__yard.S;const by={};for(const v of S.veh){if(v.state!=='classified'||v.v>0.05)continue;const e=v.route[v.ri];(by[e]=by[e]||[]).push(v);}
 const k=Object.keys(by).sort((a,b)=>by[b].length-by[a].length)[0];const vs=by[k];
 let xs=0,ys=0;for(const v of vs){const p=v._pts||[];}__yard.refresh();
 const mid=vs[vs.length>>1];__yard.zoomTo(3.2);__yard.refresh();return {k,n:vs.length,id:mid.id};});
await p.waitForTimeout(200);
await p.evaluate(id=>{const v=__yard.S.veh.find(x=>x.id===id);const q=v._pts[0];__yard.centerOn(q[0],q[1]);},c.id);
await p.waitForTimeout(300);
const r=await p.$eval('#map',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2-330,y:r.top+r.height/2-110,width:660,height:220};});
await p.screenshot({path:'../shots/07-spacing.png',clip:r});console.log(c);await b.close();})();
