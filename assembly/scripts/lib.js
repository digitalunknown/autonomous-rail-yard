const ASM={meter:'188:1467',issue:'188:1492',send:'188:1509',car:'188:1518',trow:'188:1557',thead:'188:1537'};
const V=[['PV-0471','Box',12.4,38,82,'STL','B-03'],['PV-0488','Box',12.4,41,76,'STL','B-03'],['PV-0512','Hopper',14.0,52,64,'STL','B-03'],['PV-0618','Reefer',13.2,44,71,'MEM','B-08'],['PV-0526','Tank',13.6,49,58,'STL','B-03'],['PV-0533','Box',12.4,37,18,'MEM','B-08'],['PV-0590','Flat',15.8,33,69,'MEM','B-08'],['PV-0597','Flat',15.8,31,73,'MEM','B-08'],['PV-0604','Box',12.4,40,88,'MEM','B-08'],['PV-0611','Hopper',14.0,55,61,'MEM','B-09'],['PV-0625','Reefer',13.2,43,79,'MEM','B-09'],['PV-0702','Flat',15.8,30,66,'MEM','CH-01']];
const SPARE=[['PV-0640','Box',12.4,39,81,'MEM','B-09'],['PV-0655','Flat',15.8,31,92,'STL','B-04'],['PV-0677','Reefer',13.2,45,23,'STL','B-04']];
const carState=i=>i===3?'Wrong block':i===5?'Low battery':i===11?'Over length':'OK';
// consist strip: absolute frame; px per metre k; gap 1.5 m
const strip=(k,opts={})=>{const H=opts.h||40;const gap=1.5*k;let x=0;const kids=[];const pos=[];
 V.forEach((v,i)=>{const w=Math.round(v[2]*k);pos.push([x,w]);kids.push($fig.instance(ASM.car,{props:{State:opts.sel===i?'Selected':carState(i),ID:opts.full?v[0]:v[0].slice(3),SoC:v[4]+'%'},x:Math.round(x),y:opts.top||18,width:w,height:H}));x+=v[2]*k+gap;});
 const total=x-gap;const lim=172*k;
 // block brackets (contiguous runs)
 const runs=[];V.forEach((v,i)=>{if(runs.length&&runs[runs.length-1].b===v[5])runs[runs.length-1].e=i;else runs.push({b:v[5],s:i,e:i});});
 const br=runs.map(r=>{const x0=pos[r.s][0],x1=pos[r.e][0]+pos[r.e][1];const bad=r.b==='MEM'&&r.s===3&&r.e===3;return $fig.autoLayout({name:'Block '+r.b,x:Math.round(x0),y:0,width:Math.round(x1-x0),height:14,layoutSizingHorizontal:'FIXED',layoutSizingVertical:'FIXED',counterAxisAlignItems:'MIN',strokes:F(bad?'jam':'line/control'),strokeWeight:1,strokeAlign:'INSIDE',fills:[]},[T(r.b,'label',bad?'jam':'text/muted',{})]);});
 const over=$fig.rectangle({name:'Over length',x:Math.round(lim),y:(opts.top||18)-4,width:Math.round(total-lim)+2,height:H+8,fills:F('jam'),opacity:.14});
 const limLine=$fig.rectangle({name:'Limit line',x:Math.round(lim),y:0,width:1,height:(opts.top||18)+H+8,fills:F('jam')});
 const limLab=T('D-02 limit 172 m','label','jam',{x:Math.round(lim)+6,y:(opts.top||18)+H+10});
 const w=Math.max(Math.round(total)+ (opts.pad||120),opts.minW||0);
 return {node:$fig.frame({name:'Consist strip',width:w,height:(opts.top||18)+H+28,fills:[],clipsContent:false},[over,...br,...kids,limLine,limLab]),total,lim,pos};};
const header=(fr)=>{const h=$fig.instance(COMP.hdr,{props:{Mode:'Assembly'},x:0,y:0});fr.append(h);return h;};
