const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file:///workspace/yard-sim/index.html'); await p.waitForTimeout(400);
  console.log(await p.evaluate(()=>{const Y=__yard;const S0=()=>Y.S;Y.setFault(true);let out=[];
    for(let i=0;i<8;i++){Y.advance(900);const S=S0();out.push(`t=${(S.t/3600).toFixed(2)} proc=${S.processed} q=${S.queue} f=${S.qFault} pull=${S.pullPl} exit=${S.exitPl} hump=${S.humpPl} hold=${S.crestHold}`);}
    const S=S0();
    for(const id of [S.pullPl,S.exitPl]){const pl=S.pl[id];if(pl)out.push(id+' '+pl.state+' '+JSON.stringify(pl.veh.map(v=>({id:v.id,st:v.state,e:v.route[v.ri],s:+v.s.toFixed(1),v:+v.v.toFixed(2),end:v.route.slice(-2),res:v.res.map(r=>r.sw.id)}))));}
    out.push(Y.TRACKS.map(T=>T.id+':'+(T.key||'-')+' '+T.assigned+'/'+T.inbound+(T.closed?'C':'')).join(' '));
    const sws=[];for(const v of S.veh)for(const r of v.res)sws.push(v.id+'@'+r.sw.id+'('+v.state+','+v.route[v.ri]+')');out.push('RES '+sws.join(' '));
    const st={};for(const v of S.veh){const k=v.state+'@'+v.route[v.ri]+(v.target?'':'!');st[k]=(st[k]||0)+1;}out.push(JSON.stringify(st));
    out.push('D '+['D01','D02','D03'].map(d=>d+':'+EDGES_occ(d)).join(' '));
    function EDGES_occ(d){return Object.values(S.pl).filter(q=>q.dtrack===d).map(q=>q.id+q.state).join(',');}
    return out.join('\n');}));
  await b.close();
})();
