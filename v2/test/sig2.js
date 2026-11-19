const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:3});
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(500);
await p.evaluate(()=>{__yard.P.rate=12;__yard.advance(2400);});
await p.screenshot({path:'/tmp/rcv.png',clip:{x:700,y:240,width:420,height:220}});await b.close();})();
