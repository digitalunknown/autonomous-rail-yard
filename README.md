# Autonomous Rail Yard: Yard Control sim

A lab experiment from [Digital Unknown](https://www.digitalunknown.com/spare-parts): an interactive simulator for an autonomous freight hump yard. Modular battery vehicles get humped, sorted, charged, and reassembled into outbound platoons. Every knob is a variable you can tweak.

The sim is a single self-contained HTML file. No build step, no dependencies. Open it in a browser.

## Run it
Live: https://autonomous-rail-yard.vercel.app

Or open `yard-control-v2.html` locally.

## What's in it
- Hump yard track graph with 45° turnouts: receiving R-01..04, hump, bowl B-01..12, charging CH-01/02, departure D-01..03, sidings
- Play, step, speed, live variable sliders, outcome tiles, click-to-open dossiers
- Timeline scrubbing with deterministic replay (edits in replay branch the run)
- Zoom 75–400% with pan and minimap
- 3-lamp signals and state-only color (lime moving, cobalt selected, yellow warning, red fault)
- **Fault injector:** stuck turnouts, retarder failure, charger outage, battery drop, blocked track, from the panel or right-click on the map
- **Assembly view:** build outbound trains from yard inventory, assign cargo per car (type, tonnes, hazmat, reefer), with live checks for length, gross weight, axle load, block order, hazmat adjacency, battery range, and brake margin. Send to yard and the sim pulls, marshals, and departs it.

- **Mobile:** the same file adapts to phones (≤820 px wide, or landscape). The map runs edge to edge under a thin translucent header, bottom bar and tab bar. Pinch, double-tap or one-finger pan to move around; a two-finger tap zooms out. Layers, legend and zoom live in the Map sheet; Metrics, Faults and Variables are bottom sheets. The timeline collapses to a thin scrubber (tap ⌃ for the chart). A corner chip hides all controls for a full-screen map. In landscape the tab rail collapses. Long-press the map for the fault menu. In Assembly, sections stack and you tap to place cars and shipments.

Keyboard: Space play/pause, ←/→ scrub, +/− zoom, 0 fit.

![Yard view with active faults](images/yard-faults.png)
![Assembly view](images/assembly.png)
![Cargo editor](images/cargo-editor.png)

## Layout
- `yard-control-v2.html`: the build (`index.html` is the same file, served at the live link)
- `v2/src/`: v2 source. `python3 v2/build.py` rebuilds `v2/index.html` (copy it to `yard-control-v2.html`)
- `v2/test/`: Playwright tests (`npm i` in `v2/test`, then `node e2e.js`, `scrub.js`, `faults.js`, `anchor.js`, `asm.js`, `mobile.js` (iPhone emulation), plus `soak.js` / `fsoak.js`)

Simulated data, not live telemetry.
