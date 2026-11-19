// ---------------- fault engine: every fault lives in S.flist (recorded state); element flags are derived from it
function fLabel(f){if(f.type==='turnout')return f.target==='X-24'?'X-24 FAULT':f.target+' STUCK';if(f.type==='retarder')return 'RETARDER FAIL';
  if(f.type==='charger')return EDGES[f.target].track+' OUTAGE';if(f.type==='battery')return f.target+' BATTERY';return EDGES[f.target].track+' BLOCKED';}
function syncFaultFlags(keepPass){
  const tf=new Set(S.flist.filter(f=>f.type==='turnout').map(f=>f.target));
  for(const sw of SWITCHES){sw.failed=tf.has(sw.id);if(!sw.failed&&!keepPass)sw.pass=null;}
  for(const e of EL){e.blocked=false;e.obs=null;}
  for(const f of S.flist)if(f.type==='track'){const e=EDGES[f.target];e.blocked=true;e.obs=f.pos;}
  const x=S.flist.find(f=>f.type==='turnout'&&f.target==='X-24');S.faultOn=!!x;if(x)S.faultT=x.a;
  PC.clear();}
function obsPos(e){ // obstruction point on a blocked track: first clear spot from ~30% in
  const occ=S.veh.filter(v=>v.route[v.ri]===e.id).map(v=>[v.s-v.len-GAP,v.s+GAP]);
  for(let p=Math.max(LEN,e.len*.3);p<e.len-LEN;p+=4){if(!occ.some(([a,b])=>p+LEN/2>a&&p-LEN/2<b))return Math.round(p*2)/2;}
  return Math.round(e.len*.3*2)/2;}
function validFault(sp){const t=sp.type,g=sp.target;
  if(t==='turnout')return TURNOUTS.includes(g);if(t==='retarder')return g==='LEAD';if(t==='charger')return g==='CH01'||g==='CH02';
  if(t==='track')return TRACK_TGT.includes(g);if(t==='battery')return S.veh.some(v=>v.id===g&&!v.thru);return false;}
function pickVeh(){const c=S.veh.filter(v=>!v.thru&&!v.dead&&v.spawned);if(!c.length)return null;
  const mv=c.filter(v=>v.v>0.05&&MOVING.has(v.state));const L=mv.length?mv:c;return L[(S.stepN*7)%L.length].id;}
function injectFault(sp){sp=Object.assign({},sp);
  if(sp.type==='retarder')sp.target='LEAD';
  if(sp.type==='battery'&&(!sp.target||sp.target==='random'))sp.target=pickVeh();
  if(!validFault(sp))return null;
  if(S.flist.some(f=>f.type===sp.type&&f.target===sp.target))return null;
  const id=sp.id||('F'+S.nextFid);S.nextFid=Math.max(S.nextFid,+id.slice(1)+1);
  const f={id,type:sp.type,target:sp.target,a:S.t,dur:+sp.dur||0,hold:!!sp.hold};
  if(f.type==='track')f.pos=sp.pos!=null?sp.pos:obsPos(EDGES[f.target]);
  f.label=fLabel(f);S.flist.push(f);S.faults.push({a:S.t,b:null,fid:id,kind:f.label,type:f.type});
  if(f.type==='battery'){const v=S.veh.find(x=>x.id===f.target);v.dead=true;v.socPre=v.soc;v.soc=Math.min(v.soc,3);}
  syncFaultFlags();
  if(f.type==='turnout'||f.type==='track')rerouteAround();
  if(f.type==='charger')for(const v of S.veh)if(v.state==='rolling'&&v.target&&v.target.edge===f.target){unassign(v);const T=emergencyAssign(v,v.route[v.ri]);if(T&&!routeTo(v,T.edge))unassign(v);}
  rebuildOcc();return f;}
function clearFault(id){const i=S.flist.findIndex(f=>f.id===id);if(i<0)return false;const f=S.flist[i];S.flist.splice(i,1);
  const tl=S.faults.find(x=>x.fid===id&&x.b==null);if(tl)tl.b=S.t;
  if(f.type==='battery'){const v=S.veh.find(x=>x.id===f.target);if(v){v.dead=false;v.soc=Math.max(v.soc,TOW_SOC);v.wait=0;}}
  syncFaultFlags();retryHeld();rebuildOcc();return true;}
function syncFaultsTo(list){
  for(const f of S.flist.slice())if(!list.some(d=>d.id===f.id))clearFault(f.id);
  for(const d of list)if(!S.flist.some(f=>f.id===d.id))injectFault(d);}
function cutIndex(v){const R=v.route;
  for(let i=v.ri;i<R.length;i++){const e=EDGES[R[i]];
    if(i>v.ri&&e.blocked)return i-1;
    if(i<R.length-1){const sw=e.to.sw;if(sw&&sw.failed){if(i===v.ri||sw.resBy===v){(sw.pass=sw.pass||new Set()).add(v);continue;}if(!(sw.pass&&sw.pass.has(v)))return i;}}}
  return -1;}
function rerouteAround(){
  // inbound platoons: move to another receiving track if theirs is cut off
  for(const pl of Object.values(S.pl))if(pl.kind==='in'&&pl.state==='inbound'&&pl.rtrack&&!pathBetween('ML1a',pl.rtrack))reassignInbound(pl);
  for(const v of S.veh){if(v.thru||v.dead)continue;const c=cutIndex(v);if(c<0)continue;const R=v.route;
    if(v.state==='rolling'&&v.target){unassign(v);const T=emergencyAssign(v,R[v.ri]);if(T&&routeTo(v,T.edge)&&cutIndex(v)<0)continue;if(v.target)unassign(v);}
    const goal=v.held||R[R.length-1];v.route=R.slice(0,c+1);releaseAhead(v);if(v.state!=='rolling')v.held=goal;}}
function reassignInbound(pl){const pls=Object.values(S.pl);
  const r=R_IDS.find(id=>id!==pl.rtrack&&EDGES[id].occ.length===0&&!pls.some(q=>q!==pl&&q.kind==='in'&&q.rtrack===id)&&pathBetween('ML1a',id));
  if(!r)return false;pl.rtrack=r;pl.path=pathBetween('ML1a',r);
  for(const v of pl.veh)if(v.spawned){const p=pathBetween(v.route[v.ri],r);if(p){releaseAhead(v);v.route=v.route.slice(0,v.ri).concat(p);v.held=null;}else v.held=r;}
  return true;}
function retryHeld(){
  for(const pl of Object.values(S.pl))if(pl.kind==='in'&&pl.state==='inbound'&&pl.rtrack&&!pathBetween('ML1a',pl.rtrack))reassignInbound(pl);
  for(const v of S.veh){if(!v.held||v.dead)continue;
    if(v.state==='inbound'){const pl=S.pl[v.platoon];if(pl&&pl.rtrack)v.held=pl.rtrack;}
    const p=pathBetween(v.route[v.ri],v.held);if(p){releaseAhead(v);v.route=v.route.slice(0,v.ri).concat(p);v.held=null;}}}
// X-24 preset (the original single fault): stuck points + 25 min hump inspection hold
function setFault(on){
  const x=S.flist.find(f=>f.type==='turnout'&&f.target==='X-24');
  if(on&&!x)injectFault({type:'turnout',target:'X-24',hold:true});else if(!on&&x)clearFault(x.id);}
