const { chromium } = require('playwright');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  const load=async()=>{await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(600);};
  const get=(f,a)=>p.evaluate(f,a);
  await load();
  // ---------- 1. turnout stuck (bowl ladder X-27) ----------
  let r=await get(()=>{const Y=__yard;Y.advance(20*60);const id=Y.inject({type:'turnout',target:'X-27'});
    const sw=Y.S.flist.find(f=>f.id===id);return {id,failed:Y.pathOK('LEAD','B07'),near:Y.pathOK('LEAD','B06'),lbl:sw&&sw.label};});
  ok(r.id&&!r.failed&&r.near,`turnout X-27 stuck: B-07+ unreachable, B-06 still reachable (${r.lbl})`);
  r=await get(()=>{const Y=__yard;let bad=0;for(let i=0;i<40;i++){Y.advance(60);for(const v of Y.S.veh)if(v.state==='rolling'&&v.target&&v.target.k>=7&&!v.thru){const R=v.route.slice(v.ri);if(R.includes('Bd7'))bad++;}}
    const used=Y.TRACKS.filter(T=>T.assigned>0).map(T=>T.id);return {bad,used,sorted:Y.S.sorted};});
  ok(r.bad===0,`no cut routed through X-27 for 40 min; reroutes to ${r.used.join(' ')}`);
  ok(await get(()=>__yard.clearFault(__yard.S.flist[0].id)&&__yard.pathOK('LEAD','B07')),'clearing X-27 restores B-07…B-12');
  // receiving-side reroute: X-03 stuck sends new platoons to R-01
  r=await get(()=>{const Y=__yard;Y.inject({type:'turnout',target:'X-03'});const before=new Set(Object.values(Y.S.pl).filter(p=>p.kind==='in'&&p.rtrack).map(p=>p.id));
    Y.advance(45*60);const nw=Object.values(Y.S.pl).filter(p=>p.kind==='in'&&p.rtrack&&!before.has(p.id)&&p.state==='inbound'||(!before.has(p.id)&&p.kind==='in'&&p.recvT>0));
    const r=nw.map(p=>p.fromR||p.rtrack);return {r,ok:Y.pathOK('ML1a','R01'),cut:Y.pathOK('ML1a','R03')};});
  ok(r.ok&&!r.cut&&r.r.length>0&&r.r.every(x=>x==='R01'),`X-03 stuck: new platoons reroute to R-01 only (${[...new Set(r.r)].join(',')}, n=${r.r.length})`);
  await get(()=>__yard.clearAll());ok(await get(()=>__yard.S.flist.length===0),'Clear all empties the fault list');
  // ---------- 2. retarder failure ----------
  await load();
  r=await get(()=>{const Y=__yard;const s0=Y.S.sorted;Y.advance(30*60);const base=Y.S.sorted-s0;
    const id=Y.inject({type:'retarder'});const s1=Y.S.sorted;let vmax=0;
    for(let i=0;i<60;i++){Y.advance(30);for(const v of Y.S.veh)if(v.route[v.ri]==='LEAD'&&v.state==='humping')vmax=Math.max(vmax,v.v);}
    return {id,base,slow:Y.S.sorted-s1,vmax,retHold:Y.S.retHold};});
  ok(r.id&&r.vmax<=1.5*0.3+1e-6,`retarder failure caps hump speed (max ${r.vmax.toFixed(3)} ≤ 0.45 sim-units = 1.5 km/h)`);
  ok(r.slow<=Math.ceil(30*60/45)+1,`retarder: crest spacing ≥45 s (sorted ${r.slow} in 30 min, baseline ${r.base})`);
  ok(await get(()=>{__yard.clearAll();__yard.advance(600);return !__yard.S.retHold&&__yard.S.flist.length===0;}),'retarder clear restores normal humping');
  // ---------- 3. charger outage ----------
  await load();
  r=await get(()=>{const Y=__yard;Y.setParam('socThr',60);Y.advance(10*60);Y.inject({type:'charger',target:'CH01'});
    const ch=Y.S.veh.filter(v=>v.state==='charging'&&v.target&&v.target.id==='CH-01');const soc0=ch.map(v=>v.soc);
    let newCH1=0,toCH2=0;const seen=new Set(Y.S.veh.filter(v=>v.target&&v.target.id==='CH-01').map(v=>v.id));
    for(let i=0;i<40;i++){Y.advance(60);for(const v of Y.S.veh){if(v.target&&v.target.id==='CH-01'&&!seen.has(v.id))newCH1++;if(v.target&&v.target.id==='CH-02')toCH2++;}}
    const gain=ch.map((v,i)=>v.soc-soc0[i]);return {n:ch.length,maxGain:Math.max(0,...gain),newCH1,toCH2};});
  ok(r.newCH1===0&&r.toCH2>0,`CH-01 outage: no new vehicles sent to CH-01, low-SoC diverted to CH-02 (${r.toCH2} veh-min)`);
  ok(r.maxGain<1e-9,`vehicles stuck on CH-01 gain no charge (${r.n} stranded)`);
  r=await get(()=>{const Y=__yard;Y.inject({type:'charger',target:'CH02'});let toCH=0;const seen=new Set(Y.S.veh.filter(v=>v.target&&v.target.isCH).map(v=>v.id));
    for(let i=0;i<20;i++){Y.advance(60);for(const v of Y.S.veh)if(v.target&&v.target.isCH&&!seen.has(v.id))toCH++;}
    const low=Y.S.veh.filter(v=>v.soc<60&&v.target&&!v.target.isCH).length;return {toCH,low};});
  ok(r.toCH===0&&r.low>0,`both chargers out: low-SoC cuts go to bowl tracks uncharged (${r.low})`);
  ok(await get(()=>{__yard.clearAll();__yard.advance(30*60);return __yard.S.veh.some(v=>v.state==='charging'&&v.soc>30);}),'clearing outages resumes charging');
  // ---------- 4. battery drop ----------
  await load();
  r=await get(()=>{const Y=__yard;Y.advance(5*60);const id=Y.inject({type:'battery',target:'random'});const f=Y.S.flist.find(x=>x.id===id);const v=Y.S.veh.find(x=>x.id===f.target);
    const pos=v.route[v.ri]+':'+v.s.toFixed(2);Y.advance(10*60);const v2=Y.S.veh.find(x=>x.id===f.target);
    const behind=Y.S.veh.filter(x=>x!==v2&&x.blocked&&!x.thru).length;return {id,tgt:f.target,soc:v2.soc,same:pos===v2.route[v2.ri]+':'+v2.s.toFixed(2),dead:v2.dead,blocked:v2.blocked,behind};});
  ok(r.id&&r.dead&&r.same&&r.soc<=3,`battery drop: ${r.tgt} stalls at ${r.soc.toFixed(0)}% and stays put for 10 min`);
  ok(r.blocked,`stalled vehicle shows as blocked; ${r.behind} others blocked behind it`);
  r=await get(()=>{const Y=__yard;Y.clearFault(Y.S.flist[0].id);const v=Y.S.veh.find(x=>x.id===Y.S.faults[Y.S.faults.length-1].kind.split(' ')[0]);const s=v?v.route[v.ri]+v.s:null;Y.advance(5*60);const v2=Y.S.veh.find(x=>v&&x.id===v.id);
    return {soc:v?v.soc:null,moved:!v2||v2.route[v2.ri]+v2.s!==s,dead:v2&&v2.dead};});
  ok(r.moved&&!r.dead,`clearing (tow + top-up) gets it moving again`);
  r=await get(()=>{const Y=__yard;Y.select(Y.S.veh.find(v=>!v.thru&&v.v>0.05).id);const sel=Y.selected.id;const id=Y.inject({type:'battery',target:sel,dur:900});
    const f=Y.S.flist.find(x=>x.id===id);Y.advance(14*60);const still=Y.S.flist.length;Y.advance(2*60);return {sel,tgt:f.target,still,after:Y.S.flist.length};});
  ok(r.tgt===r.sel&&r.still===1&&r.after===0,`battery drop on the selected vehicle (${r.sel}) auto-clears after 15 min`);
  // ---------- 5. track blocked ----------
  await load();
  r=await get(()=>{const Y=__yard;Y.advance(5*60);const id=Y.inject({type:'track',target:'B01'});const seen=new Set(Y.S.veh.filter(v=>v.target&&v.target.id==='B-01').map(v=>v.id));let nw=0;
    for(let i=0;i<30;i++){Y.advance(60);for(const v of Y.S.veh)if(v.target&&v.target.id==='B-01'&&!seen.has(v.id))nw++;}return {id,nw,reach:Y.pathOK('LEAD','B01')};});
  ok(r.id&&r.nw===0&&!r.reach,'B-01 blocked: no new cuts assigned to it for 30 min');
  r=await get(()=>{const Y=__yard;Y.inject({type:'track',target:'R01'});let nw=0;for(let i=0;i<40;i++){Y.advance(60);for(const p of Object.values(Y.S.pl))if(p.kind==='in'&&p.rtrack==='R01'&&p.state==='inbound')nw++;}
    const obs=Y.S.flist.find(f=>f.target==='R01').pos;const viol=Y.S.veh.filter(v=>v.route[v.ri]==='R01'&&v.s>obs-6&&v.s-v.len<obs+6).length;return {nw,viol};});
  ok(r.nw===0&&r.viol===0,'R-01 blocked: inbound platoons use other receiving tracks; no car overlaps the obstruction');
  r=await get(()=>{const Y=__yard;Y.inject({type:'track',target:'LEAD'});const s0=Y.S.sorted;Y.advance(30*60);const blocked=Y.S.sorted-s0;
    const q=Y.S.queue;Y.clearAll();const s1=Y.S.sorted;Y.advance(40*60);return {blocked,q,after:Y.S.sorted-s1};});
  ok(r.blocked<=8&&r.after>r.blocked,`hump lead blocked visibly jams (sorted ${r.blocked} in 30 min, queue ${r.q}); recovers after clear (${r.after})`);
  // ---------- 6. replay determinism across many faults ----------
  await load();
  await get(()=>{const Y=__yard;Y.advance(10*60);Y.inject({type:'turnout',target:'X-25'});Y.advance(15*60);Y.inject({type:'battery',target:'random',dur:900});
    Y.advance(10*60);Y.inject({type:'charger',target:'CH02'});Y.inject({type:'track',target:'B02',dur:1800});Y.advance(10*60);Y.inject({type:'retarder',dur:600});
    Y.advance(20*60);Y.clearFault(Y.S.flist.find(f=>f.type==='turnout').id);Y.advance(20*60);});
  const live=await get(()=>__yard.liveT),H=await get(()=>__yard.hash());
  const tl=await get(()=>__yard.S.faults.map(f=>f.kind+(f.b==null?'':'✓')));
  ok(tl.length===5,'timeline records 5 inject events with clear markers: '+tl.join(', '));
  for(const back of [80,55,30,5]){await get(([l,b])=>__yard.seek(l-b*60),[live,back]);
    await get(l=>__yard.advance(l-__yard.S.t),live);}
  ok(await get(()=>__yard.hash())===H,'replaying forward from −80/−55/−30/−5 min reproduces the live state hash exactly (faults injected, auto-cleared and cleared)');
  await get(l=>__yard.seek(l-50*60),live);const mid=await get(()=>__yard.faults().map(f=>f.label).join(','));
  const swf=await get(()=>__yard.S.flist.length&&__yard.TURNOUTS&&document&&true);
  ok(/X-25 STUCK/.test(mid)&&/BATTERY/.test(mid)&&/CH-02 OUTAGE/.test(mid)&&/B-02 BLOCKED/.test(mid)&&!/RETARDER/.test(mid)&&!(await get(()=>__yard.pathOK('LEAD','B05'))),'scrubbed to −50 min: exactly the faults active then ('+mid+'), map routing reflects X-25');
  await get(l=>__yard.seek(l),live);ok(await get(()=>__yard.hash())===H,'seek back to live: identical');
  // ---------- 7. injecting in replay branches ----------
  await get(l=>__yard.seek(l-30*60),live);const tb=await get(()=>__yard.S.t);
  await get(()=>__yard.inject({type:'turnout',target:'X-22'}));
  ok(await get(t=>__yard.liveT===t&&!__yard.isReplay()&&__yard.S.flist.some(f=>f.target==='X-22'),tb),'injecting a fault in REPLAY branches the run there (future discarded)');
  // ---------- 8. UI: panel, list, pick mode, right-click ----------
  await load();
  await p.selectOption('#fType','turnout');await p.selectOption('#fTarget','X-29');await p.selectOption('#fDur','1800');await p.click('#fInject');
  ok((await p.textContent('#fList')).includes('X-29 STUCK')&&(await p.textContent('#fList')).includes('clears in 30m'),'panel: inject X-29 for 30 min → listed with countdown');
  ok((await p.textContent('#statusChip'))==='X-29 STUCK','status chip shows the fault');
  ok(await p.$eval('#fTarget option[value="X-29"]',o=>o.disabled),'active target is disabled in the picker');
  await p.selectOption('#fType','charger');ok((await p.$$eval('#fTarget option',os=>os.map(o=>o.value))).join()==='CH01,CH02','target picker follows type (charger → CH-01/CH-02)');
  await p.click('#fPick');ok(await p.$eval('#mapbox',e=>e.classList.contains('picking')),'Pick on map enters pick mode');
  let xy=await get(()=>__yard.swXY('X-31'));await p.mouse.click(xy[0],xy[1]);
  ok(await p.isVisible('#fpop')&&(await p.textContent('#fpop')).includes('Turnout X-31'),'clicking a turnout opens the fault popover: '+(await p.textContent('#fpop')).replace(/\s+/g,' '));
  await p.click('#fpop button[data-i="0"]');ok(await get(()=>__yard.S.flist.some(f=>f.target==='X-31')),'popover injects X-31 stuck');
  xy=await get(()=>__yard.edgeXY('CH02',.6));await p.mouse.click(xy[0],xy[1]);const t2=await p.textContent('#fpop');
  ok(t2.includes('Charger outage')&&t2.includes('Block track'),'clicking CH-02 offers charger outage + block track');
  await p.click('#fpop button[data-i="0"]');
  xy=await get(()=>__yard.crestXY());await p.mouse.click(xy[0],xy[1]);ok((await p.textContent('#fpop')).includes('Retarder failure'),'clicking the crest offers retarder failure');
  await p.click('#fpop button[data-i="0"]');
  await p.keyboard.press('Escape');ok(!(await p.$eval('#mapbox',e=>e.classList.contains('picking'))),'Escape leaves pick mode');
  xy=await get(()=>__yard.edgeXY('B09',.5));await p.mouse.click(xy[0],xy[1],{button:'right'});ok((await p.textContent('#fpop')).includes('Block track'),'right-click B-09 opens the popover without pick mode');
  await p.click('#fpop button[data-i="0"]');
  const vid=await get(()=>{const r=document.getElementById('map').getBoundingClientRect();const v=__yard.S.veh.find(v=>!v.thru&&v.v>0.05&&(()=>{const s=__yard.vehScreen(v.id);return s&&s[0]>r.left+260&&s[0]<r.right-40&&s[1]>r.top+40&&s[1]<r.bottom-100;})());return v&&v.id;});
  if(vid){xy=await get(i=>__yard.vehScreen(i),vid);await p.mouse.click(xy[0],xy[1],{button:'right'});const t3=await p.textContent('#fpop');ok(t3.includes(vid)&&t3.includes('Battery drop'),'right-click a vehicle offers battery drop ('+vid+')');await p.click('#fpop button[data-i="0"]');}
  const n=await get(()=>__yard.S.flist.length);ok(n===6,`6 faults active at once (${(await get(()=>__yard.faults().map(f=>f.label))).join(' · ')})`);
  ok((await p.textContent('#statusChip'))==='6 FAULTS','status chip: 6 FAULTS');
  await get(()=>__yard.advance(15*60));
  const bands=await get(()=>__yard.TLG().bands.map(b=>b.kind));ok(bands.length>=6,'timeline bands: '+bands.join(', '));
  await p.click('#fList button[data-f]');ok(await get(()=>__yard.S.flist.length===5),'row Clear button clears one fault');
  // X-24 preset still works alongside
  await p.click('#faultBtn');ok(await get(()=>__yard.S.faultOn)&&(await p.textContent('#statusChip')).startsWith('X-24 FAULT'),'X-24 preset still triggers alongside others: '+await p.textContent('#statusChip'));
  await p.click('#fClearAll');ok(await get(()=>__yard.S.flist.length===0&&!__yard.S.faultOn)&&(await p.textContent('#faultBtn'))==='Trigger fault','Clear all also clears the preset');
  const q0=await get(()=>{__yard.advance(90*60);return __yard.S.queue;});ok(q0<10,`yard recovers after clearing everything (queue ${q0})`);
  ok(errs.length===0,'no console errors '+JSON.stringify(errs));
  await b.close();
})();
