const { chromium } = require('playwright');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(700);
  const get=(f,a)=>p.evaluate(f,a);
  // build history with a fault jam
  await get(()=>{__yard.advance(30*60);__yard.toggleFault();__yard.advance(60*60);__yard.toggleFault();__yard.advance(20*60);__yard.setParam('rate',24);__yard.advance(20*60);});
  const live=await get(()=>__yard.liveT), H=await get(()=>__yard.hash());
  ok(await get(()=>!__yard.isReplay()),'at live head, not replay; snapshots='+await get(()=>__yard.snaps()));
  // seek back 2h then straight back to live
  const tA=Date.now();await get(t=>__yard.seek(t-7200),live);const ms=Date.now()-tA;
  ok(await get(()=>__yard.isReplay())&&Math.abs(await get(()=>__yard.S.t)-(live-7200))<1,`seek −2 h enters replay (${ms} ms)`);
  ok((await p.textContent('#liveTxt')).startsWith('REPLAY'),'chip shows '+await p.textContent('#liveTxt'));
  ok(await p.isVisible('#replayBar'),'replay banner visible: '+(await p.textContent('#replayBar')).replace(/\s+/g,' '));
  await p.click('#rbGo');
  ok(await get(()=>__yard.S.t)===live&&await get(()=>__yard.hash())===H,'Go live returns to identical live state (no desync)');
  // play forward through replay to live via advance
  await get(t=>__yard.seek(t-5400),live);await get(t=>__yard.advance(t-__yard.S.t),live);
  ok(await get(()=>__yard.hash())===H,'replaying forward from −90 min (across fault-clear + slider events) reproduces the same state hash');
  // random back-and-forth scrubbing
  let bad=0;for(let i=0;i<40;i++){const t=await get(([l,mn])=>{const t=mn+Math.random()*(l-mn);__yard.seek(t);return __yard.S.t;},[live,await get(()=>__yard.minT())]);
    const m=await get(()=>{const S=__yard.S;return S.veh.every(v=>isFinite(v.s)&&v.route&&v.ri<v.route.length);});if(!m)bad++;}
  ok(bad===0,'40 random scrubs: vehicles valid every time');
  await get(t=>__yard.seek(t),live);ok(await get(()=>__yard.hash())===H,'after 40 random scrubs, live state still identical');
  // timeline drag via mouse
  const [x1,y1]=await get(t=>__yard.tlX(t),live-3600);const [x2]=await get(t=>__yard.tlX(t),live-1800);
  await p.mouse.move(x1,y1);await p.mouse.down();await p.mouse.move(x2,y1,{steps:8});await p.mouse.up();
  const ts=await get(()=>__yard.S.t);ok(Math.abs(ts-(live-1800))<120,`dragging the playhead scrubs (T=${(ts/3600).toFixed(2)} h)`);
  await p.mouse.move(x2-40,y1);ok(await p.isVisible('#tltip'),'hover tooltip: '+(await p.textContent('#tltip')));
  // keyboard arrows
  const k0=await get(()=>__yard.S.t);await p.keyboard.press('ArrowLeft');ok(await get(()=>__yard.S.t)===k0-60,'← steps back 1 min');
  await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');ok(await get(()=>__yard.S.t)===k0+60,'→ steps forward 1 min');
  // jam band click jumps to its start
  const band=await get(()=>__yard.TLG().bands.find(b=>b.kind==='X-24 FAULT'));
  const r=await p.$eval('#tl',e=>{const r=e.getBoundingClientRect();return [r.left,r.top];});
  await p.mouse.click(r[0]+band.x0+20,r[1]+__yard_top(await get(()=>__yard.TLG().top)));
  function __yard_top(t){return t+5;}
  ok(Math.abs(await get(()=>__yard.S.t)-band.t)<1&&await get(()=>__yard.S.faultOn),'clicking fault band jumps to fault start; map shows fault');
  // branch on slider change
  const tb=await get(()=>__yard.S.t);await p.$eval('#i-rate',el=>{el.value=25;el.dispatchEvent(new Event('input',{bubbles:true}));});
  ok(await get(()=>__yard.liveT)===tb&&!(await get(()=>__yard.isReplay())),'slider change in replay branches: live head = '+(tb/3600).toFixed(2)+' h, future discarded');
  await p.click('#play');await p.waitForTimeout(1200);await p.click('#play');ok(await get(()=>__yard.S.t)>tb,'Play continues from branch point');
  // Space key
  await p.keyboard.press('Space');ok(await get(()=>__yard.running),'Space plays');await p.keyboard.press('Space');ok(!(await get(()=>__yard.running)),'Space pauses');
  // zoom
  await p.click('#zIn');await p.click('#zIn');ok(Math.abs(await get(()=>__yard.view.z)-1.5625)<.01,'+ button zooms; readout '+await p.textContent('#zPct'));
  await p.keyboard.press('0');ok(await get(()=>__yard.view.z)===1,'0 fits');
  await p.keyboard.press('=');ok(await get(()=>__yard.view.z)>1,'+ key zooms');await p.keyboard.press('-');
  const box=await p.$eval('#map',e=>{const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];});
  await p.mouse.move(box[0],box[1]);for(let i=0;i<5;i++)await p.mouse.wheel(0,-200);await p.waitForTimeout(100);
  ok(await get(()=>__yard.view.z)>2,'wheel zoom → '+await p.textContent('#zPct'));
  await get(()=>__yard.zoomTo(9));ok(await get(()=>__yard.view.z)===4,'clamped at 400%');
  await get(()=>__yard.zoomTo(.1));ok(await get(()=>__yard.view.z)===.75,'clamped at 75%');
  // pan by drag
  await get(()=>__yard.zoomTo(2.5));const cx0=await get(()=>__yard.view.cx);
  await p.mouse.move(box[0],box[1]+150);await p.mouse.down();await p.mouse.move(box[0]+120,box[1]+150,{steps:6});await p.mouse.up();
  ok(await get(()=>__yard.view.cx)<cx0-10,'drag on map pans');
  ok(await p.isVisible('#mini'),'minimap visible above 150%');
  const mb=await p.$eval('#mini',e=>{const r=e.getBoundingClientRect();return [r.left+r.width*0.2,r.top+r.height/2];});
  await p.mouse.click(mb[0],mb[1]);ok(await get(()=>__yard.view.cx)<cx0-100,'minimap click recenters');
  // zoom on bowl and select a vehicle
  await get(()=>{__yard.advance(600);__yard.centerOn(800,340);});
  const vid=await get(()=>{const r=document.getElementById('map').getBoundingClientRect();for(const v of __yard.S.veh){const s=__yard.vehScreen(v.id);if(s&&s[0]>r.left+80&&s[0]<r.right-260&&s[1]>r.top+60&&s[1]<r.bottom-40)return v.id;}return null;});
  const sp=await get(id=>__yard.vehScreen(id),vid);await p.mouse.click(sp[0],sp[1]);
  ok(vid&&(await get(()=>__yard.selected&&__yard.selected.id))===vid,`click-select at 250%: ${vid}`);
  ok((await p.textContent('#dossier')).includes(vid),'dossier shows it');
  ok(errs.length===0,'no console errors '+JSON.stringify(errs));
  await b.close();
})();
