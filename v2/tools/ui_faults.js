// ---------------- fault injector UI
const TREGION=id=>{const n=swNum(id);return n===1?'entry':n<=4?'receiving in':n<=7?'receiving out':n<=33?'bowl ladder':n<=46?'departure':'trim ladder';};
function activeFault(type,target){return S.flist.find(f=>f.type===type&&f.target===target);}
function targetOpts(type){
  if(type==='turnout')return TURNOUTS.map(id=>[id,id+' · '+TREGION(id)]);
  if(type==='retarder')return [['LEAD','Hump crest · RA-01']];
  if(type==='charger')return [['CH01','CH-01'],['CH02','CH-02']];
  if(type==='track')return TRACK_TGT.map(id=>[id,EDGES[id].track]);
  const o=[['random','Random moving vehicle']];
  if(selected&&selected.type==='veh'){const v=S.veh.find(x=>x.id===selected.id);if(v&&!v.thru)o.unshift([v.id,'Selected · '+v.id]);}
  return o;}
let lastTgtKey='';
function fillTargets(force){const type=$('fType').value,sel=$('fTarget');const opts=targetOpts(type);
  const key=type+'|'+opts.map(o=>o[0]+(o[0]!=='random'&&activeFault(type,o[0])?'*':'')).join(',');if(!force&&key===lastTgtKey)return;lastTgtKey=key;
  const prev=sel.value;sel.innerHTML=opts.map(([v,l])=>{const on=v!=='random'&&activeFault(type,v);return `<option value="${v}"${on?' disabled':''}>${l}${on?' · active':''}</option>`;}).join('');
  if(opts.some(o=>o[0]===prev)&&!sel.querySelector(`option[value="${prev}"]`).disabled)sel.value=prev;
  else{const first=[...sel.options].find(o=>!o.disabled);if(first)sel.value=first.value;}
  sel.disabled=opts.length<2;}
function hint(t,bad){const h=$('fHint');h.textContent=t||'';h.style.color=bad?'var(--red)':'';}
function uiInject(sp){const r=prepFault(sp);if(!r){hint(sp.type==='battery'?'No vehicle to fault right now.':'Already faulted.',true);return null;}
  branch();const f=injectFault(r);takeSnap();logEvt();hint(f.label.replace(/ (STUCK|FAULT|OUTAGE|BLOCKED|BATTERY|FAIL)$/,m=>m.toLowerCase())+' injected at '+fmtT(S.t).slice(0,7)+'.');
  updateFaultUI();refresh(true);return f;}
function uiClear(id){const f=S.flist.find(x=>x.id===id);if(!f)return false;branch();clearFault(id);takeSnap();logEvt();hint(f.label+' cleared.');updateFaultUI();refresh(true);return true;}
function uiClearAll(){if(!S.flist.length)return;branch();for(const f of S.flist.slice())clearFault(f.id);takeSnap();logEvt();hint('All faults cleared.');updateFaultUI();refresh(true);}
$('fType').onchange=()=>{fillTargets(true);hint('');};
$('fInject').onclick=()=>uiInject({type:$('fType').value,target:$('fTarget').value,dur:+$('fDur').value});
$('fClearAll').onclick=uiClearAll;
$('fList').addEventListener('click',e=>{const b=e.target.closest('button[data-f]');if(b)uiClear(b.dataset.f);});
const FSUB={turnout:'cannot route through',retarder:'hump slowed, '+RET_GAP+' s spacing',charger:'no charging on track',battery:'stalled, awaiting tow',track:'track closed'};
let lastList='';
function renderFaultList(){
  const html=S.flist.map(f=>{const rem=f.dur?' · clears in '+Math.max(1,Math.ceil((f.a+f.dur-S.t)/60))+'m':'';
    const sub=f.hold&&faultHolding()?'hump stopped for inspection':(f.hold?'reroute to B-01…03':FSUB[f.type]);
    return `<div class="frow" role="listitem"><i></i><div><b>${f.label}</b><span>${fmtT(f.a).slice(0,7)} · ${sub}${rem}</span></div><button data-f="${f.id}" aria-label="Clear ${f.label}">Clear</button></div>`;}).join('');
  if(html!==lastList){$('fList').innerHTML=html;lastList=html;}
  const n=S.flist.length,c=$('fCount');c.textContent=n?n+' active':'none';c.classList.toggle('on',!!n);$('fClearAll').disabled=!n;
  fillTargets(false);}
// map picking: pick mode or right-click opens a popover of faults for the element under the pointer
let picking=false,popEl=null;
function setPicking(on){picking=on;$('fPick').setAttribute('aria-pressed',on);$('mapbox').classList.toggle('picking',on);if(!on)closePop();}
$('fPick').onclick=()=>setPicking(!picking);$('pickDone').onclick=()=>setPicking(false);
function elementAt(sx,sy){const[wx,wy]=S2W(sx,sy);const tol=Math.max(9/K,4);
  for(const t of hitFaults)if(wx>=t.x&&wx<=t.x+t.w&&wy>=t.y&&wy<=t.y+t.h){const f=S.flist.find(x=>x.id===t.id);if(f)return {name:f.label,opts:[{clear:f.id,label:'Clear '+f.label}]};}
  const h=hitAt(sx,sy);if(h&&h.type==='veh'){const v=S.veh.find(x=>x.id===h.id);if(v&&!v.thru)return {name:v.id,opts:[{type:'battery',target:v.id,label:'Battery drop'}]};}
  let bs=null,bd=tol;for(const id of TURNOUTS){const n=SWBY[id].node,d=Math.hypot(n.x-wx,n.y-wy);if(d<bd){bd=d;bs=id;}}
  if(bs)return {name:'Turnout '+bs,opts:[{type:'turnout',target:bs,label:'Turnout stuck'}]};
  if(Math.hypot(NODES.CR.x-wx,NODES.CR.y-wy)<Math.max(14/K,8))return {name:'Hump crest',opts:[{type:'retarder',target:'LEAD',label:'Retarder failure'},{type:'track',target:'LEAD',label:'Block hump lead'}]};
  let be=null,bde=Math.max(7/K,3.5);for(const id of TRACK_TGT){const e=EDGES[id];for(let i=1;i<e.pts.length;i++){const d=segDist(wx,wy,e.pts[i-1],e.pts[i]);if(d<bde){bde=d;be=id;}}}
  if(be){const e=EDGES[be];const o=[];if(be==='CH01'||be==='CH02')o.push({type:'charger',target:be,label:'Charger outage'});
    if(be==='LEAD')o.push({type:'retarder',target:'LEAD',label:'Retarder failure'});o.push({type:'track',target:be,label:'Block track'});return {name:e.track,opts:o};}
  return null;}
function openPop(sx,sy){const el=elementAt(sx,sy);const pop=$('fpop');
  const opts=el?el.opts.map(o=>{if(o.clear)return o;const f=activeFault(o.type,o.target);return f?{clear:f.id,label:'Clear '+f.label}:o;}):[];
  popEl={el,opts};
  pop.innerHTML=el?`<div class="ph2">Fault <b>${el.name}</b></div>`+opts.map((o,i)=>`<button data-i="${i}" class="${o.clear?'clr':''}"><i></i>${o.label}</button>`).join(''):`<div class="none">Nothing to fault here. Try a turnout, track, charger, the crest or a vehicle.</div>`;
  pop.style.display='block';const mb=$('mapbox').getBoundingClientRect(),pw=pop.offsetWidth,phh=pop.offsetHeight;
  pop.style.left=clamp(sx+10,8,mb.width-pw-8)+'px';pop.style.top=clamp(sy+10,8,mb.height-phh-8)+'px';
  const b=pop.querySelector('button');if(b)b.focus({preventScroll:true});return !!el;}
function closePop(){$('fpop').style.display='none';popEl=null;}
$('fpop').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b||!popEl)return;const o=popEl.opts[+b.dataset.i];
  if(o.clear)uiClear(o.clear);else uiInject({type:o.type,target:o.target,dur:+$('fDur').value});closePop();});
mapC.addEventListener('contextmenu',e=>{e.preventDefault();const p=mxy(e);openPop(p[0],p[1]);});
document.addEventListener('pointerdown',e=>{if(popEl&&!e.target.closest('#fpop'))closePop();},true);
