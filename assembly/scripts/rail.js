const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const sec=(kids,name)=>$fig.autoLayout({name,layoutMode:'VERTICAL',itemSpacing:N('s4'),layoutSizingHorizontal:'FILL',...P(N('s4'),N('s4'),N('s4'),N('s4')),strokes:F('line/subtle'),strokeWeight:1},kids);
const m=(st,l,v,n)=>$fig.instance(ASM.meter,{props:{Status:st,Label:l,Value:v,Note:n}});
const is=(s,t,r,f)=>$fig.instance(ASM.issue,{props:{Severity:s,Title:t,Reason:r,Fix:f}});
const rail=$fig.component({name:'asm/Plan rail',layoutMode:'VERTICAL',width:360,height:844,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',fills:F('bg/surface'),strokes:F('line/subtle'),strokeWeight:1,clipsContent:true},[
 $fig.autoLayout({name:'Head',layoutMode:'VERTICAL',itemSpacing:N('s1'),layoutSizingHorizontal:'FILL',...P(N('s4'),N('s4'),N('s4'),N('s3'))},[T('Platoon plan','cap','text/muted'),$fig.autoLayout({name:'Title',layoutSizingHorizontal:'FILL',counterAxisAlignItems:'CENTER',itemSpacing:N('s2')},[T('PL-52','dl','text/primary'),T('STL \u2192 MEM','ds','text/secondary'),sp(),$fig.autoLayout({name:'Draft pill',height:20,layoutSizingVertical:'FIXED',...P(6,6,0,0),counterAxisAlignItems:'CENTER',cornerRadius:N('sm'),fills:F('bg/control')},[T('DRAFT','label','text/secondary')])]),T('12 vehicles \u00b7 D-02 departs 14:20 \u00b7 38 min from now','meta','text/muted')]),
 sec([T('Constraints','gl','text/muted'),m('Fault','Length','181.5 / 172 m','D-02 usable length \u00b7 over by 9.5 m'),m('OK','Weight','493 / 560 t','67 t headroom'),m('Warning','Battery floor','min 18% \u00b7 floor 25%','PV-0533 below floor \u00b7 average 67%'),m('Fault','Block order','STL \u00d74 then MEM \u00d78','PV-0618 (MEM) sits at #4, inside the STL group')],'Constraints'),
 sec([T('Issues \u00b7 2 violations, 1 warning','gl','text/muted'),is('Fault','Over length on D-02','181.5 m including 1.5 m gaps; D-02 holds 172 m.','\u2192 Drop PV-0702 (\u221217.3 m) \u2192 164.2 m'),is('Fault','Wrong block order','PV-0618 is bound for MEM but sits at #4. STL drops first, so it would be cut out of the wrong block.','\u2192 Move PV-0618 to #5, behind PV-0526'),is('Warning','Battery below floor','PV-0533 is at 18%; the floor is 25%. CH-02 is out of service since 13:18.','\u2192 Charge at CH-01, ready \u224814:04, or swap for PV-0640 (81%)')],'Issues'),
 sp(),
 $fig.autoLayout({name:'Footer',layoutMode:'VERTICAL',layoutSizingHorizontal:'FILL',...P(N('s4'),N('s4'),N('s4'),N('s4')),strokes:F('line/subtle'),strokeWeight:1},[$fig.instance(ASM.send,{props:{State:'Blocked',Reason:'Resolve 2 violations and 1 warning to send'}})])]);
$fig.get('188:1463').append(rail);
await $fig.done();
const r=rail.node;r.layoutSizingVertical='FIXED';r.resize(360,844);r.strokeTopWeight=0;r.strokeRightWeight=0;r.strokeBottomWeight=0;r.strokeLeftWeight=1;
for(const s of r.children){if(s.name==='Constraints'||s.name==='Issues'||s.name==='Footer'){s.strokeTopWeight=1;s.strokeRightWeight=0;s.strokeBottomWeight=0;s.strokeLeftWeight=0;}}
// meter fill widths
const widths={'Length':328,'Weight':289,'Battery floor':59,'Block order':0};
for(const i of r.findAllWithCriteria({types:['INSTANCE']})){if(i.mainComponent&&i.mainComponent.parent&&i.mainComponent.parent.id===ASM.meter){const pr=i.componentProperties;const lk=Object.keys(pr).find(k=>k.startsWith('Label'));const w=widths[pr[lk].value];const bar=i.children.find(c=>c.name==='Bar');if(w===0)bar.visible=false;else bar.children[0].resize(w,4);}}
// content height check
r.layoutSizingVertical='HUG';const h=r.height;r.layoutSizingVertical='FIXED';r.resize(360,844);
return {rail:r.id,contentH:h};
