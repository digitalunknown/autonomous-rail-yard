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
const seg=(opts,on,name)=>$fig.autoLayout({name:name||'Segmented',itemSpacing:2,...P(2,2,2,2),cornerRadius:N('md'),fills:F('bg/base'),strokes:F('line/strong'),strokeWeight:1},opts.map((o,i)=>$fig.autoLayout({name:o,height:24,layoutSizingVertical:'FIXED',...P(N('s3'),N('s3'),0,0),counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),fills:i===on?F('bg/control'):[]},[T(o,'meta',i===on?'text/primary':'text/muted')])));
const D=$fig.frame({name:'02 \u00b7 Consist builder \u00b7 live constraints',x:1540,y:0,width:1440,height:900,fills:F('bg/base'),clipsContent:true});
header(D);
const meter=(st,l,v,n)=>$fig.instance(ASM.meter,{props:{Status:st,Label:l,Value:v,Note:n},name:'Meter \u00b7 '+l});
const meters=[meter('Fault','Length','181.5 / 172 m','Over by 9.5 m on D-02'),meter('OK','Weight','493 / 560 t','67 t headroom'),meter('Warning','Battery floor','min 18% / 25%','PV-0533 below floor'),meter('Fault','Block order','1 out of order','PV-0618 at #4')];
const S=strip(5.2,{top:22,h:48,full:true,sel:3,pad:0});
// suggested consist
const SUG=[['PV-0471',12.4,82],['PV-0488',12.4,76],['PV-0512',14.0,64],['PV-0526',13.6,58],['PV-0618',13.2,71],['PV-0640',12.4,81],['PV-0590',15.8,69],['PV-0597',15.8,73],['PV-0604',12.4,88],['PV-0611',14.0,61],['PV-0625',13.2,79]];
const k2=4.2;let x=0;const sugKids=[];SUG.forEach((v,i)=>{const w=Math.round(v[1]*k2);sugKids.push($fig.instance(ASM.car,{props:{State:'OK',ID:v[0].slice(3),SoC:v[2]+'%'},x:Math.round(x),y:20,width:w,height:40}));x+=v[1]*k2+1.5*k2;});
const sugTotal=x-1.5*k2;
const sugBr=[$fig.autoLayout({name:'Block STL',x:0,y:0,width:Math.round(52.4*k2+3*1.5*k2),height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',strokes:F('line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[]},[T('STL \u00d74','label','text/muted')]),$fig.autoLayout({name:'Block MEM',x:Math.round(52.4*k2+4*1.5*k2),y:0,width:Math.round(sugTotal-(52.4*k2+4*1.5*k2)),height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',strokes:F('line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[]},[T('MEM \u00d77','label','text/muted')])];
const sugLim=$fig.rectangle({name:'Limit line',x:Math.round(172*k2),y:0,width:1,height:68,fills:F('line/control')});
const sugStrip=$fig.frame({name:'Suggested strip',width:728,height:80,fills:[]},[...sugBr,...sugKids,sugLim,T('172 m','label','text/muted',{x:Math.round(172*k2)-36,y:66})]);
const main=$fig.autoLayout({name:'Main',x:0,y:56,width:1040,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s6'),...P(N('s6'),N('s6'),N('s6'),N('s6'))},[
 $fig.autoLayout({name:'Title',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('PL-52','dl','text/primary'),T('STL \u2192 MEM \u00b7 12 vehicles \u00b7 D-02 departs 14:20','meta','text/muted'),sp(),seg(['Current','Suggested'],0,'View')]),
 $fig.autoLayout({name:'Constraints',layoutSizingHorizontal:'FILL',itemSpacing:N('s4')},meters),
 $fig.autoLayout({name:'Consist',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',itemSpacing:N('s3'),...P(N('s4'),N('s4'),N('s4'),N('s4')),cornerRadius:N('md'),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
  $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Current consist','gl','text/secondary'),T('Front \u2192 rear. Drag to reorder; checks update as you drop.','meta','text/muted'),sp(),T('181.5 m \u00b7 493 t \u00b7 avg 67%','ds','text/secondary')]),
  S.node,
  $fig.autoLayout({name:'Order check',itemSpacing:N('s6')},[$fig.autoLayout({name:'Expected',itemSpacing:N('s2')},[T('EXPECTED','label','text/muted'),T('STL \u00d74 \u2192 MEM \u00d78','data','text/primary')]),$fig.autoLayout({name:'Actual',itemSpacing:N('s2')},[T('ACTUAL','label','text/muted'),T('STL \u00d73 \u2192','data','text/primary'),T('MEM','data','jam'),T('\u2192 STL \u2192 MEM \u00d77','data','text/primary')])])]),
 $fig.autoLayout({name:'Lower',layoutSizingHorizontal:'FILL',itemSpacing:N('s4'),counterAxisAlignItems:'MIN'},[
  $fig.autoLayout({name:'Suggested',layoutMode:'VERTICAL',layoutGrow:1,itemSpacing:N('s3'),...P(N('s4'),N('s4'),N('s4'),N('s4')),cornerRadius:N('md'),strokes:F('line/subtle'),strokeWeight:1,dashPattern:[4,3]},[
   $fig.autoLayout({name:'Head',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s3')},[T('Suggested consist','gl','text/secondary'),T('3 changes','meta','text/muted'),sp(),$fig.instance(COMP.btn,{props:{Kind:'Secondary',State:'Default',Label:'Apply 3 changes'}})]),
   sugStrip,
   $fig.autoLayout({name:'Changes',layoutMode:'VERTICAL',itemSpacing:N('s1')},[T('\u2212 PV-0702 dropped (\u221217.3 m), stays on CH-01 for PL-54','meta','text/secondary'),T('\u2195 PV-0618 moved from #4 to #5, behind PV-0526','meta','text/secondary'),T('\u21c4 PV-0533 (18%) swapped for PV-0640 (81%, MEM, B-09)','meta','text/secondary')]),
   T('164.2 / 172 m \u00b7 465 / 560 t \u00b7 min battery 58% \u00b7 block order STL \u00d74 \u2192 MEM \u00d77','ds','text/primary')]),
  $fig.instance(COMP.dos,{props:{State:'Vehicle'},name:'Dossier PV-0618'})])]);
D.append(main);
const is=(s,t,r,f,b)=>$fig.autoLayout({name:'Issue \u00b7 '+t,layoutMode:'VERTICAL',itemSpacing:N('s3'),layoutSizingHorizontal:'FILL',...P(N('s4'),N('s4'),N('s4'),N('s4')),strokes:F('line/subtle'),strokeWeight:1},[$fig.instance(ASM.issue,{props:{Severity:s,Title:t,Reason:r,Fix:f}}),$fig.autoLayout({name:'Actions',itemSpacing:N('s2'),...P(28,0,0,0)},[$fig.instance(COMP.btn,{props:{Kind:'Secondary',State:'Default',Label:b}}),$fig.instance(COMP.btn,{props:{Kind:'Ghost',State:'Default',Label:'Show on map'}})])]);
const right=$fig.autoLayout({name:'Issues column',x:1040,y:56,width:400,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',layoutMode:'VERTICAL',fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1},[
 $fig.autoLayout({name:'Head',layoutMode:'VERTICAL',itemSpacing:2,layoutSizingHorizontal:'FILL',...P(N('s4'),N('s4'),N('s4'),N('s3'))},[T('Checks','h','text/primary'),T('2 violations block sending \u00b7 1 warning','meta','text/muted')]),
 is('Fault','Over length on D-02','181.5 m including 1.5 m gaps; D-02 holds 172 m.','\u2192 Drop PV-0702 (\u221217.3 m) \u2192 164.2 m','Drop PV-0702'),
 is('Fault','Wrong block order','PV-0618 is bound for MEM but sits at #4. STL drops first, so it would be cut with the wrong block.','\u2192 Move PV-0618 to #5, behind PV-0526','Move to #5'),
 is('Warning','Battery below floor','PV-0533 is at 18%; the floor is 25%. CH-02 is out of service since 13:18.','\u2192 Swap for PV-0640 (81%), or charge at CH-01 until \u224814:04','Swap for PV-0640'),
 sp(),
 $fig.autoLayout({name:'Footer',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',...P(N('s4'),N('s4'),N('s4'),N('s4')),strokes:F('line/subtle'),strokeWeight:1},[$fig.instance(ASM.send,{props:{State:'Blocked',Reason:'Resolve 2 violations and 1 warning to send'}})])]);
D.append(right);
await $fig.done();
const Dn=D.node;
const rc=Dn.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id===COMP.runChip);if(rc)rc.findAllWithCriteria({types:['TEXT']})[0].characters='LIVE \u00b7 13:42';
// meters: widths + fills via detach
const fw={'Length':236,'Weight':208,'Battery floor':42,'Block order':0};
for(const m of Dn.findAllWithCriteria({types:['INSTANCE']}).filter(i=>i.name.startsWith('Meter \u00b7 '))){const lab=m.name.slice(8);m.layoutGrow=1;const d=m.detachInstance();const bar=d.children.find(c=>c.name==='Bar');if(fw[lab]===0)bar.visible=false;else bar.children[0].resize(Math.round(fw[lab]),4);}
// dossier texts
const dos=Dn.findAllWithCriteria({types:['INSTANCE']}).find(i=>i.name==='Dossier PV-0618');const ts=dos.findAllWithCriteria({types:['TEXT']});
const head=dos.children.find(c=>c.name==='Head');const ht=head.findAllWithCriteria({types:['TEXT']});ht[0].characters='PV-0618';ht[1].characters='WRONG BLOCK';
const jam=await figma.variables.getVariableByIdAsync(R.jam),onv=await figma.variables.getVariableByIdAsync(R.on);const pill=head.children.find(c=>c.name==='Status pill');pill.fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ff4b3e'),'color',jam)];ht[1].fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#0a0c0f'),'color',onv)];const tnt=pill.children.find(c=>c.name==='Tint');if(tnt)tnt.visible=false;
const rowsD=dos.children.filter(c=>c.name.startsWith('Row '));const vals=[['SOC','71%'],['DEST BLOCK','MEM'],['TRACK','B-08 \u00b7 slot 2'],['STATE','Reefer, plugged in. Picked at #4 between STL vehicles.'],['PLATOON','PL-52 \u00b7 #4'],['FIX','Move to #5, behind PV-0526']];
rowsD.forEach((r,i)=>{const t=r.findAllWithCriteria({types:['TEXT']});t[0].characters=vals[i][0];t[t.length-1].characters=vals[i][1];});
const soc=rowsD[0];const socT=soc.findAllWithCriteria({types:['TEXT']});const pri=await figma.variables.getVariableByIdAsync(R['text/primary']);socT[socT.length-1].fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ffffff'),'color',pri)];
const bar=soc.children.find(c=>c.name==='Bar');if(bar){const sec=await figma.variables.getVariableByIdAsync(R['text/secondary']);bar.children[0].fills=[figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#ffffff'),'color',sec)];bar.children[0].resize(34,4);}
for(const s of Dn.children.find(c=>c.name==='Issues column').children){if(s.name.startsWith('Issue')||s.name==='Footer'){s.strokeTopWeight=1;s.strokeBottomWeight=0;s.strokeLeftWeight=0;s.strokeRightWeight=0;}}
const ic=Dn.children.find(c=>c.name==='Issues column');ic.strokeTopWeight=0;ic.strokeBottomWeight=0;ic.strokeRightWeight=0;ic.strokeLeftWeight=1;
return {D:Dn.id,total:S.total,sug:sugTotal};
