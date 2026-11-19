const { chromium } = require('playwright');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
const near=(a,b,e=0.051)=>Math.abs(a-b)<=e;
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  const load=async()=>{await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(600);await p.click('#viewSeg button[data-v="asm"]');await p.waitForTimeout(150);};
  const get=(f,a)=>p.evaluate(f,a);
  const center=async sel=>{const r=await p.locator(sel).first().boundingBox();return [r.x+r.width/2,r.y+r.height/2];};
  const drag=async(from,to,dx=0)=>{const a=await center(from);const z=typeof to==='string'?await center(to):to;await p.mouse.move(a[0],a[1]);await p.mouse.down();
    await p.mouse.move(a[0]+8,a[1]+4,{steps:2});await p.mouse.move(z[0]+dx,z[1],{steps:8});await p.mouse.up();await p.waitForTimeout(80);};
  await load();
  // ---------- 1. constraint math = Figma math note (203:3103) ----------
  let r=await get(()=>{const A=__asm,pl=A.plan(),c=A.planChecks(pl);return {len:c.length,tare:c.tare,cargo:c.cargoT,gross:c.gross,brake:c.brake,mx:c.mx.id,ax:c.mx.axle,axp:c.mx.axlePct,
    nV:c.nV,nW:c.nW,kinds:c.issues.map(i=>i.sev+':'+i.kind),bf:c.bf,haz:c.haz.map(([a,b])=>c.ok[a].id+'/'+c.ok[b].id),reef:c.reefKW,arr:c.ma.arr,ma:c.ma.id,over:c.issues[0].cars,f:c.front,rr:c.rear};});
  ok(near(r.len,181.5)&&r.tare===175&&r.cargo===318&&r.gross===493,`PL-52: 181.5 m, 175 tare + 318 cargo = 493 t (${r.len}, ${r.tare}+${r.cargo}=${r.gross})`);
  ok(Math.round(r.brake)===12,`brake margin (560−493)/560 = 12% (${r.brake.toFixed(2)})`);
  ok(r.mx==='PV-0611'&&near(r.ax,13.75)&&Math.round(r.axp)===98,`max axle PV-0611 13.75 t = 98% (${r.ax}, ${r.axp.toFixed(1)}%)`);
  ok(r.nV===3&&r.nW===2&&r.kinds.join()==='v:length,v:block,v:haz,w:batt,w:axlew',`3 violations + 2 warnings: ${r.kinds.join(' ')}`);
  ok(r.bf.join()==='PV-0618'&&r.haz.join()==='PV-0590/PV-0597'&&r.over.join()==='PV-0702',`block PV-0618 #4, hazmat 0590/0597, over-length car PV-0702`);
  ok(near(r.reef,6.3)&&r.ma==='PV-0533'&&Math.round(r.arr)===-2,`reefers 6.3 kW; PV-0533 18−9−11 = −2% (${r.arr.toFixed(2)})`);
  ok(r.f===261&&r.rr===232,`front six 261 t, rear six 232 t (${r.f}/${r.rr})`);
  r=await get(()=>{const A=__asm,pl=A.plan(),s=A.suggest(pl);return {d:s.changes.map(x=>x.desc),len:s.after.length,g:s.after.gross,br:s.after.brake,v:s.after.nV,w:s.after.nW};});
  ok(r.d.length===5&&/Drop PV-0702/.test(r.d[0])&&/PV-0618 to #5, behind PV-0526/.test(r.d[1])&&/PV-0533 for PV-0640 \(81%\)/.test(r.d[2])&&/PV-0597 with PV-0604/.test(r.d[3])&&/SHP-4436 to 36 t \(52 t, 13.0 t/.test(r.d[4]),`suggested plan = Figma's 5 changes: ${r.d.join(' | ')}`);
  ok(near(r.len,164.2)&&r.g===437&&Math.round(r.br)===22&&r.v===0&&r.w===0,`after: 164.2 m, 437 t, 22% brake, 0/0 (${r.len}, ${r.g}, ${r.br.toFixed(1)})`);
  // ---------- 2. UI shows it; violations block send ----------
  r=await get(()=>({g:[...document.querySelectorAll('#gauges .gv')].map(e=>e.textContent),send:document.getElementById('sendBtn').disabled,sk:document.querySelector('#sendBar .sk').textContent,
    iss:document.querySelectorAll('#sideMain .iss').length,fix:document.querySelectorAll('#sideMain .fix').length,cars:document.querySelectorAll('#strip .car').length}));
  ok(r.g[0]==='181.5 / 172 m'&&r.g[1]==='493 / 560 t'&&r.g[2]==='13.75 / 14.0 t'&&r.g[3]==='12%',`gauges: ${r.g.join(' · ')}`);
  ok(r.send&&r.sk==='Resolve 3 violations and 2 warnings to send',`violations block Send: "${r.sk}"`);
  ok(r.iss===5&&r.fix===5&&r.cars===12,`checks list 5 issues, each with a fix; 12 cars on the strip`);
  // cargo editor: trim PV-0611 to 36 t → Figma B effect
  await p.click('.car[data-car="PV-0611"]');await p.waitForTimeout(100);
  r=await get(()=>({open:document.getElementById('cedit').classList.contains('open'),dis:[...document.querySelectorAll('#cedit [data-et]')].filter(b=>!b.disabled).map(b=>b.dataset.et).join(),ml:document.getElementById('eLoad').max}));
  ok(r.open&&r.dis==='grain,aggr,haz'&&r.ml==='40',`editor opens; hopper allows only grain/aggregates/hazmat (${r.dis}); max load 40 t`);
  for(let i=0;i<6;i++)await p.click('#cedit [data-es="-0.5"]');
  r=await get(()=>[...document.querySelectorAll('#cedit .eff tr')].map(t=>[...t.cells].map(c=>c.textContent).join(' ').replace(/\s+/g,' ').trim()));
  ok(/Gross 55 t → 52 t/.test(r[0])&&/13.75 t · 98% → 13.0 t · 93%/.test(r[1])&&/493 t → 490 t/.test(r[2])&&/12.0% → 12.5%/.test(r[3])&&/232 t → 229 t/.test(r[4]),`editor effect matches Figma B: ${r.slice(0,5).join(' | ')}`);
  await p.click('#eApply');await p.waitForTimeout(80);
  r=await get(()=>{const A=__asm,S=__yard.S,c=A.planChecks(A.plan());return {t:S.asm.cargo['PV-0611'].t,q:S.asm.queue.find(q=>q.id==='SHP-4436'),nW:c.nW};});
  ok(r.t===36&&r.q&&r.q.t===3&&r.nW===1,`apply: PV-0611 36 t, 3 t of SHP-4436 back in the queue, axle warning cleared`);
  // bulk edit: 0471/0488/0604 → 26 t
  await p.click('.car[data-car="PV-0471"]',{modifiers:['Shift']});await p.click('.car[data-car="PV-0488"]',{modifiers:['Shift']});await p.click('.car[data-car="PV-0604"]',{modifiers:['Shift']});
  r=await get(()=>({h:document.querySelector('.bulk h3').textContent,v:document.getElementById('bLoad').value,eff:[...document.querySelectorAll('.bulk .eff tr')].map(t=>t.textContent.replace(/\s+/g,' ').trim())}));
  ok(r.h==='3 cars selected'&&r.v==='26 t'&&/490 t → 491 t/.test(r.eff[3]),`bulk panel: ${r.h}, 26 t per car, ${r.eff[3]}`);
  await p.click('#bApply');await p.waitForTimeout(60);
  r=await get(()=>{const S=__yard.S;return ['PV-0471','PV-0488','PV-0604'].map(id=>S.asm.cargo[id].t).join();});
  ok(r==='26,26,26','bulk apply sets 26 t on 3 cars');
  // ---------- 3. drag to reorder + issue fix buttons ----------
  await load();
  await drag('.car[data-car="PV-0618"]','.car[data-car="PV-0533"]',-20);
  r=await get(()=>{const pl=__asm.plan();return {i:pl.cars.indexOf('PV-0618'),bf:__asm.planChecks(pl).bf.length};});
  ok(r.i===4&&r.bf===0,`drag PV-0618 behind PV-0526 → #5, block order clean (idx ${r.i})`);
  await p.click('#sideMain .iss[data-kind="haz"] .fix');
  r=await get(()=>{const pl=__asm.plan(),c=__asm.planChecks(pl);return {haz:c.haz.length,nV:c.nV,i:pl.cars.indexOf('PV-0597')};});
  ok(r.haz===0&&r.nV===1,`hazmat fix button swaps 0597/0604 (violations left ${r.nV})`);
  // drag a car out onto the drawer → removed
  await drag('.car[data-car="PV-0702"]','#drBody');
  r=await get(()=>{const pl=__asm.plan(),c=__asm.planChecks(pl);return {n:pl.cars.length,nV:c.nV,len:c.length};});
  ok(r.n===11&&r.nV===0&&near(r.len,164.2),`drag PV-0702 to the drawer removes it: 11 cars, ${r.len} m, 0 violations`);
  // spare drag onto the strip
  await drag('#drBody tr[data-id="PV-0655"]','.car[data-car="PV-0471"]',-30);
  r=await get(()=>{const pl=__asm.plan(),c=__asm.planChecks(pl);return {i:pl.cars.indexOf('PV-0655'),len:c.length,nV:c.nV};});
  ok(r.i===0&&near(r.len,181.5)&&r.nV>=1,`drag spare PV-0655 to the front: back to ${r.len} m, length violation returns`);
  await p.keyboard.press('Escape');
  // ---------- 4. shipment drag + auto-assign ----------
  await load();
  await p.click('#sendBar #applySug');await p.waitForTimeout(80);
  r=await get(()=>{const pl=__asm.plan(),c=__asm.planChecks(pl);return {n:pl.cars.length,g:c.gross,nV:c.nV,nW:c.nW,open:c.open.map(s=>s.id),q:__yard.S.asm.queue.map(q=>q.id).sort().join()};});
  ok(r.n===11&&r.g===437&&r.nV===0&&r.nW===1&&r.open.join()==='SHP-4425',`apply suggested: 11 cars, 437 t, 0 V, 1 W (open SHP-4425)`);
  ok(r.q==='SHP-4425,SHP-4436,SHP-4440,SHP-4446,SHP-4451,SHP-4458,SHP-4463',`queue gains SHP-4425/4436/4440 (${r.q})`);
  await p.click('.dr-tabs button[data-t="queue"]');
  // incompatible drop: 20' reefer container onto a hopper → refused
  await drag('#drBody tr[data-id="SHP-4425"]','.car[data-car="PV-0512"]');
  r=await get(()=>__yard.S.asm.cargo['PV-0512'].shp);ok(r==='SHP-4417','drop on an incompatible / loaded car is refused');
  // warnings require confirm
  r=await get(()=>({t:document.getElementById('sendBtn').textContent,d:document.getElementById('sendBtn').disabled}));
  ok(r.t==='Send with 1 warning'&&!r.d,`warnings don't block: "${r.t}"`);
  await p.click('#sendBtn');r=await get(()=>({c:!!document.querySelector('#sendBar .conf'),st:__asm.plan().status}));
  ok(r.c&&r.st==='draft','Send with warnings asks to confirm first (still draft)');
  await p.click('#confBack');
  await p.click('#aaRun');await p.waitForTimeout(60);
  r=await get(()=>({h:document.querySelector('.aap .ah').textContent,rows:[...document.querySelectorAll('.aap .ar')].map(e=>[...e.children].map(c=>c.textContent).join(' ').replace(/\s+/g,' ').trim())}));
  ok(/1 placed · 4 held/.test(r.h)&&/437 → 460 t/.test(r.h),`auto-assign preview: ${r.h}`);
  ok(/SHP-4425 → PV-0640 · 37 t gross · 9.25 t per axle.*61%/.test(r.rows[0]),`placed: ${r.rows[0]}`);
  ok(r.rows.some(x=>/SHP-4451.*Cl 8 needs a buffer from PV-0590 \(Cl 3\) and PV-0597 \(Cl 5.1\)/.test(x))&&r.rows.some(x=>/SHP-4440.*PV-0702\) would push PL-52 back to 181.5 m/.test(x))&&r.rows.some(x=>/SHP-4436.*under the 5 t minimum/.test(x)),'held with plain reasons (hazmat buffer, length, 5 t minimum)');
  await p.click('#aaApply');
  r=await get(()=>{const c=__asm.planChecks(__asm.plan());return {g:c.gross,nW:c.nW,car:__yard.S.asm.cargo['PV-0640'].shp,t:document.getElementById('sendBtn').textContent};});
  ok(r.car==='SHP-4425'&&r.g===460&&r.nW===0&&r.t==='Send to yard',`apply: SHP-4425 on PV-0640, 460 t, clean → "${r.t}"`);
  // shipment drag onto an empty car (fresh load: unload PV-0640 then drag it back)
  await get(()=>__asm.commit((S,pl)=>{const c=S.asm.cargo['PV-0640'];S.asm.queue.push({id:c.shp,desc:"20' reefer container",type:'i20',dest:'MEM',t:23,due:8400,reefer:true});S.asm.cargo['PV-0640']=null;}));
  await drag('#drBody tr[data-id="SHP-4425"]','.car[data-car="PV-0640"]');
  r=await get(()=>{const c=__yard.S.asm.cargo['PV-0640'];return c&&c.shp+':'+c.t+':'+c.reefer;});
  ok(r==='SHP-4425:23:true',`drag shipment onto PV-0640 loads it (${r})`);
  // ---------- 5. send → pull → depart at the set time ----------
  await p.click('#sendBtn');
  r=await get(()=>{const Y=__yard,pl=__asm.plan();const log=[];let st='',mf=0;const V=id=>Y.S.veh.find(v=>v.id===id);const s0={r:V('PV-0640').soc,n:V('PV-0604').soc};let s1=null;
    for(let i=0;i<120&&pl.status!=='departed';i++){Y.advance(60);if(pl.status!==st){st=pl.status;log.push(st+'@'+__asm.clk(Y.S.t));}const q=Y.S.pl['PL-52'];if(q)for(const v of q.veh)mf=Math.max(mf,v.massF||0);
      if(pl.status==='departing'&&!s1&&V('PV-0640'))s1={r:V('PV-0640').soc,n:V('PV-0604').soc,rf:V('PV-0640').reefer};}
    return {log,st:pl.status,act:pl.actualT,dep:pl.dep,mf,left:pl.cars.filter(id=>Y.S.veh.some(v=>v.id===id)).length,dr:s0.r-s1.r,dn:s0.n-s1.n,rf:s1.rf};});
  ok(r.st==='departed'&&r.act>=r.dep&&r.act-r.dep<120&&r.left===0,`sent plan departs D-02 at ${r.act/60|0} min (set ${r.dep/60}): ${r.log.join(' → ')}`);
  const reefRun=async kw=>{await load();return get(kw=>{const A=__asm,Y=__yard;A.applySuggested();for(const p of A.autoAssign(A.plan()).placed)A.assign(p.shp.id,p.car);A.commit(S=>{S.asm.rules.reeferKW=kw;});A.send();
    const pl=A.plan();let soc=null,rf=false;for(let i=0;i<200&&pl.status!=='departing';i++){Y.advance(30);const v=Y.S.veh.find(x=>x.id==='PV-0640');if(v){soc=v.soc;rf=rf||!!v.reefer;}}return {soc,rf};},kw);};
  const ra=await reefRun(2.1),rb=await reefRun(0);
  ok(ra.rf&&rb.soc-ra.soc>0.05,`reefer draw while moving: PV-0640 ends ${(rb.soc-ra.soc).toFixed(2)}% lower with a 2.1 kW reefer than with none`);
  ok(r.mf>0.8,`heavier train: mass factor ${r.mf.toFixed(2)} slows acceleration`);
  // ---------- 6. a fault delays the plan; the strip shows it ----------
  await load();
  r=await get(()=>{const A=__asm,Y=__yard;A.applySuggested();const pl=A.plan();const a=A.autoAssign(pl);A.commit((S,pl)=>{for(const p of a.placed){}});
    for(const p of a.placed)A.assign(p.shp.id,p.car);const fid=Y.inject({type:'track',target:'D02'});A.send();
    Y.advance(pl.dep-Y.S.t+600);A.render();const late=document.querySelector('.sl-bar.late');const wait=pl.wait;Y.clearFault(fid);
    for(let i=0;i<90&&pl.status!=='departed';i++)Y.advance(60);return {late:late&&late.textContent,wait,st:pl.status,delay:(pl.actualT-pl.dep)/60};});
  ok(r.late&&/\+10 min/.test(r.late)&&/blocked/i.test(r.wait),`blocked D-02 delays PL-52; strip shows "${r.late}"`);
  ok(r.st==='departed'&&r.delay>=10,`after the fault clears it departs ${r.delay.toFixed(1)} min late`);
  // ---------- 7. reefer draw while moving ----------
  // ---------- 8. replay determinism + editing in replay branches ----------
  await load();
  r=await get(()=>{const A=__asm,Y=__yard;const t0=Y.S.t;Y.advance(300);A.applySuggested();Y.advance(300);for(const p of A.autoAssign(A.plan()).placed)A.assign(p.shp.id,p.car);Y.advance(120);A.send();
    Y.advance(2400);const h1=Y.hash(),T=Y.S.t,st1=A.plan().status;Y.seek(t0+60);const back=A.plan().status+'/'+A.plan().cars.length;Y.seek(T);const h2=Y.hash();
    return {same:h1===h2,back,st1,st2:A.plan().status};});
  ok(r.same&&r.back==='draft/12',`scrub back (plan ${r.back}) and forward: identical state hash, plan ${r.st1} → ${r.st2}`);
  r=await get(()=>{const A=__asm,Y=__yard;const T=Y.liveT;Y.seek(Y.minT()+600);const was=Y.isReplay();A.commit((S,pl)=>{S.asm.rules.axle=13.5;});return {was,now:Y.isReplay(),live:Y.liveT<T,axle:Y.S.asm.rules.axle,cars:A.plan().cars.length};});
  ok(r.was&&!r.now&&r.live&&r.axle===13.5,`editing during REPLAY branches the run (live moves back; edit kept)`);
  // ---------- 9. rules are tweakable variables ----------
  await load();
  await p.click('#rulesBtn');
  r=await get(()=>{const el=document.getElementById('r-axle');el.value=13.5;el.dispatchEvent(new Event('input',{bubbles:true}));const c=__asm.planChecks(__asm.plan());return {k:c.issues.filter(i=>i.kind==='axle').map(i=>i.cars[0]),sum:document.getElementById('rulesSum').textContent};});
  ok(r.k.join()==='PV-0611'&&r.sum==='1 changed',`axle limit 13.5 t turns PV-0611 into a violation (${r.sum})`);
  r=await get(()=>{const A=__asm;A.commit(S=>{S.asm.rules.reeferKW=0.5;S.asm.rules.axle=14;});const c=A.planChecks(A.plan());return c.issues.filter(i=>i.kind==='batt').length;});
  ok(r===1,'reefer draw 0.5 kW: PV-0533 still under the 25% floor (warning stays)');
  r=await get(()=>{const A=__asm;A.commit(S=>{S.asm.rules.floor=15;});const c=A.planChecks(A.plan());return c.issues.filter(i=>i.kind==='batt').length;});
  ok(r===0,'floor 15% + 0.5 kW reefer: PV-0533 battery warning clears');
  r=await get(()=>{const A=__asm;A.commit(S=>{S.asm.rules.haz='buffer';});return A.planChecks(A.plan()).issues.filter(i=>i.kind==='hazend').length;});
  ok(r===0,'end-buffer hazmat rule: no hazmat car at an end of PL-52');
  // new plan from live inventory
  r=await get(()=>{const A=__asm;A.newPlan();const pl=A.plan();return {id:pl.id,n:pl.cars.length,sp:document.querySelectorAll('#drBody tr[data-drag="spare"]').length,d:pl.dtrack};});
  ok(/^PL-5\d$/.test(r.id)&&r.n===0&&r.sp>0&&r.d!=='D02',`new plan ${r.id} on ${r.d}, ${r.sp} spares offered from live inventory`);
  // yard view still works after switching back
  await p.click('#viewSeg button[data-v="yard"]');r=await get(()=>getComputedStyle(document.getElementById('left')).display!=='none'&&getComputedStyle(document.getElementById('asm')).display==='none');
  ok(r,'switch back to Yard view');
  ok(errs.length===0,'no console errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close();
})();
