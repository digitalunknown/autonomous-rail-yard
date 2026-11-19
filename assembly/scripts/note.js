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
