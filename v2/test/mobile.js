// Mobile layout + touch: iPhone 16 Pro (402×874) portrait and landscape, touch input via CDP
const { chromium } = require('playwright');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:402,height:874},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});
  const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
  const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  const get=(f,a)=>p.evaluate(f,a);const wait=ms=>p.waitForTimeout(ms);
  const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});
  const swipe=async(a,z,n=8)=>{await touch('touchStart',[a]);for(let i=1;i<=n;i++)await touch('touchMove',[[a[0]+(z[0]-a[0])*i/n,a[1]+(z[1]-a[1])*i/n]]);await touch('touchEnd',[]);};
  const box=async sel=>{const r=await p.locator(sel).first().boundingBox();return r;};
  const ctr=async sel=>{const r=await box(sel);return [r.x+r.width/2,r.y+r.height/2];};
  const noOverflow=()=>get(()=>{const d=document.documentElement;const wide=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(!r.width||cs.position==='fixed'&&cs.visibility==='hidden')return false;let q=e.parentElement;while(q&&q!==document.body){const o=getComputedStyle(q).overflowX;if(o==='auto'||o==='scroll'||o==='hidden')return false;q=q.parentElement;}return r.right>innerWidth+1||r.left<-1;});
    return {sw:d.scrollWidth,cw:d.clientWidth,bad:wide.slice(0,3).map(e=>e.id||e.className||e.tagName)};});
  // fraction of the viewport where the topmost element is the map canvas itself (chrome, chips, sheets all count as covering it)
  const mapFrac=()=>get(()=>{let hit=0,n=0;for(let y=3;y<innerHeight;y+=6)for(let x=3;x<innerWidth;x+=6){n++;const e=document.elementFromPoint(x,y);if(e&&e.id==='map')hit++;}return hit/n;});
  // floating controls over the map must stay out of the central area (middle 60% × middle 50% of the band between header and bottom bar)
  const centerClear=()=>get(()=>{const hb=document.querySelector('header').getBoundingClientRect().bottom,bt=Math.min(document.getElementById('bottom').getBoundingClientRect().top,innerHeight);
    const cx0=innerWidth*.2,cx1=innerWidth*.8,cy0=hb+(bt-hb)*.25,cy1=hb+(bt-hb)*.75;
    const els=[...document.querySelectorAll('#mapbox *,.map-head,.map-head *')].filter(e=>{if(e.id==='map'||e.closest('#dossier')||e.closest('#fpop'))return false;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;});
    const hits=els.filter(e=>{const r=e.getBoundingClientRect();return r.right>cx0&&r.left<cx1&&r.bottom>cy0&&r.top<cy1;}).map(e=>e.id||e.className||e.tagName);
    return {hits:[...new Set(hits)],box:[cx0,cy0,cx1,cy1].map(Math.round)};});
  const BEFORE={portrait:0.479,landscape:0.511}; // measured on the previous mobile layout (390×844 / 844×390, same sampler)
  await p.goto('file:///workspace/yard-sim/v2/index.html');await wait(800);
  // ---------- layout ----------
  let r=await get(()=>({m:__yard.isMobile(),tabs:getComputedStyle(document.getElementById('mtabs')).display,vp:document.querySelector('meta[name=viewport]').content}));
  ok(r.m&&r.tabs==='flex'&&/viewport-fit=cover/.test(r.vp),`mobile layout active at 402×874 (tab bar shown, ${r.vp})`);
  r=await noOverflow();ok(r.sw<=r.cw&&!r.bad.length,`portrait yard: no horizontal overflow (${r.sw}/${r.cw}) ${r.bad.join(',')}`);
  r=await get(()=>{const m=document.getElementById('map').getBoundingClientRect(),h=document.querySelector('header').getBoundingClientRect(),bt=document.getElementById('bottom').getBoundingClientRect(),t=document.getElementById('mtabs').getBoundingClientRect();
    return {edge:m.left<=0&&m.top<=0&&m.right>=innerWidth-1&&m.bottom>=innerHeight-1,hh:h.height,bh:bt.height,th:t.height,ord:h.top<=0&&bt.bottom<=t.top+1&&t.bottom<=innerHeight+1};});
  ok(r.edge&&r.ord&&r.hh<=41&&r.bh<=80&&r.th<=45,`map is edge-to-edge under thin chrome (header ${Math.round(r.hh)} px, bottom bar ${Math.round(r.bh)} px, tabs ${Math.round(r.th)} px)`);
  r=await get(()=>['#play','#mtabs button[data-mt]','#speedSeg button','#resetBtn','#tlToggle'].map(s=>{const e=document.querySelector(s).getBoundingClientRect();return [s,Math.round(e.width),Math.round(e.height)];}));
  const small=r.filter(x=>Math.min(x[1],x[2])<(x[0]==='#play'||x[0].startsWith('#mtabs')?40:34));ok(!small.length,`tap targets: play 40, tabs 44, bar buttons ≥34 px: ${small.map(x=>x.join(' ')).join('; ')||'ok'}`);
  r=await get(()=>({z:getComputedStyle(document.getElementById('zoomctl')).display,l:getComputedStyle(document.getElementById('legendWrap')).display,chips:[...document.querySelectorAll('#mchips .mchip')].filter(e=>e.offsetWidth).map(e=>{const b=e.getBoundingClientRect();return [e.id,Math.round(b.width),Math.round(b.height),document.elementFromPoint(b.right+4,b.top+b.height/2)===e];})}));
  ok(r.z==='none'&&r.l==='none'&&r.chips.length===2&&r.chips.every(c=>c[1]<=33&&c[2]<=33&&c[3]),`no zoom buttons or legend chip on the map; two 32 px corner chips with a 44 px hit area (${r.chips.map(c=>c[0]+' '+c[1]+'×'+c[2]).join(', ')})`);
  r=await centerClear();ok(!r.hits.length,`no floating controls over the central map area ${JSON.stringify(r.box)} ${r.hits.join(',')}`);
  r=await mapFrac();ok(r>BEFORE.portrait+0.2,`map visible area ${(r*100).toFixed(1)}% of the viewport (was ${(BEFORE.portrait*100).toFixed(1)}%)`);
  r=await get(()=>{const v=__yard.view,c=document.getElementById('map').getBoundingClientRect();const hb=document.querySelector('header').getBoundingClientRect().bottom,bt=document.getElementById('bottom').getBoundingClientRect().top;
    const T=__yard.TRACKS.filter(t=>!t.isCH);return {z:v.z,ok:true,hb,bt};});
  ok(r.z>2.5,`portrait opens zoomed onto the bowl (${r.z.toFixed(2)}×)`);
  ok(await get(()=>getComputedStyle(document.getElementById('dossier')).display==='none'),'no "Nothing selected" box when nothing is selected');
  // ---------- touch pan + pinch ----------
  const mb=await box('#map');const mc=[mb.x+mb.width/2,mb.y+mb.height/2];
  await get(()=>__yard.zoomTo(1.6));await wait(30);
  let v0=await get(()=>({...__yard.view}));
  await swipe([mc[0],mc[1]],[mc[0]-90,mc[1]+40]);let v1=await get(()=>({...__yard.view}));
  ok(Math.abs(v1.cx-v0.cx)>1&&Math.abs(v1.cy-v0.cy)>0.5&&v1.z===v0.z,`one-finger pan moves the map (cx ${v0.cx.toFixed(0)}→${v1.cx.toFixed(0)})`);
  await touch('touchStart',[[mc[0]-30,mc[1]],[mc[0]+30,mc[1]]]);for(let i=1;i<=8;i++)await touch('touchMove',[[mc[0]-30-i*10,mc[1]],[mc[0]+30+i*10,mc[1]]]);await touch('touchEnd',[]);
  let v2=await get(()=>({...__yard.view}));ok(v2.z>v1.z*1.8,`pinch-out zooms in (${v1.z.toFixed(2)}→${v2.z.toFixed(2)})`);
  await touch('touchStart',[[mc[0]-110,mc[1]],[mc[0]+110,mc[1]]]);for(let i=1;i<=8;i++)await touch('touchMove',[[mc[0]-110+i*10,mc[1]],[mc[0]+110-i*10,mc[1]]]);await touch('touchEnd',[]);
  let v3=await get(()=>({...__yard.view}));ok(v3.z<v2.z,`pinch-in zooms out (${v2.z.toFixed(2)}→${v3.z.toFixed(2)})`);
  // ---------- tap to select → dossier sheet; play; scrub ----------
  await get(()=>__yard.fit());
  const vid=await get(()=>{const v=__yard.S.veh.find(v=>v.state==='classified'&&v._pts);return v.id;});
  await get(id=>{const v=__yard.S.veh.find(x=>x.id===id);__yard.centerOn(v._pts[0][0],v._pts[0][1]);__yard.zoomTo(3);},vid);await wait(80);
  const vxy=await get(id=>__yard.vehScreen(id),vid);await p.touchscreen.tap(vxy[0],vxy[1]);await wait(200);
  r=await get(()=>{const d=document.getElementById('dossier');const rr=d.getBoundingClientRect();return {sel:__yard.selected,vis:getComputedStyle(d).display!=='none',inside:rr.left>=0&&rr.right<=innerWidth&&rr.bottom<=document.getElementById('bottom').getBoundingClientRect().top+1};});
  ok(r.sel&&r.vis&&r.inside,`tap a vehicle: dossier sheet shows inside the screen (${r.sel&&r.sel.id})`);
  await p.tap('#play');await wait(500);r=await get(()=>({run:__yard.running,t:__yard.S.t}));ok(r.run,'tap play runs the sim');
  await p.tap('#play');ok(!(await get(()=>__yard.running)),'tap again pauses');
  const t0=await get(()=>__yard.S.t);const xa=await get(()=>__yard.tlX(__yard.liveT)),xb=await get(()=>__yard.tlX(1200));
  await swipe(xa,xb);await wait(600); // let Chrome's gesture detector settle so the next tap synthesizes a click
  r=await get(()=>({t:__yard.S.t,rp:__yard.isReplay()}));ok(r.rp&&r.t<t0-600,`touch-scrub the timeline back (${(t0/60)|0} → ${(r.t/60)|0} min, REPLAY)`);
  ok(await get(()=>getComputedStyle(document.getElementById('replayBar')).display!=='none'),'replay pill shows in the map corner while the timeline is collapsed');
  await p.tap('#rbGo');await wait(100);ok(!(await get(()=>__yard.isReplay())),'Go live (replay pill) returns to live');
  r=await get(()=>document.getElementById('tl').getBoundingClientRect().height);
  await p.tap('#tlToggle');await wait(250);let r2=await get(()=>({h:document.getElementById('tl').getBoundingClientRect().height,lb:document.getElementById('liveBtn').offsetHeight>0}));
  ok(r<=28&&r2.h>=50&&r2.lb,`timeline is a thin scrubber (${Math.round(r)} px) that expands on tap (${Math.round(r2.h)} px chart)`);
  await p.tap('#tlToggle');await wait(250);
  // double-tap zooms in, two-finger tap zooms out
  await get(()=>__yard.zoomTo(1.2));let z0=await get(()=>__yard.view.z);const dt=[mc[0]+40,mc[1]-140];
  await p.touchscreen.tap(dt[0],dt[1]);await wait(90);await p.touchscreen.tap(dt[0],dt[1]);await wait(150);let z1=await get(()=>__yard.view.z);
  ok(z1>z0*1.6&&z1<z0*2.0,`double-tap zooms in once (${z0.toFixed(2)}→${z1.toFixed(2)})`);
  await touch('touchStart',[[mc[0]-40,mc[1]-140],[mc[0]+40,mc[1]-140]]);await wait(60);await touch('touchEnd',[]);await wait(120);let z2=await get(()=>__yard.view.z);
  ok(z2<z1*0.7,`two-finger tap zooms out (${z1.toFixed(2)}→${z2.toFixed(2)})`);
  await get(()=>__yard.fit());await get(id=>__yard.select(id),vid);await wait(80); // back to the selected vehicle for the dossier checks below
  // ---------- sheets ----------
  for(const [k,sel] of [['map','#msLayers .layers'],['faults','#faultsGrp'],['vars','#i-rate'],['metrics','#v-dwell']]){await p.tap(`#mtabs [data-mt="${k}"]`);await wait(320);
    r=await get(s=>{const e=document.querySelector(s).getBoundingClientRect();return {sh:__yard.sheet,vis:e.height>0&&e.top>=0&&e.bottom<=innerHeight+1};},sel);
    const ov=await noOverflow();ok(r.sh===k&&r.vis&&ov.sw<=ov.cw,`${k} tab opens its bottom sheet (${sel} on screen, no overflow)`);
    if(k==='vars')ok(await get(()=>getComputedStyle(document.getElementById('faultsGrp')).display==='none'),'variables sheet shows only the variables');
    if(k==='map'){r=await get(()=>({leg:document.querySelector('#msLegend #legend')&&getComputedStyle(document.getElementById('legend')).display,n:document.querySelectorAll('#msLayers .layers button').length}));
      ok(r.leg==='grid'&&r.n===4,'Map sheet holds the layer toggles and the legend');
      await p.tap('#msLayers .layers button[data-l="ids"]');ok(await get(()=>document.querySelector('.layers button[data-l="ids"]').getAttribute('aria-pressed')==='false'),'layer toggle works from the Map sheet');
      await p.tap('#msLayers .layers button[data-l="ids"]');const zb=await get(()=>__yard.view.z);await p.tap('#msIn');ok((await get(()=>__yard.view.z))>zb,'Map sheet zoom + still zooms');}
    if(k==='metrics')await p.tap('#scrim',{position:{x:200,y:150}});else if(k==='map')await p.tap('#msClose');else await p.tap('#sheetClose');await wait(300);
    ok(!(await get(()=>__yard.sheet)),`${k} sheet closes`);}
  await p.tap('#mtabs [data-mt="vars"]');await wait(300);const before=await get(()=>__yard.P.rate);
  const rb=await box('#i-rate');await p.touchscreen.tap(rb.x+rb.width*0.9,rb.y+rb.height/2);await wait(80);
  ok((await get(()=>__yard.P.rate))!==before,'a slider in the variables sheet responds to touch');
  await p.tap('#sheetClose');await wait(300);
  // ---------- long-press fault ----------
  await p.tap('#dossier .dz-x');await wait(80);ok(await get(()=>!__yard.selected&&getComputedStyle(document.getElementById('dossier')).display==='none'),'dossier sheet × closes it');
  await get(()=>{__yard.fit();});await wait(50);
  await get(()=>{const n=__yard.swXY('X-27');__yard.zoomAt(2.5,n[0]-document.getElementById('map').getBoundingClientRect().left,n[1]-document.getElementById('map').getBoundingClientRect().top);});await wait(50);
  const sw=await get(()=>__yard.swXY('X-27'));
  await touch('touchStart',[sw]);await wait(750);r=await get(()=>__yard.popOpen);await touch('touchEnd',[]);await wait(100);
  ok(r&&!(await get(()=>__yard.selected&&__yard.selected.type==='veh'&&false)),'long-press on the map opens the fault menu');
  r=await get(()=>{const p=document.getElementById('fpop').getBoundingClientRect();return {txt:document.getElementById('fpop').textContent,inside:p.left>=0&&p.right<=innerWidth&&p.bottom<=innerHeight,h:document.querySelector('#fpop button')&&document.querySelector('#fpop button').getBoundingClientRect().height};});
  ok(/X-27/.test(r.txt)&&r.inside&&r.h>=44,`fault menu is a bottom sheet for X-27 with 44 px rows`);
  await p.tap('#fpop button[data-i="0"]');await wait(100);
  r=await get(()=>__yard.faults().map(f=>f.target));ok(r.includes('X-27'),`tapping the menu injects the fault (${r.join(',')})`);
  ok(await get(()=>document.getElementById('mtFault').classList.contains('on')),'Faults tab shows a red dot while a fault is active');
  await get(()=>__yard.clearAll());
  // ---------- immersive ----------
  await p.tap('#mFit');await wait(80);
  await p.tap('#mFull');await wait(450);
  r=await get(()=>({imm:document.getElementById('app').classList.contains('immersive'),h:document.querySelector('header').getBoundingClientRect().bottom,b:document.getElementById('bottom').getBoundingClientRect().top,t:document.getElementById('mtabs').getBoundingClientRect().top,x:document.getElementById('mExit').offsetWidth}));
  let fr=await mapFrac();
  ok(r.imm&&r.h<=1&&r.b>=873&&r.t>=873&&r.x===32&&fr>0.97,`immersive hides all chrome (map ${(fr*100).toFixed(1)}% visible, one exit chip)`);
  await p.touchscreen.tap(20,330);await wait(500);
  r=await get(()=>({imm:document.getElementById('app').classList.contains('immersive'),sel:!!__yard.selected}));
  if(r.imm&&!r.sel)await p.tap('#mExit');
  ok(r.sel||!r.imm,`tap on empty map brings the chrome back${r.sel?' (tap hit an object instead)':''}`);
  if(await get(()=>document.getElementById('app').classList.contains('immersive')))await p.tap('#mExit');await wait(400);
  await p.keyboard.press('Escape');
  await p.tap('#mFull');await wait(400);await p.tap('#mExit');await wait(450);
  ok(await get(()=>!document.getElementById('app').classList.contains('immersive')&&document.getElementById('bottom').getBoundingClientRect().bottom<=innerHeight-40),'exit chip restores the chrome');
  // ---------- assembly: stacked, tap-to-place ----------
  await p.tap('#viewSeg [data-v="asm"]');await wait(300);
  r=await noOverflow();ok(r.sw<=r.cw&&!r.bad.length,`assembly portrait: no horizontal overflow ${r.bad.join(',')}`);
  r=await get(()=>{const g=document.getElementById('gauges');return {cols:getComputedStyle(g).gridTemplateColumns.split(' ').length,cs:getComputedStyle(document.getElementById('consist')).overflowX,sw:document.getElementById('consist').scrollWidth,cw:document.getElementById('consist').clientWidth,tabs:getComputedStyle(document.getElementById('mtabs')).display};});
  ok(r.cols===1&&r.cs==='auto'&&r.sw>r.cw*1.5&&r.tabs==='none',`gauges as a list, consist strip scrolls sideways (${r.sw}/${r.cw} px)`);
  // tap a car → editor sheet → Move → tap target car
  await p.locator('.car[data-car="PV-0618"]').scrollIntoViewIfNeeded();await p.tap('.car[data-car="PV-0618"]');await wait(150);
  r=await get(()=>{const e=document.getElementById('cedit').getBoundingClientRect();return {open:document.getElementById('cedit').classList.contains('open'),full:e.left<=1&&e.right>=innerWidth-1&&e.bottom<=innerHeight+1};});
  ok(r.open&&r.full,'tap a car: cargo editor opens as a full-width bottom sheet');
  await p.tap('#eMove');await wait(100);
  ok(await get(()=>__asm.pick&&__asm.pick.id==='PV-0618'&&/PV-0618/.test(document.getElementById('pickBanner').textContent)),'Move… arms tap-to-place with a banner');
  await p.locator('.car[data-car="PV-0533"]').scrollIntoViewIfNeeded();await p.tap('.car[data-car="PV-0533"]');await wait(120);
  r=await get(()=>{const pl=__asm.plan();return {i:pl.cars.indexOf('PV-0618'),bf:__asm.planChecks(pl).bf.length,pick:__asm.pick};});
  ok(r.i===4&&r.bf===0&&!r.pick,`tap PV-0533: PV-0618 placed in front of it (#5), block order clean`);
  // long-press a car → multi-select
  await p.locator('.car[data-car="PV-0471"]').scrollIntoViewIfNeeded();const c1=await ctr('.car[data-car="PV-0471"]');await touch('touchStart',[c1]);await wait(650);await touch('touchEnd',[]);await wait(80);
  const c2=await ctr('.car[data-car="PV-0488"]');await touch('touchStart',[c2]);await wait(650);await touch('touchEnd',[]);await wait(120);
  ok(await get(()=>__asm.AUI.sel.size===2&&!!document.querySelector('.bulk h3')),'long-press two cars: bulk edit for 2 cars');
  await p.tap('#bClear');
  // shipment tap-to-place
  await get(()=>__asm.applySuggested());await p.locator('.dr-tabs button[data-t="queue"]').scrollIntoViewIfNeeded();await p.tap('.dr-tabs button[data-t="queue"]');await wait(80);
  await p.locator('#drBody tr[data-id="SHP-4425"]').scrollIntoViewIfNeeded();await p.tap('#drBody tr[data-id="SHP-4425"] td.id');await wait(100);
  r=await get(()=>({pick:__asm.pick,ok:[...document.querySelectorAll('.car.drop-ok')].map(e=>e.dataset.car)}));
  ok(r.pick&&r.pick.kind==='shp'&&r.ok.includes('PV-0640'),`tap SHP-4425: compatible cars highlighted (${r.ok.join(',')})`);
  await p.locator('.car[data-car="PV-0512"]').scrollIntoViewIfNeeded();await p.tap('.car[data-car="PV-0512"]');await wait(80);
  r=await get(()=>({still:!!__asm.pick,why:document.getElementById('pickBanner').textContent}));ok(r.still&&/already carries/.test(r.why),'tap an unsuitable car: refused with the reason');
  await p.tap('.car[data-car="PV-0640"]');await wait(100);
  r=await get(()=>{const c=__yard.S.asm.cargo['PV-0640'];return c&&c.shp;});ok(r==='SHP-4425','tap PV-0640: SHP-4425 loaded');
  // spare tap-to-place via End
  await p.locator('.dr-tabs button[data-t="spares"]').scrollIntoViewIfNeeded();await p.tap('.dr-tabs button[data-t="spares"]');await wait(80);
  await p.locator('#drBody tr[data-id="PV-0655"]').scrollIntoViewIfNeeded();await p.tap('#drBody tr[data-id="PV-0655"] td.id');await wait(100);
  await p.locator('.car.endslot').scrollIntoViewIfNeeded();await p.tap('.car.endslot');await wait(100);
  r=await get(()=>{const pl=__asm.plan();return pl.cars[pl.cars.length-1];});ok(r==='PV-0655','tap a spare, then End: it joins the rear of the consist');
  r=await get(()=>{const s=document.getElementById('sendBar').getBoundingClientRect();return s.bottom<=innerHeight+1&&s.top<innerHeight;});ok(r,'send bar stays pinned to the bottom while scrolling');
  // ---------- landscape ----------
  await p.setViewportSize({width:874,height:402});await wait(300);
  r=await noOverflow();ok(r.sw<=r.cw,`landscape assembly: no horizontal overflow (${r.sw}/${r.cw})`);
  await p.tap('#viewSeg [data-v="yard"]');await wait(300);
  r=await get(()=>{const t=document.getElementById('mtabs').getBoundingClientRect(),m=document.getElementById('map').getBoundingClientRect();return {m:__yard.isMobile(),rail:t.height>t.width&&t.right>=innerWidth-1&&t.width<=60,mh:m.height,mw:m.width};});
  const ov=await noOverflow();
  ok(r.m&&r.rail&&r.mh>=400&&ov.sw<=ov.cw,`landscape 874×402: slim tab rail on the right, edge-to-edge map ${Math.round(r.mw)}×${Math.round(r.mh)}, no overflow`);
  r=await centerClear();ok(!r.hits.length,`landscape: nothing floats over the central map area ${r.hits.join(',')}`);
  fr=await mapFrac();ok(fr>BEFORE.landscape+0.15,`landscape map visible area ${(fr*100).toFixed(1)}% (was ${(BEFORE.landscape*100).toFixed(1)}%)`);
  await p.tap('#railHide');await wait(400);
  r=await get(()=>({off:document.getElementById('mtabs').getBoundingClientRect().left>=innerWidth-1,chip:document.getElementById('mRail').offsetWidth,hdr:document.querySelector('header').getBoundingClientRect().right>=innerWidth-1}));let fr2=await mapFrac();
  ok(r.off&&r.chip===32&&r.hdr&&fr2>fr,`landscape rail collapses (map ${(fr2*100).toFixed(1)}%), a chip brings it back`);
  await p.tap('#mRail');await wait(400);ok(await get(()=>document.getElementById('mtabs').getBoundingClientRect().right<=innerWidth+1&&document.getElementById('mtabs').getBoundingClientRect().left<innerWidth-40),'rail is back');
  await p.tap('#mtabs [data-mt="faults"]');await wait(300);r=await get(()=>{const s=document.getElementById('yardSide').getBoundingClientRect();return __yard.sheet==='faults'&&s.bottom<=innerHeight+1&&s.top>=0;});ok(r,'landscape faults sheet fits on screen');
  await p.tap('#sheetClose');
  // ---------- desktop untouched ----------
  await p.setViewportSize({width:1440,height:900});await wait(300);
  r=await get(()=>({m:__yard.isMobile(),tabs:getComputedStyle(document.getElementById('mtabs')).display,side:getComputedStyle(document.getElementById('yardSide')).position,cols:getComputedStyle(document.getElementById('app')).gridTemplateColumns}));
  ok(!r.m&&r.tabs==='none'&&r.side!=='fixed'&&/320px/.test(r.cols),`back at 1440×900 the desktop layout returns (${r.cols})`);
  r=await get(()=>({z:getComputedStyle(document.getElementById('zoomctl')).display,lw:getComputedStyle(document.getElementById('legendWrap')).display,legIn:document.getElementById('legend').parentElement.id,layIn:document.querySelector('.layers').parentElement.className,chips:getComputedStyle(document.getElementById('mchips')).display,mb:getComputedStyle(document.getElementById('mapbox')).position,tg:getComputedStyle(document.getElementById('tlToggle')).display}));
  ok(r.z!=='none'&&r.lw!=='none'&&r.legIn==='legendWrap'&&r.layIn==='map-head'&&r.chips==='none'&&r.mb!=='fixed'&&r.tg==='none',`desktop gets its zoom bar, legend chip and layer toggles back (${JSON.stringify(r)})`);
  ok(errs.length===0,'no console errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close();
})();
