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
