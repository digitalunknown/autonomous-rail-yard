const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h,name] of [[1440,900,'after-09-faults'],[1180,760,'after-09-faults-1180x760']]){
const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(700);
await p.evaluate(()=>{const Y=__yard;Y.advance(20*60);Y.inject({type:'turnout',target:'X-28',dur:1800});Y.advance(6*60);Y.inject({type:'charger',target:'CH01'});
  Y.inject({type:'track',target:'B10'});Y.advance(4*60);Y.inject({type:'retarder',dur:1800});Y.advance(3*60);Y.inject({type:'battery',target:'random'});Y.advance(8*60);});
await p.selectOption('#fType','track');
await p.waitForTimeout(300);await p.screenshot({path:'../shots/'+name+'.png'});console.log(name,errs);await p.close();}
await b.close();})();
