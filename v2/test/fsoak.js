const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(600);
const r=await p.evaluate(()=>{const Y=__yard;let x=12345;const R=()=>{x=(Math.imul(x,1103515245)+12345)>>>0;return x/4294967296;};
  const types=['turnout','retarder','charger','battery','track'];let inj=0,clr=0,overlaps=0,maxF=0,stallHrs=0,maxStall=0;let lastProc=Y.S.processed;const log=[];
  const TT=['R01','R02','R03','R04','LEAD','B01','B02','B03','B04','B05','B06','B07','B08','B09','B10','B11','B12','CH01','CH02','D01','D02','D03'];
  for(let m=0;m<24*60;m+=10){
    if(R()<0.35){const t=types[Math.floor(R()*5)];const tg=t==='turnout'?Y.TURNOUTS[Math.floor(R()*Y.TURNOUTS.length)]:t==='charger'?(R()<.5?'CH01':'CH02'):t==='track'?TT[Math.floor(R()*TT.length)]:'random';
      if(Y.inject({type:t,target:tg,dur:[0,900,1800,3600][Math.floor(R()*4)]}))inj++;}
    if(Y.S.flist.length&&R()<0.25){Y.clearFault(Y.S.flist[Math.floor(R()*Y.S.flist.length)].id);clr++;}
    if(m%240===230){Y.clearAll();}
    Y.advance(600);maxF=Math.max(maxF,Y.S.flist.length);
    const by={};for(const v of Y.S.veh){const e=v.route[v.ri];(by[e]=by[e]||[]).push(v);}
    for(const e in by){const a=by[e].sort((p,q)=>p.s-q.s);for(let i=1;i<a.length;i++)if(a[i].s-a[i].len<a[i-1].s-1e-3)overlaps++;}
    if(m%60===50){if(Y.S.processed===lastProc&&!Y.S.flist.length){stallHrs++;maxStall=Math.max(maxStall,stallHrs);}else stallHrs=0;lastProc=Y.S.processed;
      log.push(`h${(m+10)/60} faults=${Y.S.flist.length} q=${Y.S.queue} proc=${Y.S.processed} veh=${Y.S.veh.length}`);}}
  Y.clearAll();const p0=Y.S.processed;Y.advance(3*3600);
  return {inj,clr,overlaps,maxF,maxStall,recover:Y.S.processed-p0,q:Y.S.queue,log:log.join('\n')};});
console.log(r.log);console.log(JSON.stringify({...r,log:undefined}),'errs',errs);await b.close();})();
