import json,re,glob,numpy as np
from PIL import Image
A='/cursor/stores/user/grok-bot/agents/950133a4-53cc-4fb6-a0a1-40d3065f2973/assets/'
data={}
for f in ['2c7db6512e1d715eabc006af6bba82a90ee28c44de6859f2150c699d12a1397d.txt','c958abe1851779c687f940bde03dc764e02dd6e38dd7e343df7d9d43df4c0a90.txt','6c6581e584653a5fd2e6a247707d9f19cfd05184d4cd81950c5e27867f71f1d1.txt']:
    t=open(A+f).read(); j=t[t.index('{"'):t.rindex(']]}')+3]; data.update(json.loads(j))
img={'146:2654':'before-07.1-flat-switching.png','141:2378':'before-07.2-hump-yard.png','146:3220':'before-07.3-intermodal.png','146:2936':'before-07.4-night-ops-jam.png','146:3499':'before-07.5-ladder-detail.png','139:2085':'before-00b-component-sheet-v2.png'}
old={'122:1487':'#b8f53d','122:1488':'#3a6bff','122:1489':'#ffd23d','122:1490':'#ff4a3d','122:1484':'#e9eef2','122:1485':'#8a96a2'}
h2=lambda h: np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
res=[]
for fid,rows in data.items():
    im=np.asarray(Image.open(img[fid]).convert('RGB')).astype(float); H,W,_=im.shape
    for (nid,x,y,w,h,vid,inst) in rows:
        if vid not in old: continue
        if x<0 or y<0 or x+w>W or y+h>H or w<3 or h<3: continue
        col=h2(old[vid])
        inside=im[y+1:y+h-1, x+1:x+w-1].reshape(-1,3)
        if len(inside)<4: continue
        r=3
        ring=[]
        for (ya,yb,xa,xb) in [(y-r,y-1,x,x+w),(y+h+1,y+h+r,x,x+w),(y,y+h,x-r,x-1),(y,y+h,x+w+1,x+w+r)]:
            ya,yb,xa,xb=max(0,ya),min(H,yb),max(0,xa),min(W,xb)
            if yb>ya and xb>xa: ring.append(im[ya:yb,xa:xb].reshape(-1,3))
        if not ring: continue
        bg=np.median(np.concatenate(ring),0); med=np.median(inside,0)
        d=col-bg
        if np.dot(d,d)<1600: continue
        a=float(np.dot(med-bg,d)/np.dot(d,d))
        resid=float(np.linalg.norm(med-(bg+a*d)))
        res.append((fid,nid,w,h,vid,inst,round(a,3),round(resid,1)))
cand=[r for r in res if 0.03<r[6]<0.85 and r[7]<30]
print(len(res),len(cand))
for r in cand: print(r)
json.dump(cand,open('scripts/alpha-cands.json','w'))
