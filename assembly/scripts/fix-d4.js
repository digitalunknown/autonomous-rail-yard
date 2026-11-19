for(const s of ['Regular','Medium','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style:s});for(const s of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'JetBrains Mono',style:s});
const D=await figma.getNodeByIdAsync('193:2391');const plot=D.findOne(n=>n.name==='Slot timeline');
const out=[];
for(const b of plot.children.filter(n=>n.name.startsWith('Slot '))){if(b.width<200){const l1=b.children[0];const dep=l1.children[l1.children.length-1];const l2=b.children[1];if(l2.type==='TEXT'){l2.characters=dep.characters+' \u00b7 '+(b.name.includes('PL-49')?'10 veh \u00b7 ready':'8 veh \u00b7 ready');}dep.visible=false;l1.children.find(n=>n.name==='Spacer').visible=false;out.push(b.name);}
 const f=b.findOne(n=>n.name==='Flags');if(f){f.itemSpacing=8;const tx=f.children;tx[0].characters='\u25c6 Over 9.5 m';tx[1].characters='\u25c6 Block order';tx[2].characters='\u25b2 Low battery';}}
for(const t of plot.children.filter(n=>n.type==='TEXT')){if(t.characters==='16:00'){t.x=t.x-40;}if(t.characters==='13:45')t.visible=false;}
return out;
