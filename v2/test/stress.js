const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(500);
  const snap=()=>p.evaluate(()=>{const S=__yard.S;const d=S.departed;return `t=${(S.t/3600).toFixed(2)} veh=${S.veh.length} q=${S.queue}(ml${S.qML} h${S.qHump} f${S.qFault}) proc=${S.processed} dwell=${d.length?(d.reduce((a,x)=>a+x.dwell,0)/d.length/60).toFixed(1):'-'} ot=${d.length?(d.filter(x=>x.ok).length/d.length*100).toFixed(0):'-'} hold=${S.crestHold} jam=${S.jamOn}`});
  const run=async(label,setup,hours)=>{await p.evaluate(setup);console.log('--',label);for(let i=0;i<hours;i++){await p.evaluate(()=>__yard.advance(1800));console.log(await snap());}};
  await run('rate 10',()=>{__yard.P.rate=10},4);
  await run('rate 24',()=>{__yard.P.rate=24},4);
  await run('back to 8 + fault',()=>{__yard.P.rate=8;__yard.setFault(true)},4);
  await run('clear fault',()=>{__yard.setFault(false)},4);
  await run('fifo',()=>{__yard.P.rule='fifo'},3);
  await run('soc + size 12 + hump 1',()=>{__yard.P.rule='soc';__yard.P.size=12;__yard.P.hump=1},3);
  await run('dest size 2 hump 8',()=>{__yard.P.rule='dest';__yard.P.size=2;__yard.P.hump=8},3);
  await run('soc thr 60',()=>{__yard.P.size=6;__yard.P.socThr=60},3);
  console.log('ERR',errs);await b.close();
})();
