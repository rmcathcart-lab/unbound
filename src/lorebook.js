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
  ]
  };
})();
if (typeof module !== 'undefined') module.exports = LOREBOOK;
