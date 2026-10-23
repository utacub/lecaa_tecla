#!/usr/bin/env python3
"""Encode generated production assets and locate independent atlas objects.
No creative retouching: preserve alpha, detect occupied bounds to avoid neighboring cells.
"""
from pathlib import Path
from PIL import Image
from scipy.ndimage import label,find_objects
import numpy as np,json,re
ROOT=Path(__file__).resolve().parents[1]
GRIDS={'orbital-sprites':(3,2),'crystal-sprites':(3,2),'race-props':(4,3),'race-cars':(4,4),'race-diagonal':(4,4),'race-turn-front':(4,4),'race-turn-back':(4,4),**{'paper-'+t:(4,3) for t in ['granja','mar','selva','insectes','bosc']}}
rects={}
for key,(cols,rows) in GRIDS.items():
 p=ROOT/'assets/art/production-originals'/f'{key}.png'
 if not p.exists():continue
 im=Image.open(p); a=np.array(im.getchannel('A'));labs,n=label(a>100);slices=find_objects(labs);counts=np.bincount(labs.ravel());boxes=[]
 for i,b in enumerate(slices,1):
  if counts[i]>800:boxes.append((int(counts[i]),[b[1].start,b[0].start,b[1].stop,b[0].stop]))
 boxes=sorted(boxes,reverse=True)[:cols*rows]
 # Original art uses regular row order but unequal cell padding. Sort row groups.
 boxes.sort(key=lambda b:(b[1][1]+b[1][3])/2)
 ordered=[]
 for row in range(rows):
  rowbox=sorted(boxes[row*cols:(row+1)*cols],key=lambda b:(b[1][0]+b[1][2])/2)
  for area,(x,y,x1,y1) in rowbox:ordered.append([max(0,x-2),max(0,y-2),min(im.width,x1+2)-max(0,x-2),min(im.height,y1+2)-max(0,y-2)])
 rects[key]=ordered
src=ROOT/'src/art.js';s=src.read_text();s=re.sub(r'\n/\* ATLAS BOUNDS \*/.*?\/\* END ATLAS BOUNDS \*/','',s,flags=re.S);s+='\n/* ATLAS BOUNDS */\nArt.rects='+json.dumps(rects,separators=(',',':'))+';\n/* END ATLAS BOUNDS */\n';src.write_text(s)
print('Atlas bounds:',len(rects),'atlases',sum(map(len,rects.values())),'objects')
