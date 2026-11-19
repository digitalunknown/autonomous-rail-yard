const FIDS=['146:3220','146:2936'];
const pg=figma.root.children.find(p=>p.id==='122:1508');await figma.setCurrentPageAsync(pg);
const out={};
for(const fid of FIDS){const F=await figma.getNodeByIdAsync(fid);const fb=F.absoluteBoundingBox;const rows=[];
for(const n of F.findAll(n=>n.type!=='TEXT'&&'fills' in n&&Array.isArray(n.fills)&&n.fills.length===1)){
 const p=n.fills[0];if(p.type!=='SOLID'||p.opacity<0.999||!(p.boundVariables&&p.boundVariables.color))continue;
 if(!n.visible)continue;const b=n.absoluteBoundingBox;if(!b||b.width*b.height<60)continue;
 rows.push([n.id,Math.round(b.x-fb.x),Math.round(b.y-fb.y),Math.round(b.width),Math.round(b.height),p.boundVariables.color.id.replace('VariableID:',''),n.id.includes(';')?1:0]);}
out[fid]=rows;}
return out;
