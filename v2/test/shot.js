const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  p.on('pageerror',e=>console.log('pageerror',e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(600);
  await p.screenshot({path:'/workspace/yard-sim/v2/shots/_draft3.png'});
  await b.close();
})();
