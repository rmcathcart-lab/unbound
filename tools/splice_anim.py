"""Replace one animation of a packed sprite with the frames of another packed sprite (same logical size).
usage: python3 tools/splice_anim.py <dir> <base name> <donor name> <anim> [fps]
Both were written by pack_sheet.py into <dir> (cr-<name>.webp + <name>.json). The donor's frames are rescaled to the
base's scale, appended to the base atlas, and the base's <anim> points at them. Writes the base files in place."""
import sys, json, io
from PIL import Image
d, base, donor, anim = sys.argv[1:5]; fps = int(sys.argv[5]) if len(sys.argv) > 5 else None
B = json.load(open(f'{d}/{base}.json')); D = json.load(open(f'{d}/{donor}.json'))
A = Image.open(f'{d}/cr-{base}.webp').convert('RGBA'); DA = Image.open(f'{d}/cr-{donor}.webp').convert('RGBA')
k = D['scale'] / B['scale']   # donor packed px -> base packed px, so both draw at the same logical size
x = A.width + 2; add = []
for f in D['frames']:
    c = DA.crop((f[0], f[1], f[0] + f[2], f[1] + f[3]))
    c = c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS)
    add.append((c, x, round(f[4] * k, 1), round(f[5] * k, 1))); x += c.width + 2
H = max(A.height, max(c.height for c, *_ in add))
out = Image.new('RGBA', (x, H), (0, 0, 0, 0)); out.paste(A, (0, 0))
n0 = len(B['frames'])
for c, cx, ax, ay in add: out.paste(c, (cx, 0)); B['frames'].append([cx, 0, c.width, c.height, ax, ay])
src = D['anims'][next(iter(D['anims']))]
B['anims'][anim] = {'frames': [n0 + i for i in src['frames']], 'fps': fps or src['fps'], 'loop': True}
b = io.BytesIO(); out.save(b, 'WEBP', quality=84, alpha_quality=80, method=6); open(f'{d}/cr-{base}.webp', 'wb').write(b.getvalue())
json.dump(B, open(f'{d}/{base}.json', 'w'), separators=(',', ':'))
print(base, '<-', donor, anim, len(add), 'frames; atlas', out.size, len(b.getvalue()) // 1024, 'KB')
