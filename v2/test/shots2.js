const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(700);
  const get=(f,a)=>p.evaluate(f,a);
  await get(()=>{__yard.advance(40*60);__yard.zoomTo(2.5);__yard.centerOn(800,340);});
  const id=await get(()=>{const r=document.getElementById('map').getBoundingClientRect();const v=__yard.S.veh.find(v=>{const s=__yard.vehScreen(v.id);return s&&s[0]>r.left+200&&s[0]<r.right-300&&s[1]>r.top+100&&s[1]<r.bottom-80;});return v&&v.id;});
  if(id){const s=await get(i=>__yard.vehScreen(i),id);await p.mouse.click(s[0],s[1]);}
  await p.waitForTimeout(400);await p.screenshot({path:'../shots/05-zoomed.png'});
  // jam history then drag back into it
  await get(()=>{__yard.fit();__yard.select(null);__yard.toggleFault();__yard.advance(70*60);__yard.toggleFault();__yard.advance(50*60);});
  await p.keyboard.press('Escape');
  const j=await get(()=>{const S=__yard.S;const J=S.jams.find(j=>j.b!=null)||S.jams[0];return J?(J.a+(J.b||S.t))/2:S.faults[0].a+50*60;});
  const live=await get(()=>__yard.liveT);
  const [x1,y]=await get(t=>__yard.tlX(t),live);const [x2]=await get(t=>__yard.tlX(t),j);
  await p.mouse.move(x1,y);await p.mouse.down();await p.mouse.move(x2,y,{steps:12});await p.mouse.up();
  await p.mouse.move(x2+1,y);await p.waitForTimeout(400);
  console.log('replay',await get(()=>__yard.isReplay()),'t',await get(()=>__yard.S.t/3600),'jamAt',j/3600,'errs',errs);
  await p.screenshot({path:'../shots/06-scrub.png'});
  await b.close();
})();
