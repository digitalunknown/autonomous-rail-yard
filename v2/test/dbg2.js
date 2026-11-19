const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(400);
  console.log(await p.evaluate(()=>{const Y=__yard,P=Y.P;const A=h=>Y.advance(h*3600);
    P.rate=10;A(2);P.rate=16;A(2);P.rate=8;Y.setFault(true);A(2);Y.setFault(false);A(2);P.rule='fifo';A(1.5);P.rule='soc';P.size=12;P.hump=1;A(1.5);P.rule='dest';P.size=2;P.hump=8;A(1.5);P.size=6;P.socThr=60;A(1.5);
    const S=Y.S;let out=[`t=${(S.t/3600).toFixed(2)} proc=${S.processed} pull=${S.pullPl} exit=${S.exitPl} hump=${S.humpPl} hold=${S.crestHold}`];
    for(const id of [S.pullPl,S.exitPl,S.humpPl]){const pl=S.pl[id];if(pl)out.push(id+' '+pl.state+' '+JSON.stringify(pl.veh.map(v=>({id:v.id,st:v.state,e:v.route[v.ri],ri:v.ri,n:v.route.length,s:+v.s.toFixed(1),v:+v.v.toFixed(2),end:v.route.slice(-2),res:v.res.map(r=>r.sw.id),bl:v.blocked}))));}
    out.push(Y.TRACKS.map(T=>T.id+':'+(T.key||'-')+' '+T.assigned+'/'+T.inbound+(T.closed?'C':'')).join(' '));
    out.push('PL '+Object.values(S.pl).map(q=>q.id+':'+q.kind+':'+q.state+':'+(q.dtrack||q.rtrack||'')+':'+q.veh.length).join(' '));
    const sws=[];for(const v of S.veh)for(const r of v.res)sws.push(v.id+'@'+r.sw.id+'('+v.state+','+v.route[v.ri]+')');out.push('RES '+sws.join(' '));
    const st={};for(const v of S.veh){const k=v.state+'@'+v.route[v.ri];st[k]=(st[k]||0)+1;}out.push(JSON.stringify(st));
    return out.join('\n');}));
  await b.close();
})();
