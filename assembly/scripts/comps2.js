const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const carDef={'OK':['line/strong',1,null,{}],'Selected':['sel',2,null,{}],'Low battery':['live',1,'live',{soc:'live'}],'Wrong block':['jam',1,'jam',{id:'jam'}],'Hazmat':['jam',1,'jam',{cargo:'jam'}],'Axle':['live',1,'live',{gross:'live'}],'Over length':['jam',1,'jam',{dash:true}],'Empty':['line/control',1,null,{dash:true,empty:true}]};
const ccar=$fig.variants({name:'asm/Cargo car'},Object.entries(carDef).map(([s,[st,sw,ti,o]])=>$fig.component({name:'State='+s,layoutMode:'VERTICAL',itemSpacing:2,width:64,height:64,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',...P(6,4,6,6),cornerRadius:N('sm'),fills:o.empty?F('bg/base'):F('bg/control'),strokes:F(st),strokeWeight:sw,strokeAlign:'INSIDE',clipsContent:true,...(o.dash?{dashPattern:[3,2]}:{})},[
 ...(ti?[tint(ti,ti==='live'?.14:.12,64,64)]:[]),
 T('PV-0471','label',o.id||(o.empty?'text/secondary':'text/primary')).textProp('ID'),
 T(o.empty?'Empty':"40' ctr",'cap',o.cargo||(o.empty?'text/muted':'text/secondary')).textProp('Cargo'),
 sp(),
 $fig.autoLayout({name:'Foot',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER'},[T('38 t','label',o.gross||'text/secondary').textProp('Gross'),sp(),T('82%','label',o.soc||'text/muted').textProp('SoC')])])));
const stc=s=>s==='Fault'?'jam':s==='Warning'?'live':'text/primary';
const cons=$fig.variants({name:'asm/Constraint'},['OK','Warning','Fault'].map(s=>$fig.component({name:'Status='+s,layoutMode:'VERTICAL',itemSpacing:2,width:136,layoutSizingHorizontal:'FIXED'},[T('Length','cap','text/muted').textProp('Label'),T('181.5 / 172 m','ds',stc(s)).textProp('Value'),T('Over by 9.5 m','cap',s==='OK'?'text/muted':stc(s),{layoutSizingHorizontal:'FILL',textAutoResize:'HEIGHT'}).textProp('Note')])));
const shDef={'Default':[[],'line/subtle',null],'Dragging':[F('bg/raised'),'sel',OV],'Ghost':[[],'line/control',null],'Assigned':[[],'line/subtle',null]};
const ship=$fig.variants({name:'asm/Shipment row'},Object.entries(shDef).map(([s,[fi,st,ef]])=>{const mute=s==='Ghost'||s==='Assigned';return $fig.component({name:'State='+s,layoutMode:'HORIZONTAL',width:456,height:48,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',itemSpacing:N('s3'),...P(N('s3'),N('s3'),0,0),fills:fi,strokes:F(st),strokeWeight:1,strokeAlign:'INSIDE',cornerRadius:s==='Dragging'?N('sm'):0,...(ef?{effects:ef}:{}),...(s==='Ghost'?{dashPattern:[4,3]}:{})},[
 T('\u2237','body',s==='Dragging'?'text/primary':'text/disabled'),
 $fig.autoLayout({name:'ID',width:76,layoutSizingHorizontal:'FIXED'},[T('SHP-4446','ds',mute?'text/disabled':'text/primary').textProp('ID')]),
 $fig.autoLayout({name:'What',layoutMode:'VERTICAL',itemSpacing:0,layoutGrow:1},[T("20' intermodal",'meta',mute?'text/disabled':'text/primary').textProp('Type'),T('KFL \u2192 STL','cap',mute?'text/disabled':'text/muted').textProp('Route')]),
 T('','cap','text/muted').textProp('Note'),
 $fig.autoLayout({name:'T',width:44,layoutSizingHorizontal:'FIXED',primaryAxisAlignItems:'MAX'},[T('14 t','data',mute?'text/disabled':'text/secondary').textProp('Tonnes')]),
 $fig.autoLayout({name:'Due',width:44,layoutSizingHorizontal:'FIXED',primaryAxisAlignItems:'MAX'},[T('14:20','data',mute?'text/disabled':'text/muted').textProp('Due')])]);}));
const optDef={'Default':['line/strong',[],'text/secondary'],'Selected':['sel',F('bg/control'),'text/primary'],'Disabled':['line/subtle',[],'text/disabled']};
const opt=$fig.variants({name:'asm/Option chip'},Object.entries(optDef).map(([s,[st,fi,tc]])=>$fig.component({name:'State='+s,layoutMode:'HORIZONTAL',height:28,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',...P(10,10,0,0),cornerRadius:N('sm'),fills:fi,strokes:F(st),strokeWeight:s==='Selected'?2:1,strokeAlign:'INSIDE'},[T("40' intermodal",'meta',tc).textProp('Label')])));
const stepBtn=(c)=>$fig.autoLayout({name:'Btn '+c,width:32,height:32,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER',fills:F('bg/control')},[T(c,'bs','text/primary')]);
const stepper=$fig.component({name:'asm/Stepper',layoutMode:'HORIZONTAL',counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),strokes:F('line/strong'),strokeWeight:1,strokeAlign:'INSIDE',clipsContent:true},[stepBtn('\u2212'),$fig.autoLayout({name:'Value',width:72,height:32,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER'},[T('36.0 t','ds','text/primary').textProp('Value')]),stepBtn('+')]);
const tab=$fig.variants({name:'asm/Tab'},['Active','Default'].map(s=>$fig.component({name:'State='+s,layoutMode:'HORIZONTAL',height:36,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',itemSpacing:N('s2'),...P(0,0,0,0),strokes:F(s==='Active'?'text/primary':'line/subtle'),strokeWeight:s==='Active'?2:0,strokeAlign:'INSIDE'},[T('Spare vehicles','bs',s==='Active'?'text/primary':'text/muted').textProp('Label'),T('3','data','text/muted').textProp('Count')])));
const grp=$fig.autoLayout({name:'Cargo components',layoutMode:'VERTICAL',itemSpacing:N('s6')},[T('Cargo (Nov 18)','h','text/primary'),ccar,cons,ship,opt,stepper,tab]);
$fig.get('188:1463').append(grp);
await $fig.done();
const grid=(s,cols,gx,gy)=>{const ch=s.children;let mw=0,mh=0;ch.forEach(c=>{mw=Math.max(mw,c.width);mh=Math.max(mh,c.height);});ch.forEach((c,i)=>{c.x=16+(i%cols)*(mw+gx);c.y=16+Math.floor(i/cols)*(mh+gy);});const rows=Math.ceil(ch.length/cols);s.resizeWithoutConstraints(32+Math.min(cols,ch.length)*(mw+gx)-gx,32+rows*(mh+gy)-gy);};
grid(ccar.node,8,8,0);grid(cons.node,3,16,0);grid(ship.node,1,0,8);grid(opt.node,3,8,0);grid(tab.node,2,24,0);
const v=await figma.variables.getVariableByIdAsync(R['bg/raised']);
for(const s of [ccar,cons,ship,opt,tab])s.node.fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#13171b'),'color',v)];
for(const t of ccar.node.findAllWithCriteria({types:['RECTANGLE']}))if(t.name==='Tint')t.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
for(const c of [...tab.node.children])if(c.name==='State=Active'){c.strokeTopWeight=0;c.strokeLeftWeight=0;c.strokeRightWeight=0;c.strokeBottomWeight=2;}
for(const c of ship.node.children)if(c.name!=='State=Dragging'&&c.name!=='State=Ghost'){c.strokeTopWeight=0;c.strokeLeftWeight=0;c.strokeRightWeight=0;c.strokeBottomWeight=1;}
return {ccar:ccar.node.id,cons:cons.node.id,ship:ship.node.id,opt:opt.node.id,stepper:stepper.node.id,tab:tab.node.id,grp:grp.node.id};
