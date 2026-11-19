const { chromium } = require('playwright');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(700);
  const get=(f,a)=>p.evaluate(f,a);
  // 1. paused initially, play moves vehicles
  const t0=await get(()=>__yard.S.t);
  const pos0=await get(()=>Object.fromEntries(__yard.S.veh.map(v=>[v.id,v.route[v.ri]+':'+v.s.toFixed(2)])));
  await p.waitForTimeout(600);ok(await get(()=>__yard.S.t)===t0,'sim is paused on load (clock frozen)');
  await p.click('#play');await p.waitForTimeout(2500);
  ok(await get(()=>__yard.running),'Play button starts the sim');
  const t1=await get(()=>__yard.S.t);ok(t1>t0+100,`clock advanced ${((t1-t0)/60).toFixed(1)} sim-min in 2.5 s at 4x`);
  const moved=await get(p0=>__yard.S.veh.filter(v=>p0[v.id]&&p0[v.id]!==v.route[v.ri]+':'+v.s.toFixed(2)).length,pos0);
  ok(moved>3,`${moved} vehicles moved after Play`);
  ok((await p.textContent('#clock'))!=='T+01:30:00','clock label updates: '+await p.textContent('#clock'));
  // 2. pause / step / speed
  await p.click('#play');const tp=await get(()=>__yard.S.t);await p.waitForTimeout(500);ok(await get(()=>__yard.S.t)===tp,'Pause freezes the clock');
  await p.click('#stepBtn');ok(Math.abs(await get(()=>__yard.S.t)-tp-60)<1,'Step advances exactly 1 sim-min');
  await p.click('#speedSeg button[data-s="16"]');await p.click('#play');await p.waitForTimeout(1000);await p.click('#play');
  const t16=await get(()=>__yard.S.t);ok(t16-tp>150,`16x runs fast (${((t16-tp)/60).toFixed(1)} sim-min in ~1 s)`);
  // 3. sliders via real input
  const setRange=async(sel,val)=>{await p.$eval(sel,(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},val);};
  await setRange('#i-rate',30);ok(await get(()=>__yard.P.rate)===30,'arrival slider updates sim param ('+await p.textContent('#o-rate')+')');
  await setRange('#i-size',10);ok(await get(()=>__yard.P.size)===10,'platoon size slider live');
  await setRange('#i-hump',2);ok(await get(()=>__yard.P.hump)===2,'hump speed slider live');
  await setRange('#i-soc',40);ok(await get(()=>__yard.P.socThr)===40,'SoC threshold slider live');
  await p.click('#ruleSeg button[data-r="fifo"]');ok(await get(()=>__yard.P.rule)==='fifo','sort rule segment live');
  const sp0=await get(()=>{const S=__yard.S;return S.pending.length+S.veh.filter(v=>v.state==='inbound').length+S.processed+S.sorted;});
  await get(()=>__yard.advance(3600));
  const after=await get(()=>{const S=__yard.S;return {inb:S.pending.length+S.veh.filter(v=>v.state==='inbound').length,q:S.queue,newPl:Object.values(S.pl).filter(q=>q.kind==='in').map(q=>q.veh.length),ch:S.veh.filter(v=>v.state==='charging').length,fifo:__yard.TRACKS.filter(T=>T.key==='FIFO').length};});
  ok(after.q>=10,`arrival 30/hr + hump 2 km/h builds a queue (${after.q} veh)`);
  ok(after.newPl.includes(10),'new platoons use size 10');ok(after.fifo>0,`FIFO rule keys ${after.fifo} bowl tracks`);
  ok(after.ch>0,`SoC 40% threshold diverts ${after.ch} vehicles to charging`);
  await p.click('#defaultsBtn');ok(await get(()=>__yard.P.rate===8&&__yard.P.rule==='dest'),'Defaults resets variables');
  // 4. reset
  await p.click('#resetBtn');ok(Math.abs(await get(()=>__yard.S.t)-5400)<1&&await get(()=>!__yard.running),'Reset restores the T+01:30 warm start, paused');
  // 5. fault
  await p.click('#faultBtn');ok(await get(()=>__yard.S.faultOn),'Trigger fault fails X-24');
  ok((await p.textContent('#faultBtn'))==='Clear fault','fault button flips to Clear fault');
  const qf=await get(()=>{__yard.advance(1500);return {q:__yard.S.queue,jam:__yard.S.jamOn,hold:__yard.S.crestHold};});
  ok(qf.q>=10&&qf.jam,`fault jams the yard after 25 min (queue ${qf.q}, hump hold ${qf.hold})`);
  ok((await p.textContent('#statusChip'))==='X-24 FAULT','status chip shows X-24 FAULT');
  const reach=await get(()=>{__yard.advance(1800);return __yard.TRACKS.filter(T=>T.assigned>0).map(T=>T.id);});
  console.log('   tracks in use 55 min into fault:',reach.join(' '));
  const bad=await get(()=>__yard.S.veh.filter(v=>v.state==='rolling'&&v.target&&v.target.k>3&&v.route.slice(v.ri).some(e=>e==='Bd3'||e==='Bd4')).length);
  ok(bad===0,'no new cuts routed through X-24 while failed');
  await p.click('#faultBtn');ok(await get(()=>!__yard.S.faultOn),'Clear fault restores X-24');
  // 6. selection by real click
  await p.click('#resetBtn');await p.click('#play');await p.waitForTimeout(800);await p.click('#play');
  ok(await get(()=>{__yard.select&&0;return getComputedStyle(document.getElementById('dossier')).display==='none';}),'no dossier box while nothing is selected');
  const vid=await get(()=>{const v=__yard.S.veh.find(v=>v.state==='classified')||__yard.S.veh[0];return v.id;});
  const xy=await get(id=>__yard.vehScreen(id),vid);await p.mouse.click(xy[0],xy[1]);await p.waitForTimeout(200);
  const sel=await get(()=>__yard.selected);ok(sel&&sel.type==='veh','clicking a vehicle selects it ('+(sel&&sel.id)+')');
  const dz=await p.textContent('#dossier');ok(/SoC/.test(dz)&&/DEST BLOCK/.test(dz)&&/TRACK/.test(dz)&&/STATE/.test(dz),'dossier shows ID/SoC/block/track/state');
  ok(await get(()=>getComputedStyle(document.getElementById('dossier')).display!=='none'),'dossier appears once something is selected');
  await p.keyboard.press('Escape');ok(await get(()=>getComputedStyle(document.getElementById('dossier')).display==='none'),'Escape deselects and hides the dossier');
  console.log('ERRORS',errs);ok(errs.length===0,'no console errors or warnings');
  await b.close();
})();
