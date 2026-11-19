for(const s of ['Regular','Medium','Semi Bold','Bold'])await figma.loadFontAsync({family:'Inter',style:s});for(const s of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'JetBrains Mono',style:s});
const R={'bg/base':'VariableID:122:1478','bg/surface':'VariableID:122:1479','bg/raised':'VariableID:122:1480','bg/control':'VariableID:122:1481','line/subtle':'VariableID:122:1482','line/strong':'VariableID:122:1483','text/primary':'VariableID:122:1484','text/secondary':'VariableID:122:1485','text/muted':'VariableID:122:1486','flow':'VariableID:122:1487','sel':'VariableID:122:1488','live':'VariableID:122:1489','jam':'VariableID:122:1490','line/control':'VariableID:169:1468','text/disabled':'VariableID:169:1469','on':'VariableID:169:1470','tmain':'VariableID:169:1471','tyard':'VariableID:169:1472','stand':'VariableID:169:1473'};
const VC={};const C=n=>VC[n]||(VC[n]=$fig.getVar(R[n]));
const M={sm:'VariableID:122:1492',md:'VariableID:122:1493',pill:'VariableID:122:1495',s1:'VariableID:122:1496',s2:'VariableID:122:1497',s3:'VariableID:122:1498',s4:'VariableID:122:1499',s6:'VariableID:122:1500',s8:'VariableID:169:1474'};const VM={};const N=n=>VM[n]||(VM[n]=$fig.getVar(M[n]));
const TS={h:'S:bec0d80a3b9fe3faadfadd0ad8f7de4a86db7752,',body:'S:7e569989b2492a7ae57bb8a78be05f64209507e6,',metric:'S:9d3f95e46c1ac9831d256663da969007fa33398f,',label:'S:209146cb8ea70415095feacc49b666a084bbd7fb,',data:'S:fc36b2d5ca692a5e25e1601696ef504ca1853c61,',cap:'S:30bdb7d8d1aa00702d360f8220825528ffe8f1fc,',meta:'S:e7246878229eda0b0fe455a9e4b96464bcac4c52,',bs:'S:b6c49ed74a569ed37be6e6a7a6d401ae358817e1,',ds:'S:0cdfc5fa7ed46db9837ed50d4fed2f442420530b,',dl:'S:a416d0490fbe947a69d0ea72ad5762e6ee223e60,',gl:'S:aff73bb51df1bd13e7790008a176d8ad4845c573,',title:'S:6e83b71735bd360a5b144d010b48ea52b386b28c,'};const VS={};const ST=n=>VS[n]||(VS[n]=$fig.getStyle(TS[n]));
const OV=$fig.getStyle('S:93eec134b7f4ca78e0719404f3f9ed7629ccccc8,');
const F=n=>[{type:'SOLID',color:C(n)}];
const T=(ch,st,col,x={})=>$fig.text({characters:ch,textStyle:ST(st),fills:F(col),...x});
const sp=()=>$fig.frame({name:'Spacer',height:1,fills:[],layoutGrow:1});
const P=(l,r,t,b)=>({paddingLeft:l,paddingRight:r,paddingTop:t,paddingBottom:b});
const tint=(col,o,w,h,extra={})=>$fig.rectangle({name:'Tint',layoutPositioning:'ABSOLUTE',x:0,y:0,width:w,height:h,fills:F(col),opacity:o,...extra});
const COMP={hdr:'173:4618',btn:'173:4925',chip:'170:4717',runChip:'170:4726',dos:'173:4869',mini:'170:4766',view:'173:4649'};
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
