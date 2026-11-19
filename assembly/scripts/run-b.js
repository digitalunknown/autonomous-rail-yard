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
const ASM={meter:'188:1467',issue:'188:1492',send:'188:1509',car:'188:1518',trow:'188:1557',thead:'188:1537'};
const V=[['PV-0471','Box',12.4,38,82,'STL','B-03'],['PV-0488','Box',12.4,41,76,'STL','B-03'],['PV-0512','Hopper',14.0,52,64,'STL','B-03'],['PV-0618','Reefer',13.2,44,71,'MEM','B-08'],['PV-0526','Tank',13.6,49,58,'STL','B-03'],['PV-0533','Box',12.4,37,18,'MEM','B-08'],['PV-0590','Flat',15.8,33,69,'MEM','B-08'],['PV-0597','Flat',15.8,31,73,'MEM','B-08'],['PV-0604','Box',12.4,40,88,'MEM','B-08'],['PV-0611','Hopper',14.0,55,61,'MEM','B-09'],['PV-0625','Reefer',13.2,43,79,'MEM','B-09'],['PV-0702','Flat',15.8,30,66,'MEM','CH-01']];
const SPARE=[['PV-0640','Box',12.4,39,81,'MEM','B-09'],['PV-0655','Flat',15.8,31,92,'STL','B-04'],['PV-0677','Reefer',13.2,45,23,'STL','B-04']];
const carState=i=>i===3?'Wrong block':i===5?'Low battery':i===11?'Over length':'OK';
// consist strip: absolute frame; px per metre k; gap 1.5 m
const strip=(k,opts={})=>{const H=opts.h||40;const gap=1.5*k;let x=0;const kids=[];const pos=[];
 V.forEach((v,i)=>{const w=Math.round(v[2]*k);pos.push([x,w]);kids.push($fig.instance(ASM.car,{props:{State:opts.sel===i?'Selected':carState(i),ID:opts.full?v[0]:v[0].slice(3),SoC:v[4]+'%'},x:Math.round(x),y:opts.top||18,width:w,height:H}));x+=v[2]*k+gap;});
 const total=x-gap;const lim=172*k;
 // block brackets (contiguous runs)
 const runs=[];V.forEach((v,i)=>{if(runs.length&&runs[runs.length-1].b===v[5])runs[runs.length-1].e=i;else runs.push({b:v[5],s:i,e:i});});
 const br=runs.map(r=>{const x0=pos[r.s][0],x1=pos[r.e][0]+pos[r.e][1];const bad=r.b==='MEM'&&r.s===3&&r.e===3;return $fig.autoLayout({name:'Block '+r.b,x:Math.round(x0),y:0,width:Math.round(x1-x0),height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',counterAxisAlignItems:'MIN',strokes:F(bad?'jam':'line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[]},[T(r.b,'label',bad?'jam':'text/muted',{})]);});
 const over=$fig.rectangle({name:'Over length',x:Math.round(lim),y:(opts.top||18)-4,width:Math.round(total-lim)+2,height:H+8,fills:F('jam'),opacity:.14});
 const limLine=$fig.rectangle({name:'Limit line',x:Math.round(lim),y:0,width:1,height:(opts.top||18)+H+8,fills:F('jam')});
 const limLab=T('D-02 limit 172 m','label','jam',{x:Math.round(lim)+6,y:(opts.top||18)+H+10});
 const w=Math.max(Math.round(total)+ (opts.pad||120),opts.minW||0);
 return {node:$fig.frame({name:'Consist strip',width:w,height:(opts.top||18)+H+28,fills:[],clipsContent:false},[over,...br,...kids,limLine,limLab]),total,lim,pos};};
const header=(fr)=>{const h=$fig.instance(COMP.hdr,{props:{Mode:'Assembly'},x:0,y:0});fr.append(h);return h;};
const AC={ccar:'196:2507',cons:'196:2577',ship:'196:2590',opt:'196:2639',stepper:'196:2646',tab:'196:2653',issue:'188:1492',send:'188:1509',trow:'188:1557',thead:'188:1537',btn:'173:4925',sel:'173:4962',slider:'173:4938',sw:'173:4951',hdr:'173:4618',run:'170:4726'};
// id,type,len,tare,cargo t,soc,block,state,shp,short,long
const CARS=[
['PV-0471','Box',12.4,14,24,82,'STL','OK','SHP-4410',"40' ctr","40' intermodal"],
['PV-0488','Box',12.4,14,27,76,'STL','OK','SHP-4413',"53' ctr","53' intermodal"],
['PV-0512','Hopper',14.0,16,36,64,'STL','OK','SHP-4417','Grain','Bulk grain'],
['PV-0618','Reefer',13.2,18,26,71,'MEM','Wrong block','SHP-4421','Reefer','Refrigerated'],
['PV-0526','Tank',13.6,15,34,58,'STL','OK','SHP-4402','Syrup','Tank \u00b7 corn syrup'],
['PV-0533','Box',12.4,14,23,18,'MEM','Low battery','SHP-4425',"20' rfr","20' reefer container"],
['PV-0590','Flat',15.8,12,21,69,'MEM','Hazmat','SHP-4428','Cl 3 tank','Hazmat Cl 3 \u00b7 ethanol'],
['PV-0597','Flat',15.8,12,19,73,'MEM','Hazmat','SHP-4429','Cl 5.1 tank','Hazmat Cl 5.1 \u00b7 peroxide'],
['PV-0604','Box',12.4,14,26,88,'MEM','OK','SHP-4431',"40' HV","40' intermodal \u00b7 high value"],
['PV-0611','Hopper',14.0,16,39,61,'MEM','Axle','SHP-4436','Aggr.','Aggregates'],
['PV-0625','Reefer',13.2,18,25,79,'MEM','OK','SHP-4438','Reefer','Refrigerated'],
['PV-0702','Flat',15.8,12,18,66,'MEM','Over length','SHP-4440','Autos','Automotive racks']];
const GAP=1.5;
// strip with cargo cars + weight chart
const strip2=(k,o={})=>{const top=20,H=64;let x=0;const kids=[],pos=[];const st=i=>o.states&&o.states[i]?o.states[i]:CARS[i][7];
 CARS.forEach((c,i)=>{const w=Math.round(c[2]*k);pos.push([Math.round(x),w]);x+=c[2]*k+GAP*k;});
 const total=x-GAP*k,lim=172*k;
 const runs=[];CARS.forEach((c,i)=>{if(runs.length&&runs[runs.length-1].b===c[6])runs[runs.length-1].e=i;else runs.push({b:c[6],s:i,e:i});});
 runs.forEach(r=>{const x0=pos[r.s][0],x1=pos[r.e][0]+pos[r.e][1];const bad=r.s===3&&r.e===3;kids.push($fig.autoLayout({name:'Block '+r.b,x:x0,y:0,width:x1-x0,height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',strokes:F(bad?'jam':'line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[],clipsContent:true},[T(r.b+(r.e>r.s?' \u00d7'+(r.e-r.s+1):''),'label',bad?'jam':'text/muted')]));});
 kids.push($fig.rectangle({name:'Over length',x:Math.round(lim),y:top-4,width:Math.round(total-lim)+2,height:H+8,fills:F('jam'),opacity:.14}));
 CARS.forEach((c,i)=>kids.push($fig.instance(AC.ccar,{name:'Car '+c[0],props:{State:st(i),ID:o.short?c[0].slice(3):c[0],Cargo:c[9],Gross:(c[3]+c[4])+' t',SoC:c[5]+'%'},x:pos[i][0],y:top,width:pos[i][1],height:H})));
 kids.push($fig.rectangle({name:'Limit line',x:Math.round(lim),y:0,width:1,height:top+H+24,fills:F('jam')}));
 kids.push(T('D-02 limit 172 m','label','jam',{x:Math.round(lim)+6,y:top+H+8}));
 const hx=pos[7][0]-Math.round(GAP*k/2);
 kids.push($fig.rectangle({name:'Hazmat coupling',x:hx-1,y:top-4,width:2,height:H+16,fills:F('jam')}));
 kids.push(T('Cl 3 next to Cl 5.1, no buffer','label','jam',{x:pos[6][0],y:top+H+8}));
 if(o.chart!==false){const base=top+H+32+56,maxH=48;
  kids.push($fig.rectangle({name:'Axle limit',x:0,y:base-maxH,width:Math.round(total),height:1,fills:F('line/control')}));
  CARS.forEach((c,i)=>{const g=c[3]+c[4];const h=Math.round(g/56*maxH);kids.push($fig.rectangle({name:'Gross '+c[0],x:pos[i][0]+4,y:base-h,width:pos[i][1]-8,height:h,fills:F(st(i)==='Axle'?'live':'line/strong')}));kids.push(T(String(g),'label',st(i)==='Axle'?'live':'text/muted',{x:pos[i][0]+4,y:base-h-14}));});
  kids.push($fig.rectangle({name:'Baseline',x:0,y:base,width:Math.round(total),height:1,fills:F('line/strong')}));
  kids.push(T('56 t max gross (14 t \u00d7 4 axles)','label','text/muted',{x:Math.round(total)+8,y:base-maxH-6}));
  kids.push(T('Gross per car, t. Heavier cars belong toward the front: front six 261 t, rear six 232 t.','cap','text/muted',{x:0,y:base+8}));}
 const hgt=o.chart===false?top+H+24:top+H+32+56+28;
 return {node:$fig.frame({name:'Consist + weight',width:o.w||Math.round(total)+88,height:hgt,fills:[],clipsContent:false},kids),pos,total};};
const chevUp='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m18 15-6-6-6 6" stroke="#aeb6bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const iconBtn=(svg,label,name)=>$fig.autoLayout({name:name||label,height:28,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',itemSpacing:6,...P(8,10,0,0),cornerRadius:N('sm'),strokes:F('line/strong'),strokeWeight:1,strokeAlign:'INSIDE'},[$fig.svg(svg,{name:'Icon',width:16,height:16}),T(label,'meta','text/secondary')]);
const segc=(opts,on,name)=>$fig.autoLayout({name:name||'Segmented',itemSpacing:2,...P(2,2,2,2),cornerRadius:N('md'),fills:F('bg/base'),strokes:F('line/strong'),strokeWeight:1},opts.map((o,i)=>$fig.autoLayout({name:o,height:24,layoutSizingVertical:'FIXED',...P(N('s3'),N('s3'),0,0),counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),fills:i===on?F('bg/control'):[]},[T(o,'meta',i===on?'text/primary':'text/muted')])));
const ISSUES=[
['Fault','Over length on D-02','181.5 m with 1.5 m gaps; D-02 holds 172 m.','\u2192 Drop PV-0702 (\u221217.3 m); SHP-4440 returns to the queue'],
['Fault','Wrong block order','PV-0618 is bound for MEM but sits at #4. STL is cut first, so it would leave with the wrong block.','\u2192 Move PV-0618 to #5, behind PV-0526'],
['Fault','Hazmat cars coupled','PV-0590 (Class 3, ethanol) touches PV-0597 (Class 5.1, oxidizer). Incompatible classes need one non-hazmat car between them.','\u2192 Swap PV-0597 with PV-0604'],
['Warning','PV-0533 can\u2019t carry its reefer','18% now, 25% floor at departure. The 2.1 kW reefer container would take it to \u22122% before MEM. CH-02 out since 13:18.','\u2192 Swap for PV-0640 (81%) and move SHP-4425 with it'],
['Warning','Axle load near limit','PV-0611 weighs 55 t: 13.75 t per axle against 14.0 t on the route.','\u2192 Trim SHP-4436 to 36 t (52 t, 13.0 t per axle)']];
const SENDR='Resolve 3 violations and 2 warnings to send';
const rail=(issues)=>$fig.autoLayout({name:'Checks rail',width:360,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s4'),...P(N('s4'),N('s4'),N('s6'),N('s4')),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
 $fig.autoLayout({name:'Head',layoutMode:'VERTICAL',itemSpacing:2},[T('Checks','h','text/primary'),T('3 violations block sending \u00b7 2 warnings','meta','text/muted')]),
 ...issues.map(s=>$fig.instance(AC.issue,{name:'Issue \u00b7 '+s[1],props:{Severity:s[0],Title:s[1],Reason:s[2],Fix:s[3]}})),
 sp(),
 $fig.instance(AC.btn,{name:'Apply plan',props:{Kind:'Secondary',State:'Default',Label:'Apply suggested plan \u00b7 5 changes'},layoutSizingHorizontal:'FILL'}),
 $fig.instance(AC.send,{props:{State:'Blocked',Reason:SENDR}})]);
const fixRail=(r)=>{r.layoutSizingVertical='FIXED';for(const c of r.children){if(c.type==='INSTANCE'&&c.name.startsWith('Issue'))c.layoutSizingVertical='HUG';}r.strokeTopWeight=0;r.strokeRightWeight=0;r.strokeBottomWeight=0;r.strokeLeftWeight=1;const sp_=r.children.find(c=>c.name==='Spacer');if(sp_){sp_.layoutGrow=1;}};
const runChip=async(Dn)=>{const rc=Dn.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id===COMP.runChip);if(rc)rc.findAllWithCriteria({types:['TEXT']})[0].characters='LIVE \u00b7 13:42';};
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
