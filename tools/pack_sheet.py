"""Pack a generated 4x6 sprite sheet (rows idle/walk/attack/death, flat grey background) into a Lorebound cr-*.webp strip + def.
usage: python3 pack_sheet.py sheet.png name out_dir [packed_idle_height=96] [logical_idle_height=26]"""
import sys, json, io
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
FLY = next((float(a.split('=')[1]) for a in sys.argv if a.startswith('--fly=')), 0.0)
# --anims=name:fps:loop,...  one per sheet row (default: the creature rows idle/walk/attack/death)
ANIMS = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--anims=')), 'idle:6:1,walk:9:1,attack:10:0,death:8:0')
ANIMS = [(x.split(':')[0], int(x.split(':')[1]), x.split(':')[2] == '1') for x in ANIMS.split(',')]
NR = len(ANIMS)
# --blobs: cut frames along each figure's own outline (connected pixels) instead of by columns, for sheets where a prop
#   (a lantern on a pole, a spell) reaches past the even spacing into the next frame's column
BLOBS = '--blobs' in sys.argv
# --counts=6,8  frames per row when rows legitimately differ (otherwise every row is cut to the most common count)
COUNTS = next(([int(v) for v in a.split('=')[1].split(',')] for a in sys.argv if a.startswith('--counts=')), None)
sys.argv = [a for a in sys.argv if not a.startswith('--')]
src, name, out = sys.argv[1], sys.argv[2], sys.argv[3]
TH = float(sys.argv[4]) if len(sys.argv) > 4 else 96
LH = float(sys.argv[5]) if len(sys.argv) > 5 else TH * 0.27083
im = Image.open(src).convert('RGB'); A = np.array(im).astype(np.int16)
H, W, _ = A.shape
bg = np.median(np.concatenate([A[:4].reshape(-1, 3), A[-4:].reshape(-1, 3), A[:, :4].reshape(-1, 3), A[:, -4:].reshape(-1, 3)]), axis=0)
GREEN = bg[1] > bg[0] + 60 and bg[1] > bg[2] + 60
if GREEN:
    # chroma key: how much greener than red/blue a pixel is decides how much of the backdrop it holds
    gness = A[..., 1] - np.maximum(A[..., 0], A[..., 2])
    alpha = 1 - np.clip((gness - 18) / 70.0, 0, 1)
    a3 = np.maximum(alpha, 0.05)[..., None]
    rgb = np.clip((A.astype(float) - bg * (1 - a3)) / a3, 0, 255)   # un-mix the green from part-transparent pixels (glows, hair)
    R_, B_ = rgb[..., 0], rgb[..., 2]
    # despill: no green fringe, and glows that came out lemon-green over the screen are pulled back to gold
    rgb[..., 1] = np.minimum(rgb[..., 1], np.maximum(B_, 0.85 * R_ + 0.15 * B_) + 6)
else:
    diff = np.abs(A - bg).max(axis=2); sat = A.max(axis=2) - A.min(axis=2); lum = A.mean(axis=2)
    alpha = np.clip((diff - 12) / 22.0, 0, 1)
    greyish = (sat < 14) & (np.abs(lum - bg.mean()) < 34)
    alpha = np.where(greyish, alpha * 0.3, alpha)
    rgb = A.astype(float); a3 = np.maximum(alpha, 0.05)[..., None]
    rgb = np.clip((rgb - bg * (1 - a3)) / a3, 0, 255)     # un-mix the grey backdrop from part-transparent edge pixels
# clean edges: drop faint specks, pull the edge in by a pixel, and darken what is left of the rim so no light halo shows on dark ground
alpha = np.array(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))) / 255.0
alpha = np.where(alpha < 0.28, 0, alpha)
inner = ndi.grey_erosion(alpha, size=(3, 3))
alpha = np.minimum(alpha, inner * 0.6 + alpha * 0.4)
rim = (alpha > 0) & (alpha < 0.95)
rgb = np.where(rim[..., None], rgb * 0.72, rgb)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)

def runs(v, gap, thr):
    on = v > thr; out = []; i = 0; n = len(v)
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]: j += 1
            out.append([i, j]); i = j
        else: i += 1
    merged = []
    for r in out:
        if merged and r[0] - merged[-1][1] < gap: merged[-1][1] = r[1]
        else: merged.append(r)
    return merged
M = alpha > 0.16
rows = runs(M.sum(axis=1), 6, 2)
rows = [r for r in rows if r[1] - r[0] > 25]
if len(rows) != NR:
    print('rows found', len(rows), '-> using equal bands'); rows = [[round(i * H / NR), round((i + 1) * H / NR)] for i in range(NR)]
frames_src = []   # (row, x0, y0, x1, y1)
band_cols = []
for ri_, (y0, y1) in enumerate(rows):
    cols = runs(M[y0:y1].sum(axis=0), 10, 1)
    widths = sorted(c[1] - c[0] for c in cols); med = widths[len(widths) // 2]
    # fold slivers (flying straw, dust) into their nearest neighbour
    changed = True
    while changed and len(cols) > 1:
        changed = False
        for k, c in enumerate(cols):
            if c[1] - c[0] < 0.3 * med:
                if k == 0: j = 1
                elif k == len(cols) - 1: j = k - 1
                else: j = k - 1 if c[0] - cols[k - 1][1] < cols[k + 1][0] - c[1] else k + 1
                cols[j] = [min(cols[j][0], c[0]), max(cols[j][1], c[1])]; del cols[k]; changed = True; break
    band_cols.append((ri_, y0, y1, cols))
from collections import Counter
expect = Counter(len(b[3]) for b in band_cols).most_common(1)[0][0]
normw = sorted(c[1] - c[0] for b in band_cols if len(b[3]) == expect for c in b[3]); normw = normw[len(normw) // 2]
blobmask = {}
if BLOBS:
    band_cols = []
    for ri_, (y0, y1) in enumerate(rows):
        lab, n = ndi.label(ndi.binary_dilation(M[y0:y1], iterations=3)); sz = ndi.sum(M[y0:y1], lab, range(1, n + 1))
        want = COUNTS[ri_] if COUNTS else n; objs = ndi.find_objects(lab)
        keep = sorted(sorted(range(1, n + 1), key=lambda k: -sz[k - 1])[:want], key=lambda k: objs[k - 1][1].start)
        own = {k: lab == k for k in keep}
        dist = {k: ndi.distance_transform_edt(~own[k]) for k in keep}
        for j in range(1, n + 1):   # loose pieces (a lantern on a keyed-away chain) join the nearest figure
            if j in own or sz[j - 1] < 150: continue
            cy, cx = ndi.center_of_mass(lab == j); best = min(keep, key=lambda k: dist[k][int(cy), int(cx)])
            if dist[best][int(cy), int(cx)] < 120: own[best] = own[best] | (lab == j)
        cols = []
        for k in keep:
            ys_, xs_ = np.where(own[k]); cols.append([xs_.min(), xs_.max() + 1])
            blobmask[(ri_, xs_.min())] = (y0, own[k])
        band_cols.append((ri_, y0, y1, cols))
for ri_, y0, y1, cols in band_cols:
    if BLOBS: [frames_src.append((ri_, c[0], y0, c[1], y1)) for c in cols]; continue
    if COUNTS: expect = COUNTS[ri_]
    if len(cols) != expect or max(c[1] - c[0] for c in cols) > 1.6 * normw:
        # frames touch (spell beams, dust trails): the generator spaces frames evenly, so cut at the emptiest
        # column near each equal division of the inked span
        proj = M[y0:y1].sum(axis=0).astype(float); first, last = cols[0][0], cols[-1][1]; pitch = (last - first) / expect
        cuts = [first]
        for j in range(1, expect):
            mid = first + pitch * j; lo, hi = int(mid - pitch * 0.3), int(mid + pitch * 0.3)
            cuts.append(lo + int(np.argmin(proj[lo:hi])))
        cuts.append(last); cols = [[cuts[i], cuts[i + 1]] for i in range(expect)]
    for c in cols: frames_src.append((ri_, c[0], y0, c[1], y1))
counts = [sum(1 for f in frames_src if f[0] == r) for r in range(NR)]
print('frames per row', counts)
def clean(cell):
    m = cell[..., 3] > 40
    lab, n = ndi.label(ndi.binary_dilation(m, iterations=3))
    if n == 0: return cell
    sizes = ndi.sum(m, lab, range(1, n + 1)); main = int(np.argmax(sizes)) + 1
    near = ndi.binary_dilation(lab == main, iterations=14); keep = np.zeros_like(m)
    for k in range(1, n + 1):
        comp = lab == k
        if k == main or (sizes[k - 1] > 25 and (comp & near).any()): keep |= comp
    cell[..., 3] = np.where(keep, cell[..., 3], 0)
    return cell
tiles = []
for r, x0, y0, x1, y1 in frames_src:
    pad = 4; X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    cell = rgba[Y0:Y1, X0:X1].copy()
    if BLOBS:   # only this figure's own pixels (a neighbour's lantern or staff may poke into the box)
        by0, bm = blobmask[(r, x0)]; full = np.zeros((H, W), bool); full[by0:by0 + bm.shape[0]] = bm
        cell[..., 3] = np.where(full[Y0:Y1, X0:X1], cell[..., 3], 0)
    else: cell = clean(cell)
    m = cell[..., 3] > 40
    ys, xs = np.where(m); bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    tiles.append(dict(r=r, cell=cell, bb=(bx0, by0, bx1, by1)))
ih = np.median([t['bb'][3] - t['bb'][1] for t in tiles if t['r'] == 0]); s = TH / ih
for t in tiles:
    bx0, by0, bx1, by1 = t['bb']; m = t['cell'][..., 3] > 40
    band = m[max(by0, by1 - int(0.12 * ih)):by1]; ys, xs = np.where(band)
    t['foot'] = xs.mean() if len(xs) else (bx0 + bx1) / 2; t['base'] = by1
    if FLY and t['r'] < min(3, NR): t['foot'] = (bx0 + bx1) / 2; t['base'] = by1 + FLY * ih
# rows 2-3 (attack, death): keep the first frame's foot offset from the body's left edge stable by using each frame's own foot
packed = []
for t in tiles:
    bx0, by0, bx1, by1 = t['bb']; pad = 2
    x0, y0 = max(0, bx0 - pad), max(0, by0 - pad)
    crop = Image.fromarray(t['cell'][y0:by1 + pad, x0:bx1 + pad], 'RGBA')
    sm = crop.resize((max(1, round(crop.width * s)), max(1, round(crop.height * s))), Image.LANCZOS)
    packed.append((sm, (t['foot'] - x0) * s, (t['base'] - y0) * s))
Wt = sum(p[0].width + 2 for p in packed); Ht = max(p[0].height for p in packed)
atlas = Image.new('RGBA', (Wt, Ht), (0, 0, 0, 0)); frames = []; x = 0
for sm, ax, ay in packed:
    atlas.paste(sm, (x, 0)); frames.append([x, 0, sm.width, sm.height, round(ax, 1), round(ay, 1)]); x += sm.width + 2
b = io.BytesIO(); atlas.save(b, 'WEBP', quality=84, alpha_quality=80, method=6)
open(f'{out}/cr-{name}.webp', 'wb').write(b.getvalue())
idx = {}; k = 0
for r in range(NR): idx[r] = list(range(k, k + counts[r])); k += counts[r]
d = {'scale': round(LH / TH, 5), 'frames': frames, 'anims': {nm: {'frames': idx[r], 'fps': fps, 'loop': lp} for r, (nm, fps, lp) in enumerate(ANIMS)}, 'label': name}
json.dump(d, open(f'{out}/{name}.json', 'w'), separators=(',', ':'))
print(name, 'scale', round(s, 3), 'atlas', atlas.size, len(b.getvalue()) // 1024, 'KB')
