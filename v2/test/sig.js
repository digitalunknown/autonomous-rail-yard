const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  for(const dpr of [1,3]){
    const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:dpr});
    p.on('pageerror',e=>console.log('pageerror',e.message));p.on('console',m=>{if(m.type()==='error')console.log('err',m.text())});
    await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(500);
    await p.evaluate(()=>{const el=document.getElementById('i-rate');el.value=12;el.dispatchEvent(new Event('input'));__yard.advance(2400);});
    await p.click('#play');await p.waitForTimeout(2500);await p.click('#play');await p.waitForTimeout(300);
    const st=await p.evaluate(()=>{const S=__yard.S;return {pull:S.pullPl,exit:S.exitPl,hump:S.humpPl};});
    if(dpr===1){await p.screenshot({path:'/workspace/yard-sim/v2/shots/03-signals.png'});console.log(st);}
    else await p.screenshot({path:'/workspace/yard-sim/v2/shots/03-signals-crop.png',clip:{x:300,y:430,width:420,height:330}});
    await p.close();
  }
  await b.close();
})();
