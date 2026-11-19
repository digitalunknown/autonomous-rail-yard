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
const CX=9440,CY=120,k=5.2;
const SUG=[['PV-0471',12.4,38,82,'STL','OK',"40' ctr"],['PV-0488',12.4,41,76,'STL','OK',"53' ctr"],['PV-0512',14.0,52,64,'STL','OK','Grain'],['PV-0526',13.6,49,58,'STL','OK','Syrup'],['PV-0618',13.2,44,71,'MEM','OK','Reefer'],['PV-0640',12.4,14,81,'MEM','Selected','Empty'],['PV-0590',15.8,33,69,'MEM','OK','Cl 3 tank'],['PV-0604',12.4,40,88,'MEM','OK',"40' HV"],['PV-0597',15.8,31,73,'MEM','OK','Cl 5.1 tank'],['PV-0611',14.0,52,61,'MEM','OK','Aggr.'],['PV-0625',13.2,43,79,'MEM','OK','Reefer']];
let x=0;const pos=[];SUG.forEach(c=>{pos.push([Math.round(x),Math.round(c[1]*k)]);x+=c[1]*k+1.5*k;});const total=x-1.5*k;
const top=20,H=64,base=top+H+32+56,maxH=48;const kids=[];
kids.push($fig.autoLayout({name:'Block STL',x:0,y:0,width:pos[3][0]+pos[3][1],height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',strokes:F('line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[]},[T('STL \u00d74','label','text/muted')]));
kids.push($fig.autoLayout({name:'Block MEM',x:pos[4][0],y:0,width:Math.round(total)-pos[4][0],height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',strokes:F('line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[]},[T('MEM \u00d77','label','text/muted')]));
SUG.forEach((c,i)=>kids.push($fig.instance(AC.ccar,{name:'Car '+c[0],props:{State:c[5],ID:c[0],Cargo:c[6],Gross:c[2]+' t',SoC:c[3]+'%'},x:pos[i][0],y:top,width:pos[i][1],height:H})));
kids.push($fig.rectangle({name:'Limit line',x:Math.round(172*k),y:0,width:1,height:top+H+24,fills:F('line/control')}));
kids.push(T('172 m','label','text/muted',{x:Math.round(172*k)+6,y:top+H+8}));
kids.push(T('Drop to load \u00b7 14 t \u2192 37 t gross','label','sel',{x:pos[5][0],y:top+H+8}));
kids.push($fig.rectangle({name:'Axle limit',x:0,y:base-maxH,width:Math.round(total),height:1,fills:F('line/control')}));
SUG.forEach((c,i)=>{const h=Math.round(c[2]/56*maxH);kids.push($fig.rectangle({name:'Gross '+c[0],x:pos[i][0]+4,y:base-h,width:pos[i][1]-8,height:h,fills:F('line/strong')}));kids.push(T(String(c[2]),'label','text/muted',{x:pos[i][0]+4,y:base-h-14}));});
const ph=Math.round(37/56*maxH),eh=Math.round(14/56*maxH);
kids.push($fig.rectangle({name:'Preview +23 t',x:pos[5][0]+4,y:base-ph,width:pos[5][1]-8,height:ph-eh,fills:[],strokes:F('sel'),strokeWeight:1,dashPattern:[3,2]}));
kids.push($fig.rectangle({name:'Baseline',x:0,y:base,width:Math.round(total),height:1,fills:F('line/strong')}));
kids.push(T('Gross per car, t. Front six 261 t, rear five 199 t once SHP-4425 is on.','cap','text/muted',{x:0,y:base+8}));
const stripC=$fig.frame({name:'Consist + weight (suggested)',width:888,height:base+28,fills:[],clipsContent:false},kids);
const consV=[['OK','Length','164.2 / 172 m','7.8 m spare'],['OK','Train weight','437 / 560 t','460 t with SHP-4425'],['OK','Max axle load','13.0 / 14.0 t','PV-0611 trimmed'],['OK','Brake margin','22%','18% after drop'],['OK','Hazmat','0 conflicts','PV-0604 buffers'],['OK','Block order','STL \u00d74, MEM \u00d77','In cut order'],['Warning','Open cargo','1 shipment','SHP-4425 has no car']];
const expandSvg='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 9 6 6 6-6" stroke="#aeb6bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const xSvg='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18M6 6l12 12" stroke="#aeb6bf" stroke-width="2" stroke-linecap="round"/></svg>';
const slots=$fig.autoLayout({name:'Departure slots (collapsed)',layoutSizingHorizontal:'FILL',height:48,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',itemSpacing:N('s3'),...P(N('s6'),N('s6'),0,0),strokes:F('line/subtle'),strokeWeight:1},[T('Departure slots','bs','text/primary'),T('PL-52 on D-02 at 14:20 \u00b7 38 min \u00b7 CH-02 out since 13:18','meta','text/muted'),sp(),iconBtn(expandSvg,'Expand','Expand')]);
const main=$fig.autoLayout({name:'Workspace',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',layoutGrow:1,itemSpacing:N('s4'),...P(N('s6'),N('s6'),N('s4'),N('s6'))},[
 $fig.autoLayout({name:'Title',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('PL-52','dl','text/primary'),T('Suggested plan applied \u00b7 11 vehicles \u00b7 5 changes','meta','text/muted'),sp(),segc(['Current','Suggested'],1,'View')]),
 $fig.autoLayout({name:'Constraints',layoutSizingHorizontal:'FILL',itemSpacing:N('s3'),layoutWrap:'WRAP',counterAxisSpacing:N('s3'),...P(0,0,0,N('s3')),strokes:F('line/subtle'),strokeWeight:1},consV.map(c=>$fig.instance(AC.cons,{name:'Constraint \u00b7 '+c[1],props:{Status:c[0],Label:c[1],Value:c[2],Note:c[3]}}))),
 $fig.autoLayout({name:'Consist head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Consist','bs','text/primary'),T('PV-0640 is empty. SHP-4425 came off PV-0533 in the swap.','meta','text/muted')]),
 stripC,sp(),
 $fig.autoLayout({name:'Send row',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s4'),...P(0,0,N('s4'),0),strokes:F('line/subtle'),strokeWeight:1},[T('0 violations \u00b7 1 warning: SHP-4425 (due 14:20) has no car','meta','live'),sp(),$fig.instance(AC.btn,{props:{Kind:'Primary',State:'Disabled',Label:'Send to yard'}})])]);
const left=$fig.autoLayout({name:'Left',x:0,y:56,width:936,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:0},[slots,main]);
// drawer
const sh=(st,v,name)=>$fig.instance(AC.ship,{name:name||'Shp '+v[0],props:{State:st,ID:v[0],Type:v[1],Route:v[2],Tonnes:v[3],Due:v[4],Note:v[5]||''},layoutSizingHorizontal:'FILL'});
const Q=[['SHP-4425',"20' reefer container",'KFL \u2192 MEM','23 t','14:20','from PV-0533'],['SHP-4440','Automotive racks','KFL \u2192 MEM','18 t','14:20','from PV-0702'],['SHP-4436','Aggregates, remainder','KFL \u2192 MEM','3 t','14:20','trimmed'],['SHP-4446',"20' intermodal",'KFL \u2192 STL','14 t','14:20',''],['SHP-4451','Hazmat Cl 8 \u00b7 caustic soda','KFL \u2192 MEM','22 t','14:20','placard']];
const pr=(dot,id,txt,res,rc)=>$fig.autoLayout({name:'Preview '+id,layoutSizingHorizontal:'FILL',itemSpacing:N('s3'),counterAxisAlignItems:'MIN',...P(0,0,6,6)},[$fig.autoLayout({name:'Dot wrap',height:16,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER'},[$fig.ellipse({name:'Dot',width:6,height:6,fills:F(dot)})]),$fig.autoLayout({name:'ID',width:72,layoutSizingHorizontal:'FIXED'},[T(id,'ds','text/primary')]),$fig.autoLayout({name:'Txt',layoutMode:'VERTICAL',itemSpacing:0,layoutGrow:1},[T(res,'meta',rc,{layoutSizingHorizontal:'FILL',textAutoResize:'HEIGHT'}),T(txt,'cap','text/muted',{layoutSizingHorizontal:'FILL',textAutoResize:'HEIGHT'})])]);
const drawer=$fig.autoLayout({name:'Cargo queue drawer',width:504,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s4'),...P(N('s6'),N('s6'),N('s4'),N('s4')),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
 $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Cargo queue','h','text/primary'),T('7 waiting \u00b7 5 shown','meta','text/muted'),sp(),$fig.svg(xSvg,{name:'Close',width:16,height:16})]),
 $fig.autoLayout({name:'Filters',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s2')},[segc(['All','STL','MEM'],0,'Destination'),$fig.instance(AC.opt,{props:{State:'Selected',Label:'Due by 14:20'}}),$fig.instance(AC.opt,{props:{State:'Default',Label:'Any type'}}),sp(),T('2 later hidden','cap','text/muted')]),
 $fig.autoLayout({name:'List',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:0},[$fig.autoLayout({name:'Cols',layoutSizingHorizontal:'FILL',...P(N('s3'),N('s3'),0,6),itemSpacing:N('s3')},[T('SHIPMENT','label','text/muted'),sp(),T('T','label','text/muted'),$fig.autoLayout({name:'DueH',width:44,layoutSizingHorizontal:'FIXED',primaryAxisAlignItems:'MAX'},[T('DUE','label','text/muted')])]),sh('Ghost',Q[0]),...Q.slice(1).map(q=>sh('Default',q))]),
 $fig.autoLayout({name:'Auto-assign',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:N('s2'),...P(N('s4'),N('s4'),N('s4'),N('s4')),cornerRadius:N('md'),strokes:F('line/subtle'),strokeWeight:1},[
  $fig.autoLayout({name:'AH',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s2')},[T('Auto-assign preview','bs','text/primary'),T('1 placed \u00b7 4 held','meta','text/muted'),sp(),T('437 \u2192 460 t','data','text/secondary')]),
  pr('flow','SHP-4425','Reefer draw 2.1 kW; PV-0640 reaches MEM at 61%','\u2192 PV-0640 \u00b7 37 t gross \u00b7 9.25 t per axle','text/primary'),
  pr('text/disabled','SHP-4440','A free flat (PV-0655) would push PL-52 back to 181.5 m','Held for the next MEM departure','text/secondary'),
  pr('text/disabled','SHP-4451','Cl 8 needs a buffer from PV-0590 (Cl 3) and PV-0597 (Cl 5.1); no free car qualifies','Held \u00b7 no buffer-compliant car','text/secondary'),
  pr('text/disabled','SHP-4446 \u00b7 4436','No empty STL car; 3 t is under the 5 t minimum per car','Held \u00b7 2 shipments','text/secondary')]),
 sp(),
 $fig.autoLayout({name:'Actions',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s2')},[$fig.instance(AC.btn,{props:{Kind:'Secondary',State:'Default',Label:'Auto-assign'}}),sp(),$fig.instance(AC.btn,{props:{Kind:'Ghost',State:'Default',Label:'Discard'}}),$fig.instance(AC.btn,{props:{Kind:'Primary',State:'Default',Label:'Apply 1 assignment'}})])]);
const D=$fig.frame({name:'C \u00b7 Cargo queue drawer \u00b7 drag + auto-assign',x:CX,y:CY,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);D.append(left);
const scrim=$fig.rectangle({name:'Scrim',x:0,y:56,width:1440,height:844,fills:F('bg/base'),opacity:.4});D.append(scrim);
drawer.set({x:936,y:56});D.append(drawer);
const drag=sh('Dragging',Q[0],'Dragging SHP-4425');drag.set({x:0,y:0});D.append(drag);
await $fig.done();const Dn=D.node;await runChip(Dn);
// scrim only over right part not needed: make scrim cover nothing important -> limit to x>=936? keep full but under drawer
const sc=scrim.node;sc.x=0;sc.width;sc.resize(936,844);sc.opacity=0;// no scrim: workspace stays a live drop target
sc.visible=false;
const dn=drag.node;dn.layoutSizingHorizontal='FIXED';dn.resize(380,48);
const car=Dn.findOne(n=>n.name==='Car PV-0640');const ab=car.absoluteBoundingBox,fb=Dn.absoluteBoundingBox;
dn.x=ab.x-fb.x+ab.width/2-40;dn.y=ab.y-fb.y-30;dn.rotation=-2;
for(const n of Dn.findAll(x=>x.name==='Constraints'||x.name==='Send row'||x.name==='Departure slots (collapsed)')){n.strokeTopWeight=n.name==='Send row'?1:0;n.strokeLeftWeight=0;n.strokeRightWeight=0;n.strokeBottomWeight=n.name==='Send row'?0:1;}
const dr=drawer.node;for(const s of dr.children)if(s.name==='Spacer')s.layoutGrow=1;
for(const s of main.node.children)if(s.name==='Spacer')s.layoutGrow=1;
return {D:Dn.id,dragXY:[dn.x,dn.y],drH:dr.height,cons:main.node.children[1].height};
