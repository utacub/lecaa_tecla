#!/usr/bin/env python3
"""Import unchanged, active isolated recordings from pinned LECAA checkouts."""
import base64, hashlib, json, re, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def constant(text,name):
    m=re.search(r'const\s+'+re.escape(name)+r'\s*=\s*',text)
    if not m: raise ValueError(name)
    return json.JSONDecoder().raw_decode(text[m.end():])[0]
def main(ca,es):
    out=ROOT/'assets/sons/phonemes';out.mkdir(parents=True,exist_ok=True)
    manifest={'schema':1,'sources':{},'languages':{},'files':{}}
    def add(src,root,start,end,origin):
        if src.startswith('data:'):
            header,data=src.split(',',1);mime=header[5:].split(';')[0];raw=base64.b64decode(data,validate=True);ext={'audio/mpeg':'mp3','audio/wav':'wav'}[mime]
        else:
            file=root/src;raw=file.read_bytes();ext=file.suffix[1:];mime={'mp3':'audio/mpeg','wav':'audio/wav'}[ext]
        assert raw and 0<=start<end
        digest=hashlib.sha256(raw).hexdigest();name=digest+'.'+ext
        (out/name).write_bytes(raw)
        manifest['files'][name]={'sha256':digest,'bytes':len(raw),'mime':mime}
        return {'file':name,'start':start,'end':end,'origin':origin}
    for lang,root in [('ca',Path(ca)),('es',Path(es))]:
        text=(root/'index.html').read_text();commit=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
        manifest['sources'][lang]={'repository':'utacub/lecaa'+('_cast' if lang=='es' else ''),'commit':commit,'path':'index.html'}
        if lang=='ca':
            bank=constant(text,'AUDIO_BANK');mapping=constant(text,'ISOLATED_PHONEME_BLOCKS');sounds=constant(text,'ISOLATED_SOUND_BLOCKS');reverse={block.removeprefix('isolated-'):ph for ph,block in mapping.items()}
            voices={}
            for voice in ['anna','jordi']:
                voices[voice]={}
                for ph,block in mapping.items():
                    b=bank[voice][block];item=b['items'][0]
                    voices[voice][ph]=add(b['src'],root,item['start'],item['end'],{'block':block,'voice':voice,'source':b['src']})
            manifest['languages'][lang]={'defaultVoice':'anna','voices':voices,'graphemes':{g:reverse[n] for g,n in sounds.items()}}
        else:
            bank=constant(text,'CAST_AUDIO');data=constant(text,'CAST_DATA');clips={}
            for e in bank['entries']:
                if e['category']!='phoneme':continue
                v=e['voices']['female'];assert v['approved'] is True
                clips[e['id'].removeprefix('phoneme.')]=add(v['src'],root,v['start'],v['end'],{'id':e['id'],'version':v.get('version'),'status':v.get('status'),'source':v.get('importSource') or v.get('origin')})
            manifest['languages'][lang]={'defaultVoice':'female','voices':{'female':clips},'graphemes':dict(zip(data['forms'],data['phones']))}
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'clips':{lang:{v:len(c) for v,c in b['voices'].items()} for lang,b in manifest['languages'].items()},'uniqueFiles':len(manifest['files'])}))
if __name__=='__main__':main(*sys.argv[1:])
