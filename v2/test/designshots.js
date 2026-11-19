// usage: node designshots.js before|after  -> ../shots/<prefix>-*.png at 1440x900
const { chromium } = require('playwright');
const pre=process.argv[2]||'after';const D='/workspace/yard-sim/v2/shots/'+pre+'-';
(async()=>{
  const b=await chromium.launch();const errs=[];
  const page=async()=>{const p=await b.newPage({viewport:{width:1440,height:900}});
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});
    await p.goto('file:///workspace/yard-sim/v2/index.html');await p.waitForTimeout(700);return p;};
  let p=await page();
  await p.evaluate(()=>{const el=document.getElementById('i-rate');el.value=11;el.dispatchEvent(new Event('input',{bubbles:true}));__yard.advance(1800);});
  await p.click('#play');await p.waitForTimeout(3000);
  const id=await p.evaluate(()=>{const v=__yard.S.veh.find(v=>v.state==='rolling'&&v.target&&v.route[v.ri]!=='LEAD')||__yard.S.veh.find(v=>v.state==='pulling')||__yard.S.veh.find(v=>v.state==='humping');return v&&v.id;});
  const xy=await p.evaluate(i=>__yard.vehScreen(i),id);if(xy)await p.mouse.click(xy[0],xy[1]);
  await p.mouse.move(5,450);await p.waitForTimeout(500);await p.screenshot({path:D+'01-running.png'});
  await p.click('#play');await p.click('#resetBtn');
  await p.evaluate(()=>{__yard.advance(1800);});await p.click('#faultBtn');
  await p.evaluate(()=>{__yard.advance(22*60);});
  await p.click('#play');await p.waitForTimeout(1200);
  const pl=await p.evaluate(()=>{const q=Object.values(__yard.S.pl).find(q=>q.kind==='in'&&q.veh.some(v=>v.blocked&&v.spawned));return q&&q.id;});
  if(pl)await p.evaluate(i=>__yard.selectPl(i),pl);
  await p.mouse.move(5,450);await p.waitForTimeout(400);await p.screenshot({path:D+'02-jam-fault.png'});await p.close();
  p=await page();
  await p.evaluate(()=>{const el=document.getElementById('i-rate');el.value=12;el.dispatchEvent(new Event('input',{bubbles:true}));__yard.advance(2400);});
  await p.click('#play');await p.waitForTimeout(2500);await p.click('#play');await p.mouse.move(5,450);await p.waitForTimeout(300);
  await p.screenshot({path:D+'03-signals.png'});await p.close();
  p=await page();const get=(f,a)=>p.evaluate(f,a);
  await get(()=>{__yard.advance(40*60);__yard.zoomTo(2.5);__yard.centerOn(800,340);});
  const id2=await get(()=>{const r=document.getElementById('map').getBoundingClientRect();const v=__yard.S.veh.find(v=>{const s=__yard.vehScreen(v.id);return s&&s[0]>r.left+200&&s[0]<r.right-300&&s[1]>r.top+100&&s[1]<r.bottom-80;});return v&&v.id;});
  if(id2){const s=await get(i=>__yard.vehScreen(i),id2);await p.mouse.click(s[0],s[1]);}
  await p.waitForTimeout(400);await p.screenshot({path:D+'05-zoomed.png'});
  await get(()=>{__yard.fit();__yard.select(null);__yard.toggleFault();__yard.advance(70*60);__yard.toggleFault();__yard.advance(50*60);});
  await p.keyboard.press('Escape');
  const j=await get(()=>{const S=__yard.S;const J=S.jams.find(j=>j.b!=null)||S.jams[0];return J?(J.a+(J.b||S.t))/2:S.faults[0].a+50*60;});
  const live=await get(()=>__yard.liveT);
  const [x1,y]=await get(t=>__yard.tlX(t),live);const [x2]=await get(t=>__yard.tlX(t),j);
  await p.mouse.move(x1,y);await p.mouse.down();await p.mouse.move(x2,y,{steps:12});await p.mouse.up();
  await p.mouse.move(x2+1,y);await p.waitForTimeout(400);await p.screenshot({path:D+'06-scrub.png'});
  console.log(pre,'shots done; errors:',errs);await b.close();
})();
