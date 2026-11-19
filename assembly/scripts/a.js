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
