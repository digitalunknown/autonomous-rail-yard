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
const seg=(opts,on,name)=>$fig.autoLayout({name:name||'Segmented',itemSpacing:2,...P(2,2,2,2),cornerRadius:N('md'),fills:F('bg/base'),strokes:F('line/strong'),strokeWeight:1},opts.map((o,i)=>$fig.autoLayout({name:o,height:24,layoutSizingVertical:'FIXED',...P(N('s3'),N('s3'),0,0),counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),fills:i===on?F('bg/control'):[]},[T(o,'meta',i===on?'text/primary':'text/muted')])));
const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const RAIL='189:1465';const X0=128,K=6;const tx=m=>X0+m*K;// m = minutes after 13:30
const kids=[];
// grid + ticks
for(let m=0;m<=150;m+=15){const h=13+Math.floor((30+m)/60),mm=(30+m)%60;kids.push($fig.rectangle({name:'Grid',x:tx(m),y:20,width:1,height:372,fills:F('line/subtle')}));kids.push(T(`${h}:${String(mm).padStart(2,'0')}`,'label','text/muted',{x:tx(m)+4,y:2}));}
const rows=[['D-01','210 m usable',72],['D-02','172 m usable',72],['D-03','190 m usable',72],['CH-01','Charger \u00b7 1 bay',48],['CH-02','Charger \u00b7 1 bay',48]];
let y=28;const RY={};rows.forEach(([n,s,h],i)=>{RY[n]=[y,h];if(i===3){kids.push(T('CHARGERS','label','text/muted',{x:0,y:y+4}));y+=24;RY[n]=[y,h];}
 kids.push($fig.autoLayout({name:'Row label '+n,x:0,y:y+(h-36)/2,layoutMode:'VERTICAL',itemSpacing:2},[T(n,'ds','text/primary'),T(s,'meta','text/muted')]));
 kids.push($fig.rectangle({name:'Row line',x:0,y:y+h,width:1028,height:1,fills:F('line/subtle')}));y+=h;});
const bar=(row,m0,m1,state,l1,dep,l2,l2c,extra=[])=>{const [ry,rh]=RY[row];const sel=state==='sel',draft=state==='draft';
 return $fig.autoLayout({name:'Slot '+l1,x:tx(m0)+1,y:ry+8,width:(m1-m0)*K-2,height:rh-16,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:2,...P(N('s2'),N('s2'),6,6),cornerRadius:N('sm'),fills:draft?[]:F(sel?'bg/raised':'bg/control'),strokes:F(sel?'sel':draft?'line/control':'line/strong'),strokeWeight:sel?2:1,strokeAlign:'INSIDE',...(draft?{dashPattern:[4,3]}:{}),clipsContent:true},[
  $fig.autoLayout({name:'Line 1',layoutSizingHorizontal:'FILL',itemSpacing:6,counterAxisAlignItems:'CENTER'},[...(state==='ready'?[$fig.ellipse({name:'Dot',width:6,height:6,fills:F('flow')})]:[]),T(l1,'ds',draft?'text/secondary':'text/primary'),sp(),T(dep,'data',draft?'text/muted':'text/secondary')]),
  ...(extra.length?[$fig.autoLayout({name:'Flags',itemSpacing:N('s3')},extra)]:[T(l2,'meta',l2c)])]);};
const fl=(c,t)=>T(t,'cap',c);
kids.push(bar('D-01',0,25,'ready','PL-49 \u00b7 CHI','13:55','10 vehicles \u00b7 148.2 m \u00b7 ready','text/muted'));
kids.push(bar('D-01',35,70,'asm','PL-51 \u00b7 DAL','14:40','Assembling \u00b7 6 of 10 picked','text/muted'));
kids.push(bar('D-02',15,50,'sel','PL-52 \u00b7 STL \u2192 MEM','14:20','',null,[fl('jam','\u25c6 Over by 9.5 m'),fl('jam','\u25c6 Block order'),fl('live','\u25b2 PV-0533 18%')]));
kids.push(bar('D-02',95,125,'draft','PL-54 \u00b7 CHI','15:35','Draft \u00b7 0 of 9','text/muted'));
kids.push(bar('D-03',10,35,'ready','PL-50 \u00b7 KCY','14:05','8 vehicles \u00b7 108.6 m \u00b7 ready','text/muted'));
kids.push(bar('D-03',70,100,'draft','PL-53 \u00b7 ATL','15:10','Draft \u00b7 4 of 9','text/muted'));
// chargers
const [c1y,c1h]=RY['CH-01'],[c2y,c2h]=RY['CH-02'];
kids.push($fig.frame({name:'Charge PV-0533',x:tx(20)+1,y:c1y+8,width:14*K-2,height:c1h-16,cornerRadius:N('sm'),fills:F('bg/control'),strokes:F('live'),strokeWeight:1,strokeAlign:'INSIDE',clipsContent:true},[tint('live',.16,14*K-2,c1h-16)]));
kids.push(T('PV-0533  18% \u2192 26% by 14:04','meta','live',{x:tx(34)+8,y:c1y+16}));
kids.push(T('CH-01 then free from 14:04','meta','text/muted',{x:tx(80)+8,y:c1y+16}));
kids.push($fig.rectangle({name:'Outage band',x:X0,y:c2y+8,width:900,height:c2h-16,fills:F('jam'),opacity:.1}));
kids.push($fig.rectangle({name:'Outage edge',x:X0,y:c2y+8,width:2,height:c2h-16,fills:F('jam')}));
kids.push(T('Out of service since 13:18 \u00b7 no repair ETA','meta','jam',{x:X0+12,y:c2y+16}));
// now line
kids.push($fig.rectangle({name:'Now line',x:tx(12),y:20,width:1,height:372,fills:F('text/primary')}));
kids.push($fig.autoLayout({name:'Now tag',x:tx(12)-22,y:0,height:18,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER',...P(6,6,0,0),cornerRadius:N('sm'),fills:F('text/primary')},[T('13:42','label','on')]));
const plot=$fig.frame({name:'Slot timeline',width:1028,height:y+8,fills:[],clipsContent:false},kids);
const S=strip(5.2,{top:22,h:44,full:true,pad:0});
const D=$fig.frame({name:'04 \u00b7 Departure slots \u00b7 time axis',x:4620,y:0,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);
const main=$fig.autoLayout({name:'Main',x:0,y:56,width:1080,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s6'),...P(N('s6'),N('s6'),N('s6'),N('s6'))},[
 $fig.autoLayout({name:'Title',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Departure slots','dl','text/primary'),T('Today 13:30\u201316:00 \u00b7 3 departure tracks \u00b7 2 chargers','meta','text/muted'),sp(),seg(['2.5 h','6 h'],0,'Range')]),
 plot,
 $fig.autoLayout({name:'Selected consist',layoutSizingHorizontal:'FILL',layoutMode:'VERTICAL',itemSpacing:N('s3'),...P(N('s4'),N('s4'),N('s4'),N('s4')),cornerRadius:N('md'),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
  $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('PL-52 on D-02','bs','text/primary'),T('Front \u2192 rear \u00b7 assembling 13:45, departs 14:20 (38 min)','meta','text/muted'),sp(),T('181.5 m \u00b7 493 t','data','text/secondary')]),S.node])]);
D.append(main);D.append($fig.instance(RAIL,{x:1080,y:56}));
await $fig.done();const Dn=D.node;
const rc=Dn.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id===COMP.runChip);if(rc)rc.findAllWithCriteria({types:['TEXT']})[0].characters='LIVE \u00b7 13:42';
const t=Dn.findOne(n=>n.name==='Charge PV-0533').findOne(n=>n.name==='Tint');if(t)t.constraints={horizontal:'STRETCH',vertical:'STRETCH'};
return {D:Dn.id,h:y};
