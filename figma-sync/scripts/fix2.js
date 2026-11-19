const pg=figma.root.children.find(p=>p.id==='122:1508');await figma.setCurrentPageAsync(pg);
for(const s of ['Regular','Medium','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style:s});for(const s of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'JetBrains Mono',style:s});
const lab=$fig.clone($fig.get('152:5017'),{name:'Row 07b label',x:0,y:10164});
await $fig.done();
const L=lab.node;const lt=L.findAllWithCriteria({types:['TEXT']});const before=lt.map(t=>t.characters);
for(const t of lt){await Promise.all(t.getRangeAllFontNames(0,t.characters.length).map(f=>figma.loadFontAsync(f)));}
if(lt[0])lt[0].characters='07b · Control room v2.1';
if(lt[1])lt[1].characters='Copies of row 07 re-skinned to the coded v2 build: neutral chrome, state-only colour, three-lamp signals, metric strip without heading, toggles without \u201cShow\u201d, transport + timeline bottom row, coded rack order. Originals in row 07 are untouched.';
const setP=(inst,o)=>{const pr=inst.componentProperties;const m={};for(const k in o){const kk=Object.keys(pr).find(x=>x===k||x.startsWith(k+'#'));if(kk)m[kk]=o[k];}inst.setProperties(m);};
const sentence=s=>{s=s.toLowerCase().replace(/\bpx\b/g,'px');return s.charAt(0).toUpperCase()+s.slice(1);};
const subs={'178:5432':'38 tracks \u00b7 2 ladders \u00b7 10-track bowl \u00b7 0/45/90\u00b0 geometry','176:4752':'40 tracks \u00b7 56 switches \u00b7 12-track bowl \u00b7 0/45/90\u00b0 geometry','178:6878':'34 tracks \u00b7 4 loading tracks \u00b7 6 charge bays \u00b7 0/45/90\u00b0 geometry','178:8023':'Same layout as 07.2 \u00b7 congestion overlay \u00b7 reroute preview to B-01\u2026B-03','178:9831':'Zoomed detail of the 07.2 fan \u00b7 48 px track centres'};
const MH='173:4732';const out={};
for(const [fid,sub] of Object.entries(subs)){const F=await figma.getNodeByIdAsync(fid);const mh=F.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.id===MH);setP(mh,{Sub:sub});}
// 07.3 dossier
const F3=await figma.getNodeByIdAsync('178:6878');const D3=F3.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id==='173:4869');
const rows=D3.children.filter(c=>c.name.startsWith('Row ')&&c.visible);const vals=[['VEHICLES','8'],['DEST','LT-02'],['STATE','Lift slot 14:20 \u00b7 crane C-2'],['LENGTH','108.6 m'],['AVG SOC','64%']];rows.forEach((r,i)=>{const t=r.findAllWithCriteria({types:['TEXT']});if(vals[i]){t[0].characters=vals[i][0];t[t.length-1].characters=vals[i][1];}});
// 07.5 swaps in detail viewport
const F5=await figma.getNodeByIdAsync('178:9831');const dv=F5.findAllWithCriteria({types:['FRAME']}).find(f=>f.name.startsWith('Detail viewport'));
const sets={};for(const [k,id] of Object.entries({veh:'170:4624',sig:'170:4635',tag:'170:4694'})){const s=await figma.getNodeByIdAsync(id);sets[k]={};for(const c of s.children)sets[k][c.name]=c;}
const vp=n=>Object.fromEntries(n.split(', ').map(x=>x.split('=')));const cnt={veh:0,sig:0,tag:0,other:{}};
for(const i of dv.findAllWithCriteria({types:['INSTANCE']})){if(i.parent&&i.parent.type==='INSTANCE')continue;const mc=i.mainComponent;if(!mc)continue;const pid=mc.parent&&mc.parent.id;
 if(pid==='139:2088'){const p=vp(mc.name);let st={Flowing:'Moving',Idle:'Standing',Charging:'Low SoC',Fault:'Blocked',Selected:'Selected'}[p.State]||'Standing';if((p.State==='Flowing'||p.State==='Idle')&&p.SoC==='20')st='Low SoC';const w=i.width,h=i.height,x=i.x,y=i.y,r=i.rotation;i.swapComponent(sets.veh['State='+st]);i.rotation=r;i.resize(w,Math.round(h*0.75));i.x=x;i.y=y+Math.round(h*0.125);cnt.veh++;}
 else if(pid==='139:2150'){const p=vp(mc.name);const a={Clear:'Go',Approach:'Warn',Stop:'Stop',Dark:'Stop'}[p.Aspect]||'Stop';const w=i.width,h=i.height,x=i.x,y=i.y,r=i.rotation;i.swapComponent(sets.sig[`Facing=${p.Facing}, Aspect=${a}`]);i.rotation=r;i.resize(w*16/12,h);i.x=x-(w*4/12)/2;i.y=y;cnt.sig++;}
 else if(pid==='139:2139'){const pr=i.componentProperties;const lk=Object.keys(pr).find(k=>k.startsWith('Label'));const lab=lk?pr[lk].value:'';const st={Flowing:'Flowing',Selected:'Selected',Holding:'Holding',Jammed:'Blocked'}[vp(mc.name).State]||'Through';const x=i.x,y=i.y;i.swapComponent(sets.tag['State='+st]);setP(i,{Label:lab});i.x=x;i.y=y;cnt.tag++;}
 else {const k=(mc.parent&&mc.parent.type==='COMPONENT_SET'?mc.parent.name:mc.name);cnt.other[k]=(cnt.other[k]||0)+1;}}
return {label:L.id,before,cnt};
