const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
p.on('console',m=>console.log('C',m.type(),m.text()));p.on('pageerror',e=>console.log('E',e.message,e.stack.split('\n').slice(0,3).join(' | ')));
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(800);await b.close();})();
