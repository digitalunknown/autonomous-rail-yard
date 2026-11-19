// ================= MOBILE: phones portrait (≤820 px wide) or landscape (≤520 px tall). Layout is CSS; this adds sheets, tabs and touch gestures.
const MQ=window.matchMedia('(max-width: 820px), (max-height: 520px)');
let MSHEET=null,lpT=null;
function isMobile(){return MQ.matches;}
function openSheet(k){const app=$('app');k=k&&k!=='map'?k:null;MSHEET=k;
  app.classList.remove('sheet','sheet-faults','sheet-vars','sheet-metrics');
  if(k){app.classList.add('sheet','sheet-'+k);if(k!=='metrics')$('sheetTitle').textContent=k==='faults'?'Faults':'Variables';$('yardSide').scrollTop=0;}
  document.querySelectorAll('#mtabs button').forEach(b=>{const on=b.dataset.mt===(k||'map');b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});}
function mobileTick(){const dz=$('dossier');if(dz&&dz.classList.contains('sel')&&!dz.querySelector('.dz-x'))dz.insertAdjacentHTML('afterbegin','<button class="dz-x" aria-label="Close details">×</button>');const d=$('mtFault');if(d)d.classList.toggle('on',!!(S&&(S.flist.length||S.faultOn)));}
function cancelLP(){if(lpT){clearTimeout(lpT.t);lpT=null;}}
// portrait phones open zoomed in on the bowl instead of the whole (very wide) yard
function mobileView(){if(!isMobile()||innerHeight<innerWidth)return;fitView();zoomAt(2.2,VW*0.52,VH*0.56);}
function initMobile(){
  document.querySelectorAll('#mtabs button').forEach(b=>b.onclick=()=>openSheet(b.dataset.mt===MSHEET?null:b.dataset.mt));
  $('dossier').addEventListener('click',e=>{if(e.target.closest('.dz-x')){selected=null;refresh(true);}});
  $('sheetClose').onclick=()=>openSheet(null);$('scrim').onclick=()=>openSheet(null);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&MSHEET){openSheet(null);e.stopPropagation();}},true);
  const onChange=()=>{openSheet(null);if(VIEW==='yard'){resize();staticDirty=true;}refresh(true);renderAsm(true);};
  if(MQ.addEventListener)MQ.addEventListener('change',onChange);else MQ.addListener(onChange);
  // long-press on the map (touch / pen) opens the fault menu, like right-click on desktop
  mapC.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;cancelLP();const r=mapC.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
    lpT={x,y,t:setTimeout(()=>{if(ptrs.size>1){lpT=null;return;}if(drag)drag.moved=true;lpT=null;if(navigator.vibrate)try{navigator.vibrate(12);}catch(_){}openPop(x,y);},520)};});
  mapC.addEventListener('pointermove',e=>{if(!lpT)return;const r=mapC.getBoundingClientRect();if(Math.hypot(e.clientX-r.left-lpT.x,e.clientY-r.top-lpT.y)>10||ptrs.size>1)cancelLP();});
  mapC.addEventListener('pointerup',cancelLP);mapC.addEventListener('pointercancel',cancelLP);
}
