const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(700);
await p.evaluate(()=>{const Y=__yard;Y.advance(20*60);Y.inject({type:'turnout',target:'X-28',dur:1800});Y.advance(6*60);Y.inject({type:'charger',target:'CH01'});
  Y.inject({type:'track',target:'B10'});Y.advance(4*60);Y.inject({type:'retarder',dur:1800});Y.advance(3*60);Y.inject({type:'battery',target:'random'});Y.advance(8*60);});
await p.click('#fPick');const xy=await p.evaluate(()=>__yard.swXY('X-31'));await p.mouse.move(xy[0],xy[1]);await p.waitForTimeout(300);
await p.screenshot({path:'../shots/after-10-anchored.png'});
await p.click('#pickDone');await p.click('#legendBtn');await p.mouse.move(300,400);await p.waitForTimeout(300);
await p.screenshot({path:'../shots/after-10-legend-open.png'});console.log('errs',errs);await b.close();})();
