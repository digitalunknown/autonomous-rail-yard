// ---------------- UI
const $=id=>document.getElementById(id);
let lastPv=0,running=false,speed=4,acc=0,last=performance.now(),frameN=0;
const RULES={dest:'One destination block per bowl track. Clean outbound platoons, but blocks wait to fill.',
  soc:'Bowl tracks banded by battery level, and low-SoC platoons hump first. Energy-matched platoons with mixed blocks.',
  fifo:'Fill tracks in arrival order. Fastest hump, but outbound platoons carry mixed blocks.'};
const SL=[['rate','i-rate',v=>v+' /hr'],['hump','i-hump',v=>(+v).toFixed(1)+' km/h'],['size','i-size',v=>v+' veh'],['socThr','i-soc',v=>v+'%']];
function syncInputs(){
  for(const[k,id,f] of SL){const el=$(id);el.value=P[k];paintSlider(el);$('o-'+id.slice(2)).textContent=f(P[k]);}
  $('n-rate').textContent='≈ '+P.rate*P.size+' veh/hr';
  $('chgToggle').classList.toggle('on',P.chargeOn);$('chgToggle').setAttribute('aria-checked',P.chargeOn);
  document.querySelectorAll('#ruleSeg button').forEach(b=>b.classList.toggle('on',b.dataset.r===P.rule));
  $('ruleDesc').textContent=RULES[P.rule];
  const n=Object.keys(DEF).filter(k=>P[k]!==DEF[k]).length;$('chgK').innerHTML='Run 01 · '+(n?'<b>'+n+' changed</b>':'all defaults');
}
function paintSlider(el){const p=(el.value-el.min)/(el.max-el.min)*100;el.style.setProperty('--p',p+'%');}
// any variable change while replaying branches the timeline there (future history discarded)
function setParam(fn){branch();fn();takeSnap();logEvt();syncInputs();refresh(true);}
for(const[k,id] of SL){$(id).addEventListener('input',e=>{const v=+e.target.value;setParam(()=>{P[k]=v;});});}
$('chgToggle').onclick=()=>setParam(()=>{P.chargeOn=!P.chargeOn;});
document.querySelectorAll('#ruleSeg button').forEach(b=>b.onclick=()=>setParam(()=>{P.rule=b.dataset.r;}));
$('defaultsBtn').onclick=()=>setParam(()=>{Object.assign(P,DEF);});
function setRunning(on){running=on;$('play').classList.toggle('idle',!on);$('play').setAttribute('aria-label',on?'Pause':'Play');
  $('playIco').innerHTML=on?'<rect x="4" y="3" width="3.6" height="12" rx=".8" fill="currentColor"/><rect x="10.4" y="3" width="3.6" height="12" rx=".8" fill="currentColor"/>':'<path d="M5 3.2v11.6L14.5 9z" fill="currentColor"/>';
  last=performance.now();if(typeof refresh==='function')refresh(true);}
$('play').onclick=()=>setRunning(!running);
$('stepBtn').onclick=()=>{setRunning(false);advance(60);refresh(true);};
document.querySelectorAll('#speedSeg button').forEach(b=>b.onclick=()=>{speed=+b.dataset.s;document.querySelectorAll('#speedSeg button').forEach(x=>x.classList.toggle('on',x===b));refresh(true);});
$('resetBtn').onclick=()=>{reset();};
$('faultBtn').onclick=()=>{branch();setFault(!S.faultOn);takeSnap();logEvt();updateFaultUI();refresh(true);};
document.querySelectorAll('.layers button').forEach(b=>b.onclick=()=>{LAYERS[b.dataset.l]=!LAYERS[b.dataset.l];b.classList.toggle('on',LAYERS[b.dataset.l]);b.setAttribute('aria-pressed',LAYERS[b.dataset.l]);staticDirty=true;});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.target.type!=='range')return;if(e.metaKey||e.ctrlKey)return;
  if(e.code==='Space'){e.preventDefault();setRunning(!running);}
  else if(e.key==='ArrowLeft'){e.preventDefault();uiSeek(S.t-60);}
  else if(e.key==='ArrowRight'){e.preventDefault();if(isReplay())uiSeek(S.t+60);else{advance(60);refresh(true);}}
  else if(e.key==='+'||e.key==='='){zoomTo(view.z*1.25);}else if(e.key==='-'||e.key==='_'){zoomTo(view.z/1.25);}else if(e.key==='0'){fitView();}
  else if(e.key==='.'){setRunning(false);advance(60);refresh(true);}else if(e.key==='Escape'){selected=null;refresh(true);}});
function updateFaultUI(){const on=S.faultOn;$('faultCard').classList.toggle('on',on);$('faultBtn').textContent=on?'Clear fault':'Trigger fault';
  const pill=$('faultPill');pill.textContent=on?'FAULT':'Nominal';pill.classList.toggle('on',on);
  $('faultSub').textContent=on?'Points failed to lock at '+fmtT(S.faultT)+'. B-04…B-12 and CH-01/02 are cut off. Hump stops 25 min for inspection, then reroutes into B-01…B-03 (mixed overflow) at 2 km/h.':'Bowl ladder, B-04 branch. Failing it cuts off B-04…B-12 and the charging spurs.';}
// map: click select, drag pan, wheel/pinch zoom, double-click zoom
function hitAt(sx,sy){const[wx,wy]=S2W(sx,sy);
  for(const t of hitTags)if(wx>=t.x&&wx<=t.x+t.w&&wy>=t.y&&wy<=t.y+t.h)return {type:'pl',id:t.id};
  let best=null,bd=Math.max(7/K,3.2*VZ);for(const v of S.veh){if(!v._pts)continue;for(let i=1;i<v._pts.length;i++){const d=segDist(wx,wy,v._pts[i-1],v._pts[i]);if(d<bd){bd=d;best=v;}}}
  return best?{type:'veh',id:best.id}:null;}
const ptrs=new Map();let drag=null,pinch=null;
function mxy(e){const r=mapC.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
mapC.addEventListener('pointerdown',e=>{mapC.setPointerCapture(e.pointerId);const p=mxy(e);ptrs.set(e.pointerId,p);
  if(ptrs.size===1)drag={x:p[0],y:p[1],sx:p[0],sy:p[1],moved:false};
  else if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:view.z};drag=null;}});
mapC.addEventListener('pointermove',e=>{const p=mxy(e);
  if(ptrs.has(e.pointerId)){ptrs.set(e.pointerId,p);
    if(pinch&&ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt(pinch.z*d/pinch.d/view.z,(a[0]+b[0])/2,(a[1]+b[1])/2);return;}
    if(drag){if(!drag.moved&&Math.hypot(p[0]-drag.sx,p[1]-drag.sy)>3)drag.moved=true;if(drag.moved){panBy(p[0]-drag.x,p[1]-drag.y);mapC.style.cursor='grabbing';}drag.x=p[0];drag.y=p[1];}
    return;}
  mapC.style.cursor=hitAt(p[0],p[1])?'pointer':'grab';});
function endPtr(e){const had=ptrs.has(e.pointerId);ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;
  if(had&&drag&&!drag.moved&&e.type==='pointerup'){const p=mxy(e);selected=hitAt(p[0],p[1]);refresh(true);}
  if(ptrs.size===0){drag=null;mapC.style.cursor='grab';}}
mapC.addEventListener('pointerup',endPtr);mapC.addEventListener('pointercancel',endPtr);
mapC.addEventListener('wheel',e=>{e.preventDefault();const p=mxy(e);const dy=e.deltaMode===1?e.deltaY*16:e.deltaY;zoomAt(Math.exp(-dy*(e.ctrlKey?0.01:0.0015)),p[0],p[1]);},{passive:false});
mapC.addEventListener('dblclick',e=>{const p=mxy(e);zoomAt(1.6,p[0],p[1]);});
$('zIn').onclick=()=>zoomTo(view.z*1.25);$('zOut').onclick=()=>zoomTo(view.z/1.25);$('zFit').onclick=()=>fitView();
miniC.addEventListener('pointerdown',e=>{if(!MINI)return;const r=miniC.getBoundingClientRect();centerOn((e.clientX-r.left-MINI.ox)/MINI.k,(e.clientY-r.top-MINI.oy)/MINI.k);});
// timeline: click/drag to scrub, hover tooltip, band labels jump to the band start
const zPctEl=$('zPct');
function uiSeek(t){seek(t);syncInputs();updateFaultUI();refresh(true);}
let tlDrag=null;
function tlXY(e){const r=tlC.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
function bandAt(x,y){if(!TLG||y>TLG.top+14)return null;for(const b of TLG.bands)if(x>=b.x0&&x<=b.x1)return b;return null;}
tlC.addEventListener('pointerdown',e=>{if(!TLG)return;tlC.setPointerCapture(e.pointerId);const[x,y]=tlXY(e);
  tlDrag={was:running};setRunning(false);const b=bandAt(x,y);uiSeek(b?b.t:TLG.T(x));if(b)tlDrag.band=true;});
tlC.addEventListener('pointermove',e=>{if(!TLG)return;const[x,y]=tlXY(e);
  if(tlDrag&&!tlDrag.band){uiSeek(TLG.T(x));}
  const tip=$('tltip');const t=clamp(TLG.T(x),TLG.start,TLG.end);const b=bandAt(x,y);
  if(t>HIST.liveT+1){tip.style.display='none';return;}
  const{sr,q}=tlRates();const i=Math.min(sr.length-1,Math.max(0,Math.floor(t/BIN)));
  tip.innerHTML=b?`<b style="color:var(--red)">${b.kind}</b> ${fmtT(b.t).slice(0,7)} → ${fmtT(b.b).slice(2,7)}<br><span class="k">click to jump to start</span>`:
    `<b>${fmtT(t).slice(0,7)}</b>${t<minScrubT()?' <span class="k">(outside history)</span>':''}<br><span class="k">sorted</span> ${Math.round(sr[i]||0)} veh/hr · <span class="k">queue</span> ${q[i]||0}`;
  tip.style.display='block';tip.style.left=clamp(x,60,TLG.w-60)+'px';tip.style.top=(TLG.top-4)+'px';});
function tlUp(){if(tlDrag){const w=tlDrag.was;tlDrag=null;if(w)setRunning(true);}}
tlC.addEventListener('pointerup',tlUp);tlC.addEventListener('pointercancel',tlUp);
tlC.addEventListener('pointerleave',()=>{$('tltip').style.display='none';});
$('liveBtn').onclick=()=>{if(isReplay())uiSeek(HIST.liveT);};$('rbGo').onclick=()=>uiSeek(HIST.liveT);
function segDist(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((x-a[0])*dx+(y-a[1])*dy)/l:0;t=clamp(t,0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
const STATE_TXT={inbound:'Inbound · ML1',receiving:'Receiving',humping:'Humping',rolling:'Rolling',classified:'Classified · awaiting pull',charging:'Charging',pulling:'Pulling to departure',assembling:'Assembling',departing:'Departing',through:'Through · ML2'};
function vehState(v){if(v.state==='inbound'&&v.blocked)return['HOLD X-01','red'];if(v.state==='rolling'&&!v.target)return['STRANDED','red'];
  if(v.blocked)return['QUEUED','red'];if(v.state==='charging')return['CHARGING','yellow'];if(v.state==='receiving'||v.state==='assembling'||v.state==='classified')return['HOLDING','yellow'];return['MOVING','lime'];}
function pill(t,c){return `<span class="dz-pill ${c}">${t}</span>`;}
function socHTML(s){return `<span><span class="socbar"><i style="width:${s}%;background:${socColor(s)}"></i></span>${Math.round(s)}%</span>`;}
function row(k,v){return `<div class="dz-row"><span>${k}</span><span>${v}</span></div>`;}
function renderDossier(){const dz=$('dossier');
  if(selected&&selected.type==='veh'){const v=S.veh.find(x=>x.id===selected.id)||S.pending.find(x=>x.id===selected.id);
    if(!v){selected=null;}else{const[st,c]=vehState(v);const e=v.spawned?EDGES[v.route[v.ri]]:null;
      let tgt=v.target?v.target.id:v.state==='pulling'||v.state==='assembling'?(S.pl[v.platoon]&&S.pl[v.platoon].dtrack?EDGES[S.pl[v.platoon].dtrack].track:'—'):v.state==='departing'?'ML2 W':'—';
      dz.className='sel';dz.innerHTML=`<div class="dz-k">Vehicle</div><div class="dz-head"><span class="dz-id">${v.id}</span>${pill(st,c)}</div>`+
        row('SoC',socHTML(v.soc))+row('DEST BLOCK',v.thru?'Through':`${v.block} · ${BLOCKNAME[v.block]}`)+row('TRACK',e?e.track:'Off-map · ML1')+
        row('STATE',STATE_TXT[v.state]+(v.state==='rolling'&&v.target?' → '+v.target.id:''))+row('ASSIGNED',tgt)+row('PLATOON',v.platoon||'— cut')+
        (v.thru?'':row('DWELL',((S.t-v.spawnT)/60).toFixed(0)+' min'));return;}}
  if(selected&&selected.type==='pl'){const pl=S.pl[selected.id];
    if(!pl){selected=null;}else{const vs=pl.veh;const soc=vs.reduce((a,v)=>a+v.soc,0)/Math.max(1,vs.length);const bl=vs.some(v=>v.blocked);
      const blocks=pl.kind==='thru'?'Through':pl.kind==='out'?(pl.relay?'Relay · charged':pl.dom+' · '+BLOCKNAME[pl.dom]):[...new Set(vs.map(v=>v.block))].join(' ');
      const tr=vs.find(v=>v.spawned);const st=bl?['QUEUED','red']:(pl.state==='receiving'||pl.state==='assembling')?['HOLDING','yellow']:['MOVING','lime'];
      dz.className='sel';dz.innerHTML=`<div class="dz-k">Platoon · ${pl.kind==='in'?'inbound':pl.kind==='out'?'outbound':'through'}</div><div class="dz-head"><span class="dz-id">${pl.id} <span>×${vs.length}</span></span>${pill(st[0],st[1])}</div>`+
        row('AVG SoC',socHTML(soc))+row(pl.kind==='in'?'BLOCKS':'DEST BLOCK',blocks)+row('TRACK',tr?EDGES[tr.route[tr.ri]].track:'Off-map · ML1')+
        row('STATE',plLabel(pl).replace(pl.id,'').replace(/^ ×\d+ ?/,'')||pl.state)+row('COUPLERS','0 · virtual link')+
        `<div class="dz-chips">${vs.map(v=>`<i title="${v.id}" style="background:${socColor(v.soc)}"></i>`).join('')}</div>`;return;}}
  dz.className='';dz.innerHTML=`<div class="dz-k">Nothing selected</div><div class="dz-empty">Click a vehicle or platoon tag to see its battery, block, track and state.</div>`;
}
function refresh(force){
  $('clock').textContent=fmtT(S.t);
  const dep=S.departed;const avg=dep.length?dep.reduce((a,d)=>a+d.dwell,0)/dep.length/60:null;const on=dep.length?dep.filter(d=>d.ok).length/dep.length*100:null;
  const tone=(id,c)=>{$(id).style.background=c==='lime'?'var(--fg-4)':`var(--${c})`;};
  $('v-dwell').textContent=avg==null?'—':avg.toFixed(1);tone('d-dwell',avg==null?'lime':avg<=75?'lime':avg<=110?'yellow':'red');
  $('s-dwell').innerHTML=avg==null?'no departures yet':`<span class="${avg<=75?'':avg<=110?'c-yellow':'c-red'}">${avg<=75?'within':'over'} 75 min target</span> · n=${dep.length}`;
  $('v-ontime').textContent=on==null?'—':on.toFixed(0);tone('d-ontime',on==null?'lime':on>=85?'lime':on>=60?'yellow':'red');
  $('s-ontime').textContent='right block, ≤ 75 min dwell';
  $('v-proc').textContent=S.processed;tone('d-proc','lime');
  const lastHr=S.departed.filter(d=>d.t>S.t-3600).length;$('s-proc').innerHTML=`+${lastHr} last hr · ${S.sorted} humped`;
  $('v-queue').textContent=S.queue;tone('d-queue',S.queue<5?'lime':S.queue<10?'yellow':'red');
  $('s-queue').innerHTML=`<span class="${S.queue>=10?'c-red':''}">ML1 ${S.qML} · hump ${S.qHump} · fault ${S.qFault}${S.diverted?' · diverted '+S.diverted:''}</span>`;
  const sc=$('statusChip');
  if(S.faultOn){sc.className='schip bad';sc.textContent='X-24 FAULT';}else if(S.jamOn){sc.className='schip bad';sc.textContent='JAM · QUEUE '+S.queue;}
  else if(S.queue>=5||S.crestHold){sc.className='schip warn';sc.textContent=S.crestHold?'HUMP HOLD':'CONGESTED';}else{sc.className='schip ok';sc.textContent='FLOWING';}
  if(HIST.pv!==lastPv){lastPv=HIST.pv;syncInputs();updateFaultUI();}
  const rp=isReplay();$('replayBar').style.display=rp?'flex':'none';
  if(rp){$('rbT').textContent=fmtT(S.t).slice(0,7);$('rbLive').textContent='live '+fmtT(HIST.liveT).slice(0,7);}
  const lc=$('liveChip');lc.classList.toggle('replay',rp);lc.classList.toggle('on',!rp&&running);$('liveTxt').textContent=rp?'REPLAY '+fmtT(S.t).slice(0,7)+(running?' · '+speed+'×':''):running?'LIVE · '+speed+'×':'PAUSED';
  const lb=$('liveBtn');lb.className=rp?'go':'on';lb.innerHTML=rp?'<i></i>Go live':'<i></i>LIVE';
  $('zPct').textContent=Math.round(view.z*100)+'%';
  renderDossier();drawTL();
}
function frame(now){const dtr=Math.min(0.1,(now-last)/1000);last=now;
  if(running){acc+=dtr*SIM_PER_SEC*speed;let n=0;while(acc>=DT&&n<240){step();acc-=DT;n++;}if(n>=240)acc=0;}
  draw();drawMini();zPctEl.textContent=Math.round(view.z*100)+'%';if(++frameN%8===0)refresh();requestAnimationFrame(frame);}
function reset(){newState();advance(90*60);selected=null;setRunning(false);updateFaultUI();refresh(true);}
window.addEventListener('resize',()=>{resize();refresh(true);});
syncInputs();newState();advance(90*60);resize();updateFaultUI();refresh(true);requestAnimationFrame(frame);
// embedded fonts can land after the first canvas paint: repaint the cached static layer once they are ready
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{staticDirty=true;refresh(true);});
// test hooks
window.__yard={get S(){return S;},P,advance:s=>{advance(s);refresh(true);},setFault:on=>{branch();setFault(on);takeSnap();logEvt();updateFaultUI();refresh(true);},
  play:()=>setRunning(true),pause:()=>setRunning(false),get running(){return running;},select:id=>{selected={type:'veh',id};refresh(true);},
  selectPl:id=>{selected={type:'pl',id};refresh(true);},
  vehScreen:id=>{const v=S.veh.find(x=>x.id===id);if(!v||!v._pts)return null;const p=v._pts[Math.floor(v._pts.length/2)];const r=mapC.getBoundingClientRect();const q=W2S(p[0],p[1]);return [q[0]+r.left,q[1]+r.top];},
  get selected(){return selected;},seek:t=>uiSeek(t),get liveT(){return HIST.liveT;},isReplay:()=>isReplay(),snaps:()=>SNAPS.length,minT:()=>minScrubT(),
  hash:()=>stateHash(),view,zoomAt:(f,x,y)=>{zoomAt(f,x,y);},zoomTo:z=>zoomTo(z),centerOn:(x,y)=>centerOn(x,y),fit:()=>fitView(),
  setParam:(k,v)=>setParam(()=>{P[k]=v;}),toggleFault:()=>$('faultBtn').click(),w2s:(x,y)=>{const r=mapC.getBoundingClientRect();const q=W2S(x,y);return [q[0]+r.left,q[1]+r.top];},
  tlX:t=>{const r=tlC.getBoundingClientRect();return [r.left+TLG.X(t),r.top+TLG.top+TLG.ph*0.6];},TLG:()=>TLG,refresh:()=>refresh(true),TRACKS};
})();
</script>
</body></html>
