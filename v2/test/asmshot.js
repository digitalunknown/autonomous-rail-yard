const { chromium } = require('playwright');
const out=process.argv[2]||'/tmp/asm1.png';const mode=process.argv[3]||'';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
p.on('pageerror',e=>console.log('E',e.message,e.stack.split('\n').slice(0,3).join(' | ')));
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(700);
await p.click('#viewSeg button[data-v="asm"]');await p.waitForTimeout(300);
if(mode==='edit'){await p.click('.car[data-car="PV-0611"]');await p.waitForTimeout(200);}
if(mode==='queue'){await p.click('.dr-tabs button[data-t="queue"]');await p.waitForTimeout(100);}
if(mode==='bulk'){await p.click('.car[data-car="PV-0471"]',{modifiers:['Shift']});await p.click('.car[data-car="PV-0488"]',{modifiers:['Shift']});await p.click('.car[data-car="PV-0604"]',{modifiers:['Shift']});}
await p.screenshot({path:out});await b.close();})();
