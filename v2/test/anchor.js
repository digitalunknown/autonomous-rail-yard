const { chromium } = require('playwright');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1;};
(async()=>{const b=await chromium.launch();
for(const [W,H] of [[1440,900],[1180,760]]){
  const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(600);const get=(f,a)=>p.evaluate(f,a);const tag=`[${W}x${H}]`;
  const box=s=>p.$eval(s,e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,b:r.bottom,r:r.right};});
  const map0=await box('#map');
  // pick bar docks in the map header, never over the map canvas
  await p.click('#fPick');const pb=await box('#pickBar');
  ok(await p.isVisible('#pickBar')&&pb.b<=map0.y+0.5,`${tag} pick bar docked in map header (bottom ${pb.b.toFixed(0)} ≤ map top ${map0.y.toFixed(0)})`);
  ok(!(await p.isVisible('.map-sub')),`${tag} pick bar replaces the subtitle line`);
  const map1=await box('#map');ok(Math.abs(map1.y-map0.y)<0.5&&Math.abs(map1.h-map0.h)<0.5,`${tag} map canvas does not move when pick mode toggles`);
  const xy=await get(()=>__yard.swXY('X-31'));await p.mouse.move(xy[0],xy[1]);ok((await p.textContent('#pickTxt')).includes('X-31'),`${tag} hover hint in docked bar: "${await p.textContent('#pickTxt')}"`);
  await p.click('#pickDone');ok(!(await p.isVisible('#pickBar'))&&await p.isVisible('.map-sub')&&(await p.getAttribute('#fPick','aria-pressed'))==='false',`${tag} Done exits pick mode, subtitle returns`);
  // replay bar docks too
  await get(()=>{__yard.advance(30*60);__yard.seek(__yard.liveT-600);});const rb=await box('#replayBar');
  ok(await p.isVisible('#replayBar')&&rb.b<=map0.y+0.5,`${tag} replay bar docked in map header: "${(await p.textContent('#replayBar')).replace(/\s+/g,' ')}"`);
  await p.click('#rbGo');ok(!(await p.isVisible('#replayBar'))&&await get(()=>!__yard.isReplay()),`${tag} Go live from docked bar`);
  // legend collapsed chip
  ok(!(await p.isVisible('#legend'))&&(await p.getAttribute('#legendBtn','aria-expanded'))==='false',`${tag} legend collapsed by default`);
  const lb=await box('#legendBtn');ok(lb.r<=map0.r+0.5&&lb.b<=map0.b+0.5&&lb.w<110&&lb.h<=30,`${tag} Legend chip anchored bottom-right (${lb.w.toFixed(0)}×${lb.h.toFixed(0)})`);
  await p.hover('#legendBtn');ok(await p.isVisible('#legend')&&(await p.getAttribute('#legendBtn','aria-expanded'))==='true',`${tag} hover expands`);
  const lg=await box('#legend');ok(lg.r<=map0.r+0.5&&lg.b<=lb.y+0.5&&lg.y>=map0.y,`${tag} expanded legend opens above the chip, inside the map`);
  await p.mouse.move(map0.x+40,map0.y+40);ok(!(await p.isVisible('#legend')),`${tag} mouse leave collapses`);
  await p.click('#legendBtn');await p.mouse.move(map0.x+40,map0.y+40);ok(await p.isVisible('#legend'),`${tag} click pins it open`);
  await p.click('#legendBtn');ok(!(await p.isVisible('#legend'))||(await get(()=>document.getElementById('legendWrap').matches(':hover'))),`${tag} click again unpins`);
  await p.mouse.move(map0.x+40,map0.y+40);ok(!(await p.isVisible('#legend')),`${tag} closed after unpin`);
  await p.click('#legendBtn');await p.mouse.move(map0.x+40,map0.y+40);await p.keyboard.press('Escape');ok(!(await p.isVisible('#legend'))&&(await p.getAttribute('#legendBtn','aria-expanded'))==='false',`${tag} Escape closes pinned legend`);
  await p.focus('#legendBtn');await p.keyboard.press('Enter');ok(await p.isVisible('#legend')&&(await p.getAttribute('#legendBtn','aria-expanded'))==='true',`${tag} keyboard Enter opens (aria-expanded true)`);
  await p.keyboard.press('Enter');ok(!(await p.isVisible('#legend')),`${tag} keyboard Enter closes`);
  // X-24 callout no longer covered by the legend
  await get(()=>__yard.setFault(true));
  const cov=await get(()=>{const lb=document.getElementById('legendBtn').getBoundingClientRect();const c=__yard.w2s(1002,368),d=__yard.w2s(1146,458);return {lb:[lb.left,lb.top,lb.right,lb.bottom],card:[c[0],c[1],d[0],d[1]]};});
  const ov=!(cov.lb[2]<cov.card[0]||cov.lb[0]>cov.card[2]||cov.lb[3]<cov.card[1]||cov.lb[1]>cov.card[3]);
  ok(!ov,`${tag} collapsed legend chip clears the X-24 callout card`);
  ok(errs.length===0,`${tag} no console errors ${JSON.stringify(errs)}`);await p.close();}
await b.close();})();
