// ---------------- rendering
const MONO=getComputedStyle(document.documentElement).getPropertyValue('--mono').trim()||'monospace';
const C={bg:'#0a0c0f',main:'#8b939d',yard:'#434b55',ladder:'#4a525c',lead:'#5d6670',deco:'#353c44',charge:'#6b737d',
  lime:'#c6f432',cobalt:'#3d6bff',yellow:'#f5c542',red:'#ff4b3e',label:'#69727d',dim:'#4d5560',text:'#e9edf1'};
const LAYERS={routes:true,signals:true,ids:true,tags:true};
const WB={x0:-6,x1:1150,y0:12,y1:546};
const mapC=document.getElementById('map'),mctx=mapC.getContext('2d');
const tlC=document.getElementById('tl'),tctx=tlC.getContext('2d');
const stat=document.createElement('canvas'),sctx=stat.getContext('2d');
let VW=0,VH=0,DPR=1,K=1,OX=0,OY=0,Kfit=1,FOX=0,FOY=0;
const view={z:1,cx:(WB.x0+WB.x1)/2,cy:(WB.y0+WB.y1)/2},ZMIN=.75,ZMAX=4;
let TZ=1,SZ=1,VZ=1,SGZ=1,staticDirty=true; // world-unit multipliers so text/strokes grow gently with zoom
const miniC=document.getElementById('mini'),nctx=miniC.getContext('2d');let MINI=null;
let selected=null,hitTags=[];
// colour roles: lime = moving/flowing, yellow = low battery (warning), red = blocked, cobalt = selected; everything else neutral
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const NEUTRAL=[170,179,189],YEL=[245,197,66],LIM=[198,244,50];
function socLow(s){return s<Math.max(20,P.socThr);}
function socColor(s,al){const c=socLow(s)?YEL:NEUTRAL;return al==null?`rgb(${c})`:`rgba(${c},${al})`;}
function vehRGB(v){if(v.state==='charging'||socLow(v.soc))return YEL;if(v.v>0.05&&!v.blocked)return LIM;return NEUTRAL;}
function vehColor(v,al){const c=vehRGB(v);return al==null?`rgb(${c})`:`rgba(${c},${al})`;}
function setFont(ctx,sz,w){ctx.font=`${w||500} ${sz}px ${MONO}`;}
function W2S(x,y){return [x*K+OX,y*K+OY];}
function S2W(x,y){return [(x-OX)/K,(y-OY)/K];}
function applyView(){view.z=clamp(view.z,ZMIN,ZMAX);view.cx=clamp(view.cx,WB.x0,WB.x1);view.cy=clamp(view.cy,WB.y0,WB.y1);
  K=Kfit*view.z;OX=VW/2-view.cx*K;OY=VH/2-view.cy*K;const z=view.z;
  TZ=Math.pow(z,-.65);SZ=Math.pow(z,-.5);VZ=Math.pow(z,-.3);SGZ=Math.pow(z,-.45);staticDirty=true;}
function fitView(){view.z=1;view.cx=(WB.x0+WB.x1)/2;view.cy=(WB.y0+WB.y1)/2;applyView();}
function zoomAt(f,sx,sy){const[wx,wy]=S2W(sx,sy);view.z=clamp(view.z*f,ZMIN,ZMAX);const k=Kfit*view.z;view.cx=wx-(sx-VW/2)/k;view.cy=wy-(sy-VH/2)/k;applyView();}
function zoomTo(z){zoomAt(z/view.z,VW/2,VH/2);}
function panBy(dx,dy){view.cx-=dx/K;view.cy-=dy/K;applyView();}
function centerOn(wx,wy){view.cx=wx;view.cy=wy;applyView();}

function resize(){
  const box=document.getElementById('mapbox');DPR=window.devicePixelRatio||1;VW=box.clientWidth;VH=box.clientHeight;
  for(const c of [mapC,stat]){c.width=Math.round(VW*DPR);c.height=Math.round(VH*DPR);}
  Kfit=Math.min((VW-20)/(WB.x1-WB.x0),(VH-16)/(WB.y1-WB.y0));
  FOX=(VW-(WB.x1-WB.x0)*Kfit)/2-WB.x0*Kfit;FOY=(VH-(WB.y1-WB.y0)*Kfit)/2-WB.y0*Kfit;
  const dz=document.getElementById('dossier');const dx=6*Kfit+FOX,dy=176*Kfit+FOY;dz.style.left=Math.max(10,dx)+'px';dz.style.top=Math.max(8,dy)+'px';dz.style.maxHeight=Math.max(120,VH-Math.max(8,dy)-12)+'px';
  const tw=tlC.clientWidth,th=tlC.clientHeight;tlC.width=Math.round(tw*DPR);tlC.height=Math.round(th*DPR);
  miniC.width=Math.round(210*DPR);miniC.height=Math.round(100*DPR);
  applyView();
}
function strokePts(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}
function edgeStyle(e){
  if(e.kind==='main')return [C.main,1.7];if(e.kind==='lead')return [C.lead,1.6];if(e.kind==='charge')return [C.charge,1.5];
  if(e.kind==='deco')return [C.deco,1.3];if(e.kind==='ladder')return [C.ladder,1.4];return [C.yard,1.4];}
function label(ctx,txt,x,y,o){o=o||{};setFont(ctx,(o.size||7.5)*TZ,o.w||500);ctx.fillStyle=o.color||C.label;ctx.textAlign=o.align||'left';ctx.textBaseline='middle';
  if('letterSpacing' in ctx)ctx.letterSpacing=((o.ls||0)*TZ)+'px';ctx.fillText(txt,x,y);if('letterSpacing' in ctx)ctx.letterSpacing='0px';}
function drawStatic(){
  const ctx=sctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,stat.width,stat.height);
  ctx.setTransform(DPR*K,0,0,DPR*K,DPR*OX,DPR*OY);ctx.lineCap='butt';ctx.lineJoin='miter';
  // sleepers
  ctx.strokeStyle='rgba(140,150,160,.13)';ctx.lineWidth=0.8*SZ;
  for(const e of EL){const step=e.kind==='main'?6:7;for(let s=3;s<e.len;s+=step){const[x,y,a]=pointAt(e,s);const nx=-Math.sin(a)*2.4,ny=Math.cos(a)*2.4;ctx.beginPath();ctx.moveTo(x-nx,y-ny);ctx.lineTo(x+nx,y+ny);ctx.stroke();}}
  for(const e of EL){const[c,w]=edgeStyle(e);ctx.strokeStyle=c;ctx.lineWidth=w*SZ;ctx.setLineDash(e.kind==='charge'?[4,2]:[]);strokePts(ctx,e.pts);}ctx.setLineDash([]);
  // bumpers on stub ends
  for(const e of EL)if(e.stub){const[x,y,a]=pointAt(e,e.len);const nx=-Math.sin(a)*4,ny=Math.cos(a)*4;ctx.strokeStyle='#a3acb6';ctx.lineWidth=2.2*SZ;
    ctx.beginPath();ctx.moveTo(x-nx,y-ny);ctx.lineTo(x+nx,y+ny);ctx.stroke();ctx.fillStyle='#a3acb6';ctx.fillRect(x-1.5-Math.cos(a)*1.5,y-1.5-Math.sin(a)*1.5,3,3);}
  // retarders
  ctx.strokeStyle='#59626c';ctx.lineWidth=0.9*SZ;
  for(const T of TRACKS){const e=EDGES[T.edge];const[x,y]=pointAt(e,T.isCH?40:28);ctx.strokeRect(x-5,y-2.6,10,5.2);}
  // crest marker
  ctx.fillStyle='#8b939d';ctx.beginPath();ctx.moveTo(1046,196);ctx.lineTo(1052,192);ctx.lineTo(1052,200);ctx.closePath();ctx.fill();
  // area labels
  const A={size:7,color:'#68727d',ls:.7};
  label(ctx,'INBOUND · ML1 EAST ▸',2,22,A);label(ctx,'◂ ML2 WEST',1146,64,Object.assign({align:'right'},A));
  label(ctx,'RECEIVING YARD · R-01…R-04',420,88,A);label(ctx,'HUMP LEAD · RA-01',860,144,A);
  label(ctx,'HUMP CREST',1058,196,A);label(ctx,'CLASSIFICATION BOWL · 12 TRACKS',640,238,A);
  label(ctx,'SERVICE · CHARGE CH-01/02',560,472,A);label(ctx,'DEPARTURE YARD · D-01…D-03',120,476,A);
  label(ctx,'STORAGE',40,150,A);label(ctx,'◂ OUTBOUND · TO ML2 W',4,536,A);
  if(LAYERS.ids){
    const L={size:7.5,color:'#7a848f'};
    for(const[t,y] of [['ML1',34],['ML2',52]]){const bw=20*TZ,bh=10*TZ;ctx.fillStyle='#0a0c0f';ctx.strokeStyle='#59626c';ctx.lineWidth=.8*SZ;ctx.fillRect(2,y-bh/2,bw,bh);ctx.strokeRect(2,y-bh/2,bw,bh);label(ctx,t,2+bw/2,y+.3*TZ,{size:7,align:'center',color:'#c3cad1',w:600});}
    R_IDS.forEach((id,i)=>{const e=EDGES[id];label(ctx,'R-0'+(i+1),e.pts[0][0]-6-(i===3?0:0),[100,118,136,154][i],Object.assign({align:'right'},L));});
    for(const T of TRACKS){const e=EDGES[T.edge];const p=e.pts[e.pts.length-1];label(ctx,T.id,p[0]-6,p[1],Object.assign({align:'right'},L));}
    D_IDS.forEach((id,i)=>{label(ctx,'D-0'+(i+1),[368,352,352][i]+(i===2?0:0),[490,506,522][i]-(i===2?0:0),L);});
    label(ctx,'SL-01',206,100,L);label(ctx,'SL-02',206,118,L);label(ctx,'SL-03',206,136,L);
    label(ctx,'PS-01',560,78,L);label(ctx,'IND-01',840,78,L);
    label(ctx,'X-01',232,24,{size:6.5,color:'#5d6670'});
  }
}
// ---- dynamic
const BODY_INSET=0.65; // drawn gap between stopped cars = GAP + 2*inset (was 3+2.2=5.2, now 1.5+1.3=2.8)
function bodyPts(v){const e=EDGES[v.route[v.ri]];const a=v.s-v.len+BODY_INSET,b=v.s-BODY_INSET;
  if(a>=0||v.ri===0)return subPath(e,Math.max(0,a),Math.max(0.01,b));
  const p=EDGES[v.route[v.ri-1]];return subPath(p,Math.max(0,p.len+a),p.len).concat(b>0?subPath(e,0,b):[]);}
function isSel(v){return selected&&((selected.type==='veh'&&selected.id===v.id)||(selected.type==='pl'&&v.platoon===selected.id));}
// aspects: 'go' (green), 'warn' (amber: ready, waiting for clearance), 'stop' (red, routine), 'red' (red, hold/fault)
function sigState(kind,id){
  if(window.__sigOverride){const o=window.__sigOverride(kind,id);if(o)return o;}
  if(kind==='entry')return S.veh.some(v=>v.state==='inbound'&&v.route.length===1&&v.blocked)?'stop':'go';
  if(kind==='R'){if(S.veh.some(v=>v.state==='humping'&&v.route[v.ri]===id))return 'go';
    return Object.values(S.pl).some(q=>q.kind==='in'&&q.state==='receiving'&&q.rtrack===id&&S.t>=q.readyT)?'warn':'stop';}
  if(kind==='crest')return S.crestHold?'red':S.retHold?'warn':'go';
  if(kind==='W'){if(S.veh.some(v=>v.state==='pulling'&&v.route[v.ri]===id))return 'go';
    const T=TRACKS.find(t=>t.edge===id);return T&&T.closed&&T.inbound===0&&T.assigned>0?'warn':'stop';}
  if(kind==='D'){if(S.veh.some(v=>v.state==='departing'&&v.route[v.ri]===id))return 'go';
    return Object.values(S.pl).some(q=>q.kind==='out'&&q.state==='assembling'&&q.dtrack===id&&S.t>=q.departT)?'warn':'stop';}
  return 'stop';}
const LAMPS=[['go',[198,244,50]],['warn',[245,197,66]],['stop',[255,75,62]]]; // the palette's lime / yellow / red, so a lamp means the same as the track it guards
function drawSignal(ctx,x,ty,st,sc,abs){sc=(sc||1)*SGZ;const y=abs?ty:ty-6.2*sc;
  const w=15*sc,h=5.6*sc,r=h/2,gap=4.5*sc,lr=1.55*sc,sr=2.15*sc;
  // short mast to the track
  ctx.strokeStyle='#3a3f45';ctx.lineWidth=.8*sc;ctx.beginPath();ctx.moveTo(x,y+r);ctx.lineTo(x,y+r+2.2*sc);ctx.stroke();
  // pill housing with darker ring
  rrect(ctx,x-w/2,y-r,w,h,r);ctx.fillStyle='#2d2d2e';ctx.fill();ctx.strokeStyle='#141516';ctx.lineWidth=.9*sc;ctx.stroke();rrect(ctx,x-w/2-.7*sc,y-r-.7*sc,w+1.4*sc,h+1.4*sc,r+.7*sc);ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=.5*sc;ctx.stroke();
  const lit=st==='red'?'stop':st;let active=null;
  // pass 1: every socket, then the inactive lamps (dimmed)
  LAMPS.forEach(([k],i)=>{const cx=x+(i-1)*gap;ctx.fillStyle='#0b0c0d';ctx.beginPath();ctx.arc(cx,y,sr,0,7);ctx.fill();});
  LAMPS.forEach(([k,c],i)=>{const cx=x+(i-1)*gap;if(k===lit){active=[cx,c];return;}
    ctx.fillStyle=`rgba(${c},.3)`;ctx.beginPath();ctx.arc(cx,y,lr,0,7);ctx.fill();});
  // pass 2: the active lamp and its glow last, so it is always the top layer
  if(active){const[cx,c]=active,strong=st!=='stop';
    ctx.fillStyle=`rgba(${c},${strong?.32:.2})`;ctx.beginPath();ctx.arc(cx,y,(strong?3.9:3.3)*sc,0,7);ctx.fill();
    ctx.fillStyle=`rgb(${c})`;ctx.beginPath();ctx.arc(cx,y,lr,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(cx-.45*sc,y-.45*sc,.45*sc,0,7);ctx.fill();}}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function plLabel(pl){const n=pl.veh.length;
  if(pl.kind==='thru')return `${pl.id} ×${n} → ML2 W`;
  if(pl.kind==='in'){if(pl.state==='inbound')return pl.rtrack?`${pl.id} ×${n} → ${EDGES[pl.rtrack].track}`:`${pl.id} ×${n} · hold X-01`;
    if(pl.state==='receiving'){const r=pl.readyT-S.t;return r>0?`${pl.id} ×${n} · inspect ${Math.ceil(r/60)}m`:`${pl.id} ×${n} · ready ▸ hump`;}
    return `${pl.id} ×${n} → hump`;}
  const b=pl.relay?'relay':pl.dom;
  if(pl.state==='pulling')return `${pl.id} ×${n} ${b} → ${EDGES[pl.dtrack].track}`;
  if(pl.state==='assembling'){const r=pl.departT-S.t;return r>0?`${pl.id} ×${n} ${b} · dep ${Math.ceil(r/60)}m`:`${pl.id} ×${n} ${b} · wait exit`;}
  return `${pl.id} ×${n} ${b} → ML2 W`;}
function draw(){if(!mapC.width||!mapC.height||!stat.width||!stat.height)return;
  const ctx=mctx;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=C.bg;ctx.fillRect(0,0,mapC.width,mapC.height);
  if(staticDirty){drawStatic();staticDirty=false;}ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(stat,0,0);
  ctx.setTransform(DPR*K,0,0,DPR*K,DPR*OX,DPR*OY);ctx.lineCap='butt';
  // occupancy overlays
  if(LAYERS.routes){for(const e of EL){if(!e.occ.length)continue;let bl=false,mv=false;for(const o of e.occ){if(!o.veh)continue;if(o.veh.blocked&&!o.veh.thru)bl=true;else if(o.veh.v>0.05)mv=true;}
    if(bl){ctx.strokeStyle='rgba(255,75,62,.9)';ctx.lineWidth=2.2*SZ;strokePts(ctx,e.pts);}else if(mv){ctx.strokeStyle='rgba(198,244,50,.38)';ctx.lineWidth=1.8*SZ;strokePts(ctx,e.pts);}}}
  // fault: dead branch
  if(S.flist.length){ctx.setLineDash([3*SZ,3*SZ]);ctx.strokeStyle='rgba(255,75,62,.75)';ctx.lineWidth=1.6*SZ;
    for(const sw of SWITCHES)if(sw.failed){if(sw.type==='split')for(const e of sw.node.out)strokePts(ctx,e.pts.slice(0,2));else for(const e of sw.node.in)strokePts(ctx,e.pts.slice(-2));}
    for(const f of S.flist)if(f.type==='charger'||f.type==='track'){const e=EDGES[f.target];ctx.strokeStyle=f.type==='charger'?'rgba(255,75,62,.55)':'rgba(255,75,62,.4)';strokePts(ctx,e.pts);}
    ctx.setLineDash([]);
    for(const e of EL)if(e.blocked&&e.obs!=null){const a=pointAt(e,e.obs-LEN/2),b=pointAt(e,e.obs+LEN/2);ctx.strokeStyle=C.red;ctx.lineWidth=5.6*VZ;strokePts(ctx,subPath(e,e.obs-LEN/2,e.obs+LEN/2));
      const m=pointAt(e,e.obs),r=3.2*VZ;ctx.strokeStyle='#0a0c0f';ctx.lineWidth=1.2*VZ;ctx.beginPath();ctx.moveTo(m[0]-r,m[1]-r*.6);ctx.lineTo(m[0]+r,m[1]+r*.6);ctx.moveTo(m[0]-r,m[1]+r*.6);ctx.lineTo(m[0]+r,m[1]-r*.6);ctx.stroke();}
    if(retarderOn()){const n=NODES.CR,L=EDGES.LEAD;ctx.strokeStyle='rgba(255,75,62,.8)';ctx.lineWidth=2.4*SZ;strokePts(ctx,subPath(L,L.len-46,L.len));}}
  // selected route
  if(selected&&selected.type==='veh'){const v=S.veh.find(x=>x.id===selected.id);if(v){ctx.setLineDash([4*SZ,3*SZ]);ctx.strokeStyle='rgba(61,107,255,.85)';ctx.lineWidth=1.6*SZ;
    const e0=EDGES[v.route[v.ri]];strokePts(ctx,subPath(e0,v.s,e0.len));for(let i=v.ri+1;i<v.route.length;i++)strokePts(ctx,EDGES[v.route[i]].pts);ctx.setLineDash([]);}}
  // switches
  for(const sw of SWITCHES){const n=sw.node;const leg=EDGES[sw.lined];if(!leg)continue;
    const pts=sw.type==='split'?subPath(leg,0,Math.min(9,leg.len)):subPath(leg,Math.max(0,leg.len-9),leg.len);
    const throwing=S.t<sw.throwUntil;
    ctx.strokeStyle=sw.failed?C.red:throwing?C.yellow:sw.resBy?C.lime:(sw.deco?'#59616a':'#9aa3ad');ctx.lineWidth=(throwing||sw.resBy?2.2:1.7)*SZ;strokePts(ctx,pts);
    ctx.fillStyle=sw.failed?C.red:'#c3cad1';ctx.beginPath();ctx.arc(n.x,n.y,1.3*SZ,0,7);ctx.fill();}
  // signals
  if(LAYERS.signals){drawSignal(ctx,212,34,sigState('entry'),1.1);
    R_IDS.forEach(id=>{const e=EDGES[id];const p=e.pts[e.pts.length-1];drawSignal(ctx,p[0]-24,p[1],sigState('R',id),1.05);});
    drawSignal(ctx,1027,204,sigState('crest'),1.1,true);
    for(const T of TRACKS){const e=EDGES[T.edge];const p=e.pts[e.pts.length-1];drawSignal(ctx,p[0]+24,p[1],sigState('W',T.edge),1);}
    D_IDS.forEach(id=>{const p=EDGES[id].pts[EDGES[id].pts.length-1];drawSignal(ctx,p[0]+24,p[1],sigState('D',id),1);});}
  // bowl track readouts
  if(LAYERS.ids)for(const T of TRACKS){const n=EDGES[T.edge].from;const blk=EDGES[T.edge].blocked,out=chOut(T);const dead=S.flist.length&&!blk&&!pathBetween('LEAD',T.edge);
    const y=T.k===14?458:n.y;const x=(T.k===14?n.x+4:n.x)+9;
    label(ctx,T.isCH?(T.k===13?'X-33':''):'X-'+(20+T.k),x,y,{size:6.5,color:(n.sw&&n.sw.failed&&(!T.isCH||T.k===13))?C.red:'#5d6670'});
    const kx=x+22;
    if(blk)label(ctx,'BLOCKED',kx,y,{size:7,color:C.red,w:600});else if(out)label(ctx,'OUTAGE '+T.assigned+'/'+T.cap,kx,y,{size:7,color:C.red,w:600});
    else if(dead)label(ctx,'CUT OFF',kx,y,{size:7,color:C.red,w:600});
    else if(T.key){const t=T.key==='PLAN'?'STAGED':T.key.length===3?T.key:BANDS[T.key];label(ctx,T.key==='PLAN'?`STAGED ${T.assigned}`:`${t} ${T.assigned}/${T.isCH?T.cap:P.size}`,kx,y,{size:7,color:T.closed?C.yellow:'#aab3bd',w:600});}
    else label(ctx,'open',kx,y,{size:7,color:'#5d6670'});}
  // vehicles
  for(const v of S.veh){const pts=bodyPts(v);v._pts=pts;const sel=isSel(v);
    if(sel){ctx.strokeStyle='rgba(61,107,255,.4)';ctx.lineWidth=10*VZ;strokePts(ctx,pts);}
    else if(v.blocked&&!v.thru){ctx.strokeStyle=C.red;ctx.lineWidth=8.2*VZ;strokePts(ctx,pts);}
    const parked=v.state==='classified'||v.state==='receiving'||v.state==='assembling';
    ctx.strokeStyle=sel?C.cobalt:vehColor(v,v.thru?.45:parked?.85:1);ctx.lineWidth=5.6*VZ;strokePts(ctx,pts);
    if(v.state==='charging'&&v.soc<CHG_FULL){const h=pts[pts.length-1];ctx.fillStyle=(RM||Math.floor(performance.now()/500)%2)?'#0a0c0f':C.yellow;ctx.fillRect(h[0]-VZ,h[1]-VZ,2*VZ,2*VZ);}}
  // hump hold / crest
  if(S.crestHold){const tz=TZ;TZ=1;ctx.save();ctx.translate(1050,222);ctx.scale(tz,tz);ctx.translate(-1050,-222);rrect(ctx,1050,222,(faultHolding()?76:68),12,2.5);ctx.fillStyle=C.red;ctx.fill();label(ctx,faultHolding()?'HUMP STOPPED':'HUMP HOLD',1088,228.5,{size:7,align:'center',color:'#0a0c0f',w:700,ls:.6});ctx.restore();TZ=tz;}
  // platoon tags
  hitTags=[];
  if(LAYERS.tags)for(const pl of Object.values(S.pl)){const vs=pl.veh.filter(v=>v.spawned&&v._pts);if(!vs.length)continue;
    if(pl.kind==='in'&&pl.state==='humping')continue;
    let mx=1e9,my=1e9;for(const v of vs)for(const p of v._pts){if(p[0]<mx)mx=p[0];if(p[1]<my)my=p[1];}
    if(mx<4)mx=4;
    const txt=plLabel(pl);const tz=TZ;TZ=1;setFont(ctx,7,600);const w=ctx.measureText(txt).width+10,h=11;
    let x=mx,y=my-15*tz;if(pl.kind==='thru')y=my+6*tz;if(x+w*tz>1148)x=1148-w*tz;
    const sel=selected&&selected.type==='pl'&&selected.id===pl.id;const bl=vs.some(v=>v.blocked);
    const col=sel?C.cobalt:bl?C.red:(pl.state==='receiving'||pl.state==='assembling'||(pl.kind==='in'&&!pl.rtrack))?C.yellow:pl.kind==='thru'?'#8b939d':C.lime;
    ctx.save();ctx.translate(x,y);ctx.scale(tz,tz);
    rrect(ctx,0,0,w,h,2.5);ctx.fillStyle=sel?C.cobalt:'rgba(10,12,15,.92)';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=.9;ctx.stroke();
    label(ctx,txt,5,h/2+.3,{size:7,color:sel?'#fff':col,w:600});ctx.restore();TZ=tz;
    hitTags.push({x,y,w:w*tz,h:h*tz,id:pl.id});}
  // fault callout
  if(S.faultOn){const n=FAULT_SW.node;ctx.save();ctx.translate(n.x,n.y);ctx.scale(SGZ,SGZ);ctx.rotate(Math.PI/4);ctx.fillStyle='rgba(255,75,62,.25)';ctx.fillRect(-7,-7,14,14);
    ctx.strokeStyle=C.red;ctx.lineWidth=1.4;ctx.strokeRect(-4.5,-4.5,9,9);ctx.restore();
    const bx=1002,by=368,bw=144,bh=90;ctx.strokeStyle=C.red;ctx.lineWidth=.9*SZ;ctx.beginPath();ctx.moveTo(n.x+6*SGZ,n.y);ctx.lineTo(bx,n.y);ctx.lineTo(bx,by);ctx.stroke();
    const tz=TZ;TZ=1;ctx.save();ctx.translate(bx,by);ctx.scale(tz,tz);ctx.translate(-bx,-by);ctx.lineWidth=.9;
    rrect(ctx,bx,by,bw,bh,4);ctx.fillStyle='rgba(14,17,20,.97)';ctx.fill();ctx.stroke();
    label(ctx,'X-24',bx+8,by+11,{size:9,color:C.text,w:700});rrect(ctx,bx+bw-38,by+6,30,10,2);ctx.fillStyle=C.red;ctx.fill();label(ctx,'FAULT',bx+bw-23,by+11.3,{size:6.5,align:'center',color:'#0a0c0f',w:700});
    const rows=[['STATE','Points not locked'],['CUT OFF','B-04…B-12, CH'],['SINCE',fmtT(S.faultT)],['STRANDED',S.qFault+' cuts'],['HUMP',faultHolding()?'Stopped · '+Math.ceil((FAULT_HOLD-(S.t-S.faultT))/60)+'m':'Reroute B-01…03 · 2 km/h']];
    rows.forEach((r,i)=>{const yy=by+26+i*13;label(ctx,r[0],bx+8,yy,{size:6.5,color:'#818b96',ls:.3});label(ctx,r[1],bx+bw-8,yy,{size:7,align:'right',color:i===4?(faultHolding()?C.red:C.yellow):'#d5dbe1',w:600});});ctx.restore();TZ=tz;}
  drawFaultTags(ctx);
}
let hitFaults=[];
function faultAnchor(f){
  if(f.type==='turnout'){const n=SWBY[f.target].node;return [n.x,n.y];}
  if(f.type==='retarder')return [NODES.CR.x,NODES.CR.y];
  if(f.type==='charger'){const e=EDGES[f.target];const p=pointAt(e,e.len*.55);return [p[0],p[1]];}
  if(f.type==='track'){const e=EDGES[f.target];const p=pointAt(e,e.obs!=null?e.obs:e.len/2);return [p[0],p[1]];}
  const v=S.veh.find(x=>x.id===f.target);if(!v||!v._pts)return null;const p=v._pts[Math.floor(v._pts.length/2)];return [p[0],p[1]];}
function faultTagText(f){
  let t=f.label;if(f.type==='retarder')t+=' · '+RET_SPEED+' km/h';if(f.type==='battery'){const v=S.veh.find(x=>x.id===f.target);if(v)t+=' '+Math.round(v.soc)+'%';}
  if(f.dur){const r=Math.max(0,f.a+f.dur-S.t);t+=' · '+Math.ceil(r/60)+'m';}return t;}
function drawFaultTags(ctx){hitFaults=[];if(!S.flist.length)return;const placed=[];const tz=TZ;
  for(const f of S.flist){const an=faultAnchor(f);if(!an)continue;const[x0,y0]=an;
    // marker
    ctx.save();ctx.translate(x0,y0);ctx.scale(SGZ,SGZ);ctx.rotate(Math.PI/4);
    if(f.type==='battery'){ctx.restore();ctx.strokeStyle=C.red;ctx.lineWidth=1.2*SZ;ctx.beginPath();ctx.arc(x0,y0,7*VZ,0,7);ctx.stroke();}
    else{ctx.fillStyle='rgba(255,75,62,.25)';ctx.fillRect(-6,-6,12,12);ctx.strokeStyle=C.red;ctx.lineWidth=1.3;ctx.strokeRect(-4,-4,8,8);ctx.restore();}
    if(f.type==='turnout'&&f.target==='X-24'&&f.hold)continue; // X-24 preset keeps its full callout card
    TZ=1;setFont(ctx,7,700);const txt=faultTagText(f);const w=ctx.measureText(txt).width+12,h=11;TZ=tz;
    let x=x0+7*tz,y=y0-18*tz;if(x+w*tz>1150)x=x0-7*tz-w*tz;
    for(let k=0;k<6&&placed.some(r=>x<r.x+r.w&&x+w*tz>r.x&&y<r.y+r.h&&y+h*tz>r.y);k++)y-=13*tz;
    placed.push({x,y,w:w*tz,h:h*tz});
    ctx.strokeStyle='rgba(255,75,62,.7)';ctx.lineWidth=.8*SZ;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x<x0?x+w*tz:x,y+h*tz);ctx.stroke();
    TZ=1;ctx.save();ctx.translate(x,y);ctx.scale(tz,tz);rrect(ctx,0,0,w,h,2.5);ctx.fillStyle='rgba(14,17,20,.96)';ctx.fill();ctx.strokeStyle=C.red;ctx.lineWidth=.9;ctx.stroke();
    ctx.fillStyle=C.red;ctx.fillRect(4,h/2-1.5,3,3);label(ctx,txt,9.5,h/2+.3,{size:7,color:'#f2d6d3',w:700});ctx.restore();TZ=tz;
    hitFaults.push({x,y,w:w*tz,h:h*tz,id:f.id});}}
let TLG=null; // timeline geometry for hit-testing
function tlSrc(){return HIST.tl||S;}
function tlRates(){const src=tlSrc(),T=HIST.liveT,n=src.bins.length;
  const rate=(arr,i)=>{const full=(i+1)*BIN<=T;const span=full?BIN:Math.max(60,T-i*BIN);return arr[i]*3600/span;};
  const sm=arr=>{const out=[];for(let i=0;i<n;i++){let a=0,c=0;for(let k=Math.max(0,i-1);k<=Math.min(n-1,i+1);k++){if(k*BIN>T)continue;a+=rate(arr,k);c++;}out.push(c?a/c:0);}return out;};
  return {n,sr:sm(src.bins),dr:sm(src.dbins),q:src.qbins,src};}
function drawTL(){
  const ctx=tctx,w=tlC.clientWidth,h=tlC.clientHeight;if(tlC.width!==Math.round(w*DPR)||tlC.height!==Math.round(h*DPR)){tlC.width=Math.round(w*DPR);tlC.height=Math.round(h*DPR);}ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,tlC.width,tlC.height);ctx.setTransform(DPR,0,0,DPR,0,0);
  const WIN=6*3600,LT=HIST.liveT,end=Math.max(WIN,LT+BIN),start=end-WIN;const L=4,Rr=4,top=12,bot=15,ph=h-top-bot;const X=t=>L+(t-start)/WIN*(w-L-Rr);
  const{n,sr,dr,q,src}=tlRates();const bands=[];
  TLG={start,end,L,Rr,top,ph,w,h,X,T:t=>start+(t-L)/(w-L-Rr)*WIN,bands};
  setFont(ctx,10,500);ctx.textBaseline='alphabetic';
  for(let hh=Math.ceil(start/3600);hh*3600<=end;hh++){const x=X(hh*3600);ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(x,top,1,ph);ctx.fillStyle='#818b96';ctx.textAlign='center';ctx.fillText(p2(hh)+':00',Math.min(w-16,Math.max(16,x)),h-3);}
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(L,top+ph,w-L-Rr,1);
  // not-yet-recorded / scrub-limit shading
  const mt=minScrubT();if(mt>start){ctx.fillStyle='rgba(255,255,255,.025)';ctx.fillRect(L,top,X(mt)-L,ph);}
  for(const j of src.jams){const b=j.b==null?LT:j.b;if(b<start)continue;const a=X(Math.max(start,j.a)),bb=X(b);bands.push({x0:a,x1:Math.max(a+6,bb),t:j.a,b,kind:'JAM'});
    ctx.fillStyle='rgba(255,75,62,.15)';ctx.fillRect(a,top,Math.max(1,bb-a),ph);ctx.fillStyle='rgba(255,75,62,.8)';ctx.fillRect(a,top,Math.max(1,bb-a),1.5);
    if(bb-a>26){setFont(ctx,10,600);ctx.fillStyle=C.red;ctx.textAlign='left';ctx.fillText('JAM',a+4,top+ph-4);}}
  const lanes=[],more={n:0,x:0};
  for(const f of src.faults){const b=f.b==null?LT:f.b;if(b<start)continue;const a=X(Math.max(start,f.a)),bb=X(b);const kind=f.kind||'X-24 FAULT';
    setFont(ctx,10,600);const tw=ctx.measureText(kind).width+10;let ln=0;while(ln<3&&lanes[ln]!=null&&lanes[ln]>a-2)ln++;const over=ln>2;if(over){ln=2;more.n++;more.x=Math.max(more.x,a);}else lanes[ln]=Math.max(a+tw,bb);
    const ly=top+ln*12;bands.push({x0:a-4,x1:Math.max(a+tw,bb),y0:ly-2,y1:ly+13,t:f.a,b,kind,fid:f.fid});
    ctx.save();ctx.beginPath();ctx.rect(a,top,Math.max(1,bb-a),ph);ctx.clip();ctx.strokeStyle='rgba(255,75,62,.16)';ctx.lineWidth=1;for(let x=a-ph;x<bb;x+=6){ctx.beginPath();ctx.moveTo(x,top+ph);ctx.lineTo(x+ph,top);ctx.stroke();}ctx.restore();
    ctx.fillStyle=C.red;ctx.save();ctx.translate(a,ly+1);ctx.rotate(Math.PI/4);ctx.fillRect(-3,-3,6,6);ctx.restore();ctx.fillRect(a,top,1,ph);
    if(f.b!=null&&bb>=L){ctx.strokeStyle=C.red;ctx.lineWidth=1;ctx.save();ctx.translate(bb,ly+1);ctx.rotate(Math.PI/4);ctx.strokeRect(-2.5,-2.5,5,5);ctx.restore();ctx.fillStyle='rgba(255,75,62,.5)';ctx.fillRect(bb,top,1,ph);}
    if(!over){ctx.fillStyle=C.red;ctx.textAlign='left';ctx.fillText(kind,a+6,ly+11);}}
  if(more.n){const lx=Math.max(...lanes.filter(x=>x!=null).slice(0,3),more.x)+4;setFont(ctx,10,600);ctx.fillStyle=C.red;ctx.textAlign='left';ctx.fillText('+'+more.n,Math.min(lx,w-24),top+35);}
  let mx=120;for(let i=0;i<n;i++)mx=Math.max(mx,sr[i]*1.15,dr[i]*1.15);
  let mq=20;for(const v of q)mq=Math.max(mq,v);TLG.mx=mx;
  const Y=v=>top+ph-v/mx*ph;
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.moveTo(X(start),top+ph);for(let i=0;i<n;i++){const t=i*BIN+BIN/2;if(t<start)continue;ctx.lineTo(X(Math.min(t,LT)),top+ph-q[i]/mq*ph*.45);}ctx.lineTo(X(Math.min(LT,end)),top+ph);ctx.closePath();ctx.fill();
  const line=(arr,col,wd,fill,dash)=>{ctx.beginPath();let first=true,lx=0;for(let i=0;i<n;i++){const t=Math.min(i*BIN+BIN/2,LT);if(t<start)continue;const x=X(t),y=Y(arr[i]);if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);lx=x;}
    if(first)return;ctx.setLineDash(dash||[]);ctx.strokeStyle=col;ctx.lineWidth=wd;ctx.stroke();ctx.setLineDash([]);
    if(fill){ctx.lineTo(lx,top+ph);ctx.lineTo(X(Math.max(start,BIN/2)),top+ph);ctx.closePath();ctx.fillStyle='rgba(233,237,241,.06)';ctx.fill();}};
  line(dr,'#6b7480',1.2,false,[3,2]);line(sr,'#e9edf1',1.5,true);
  setFont(ctx,10,500);ctx.fillStyle='#818b96';ctx.textAlign='left';ctx.fillText(Math.round(mx)+' veh/hr',L+2,top+10);
  const px=X(S.t);
  if(isReplay()){const lx=X(LT);ctx.fillStyle='rgba(61,107,255,.08)';ctx.fillRect(px,top,lx-px,ph);
    ctx.fillStyle='#e9edf1';ctx.fillRect(lx-.5,top-2,1,ph+2);setFont(ctx,10,600);ctx.textAlign='right';ctx.fillText('LIVE',lx-4,top+ph-4);}
  ctx.fillStyle=C.cobalt;ctx.fillRect(px-.75,top-2,1.5,ph+2);ctx.beginPath();ctx.arc(px,top-2,4.5,0,7);ctx.fill();
  ctx.strokeStyle='#0d1013';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px,top-2,4.5,0,7);ctx.stroke();
}
// mini-map with viewport box (shown above 1.5x)
function drawMini(){
  const show=view.z>1.5;miniC.style.display=show?'block':'none';if(!show){MINI=null;return;}
  const ctx=nctx,w=210,h=100,pad=6;const k=Math.min((w-2*pad)/(WB.x1-WB.x0),(h-2*pad)/(WB.y1-WB.y0));
  const ox=(w-(WB.x1-WB.x0)*k)/2-WB.x0*k,oy=(h-(WB.y1-WB.y0)*k)/2-WB.y0*k;MINI={k,ox,oy};
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(10,12,15,.92)';ctx.fillRect(0,0,w,h);
  ctx.setTransform(DPR*k,0,0,DPR*k,DPR*ox,DPR*oy);
  for(const e of EL){ctx.strokeStyle=e.kind==='main'?'#6b737d':e.kind==='charge'?'#545c66':'#3a414a';ctx.lineWidth=1.2/k*.8;strokePts(ctx,e.pts);}
  for(const v of S.veh){const e=EDGES[v.route[v.ri]];const p=pointAt(e,v.s-v.len/2);ctx.fillStyle=v.blocked&&!v.thru?C.red:vehColor(v);ctx.fillRect(p[0]-3,p[1]-3,6,6);}
  for(const f of S.flist){const an=faultAnchor(f);if(!an)continue;ctx.fillStyle=C.red;ctx.beginPath();ctx.arc(an[0],an[1],7,0,7);ctx.fill();}
  const[a,b]=S2W(0,0),[c,d]=S2W(VW,VH);ctx.fillStyle='rgba(61,107,255,.12)';ctx.fillRect(a,b,c-a,d-b);ctx.strokeStyle=C.cobalt;ctx.lineWidth=1.5/k;ctx.strokeRect(a,b,c-a,d-b);
}
