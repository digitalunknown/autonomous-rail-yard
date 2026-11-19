const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file:///workspace/yard-sim/index.html'); await p.waitForTimeout(400);
  console.log(await p.evaluate(()=>{const Y=__yard;Y.P.socThr=60;let out=[];
    for(let i=0;i<10;i++){Y.advance(900);const S=Y.S;out.push(`t=${(S.t/3600).toFixed(2)} proc=${S.processed} pull=${S.pullPl} exit=${S.exitPl} hump=${S.humpPl} hold=${S.crestHold}`);}
    const S=Y.S;const pl=S.pl[S.pullPl];
    if(pl)out.push('PULL '+JSON.stringify(pl.veh.map(v=>({id:v.id,st:v.state,e:v.route[v.ri],ri:v.ri,n:v.route.length,s:v.s.toFixed(1),v:v.v.toFixed(2),end:v.route.slice(-3),res:v.res.map(r=>r.sw.id)}))));
    const pe=S.pl[S.exitPl];if(pe)out.push('EXIT '+JSON.stringify(pe.veh.map(v=>({id:v.id,st:v.state,e:v.route[v.ri],s:v.s.toFixed(1),v:v.v.toFixed(2)}))));
    out.push(Y.TRACKS.map(T=>T.id+':'+(T.key||'-')+' '+T.assigned+'/'+T.inbound).join(' '));
    out.push('D occ '+['D01','D02','D03'].map(d=>d+':'+Object.values(S.pl).filter(q=>q.dtrack===d).map(q=>q.id+q.state).join(',')).join(' '));
    const sws=[];for(const v of S.veh)for(const r of v.res)sws.push(v.id+'@'+r.sw.id+'('+v.state+','+v.route[v.ri]+')');out.push('RES '+sws.join(' '));
    return out.join('\n');}));
  await b.close();
})();
