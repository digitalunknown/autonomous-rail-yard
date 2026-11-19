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
