const pg=figma.root.children.find(p=>p.id==='122:1508');await figma.setCurrentPageAsync(pg);
const __hex=c=>'#'+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
const __op=(n,o,k='fills')=>{n[k]=n[k].map(p=>Object.assign({},p,{opacity:o}));};
const fixOpacity=(root)=>{let n=0;for(const v of root.findAllWithCriteria({types:['VECTOR','RECTANGLE','INSTANCE','FRAME']})){
 if(v.parent&&v.parent.name==='Plot'&&(v.type==='VECTOR'||v.type==='RECTANGLE')){const f=v.fills;if(Array.isArray(f)&&f.length&&f[0].type==='SOLID'){const h=__hex(f[0].color);let o=null;if(h==='#ff4b3e'&&v.height>20)o=v.width>40?.12:.08;if(h==='#3d6bff'&&v.height>20)o=.08;if(h==='#4a525c')o=.45;if(o!=null&&f[0].opacity!==o){__op(v,o);n++;}}const s=v.strokes;if(Array.isArray(s)&&s.length&&s[0].type==='SOLID'&&__hex(s[0].color)==='#e9edf1'&&v.height>20&&v.width<3&&s[0].opacity!==.5){__op(v,.5,'strokes');n++;}}
 if(v.type==='INSTANCE'&&v.mainComponent&&v.mainComponent.id==='173:4969'&&v.fills.length&&Math.abs(v.fills[0].opacity-.1)>.01){__op(v,.1);n++;}
 if(v.name==='Status pill'&&v.fills.length&&__hex(v.fills[0].color)==='#ff4b3e'&&v.fills[0].opacity>.5){__op(v,.12);n++;}
 if(v.name==='Status pill'&&v.fills.length&&__hex(v.fills[0].color)==='#f5c542'&&v.fills[0].opacity>.5){__op(v,.14);n++;}
 if(v.name==='sw'&&v.fills.length&&__hex(v.fills[0].color)==='#ff4b3e'&&v.width===10&&v.fills[0].opacity>.5){__op(v,.35);n++;}
}return n;};
const z=await figma.getNodeByIdAsync('170:4757');z.layoutSizingHorizontal='HUG';z.layoutSizingVertical='HUG';
const res={};for(const id of ['173:4980','173:4779','173:4869','176:4752','170:4615']){res[id]=fixOpacity(await figma.getNodeByIdAsync(id));}
// re-place zoom in 07.2 copy above minimap
const F=await figma.getNodeByIdAsync('176:4752');const zi=F.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.id==='170:4757');zi.y=616-16-100-8-zi.height;
return {res,z:[z.width,z.height]};
