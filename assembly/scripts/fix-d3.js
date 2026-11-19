const D=await figma.getNodeByIdAsync('192:2149');
const board=D.findOne(n=>n.name==='Board');
for(const c of board.children){c.layoutGrow=1;c.layoutSizingHorizontal='FILL';}
const out=[];
for(const r of D.findAll(n=>n.name==='Readiness')){const segs=r.children;const tot=segs.reduce((a,s)=>a+s.width+2,0);const W=r.parent.width;const sc=W/tot;let acc=0;segs.forEach((s,i)=>{const w=i===segs.length-1?W-acc-2*(segs.length-1)+0:Math.round((s.width+2)*sc)-2;s.resize(Math.max(2,w),4);acc+=Math.max(2,w);});out.push(W);}
for(const t of D.findAll(n=>n.type==='TEXT'&&/^\+\d/.test(n.characters))){t.layoutSizingHorizontal='FILL';t.textAutoResize='HEIGHT';}
return out;
