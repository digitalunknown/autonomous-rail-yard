const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const D=await figma.getNodeByIdAsync('199:2757');
const pop=D.findOne(n=>n.name==='Cargo editor \u00b7 PV-0611');
const kids=Object.fromEntries(pop.children.map(c=>[c.name,c.id]));
const leftIds=['Field \u00b7 Shipment','Field \u00b7 Cargo type','Load row','Field \u00b7 Fill','Flags + class'].map(n=>kids[n]);
const rightIds=['Field \u00b7 Effect','Actions'].map(n=>kids[n]);
const L=$fig.autoLayout({name:'Fields',layoutMode:'VERTICAL',width:456,layoutSizingHorizontal:'FIXED',itemSpacing:N('s4')});
const Rt=$fig.autoLayout({name:'Effect column',layoutMode:'VERTICAL',layoutGrow:1,layoutSizingVertical:'FILL',itemSpacing:N('s4'),...P(N('s6'),0,0,0),strokes:F('line/subtle'),strokeWeight:1},[]);
const body=$fig.autoLayout({name:'Body',layoutSizingHorizontal:'FILL',itemSpacing:N('s6')},[L,Rt]);
$fig.get(pop.id).addAt(1,body);
for(const id of leftIds)$fig.move($fig.get(id),L);
for(const id of rightIds)$fig.move($fig.get(id),Rt);
await $fig.done();
for(const s of ['Regular','Medium','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style:s});for(const s of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'JetBrains Mono',style:s});
pop.resize(880,pop.height);pop.x=0;
const rt=Rt.node;rt.strokeTopWeight=0;rt.strokeRightWeight=0;rt.strokeBottomWeight=0;rt.strokeLeftWeight=1;
const ren={'Gross weight':'Gross','Axle load (limit 14.0 t)':'Axle load','Train weight (limit 560 t)':'Train weight','Brake margin on 1.2% grade':'Brake margin','Rear six cars':'Rear six cars'};
for(const t of rt.findAll(n=>n.type==='TEXT'&&ren[n.characters]))t.characters=ren[t.characters];
const ef=rt.findOne(n=>n.name==='Field \u00b7 Effect');ef.layoutSizingHorizontal='FILL';
const act=rt.findOne(n=>n.name==='Actions');act.layoutMode='VERTICAL';act.itemSpacing=12;act.counterAxisAlignItems='MAX';act.layoutSizingHorizontal='FILL';
const note=act.findOne(n=>n.type==='TEXT');note.layoutGrow=0;note.layoutSizingHorizontal='FILL';note.textAutoResize='HEIGHT';note.characters='Limits: 14.0 t per axle, 560 t per train, 10% brake margin on the 1.2% grade. Applying clears the axle warning; 3 t of SHP-4436 returns to the queue.';
// move buttons into a row: keep vertical stack ok
// spacer above actions
const efi=rt.children.indexOf(act);
// bulk head fill
const bulk=D.findOne(n=>n.name==='Cargo editor \u00b7 bulk');const hd=bulk.children[0];hd.layoutSizingHorizontal='FILL';
for(const t of bulk.findAll(n=>n.type==='TEXT'&&n.characters==='Max axle in selection'))t.characters='Max axle load';
for(const t of D.findAll(n=>n.type==='TEXT'&&n.characters==='STATE 1 \u00b7 SINGLE CAR'))t.characters='STATE 1 \u00b7 SINGLE CAR (PV-0611)';
return {h:pop.height,w:pop.width};
