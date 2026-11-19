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
const dotC={Ready:'flow',Charging:'live',Fault:'jam',Pending:'text/disabled'};
const brow=$fig.variants({name:'asm/Board row'},Object.keys(dotC).map(s=>$fig.component({name:'State='+s,layoutMode:'HORIZONTAL',width:160,layoutSizingHorizontal:'FIXED',itemSpacing:N('s2'),counterAxisAlignItems:'MIN',...P(0,0,6,6),strokes:F('line/subtle'),strokeWeight:1,strokeAlign:'INSIDE'},[$fig.autoLayout({name:'Dot wrap',height:16,layoutSizingVertical:'FIXED',counterAxisAlignItems:'CENTER'},[$fig.ellipse({name:'Dot',width:6,height:6,fills:F(dotC[s])})]),$fig.autoLayout({name:'Text',layoutMode:'VERTICAL',itemSpacing:0,layoutGrow:1},[$fig.autoLayout({name:'Line',layoutSizingHorizontal:'FILL'},[T('PV-0471','ds','text/primary').textProp('ID'),sp(),T('82%','data',s==='Charging'?'live':'text/secondary').textProp('SoC')]),T('Box \u00b7 B-03','meta',s==='Fault'?'jam':s==='Charging'?'live':'text/muted',{layoutSizingHorizontal:'FILL',textAutoResize:'HEIGHT'}).textProp('Meta')])])));
$fig.get('188:1463').append(brow);
const br=(s,id,soc,meta)=>$fig.instance(brow,{props:{State:s,ID:id,SoC:soc,Meta:meta},layoutSizingHorizontal:'FILL'});
const ready=(n,c,p,f)=>{const tot=n+c+p+f;const seg=(k,col)=>k?[$fig.rectangle({name:col,width:Math.max(2,Math.round(160*k/tot)-2),height:4,fills:F(col)})]:[];return $fig.autoLayout({name:'Readiness',itemSpacing:2},[...seg(n,'flow'),...seg(c,'live'),...seg(f,'jam'),...seg(p,'line/strong')]);};
const group=(pl,meta,rdy,rows,sel,more)=>$fig.autoLayout({name:'Group '+pl,layoutMode:'VERTICAL',itemSpacing:N('s2'),layoutSizingHorizontal:'FILL',...(sel?{strokes:F('sel'),strokeWeight:2,...P(N('s2'),0,0,0)}:{})},[$fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER'},[T(pl,'ds','text/primary'),sp(),T(meta,'label','text/muted')]),rdy,...rows,...(more?[T(more,'meta','text/muted')]:[])]);
const col=(code,sub,groups)=>$fig.autoLayout({name:'Column '+code,layoutMode:'VERTICAL',itemSpacing:N('s4'),width:172,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FILL',...P(N('s3'),N('s3'),N('s4'),N('s4')),strokes:F('line/subtle'),strokeWeight:1},[$fig.autoLayout({name:'Col head',layoutMode:'VERTICAL',itemSpacing:2},[T(code,'h','text/primary'),T(sub,'meta','text/muted')]),...groups]);
const cols=[
 col('STL','St. Louis \u00b7 1 platoon',[group('PL-52','D-02 14:20',ready(4,0,0,1),[br('Ready','PV-0471','82%','Box \u00b7 B-03 \u00b7 #1'),br('Ready','PV-0488','76%','Box \u00b7 B-03 \u00b7 #2'),br('Ready','PV-0512','64%','Hopper \u00b7 B-03 \u00b7 #3'),br('Fault','PV-0618','71%','MEM vehicle at #4, inside STL'),br('Ready','PV-0526','58%','Tank \u00b7 B-03 \u00b7 #5')],true)]),
 col('MEM','Memphis \u00b7 1 platoon',[group('PL-52','D-02 14:20',ready(5,1,0,2),[br('Fault','PV-0618','71%','Out of block order \u00b7 #4'),br('Charging','PV-0533','18%','Below 25% floor \u00b7 CH-01 \u224814:04'),br('Ready','PV-0590','69%','Flat \u00b7 B-08'),br('Ready','PV-0597','73%','Flat \u00b7 B-08'),br('Ready','PV-0604','88%','Box \u00b7 B-08'),br('Ready','PV-0611','61%','Hopper \u00b7 B-09'),br('Ready','PV-0625','79%','Reefer \u00b7 B-09'),br('Fault','PV-0702','66%','Past D-02 limit \u00b7 #12')],true)]),
 col('CHI','Chicago \u00b7 2 platoons',[group('PL-49','D-01 13:55',ready(10,0,0,0),[br('Ready','PV-0402','84%','Box \u00b7 D-01'),br('Ready','PV-0409','77%','Box \u00b7 D-01')],false,'+8 ready \u00b7 departs in 13 min'),group('PL-54','D-02 15:35',ready(0,0,9,0),[br('Pending','\u2014','','Draft \u00b7 9 slots open')],false)]),
 col('KCY','Kansas City \u00b7 1 platoon',[group('PL-50','D-03 14:05',ready(8,0,0,0),[br('Ready','PV-0441','91%','Hopper \u00b7 D-03'),br('Ready','PV-0447','68%','Tank \u00b7 D-03')],false,'+6 ready \u00b7 departs in 23 min')]),
 col('DAL','Dallas \u00b7 1 platoon',[group('PL-51','D-01 14:40',ready(6,0,4,0),[br('Ready','PV-0731','72%','Flat \u00b7 B-06'),br('Ready','PV-0738','80%','Box \u00b7 B-06'),br('Pending','4 open','','Assembling \u00b7 6 of 10')],false,'+4 ready')]),
 col('ATL','Atlanta \u00b7 1 platoon',[group('PL-53','D-03 15:10',ready(4,0,5,0),[br('Ready','PV-0683','70%','Tank \u00b7 B-11'),br('Ready','PV-0690','75%','Box \u00b7 B-11'),br('Pending','5 open','','Draft \u00b7 4 of 9')],false,'+2 ready')])];
const D=$fig.frame({name:'03 \u00b7 Block board \u00b7 fleet by destination',x:3080,y:0,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);
const lg=(c,l)=>$fig.autoLayout({name:l,itemSpacing:6,counterAxisAlignItems:'CENTER'},[$fig.ellipse({name:'Dot',width:6,height:6,fills:F(c)}),T(l,'cap','text/muted')]);
const main=$fig.autoLayout({name:'Main',x:0,y:56,width:1080,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:0},[
 $fig.autoLayout({name:'Toolbar',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s4'),...P(N('s4'),N('s4'),N('s4'),N('s3')),strokes:F('line/subtle'),strokeWeight:1},[$fig.autoLayout({name:'Title',layoutMode:'VERTICAL',itemSpacing:2},[T('Blocks','h','text/primary'),T('6 destinations \u00b7 7 platoons \u00b7 PL-52 selected','meta','text/muted')]),sp(),lg('flow','Ready'),lg('live','Charging / low'),lg('jam','Violation'),lg('text/disabled','Not picked')]),
 $fig.autoLayout({name:'Board',layoutSizingHorizontal:'FILL',layoutGrow:1,itemSpacing:0,...P(N('s1'),0,0,0)},cols)]);
D.append(main);
D.append($fig.instance(RAIL,{x:1080,y:56}));
await $fig.done();
const Dn=D.node;
const rc=Dn.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id===COMP.runChip);if(rc)rc.findAllWithCriteria({types:['TEXT']})[0].characters='LIVE \u00b7 13:42';
const bs=brow.node;for(const c of bs.children){c.layoutSizingVertical='HUG';c.strokeTopWeight=0;c.strokeLeftWeight=0;c.strokeRightWeight=0;c.strokeBottomWeight=1;}let y=16;for(const c of bs.children){c.x=16;c.y=y;y+=c.height+8;}bs.resizeWithoutConstraints(192,y+8);
const tb=main.node.children[0];tb.strokeTopWeight=0;tb.strokeLeftWeight=0;tb.strokeRightWeight=0;tb.strokeBottomWeight=1;
for(const c of main.node.children[1].children){c.strokeTopWeight=0;c.strokeLeftWeight=0;c.strokeBottomWeight=0;c.strokeRightWeight=1;}
for(const g of Dn.findAllWithCriteria({types:['FRAME']}).filter(f=>f.name==='Group PL-52')){g.strokeTopWeight=0;g.strokeRightWeight=0;g.strokeBottomWeight=0;g.strokeLeftWeight=2;}
return {D:Dn.id,brow:bs.id};
