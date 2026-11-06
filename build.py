import re, base64, os, pathlib
K='/opt/npm-tools/node_modules/katex/dist'
css=open(K+'/katex.min.css').read()
def datauri(m):
    name=m.group(1)
    b=base64.b64encode(open(f'{K}/fonts/{name}.woff2','rb').read()).decode()
    return f'src:url(data:font/woff2;base64,{b}) format("woff2")'
css=re.sub(r'src:url\(fonts/([A-Za-z0-9_-]+)\.woff2\) format\("woff2"\),url\(fonts/[A-Za-z0-9_-]+\.woff\) format\("woff"\),url\(fonts/[A-Za-z0-9_-]+\.ttf\) format\("truetype"\)', datauri, css)
assert 'fonts/' not in css, 'font refs remain'
src=lambda f: open('src/'+f).read()
def js(f): return src(f).replace('</script','<\\/script') if os.path.exists('src/'+f) else ''
from PIL import Image, ImageFilter
import io, hashlib, shutil
# Every image is prepared once. The standalone file inlines them all (it must work from a double-click);
# the web build (artifact + GitHub Pages) serves them as separate files under art/, which keeps the page small.
# A few stay inline in the web build too, because the game reads their pixels back from a canvas.
INLINE_ALWAYS = {'sheet-dt', 'sheet-kenney'}
IMGS = {}
for f in sorted(os.listdir('src/art')):
    if not f.lower().endswith(('.jpg','.jpeg','.png','.webp')): continue
    key=os.path.splitext(f)[0]
    if key.startswith(('sheet-', 'cr-', 'tr-', 'ui-', 'wm-')):   # sprite sheets and UI icons: packed already, untouched (keeps transparency)
        raw=open('src/art/'+f,'rb').read(); ext='webp' if f.endswith('.webp') else 'png'; IMGS[key]=(raw, 'image/'+ext, ext); print('sheet',key,len(raw)//1024,'KB'); continue
    im=Image.open('src/art/'+f).convert('RGB')
    maxw=1600 if key.startswith('throne-') else 1400 if (key=='title' or key.startswith('banner') or key=='map') else 1400 if key.startswith('camp-') else 560 if key.startswith(('gear-','item-')) else 560
    if im.width<maxw*0.6:   # tiny preview: upscale smoothly so it survives 2x screens
        im=im.resize((im.width*2, im.height*2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    if im.width>maxw: im=im.resize((maxw, round(im.height*maxw/im.width)), Image.LANCZOS)
    buf=io.BytesIO(); im.save(buf,'JPEG',quality=80,optimize=True,progressive=True)
    IMGS[key]=(buf.getvalue(), 'image/jpeg', 'jpg')
    print('art',key,im.size,len(buf.getvalue())//1024,'KB')
def uri(key): raw, mime, ext = IMGS[key]; return 'data:'+mime+';base64,'+base64.b64encode(raw).decode()
ART = {k: uri(k) for k in IMGS}                                   # standalone: everything inline
WEB = {}                                                          # web: files beside the page
shutil.rmtree('dist/web', ignore_errors=True); os.makedirs('dist/web/art', exist_ok=True)
for k, (raw, mime, ext) in IMGS.items():
    if k in INLINE_ALWAYS: WEB[k] = ART[k]; continue
    open(f'dist/web/art/{k}.{ext}', 'wb').write(raw); WEB[k] = f'art/{k}.{ext}?v=' + hashlib.md5(raw).hexdigest()[:8]
import json
art_js='var ART_IMG = '+json.dumps(ART)+';'
web_js='var ART_IMG = '+json.dumps(WEB)+';'
html=src('index.html')
html=html.replace('/*KATEX_CSS*/',css).replace('/*GAME_CSS*/',src('style.css'))
html=html.replace('/*KATEX_JS*/',open(K+'/katex.min.js').read()).replace('/*AUTORENDER_JS*/',open(K+'/contrib/auto-render.min.js').read())
for tag,f in [('CHECKER_JS','checker.js'),('GRADER_JS','grader.js'),('CONFIG_JS','config.js'),('LEDGER_JS','ledger.js'),('SOUND_JS','sound.js'),('CALC_JS','calc.js'),('FIGURES_JS','figures.js'),('QUESTIONS_JS','questions.js'),('QUESTIONS_U2_JS','questions_u2.js'),('QUESTIONS_U3_JS','questions_u3.js'),('QUESTIONS_U4_JS','questions_u4.js'),('QUESTIONS_U5_JS','questions_u5.js'),('QUESTIONS_U6_JS','questions_u6.js'),('QUESTIONS_U7_JS','questions_u7.js'),('QUESTIONS_U8_JS','questions_u8.js'),('QUESTIONS_U9_JS','questions_u9.js'),('QUESTIONS_U10_JS','questions_u10.js'),('ART_JS','art.js'),('WORLD_JS','world.js'),('LOREBOOK_JS','lorebook.js'),('LOREBOOK_L8_JS','lorebook_l8.js'),('LOREBOOK_L9_JS','lorebook_l9.js'),('LOREBOOK_L10_JS','lorebook_l10.js'),('WORLDMAP_DEFS_JS','worldmap_defs.js'),('MEDALLIONS_JS','medallions.js'),('VICTORY_JS','victory.js'),('MAP_JS','map.js'),('SPRITE_DEFS_JS','sprite_defs.js'),('HD_DEFS_JS','hd_defs.js'),('CREATURE_DEFS_JS','creature_defs.js'),('TERRAIN_DEFS_JS','terrain_defs.js'),('SPRITES_JS','sprites.js'),('LANDS_JS','lands.js'),('OVERWORLD_JS','overworld.js'),('GAME_JS','game.js')]:
    html=html.replace('/*%s*/'%tag, js(f))
os.makedirs('dist',exist_ok=True)
web=html.replace('/*ART_IMG_JS*/', web_js)
open('dist/web/index.html','w').write('<meta charset="utf-8">\n' + web)
# the teacher's bookmark: /ledger/ opens the game straight on the Teacher's Ledger
os.makedirs('dist/web/ledger', exist_ok=True)
open('dist/web/ledger/index.html','w').write('<!doctype html><meta charset="utf-8"><title>Unbound · Teacher\'s Ledger</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=../?ledger"><script>location.replace("../?ledger")</script><a href="../?ledger">Open the Teacher\'s Ledger</a>')
html=html.replace('/*ART_IMG_JS*/', art_js)
open('dist/unbound.html','w').write(html)
full='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'+html.split('<link',1)[0]+'<link'+html.split('<link',1)[1].split('</style>',1)[0]+'</style></head><body>'+html.split('</style>',1)[1]+'</body></html>'
open('dist/Unbound - standalone.html','w').write(full)
print('web page bytes', len(web), 'web art files', len(os.listdir('dist/web/art')), 'art bytes', sum(os.path.getsize('dist/web/art/'+f) for f in os.listdir('dist/web/art')), '| standalone bytes', len(full))
