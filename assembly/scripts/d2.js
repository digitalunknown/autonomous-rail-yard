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
