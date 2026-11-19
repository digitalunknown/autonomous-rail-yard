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
const AX=6400,AY=120;
// row label
const lab=$fig.autoLayout({name:'05 \u00b7 Hybrid + cargo \u00b7 label',x:AX,y:0,layoutMode:'VERTICAL',itemSpacing:N('s1')},[T('05 \u00b7 Hybrid + cargo','title','text/primary'),T('After Peter\u2019s review, Nov 18: 02 consist builder as the workspace, 04 slots as a collapsible strip, 01 spares as a drawer, plus per-car cargo.','body','text/secondary')]);
// slots strip
const X0=96,K=6.2,tx=m=>X0+m*K;const kids=[];
for(let m=0;m<=150;m+=15){const h=13+Math.floor((30+m)/60),mm=(30+m)%60;kids.push($fig.rectangle({name:'Grid',x:tx(m),y:16,width:1,height:126,fills:F('line/subtle')}));if(m!==15)kids.push(T(`${h}:${String(mm).padStart(2,'0')}`,'label','text/muted',{x:m===150?tx(m)-34:tx(m)+4,y:0}));}
const rows=[['D-01','210 m',26],['D-02','172 m',26],['D-03','190 m',26],['CH-01','',22],['CH-02','',22]];let y=18;const RY={};
for(const [n,s,h] of rows){RY[n]=[y,h];kids.push($fig.autoLayout({name:'Lbl '+n,x:0,y:y+(h-16)/2,itemSpacing:6,counterAxisAlignItems:'CENTER'},[T(n,'ds','text/primary'),...(s?[T(s,'cap','text/muted')]:[])]));kids.push($fig.rectangle({name:'Row line',x:0,y:y+h,width:1032,height:1,fills:F('line/subtle')}));y+=h;}
const slot=(row,m0,m1,state,txt,tc)=>{const [ry,rh]=RY[row];const sel=state==='sel',draft=state==='draft';return $fig.autoLayout({name:'Slot '+txt,x:tx(m0)+1,y:ry+3,width:(m1-m0)*K-2,height:rh-6,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',itemSpacing:6,...P(6,6,0,0),cornerRadius:N('sm'),fills:draft?[]:F(sel?'bg/raised':'bg/control'),strokes:F(sel?'sel':draft?'line/control':'line/strong'),strokeWeight:sel?2:1,strokeAlign:'INSIDE',...(draft?{dashPattern:[4,3]}:{}),clipsContent:true},[...(state==='ready'?[$fig.ellipse({name:'Dot',width:6,height:6,fills:F('flow')})]:[]),T(txt,'label',tc||(draft?'text/muted':'text/primary'))]);};
kids.push(slot('D-01',0,25,'ready','PL-49 13:55'),slot('D-01',35,70,'asm','PL-51 14:40 \u00b7 6/10','text/secondary'),slot('D-02',15,50,'sel','PL-52 14:20'),slot('D-02',95,125,'draft','PL-54 15:35'),slot('D-03',10,35,'ready','PL-50 14:05'),slot('D-03',70,100,'draft','PL-53 15:10'));
kids.push(T('3 violations','label','jam',{x:tx(50)+8,y:RY['D-02'][0]+6}));
const [c1y,c1h]=RY['CH-01'],[c2y,c2h]=RY['CH-02'];
kids.push($fig.frame({name:'Charge PV-0533',x:tx(20)+1,y:c1y+3,width:14*K-2,height:c1h-6,cornerRadius:N('sm'),fills:F('bg/control'),strokes:F('live'),strokeWeight:1,strokeAlign:'INSIDE',clipsContent:true},[tint('live',.16,14*K-2,c1h-6)]));
kids.push(T('PV-0533 could charge 13:50\u201314:04, reaching 26% with the reefer unplugged','cap','live',{x:tx(34)+8,y:c1y+4}));
kids.push($fig.rectangle({name:'Outage band',x:X0,y:c2y+3,width:930,height:c2h-6,fills:F('jam'),opacity:.1}));
kids.push($fig.rectangle({name:'Outage edge',x:X0,y:c2y+3,width:2,height:c2h-6,fills:F('jam')}));
kids.push(T('Out of service since 13:18 \u00b7 no repair ETA','cap','jam',{x:X0+10,y:c2y+4}));
kids.push($fig.rectangle({name:'Now line',x:tx(12),y:14,width:1,height:128,fills:F('text/primary')}));
kids.push($fig.autoLayout({name:'Now tag',x:tx(12)-20,y:-2,height:16,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',...P(5,5,0,0),cornerRadius:N('sm'),fills:F('text/primary')},[T('13:42','label','on')]));
const plot=$fig.frame({name:'Slot timeline',width:1032,height:y+2,fills:[],clipsContent:false},kids);
const slots=$fig.autoLayout({name:'Departure slots (expanded)',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:N('s2'),...P(N('s6'),N('s6'),N('s3'),N('s3')),strokes:F('line/subtle'),strokeWeight:1},[
 $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Departure slots','bs','text/primary'),T('Today 13:30\u201316:00 \u00b7 PL-52 holds D-02 at 14:20','meta','text/muted'),sp(),iconBtn(chevUp,'Collapse','Collapse')]),plot]);
// main
const consV=[['Fault','Length','181.5 / 172 m','Over by 9.5 m'],['OK','Train weight','493 / 560 t','175 tare + 318 cargo'],['Warning','Max axle load','13.75 / 14.0 t','PV-0611 at 98%'],['OK','Brake margin','12%','1.2% grade \u00b7 min 10%'],['Fault','Hazmat','1 conflict','Cl 3 touches Cl 5.1'],['Fault','Block order','1 out of order','PV-0618 at #4'],['Warning','Battery + reefer','min 18% / 25%','Reefers draw 6.3 kW']];
const S=strip2(5.2,{});
const trow=(st,v,status)=>$fig.instance(AC.trow,{name:'Spare '+v[0],props:{State:st,ID:v[0],Type:v[1],Length:v[2],Weight:v[3],Battery:v[4],Block:v[5],Track:v[6],Platoon:'\u2014',Status:status},layoutSizingHorizontal:'FILL'});
const main=$fig.autoLayout({name:'Workspace',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',layoutGrow:1,itemSpacing:N('s4'),...P(N('s6'),N('s6'),N('s4'),N('s4'))},[
 $fig.autoLayout({name:'Title',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('PL-52','dl','text/primary'),T('STL \u2192 MEM \u00b7 12 vehicles \u00b7 12 loaded \u00b7 D-02 departs 14:20 (38 min)','meta','text/muted'),sp(),segc(['Current','Suggested'],0,'View')]),
 $fig.autoLayout({name:'Constraints',layoutSizingHorizontal:'FILL',itemSpacing:N('s3'),...P(0,0,0,N('s3')),strokes:F('line/subtle'),strokeWeight:1},consV.map(c=>$fig.instance(AC.cons,{name:'Constraint \u00b7 '+c[1],props:{Status:c[0],Label:c[1],Value:c[2],Note:c[3]}}))),
 $fig.autoLayout({name:'Consist head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Consist','bs','text/primary'),T('Front \u2192 rear. Drag cars to reorder; drop a shipment on a car to load it.','meta','text/muted'),sp(),T('181.5 m \u00b7 493 t','data','text/secondary')]),
 S.node,
 $fig.autoLayout({name:'Drawer',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:0},[
  $fig.autoLayout({name:'Tabs',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s6'),strokes:F('line/subtle'),strokeWeight:1},[$fig.instance(AC.tab,{props:{State:'Active',Label:'Spare vehicles',Count:'3'}}),$fig.instance(AC.tab,{props:{State:'Default',Label:'Cargo queue',Count:'6 waiting'}}),sp(),T('Drag a spare onto the consist','cap','text/muted')]),
  $fig.instance(AC.thead,{layoutSizingHorizontal:'FILL'}),
  trow('Default',['PV-0640','Box','12.4 m','14 t tare','81%','MEM','B-09'],'Empty \u00b7 can take SHP-4425 reefer'),
  trow('Default',['PV-0655','Flat','15.8 m','12 t tare','92%','STL','B-04'],'Empty'),
  trow('Unavailable',['PV-0677','Reefer','13.2 m','18 t tare','23%','STL','B-04'],'Below 25% floor \u00b7 not offered')])]);
const left=$fig.autoLayout({name:'Left',x:0,y:56,width:1080,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:0},[slots,main]);
const D=$fig.frame({name:'A \u00b7 Hybrid \u00b7 consist builder + slots + cargo',x:AX,y:AY,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);D.append(left);const R_=rail(ISSUES);R_.set({x:1080,y:56});D.append(R_);
await $fig.done();
const Dn=D.node;await runChip(Dn);fixRail(R_.node);
const sl=slots.node;sl.strokeTopWeight=0;sl.strokeLeftWeight=0;sl.strokeRightWeight=0;sl.strokeBottomWeight=1;
for(const n of Dn.findAll(x=>x.name==='Constraints'||x.name==='Tabs')){n.strokeTopWeight=0;n.strokeLeftWeight=0;n.strokeRightWeight=0;n.strokeBottomWeight=1;}
const lv={'PV-0640':['Neutral','80'],'PV-0655':['Neutral','90'],'PV-0677':['Low','20']};
for(const r of Dn.findAll(x=>x.type==='INSTANCE'&&x.name.startsWith('Spare '))){const b=r.findOne(x=>x.type==='INSTANCE'&&x.name==='Battery bar');const v=lv[r.name.slice(6)];if(b&&v)b.setProperties({Tone:v[0],Level:v[1]});}
for(const t of Dn.findAll(x=>x.name==='Tint'&&x.type==='RECTANGLE'&&x.parent.type==='FRAME'))t.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
return {D:Dn.id,lab:lab.node.id,mainH:main.node.height,slotsH:sl.height,total:S.total};
