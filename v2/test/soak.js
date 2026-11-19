const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[];p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const Y=__yard,P=Y.P;let rs=12345;const R=()=>(rs=(rs*1103515245+12345)%2147483648)/2147483648;
    const log=[];let lastProc=Y.S.processed,stallHrs=0,maxStall=0,overlaps=0;
    for(let h=0;h<60;h++){
      if(R()<.5){P.rate=2+Math.floor(R()*20);P.size=2+Math.floor(R()*11);P.hump=1+Math.floor(R()*14)/2;P.socThr=Math.floor(R()*13)*5;P.rule=['dest','soc','fifo'][Math.floor(R()*3)];P.chargeOn=R()<.8;}
      if(R()<.2)Y.setFault(!Y.S.faultOn);
      const t0=performance.now();Y.advance(3600);const S=Y.S;console.log('h'+h+' ms='+Math.round(performance.now()-t0)+' veh='+S.veh.length+' pend='+S.pending.length+' pls='+Object.keys(S.pl).length+' rate='+P.rate+' size='+P.size);
      // overlap check: same edge, intervals intersect
      const by={};for(const v of S.veh){const e=v.route[v.ri];(by[e]=by[e]||[]).push(v);}
      for(const e in by){const a=by[e].sort((x,y)=>x.s-y.s);for(let i=1;i<a.length;i++)if(a[i].s-a[i].len<a[i-1].s-1e-3)overlaps++;}
      if(S.processed===lastProc){stallHrs++;maxStall=Math.max(maxStall,stallHrs);}else stallHrs=0;lastProc=S.processed;
      log.push(`h${h} rate=${P.rate} size=${P.size} hump=${P.hump} rule=${P.rule} fault=${S.faultOn} veh=${S.veh.length} q=${S.queue} proc=${S.processed}`);}
    return {log:log.join('\n'),maxStall,overlaps};});
  console.log(r.log);console.log('maxStallHours',r.maxStall,'overlaps',r.overlaps,'errs',errs);await b.close();
})();
