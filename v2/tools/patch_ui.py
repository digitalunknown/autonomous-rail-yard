f='src/5_ui.js';s=open(f).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)>=1,("missing",a[:80]); s=s.replace(a,b,cnt)
rep("mapC.addEventListener('pointerdown',e=>{mapC.setPointerCapture(e.pointerId);","mapC.addEventListener('pointerdown',e=>{if(e.button===2)return;mapC.setPointerCapture(e.pointerId);")
rep("if(had&&drag&&!drag.moved&&e.type==='pointerup'){const p=mxy(e);selected=hitAt(p[0],p[1]);refresh(true);}",
    "if(had&&drag&&!drag.moved&&e.type==='pointerup'){const p=mxy(e);if(picking)openPop(p[0],p[1]);else{selected=hitAt(p[0],p[1]);refresh(true);}}")
rep("mapC.style.cursor=hitAt(p[0],p[1])?'pointer':'grab';});",
    "if(picking){const el=elementAt(p[0],p[1]);$('pickBar').firstChild.textContent=el?'Fault '+el.name+' · click to choose ':'Pick mode · click a turnout, track, charger, crest or vehicle ';return;}\n  mapC.style.cursor=hitAt(p[0],p[1])?'pointer':'grab';});")
rep("else if(e.key==='Escape'){selected=null;refresh(true);}});","else if(e.key==='Escape'){if(popEl)closePop();else if(picking)setPicking(false);else{selected=null;refresh(true);}}});")
rep("'Bowl ladder, B-04 branch. Failing it cu","'Bowl ladder, B-04 branch. Failing it cu")
# updateFaultUI: append list render
i=s.index("function updateFaultUI(){");j=s.index("\n",s.index("$('faultSub').textContent",i))
line=s[i:j]
assert line.endswith("}")
s=s[:j-1]+"renderFaultList();}"+s[j:]
rep("function bandAt(x,y){if(!TLG||y>TLG.top+14)return null;for(const b of TLG.bands)if(x>=b.x0&&x<=b.x1)return b;return null;}",
    "function bandAt(x,y){if(!TLG)return null;for(const b of TLG.bands){const y0=b.y0!=null?b.y0:TLG.top-4,y1=b.y1!=null?b.y1:TLG.top+14;if(x>=b.x0&&x<=b.x1&&y>=y0&&y<=y1)return b;}return null;}")
rep("if(S.faultOn){sc.className='schip bad';sc.textContent='X-24 FAULT';}",
    "if(S.faultOn){sc.className='schip bad';sc.textContent=S.flist.length>1?'X-24 FAULT +'+(S.flist.length-1):'X-24 FAULT';}else if(S.flist.length){sc.className='schip bad';sc.textContent=S.flist.length>1?S.flist.length+' FAULTS':S.flist[0].label;}")
rep("  renderDossier();drawTL();\n}","  renderFaultList();renderDossier();drawTL();\n}")
rep("// test hooks\n",open('tools/ui_faults.js').read()+"fillTargets(true);\n// test hooks\n")
rep("TLG:()=>TLG,refresh:()=>refresh(true),TRACKS};",
    """TLG:()=>TLG,refresh:()=>refresh(true),TRACKS,
  inject:sp=>{const f=uiInject(sp);return f?f.id:null;},clearFault:id=>uiClear(id),clearAll:()=>uiClearAll(),faults:()=>JSON.parse(JSON.stringify(S.flist)),
  TURNOUTS,pathOK:(a,b)=>!!pathBetween(a,b),swXY:id=>{const n=SWBY[id].node;const r=mapC.getBoundingClientRect();const q=W2S(n.x,n.y);return [q[0]+r.left,q[1]+r.top];},
  edgeXY:(id,fr)=>{const e=EDGES[id];const p=pointAt(e,e.len*(fr==null?.5:fr));const r=mapC.getBoundingClientRect();const q=W2S(p[0],p[1]);return [q[0]+r.left,q[1]+r.top];},
  crestXY:()=>{const r=mapC.getBoundingClientRect();const q=W2S(NODES.CR.x,NODES.CR.y);return [q[0]+r.left,q[1]+r.top];},setPicking:on=>setPicking(on)};""")
open(f,'w').write(s);print('ok')
