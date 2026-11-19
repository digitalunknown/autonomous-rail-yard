const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(800);
const m=await p.evaluate(()=>{const o=document.getElementById('outcomes').getBoundingClientRect(),t=document.querySelector('#outcomes .tiles').getBoundingClientRect();
 const L=document.querySelector('.layers').getBoundingClientRect(),H=document.querySelector('.map-head').getBoundingClientRect();
 return {top:Math.round(t.top-o.top),bottom:Math.round(o.bottom-1-t.bottom),layersRightGap:Math.round(H.right-L.right),txt:document.body.innerText.includes('rolling 2'),show:/^Show/m.test(document.querySelector('.layers').innerText),kbd:!!document.querySelector('kbd')};});
console.log(JSON.stringify(m),'errs',errs);
await p.screenshot({path:'../shots/after-08-cleanup.png'});await b.close();})();
