"""Find land regions on the painted world map that follow its geography (watershed on colour/texture edges),
   seeded from rough hand polygons. Writes a label image (0 = sea/outside, 1..8 = lands) for make_worldmap.py.
   usage: python3 tools/segment_map.py map.png out_labels.png [preview.png]"""
import sys, json
import numpy as np, cv2
from skimage import segmentation, filters, color, morphology, measure
SRC, OUT = sys.argv[1], sys.argv[2]; DARK = float(sys.argv[4]) if len(sys.argv) > 4 else 16; PREV = sys.argv[3] if len(sys.argv) > 3 else None
ROUGH = json.load(open(__file__.replace('segment_map.py', 'map_regions.json')))
im = cv2.cvtColor(cv2.imread(SRC), cv2.COLOR_BGR2RGB); H, W = im.shape[:2]
lab = color.rgb2lab(cv2.GaussianBlur(im, (0, 0), 3) / 255.0)
# edge strength: colour change (Lab) + texture change (local std of luminance)
grad = sum(filters.sobel(lab[..., c]) for c in range(3))
L = lab[..., 0]; mu = cv2.GaussianBlur(L, (0, 0), 6); tex = np.sqrt(np.maximum(cv2.GaussianBlur(L * L, (0, 0), 6) - mu * mu, 0))
grad = grad / grad.max() + 0.6 * filters.sobel(tex) / filters.sobel(tex).max()
grad = cv2.GaussianBlur(grad, (0, 0), 2)
markers = np.zeros((H, W), np.int32); union = np.zeros((H, W), np.uint8)
for i, r in enumerate(ROUGH, 1):
    P = np.array(r['poly'], np.int32); m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [P], 1); union |= m
    core = cv2.erode(m, np.ones((3, 3), np.uint8), iterations=int(r.get('core', 60)))   # only the heart of each land is certain
    if core.sum() < 400:  # thin lands: a disc at the centroid instead
        ys, xs = np.nonzero(m); core = np.zeros((H, W), np.uint8); cv2.circle(core, (int(xs.mean()), int(ys.mean())), 30, 1, -1)
    markers[core > 0] = i
# outside: far from every rough land, or the dark parchment frame
outside = cv2.dilate(union, np.ones((3, 3), np.uint8), iterations=70) == 0
dark = cv2.GaussianBlur(L, (0, 0), 8) < DARK            # open sea and the void between lands: deep, flat darkness
dark = morphology.opening(dark, morphology.disk(10))
outside |= dark & (markers == 0)
frame = np.zeros((H, W), bool); f = 18; frame[:f] = frame[-f:] = True; frame[:, :f] = frame[:, -f:] = True
markers[outside | frame] = 99
ws = segmentation.watershed(grad, markers)
ws[ws == 99] = 0
# tidy: each land keeps its largest piece, holes filled, edges softened a little
out = np.zeros((H, W), np.uint8)
for i in range(1, len(ROUGH) + 1):
    m = ws == i
    m = morphology.opening(m, morphology.disk(4)); m = morphology.closing(m, morphology.disk(6))
    lb = measure.label(m)
    if lb.max(): m = lb == (np.argmax(np.bincount(lb.flat)[1:]) + 1)
    m = morphology.remove_small_holes(m, max_size=4000)
    out[m & (out == 0)] = i
cv2.imwrite(OUT, out)
if PREV:
    pal = np.array([[0, 0, 0], [230, 160, 40], [240, 240, 240], [120, 200, 255], [200, 80, 80], [180, 120, 255], [90, 220, 120], [255, 120, 200], [255, 230, 90]], np.uint8)
    over = (im * 0.55 + pal[out] * 0.45).astype(np.uint8); over[out == 0] = im[out == 0] // 2
    edges = segmentation.find_boundaries(out); over[edges] = [255, 255, 255]
    cv2.imwrite(PREV, cv2.cvtColor(over, cv2.COLOR_RGB2BGR))
print('areas', [int((out == i).sum()) for i in range(1, len(ROUGH) + 1)])
