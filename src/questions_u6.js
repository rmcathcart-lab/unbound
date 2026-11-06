/* ===================== LAND 6 · THE SHEER STAIR · Math 15 Unit 6 · CHARACTERISTICS OF LINEAR RELATIONS (RF3) =====================
 * Registered into QGen.GENS as RF3D_* (the Pythagorean theorem, length, distance and midpoint) and RF3S_* (slope: rise
 * over run, types of slope, rate of change, collinearity, parallel and perpendicular).
 * The template library is shared with Lorebound (Math 10C, questions_u6.js) so fixes carry across; the arrays below it are
 * re-chosen for Math 15 and pitched like Ryan's Math 15 Unit 6 test (math15 js/lessons/u6test.js), calculator allowed:
 *   BEG  each lesson's core skill as first taught: a hypotenuse from two legs, horizontal / vertical lengths, a graphed
 *        segment's length, a midpoint, rise over run off a grid or two points, zero / undefined, the type of a slope, a
 *        ramp's slope, parallel / perpendicular / neither from two slopes;
 *   PRG  the typical assignment question: distance to the nearest tenth or hundredth, a midpoint with negatives, a
 *        missing endpoint, a scaled map, run or rise from a slope, a perpendicular slope, slope as a rate from a table,
 *        the slope test for three points;
 *   MAS  Math 15's hardest items, easier than Lorebound's: a trail's far end and length from its midpoint bench, a
 *        missing coordinate from a midpoint, collinearity, parallel or perpendicular segments, where the right angle
 *        is, a student's slope error.
 * Exact mixed-radical distances, algebraic midpoints and the two-answer distance problem are left out (Math 10C).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function simpSqrt(n) { var k = 1; for (var p = 2; p * p <= n; p++) while (n % (p * p) === 0) { n /= p * p; k *= p; } return [k, n]; } // k√n
  function rad(n) { var s = simpSqrt(n); if (s[1] === 1) return String(s[0]); return (s[0] === 1 ? '' : s[0]) + '\\sqrt{' + s[1] + '}'; }
  function halfTex(v) { return v % 2 === 0 ? String(v / 2) : frac(v, 2); }
  function nearHalf(v, scale) { var f = v * scale; f = f - Math.floor(f); return Math.abs(f - 0.5) < 0.03; } // rounding would be ambiguous
  function words(w) { return [w, w.charAt(0).toUpperCase() + w.slice(1)]; } // a typed word is read as a product of letters, so list both capitalisations
  function fracRaw(n, d) { if (d < 0) { n = -n; d = -d; } return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; } // NOT reduced
  // The word "undefined" is shown through an HTML entity and keyed as two \text groups: the checker reads both as the same product of letters a student types,
  // while the literal word stays out of the generated strings (the self-test scans them for accidental "undefined"s).
  var UNDEF = 'undefin&#101;d', UNDEF_ANS = ['\\text{undefi}\\text{ned}', '\\text{Undefi}\\text{ned}'];
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];

  /* ---------- RF3 D · length of a segment, distance, midpoint ---------- */
  var D_BEG = [
    function () { // horizontal or vertical segment
      var horiz = Math.random() < 0.5, c = nz(-7, 7), a = nz(-9, 9), b = nz(-9, 9); while (Math.abs(b - a) < 2) b = nz(-9, 9);
      var P = horiz ? pt(a, c) : pt(c, a), Q = horiz ? pt(b, c) : pt(c, b), len = Math.abs(a - b);
      return { prompt: 'Determine the length of the line segment from ' + T('P' + P) + ' to ' + T('Q' + Q) + '.', type: 'num', answers: [String(len)], tol: 0,
        hint: 'The segment is ' + (horiz ? 'horizontal: the y-values match, so count how far apart the x-values are.' : 'vertical: the x-values match, so count how far apart the y-values are.'),
        solution: steps([T('|' + a + ' - (' + b + ')| = ' + len) + '.']) };
    },
    function () { // algebraic coordinates, horizontal
      var d1 = ri(1, 6), d2 = ri(1, 7), v = pick(['a', 'k', 'p']), w = pick(['b', 'm', 'q']);
      return { prompt: 'Find the length of the line segment from ' + T('M(' + v + ' - ' + d1 + ',\\ ' + w + ')') + ' to ' + T('N(' + v + ' + ' + d2 + ',\\ ' + w + ')') + '.', type: 'num', answers: [String(d1 + d2)], tol: 0,
        hint: 'Same y-coordinate, so the length is the difference of the x-coordinates.',
        solution: steps([T('(' + v + ' + ' + d2 + ') - (' + v + ' - ' + d1 + ') = ' + d2 + ' + ' + d1 + ' = ' + (d1 + d2)) + '.']) };
    },
    function () { // Pythagoras on a graphed segment (triple)
      var tr = pick(TRIPLES.slice(0, 4)), x1 = ri(-5, 0), y1 = ri(-5, 0), sx = pick([1, -1]), sy = pick([1, -1]);
      var x2 = x1 + sx * tr[0], y2 = y1 + sy * tr[1]; if (Math.abs(x2) > 8 || Math.abs(y2) > 8) { x1 = -4; y1 = -4; x2 = x1 + tr[0]; y2 = y1 + tr[1]; }
      return { prompt: 'Segment ' + T('AB') + ' is graphed. Use the run, the rise and the Pythagorean theorem to find its length.' + Fig.grid({ xmin: -9, xmax: 9, ymin: -9, ymax: 9, segments: [[x1, y1, x2, y2]], points: [[x1, y1, 'A'], [x2, y2, 'B']] }), type: 'num', answers: [String(tr[2])], tol: 0,
        hint: 'Run = ' + tr[0] + ', rise = ' + tr[1] + '. Length² = run² + rise².',
        solution: steps([T('\\text{run} = ' + tr[0] + ',\\ \\text{rise} = ' + tr[1]), T('AB = \\sqrt{' + tr[0] + '^{2} + ' + tr[1] + '^{2}} = \\sqrt{' + (tr[2] * tr[2]) + '} = ' + tr[2]) + '.']) };
    },
    function () { // midpoint with even sums
      var x1 = nz(-8, 8), y1 = nz(-8, 8), x2 = x1 + 2 * nz(-4, 4), y2 = y1 + 2 * nz(-4, 4);
      return { prompt: 'Determine the midpoint of the segment joining ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + '. Type an ordered pair.', type: 'expr', answers: [pt((x1 + x2) / 2, (y1 + y2) / 2)], check: 'exact',
        hint: 'Average the x-coordinates and average the y-coordinates.',
        solution: steps([T('M = \\left(\\dfrac{' + x1 + ' + ' + x2 + '}{2},\\ \\dfrac{' + y1 + ' + ' + y2 + '}{2}\\right) = ' + pt((x1 + x2) / 2, (y1 + y2) / 2)) + '.']) };
    },
    function () { // perimeter of a right triangle built on a triple
      var tr = pick(TRIPLES), x = nz(-6, 4), y = nz(-6, 4), P = pt(x, y), Q = pt(x, y + tr[1]), R = pt(x + tr[0], y);
      return { prompt: 'A triangle has vertices ' + T('P' + P) + ', ' + T('Q' + Q) + ' and ' + T('R' + R) + '. Find its perimeter.', type: 'num', answers: [String(tr[0] + tr[1] + tr[2])], tol: 0,
        hint: 'PQ is vertical and PR is horizontal; QR is the hypotenuse of a right triangle.',
        solution: steps([T('PQ = ' + tr[1] + ',\\ PR = ' + tr[0]), T('QR = \\sqrt{' + tr[0] + '^{2} + ' + tr[1] + '^{2}} = ' + tr[2]), T('P = ' + tr[1] + ' + ' + tr[0] + ' + ' + tr[2] + ' = ' + (tr[0] + tr[1] + tr[2])) + '.']) };
    },
    function () { // (3a) centre of a circle from the endpoints of a diameter
      var x1 = nz(-8, 8), y1 = nz(-8, 8), x2 = x1 + 2 * nz(-4, 4), y2 = y1 + 2 * nz(-4, 4), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return { prompt: T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + ' are the endpoints of a diameter of a circle. Determine the coordinates of the centre. Type an ordered pair.', type: 'expr', answers: [pt(mx, my)], check: 'exact',
        hint: 'The centre of a circle is the midpoint of any diameter: average the x-coordinates and average the y-coordinates.',
        solution: steps(['The centre is the midpoint of the diameter ' + T('AB') + '.', T('C = \\left(\\dfrac{' + x1 + ' + ' + x2 + '}{2},\\ \\dfrac{' + y1 + ' + ' + y2 + '}{2}\\right) = ' + pt(mx, my)) + '.']) };
    }
  ];

  var D_PRG = [
    function () { // exact distance: mixed radical (75%), or a plain √n / whole number (25%)
      var mode = Math.random() < 0.25 ? pick(['sqrt', 'int']) : 'mixed', dx, dy, sq, s;
      if (mode === 'int') { var tr = pick(TRIPLES.slice(0, 4)); dx = tr[0]; dy = tr[1]; }
      else if (mode === 'sqrt') { do { dx = ri(1, 9); dy = ri(1, 9); sq = dx * dx + dy * dy; s = simpSqrt(sq); } while (s[0] !== 1); }
      else { do { dx = pick([2, 4, 6, 8, 3, 9, 5]); dy = pick([4, 6, 2, 8, 12, 1, 5]); sq = dx * dx + dy * dy; s = simpSqrt(sq); } while (s[1] === 1 || s[0] === 1); }
      sq = dx * dx + dy * dy; s = simpSqrt(sq);
      var x1 = nz(-7, 5), y1 = nz(-7, 5), x2 = x1 + dx * pick([1, -1]), y2 = y1 + dy * pick([1, -1]);
      var last = mode === 'mixed' ? T('\\sqrt{' + sq + '} = \\sqrt{' + (s[0] * s[0]) + ' \\cdot ' + s[1] + '} = ' + rad(sq)) + '.'
        : mode === 'sqrt' ? T(String(sq)) + ' has no perfect-square factor, so ' + T('\\sqrt{' + sq + '}') + ' is already in simplest form.'
        : T(String(sq)) + ' is a perfect square: ' + T('\\sqrt{' + sq + '} = ' + rad(sq)) + '.';
      return { prompt: 'Find the <b>exact</b> distance between ' + T('P' + pt(x1, y1)) + ' and ' + T('Q' + pt(x2, y2)) + '. ' + (mode === 'mixed' ? 'Write it as a mixed radical in simplest form.' : 'Write it in simplest form.'), type: 'expr', answers: [rad(sq)], check: 'exact',
        hint: 'd = √((x₂ − x₁)² + (y₂ − y₁)²). Then simplify the radical: pull out the largest perfect-square factor (the whole thing may be a perfect square).',
        solution: steps([T('d = \\sqrt{(' + x2 + ' - (' + x1 + '))^{2} + (' + y2 + ' - (' + y1 + '))^{2}} = \\sqrt{' + (dx * dx) + ' + ' + (dy * dy) + '} = \\sqrt{' + sq + '}'), last]) };
    },
    function () { // midpoint with a fraction (the decimal form is accepted too)
      var x1 = nz(-8, 8), y1 = nz(-8, 8), x2 = x1 + 2 * nz(-4, 4) + 1, y2 = y1 + 2 * nz(-4, 4);
      var fr = '(' + halfTex(x1 + x2) + ',' + halfTex(y1 + y2) + ')', de = pt(num((x1 + x2) / 2), num((y1 + y2) / 2));
      return { prompt: 'Determine the midpoint of the segment with endpoints ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + '. Type an ordered pair; use a fraction where needed.', type: 'expr', answers: fr === de ? [fr] : [fr, de], check: 'exact',
        hint: 'Average each coordinate. An odd sum divided by 2 stays a fraction.',
        solution: steps([T('M = \\left(\\dfrac{' + x1 + ' + ' + x2 + '}{2},\\ \\dfrac{' + y1 + ' + ' + y2 + '}{2}\\right) = \\left(' + halfTex(x1 + x2) + ',\\ ' + halfTex(y1 + y2) + '\\right)') + '.']) };
    },
    function () { // endpoint from the midpoint
      var mx = nz(-6, 6), my = nz(-6, 6), ax = nz(-9, 9), ay = nz(-9, 9); var bx = 2 * mx - ax, by = 2 * my - ay;
      return { prompt: T('M' + pt(mx, my)) + ' is the midpoint of segment ' + T('AB') + '. If ' + T('A') + ' is ' + T(pt(ax, ay)) + ', find the coordinates of ' + T('B') + '. Type an ordered pair.', type: 'expr', answers: [pt(bx, by)], check: 'exact',
        hint: 'The midpoint is the average: (a + b)/2 = m, so b = 2m − a for each coordinate.',
        solution: steps([T('x_B = 2(' + mx + ') - (' + ax + ') = ' + bx), T('y_B = 2(' + my + ') - (' + ay + ') = ' + by), T('B' + pt(bx, by)) + '.']) };
    },
    function () { // perimeter to the nearest tenth
      var pts = []; while (pts.length < 3) { var x = ri(-6, 6), y = ri(-6, 6); if (pts.some(function (p) { return p[0] === x && p[1] === y; })) continue; pts.push([x, y]); }
      var d = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }, per = d(pts[0], pts[1]) + d(pts[1], pts[2]) + d(pts[2], pts[0]);
      if (per < 6) return D_PRG[3]();
      return { prompt: 'A triangle has vertices ' + T('A' + pt(pts[0][0], pts[0][1])) + ', ' + T('B' + pt(pts[1][0], pts[1][1])) + ' and ' + T('C' + pt(pts[2][0], pts[2][1])) + '. Find its perimeter, to the nearest tenth of a unit.', type: 'num', answers: [num(Math.round(per * 10) / 10)], tol: 0.06,
        hint: 'Use the distance formula three times and add. Round only at the end.',
        solution: steps([T('AB = ' + num(Math.round(d(pts[0], pts[1]) * 100) / 100)), T('BC = ' + num(Math.round(d(pts[1], pts[2]) * 100) / 100)), T('CA = ' + num(Math.round(d(pts[2], pts[0]) * 100) / 100)), 'Perimeter ' + T('\\approx ' + num(Math.round(per * 10) / 10)) + '.']) };
    },
    function () { // graphed segment: mixed radical (75%), or a plain √n / whole number (25%)
      var mode = Math.random() < 0.25 ? pick(['sqrt', 'int']) : 'mixed', dx, dy, sq, s;
      if (mode === 'int') { var tr = pick([[3, 4], [4, 3], [6, 8], [8, 6]]); dx = tr[0]; dy = tr[1]; }
      else if (mode === 'sqrt') { do { dx = ri(1, 7); dy = ri(1, 7); sq = dx * dx + dy * dy; s = simpSqrt(sq); } while (s[0] !== 1); }
      else { do { dx = pick([2, 4, 6, 3]); dy = pick([4, 6, 2, 8, 1]); sq = dx * dx + dy * dy; s = simpSqrt(sq); } while (s[1] === 1 || s[0] === 1); }
      sq = dx * dx + dy * dy; s = simpSqrt(sq);
      var x1 = ri(-6, 0), y1 = ri(-6, 0), x2 = x1 + dx, y2 = y1 + dy;
      var ask = mode === 'mixed' ? 'Give its length as an <b>exact</b> mixed radical in simplest form.' : 'Give its <b>exact</b> length in simplest form.';
      var fin = mode === 'mixed' ? T('\\sqrt{' + sq + '} = \\sqrt{' + (s[0] * s[0]) + ' \\cdot ' + s[1] + '} = ' + rad(sq)) : mode === 'sqrt' ? T('\\sqrt{' + sq + '}') + ' has no perfect-square factor, so it is already simplest.' : T('\\sqrt{' + sq + '} = ' + rad(sq));
      return { prompt: 'Segment ' + T('AB') + ' is graphed. ' + ask + Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, segments: [[x1, y1, x2, y2]], points: [[x1, y1, 'A'], [x2, y2, 'B']] }), type: 'expr', answers: [rad(sq)], check: 'exact',
        hint: 'Count the run and the rise, then AB = √(run² + rise²), simplified.',
        solution: steps([T('\\text{run} = ' + dx + ',\\ \\text{rise} = ' + dy), T('AB = \\sqrt{' + (dx * dx) + ' + ' + (dy * dy) + '} = \\sqrt{' + sq + '}'), fin + '.']) };
    },
    function () { // (1) distance to the nearest hundredth (one time in three with one-decimal coordinates)
      var dec = Math.random() < 1 / 3, sc = dec ? 10 : 1, dx, dy, sq;
      do { dx = dec ? ri(30, 120) : ri(3, 12); dy = dec ? ri(10, 120) : ri(1, 12); sq = dx * dx + dy * dy; } while (Math.sqrt(sq) % 1 === 0);
      var x1, y1; do { x1 = dec ? ri(-90, 90) : nz(-9, 9); y1 = dec ? ri(-90, 90) : nz(-9, 9); } while (dec && (x1 % 10 === 0 || y1 % 10 === 0));
      var sx = pick([1, -1]), sy = pick([1, -1]), x2 = x1 + sx * dx, y2 = y1 + sy * dy;
      var X1 = num(x1 / sc), Y1 = num(y1 / sc), X2 = num(x2 / sc), Y2 = num(y2 / sc), DX = num(sx * dx / sc), DY = num(sy * dy / sc);
      var d = Math.sqrt(sq) / sc, ans = num(Math.round(d * 100) / 100), nm = dec ? ['R', 'S'] : ['P', 'Q'];
      return { prompt: 'Determine the distance, to the nearest hundredth, between ' + T(nm[0] + pt(X1, Y1)) + ' and ' + T(nm[1] + pt(X2, Y2)) + '. (Number only.)', type: 'num', answers: [ans], tol: 0.006,
        hint: 'd = √((x₂ − x₁)² + (y₂ − y₁)²). Subtract carefully with the signs, square, add, then take the square root and round to two decimal places.',
        solution: steps([T('d = \\sqrt{(' + X2 + ' - (' + X1 + '))^{2} + (' + Y2 + ' - (' + Y1 + '))^{2}}'), T('d = \\sqrt{(' + DX + ')^{2} + (' + DY + ')^{2}} = \\sqrt{' + num(dx * dx / sc / sc) + ' + ' + num(dy * dy / sc / sc) + '} = \\sqrt{' + num(sq / sc / sc) + '}'), T('d \\approx ' + ans) + '.']) };
    },
    function () { // (2) distance on a scaled map
      var s = pick([2, 5, 10]), dx, dy, d;
      do { dx = ri(1, 9); dy = ri(1, 9); d = s * Math.hypot(dx, dy); } while (nearHalf(d, 1));
      var x1 = ri(1, 9), y1 = ri(1, 9), x2 = x1 + dx, y2 = y1 + dy, flip = Math.random() < 0.5;
      var L = flip ? [x2, y2] : [x1, y1], S = flip ? [x1, y1] : [x2, y2], sq = dx * dx + dy * dy, units = Math.sqrt(sq), ans = String(Math.round(d));
      return { prompt: 'A map is drawn on a grid where 1 unit represents ' + T(String(s)) + ' km. A lookout is at ' + T('L' + pt(L[0], L[1])) + ' and a ranger station at ' + T('S' + pt(S[0], S[1])) + '. Determine the distance between them, to the nearest kilometre. (Number only.)', type: 'num', answers: [ans], tol: 0,
        hint: 'Find the distance in grid units with the distance formula, then multiply by ' + s + ' km per unit. Round only at the end.',
        solution: steps([T('LS = \\sqrt{' + dx + '^{2} + ' + dy + '^{2}} = \\sqrt{' + sq + '} \\approx ' + num(Math.round(units * 100) / 100)) + ' units', 'Each unit is ' + s + ' km: ' + T(s + ' \\times \\sqrt{' + sq + '} \\approx ' + num(Math.round(d * 100) / 100)), 'To the nearest kilometre, the distance is ' + T(ans) + ' km.']) };
    },
    function () { // (3b) diameter of a circle from its centre and a point on it
      var cx, cy, px, py, r;
      do { cx = nz(-6, 6); cy = nz(-6, 6); px = cx + nz(-7, 7); py = cy + nz(-7, 7); r = Math.hypot(px - cx, py - cy); } while (r % 1 === 0 || nearHalf(2 * r, 10));
      var sq = (px - cx) * (px - cx) + (py - cy) * (py - cy), ans = num(Math.round(2 * r * 10) / 10);
      return { prompt: 'Determine the diameter, to the nearest tenth, of the circle with centre ' + T('C' + pt(cx, cy)) + ' which passes through ' + T('P' + pt(px, py)) + '. (Number only.)', type: 'num', answers: [ans], tol: 0.06,
        hint: 'CP is a radius. Find its length with the distance formula, then double it for the diameter.',
        solution: steps([T('r = CP = \\sqrt{(' + px + ' - (' + cx + '))^{2} + (' + py + ' - (' + cy + '))^{2}} = \\sqrt{' + sq + '} \\approx ' + num(Math.round(r * 1000) / 1000)), T('d = 2r = 2\\sqrt{' + sq + '} \\approx ' + ans) + '.']) };
    }
  ];

  var D_MAS = [
    function () { // midpoint with algebraic coordinates
      var k = pick(['k', 'a', 't']), p = ri(1, 6), q = ri(1, 9), r = ri(1, 6), s = ri(1, 9); // A(p k - q, ...) B(r k + s, ...)
      var c1 = ri(1, 5), d1 = ri(1, 9), c2 = -ri(1, 5), d2 = ri(1, 9);
      // x: (p k - q + r k + s)/2 ; make sums even
      if ((p + r) % 2) r++; if ((s - q) % 2) s++; if ((c1 + c2) % 2) c2--; if ((d1 + d2) % 2) d2++;
      var mxk = (p + r) / 2, mxc = (s - q) / 2, myk = (c1 + c2) / 2, myc = (d1 + d2) / 2;
      function term(kc, cc) { var t = kc === 0 ? '' : (kc === 1 ? k : kc === -1 ? '-' + k : kc + k); if (cc !== 0) t += (t ? (cc < 0 ? '-' : '+') : (cc < 0 ? '-' : '')) + Math.abs(cc); return t || '0'; }
      var A = '(' + p + k + ' - ' + q + ',\\ ' + c1 + k + ' + ' + d1 + ')', B = '(' + r + k + ' + ' + s + ',\\ ' + (c2 === -1 ? '-' : c2) + k + ' + ' + d2 + ')';
      return { prompt: 'Find the midpoint of the segment joining ' + T('A' + A) + ' and ' + T('B' + B) + '. Simplify each coordinate. Type an ordered pair, like ' + T('(k + 1,\\ 3k)') + '.', type: 'expr', answers: ['(' + term(mxk, mxc) + ',' + term(myk, myc) + ')'], check: 'exact',
        hint: 'Add the x-coordinates (collect the ' + k + ' terms and the numbers), divide by 2; same for y.',
        solution: steps([T('x_M = \\dfrac{(' + p + k + ' - ' + q + ') + (' + r + k + ' + ' + s + ')}{2} = \\dfrac{' + (p + r) + k + sgnTex(s - q) + '}{2} = ' + term(mxk, mxc)), T('y_M = \\dfrac{(' + c1 + k + ' + ' + d1 + ') + (' + c2 + k + ' + ' + d2 + ')}{2} = \\dfrac{' + (c1 + c2) + k + ' + ' + (d1 + d2) + '}{2} = ' + term(myk, myc)), T('M(' + term(mxk, mxc) + ',\\ ' + term(myk, myc) + ')') + '.']) };
      function sgnTex(v) { return v < 0 ? ' - ' + Math.abs(v) : ' + ' + v; }
    },
    function () { // exact radius from diameter endpoints
      var dx = pick([4, 6, 8, 12, 2]), dy = pick([2, 4, 6, 8, 10]); var sq = dx * dx + dy * dy, s = simpSqrt(sq);
      while (s[1] === 1 || s[0] % 2) { dx = pick([4, 6, 8, 12, 2]); dy = pick([2, 4, 6, 8, 10]); sq = dx * dx + dy * dy; s = simpSqrt(sq); }
      var x1 = nz(-7, 5), y1 = nz(-7, 5), x2 = x1 + dx, y2 = y1 - dy; var rk = s[0] / 2;
      return { prompt: T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + ' are the endpoints of a diameter of a circle. Find the <b>exact radius</b>, as a mixed radical in simplest form.', type: 'expr', answers: [(rk === 1 ? '' : rk) + '\\sqrt{' + s[1] + '}'], check: 'exact',
        hint: 'Find the diameter with the distance formula, simplify the radical, then halve it.',
        solution: steps([T('AB = \\sqrt{' + (dx * dx) + ' + ' + (dy * dy) + '} = \\sqrt{' + sq + '} = ' + rad(sq)), T('r = \\dfrac{' + rad(sq) + '}{2} = ' + (rk === 1 ? '' : rk) + '\\sqrt{' + s[1] + '}') + '.']) };
    },
    function () { // unknown coordinate from a given distance (two answers)
      var tr = pick(TRIPLES.slice(0, 4)), qx = nz(-5, 5), qy = nz(-5, 5), py = qy + tr[1] * pick([1, -1]); var xa = qx + tr[0], xb = qx - tr[0];
      return { prompt: 'The point ' + T('P(x,\\ ' + py + ')') + ' is ' + T(String(tr[2])) + ' units from ' + T('Q' + pt(qx, qy)) + '. Determine both possible values of ' + T('x') + '.', type: 'expr', answers: ['x=' + xa + ', x=' + xb], check: 'equivalent', note: 'Type both, e.g. ' + T('x = 3, x = -1') + '.',
        hint: 'Use the distance formula with the unknown x, square both sides, and solve (x − ' + qx + ')² = ' + (tr[0] * tr[0]) + '.',
        solution: steps([T('(x - (' + qx + '))^{2} + (' + py + ' - (' + qy + '))^{2} = ' + tr[2] + '^{2}'), T('(x - (' + qx + '))^{2} = ' + (tr[2] * tr[2]) + ' - ' + (tr[1] * tr[1]) + ' = ' + (tr[0] * tr[0])), T('x - (' + qx + ') = \\pm ' + tr[0]) + ', so ' + T('x = ' + xa) + ' or ' + T('x = ' + xb) + '.']) };
    },
    function () { // area of a tilted right triangle: find the right angle with slopes, the legs with the distance formula
      var V, u, k1, k2, A0, tries = 0;
      do { u = [ri(1, 3), nz(-3, 3)]; k1 = pick([1, 2]); k2 = pick([1, 2]); A0 = [nz(-5, 5), nz(-5, 5)];
        V = [A0, [A0[0] + k1 * u[0], A0[1] + k1 * u[1]], [A0[0] - k2 * u[1], A0[1] + k2 * u[0]]]; // right angle at V[0]
      } while (!V.every(function (p) { return Math.abs(p[0]) <= 9 && Math.abs(p[1]) <= 9; }) && ++tries < 200);
      var u2 = u[0] * u[0] + u[1] * u[1], area = k1 * k2 * u2 / 2;
      var order = [0, 1, 2]; for (var i = 2; i > 0; i--) { var j = ri(0, i); var t = order[i]; order[i] = order[j]; order[j] = t; }
      var names = ['P', 'Q', 'R'], W = order.map(function (o) { return V[o]; }), rt = names[order.indexOf(0)], o1 = names[order.indexOf(1)], o2 = names[order.indexOf(2)];
      var l1 = k1 * k1 * u2, l2 = k2 * k2 * u2;
      return { prompt: 'A triangle has vertices ' + T('P' + pt(W[0][0], W[0][1])) + ', ' + T('Q' + pt(W[1][0], W[1][1])) + ' and ' + T('R' + pt(W[2][0], W[2][1])) + '. It is a right triangle. Determine its area, in square units. (Number only.)', type: 'num', answers: [num(area)], tol: 0,
        hint: 'Use slopes to find the two sides that are perpendicular (slopes that multiply to −1): they are the base and the height. Find their lengths with the distance formula, then area = ½ × base × height.',
        solution: steps([T('m_{' + rt + o1 + '} = ' + frac(u[1], u[0])) + ' and ' + T('m_{' + rt + o2 + '} = ' + frac(u[0], -u[1])) + ' are negative reciprocals, so the right angle is at ' + T(rt) + '.', T(rt + o1 + ' = \\sqrt{' + l1 + '}' + (rad(l1) === '\\sqrt{' + l1 + '}' ? '' : ' = ' + rad(l1))) + ' and ' + T(rt + o2 + ' = \\sqrt{' + l2 + '}' + (rad(l2) === '\\sqrt{' + l2 + '}' ? '' : ' = ' + rad(l2))) + '.', T('A = \\tfrac{1}{2}\\sqrt{' + l1 + '}\\sqrt{' + l2 + '} = \\tfrac{1}{2}\\sqrt{' + (l1 * l2) + '} = ' + num(area)) + ' square units.']) };
    },
    function () { // distance between the midpoints of two sides (midsegment = half the third side)
      var tr = pick(TRIPLES), ax = nz(-6, 2), ay = nz(-6, 2); var B = [ax + 2 * tr[0], ay], C = [ax, ay + 2 * tr[1]]; // BC = 2*tr[2]
      if (Math.abs(B[0]) > 14 || Math.abs(C[1]) > 14) { tr = TRIPLES[0]; B = [ax + 6, ay]; C = [ax, ay + 8]; }
      var M = [(ax + B[0]) / 2, (ay + B[1]) / 2], N = [(ax + C[0]) / 2, (ay + C[1]) / 2], len = Math.hypot(M[0] - N[0], M[1] - N[1]);
      return { prompt: 'Triangle ' + T('ABC') + ' has vertices ' + T('A' + pt(ax, ay)) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C' + pt(C[0], C[1])) + '. ' + T('M') + ' is the midpoint of ' + T('AB') + ' and ' + T('N') + ' is the midpoint of ' + T('AC') + '. Determine the length of ' + T('MN') + '.', type: 'num', answers: [num(len)], tol: 0,
        hint: 'Find both midpoints first, then use the distance formula on MN.',
        solution: steps([T('M = ' + pt(M[0], M[1]) + ',\\ N = ' + pt(N[0], N[1])), T('MN = \\sqrt{' + Math.abs(M[0] - N[0]) + '^{2} + ' + Math.abs(M[1] - N[1]) + '^{2}} = ' + num(len)) + ' (half of BC).']) };
    },
    function () { // (4) unknown endpoint coordinate from the midpoint
      var mx = nz(-6, 6), a = nz(-8, 8), b = a + 2 * nz(-4, 4), my = (a + b) / 2, px = nz(-9, 9), x = 2 * mx - px;
      return { prompt: T('M' + pt(mx, my)) + ' is the midpoint of ' + T('AB') + ', where ' + T('A(x,\\ ' + a + ')') + ' and ' + T('B(' + px + ',\\ ' + b + ')') + '. Determine ' + T('x') + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'The x-coordinate of the midpoint is the average of the two x-coordinates: (x + ' + px + ')/2 = ' + mx + '. Solve for x.',
        solution: steps([T('\\dfrac{x + (' + px + ')}{2} = ' + mx), T('x + (' + px + ') = ' + (2 * mx)), T('x = ' + (2 * mx) + ' - (' + px + ') = ' + x) + '.', 'Check the y-coordinates: ' + T('\\dfrac{' + a + ' + (' + b + ')}{2} = ' + my) + '. ✓']) };
    },
    function () { // (5) length of a median
      var A, B, C, D, len, cross;
      do { A = [nz(-6, 6), nz(-6, 6)]; B = [nz(-6, 6), nz(-6, 6)]; C = [nz(-6, 6), nz(-6, 6)]; D = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
        cross = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]); len = Math.hypot(D[0] - A[0], D[1] - A[1]);
      } while (cross === 0 || (B[0] === C[0] && B[1] === C[1]) || len < 1.5 || len % 1 === 0 || nearHalf(len, 10));
      var sq = (D[0] - A[0]) * (D[0] - A[0]) + (D[1] - A[1]) * (D[1] - A[1]), ans = num(Math.round(len * 10) / 10);
      return { prompt: 'A median joins a vertex to the midpoint of the opposite side. ' + T('\\triangle ABC') + ' has vertices ' + T('A' + pt(A[0], A[1])) + ', ' + T('B' + pt(B[0], B[1])) + ', ' + T('C' + pt(C[0], C[1])) + '. Determine the length of median ' + T('AD') + ', to the nearest tenth. (Number only.)', type: 'num', answers: [ans], tol: 0.06,
        hint: 'D is the midpoint of BC (average the coordinates of B and C). Then use the distance formula on AD.',
        solution: steps([T('D = \\left(\\dfrac{' + B[0] + ' + (' + C[0] + ')}{2},\\ \\dfrac{' + B[1] + ' + (' + C[1] + ')}{2}\\right) = ' + pt(num(D[0]), num(D[1]))), T('AD = \\sqrt{(' + num(D[0]) + ' - (' + A[0] + '))^{2} + (' + num(D[1]) + ' - (' + A[1] + '))^{2}} = \\sqrt{' + num(sq) + '}'), T('AD \\approx ' + ans) + '.']) };
    },
    function () { // (14) scalene or isosceles?
      var iso = Math.random() < 0.5, P, M, dx, dy, t, s2, ok;
      do {
        if (iso) { // base GH with an integer midpoint; apex on the perpendicular bisector
          var G = [nz(-6, 6), nz(-6, 6)]; dx = 2 * nz(-3, 3); dy = 2 * ri(-3, 3); var H = [G[0] + dx, G[1] + dy]; M = [(G[0] + H[0]) / 2, (G[1] + H[1]) / 2]; t = nz(-2, 2);
          P = [G, H, [M[0] - t * dy / 2, M[1] + t * dx / 2]];
        } else P = [[nz(-6, 6), nz(-6, 6)], [nz(-6, 6), nz(-6, 6)], [nz(-6, 6), nz(-6, 6)]];
        s2 = [0, 1, 2].map(function (i) { var a = P[i], b = P[(i + 1) % 3]; return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }); // GH², HJ², JG²
        var cross = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]);
        var inRange = P.every(function (p) { return Math.abs(p[0]) <= 9 && Math.abs(p[1]) <= 9; });
        var equalPairs = (s2[0] === s2[1] ? 1 : 0) + (s2[1] === s2[2] ? 1 : 0) + (s2[0] === s2[2] ? 1 : 0);
        ok = cross !== 0 && inRange && s2.every(function (v) { return v > 0; }) && (iso ? equalPairs === 1 : equalPairs === 0);
      } while (!ok);
      var order = [0, 1, 2]; for (var i = 2; i > 0; i--) { var j = ri(0, i); var tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
      var V = order.map(function (o) { return P[o]; }), names = ['G', 'H', 'J'], ans = iso ? 'isosceles' : 'scalene';
      var sides = [0, 1, 2].map(function (i) { var a = V[i], b = V[(i + 1) % 3], q = (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); return T(names[i] + names[(i + 1) % 3] + ' = \\sqrt{' + q + '}' + (simpSqrt(q)[1] === 1 || simpSqrt(q)[0] !== 1 ? ' = ' + rad(q) : '')); });
      return { prompt: T('\\triangle GHJ') + ' has vertices ' + T('G' + pt(V[0][0], V[0][1])) + ', ' + T('H' + pt(V[1][0], V[1][1])) + ', ' + T('J' + pt(V[2][0], V[2][1])) + '. Is the triangle scalene, isosceles or equilateral? Type one word.', type: 'expr', answers: words(ans), check: 'exact', note: 'Type one word: scalene, isosceles or equilateral.',
        hint: 'Find the exact length of each side with the distance formula (compare the radicands). Two equal sides: isosceles. All different: scalene.',
        solution: steps(sides.concat([iso ? 'Exactly two sides are equal, so the triangle is <b>isosceles</b>.' : 'All three sides are different, so the triangle is <b>scalene</b>.'])) };
    }
  ];

  /* ---------- RF3 S · slope, parallel, perpendicular, collinear ---------- */
  var S_BEG = [
    function () { // slope from a graphed segment
      var run = pick([2, 3, 4, 5, 6]), rise = nz(-6, 6); var g = gcd(run, rise); if (g > 1 && Math.random() < 0.5) { run /= g; rise /= g; }
      var x1 = ri(-5, 0), y1 = ri(-4, 4), x2 = x1 + run, y2 = y1 + rise; if (Math.abs(y2) > 7) { y1 = -rise / 2 | 0; y2 = y1 + rise; }
      return { prompt: 'Count the rise and the run from ' + T('E') + ' to ' + T('F') + '. What is the slope of segment ' + T('EF') + '? Enter a fraction in lowest terms.' + Fig.grid({ xmin: -7, xmax: 7, ymin: -8, ymax: 8, segments: [[x1, y1, x2, y2]], points: [[x1, y1, 'E'], [x2, y2, 'F']] }), type: 'expr', answers: [frac(rise, run)], check: 'exact',
        hint: 'Slope = rise ÷ run. Going down is a negative rise.',
        solution: steps([T('\\text{rise} = ' + rise + ',\\ \\text{run} = ' + run), T('m = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)) + '.']) };
    },
    function () { // slope between two points
      var x1 = nz(-8, 8), y1 = nz(-8, 8), run = nz(-7, 7), rise = nz(-9, 9), x2 = x1 + run, y2 = y1 + rise;
      return { prompt: 'Determine the slope of the line through ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + '. Enter a fraction in lowest terms.', type: 'expr', answers: [frac(rise, run)], check: 'exact',
        hint: 'm = (y₂ − y₁) ÷ (x₂ − x₁). Keep the points in the same order top and bottom.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)) + '.']) };
    },
    function () { // run from slope and rise
      var n = nz(-5, 5), d = ri(2, 7); while (gcd(n, d) !== 1) { n = nz(-5, 5); } var k = pick([2, 3, 4, 5]), rise = n * k, run = d * k;
      return { prompt: 'A line segment has a slope of ' + T(frac(n, d)) + ' and a rise of ' + T(String(rise)) + '. Calculate its run.', type: 'num', answers: [String(run)], tol: 0,
        hint: 'Slope = rise/run, so run = rise ÷ slope.',
        solution: steps([T('\\dfrac{' + rise + '}{\\text{run}} = ' + frac(n, d)), T('\\text{run} = ' + rise + ' \\div ' + frac(n, d) + ' = ' + run) + '.']) };
    },
    function () { // rise from slope and run
      var n = nz(-6, 6), d = ri(2, 7); while (gcd(n, d) !== 1) { n = nz(-6, 6); } var k = pick([2, 3, 4, 6]), run = d * k, rise = n * k;
      return { prompt: 'A line has slope ' + T(frac(n, d)) + '. If you move ' + T(String(run)) + ' units to the right along the line, how far do you move up or down? (Enter the rise; negative means down.)', type: 'num', answers: [String(rise)], tol: 0,
        hint: 'rise = slope × run.',
        solution: steps([T('\\text{rise} = ' + frac(n, d) + ' \\times ' + run + ' = ' + rise) + '.']) };
    },
    function () { // slope of a horizontal line through two points / y of a point on a line
      if (Math.random() < 0.4) { var c = nz(-7, 7), a = nz(-8, 8), b = a + nz(-5, 5);
        return { prompt: 'Determine the slope of the line through ' + T(pt(a, c)) + ' and ' + T(pt(b, c)) + '.', type: 'num', answers: ['0'], tol: 0,
          hint: 'The y-values are the same: no rise at all.',
          solution: steps([T('m = \\dfrac{' + c + ' - ' + c + '}{' + b + ' - (' + a + ')} = 0') + '. A horizontal line has slope 0.']) }; }
      var m = pick([2, 3, -2, -3, 4]), x1 = nz(-5, 5), y1 = nz(-6, 6), dx = pick([1, 2, 3, 4]); var y2 = y1 + m * dx;
      return { prompt: 'A line with slope ' + T(String(m)) + ' passes through ' + T(pt(x1, y1)) + '. Determine the ' + T('y') + '-coordinate of the point on the line with ' + T('x = ' + (x1 + dx)) + '.', type: 'num', answers: [String(y2)], tol: 0,
        hint: 'Moving ' + dx + ' to the right changes y by slope × ' + dx + '.',
        solution: steps([T('\\text{rise} = ' + m + ' \\times ' + dx + ' = ' + (m * dx)), T('y = ' + y1 + ' + (' + (m * dx) + ') = ' + y2) + '.']) };
    },
    function () { // (6) slope of a vertical (undefined) or horizontal (0) segment
      var vert = Math.random() < 0.5, c = nz(-8, 8), a = nz(-8, 8), b = a + nz(-6, 6);
      var U = vert ? pt(c, a) : pt(a, c), V = vert ? pt(c, b) : pt(b, c);
      return { prompt: 'Determine the slope of the line segment joining ' + T('U' + U) + ' and ' + T('V' + V) + '. Type ' + UNDEF + ' if the slope is ' + UNDEF + '.', type: 'expr', answers: vert ? UNDEF_ANS.slice() : ['0'], check: 'exact', note: 'Type a number, or the word.',
        hint: vert ? 'The x-coordinates are the same, so the run is 0. What happens when you divide the rise by 0?' : 'The y-coordinates are the same, so the rise is 0. 0 divided by anything (non-zero) is 0.',
        solution: steps(vert ? [T('m = \\dfrac{' + b + ' - (' + a + ')}{' + c + ' - (' + c + ')} = \\dfrac{' + (b - a) + '}{0}'), 'Division by zero is not possible: the segment is vertical, so its slope is ' + UNDEF + '.']
          : [T('m = \\dfrac{' + c + ' - (' + c + ')}{' + b + ' - (' + a + ')} = \\dfrac{0}{' + (b - a) + '} = 0'), 'The segment is horizontal, so its slope is ' + T('0') + '.']) };
    },
    function () { // (7) slope as a rate: ramp height, or ramp slope in lowest terms
      if (Math.random() < 0.5) {
        var f = pick([[3, 5], [1, 4], [2, 5], [3, 8], [1, 12], [7, 10]]), k = pick([0.5, 1, 1.5, 2, 2.5]), L = f[1] * k, h = f[0] * k;
        return { prompt: 'A skateboard ramp has a slope of ' + T(frac(f[0], f[1])) + '. Calculate the height of the ramp if its base length is ' + T(num(L)) + ' metres. (Number only.)', type: 'num', answers: [num(h)], tol: 0,
          hint: 'Slope = rise ÷ run. The base is the run and the height is the rise, so height = slope × base.',
          solution: steps([T('\\dfrac{\\text{height}}{' + num(L) + '} = ' + frac(f[0], f[1])), T('\\text{height} = ' + frac(f[0], f[1]) + ' \\times ' + num(L) + ' = ' + num(h)) + ' m.']) };
      }
      var g = pick([1, 2, 3, 4, 5]), r, R; do { r = ri(1, 9) * g; R = ri(2, 12) * g; } while (r >= R);
      return { prompt: 'A loading ramp rises ' + T(String(r)) + ' m over a horizontal run of ' + T(String(R)) + ' m. Determine the slope as a fraction in lowest terms.', type: 'expr', answers: [frac(r, R)], check: 'exact',
        hint: 'Slope = rise ÷ run = ' + r + '/' + R + '. Then divide the top and bottom by their greatest common factor.',
        solution: steps([T('m = \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{' + r + '}{' + R + '}'), (gcd(r, R) > 1 ? 'Divide top and bottom by ' + gcd(r, R) + ': ' + T('m = ' + frac(r, R)) : T('\\dfrac{' + r + '}{' + R + '}') + ' is already in lowest terms') + '.']) };
    },
    function () { // (8) slope of a perpendicular (or parallel) segment from a given slope
      var a = nz(-7, 7), b = ri(2, 9); while (gcd(a, b) !== 1) a = nz(-7, 7); var par = Math.random() < 1 / 3, ans = par ? frac(a, b) : frac(-b, a);
      return { prompt: 'Line segment ' + T('AC') + ' has a slope of ' + T(frac(a, b)) + '. Write the slope of a line segment <b>' + (par ? 'parallel' : 'perpendicular') + '</b> to ' + T('AC') + '. Enter a fraction in lowest terms.', type: 'expr', answers: [ans], check: 'exact',
        hint: par ? 'Parallel segments have exactly the same slope.' : 'Perpendicular slopes are negative reciprocals: flip the fraction and change the sign.',
        solution: steps(par ? ['Parallel segments have equal slopes, so ' + T('m = ' + ans) + '.'] : ['Flip ' + T(frac(a, b)) + ' to get ' + T(frac(b, a)) + ', then change the sign: ' + T('m_{\\perp} = ' + ans) + '.', 'Check: ' + T(frac(a, b) + ' \\times ' + ans + ' = -1') + '.']) };
    }
  ];

  var S_PRG = [
    function () { // perpendicular slope to PQ
      var x1 = nz(-8, 8), y1 = nz(-8, 8), run = nz(-9, 9), rise = nz(-9, 9); while (Math.abs(run) === Math.abs(rise)) rise = nz(-9, 9);
      var g = gcd(run, rise), rr = rise / g, ru = run / g; // slope rr/ru; perp = -ru/rr
      return { prompt: T('P') + ' is the point ' + T(pt(x1, y1)) + ' and ' + T('Q') + ' is ' + T(pt(x1 + run, y1 + rise)) + '. Find the slope of a line <b>perpendicular</b> to ' + T('PQ') + '. Enter a fraction in lowest terms.', type: 'expr', answers: [frac(-ru, rr)], check: 'exact',
        hint: 'Find the slope of PQ, then flip it and change the sign (the negative reciprocal).',
        solution: steps([T('m_{PQ} = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)), T('m_{\\perp} = ' + frac(-ru, rr)) + '.']) };
    },
    function () { // next integer point to the right
      var n = nz(-5, 5), d = ri(2, 6); while (gcd(n, d) !== 1) n = nz(-5, 5); var x1 = nz(-6, 6), y1 = nz(-6, 6);
      return { prompt: 'The point ' + T(pt(x1, y1)) + ' is on a line with slope ' + T(frac(n, d)) + '. Determine the <b>next</b> point with integer coordinates on the line, to the <b>right</b> of ' + T(pt(x1, y1)) + '. Type an ordered pair.', type: 'expr', answers: [pt(x1 + d, y1 + n)], check: 'exact',
        hint: 'Slope ' + frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + ' means: run ' + d + ' to the right, rise ' + n + '.',
        solution: steps([T(pt(x1, y1) + ' \\to (' + x1 + ' + ' + d + ',\\ ' + y1 + ' + (' + n + ')) = ' + pt(x1 + d, y1 + n)) + '.']) };
    },
    function () { // k for perpendicular slopes (first slope may be negative; k may be a fraction)
      var a = nz(-7, 7), b = ri(2, 9), d = ri(2, 9); while (gcd(a, b) !== 1 || Math.abs(a) === b) a = nz(-7, 7);
      if (Math.random() < 0.5) d = Math.abs(a) * ri(1, 3); // whole-number k half the time
      var k = frac(-b * d, a), kv = -b * d / a;
      return { prompt: 'Two lines have slopes ' + T(frac(a, b)) + ' and ' + T('\\dfrac{k}{' + d + '}') + '. Find the value of ' + T('k') + ' if the lines are <b>perpendicular</b>.' + (kv % 1 ? ' (A fraction is fine.)' : ''), type: 'num', answers: [k], tol: 0,
        hint: 'Perpendicular slopes multiply to −1. Multiply the two fractions, set the product equal to −1 and solve for k.',
        solution: steps([T(frac(a, b) + ' \\cdot \\dfrac{k}{' + d + '} = -1'), T('\\dfrac{' + (a === -1 ? '-' : a === 1 ? '' : a) + 'k}{' + (b * d) + '} = -1'), Math.abs(a) === 1 ? T('k = ' + k) + '.' : T(a + 'k = ' + (-b * d)), Math.abs(a) === 1 ? '' : T('k = ' + k) + '.'].filter(Boolean)) };
    },
    function () { // parallel slope
      var x1 = nz(-8, 8), y1 = nz(-8, 8), run = nz(-9, 9), rise = nz(-9, 9);
      return { prompt: 'Line ' + T('\\ell') + ' passes through ' + T(pt(x1, y1)) + ' and ' + T(pt(x1 + run, y1 + rise)) + '. Determine the slope of any line <b>parallel</b> to ' + T('\\ell') + '. Enter a fraction in lowest terms.', type: 'expr', answers: [frac(rise, run)], check: 'exact',
        hint: 'Parallel lines have the same slope.',
        solution: steps([T('m = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)) + ', and a parallel line has the same slope.']) };
    },
    function () { // k for parallel: line through (a,b),(c,k) parallel to given slope
      var n = nz(-5, 5), d = ri(1, 6); while (gcd(n, d) !== 1) n = nz(-5, 5); var x1 = nz(-6, 6), y1 = nz(-6, 6), mult = pick([1, 2, 3, -1, -2]), x2 = x1 + d * mult, k = y1 + n * mult;
      return { prompt: 'The line through ' + T(pt(x1, y1)) + ' and ' + T('(' + x2 + ',\\ k)') + ' is <b>parallel</b> to a line with slope ' + T(frac(n, d)) + '. Determine ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Set the slope of the line through the two points equal to ' + frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + ' and solve for k.',
        solution: steps([T('\\dfrac{k - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), T('k - (' + y1 + ') = ' + frac(n, d) + ' \\times ' + (d * mult) + ' = ' + (n * mult)), T('k = ' + k) + '.']) };
    },
    function () { // (9) parallel, perpendicular or neither from two slopes
      var kind = pick(['parallel', 'perpendicular', 'neither']), a = nz(-7, 7), b = ri(2, 9), k = pick([2, 3, 4]), pair, why;
      while (gcd(a, b) !== 1 || Math.abs(a) === b) a = nz(-7, 7);
      var m1 = frac(a, b);
      if (kind === 'parallel') { pair = [fracRaw(a, b), fracRaw(a * k, b * k)]; why = T(fracRaw(a * k, b * k) + ' = ' + m1) + ', so the slopes are <b>equal</b>: the segments are parallel.'; }
      else if (kind === 'perpendicular') {
        if (Math.random() < 0.1) { pair = ['0', null]; why = 'A slope of 0 is a horizontal segment and an ' + UNDEF + ' slope is a vertical segment: they are perpendicular.'; }
        else { var scale = Math.random() < 0.5 ? k : 1; pair = [fracRaw(a, b), fracRaw(-b * scale, a * scale)]; why = (scale > 1 ? T(fracRaw(-b * scale, a * scale) + ' = ' + frac(-b, a)) + '. ' : '') + T(m1 + ' \\times ' + frac(-b, a) + ' = -1') + ': the slopes are <b>negative reciprocals</b>, so the segments are perpendicular.'; }
      } else {
        if (Math.random() < 0.5) { pair = [fracRaw(a, b), fracRaw(b, a)]; why = 'The slopes are reciprocals but the sign did <b>not</b> change: ' + T(m1 + ' \\times ' + frac(b, a) + ' = 1') + ', not ' + T('-1') + '. They are not equal either, so: neither.'; }
        else { pair = [fracRaw(a, b), fracRaw(-a, b)]; why = 'Only the sign changed, the fraction was not flipped: ' + T(m1 + ' \\times ' + frac(-a, b) + ' = ' + frac(-a * a, b * b)) + ', not ' + T('-1') + '. They are not equal either, so: neither.'; }
      }
      if (Math.random() < 0.5) pair.reverse();
      var show = function (nm, v) { return v === null ? T('m_{' + nm + '}') + ' is ' + UNDEF : T('m_{' + nm + '} = ' + v); };
      return { prompt: 'The slopes of two line segments are ' + show('AB', pair[0]) + ' and ' + show('PQ', pair[1]) + '. Are the segments parallel, perpendicular, or neither? Type one word.', type: 'expr', answers: words(kind), check: 'exact', note: 'Type one word: parallel, perpendicular or neither.',
        hint: 'Reduce both fractions first. Equal slopes: parallel. Slopes that multiply to −1 (negative reciprocals): perpendicular. Otherwise: neither.',
        solution: steps([why, 'Answer: <b>' + kind + '</b>.']) };
    },
    function () { // (10) unknown in the slope of a parallel line
      var form = ri(0, 2), a = nz(-5, 5), b = ri(2, 9); while (gcd(a, b) !== 1) a = nz(-5, 5);
      if (form === 0) { var m = nz(-6, 6), d = ri(2, 9), k = m * d;
        return { prompt: 'The slopes of two parallel lines are ' + T(String(m)) + ' and ' + T('\\dfrac{k}{' + d + '}') + '. Determine ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
          hint: 'Parallel lines have equal slopes: k/' + d + ' = ' + m + '. Multiply both sides by ' + d + '.',
          solution: steps([T('\\dfrac{k}{' + d + '} = ' + m), T('k = ' + m + ' \\times ' + d + ' = ' + k) + '.']) }; }
      if (form === 1) { var t = pick([2, 3, 4, -1, -2, -3]), c = a * t, n = b * t;
        return { prompt: 'The slopes of two parallel lines are ' + T(frac(a, b)) + ' and ' + T('\\dfrac{' + c + '}{n}') + '. Determine ' + T('n') + '.', type: 'num', answers: [String(n)], tol: 0,
          hint: 'The two fractions must be equal. ' + c + ' is ' + a + ' × ' + t + ', so the denominator must be ' + b + ' × ' + t + ' as well.',
          solution: steps([T('\\dfrac{' + c + '}{n} = ' + frac(a, b)), T(c + ' = ' + a + ' \\times ' + (t < 0 ? '(' + t + ')' : t)) + ', so the denominator is scaled the same way:', T('n = ' + b + ' \\times ' + (t < 0 ? '(' + t + ')' : t) + ' = ' + n) + '.', 'Check: ' + T(frac(c, n) + ' = ' + frac(a, b)) + '. ✓']) }; }
      var q = pick([2, 3, 4, 5, 6]), ans = frac(a, q * b);
      return { prompt: 'The slopes of two parallel lines are ' + T(frac(a, b)) + ' and ' + T(q + 'm') + '. Determine ' + T('m') + '.', type: 'num', answers: [ans], tol: 0,
        hint: 'Set ' + q + 'm equal to the given slope and divide both sides by ' + q + '. A fraction answer is fine.',
        solution: steps([T(q + 'm = ' + frac(a, b)), T('m = ' + frac(a, b) + ' \\div ' + q + ' = ' + frac(a, b) + ' \\times \\dfrac{1}{' + q + '} = ' + ans) + '.']) };
    },
    function () { // (11) unknown coordinate from a given slope
      var n = nz(-5, 5), d = ri(2, 7); while (gcd(n, d) !== 1) n = nz(-5, 5); var t = nz(-2, 2), x2 = nz(-8, 8), y2 = nz(-6, 6), x1 = x2 + d * t, y1 = y2 + n * t, unkX = Math.random() < 0.5;
      var L = unkX ? '(k,\\ ' + y1 + ')' : '(' + x1 + ',\\ k)', ans = unkX ? x1 : y1;
      var sol = unkX ? [T('\\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - k} = ' + frac(n, d)), T('\\dfrac{' + (y2 - y1) + '}{' + x2 + ' - k} = ' + frac(n, d)), T((y2 - y1) + ' \\times ' + d + ' = ' + n + '(' + x2 + ' - k)'), T((y2 - y1) * d + ' = ' + (n * x2) + (n < 0 ? ' + ' + (-n) : ' - ' + n) + 'k'), T((n === 1 ? '-' : n === -1 ? '' : -n) + 'k = ' + ((y2 - y1) * d - n * x2)), T('k = ' + ans) + '.']
        : [T('\\dfrac{' + y2 + ' - k}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), T('\\dfrac{' + y2 + ' - k}{' + (x2 - x1) + '} = ' + frac(n, d)), T(y2 + ' - k = ' + frac(n, d) + ' \\times ' + (x2 - x1) + ' = ' + (y2 - y1)), T('k = ' + ans) + '.'];
      return { prompt: 'The line segment joining ' + T('L' + L) + ' and ' + T('M' + pt(x2, y2)) + ' has a slope of ' + T(frac(n, d)) + '. Determine ' + T('k') + '.', type: 'num', answers: [String(ans)], tol: 0,
        hint: 'Write the slope formula with k in it, set it equal to ' + frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + ', then cross-multiply and solve.',
        solution: steps(sol) };
    }
  ];

  var S_MAS = [
    function () { // collinear: find k
      var n = nz(-4, 4), d = ri(1, 5); while (gcd(n, d) !== 1) n = nz(-4, 4); var x1 = nz(-7, 3), y1 = nz(-8, 5), m1 = pick([1, 2]), m2 = m1 + pick([2, 3, 4]);
      var B = [x1 + d * m1, y1 + n * m1], C = [x1 + d * m2, y1 + n * m2];
      return { prompt: 'The points ' + T('A' + pt(x1, y1)) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C(' + C[0] + ',\\ k)') + ' are <b>collinear</b>. Find the value of ' + T('k') + '.', type: 'num', answers: [String(C[1])], tol: 0,
        hint: 'Collinear points lie on one line, so the slope of AB equals the slope of AC (or BC).',
        solution: steps([T('m_{AB} = \\dfrac{' + B[1] + ' - (' + y1 + ')}{' + B[0] + ' - (' + x1 + ')} = ' + frac(n, d)), T('\\dfrac{k - (' + y1 + ')}{' + C[0] + ' - (' + x1 + ')} = ' + frac(n, d)), T('k = ' + y1 + ' + ' + frac(n, d) + '(' + (d * m2) + ') = ' + C[1]) + '.']) };
    },
    function () { // where is the right angle?
      var names = ['J', 'K', 'L'], ax = nz(-5, 3), ay = nz(-5, 3), u = [pick([2, 3, 4]), pick([1, 2, 3])], v = [-u[1], u[0]]; // perpendicular vectors
      var k1 = pick([1, 2]), k2 = pick([1, 2]), which = ri(0, 2);
      var P = [[ax, ay], [ax + u[0] * k1, ay + u[1] * k1], [ax + v[0] * k2, ay + v[1] * k2]]; // right angle at index 0
      var order = [0, 1, 2]; for (var i = 2; i > 0; i--) { var j = ri(0, i); var t = order[i]; order[i] = order[j]; order[j] = t; }
      var V = order.map(function (o) { return P[o]; }), ans = names[order.indexOf(0)];
      return { prompt: 'Triangle ' + T('JKL') + ' has vertices ' + T('J' + pt(V[0][0], V[0][1])) + ', ' + T('K' + pt(V[1][0], V[1][1])) + ' and ' + T('L' + pt(V[2][0], V[2][1])) + '. Use slopes to decide where the right angle is. Type the letter of that vertex.', type: 'expr', answers: [ans, ans.toLowerCase()], check: 'exact',
        hint: 'Find the slopes of the three sides. Two sides are perpendicular if their slopes multiply to −1; the right angle is where they meet.',
        solution: steps(['The slopes of the two sides that meet at ' + ans + ' multiply to ' + T('-1') + ', so they are perpendicular.', 'The right angle is at ' + T(ans) + '.']) };
    },
    function () { // k for a right angle at a vertex
      var u = [pick([2, 3, 4, 5]), pick([1, 2, 3])], ax = nz(-5, 4), ay = nz(-5, 4), k2 = pick([1, 2]); var B = [ax + u[0], ay + u[1]], C = [ax - u[1] * k2, ay + u[0] * k2];
      return { prompt: 'Triangle ' + T('ABC') + ' has vertices ' + T('A' + pt(ax, ay)) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C(' + C[0] + ',\\ k)') + '. Determine ' + T('k') + ' so that the angle at ' + T('A') + ' is a <b>right angle</b>.', type: 'num', answers: [String(C[1])], tol: 0,
        hint: 'AC must be perpendicular to AB: slope of AC = negative reciprocal of slope of AB.',
        solution: steps([T('m_{AB} = ' + frac(u[1], u[0])) + ', so ' + T('m_{AC} = ' + frac(-u[0], u[1])) + '.', T('\\dfrac{k - (' + ay + ')}{' + C[0] + ' - (' + ax + ')} = ' + frac(-u[0], u[1])), T('k = ' + C[1]) + '.']) };
    },
    function () { // fourth vertex of a parallelogram
      var A = [nz(-6, 2), nz(-6, 2)], u = [pick([3, 4, 5, 6]), pick([0, 1, 2])], v = [pick([1, 2, -1, -2]), pick([3, 4, 5])];
      var B = [A[0] + u[0], A[1] + u[1]], C = [B[0] + v[0], B[1] + v[1]], D = [A[0] + v[0], A[1] + v[1]];
      return { prompt: T('ABCD') + ' is a parallelogram with ' + T('A' + pt(A[0], A[1])) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C' + pt(C[0], C[1])) + '. Determine the coordinates of ' + T('D') + '. Type an ordered pair.', type: 'expr', answers: [pt(D[0], D[1])], check: 'exact',
        hint: 'AD must be parallel and equal to BC: apply the same run and rise from B→C to A.',
        solution: steps(['From B to C: run ' + v[0] + ', rise ' + v[1] + '.', 'Apply it to A: ' + T('D = (' + A[0] + ' + ' + v[0] + ',\\ ' + A[1] + ' + ' + v[1] + ') = ' + pt(D[0], D[1])) + '.', 'Check: the midpoints of the diagonals AC and BD coincide.']) };
    },
    function () { // perpendicular from a point: find x-intercept of the perpendicular through P to a line of slope m... keep numeric: distance-slope mix
      var n = nz(-4, 4), d = ri(1, 5); while (gcd(n, d) !== 1 || Math.abs(n) === d) n = nz(-4, 4); var px = nz(-5, 5), py = nz(-5, 5);
      // line through P with slope perpendicular to n/d: m = -d/n ; x-intercept: y = 0 -> x = px - py/m = px + py*n/d
      var xi = px + py * n / d, xiTex = frac(px * d + py * n, d);
      return { prompt: 'A line passes through ' + T('P' + pt(px, py)) + ' and is <b>perpendicular</b> to a line with slope ' + T(frac(n, d)) + '. Determine the ' + T('x') + '-intercept of this line. (Enter a fraction in lowest terms if needed.)', type: 'num', answers: [xiTex], tol: 0,
        hint: 'The new slope is the negative reciprocal: ' + frac(-d, n).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + '. Then use rise/run from P down to the x-axis.',
        solution: steps([T('m = ' + frac(-d, n)), 'From P to the x-axis the rise is ' + T(String(-py)) + ', so the run is ' + T((-py) + ' \\div ' + frac(-d, n) + ' = ' + frac(py * n, d)) + '.', T('x = ' + px + ' + ' + frac(py * n, d) + ' = ' + xiTex) + '.']) };
    },
    function () { // (12) k that makes AB perpendicular (or parallel) to CD
      var perp = Math.random() < 0.5, p = nz(-3, 3), q = nz(-3, 3), A = [nz(-6, 6), nz(-6, 6)], C = [nz(-5, 5), nz(-5, 5)], t = nz(-2, 2);
      var B = [A[0] + p, A[1] + q], dir = perp ? [-q, p] : [p, q], D = [C[0] + dir[0] * t, C[1] + dir[1] * t], k = D[1];
      var mAB = frac(q, p), mCD = perp ? frac(-p, q) : mAB, rel = perp ? 'AB \\perp CD' : 'AB \\parallel CD';
      return { prompt: T('A' + pt(A[0], A[1])) + ', ' + T('B' + pt(B[0], B[1])) + ', ' + T('C' + pt(C[0], C[1])) + ', ' + T('D(' + D[0] + ',\\ k)') + '. Determine the value of ' + T('k') + ' that makes ' + T(rel) + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Find the slope of AB. ' + (perp ? 'CD needs the negative reciprocal of that slope.' : 'CD needs the same slope.') + ' Write the slope of CD with k in it and solve.',
        solution: steps([T('m_{AB} = \\dfrac{' + B[1] + ' - (' + A[1] + ')}{' + B[0] + ' - (' + A[0] + ')} = ' + mAB), (perp ? 'Perpendicular, so ' + T('m_{CD} = ' + mCD) + ' (negative reciprocal).' : 'Parallel, so ' + T('m_{CD} = ' + mCD) + '.'), T('\\dfrac{k - (' + C[1] + ')}{' + D[0] + ' - (' + C[0] + ')} = ' + mCD), T('k - (' + C[1] + ') = ' + mCD + ' \\times ' + (D[0] - C[0]) + ' = ' + (D[1] - C[1])), T('k = ' + k) + '.']) };
    },
    function () { // (13) slope of a median, to the nearest tenth
      var D, E, F, M, m;
      do { D = [nz(-6, 6), nz(-6, 6)]; E = [nz(-7, 7), nz(-7, 7)]; F = [E[0] + 2 * nz(-4, 4), E[1] + 2 * nz(-4, 4)]; M = [(E[0] + F[0]) / 2, (E[1] + F[1]) / 2]; m = (M[1] - D[1]) / (M[0] - D[0]);
      } while (Math.abs(F[0]) > 9 || Math.abs(F[1]) > 9 || M[0] === D[0] || M[1] === D[1] || (D[0] === E[0] && D[1] === E[1]) || (D[0] === F[0] && D[1] === F[1]) || nearHalf(m, 10));
      var ans = num(Math.round(m * 10) / 10);
      return { prompt: T('D' + pt(D[0], D[1])) + ', ' + T('E' + pt(E[0], E[1])) + ', ' + T('F' + pt(F[0], F[1])) + ' are the vertices of a triangle. Determine the slope of the median from ' + T('D') + ' to the midpoint of ' + T('EF') + ', to the nearest tenth. (Number only.)', type: 'num', answers: [ans], tol: 0.06,
        hint: 'First find the midpoint M of EF (average the coordinates). Then the slope of DM = (y_M − y_D)/(x_M − x_D); round to one decimal place.',
        solution: steps([T('M = \\left(\\dfrac{' + E[0] + ' + (' + F[0] + ')}{2},\\ \\dfrac{' + E[1] + ' + (' + F[1] + ')}{2}\\right) = ' + pt(M[0], M[1])), T('m_{DM} = \\dfrac{' + M[1] + ' - (' + D[1] + ')}{' + M[0] + ' - (' + D[0] + ')} = ' + frac(M[1] - D[1], M[0] - D[0])), T('m_{DM} \\approx ' + ans) + '.']) };
    }
  ];


  /* ---------- Math 15 templates (the Sheer Stair) ---------- */
  var MCNOTE = 'Type the letter of your choice.';
  function letters(L) { return [L, L.toLowerCase()]; }
  function mc(opts, right) { var L = ['A', 'B', 'C', 'D']; return { html: '<div class="mc-opts">' + opts.map(function (o, i) { return '<div><b>' + L[i] + '.</b> ' + o + '</div>'; }).join('') + '</div>', letter: L[right] }; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var M15 = {
    pythag: function () { // a hypotenuse from two legs (L1)
      var exact = Math.random() < 0.5, a, b;
      if (exact) { var t = pick(TRIPLES); a = t[0]; b = t[1]; } else { a = ri(3, 15); b = ri(3, 15); }
      var c = Math.sqrt(a * a + b * b); if (!exact && (c === Math.round(c) || nearHalf(c, 10))) return M15.pythag();
      var ans = exact ? String(c) : num(Math.round(c * 10) / 10);
      return { prompt: 'A rope is pegged from the foot of a stair landing to a ledge ' + a + ' m up and ' + b + ' m across, making a right triangle. How long is the rope (the hypotenuse)? ' + (exact ? '' : 'Round to the nearest tenth of a metre.'), type: 'num', answers: [ans], tol: exact ? 0 : 0.051,
        hint: 'The Pythagorean theorem: ' + T('c^{2} = a^{2} + b^{2}') + ', where c is the hypotenuse (the side across from the right angle).',
        solution: steps([T('c^{2} = ' + a + '^{2} + ' + b + '^{2} = ' + (a * a) + ' + ' + (b * b) + ' = ' + (a * a + b * b)) + '.', T('c = \\sqrt{' + (a * a + b * b) + '}' + (exact ? ' = ' + c : ' \\approx ' + ans)) + ' m.']) };
    },
    trail: function () { // trailhead + midpoint bench: the far end, or the whole length (L5 #11)
      var x1 = ri(-8, 4), y1 = ri(-8, 4), dx = nz(-5, 5), dy = nz(-5, 5), mx = x1 + dx, my = y1 + dy, x2 = x1 + 2 * dx, y2 = y1 + 2 * dy;
      var ask = pick(['end', 'len']), scale = pick([10, 20, 50, 100]), L = Math.sqrt(4 * dx * dx + 4 * dy * dy) * scale;
      if (ask === 'len' && nearHalf(L, 1)) return M15.trail();
      var base = 'On a climbing map of the Sheer Stair, the trailhead is at ' + T('T' + pt(x1, y1)) + ' and a rest bench sits exactly halfway up the trail at ' + T('B' + pt(mx, my)) + '. ';
      if (ask === 'end') return { prompt: base + 'Determine the coordinates of the trail\'s other end, the lookout ' + T('L') + '. Type an ordered pair.', type: 'expr', answers: [pt(x2, y2)], check: 'exact', note: 'Type an ordered pair, e.g. (3,-2).',
        hint: 'The bench is the midpoint, so the trip from B to L is the same as the trip from T to B.',
        solution: steps(['From T to B: ' + T('x') + ' changes by ' + dx + ' and ' + T('y') + ' changes by ' + dy + '.', 'Do it again from B: ' + T('L = ' + pt(mx + dx, my + dy)) + '.']) };
      var ans = String(Math.round(L));
      return { prompt: base + 'Each grid unit on the map is ' + scale + ' m. How long is the <b>whole</b> trail from the trailhead to the lookout, to the nearest metre?', type: 'num', answers: [ans], tol: 0.5,
        hint: 'Find the lookout first (B is the midpoint), then use the distance formula from T to the lookout, and multiply by ' + scale + '.',
        solution: steps(['The lookout is at ' + T(pt(x2, y2)) + '.', T('d = \\sqrt{(' + (2 * dx) + ')^{2} + (' + (2 * dy) + ')^{2}} = \\sqrt{' + (4 * dx * dx + 4 * dy * dy) + '}') + ' grid units.', T('\\times ' + scale + ' \\approx ' + ans) + ' m.']) };
    },
    slopeType: function () { // positive, negative, zero or undefined (L7)
      var kind = pick(['pos', 'neg', 'zero', 'undef']), x1 = nz(-6, 6), y1 = nz(-6, 6), x2, y2;
      if (kind === 'zero') { x2 = x1 + nz(-5, 5); y2 = y1; } else if (kind === 'undef') { x2 = x1; y2 = y1 + nz(-5, 5); }
      else { x2 = x1 + ri(1, 5); y2 = y1 + (kind === 'pos' ? 1 : -1) * ri(1, 5); }
      var o = mc(['Positive', 'Negative', 'Zero', UNDEF.charAt(0).toUpperCase() + UNDEF.slice(1)], ['pos', 'neg', 'zero', 'undef'].indexOf(kind));
      return { prompt: 'A rope is strung between ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + '. What type of slope does segment AB have?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Rises left to right: positive. Falls left to right: negative. Flat (same y): zero. Straight up and down (same x): ' + UNDEF + '.',
        solution: steps([kind === 'zero' ? 'The y-coordinates are equal, so the rise is 0: the slope is 0.' : kind === 'undef' ? 'The x-coordinates are equal, so the run is 0 and the slope is ' + UNDEF + '.' : 'Rise ' + (y2 - y1) + ' over run ' + (x2 - x1) + ': the slope is ' + (kind === 'pos' ? 'positive' : 'negative') + '.', 'Answer: ' + o.letter + '.']) };
    },
    rateTable: function () { // slope as a rate of change from a table, with units (L6)
      var r = pick([3, 4, 5, 6, 8, 12, 15]) * pick([1, 1, -1]), h0 = ri(2, 12) * 10 + (r < 0 ? 200 : 0), dt = pick([2, 5, 10]);
      var ts = [0, dt, 2 * dt, 3 * dt], hs = ts.map(function (t) { return h0 + r * t; }), up = r > 0;
      return { prompt: 'A climber ' + (up ? 'goes up' : 'comes down') + ' the Sheer Stair at a steady pace. The table shows the height above the valley floor.' + Fig.table(ts, hs, 'Time (min)', 'Height (m)') + 'Determine the slope (the rate of change) in metres per minute. Use a negative sign if the height is decreasing.', type: 'num', answers: [String(r)], tol: 0,
        hint: 'Slope = change in height ÷ change in time, between any two columns.',
        solution: steps([T('\\dfrac{' + hs[1] + ' - ' + hs[0] + '}{' + dt + ' - 0} = \\dfrac{' + (r * dt) + '}{' + dt + '} = ' + r) + ' m/min.', up ? 'Positive: the climber gains height.' : 'Negative: the climber loses height.']) };
    },
    collinearMC: function () { // the slope test for three points (L8)
      var x1 = ri(-6, 2), y1 = ri(-6, 4), run = ri(1, 4), rise = nz(-4, 4), yes = Math.random() < 0.5, k = pick([2, 3]);
      var x2 = x1 + run, y2 = y1 + rise, x3 = x1 + k * run, y3 = y1 + k * rise + (yes ? 0 : pick([-1, 1]));
      var o = mc(['Yes', 'No'], yes ? 0 : 1);
      return { prompt: 'Three pitons are hammered into the cliff at ' + T('A' + pt(x1, y1)) + ', ' + T('B' + pt(x2, y2)) + ' and ' + T('C' + pt(x3, y3)) + '. Do they lie on one straight line (are they collinear)?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Find the slope of AB and the slope of BC. Collinear points give equal slopes.',
        solution: steps([T('m_{AB} = ' + frac(y2 - y1, x2 - x1)) + ', ' + T('m_{BC} = ' + frac(y3 - y2, x3 - x2)) + '.', (yes ? 'Equal slopes and a shared point B: collinear.' : 'The slopes are different: not collinear.'), 'Answer: ' + o.letter + '.']) };
    },
    slopeError: function () { // a student's slope error (EP06 #12-13)
      var x1 = ri(-5, 3), y1 = ri(-5, 5), run = ri(2, 6), rise = nz(-6, 6); if (Math.abs(rise) === run) return M15.slopeError();
      var x2 = x1 + run, y2 = y1 + rise, who = pick(['Kai', 'Nell', 'Omar', 'Jess']), kind = pick(['flip', 'order']);
      var wrong = kind === 'flip' ? frac(run, rise) : frac(y2 - y1, x1 - x2);
      if (wrong === frac(rise, run)) return M15.slopeError();
      var o = mc(['They put the run on top and the rise on the bottom', 'They subtracted the coordinates in a different order on the top and the bottom', 'They added the coordinates instead of subtracting', 'There is no error'], kind === 'flip' ? 0 : 1);
      return { prompt: who + ' found the slope of the segment from ' + T(pt(x1, y1)) + ' to ' + T(pt(x2, y2)) + ' to be ' + T(wrong) + '. The correct slope is ' + T(frac(rise, run)) + '. What did ' + who + ' do wrong?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Slope = rise ÷ run = ' + T('\\dfrac{y_2 - y_1}{x_2 - x_1}') + ', subtracting in the same order on the top and the bottom.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(rise, run)) + '.', kind === 'flip' ? T(wrong) + ' is run over rise: it is upside down.' : T(wrong) + ' comes from ' + T('\\dfrac{y_2 - y_1}{x_1 - x_2}') + ': the order changed between top and bottom.', 'Answer: ' + o.letter + '.']) };
    }
  };

  /* Math 15 levels, chosen from the shared library above (indices refer to Lorebound's arrays) */
  QGen.GENS.RF3D_BEG = [M15.pythag, D_BEG[0], D_BEG[2], D_BEG[3], D_BEG[4]];
  QGen.GENS.RF3D_PRG = [D_PRG[5], D_PRG[1], D_PRG[2], D_PRG[6], D_BEG[5], D_PRG[7]];
  QGen.GENS.RF3D_MAS = [M15.trail, D_MAS[5], D_PRG[3], D_MAS[7], D_MAS[4]];
  QGen.GENS.RF3S_BEG = [S_BEG[0], S_BEG[1], S_BEG[5], S_BEG[6], M15.slopeType, S_PRG[5]];
  QGen.GENS.RF3S_PRG = [S_BEG[2], S_BEG[3], S_BEG[7], S_PRG[0], S_PRG[3], M15.rateTable, M15.collinearMC];
  QGen.GENS.RF3S_MAS = [S_MAS[0], S_PRG[4], S_PRG[7], S_MAS[1], S_MAS[5], M15.slopeError];
})();
