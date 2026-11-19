f='src/4_render.js';s=open(f).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)>=1,("missing",a[:80]); s=s.replace(a,b,cnt)
rep("for(const o of e.occ){if(o.veh.blocked&&!o.veh.thru)bl=true;","for(const o of e.occ){if(!o.veh)continue;if(o.veh.blocked&&!o.veh.thru)bl=true;")
rep("  if(S.faultOn){ctx.setLineDash([3*SZ,3*SZ]);ctx.strokeStyle='rgba(255,75,62,.75)';ctx.lineWidth=1.6*SZ;for(const e of FAULT_SW.node.out)strokePts(ctx,e.pts.slice(0,2));ctx.setLineDash([]);}",
"""  if(S.flist.length){ctx.setLineDash([3*SZ,3*SZ]);ctx.strokeStyle='rgba(255,75,62,.75)';ctx.lineWidth=1.6*SZ;
    for(const sw of SWITCHES)if(sw.failed){if(sw.type==='split')for(const e of sw.node.out)strokePts(ctx,e.pts.slice(0,2));else for(const e of sw.node.in)strokePts(ctx,e.pts.slice(-2));}
    for(const f of S.flist)if(f.type==='charger'||f.type==='track'){const e=EDGES[f.target];ctx.strokeStyle=f.type==='charger'?'rgba(255,75,62,.55)':'rgba(255,75,62,.4)';strokePts(ctx,e.pts);}
    ctx.setLineDash([]);
    for(const e of EL)if(e.blocked&&e.obs!=null){const a=pointAt(e,e.obs-LEN/2),b=pointAt(e,e.obs+LEN/2);ctx.strokeStyle=C.red;ctx.lineWidth=5.6*VZ;strokePts(ctx,subPath(e,e.obs-LEN/2,e.obs+LEN/2));
      const m=pointAt(e,e.obs),r=3.2*VZ;ctx.strokeStyle='#0a0c0f';ctx.lineWidth=1.2*VZ;ctx.beginPath();ctx.moveTo(m[0]-r,m[1]-r*.6);ctx.lineTo(m[0]+r,m[1]+r*.6);ctx.moveTo(m[0]-r,m[1]+r*.6);ctx.lineTo(m[0]+r,m[1]-r*.6);ctx.stroke();}
    if(retarderOn()){const n=NODES.CR,L=EDGES.LEAD;ctx.strokeStyle='rgba(255,75,62,.8)';ctx.lineWidth=2.4*SZ;strokePts(ctx,subPath(L,L.len-46,L.len));}}""")
rep("if(LAYERS.ids)for(const T of TRACKS){const n=EDGES[T.edge].from;const dead=S.faultOn&&!pathBetween('LEAD',T.edge);",
    "if(LAYERS.ids)for(const T of TRACKS){const n=EDGES[T.edge].from;const blk=EDGES[T.edge].blocked,out=chOut(T);const dead=S.flist.length&&!blk&&!pathBetween('LEAD',T.edge);")
rep("label(ctx,T.isCH?(T.k===13?'X-33':''):FAULT_SW.node===n?'X-24':'X-'+(20+T.k),x,y,{size:6.5,color:FAULT_SW.node===n&&S.faultOn?C.red:'#5d6670'});",
    "label(ctx,T.isCH?(T.k===13?'X-33':''):'X-'+(20+T.k),x,y,{size:6.5,color:(n.sw&&n.sw.failed&&(!T.isCH||T.k===13))?C.red:'#5d6670'});")
rep("    if(dead)label(ctx,'CUT OFF',kx,y,{size:7,color:C.red,w:600});",
    "    if(blk)label(ctx,'BLOCKED',kx,y,{size:7,color:C.red,w:600});else if(out)label(ctx,'OUTAGE '+T.assigned+'/'+T.cap,kx,y,{size:7,color:C.red,w:600});\n    else if(dead)label(ctx,'CUT OFF',kx,y,{size:7,color:C.red,w:600});")
rep("if(kind==='crest')return S.crestHold?'red':'go';","if(kind==='crest')return S.crestHold?'red':S.retHold?'warn':'go';")
# fault tags after the X-24 callout (end of draw)
rep("label(ctx,r[1],bx+bw-8,yy,{size:7,align:'right',color:i===4?(faultHolding()?C.red:C.yellow):'#d5dbe1',w:600});});ctx.restore();TZ=tz;}\n}",
"""label(ctx,r[1],bx+bw-8,yy,{size:7,align:'right',color:i===4?(faultHolding()?C.red:C.yellow):'#d5dbe1',w:600});});ctx.restore();TZ=tz;}
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
    hitFaults.push({x,y,w:w*tz,h:h*tz,id:f.id});}}""")
# timeline: generic fault bands in lanes
a=s.index("  for(const f of src.faults){const b=f.b==null?LT:f.b;")
b=s.index("\n",s.index("ctx.fillText('X-24 FAULT',a+6,top+11);}",a))
s=s[:a]+"""  const lanes=[];
  for(const f of src.faults){const b=f.b==null?LT:f.b;if(b<start)continue;const a=X(Math.max(start,f.a)),bb=X(b);const kind=f.kind||'X-24 FAULT';
    setFont(ctx,10,600);const tw=ctx.measureText(kind).width+10;let ln=0;while(ln<3&&lanes[ln]!=null&&lanes[ln]>a-2)ln++;if(ln>2)ln=2;lanes[ln]=Math.max(a+tw,bb);
    const ly=top+ln*12;bands.push({x0:a-4,x1:Math.max(a+tw,bb),y0:ly-2,y1:ly+13,t:f.a,b,kind,fid:f.fid});
    ctx.save();ctx.beginPath();ctx.rect(a,top,Math.max(1,bb-a),ph);ctx.clip();ctx.strokeStyle='rgba(255,75,62,.16)';ctx.lineWidth=1;for(let x=a-ph;x<bb;x+=6){ctx.beginPath();ctx.moveTo(x,top+ph);ctx.lineTo(x+ph,top);ctx.stroke();}ctx.restore();
    ctx.fillStyle=C.red;ctx.save();ctx.translate(a,ly+1);ctx.rotate(Math.PI/4);ctx.fillRect(-3,-3,6,6);ctx.restore();ctx.fillRect(a,top,1,ph);
    if(f.b!=null&&bb>=L){ctx.strokeStyle=C.red;ctx.lineWidth=1;ctx.save();ctx.translate(bb,ly+1);ctx.rotate(Math.PI/4);ctx.strokeRect(-2.5,-2.5,5,5);ctx.restore();ctx.fillStyle='rgba(255,75,62,.5)';ctx.fillRect(bb,top,1,ph);}
    ctx.fillStyle=C.red;ctx.textAlign='left';ctx.fillText(kind,a+6,ly+11);}"""+s[b:]
rep("if(S.faultOn){const n=FAULT_SW.node;ctx.fillStyle=C.red;ctx.beginPath();ctx.arc(n.x,n.y,7,0,7);ctx.fill();}",
    "for(const f of S.flist){const an=faultAnchor(f);if(!an)continue;ctx.fillStyle=C.red;ctx.beginPath();ctx.arc(an[0],an[1],7,0,7);ctx.fill();}")
open(f,'w').write(s);print('ok')
