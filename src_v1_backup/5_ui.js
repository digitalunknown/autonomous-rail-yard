// ---------------- UI
const $=id=>document.getElementById(id);
let running=false,speed=4,acc=0,last=performance.now(),frameN=0;
const RULES={dest:'One destination block per bowl track. Clean outbound platoons, but blocks wait to fill.',
  soc:'Bowl tracks banded by battery level, and low-SoC platoons hump first. Energy-matched platoons with mixed blocks.',
  fifo:'Fill tracks in arrival order. Fastest hump, but outbound platoons carry mixed blocks.'};
const SL=[['rate','i-rate',v=>v+' /hr'],['hump','i-hump',v=>(+v).toFixed(1)+' km/h'],['size','i-size',v=>v+' veh'],['socThr','i-soc',v=>v+'%']];
function syncInputs(){
  for(const[k,id,f] of SL){const el=$(id);el.value=P[k];paintSlider(el);$('o-'+id.slice(2)).textContent=f(P[k]);}
  $('n-rate').textContent='≈ '+P.rate*P.size+' veh/hr';
  $('chgToggle').classList.toggle('on',P.chargeOn);
  document.querySelectorAll('#ruleSeg button').forEach(b=>b.classList.toggle('on',b.dataset.r===P.rule));
  $('ruleDesc').textContent=RULES[P.rule];
  const n=Object.keys(DEF).filter(k=>P[k]!==DEF[k]).length;$('chgK').textContent='SIM VARIABLES · '+(n?n+' CHANGED · LIVE':'LIVE');
}
function paintSlider(el){const p=(el.value-el.min)/(el.max-el.min)*100;el.style.setProperty('--p',p+'%');}
for(const[k,id] of SL){$(id).addEventListener('input',e=>{P[k]=+e.target.value;syncInputs();});}
$('chgToggle').onclick=()=>{P.chargeOn=!P.chargeOn;syncInputs();};
document.querySelectorAll('#ruleSeg button').forEach(b=>b.onclick=()=>{P.rule=b.dataset.r;syncInputs();});
$('defaultsBtn').onclick=()=>{Object.assign(P,DEF);syncInputs();};
function setRunning(on){running=on;$('play').classList.toggle('idle',!on);
  $('playIco').innerHTML=on?'<rect x="4" y="3" width="3.6" height="12" rx=".8" fill="currentColor"/><rect x="10.4" y="3" width="3.6" height="12" rx=".8" fill="currentColor"/>':'<path d="M5 3.2v11.6L14.5 9z" fill="currentColor"/>';
  $('liveChip').classList.toggle('on',on);$('liveTxt').textContent=on?'LIVE · '+speed+'×':'PAUSED';last=performance.now();}
$('play').onclick=()=>setRunning(!running);
$('stepBtn').onclick=()=>{setRunning(false);advance(60);refresh(true);};
document.querySelectorAll('#speedSeg button').forEach(b=>b.onclick=()=>{speed=+b.dataset.s;document.querySelectorAll('#speedSeg button').forEach(x=>x.classList.toggle('on',x===b));if(running)$('liveTxt').textContent='LIVE · '+speed+'×';});
$('resetBtn').onclick=()=>{reset();};
$('faultBtn').onclick=()=>{setFault(!S.faultOn);updateFaultUI();refresh(true);};
document.querySelectorAll('.layers button').forEach(b=>b.onclick=()=>{LAYERS[b.dataset.l]=!LAYERS[b.dataset.l];b.classList.toggle('on',LAYERS[b.dataset.l]);drawStatic();});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.target.type!=='range')return;
  if(e.code==='Space'){e.preventDefault();setRunning(!running);}else if(e.key==='.'){setRunning(false);advance(60);refresh(true);}else if(e.key==='Escape'){selected=null;refresh(true);}});
function updateFaultUI(){const on=S.faultOn;$('faultCard').classList.toggle('on',on);$('faultBtn').textContent=on?'Clear fault':'Trigger fault';
  const pill=$('faultPill');pill.textContent=on?'FAULT':'NOMINAL';pill.style.background=on?'var(--red)':'#1d2228';pill.style.color=on?'#fff':'var(--muted)';
  $('faultSub').textContent=on?'Points failed to lock at '+fmtT(S.faultT)+'. B-04…B-12 and CH-01/02 are cut off. Hump stops 25 min for inspection, then reroutes into B-01…B-03 (mixed overflow) at 2 km/h.':'Bowl ladder · B-04 branch. Failing it cuts off B-04…B-12 and the charging spurs.';}
// selection
mapC.addEventListener('click',e=>{const r=mapC.getBoundingClientRect();const wx=(e.clientX-r.left-OX)/K,wy=(e.clientY-r.top-OY)/K;
  for(const t of hitTags)if(wx>=t.x&&wx<=t.x+t.w&&wy>=t.y&&wy<=t.y+t.h){selected={type:'pl',id:t.id};refresh(true);return;}
  let best=null,bd=7;for(const v of S.veh){if(!v._pts)continue;for(let i=1;i<v._pts.length;i++){const d=segDist(wx,wy,v._pts[i-1],v._pts[i]);if(d<bd){bd=d;best=v;}}}
  selected=best?{type:'veh',id:best.id}:null;refresh(true);});
mapC.addEventListener('mousemove',e=>{const r=mapC.getBoundingClientRect();const wx=(e.clientX-r.left-OX)/K,wy=(e.clientY-r.top-OY)/K;
  let hit=hitTags.some(t=>wx>=t.x&&wx<=t.x+t.w&&wy>=t.y&&wy<=t.y+t.h);
  if(!hit)for(const v of S.veh){if(!v._pts)continue;for(let i=1;i<v._pts.length;i++)if(segDist(wx,wy,v._pts[i-1],v._pts[i])<6){hit=true;break;}if(hit)break;}
  mapC.style.cursor=hit?'pointer':'crosshair';});
function segDist(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((x-a[0])*dx+(y-a[1])*dy)/l:0;t=clamp(t,0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
const STATE_TXT={inbound:'Inbound · ML1',receiving:'Receiving',humping:'Humping',rolling:'Rolling',classified:'Classified · awaiting pull',charging:'Charging',pulling:'Pulling to departure',assembling:'Assembling',departing:'Departing',through:'Through · ML2'};
function vehState(v){if(v.state==='inbound'&&v.blocked)return['HOLD X-01','red'];if(v.state==='rolling'&&!v.target)return['STRANDED','red'];
  if(v.blocked)return['QUEUED','red'];if(v.state==='charging')return['CHARGING','yellow'];if(v.state==='receiving'||v.state==='assembling'||v.state==='classified')return['HOLDING','yellow'];return['MOVING','lime'];}
function pill(t,c){const bg={red:'var(--red)',yellow:'rgba(245,197,66,.16)',lime:'rgba(198,244,50,.14)',cobalt:'var(--cobalt)'}[c];const fg={red:'#fff',yellow:'var(--yellow)',lime:'var(--lime)',cobalt:'#fff'}[c];return `<span class="dz-pill" style="background:${bg};color:${fg}">${t}</span>`;}
function socHTML(s){return `<span><span class="socbar"><i style="width:${s}%;background:${socColor(s)}"></i></span>${Math.round(s)}%</span>`;}
function row(k,v){return `<div class="dz-row"><span>${k}</span><span>${v}</span></div>`;}
function renderDossier(){const dz=$('dossier');
  if(selected&&selected.type==='veh'){const v=S.veh.find(x=>x.id===selected.id)||S.pending.find(x=>x.id===selected.id);
    if(!v){selected=null;}else{const[st,c]=vehState(v);const e=v.spawned?EDGES[v.route[v.ri]]:null;
      let tgt=v.target?v.target.id:v.state==='pulling'||v.state==='assembling'?(S.pl[v.platoon]&&S.pl[v.platoon].dtrack?EDGES[S.pl[v.platoon].dtrack].track:'—'):v.state==='departing'?'ML2 W':'—';
      dz.className='sel';dz.innerHTML=`<div class="dz-k">VEHICLE · DOSSIER</div><div class="dz-head"><span class="dz-id">${v.id}</span>${pill(st,c)}</div>`+
        row('SoC',socHTML(v.soc))+row('DEST BLOCK',v.thru?'Through':`${v.block} · ${BLOCKNAME[v.block]}`)+row('TRACK',e?e.track:'Off-map · ML1')+
        row('STATE',STATE_TXT[v.state]+(v.state==='rolling'&&v.target?' → '+v.target.id:''))+row('ASSIGNED',tgt)+row('PLATOON',v.platoon||'— cut')+
        (v.thru?'':row('DWELL',((S.t-v.spawnT)/60).toFixed(0)+' min'));return;}}
  if(selected&&selected.type==='pl'){const pl=S.pl[selected.id];
    if(!pl){selected=null;}else{const vs=pl.veh;const soc=vs.reduce((a,v)=>a+v.soc,0)/Math.max(1,vs.length);const bl=vs.some(v=>v.blocked);
      const blocks=pl.kind==='thru'?'Through':pl.kind==='out'?(pl.relay?'Relay · charged':pl.dom+' · '+BLOCKNAME[pl.dom]):[...new Set(vs.map(v=>v.block))].join(' ');
      const tr=vs.find(v=>v.spawned);const st=bl?['QUEUED','red']:(pl.state==='receiving'||pl.state==='assembling')?['HOLDING','yellow']:['MOVING','lime'];
      dz.className='sel';dz.innerHTML=`<div class="dz-k">PLATOON · ${pl.kind==='in'?'INBOUND':pl.kind==='out'?'OUTBOUND':'THROUGH'}</div><div class="dz-head"><span class="dz-id">${pl.id} <span style="color:var(--muted);font-size:12px">×${vs.length}</span></span>${pill(st[0],st[1])}</div>`+
        row('AVG SoC',socHTML(soc))+row(pl.kind==='in'?'BLOCKS':'DEST BLOCK',blocks)+row('TRACK',tr?EDGES[tr.route[tr.ri]].track:'Off-map · ML1')+
        row('STATE',plLabel(pl).replace(pl.id,'').replace(/^ ×\d+ ?/,'')||pl.state)+row('COUPLERS','0 · virtual link')+
        `<div class="dz-chips">${vs.map(v=>`<i title="${v.id}" style="background:${socColor(v.soc)}"></i>`).join('')}</div>`;return;}}
  dz.className='';dz.innerHTML=`<div class="dz-k">DOSSIER</div><div class="dz-empty" style="margin-top:6px">Click a vehicle or a platoon tag on the map to inspect its ID, SoC, destination block, track and state.</div>`;
}
function refresh(force){
  $('hdrTime').textContent=$('clock').textContent=fmtT(S.t);
  const dep=S.departed;const avg=dep.length?dep.reduce((a,d)=>a+d.dwell,0)/dep.length/60:null;const on=dep.length?dep.filter(d=>d.ok).length/dep.length*100:null;
  const tone=(id,c)=>{$(id).style.background=`var(--${c})`;};
  $('v-dwell').textContent=avg==null?'—':avg.toFixed(1);tone('d-dwell',avg==null?'lime':avg<=75?'lime':avg<=110?'yellow':'red');
  $('s-dwell').innerHTML=avg==null?'no departures yet':`<span class="${avg<=75?'c-lime':avg<=110?'c-yellow':'c-red'}">${avg<=75?'within':'over'} 75 min target</span> · n=${dep.length}`;
  $('v-ontime').textContent=on==null?'—':on.toFixed(0);tone('d-ontime',on==null?'lime':on>=85?'lime':on>=60?'yellow':'red');
  $('s-ontime').textContent='right block, ≤ 75 min dwell';
  $('v-proc').textContent=S.processed;tone('d-proc','lime');
  const lastHr=S.departed.filter(d=>d.t>S.t-3600).length;$('s-proc').innerHTML=`<span class="c-lime">+${lastHr} last hr</span> · ${S.sorted} humped`;
  $('v-queue').textContent=S.queue;tone('d-queue',S.queue<5?'lime':S.queue<10?'yellow':'red');
  $('s-queue').innerHTML=`<span class="${S.queue>=10?'c-red':''}">ML1 ${S.qML} · hump ${S.qHump} · fault ${S.qFault}${S.diverted?' · diverted '+S.diverted:''}</span>`;
  const sc=$('statusChip');
  if(S.faultOn){sc.className='schip bad';sc.textContent='X-24 FAULT';}else if(S.jamOn){sc.className='schip bad';sc.textContent='JAM · QUEUE '+S.queue;}
  else if(S.queue>=5||S.crestHold){sc.className='schip warn';sc.textContent=S.crestHold?'HUMP HOLD':'CONGESTED';}else{sc.className='schip ok';sc.textContent='FLOWING';}
  renderDossier();drawTL();
}
function frame(now){const dtr=Math.min(0.1,(now-last)/1000);last=now;
  if(running){acc+=dtr*SIM_PER_SEC*speed;let n=0;while(acc>=DT&&n<240){step();acc-=DT;n++;}if(n>=240)acc=0;}
  draw();if(++frameN%8===0)refresh();requestAnimationFrame(frame);}
function reset(){newState();advance(90*60);selected=null;setRunning(false);updateFaultUI();refresh(true);}
window.addEventListener('resize',()=>{resize();refresh(true);});
syncInputs();newState();advance(90*60);resize();updateFaultUI();refresh(true);requestAnimationFrame(frame);
// test hooks
window.__yard={get S(){return S;},P,advance:s=>{advance(s);refresh(true);},setFault:on=>{setFault(on);updateFaultUI();refresh(true);},
  play:()=>setRunning(true),pause:()=>setRunning(false),get running(){return running;},select:id=>{selected={type:'veh',id};refresh(true);},
  selectPl:id=>{selected={type:'pl',id};refresh(true);},
  vehScreen:id=>{const v=S.veh.find(x=>x.id===id);if(!v||!v._pts)return null;const p=v._pts[Math.floor(v._pts.length/2)];const r=mapC.getBoundingClientRect();const q=W2S(p[0],p[1]);return [q[0]+r.left,q[1]+r.top];},
  get selected(){return selected;},refresh:()=>refresh(true),TRACKS};
})();
</script>
</body></html>
