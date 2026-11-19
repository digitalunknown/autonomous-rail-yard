<script>
(function(){
'use strict';
const p2=n=>String(n).padStart(2,'0');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function fmtT(t){t=Math.max(0,Math.floor(t));return 'T+'+p2(Math.floor(t/3600))+':'+p2(Math.floor(t/60)%60)+':'+p2(t%60);}
let seed=7;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function gauss(){const u=rnd()||1e-9,v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}

// ---------------- parameters
const DEF={rate:8,hump:4,size:6,socThr:25,chargeOn:true,rule:'dest'};
const P=Object.assign({},DEF);
const DT=0.5, LEN=12, GAP=3, STOPOFF=4, THROW=4, RESV=60, LOOK=120, BIN=300;
const SIM_PER_SEC=15;           // sim-seconds per real second at 1x
const PULL_TIMEOUT=40*60, INSPECT=180, ASSEMBLE=120, CHG_RATE=3/60, CHG_FULL=85, TARGET_DWELL=75*60, FAULT_HOLD=25*60, FAULT_SPEED=2;
const BLOCKS=[['CHI','Chicago',.24],['KCY','Kansas City',.18],['MEM','Memphis',.17],['DAL','Dallas',.15],['ATL','Atlanta',.14],['STL','St. Louis',.12]];
const BLOCKNAME=Object.fromEntries(BLOCKS.map(b=>[b[0],b[1]]));
const BANDS={MIX:'MIXED',S1:'SoC <35',S2:'SoC 35–55',S3:'SoC 55–75',S4:'SoC 75+',FIFO:'FIFO',CHG:'CHARGE'};
function pickBlock(){let r=rnd();for(const b of BLOCKS){if((r-=b[2])<=0)return b[0];}return 'CHI';}

// ---------------- track graph
const NODES={},EDGES={},EL=[];
function N(id,x,y){NODES[id]={id,x,y,in:[],out:[],sw:null};}
function E(id,a,b,mid,o){o=o||{};const A=NODES[a],B=NODES[b];
  const pts=[[A.x,A.y]].concat(mid||[],[[B.x,B.y]]);const cum=[0];let L=0;
  for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(L);}
  const e={id,from:A,to:B,pts,cum,len:L,track:o.track||'',kind:o.kind||'yard',vmax:o.v||1.4,stub:!!o.stub,occ:[]};
  EDGES[id]=e;EL.push(e);A.out.push(e);B.in.push(e);return e;}
// main lines
N('A0',-40,34);N('X01',230,34);N('ML1E',1190,34);
E('ML1a','A0','X01',null,{track:'ML1',kind:'main',v:3});E('ML1b','X01','ML1E',null,{track:'ML1',kind:'main',v:3});
N('B0',1190,52);N('IX',900,52);N('PSe',700,52);N('PSw',420,52);N('S0',40,52);N('B9',-40,52);
const M2o={track:'ML2',kind:'main',v:3};
E('ML2a','B0','IX',null,M2o);E('ML2b','IX','PSe',null,M2o);E('ML2c','PSe','PSw',null,M2o);E('ML2d','PSw','S0',null,M2o);E('ML2e','S0','B9',null,M2o);
N('INDe',800,70);E('IND01','IX','INDe',[[882,70]],{track:'IND-01',kind:'deco',stub:1});
E('PS01','PSe','PSw',[[682,70],[438,70]],{track:'PS-01',kind:'deco'});
N('SL1',88,100);N('SL2',106,118);N('SL1e',200,100);N('SL2e',200,118);N('SL3e',200,136);
E('SLd1','S0','SL1',null,{track:'Storage ladder',kind:'deco'});E('SL01','SL1','SL1e',null,{track:'SL-01',kind:'deco',stub:1});
E('SLd2','SL1','SL2',null,{track:'Storage ladder',kind:'deco'});E('SL02','SL2','SL2e',null,{track:'SL-02',kind:'deco',stub:1});
E('SL03','SL2','SL3e',[[124,136]],{track:'SL-03',kind:'deco',stub:1});
// receiving yard
N('RX1',296,100);N('RX2',314,118);N('RX3',332,136);N('M1',700,100);N('M2',718,118);N('M3',736,136);N('M4',754,154);N('CR',1040,214);
E('RL','X01','RX1',null,{track:'Entry lead',kind:'ladder',v:1.6});
E('R01','RX1','M1',null,{track:'R-01',kind:'yard',v:1.6});E('Rd1','RX1','RX2',null,{track:'Receiving ladder',kind:'ladder',v:1.6});
E('R02','RX2','M2',null,{track:'R-02',kind:'yard',v:1.6});E('Rd2','RX2','RX3',null,{track:'Receiving ladder',kind:'ladder',v:1.6});
E('R03','RX3','M3',null,{track:'R-03',kind:'yard',v:1.6});E('R04','RX3','M4',[[350,154]],{track:'R-04',kind:'yard',v:1.6});
E('Md1','M1','M2',null,{track:'Receiving ladder',kind:'ladder',v:1.2});E('Md2','M2','M3',null,{track:'Receiving ladder',kind:'ladder',v:1.2});E('Md3','M3','M4',null,{track:'Receiving ladder',kind:'ladder',v:1.2});
E('LEAD','M4','CR',[[1010,154],[1040,184]],{track:'Hump lead RA-01',kind:'lead',v:1.2});
// bowl
for(let k=1;k<=14;k++){const y=250+16*(k-1);if(k<=13)N('X'+k,1004-16*(k-1),y);N('W'+k,600-16*(k-1),y);}
E('Bd0','CR','X1',null,{track:'Bowl ladder',kind:'ladder',v:2});
for(let k=1;k<=12;k++)E('Bd'+k,'X'+k,'X'+(k+1),null,{track:'Bowl ladder',kind:'ladder',v:2});
for(let k=1;k<=12;k++)E('B'+p2(k),'X'+k,'W'+k,null,{track:'B-'+p2(k),kind:'bowl',v:1.4});
E('CH01','X13','W13',null,{track:'CH-01',kind:'charge',v:1.2});
E('CH02','X13','W14',[[796,458]],{track:'CH-02',kind:'charge',v:1.2});
for(let k=1;k<=13;k++)E('Wd'+k,'W'+k,'W'+(k+1),null,{track:'Trim ladder',kind:'ladder',v:1.4});
// departure
N('Y1',360,490);N('Y2',344,506);N('Z1',110,490);N('Z2',94,506);N('Z3',78,522);N('EXn',-40,522);
E('Wd14','W14','Y1',null,{track:'Trim lead',kind:'ladder',v:1.4});
E('D01','Y1','Z1',null,{track:'D-01',kind:'dep',v:1.4});E('Yd1','Y1','Y2',null,{track:'Departure ladder',kind:'ladder',v:1.4});
E('D02','Y2','Z2',null,{track:'D-02',kind:'dep',v:1.4});E('D03','Y2','Z3',[[328,522]],{track:'D-03',kind:'dep',v:1.4});
E('Zd1','Z1','Z2',null,{track:'Departure ladder',kind:'ladder',v:1.6});E('Zd2','Z2','Z3',null,{track:'Departure ladder',kind:'ladder',v:1.6});
E('EXIT','Z3','EXn',null,{track:'Exit → ML2 W',kind:'main',v:2.6});
// switches
const SWN={X01:'X-01',RX1:'X-02',RX2:'X-03',RX3:'X-04',M2:'X-05',M3:'X-06',M4:'X-07',Y1:'X-41',Y2:'X-42',Z2:'X-45',Z3:'X-46',PSe:'X-91',PSw:'X-92',IX:'X-93',S0:'X-94',SL1:'X-95',SL2:'X-96'};
for(let k=1;k<=13;k++)SWN['X'+k]='X-'+(20+k);for(let k=2;k<=14;k++)SWN['W'+k]='X-'+(48+k);
const SWITCHES=[];
for(const n of Object.values(NODES)){
  if(n.out.length>1)n.sw={type:'split'};else if(n.in.length>1)n.sw={type:'merge'};
  if(n.sw){n.sw.id=SWN[n.id]||n.id;n.sw.node=n;n.sw.def=n.sw.type==='split'?n.out[0].id:n.in[0].id;n.sw.deco=(n.sw.type==='split'?n.out:n.in).some(e=>e.kind==='deco');SWITCHES.push(n.sw);}
}
const FAULT_SW=NODES.X4.sw; // X-24
const R_IDS=['R01','R02','R03','R04'], D_IDS=['D01','D02','D03'];
const BOWL=[],CH=[];
for(let k=1;k<=12;k++)BOWL.push({id:'B-'+p2(k),edge:'B'+p2(k),k,isCH:false});
CH.push({id:'CH-01',edge:'CH01',k:13,isCH:true},{id:'CH-02',edge:'CH02',k:14,isCH:true});
const TRACKS=BOWL.concat(CH);
for(const T of TRACKS)T.cap=Math.floor((EDGES[T.edge].len-24)/15);

function pointAt(e,s){s=clamp(s,0,e.len);let i=1;while(i<e.cum.length-1&&e.cum[i]<s)i++;
  const a=e.pts[i-1],b=e.pts[i],d=e.cum[i]-e.cum[i-1],f=d?(s-e.cum[i-1])/d:0;
  return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[1]-a[1],b[0]-a[0])];}
function subPath(e,a,b){const out=[pointAt(e,a)];for(let i=1;i<e.cum.length-1;i++)if(e.cum[i]>a&&e.cum[i]<b)out.push(e.pts[i]);out.push(pointAt(e,b));return out;}

// path cache (cleared when faults change)
const PC=new Map();
function pathBetween(a,b){const key=a+'>'+b;if(PC.has(key))return PC.get(key);
  const prev={};prev[a]=null;const q=[a];let h=0;
  while(h<q.length){const id=q[h++];if(id===b)break;const n=EDGES[id].to;if(n.sw&&n.sw.failed)continue;
    for(const o of n.out)if(!(o.id in prev)){prev[o.id]=id;q.push(o.id);}}
  let p=null;if(b in prev){p=[];for(let c=b;c!==null;c=prev[c])p.push(c);p.reverse();}
  PC.set(key,p);return p;}

// ---------------- state
let S;
function newState(){
  seed=7;PC.clear();
  S={t:0,veh:[],pending:[],pendingThru:[],pl:{},nextPl:11,nextPv:401,arrAcc:0,arrNext:.35,thruAcc:900,thruNext:1500,
     humpPl:null,pullPl:null,exitPl:null,crestHold:false,faultOn:false,faultT:0,departed:[],processed:0,sorted:0,
     bins:[],dbins:[],qbins:[],jams:[],faults:[],jamOn:false,queue:0,diverted:0,qML:0,qHump:0,qFault:0,stepN:0};
  for(const T of TRACKS)Object.assign(T,{key:null,assigned:0,inbound:0,closed:false});
  for(const sw of SWITCHES)Object.assign(sw,{resBy:null,throwUntil:-1,failed:false,lined:sw.def,throws:0});
  for(const e of EL)e.occ.length=0;
}
function newPlatoon(kind){let id,guard=0;do{id='PL-'+p2(S.nextPl);S.nextPl=S.nextPl>=899?11:S.nextPl+1;}while(S.pl[id]&&++guard<1000);
  const pl={id,kind,veh:[],state:kind==='in'?'inbound':kind==='thru'?'through':'pulling',arrT:S.t,rtrack:null,path:null,dtrack:null,readyT:0,departT:0,dom:null};
  S.pl[id]=pl;return pl;}
function makeVeh(pl,thru){return {id:'PV-'+String(S.nextPv++).padStart(4,'0'),route:[],ri:0,s:LEN,v:0,len:LEN,
  soc:clamp(58+gauss()*18,8,98),block:pickBlock(),state:thru?'through':'inbound',platoon:pl.id,target:null,
  spawnT:S.t,classT:0,chargedT:0,res:[],wait:0,blocked:false,thru:!!thru,spawned:false};}
const MAX_BACKLOG=150;
function spawnPlatoon(){if(S.pending.length>=MAX_BACKLOG){S.diverted+=P.size;return;}const pl=newPlatoon('in');for(let i=0;i<P.size;i++){const v=makeVeh(pl);pl.veh.push(v);S.pending.push(v);}}
function spawnThru(){const pl=newPlatoon('thru');const n=4+Math.floor(rnd()*5);for(let i=0;i<n;i++){const v=makeVeh(pl,true);pl.veh.push(v);S.pendingThru.push(v);}}
function canEnter(eid){for(const o of EDGES[eid].occ)if(o.a<LEN+GAP+2)return false;return true;}
function place(v,route){v.route=route;v.ri=0;v.s=LEN;v.v=1.2;v.spawned=true;S.veh.push(v);EDGES[route[0]].occ.push({veh:v,a:0,b:LEN});}

function rebuildOcc(){for(const e of EL)e.occ.length=0;
  for(const v of S.veh){const e=EDGES[v.route[v.ri]];const a=v.s-v.len;e.occ.push({veh:v,a:Math.max(0,a),b:v.s});
    if(a<0&&v.ri>0){const p=EDGES[v.route[v.ri-1]];p.occ.push({veh:v,a:p.len+a,b:p.len});}}}
function releaseAhead(v){v.res=v.res.filter(r=>{if(v.ri<r.idx){if(r.sw.resBy===v)r.sw.resBy=null;return false;}return true;});}
function releaseAll(v){for(const r of v.res)if(r.sw.resBy===v)r.sw.resBy=null;v.res=[];}

function freeDist(v){
  let best=LOOK,acc=-v.s;const R=v.route;
  for(let i=v.ri;i<R.length;i++){
    if(acc>best)break;
    const e=EDGES[R[i]],occ=e.occ;
    for(let j=0;j<occ.length;j++){const o=occ[j];if(o.veh===v)continue;if(i===v.ri&&o.b<=v.s+1e-6)continue;const d=acc+o.a-GAP;if(d<best)best=d;}
    const endD=acc+e.len;
    if(best<endD-GAP-1)break; // someone is between us and the node: never claim it out of turn
    if(i===R.length-1){const d=endD-STOPOFF;if(d<best)best=d;break;}
    const sw=e.to.sw;
    if(sw){
      const want=sw.type==='split'?R[i+1]:e.id;let stop=false;
      if(sw.failed&&!(sw.pass&&sw.pass.has(v)))stop=true;
      else if(sw.resBy&&sw.resBy!==v)stop=true;
      else if(!sw.resBy){
        if(endD<RESV){sw.resBy=v;v.res.push({sw,idx:i+1});if(sw.lined!==want){sw.lined=want;sw.throwUntil=S.t+THROW;sw.throws++;}}
        else stop=true;
      }
      if(!stop&&S.t<sw.throwUntil)stop=true;
      if(stop){const d=endD-GAP-1;if(d<best)best=d;break;}
    }
    acc=endD;
  }
  return best;
}
function moveVeh(v){
  const f=freeDist(v);const e=EDGES[v.route[v.ri]];
  const vmax=e.id==='LEAD'?(S.faultOn?Math.min(P.hump,FAULT_SPEED):P.hump)*0.3:e.vmax;
  const tgt=Math.max(0,Math.min(vmax,f*1.2));
  v.v=tgt>v.v?Math.min(tgt,v.v+0.35*DT):tgt;
  const ds=Math.min(v.v*DT,Math.max(0,f));if(ds<=0){v.v=0;return;}
  v.s+=ds;
  while(v.ri<v.route.length-1&&v.s>EDGES[v.route[v.ri]].len){v.s-=EDGES[v.route[v.ri]].len;v.ri++;}
  const ce=EDGES[v.route[v.ri]];if(v.s>ce.len)v.s=ce.len;
  if(!v.thru)v.soc=Math.max(3,v.soc-0.004*ds);
}

// ---------------- yard control
function keyFor(v){if(P.rule==='dest')return v.block;if(P.rule==='soc')return v.soc<35?'S1':v.soc<55?'S2':v.soc<75?'S3':'S4';return 'FIFO';}
function claim(T,key,v){T.key=key;T.assigned++;T.inbound++;if(key!=='CHG'&&T.assigned>=P.size)T.closed=true;v.target=T;return T;}
function unassign(v){const T=v.target;if(!T)return;T.assigned--;T.inbound--;if(T.assigned<=0){T.assigned=0;T.key=null;T.closed=false;}v.target=null;}
function faultHolding(){return S.faultOn&&S.t-S.faultT<FAULT_HOLD;}
function assignTrack(v,from){
  if(faultHolding())return null; // hump stopped while X-24 is inspected
  if(P.chargeOn&&v.soc<P.socThr)for(const T of CH)if(T.assigned<T.cap&&pathBetween(from,T.edge))return claim(T,'CHG',v);
  let key=keyFor(v);
  // degraded mode while a turnout is failed: cuts with no open track of their own go to one mixed overflow track (a mis-sort)
  if(S.faultOn&&key!=='FIFO'&&!BOWL.some(T=>T.key===key&&!T.closed&&T.assigned<T.cap&&pathBetween(from,T.edge)))key='MIX';
  for(const T of BOWL)if(T.key===key&&!T.closed&&T.assigned<T.cap&&pathBetween(from,T.edge))return claim(T,key,v);
  for(const T of BOWL)if(T.key===null&&T.assigned===0&&pathBetween(from,T.edge))return claim(T,key,v);
  return null;}
function emergencyAssign(v,from){ // stranded cuts must clear the ladder: any reachable bowl track with room
  const S0=S.faultT;S.faultT=-1e9;let T=assignTrack(v,from);S.faultT=S0;if(T)return T;
  for(const B of BOWL)if(B.assigned<B.cap&&pathBetween(from,B.edge))return claim(B,B.key||'MIX',v);
  return null;}
function routeTo(v,edgeId){const p=pathBetween(v.route[v.ri],edgeId);if(!p)return false;releaseAhead(v);v.route=v.route.slice(0,v.ri).concat(p);return true;}
function extend(v,edgeId){const p=pathBetween(v.route[v.route.length-1],edgeId);if(p)v.route=v.route.concat(p.slice(1));return !!p;}
function detach(v){const pl=S.pl[v.platoon];v.platoon=null;if(!pl)return;pl.veh=pl.veh.filter(x=>x!==v);if(!pl.veh.length)delete S.pl[pl.id];}
function mode(a){const c={};let b=null,m=0;for(const x of a){c[x]=(c[x]||0)+1;if(c[x]>m){m=c[x];b=x;}}return b;}
function binIdx(){const bi=Math.floor(S.t/BIN);while(S.bins.length<=bi){S.bins.push(0);S.dbins.push(0);S.qbins.push(0);}return bi;}

function control(){
  // arrivals (platoons/hr, jittered so changes apply live)
  S.arrAcc+=DT*P.rate/3600;
  if(S.arrAcc>=S.arrNext){S.arrAcc-=S.arrNext;S.arrNext=.55+.9*rnd();spawnPlatoon();}
  S.thruAcc+=DT;if(S.thruAcc>=S.thruNext){S.thruAcc=0;S.thruNext=1500+rnd()*1500;spawnThru();}
  if(S.pending.length&&canEnter('ML1a')){const v=S.pending.shift();const pl=S.pl[v.platoon];place(v,pl&&pl.path?pl.path.slice():['ML1a']);}
  if(S.pendingThru.length&&canEnter('ML2a')){place(S.pendingThru.shift(),['ML2a','ML2b','ML2c','ML2d','ML2e']);}
  const pls=Object.values(S.pl);
  // receiving track assignment, in arrival order
  for(const pl of pls){if(pl.kind!=='in'||pl.state!=='inbound'||pl.rtrack)continue;
    const r=R_IDS.find(id=>EDGES[id].occ.length===0&&!pls.some(q=>q.kind==='in'&&q.rtrack===id));
    if(r){pl.rtrack=r;pl.path=pathBetween('ML1a',r);for(const v of pl.veh)if(v.spawned&&v.ri===0)v.route=pl.path.slice();}
    break;}
  // platoon arrived in receiving
  for(const pl of pls)if(pl.kind==='in'&&pl.state==='inbound'&&pl.rtrack&&pl.veh.every(v=>v.spawned&&v.route[v.ri]===pl.rtrack&&v.v<0.05)){
    pl.state='receiving';pl.readyT=S.t+INSPECT;pl.recvT=S.t;for(const v of pl.veh)v.state='receiving';}
  // hump release: one platoon at a time over the receiving exit ladder
  if(S.humpPl){const pl=S.pl[S.humpPl];if(!pl||pl.veh.every(v=>{const i=v.route.indexOf('LEAD');return i>=0&&i<=v.ri;}))S.humpPl=null;}
  if(!S.humpPl){let best=null,bv=Infinity;
    for(const pl of pls){if(pl.kind!=='in'||pl.state!=='receiving'||S.t<pl.readyT)continue;
      const score=P.rule==='soc'?pl.veh.reduce((a,v)=>a+v.soc,0)/pl.veh.length:pl.arrT;if(score<bv){bv=score;best=pl;}}
    if(best){for(const v of best.veh){extend(v,'LEAD');v.state='humping';}best.state='humping';best.fromR=best.rtrack;best.rtrack=null;S.humpPl=best.id;}}
  // hump crest: assign each cut a classification track
  const onLead=S.veh.filter(v=>v.state==='humping'&&v.route[v.ri]==='LEAD'&&v.ri===v.route.length-1).sort((a,b)=>b.s-a.s);
  S.crestHold=false;const LE=EDGES.LEAD;
  for(const v of onLead){if(LE.len-v.s>50)break;const T=assignTrack(v,'LEAD');
    if(!T){S.crestHold=true;break;}
    extend(v,T.edge);v.state='rolling';detach(v);S.sorted++;S.bins[binIdx()]++;}
  // stranded cuts (fault reroute) retry
  if(S.stepN%10===0)for(const v of S.veh)if(v.state==='rolling'&&!v.target){const T=emergencyAssign(v,v.route[v.ri]);if(T&&!routeTo(v,T.edge))unassign(v);}
  // classified on arrival
  for(const v of S.veh)if(v.state==='rolling'&&v.target&&v.ri===v.route.length-1&&v.route[v.ri]===v.target.edge&&v.v<0.05){
    v.state=v.target.isCH?'charging':'classified';v.classT=S.t;v.target.inbound--;}
  // pulls: bowl track -> departure track, one at a time over the trim ladder
  if(S.pullPl){const pl=S.pl[S.pullPl];if(!pl||pl.veh.every(v=>v.route[v.ri]===pl.dtrack))S.pullPl=null;}
  if(!S.pullPl){const d=D_IDS.find(id=>EDGES[id].occ.length===0&&!Object.values(S.pl).some(q=>q.dtrack===id));
    if(d){let best=null,bt=Infinity,bl=null;
      for(const T of BOWL){if(!T.key||T.inbound>0)continue;const list=S.veh.filter(v=>v.target===T&&v.state==='classified');if(!list.length)continue;
        let old=Infinity;for(const v of list)old=Math.min(old,v.classT);
        if((T.closed||S.t-old>PULL_TIMEOUT)&&old<bt&&pathBetween(T.edge,d)){best=T;bt=old;bl=list;}}
      for(const T of CH){const list=S.veh.filter(v=>v.target===T&&v.state==='charging').sort((a,b)=>b.s-a.s);const pre=[];
        for(const v of list){if(v.soc>=CHG_FULL)pre.push(v);else break;}if(!pre.length)continue;
        let old=Infinity;for(const v of pre)old=Math.min(old,v.chargedT);
        if((pre.length>=P.size||S.t-old>900)&&old<bt&&pathBetween(T.edge,d)){best=T;bt=old;bl=pre;}}
      if(best){const list=bl.sort((a,b)=>b.s-a.s).slice(0,P.size);const pl=newPlatoon('out');pl.dtrack=d;pl.fromT=best.id;
        pl.dom=mode(list.map(v=>v.block));pl.relay=best.isCH;
        for(const v of list){extend(v,d);v.state='pulling';v.platoon=pl.id;v.target=null;pl.veh.push(v);}
        best.assigned-=list.length;if(best.assigned<=0){best.assigned=0;best.key=null;best.closed=false;}else best.closed=best.key!=='CHG'&&best.assigned>=P.size;
        S.pullPl=pl.id;}}}
  // departure assembly + exit, one at a time over the departure ladder
  for(const pl of Object.values(S.pl))if(pl.kind==='out'&&pl.state==='pulling'&&pl.veh.every(v=>v.route[v.ri]===pl.dtrack&&v.ri===v.route.length-1&&v.v<0.05)){
    pl.state='assembling';pl.departT=S.t+ASSEMBLE;for(const v of pl.veh)v.state='assembling';}
  if(S.exitPl){const pl=S.pl[S.exitPl];if(!pl||pl.veh.every(v=>v.route[v.ri]==='EXIT'))S.exitPl=null;}
  if(!S.exitPl){let best=null;for(const pl of Object.values(S.pl))if(pl.kind==='out'&&pl.state==='assembling'&&S.t>=pl.departT&&(!best||pl.departT<best.departT))best=pl;
    if(best){for(const v of best.veh){extend(v,'EXIT');v.state='departing';}best.state='departing';best.fromD=best.dtrack;best.dtrack=null;S.exitPl=best.id;}}
}
const MOVING=new Set(['inbound','humping','rolling','pulling','departing','through']);
function atDest(v){if(v.ri!==v.route.length-1)return false;const e=v.route[v.ri];
  return (v.state==='inbound'&&R_IDS.includes(e))||(v.state==='rolling'&&v.target&&e===v.target.edge)||v.state==='pulling'||v.state==='departing'||v.state==='through';}
function post(){
  let qML=0,qHump=0,qFault=0;
  for(const v of S.veh){
    if(v.res.length)v.res=v.res.filter(r=>{if(v.ri>r.idx||(v.ri===r.idx&&v.s-v.len>0.5)){if(r.sw.resBy===v)r.sw.resBy=null;return false;}return true;});
    if(v.state==='charging'&&v.v<0.05){v.soc=Math.min(100,v.soc+CHG_RATE*DT);if(v.soc>=CHG_FULL&&!v.chargedT)v.chargedT=S.t;}
    if(MOVING.has(v.state)&&v.v<0.05&&!atDest(v))v.wait+=DT;else v.wait=0;
    v.blocked=v.wait>45;
    if(v.blocked&&!v.thru){if(v.state==='inbound')qML++;else if(v.state==='rolling'&&!v.target)qFault++;else qHump++;}
  }
  const keep=[];
  for(const v of S.veh){const e=v.route[v.ri];
    if((e==='EXIT'&&v.s>EDGES.EXIT.len-16)||(e==='ML2e'&&v.s>EDGES.ML2e.len-16)){
      releaseAll(v);
      if(!v.thru){const pl=S.pl[v.platoon];const dwell=S.t-v.spawnT;const correct=!!pl&&pl.dom===v.block;
        S.departed.push({t:S.t,dwell,ok:correct&&dwell<=TARGET_DWELL});S.processed++;S.dbins[binIdx()]++;}
      detach(v);}else keep.push(v);}
  S.veh=keep;
  while(S.departed.length&&S.departed[0].t<S.t-7200)S.departed.shift();
  S.qML=qML+S.pending.length;S.qHump=qHump;S.qFault=qFault;S.queue=S.qML+qHump+qFault;
  const bi=binIdx();S.qbins[bi]=Math.max(S.qbins[bi],S.queue);
  if(!S.jamOn&&S.queue>=10){S.jamOn=true;S.jams.push({a:S.t,b:null});}
  else if(S.jamOn&&S.queue<=4){S.jamOn=false;S.jams[S.jams.length-1].b=S.t;}
}
window.__faultHolding=()=>faultHolding();
function step(){S.t+=DT;S.stepN++;rebuildOcc();control();for(const v of S.veh)moveVeh(v);post();}
function advance(sec){const n=Math.round(sec/DT);for(let i=0;i<n;i++)step();rebuildOcc();}
function setFault(on){
  if(on===S.faultOn)return;S.faultOn=on;FAULT_SW.failed=on;PC.clear();
  if(on){S.faultT=S.t;S.faults.push({a:S.t,b:null});
    FAULT_SW.pass=new Set();
    for(const v of S.veh){if(v.state!=='rolling')continue;const R=v.route;
      for(let i=v.ri;i<R.length-1;i++)if(EDGES[R[i]].to===FAULT_SW.node){
        // already committed into X-24 (on its approach or holding it): finish the move
        if(i===v.ri||FAULT_SW.resBy===v){FAULT_SW.pass.add(v);break;}
        unassign(v);const T=emergencyAssign(v,R[v.ri]);
        if(!(T&&routeTo(v,T.edge))){if(T)unassign(v);v.route=R.slice(0,i+1);releaseAhead(v);}
        break;}}
  }else{const f=S.faults[S.faults.length-1];if(f)f.b=S.t;}
}
