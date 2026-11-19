const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const BX=7920,BY=120;
const sec=(title,kids,note)=>$fig.autoLayout({name:'Field \u00b7 '+title,layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:N('s2')},[$fig.autoLayout({name:'Lbl',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER'},[T(title.toUpperCase(),'label','text/muted'),sp(),...(note?[T(note,'cap','text/muted')]:[])]),...kids]);
const wrap=(kids,name)=>$fig.autoLayout({name:name||'Wrap',layoutSizingHorizontal:'FILL',layoutWrap:'WRAP',itemSpacing:N('s2'),counterAxisSpacing:N('s2')},kids);
const chip=(l,s)=>$fig.instance(AC.opt,{name:'Opt \u00b7 '+l,props:{State:s,Label:l}});
const slider=(w,v,max,warnFrom,label)=>{const px=x=>Math.round(x/max*w);const k=[$fig.rectangle({name:'Track',x:0,y:10,width:w,height:4,cornerRadius:2,fills:F('line/strong')})];
 if(warnFrom!=null)k.push($fig.rectangle({name:'Near-limit zone',x:px(warnFrom),y:8,width:w-px(warnFrom),height:8,fills:F('live'),opacity:.25}));
 k.push($fig.rectangle({name:'Fill',x:0,y:10,width:px(v),height:4,cornerRadius:2,fills:F('text/secondary')}));
 k.push($fig.ellipse({name:'Thumb',x:px(v)-7,y:5,width:14,height:14,fills:F('text/primary')}));
 k.push(T('0 t','label','text/muted',{x:0,y:22}));k.push(T(label,'label','text/muted',{x:w-60,y:22}));
 return $fig.frame({name:'Load slider',width:w,height:36,fills:[]},k);};
const kv=(l,b,a,bc,ac)=>$fig.autoLayout({name:'Effect \u00b7 '+l,layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3'),...P(0,0,6,6),strokes:F('line/subtle'),strokeWeight:1},[T(l,'meta','text/secondary',{layoutGrow:1}),$fig.autoLayout({name:'B',width:96,layoutSizingHorizontal:'FIXED',primaryAxisAlignItems:'MAX'},[T(b,'data',bc||'text/muted')]),T('\u2192','data','text/muted'),$fig.autoLayout({name:'A',width:96,layoutSizingHorizontal:'FIXED',primaryAxisAlignItems:'MAX'},[T(a,'ds',ac||'text/primary')])]);
const swr=(l,on)=>$fig.instance(AC.sw,{name:'Flag \u00b7 '+l,props:{Label:l,State:on?'On':'Off'},layoutSizingHorizontal:'FILL'});
const btn=(k,l,st)=>$fig.instance(AC.btn,{name:'Btn \u00b7 '+l,props:{Kind:k,State:st||'Default',Label:l}});
// strip with PV-0611 selected
const states=CARS.map(c=>c[7]);states[9]='Selected';
const S=strip2(5.2,{states,chart:false});
const selX=S.pos[9][0],selW=S.pos[9][1];
// single editor popover
const PW=560;const popX=Math.min(1080-24-PW,Math.max(24,24+selX+selW/2-PW/2));
const types=[["20' intermodal",'Disabled'],["40' intermodal",'Disabled'],["53' intermodal",'Disabled'],['Bulk grain','Default'],['Aggregates','Selected'],['Automotive racks','Disabled'],['Tank / liquid','Disabled'],['Refrigerated','Disabled'],['Hazmat','Default']];
const pop=$fig.autoLayout({name:'Cargo editor \u00b7 PV-0611',width:PW,layoutSizingHorizontal:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s4'),...P(N('s4'),N('s4'),N('s4'),N('s4')),cornerRadius:N('md'),fills:F('bg/raised'),strokes:F('line/strong'),strokeWeight:1,effects:OV},[
 $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('PV-0611','dl','text/primary'),T('Hopper \u00b7 #10 \u00b7 MEM block','meta','text/muted'),sp(),T('Tare 16 t \u00b7 max gross 56 t \u00b7 4 axles','cap','text/muted')]),
 sec('Shipment',[$fig.autoLayout({name:'Shp',layoutSizingHorizontal:'FILL',itemSpacing:N('s3'),counterAxisAlignItems:'CENTER'},[T('SHP-4436','ds','text/primary'),T('KFL \u2192 MEM \u00b7 crushed limestone \u00b7 39 t booked \u00b7 due 14:20','meta','text/secondary'),sp(),btn('Ghost','Unassign')])]),
 sec('Cargo type',[wrap(types.map(([l,s])=>chip(l,s)))],'Hoppers take bulk loads only'),
 $fig.autoLayout({name:'Load row',layoutSizingHorizontal:'FILL',itemSpacing:N('s4'),counterAxisAlignItems:'MAX'},[
  sec('Load',[slider(300,36,40,37.2,'40 t max')],'36.0 of 40 t'),
  $fig.instance(AC.stepper,{props:{Value:'36.0 t'}})]),
 sec('Fill',[$fig.autoLayout({name:'Fill picks',itemSpacing:N('s2'),counterAxisAlignItems:'CENTER'},[chip('50%','Default'),chip('75%','Default'),chip('90%','Selected'),chip('100%','Default'),T('90% of hopper volume at 1.6 t/m\u00b3','cap','text/muted')])]),
 $fig.autoLayout({name:'Flags + class',layoutSizingHorizontal:'FILL',itemSpacing:N('s6'),counterAxisAlignItems:'MIN'},[
  sec('Flags',[swr('Hazmat placard',false),swr('Reefer power draw',false),swr('High-value',false)]),
  $fig.autoLayout({name:'Class',layoutMode:'VERTICAL',itemSpacing:N('s2'),width:150,layoutSizingHorizontal:'FIXED'},[T('HAZMAT CLASS','label','text/muted'),$fig.instance(AC.sel,{props:{Label:'Class',Value:'None'},layoutSizingHorizontal:'FILL'})])]),
 sec('Effect',[kv('Gross weight','55 t','52 t'),kv('Axle load (limit 14.0 t)','13.75 t \u00b7 98%','13.0 t \u00b7 93%','live'),kv('Train weight (limit 560 t)','493 t','490 t'),kv('Brake margin on 1.2% grade','12.0%','12.5%'),kv('Rear six cars','232 t','229 t')],'Before \u2192 after'),
 $fig.autoLayout({name:'Actions',layoutSizingHorizontal:'FILL',itemSpacing:N('s2'),counterAxisAlignItems:'CENTER'},[T('Clears the axle-load warning. 3 t of SHP-4436 goes back to the queue.','cap','text/muted',{layoutGrow:1}),btn('Ghost','Cancel'),btn('Primary','Apply to PV-0611')])]);
const caret=$fig.rectangle({name:'Caret',x:24+selX+selW/2-6,y:0,width:12,height:12,rotation:45,fills:F('bg/raised')});
// bulk panel
const bulkCars=[['PV-0471','38 t','40 t'],['PV-0488','41 t','40 t'],['PV-0604','40 t','40 t']];
const bulk=$fig.autoLayout({name:'Cargo editor \u00b7 bulk',width:360,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s4'),...P(N('s4'),N('s4'),N('s6'),N('s4')),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
 $fig.autoLayout({name:'Head',layoutMode:'VERTICAL',itemSpacing:2},[T('BULK STATE','label','text/muted'),T('3 cars selected','h','text/primary'),T('Shift-click on the strip. Box cars, 12.4 m, tare 14 t, max gross 48 t.','meta','text/muted',{layoutSizingHorizontal:'FILL',textAutoResize:'HEIGHT'})]),
 $fig.autoLayout({name:'Selection',itemSpacing:N('s2')},bulkCars.map(c=>$fig.autoLayout({name:'Sel '+c[0],height:24,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',...P(8,8,0,0),cornerRadius:N('sm'),strokes:F('sel'),strokeWeight:2,strokeAlign:'INSIDE',fills:F('bg/control')},[T(c[0],'label','text/primary')]))),
 sec('Cargo type',[wrap([chip("20'",'Default'),chip("40'",'Selected'),chip("53'",'Default'),chip('Refrigerated','Default'),chip('Hazmat','Default')])],"Was mixed: 40', 53', 40'"),
 sec('Load per car',[$fig.autoLayout({name:'R',itemSpacing:N('s3'),counterAxisAlignItems:'CENTER'},[$fig.instance(AC.stepper,{props:{Value:'26.0 t'}}),T('Same for all 3','cap','text/muted')])],'max 34 t'),
 sec('Flags',[swr('Hazmat placard',false),swr('Reefer power draw',false),$fig.autoLayout({name:'HV',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER'},[T('High-value','body','text/secondary'),sp(),T('Mixed \u00b7 1 of 3','cap','text/muted')])]),
 sec('Effect',[...bulkCars.map(c=>kv(c[0],c[1],c[2])),kv('Train weight','493 t','494 t'),kv('Max axle in selection','10.25 t','10.0 t')],'Gross before \u2192 after'),
 sp(),
 $fig.autoLayout({name:'Actions',layoutSizingHorizontal:'FILL',itemSpacing:N('s2'),counterAxisAlignItems:'CENTER'},[sp(),btn('Ghost','Clear selection'),btn('Primary','Apply to 3 cars')])]);
const left=$fig.autoLayout({name:'Left',x:0,y:56,width:1080,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s4'),...P(N('s6'),N('s6'),N('s6'),N('s4'))},[
 $fig.autoLayout({name:'Title',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Edit cargo','dl','text/primary'),T('PL-52 \u00b7 click a car to load it; shift-click for several','meta','text/muted'),sp(),T('STATE 1 \u00b7 SINGLE CAR','label','text/muted')]),
 S.node,
 $fig.frame({name:'Popover anchor',width:1032,height:620,fills:[],clipsContent:false},[caret,pop.set?pop:pop])]);
const D=$fig.frame({name:'B \u00b7 Cargo editor \u00b7 single + bulk',x:BX,y:BY,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);D.append(left);bulk.set({x:1080,y:56});D.append(bulk);
await $fig.done();const Dn=D.node;await runChip(Dn);
const pn=pop.node;pn.x=popX-24;pn.y=6;const cr=caret.node;cr.y=0;
const bn=bulk.node;bn.strokeTopWeight=0;bn.strokeRightWeight=0;bn.strokeBottomWeight=0;bn.strokeLeftWeight=1;
for(const n of Dn.findAll(x=>x.name.startsWith('Effect \u00b7 '))){n.strokeTopWeight=0;n.strokeLeftWeight=0;n.strokeRightWeight=0;n.strokeBottomWeight=1;}
for(const n of Dn.findAll(x=>x.name==='Spacer'&&x.parent===bn))n.layoutGrow=1;
return {D:Dn.id,popH:pn.height,popX:pn.x,bulkH:bn.height};
