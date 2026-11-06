"""Pack ChatGPT's tiered level medallions (second edition, levels 1-30) for the Legacy page.

Usage: python3 tools/pack_medallions.py <lorebound-level-medallions-v2 folder>
Writes src/art/ui-medal-01.webp ... ui-medal-30.webp (numbered fronts) and ui-medal-back-<tier>.webp (the six
reverses: wanderer, delver, pathfinder, warden, lorekeeper, mythic) at PX square, from the 512-px stills.
The turn itself (cylinder edge, glow) is drawn by src/medallions.js, the pack's runtime."""
import sys, os
from PIL import Image
P = sys.argv[1]; PX = 320
def put(src, name):
    im = Image.open(src).convert('RGBA').resize((PX, PX), Image.LANCZOS)
    im.save(f'src/art/{name}.webp', 'WEBP', quality=84, alpha_quality=85, method=6); return os.path.getsize(f'src/art/{name}.webp')
tot = 0
for t in ['wanderer', 'delver', 'pathfinder', 'warden', 'lorekeeper', 'mythic']: tot += put(f'{P}/art/{t}-back.png', f'ui-medal-back-{t}')
for n in range(1, 31): tot += put(f'{P}/static/level-{n:02d}.png', f'ui-medal-{n:02d}')
if os.path.exists('src/art/ui-medal-back.webp'): os.remove('src/art/ui-medal-back.webp')  # first edition's single reverse
print('medallions', tot // 1024, 'KB')
