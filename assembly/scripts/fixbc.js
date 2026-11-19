for(const s of ['Regular','Medium','Semi Bold'])await figma.loadFontAsync({family:'Inter',style:s});for(const s of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'JetBrains Mono',style:s});
const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const B=await figma.getNodeByIdAsync('199:2757');const pop=B.findOne(n=>n.name==='Cargo editor \u00b7 PV-0611');const act=pop.findOne(n=>n.name==='Actions');const rt=act.parent;const note=act.children[0];
rt.insertChild(rt.children.indexOf(act),note);note.layoutSizingHorizontal='FILL';note.textAutoResize='HEIGHT';
act.layoutWrap='NO_WRAP';act.primaryAxisAlignItems='MAX';rt.primaryAxisAlignItems='MIN';
// spacer: push actions to bottom by making effect grow? keep MIN but set act layoutGrow none
const C=await figma.getNodeByIdAsync('201:2920');
const sc=C.findOne(n=>n.name==='Scrim');if(sc)sc.remove();
const drag=C.findOne(n=>n.name==='Dragging SHP-4425');const nk=Object.keys(drag.componentProperties).find(k=>k.startsWith('Note'));drag.setProperties({[nk]:''});drag.resize(320,48);
const car=C.findOne(n=>n.name==='Car PV-0640');const ab=car.absoluteBoundingBox,fb=C.absoluteBoundingBox;drag.rotation=0;drag.x=ab.x-fb.x+ab.width/2-28;drag.y=ab.y-fb.y-58;drag.rotation=-2;
const st=C.findOne(n=>n.name==='Consist + weight (suggested)');const lab=st.findOne(n=>n.type==='TEXT'&&n.characters==='172 m');lab.x=Math.round(172*5.2)-40;
const p=C.findOne(n=>n.name==='Preview SHP-4446 \u00b7 4436');const ts=p.findAll(n=>n.type==='TEXT');ts[0].characters='SHP-4446';ts[2].characters='SHP-4446: no empty STL car. SHP-4436: 3 t is under the 5 t per-car minimum.';
return {note:note.height,rt:rt.height};
