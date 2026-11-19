// ================= ASSEMBLY UI (defined here, initialised from 5_ui once $ exists). UI-only state lives in AUI; plan data in S.asm.
let VIEW='yard';
const AUI={pick:null,plan:'PL-52',mode:'cur',tab:'spares',sel:new Set(),edit:null,draft:null,bulk:null,qf:{dest:'all',due:true,type:'all'},spareAll:false,aa:null,confirm:false,collapsed:false,rulesOpen:false,sig:'',flash:''};
let DRAG=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function curPlan(){return S.asm.plans.find(p=>p.id===AUI.plan)||S.asm.plans[0];}
function editable(pl){return pl&&pl.status==='draft';}
function commitAsm(fn){branch();fn();takeSnap();logEvt();AUI.aa=null;AUI.confirm=false;renderAsm(true);}
function minsTo(t){return Math.round((t-S.t)/60);}
function durTxt(m){return m<0?Math.abs(m)+' min ago':m<60?m+' min':Math.floor(m/60)+' h '+p2(m%60);}
function trk(id){return EDGES[id]?EDGES[id].track:id;}
function routeTxt(pl){return pl.blocks.length>1?`${pl.blocks[0]} → ${pl.blocks[pl.blocks.length-1]}`:`KFL → ${pl.blocks[0]||'?'}`;}
function setView(v){VIEW=v;$('app').classList.toggle('asm',v==='asm');document.querySelectorAll('#viewSeg button').forEach(b=>{b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-selected',b.dataset.v===v);});
  closeEditor();if(v==='yard'){resize();staticDirty=true;refresh(true);}else renderAsm(true);}
// ---------- render
function renderAsm(force){if(VIEW!=='asm'||!S||!S.asm)return;if(DRAG&&DRAG.live)return;
  const pl=curPlan();if(!pl)return;AUI.plan=pl.id;
  const sig=hashStr(JSON.stringify(S.asm))+'|'+Math.floor(S.t/30)+'|'+isReplay()+'|'+running;
  if(!force&&sig===AUI.sig)return;AUI.sig=sig;
  for(const id of [...AUI.sel])if(!pl.cars.includes(id))AUI.sel.delete(id);
  if(AUI.pick&&!editable(pl))AUI.pick=null;
  const R=S.asm.rules,c=planChecks(pl,R);let sg=null;
  if(editable(pl)){sg=suggest(pl,R);}
  const view=AUI.mode==='sug'&&sg&&sg.changes.length?{c:sg.after,cars:sg.cars,cargo:sg.cargo,changed:changedSet(pl,sg)}:{c,cars:pl.cars,cargo:null,changed:null};
  renderSlots(pl,c);renderPlanHead(pl,c,sg);renderGauges(pl,view.c);renderConsist(pl,view);renderDrawer(pl,c);renderSide(pl,c,sg);renderRules();renderSend(pl,c,sg);
  if(AUI.edit)renderEditor();}
function changedSet(pl,sg){const s=new Set();for(const ch of sg.changes){if(ch.car)s.add(ch.car);if(ch.a)s.add(ch.a);if(ch.b)s.add(ch.b);if(ch.in)s.add(ch.in);}return s;}
// departure slots: D-01..03 + chargers on a 2.5 h axis with a now-line
function renderSlots(pl,c){const t0=Math.floor((S.t-1800)/900)*900,t1=t0+9000;const X=t=>Math.max(0,Math.min(100,(t-t0)/(t1-t0)*100));
  const chOutF=S.flist.find(f=>f.type==='charger');
  $('slotMeta').textContent=`Today ${clk(t0)}–${clk(t1)} · ${pl.id} ${pl.status==='departed'?'left '+trk(pl.fromD||pl.dtrack)+' at '+clk(pl.actualT):'holds '+trk(pl.dtrack)+' at '+clk(pl.dep)}`+(chOutF?` · ${trk(chOutF.target)} out since ${clk(chOutF.a)}`:'');
  $('slotCollapse').textContent=AUI.collapsed?'Expand':'Collapse';$('slots').classList.toggle('collapsed',AUI.collapsed);$('slotCollapse').setAttribute('aria-expanded',!AUI.collapsed);
  if(AUI.collapsed)return;
  let h='<div class="sl-in"><div class="sl-axis">';for(let t=t0;t<=t1;t+=900)h+=`<span style="left:${X(t)}%">${clk(t)}</span>`;h+='</div>';
  const bar=(a,b,cls,txt,title)=>`<div class="sl-bar ${cls}" style="left:calc(${X(b)}% - max(${X(b)-X(a)}%,58px));width:max(${X(b)-X(a)}%,58px)" title="${esc(title||txt)}">${esc(txt)}</div>`;
  for(const d of D_IDS){let lane='';
    for(const q of Object.values(S.pl))if(q.kind==='out'&&(q.dtrack===d)&&!q.plan){const end=q.state==='assembling'?q.departT:S.t+ASSEMBLE+300;lane+=bar(Math.max(t0,q.arrT||S.t),end,'live',`${q.id} ${clk(end)} · ${q.veh.length}`,`${q.id} · ${q.veh.length} vehicles · ${q.state}`);}
    for(const p of S.asm.plans){if((p.status==='departed'?p.fromD:p.dtrack)!==d)continue;const mine=p.id===pl.id?' mine':'';
      if(p.status==='departed'){const late=Math.round((p.actualT-p.dep)/60);lane+=bar(p.actualT-ASSEMBLE,p.actualT,mine,`${p.id} left ${clk(p.actualT)}${late>0?' +'+late:''}`);continue;}
      const cls=(p.status==='draft'?'draft':'live')+mine;lane+=bar(p.dep-ASSEMBLE*3,p.dep,cls,`${p.id} ${clk(p.dep)}`,`${p.id} · ${p.status} · departs ${clk(p.dep)}`);
      if(S.t>p.dep+30){const why=p.wait||(p.status==='assembling'?'assembling':p.status);lane+=bar(p.dep,S.t,'late',`+${Math.round((S.t-p.dep)/60)} min · ${why}`);}
      else if(p.id===pl.id&&p.status==='draft'&&c.nV)lane+=`<div class="sl-note c-red" style="left:calc(${X(p.dep)}% + 8px)">${c.nV} violation${c.nV>1?'s':''}</div>`;
      else if(p.status!=='draft'&&p.wait)lane+=`<div class="sl-note c-yellow" style="left:calc(${X(p.dep)}% + 8px)">${esc(p.wait)}</div>`;}
    for(const f of S.flist)if(f.type==='track'&&f.target===d)lane+=bar(f.a,f.dur?f.a+f.dur:t1,'out',`Blocked since ${clk(f.a)}${f.dur?' · clears '+clk(f.a+f.dur):' · no repair ETA'}`);
    h+=`<div class="sl-row" data-d="${d}"><div>${trk(d)}<small>${DLEN[d]} m</small></div><div class="sl-lane">${lane}</div></div>`;}
  for(const T of CH){let lane='';const f=S.flist.find(x=>x.type==='charger'&&x.target===T.edge);
    if(f)lane+=bar(f.a,f.dur?f.a+f.dur:t1,'out',`Out of service since ${clk(f.a)}${f.dur?' · back '+clk(f.a+f.dur):' · no repair ETA'}`);
    else{const n=S.veh.filter(v=>v.target===T&&v.state==='charging').length;const own=S.veh.filter(v=>v.target===T&&v.state==='charging'&&ownedSet().has(v.id));
      if(n)lane+=bar(S.t-600,S.t+1200,'',`${n} charging${own.length?' · '+own.map(v=>v.id).join(', ')+' planned':''}`);}
    h+=`<div class="sl-row" data-ch="${T.id}"><div>${T.id}</div><div class="sl-lane">${lane}</div></div>`;}
  h+=`<div class="sl-now" style="left:calc(72px + (100% - 72px) * ${X(S.t)/100})"><span>${clk(S.t)}</span></div>`;
  $('slotBody').innerHTML=h+'</div>';}
function renderPlanHead(pl,c,sg){
  $('planSeg').innerHTML=S.asm.plans.map(p=>`<button data-p="${p.id}" class="${p.id===pl.id?'on':''}" title="${esc(routeTxt(p)+' · '+p.status)}">${p.id}</button>`).join('')+`<button class="add" id="newPlan" title="Start an empty plan">+ New</button>`;
  const n=c.ok.length,loaded=c.ok.filter(r=>r.load>0).length,m=minsTo(pl.dep);
  const st={draft:'',sent:' · <b class="c-yellow">sent</b>',pulling:' · <b class="c-lime">pulling</b>',assembling:' · <b class="c-lime">assembling</b>',departing:' · <b class="c-lime">departing</b>',departed:' · departed'}[pl.status];
  $('planLine').innerHTML=pl.status==='departed'?`<b>${routeTxt(pl)}</b> · left ${trk(pl.fromD||pl.dtrack)} at ${clk(pl.actualT)}${pl.actualT>pl.dep+30?` (+${Math.round((pl.actualT-pl.dep)/60)} min)`:' (on time)'} · ${pl.cars.length} vehicles · ${fx(pl.gross||0)} t`:
    `<b>${routeTxt(pl)}</b> · ${n} vehicle${n===1?'':'s'} · ${loaded} loaded · ${trk(pl.dtrack)} departs ${clk(pl.dep)} (${durTxt(m)})${st}`;
  const ed=editable(pl);document.querySelectorAll('#dtSeg button').forEach(b=>{b.classList.toggle('on',b.dataset.d===pl.dtrack);b.disabled=!ed;});
  $('depT').textContent=clk(pl.dep);document.querySelectorAll('#depStep button').forEach(b=>b.disabled=!ed);
  const vm=$('viewMode');vm.style.display=ed?'':'none';const ns=sg?sg.changes.length:0;
  vm.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.m===AUI.mode);if(b.dataset.m==='sug'){b.disabled=!ns;b.textContent=ns?'Suggested':'Suggested';b.title=ns?ns+' changes':'Nothing to suggest';}});
  if(!ns&&AUI.mode==='sug')AUI.mode='cur';
  const bn=$('planBanner');bn.className='';
  if(pl.status==='draft'&&!pl.cars.length){const blocks=[...new Set(S.veh.filter(v=>v.state==='classified'&&!v.thru).map(v=>v.block))].sort();
    bn.innerHTML=`<span>Empty plan. Destination block:</span>${blocks.map(b=>`<button class="chipb ${pl.blocks.includes(b)?'on':''}" data-blk="${b}">${b}</button>`).join('')}<span class="grow"></span><span style="color:var(--fg-3)">Then drag spares onto the consist.</span>`;}
  else if(AUI.mode==='sug'&&sg&&ns)bn.innerHTML=`<span>Previewing the suggested plan: ${sg.changes.map(x=>esc(x.desc)).join(' · ')}</span><span class="grow"></span><button class="ghost" id="bnBack">Back to current</button><button class="prim" id="bnApply">Apply ${ns} change${ns>1?'s':''}</button>`;
  else if(pl.status!=='draft'&&pl.status!=='departed'){bn.className='warn';bn.innerHTML=`<span>Sent to yard at ${clk(pl.sentT)}. The plan is locked while the yard ${pl.status==='sent'?'waits for '+trk(pl.dtrack):pl.status==='pulling'?'pulls cars to '+trk(pl.dtrack):pl.status==='assembling'?'assembles it on '+trk(pl.dtrack):'runs it out'}${pl.wait?' · '+esc(pl.wait):''}.</span>`;}
  else if(isReplay())bn.innerHTML=`<span>Replaying ${clk(S.t)}. Any edit here branches the run from this moment.</span>`;
  else bn.innerHTML='';}
function gauge(k,v,s,cls,pct){return `<div class="gg ${cls||''}"><div class="gk">${k}</div><div class="gv">${v}</div><div class="gs">${s}</div>${pct!=null?`<div class="gbar"><i style="width:${Math.min(100,Math.max(0,pct))}%"></i></div>`:''}</div>`;}
function renderGauges(pl,c){const R=S.asm.rules;let h='';const lenV=c.length>c.limit+1e-9;
  h+=gauge('Length',`${fx(c.length)} / ${c.limit} m`,lenV?`Over by ${fx(c.length-c.limit)} m`:`${fx(c.limit-c.length)} m spare`,lenV?'v':'',c.length/c.limit*100);
  h+=gauge('Train weight',`${fx(c.gross)} / ${R.gross} t`,`${fx(c.tare)} tare + ${fx(c.cargoT)} cargo`,c.gross>R.gross?'v':'',c.gross/R.gross*100);
  const mx=c.mx;const ap=mx?mx.axlePct:0;h+=gauge('Max axle load',mx?`${fx2(mx.axle)} / ${fx2(R.axle)} t`:'—',mx?`${mx.id} at ${Math.round(ap)}%`:'no cars',ap>100?'v':ap>=R.warn?'w':'',ap);
  h+=gauge('Brake margin',`${c.n?Math.round(c.brake)+'%':'—'}`,`1.2% grade · min ${R.brakeMin}%`,c.n&&c.brake<R.brakeMin?'v':'');
  const hz=c.haz.length+c.issues.filter(i=>i.kind==='hazend').length;const hb=c.haz[0];
  h+=gauge('Hazmat',hz?`${hz} conflict${hz>1?'s':''}`:'0 conflicts',hb?`Cl ${c.ok[hb[0]].cls} touches Cl ${c.ok[hb[1]].cls}`:hz?'End buffer missing':c.ok.some(r=>r.cls)?`${c.ok.filter(r=>r.cls).length} placarded, buffered`:'none aboard',hz?'v':'');
  const blk=pl.blocks.map(b=>`${b} ×${c.ok.filter(r=>r.block===b).length}`).join(', ');
  h+=gauge('Block order',c.bf.length?`${c.bf.length} out of order`:blk||'—',c.bf.length?`${c.bf[0]} at #${c.ok.findIndex(r=>r.id===c.bf[0])+1}`:'in cut order',c.bf.length?'v':'');
  const ma=c.ma;const bw=ma&&(ma.arr<0||c.mn.soc<R.floor);h+=gauge('Battery + reefer',ma?`min ${Math.round(c.mn.soc)}% / ${R.floor}%`:'—',c.reefKW?`Reefers draw ${fx(c.reefKW)} kW`:'no reefers',bw?'w':'');
  const op=c.open.length;if(op)h+=gauge('Open cargo',`${op} shipment${op>1?'s':''}`,c.open.map(s=>s.id).join(', ')+' has no car','w');
  $('gauges').innerHTML=h;$('gauges').classList.toggle('g8',!!op);}
function renderConsist(pl,view){const c=view.c,R=S.asm.rules;const strip=$('strip');const W=Math.max(400,strip.clientWidth||($('consist').clientWidth)||900);
  const maxM=Math.max(c.length,c.limit)*1.02+2;const mob=isMobile();const k=mob?6:(W-96)/maxM;AUI.k=k;
  for(const id of ['brackets','strip','stripMarks','bars'])$(id).style.width=mob?Math.round(maxM*k+(AUI.pick&&AUI.pick.kind!=='shp'?70:96))+'px':'';
  $('csSum').textContent=`${fx(c.length)} m · ${fx(c.gross)} t`;
  // block brackets
  let bk='';let i=0;const rows=c.ok;while(i<rows.length){let j=i;while(j+1<rows.length&&rows[j+1].block===rows[i].block)j++;const a=c.pos[rows[i].id][0],b=c.pos[rows[j].id][1];
    const bad=rows.slice(i,j+1).some(r=>c.bf.includes(r.id));bk+=`<div class="bk ${bad?'bad':''}" style="left:${a*k}px;width:${(b-a)*k}px">${rows[i].block} ×${j-i+1}</div>`;i=j+1;}
  $('brackets').innerHTML=bk;
  let h='';for(const r of rows){const st=c.st[r.id]||'';const x=c.pos[r.id][0]*k,w=r.len*k-2;const sel=AUI.sel.has(r.id)||AUI.edit===r.id;
    const lo=r.soc<R.floor||r.arr<0;const pk=AUI.pick&&AUI.pick.kind==='shp'?(dropReason(S.asm.queue.find(q=>q.id===AUI.pick.id)||{type:'i20',dest:''},r.id)?'':'drop-ok'):AUI.pick&&AUI.pick.id===r.id?'pick':'';
    h+=`<div class="car ${st} ${pk} ${sel?'sel':''} ${r.load?'':'empty'} ${view.changed&&view.changed.has(r.id)?'chg':''}" data-car="${r.id}" ${editable(pl)&&AUI.mode!=='sug'?'data-drag="car"':''} style="left:${x}px;width:${w}px" title="${esc(r.id+' · '+r.ct+' · '+cargoName(r.cargo)+' · '+fx(r.gross)+' t · '+Math.round(r.soc)+'%')}">
      <div class="ci">${r.id}</div><div class="cc">${esc(cargoShort(r.cargo))}</div><div class="cn"><span>${fx(r.gross)} t</span><span class="${lo?'lo':''}">${Math.round(r.soc)}%</span></div></div>`;}
  for(const r of c.rows.filter(r=>r.missing))h+='';
  if(AUI.pick&&AUI.pick.kind!=='shp'&&editable(pl)){const x=rows.length?(c.pos[rows[rows.length-1].id][1]+CAR_GAP)*k:0;h+=`<div class="car endslot" data-end="1" style="left:${x}px;width:56px">End</div>`;}
  h+='<div class="ins" id="insMark"></div>';strip.innerHTML=h;
  renderPick(pl);
  let mk=`<div class="lim ${c.length>c.limit?'':'ok'}" style="left:${c.limit*k}px"><span>${trk(pl.dtrack)} limit ${c.limit} m</span></div>`;
  for(const [a,b] of c.haz){const x=(c.pos[rows[a].id][1]+CAR_GAP/2)*k;mk+=`<div class="hzm" style="left:${x}px"><span>Cl ${rows[a].cls} next to Cl ${rows[b].cls}, no buffer</span></div>`;}
  $('stripMarks').innerHTML=mk;
  const maxG=R.axle*AXLES;let bh=`<div class="maxg" style="bottom:${48}px"><span>${fx(maxG)} t max gross</span></div>`;
  for(const r of rows){const st=r.axlePct>100?'v':r.axlePct>=R.warn?'w':'';bh+=`<div class="bar ${st} ${AUI.sel.has(r.id)?'sel':''}" data-bar="${r.id}" style="left:${c.pos[r.id][0]*k}px;width:${r.len*k-2}px;height:${Math.min(56,r.gross/maxG*48)}px"><span>${fx(r.gross)}</span></div>`;}
  $('bars').innerHTML=bh;
  const nf=c.half,nr=c.ok.length-c.half;
  $('barCap').textContent=rows.length?`Gross per car, t. Heavier cars belong toward the front: front ${nf===6?'six':nf} ${fx(c.front)} t, rear ${nr===6?'six':nr===5?'five':nr} ${fx(c.rear)} t.`+(c.rows.some(r=>r.missing)?' Some planned cars have left the yard.':''):'No cars yet. Drag a spare from the drawer below.';}
// drawer: spares + cargo queue
function spareRows(pl){const R=S.asm.rules,own=ownedSet();const open=S.asm.queue;
  let list=S.veh.filter(v=>!v.thru&&!v.dead&&!own.has(v.id)&&(v.staged||v.state==='classified'||v.state==='charging'));
  if(!AUI.spareAll)list=list.filter(v=>v.staged||pl.blocks.includes(blockOf(v)));
  list.sort((a,b)=>(b.staged-a.staged)||(a.id<b.id?-1:1));
  return list.map(v=>{const ct=v.ctype||ctypeFor(v.id),c=cargoOf(v),empty=!c||!c.t;const tr=EDGES[v.route[v.ri]].track;
    const ahead=S.veh.filter(o=>o!==v&&o.route[o.ri]===v.route[v.ri]&&o.s>v.s).length;
    let status,off=false;if(v.soc<R.floor){status=`Below ${R.floor}% floor · not offered`;off=true;}
    else if(empty){const can=open.find(s=>compatible(s,ct)&&s.dest===blockOf(v)&&s.t>=R.minLoad);status=can?`Empty · can take ${can.id}${can.reefer?' reefer':''}`:'Empty';}
    else status=`Loaded · ${cargoShort(c)}`+(v.state==='charging'?' · charging':ahead&&!v.staged?` · ${ahead} ahead on ${tr}`:'');
    return {v,ct,c,empty,tr,status,off};});}
function renderDrawer(pl,c){const ed=editable(pl);
  document.querySelectorAll('.dr-tabs>button').forEach(b=>b.classList.toggle('on',b.dataset.t===AUI.tab));
  const sp=spareRows(pl);$('nSpares').textContent=sp.filter(r=>!r.off).length;
  const q=S.asm.queue;$('nQueue').textContent=q.length+' waiting';
  if(AUI.tab==='spares'){$('drHint').textContent=ed?'Drag a spare onto the consist, or press Add':'Plan is locked';
    let h=`<div class="dfil"><button class="chipb ${AUI.spareAll?'':'on'}" data-sf="plan">${pl.blocks.join(' + ')||'Plan'} blocks</button><button class="chipb ${AUI.spareAll?'on':''}" data-sf="all">All inventory</button><span class="k">Live yard inventory: staged, bowl and charging cars not in a plan</span></div>`;
    h+=`<table class="dt"><thead><tr><th></th><th>ID</th><th>Type</th><th>Length</th><th>Tare</th><th>Battery</th><th>Block</th><th>Track</th><th>Status</th><th></th></tr></thead><tbody>`;
    for(const r of sp){const v=r.v;h+=`<tr class="${r.off?'off':''} ${AUI.pick&&AUI.pick.id===v.id?'picked':''}" ${ed&&!r.off?`data-drag="spare" data-id="${v.id}"`:''}><td class="grip">${ed&&!r.off?'⠿':''}</td><td class="id">${v.id}</td><td>${r.ct}</td><td class="n">${CTYPES[r.ct].len} m</td><td class="n">${CTYPES[r.ct].tare} t</td>
      <td class="n"><span class="socb ${v.soc<S.asm.rules.floor?'lo':''}"><i style="width:${v.soc}%"></i></span>${Math.round(v.soc)}%</td><td class="n">${blockOf(v)}</td><td class="n">${r.tr}</td><td>${esc(r.status)}</td>
      <td>${ed&&!r.off?`<button class="ghost" data-add="${v.id}">Add</button>`:''}</td></tr>`;}
    if(!sp.length)h+=`<tr><td colspan="10" class="empty-note">No spare cars for ${pl.blocks.join(' or ')} right now.</td></tr>`;
    $('drBody').innerHTML=h+'</tbody></table>';return;}
  $('drHint').textContent=ed?'Drag a shipment onto a car to load it':'Plan is locked';
  const dests=[...new Set(q.map(s=>s.dest).concat(pl.blocks))];const types=[...new Set(q.map(s=>s.type))];
  const f=AUI.qf;let shown=q.filter(s=>(f.dest==='all'||s.dest===f.dest)&&(f.type==='all'||s.type===f.type));const later=f.due?shown.filter(s=>s.due>pl.dep+1).length:0;if(f.due)shown=shown.filter(s=>s.due<=pl.dep+1);
  shown.sort((a,b)=>a.due-b.due||(a.id<b.id?-1:1));
  let h=`<div class="dfil"><span class="seg">${['all'].concat(dests).map(d=>`<button data-qd="${d}" class="${f.dest===d?'on':''}">${d==='all'?'All':d}</button>`).join('')}</span>
    <button class="chipb ${f.due?'on':''}" data-qdue="1">Due by ${clk(pl.dep)}</button><select class="rsel" id="qType" aria-label="Cargo type"><option value="all">Any type</option>${types.map(t=>`<option value="${t}" ${f.type===t?'selected':''}>${CARGO[t].name}</option>`).join('')}</select>
    <span class="k">${q.length} waiting · ${shown.length} shown${later?` · ${later} later hidden`:''}</span></div><div class="qwrap"><div><table class="dt"><thead><tr><th></th><th>Shipment</th><th></th><th></th><th style="text-align:right">T</th><th style="text-align:right">Due</th></tr></thead><tbody>`;
  const placed=AUI.aa?new Set(AUI.aa.placed.map(p=>p.shp.id)):new Set();
  for(const s of shown){h+=`<tr ${ed?`data-drag="shp" data-id="${s.id}"`:''} class="${placed.has(s.id)?'in':''} ${AUI.pick&&AUI.pick.id===s.id?'picked':''}"><td class="grip">${ed?'⠿':''}</td><td class="id">${s.id}</td><td>${esc(s.desc)}<span class="sub">KFL → ${s.dest}</span></td>
    <td style="color:var(--fg-3)">${s.from?(s.rem?'trimmed':'from '+s.from):esc(s.note||'')}</td><td class="n" style="text-align:right">${fx(s.t)} t</td><td class="n" style="text-align:right">${clk(s.due)}</td></tr>`;}
  if(!shown.length)h+=`<tr><td colspan="6" class="empty-note">Nothing waiting${f.due?' for this departure':''}.</td></tr>`;
  h+='</tbody></table></div><div class="aap">';
  if(AUI.aa){const a=AUI.aa;h+=`<div class="ah"><b>Auto-assign preview <span>${a.placed.length} placed · ${a.held.length} held</span></b><span class="num">${fx(a.before)} → ${fx(a.after)} t</span></div>`;
    for(const p of a.placed)h+=`<div class="ar"><i class="ok"></i><span class="id">${p.shp.id}</span><span>→ ${p.car} · ${fx(p.gross)} t gross · ${fx2(p.axle)} t per axle<small>${esc(p.note)}</small></span></div>`;
    for(const x of a.held)h+=`<div class="ar"><i></i><span class="id">${x.shp.id}</span><span>${esc(x.short)}<small>${esc(x.reason)}</small></span></div>`;
    h+=`<div class="af"><button class="ghost" id="aaDiscard">Discard</button><button class="prim" id="aaApply" ${a.placed.length?'':'disabled'}>Apply ${a.placed.length} assignment${a.placed.length===1?'':'s'}</button></div>`;}
  else h+=`<div class="ah"><b>Auto-assign</b></div><div class="enote" style="margin:0 0 8px">Places shipments due by ${clk(pl.dep)} on empty ${pl.id} cars of the right type and block, keeping axle, hazmat, reefer and length rules. Anything it can’t place is held with a reason.</div><div class="af"><button class="ghost" id="aaRun" ${ed?'':'disabled'}>Auto-assign</button></div>`;
  $('drBody').innerHTML=h+'</div></div>';}
// side: checks (or bulk), rules, send
function fixFor(pl,iss,sg){if(!sg)return null;const m=sg.changes;const has=id=>(iss.cars||[]).includes(id);
  if(iss.kind==='length')return m.find(x=>x.kind==='drop'&&has(x.car));if(iss.kind==='block')return m.find(x=>x.kind==='move'&&has(x.car));
  if(iss.kind==='haz')return m.find(x=>x.kind==='swap'&&(has(x.a)||has(x.b)));if(iss.kind==='batt')return m.find(x=>x.kind==='swapcar'&&has(x.out));
  if(iss.kind==='axlew'||iss.kind==='axle')return m.find(x=>x.kind==='trim'&&has(x.car));
  if(iss.kind==='open'){const a=autoAssign(pl);const p=a.placed.find(x=>x.shp.id===iss.shp);return p?{kind:'assign',shp:p.shp.id,car:p.car,desc:`Load ${p.shp.id} on ${p.car} (${fx(p.gross)} t)`}:null;}
  return null;}
function renderSide(pl,c,sg){const el=$('sideMain');
  if(AUI.sel.size>=2&&editable(pl)){renderBulk(pl);return;}
  if(pl.status==='departed'){el.innerHTML=`<div class="ck"><h2>Checks</h2><div class="k">${pl.id} has left the yard.</div></div>`;return;}
  if(pl.status!=='draft'){el.innerHTML=`<div class="ck"><h2>Checks</h2><div class="k">Locked at send (${clk(pl.sentT)})</div></div><div class="allgood"><b>Passed with ${pl.ackW?pl.ackW+' acknowledged warning'+(pl.ackW>1?'s':''):'no warnings'}</b>${fx(c.length)} m, ${fx(pl.gross||c.gross)} t. The yard owns these cars until ${pl.id} departs${pl.status==='sent'?'; recall the plan to edit it':''}.</div>`;return;}
  if(AUI.mode==='sug'&&sg&&sg.changes.length){el.innerHTML=`<div class="ck"><h2>Suggested consist</h2><div class="k">${sg.changes.length} changes · ${sg.after.nV} violations · ${sg.after.nW} warnings after</div></div>`+
    sg.changes.map((x,i)=>`<div class="iss"><div class="it"><span class="num" style="color:var(--fg-3)">${i+1}</span>${esc(x.desc)}</div></div>`).join('');return;}
  const fx_=AUI.fixes=[];let h=`<div class="ck"><h2>Checks</h2><div class="k">${c.nV?`${c.nV} violation${c.nV>1?'s':''} block sending`:'Nothing blocks sending'}${c.nW?` · ${c.nW} warning${c.nW>1?'s':''}`:''}</div></div>`;
  if(!c.issues.length)h+=`<div class="allgood"><b>All checks pass</b>${c.n?`${fx(c.length)} m, ${fx(c.gross)} t, ${Math.round(c.brake)}% brake margin. Ready to send.`:'Add cars to build the consist.'}</div>`;
  for(const iss of c.issues){const f=editable(pl)?fixFor(pl,iss,sg):null;let fb='';if(f){fx_.push(f);fb=`<button class="fix" data-fix="${fx_.length-1}">→ ${esc(f.desc)}</button>`;}
    h+=`<div class="iss ${iss.sev}" data-kind="${iss.kind}"><div class="it"><i></i>${esc(iss.title)}</div>${esc(iss.desc)}${fb}</div>`;}
  el.innerHTML=h;}
function renderBulk(pl){const R=S.asm.rules,ids=pl.cars.filter(id=>AUI.sel.has(id));const rows=ids.map(id=>carRow(id,R)).filter(r=>!r.missing);
  const cts=[...new Set(rows.map(r=>r.ct))];const allowed=CORDER.filter(t=>rows.every(r=>CARGO[t].cars.includes(r.ct)));
  const ml=Math.min(...rows.map(r=>maxLoadFor(r.ct,R)));
  if(!AUI.bulk||AUI.bulk.key!==ids.join()){const types=[...new Set(rows.map(r=>r.cargo&&r.cargo.t?r.cargo.type:null))];
    AUI.bulk={key:ids.join(),type:types.length===1?types[0]:null,t:Math.min(ml,Math.round(rows.reduce((a,r)=>a+r.load,0)/rows.length)),reefer:null,hv:null,placard:null,mixed:types.length>1?rows.map(r=>cargoShort(r.cargo)).join(', '):''};}
  const B=AUI.bulk;const mixedF=k=>{const s=new Set(rows.map(r=>!!(r.cargo&&r.cargo[k])));return s.size>1;};
  const fl=(k,lab)=>{const v=B[k]!=null?B[k]:rows.every(r=>r.cargo&&r.cargo[k]);const mx=B[k]==null&&mixedF(k);return `<div class="flag"><span>${lab}</span>${mx?`<span style="color:var(--fg-3);font-size:11px">Mixed · ${rows.filter(r=>r.cargo&&r.cargo[k]).length} of ${rows.length} <button class="sw" data-bf="${k}" role="switch" aria-checked="false" style="vertical-align:middle;margin-left:6px"></button></span>`:`<button class="sw ${v?'on':''}" data-bf="${k}" role="switch" aria-checked="${!!v}"></button>`}</div>`;};
  const prev=bulkPreview(pl,ids,B);const c0=planChecks(pl,R),c1=planChecks(pl,R,{cargo:prev});
  let h=`<div class="bulk"><div class="bk2">Bulk edit</div><h3>${ids.length} cars selected</h3><div class="sub">Shift-click on the strip. ${cts.length===1?`${cts[0]} cars, ${CTYPES[cts[0]].len} m, tare ${CTYPES[cts[0]].tare} t, max gross ${CTYPES[cts[0]].max} t.`:`Mixed types: ${cts.join(', ')}.`}</div>
    <div class="selchips">${ids.map(id=>`<span>${id}</span>`).join('')}</div>
    <div class="bk2">Cargo type ${B.mixed?`<span>Was mixed: ${esc(B.mixed)}</span>`:''}</div><div class="chips">${CORDER.map(t=>`<button class="chipb ${B.type===t?'on':''}" data-bt="${t}" ${allowed.includes(t)?'':'disabled'}>${CARGO[t].short}</button>`).join('')}</div>
    <div class="bk2">Load per car <span>max ${fx(ml)} t</span></div><div class="lrow" style="grid-template-columns:auto 1fr"><span class="stepper"><button data-bs="-1">−</button><input id="bLoad" class="num" value="${fx(B.t)} t" aria-label="Load per car"><button data-bs="1">+</button></span><span style="color:var(--fg-3);font-size:12px">Same for all ${ids.length}</span></div>
    <div class="bk2">Flags</div>${fl('placard','Hazmat placard')}${fl('reefer','Reefer power draw')}${fl('hv','High-value')}
    <div class="bk2">Effect <span>Gross before → after</span></div><table class="eff">`;
  for(const r of rows){const a=c1.ok.find(x=>x.id===r.id);h+=`<tr><td class="num">${r.id}</td><td class="n">${fx(r.gross)} t → <b class="${a.axlePct>100?'v':a.axlePct>=R.warn?'w':''}">${fx(a.gross)} t</b></td></tr>`;}
  h+=`<tr><td>Train weight</td><td class="n">${fx(c0.gross)} t → <b>${fx(c1.gross)} t</b></td></tr><tr><td>Max axle load</td><td class="n">${fx2(c0.mx.axle)} t → <b>${fx2(c1.mx.axle)} t</b></td></tr></table>
    <div class="eact"><button class="ghost" id="bClear">Clear selection</button><button class="prim" id="bApply">Apply to ${ids.length} cars</button></div></div>`;
  $('sideMain').innerHTML=h;}
function bulkPreview(pl,ids,B){const out={};for(const id of ids){const v=vById(id);const ct=v.ctype||ctypeFor(id);const c=Object.assign({},cargoOf(v)||{type:B.type||'i20',t:0});
  if(B.type&&B.type!==c.type){c.type=B.type;if(c.shp){c.shp=null;delete c.desc;delete c.short;}}if(B.t!=null)c.t=Math.min(B.t,maxLoadFor(ct,S.asm.rules));
  for(const k of ['reefer','hv','placard'])if(B[k]!=null)c[k]=B[k];if(c.type==='reefer')c.reefer=true;if(B.placard&&!c.cls)c.cls='9';out[id]=c;}return out;}
const RULE_UI=[['axle','Axle limit',10,20,.5,v=>fx2(v)+' t'],['warn','Axle warning at',80,100,1,v=>v+'%'],['len','Train length limit',120,220,1,v=>v+' m'],['gross','Train gross limit',400,700,5,v=>v+' t'],
  ['brakeMin','Min brake margin',5,20,1,v=>v+'%'],['pack','Battery pack',40,120,5,v=>v+' kWh'],['reeferKW','Reefer draw',.5,5,.1,v=>fx(v)+' kW'],['tripH','Trip to destination',1,8,.1,v=>fx(v)+' h'],
  ['traction','Traction draw',2,20,1,v=>v+'%'],['floor','Battery floor',10,50,1,v=>v+'%'],['minLoad','Min load per car',1,10,1,v=>v+' t']];
function renderRules(){const R=S.asm.rules;const n=Object.keys(RULES_DEF).filter(k=>R[k]!==RULES_DEF[k]).length;$('rulesSum').textContent=n?n+' changed':'defaults';
  $('rulesGrp').classList.toggle('open',AUI.rulesOpen);$('rulesBtn').setAttribute('aria-expanded',AUI.rulesOpen);if(!AUI.rulesOpen)return;
  if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#rulesBody')&&document.activeElement.type==='range')return;
  let h='';for(const[k,lab,mn,mx,st,f] of RULE_UI){h+=`<div class="var"><div class="vh"><label for="r-${k}">${lab}</label><b>${f(R[k])}</b></div><input type="range" id="r-${k}" data-rule="${k}" min="${mn}" max="${mx}" step="${st}" value="${R[k]}"></div>`;
    if(k==='len')h+=`<div class="var"><div class="vh"><label>Hazmat rule</label></div><div class="seg" id="hazSeg"><button data-hz="adjacent" class="${R.haz==='adjacent'?'on':''}">No adjacent incompatible</button><button data-hz="buffer" class="${R.haz==='buffer'?'on':''}">+ buffer from ends</button></div></div>`;}
  h+=`<div class="vr" style="margin-top:12px;display:flex;justify-content:space-between;font-size:11px;color:var(--fg-3)"><span>Reefer ≈ ${Math.round(reeferPct(R))}% · traction ${R.traction}% per trip</span><button class="ghost" id="rulesDef">Defaults</button></div>`;
  $('rulesBody').innerHTML=h;$('rulesBody').querySelectorAll('input[type=range]').forEach(paintSlider);}
function renderSend(pl,c,sg){const el=$('sendBar');const ns=sg?sg.changes.length:0;
  if(pl.status==='departed'){const late=Math.round((pl.actualT-pl.dep)/60);el.innerHTML=`<div class="sent"><b>${pl.id} departed ${clk(pl.actualT)}</b> ${late>0?`<span class="c-yellow">+${late} min late</span>`:'on time'} from ${trk(pl.fromD)} with ${pl.cars.length} vehicles, ${fx(pl.gross||0)} t.</div><button class="ghost" id="newPlan2">Start a new plan</button>`;return;}
  if(pl.status!=='draft'){const q=S.pl[pl.id];const dn=q?q.veh.filter(v=>v.disp).length:0;
    el.innerHTML=`<div class="sent"><b>Sent to yard</b> at ${clk(pl.sentT)} · ${pl.status==='sent'?'waiting for '+trk(pl.dtrack):pl.status==='pulling'?`pulling ${dn}/${pl.cars.length} to ${trk(pl.dtrack)}`:pl.status} · departs ${clk(pl.dep)}${S.t>pl.dep?` <span class="c-yellow">(+${Math.round((S.t-pl.dep)/60)} min)</span>`:''}${pl.wait?`<br><span class="c-yellow">${esc(pl.wait)}</span>`:''}</div>`+(pl.status==='sent'?`<button class="ghost" id="recall">Recall plan</button>`:'');return;}
  let h=`<button class="ghost" id="applySug" ${ns?'':'disabled'}>Apply suggested plan · ${ns} change${ns===1?'':'s'}</button>`;
  if(!c.n)h+=`<button class="prim" disabled>Send to yard</button><div class="sk">Add cars to send</div>`;
  else if(c.nV)h+=`<button class="prim" id="sendBtn" disabled>Send to yard</button><div class="sk">Resolve ${c.nV} violation${c.nV>1?'s':''}${c.nW?` and ${c.nW} warning${c.nW>1?'s':''}`:''} to send</div>`;
  else if(c.nW&&AUI.confirm)h+=`<div class="conf"><b>Send with ${c.nW} warning${c.nW>1?'s':''}?</b><ul>${c.issues.filter(i=>i.sev==='w').map(i=>`<li>${esc(i.title)}</li>`).join('')}</ul><div class="row"><button class="ghost" id="confBack">Back</button><button class="prim warn" id="confSend">Send anyway</button></div></div>`;
  else if(c.nW)h+=`<button class="prim warn" id="sendBtn">Send with ${c.nW} warning${c.nW>1?'s':''}</button><div class="sk w">Warnings don’t block, but you’ll confirm them</div>`;
  else h+=`<button class="prim" id="sendBtn">Send to yard</button><div class="sk">${trk(pl.dtrack)} · departs ${clk(pl.dep)} · ${c.n} vehicles · ${fx(c.gross)} t</div>`;
  el.innerHTML=h;}
// ---------- cargo editor
function openEditor(id){const pl=curPlan();AUI.edit=id;AUI.sel.clear();const v=vById(id);const c=cargoOf(v);
  AUI.draft=c?Object.assign({},c):{type:CORDER.find(t=>CARGO[t].cars.includes(v.ctype||ctypeFor(id))),t:0};renderAsm(true);}
function closeEditor(){AUI.edit=null;AUI.draft=null;const e=$('cedit');if(e){e.classList.remove('open');e.innerHTML='';}}
function renderEditor(part){const pl=curPlan(),id=AUI.edit,v=vById(id);if(!v||!pl.cars.includes(id)){closeEditor();return;}const R=S.asm.rules,D=AUI.draft,ed=editable(pl);
  const ct=v.ctype||ctypeFor(id),spec=CTYPES[ct],ml=maxLoadFor(ct,R),old=cargoOf(v)||{t:0};const i=pl.cars.indexOf(id);
  const prev={};prev[id]=D;const c0=planChecks(pl,R),c1=planChecks(pl,R,{cargo:prev});const r0=c0.ok.find(r=>r.id===id),r1=c1.ok.find(r=>r.id===id);
  const allowed=CORDER.filter(t=>CARGO[t].cars.includes(ct));const cap={Hopper:'Hoppers take bulk loads only',Box:'Box cars take containers',Flat:'Flats take containers and racks',Tank:'Tank cars take liquids',Reefer:'Reefers take refrigerated loads'}[ct];
  const shpQ=old.shp?S.asm.queue.find(q=>q.id===old.shp):null;
  const pc=(p,cls)=>`<span class="${cls}">${p}</span>`;const axC=p=>p>100?'v':p>=R.warn?'w':'';
  const nR=c0.ok.length-c0.half;const rear=(cc)=>cc.rear;
  let note=`Limits: ${fx2(R.axle)} t per axle, ${R.gross} t per train, ${R.brakeMin}% brake margin on the 1.2% grade.`;
  if(r0.axlePct>=R.warn&&r1.axlePct<R.warn)note+=' Applying clears the axle warning;';
  if(old.shp&&D.type!==old.type)note+=` ${old.shp} returns to the queue.`;else if(old.shp&&D.t<old.t)note+=` ${fx(old.t-D.t)} t of ${old.shp} returns to the queue.`;
  if(r1.axlePct>100)note+=' Over the axle limit: this blocks sending.';
  const e=$('cedit');
  const html=`<div class="eh"><div><b>${id}</b><span>${ct} · #${i+1} · ${blockOf(v)} block</span></div><span style="color:var(--fg-3);font-size:12px">Tare ${spec.tare} t · max gross ${spec.max} t · ${AXLES} axles</span></div>
  <div id="ceL"><div class="ek" style="margin-top:0">Shipment</div>
    <div class="shp">${old.shp&&old.t?`<span><b>${old.shp}</b>KFL → ${blockOf(v)} · ${esc(cargoName(old).replace(/^.*· /,''))} · ${fx(old.booked||old.t)} t booked · due ${clk(pl.dep)}</span>${ed?'<button class="ghost" id="eUnassign">Unassign</button>':''}`:`<span style="color:var(--fg-3)">No shipment. Drop one from the cargo queue, or set a load below.</span>`}</div>
    <div class="ek">Cargo type <span>${cap}</span></div><div class="chips">${CORDER.map(t=>`<button class="chipb ${D.type===t&&(D.t>0||!old.t)?'on':''}" data-et="${t}" ${allowed.includes(t)&&ed?'':'disabled'} title="${allowed.includes(t)?'':ct+' can’t carry '+CARGO[t].name.toLowerCase()}">${CARGO[t].name}</button>`).join('')}</div>
    <div class="ek">Load <span id="eLoadLbl">${fx(D.t)} of ${fx(ml)} t</span></div>
    <div class="lrow"><div><input type="range" id="eLoad" min="0" max="${ml}" step="0.5" value="${D.t}" ${ed?'':'disabled'} aria-label="Load in tonnes"><div class="vr"><span>0 t</span><span>${fx(ml)} t max</span></div></div>
      <span class="stepper"><button data-es="-0.5" ${ed?'':'disabled'} aria-label="Less">−</button><input id="eLoadN" class="num" value="${D.t.toFixed(1)} t" ${ed?'':'disabled'} aria-label="Load"><button data-es="0.5" ${ed?'':'disabled'} aria-label="More">+</button></span></div>
    <div class="ek">Fill</div><div class="chips">${[50,75,90,100].map(p=>`<button class="chipb ${Math.abs(D.t-Math.round(ml*p/2)/50)<0.01?'on':''}" data-ef="${p}" ${ed?'':'disabled'}>${p}%</button>`).join('')}<span id="eFillCap" style="color:var(--fg-3);font-size:11px;align-self:center;margin-left:4px">${Math.round(D.t/ml*100)}% of ${ct.toLowerCase()} capacity</span></div>
    <div class="ek">Flags</div>
    <div class="flag"><span>Hazmat placard</span><button class="sw ${D.type==='haz'||D.placard?'on':''}" data-eflag="placard" role="switch" ${ed&&D.type!=='haz'?'':'disabled'}></button></div>
    <div class="flag"><span>Reefer power draw</span><button class="sw ${D.reefer||D.type==='reefer'?'on':''}" data-eflag="reefer" role="switch" ${ed&&D.type!=='reefer'?'':'disabled'}></button></div>
    <div class="flag"><span>High-value</span><button class="sw ${D.hv?'on':''}" data-eflag="hv" role="switch" ${ed?'':'disabled'}></button></div>
    <div class="flag"><span>Hazmat class</span><select id="eCls" ${ed&&(D.type==='haz'||D.placard)?'':'disabled'}><option value="">None</option>${HAZ_CLASSES.map(k=>`<option ${D.cls===k?'selected':''}>${k}</option>`).join('')}</select></div></div>
  <div id="ceR"><div class="ek" style="margin-top:0">Effect <span>Before → after</span></div><table class="eff">
    <tr><td>Gross</td><td class="n">${fx(r0.gross)} t →</td><td class="n"><b>${fx(r1.gross)} t</b></td></tr>
    <tr><td>Axle load</td><td class="n ${axC(r0.axlePct)}">${fx2(r0.axle)} t · ${Math.round(r0.axlePct)}% →</td><td class="n"><b class="${axC(r1.axlePct)}">${fx2(r1.axle)} t · ${Math.round(r1.axlePct)}%</b></td></tr>
    <tr><td>Train weight</td><td class="n">${fx(c0.gross)} t →</td><td class="n"><b class="${c1.gross>R.gross?'v':''}">${fx(c1.gross)} t</b></td></tr>
    <tr><td>Brake margin</td><td class="n">${c0.brake.toFixed(1)}% →</td><td class="n"><b class="${c1.brake<R.brakeMin?'v':''}">${c1.brake.toFixed(1)}%</b></td></tr>
    <tr><td>Rear ${nR===6?'six':nR} cars</td><td class="n">${fx(rear(c0))} t →</td><td class="n"><b>${fx(rear(c1))} t</b></td></tr>
    ${r1.reef||r0.reef?`<tr><td>Arrives ${pl.to} at</td><td class="n ${r0.arr<0?'w':''}">${Math.round(r0.arr)}% →</td><td class="n"><b class="${r1.arr<0?'w':''}">${Math.round(r1.arr)}%</b></td></tr>`:''}</table>
    <div class="enote">${esc(note)}</div>
    <div class="eact">${ed?'<button class="rm" id="eRemove">Remove from consist</button><button class="ghost" id="eMove" title="Then tap where it goes">Move…</button>':''}<button class="ghost" id="eCancel">${ed?'Cancel':'Close'}</button>${ed?`<button class="prim" id="eApply">Apply to ${id}</button>`:''}</div></div>`;
  if(part==='eff'&&$('ceR')){const tmp=document.createElement('div');tmp.innerHTML=html;$('ceR').innerHTML=tmp.querySelector('#ceR').innerHTML;
    $('eLoadLbl').textContent=`${fx(D.t)} of ${fx(ml)} t`;$('eLoadN').value=D.t.toFixed(1)+' t';$('eFillCap').textContent=`${Math.round(D.t/ml*100)}% of ${ct.toLowerCase()} capacity`;paintSlider($('eLoad'));return;}
  e.innerHTML=html;e.classList.add('open');
  // place under the strip, near the car
  if(isMobile()){const sl=$('eLoad');if(sl)paintSlider(sl);return;}
  const host=$('asm').getBoundingClientRect(),car=document.querySelector(`.car[data-car="${id}"]`);const cr=car?car.getBoundingClientRect():$('strip').getBoundingClientRect();
  const w=700;let x=cr.left-host.left+cr.width/2-w/2;x=Math.max(16,Math.min(host.width-w-16,x));const y=$('bars').getBoundingClientRect().bottom-host.top+$('asm').scrollTop+6;
  e.style.left=x+'px';e.style.top=y+'px';const sl=$('eLoad');if(sl)paintSlider(sl);
  if(!part){const A=$('asm'),er=e.getBoundingClientRect(),ar=A.getBoundingClientRect();if(er.bottom>ar.bottom-8)A.scrollTop+=er.bottom-ar.bottom+12;}}
function applyCargoEdit(id,D){const pl=curPlan();const v=vById(id);const old=cargoOf(v)||{t:0};
  commitAsm(()=>{const nc=Object.assign({},old,D);nc.t=Math.max(0,Math.round(nc.t*2)/2);
    if(nc.type==='reefer')nc.reefer=true;if(nc.type!=='haz'&&!nc.placard)delete nc.cls;
    if(old.shp&&old.t){if(nc.type!==old.type||nc.t===0){shpFromCar(id,pl);nc.shp=null;delete nc.desc;delete nc.short;delete nc.booked;}else if(nc.t<old.t)shpFromCar(id,pl,old.t-nc.t);}
    if(nc.type!==old.type&&!old.shp){delete nc.desc;delete nc.short;}
    S.asm.cargo[id]=nc;});closeEditor();renderAsm(true);}
// ---------- drag and drop (pointer based: reorder, spare → consist, shipment → car)
function dropReason(s,id){const v=vById(id);if(!v)return 'Not a car';const ct=v.ctype||ctypeFor(id),R=S.asm.rules;const c=cargoOf(v);
  if(c&&c.t)return `${id} already carries ${c.shp||cargoShort(c)}`;if(!compatible(s,ct))return `A ${ct.toLowerCase()} can’t take ${CARGO[s.type].name.toLowerCase()}`;
  if(blockOf(v)!==s.dest)return `${id} is in the ${blockOf(v)} block; ${s.id} goes to ${s.dest}`;return '';}
function insIndex(x){const pl=curPlan();const cars=[...document.querySelectorAll('#strip .car')];let idx=cars.length;
  for(let i=0;i<cars.length;i++){const r=cars[i].getBoundingClientRect();if(x<r.left+r.width/2){idx=i;break;}}return Math.min(idx,pl.cars.length);}
function showIns(idx){const m=$('insMark');if(!m)return;const cars=[...document.querySelectorAll('#strip .car')];if(idx==null){m.style.display='none';return;}
  const sr=$('strip').getBoundingClientRect();let x;if(idx<cars.length)x=cars[idx].getBoundingClientRect().left-sr.left-2;else if(cars.length){const r=cars[cars.length-1].getBoundingClientRect();x=r.right-sr.left+2;}else x=0;
  m.style.display='block';m.style.left=x+'px';}
function overConsist(x,y){const r=$('consist').getBoundingClientRect();return x>=r.left-10&&x<=r.right+10&&y>=r.top-24&&y<=r.bottom+10;}
function onAsmDown(e){if(e.button!==0)return;const el=e.target.closest('[data-drag],[data-car]');if(!el||e.target.closest('button,input,select'))return;
  const touch=e.pointerType!=='mouse';DRAG={kind:el.dataset.drag||'car',id:el.dataset.id||el.dataset.car,x0:e.clientX,y0:e.clientY,el,live:false,shift:e.shiftKey,touch,nodrag:!el.dataset.drag};
  if(touch&&el.dataset.car&&editable(curPlan())){const id=el.dataset.car;DRAG.lp=setTimeout(()=>{if(!DRAG||DRAG.id!==id)return;DRAG=null;closeEditor();if(AUI.sel.has(id))AUI.sel.delete(id);else AUI.sel.add(id);renderAsm(true);},480);}
  if(!touch)e.preventDefault();}
function onAsmMove(e){if(!DRAG)return;const d=Math.hypot(e.clientX-DRAG.x0,e.clientY-DRAG.y0);if(DRAG.touch||DRAG.nodrag){if(d>10){clearTimeout(DRAG.lp);if(DRAG.touch)DRAG=null;else DRAG.moved=true;}return;}if(!DRAG.live){if(d<5)return;DRAG.live=true;closeEditor();if(DRAG.kind==='car')DRAG.el.classList.add('dragging');}
  const g=$('dragGhost');g.style.display='block';g.style.left=(e.clientX+12)+'px';g.style.top=(e.clientY+10)+'px';
  document.querySelectorAll('.car.drop-ok,.car.drop-no').forEach(c=>c.classList.remove('drop-ok','drop-no'));DRAG.target=null;
  if(DRAG.kind==='shp'){const s=S.asm.queue.find(q=>q.id===DRAG.id);g.style.display='none';const hit=document.elementFromPoint(e.clientX,e.clientY);g.style.display='block';
    const car=hit&&hit.closest('.car');let sub='';if(car){const why=dropReason(s,car.dataset.car);if(why){car.classList.add('drop-no');sub=`<span class="why">${esc(why)}</span>`;}else{car.classList.add('drop-ok');DRAG.target=car.dataset.car;
      const v=vById(car.dataset.car);const ct=v.ctype||ctypeFor(v.id);const t=Math.min(s.t,maxLoadFor(ct,S.asm.rules));sub=`<span class="ok">Drop to load · ${fx(t)} t → ${fx(CTYPES[ct].tare+t)} t gross</span>`;}}
    g.innerHTML=`<b>${s.id}</b>${esc(s.desc)} <span>KFL → ${s.dest} · ${fx(s.t)} t · ${clk(s.due)}</span>${sub}`;return;}
  const id=DRAG.id;g.innerHTML=`<b>${id}</b><span>${DRAG.kind==='car'?'Move in consist · drop on the drawer to remove':'Add to consist'}</span>`;
  if(overConsist(e.clientX,e.clientY)){const idx=insIndex(e.clientX);DRAG.target=idx;showIns(idx);}else{showIns(null);
    if(DRAG.kind==='car'&&e.clientY>$('drawer').getBoundingClientRect().top){DRAG.target='remove';g.innerHTML=`<b>${id}</b><span class="why">Remove from ${curPlan().id}</span>`;}}}
function onAsmUp(e){if(!DRAG)return;const D=DRAG;DRAG=null;clearTimeout(D.lp);$('dragGhost').style.display='none';if(D.moved)return;
  if(!D.live&&AUI.pick&&D.kind==='car'){placeAt(D.id);return;}
  if(!D.live&&(D.kind==='spare'||D.kind==='shp')){AUI.pick=AUI.pick&&AUI.pick.id===D.id?null:{kind:D.kind,id:D.id};AUI.flash='';closeEditor();renderAsm(true);return;}
  if(!D.live){if(D.kind==='car'){if(D.shift){AUI.edit=null;if(AUI.sel.has(D.id))AUI.sel.delete(D.id);else AUI.sel.add(D.id);closeEditor();renderAsm(true);}else{if(AUI.edit===D.id){closeEditor();renderAsm(true);}else openEditor(D.id);}}return;}
  const pl=curPlan();
  if(D.kind==='shp'&&D.target){const id=D.target;commitAsm(()=>{assignShp(D.id,id,pl);});return;}
  if(D.kind==='car'&&D.target==='remove'){commitAsm(()=>{pl.cars=pl.cars.filter(x=>x!==D.id);});return;}
  if(D.kind==='car'&&typeof D.target==='number'){const from=pl.cars.indexOf(D.id);let to=D.target;if(to>from)to--;if(to!==from)commitAsm(()=>{const a=pl.cars.filter(x=>x!==D.id);a.splice(to,0,D.id);pl.cars=a;});else renderAsm(true);return;}
  if(D.kind==='spare'&&typeof D.target==='number'){commitAsm(()=>{pl.cars.splice(D.target,0,D.id);});return;}
  renderAsm(true);}
// tap-to-place: pick a shipment / spare / car, then tap a car (it goes in front of that car) or End
function renderPick(pl){const el=$('pickBanner');const P_=AUI.pick;if(!P_||!editable(pl)){el.innerHTML='';return;}
  let t='';if(P_.kind==='shp'){const s=S.asm.queue.find(q=>q.id===P_.id);if(!s){AUI.pick=null;el.innerHTML='';return;}t=`Tap a highlighted car to load <b>${s.id}</b> (${fx(s.t)} t, ${esc(s.desc)})`;}
  else t=`Tap a car to put <b>${P_.id}</b> in front of it, or tap End`;
  el.innerHTML=`<span>${t}${AUI.flash?` <span class="why">· ${esc(AUI.flash)}</span>`:''}</span><span class="grow"></span><button class="ghost" id="pickCancel">Cancel</button>`;}
function placeAt(target){const pl=curPlan(),P_=AUI.pick;if(!P_||!editable(pl))return;
  if(P_.kind==='shp'){if(target==='end')return;const s=S.asm.queue.find(q=>q.id===P_.id);const why=s?dropReason(s,target):'Shipment is gone';if(why){AUI.flash=why;renderAsm(true);return;}
    AUI.pick=null;AUI.flash='';commitAsm(()=>{assignShp(P_.id,target,pl);});return;}
  if(P_.kind==='car'&&target===P_.id){AUI.pick=null;renderAsm(true);return;}
  AUI.pick=null;AUI.flash='';commitAsm(()=>{const a=pl.cars.filter(x=>x!==P_.id);let to=target==='end'?a.length:a.indexOf(target);if(to<0)to=a.length;a.splice(to,0,P_.id);pl.cars=a;});}
// ---------- actions
function newPlan(){let n=53;while(S.asm.plans.some(p=>p.id==='PL-'+n)||S.pl['PL-'+n])n++;const id='PL-'+n;
  const used=new Set(S.asm.plans.filter(p=>p.status!=='departed').map(p=>p.dtrack));const d=D_IDS.find(x=>!used.has(x))||'D01';
  const counts={};for(const v of S.veh)if(v.state==='classified'&&!v.thru&&!v.staged)counts[v.block]=(counts[v.block]||0)+1;const blk=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0]||'MEM';
  commitAsm(()=>{S.asm.plans.push({id,from:'KFL',to:blk,blocks:[blk],dtrack:d,dep:Math.ceil((S.t+3600)/300)*300,cars:[],status:'draft',wait:'',sentT:null,actualT:null});});AUI.plan=id;AUI.sel.clear();closeEditor();renderAsm(true);}
function sendPlan(){const pl=curPlan();const c=planChecks(pl);if(c.nV)return false;commitAsm(()=>{pl.status='sent';pl.sentT=S.t;pl.ackW=c.nW;});return true;}
function initAsmUI(){
  document.querySelectorAll('#viewSeg button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
  $('slotCollapse').onclick=()=>{AUI.collapsed=!AUI.collapsed;renderAsm(true);};
  $('rulesBtn').onclick=()=>{AUI.rulesOpen=!AUI.rulesOpen;renderAsm(true);};
  const A=$('asm'),SD=$('asmSide');
  A.addEventListener('pointerdown',onAsmDown);window.addEventListener('pointermove',onAsmMove);window.addEventListener('pointerup',onAsmUp);window.addEventListener('pointercancel',()=>{if(DRAG){clearTimeout(DRAG.lp);DRAG=null;$('dragGhost').style.display='none';}});
  A.addEventListener('click',e=>{const t=e.target.closest('[data-end]');if(t)placeAt('end');});
  A.addEventListener('click',e=>{const t=e.target.closest('button,[data-p]');if(!t)return;const pl=curPlan();
    if(t.dataset.p){AUI.plan=t.dataset.p;AUI.sel.clear();AUI.aa=null;AUI.mode='cur';closeEditor();renderAsm(true);}
    else if(t.id==='newPlan')newPlan();
    else if(t.id==='pickCancel'){AUI.pick=null;AUI.flash='';renderAsm(true);}
    else if(t.id==='eMove'){AUI.pick={kind:'car',id:AUI.edit};closeEditor();renderAsm(true);}
    else if(t.dataset.d&&t.closest('#dtSeg')){if(editable(pl))commitAsm(()=>{pl.dtrack=t.dataset.d;});}
    else if(t.dataset.dd){if(editable(pl))commitAsm(()=>{pl.dep=Math.max(Math.ceil((S.t+ASSEMBLE)/60)*60,pl.dep+ +t.dataset.dd);});}
    else if(t.dataset.m){AUI.mode=t.dataset.m;closeEditor();AUI.sel.clear();renderAsm(true);}
    else if(t.id==='bnBack'){AUI.mode='cur';renderAsm(true);}
    else if(t.id==='bnApply')applySuggested();
    else if(t.dataset.blk){commitAsm(()=>{pl.blocks=[t.dataset.blk];pl.to=t.dataset.blk;});}
    else if(t.dataset.t&&t.closest('.dr-tabs')){AUI.tab=t.dataset.t;renderAsm(true);}
    else if(t.dataset.sf){AUI.spareAll=t.dataset.sf==='all';renderAsm(true);}
    else if(t.dataset.add){commitAsm(()=>{pl.cars.push(t.dataset.add);});}
    else if(t.dataset.qd){AUI.qf.dest=t.dataset.qd;renderAsm(true);}
    else if(t.dataset.qdue){AUI.qf.due=!AUI.qf.due;renderAsm(true);}
    else if(t.id==='aaRun'){AUI.aa=autoAssign(pl);renderAsm(true);}
    else if(t.id==='aaDiscard'){AUI.aa=null;renderAsm(true);}
    else if(t.id==='aaApply'){const a=AUI.aa;commitAsm(()=>{for(const p of a.placed)assignShp(p.shp.id,p.car,pl);});}
    // editor
    else if(t.dataset.et){const D=AUI.draft;const old=cargoOf(vById(AUI.edit));D.type=t.dataset.et;if(D.type==='haz'&&!D.cls)D.cls='9';if(D.type==='reefer')D.reefer=true;
      if(old&&old.shp&&old.type!==D.type){D.shp=null;}else if(old&&old.shp){D.shp=old.shp;}if(!D.t){const ct=vById(AUI.edit).ctype;D.t=Math.round(maxLoadFor(ct,S.asm.rules)*.75);}renderEditor();}
    else if(t.dataset.es){AUI.draft.t=Math.max(0,Math.min(+$('eLoad').max,AUI.draft.t+ +t.dataset.es));renderEditor();}
    else if(t.dataset.ef){AUI.draft.t=Math.round(+$('eLoad').max*t.dataset.ef/2)/50;renderEditor();}
    else if(t.dataset.eflag){const k=t.dataset.eflag;AUI.draft[k]=!AUI.draft[k];if(k==='placard'&&AUI.draft.placard&&!AUI.draft.cls)AUI.draft.cls='9';renderEditor();}
    else if(t.id==='eCancel'){closeEditor();renderAsm(true);}
    else if(t.id==='eApply')applyCargoEdit(AUI.edit,AUI.draft);
    else if(t.id==='eUnassign'){const id=AUI.edit;commitAsm(()=>unassignCar(id,pl));closeEditor();renderAsm(true);}
    else if(t.id==='eRemove'){const id=AUI.edit;closeEditor();commitAsm(()=>{pl.cars=pl.cars.filter(x=>x!==id);});}});
  A.addEventListener('input',e=>{const t=e.target;if(t.id==='eLoad'){AUI.draft.t=+t.value;renderEditor('eff');}});
  A.addEventListener('change',e=>{const t=e.target;if(t.id==='eLoad'){renderEditor();return;}if(t.id==='qType'){AUI.qf.type=t.value;renderAsm(true);}else if(t.id==='eCls'){AUI.draft.cls=t.value||null;renderEditor();}
    else if(t.id==='eLoadN'){const v=parseFloat(t.value);if(!isNaN(v))AUI.draft.t=Math.max(0,Math.min(+$('eLoad').max,v));renderEditor();}});
  SD.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const pl=curPlan();
    if(t.dataset.fix!=null){const f=AUI.fixes[+t.dataset.fix];if(f)commitAsm(()=>applyChange(f,pl));}
    else if(t.id==='applySug')applySuggested();
    else if(t.id==='sendBtn'){const c=planChecks(pl);if(c.nV)return;if(c.nW){AUI.confirm=true;renderAsm(true);}else sendPlan();}
    else if(t.id==='confBack'){AUI.confirm=false;renderAsm(true);}
    else if(t.id==='confSend')sendPlan();
    else if(t.id==='recall'){if(pl.status==='sent')commitAsm(()=>{pl.status='draft';pl.wait='';});}
    else if(t.id==='newPlan2')newPlan();
    else if(t.dataset.hz){commitAsm(()=>{S.asm.rules.haz=t.dataset.hz;});}
    else if(t.id==='rulesDef'){commitAsm(()=>{S.asm.rules=Object.assign({},RULES_DEF);});}
    else if(t.dataset.bt){AUI.bulk.type=t.dataset.bt;if(t.dataset.bt==='reefer')AUI.bulk.reefer=true;renderAsm(true);}
    else if(t.dataset.bs){AUI.bulk.t=Math.max(0,AUI.bulk.t+ +t.dataset.bs);renderAsm(true);}
    else if(t.dataset.bf){const k=t.dataset.bf;AUI.bulk[k]=!(AUI.bulk[k]!=null?AUI.bulk[k]:false);renderAsm(true);}
    else if(t.id==='bClear'){AUI.sel.clear();AUI.bulk=null;renderAsm(true);}
    else if(t.id==='bApply'){const ids=pl.cars.filter(id=>AUI.sel.has(id));const prev=bulkPreview(pl,ids,AUI.bulk);
      commitAsm(()=>{for(const id of ids){const old=cargoOf(vById(id))||{t:0};const nc=prev[id];if(old.shp&&old.t&&nc.shp===null)shpFromCar(id,pl);else if(old.shp&&nc.t<old.t)shpFromCar(id,pl,old.t-nc.t);S.asm.cargo[id]=nc;}});AUI.sel.clear();AUI.bulk=null;renderAsm(true);}});
  SD.addEventListener('input',e=>{const t=e.target;if(t.dataset.rule){const k=t.dataset.rule,v=+t.value;paintSlider(t);commitAsm(()=>{S.asm.rules[k]=v;});const lab=t.parentElement.querySelector('b');const ru=RULE_UI.find(x=>x[0]===k);if(lab&&ru)lab.textContent=ru[5](v);}});
  SD.addEventListener('change',e=>{const t=e.target;if(t.id==='bLoad'){const v=parseFloat(t.value);if(!isNaN(v))AUI.bulk.t=Math.max(0,v);renderAsm(true);}});
  window.addEventListener('keydown',e=>{if(VIEW!=='asm'||e.key!=='Escape')return;if(AUI.pick){AUI.pick=null;AUI.flash='';renderAsm(true);}else if(AUI.edit){closeEditor();renderAsm(true);}else if(AUI.confirm){AUI.confirm=false;renderAsm(true);}else if(AUI.sel.size){AUI.sel.clear();renderAsm(true);}else if(AUI.mode==='sug'){AUI.mode='cur';renderAsm(true);}},true);
  window.addEventListener('resize',()=>renderAsm(true));
  document.addEventListener('pointerdown',e=>{if(AUI.edit&&!e.target.closest('#cedit')&&!e.target.closest('.car')){closeEditor();renderAsm(true);}},true);}
function applySuggested(){const pl=curPlan();const sg=suggest(pl);if(!sg.changes.length)return;commitAsm(()=>{for(const ch of sg.changes)applyChange(ch,pl);});AUI.mode='cur';renderAsm(true);}
