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
await figma.loadFontAsync({family:'Inter',style:'Regular'});
const Cf=await figma.getNodeByIdAsync('201:2920');const d=Cf.findOne(n=>n.name==='Dragging SHP-4425');d.rotation=0;d.resize(372,48);d.rotation=-2;
const LINES=[
['Current PL-52 (frames A, B)','Tare 14+14+16+18+15+14+12+12+14+16+18+12 = 175 t. Cargo 24+27+36+26+34+23+21+19+26+39+25+18 = 318 t. Gross 493 t of 560 t. Brake margin (560-493)/560 = 12%.'],
['Length','12 cars = 165.0 m + 11 gaps x 1.5 m = 181.5 m against 172 m on D-02. Dropping PV-0702 (15.8 m + 1.5 m gap) gives 164.2 m.'],
['Axle load','4 axles per car, 14.0 t per axle on the route (56 t max gross). PV-0611: 16 t tare + 39 t = 55 t, 13.75 t per axle (98%). Trim to 36 t: 52 t, 13.0 t per axle (93%).'],
['Battery + reefer','Pack 80 kWh. STL to MEM traction is about 9% of SoC; a 2.1 kW reefer for about 4.2 h is about 11%. PV-0533: 18 - 9 - 11 = -2%. PV-0640: 81 - 9 - 11 = 61%. Reefers on PL-52: PV-0618, PV-0533 (container), PV-0625 = 3 x 2.1 = 6.3 kW.'],
['Hazmat','PV-0590 (Cl 3 ethanol) at #7 coupled to PV-0597 (Cl 5.1 peroxide) at #8 means incompatible classes with no buffer. Swapping PV-0597 with PV-0604 puts a non-hazmat car between them.'],
['Checks count','Violations (red): over length, block order, hazmat = 3. Warnings (yellow): PV-0533 battery + reefer, PV-0611 axle = 2. Send bar: "Resolve 3 violations and 2 warnings to send".'],
['Suggested plan (frame C)','Five changes: drop PV-0702; move PV-0618 to #5; swap PV-0533 for PV-0640 (cargo SHP-4425 to follow); swap PV-0597 and PV-0604; trim SHP-4436 by 3 t. Gross 493 - 30 - 37 + 14 - 3 = 437 t with PV-0640 empty, 460 t once SHP-4425 is on. Front six 261 t, rear five 199 t. Brake margin 22% (437 t), 18% (460 t).'],
['Bulk edit (frame B)','PV-0471 24 to 26 t (+2), PV-0488 27 to 26 t (-1), PV-0604 26 t (0): train 493 to 494 t. Box max gross 48 t, so 34 t max load.']];
const N_=$fig.autoLayout({name:'05 \u00b7 Data math (off-canvas note)',x:6400,y:1100,width:1440,layoutSizingHorizontal:'FIXED',layoutMode:'VERTICAL',itemSpacing:N('s3'),...P(N('s6'),N('s6'),N('s6'),N('s6')),fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1,cornerRadius:N('md')},[T('How the numbers add up','h','text/primary'),...LINES.map(([h,b])=>$fig.autoLayout({name:h,layoutSizingHorizontal:'FILL',itemSpacing:N('s4')},[$fig.autoLayout({name:'H',width:200,layoutSizingHorizontal:'FIXED'},[T(h,'bs','text/primary')]),T(b,'body','text/secondary',{layoutGrow:1,textAutoResize:'HEIGHT'})]))]);
await $fig.done();
for(const r of N_.node.children)if(r.type==='FRAME'){const t=r.children[1];t.layoutSizingHorizontal='FILL';t.textAutoResize='HEIGHT';}
return {note:N_.node.id,h:N_.node.height};
