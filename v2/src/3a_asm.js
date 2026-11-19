// ================= ASSEMBLY: car specs, cargo, consist plans (all editable data lives in S.asm = recorded state)
const CLOCK0=12*60;                      // wall clock: T+0 = 12:00
function clk(t){const m=Math.floor(CLOCK0+t/60+1e-6);return p2(Math.floor(m/60)%24)+':'+p2(((m%60)+60)%60);}
const CTYPES={Box:{len:12.4,tare:14,max:48},Hopper:{len:14.0,tare:16,max:56},Reefer:{len:13.2,tare:18,max:56},Tank:{len:13.6,tare:15,max:56},Flat:{len:15.8,tare:12,max:56}};
const AXLES=4, CAR_GAP=1.5, DLEN={D01:210,D02:172,D03:190};
const CARGO={i20:{name:"20' intermodal",short:"20' ctr",cars:['Box','Flat']},i40:{name:"40' intermodal",short:"40' ctr",cars:['Box','Flat']},
  i53:{name:"53' intermodal",short:"53' ctr",cars:['Box','Flat']},grain:{name:'Bulk grain',short:'Grain',cars:['Hopper']},aggr:{name:'Aggregates',short:'Aggr.',cars:['Hopper']},
  autos:{name:'Automotive racks',short:'Autos',cars:['Flat']},tank:{name:'Tank / liquid',short:'Tank',cars:['Tank']},reefer:{name:'Refrigerated',short:'Reefer',cars:['Reefer']},
  haz:{name:'Hazmat',short:'Haz',cars:['Box','Flat','Tank','Hopper']}};
const CORDER=['i20','i40','i53','grain','aggr','autos','tank','reefer','haz'];
const HAZ_CLASSES=['2.1','3','5.1','8','9'];
const HAZ_INCOMPAT={'2.1':['3','5.1'],'3':['2.1','5.1','8'],'5.1':['2.1','3','8'],'8':['3','5.1'],'9':[]};
const hazBad=(a,b)=>!!a&&!!b&&(HAZ_INCOMPAT[a]||[]).includes(b);
const RULES_DEF={axle:14.0,warn:95,len:172,gross:560,brakeMin:10,haz:'adjacent',pack:80,reeferKW:2.1,tripH:4.2,traction:9,floor:25,minLoad:5};
// Figma PL-52 (Assembly View · 05 Hybrid + cargo, math note 203:3103)
const SEED_CARS=[
 ['PV-0471','Box',82,'STL',{shp:'SHP-4410',type:'i40',t:24}],['PV-0488','Box',76,'STL',{shp:'SHP-4413',type:'i53',t:27}],
 ['PV-0512','Hopper',64,'STL',{shp:'SHP-4417',type:'grain',t:36}],['PV-0618','Reefer',71,'MEM',{shp:'SHP-4421',type:'reefer',t:26,reefer:true}],
 ['PV-0526','Tank',58,'STL',{shp:'SHP-4402',type:'tank',t:34,desc:'Tank · corn syrup',short:'Syrup'}],
 ['PV-0533','Box',18,'MEM',{shp:'SHP-4425',type:'i20',t:23,reefer:true,desc:"20' reefer container",short:"20' rfr"}],
 ['PV-0590','Flat',69,'MEM',{shp:'SHP-4428',type:'haz',t:21,cls:'3',desc:'Hazmat Cl 3 · ethanol',short:'Cl 3 tank'}],
 ['PV-0597','Flat',73,'MEM',{shp:'SHP-4429',type:'haz',t:19,cls:'5.1',desc:'Hazmat Cl 5.1 · peroxide',short:'Cl 5.1 tank'}],
 ['PV-0604','Box',88,'MEM',{shp:'SHP-4431',type:'i40',t:26,hv:true,desc:"40' intermodal · high value",short:"40' HV"}],
 ['PV-0611','Hopper',61,'MEM',{shp:'SHP-4436',type:'aggr',t:39,booked:39,desc:'Aggregates · crushed limestone'}],
 ['PV-0625','Reefer',79,'MEM',{shp:'SHP-4438',type:'reefer',t:25,reefer:true}],
 ['PV-0702','Flat',66,'MEM',{shp:'SHP-4440',type:'autos',t:18}]];
const SEED_SPARES=[['PV-0640','Box',81,'MEM'],['PV-0655','Flat',92,'STL'],['PV-0677','Reefer',23,'STL']];
const SEED_QUEUE=[
 {id:'SHP-4446',desc:"20' intermodal",type:'i20',dest:'STL',t:14,due:8400},
 {id:'SHP-4451',desc:'Hazmat Cl 8 · caustic soda',type:'haz',cls:'8',dest:'MEM',t:22,due:8400,note:'placard'},
 {id:'SHP-4458',desc:"53' intermodal",type:'i53',dest:'STL',t:24,due:12900},
 {id:'SHP-4463',desc:'Bulk grain · soybeans',type:'grain',dest:'MEM',t:30,due:14600}];
function hashN(id){const n=parseInt(String(id).replace(/\D/g,''),10)||0;return (Math.imul(n,2654435761)>>>0);}
function ctypeFor(id){const h=hashN(id)%10;return h<4?'Box':h<6?'Hopper':h<8?'Flat':h<9?'Tank':'Reefer';}
function defCargo(v){const ct=v.ctype||ctypeFor(v.id),h=hashN(v.id);
  const opts=CORDER.filter(k=>k!=='haz'&&CARGO[k].cars.includes(ct));const type=opts[(h>>>8)%opts.length];
  const ml=CTYPES[ct].max-CTYPES[ct].tare;return {shp:null,type,t:Math.round(ml*(.55+((h>>>16)%36)/100)),reefer:type==='reefer'};}
function cargoOf(v){const c=S.asm.cargo[v.id];return c!==undefined?c:(v.staged?null:defCargo(v));}
function cargoShort(c){if(!c||!c.t)return 'Empty';if(c.short)return c.short;if(c.type==='haz')return 'Cl '+(c.cls||'?');let s=CARGO[c.type].short;if(c.type==='i20'&&c.reefer)s="20' rfr";if(c.hv)s=s.replace(' ctr','')+' HV';return s;}
function cargoName(c){return !c||!c.t?'Empty':(c.desc||CARGO[c.type].name+(c.cls?' Cl '+c.cls:''));}
function vById(id){return S.veh.find(v=>v.id===id)||null;}
function blockOf(v){const c=S.asm.cargo[v.id];return c&&c.block||v.block;}
function maxLoadFor(ct,R){return Math.max(0,Math.min(CTYPES[ct].max,R.axle*AXLES)-CTYPES[ct].tare);}
function reeferPct(R){return R.reeferKW*R.tripH/R.pack*100;}
// one car's numbers
function carRow(id,R,cargoOver){const v=vById(id);if(!v)return {id,missing:true};const ct=v.ctype||ctypeFor(v.id),spec=CTYPES[ct];
  const c=cargoOver&&id in cargoOver?cargoOver[id]:cargoOf(v);const load=c?c.t||0:0,gross=spec.tare+load;
  const reef=!!(c&&c.reefer&&load);const arr=v.soc-R.traction-(reef?reeferPct(R):0);
  return {id,v,ct,len:spec.len,tare:spec.tare,maxG:spec.max,load,gross,axle:gross/AXLES,axlePct:gross/AXLES/R.axle*100,soc:v.soc,arr,reef,cargo:c,block:blockOf(v),cls:c&&load&&(c.type==='haz'||c.placard)?c.cls||null:null,track:EDGES[v.route[v.ri]].track,state:v.state};}
// block order: flag the fewer of (later-block cars ahead of an earlier block) / (earlier-block cars behind a later block)
function blockFlags(rows,order){const ix=r=>{const i=order.indexOf(r.block);return i<0?order.length:i;};const n=rows.length;
  const A=[],B=[];for(let i=0;i<n;i++){for(let j=i+1;j<n;j++)if(ix(rows[j])<ix(rows[i])){A.push(i);break;}for(let j=0;j<i;j++)if(ix(rows[j])>ix(rows[i])){B.push(i);break;}}
  return B.length<A.length?B:A;}
function planChecks(pl,R,o){o=o||{};R=R||S.asm.rules;const cars=o.cars||pl.cars;const rows=cars.map(id=>carRow(id,R,o.cargo));
  const ok=rows.filter(r=>!r.missing);const n=ok.length;const dl=DLEN[pl.dtrack]||172,limit=Math.min(R.len,dl);
  const length=ok.reduce((a,r)=>a+r.len,0)+Math.max(0,n-1)*CAR_GAP;const tare=ok.reduce((a,r)=>a+r.tare,0),cargoT=ok.reduce((a,r)=>a+r.load,0),gross=tare+cargoT;
  const brake=(R.gross-gross)/R.gross*100;let mx=null;for(const r of ok)if(!mx||r.axle>mx.axle)mx=r;
  const haz=[];for(let i=0;i+1<n;i++)if(hazBad(ok[i].cls,ok[i+1].cls))haz.push([i,i+1]);
  const ends=R.haz==='buffer'?ok.filter((r,i)=>r.cls&&(i===0||i===n-1)).map(r=>r.id):[];
  const bf=blockFlags(ok,pl.blocks).map(i=>ok[i].id);
  let mn=null;for(const r of ok)if(!mn||r.soc<mn.soc)mn=r;let ma=null;for(const r of ok)if(!ma||r.arr<ma.arr)ma=r;
  const reefKW=ok.filter(r=>r.reef).length*R.reeferKW;
  const issues=[];const st={};const mark=(id,s)=>{if(st[id]!=='v')st[id]=s;};
  // position along the train (front = 0) for the over-length marker
  let x=0;const pos={};for(const r of ok){pos[r.id]=[x,x+r.len];x+=r.len+CAR_GAP;}
  if(length>limit+1e-9){const over=ok.filter(r=>pos[r.id][1]>limit+1e-9).map(r=>r.id);over.forEach(id=>mark(id,'over'));
    issues.push({sev:'v',kind:'length',title:'Over length on '+EDGES[pl.dtrack].track,desc:`${fx(length)} m with ${CAR_GAP} m gaps; ${EDGES[pl.dtrack].track} holds ${limit} m.`,cars:over});}
  if(bf.length){bf.forEach(id=>mark(id,'v'));const r=ok.find(q=>q.id===bf[0]);const i=ok.indexOf(r);
    issues.push({sev:'v',kind:'block',title:'Wrong block order',desc:`${bf.join(', ')} ${bf.length>1?'are':'is'} bound for ${r.block} but sit${bf.length>1?'':'s'} at #${i+1}. ${pl.blocks[0]} is cut first, so it would leave with the wrong block.`,cars:bf});}
  for(const [i,j] of haz){mark(ok[i].id,'v');mark(ok[j].id,'v');
    issues.push({sev:'v',kind:'haz',title:'Hazmat cars coupled',desc:`${ok[i].id} (Class ${ok[i].cls}) touches ${ok[j].id} (Class ${ok[j].cls}). Incompatible classes need one non-hazmat car between them.`,cars:[ok[i].id,ok[j].id],pair:[ok[i].id,ok[j].id]});}
  for(const id of ends){mark(id,'v');issues.push({sev:'v',kind:'hazend',title:'Hazmat car at train end',desc:`${id} needs a non-hazmat buffer car between it and the end of the train.`,cars:[id]});}
  if(gross>R.gross+1e-9)issues.push({sev:'v',kind:'gross',title:'Train over weight',desc:`${fx(gross)} t against ${R.gross} t.`,cars:[]});
  else if(brake<R.brakeMin-1e-9)issues.push({sev:'v',kind:'brake',title:'Brake margin too thin',desc:`${brake.toFixed(0)}% against a ${R.brakeMin}% minimum on the 1.2% grade.`,cars:[]});
  for(const r of ok){if(r.gross>r.maxG+1e-9){mark(r.id,'v');issues.push({sev:'v',kind:'maxg',title:r.id+' over max gross',desc:`${r.ct} max gross ${r.maxG} t; it weighs ${fx(r.gross)} t.`,cars:[r.id]});}
    if(r.axlePct>100+1e-9){mark(r.id,'v');issues.push({sev:'v',kind:'axle',title:'Axle load over limit',desc:`${r.id} weighs ${fx(r.gross)} t: ${fx2(r.axle)} t per axle against ${R.axle} t on the route.`,cars:[r.id]});}}
  for(const r of rows)if(r.missing){issues.push({sev:'v',kind:'missing',title:r.id+' left the yard',desc:'It is no longer in the yard inventory.',cars:[r.id]});}
  for(const r of ok)if(r.soc<R.floor-1e-9||r.arr<0){mark(r.id,'w');
    issues.push({sev:'w',kind:'batt',title:r.reef?`${r.id} can’t carry its reefer`:`${r.id} battery too low`,desc:`${Math.round(r.soc)}% now, ${R.floor}% floor at departure.`+(r.reef?` The ${R.reeferKW} kW reefer would take it to ${Math.round(r.arr)}% before ${pl.to}.`:` It would reach ${pl.to} at ${Math.round(r.arr)}%.`),cars:[r.id]});}
  for(const r of ok)if(r.axlePct>=R.warn-1e-9&&r.axlePct<=100+1e-9){mark(r.id,'w');
    issues.push({sev:'w',kind:'axlew',title:'Axle load near limit',desc:`${r.id} weighs ${fx(r.gross)} t: ${fx2(r.axle)} t per axle against ${R.axle} t on the route.`,cars:[r.id]});}
  if(pl.status==='draft'&&n&&pl.dep<S.t+ASSEMBLE)issues.push({sev:'w',kind:'late',title:'Departure time has passed',desc:`${clk(pl.dep)} is behind the clock (${clk(S.t)}). Sent now, it leaves as soon as it’s assembled.`,cars:[]});
  const open=openCargo(pl,ok,R);for(const s of open)issues.push({sev:'w',kind:'open',title:'Open cargo',desc:`${s.id} (due ${clk(s.due)}) has no car.`,shp:s.id,cars:[]});
  const half=Math.ceil(n/2);const front=ok.slice(0,half).reduce((a,r)=>a+r.gross,0),rear=ok.slice(half).reduce((a,r)=>a+r.gross,0);
  return {rows,ok,n,length,limit,tare,cargoT,gross,brake,mx,haz,bf,mn,ma,reefKW,issues,st,pos,front,rear,half,open,
    nV:issues.filter(i=>i.sev==='v').length,nW:issues.filter(i=>i.sev==='w').length};}
function fx(x){return (Math.round(x*10)/10).toFixed(Math.abs(x-Math.round(x))<1e-9?0:1);}
function fx2(x){const r=Math.round(x*100)/100;return Number.isInteger(r*10)?r.toFixed(r%1?1:1):r.toFixed(2);}
// shipments displaced from this plan that a plan car could still take
function openCargo(pl,rows,R){return S.asm.queue.filter(s=>s.from&&s.plan===pl.id&&rows.some(r=>!r.load&&CARGO[s.type].cars.includes(r.ct)&&s.dest===r.block));}
// --------- changes (data, so they can be listed, applied singly, or all at once)
function shpFromCar(id,pl,amount){const c=S.asm.cargo[id]!==undefined?S.asm.cargo[id]:cargoOf(vById(id));if(!c||!c.shp||!c.t)return null;
  const t=amount==null?c.t:amount;const v=vById(id);
  const e={id:c.shp,desc:cargoName(c),type:c.type,cls:c.cls,reefer:c.reefer,hv:c.hv,dest:blockOf(v),t,due:pl?pl.dep:S.t+3600,from:id,plan:pl?pl.id:null,rem:amount!=null};
  const ex=S.asm.queue.find(q=>q.id===e.id);if(ex){ex.t+=t;}else S.asm.queue.push(e);return e;}
function setCargo(id,c){S.asm.cargo[id]=c;}
function applyChange(ch,pl){const P_=pl.cars;
  if(ch.kind==='drop'){shpFromCar(ch.car,pl);if(cargoOf(vById(ch.car))&&cargoOf(vById(ch.car)).shp)setCargo(ch.car,{shp:null,type:cargoOf(vById(ch.car)).type,t:0});pl.cars=P_.filter(x=>x!==ch.car);}
  else if(ch.kind==='move'){const a=P_.filter(x=>x!==ch.car);a.splice(ch.to,0,ch.car);pl.cars=a;}
  else if(ch.kind==='swap'){const i=P_.indexOf(ch.a),j=P_.indexOf(ch.b);if(i>=0&&j>=0){P_[i]=ch.b;P_[j]=ch.a;}}
  else if(ch.kind==='swapcar'){const i=P_.indexOf(ch.out);if(i>=0){shpFromCar(ch.out,pl);const c=cargoOf(vById(ch.out));if(c&&c.shp)setCargo(ch.out,{shp:null,type:c.type,t:0});P_[i]=ch.in;}}
  else if(ch.kind==='trim'){const v=vById(ch.car);const c=Object.assign({},cargoOf(v));const rem=c.t-ch.t;if(rem>0)shpFromCar(ch.car,pl,rem);c.t=ch.t;setCargo(ch.car,c);}
  else if(ch.kind==='remove'){pl.cars=P_.filter(x=>x!==ch.car);}
  else if(ch.kind==='assign'){assignShp(ch.shp,ch.car,pl);}}
function sparesFor(pl){const own=ownedIds(pl.id);return S.veh.filter(v=>!v.thru&&!own.has(v.id)&&(v.staged||((v.state==='classified'||v.state==='charging')&&!v.plan)));}
function suggest(pl,R){R=R||S.asm.rules;const work={cars:pl.cars.slice()};const cargo={};const changes=[];
  const chk=()=>planChecks(pl,R,{cars:work.cars,cargo});
  const empty=id=>{const v=vById(id);const c=cargoOf(v);return !c||!c.t;};
  let c=chk();
  // 1 length: drop rear cars
  let guard=0;while(c.length>c.limit+1e-9&&work.cars.length>1&&guard++<20){const id=work.cars[work.cars.length-1];const r=c.ok.find(x=>x.id===id);const cg=cargoOf(vById(id));
    changes.push({kind:'drop',car:id,desc:`Drop ${id} (−${fx(r.len+CAR_GAP)} m)`+(cg&&cg.shp&&cg.t?`; ${cg.shp} returns to the queue`:'')});work.cars.pop();if(cg&&cg.shp)cargo[id]={shp:null,type:cg.type,t:0};c=chk();}
  // 2 block order: move flagged cars behind the last car of the earlier blocks
  guard=0;while(c.bf.length&&guard++<12){const id=c.bf[0];const r=c.ok.find(x=>x.id===id);const bi=pl.blocks.indexOf(r.block);
    const a=work.cars.filter(x=>x!==id);let to=0;a.forEach((x,i)=>{const rr=c.ok.find(q=>q.id===x);if(rr&&pl.blocks.indexOf(rr.block)<bi)to=i+1;});
    const behind=a[to-1];a.splice(to,0,id);changes.push({kind:'move',car:id,to,desc:`Move ${id} to #${to+1}`+(behind?`, behind ${behind}`:'')});work.cars=a;c=chk();}
  // 3 battery: swap for the best empty spare that fits the cargo
  for(const r of c.ok.filter(r=>r.soc<R.floor||r.arr<0)){const need=r.cargo&&r.load?CARGO[r.cargo.type].cars:[r.ct];
    const cands=sparesFor(pl).filter(v=>!work.cars.includes(v.id)&&empty(v.id)&&need.includes(v.ctype||ctypeFor(v.id))&&v.soc-R.traction-(r.reef?reeferPct(R):0)>=0&&v.soc>=R.floor&&blockOf(v)===r.block).sort((a,b)=>b.soc-a.soc);
    if(!cands.length)continue;const nv=cands[0];const i=work.cars.indexOf(r.id);work.cars[i]=nv.id;if(r.cargo&&r.cargo.shp)cargo[r.id]={shp:null,type:r.cargo.type,t:0};
    changes.push({kind:'swapcar',out:r.id,in:nv.id,desc:`Swap ${r.id} for ${nv.id} (${Math.round(nv.soc)}%)`+(r.cargo&&r.cargo.shp?`; ${r.cargo.shp} goes back to the queue to reload`:'')});c=chk();}
  // 4 hazmat: put the nearest non-hazmat car of the same block between the pair
  guard=0;while(c.haz.length&&guard++<8){const[i,j]=c.haz[0];const b=c.ok[j];let k=-1;for(let q=j+1;q<c.ok.length;q++)if(!c.ok[q].cls&&c.ok[q].block===b.block){k=q;break;}
    if(k<0)break;const A=b.id,B=c.ok[k].id;const ia=work.cars.indexOf(A),ib=work.cars.indexOf(B);work.cars[ia]=B;work.cars[ib]=A;
    changes.push({kind:'swap',a:A,b:B,desc:`Swap ${A} with ${B}`});c=chk();}
  // 5 axle: trim to 2 points under the warning line
  for(const r of c.ok.filter(r=>r.axlePct>=R.warn)){const tgt=Math.floor((R.warn-2)/100*R.axle*AXLES-r.tare);if(tgt<=0||tgt>=r.load)continue;
    const g=r.tare+tgt;changes.push({kind:'trim',car:r.id,t:tgt,desc:`Trim ${r.cargo.shp||r.id} to ${tgt} t (${g} t, ${fx2(g/AXLES)} t per axle)`});cargo[r.id]=Object.assign({},r.cargo,{t:tgt});c=chk();}
  return {changes,after:c,cars:work.cars,cargo};}
// --------- shipments
function compatible(s,ct){return CARGO[s.type].cars.includes(ct);}
function assignShp(shpId,carId,pl){const s=S.asm.queue.find(q=>q.id===shpId);const v=vById(carId);if(!s||!v)return false;const R=S.asm.rules;const ct=v.ctype||ctypeFor(v.id);
  if(!compatible(s,ct))return false;const cur=cargoOf(v);if(cur&&cur.t>0)return false;const ml=maxLoadFor(ct,R);const t=Math.min(s.t,ml);if(t<=0)return false;
  setCargo(carId,{shp:s.id,type:s.type,t,cls:s.cls,reefer:!!s.reefer||s.type==='reefer',hv:s.hv,desc:s.desc,block:s.dest,booked:s.t});
  s.t-=t;if(s.t<=0.001)S.asm.queue=S.asm.queue.filter(q=>q!==s);else s.rem=true;return true;}
function unassignCar(carId,pl){shpFromCar(carId,pl);const c=cargoOf(vById(carId));setCargo(carId,{shp:null,type:c?c.type:'i20',t:0});}
function autoAssign(pl,R){R=R||S.asm.rules;const placed=[],held=[];const cargo={};const cars=pl.cars.slice();
  const due=pl.dep;const queue=S.asm.queue.slice().sort((a,b)=>a.due-b.due||(a.id<b.id?-1:1));
  const before=planChecks(pl,R).gross;let after=before;
  for(const s of queue){if(s.due>due+1)continue;
    if(s.t<R.minLoad-1e-9){held.push({shp:s,reason:`${fx(s.t)} t is under the ${R.minLoad} t minimum per car.`,short:'Held · under minimum'});continue;}
    let done=false;
    for(const id of cars){const v=vById(id);if(!v)continue;const ct=v.ctype||ctypeFor(id);const c=id in cargo?cargo[id]:cargoOf(v);if(c&&c.t)continue;
      if(!compatible(s,ct)||blockOf(v)!==s.dest)continue;const t=Math.min(s.t,maxLoadFor(ct,R));const g=CTYPES[ct].tare+t;if(g/AXLES/R.axle*100>=R.warn)continue;
      const reef=!!s.reefer||s.type==='reefer';const arr=v.soc-R.traction-(reef?reeferPct(R):0);if(reef&&arr<0)continue;
      if(s.cls){const i=cars.indexOf(id);const nb=[cars[i-1],cars[i+1]].filter(Boolean).map(x=>{const cc=x in cargo?cargo[x]:cargoOf(vById(x));return cc&&cc.t&&cc.type==='haz'?cc.cls:null;});
        if(nb.some(k=>hazBad(s.cls,k)))continue;}
      cargo[id]={shp:s.id,type:s.type,t,cls:s.cls,reefer:reef,desc:s.desc,block:s.dest};after+=t;
      placed.push({shp:s,car:id,gross:g,axle:g/AXLES,note:reef?`Reefer draw ${R.reeferKW} kW; ${id} reaches ${pl.to} at ${Math.round(arr)}%`:`${fx(g)} t gross on ${id}`});done=true;break;}
    if(done)continue;
    // nothing in the consist: explain why
    const inPlan=cars.map(x=>carRow(x,R,cargo)).filter(r=>!r.missing);
    const hz=s.cls?inPlan.filter(r=>r.cls&&hazBad(s.cls,r.cls)):[];
    const spare=sparesFor(pl).find(v=>{const c=cargoOf(v);return (!c||!c.t)&&blockOf(v)===s.dest&&v.soc>=R.floor&&compatible(s,v.ctype||ctypeFor(v.id));});
    const lenNow=planChecks(pl,R,{cars,cargo}).length;
    if(hz.length)held.push({shp:s,reason:`Cl ${s.cls} needs a buffer from ${hz.map(r=>r.id+' (Cl '+r.cls+')').join(' and ')}; no free car qualifies.`,short:'Held · no buffer-compliant car'});
    else if(spare){const L=lenNow+CTYPES[spare.ctype||ctypeFor(spare.id)].len+CAR_GAP;const lim=Math.min(R.len,DLEN[pl.dtrack]||172);
      if(L>lim)held.push({shp:s,reason:`A free ${(spare.ctype||ctypeFor(spare.id)).toLowerCase()} (${spare.id}) would push ${pl.id} back to ${fx(L)} m.`,short:`Held for the next ${s.dest} departure`});
      else held.push({shp:s,reason:`Add ${spare.id} from spares to carry it.`,short:'Held · needs a spare car'});}
    else held.push({shp:s,reason:`No empty ${s.dest} car that takes ${CARGO[s.type].name.toLowerCase()}.`,short:`Held · no empty ${s.dest} car`});}
  return {placed,held,before,after,cargo};}
function ownedIds(except){const s=new Set();for(const p of S.asm.plans)if(p.id!==except&&p.status!=='departed')for(const c of p.cars)s.add(c);return s;}
// --------- seeding: staged PL-52 cars + spares parked on reserved bowl tracks B-12 / B-11
function placeStaged(id,ct,soc,block,T,slot){const e=EDGES[T.edge];const v={id,route:[T.edge],ri:0,s:e.len-STOPOFF-slot*(LEN+GAP),v:0,len:LEN,soc,block,state:'classified',platoon:null,target:T,
  spawnT:0,classT:0,chargedT:0,res:[],wait:0,blocked:false,thru:false,spawned:true,staged:true,ctype:ct};S.veh.push(v);T.assigned++;return v;}
function asmSeed(){S.asm={rules:Object.assign({},RULES_DEF),cargo:{},queue:SEED_QUEUE.map(q=>Object.assign({},q)),
    plans:[{id:'PL-52',from:'STL',to:'MEM',blocks:['STL','MEM'],dtrack:'D02',dep:8400,cars:SEED_CARS.map(c=>c[0]),status:'draft',wait:'',sentT:null,actualT:null}]};
  const T12=TRACKBY['B-12'],T11=TRACKBY['B-11'];for(const T of [T12,T11])Object.assign(T,{key:'PLAN',closed:true,res:true});
  SEED_CARS.forEach((c,i)=>{placeStaged(c[0],c[1],c[2],c[3],T12,i);const g=c[4];S.asm.cargo[c[0]]=Object.assign({},g,{desc:g.desc||CARGO[g.type].name});});
  SEED_SPARES.forEach((c,i)=>{placeStaged(c[0],c[1],c[2],c[3],T11,i);S.asm.cargo[c[0]]=null;});}
// --------- sim side: commit sent plans, pull their cars in consist order, marshal, depart
const DEP_EDGES=new Set(['Wd14','Yd1','D01','D02','D03','Zd1','Zd2']);
function planActive(p){return p.status==='sent'||p.status==='pulling'||p.status==='assembling';}
function asmStep(){
  for(const p of S.asm.plans){
    if(p.status==='draft'||p.status==='departed')continue;
    let q=S.pl[p.id];
    if(p.status==='sent'){
      p.cars=p.cars.filter(id=>{const v=vById(id);return v&&(v.state==='classified'||v.state==='charging')&&!v.dead;});
      if(!p.cars.length){p.status='draft';p.wait='No cars left to send';continue;}
      const d=p.dtrack;const busy=EDGES[d].occ.length>0||Object.values(S.pl).some(o=>o.dtrack===d);
      if(EDGES[d].blocked){p.wait=EDGES[d].track+' blocked (fault)';continue;}
      if(busy){p.wait='Waiting for '+EDGES[d].track+' to clear';continue;}
      const R=S.asm.rules,c=planChecks(p,R);
      q={id:p.id,kind:'out',veh:[],state:'pulling',arrT:S.t,rtrack:null,path:null,dtrack:d,readyT:0,departT:0,dom:p.blocks[p.blocks.length-1],plan:p.id,schedT:p.dep,relay:false,lastDisp:null};
      S.pl[p.id]=q;
      for(const id of p.cars){const v=vById(id);v.plan=p.id;v.platoon=p.id;v.massF=Math.min(1.2,c.gross/R.gross);const r=c.ok.find(x=>x.id===id);v.reefer=!!(r&&r.reef);v.disp=false;if(v.staged)v.spawnT=S.t;q.veh.push(v);}
      // staging tracks have a switcher: re-sequence them so the plan's cars sit at the front in consist order
      for(const eid of new Set(q.veh.map(v=>v.route[v.ri]))){const on=S.veh.filter(v=>v.route[v.ri]===eid&&!v.dead);if(!on.every(v=>v.staged&&v.state==='classified'))continue;
        const ss=on.map(v=>v.s).sort((a,b)=>b-a);const ord=p.cars.map(vById).filter(v=>on.includes(v)).concat(on.filter(v=>!p.cars.includes(v.id)).sort((a,b)=>b.s-a.s));ord.forEach((v,i)=>{v.s=ss[i];});}
      rebuildOcc();
      p.status='pulling';p.wait='';p.gross=c.gross;}
    if(!q){p.status='departed';continue;}
    if(p.status==='pulling'){const und=p.cars.map(vById).filter(v=>v&&!v.disp);
      if(und.length){const last=q.lastDisp?vById(q.lastDisp):null;const le=last?last.route[last.ri]:null;const far=!last||DEP_EDGES.has(le);
        let why='';
        for(const v of und){const e=v.route[v.ri];
          const ahead=S.veh.filter(o=>o!==v&&o.route[o.ri]===e&&o.s>v.s);
          if(ahead.some(o=>!(o.plan===p.id&&o.disp))){if(!why)why=`${v.id} blocked in on ${EDGES[e].track}`;continue;}
          if(!far&&!(le===e)){why=why||'Pulling';continue;}
          const path=pathBetween(e,q.dtrack);if(!path){why=`No route to ${EDGES[q.dtrack].track} (fault)`;continue;}
          releaseAhead(v);v.route=v.route.slice(0,v.ri).concat(path);v.state='pulling';v.disp=true;
          const T=v.target;if(T){T.assigned--;if(T.assigned<=0){T.assigned=0;T.key=null;T.closed=false;T.res=false;}}v.target=null;q.lastDisp=v.id;why='';break;}
        p.wait=why;}
      if(q.state==='assembling')p.status='assembling';}
    if(p.status==='assembling'&&q.state==='departing'){p.status='departing';p.actualT=S.t;}
    if(p.status==='departing'&&!S.pl[p.id]){p.status='departed';}}
  // keep the reserved staging tracks reserved while staged cars remain
  for(const T of BOWL)if(T.res&&T.assigned<=0){T.res=false;T.key=null;T.closed=false;T.assigned=0;}}
function marshal(q){const p=S.asm.plans.find(x=>x.id===q.plan);if(!p)return;const vs=p.cars.map(vById).filter(v=>v&&v.route[v.ri]===q.dtrack);
  const ss=vs.map(v=>v.s).sort((a,b)=>b-a);vs.forEach((v,i)=>{v.s=ss[i];});rebuildOcc();}
function ownedSet(){const s=new Set();for(const p of S.asm.plans)if(p.status!=='departed')for(const c of p.cars)s.add(c);return s;}
