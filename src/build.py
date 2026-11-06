import re, base64, os, pathlib
K='/home/claude/.npm-global/lib/node_modules/markdownlint-cli2/node_modules/katex/dist'
css=open(K+'/katex.min.css').read()
def datauri(m):
    name=m.group(1)
    b=base64.b64encode(open(f'{K}/fonts/{name}.woff2','rb').read()).decode()
    return f'src:url(data:font/woff2;base64,{b}) format("woff2")'
css=re.sub(r'src:url\(fonts/([A-Za-z0-9_-]+)\.woff2\) format\("woff2"\),url\(fonts/[A-Za-z0-9_-]+\.woff\) format\("woff"\),url\(fonts/[A-Za-z0-9_-]+\.ttf\) format\("truetype"\)', datauri, css)
assert 'fonts/' not in css, 'font refs remain'
src=lambda f: open('src/'+f).read()
def js(f): return src(f).replace('</script','<\\/script')
from PIL import Image, ImageFilter
import io
ART={}
for f in sorted(os.listdir('src/art')):
    if not f.lower().endswith(('.jpg','.jpeg','.png','.webp')): continue
    key=os.path.splitext(f)[0]
    if key.startswith('sheet-'):   # pixel-art sprite sheets: lossless PNG, untouched
        raw=open('src/art/'+f,'rb').read(); ART[key]='data:image/png;base64,'+base64.b64encode(raw).decode(); print('sheet',key,len(raw)//1024,'KB'); continue
    im=Image.open('src/art/'+f).convert('RGB')
    maxw=1400 if (key=='title' or key.startswith('banner') or key=='map') else 480
    if im.width<maxw*0.6:   # tiny preview: upscale smoothly so it survives 2x screens
        im=im.resize((im.width*2, im.height*2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    if im.width>maxw: im=im.resize((maxw, round(im.height*maxw/im.width)), Image.LANCZOS)
    buf=io.BytesIO(); im.save(buf,'JPEG',quality=84,optimize=True)
    ART[key]='data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode()
    print('art',key,im.size,len(buf.getvalue())//1024,'KB')
import json
art_js='var ART_IMG = '+json.dumps(ART)+';'
html=src('index.html')
html=html.replace('/*KATEX_CSS*/',css).replace('/*GAME_CSS*/',src('style.css'))
html=html.replace('/*KATEX_JS*/',open(K+'/katex.min.js').read()).replace('/*AUTORENDER_JS*/',open(K+'/contrib/auto-render.min.js').read())
for tag,f in [('CHECKER_JS','checker.js'),('GRADER_JS','grader.js'),('CONFIG_JS','config.js'),('LEDGER_JS','ledger.js'),('SOUND_JS','sound.js'),('FIGURES_JS','figures.js'),('QUESTIONS_JS','questions.js'),('QUESTIONS_U2_JS','questions_u2.js'),('QUESTIONS_U3_JS','questions_u3.js'),('QUESTIONS_U4_JS','questions_u4.js'),('QUESTIONS_U5_JS','questions_u5.js'),('QUESTIONS_U6_JS','questions_u6.js'),('QUESTIONS_U7_JS','questions_u7.js'),('ART_JS','art.js'),('WORLD_JS','world.js'),('LOREBOOK_JS','lorebook.js'),('MAP_JS','map.js'),('SPRITE_DEFS_JS','sprite_defs.js'),('SPRITES_JS','sprites.js'),('OVERWORLD_JS','overworld.js'),('GAME_JS','game.js')]:
    html=html.replace('/*%s*/'%tag, js(f))
html=html.replace('/*ART_IMG_JS*/', art_js)
os.makedirs('dist',exist_ok=True)
open('dist/lorebound.html','w').write(html)
full='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'+html.split('<link',1)[0]+'<link'+html.split('<link',1)[1].split('</style>',1)[0]+'</style></head><body>'+html.split('</style>',1)[1]+'</body></html>'
open('dist/Lorebound - standalone.html','w').write(full)
print('artifact bytes', len(html), 'standalone bytes', len(full))
