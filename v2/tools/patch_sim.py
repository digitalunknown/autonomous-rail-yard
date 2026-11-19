f='src/3_sim.js';s=open(f).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)>=1,("missing",a[:80]); s=s.replace(a,b,cnt)
rep("for(const o of n.out)if(!(o.id in prev)){prev[o.id]=id;q.push(o.id);}}",
    "for(const o of n.out)if(!o.blocked&&!(o.id in prev)){prev[o.id]=id;q.push(o.id);}}")
rep("const FAULT_SW=NODES.X4.sw; // X-24",
"""const FAULT_SW=NODES.X4.sw; // X-24
// ---------------- fault injector catalogue
const SWBY=Object.fromEntries(SWITCHES.map(sw=>[sw.id,sw]));
const swNum=id=>+String(id).replace(/\\D/g,'');
const TURNOUTS=SWITCHES.filter(sw=>!sw.deco&&/^X-\\d+$/.test(sw.id)).map(sw=>sw.id).sort((a,b)=>swNum(a)-swNum(b));
const TRACK_TGT=['R01','R02','R03','R04','LEAD','B01','B02','B03','B04','B05','B06','B07','B08','B09','B10','B11','B12','CH01','CH02','D01','D02','D03'];
const FTYPES={turnout:'Turnout stuck',retarder:'Retarder failure',charger:'Charger outage',battery:'Battery drop',track:'Track blocked'};
const RET_SPEED=1.5, RET_GAP=45, TOW_SOC=18;""")
rep("bins:[],dbins:[],qbins:[],jams:[],faults:[],jamOn:false,","bins:[],dbins:[],qbins:[],jams:[],faults:[],flist:[],nextFid:1,crestNext:0,retHold:false,jamOn:false,")
rep("for(const sw of SWITCHES)Object.assign(sw,{resBy:null,throwUntil:-1,failed:false,lined:sw.def,throws:0});\n  for(const e of EL)e.occ.length=0;",
    "for(const sw of SWITCHES)Object.assign(sw,{resBy:null,throwUntil:-1,failed:false,lined:sw.def,throws:0,pass:null});\n  for(const e of EL){e.occ.length=0;e.blocked=false;e.obs=null;}")
rep("    if(a<0&&v.ri>0){const p=EDGES[v.route[v.ri-1]];p.occ.push({veh:v,a:p.len+a,b:p.len});}}}",
    "    if(a<0&&v.ri>0){const p=EDGES[v.route[v.ri-1]];p.occ.push({veh:v,a:p.len+a,b:p.len});}}\n  for(const e of EL)if(e.blocked&&e.obs!=null)e.occ.push({veh:null,a:e.obs-LEN/2,b:e.obs+LEN/2});}")
rep("function moveVeh(v){\n  const f=freeDist(v);","function moveVeh(v){\n  if(v.dead){v.v=0;return;}\n  const f=freeDist(v);")
rep("const vmax=e.id==='LEAD'?(S.faultOn?Math.min(P.hump,FAULT_SPEED):P.hump)*0.3:e.vmax;",
    "const vmax=e.id==='LEAD'?(retarderOn()?Math.min(P.hump,RET_SPEED):S.faultOn?Math.min(P.hump,FAULT_SPEED):P.hump)*0.3:e.vmax;")
rep("function faultHolding(){return S.faultOn&&S.t-S.faultT<FAULT_HOLD;}",
"""let ignoreHold=false;
function faultHolding(){return !ignoreHold&&S.flist.some(f=>f.hold&&S.t-f.a<FAULT_HOLD);}
function degraded(){return S.flist.some(f=>f.type==='turnout'||f.type==='track');}
function retarderOn(){return S.flist.some(f=>f.type==='retarder');}
function chOut(T){return !!T&&S.flist.some(f=>f.type==='charger'&&f.target===T.edge);}""")
rep("if(P.chargeOn&&v.soc<P.socThr)for(const T of CH)if(T.assigned<T.cap&&pathBetween(from,T.edge))return claim(T,'CHG',v);",
    "if(P.chargeOn&&v.soc<P.socThr)for(const T of CH)if(!chOut(T)&&T.assigned<T.cap&&pathBetween(from,T.edge))return claim(T,'CHG',v);")
rep("if(S.faultOn&&key!=='FIFO'&&!BOWL","if(degraded()&&key!=='FIFO'&&!BOWL")
rep("const S0=S.faultT;S.faultT=-1e9;let T=assignTrack(v,from);S.faultT=S0;if(T)return T;","ignoreHold=true;let T=assignTrack(v,from);ignoreHold=false;if(T)return T;")
rep("function control(){\n","function control(){\n  for(const f of S.flist.slice())if(f.dur&&S.t>=f.a+f.dur-1e-9)clearFault(f.id);\n")
rep("const r=R_IDS.find(id=>EDGES[id].occ.length===0&&!pls.some(q=>q.kind==='in'&&q.rtrack===id));",
    "const r=R_IDS.find(id=>EDGES[id].occ.length===0&&!pls.some(q=>q.kind==='in'&&q.rtrack===id)&&pathBetween('ML1a',id));")
rep("for(const pl of pls){if(pl.kind!=='in'||pl.state!=='receiving'||S.t<pl.readyT)continue;",
    "for(const pl of pls){if(pl.kind!=='in'||pl.state!=='receiving'||S.t<pl.readyT||!pathBetween(pl.rtrack,'LEAD'))continue;")
rep("S.crestHold=false;const LE=EDGES.LEAD;\n  for(const v of onLead){if(LE.len-v.s>50)break;const T=assignTrack(v,'LEAD');",
    "S.crestHold=false;S.retHold=false;const LE=EDGES.LEAD;\n  for(const v of onLead){if(LE.len-v.s>50)break;if(retarderOn()&&S.t<S.crestNext){S.retHold=true;break;}const T=assignTrack(v,'LEAD');")
rep("extend(v,T.edge);v.state='rolling';detach(v);S.sorted++;S.bins[binIdx()]++;}",
    "extend(v,T.edge);v.state='rolling';detach(v);S.sorted++;S.bins[binIdx()]++;if(retarderOn())S.crestNext=S.t+RET_GAP;}")
rep("if(S.stepN%10===0)for(const v of S.veh)if(v.state==='rolling'&&!v.target){",
    "if(S.stepN%10===0)retryHeld();\n  if(S.stepN%10===0)for(const v of S.veh)if(v.state==='rolling'&&!v.target&&!v.dead){")
rep("for(const T of BOWL){if(!T.key||T.inbound>0)continue;","for(const T of BOWL){if(!T.key||T.inbound>0||EDGES[T.edge].blocked)continue;")
rep("for(const T of CH){const list=","for(const T of CH){if(EDGES[T.edge].blocked)continue;const list=")
rep("for(const v of list){if(v.soc>=CHG_FULL)pre.push(v);else break;}","for(const v of list){if(v.soc>=CHG_FULL&&!v.dead)pre.push(v);else break;}")
rep("const list=S.veh.filter(v=>v.target===T&&v.state==='classified');","const list=S.veh.filter(v=>v.target===T&&v.state==='classified'&&!v.dead);")
rep("S.t>=pl.departT&&(!best||pl.departT<best.departT))best=pl;","S.t>=pl.departT&&pathBetween(pl.dtrack,'EXIT')&&!pl.veh.some(v=>v.dead)&&(!best||pl.departT<best.departT))best=pl;")
rep("if(v.state==='charging'&&v.v<0.05){","if(v.state==='charging'&&v.v<0.05&&!chOut(v.target)&&!v.dead){")
rep("v.blocked=v.wait>45;\n    if(v.blocked&&!v.thru){","v.blocked=v.wait>45||!!v.dead;\n    if(v.dead&&!v.thru)qFault++;else if(v.blocked&&!v.thru){")
rep("faults:b.faults.map(f=>Object.assign({},f))};}","faults:b.faults.map(f=>Object.assign({},f)),flist:(b.flist||[]).map(f=>Object.assign({},f))};}")
rep("seed=sn.seed;Object.assign(P,sn.P);PC.clear();rebuildOcc();","seed=sn.seed;Object.assign(P,sn.P);syncFaultFlags(true);rebuildOcc();")
rep("EVTS.push({t:S.t,P:JSON.stringify(P),fault:S.faultOn});}","EVTS.push({t:S.t,P:JSON.stringify(P),F:JSON.stringify(S.flist)});}")
rep("function applyEvt(e){Object.assign(P,JSON.parse(e.P));setFault(e.fault);HIST.pv=(HIST.pv||0)+1;}",
    "function applyEvt(e){Object.assign(P,JSON.parse(e.P));syncFaultsTo(JSON.parse(e.F));HIST.pv=(HIST.pv||0)+1;}")
rep("+'#'+TRACKS.map(T=>T.key+T.assigned).join(',');}",
    "+'#'+TRACKS.map(T=>T.key+T.assigned).join(',')+'#'+S.flist.map(f=>f.id+f.type+f.target).join(',')+'#'+S.veh.filter(v=>v.dead||v.held).map(v=>v.id+(v.dead?'d':'')+(v.held||'')).join(',');}")
a=s.index("function setFault(on){")
b=a+s[a:].index("\n}\n")+3
s=s[:a]+open('tools/engine.js').read()+s[b:]
open(f,'w').write(s)
print('ok')
