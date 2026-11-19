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
