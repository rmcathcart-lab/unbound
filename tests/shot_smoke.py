# Smoke test: title -> hero -> tutorial skip -> map -> Hollow Fields -> fight each creature -> boss. Screenshots to shots/.
import os, sys, http.server, threading, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(__file__), '..', 'dist', 'web'); OUT = os.path.join(os.path.dirname(__file__), '..', 'shots'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
H = functools.partial(Q, directory=ROOT)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8811), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1366, 'height': 820})
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' and 'net::' not in m.text and 'mathlive' not in m.text.lower() else None)
    pg.add_init_script('window.LOREBOUND_DEBUG = true;')
    pg.goto('http://127.0.0.1:8811/'); pg.wait_for_timeout(1500); pg.screenshot(path=OUT + '/01_title.png')
    pg.fill('#player-name', 'Test Student')
    if pg.locator('#class-code').count(): pg.fill('#class-code', 'SMOKE')
    pg.click('text=Enter the world'); pg.wait_for_timeout(800)
    pg.fill('#hero-name', 'Tester'); pg.screenshot(path=OUT + '/02_hero.png'); pg.click('text=Set forth'); pg.wait_for_timeout(2500)
    pg.screenshot(path=OUT + '/03_tutorial.png')
    if pg.locator('.tc-skip').count(): pg.click('.tc-skip'); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '/04_after_skip.png')
    pg.evaluate("Lorebound.go('map')"); pg.wait_for_timeout(1500); pg.screenshot(path=OUT + '/05_map.png')
    pg.locator('.mnode[data-land="L1"]').first.dispatch_event('click'); pg.wait_for_timeout(600)
    if pg.locator('.mnode[data-land="L1"]').count(): pg.locator('.mnode[data-land="L1"]').first.dispatch_event('click')
    pg.wait_for_timeout(1200); pg.screenshot(path=OUT + '/06a_splash.png'); pg.wait_for_timeout(3500)
    pg.screenshot(path=OUT + '/06_land.png')
    for i in range(6):
        pg.evaluate(f"Lorebound.fight({i}, 'hero')"); pg.wait_for_timeout(1400)
        q = pg.evaluate("(function(){var B=Lorebound.battle();return B&&B.qs?B.qs[B.i]:null})()")
        pg.screenshot(path=OUT + f'/07_fight{i}.png')
        if q: errs.append('Q%d %s | %s' % (i, q.get('key'), q['answers'][0]))
        pg.keyboard.press('Escape'); pg.evaluate("Lorebound.go('world')") if False else None
    pg.evaluate("Lorebound.fightBoss()"); pg.wait_for_timeout(1500); pg.screenshot(path=OUT + '/08_boss.png')
    b.close()
srv.shutdown(); print('\n'.join(errs) or 'no errors')
