const __hex=c=>'#'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
const __op=(n,o,k='fills')=>{n[k]=n[k].map(p=>Object.assign({},p,{opacity:o}));};
const fixOpacity=(root)=>{let n=0;for(const v of root.findAllWithCriteria({types:['VECTOR','RECTANGLE','INSTANCE','FRAME']})){
 if(v.parent&&v.parent.name==='Plot'&&(v.type==='VECTOR'||v.type==='RECTANGLE')){const f=v.fills;if(Array.isArray(f)&&f.length&&f[0].type==='SOLID'){const h=__hex(f[0].color);let o=null;if(h==='#ff4b3e'&&v.height>20)o=v.width>40?.12:.08;if(h==='#3d6bff'&&v.height>20)o=.08;if(h==='#4a525c')o=.45;if(o!=null&&f[0].opacity!==o){__op(v,o);n++;}}const s=v.strokes;if(Array.isArray(s)&&s.length&&s[0].type==='SOLID'&&__hex(s[0].color)==='#e9edf1'&&v.height>20&&v.width<3&&s[0].opacity!==.5){__op(v,.5,'strokes');n++;}}
 if(v.type==='INSTANCE'&&v.mainComponent&&v.mainComponent.id==='173:4969'&&v.fills.length&&Math.abs(v.fills[0].opacity-.1)>.01){__op(v,.1);n++;}
 if(v.name==='Status pill'&&v.fills.length&&__hex(v.fills[0].color)==='#ff4b3e'&&v.fills[0].opacity>.5){__op(v,.12);n++;}
 if(v.name==='Status pill'&&v.fills.length&&__hex(v.fills[0].color)==='#f5c542'&&v.fills[0].opacity>.5){__op(v,.14);n++;}
 if(v.name==='sw'&&v.fills.length&&__hex(v.fills[0].color)==='#ff4b3e'&&v.width===10&&v.fills[0].opacity>.5){__op(v,.35);n++;}
}return n;};

const CFG={src:'146:2936',y:10274,
metrics:[['Avg dwell','19.8','min','+8.4 vs baseline','Warning'],['On-time sort','78','%','J-12 jam \u00b7 9 cuts late','Fault'],['Processed','233','veh','\u221261 vs run 00','Warning'],['Queue','16','veh','Crest held behind X-24','Fault']],
chip:{state:'Fault',label:'X-24 FAULT'},runChip:{state:'Live',label:'LIVE \u00b7 8\u00d7'},
dos:{state:'Vehicle',kicker:'Switch',id:'X-24',pill:'FAULT',pillColor:'jam',rows:[null,['TYPE','Point detection lost'],['ROUTE','Lead L2 \u2192 B-03\u2026B-06'],['STATE','Locked reverse. 9 cuts held at the crest.','jam'],['HELD','PL-33 \u00b7 PL-36'],['CLEARS','in 04:00']]}};
// CFG injected above
const pg=figma.root.children.find(p=>p.id==='122:1508');await figma.setCurrentPageAsync(pg);
for(const s of ['Regular','Medium','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style:s});for(const s of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'JetBrains Mono',style:s});
const RV={'bg/surface':'VariableID:122:1479','line/subtle':'VariableID:122:1482','text/primary':'VariableID:122:1484','text/secondary':'VariableID:122:1485','live':'VariableID:122:1489','jam':'VariableID:122:1490','flow':'VariableID:122:1487'};
const COMP={hdr:'173:4618',strip:'173:4692',mh:'173:4732',legend:'170:4777',zoom:'170:4757',mini:'170:4766',dos:'173:4869',transport:'173:4758',tl:'173:4779',rack:'173:4980',tag:'170:4694',veh:'170:4624',sig:'170:4635',ret:'170:4709',replay:'170:4815'};
const src=await figma.getNodeByIdAsync(CFG.src);
// ---- Phase A: clone
const cp=$fig.clone($fig.get(CFG.src),{name:src.name.replace('Control room v2','Control room v2.1'),x:src.x,y:CFG.y});
await $fig.done();
const F=cp.node;
const byName=(p,n)=>p.children.find(c=>c.name===n);
const body=byName(F,'Body'),stage=byName(body,'Stage'),map=stage.children.find(c=>c.name.startsWith('Yard map')),tiles=byName(stage,'Outcome tiles'),scrub=stage.children.find(c=>c.name.startsWith('Timeline')),rackOld=byName(body,'Variable rack'),top=byName(F,'Top bar');
const mhOld=byName(map,'Map header');const mhTexts=mhOld.findAllWithCriteria({types:['TEXT']}).map(t=>t.characters);
const overlayNames=n=>n==='Map header'||n==='Map controls'||n==='Map legend'||n.startsWith('Callout')||n.startsWith('Fault callout')||n.startsWith('Dossier')||n.startsWith('Mini-map')||n==='Leader';
const callouts=map.children.filter(c=>c.name.startsWith('Callout')).map(c=>{const pr=c.componentProperties||{};const v=k=>{const kk=Object.keys(pr).find(x=>x.startsWith(k));return kk?pr[kk].value:'';};return {id:c.id,x:c.x,y:c.y,label:[v('Name'),v('Size'),v('Dest')].filter(Boolean).join(' ')};});
const removeIds=[top.id,tiles.id,scrub.id,rackOld.id,mhOld.id,...map.children.filter(c=>c.name==='Map controls'||c.name==='Map legend'||c.name.startsWith('Callout')||c.name.startsWith('Fault callout')||c.name.startsWith('Dossier')||c.name.startsWith('Mini-map')||c.name==='Leader').map(c=>c.id)];
// shift content
for(const c of map.children){if(!overlayNames(c.name)){c.x+=10;c.y+=24;}}
stage.resizeWithoutConstraints(1120,844);map.resizeWithoutConstraints(1120,616);map.y=88;map.x=0;
// ---- Phase B: place v2.1 instances
const sv=n=>$fig.getVar(RV[n]);
const hdr=$fig.instance(COMP.hdr,{props:{Mode:'Build'},x:0,y:0});$fig.get(F.id).append(hdr);
const strip=$fig.instance(COMP.strip,{x:0,y:0});$fig.get(stage.id).append(strip);
const mh=$fig.instance(COMP.mh,{x:0,y:0,props:{Title:CFG.title||mhTexts[0]||'Yard',Sub:CFG.sub||mhTexts[1]||''}});$fig.get(map.id).append(mh);
const leg=$fig.instance(COMP.legend);$fig.get(map.id).append(leg);
const mini=$fig.instance(COMP.mini,{x:16,y:616-16-100});$fig.get(map.id).append(mini);
const zoom=$fig.instance(COMP.zoom,{x:16,y:616-16-100-8-30});$fig.get(map.id).append(zoom);
const dos=$fig.instance(COMP.dos,{props:{State:CFG.dos.state},x:1120-16-248,y:74});$fig.get(map.id).append(dos);
const tags=callouts.map(c=>{const t=$fig.instance(COMP.tag,{props:{State:'Selected',Label:c.label},x:c.x+10,y:c.y+24+7});$fig.get(map.id).append(t);return t;});
let rb=null;if(CFG.replay){rb=$fig.instance(COMP.replay,{props:{Playhead:'T+01:30:00',Live:'live T+02:30:00'}});$fig.get(map.id).append(rb);}
const bottom=$fig.autoLayout({name:'Bottom row',x:0,y:704,width:1120,height:140,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',fills:[{type:'SOLID',color:sv('bg/surface')}],strokes:[{type:'SOLID',color:sv('line/subtle')}],strokeWeight:1},[$fig.instance(COMP.transport,{layoutSizingVertical:'FILL'}),$fig.instance(COMP.tl,{props:{Mode:CFG.replay?'Replay':'Live'}})]);$fig.get(stage.id).append(bottom);
const rack=$fig.instance(COMP.rack,{x:1120,y:0});$fig.get(body.id).append(rack);
removeIds.forEach(id=>$fig.get(id).remove());
await $fig.done();
// ---- Phase C: raw tweaks
const setP=(inst,o)=>{const pr=inst.componentProperties;const m={};for(const k in o){const kk=Object.keys(pr).find(x=>x===k||x.startsWith(k+'#'));if(kk)m[kk]=o[k];}inst.setProperties(m);};
const b=bottom.node;b.strokeTopWeight=1;b.strokeBottomWeight=0;b.strokeLeftWeight=0;b.strokeRightWeight=0;
strip.node.resize(1120,88);
const slots=strip.node.children;CFG.metrics.forEach((m,i)=>{const ti=slots[i].children[0];setP(ti,{Status:m[4],Label:m[0],Value:m[1],Unit:m[2],Sub:m[3]});});
mh.node.resize(1120,mh.node.height);
if(CFG.chip){const chip=mh.node.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id==='170:4717');if(chip){chip.setProperties({State:CFG.chip.state});if(CFG.chip.label){const t=chip.findAllWithCriteria({types:['TEXT']})[0];t.characters=CFG.chip.label;}}}
if(CFG.runChip){const rc=hdr.node.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id==='170:4726');rc.setProperties({State:CFG.runChip.state});if(CFG.runChip.label)rc.findAllWithCriteria({types:['TEXT']})[0].characters=CFG.runChip.label;}
zoom.node.y=616-16-100-8-zoom.node.height;
const L=leg.node;L.x=1120-16-L.width;L.y=616-16-L.height;
if(CFG.zoom){const z=zoom.node.findAllWithCriteria({types:['TEXT']}).find(t=>t.characters==='100%');if(z)z.characters=CFG.zoom;}
if(rb){rb.node.x=Math.round((1120-rb.node.width)/2);rb.node.y=616-16-32;}
// dossier texts
const D=dos.node;const vcache={};const gv=async k=>vcache[k]||(vcache[k]=await figma.variables.getVariableByIdAsync(RV[k]));
const tint=async(t,k)=>{t.fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ffffff'),'color',await gv(k))];};
if(CFG.dos.state!=='Empty'){const ts=D.findAllWithCriteria({types:['TEXT']});ts[0].characters=CFG.dos.kicker;const head=D.children.find(c=>c.name==='Head');const ht=head.findAllWithCriteria({types:['TEXT']});ht[0].characters=CFG.dos.id;ht[1].characters=CFG.dos.pill;
 if(CFG.dos.pillColor){const pill=head.children.find(c=>c.name==='Status pill');pill.fills=[Object.assign(figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ffffff'),'color',await gv(CFG.dos.pillColor)),{opacity:.12})];await tint(ht[1],CFG.dos.pillColor);}
 const rows=D.children.filter(c=>c.name.startsWith('Row '));
 for(let i=0;i<rows.length;i++){const r=rows[i];const spec=CFG.dos.rows[i];if(!spec){r.visible=false;continue;}const rt=r.findAllWithCriteria({types:['TEXT']});rt[0].characters=spec[0];rt[rt.length-1].characters=spec[1];await tint(rt[rt.length-1],spec[2]||'text/primary');if(r.name==='Row SoC'&&spec[3]!=null){const bar=r.children.find(c=>c.name==='Bar');bar.children[0].resize(Math.max(2,Math.round(48*spec[3])),4);bar.children[0].fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ffffff'),'color',await gv(spec[2]||'text/secondary'))];}}}
// swaps
const sets={};for(const k of ['veh','sig','tag','ret']){const s=await figma.getNodeByIdAsync(COMP[k]);sets[k]={};for(const c of s.children)sets[k][c.name]=c;}
const vp=n=>Object.fromEntries(n.split(', ').map(x=>x.split('=')));
let cnt={veh:0,sig:0,tag:0,ret:0};
const layer=n=>map.children.find(c=>c.name===n);
const vL=layer('Vehicles');if(vL)for(const i of vL.findAllWithCriteria({types:['INSTANCE']})){const mc=i.mainComponent;if(!mc||!mc.parent||mc.parent.id!=='139:2088')continue;const p=vp(mc.name);let st={Flowing:'Moving',Idle:'Standing',Charging:'Low SoC',Fault:'Blocked',Selected:'Selected'}[p.State]||'Standing';if((p.State==='Flowing'||p.State==='Idle')&&p.SoC==='20')st='Low SoC';const y=i.y,x=i.x,r=i.rotation;i.swapComponent(sets.veh['State='+st]);i.rotation=r;i.x=x;i.y=y+1;cnt.veh++;}
const sL=layer('Signals');if(sL)for(const i of sL.findAllWithCriteria({types:['INSTANCE']})){const mc=i.mainComponent;if(!mc||!mc.parent||mc.parent.id!=='139:2150')continue;const p=vp(mc.name);const a={Clear:'Go',Approach:'Warn',Stop:'Stop',Dark:'Stop'}[p.Aspect]||'Stop';const x=i.x,y=i.y,r=i.rotation;i.swapComponent(sets.sig[`Facing=${p.Facing}, Aspect=${a}`]);i.rotation=r;i.x=x-2;i.y=y;cnt.sig++;}
const tL=layer('Platoon tags');if(tL)for(const i of tL.findAllWithCriteria({types:['INSTANCE']})){const mc=i.mainComponent;if(!mc||!mc.parent||mc.parent.id!=='139:2139')continue;const pr=i.componentProperties;const lk=Object.keys(pr).find(k=>k.startsWith('Label'));const lab=lk?pr[lk].value:'';const st={Flowing:'Flowing',Selected:'Selected',Holding:'Holding',Jammed:'Blocked'}[vp(mc.name).State]||'Through';const x=i.x,y=i.y;i.swapComponent(sets.tag['State='+st]);setP(i,{Label:lab});i.x=x;i.y=y;cnt.tag++;}
const rL=layer('Retarders');if(rL)for(const i of rL.findAllWithCriteria({types:['INSTANCE']})){const mc=i.mainComponent;if(!mc||!mc.parent||mc.parent.id!=='139:2191')continue;const x=i.x,y=i.y,r=i.rotation;i.swapComponent(sets.ret[mc.name]||sets.ret['State=Idle']);i.rotation=r;i.x=x;i.y=y;cnt.ret++;}
// keep overlays on top
for(const n of [mh.node,leg.node,mini.node,zoom.node,...tags.map(t=>t.node),dos.node,...(rb?[rb.node]:[])])map.appendChild(n);
const fixed=fixOpacity(F);
return {fixed,frame:F.id,name:F.name,cnt,mhTexts,callouts:callouts.map(c=>c.label),removed:removeIds.length,dosH:D.height};
