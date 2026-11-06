"""Pack a one-sheet animated (or multi-state) world prop as an actor, the same way as the bonfire.
   Usage: python3 tools/pack_anim_prop.py <pack folder> <name> <logical height> [packed px per logical px]
   Reads <pack>/metadata/<name>.json + its sheet; writes src/art/cr-<name>.webp and merges a '<name>' entry
   into src/creature_defs.js, drawn with SP.actor('cr:<name>'). Every animation in the metadata is kept
   (e.g. brazier: idle; gate11: sealed / open). Frames are trimmed; ground anchors are preserved."""
import json, sys, io
from PIL import Image
P, NAME = sys.argv[1], sys.argv[2]; LH = float(sys.argv[3]); PX = float(sys.argv[4]) if len(sys.argv) > 4 else 5
m = json.load(open(f'{P}/metadata/{NAME}.json')); sheet = Image.open(f"{P}/{m['sheet']}").convert('RGBA')
crops = []
for fr in m['frames']:
    r = fr['rect']; c = sheet.crop((r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h']))
    bb = c.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox(); crops.append((c.crop(bb), fr['anchor']['x'] - bb[0], fr['anchor']['y'] - bb[1]))
body = max(c[0].height for c in crops); s = LH * PX / body
tiles = [(c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS), ax * s, ay * s) for c, ax, ay in crops]
W = sum(t[0].width + 2 for t in tiles); H = max(t[0].height for t in tiles); at = Image.new('RGBA', (W, H)); out = []; x = 0
for im, ax, ay in tiles: at.paste(im, (x, 0)); out.append([x, 0, im.width, im.height, round(ax, 1), round(ay, 1)]); x += im.width + 2
b = io.BytesIO(); at.save(b, 'WEBP', quality=86, alpha_quality=70, method=6); open(f'src/art/cr-{NAME}.webp', 'wb').write(b.getvalue())
txt = open('src/creature_defs.js').read(); defs = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
defs[NAME] = {'scale': round(1 / PX, 5), 'frames': out, 'anims': {k: {'frames': a['frames'], 'fps': a.get('fps', 1), 'loop': a.get('loop', True)} for k, a in m['animations'].items()}, 'label': m.get('label', NAME)}
open('src/creature_defs.js', 'w').write(txt[:txt.index('{')] + json.dumps(defs, separators=(',', ':')) + ';\n')
print(NAME, at.size, len(b.getvalue()) // 1024, 'KB', 'anims', list(m['animations']))
