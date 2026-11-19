const pg=figma.root.children.find(p=>p.id==='122:1508');await figma.setCurrentPageAsync(pg);
const sheet=await figma.getNodeByIdAsync('170:4615');
const isT=p=>p.type==='SOLID'&&p.visible!==false&&p.opacity<0.999;
const cands=sheet.findAll(n=>!n.id.includes(';')&&n.type!=='INSTANCE'&&('fills' in n)&&Array.isArray(n.fills)&&n.fills.some(isT));
const shapes=[],conts=[];
for(const n of cands){if(['VECTOR','RECTANGLE','ELLIPSE'].includes(n.type)&&n.name!=='Viewport')shapes.push(n);else conts.push(n);}
// shapes: move paint opacity to node opacity
for(const n of shapes){const p=n.fills.find(isT);const o=p.opacity;n.fills=n.fills.map(x=>Object.assign({},x,{opacity:1}));n.opacity=n.opacity*o;}
// containers (and viewport): tint child
const plans=[];
for(const n of conts){const p=n.fills.find(isT);const bv=p.boundVariables&&p.boundVariables.color;const fill=bv?{type:'SOLID',color:$fig.getVar(bv.id)}:{type:'SOLID',color:p.color};
 const isAL=n.layoutMode&&n.layoutMode!=='NONE';
 const r=$fig.rectangle({name:'Tint',width:n.width,height:n.height,x:0,y:0,fills:[fill],opacity:p.opacity,...(isAL?{layoutPositioning:'ABSOLUTE'}:{}),...('cornerRadius' in n&&typeof n.cornerRadius==='number'?{cornerRadius:n.cornerRadius}:{})});
 if(n.name==='Viewport'){$fig.get(n.parent.id).append(r);plans.push([r,n,'vp']);}else{$fig.get(n.id).addAt(0,r);plans.push([r,n,'c']);}}
await $fig.done();
for(const [r,n,k] of plans){const R=r.node;if(k==='vp'){R.x=n.x;R.y=n.y;n.parent.insertChild(n.parent.children.indexOf(n),R);n.fills=[];}else{R.x=0;R.y=0;n.fills=[];}R.constraints={horizontal:'STRETCH',vertical:'STRETCH'};}
// propagate to stale overrides in frames
const frames=['176:4752','178:5432','178:6878','178:8023','178:9831'];const touched=new Map();for(const n of [...shapes,...conts])touched.set(n.id,n);let fixed=0;
for(const fid of frames){const F=await figma.getNodeByIdAsync(fid);for(const n of F.findAll(x=>x.id.includes(';'))){const src=touched.get(n.id.split(';').pop());if(!src)continue;if(!('fills' in n))continue;const a=n.fills;if(Array.isArray(a)&&a.some(isT)){ if(src.name==='Status pill'||src.name==='Dossier')continue; n.fills=src.fills;n.opacity=src.opacity;fixed++;}}}
// sheet nested instances too (rack -> fault item)
for(const n of sheet.findAll(x=>x.id.includes(';'))){const src=touched.get(n.id.split(';').pop());if(!src||!('fills' in n))continue;if(Array.isArray(n.fills)&&n.fills.some(isT)){n.fills=src.fills;n.opacity=src.opacity;fixed++;}}
// top-level instances whose main was touched
const orph=pg.children.filter(c=>c.name==='Tint').length;
for(const rid of [...frames,'170:4615']){const Rn=await figma.getNodeByIdAsync(rid);for(const i of Rn.findAllWithCriteria({types:['INSTANCE']})){const mc=i.mainComponent;if(mc&&touched.has(mc.id)&&Array.isArray(i.fills)&&i.fills.some(isT)){i.fills=mc.fills;fixed++;}}}
return {orph,shapes:shapes.map(s=>s.name),conts:conts.map(c=>c.name),fixed};
