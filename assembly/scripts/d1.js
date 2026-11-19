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
