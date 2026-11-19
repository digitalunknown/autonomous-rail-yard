const pg=figma.root.children.find(p=>p.id==='165:1523');await figma.setCurrentPageAsync(pg);
const tr=await figma.getNodeByIdAsync('188:1557');
const bars=tr.children.map(v=>{const b=v.findAllWithCriteria({types:['FRAME']}).find(f=>f.name==='Bar');return {id:b.id,low:v.name==='State=Low battery'||v.name==='State=Unavailable'};});
const L=[0,10,20,30,40,50,60,70,80,90,100];
const set=$fig.variants({name:'asm/Battery bar'},[].concat(...['Neutral','Low'].map(tone=>L.map(l=>$fig.component({name:`Tone=${tone}, Level=${l}`,layoutMode:'HORIZONTAL',width:48,height:4,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',cornerRadius:2,fills:F('line/strong'),clipsContent:true},l?[$fig.rectangle({name:'Fill',width:Math.round(48*l/100),height:4,fills:F(tone==='Low'?'live':'text/secondary')})]:[])))));
$fig.get('188:1463').append(set);
for(const b of bars){$fig.get(b.id).replace($fig.instance(set,{props:{Tone:b.low?'Low':'Neutral',Level:'80'},name:'Battery bar'}));}
await $fig.done();
const s=set.node;const ch=s.children;ch.forEach((c,i)=>{c.x=16+(i%11)*56;c.y=16+Math.floor(i/11)*16;});s.resizeWithoutConstraints(32+11*56-8,32+2*16-12);
return {set:s.id};
