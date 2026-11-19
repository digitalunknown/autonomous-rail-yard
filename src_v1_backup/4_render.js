// ---------------- rendering
const MONO=getComputedStyle(document.documentElement).getPropertyValue('--mono').trim()||'monospace';
const C={bg:'#0a0c0f',main:'#8b939d',yard:'#434b55',ladder:'#4a525c',lead:'#5d6670',deco:'#353c44',charge:'rgba(245,197,66,.62)',
  lime:'#c6f432',cobalt:'#3d6bff',yellow:'#f5c542',red:'#ff4b3e',label:'#69727d',dim:'#4d5560',text:'#e9edf1'};
const LAYERS={routes:true,signals:true,ids:true,tags:true};
const WB={x0:-6,x1:1150,y0:12,y1:546};
const mapC=document.getElementById('map'),mctx=mapC.getContext('2d');
const tlC=document.getElementById('tl'),tctx=tlC.getContext('2d');
const stat=document.createElement('canvas'),sctx=stat.getContext('2d');
let VW=0,VH=0,DPR=1,K=1,OX=0,OY=0;
let selected=null,hitTags=[];
const SOC_STOPS=[[0,[255,110,48]],[20,[255,154,60]],[45,[232,216,58]],[75,[198,244,50]],[100,[181,240,32]]];
function socRGB(s){for(let i=1;i<SOC_STOPS.length;i++){const[a,ca]=SOC_STOPS[i-1],[b,cb]=SOC_STOPS[i];if(s<=b){const f=(s-a)/(b-a);return ca.map((c,j)=>Math.round(c+(cb[j]-c)*f));}}return SOC_STOPS[4][1];}
function socColor(s,al){const c=socRGB(s);return al==null?`rgb(${c})`:`rgba(${c},${al})`;}
function setFont(ctx,sz,w){ctx.font=`${w||500} ${sz}px ${MONO}`;}
function W2S(x,y){return [x*K+OX,y*K+OY];}

function resize(){
  const box=document.getElementById('mapbox');DPR=window.devicePixelRatio||1;VW=box.clientWidth;VH=box.clientHeight;
  for(const c of [mapC,stat]){c.width=Math.round(VW*DPR);c.height=Math.round(VH*DPR);}
  K=Math.min((VW-20)/(WB.x1-WB.x0),(VH-16)/(WB.y1-WB.y0));
  OX=(VW-(WB.x1-WB.x0)*K)/2-WB.x0*K;OY=(VH-(WB.y1-WB.y0)*K)/2-WB.y0*K;
  const dz=document.getElementById('dossier');const[dx,dy]=W2S(6,176);dz.style.left=Math.max(10,dx)+'px';dz.style.top=Math.max(8,dy)+'px';
  const tw=tlC.clientWidth,th=tlC.clientHeight;tlC.width=Math.round(tw*DPR);tlC.height=Math.round(th*DPR);
  drawStatic();
}
function strokePts(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}
function edgeStyle(e){
  if(e.kind==='main')return [C.main,1.7];if(e.kind==='lead')return [C.lead,1.6];if(e.kind==='charge')return [C.charge,1.5];
  if(e.kind==='deco')return [C.deco,1.3];if(e.kind==='ladder')return [C.ladder,1.4];return [C.yard,1.4];}
function label(ctx,txt,x,y,o){o=o||{};setFont(ctx,o.size||7.5,o.w||500);ctx.fillStyle=o.color||C.label;ctx.textAlign=o.align||'left';ctx.textBaseline='middle';
  if('letterSpacing' in ctx)ctx.letterSpacing=(o.ls||0)+'px';ctx.fillText(txt,x,y);if('letterSpacing' in ctx)ctx.letterSpacing='0px';}
function drawStatic(){
  const ctx=sctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,stat.width,stat.height);
  ctx.setTransform(DPR*K,0,0,DPR*K,DPR*OX,DPR*OY);ctx.lineCap='butt';ctx.lineJoin='miter';
  // sleepers
  ctx.strokeStyle='rgba(140,150,160,.13)';ctx.lineWidth=0.8;
  for(const e of EL){const step=e.kind==='main'?6:7;for(let s=3;s<e.len;s+=step){const[x,y,a]=pointAt(e,s);const nx=-Math.sin(a)*2.4,ny=Math.cos(a)*2.4;ctx.beginPath();ctx.moveTo(x-nx,y-ny);ctx.lineTo(x+nx,y+ny);ctx.stroke();}}
  for(const e of EL){const[c,w]=edgeStyle(e);ctx.strokeStyle=c;ctx.lineWidth=w;if(e.kind==='deco')ctx.setLineDash([]);strokePts(ctx,e.pts);}
  // bumpers on stub ends
  for(const e of EL)if(e.stub){const[x,y,a]=pointAt(e,e.len);const nx=-Math.sin(a)*4,ny=Math.cos(a)*4;ctx.strokeStyle='#a3acb6';ctx.lineWidth=2.2;
    ctx.beginPath();ctx.moveTo(x-nx,y-ny);ctx.lineTo(x+nx,y+ny);ctx.stroke();ctx.fillStyle='#a3acb6';ctx.fillRect(x-1.5-Math.cos(a)*1.5,y-1.5-Math.sin(a)*1.5,3,3);}
  // retarders
  ctx.strokeStyle='rgba(245,197,66,.8)';ctx.lineWidth=0.9;
  for(const T of TRACKS){const e=EDGES[T.edge];const[x,y]=pointAt(e,T.isCH?40:28);ctx.strokeRect(x-5,y-2.6,10,5.2);}
  // crest marker
  ctx.fillStyle='#8b939d';ctx.beginPath();ctx.moveTo(1046,196);ctx.lineTo(1052,192);ctx.lineTo(1052,200);ctx.closePath();ctx.fill();
  // area labels
  const A={size:7,color:'#56606a',ls:1.1};
  label(ctx,'INBOUND · ML1 EAST ▸',2,22,A);label(ctx,'◂ ML2 WEST',1146,64,Object.assign({align:'right'},A));
  label(ctx,'RECEIVING YARD · R-01…R-04',420,88,A);label(ctx,'HUMP LEAD · RA-01',860,144,A);
  label(ctx,'HUMP CREST',1058,196,A);label(ctx,'CLASSIFICATION BOWL · 12 TRACKS',640,238,A);
  label(ctx,'SERVICE · CHARGE CH-01/02',560,472,A);label(ctx,'DEPARTURE YARD · D-01…D-03',120,476,A);
  label(ctx,'STORAGE',40,150,A);label(ctx,'◂ OUTBOUND · TO ML2 W',4,536,A);
  if(LAYERS.ids){
    const L={size:7.5,color:'#7a848f'};
    for(const[t,y] of [['ML1',34],['ML2',52]]){ctx.fillStyle='#0a0c0f';ctx.strokeStyle='#59626c';ctx.lineWidth=.8;ctx.fillRect(2,y-5,20,10);ctx.strokeRect(2,y-5,20,10);label(ctx,t,12,y+.3,{size:7,align:'center',color:'#c3cad1',w:600});}
    R_IDS.forEach((id,i)=>{const e=EDGES[id];label(ctx,'R-0'+(i+1),e.pts[0][0]-6-(i===3?0:0),[100,118,136,154][i],Object.assign({align:'right'},L));});
    for(const T of TRACKS){const e=EDGES[T.edge];const p=e.pts[e.pts.length-1];label(ctx,T.id,p[0]-6,p[1],Object.assign({align:'right'},L));}
    D_IDS.forEach((id,i)=>{label(ctx,'D-0'+(i+1),[368,352,352][i]+(i===2?0:0),[490,506,522][i]-(i===2?0:0),L);});
    label(ctx,'SL-01',206,100,L);label(ctx,'SL-02',206,118,L);label(ctx,'SL-03',206,136,L);
    label(ctx,'PS-01',560,78,L);label(ctx,'IND-01',840,78,L);
    label(ctx,'X-01',232,24,{size:6.5,color:'#5d6670'});
  }
}
// ---- dynamic
function bodyPts(v){const e=EDGES[v.route[v.ri]];const a=v.s-v.len+1.1,b=v.s-1.1;
  if(a>=0||v.ri===0)return subPath(e,Math.max(0,a),Math.max(0.01,b));
  const p=EDGES[v.route[v.ri-1]];return subPath(p,Math.max(0,p.len+a),p.len).concat(b>0?subPath(e,0,b):[]);}
function isSel(v){return selected&&((selected.type==='veh'&&selected.id===v.id)||(selected.type==='pl'&&v.platoon===selected.id));}
// aspects: 'go' (green), 'warn' (amber: ready, waiting for clearance), 'stop' (red, routine), 'red' (red, hold/fault)
function sigState(kind,id){
  if(window.__sigOverride){const o=window.__sigOverride(kind,id);if(o)return o;}
  if(kind==='entry')return S.veh.some(v=>v.state==='inbound'&&v.route.length===1&&v.blocked)?'stop':'go';
  if(kind==='R'){if(S.veh.some(v=>v.state==='humping'&&v.route[v.ri]===id))return 'go';
    return Object.values(S.pl).some(q=>q.kind==='in'&&q.state==='receiving'&&q.rtrack===id&&S.t>=q.readyT)?'warn':'stop';}
  if(kind==='crest')return S.crestHold?'red':'go';
  if(kind==='W'){if(S.veh.some(v=>v.state==='pulling'&&v.route[v.ri]===id))return 'go';
    const T=TRACKS.find(t=>t.edge===id);return T&&T.closed&&T.inbound===0&&T.assigned>0?'warn':'stop';}
  if(kind==='D'){if(S.veh.some(v=>v.state==='departing'&&v.route[v.ri]===id))return 'go';
    return Object.values(S.pl).some(q=>q.kind==='out'&&q.state==='assembling'&&q.dtrack===id&&S.t>=q.departT)?'warn':'stop';}
  return 'stop';}
const LAMPS=[['go',[72,214,96]],['warn',[245,176,48]],['stop',[255,75,62]]]; // green, amber, red
function drawSignal(ctx,x,y,st,sc){sc=sc||1;
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
function draw(){
  const ctx=mctx;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=C.bg;ctx.fillRect(0,0,mapC.width,mapC.height);
  // faint grid
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(255,255,255,.035)';
  for(let x=(OX%24);x<VW;x+=24)for(let y=(OY%24);y<VH;y+=24)ctx.fillRect(x,y,1,1);
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(stat,0,0);
  ctx.setTransform(DPR*K,0,0,DPR*K,DPR*OX,DPR*OY);ctx.lineCap='butt';
  // occupancy overlays
  if(LAYERS.routes){for(const e of EL){if(!e.occ.length)continue;let bl=false,mv=false;for(const o of e.occ){if(o.veh.blocked&&!o.veh.thru)bl=true;else if(o.veh.v>0.05)mv=true;}
    if(bl){ctx.strokeStyle='rgba(255,75,62,.9)';ctx.lineWidth=2.2;strokePts(ctx,e.pts);}else if(mv){ctx.strokeStyle='rgba(198,244,50,.55)';ctx.lineWidth=1.8;strokePts(ctx,e.pts);}}}
  // fault: dead branch
  if(S.faultOn){ctx.setLineDash([3,3]);ctx.strokeStyle='rgba(255,75,62,.75)';ctx.lineWidth=1.6;for(const e of FAULT_SW.node.out)strokePts(ctx,e.pts.slice(0,2));ctx.setLineDash([]);}
  // selected route
  if(selected&&selected.type==='veh'){const v=S.veh.find(x=>x.id===selected.id);if(v){ctx.setLineDash([4,3]);ctx.strokeStyle='rgba(61,107,255,.85)';ctx.lineWidth=1.6;
    const e0=EDGES[v.route[v.ri]];strokePts(ctx,subPath(e0,v.s,e0.len));for(let i=v.ri+1;i<v.route.length;i++)strokePts(ctx,EDGES[v.route[i]].pts);ctx.setLineDash([]);}}
  // switches
  for(const sw of SWITCHES){const n=sw.node;const leg=EDGES[sw.lined];if(!leg)continue;
    const pts=sw.type==='split'?subPath(leg,0,Math.min(9,leg.len)):subPath(leg,Math.max(0,leg.len-9),leg.len);
    const throwing=S.t<sw.throwUntil;
    ctx.strokeStyle=sw.failed?C.red:throwing?C.yellow:sw.resBy?C.lime:(sw.deco?'#59616a':'#9aa3ad');ctx.lineWidth=throwing||sw.resBy?2.2:1.7;strokePts(ctx,pts);
    ctx.fillStyle=sw.failed?C.red:'#c3cad1';ctx.beginPath();ctx.arc(n.x,n.y,1.3,0,7);ctx.fill();}
  // signals
  if(LAYERS.signals){drawSignal(ctx,212,24.5,sigState('entry'),1.1);
    R_IDS.forEach(id=>{const e=EDGES[id];const p=e.pts[e.pts.length-1];drawSignal(ctx,p[0]-24,p[1]-6.8,sigState('R',id),1.05);});
    drawSignal(ctx,1027,204,sigState('crest'),1.1);
    for(const T of TRACKS){const e=EDGES[T.edge];const p=e.pts[e.pts.length-1];drawSignal(ctx,p[0]+24,p[1]-6.2,sigState('W',T.edge),1);}
    D_IDS.forEach(id=>{const p=EDGES[id].pts[EDGES[id].pts.length-1];drawSignal(ctx,p[0]+24,p[1]-6.2,sigState('D',id),1);});}
  // bowl track readouts
  if(LAYERS.ids)for(const T of TRACKS){const n=EDGES[T.edge].from;const dead=S.faultOn&&!pathBetween('LEAD',T.edge);
    const y=T.k===14?458:n.y;const x=(T.k===14?n.x+4:n.x)+9;
    label(ctx,T.isCH?(T.k===13?'X-33':''):FAULT_SW.node===n?'X-24':'X-'+(20+T.k),x,y,{size:6.5,color:FAULT_SW.node===n&&S.faultOn?C.red:'#5d6670'});
    const kx=x+22;
    if(dead)label(ctx,'CUT OFF',kx,y,{size:7,color:C.red,w:600});
    else if(T.key){const t=T.key.length===3?T.key:BANDS[T.key];label(ctx,`${t} ${T.assigned}/${T.isCH?T.cap:P.size}`,kx,y,{size:7,color:T.closed?C.yellow:T.isCH?C.yellow:'#aab3bd',w:600});}
    else label(ctx,'open',kx,y,{size:7,color:'#4d5560'});}
  // vehicles
  for(const v of S.veh){const pts=bodyPts(v);v._pts=pts;const sel=isSel(v);
    if(sel){ctx.strokeStyle='rgba(61,107,255,.45)';ctx.lineWidth=10;strokePts(ctx,pts);}
    else if(v.blocked&&!v.thru){ctx.strokeStyle=C.red;ctx.lineWidth=8.2;strokePts(ctx,pts);}
    const parked=v.state==='classified'||v.state==='receiving'||v.state==='assembling';
    ctx.strokeStyle=sel?C.cobalt:socColor(v.soc,v.thru?.5:parked?.82:1);ctx.lineWidth=5.6;strokePts(ctx,pts);
    if(v.state==='charging'&&v.soc<CHG_FULL){const h=pts[pts.length-1];ctx.fillStyle=(Math.floor(performance.now()/500)%2)?C.yellow:'#0a0c0f';ctx.fillRect(h[0]-1,h[1]-1,2,2);}}
  // hump hold / crest
  if(S.crestHold){rrect(ctx,1050,222,(faultHolding()?76:68),12,2.5);ctx.fillStyle=C.red;ctx.fill();label(ctx,faultHolding()?'HUMP STOPPED':'HUMP HOLD',1088,228.5,{size:7,align:'center',color:'#fff',w:700,ls:.6});}
  // platoon tags
  hitTags=[];
  if(LAYERS.tags)for(const pl of Object.values(S.pl)){const vs=pl.veh.filter(v=>v.spawned&&v._pts);if(!vs.length)continue;
    if(pl.kind==='in'&&pl.state==='humping')continue;
    let mx=1e9,my=1e9;for(const v of vs)for(const p of v._pts){if(p[0]<mx)mx=p[0];if(p[1]<my)my=p[1];}
    if(mx<4)mx=4;if(mx>1100)continue;
    const txt=plLabel(pl);setFont(ctx,7,600);const w=ctx.measureText(txt).width+18,h=11;
    let x=mx,y=my-15;if(pl.kind==='thru')y=my+6;if(x+w>1148)x=1148-w;
    const sel=selected&&selected.type==='pl'&&selected.id===pl.id;const bl=vs.some(v=>v.blocked);
    const col=sel?C.cobalt:bl?C.red:(pl.state==='receiving'||pl.state==='assembling'||(pl.kind==='in'&&!pl.rtrack))?C.yellow:pl.kind==='thru'?'#7d8a5a':C.lime;
    rrect(ctx,x,y,w,h,5.5);ctx.fillStyle=sel?C.cobalt:'rgba(10,12,15,.92)';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=.9;ctx.stroke();
    ctx.fillStyle=sel?'#fff':col;for(let i=0;i<3;i++)ctx.fillRect(x+5+i*2.4,y+3.2,1.5,4.6);
    label(ctx,txt,x+14,y+h/2+.3,{size:7,color:sel?'#fff':col,w:600});
    hitTags.push({x,y,w,h,id:pl.id});}
  // fault callout
  if(S.faultOn){const n=FAULT_SW.node;ctx.save();ctx.translate(n.x,n.y);ctx.rotate(Math.PI/4);ctx.fillStyle='rgba(255,75,62,.25)';ctx.fillRect(-7,-7,14,14);
    ctx.strokeStyle=C.red;ctx.lineWidth=1.4;ctx.strokeRect(-4.5,-4.5,9,9);ctx.restore();
    const bx=1002,by=368,bw=144,bh=90;ctx.strokeStyle=C.red;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(n.x+6,n.y);ctx.lineTo(bx,n.y);ctx.lineTo(bx,by);ctx.stroke();
    rrect(ctx,bx,by,bw,bh,4);ctx.fillStyle='rgba(14,17,20,.97)';ctx.fill();ctx.stroke();
    label(ctx,'X-24',bx+8,by+11,{size:9,color:C.text,w:700});rrect(ctx,bx+bw-38,by+6,30,10,2);ctx.fillStyle=C.red;ctx.fill();label(ctx,'FAULT',bx+bw-23,by+11.3,{size:6.5,align:'center',color:'#fff',w:700});
    const rows=[['STATE','Points not locked'],['CUT OFF','B-04…B-12, CH'],['SINCE',fmtT(S.faultT)],['STRANDED',S.qFault+' cuts'],['HUMP',faultHolding()?'Stopped · '+Math.ceil((FAULT_HOLD-(S.t-S.faultT))/60)+'m':'Reroute B-01…03 · 2 km/h']];
    rows.forEach((r,i)=>{const yy=by+26+i*13;label(ctx,r[0],bx+8,yy,{size:6.3,color:'#69727d',ls:.5});label(ctx,r[1],bx+bw-8,yy,{size:7,align:'right',color:i===4?(faultHolding()?C.red:C.yellow):'#d5dbe1',w:600});});}
}
function drawTL(){
  const ctx=tctx,w=tlC.clientWidth,h=tlC.clientHeight;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,w,h);
  const WIN=6*3600,end=Math.max(WIN,S.t+BIN),start=end-WIN;const L=4,Rr=4,top=12,bot=15,ph=h-top-bot;const X=t=>L+(t-start)/WIN*(w-L-Rr);
  setFont(ctx,9,500);ctx.textBaseline='alphabetic';
  for(let hh=Math.ceil(start/3600);hh*3600<=end;hh++){const x=X(hh*3600);ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(x,top,1,ph);ctx.fillStyle='#4d5560';ctx.textAlign='center';ctx.fillText(p2(hh)+':00',Math.min(w-16,Math.max(16,x)),h-3);}
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(L,top+ph,w-L-Rr,1);
  for(const j of S.jams){const b=j.b==null?S.t:j.b;if(b<start)continue;const a=X(Math.max(start,j.a)),bb=X(b);
    ctx.fillStyle='rgba(255,75,62,.15)';ctx.fillRect(a,top,Math.max(1,bb-a),ph);ctx.fillStyle='rgba(255,75,62,.8)';ctx.fillRect(a,top,Math.max(1,bb-a),1.5);
    if(bb-a>26){setFont(ctx,8,700);ctx.fillStyle=C.red;ctx.textAlign='left';ctx.fillText('JAM',a+3,top+ph-3);}}
  for(const f of S.faults){const b=f.b==null?S.t:f.b;if(b<start)continue;const a=X(Math.max(start,f.a)),bb=X(b);
    ctx.save();ctx.beginPath();ctx.rect(a,top,Math.max(1,bb-a),ph);ctx.clip();ctx.strokeStyle='rgba(255,75,62,.22)';ctx.lineWidth=1;for(let x=a-ph;x<bb;x+=6){ctx.beginPath();ctx.moveTo(x,top+ph);ctx.lineTo(x+ph,top);ctx.stroke();}ctx.restore();
    ctx.fillStyle=C.red;ctx.save();ctx.translate(a,top+1);ctx.rotate(Math.PI/4);ctx.fillRect(-3,-3,6,6);ctx.restore();ctx.fillRect(a,top,1,ph);
    setFont(ctx,8,700);ctx.textAlign='left';ctx.fillText('X-24 FAULT',a+6,top+9);}
  const n=S.bins.length;const rate=(arr,i)=>{const full=(i+1)*BIN<=S.t;const span=full?BIN:Math.max(60,S.t-i*BIN);return arr[i]*3600/span;};
  const sm=arr=>{const out=[];for(let i=0;i<n;i++){let a=0,c=0;for(let k=Math.max(0,i-1);k<=Math.min(n-1,i+1);k++){if(k*BIN>S.t)continue;a+=rate(arr,k);c++;}out.push(c?a/c:0);}return out;};
  const sr=sm(S.bins),dr=sm(S.dbins);let mx=120;for(let i=0;i<n;i++)mx=Math.max(mx,sr[i]*1.15,dr[i]*1.15);
  let mq=20;for(const q of S.qbins)mq=Math.max(mq,q);
  const Y=v=>top+ph-v/mx*ph;
  // queue
  ctx.fillStyle='rgba(255,75,62,.22)';ctx.beginPath();ctx.moveTo(X(start),top+ph);for(let i=0;i<n;i++){const t=i*BIN+BIN/2;if(t<start)continue;ctx.lineTo(X(Math.min(t,S.t)),top+ph-S.qbins[i]/mq*ph*.45);}ctx.lineTo(X(Math.min(S.t,end)),top+ph);ctx.closePath();ctx.fill();
  const line=(arr,col,wd,fill,dash)=>{ctx.beginPath();let first=true,lx=0;for(let i=0;i<n;i++){const t=Math.min(i*BIN+BIN/2,S.t);if(t<start)continue;const x=X(t),y=Y(arr[i]);if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);lx=x;}
    if(first)return;ctx.setLineDash(dash||[]);ctx.strokeStyle=col;ctx.lineWidth=wd;ctx.stroke();ctx.setLineDash([]);
    if(fill){ctx.lineTo(lx,top+ph);ctx.lineTo(X(Math.max(start,BIN/2)),top+ph);ctx.closePath();const g=ctx.createLinearGradient(0,top,0,top+ph);g.addColorStop(0,'rgba(198,244,50,.22)');g.addColorStop(1,'rgba(198,244,50,0)');ctx.fillStyle=g;ctx.fill();}};
  line(dr,'#6b7480',1.2,false,[3,3]);line(sr,C.lime,1.6,true);
  setFont(ctx,8,500);ctx.fillStyle='#4d5560';ctx.textAlign='left';ctx.fillText(Math.round(mx)+' veh/hr',L+2,top+8);
  const px=X(S.t);ctx.fillStyle=C.cobalt;ctx.fillRect(px-.5,top-2,1.5,ph+2);ctx.beginPath();ctx.arc(px,top-2,3.5,0,7);ctx.fill();
}
