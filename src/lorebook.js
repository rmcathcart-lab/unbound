/* ===================== LOREBOOK =====================
 * The five lost pages of each land. Every page is a scrap of the land's story stitched to a piece of real,
 * usable math for the creatures that live there, laid out as a worked page: headings, display equations,
 * step lists and diagrams. Pages are stored in the hero's Satchel once found.
 *
 * A page is { title, lore, math: [block, ...] } where a block is one of
 *   { h: 'heading' }  { p: 'html with \\(inline\\) math' }  { eq: 'display latex' }  { steps: ['latex', ...] }
 *   { rule: 'display latex' } (boxed key formula)  { fig: '<svg…>' }  { cols: [['head', 'html'], ...] }
 */
var LOREBOOK = (function () {
  /* ---------- tiny SVG kit, in the game palette ---------- */
  var GOLD = '#d6a860', BONE = '#e8dcc0', DIM = '#a89f8c', LORE = '#8fd3ff', INK = '#0d0b0a';
  var F = 'font-family="Helvetica, Arial, sans-serif"';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svg(w, h, inner, label) { return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + esc(label || 'diagram') + '">' + inner + '</svg>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" ' + F + ' font-size="' + (o.size || 15) + '" fill="' + (o.color || BONE) + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.bold ? ' font-weight="700"' : '') + (o.italic ? ' font-style="italic"' : '') + '>' + esc(s) + '</text>'; }
  function line(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.color || GOLD) + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + (o.arrow ? ' marker-end="url(#lb-arrow)"' : '') + '/>'; }
  function rect(x, y, w, h, o) { o = o || {}; return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (o.fill || 'rgba(214,168,96,.08)') + '" stroke="' + (o.stroke || GOLD) + '" stroke-width="' + (o.w || 1.5) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + '/>'; }
  function circ(x, y, r, o) { o = o || {}; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || GOLD) + '" stroke-width="' + (o.w || 1.5) + '"/>'; }
  var ARROW = '<defs><marker id="lb-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="' + GOLD + '"/></marker></defs>';

  /* factor tree: splits = [[360, 2, 180], [180, 2, 90], ...] drawn as a left-leaning tree */
  function factorTree(root, splits) {
    var s = ARROW, x = 60, y = 24, dy = 42; s += txt(x, y, root, { size: 17, bold: true });
    splits.forEach(function (sp, i) {
      var nx = x + 70, ny = y + dy;
      s += line(x, y + 6, x - 4, ny - 14) + line(x, y + 6, nx - 4, ny - 14);
      s += circ(x - 8, ny - 4, 13, { stroke: LORE }) + txt(x - 8, ny + 1, sp[1], { color: LORE, bold: true });
      s += txt(nx, ny + 1, sp[2], { size: 16, bold: i === splits.length - 1 });
      if (i === splits.length - 1) s += circ(nx, ny - 4, 13, { stroke: LORE });
      x = nx; y = ny;
    });
    return svg(x + 60, y + 30, s, 'factor tree');
  }
  /* two-circle Venn of prime factors */
  function venn(aLabel, bLabel, onlyA, shared, onlyB, note) {
    var s = circ(110, 90, 72, { fill: 'rgba(143,211,255,.08)' }) + circ(200, 90, 72, { fill: 'rgba(214,168,96,.08)' });
    s += txt(90, 18, aLabel, { size: 14, color: DIM }) + txt(220, 18, bLabel, { size: 14, color: DIM });
    s += txt(72, 95, onlyA.join('  '), { size: 18 }) + txt(155, 95, shared.join('  '), { size: 18, color: LORE, bold: true }) + txt(238, 95, onlyB.join('  '), { size: 18 });
    s += txt(155, 184, note, { size: 13, color: DIM });
    return svg(310, 196, s, 'shared and unshared prime factors');
  }
  /* isometric cube with an edge label and a volume label */
  function cube(edgeLabel, volLabel) {
    var x0 = 50, y0 = 60, a = 80, d = 34, s = '';
    var front = [[x0, y0], [x0 + a, y0], [x0 + a, y0 + a], [x0, y0 + a]], top = [[x0, y0], [x0 + d, y0 - d * 0.6], [x0 + a + d, y0 - d * 0.6], [x0 + a, y0]], side = [[x0 + a, y0], [x0 + a + d, y0 - d * 0.6], [x0 + a + d, y0 + a - d * 0.6], [x0 + a, y0 + a]];
    [top, side, front].forEach(function (p) { s += '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '" fill="rgba(214,168,96,.08)" stroke="' + GOLD + '" stroke-width="1.5"/>'; });
    s += txt(x0 + a / 2, y0 + a + 20, edgeLabel) + txt(x0 + a / 2, y0 + a / 2 + 5, volLabel, { size: 15, italic: true, color: LORE });
    return svg(220, 170, s, 'cube');
  }
  /* number line with labelled points: pts = [[value, label, highlight?], ...] */
  function numberLine(lo, hi, ticks, pts) {
    var W = 420, x0 = 30, x1 = W - 30, s = ARROW, map = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
    s += line(x0 - 10, 60, x1 + 10, 60, { arrow: true, w: 2 });
    ticks.forEach(function (t) { s += line(map(t), 54, map(t), 66, { w: 1.5 }) + txt(map(t), 84, t, { size: 13, color: DIM }); });
    pts.forEach(function (p, i) { var x = map(p[0]); s += circ(x, 60, 4.5, { fill: p[2] ? LORE : GOLD, stroke: p[2] ? LORE : GOLD }) + txt(x, i % 2 ? 42 : 26, p[1], { size: 14, color: p[2] ? LORE : BONE }); });
    return svg(W, 96, s, 'number line');
  }
  /* decimal-point shift: digits with an arrow over n places */
  function shift(numStr, places, dir, result) {
    var s = ARROW, x = 20, w = 22, y = 56; var chars = numStr.split('');
    chars.forEach(function (c, i) { s += txt(x + i * w, y, c, { size: 22, bold: c === '.' }); });
    var dot = numStr.indexOf('.'), start = x + dot * w, end = x + (dir === 'left' ? dot - places - 0.5 : dot + places + 0.5) * w;
    s += '<path d="M' + start + ' 30 Q ' + ((start + end) / 2) + ' 0 ' + end + ' 30" fill="none" stroke="' + LORE + '" stroke-width="2" marker-end="url(#lb-arrow)"/>';
    s += txt((start + end) / 2, 14, places + ' places', { size: 13, color: LORE }) + txt(x + (chars.length - 1) * w / 2, 92, result, { size: 16, color: GOLD });
    return svg(Math.max(300, x * 2 + chars.length * w), 104, s, 'moving the decimal point');
  }
  /* anatomy of a polynomial: callouts on terms */
  function anatomy() {
    var s = ARROW, y = 70;
    s += txt(60, y, '3x²', { size: 30, bold: true }) + txt(118, y, '−', { size: 28 }) + txt(165, y, '7x', { size: 30, bold: true }) + txt(222, y, '+', { size: 28 }) + txt(262, y, '2', { size: 30, bold: true });
    s += rect(30, 40, 262, 44, { stroke: DIM, w: 1, rx: 6, fill: 'none' });
    s += line(48, 42, 48, 20, { color: LORE, arrow: true }) + txt(48, 14, 'coefficient 3', { size: 12, color: LORE });
    s += line(82, 42, 82, 20, { color: LORE, arrow: true }) + txt(96, 14, 'exponent 2', { size: 12, color: LORE });
    s += line(60, 86, 60, 108, { arrow: true }) + txt(60, 124, 'term', { size: 12, color: DIM });
    s += line(165, 86, 165, 108, { arrow: true }) + txt(165, 124, 'term', { size: 12, color: DIM });
    s += line(262, 86, 262, 108, { arrow: true }) + txt(262, 124, 'constant term', { size: 12, color: DIM });
    s += txt(330, 50, '3 terms → trinomial', { size: 13, anchor: 'start', color: BONE }) + txt(330, 70, 'highest exponent 2', { size: 13, anchor: 'start', color: BONE }) + txt(330, 90, '→ degree 2', { size: 13, anchor: 'start', color: GOLD });
    return svg(470, 136, s, 'parts of a polynomial');
  }
  /* area model for a product of two binomials: rows = ['x','+3'], cols = ['2x','−5'], cells = [['2x²','−5x'],['6x','−15']] */
  function areaModel(rows, cols, cells, total) {
    var cw = 110, ch = 70, x0 = 70, y0 = 40, s = '';
    cols.forEach(function (c, j) { s += txt(x0 + cw * j + cw / 2, y0 - 12, c, { size: 17, color: LORE }); });
    rows.forEach(function (r, i) { s += txt(x0 - 22, y0 + ch * i + ch / 2 + 6, r, { size: 17, color: LORE }); });
    rows.forEach(function (r, i) { cols.forEach(function (c, j) { s += rect(x0 + cw * j, y0 + ch * i, cw, ch) + txt(x0 + cw * j + cw / 2, y0 + ch * i + ch / 2 + 6, cells[i][j], { size: 18 }); }); });
    if (total) s += txt(x0 + cw * cols.length / 2, y0 + ch * rows.length + 28, total, { size: 15, color: GOLD });
    return svg(x0 + cw * cols.length + 30, y0 + ch * rows.length + 44, s, 'area model');
  }
  /* diamond (x-method): product on top, sum below, the two numbers left and right */
  function diamond(product, sum, a, b) {
    var cx = 120, cy = 80, s = '<polygon points="' + cx + ',' + (cy - 60) + ' ' + (cx + 90) + ',' + cy + ' ' + cx + ',' + (cy + 60) + ' ' + (cx - 90) + ',' + cy + '" fill="rgba(214,168,96,.06)" stroke="' + GOLD + '" stroke-width="1.5"/>';
    s += line(cx - 90, cy, cx + 90, cy, { dash: true, w: 1 }) + line(cx, cy - 60, cx, cy + 60, { dash: true, w: 1 });
    s += txt(cx, cy - 28, product, { size: 20, bold: true }) + txt(cx, cy - 46, 'multiply to', { size: 11, color: DIM });
    s += txt(cx, cy + 36, sum, { size: 20, bold: true }) + txt(cx, cy + 52, 'add to', { size: 11, color: DIM });
    s += txt(cx - 46, cy + 6, a, { size: 20, color: LORE, bold: true }) + txt(cx + 46, cy + 6, b, { size: 20, color: LORE, bold: true });
    return svg(240, 160, s, 'the two numbers');
  }
  /* a² − b² as a square with a corner removed, rearranged into a rectangle */
  function diffSquares() {
    var s = ARROW, x0 = 20, y0 = 20, a = 110, b = 40;
    s += rect(x0, y0, a, a) + rect(x0 + a - b, y0, b, b, { fill: INK, stroke: DIM, w: 1 });
    s += txt(x0 + a / 2, y0 + a + 18, 'a', { size: 16, italic: true }) + txt(x0 - 10, y0 + a / 2 + 5, 'a', { size: 16, italic: true }) + txt(x0 + a - b / 2, y0 + b / 2 + 5, 'b²', { size: 14, color: DIM });
    s += txt(x0 + a / 2 - 10, y0 + a / 2 + 10, 'a² − b²', { size: 16, color: LORE });
    s += line(x0 + a + 16, y0 + a / 2, x0 + a + 56, y0 + a / 2, { arrow: true, w: 2 });
    var X = x0 + a + 80; s += rect(X, y0 + 20, a + b, a - b) + line(X + a, y0 + 20, X + a, y0 + a, { dash: true, w: 1 });
    s += txt(X + (a + b) / 2, y0 + a + 18, 'a + b', { size: 16, italic: true }) + txt(X - 14, y0 + a / 2 + 10, 'a − b', { size: 16, italic: true, anchor: 'end' });
    s += txt(X + (a + b) / 2, y0 + a / 2 + 12, '(a + b)(a − b)', { size: 15, color: LORE });
    return svg(X + a + b + 20, y0 + a + 32, s, 'difference of squares');
  }
  /* zero product flow chart */
  function zeroFlow(eq, f1, f2, s1, s2) {
    var s = ARROW; s += rect(20, 14, 260, 40, { rx: 6 }) + txt(150, 40, eq, { size: 17 });
    s += line(150, 56, 150, 84, { arrow: true, w: 2 }) + txt(168, 74, 'factor', { size: 12, color: DIM, anchor: 'start' });
    s += rect(20, 90, 260, 40, { rx: 6 }) + txt(150, 116, f1, { size: 17 });
    s += line(90, 132, 70, 162, { arrow: true, w: 2 }) + line(210, 132, 230, 162, { arrow: true, w: 2 });
    s += rect(10, 168, 130, 40, { rx: 6, stroke: LORE }) + txt(75, 194, f2[0], { size: 16, color: LORE }) + rect(160, 168, 130, 40, { rx: 6, stroke: LORE }) + txt(225, 194, f2[1], { size: 16, color: LORE });
    s += line(75, 210, 75, 236, { arrow: true, w: 2 }) + line(225, 210, 225, 236, { arrow: true, w: 2 });
    s += txt(75, 258, s1, { size: 18, bold: true, color: GOLD }) + txt(225, 258, s2, { size: 18, bold: true, color: GOLD });
    return svg(300, 272, s, 'zero product rule');
  }
  /* flip card for negative exponents */
  function flip() {
    var s = ARROW; s += rect(20, 30, 90, 60, { rx: 6 }) + txt(65, 68, 'x⁻ⁿ', { size: 26, bold: true });
    s += '<path d="M118 60 Q 160 10 202 60" fill="none" stroke="' + LORE + '" stroke-width="2" marker-end="url(#lb-arrow)"/>' + txt(160, 20, 'flip', { size: 13, color: LORE });
    s += rect(210, 30, 90, 60, { rx: 6 }) + txt(255, 54, '1', { size: 20 }) + line(232, 60, 278, 60, { color: BONE, w: 1.5 }) + txt(255, 82, 'xⁿ', { size: 20, bold: true });
    s += txt(160, 118, 'the exponent turns positive when the power changes floors', { size: 12, color: DIM });
    return svg(320, 130, s, 'negative exponent');
  }
  /* exponent-law reference as columns */
  var LAWS = [['Product', '\\(x^a \\cdot x^b = x^{a+b}\\)', '\\(x^3 \\cdot x^5 = x^8\\)'], ['Quotient', '\\(\\dfrac{x^a}{x^b} = x^{a-b}\\)', '\\(\\dfrac{x^7}{x^2} = x^5\\)'], ['Power of a power', '\\((x^a)^b = x^{ab}\\)', '\\((x^3)^4 = x^{12}\\)'], ['Power of a product', '\\((xy)^a = x^a y^a\\)', '\\((2x^2y)^3 = 8x^6y^3\\)'], ['Power of a quotient', '\\(\\left(\\dfrac{x}{y}\\right)^a = \\dfrac{x^a}{y^a}\\)', '\\(\\left(\\dfrac{a}{b}\\right)^2 = \\dfrac{a^2}{b^2}\\)'], ['Zero exponent', '\\(x^0 = 1\\)', '\\((-5x)^0 = 1\\)']];

  /* a small coordinate grid: points [x, y, label], segments [[x1,y1],[x2,y2], dashed?], optional rise/run triangle,
     an optional vertical test line x = v, and optional open / closed end dots */
  function plane(o) {
    o = o || {}; var n = o.n || 6, u = o.u || 18, pad = 22, size = 2 * n * u, s = ARROW;
    function X(x) { return pad + (x + n) * u; } function Y(y) { return pad + (n - y) * u; }
    for (var i = -n; i <= n; i++) { s += line(X(i), Y(-n), X(i), Y(n), { color: 'rgba(232,220,192,.12)', w: 1 }) + line(X(-n), Y(i), X(n), Y(i), { color: 'rgba(232,220,192,.12)', w: 1 }); }
    s += line(X(-n), Y(0), X(n), Y(0), { color: DIM, w: 1.4 }) + line(X(0), Y(-n), X(0), Y(n), { color: DIM, w: 1.4 });
    s += txt(X(n) - 4, Y(0) - 6, 'x', { size: 13, color: DIM, italic: true }) + txt(X(0) + 9, Y(n) + 12, 'y', { size: 13, color: DIM, italic: true });
    if (o.quads) [['II', -n / 2, n / 2], ['I', n / 2, n / 2], ['III', -n / 2, -n / 2], ['IV', n / 2, -n / 2]].forEach(function (q) { s += txt(X(q[1]), Y(q[2]) + 6, q[0], { size: 18, color: 'rgba(143,211,255,.45)', bold: true }); });
    (o.segs || []).forEach(function (g) { s += line(X(g[0][0]), Y(g[0][1]), X(g[1][0]), Y(g[1][1]), { color: g[3] || GOLD, w: 2.4, dash: g[2] }); });
    if (o.tri) { var a = o.tri[0], b = o.tri[1]; s += line(X(a[0]), Y(a[1]), X(b[0]), Y(a[1]), { color: LORE, w: 1.6, dash: true }) + line(X(b[0]), Y(a[1]), X(b[0]), Y(b[1]), { color: LORE, w: 1.6, dash: true });
      s += txt((X(a[0]) + X(b[0])) / 2, Y(a[1]) + (b[1] > a[1] ? 16 : -6), 'run ' + (b[0] - a[0]), { size: 12, color: LORE }) + txt(X(b[0]) + 6, (Y(a[1]) + Y(b[1])) / 2 + 4, 'rise ' + (b[1] - a[1]), { size: 12, color: LORE, anchor: 'start' }); }
    if (o.vline != null) s += line(X(o.vline), Y(-n), X(o.vline), Y(n), { color: LORE, w: 1.6, dash: true });
    (o.pts || []).forEach(function (q) { s += '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="4.5" fill="' + (q[3] === 'open' ? INK : (q[4] || GOLD)) + '" stroke="' + (q[4] || GOLD) + '" stroke-width="2"/>'; if (q[2]) s += txt(X(q[0]) + (q[5] || 8), Y(q[1]) - 8, q[2], { size: 12, anchor: 'start' }); });
    return svg(size + 2 * pad, size + 2 * pad, s, o.label || 'coordinate grid');
  }
  /* a story graph: a polyline over time with each piece labelled */
  function story(pts, labels, xl, yl) {
    var w = 360, h = 190, x0 = 46, y0 = 16, gw = 290, gh = 140, s = ARROW, mx = pts[pts.length - 1][0], my = 0;
    pts.forEach(function (p) { if (p[1] > my) my = p[1]; });
    function X(x) { return x0 + gw * x / mx; } function Y(y) { return y0 + gh - gh * y / (my * 1.15); }
    s += line(x0, y0 + gh, x0 + gw + 8, y0 + gh, { color: DIM, w: 1.4 }) + line(x0, y0 + gh, x0, y0 - 2, { color: DIM, w: 1.4 });
    s += txt(x0 + gw / 2, h - 6, xl, { size: 12, color: DIM }) + '<text x="14" y="' + (y0 + gh / 2) + '" ' + F + ' font-size="12" fill="' + DIM + '" text-anchor="middle" transform="rotate(-90 14 ' + (y0 + gh / 2) + ')">' + esc(yl) + '</text>';
    for (var i = 1; i < pts.length; i++) { s += line(X(pts[i - 1][0]), Y(pts[i - 1][1]), X(pts[i][0]), Y(pts[i][1]), { w: 2.6 }); if (labels[i - 1]) s += txt((X(pts[i - 1][0]) + X(pts[i][0])) / 2, Math.min(Y(pts[i - 1][1]), Y(pts[i][1])) - 8, labels[i - 1], { size: 11, color: LORE }); }
    return svg(w, h, s, 'story graph');
  }

  return {
  L1: [
    { title: 'The Tally Board', lore: 'Every farm in the Fields kept a tally board by the barn door: a notch for every sack that came in. When the harvests failed the farmers kept notching anyway, for the sacks that should have come. The Tallyhusks still do. Break a number into the primes it is made of and you will see what it is really counting.',
      math: [
        { h: 'Prime factorization' },
        { p: 'A <b>prime</b> has exactly two factors: 1 and itself. Every other whole number above 1 is built from primes. Divide by the smallest prime that works, and keep going until only primes are left.' },
        { fig: factorTree('360', [['360', '2', '180'], ['180', '2', '90'], ['90', '2', '45'], ['45', '3', '15'], ['15', '3', '5']]) },
        { eq: '360 = 2\\times 2\\times 2\\times 3\\times 3\\times 5 = 2^{3}\\times 3^{2}\\times 5' },
        { p: 'Write it in <b>exponent form</b>, primes from smallest to largest.' },
        { h: 'Perfect squares and perfect cubes' },
        { cols: [['Perfect square', 'every exponent is <b>even</b>: \\(144 = 2^{4}\\times 3^{2}\\) ✓'], ['Perfect cube', 'every exponent is a <b>multiple of 3</b>: \\(216 = 2^{3}\\times 3^{3}\\) ✓'], ['Both', '\\(64 = 2^{6}\\): 6 is even and a multiple of 3'], ['Neither', '\\(360 = 2^{3}\\times 3^{2}\\times 5\\)']] }
      ] },
    { title: 'Two Harvests Shared', lore: 'When two farms shared a cart, they split the load so that nothing was left over, and the cart came back to both yards on the same day. The farmers did not call it the GCF and the LCM. They called it being neighbours.',
      math: [
        { h: 'GCF and LCM from prime factors' },
        { p: 'Write both numbers as primes, then sort the factors into what they <b>share</b> and what they do not.' },
        { eq: '24 = 2^{3}\\times 3 \\qquad 36 = 2^{2}\\times 3^{2}' },
        { fig: venn('24', '36', ['2'], ['2', '2', '3'], ['3'], 'shared factors in the middle: 2 × 2 × 3') },
        { cols: [['GCF (greatest common factor)', 'only the <b>shared</b> primes, at the <b>lower</b> power: \\(2^{2}\\times 3 = 12\\)'], ['LCM (lowest common multiple)', '<b>every</b> prime that appears, at the <b>higher</b> power: \\(2^{3}\\times 3^{2} = 72\\)']] },
        { rule: '\\text{GCF}\\times\\text{LCM} = 12\\times 72 = 864 = 24\\times 36' },
        { h: 'Which one does the question want?' },
        { cols: [['Share out evenly, nothing left over, as many groups as possible', 'GCF'], ['Things that repeat, together again, the same height', 'LCM']] }
      ] },
    { title: 'The Miller\'s Grain Bin', lore: 'Grist kept his grain in a bin of perfect stone: a cube, its volume cut into the lid. The edge he never wrote down, because, he said, anyone who could take a root deserved to know it. The bin is empty now, and Grist is something else.',
      math: [
        { h: 'Roots undo powers' },
        { p: '\\(\\sqrt{n}\\) asks “what number times itself gives \\(n\\)?” and \\(\\sqrt[3]{n}\\) asks “what number used three times gives \\(n\\)?” A square root is the <b>side</b> of a square from its area; a cube root is the <b>edge</b> of a cube from its volume.' },
        { fig: cube('edge = ∛1728 = 12', 'volume 1728') },
        { steps: ['1728 = 2^{6}\\times 3^{3}', '\\sqrt[3]{1728} = 2^{6\\div 3}\\times 3^{3\\div 3} = 2^{2}\\times 3 = 12'] },
        { p: 'Divide every exponent by the index of the root: by 2 for a square root, by 3 for a cube root. If one will not divide evenly, the number is not a perfect square (or cube).' },
        { h: 'Making a perfect square' },
        { p: '\\(48 = 2^{4}\\times 3\\). The 3 has an odd exponent, so multiply by 3: \\(48\\times 3 = 144 = 12^{2}\\).' }
      ] },
    { title: 'What the Crows Taste', lore: 'The Hollow Crows will peck at anything, but they only swallow what ends or repeats. The rest they spit out, and it lies in the furrows forever, going on and on. The farmers called those numbers irrational. The crows call them bitter.',
      math: [
        { h: 'The number sets' },
        { cols: [['\\(N\\) natural', '1, 2, 3, … (0 is <b>not</b> natural)'], ['\\(W\\) whole', '0, 1, 2, 3, …'], ['\\(I\\) integers', '…, −2, −1, 0, 1, 2, …'], ['\\(Q\\) rational', 'any fraction of integers: decimals that <b>end or repeat</b>, like \\(\\tfrac{3}{8} = 0.375\\) and \\(\\tfrac{2}{3} = 0.\\overline{6}\\)'], ['\\(\\overline{Q}\\) irrational', 'decimals that <b>never end and never repeat</b>: \\(\\sqrt{2}\\), \\(\\sqrt[3]{10}\\), \\(\\pi\\)'], ['\\(R\\) real', 'all of the above']] },
        { p: 'They nest: \\(N\\) sits inside \\(W\\), inside \\(I\\), inside \\(Q\\). \\(\\overline{Q}\\) sits beside \\(Q\\), and both sit inside \\(R\\).' },
        { h: 'Is the root rational?' },
        { p: '\\(\\sqrt{49} = 7\\) is rational, because 49 is a perfect square. \\(\\sqrt{50}\\) is irrational, because 50 is not.' },
        { h: 'Real or not?' },
        { p: 'An <b>odd</b> root of a negative is a real, negative number: \\(\\sqrt[3]{-27} = -3\\). An <b>even</b> root of a negative is not a real number: \\(\\sqrt{-25}\\) and \\(\\sqrt[4]{-16}\\).' }
      ] },
    { title: 'The Hag\'s Roots', lore: 'The Root Hag pulls her roots out of the cauldron two at a time for a square root and three at a time for a cube root. What comes out goes in front. What is left stays in the pot. She has never lost a root that way, and she has been pulling them since before the road was built.',
      math: [
        { h: 'Entire → mixed: pull out the largest perfect square' },
        { fig: factorTree('72', [['72', '36', '2']]) },
        { steps: ['\\sqrt{72} = \\sqrt{36\\times 2} = \\sqrt{36}\\times\\sqrt{2} = 6\\sqrt{2}', '\\sqrt[3]{54} = \\sqrt[3]{27\\times 2} = 3\\sqrt[3]{2}', '\\sqrt[3]{-16} = \\sqrt[3]{-8\\times 2} = -2\\sqrt[3]{2}'] },
        { h: 'Mixed → entire: push the number in front back under the root' },
        { steps: ['5\\sqrt{3} = \\sqrt{5^{2}\\times 3} = \\sqrt{75}', '2\\sqrt[3]{7} = \\sqrt[3]{2^{3}\\times 7} = \\sqrt[3]{56}', '-6\\sqrt{2} = -\\sqrt{72} \\quad\\text{(a square root keeps the negative outside)}'] },
        { rule: 'a\\sqrt[n]{b} = \\sqrt[n]{a^{n}\\times b}' },
        { h: 'Ordering without a calculator' },
        { p: 'Turn every mixed radical into an entire radical, then compare the numbers under the roots: \\(3\\sqrt{3} = \\sqrt{27}\\), \\(2\\sqrt{5} = \\sqrt{20}\\), \\(4\\sqrt{2} = \\sqrt{32}\\), so \\(2\\sqrt{5} < 3\\sqrt{3} < 4\\sqrt{2}\\).' }
      ] }
  ],
  L2: [
    { title: 'What the Mites Carry', lore: 'A Salt Mite carries its grains in stacks, and it never counts them one by one. Two stacks of the same grain, laid end to end, make one taller stack; the heights simply add. Take a stack away and the heights subtract. The caravans learned this from the mites, and the caravans got rich.',
      math: [
        { h: 'Same base: add or subtract the exponents' },
        { rule: 'x^{a}\\cdot x^{b} = x^{a+b} \\qquad \\dfrac{x^{a}}{x^{b}} = x^{a-b}' },
        { steps: ['3^{4}\\cdot 3^{2} = 3^{6} = 729', '\\dfrac{x^{9}}{x^{3}} = x^{6}', '2a^{3}\\cdot 5a^{4} = (2\\cdot 5)\\,a^{3+4} = 10a^{7}'] },
        { p: 'Multiply (or divide) the <b>numbers in front</b> as usual. Only the <b>exponents</b> of matching bases add (or subtract).' },
        { h: 'The laws at a glance' },
        { cols: LAWS.map(function (r) { return [r[0], r[1] + ' &nbsp; e.g. ' + r[2]]; }) },
        { p: 'Different bases never combine: \\(x^{3}\\cdot y^{2}\\) stays as it is.' }
      ] },
    { title: 'The Colossus, Stacked', lore: 'The Salt Colossus is a stack of stacks. Each block of it is a block of blocks, raised to its own power again and again, until the whole thing towers over the flats. Knock the brackets off it in the right order and it comes down to a single grain.',
      math: [
        { h: 'A power of a power: multiply the exponents' },
        { rule: '(x^{a})^{b} = x^{ab} \\qquad (xy)^{a} = x^{a}y^{a}' },
        { steps: ['(3a^{3})^{2} = 3^{2}\\,a^{3\\times 2} = 9a^{6}', '(3a^{3})^{2}\\cdot 2a^{2} = 9a^{6}\\cdot 2a^{2} = 18a^{8}', '\\dfrac{(4x^{3})^{2}}{2x^{4}} = \\dfrac{16x^{6}}{2x^{4}} = 8x^{2}'] },
        { p: 'Every factor inside the brackets gets the power, the number in front too: \\((3a^{3})^{2}\\) is \\(9a^{6}\\), not \\(3a^{6}\\).' },
        { h: 'Watch the negative' },
        { cols: [['\\((-7)^{2}\\)', 'the base is \\(-7\\): \\((-7)(-7) = 49\\)'], ['\\(-7^{2}\\)', 'the base is 7, the negative waits outside: \\(-(7\\cdot 7) = -49\\)']] },
        { h: 'Order of work' },
        { p: 'Brackets and powers first, then multiply, then divide. Keep the numbers and each letter in their own lane.' }
      ] },
    { title: 'Halora\'s Mirror', lore: 'The Brine Queen keeps a mirror of polished salt. Anything with a negative mark that looks into it is flipped to the other side of the glass, and its mark turns positive. Anything raised to nothing at all sees only a single grain looking back: one.',
      math: [
        { h: 'Zero exponents' },
        { rule: 'x^{0} = 1 \\quad (x \\neq 0)' },
        { p: 'Divide anything by itself: \\(\\dfrac{x^{5}}{x^{5}} = x^{0}\\), and it is also 1. So \\(7^{0} = 1\\), \\((-5x)^{0} = 1\\), but \\(-5x^{0} = -5\\), since only the \\(x\\) has the zero.' },
        { h: 'Negative exponents: flip it' },
        { fig: flip() },
        { rule: 'x^{-n} = \\dfrac{1}{x^{n}} \\qquad \\dfrac{1}{x^{-n}} = x^{n} \\qquad \\left(\\dfrac{a}{b}\\right)^{-n} = \\left(\\dfrac{b}{a}\\right)^{n}' },
        { steps: ['2^{-3} = \\dfrac{1}{2^{3}} = \\dfrac{1}{8}', '\\left(\\dfrac{2}{3}\\right)^{-2} = \\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{9}{4}', '\\dfrac{6x^{2}}{3x^{5}} = 2x^{-3} = \\dfrac{2}{x^{3}}'] },
        { p: 'Only the base that wears the negative exponent moves. In \\(2x^{-3}\\) the 2 stays on top.' }
      ] },
    { title: 'Grains Beyond Counting', lore: 'There are more grains of salt in the Wastes than there are words in every book ever written. The Glass Scarabs, who keep the tallies, gave up writing all the zeros long ago. They write a small number and a power of ten, and they have never once run out of shell.',
      math: [
        { h: 'Scientific notation' },
        { rule: 'a \\times 10^{n}, \\qquad 1 \\le a < 10' },
        { fig: shift('4500000.', 6, 'left', '4.5 × 10⁶') },
        { cols: [['Big number', 'the point moves <b>left</b>, the exponent is <b>positive</b>: \\(4\\,500\\,000 = 4.5\\times 10^{6}\\)'], ['Small number', 'the point moves <b>right</b>, the exponent is <b>negative</b>: \\(0.00032 = 3.2\\times 10^{-4}\\)']] },
        { h: 'Multiplying and dividing' },
        { steps: ['(3\\times 10^{5})(4\\times 10^{-2}) = 12\\times 10^{3} = 1.2\\times 10^{4}', '\\dfrac{6\\times 10^{8}}{2\\times 10^{3}} = 3\\times 10^{5}'] },
        { p: 'Work the numbers in front, then the powers of ten with the exponent laws. If the number in front is no longer between 1 and 10, shift it and adjust the exponent.' }
      ] },
    { title: 'The Mirage, Halved', lore: 'The Mirage Wraith is never all there. It shows you half of itself, or a third, or two thirds of a thing that was never whole. The trick is to find the root of it first, then raise what is left. The Brine Serpent knows the trick, and it is not telling.',
      math: [
        { h: 'Rational exponents are roots' },
        { rule: 'x^{\\frac{1}{n}} = \\sqrt[n]{x} \\qquad x^{\\frac{m}{n}} = \\left(\\sqrt[n]{x}\\right)^{m} = \\sqrt[n]{x^{m}}' },
        { p: 'The <b>bottom</b> of the fraction is the root. The <b>top</b> is the power.' },
        { steps: ['49^{\\frac{1}{2}} = \\sqrt{49} = 7', '8^{\\frac{2}{3}} = \\left(\\sqrt[3]{8}\\right)^{2} = 2^{2} = 4', '(-125)^{-\\frac{2}{3}} = \\dfrac{1}{\\left(\\sqrt[3]{-125}\\right)^{2}} = \\dfrac{1}{(-5)^{2}} = \\dfrac{1}{25}'] },
        { p: 'Take the root first; the numbers stay small. A negative exponent still means flip.' },
        { h: 'Radical ↔ power' },
        { cols: [['\\(\\sqrt[5]{x^{3}}\\)', '\\(x^{\\frac{3}{5}}\\)'], ['\\(x^{\\frac{3}{4}}\\)', '\\(\\sqrt[4]{x^{3}}\\) or \\(\\left(\\sqrt[4]{x}\\right)^{3}\\)']] },
        { p: 'All the exponent laws still work with fractions: \\(x^{\\frac{1}{2}}\\cdot x^{\\frac{1}{3}} = x^{\\frac{5}{6}}\\).' }
      ] }
  ],
  L3: [
    { title: 'Mason\'s Marks', lore: 'Every block cut from the Deep Quarry carries a mason\'s mark: a number in front, a letter, a small number high on the right. The Chiplings cannot read, but they can count the marks on a block, and they know the biggest little number tells you how tall a wall it belongs in.',
      math: [
        { h: 'The parts of a polynomial' },
        { fig: anatomy() },
        { cols: [['Term', 'a number, a variable, or a product of them: \\(3x^{2}\\), \\(-7x\\), \\(2\\)'], ['Degree', 'the highest exponent of the variable (a constant has degree 0)'], ['Leading coefficient', 'the number in front of the highest-degree term'], ['Constant term', 'the term with no variable']] },
        { h: 'Names by number of terms' },
        { cols: [['1 term', 'monomial: \\(5x^{3}\\)'], ['2 terms', 'binomial: \\(x - 4\\)'], ['3 terms', 'trinomial: \\(2x^{2} + x - 9\\)'], ['more', 'polynomial']] },
        { p: 'Write a polynomial in <b>descending order</b>, highest exponent first. Then the leading coefficient is simply the first number.' }
      ] },
    { title: 'Sorting the Rubble', lore: 'The rubble at the bottom of the pit is sorted by hand: blocks with blocks, slabs with slabs, chips with chips. You may stack blocks onto blocks all day, but a slab never goes on the block pile. Old Moraine fines anyone who mixes them.',
      math: [
        { h: 'Like terms' },
        { p: 'Like terms have the <b>same variables with the same exponents</b>. Only like terms combine, and only their coefficients add.' },
        { cols: [['Like', '\\(4x^{2}\\) and \\(-x^{2}\\) → \\(3x^{2}\\); &nbsp; \\(2xy\\) and \\(5xy\\) → \\(7xy\\)'], ['Not like', '\\(4x^{2}\\) and \\(4x\\); &nbsp; \\(xy^{2}\\) and \\(x^{2}y\\)']] },
        { h: 'Adding' },
        { steps: ['(3x^{2} - 2x + 5) + (x^{2} + 6x - 8)', '= (3 + 1)x^{2} + (-2 + 6)x + (5 - 8)', '= 4x^{2} + 4x - 3'] },
        { h: 'Subtracting: the minus hits every term' },
        { steps: ['(5x^{2} + x - 4) - (2x^{2} - 3x + 1)', '= 5x^{2} + x - 4 - 2x^{2} + 3x - 1', '= 3x^{2} + 4x - 5'] },
        { p: 'The most common slip: forgetting to change the sign of the <b>last</b> terms in the second bracket.' }
      ] },
    { title: 'The Wight\'s Long Arm', lore: 'The Mason Wight has one arm far longer than the other, and it uses it to reach every block in a row without stepping once. It touches each block in turn and leaves its mark on all of them. Miss one and the whole row falls.',
      math: [
        { h: 'A monomial times a polynomial: distribute' },
        { rule: 'a(b + c + d) = ab + ac + ad' },
        { steps: ['3x(2x - 5) = 6x^{2} - 15x', '-2x(x^{2} - 4x + 3) = -2x^{3} + 8x^{2} - 6x', '2x(x + 4) - 3(x - 1) = 2x^{2} + 8x - 3x + 3 = 2x^{2} + 5x + 3'] },
        { p: 'Multiply the coefficients, add the exponents (\\(x\\cdot x^{2} = x^{3}\\)), and carry the sign onto every term. Distribute first, then collect like terms.' },
        { fig: areaModel(['3x'], ['2x', '−5'], [['6x²', '−15x']], '3x(2x − 5) = 6x² − 15x') }
      ] },
    { title: 'Twinwing', lore: 'The Twinwing Bats hunt in pairs, and each bat in a pair strikes each of the other pair. Two against two makes four strikes, every time. Count them in the dark by the sound: first, outside, inside, last.',
      math: [
        { h: 'A binomial times a binomial' },
        { p: 'Every term in the first bracket multiplies every term in the second. Two terms by two terms gives four products: <b>F</b>irst, <b>O</b>utside, <b>I</b>nside, <b>L</b>ast.' },
        { fig: areaModel(['x', '+3'], ['2x', '−5'], [['2x²', '−5x'], ['6x', '−15']], '(x + 3)(2x − 5) = 2x² + x − 15') },
        { steps: ['(x + 3)(2x - 5) = 2x^{2} - 5x + 6x - 15', '= 2x^{2} + x - 15'] },
        { h: 'Area' },
        { p: 'A rectangle that is \\((x + 4)\\) by \\((x - 2)\\) has area \\((x + 4)(x - 2) = x^{2} + 2x - 8\\). The area model is the same picture, drawn with the real sides.' }
      ] },
    { title: 'The Hydra\'s Heads', lore: 'Cut one head from the Stone Hydra and two grow back, and each of those strikes all three of yours. But some heads come in mirrored pairs, and when the mirrored pair meets, the middle cancels out and leaves only stone. Old Moraine says that is the only way it has ever been killed.',
      math: [
        { h: 'Special products' },
        { rule: '(a + b)(a - b) = a^{2} - b^{2}' },
        { fig: diffSquares() },
        { p: 'The middle terms \\(+ab\\) and \\(-ab\\) cancel: \\((x + 6)(x - 6) = x^{2} - 36\\).' },
        { rule: '(a + b)^{2} = a^{2} + 2ab + b^{2} \\qquad (a - b)^{2} = a^{2} - 2ab + b^{2}' },
        { p: '\\((2x - 3)^{2} = 4x^{2} - 12x + 9\\). Not \\(4x^{2} + 9\\): squaring a binomial always makes a middle term.' },
        { h: 'A binomial times a trinomial' },
        { steps: ['(x + 2)(x^{2} - 3x + 4)', '= x^{3} - 3x^{2} + 4x + 2x^{2} - 6x + 8', '= x^{3} - x^{2} - 2x + 8'] },
        { p: 'Two terms by three terms makes six products before you collect. Count them to be sure none got away.' }
      ] }
  ],
  L4: [
    { title: 'What the Glowgrub Leaves', lore: 'A Glowgrub eats its way along a seam and leaves the rock hollow behind it, but never the part that every stone had in common. That part it keeps, and it glows with it. Miners used to follow the light to find what a whole seam was made of.',
      math: [
        { h: 'The greatest common factor (GCF)' },
        { p: 'The GCF of some terms is the <b>greatest number</b> that divides every coefficient, times the <b>lowest power</b> of each variable that is in every term.' },
        { cols: [['\\(12x^{2}\\) and \\(18x^{5}\\)', 'GCF of 12 and 18 is 6; lowest power of x is \\(x^{2}\\); GCF \\(= 6x^{2}\\)'], ['\\(8xy^{2}\\) and \\(20x^{3}y\\)', 'GCF \\(= 4xy\\)']] },
        { h: 'Factoring out the GCF' },
        { steps: ['6x^{2} - 15x', '= 3x(2x) - 3x(5)', '= 3x(2x - 5)'] },
        { p: 'Divide each term by the GCF; what is left goes inside the brackets. <b>Check</b> by multiplying the GCF back over the brackets: \\(3x(2x) - 3x(5) = 6x^{2} - 15x\\). ✓' },
        { p: 'Taking out a <b>negative</b> GCF changes the sign of every term inside: \\(-4x^{2} + 8x = -4x(x - 2)\\).' }
      ] },
    { title: 'The Kobold\'s Pair', lore: 'Kobolds split every rock in two with one swing, and they never miss, because they look before they swing. They want two numbers: two that multiply to the last term and add to the middle one. Find the pair, and the rock falls open.',
      math: [
        { h: 'Factoring x² + bx + c' },
        { p: 'Find two integers that <b>multiply to c</b> and <b>add to b</b>. They go straight into the brackets.' },
        { fig: diamond('12', '7', '3', '4') },
        { steps: ['x^{2} + 7x + 12', '3 \\times 4 = 12 \\text{ and } 3 + 4 = 7', '= (x + 3)(x + 4)'] },
        { h: 'Reading the signs' },
        { cols: [['c positive', 'both numbers have the <b>same</b> sign as b: \\(x^{2} - 9x + 20 = (x - 4)(x - 5)\\)'], ['c negative', 'the numbers have <b>opposite</b> signs; the bigger one takes the sign of b: \\(x^{2} - 2x - 15 = (x - 5)(x + 3)\\)']] },
        { p: 'Always check by expanding (FOIL). Factoring and multiplying undo each other.' }
      ] },
    { title: 'Crystal Wings', lore: 'A Shardmoth\'s wings are two squares of crystal, one large and one small, and nothing grows between them. Miners call any rock that splits that cleanly a twin seam, and they mark it with two lines: one for the sum, one for the difference.',
      math: [
        { h: 'Difference of squares' },
        { rule: 'a^{2} - b^{2} = (a - b)(a + b)' },
        { fig: diffSquares() },
        { steps: ['x^{2} - 49 = x^{2} - 7^{2} = (x - 7)(x + 7)', '4x^{2} - 81 = (2x)^{2} - 9^{2} = (2x - 9)(2x + 9)'] },
        { p: 'Two terms, both perfect squares, with a <b>minus</b> between them. A <b>sum</b> of squares, \\(x^{2} + 49\\), does not factor.' },
        { h: 'Perfect square trinomials' },
        { rule: 'a^{2} + 2ab + b^{2} = (a + b)^{2} \\qquad a^{2} - 2ab + b^{2} = (a - b)^{2}' },
        { p: 'The test: first term a square, last term a <b>positive</b> square, middle term twice their square roots multiplied. \\(x^{2} - 10x + 25\\): \\(x^{2}\\), \\(5^{2}\\), and \\(2(x)(5) = 10x\\). So it is \\((x - 5)^{2}\\).' }
      ] },
    { title: 'The Troll\'s Order', lore: 'The Deepdelver Troll does everything in the same order: first it takes what every rock has in common and puts it in its lantern; then it looks at what is left and breaks it apart. The miners it ate did it the other way round.',
      math: [
        { h: 'Choosing a strategy' },
        { cols: [['1. Common factor?', 'Always first. Take out the GCF.'], ['2. Two terms?', 'Difference of squares: \\(a^{2} - b^{2}\\)'], ['3. Three terms?', 'Perfect square? Then x² + bx + c (product and sum). If a ≠ 1, decompose.'], ['4. Check', 'Can any bracket factor again? Expand to check.']] },
        { steps: ['3x^{3} - 12x = 3x(x^{2} - 4) = 3x(x - 2)(x + 2)', '2x^{2} + 20x + 50 = 2(x^{2} + 10x + 25) = 2(x + 5)^{2}'] },
        { h: 'When a ≠ 1: decomposition' },
        { steps: ['2x^{2} + 7x + 3', 'a \\times c = 6;\\ 6 = 1 \\times 6 \\text{ and } 1 + 6 = 7', '= 2x^{2} + x + 6x + 3', '= x(2x + 1) + 3(2x + 1)', '= (2x + 1)(x + 3)'] },
        { p: 'Split the middle term with the pair, group in twos, and take a common factor from each group. The brackets must match.' }
      ] },
    { title: 'Where the Burrower Stops', lore: 'The Ironjaw Burrower digs until it reaches zero, and then it stops dead. Every tunnel it leaves ends in a little chamber where a solution waits. If you want to find them, factor first, and follow each bracket down to zero.',
      math: [
        { h: 'The zero product property' },
        { p: 'If two numbers multiply to make 0, at least one of them is 0. So once an equation is factored and equals 0, each factor can be set to 0.' },
        { fig: zeroFlow('x² − 3x − 10 = 0', '(x − 5)(x + 2) = 0', ['x − 5 = 0', 'x + 2 = 0'], 'x = 5', 'x = −2') },
        { h: 'Get it equal to zero first' },
        { steps: ['x^{2} + 3x = 10', 'x^{2} + 3x - 10 = 0', '(x + 5)(x - 2) = 0', 'x = -5 \\text{ or } x = 2'] },
        { p: 'Never divide both sides by x: \\(x^{2} = 6x\\) becomes \\(x(x - 6) = 0\\), which has <b>two</b> solutions, \\(x = 0\\) and \\(x = 6\\).' },
        { p: 'With \\(a \\ne 1\\), one solution may be a fraction: \\((2x - 1)(x + 3) = 0\\) gives \\(x = \\dfrac{1}{2}\\) or \\(x = -3\\).' }
      ] }
  ],
  L5: [
    { title: 'The Cogmite\'s Grid', lore: 'The Cogwright laid his city on a grid so that every machine had an address: so far across, so far up. The Cogmites still walk the streets in squares, reading the addresses aloud. Across first, then up. They have never once said it the other way.',
      math: [
        { h: 'The Cartesian plane' },
        { fig: plane({ n: 5, quads: true, pts: [[3, 2, 'A(3, 2)'], [-4, 1, 'B(−4, 1)'], [-2, -3, 'C(−2, −3)'], [2, -4, 'D(2, −4)']] }) },
        { p: 'An ordered pair \\((x, y)\\) means across \\(x\\), then up \\(y\\). The axes split the plane into four <b>quadrants</b>, numbered counter-clockwise from the top right. A point on an axis is in no quadrant.' },
        { h: 'Two kinds of variable' },
        { cols: [['Independent', 'the input, chosen or controlled: goes on the horizontal axis'], ['Dependent', 'the output, it depends on the input: goes on the vertical axis']] },
        { cols: [['Discrete', 'counted; only certain values (gears, people): plot dots'], ['Continuous', 'measured; every value in between (time, height): join with a line']] }
      ] },
    { title: 'Patterns on the Bench', lore: 'The apprentices learned by laying out gears in growing patterns, one figure after another, and the Cogwright tested them by pointing at a figure far down the bench that nobody had laid out yet. How many gears in that one?',
      math: [
        { h: 'A growing pattern' },
        { cols: [['Figure', '1 &nbsp; 2 &nbsp; 3 &nbsp; 4'], ['Gears', '5 &nbsp; 8 &nbsp; 11 &nbsp; 14']] },
        { p: 'It <b>starts</b> at 5 and <b>adds</b> 3 each time. Figure 10 is 9 steps past Figure 1: \\(5 + 3 \\times 9 = 32\\).' },
        { h: 'As an equation' },
        { steps: ['\\text{the step is } 3, \\text{ so } G = 3n + b', '\\text{at } n = 1:\\ 3 + b = 5, \\text{ so } b = 2', 'G = 3n + 2'] },
        { p: 'A pattern that adds the same amount every time is <b>linear</b>: its points lie on a straight line. The amount added is the rate of change.' }
      ] },
    { title: 'Where the Walls Are', lore: 'The Piston Knight was built to guard the edges of things, and it knows them all: where a road meets the city wall, where a pipe begins and where it ends, and which ends are open and which are welded shut.',
      math: [
        { h: 'Intercepts' },
        { fig: plane({ n: 5, segs: [[[-5, -5], [2.5, 5]]], pts: [[-1.25, 0, '(−1.25, 0)', 'closed', '#8fd3ff', -64], [0, 1.67, '(0, 1.67)', 'closed', '#8fd3ff']] }) },
        { cols: [['x-intercept', 'where the graph crosses the x-axis: set \\(y = 0\\)'], ['y-intercept', 'where it crosses the y-axis: set \\(x = 0\\)']] },
        { p: 'For \\(y = 2x - 6\\): the y-intercept is \\((0, -6)\\); the x-intercept solves \\(0 = 2x - 6\\), so it is \\((3, 0)\\). In a story, an intercept is usually a start (time 0) or an end (nothing left).' },
        { h: 'Domain and range' },
        { cols: [['Domain', 'every x-value (input) the relation uses'], ['Range', 'every y-value (output)']] },
        { p: 'For a set of points, list them: \\(\\{-2, 0, 5\\}\\). For a line segment from \\(x = -3\\) to \\(x = 4\\), write \\(-3 \\le x \\le 4\\). A <b>closed</b> dot is included; an <b>open</b> dot is not.' }
      ] },
    { title: 'One Input, One Bolt', lore: 'The Spark Bottles were the Cogwright\'s first true machines. Put a number in, and exactly one bolt of lightning comes out. Never none, never two. A machine that gives two answers to the same question is broken, he said, and threw the broken ones in the canal.',
      math: [
        { h: 'Functions' },
        { p: 'A <b>function</b> is a relation where every input has <b>exactly one</b> output. If any input is paired with two different outputs, it is not a function.' },
        { fig: plane({ n: 5, segs: [[[-4, -3], [0, 4]], [[0, 4], [4, -3]]], vline: 2 }) },
        { p: '<b>Vertical line test:</b> if any vertical line crosses the graph more than once, it is not a function. This one passes: every vertical line crosses it once.' },
        { h: 'Function notation' },
        { cols: [['\\(f(x) = 2x + 5\\)', 'the same rule as \\(y = 2x + 5\\), named f'], ['\\(f(3)\\)', 'the output when the input is 3: \\(2(3) + 5 = 11\\)'], ['\\(f(x) = 9\\)', 'find the input: \\(2x + 5 = 9\\), so \\(x = 2\\)']] },
        { p: 'Careful: \\(f(3)\\) is not f times 3. It means "put 3 into f".' }
      ] },
    { title: 'The Engine\'s Log', lore: 'The Steam Behemoth kept a log of every hour of the city: when the furnaces were stoked and the pressure climbed, when it held steady, and when it fell. It still writes the log, though nobody reads it. You can read it as a graph.',
      math: [
        { h: 'Reading a story graph' },
        { fig: story([[0, 0], [2, 60], [4, 60], [5, 20], [8, 20]], ['increasing', 'constant', 'decreasing', 'constant'], 'Time (h)', 'Pressure') },
        { cols: [['Increasing', 'the graph rises left to right'], ['Constant', 'flat: no change'], ['Decreasing', 'falls left to right']] },
        { h: 'Rate of change' },
        { rule: '\\text{rate of change} = \\dfrac{\\text{change in output}}{\\text{change in input}}' },
        { p: 'From hour 0 to hour 2 the pressure rose by 60, so the rate is \\(60 \\div 2 = 30\\) per hour. From hour 4 to hour 5 it fell by 40: a rate of \\(-40\\) per hour. The steeper the piece, the faster the change.' }
      ] }
  ],
  L6: [
    { title: 'The First Rope', lore: 'The first climbers did not use the stair. They threw a rope from the foot of the cliff to the first ledge, straight across the corner, and climbed it. Every rope on the Stair still makes a right triangle with the rock: so far up, so far across, and the rope across the corner.',
      math: [
        { h: 'The Pythagorean theorem' },
        { rule: 'a^{2} + b^{2} = c^{2}' },
        { p: 'In a right triangle, \\(c\\) is the <b>hypotenuse</b>: the longest side, across from the right angle. \\(a\\) and \\(b\\) are the legs.' },
        { steps: ['a = 8,\\ b = 15', 'c^{2} = 8^{2} + 15^{2} = 64 + 225 = 289', 'c = \\sqrt{289} = 17'] },
        { p: 'Some triangles come out whole: 3-4-5, 5-12-13, 8-15-17. Most do not; round as the question asks. Legs 5 and 9: \\(c = \\sqrt{106} \\approx 10.3\\).' }
      ] },
    { title: 'Counting the Steps', lore: 'The Ledgelings never climb on the slant. They run straight along a ledge, or straight up a crack, counting their steps as they go. That is how they know every length on the cliff. For the slanted ones, they borrow the climbers\' rope.',
      math: [
        { h: 'Horizontal and vertical lengths' },
        { p: 'Same y: count across, \\(|x_2 - x_1|\\). Same x: count up, \\(|y_2 - y_1|\\). From \\((-3, 2)\\) to \\((5, 2)\\) is 8 units.' },
        { h: 'Any segment: a right triangle underneath' },
        { fig: plane({ n: 5, segs: [[[-3, -2], [3, 3]]], tri: [[-3, -2], [3, 3]], pts: [[-3, -2, 'A'], [3, 3, 'B']] }) },
        { rule: 'd = \\sqrt{(x_2 - x_1)^{2} + (y_2 - y_1)^{2}}' },
        { steps: ['A(-3, -2),\\ B(3, 3)', 'd = \\sqrt{(3 - (-3))^{2} + (3 - (-2))^{2}} = \\sqrt{36 + 25} = \\sqrt{61}', 'd \\approx 7.8'] },
        { p: 'The distance formula is just the Pythagorean theorem, with the run and the rise as the legs.' }
      ] },
    { title: 'The Pilgrim\'s Halfway', lore: 'The Hollow Pilgrim made it exactly halfway up the Stair before the cold took him. He still stands there, on the midpoint, and every climber who passes is asked the same question: if I am halfway, where does the stair end?',
      math: [
        { h: 'The midpoint' },
        { rule: 'M = \\left(\\dfrac{x_1 + x_2}{2},\\ \\dfrac{y_1 + y_2}{2}\\right)' },
        { p: 'Average the x-coordinates; average the y-coordinates.' },
        { steps: ['A(-2, 7),\\ B(4, -1)', 'M = \\left(\\dfrac{-2 + 4}{2},\\ \\dfrac{7 + (-1)}{2}\\right) = (1, 3)'] },
        { h: 'A missing endpoint' },
        { p: 'If you know one end and the midpoint, take the same trip again. From \\(A(1, 2)\\) to \\(M(4, 5)\\) is 3 across and 3 up; 3 across and 3 up again from M gives \\(B(7, 8)\\).' },
        { fig: plane({ n: 5, segs: [[[-3, -4], [3, 4]]], pts: [[-3, -4, 'A'], [0, 0, 'M (halfway)'], [3, 4, 'B']] }) }
      ] },
    { title: 'Rise Over Run', lore: 'The builders of the Stair measured every flight the same way: how high it rises, over how far it runs. A flight that rises 2 for every 3 it runs is gentle enough for a mule. The last flight, below the bell, rises and barely runs at all.',
      math: [
        { h: 'Slope' },
        { rule: 'm = \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{y_2 - y_1}{x_2 - x_1}' },
        { steps: ['(1, 2) \\text{ and } (5, 8)', 'm = \\dfrac{8 - 2}{5 - 1} = \\dfrac{6}{4} = \\dfrac{3}{2}'] },
        { p: 'Subtract in the <b>same order</b> on the top and the bottom, and write the slope in lowest terms.' },
        { h: 'Four kinds of slope' },
        { cols: [['Positive', 'rises left to right'], ['Negative', 'falls left to right'], ['Zero', 'horizontal: the rise is 0'], ['Undefined', 'vertical: the run is 0, and you cannot divide by 0']] },
        { p: 'As a <b>rate</b>, slope has units: a climber who gains 45 m in 3 minutes climbs at \\(15\\) m/min.' }
      ] },
    { title: 'Parallel Ropes', lore: 'The Rope Stalker strings its lines across the cliff with care. Three pitons on one rope must lie on one straight line. Two ropes that must never touch run with the same slope. And the rescue rope, the one that crosses them, meets them square.',
      math: [
        { h: 'Collinear points' },
        { p: 'Three points are on one line when the slope from the first to the second equals the slope from the second to the third.' },
        { h: 'Parallel and perpendicular' },
        { cols: [['Parallel', 'equal slopes: \\(\\dfrac{2}{3}\\) and \\(\\dfrac{2}{3}\\)'], ['Perpendicular', 'negative reciprocals: \\(\\dfrac{2}{3}\\) and \\(-\\dfrac{3}{2}\\); they multiply to \\(-1\\)'], ['Neither', 'anything else']] },
        { fig: plane({ n: 5, segs: [[[-4, -3], [2, 1]], [[-2, -5], [4, -1]], [[-3, 4], [1, -2], false, '#8fd3ff']] }) },
        { p: 'Flip the fraction and change the sign: the perpendicular slope of \\(-4\\) is \\(\\dfrac{1}{4}\\). A horizontal line (slope 0) is perpendicular to a vertical one (undefined).' }
      ] }
  ]  ,
  L7: [
    { title: 'The Carving on the Stone', lore: 'Every waystone in the Hills carries the same kind of carving: a number to start from, and a number to climb for every step across. The Thistlehares read them without thinking. Start at the y-intercept, then rise and run, and you can draw the road before you walk it.',
      math: [
        { h: 'Slope y-intercept form' },
        { rule: 'y = mx + b' },
        { p: '\\(m\\) is the <b>slope</b> (rise over run) and \\(b\\) is the <b>y-intercept</b>, where the line crosses the y-axis at \\((0, b)\\).' },
        { cols: [['\\(y = 3x - 2\\)', 'slope 3, y-intercept \\(-2\\)'], ['\\(y = -\\dfrac{1}{2}x + 4\\)', 'slope \\(-\\dfrac{1}{2}\\), y-intercept 4'], ['\\(y = 5 + 2x\\)', 'slope 2, y-intercept 5: the order of the terms does not matter']] },
        { h: 'Graphing from m and b' },
        { steps: ['y = \\dfrac{2}{3}x - 1', '\\text{Plot } (0, -1)', '\\text{Run 3 right, rise 2 up: } (3, 1)', '\\text{Join the points with a straight line}'] },
        { fig: plane({ n: 5, segs: [[[-3, -3], [4.5, 2]]], tri: [[0, -1], [3, 1]], pts: [[0, -1, '(0, -1)'], [3, 1, '(3, 1)']] }) }
      ] },
    { title: 'Is the Traveller on the Road?', lore: 'A traveller standing in the gorse is not on the road, however close she looks. The Waymark Imps settle it the honest way: put her x into the road\'s rule and see whether her y comes out.',
      math: [
        { h: 'Tables of values' },
        { p: 'Choose x-values, substitute, and record y. For \\(y = 2x + 1\\):' },
        { cols: [['x', '\\(-2\\quad -1\\quad 0\\quad 1\\quad 2\\)'], ['y', '\\(-3\\quad -1\\quad 1\\quad 3\\quad 5\\)']] },
        { p: 'Equal steps in x give equal steps in y: the relation is <b>linear</b>.' },
        { h: 'Does the point lie on the line?' },
        { steps: ['(4, 9) \\text{ on } y = 2x + 1?', 'y = 2(4) + 1 = 9', '\\text{Yes: the point is on the line}'] },
        { p: 'If the y that comes out is different from the point\'s y, the point is not on the line.' }
      ] },
    { title: 'Zero on the Right', lore: 'The Gorse Boars carry their rules the old way, every term on one side and nothing left over but zero. It is the same road as y = mx + b; it only looks different. The Hill Giants can tell at a glance when two carvings describe the same road.',
      math: [
        { h: 'General form' },
        { rule: 'Ax + By + C = 0' },
        { p: '\\(A\\), \\(B\\) and \\(C\\) are integers with no common factor, \\(A\\) is positive, and 0 stands alone on the right.' },
        { h: 'From y = mx + b to general form' },
        { steps: ['y = \\dfrac{2}{3}x - 4', '3y = 2x - 12', '0 = 2x - 3y - 12', '2x - 3y - 12 = 0'] },
        { h: 'From general form to y = mx + b' },
        { steps: ['4x + 2y - 6 = 0', '2y = -4x + 6', 'y = -2x + 3'] },
        { p: 'Move the x-term and the constant across (their signs change), then divide <b>every</b> term by the y-coefficient.' }
      ] },
    { title: 'Where the Road Meets the Axes', lore: 'Two waystones on every road are special: the one where it crosses the north road and the one where it crosses the east road. Find those two and you can draw any road in the Hills with a ruler.',
      math: [
        { h: 'Intercepts' },
        { cols: [['x-intercept', 'set \\(y = 0\\) and solve for x'], ['y-intercept', 'set \\(x = 0\\) and solve for y']] },
        { steps: ['3x - 4y - 12 = 0', 'y = 0:\\ 3x = 12,\\ x = 4 \\Rightarrow (4, 0)', 'x = 0:\\ -4y = 12,\\ y = -3 \\Rightarrow (0, -3)'] },
        { fig: plane({ n: 5, segs: [[[-1.33, -4], [5.5, 1.125]]], pts: [[4, 0, '(4, 0)'], [0, -3, '(0, -3)']] }) },
        { h: 'Horizontal and vertical lines' },
        { cols: [['\\(y = k\\)', 'horizontal, slope 0; general form \\(y - k = 0\\)'], ['\\(x = k\\)', 'vertical, slope undefined; general form \\(x - k = 0\\)']] }
      ] },
    { title: 'The Toll of the Old Road', lore: 'The Old Road Wyrm charges every traveller a fixed fee to set foot on its road, then so much for every mile. Merchants write its toll as a line, and so should you: the fee is where the line starts, and the rate is how steeply it climbs.',
      math: [
        { h: 'Writing the equation of a line' },
        { cols: [['Slope and y-intercept', 'write \\(y = mx + b\\) straight away'], ['Slope and a point', 'substitute the point into \\(y = mx + b\\) and solve for \\(b\\)'], ['Two points', 'find the slope first, then use either point']] },
        { steps: ['m = 3,\\ (2, 7)', '7 = 3(2) + b', 'b = 1', 'y = 3x + 1'] },
        { h: 'Fee plus rate' },
        { p: 'A toll of $6 plus $4 per mile: \\(C = 4d + 6\\). The rate is the slope; the fee is the starting value.' },
        { p: 'Two tolls cost the same where their lines cross: \\(4d + 6 = 2d + 14\\) gives \\(d = 4\\) miles.' }
      ] }
  ],
  L8: [
    { title: 'Where Two Roads Cross', lore: 'The market grew up at the one place that belongs to both great roads. A system of two equations is two roads, and its solution is that one place: the point that lies on both lines at once.',
      math: [
        { h: 'Solving by graphing' },
        { p: 'Graph both lines. The <b>point of intersection</b> is the solution.' },
        { fig: plane({ n: 5, segs: [[[-4, -3], [4, 5]], [[-4, 4], [4, -4], false, '#8fd3ff']], pts: [[0, 1, '(0, 1)']] }) },
        { p: '\\(y = x + 1\\) and \\(y = -x + 1\\) cross at \\((0, 1)\\).' },
        { h: 'Checking a solution' },
        { p: 'Substitute the point into <b>both</b> equations. It is the solution only if both are true.' }
      ] },
    { title: 'Parallel Roads', lore: 'Some roads out of the Crossroads run side by side to the mountains and never meet. Some turn out, on closer inspection, to be the very same road. The Mirrored Revenants walk them forever, asking travellers which is which.',
      math: [
        { h: 'How many solutions?' },
        { cols: [['One solution', 'different slopes: the lines cross once'], ['No solution', 'same slope, different y-intercepts: parallel lines'], ['Infinitely many', 'same slope and same y-intercept: the same line']] },
        { p: 'Without graphing: write both equations as \\(y = mx + b\\) and compare.' },
        { steps: ['y = 2x + 3 \\text{ and } 4x - 2y = 2', '4x - 2y = 2 \\Rightarrow y = 2x - 1', '\\text{Same slope, different } b: \\text{ no solution}'] }
      ] },
    { title: 'The Ogre\'s Trade', lore: 'The Toll Ogre makes every traveller trade one thing for another of equal worth. That is substitution: if one equation tells you what y is worth in x, trade it into the other equation, and only one unknown is left.',
      math: [
        { h: 'Substitution' },
        { steps: ['y = 2x - 1 \\text{ and } 3x + y = 14', '3x + (2x - 1) = 14', '5x = 15,\\ x = 3', 'y = 2(3) - 1 = 5', '(3, 5)'] },
        { p: 'Isolate a variable whose coefficient is 1 or \\(-1\\): no dividing, so no fractions.' }
      ] },
    { title: 'What Cancels', lore: 'Two merchants arguing at the same stall, one owing what the other is owed: add their accounts together and the debt disappears. Elimination works the same way. Line up the equations so one variable cancels, and add.',
      math: [
        { h: 'Elimination' },
        { steps: ['2x + 3y = 12 \\text{ and } 4x - 3y = 6', '\\text{Add: } 6x = 18,\\ x = 3', '2(3) + 3y = 12,\\ y = 2', '(3, 2)'] },
        { p: 'Opposite coefficients: <b>add</b>. Equal coefficients: <b>subtract</b>. Neither: multiply one or both equations first.' },
        { steps: ['x + 2y = 8 \\text{ and } 3x + 5y = 21', '\\times 3:\\ 3x + 6y = 24', '\\text{Subtract: } y = 3,\\ x = 2'] },
        { p: 'Always do the same thing to both sides of an equation.' }
      ] },
    { title: 'The Merchants\' Sums', lore: 'Every argument in the market has two facts in it: how many, and how much. Twelve coins, worth $1.80. Two kinds of sack, one cart, one total weight. Write a fact as an equation, write the other fact as a second equation, and the argument is over.',
      math: [
        { h: 'Word problems' },
        { steps: ['\\text{Let } a = \\text{adult tickets},\\ s = \\text{student tickets}', 'a + s = 50 \\quad\\text{(how many)}', '8a + 5s = 310 \\quad\\text{(how much)}', 's = 50 - a:\\ 8a + 250 - 5a = 310', 'a = 20,\\ s = 30'] },
        { p: 'Define the variables first. Then one equation for the count and one for the value.' },
        { h: 'Two plans' },
        { p: 'Plan A: $20 plus $3 per day. Plan B: $8 plus $5 per day. Equal where \\(3d + 20 = 5d + 8\\): \\(d = 6\\). Fewer than 6 days, B is cheaper; more, A is.' }
      ] }
  ]
  };
})();
if (typeof module !== 'undefined') module.exports = LOREBOOK;
