from pathlib import Path
from PIL import Image
import numpy as np,json,shutil
root=Path(__file__).resolve().parents[1]
refs=root/'references/tanda3';gen=root.parent/'generated_images';out=root/'assets/art'
new={'garden-bg':'b48d2aaf-872d-4274-b789-e1069a86b2f6','party-bg':'546dbb22-fac9-4867-8db5-51610ddaac3b','train-bg':'3833b007-45f0-4b24-a418-b7f1444c669f','garden-plants':'efb96e3f-6fc6-40b0-8533-f9cad558b102','party-guests':'59255553-00e1-4be5-874e-2c49e9337802','party-balloons':'9b13a37e-3c0e-47a2-a521-a9a7e13f7b76','train-vehicles':'bb0dcfc5-b821-407f-9127-aeec45668f06','fruit-whole-clean':'b29fad7e-ad26-4419-9210-ecff03bb33b4','party-cake':'eeaf314e-6ad3-461a-8faa-8ef8c199eb2a'}
new.update({'garden-autumn':'4f859ec8-97ba-4bf1-ab29-a366d11e7c8c','garden-winter':'972e257d-6a21-4308-a28b-6b31c34a6995','garden-extra':'22a09bae-3306-44d3-8bb6-67eb53cad8d1','train-travel':'4c5029f1-8db3-4979-afaf-c728868d4759'})
for n,i in new.items():
 if not (refs/f'{n}.png').exists(): shutil.copy(gen/f'exec-{i}.png',refs/f'{n}.png')
names=['face-bg','face-heads','face-parts','face-accessories','fruit-bg','fruit-cut']+list(new)
grids={'face-heads':(5,1),'face-parts':(4,4),'face-accessories':(4,3),'fruit-whole-clean':(5,3),'fruit-cut':(5,3),'garden-plants':(4,3),'party-guests':(4,3),'party-balloons':(4,2),'train-vehicles':(3,2),'party-cake':(1,1),'garden-extra':(3,2)}
rects={}
for name in names:
 im=Image.open(refs/f'{name}.png')
 if name.endswith('-bg'): im=im.resize((1600,900),Image.Resampling.LANCZOS)
 tmp=out/f'{name}.tmp.webp'
 im.save(tmp,quality=88,method=4)
 tmp.replace(out/f'{name}.webp')
 if name in grids:
  cols,rows=grids[name];w,h=im.size;a=np.array(im.getchannel('A'));boxes=[]
  for i in range(cols*rows):
   x0,x1=round(i%cols*w/cols),round((i%cols+1)*w/cols);y0,y1=round(i//cols*h/rows),round((i//cols+1)*h/rows)
   if name=='face-parts':
    edges=[0,274,519,762,h];y0,y1=edges[i//cols]+5,edges[i//cols+1]-5;x0+=5;x1-=5
   ys,xs=np.where(a[y0:y1,x0:x1]>192)
   if len(xs):
    bx=max(x0,x0+int(xs.min())-2);by=max(y0,y0+int(ys.min())-2);ex=min(x1,x0+int(xs.max())+3);ey=min(y1,y0+int(ys.max())+3);boxes.append([bx,by,ex-bx,ey-by])
   else:raise ValueError(name)
  rects[name]=boxes
(root/'src/art-tanda3.js').write_text('"use strict";\n/* Atlas bounds in source pixels; alpha is preserved. */\nObject.assign(Art.rects, '+json.dumps(rects)+');\n')
print('Prepared',len(names),'assets;',sum((out/f'{n}.webp').stat().st_size for n in names)//1024,'KiB')
