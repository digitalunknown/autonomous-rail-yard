import re
f='src/2_body.html';s=open(f).read()
a=s.index('  <div class="grp"><div class="k">Fault injection</div>')
b=s.index('</aside>')
s=s[:a]+'''  <div class="grp" id="faultsGrp"><div class="k fk"><span>Faults <span id="fCount" class="fcount">none</span></span><span class="fk-r"><button id="fPick" aria-pressed="false" title="Click an element on the map to fault it (or right-click the map)">Pick on map</button><button id="fClearAll" disabled>Clear all</button></span></div>
    <div class="fadd">
      <label class="fsel"><span>Type</span><select id="fType" aria-label="Fault type"><option value="turnout">Turnout stuck</option><option value="retarder">Retarder failure</option><option value="charger">Charger outage</option><option value="battery">Battery drop</option><option value="track">Track blocked</option></select></label>
      <label class="fsel"><span>Target</span><select id="fTarget" aria-label="Fault target"></select></label>
      <label class="fsel"><span>Clears</span><select id="fDur" aria-label="Fault duration"><option value="0">Manually</option><option value="900">After 15 min</option><option value="1800">After 30 min</option><option value="3600">After 60 min</option></select></label>
      <button id="fInject" class="finj">Inject</button>
    </div>
    <div class="fhint" id="fHint"></div>
    <div id="fList" role="list" aria-label="Active faults"></div>
    <div class="fault" id="faultCard"><div class="fh">Preset · X-24 inspection <span id="faultPill">Nominal</span></div>
    <div class="fs" id="faultSub">Bowl ladder, B-04 branch. Failing it cuts off B-04…B-12 and the charging spurs.</div>
    <button class="fbtn" id="faultBtn">Trigger fault</button></div>
  </div>
'''+s[b:]
# popover in mapbox
anchor='      <div id="dossier"></div>'
assert anchor in s
s=s.replace(anchor,anchor+'\n      <div id="fpop" role="dialog" aria-label="Inject fault"></div>\n      <div id="pickBar">Pick mode · click a turnout, track, charger, crest or vehicle <button id="pickDone">Done</button></div>')
open(f,'w').write(s)
f='src/1_head.html';s=open(f).read()
css='''
/* ---------- fault injector ---------- */
.grp>.k.fk{display:flex;justify-content:space-between;align-items:center}
.fcount{font-family:var(--mono);font-size:var(--fs-label);font-weight:500;color:var(--fg-4);margin-left:6px}
.fcount.on{background:var(--red);color:var(--on-accent);border-radius:var(--r-1);padding:1px 6px;font-weight:600}
.fk-r{display:flex;gap:2px}
.fk-r button{font-size:var(--fs-meta);font-weight:500;color:var(--fg-3);padding:2px 6px;border-radius:var(--r-1)}
.fk-r button:hover:not(:disabled){color:var(--fg);background:var(--bg-2)}
.fk-r button:disabled{color:var(--fg-4);cursor:default}
#fPick[aria-pressed=true]{background:var(--fg);color:var(--on-accent)}
.fadd{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2)}
.fsel{display:flex;flex-direction:column;gap:2px;font-size:var(--fs-label);color:var(--fg-3);min-width:0}
.fsel select{appearance:none;-webkit-appearance:none;width:100%;height:28px;background:var(--bg-2) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23818b96'/%3E%3C/svg%3E") no-repeat right 8px center;border:1px solid var(--line-2);border-radius:var(--r-1);color:var(--fg);font:inherit;font-size:var(--fs-meta);padding:0 22px 0 8px;cursor:pointer;text-overflow:ellipsis}
.fsel select:hover{border-color:var(--line-3)}
.fsel select:disabled{color:var(--fg-4);cursor:default}
.finj{align-self:end;height:28px;border-radius:var(--r-1);background:var(--fg);color:var(--on-accent);font-weight:600;font-size:var(--fs-meta);transition:background-color var(--dur-1) var(--ease-out)}
.finj:hover{background:#fff}.finj:active{transform:translateY(1px)}
.finj:disabled{background:var(--bg-3);color:var(--fg-4);cursor:default}
.fhint{font-size:var(--fs-label);color:var(--fg-3);min-height:16px;margin:6px 0 2px;line-height:16px}
#fList{display:flex;flex-direction:column;gap:4px;margin-bottom:var(--s-3)}
#fList:empty{display:none}
.frow{display:grid;grid-template-columns:6px minmax(0,1fr) auto;align-items:center;gap:var(--s-2);border:1px solid rgba(255,75,62,.35);background:var(--red-a);border-radius:var(--r-1);padding:5px 4px 5px 8px}
.frow>i{width:6px;height:6px;border-radius:1px;background:var(--red);transform:rotate(45deg)}
.frow b{display:block;font-family:var(--mono);font-size:var(--fs-label);font-weight:600;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.frow span{display:block;font-size:var(--fs-label);color:var(--fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.frow button{font-size:var(--fs-label);color:var(--fg-2);padding:3px 7px;border-radius:var(--r-1);border:1px solid var(--line-2)}
.frow button:hover{color:var(--fg);border-color:var(--line-3);background:var(--bg-2)}
#fpop{position:absolute;display:none;z-index:6;min-width:176px;background:rgba(19,23,27,.98);border:1px solid var(--line-2);border-radius:var(--r-2);box-shadow:var(--shadow-overlay);padding:6px;font-size:var(--fs-meta)}
#fpop .ph2{font-family:var(--mono);font-size:var(--fs-label);color:var(--fg-3);padding:2px 6px 6px;letter-spacing:.02em}
#fpop .ph2 b{color:var(--fg);font-weight:600}
#fpop button{display:flex;width:100%;align-items:center;gap:var(--s-2);text-align:left;padding:6px;border-radius:var(--r-1);color:var(--fg);font-size:var(--fs-meta)}
#fpop button:hover,#fpop button:focus-visible{background:var(--bg-3)}
#fpop button i{width:6px;height:6px;border-radius:1px;background:var(--red);transform:rotate(45deg);flex:none}
#fpop button.clr i{background:none;border:1px solid var(--fg-3)}
#fpop .none{color:var(--fg-3);padding:4px 6px}
#pickBar{position:absolute;left:50%;bottom:var(--s-3);transform:translateX(-50%);display:none;align-items:center;gap:var(--s-3);background:rgba(19,23,27,.96);border:1px solid var(--line-2);border-radius:var(--r-round);padding:4px 4px 4px 12px;font-size:var(--fs-meta);color:var(--fg-2);z-index:4;white-space:nowrap}
#pickBar button{background:var(--fg);color:var(--on-accent);border-radius:var(--r-round);padding:3px 10px;font-weight:600;font-size:var(--fs-label)}
#mapbox.picking #map{cursor:crosshair!important}
#mapbox.picking #pickBar{display:flex}
'''
s=s.replace("</style>",css+"</style>",1)
open(f,'w').write(s);print('ok')
