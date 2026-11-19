const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1440,height:900}});
  p.on('pageerror',e=>console.log('pageerror',e.message));
  await p.goto('file:///workspace/yard-sim/v2/index.html'); await p.waitForTimeout(600);
  // running
  await p.evaluate(()=>{__yard.P.rate=11;document.getElementById('i-rate').value=11;document.getElementById('i-rate').dispatchEvent(new Event('input'));__yard.advance(1800);});
  await p.click('#play');await p.waitForTimeout(3000);
  const id=await p.evaluate(()=>{const v=__yard.S.veh.find(v=>v.state==='rolling'&&v.target&&v.route[v.ri]!=='LEAD')||__yard.S.veh.find(v=>v.state==='pulling')||__yard.S.veh.find(v=>v.state==='humping');return v&&v.id;});
  const xy=await p.evaluate(i=>__yard.vehScreen(i),id);if(xy)await p.mouse.click(xy[0],xy[1]);
  await p.waitForTimeout(500);
  await p.screenshot({path:'/workspace/yard-sim/v2/shots/01-running.png'});
  // jam: fault, 22 min into inspection hold
  await p.click('#play');await p.click('#resetBtn');
  await p.evaluate(()=>{__yard.advance(1800);});await p.click('#faultBtn');
  await p.evaluate(()=>{__yard.advance(22*60);});
  await p.click('#play');await p.waitForTimeout(1200);
  const pl=await p.evaluate(()=>{const q=Object.values(__yard.S.pl).find(q=>q.kind==='in'&&q.veh.some(v=>v.blocked&&v.spawned));return q&&q.id;});
  if(pl)await p.evaluate(i=>__yard.selectPl(i),pl);
  await p.waitForTimeout(400);
  await p.screenshot({path:'/workspace/yard-sim/v2/shots/02-jam-fault.png'});
  console.log(await p.evaluate(()=>({q:__yard.S.queue,jam:__yard.S.jamOn,t:__yard.S.t})));
  await b.close();
})();
