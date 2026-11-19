const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:4});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(500);
// force a mix of aspects across signals: entry green, R-01 amber, R-02 red, R-03 green, R-04 amber
await p.evaluate(()=>{const m={entry:'go',R01:'warn',R02:'stop',R03:'go',R04:'warn'};window.__sigOverride=(k,id)=>k==='entry'?m.entry:k==='R'?m[id]:null;});
await p.waitForTimeout(300);
const box=await p.evaluate(()=>{const r=document.getElementById('map').getBoundingClientRect();return {x:r.left,y:r.top};});
await p.screenshot({path:'/tmp/z_entry.png',clip:{x:box.x+175,y:box.y+0,width:110,height:60}});
await p.screenshot({path:'/tmp/z_r.png',clip:{x:box.x+640,y:box.y+80,width:110,height:90}});
console.log('errs',errs);await b.close();})();
