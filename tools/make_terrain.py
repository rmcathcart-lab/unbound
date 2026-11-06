"""Build a land's painted terrain set from four generated textures + a prop sheet (Canva), in the format pack_terrain.py writes.
   usage: python3 tools/make_terrain.py <land N> <label> <ground.png> <thicket.png> <path.png> <liquid.png> <props.png> "<prop labels, | separated>"
   out: src/art/tr-l<N>.webp (24 x 64-px tiles: 4 ground, path, 3 liquid frames, 16 thicket edges by N=1|E=2|S=4|W=8 mask),
        src/art/tr-l<N>-props.webp, and the L<N> entry of src/terrain_defs.js (other lands kept)."""
import sys, io, json, os
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from scipy import ndimage as ndi
N, LABEL, GROUND, THICK, PATH, LIQ, PROPS, PLABELS = sys.argv[1], sys.argv[2], *sys.argv[3:8], sys.argv[8].split('|')
T = 64; rng = np.random.default_rng(int(N) * 7919)

def seamless(path, crop=520, out=T * 4, bright=1.0):
    im = Image.open(path).convert('RGB'); w, h = im.size
    x0, y0 = (w - crop) // 2, (h - crop) // 2
    a = np.array(im.crop((x0, y0, x0 + crop, y0 + crop))).astype(float)
    b = np.roll(np.roll(a, crop // 2, 0), crop // 2, 1)
    yy, xx = np.mgrid[0:crop, 0:crop]; d = np.minimum(np.minimum(xx, crop - 1 - xx), np.minimum(yy, crop - 1 - yy)) / (crop / 2)
    m = np.clip(d * 1.6, 0, 1)[..., None]
    c = Image.fromarray((m * a + (1 - m) * b).clip(0, 255).astype(np.uint8)).resize((out, out), Image.LANCZOS)
    return ImageEnhance.Brightness(c).enhance(bright)

def tiles_from(sm, n, rot=True):
    """n 64-px tiles from a seamless 256 texture: each is the whole texture shrunk (so it tiles), rotated for variety"""
    base = sm.resize((T, T), Image.LANCZOS); out = []
    for i in range(n): out.append(base.rotate(90 * (i % 4)) if rot else base)
    return out

ground = seamless(GROUND, crop=300, bright=1.15); thick = seamless(THICK, crop=260, bright=1.9); path = seamless(PATH, crop=300, bright=1.1); liq = seamless(LIQ, crop=360, bright=1.15)
G = tiles_from(ground, 4)
P = tiles_from(path, 1)[0]
lq = liq.resize((T, T), Image.LANCZOS); L = []
for i in range(3):   # drifting water: roll the seamless tile a little each frame
    arr = np.array(lq); L.append(Image.fromarray(np.roll(np.roll(arr, i * 7, 1), i * 3, 0)))
TH = thick.resize((T, T), Image.LANCZOS)
gtile = np.array(G[0]).astype(float); tarr = np.array(TH).astype(float)
def edge_tile(mask):
    """thicket; on every side whose neighbour is open, a ragged lip of field stubble and a dark shadow line"""
    a = tarr.copy(); yy, xx = np.mgrid[0:T, 0:T]
    noise = ndi.gaussian_filter(rng.random((T, T)), 1.4); noise = (noise - noise.min()) / (noise.max() - noise.min())
    open_d = np.full((T, T), 99.0)
    if not mask & 1: open_d = np.minimum(open_d, yy)
    if not mask & 2: open_d = np.minimum(open_d, T - 1 - xx)
    if not mask & 4: open_d = np.minimum(open_d, T - 1 - yy)
    if not mask & 8: open_d = np.minimum(open_d, xx)
    lip = open_d < (5 + 5 * noise)                     # ragged stubble at the lip
    shade = np.clip(1 - np.abs(open_d - (8 + 5 * noise)) / 4, 0, 1) * 0.45   # shadow just inside the stalks
    a = np.where(lip[..., None], gtile * 0.9, a * (1 - shade[..., None]))
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))
E = [edge_tile(m) for m in range(16)]
tiles = G + [P] + L + E    # 0-3 ground, 4 path, 5-7 liquid, 8-23 edges
sheet = Image.new('RGB', (6 * T, 4 * T)); frames = []
for i, t in enumerate(tiles):
    x, y = (i % 6) * T, (i // 6) * T; sheet.paste(t, (x, y)); frames.append([x, y, T, T])
b = io.BytesIO(); sheet.save(b, 'WEBP', quality=88, method=6); open(f'src/art/tr-l{N}.webp', 'wb').write(b.getvalue())

# props: 8 objects on a flat grey sheet, found as blobs
K = 4.0
im = Image.open(PROPS).convert('RGB'); A = np.array(im).astype(int)
bg = np.median(np.concatenate([A[:4].reshape(-1, 3), A[-4:].reshape(-1, 3)]), axis=0)
diff = np.abs(A - bg).max(axis=2); sat = A.max(axis=2) - A.min(axis=2)
alpha = np.clip((diff - 10) / 22.0, 0, 1); alpha = np.where((sat < 12) & (np.abs(A.mean(axis=2) - bg.mean()) < 30), alpha * 0.3, alpha)
rgb = np.clip((A - bg * (1 - np.maximum(alpha, 1e-3)[..., None])) / np.maximum(alpha, 1e-3)[..., None], 0, 255)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
lab, n = ndi.label(ndi.binary_dilation(alpha > 0.16, iterations=6)); sizes = ndi.sum(alpha > 0.16, lab, range(1, n + 1))
big = sorted([k + 1 for k in range(n) if sizes[k] > 3000], key=lambda k: (round(ndi.center_of_mass(lab == k)[0] / 300), ndi.center_of_mass(lab == k)[1]))
BIG = ('tree', 'scarecrow', 'stump', 'windmill'); SMALL = ('fence', 'bucket', 'sheaf', 'skull'); FLAT = ('millstone', 'sheaf', 'skull')
items = []
for i, k in enumerate(big[:len(PLABELS)]):
    m = lab == k; ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    c = rgba[y0:y1, x0:x1].copy(); c[..., 3] = np.where(m[y0:y1, x0:x1], c[..., 3], 0)
    c = Image.fromarray(c, 'RGBA'); bb = c.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); c = c.crop(bb)
    labl = PLABELS[i].lower(); size = 34 if any(w in labl for w in BIG) else 20 if any(w in labl for w in SMALL) else 26
    s = size * K / max(c.width, c.height); c2 = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
    items.append((c2, c2.width / 2, c2.height * 0.97, labl, any(w in labl for w in FLAT)))
W = sum(i[0].width + 2 for i in items); H = max(i[0].height for i in items); at = Image.new('RGBA', (W, H)); x = 0; props = []
for c2, ax, ay, labl, flat in items:
    at.paste(c2, (x, 0)); props.append({'f': [x, 0, c2.width, c2.height, round(ax, 1), round(ay, 1)], 'label': labl, 'flat': flat, 'water': False}); x += c2.width + 2
b2 = io.BytesIO(); at.save(b2, 'WEBP', quality=82, alpha_quality=70, method=6); open(f'src/art/tr-l{N}-props.webp', 'wb').write(b2.getvalue())

defs = {}
if os.path.exists('src/terrain_defs.js'):
    txt = open('src/terrain_defs.js').read(); defs = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
defs[f'L{N}'] = {'label': LABEL, 'tile': T, 'frames': frames, 'ground': [0, 1, 2, 3], 'path': 4, 'liquid': [5, 6, 7], 'liquidKind': 'water', 'liquidFps': 3,
                 'edgeByMask': {m: 8 + m for m in range(16)}, 'propScale': 1 / K, 'props': props}
open('src/terrain_defs.js', 'w').write('/* Painted terrain per land (tools/make_terrain.py from Canva textures). Tiles: 64-px frames drawn as one 16-px logical tile. Edges: edgeByMask[N=1|E=2|S=4|W=8]. Props: f = [x, y, w, h, anchorX, anchorY]. */\nvar TERRAIN_DEFS = ' + json.dumps(defs, separators=(',', ':')) + ';\n')
print('tiles', len(b.getvalue()) // 1024, 'KB; props', [p['label'] for p in props], len(b2.getvalue()) // 1024, 'KB')
