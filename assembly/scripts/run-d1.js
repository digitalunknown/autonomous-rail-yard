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
const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const RAIL='189:1465';
const seg=(opts,on,name)=>$fig.autoLayout({name:name||'Segmented',itemSpacing:2,...P(2,2,2,2),cornerRadius:N('md'),fills:F('bg/base'),strokes:F('line/strong'),strokeWeight:1},opts.map((o,i)=>$fig.autoLayout({name:o,height:24,layoutSizingVertical:'FIXED',...P(N('s3'),N('s3'),0,0),counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),fills:i===on?F('bg/control'):[]},[T(o,'meta',i===on?'text/primary':'text/muted')])));
const rows=[];
V.forEach((v,i)=>{const st=i===3?'Wrong block':i===5?'Low battery':'In consist';const status=i===3?'Out of block order \u00b7 MEM inside STL':i===5?'Below 25% floor \u00b7 18%':i===11?'Past the 172 m limit':'In PL-52 \u00b7 #'+(i+1);rows.push([st,v,'PL-52 #'+(i+1),status,i===11]);});
SPARE.forEach((v,i)=>{const st=v[4]<25?'Unavailable':'Default';rows.push([st,v,'\u2014',v[4]<25?'Below floor \u00b7 not offered':'Available',false]);});
const D=$fig.frame({name:'01 \u00b7 Pick list \u00b7 inventory + train builder',x:0,y:0,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);
const tableRows=rows.map(([st,v,pl,status])=>$fig.instance(ASM.trow,{props:{State:st,ID:v[0],Type:v[1],Length:v[2].toFixed(1)+' m',Weight:v[3]+' t',Battery:v[4]+'%',Block:v[5],Track:v[6],Platoon:pl,Status:status}}));
const S=strip(5,{top:20,h:40});
const main=$fig.autoLayout({name:'Main',x:0,y:56,width:1080,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:0},[
 $fig.autoLayout({name:'Toolbar',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3'),...P(N('s4'),N('s4'),N('s4'),N('s3'))},[$fig.autoLayout({name:'Title',layoutMode:'VERTICAL',itemSpacing:2},[T('Inventory','h','text/primary'),T('Kestrel Flats \u00b7 15 vehicles on STL and MEM tracks \u00b7 12 picked for PL-52','meta','text/muted')]),sp(),T('Block','cap','text/muted'),seg(['All','STL','MEM'],0,'Block filter'),T('Battery','cap','text/muted'),seg(['Any','\u2265 25% floor'],0,'Battery filter')]),
 $fig.autoLayout({name:'Table',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',layoutGrow:1,...P(N('s4'),N('s4'),0,0)},[$fig.instance(ASM.thead),...tableRows]),
 $fig.autoLayout({name:'Train builder',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:N('s3'),...P(N('s4'),N('s4'),N('s4'),N('s4')),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
  $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Train builder \u00b7 PL-52','gl','text/secondary'),T('Drag rows here. Front of train is the first drop: STL, then MEM.','meta','text/muted'),sp(),T('181.5 m of 172 m on D-02','ds','jam')]),
  $fig.frame({name:'Strip area',width:1048,height:90,fills:[]},[S.node,$fig.autoLayout({name:'Drop slot',x:Math.round(S.total)+16,y:20,width:96,height:40,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',primaryAxisAlignItems:'CENTER',counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),strokes:F('line/control'),strokeWeight:1,dashPattern:[3,3],fills:[]},[T('Drop to add','meta','text/muted')])])])]);
D.append(main);
const rail=$fig.instance(RAIL,{x:1080,y:56});D.append(rail);
await $fig.done();
const tb=main.node.children.find(c=>c.name==='Train builder');tb.strokeTopWeight=1;tb.strokeBottomWeight=0;tb.strokeLeftWeight=0;tb.strokeRightWeight=0;
// header run chip label
const rc=D.node.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id===COMP.runChip);if(rc)rc.findAllWithCriteria({types:['TEXT']})[0].characters='LIVE \u00b7 13:42';
// row tweaks: battery fills + 0702 status colour
const red=await figma.variables.getVariableByIdAsync(R.jam);let fails=0;
const tr=tableRows.map(t=>t.node);rows.forEach((r,i)=>{const inst=tr[i];const bar=inst.findAllWithCriteria({types:['FRAME']}).find(f=>f.name==='Bar');const f=bar.children[0];f.resize(Math.max(2,Math.round(48*r[1][4]/100)),4);if(Math.abs(f.width-Math.round(48*r[1][4]/100))>1)fails++;if(r[4]){const st=inst.findAllWithCriteria({types:['TEXT']}).pop();st.fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ff4b3e'),'color',red)];}});
return {D:D.node.id,fails,total:S.total};
