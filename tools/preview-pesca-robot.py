#!/usr/bin/env python3
"""Build a standalone review copy, leaving the published distribution untouched."""
from pathlib import Path
import subprocess,sys,base64,io
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve()
subprocess.run([sys.executable,str(root/'tools/build.py'),str(out)],check=True)
cards=[]
for i,name in [(10,'Pesca a l’estany'),(23,'El robot ballarí')]:
 im=Image.open(root/f'qa/game-{i}-l1.png').convert('RGB');im.thumbnail((480,270));b=io.BytesIO();im.save(b,'JPEG',quality=80)
 src='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
 cards.append(f'<button class="choice" data-game="{i}" disabled><img src="{src}" alt=""><span>{name}</span></button>')
extra='''<style>
#review{position:fixed;inset:0;z-index:90;overflow:auto;background:#f5f0e5;color:#203e42;padding:clamp(20px,4vw,64px);font-family:Andika,sans-serif;box-sizing:border-box}
#review h1{font:900 clamp(28px,4vw,48px) Nunito,sans-serif;margin:8px 0}#review .eyebrow{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#17676b}#review p{max-width:780px;line-height:1.6}
#choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;max-width:1400px;margin:28px auto}
.choice{padding:0;border:2px solid #d9d5ca;border-radius:20px;overflow:hidden;background:white;color:#203e42;text-align:left;cursor:pointer;font:700 21px Andika,sans-serif;box-shadow:0 6px 16px #203e4212}.choice img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.choice span{display:block;padding:18px}.choice:hover,.choice:focus-visible{border-color:#17676b;outline:3px solid #83bbae}
#review select,#review button.utility,#reviewBack{font:700 17px Andika,sans-serif;padding:10px 18px;border-radius:12px;border:1px solid #17676b;background:white;color:#17676b;cursor:pointer}#reviewBack{position:fixed;right:18px;bottom:12px;z-index:80;background:#fffdf4e8;font-size:14px}#review[hidden],#reviewBack[hidden]{display:none}
</style>
<section id="review" aria-label="Selector de les dues activitats"><div class="eyebrow">LECAA Tecla · Versió de prova</div><h1>Pesca i robot · Nous escenaris</h1><p>Tria una activitat i un nivell. A la pesca, completa la col·lecció de dotze peixos i observa l’aquari ampliat. Prem Retorn per continuar. Al robot, copia els passos i crea la teva coreografia. Aquesta còpia no modifica la versió publicada.</p><label for="reviewLevel">Nivell </label><select id="reviewLevel">'''+''.join(f'<option value="{n}">{n}</option>' for n in range(1,7))+'''</select><span id="reviewStatus" role="status"> Preparant les activitats…</span><div id="choices">'''+''.join(cards)+'''</div><button class="utility" id="reviewGeneral" disabled>Menú general</button><p style="font-size:14px">Obre aquest fitxer en un navegador. Per canviar d’activitat, prem «Dues activitats». Les veus disponibles depenen del navegador i de la configuració de so.</p></section><button id="reviewBack" hidden>Dues activitats</button>
<script>
(()=>{
 const panel=document.getElementById('review'),back=document.getElementById('reviewBack');
 const ready=setInterval(()=>{if(!window.LT)return;clearInterval(ready);document.querySelectorAll('#review button').forEach(b=>b.disabled=false);document.getElementById('reviewStatus').textContent=' A punt per jugar.';},100);
 const hide=()=>{panel.hidden=true;back.hidden=false;document.getElementById('c').focus()};
 document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{const {App,Games,GameScene,Profiles}=window.LT;App.setScene(new GameScene(Games.byId[+b.dataset.game],+document.getElementById('reviewLevel').value,Profiles.cur||Profiles.list[0]||Profiles.add('Prova',0,1),{skipDemo:true}));hide()});
 document.getElementById('reviewGeneral').onclick=()=>{window.LT.App.setScene(new TitleScene());hide()};
 back.onclick=()=>{const s=window.LT.App.scene;if(s instanceof window.LT.GameScene&&s.state==='play')s.onKey('Escape');panel.hidden=false;back.hidden=true;document.querySelector('.choice').focus()};
})();
</script>'''
s=out.read_text();out.write_text(s.replace('</body>',extra+'\n</body>'))
print('Review copy:',out)
