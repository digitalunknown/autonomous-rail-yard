const pg=figma.root.children.find(p=>p.id==='122:1508');await figma.setCurrentPageAsync(pg);
const sheet=await figma.getNodeByIdAsync('170:4615');
const ref=new Map();
const tr=n=>{for(const k of ['fills','strokes']){const a=n[k];if(Array.isArray(a)&&a.some(p=>p.type==='SOLID'&&p.opacity<0.999))return true;}return false;};
for(const n of sheet.findAll(n=>!n.id.includes(';')&&('fills' in n)&&tr(n)))ref.set(n.id,{fills:n.fills,strokes:n.strokes});
const same=(a,b)=>a.length===b.length&&a.every((p,i)=>p.type===b[i].type&&p.type==='SOLID'&&JSON.stringify(p.color)===JSON.stringify(b[i].color)&&JSON.stringify(p.boundVariables||{})===JSON.stringify(b[i].boundVariables||{}));
const roots=['176:4752','178:5432','178:6878','178:8023','178:9831','170:4615'];const res={};
for(const rid of roots){const R=await figma.getNodeByIdAsync(rid);let c=0;for(const n of R.findAll(n=>n.id.includes(';'))){const src=ref.get(n.id.split(';').pop());if(!src)continue;for(const k of ['fills','strokes']){const a=n[k],b=src[k];if(!Array.isArray(a)||!Array.isArray(b))continue;if(same(a,b)&&a.some((p,i)=>Math.abs(p.opacity-b[i].opacity)>.001)){n[k]=a.map((p,i)=>Object.assign({},p,{opacity:b[i].opacity}));c++;}}}res[rid]=c;}
// 07.5 retarders
const F5=await figma.getNodeByIdAsync('178:9831');const rs=await figma.getNodeByIdAsync('170:4709');const rmap={};for(const c of rs.children)rmap[c.name]=c;let rc=0;
for(const i of F5.findAllWithCriteria({types:['INSTANCE']})){if(i.id.includes(';'))continue;const mc=i.mainComponent;if(mc&&mc.parent&&mc.parent.id==='139:2191'){const w=i.width,h=i.height,x=i.x,y=i.y,r=i.rotation;i.swapComponent(rmap[mc.name]||rmap['State=Idle']);i.rotation=r;i.resize(w,h);i.x=x;i.y=y;rc++;}}
return {refs:ref.size,res,rc};
