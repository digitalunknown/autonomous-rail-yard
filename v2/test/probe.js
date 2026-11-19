const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())}); p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(800);
  const snap=()=>p.evaluate(()=>{const S=__yard.S;const d=S.departed;return {t:(S.t/3600).toFixed(2),veh:S.veh.length,pend:S.pending.length,q:S.queue,qML:S.qML,qH:S.qHump,qF:S.qFault,proc:S.processed,sorted:S.sorted,
    dwell:d.length?(d.reduce((a,x)=>a+x.dwell,0)/d.length/60).toFixed(1):null,ontime:d.length?(d.filter(x=>x.ok).length/d.length*100).toFixed(0):null,crest:S.crestHold,
    states:S.veh.reduce((a,v)=>(a[v.state]=(a[v.state]||0)+1,a),{}),tracks:__yard.TRACKS.map(T=>T.id+':'+(T.key||'-')+' '+T.assigned+'/'+T.inbound).join(' ')}});
  console.log('init',JSON.stringify(await snap()));
  for(let i=0;i<6;i++){await p.evaluate(()=>__yard.advance(3600)); console.log('hr',JSON.stringify(await snap()));}
  console.log('ERRORS',errs);
  await b.close();
})();
