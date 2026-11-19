const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(400);
  console.log(await p.evaluate(()=>{const Y=__yard,P=Y.P;const A=h=>Y.advance(h*3600);
    P.rate=10;A(2);P.rate=24;A(2);P.rate=8;Y.setFault(true);A(1.5);
    const S=Y.S;let out=[`t=${(S.t/3600).toFixed(2)} proc=${S.processed} pull=${S.pullPl} exit=${S.exitPl} hump=${S.humpPl} hold=${S.crestHold}`];
    const V=v=>({id:v.id,st:v.state,e:v.route[v.ri],s:+v.s.toFixed(1),v:+v.v.toFixed(2),end:v.route.slice(-2),tg:v.target&&v.target.id,res:v.res.map(r=>r.sw.id)});
    out.push('LEADFRONT '+JSON.stringify(S.veh.filter(v=>['LEAD','Bd0','Bd1','Bd2','Bd3','Bd4'].includes(v.route[v.ri])).sort((a,b)=>b.s-a.s).slice(0,6).map(V)));
    out.push('STRAND '+JSON.stringify(S.veh.filter(v=>v.state==='rolling'&&!v.target).map(V)));
    out.push(Y.TRACKS.map(T=>T.id+':'+(T.key||'-')+' '+T.assigned+'/'+T.inbound+(T.closed?'C':'')).join(' '));
    for(const id of [S.pullPl,S.exitPl]){const pl=S.pl[id];if(pl)out.push(id+' '+JSON.stringify(pl.veh.map(V)));}
    const sws=[];for(const v of S.veh)for(const r of v.res)sws.push(v.id+'@'+r.sw.id+'('+v.state+','+v.route[v.ri]+')');out.push('RES '+sws.join(' '));
    out.push('THROW '+JSON.stringify(Object.values(S.pl).filter(q=>q.kind==='out').map(q=>q.id+q.state+(q.dtrack||''))));
    return out.join('\n');}));
  await b.close();
})();
