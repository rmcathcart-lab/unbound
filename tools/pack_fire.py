"""Pack the animated bonfire shrine (Lorebound Bonfire Sprite pack) as a one-animation actor.
   Usage: python3 tools/pack_fire.py <bonfire pack folder> [logical height] [packed px per logical px]
   out: src/art/cr-bonfire.webp + a 'bonfire' entry merged into src/creature_defs.js (drawn with SP.actor('cr:bonfire'))."""
import json, sys, io
from PIL import Image
P = sys.argv[1]; LH = float(sys.argv[2]) if len(sys.argv) > 2 else 38; PX = float(sys.argv[3]) if len(sys.argv) > 3 else 5
m = json.load(open(f'{P}/metadata/fire.json')); sheet = Image.open(f"{P}/{m['sheet']}").convert('RGBA')
crops = []
for fr in m['frames']:
    r = fr['rect']; c = sheet.crop((r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h']))
    bb = c.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox(); crops.append((c.crop(bb), fr['anchor']['x'] - bb[0], fr['anchor']['y'] - bb[1]))
body = max(c[0].height for c in crops); s = LH * PX / body
tiles = [(c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS), ax * s, ay * s) for c, ax, ay in crops]
W = sum(t[0].width + 2 for t in tiles); H = max(t[0].height for t in tiles); at = Image.new('RGBA', (W, H)); out = []; x = 0
for im, ax, ay in tiles: at.paste(im, (x, 0)); out.append([x, 0, im.width, im.height, round(ax, 1), round(ay, 1)]); x += im.width + 2
b = io.BytesIO(); at.save(b, 'WEBP', quality=86, alpha_quality=70, method=6); open('src/art/cr-bonfire.webp', 'wb').write(b.getvalue())
txt = open('src/creature_defs.js').read(); defs = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
an = m['animations']['idle']
defs['bonfire'] = {'scale': round(1 / PX, 5), 'frames': out, 'anims': {'idle': {'frames': an['frames'], 'fps': an['fps'], 'loop': True}}, 'label': m.get('label', 'bonfire')}
open('src/creature_defs.js', 'w').write(txt[:txt.index('{')] + json.dumps(defs, separators=(',', ':')) + ';\n')
print('bonfire', at.size, len(b.getvalue()) // 1024, 'KB')
