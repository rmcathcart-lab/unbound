"""Pack the level-up ritual (ChatGPT "Level-Up Ritual v2" pack) for the Legacy page.

Usage: python3 tools/pack_levelup.py <ritual pack folder> <original hero pack folder>

Also writes src/art/cr-legacy-guide.webp + a 'legacy-guide' entry (idle, cast): the woman who performs the ritual.

For each class and stage writes src/art/cr-hero-<class>-<stage>-lvl.webp: the hero's idle row from the original
3072x2048 sheet plus the eight level-up frames, both at the same high resolution, and merges a
'hero-<class>-<stage>-lvl' entry with anims idle (loop) and levelup (once) into src/creature_defs.js.
Units: one unit = one pixel of the original 512-px cell (the scale is 1 / S), so every hero shares one size.
Frames are trimmed; the shared ground anchor (224, 400) is kept per frame."""
import json, sys, io
from PIL import Image

LV, HERO = sys.argv[1], sys.argv[2]
S = 0.9  # packed px per cell px (sharp on retina at the Legacy page size)
txt = open('src/creature_defs.js').read(); defs = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])


def frames_of(sheet_path, rects_anchors):
    sheet = Image.open(sheet_path).convert('RGBA'); out = []
    for (x, y, w, h), (ax, ay) in rects_anchors:
        c = sheet.crop((x, y, x + w, y + h)); bb = c.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox()
        c = c.crop(bb); out.append((c.resize((max(1, round(c.width * S)), max(1, round(c.height * S))), Image.LANCZOS), (ax - bb[0]) * S, (ay - bb[1]) * S))
    return out


for cls in ['knight', 'sorcerer', 'ranger', 'rogue']:
    for st in [1, 2, 3]:
        hid = f'hero-{cls}-{st}'
        hm = json.load(open(f'{HERO}/metadata/{hid}.json'))
        idle = [hm['frames'][i] for i in hm['animations']['idle']['frames']]
        lm = json.load(open(f'{LV}/metadata/{hid}-levelup.json'))
        ra = lambda fr: ((fr['rect']['x'], fr['rect']['y'], fr['rect']['w'], fr['rect']['h']), (fr['anchor']['x'], fr['anchor']['y']))
        tiles = frames_of(f"{HERO}/{hm['sheet']}", [ra(f) for f in idle]) + frames_of(f"{LV}/{lm['sheet']}", [ra(f) for f in lm['frames']])
        W = sum(t[0].width + 2 for t in tiles); H = max(t[0].height for t in tiles); at = Image.new('RGBA', (W, H)); fr = []; x = 0
        for im, ax, ay in tiles: at.paste(im, (x, 0)); fr.append([x, 0, im.width, im.height, round(ax, 1), round(ay, 1)]); x += im.width + 2
        b = io.BytesIO(); at.save(b, 'WEBP', quality=80, alpha_quality=75, method=6); open(f'src/art/cr-{hid}-lvl.webp', 'wb').write(b.getvalue())
        n = len(idle); la = lm['animations']['levelup']
        defs[hid + '-lvl'] = {'scale': round(1 / S, 5), 'frames': fr, 'label': lm.get('label', hid),
                              'anims': {'idle': {'frames': list(range(n)), 'fps': hm['animations']['idle'].get('fps', 5), 'loop': True},
                                        'levelup': {'frames': [n + i for i in la['frames']], 'fps': la.get('fps', 6), 'loop': False}}}
        print(hid, at.size, len(b.getvalue()) // 1024, 'KB')
gm = json.load(open(f'{LV}/metadata/camp-legacy-cast.json'))
tiles = frames_of(f"{LV}/{gm['sheet']}", [((f['rect']['x'], f['rect']['y'], f['rect']['w'], f['rect']['h']), (f['anchor']['x'], f['anchor']['y'])) for f in gm['frames']])
W = sum(t[0].width + 2 for t in tiles); H = max(t[0].height for t in tiles); at = Image.new('RGBA', (W, H)); fr = []; x = 0
for im, ax, ay in tiles: at.paste(im, (x, 0)); fr.append([x, 0, im.width, im.height, round(ax, 1), round(ay, 1)]); x += im.width + 2
b = io.BytesIO(); at.save(b, 'WEBP', quality=80, alpha_quality=75, method=6); open('src/art/cr-legacy-guide.webp', 'wb').write(b.getvalue())
defs['legacy-guide'] = {'scale': round(1 / S, 5), 'frames': fr, 'label': gm.get('label', 'guide'),
                        'anims': {k: {'frames': a['frames'], 'fps': a.get('fps', 6), 'loop': a.get('loop', False)} for k, a in gm['animations'].items()}}
print('legacy-guide', at.size, len(b.getvalue()) // 1024, 'KB')
open('src/creature_defs.js', 'w').write(txt[:txt.index('{')] + json.dumps(defs, separators=(',', ':')) + ';\n')
