// ================= MOBILE: phones portrait (≤820 px wide) or landscape (≤520 px tall). Layout is CSS; this adds sheets, tabs and touch gestures.
// Map-first: the map canvas is full-bleed under thin translucent chrome. Zoom is pinch / double-tap / two-finger tap; layers, legend
// and zoom buttons live in the Map sheet; two 32 px corner chips (recenter, immersive) are the only things floating on the map.
const MQ=window.matchMedia('(max-width: 820px), (max-height: 520px)');
let lastPT='mouse',MSHEET=null,lpT=null,MIMM=false,lastTap=null,twoTap=null,panT=null;
function isMobile(){return MQ.matches;}
function openSheet(k){const app=$('app');k=k||null;MSHEET=k;
  app.classList.remove('sheet','sheet-faults','sheet-vars','sheet-metrics','sheet-map');
  if(k){app.classList.add('sheet','sheet-'+k);if(k==='faults'||k==='vars'){$('sheetTitle').textContent=k==='faults'?'Faults':'Variables';$('yardSide').scrollTop=0;}}
  document.querySelectorAll('#mtabs button[data-mt]').forEach(b=>{const on=b.dataset.mt===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});}
function mobileTick(){const dz=$('dossier');if(dz&&dz.classList.contains('sel')&&!dz.querySelector('.dz-x'))dz.insertAdjacentHTML('afterbegin','<button class="dz-x" aria-label="Close details">×</button>');
  const d=$('mtFault');if(d)d.classList.toggle('on',!!(S&&(S.flist.length||S.faultOn)));
  if(MSHEET==='map'){const z=Math.round(view.z*100)+'%';if($('msPct').textContent!==z)$('msPct').textContent=z;}}
function cancelLP(){if(lpT){clearTimeout(lpT.t);lpT=null;}}
// measure the chrome so the default view, the dossier and the chips frame the part of the map you can actually see
function chromeBox(){if(!isMobile()||VIEW!=='yard')return {top:0,bot:VH};const app=$('app');
  if(MIMM)return {top:0,bot:VH};
  const h=$$('header')?$$('header').getBoundingClientRect().bottom:0;
  const b=Math.min($('bottom').getBoundingClientRect().top,innerHeight);return {top:Math.max(0,h),bot:Math.min(VH,b)};}
function $$(s){return document.querySelector(s);}
function mobileLayout(){if(!isMobile())return;const c=chromeBox();const app=$('app');
  app.style.setProperty('--chB',Math.max(0,innerHeight-c.bot)+'px');}
// the area worth seeing on a phone: hump lead, bowl ladders, bowl and charging tracks
let FOCUS=null;
function focusBounds(){if(FOCUS)return FOCUS;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  let b0=1e9,b1=-1e9;
  for(const e of EL){if(!(e.kind==='lead'||e.kind==='bowl'||e.kind==='charge'||e.track==='Bowl ladder'))continue;for(const p of e.pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);if(e.kind!=='lead'){b0=Math.min(b0,p[1]);b1=Math.max(b1,p[1]);}}}
  return FOCUS={x0,y0,x1,y1,b0,b1};}
// phones open framed on the bowl, fitted into the visible band between header and bottom bar
function mobileView(){if(!isMobile())return;mobileLayout();const c=chromeBox();const f=focusBounds();
  const pad=14,vh=Math.max(80,c.bot-c.top-2*pad),vw=Math.max(80,VW-2*pad-(innerHeight<innerWidth?0:0));
  const bw=f.x1-f.x0,bh=f.y1-f.y0,portrait=VH>VW*1.15;
  // portrait: the yard is ~2:1 wide, so a whole-bowl fit leaves dead bands; crop sideways instead, keeping the hump end
  // (ladder, cuts rolling in, track IDs) and letting the long track tails run off to the right
  const k=portrait?Math.min(vh/bh,2.1*vw/bw):Math.min(vw/bw,vh/bh);view.z=clamp(k/Kfit,ZMIN,ZMAX);const K2=Kfit*view.z;
  view.cx=portrait?f.x0-pad/K2+VW/2/K2:(f.x0+f.x1)/2;view.cy=(portrait?(f.b0+f.b1)/2:(f.y0+f.y1)/2)-((c.top+c.bot)/2-VH/2)/K2;applyView();}
function setImmersive(on){MIMM=!!on;const app=$('app');app.classList.toggle('immersive',MIMM);if(MIMM)openSheet(null);
  const de=document.documentElement;
  try{if(MIMM&&document.fullscreenEnabled&&!document.fullscreenElement&&de.requestFullscreen)de.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
    else if(!MIMM&&document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}catch(_){}
  setTimeout(mobileLayout,380);}
function setTL(open){$('app').classList.toggle('tl-open',open);$('tlToggle').setAttribute('aria-expanded',open);$('tlToggle').setAttribute('aria-label',open?'Collapse timeline':'Expand timeline');requestAnimationFrame(()=>{mobileLayout();refresh(true);});}
// layers + legend live in the Map sheet on phones and go back to the map head / legend chip on desktop
function placeMapControls(){const lay=$$('.layers'),leg=$('legend');
  if(isMobile()){if(lay.parentElement.id!=='msLayers')$('msLayers').appendChild(lay);if(leg.parentElement.id!=='msLegend')$('msLegend').appendChild(leg);}
  else{const mh=$$('.map-head');if(lay.parentElement!==mh)mh.appendChild(lay);const lw=$('legendWrap');if(leg.parentElement!==lw)lw.insertBefore(leg,$('legendBtn'));}}
function initMobile(){
  document.querySelectorAll('#mtabs button[data-mt]').forEach(b=>b.onclick=()=>openSheet(b.dataset.mt===MSHEET?null:b.dataset.mt));
  $('dossier').addEventListener('click',e=>{if(e.target.closest('.dz-x')){selected=null;refresh(true);}});
  $('sheetClose').onclick=()=>openSheet(null);$('scrim').onclick=()=>openSheet(null);$('msClose').onclick=()=>openSheet(null);
  $('mFit').onclick=()=>mobileView();$('msFit').onclick=()=>{openSheet(null);mobileView();};
  $('mFull').onclick=()=>setImmersive(true);$('msFull').onclick=()=>setImmersive(true);$('mExit').onclick=()=>setImmersive(false);
  $('msIn').onclick=()=>zoomTo(view.z*1.25);$('msOut').onclick=()=>zoomTo(view.z/1.25);
  $('tlToggle').onclick=()=>setTL(!$('app').classList.contains('tl-open'));
  $('railHide').onclick=()=>{openSheet(null);$('app').classList.add('rail-off');};$('mRail').onclick=()=>$('app').classList.remove('rail-off');
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&MIMM)setImmersive(false);});
  window.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(MSHEET){openSheet(null);e.stopPropagation();}else if(MIMM){setImmersive(false);e.stopPropagation();}},true);
  placeMapControls();
  // double-tap is handled above with the touch bookkeeping; keep the desktop dblclick zoom from doubling it on phones
  window.addEventListener('dblclick',e=>{if(e.target===mapC&&lastPT!=='mouse')e.stopPropagation();},true);
  const onChange=()=>{openSheet(null);setImmersive(false);placeMapControls();if(VIEW==='yard'){resize();staticDirty=true;}if(isMobile())requestAnimationFrame(mobileView);refresh(true);renderAsm(true);};
  if(MQ.addEventListener)MQ.addEventListener('change',onChange);else MQ.addListener(onChange);
  const OQ=matchMedia('(orientation: portrait)');const onRot=()=>{if(isMobile())setTimeout(()=>{resize();mobileView();},60);};
  if(OQ.addEventListener)OQ.addEventListener('change',onRot);else OQ.addListener(onRot);
  window.addEventListener('resize',()=>{if(isMobile())requestAnimationFrame(mobileLayout);});
  // long-press on the map (touch / pen) opens the fault menu, like right-click on desktop
  mapC.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;cancelLP();const r=mapC.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
    lpT={x,y,t:setTimeout(()=>{if(ptrs.size>1){lpT=null;return;}if(drag)drag.moved=true;lpT=null;if(navigator.vibrate)try{navigator.vibrate(12);}catch(_){}openPop(x,y);},520)};
    // gesture bookkeeping: double-tap zoom in, two-finger tap zoom out, tap-to-restore in immersive
    // (5_ui's own pointerdown ran first, so ptrs already counts this finger)
    const now=performance.now();lastPT=e.pointerType;
    if(ptrs.size===2&&mapC._tap&&now-mapC._tap.t<250){twoTap={t:now,moved:!!mapC._tap.moved,x:(x+mapC._tap.x)/2,y:(y+mapC._tap.y)/2};lastTap=null;return;}
    if(ptrs.size===1)twoTap=null;
    mapC._tap={x,y,t:now,sel:selected,moved:false};});
  mapC.addEventListener('pointermove',e=>{const r=mapC.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
    const tp=mapC._tap;if(tp&&Math.hypot(x-tp.x,y-tp.y)>10){tp.moved=true;if(twoTap)twoTap.moved=true;}
    if(e.pointerType!=='mouse'&&tp&&tp.moved&&isMobile()){$('app').classList.add('panning');clearTimeout(panT);}
    if(!lpT)return;if(Math.hypot(x-lpT.x,y-lpT.y)>10||ptrs.size>1)cancelLP();});
  const up=e=>{cancelLP();if(e.pointerType==='mouse'||!isMobile())return;clearTimeout(panT);panT=setTimeout(()=>$('app').classList.remove('panning'),220);
    const tp=mapC._tap,now=performance.now();if(!tp)return;
    if(twoTap){if(ptrs.size>0)return;const tt=twoTap;twoTap=null;lastTap=null;mapC._tap=null;if(!tt.moved&&now-tt.t<350&&e.type==='pointerup')zoomAt(1/1.8,tt.x,tt.y);return;}
    if(e.type!=='pointerup'||tp.moved||now-tp.t>300||ptrs.size>1){lastTap=null;return;}
    if(lastTap&&now-lastTap.t<320&&Math.hypot(tp.x-lastTap.x,tp.y-lastTap.y)<30){lastTap=null;zoomAt(1.8,tp.x,tp.y);return;}
    lastTap={x:tp.x,y:tp.y,t:now};
    if(MIMM&&!tp.sel)setTimeout(()=>{if(!selected&&lastTap&&performance.now()-lastTap.t>=300)setImmersive(false);},330);};
  mapC.addEventListener('pointerup',up);mapC.addEventListener('pointercancel',up);
}
