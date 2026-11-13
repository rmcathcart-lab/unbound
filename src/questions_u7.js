/* ===================== LAND 7 · THE WAYSTONE HILLS · EQUATIONS OF LINEAR RELATIONS (RF6 / RF7) =====================
 * The shared template library (the same templates as Lorebound's Land 7), with the Math 15 levels chosen from it at the
 * bottom, plus Math 15 templates. Registered as RF6_* (y = mx + b, general form, horizontal and vertical lines, graphs)
 * and RF7_* (writing the equation of a line, fee-plus-rate models). Math 15 pitch: no calculator, friendly numbers, and
 * never slope-point form (a slope and a point means substitute into y = mx + b and solve for b).
 * General form: Ax + By + C = 0 with A, B, C integers, no common factor, A positive.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function fs(n, d) { return frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2'); } // plain-text fraction for hints
  function fracX(n, d, v) { // coefficient times variable: (n/d) v
    if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return n === 1 ? v : n === -1 ? '-' + v : n + v;
    return [(n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}' + v, (n < 0 ? '-' : '') + '\\frac{' + (Math.abs(n) === 1 ? '' : Math.abs(n)) + v + '}{' + d + '}'];
  }
  function sgn(v) { return v < 0 ? ' - ' + Math.abs(v) : ' + ' + v; }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function tenth(x) { return String(Math.round(x * 10) / 10); }
  function sp(n) { // 45120 -> "45 120" for prose
    var s = String(Math.abs(n)), out = '', c = 0; for (var i = s.length - 1; i >= 0; i--) { out = s[i] + out; c++; if (c % 3 === 0 && i > 0) out = ' ' + out; } return (n < 0 ? '-' : '') + out;
  }
  function tx(n) { return sp(n).replace(/ /g, '\\,'); } // 45120 -> 45\,120 for LaTeX
  function decOf(n, d) { // terminating decimal form of n/d, or null if it is an integer or does not terminate
    if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return null; var q = d; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1 ? num(n / d) : null;
  }
  function coef(a, v) { return a === 1 ? v : a === -1 ? '-' + v : a + v; } // 3x, -x, x
  /* y = (n/d) x + b  -> list of acceptable LaTeX forms (fraction before x, fraction around x) ; b as integer or fraction [bn, bd] */
  function sif(n, d, bn, bd) {
    bd = bd || 1; var mx = fracX(n, d, 'x'), bt = bn === 0 ? '' : (bn * bd < 0 ? '-' : '+') + frac(Math.abs(bn), Math.abs(bd));
    var forms = Array.isArray(mx) ? mx : [mx];
    return forms.map(function (f) { return 'y=' + f + bt; });
  }
  function sifTex(n, d, bn, bd) { return sif(n, d, bn, bd)[0].replace('y=', 'y = ').replace(/([+-])(\\frac|\d)/g, ' $1 $2'); }
  /* general form A x + B y + C = 0 with A > 0 and gcd 1, from slope n/d and a point (x1, y1): n x - d y + (d y1 - n x1) = 0 */
  function general(n, d, x1, y1) {
    var A = n, B = -d, C = d * y1 - n * x1, g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
    var s = (A === 0 ? '' : (A === 1 ? 'x' : A + 'x')); if (B !== 0) s += (s ? (B < 0 ? '-' : '+') : (B < 0 ? '-' : '')) + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y'); if (C !== 0) s += (C < 0 ? '-' : '+') + Math.abs(C);
    return { tex: s + '=0', A: A, B: B, C: C };
  }
  /* spaced display of A x + B y + C = 0 exactly as given (no reducing, no sign flip) */
  function gfDisp(A, B, C) {
    var s = ''; if (A !== 0) s += coef(A, 'x');
    if (B !== 0) s += (s ? (B < 0 ? ' - ' : ' + ') : (B < 0 ? '-' : '')) + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y');
    if (C !== 0) s += (s ? (C < 0 ? ' - ' : ' + ') : (C < 0 ? '-' : '')) + Math.abs(C);
    return s + ' = 0';
  }
  function gfSp(tex) { return tex.replace(/([+-])/g, ' $1 ').replace('=0', ' = 0').replace(/\s+/g, ' ').trim(); } // '3x-4y+8=0' -> '3x - 4y + 8 = 0'
  function normG(A, B, C) { if (A < 0 || (A === 0 && B < 0)) return [-A, -B, -C]; return [A, B, C]; }
  function pointSlope(n, d, x1, y1) { return psForms(n, d, x1, y1)[0]; }
  /* point-slope display, spaced, with zero coordinates handled: y + 8 = \frac{3}{4}x ; y = 6(x + 2) ; y + 4 = x + 1 */
  function psDisp(n, d, x1, y1) {
    var left = 'y' + (y1 === 0 ? '' : y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1);
    if (x1 === 0) { var mx = fracX(n, d, 'x'); return left + ' = ' + (Array.isArray(mx) ? mx[0] : mx); }
    var inner = 'x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1);
    if (d === 1 && n === 1) return left + ' = ' + inner;
    return left + ' = ' + slopeOf(n, d) + '(' + inner + ')';
  }
  /* all acceptable typed forms of the point-slope equation: \frac{a}{b}(x - x1) and \frac{a(x - x1)}{b} */
  function psForms(n, d, x1, y1) {
    if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g;
    var left = 'y' + (y1 === 0 ? '' : y1 < 0 ? '+' + Math.abs(y1) : '-' + y1);
    if (x1 === 0) { var mx = fracX(n, d, 'x'); return (Array.isArray(mx) ? mx : [mx]).map(function (f) { return left + '=' + f; }); }
    var inner = 'x' + (x1 < 0 ? '+' + Math.abs(x1) : '-' + x1);
    if (d === 1) return [left + '=' + (n === 1 ? inner : n === -1 ? '-(' + inner + ')' : n + '(' + inner + ')')];
    var s = n < 0 ? '-' : '', a = Math.abs(n);
    return [left + '=' + s + '\\frac{' + a + '}{' + d + '}(' + inner + ')', left + '=' + s + '\\frac{' + (a === 1 ? inner : a + '(' + inner + ')') + '}{' + d + '}'];
  }
  function slopeOf(n, d) { var m = fracX(n, d, ''); return Array.isArray(m) ? m[0] : m; }
  function randSlope() { var n = nz(-5, 5), d = ri(1, 5); var g = gcd(n, d); return [n / g, d / g]; }
  /* two integer points on y = (n/d) x + b, both inside the ±8 grid */
  function gridPts() {
    for (var tries = 0; tries < 60; tries++) {
      var sl = randSlope(), n = sl[0], d = sl[1], b = ri(-4, 4), x1 = -d * pick([1, 2]), x2 = d * pick([1, 2]);
      var y1 = n * x1 / d + b, y2 = n * x2 / d + b;
      if (Math.abs(x1) <= 8 && Math.abs(x2) <= 8 && Math.abs(y1) <= 8 && Math.abs(y2) <= 8) return { n: n, d: d, b: b, x1: x1, y1: y1, x2: x2, y2: y2 };
    }
    return { n: 1, d: 1, b: 1, x1: -2, y1: -1, x2: 2, y2: 3 };
  }
  /* commission data shared by the E = mS + b templates */
  function commission() {
    var who = pick(NAMES), rate = pick([0.03, 0.04, 0.05, 0.06, 0.08]), base = pick([400, 450, 500, 550, 600]), s1 = pick([2000, 3000, 4000]), s2 = s1 + pick([3000, 4000, 5000]);
    var e1 = base + rate * s1, e2 = base + rate * s2;
    return { who: who, rate: rate, base: base, s1: s1, s2: s2, e1: e1, e2: e2,
      text: who + ' earns a weekly base salary plus commission. In a week with $' + sp(s1) + ' in sales they earned $' + sp(e1) + '. In a week with $' + sp(s2) + ' in sales they earned $' + sp(e2) + '.',
      model: steps([T('m = \\dfrac{' + e2 + ' - ' + e1 + '}{' + s2 + ' - ' + s1 + '} = \\dfrac{' + (e2 - e1) + '}{' + (s2 - s1) + '} = ' + rate), T(e1 + ' = ' + rate + '(' + s1 + ') + b') + ', so ' + T('b = ' + base) + '.', T('E = ' + rate + 'S + ' + base) + '.']) };
  }
  var NAMES = ['Jonah', 'Amara', 'Lucas', 'Nadia', 'Owen', 'Zara'];

  /* ---------- RF6 · forms of a line and their graphs ---------- */
  var A_BEG = [
    function () { // y-intercept of c y = a x + b form
      var c = pick([2, 3, 4, 5]), a = nz(-9, 9), k = nz(-6, 6), b = c * k; // y = (a/c) x + k
      return { prompt: 'Determine the ' + T('y') + '-intercept of the line ' + T(c + 'y = ' + coef(a, 'x') + sgn(b)) + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'On the y-axis x = 0. Substitute and solve for y.',
        solution: steps([T(c + 'y = ' + a + '(0)' + sgn(b) + ' = ' + b), T('y = ' + k) + '.']) };
    },
    function () { // x-intercept of y = m x + b algebraically
      var sl = randSlope(), n = sl[0], d = sl[1], xi = nz(-8, 8); var b = -n * xi / d; var tries = 0;
      while (b !== Math.round(b) && tries++ < 20) { xi = d * nz(-3, 3); b = -n * xi / d; }
      return { prompt: 'Determine the ' + T('x') + '-intercept of ' + T(sifTex(n, d, b)) + ' algebraically.', type: 'num', answers: [String(xi)], tol: 0,
        hint: 'On the x-axis y = 0. Set y = 0 and solve for x.',
        solution: steps([T('0 = ' + slopeOf(n, d) + 'x' + sgn(b)), T(slopeOf(n, d) + 'x = ' + (-b)), T('x = ' + xi) + '.']) };
    },
    function () { // slope from general form
      var A = ri(1, 6), B = nz(-6, 6), C = nz(-12, 12); while (gcd(A, B) !== 1) { A = ri(1, 6); B = nz(-6, 6); }
      return { prompt: 'Determine the slope of the line ' + T(gfDisp(A, B, C)) + '. Enter a fraction in lowest terms.', type: 'num', answers: [frac(-A, B)], tol: 0,
        hint: 'Rearrange to y = mx + b, or use m = −A/B.',
        solution: steps([T(B + 'y = ' + (-A) + 'x' + sgn(-C)), T('y = ' + frac(-A, B) + 'x' + sgn(0).replace(' + 0', '') + ' ' + (frac(-C, B).charAt(0) === '-' ? '- ' + frac(C, B) : '+ ' + frac(-C, B))), T('m = -\\dfrac{A}{B} = ' + frac(-A, B)) + '.']) };
    },
    function () { // equation of a graphed line through two integer points (both inside the ±8 grid)
      var g = gridPts(), n = g.n, d = g.d, b = g.b, x1 = g.x1, y1 = g.y1, x2 = g.x2, y2 = g.y2;
      return { prompt: 'The line passes through the two marked points, which have integer coordinates. Write its equation in slope y-intercept form ' + T('y = mx + b') + '.' + Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, lines: [{ m: n / d, b: b }], points: [[x1, y1], [x2, y2]] }), type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Slope from the two points (rise over run), then read the y-intercept where the line crosses the y-axis.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), 'The line crosses the y-axis at ' + T(pt(0, b)) + ', so ' + T('b = ' + b) + '.', T(sifTex(n, d, b)) + '.']) };
    },
    function () { // horizontal / vertical line through a point
      var x = nz(-9, 9), y = nz(-9, 9), vert = Math.random() < 0.5;
      return { prompt: 'A line passes through ' + T(pt(x, y)) + ' and is ' + (vert ? '<b>perpendicular</b> to the ' + T('x') + '-axis' : '<b>parallel</b> to the ' + T('x') + '-axis') + '. Write its equation.', type: 'expr', answers: [vert ? 'x=' + x : 'y=' + y], check: 'exact',
        hint: vert ? 'Perpendicular to the x-axis means vertical: every point has the same x-coordinate.' : 'Parallel to the x-axis means horizontal: every point has the same y-coordinate.',
        solution: steps([vert ? T('x = ' + x) + '.' : T('y = ' + y) + '.']) };
    },
    function () { // (1) how many of these relations are linear?
      var lin = [
        function () { var a = nz(-6, 6), b = nz(-9, 9); return 'y = ' + coef(a, 'x') + sgn(b); },
        function () { var c = pick([2, 3, 4, 5]), a = nz(-6, 6), b = nz(-9, 9); return c + 'y = ' + coef(a, 'x') + sgn(b); },
        function () { var A = ri(1, 5), B = nz(-5, 5), C = nz(-9, 9); return gfDisp(A, B, C); },
        function () { var k = nz(-6, 6), c = pick([2, 3, 4, 5]); return 'y = \\frac{x' + sgn(k) + '}{' + c + '}'; }];
      var non = [
        function () { var a = nz(-9, 9); return 'y = ' + (a < 0 ? '-' : '') + '\\frac{' + Math.abs(a) + '}{x}'; },
        function () { var a = nz(-5, 5), b = nz(-9, 9); return 'y = ' + coef(a, 'x^{2}') + sgn(b); },
        function () { var a = pick([2, 3, 4, 5, 10]); return 'y = ' + a + '^{x}'; },
        function () { var k = nz(-12, 12); return 'xy = ' + k; }];
      var n = pick([4, 5]), k = ri(1, n - 1);
      var items = shuffle(lin).slice(0, k).map(function (f) { return { tex: f(), lin: true }; }).concat(shuffle(non).slice(0, n - k).map(function (f) { return { tex: f(), lin: false }; }));
      items = shuffle(items);
      return { prompt: 'How many of these relations are linear?<br>' + items.map(function (it) { return T(it.tex); }).join(' &nbsp;&nbsp; ') + '<br>(Enter the number.)', type: 'num', answers: [String(k)], tol: 0,
        hint: 'A linear relation can be written as Ax + By + C = 0: x and y appear to the power 1 only, never multiplied together, in a denominator or in an exponent.',
        solution: steps(['Linear: ' + items.filter(function (it) { return it.lin; }).map(function (it) { return T(it.tex); }).join(', ') + '.', 'Not linear: ' + items.filter(function (it) { return !it.lin; }).map(function (it) { return T(it.tex); }).join(', ') + ' (a square, an exponent, a product xy or x in a denominator).', 'That is ' + k + ' linear relation' + (k === 1 ? '' : 's') + '.']) };
    },
    function () { // (2) state the slope of cy = ax + b or y = b - (n/d)x
      if (Math.random() < 0.5) {
        var c = pick([2, 3, 4, 5, 6]), a = nz(-12, 12), b = nz(-20, 20); while (Math.abs(a) === c) a = nz(-12, 12);
        return { prompt: 'State the slope of the line ' + T(c + 'y = ' + coef(a, 'x') + sgn(b)) + '. Enter a fraction in lowest terms if needed.', type: 'num', answers: [frac(a, c)], tol: 0,
          hint: 'Divide every term by ' + c + ' to get y = mx + b; the slope is the coefficient of x.',
          solution: steps([T('y = ' + frac(a, c) + 'x' + (frac(b, c).charAt(0) === '-' ? ' - ' + frac(-b, c) : ' + ' + frac(b, c))), T('m = ' + frac(a, c)) + '.']) };
      }
      var sl = randSlope(), n = sl[0], d = sl[1], b2 = nz(-9, 9); while (d === 1) { sl = randSlope(); n = sl[0]; d = sl[1]; }
      var mx = fracX(n, d, 'x'); mx = Array.isArray(mx) ? mx[0] : mx;
      return { prompt: 'State the slope of the line ' + T('y = ' + b2 + (n < 0 ? ' - ' + mx.slice(1) : ' + ' + mx)) + '. Enter a fraction in lowest terms.', type: 'num', answers: [frac(n, d)], tol: 0,
        hint: 'The order of the terms does not matter: the slope is the coefficient of x, including its sign.',
        solution: steps([T('y = ' + mx + sgn(b2)), T('m = ' + frac(n, d)) + '.']) };
    },
    function () { // (11a) slope of a line perpendicular to a general-form line
      var A = ri(1, 6), B = nz(-6, 6), C = nz(-12, 12); while (gcd(A, B) !== 1) { A = ri(1, 6); B = nz(-6, 6); }
      return { prompt: 'State the slope of a line <b>perpendicular</b> to ' + T(gfDisp(A, B, C)) + '. Enter a fraction in lowest terms if needed.', type: 'num', answers: [frac(B, A)], tol: 0,
        hint: 'First find the slope of the given line (−A/B), then flip it and change the sign.',
        solution: steps([T('m = -\\dfrac{A}{B} = ' + frac(-A, B)), 'Negative reciprocal: ' + T('m_{\\perp} = ' + frac(B, A)) + '.']) };
    },
    function () { // (15) horizontal / vertical lines from different wordings
      var a = nz(-9, 9), b = nz(-9, 9), vert = Math.random() < 0.5, w = ri(0, 2), b2 = nz(-9, 9); while (b2 === b) b2 = nz(-9, 9); var a2 = nz(-9, 9); while (a2 === a) a2 = nz(-9, 9);
      var prompt, why;
      if (vert) {
        prompt = w === 0 ? 'A line passes through ' + T(pt(a, b)) + ' and is <b>parallel</b> to the ' + T('y') + '-axis. Write its equation.'
          : w === 1 ? 'Write the equation of the line through ' + T(pt(a, b)) + ' and ' + T(pt(a, b2)) + '.'
            : 'A line has ' + T('x') + '-intercept ' + T(String(a)) + ' and <b>no</b> ' + T('y') + '-intercept. Write its equation.';
        why = w === 0 ? 'Parallel to the y-axis means vertical: every point has x-coordinate ' + a + '.' : w === 1 ? 'Both points have the same x-coordinate, so the line is vertical.' : 'A line that never meets the y-axis is vertical, passing through (' + a + ', 0).';
        return { prompt: prompt, type: 'expr', answers: ['x=' + a], check: 'exact', hint: 'Is the line vertical or horizontal? A vertical line is x = a number.', solution: steps([why, T('x = ' + a) + '.']) };
      }
      prompt = w === 0 ? 'A line passes through ' + T(pt(a, b)) + ' and is <b>parallel</b> to the ' + T('x') + '-axis. Write its equation.'
        : w === 1 ? 'Write the equation of the line through ' + T(pt(a, b)) + ' and ' + T(pt(a2, b)) + '.'
          : 'A line has ' + T('y') + '-intercept ' + T(String(b)) + ' and <b>no</b> ' + T('x') + '-intercept. Write its equation.';
      why = w === 0 ? 'Parallel to the x-axis means horizontal: every point has y-coordinate ' + b + '.' : w === 1 ? 'Both points have the same y-coordinate, so the line is horizontal.' : 'A line that never meets the x-axis is horizontal, passing through (0, ' + b + ').';
      return { prompt: prompt, type: 'expr', answers: ['y=' + b], check: 'exact', hint: 'Is the line vertical or horizontal? A horizontal line is y = a number.', solution: steps([why, T('y = ' + b) + '.']) };
    },
    function () { // (16) first point to plot from point-slope form / intercept as an ordered pair
      if (Math.random() < 0.5) {
        var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-8, 8), y1 = nz(-8, 8);
        return { prompt: 'Without changing its form, which point would you plot first to graph ' + T(psDisp(n, d, x1, y1)) + '? Enter an ordered pair.', type: 'expr', answers: [pt(x1, y1)], check: 'exact',
          hint: 'In y − y₁ = m(x − x₁) the point is (x₁, y₁). A plus inside the brackets means the coordinate is negative.',
          solution: steps([T('y - (' + y1 + ') = ' + frac(n, d) + '(x - (' + x1 + '))'), 'Plot ' + T(pt(x1, y1)) + ' first, then use the slope ' + T(frac(n, d)) + ' to find more points.']) };
      }
      var xint = Math.random() < 0.5, A = ri(1, 6), B = nz(-6, 6), v = nz(-8, 8), C = xint ? -A * v : -B * v;
      while (gcd(gcd(A, B), C) !== 1) { A = ri(1, 6); B = nz(-6, 6); v = nz(-8, 8); C = xint ? -A * v : -B * v; }
      return { prompt: 'State the ' + T(xint ? 'x' : 'y') + '-intercept of ' + T(gfDisp(A, B, C)) + ' as an ordered pair.', type: 'expr', answers: [xint ? pt(v, 0) : pt(0, v)], check: 'exact',
        hint: xint ? 'On the x-axis y = 0. Substitute y = 0, solve for x, and write the point as (x, 0).' : 'On the y-axis x = 0. Substitute x = 0, solve for y, and write the point as (0, y).',
        solution: steps([xint ? T(A + 'x' + sgn(C) + ' = 0') : T(B + 'y' + sgn(C) + ' = 0'), T((xint ? 'x = ' : 'y = ') + v), 'The ' + (xint ? 'x' : 'y') + '-intercept is ' + T(xint ? pt(v, 0) : pt(0, v)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // slope y-intercept with fractions -> general form
      var sl = randSlope(), n = sl[0], d = sl[1], bd = pick([2, 3, 4, 6]), bn = nz(-7, 7); while (gcd(bn, bd) !== 1) bn = nz(-7, 7);
      // y = (n/d) x + bn/bd  -> multiply by L = lcm(d, bd): L y = (L n/d) x + L bn/bd -> (Ln/d) x - L y + (L bn / bd) = 0
      var L = d * bd / gcd(d, bd), A0 = L * n / d, B0 = -L, C0 = L * bn / bd, g = gcd(gcd(A0, B0), C0), A1 = A0 / g, B1 = B0 / g, C1 = C0 / g;
      var flipped = A1 < 0, A = flipped ? -A1 : A1, B = flipped ? -B1 : B1, C = flipped ? -C1 : C1;
      var tex = (A === 1 ? 'x' : A + 'x') + (B < 0 ? '-' : '+') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y') + (C < 0 ? '-' : '+') + Math.abs(C) + '=0';
      var sol = [T(L + 'y = ' + A0 + 'x' + sgn(C0)), 'Move everything to one side: ' + T(gfDisp(A0, B0, C0))];
      if (g > 1) sol.push('Divide every term by ' + g + ': ' + T(gfDisp(A1, B1, C1)));
      if (flipped) sol.push('Multiply every term by −1 so that ' + T('A > 0') + ': ' + T(gfDisp(A, B, C)));
      sol.push(T(tex.replace('=0', ' = 0')) + '.');
      return { prompt: 'Write ' + T(sifTex(n, d, bn, bd)) + ' in general form ' + T('Ax + By + C = 0') + ', where ' + T('A') + ', ' + T('B') + ' and ' + T('C') + ' are integers with no common factor and ' + T('A') + ' is positive.', type: 'expr', answers: [tex], check: 'exact',
        hint: 'Multiply every term by the lowest common denominator (' + L + ') to clear the fractions, then move everything to one side.' + (flipped ? ' If the x-coefficient comes out negative, multiply every term by −1.' : ''),
        solution: steps(sol) };
    },
    function () { // y-intercept of a general-form line as a fraction
      var A = ri(1, 6), B = pick([2, 3, 4, 5, 6, -2, -3, -4]), C = nz(-11, 11); while (C % B === 0) C = nz(-11, 11);
      return { prompt: 'Determine the ' + T('y') + '-intercept of the line ' + T(gfDisp(A, B, C)) + '. Enter an exact fraction.', type: 'num', answers: [frac(-C, B)], tol: 0,
        hint: 'Set x = 0 and solve for y.',
        solution: steps([T(B + 'y' + sgn(C) + ' = 0'), T('y = ' + frac(-C, B)) + '.']) };
    },
    function () { // general -> slope y-intercept
      var A = ri(1, 6), B = pick([2, 3, 4, 5, -2, -3, -4, 1, -1]), C = nz(-12, 12); while (gcd(gcd(A, B), C) !== 1) { A = ri(1, 6); C = nz(-12, 12); }
      var mn = -A, md = B, bn = -C, bd = B; // y = (-A/B) x + (-C/B)
      var ans = sif(mn, md, bn, bd);
      return { prompt: 'Write the line ' + T(gfDisp(A, B, C)) + ' in slope y-intercept form (' + T('y = mx + b') + ').', type: 'expr', answers: ans, check: 'exact',
        hint: 'Move the x-term and the constant to the other side, then divide every term by the coefficient of y.',
        solution: steps([T(B + 'y = ' + (-A) + 'x' + sgn(-C)), T(sifTex(mn, md, bn, bd)) + '.']) };
    },
    function () { // x-intercept of a point-slope equation
      var m = pick([2, 3, -2, -3, 4, 1, -1]), x1 = nz(-6, 6), y1 = m * nz(-4, 4); var xi = x1 - y1 / m;
      var eq = psDisp(m, 1, x1, y1);
      return { prompt: 'Determine the ' + T('x') + '-intercept of the line ' + T(eq) + '.', type: 'num', answers: [String(xi)], tol: 0,
        hint: 'Substitute y = 0 and solve for x.',
        solution: steps([T('0' + (y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1) + ' = ' + m + '(x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1) + ')'), T('x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1) + ' = ' + frac(-y1, m)), T('x = ' + xi) + '.']) };
    },
    function () { // slope y-intercept from two points
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-6, 6), b = nz(-7, 7); var k = pick([1, 2, 3, -1, -2]); var x2 = x1 + d * k;
      var y1n = n * x1 + b * d, y2n = n * x2 + b * d; if (y1n % d || y2n % d) { x1 = d * nz(-2, 2); x2 = x1 + d * k; y1n = n * x1 + b * d; y2n = n * x2 + b * d; }
      var y1 = y1n / d, y2 = y2n / d;
      return { prompt: 'Determine the equation of the line through ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + ' in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Find the slope first, then substitute one point to find b.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), T(y1 + ' = ' + frac(n, d) + '(' + x1 + ') + b') + ', so ' + T('b = ' + b) + '.', T(sifTex(n, d, b)) + '.']) };
    },
    function () { // (3) intercept of a general-form line as an ordered pair (sometimes a fraction)
      var xint = Math.random() < 0.5, A = ri(2, 7), B = nz(-6, 6), C, v;
      do { if (Math.random() < 0.65) { v = nz(-7, 7); C = xint ? -A * v : -B * v; } else C = nz(-15, 15); } while (gcd(gcd(A, B), C) !== 1 || C === 0);
      var fr = xint ? frac(-C, A) : frac(-C, B), dec = xint ? decOf(-C, A) : decOf(-C, B);
      var ans = [xint ? '(' + fr + ',0)' : '(0,' + fr + ')']; if (dec) ans.push(xint ? '(' + dec + ',0)' : '(0,' + dec + ')');
      return { prompt: 'Determine the ' + T(xint ? 'x' : 'y') + '-intercept of ' + T(gfDisp(A, B, C)) + '. Enter it as an ordered pair.', type: 'expr', answers: ans, check: 'exact', note: 'For example ' + T('(-4,0)') + ' or ' + T('\\left(\\frac{2}{3},0\\right)') + '.',
        hint: xint ? 'Set y = 0 and solve for x; the point is (x, 0). Leave a fraction in lowest terms.' : 'Set x = 0 and solve for y; the point is (0, y). Leave a fraction in lowest terms.',
        solution: steps([xint ? T(A + 'x' + sgn(C) + ' = 0') : T(B + 'y' + sgn(C) + ' = 0'), T((xint ? 'x = ' : 'y = ') + fr), 'The ' + (xint ? 'x' : 'y') + '-intercept is ' + T(xint ? '(' + fr + ', 0)' : '(0, ' + fr + ')') + '.']) };
    },
    function () { // (11b) which of three lines is perpendicular to a given line
      var A = ri(1, 6), B = nz(-6, 6); while (gcd(A, B) !== 1 || Math.abs(A) === Math.abs(B)) { A = ri(1, 6); B = nz(-6, 6); }
      var C0 = nz(-9, 9), c = function () { return nz(-12, 12); }, c3 = c(); while (c3 === C0) c3 = c();
      var k1 = pick([1, 1, 2]), k2 = pick([1, 1, 2]), k3 = pick([1, 1, 2]);
      var opts = shuffle([{ v: normG(k1 * B, -k1 * A, c()), ok: true, why: 'perpendicular (negative reciprocal slope)' }, { v: normG(k2 * B, k2 * A, c()), ok: false, why: 'the reciprocal, but the sign was not changed' }, { v: normG(k3 * A, k3 * B, c3), ok: false, why: 'parallel (same slope)' }]);
      var idx = 0; opts.forEach(function (o, i) { if (o.ok) idx = i + 1; });
      return { prompt: 'Which of these lines is <b>perpendicular</b> to ' + T(gfDisp(A, B, C0)) + '?<br>' + opts.map(function (o, i) { return '(' + (i + 1) + ') ' + T(gfDisp(o.v[0], o.v[1], o.v[2])); }).join(' &nbsp;&nbsp; ') + '<br>Enter 1, 2 or 3.', type: 'num', answers: [String(idx)], tol: 0,
        hint: 'The slope of Ax + By + C = 0 is −A/B. The given slope is ' + fs(-A, B) + '; a perpendicular line has slope ' + fs(B, A) + '. Watch for the sign trap.',
        solution: steps(['Given line: ' + T('m = -\\dfrac{A}{B} = ' + frac(-A, B)) + ', so a perpendicular line needs ' + T('m_{\\perp} = ' + frac(B, A)) + '.'].concat(opts.map(function (o, i) { return 'Line (' + (i + 1) + '): ' + T('m = ' + frac(-o.v[0], o.v[1])) + ' — ' + o.why + '.'; })).concat(['Line (' + idx + ') is perpendicular.'])) };
    },
    function () { // (14) a point with an unknown coordinate lies on a line: find k, or find the y-intercept
      var w = ri(0, 2);
      if (w === 0) {
        var A = ri(1, 6), B = nz(-6, 6), x0 = nz(-8, 8), k = nz(-8, 8), C = -(A * x0 + B * k); while (gcd(gcd(A, B), C) !== 1 || C === 0) { A = ri(1, 6); B = nz(-6, 6); x0 = nz(-8, 8); k = nz(-8, 8); C = -(A * x0 + B * k); }
        return { prompt: 'The point ' + T('(' + x0 + ', k)') + ' lies on the line ' + T(gfDisp(A, B, C)) + '. Determine ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
          hint: 'Substitute x = ' + x0 + ' and y = k into the equation, then solve for k.',
          solution: steps([T(A + '(' + x0 + ')' + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'k' + sgn(C) + ' = 0'), T(B + 'k = ' + (-(A * x0 + C))), T('k = ' + k) + '.']) };
      }
      if (w === 1) {
        var kk = nz(-5, 5), x1 = nz(-8, 8), b = nz(-9, 9), y1 = kk * x1 + b;
        return { prompt: 'The line ' + T('y = kx' + sgn(b)) + ' passes through ' + T(pt(x1, y1)) + '. Find ' + T('k') + '.', type: 'num', answers: [String(kk)], tol: 0,
          hint: 'Substitute the point for x and y, then solve for k.',
          solution: steps([T(y1 + ' = k(' + x1 + ')' + sgn(b)), T(x1 + 'k = ' + (y1 - b)), T('k = ' + kk) + '.']) };
      }
      var m = nz(-6, 6), px = nz(-8, 8), py = nz(-9, 9), bb = py - m * px;
      return { prompt: 'The point ' + T(pt(px, py)) + ' lies on a line with slope ' + T(String(m)) + '. Determine the ' + T('y') + '-intercept of the line.', type: 'num', answers: [String(bb)], tol: 0,
        hint: 'Substitute m, x and y into y = mx + b and solve for b.',
        solution: steps([T(py + ' = ' + m + '(' + px + ') + b'), T('b = ' + py + ' - (' + (m * px) + ') = ' + bb) + '.']) };
    }
  ];

  var A_MAS = [
    function () { // lines meeting on the y-axis: find k
      var yi = nz(-6, 6), A1 = ri(1, 5), B1 = pick([1, 2, 3, -1, -2, -3]), C1 = -B1 * yi; // A1 x + B1 y + C1 = 0 has y-int yi
      var A2 = ri(1, 5), C2 = nz(-12, 12); while (C2 % yi !== 0) C2 = nz(-12, 12); var k = -C2 / yi; // k yi + C2 = 0
      function eq(A, B, C) { return coef(A, 'x') + (typeof B === 'string' ? ' + ' + B : (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y')) + sgn(C) + ' = 0'; }
      return { prompt: 'The lines ' + T(eq(A1, B1, C1)) + ' and ' + T(eq(A2, 'ky', C2)) + ' intersect on the ' + T('y') + '-axis. Determine the value of ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Find the y-intercept of the first line; the second line must pass through that same point (0, y).',
        solution: steps(['First line, x = 0: ' + T(B1 + 'y' + sgn(C1) + ' = 0') + ', so ' + T('y = ' + yi) + '.', 'Second line through ' + T(pt(0, yi)) + ': ' + T('k(' + yi + ')' + sgn(C2) + ' = 0'), T('k = ' + k) + '.']) };
    },
    function () { // general form from a table
      var sl = randSlope(), n = sl[0], d = sl[1], x0 = nz(-4, 4), y0 = nz(-6, 6), step = pick([1, 2, 3]);
      var xs = [0, 1, 2, 3].map(function (i) { return x0 + i * d * step; }), ys = [0, 1, 2, 3].map(function (i) { return y0 + i * n * step; });
      var gf = general(n, d, x0, y0);
      return { prompt: 'The table comes from a linear relation.' + Fig.table(xs, ys) + 'Determine its equation in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'Slope from any two rows; then point-slope form with one row; then clear fractions and move everything to one side.',
        solution: steps([T('m = \\dfrac{' + ys[1] + ' - (' + ys[0] + ')}{' + xs[1] + ' - (' + xs[0] + ')} = ' + frac(n, d)), T(psDisp(n, d, x0, y0)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // altitude from a vertex: perpendicular to a side with known slope
      var sl = randSlope(), n = sl[0], d = sl[1], fx = nz(-6, 6), fy = nz(-6, 6); // altitude slope = -d/n
      var gf = general(-d, n, fx, fy);
      return { prompt: 'In ' + T('\\triangle DEF') + ', side ' + T('DE') + ' has slope ' + T(frac(n, d)) + ' and ' + T('F') + ' is ' + T(pt(fx, fy)) + '. Determine the equation of the <b>altitude</b> from ' + T('F') + ' to ' + T('DE') + ', in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'An altitude is perpendicular to the side: its slope is the negative reciprocal. Then use point-slope form through F and rearrange.',
        solution: steps([T('m_{\\text{alt}} = ' + frac(-d, n)), T(psDisp(-d, n, fx, fy)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // line through a point perpendicular to a general-form line, in general form
      var A = ri(1, 5), B = nz(-5, 5), C = nz(-9, 9); while (gcd(A, B) !== 1 || Math.abs(A) === Math.abs(B)) { A = ri(1, 5); B = nz(-5, 5); }
      var px = nz(-6, 6), py = nz(-6, 6); // given slope -A/B ; perpendicular slope B/A
      var gf = general(B, A, px, py);
      return { prompt: 'Determine the equation of the line through ' + T(pt(px, py)) + ' that is <b>perpendicular</b> to ' + T(gfDisp(A, B, C)) + '. Give it in general form (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'The given slope is −A/B = ' + fs(-A, B) + '; flip and negate it, then use point-slope form and rearrange.',
        solution: steps([T('m_{\\text{given}} = ' + frac(-A, B)) + ', so ' + T('m_{\\perp} = ' + frac(B, A)) + '.', T(psDisp(B, A, px, py)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // k for a required intercept
      var xi = nz(-6, 6), B = pick([2, 3, 4, 5, -2, -3]), C = nz(-12, 12); while (C % xi !== 0) C = nz(-12, 12); var k = -C / xi;
      var which = Math.random() < 0.5;
      if (which) return { prompt: 'Determine ' + T('k') + ' so that the line ' + T('kx' + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'y' + sgn(C) + ' = 0') + ' has ' + T('x') + '-intercept ' + T(String(xi)) + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'The point (' + xi + ', 0) must satisfy the equation.',
        solution: steps([T('k(' + xi + ') + ' + B + '(0)' + sgn(C) + ' = 0'), T('k = ' + k) + '.']) };
      // slope condition instead: k x + B y + C = 0 parallel to slope m -> -k/B = m
      var m = nz(-4, 4), k2 = -m * B;
      return { prompt: 'Determine ' + T('k') + ' so that the line ' + T('kx' + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'y' + sgn(C) + ' = 0') + ' is <b>parallel</b> to a line with slope ' + T(String(m)) + '.', type: 'num', answers: [String(k2)], tol: 0,
        hint: 'The slope of Ax + By + C = 0 is −A/B. Set −k/B equal to ' + m + '.',
        solution: steps([T('-\\dfrac{k}{' + B + '} = ' + m), T('k = ' + k2) + '.']) };
    },
    function () { // (12) perpendicular lines with an unknown coefficient
      if (Math.random() < 0.5) { // a y = p x + q  ⟂  y = (n/d) x + b  ->  p/a = -d/n  ->  a = -p n / d  (p a multiple of d keeps a an integer)
        var sl = randSlope(), n = sl[0], d = sl[1], t = nz(-6, 6), p = d * t, a = -t * n, q = nz(-15, 15), b0 = nz(-9, 9);
        return { prompt: 'The lines ' + T('ay = ' + coef(p, 'x') + sgn(q)) + ' and ' + T(sifTex(n, d, b0)) + ' are <b>perpendicular</b>. Determine ' + T('a') + '.', type: 'num', answers: [String(a)], tol: 0,
          hint: 'The first line has slope ' + p + '/a. It must be the negative reciprocal of ' + fs(n, d) + '.',
          solution: steps(['Slope of the first line: ' + T('y = \\dfrac{' + p + '}{a}x + \\dfrac{' + q + '}{a}') + ', so ' + T('m_1 = \\dfrac{' + p + '}{a}') + '.', 'Perpendicular to slope ' + T(frac(n, d)) + ' means ' + T('m_1 = ' + frac(-d, n)) + '.', T('\\dfrac{' + p + '}{a} = ' + frac(-d, n)) + ', so ' + T('a = ' + a) + '.']) };
      }
      // k x + B1 y + C1 = 0  ⟂  A2 x + B2 y + C2 = 0 : (-k/B1)(-A2/B2) = -1 -> k = -B1 B2 / A2  (B1 a multiple of A2)
      var A2 = ri(1, 5), B2 = nz(-6, 6), C2 = nz(-9, 9); while (gcd(gcd(A2, B2), C2) !== 1) { A2 = ri(1, 5); B2 = nz(-6, 6); C2 = nz(-9, 9); }
      var tt = nz(-3, 3), B1 = A2 * tt, k = -tt * B2, C1 = nz(-9, 9);
      return { prompt: 'The lines ' + T('kx' + (B1 < 0 ? ' - ' : ' + ') + (Math.abs(B1) === 1 ? 'y' : Math.abs(B1) + 'y') + sgn(C1) + ' = 0') + ' and ' + T(gfDisp(A2, B2, C2)) + ' are <b>perpendicular</b>. Determine ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Slopes: −k/' + B1 + ' and ' + fs(-A2, B2) + '. Perpendicular slopes multiply to −1 (or: one is the negative reciprocal of the other).',
        solution: steps([T('m_2 = -\\dfrac{A}{B} = ' + frac(-A2, B2)) + ', so the first line needs ' + T('m_1 = ' + frac(B2, A2)) + '.', T('-\\dfrac{k}{' + B1 + '} = ' + frac(B2, A2)), T('k = ' + k) + '.']) };
    },
    function () { // (13) same intercept: find the unknown coefficient (fraction allowed)
      var xint = Math.random() < 0.5, v = nz(-6, 6), A1 = ri(1, 5), B1 = nz(-6, 6), C1 = xint ? -A1 * v : -B1 * v; // first line has that intercept
      var A2 = ri(1, 5), B2 = nz(-6, 6), C2 = nz(-12, 12); var a = xint ? frac(-C2, v) : frac(-C2, v), dec = decOf(-C2, v);
      var second = xint ? 'ax' + (B2 < 0 ? ' - ' : ' + ') + (Math.abs(B2) === 1 ? 'y' : Math.abs(B2) + 'y') + sgn(C2) + ' = 0' : coef(A2, 'x') + ' + ay' + sgn(C2) + ' = 0';
      var ans = [a]; if (dec) ans.push(dec);
      return { prompt: 'Consider the lines ' + T(gfDisp(A1, B1, C1)) + ' and ' + T(second) + '. Determine ' + T('a') + ' if the lines have the same ' + T(xint ? 'x' : 'y') + '-intercept. Enter a fraction in lowest terms if needed.', type: 'num', answers: ans, tol: 0,
        hint: 'Find the ' + (xint ? 'x' : 'y') + '-intercept of the first line (set ' + (xint ? 'y' : 'x') + ' = 0). That same point must satisfy the second equation.',
        solution: steps(['First line, ' + (xint ? 'y = 0' : 'x = 0') + ': ' + T(xint ? A1 + 'x' + sgn(C1) + ' = 0' : B1 + 'y' + sgn(C1) + ' = 0') + ', so the intercept is ' + T(xint ? pt(v, 0) : pt(0, v)) + '.', 'Second line through that point: ' + T('a(' + v + ')' + sgn(C2) + ' = 0'), T('a = ' + a) + '.']) };
    },
    function () { // (14b) decimal x on a line parallel / perpendicular to a general-form line through P: find k to the nearest tenth
      var A, B, C, px, py, xd, par, mn, md, k, tries = 0;
      do {
        A = ri(1, 6); B = nz(-6, 6); C = nz(-20, 20); while (gcd(A, B) !== 1) { A = ri(1, 6); B = nz(-6, 6); }
        px = nz(-6, 6); py = nz(-6, 6); xd = nz(-120, 120) / 10; par = Math.random() < 0.5;
        mn = par ? -A : B; md = par ? B : A; k = py + mn * (xd - px) / md;
      } while ((xd === Math.round(xd) || Math.abs(Math.abs(k * 10) % 1 - 0.5) < 0.02) && ++tries < 200);
      var kr = Math.round(k * 10) / 10;
      return { prompt: 'The point ' + T('(' + xd + ', k)') + ' lies on the line through ' + T('P' + pt(px, py)) + ' that is <b>' + (par ? 'parallel' : 'perpendicular') + '</b> to ' + T(gfDisp(A, B, C)) + '. Determine ' + T('k') + ' to the nearest tenth.', type: 'num', answers: [String(kr), num(k)], tol: 0.05,
        hint: 'The slope of Ax + By + C = 0 is −A/B. ' + (par ? 'A parallel line has the same slope.' : 'A perpendicular line has the negative reciprocal slope.') + ' Write the new line in point-slope form through P, then substitute x = ' + xd + ' and y = k. Round only at the end.',
        solution: steps([T('m_{\\text{given}} = ' + frac(-A, B)) + ', so the new line has ' + T('m = ' + frac(mn, md)) + '.', T(psDisp(mn, md, px, py)), 'Substitute: ' + T('k = ' + py + ' + \\left(' + frac(mn, md) + '\\right)(' + xd + ' - (' + px + ')) = ' + num(k) + ' \\approx ' + kr) + '.']) };
    },
    function () { // (15b) horizontal / vertical line in general form
      var x = nz(-9, 9), y = nz(-9, 9), vert = Math.random() < 0.5;
      var tex = vert ? 'x' + (x < 0 ? '+' + Math.abs(x) : '-' + x) + '=0' : 'y' + (y < 0 ? '+' + Math.abs(y) : '-' + y) + '=0';
      return { prompt: 'Write, in general form ' + T('Ax + By + C = 0') + ', the equation of the <b>' + (vert ? 'vertical' : 'horizontal') + '</b> line through ' + T(pt(x, y)) + '.', type: 'expr', answers: [tex], check: 'exact', note: 'Keep the leading coefficient positive, e.g. ' + T('y - 4 = 0') + ' rather than ' + T('-y + 4 = 0') + '.',
        hint: (vert ? 'A vertical line is x = ' + x : 'A horizontal line is y = ' + y) + '. Move the constant to the left side so the equation equals 0.',
        solution: steps([T(vert ? 'x = ' + x : 'y = ' + y), T(gfSp(tex)) + '.']) };
    },
    function () { // (22) area of the triangle formed by a line and the axes
      var useG = Math.random() < 0.5, P, Q, area, eq, s1, s2;
      if (useG) {
        var A = ri(1, 7), B = nz(-7, 7), C = nz(-20, 20); while (gcd(gcd(A, B), C) !== 1 || C * C < 2 * Math.abs(A * B)) { A = ri(1, 7); B = nz(-7, 7); C = nz(-20, 20); } // area at least 1
        P = -C / A; Q = -C / B; area = Math.abs(P * Q) / 2; eq = gfDisp(A, B, C);
        s1 = 'y = 0: ' + T(A + 'x' + sgn(C) + ' = 0') + ', so ' + T('P(' + frac(-C, A) + ', 0)') + '.'; s2 = 'x = 0: ' + T(B + 'y' + sgn(C) + ' = 0') + ', so ' + T('Q(0, ' + frac(-C, B) + ')') + '.';
      } else {
        var m = nz(-9, 9), b = nz(-9, 9); while (b * b < 2 * Math.abs(m)) { m = nz(-9, 9); b = nz(-9, 9); } // area at least 1
        P = -b / m; Q = b; area = Math.abs(P * Q) / 2; eq = sifTex(m, 1, b);
        s1 = 'y = 0: ' + T('0 = ' + m + 'x' + sgn(b)) + ', so ' + T('P(' + frac(-b, m) + ', 0)') + '.'; s2 = 'x = 0: ' + T('Q(0, ' + b + ')') + '.';
      }
      return { prompt: 'The line ' + T(eq) + ' meets the ' + T('x') + '-axis at ' + T('P') + ' and the ' + T('y') + '-axis at ' + T('Q') + '. Determine the area of ' + T('\\triangle POQ') + ' to the nearest tenth. (Number only.)', type: 'num', answers: [tenth(area), num(area)], tol: 0.05,
        hint: 'O is the origin. The triangle is right-angled at O, so area = ½ × |x-intercept| × |y-intercept|.',
        solution: steps([s1, s2, T('A = \\tfrac{1}{2}(' + num(Math.abs(P)) + ')(' + num(Math.abs(Q)) + ') = ' + num(area)) + (tenth(area) === num(area) ? '' : ' ' + T('\\approx ' + tenth(area))) + ' square units.']) };
    }
  ];

  /* ---------- RF7 · writing equations ---------- */
  var B_BEG = [
    function () { // point-slope form (25%: a zero coordinate)
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-8, 8), y1 = nz(-8, 8), r = Math.random();
      if (r < 0.125) x1 = 0; else if (r < 0.25) y1 = 0;
      var zero = x1 === 0 ? 'x' : y1 === 0 ? 'y' : '';
      return { prompt: 'Write the equation, in point-slope form ' + T('y - y_1 = m(x - x_1)') + ', of the line through ' + T(pt(x1, y1)) + ' with slope ' + T(frac(n, d)) + '.', type: 'expr', answers: psForms(n, d, x1, y1), check: 'exact', note: 'Keep it in point-slope form, e.g. ' + T('y + 2 = \\frac{3}{4}(x - 1)') + '.',
        hint: 'Substitute the point and the slope straight into the form. Watch the signs: subtracting a negative becomes a plus.' + (zero ? ' Subtracting 0 changes nothing, so that part simply disappears.' : ''),
        solution: steps([T('y - (' + y1 + ') = ' + frac(n, d) + '(x - (' + x1 + '))'), T(psDisp(n, d, x1, y1)) + '.']) };
    },
    function () { // point-slope -> slope y-intercept
      var m = pick([2, 3, -2, -3, 4, 1, -1]), x1 = nz(-6, 6), y1 = nz(-8, 8); var b = y1 - m * x1;
      var eq = psDisp(m, 1, x1, y1);
      return { prompt: 'Write ' + T(eq) + ' in slope y-intercept form (' + T('y = mx + b') + ').', type: 'expr', answers: sif(m, 1, b), check: 'exact',
        hint: 'Distribute the slope, then move the constant to the right side.',
        solution: steps([T('y' + (y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1) + ' = ' + (m === 1 ? '' : m === -1 ? '-' : m) + 'x' + sgn(-m * x1)), T(sifTex(m, 1, b)) + '.']) };
    },
    function () { // from slope and y-intercept
      var sl = randSlope(), n = sl[0], d = sl[1], b = nz(-9, 9);
      return { prompt: 'Write the equation of the line with slope ' + T(frac(n, d)) + ' and ' + T('y') + '-intercept ' + T(String(b)) + ', in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'm is the slope and b is the y-intercept. Just place them.',
        solution: steps([T(sifTex(n, d, b)) + '.']) };
    },
    function () { // from slope and a point, slope y-intercept (integer or fractional slope; sometimes through the origin)
      var r = Math.random(), n, d, x1, y1;
      if (r < 0.2) { var sl0 = randSlope(); n = sl0[0]; d = sl0[1]; x1 = 0; y1 = 0; }
      else if (r < 0.55) { var sl = randSlope(); n = sl[0]; d = sl[1]; while (d === 1) { sl = randSlope(); n = sl[0]; d = sl[1]; } x1 = d * nz(-2, 2); y1 = nz(-9, 9); }
      else { n = pick([2, 3, -2, -3, 4, -4, 5]); d = 1; x1 = nz(-6, 6); y1 = nz(-9, 9); }
      var b = y1 - n * x1 / d;
      return { prompt: 'Determine the equation of the line with slope ' + T(frac(n, d)) + ' that passes through ' + T(x1 === 0 && y1 === 0 ? 'the origin' : pt(x1, y1)) + ', in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Substitute m, x and y into y = mx + b and solve for b.' + (b === 0 ? ' A line through the origin has b = 0, so write y = mx.' : ''),
        solution: steps([T(y1 + ' = ' + frac(n, d) + '(' + x1 + ') + b'), T('b = ' + y1 + ' - (' + num(n * x1 / d) + ') = ' + b), T(sifTex(n, d, b)) + '.']) };
    },
    function () { // parallel line through a point (integer slope)
      var m = pick([2, 3, -2, -3, 4, -1]), b0 = nz(-7, 7), x1 = nz(-5, 5), y1 = nz(-7, 7); var b = y1 - m * x1;
      return { prompt: 'Write the equation of the line through ' + T(pt(x1, y1)) + ' that is <b>parallel</b> to ' + T(sifTex(m, 1, b0)) + '. Use the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(m, 1, b), check: 'exact',
        hint: 'Parallel means the same slope, ' + m + '. Then use the point to find b.',
        solution: steps([T('m = ' + m), T(y1 + ' = ' + m + '(' + x1 + ') + b') + ', so ' + T('b = ' + b) + '.', T(sifTex(m, 1, b)) + '.']) };
    },
    function () { // (4) the point used to write a point-slope equation
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-9, 9), y1 = nz(-9, 9), r = Math.random();
      if (r < 0.15) x1 = 0; else if (r < 0.3) y1 = 0;
      return { prompt: 'The equation ' + T(psDisp(n, d, x1, y1)) + ' is in point-slope form. State the coordinates of the point used to write it. Enter an ordered pair.', type: 'expr', answers: [pt(x1, y1)], check: 'exact',
        hint: 'Compare with y − y₁ = m(x − x₁). A plus means the coordinate is negative' + (x1 === 0 || y1 === 0 ? '; a missing part means that coordinate is 0' : '') + '.',
        solution: steps([T('y - (' + y1 + ') = ' + frac(n, d) + '(x - (' + x1 + '))'), 'The point is ' + T(pt(x1, y1)) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // perpendicular to one line, same y-intercept as another
      var sl = randSlope(), n = sl[0], d = sl[1]; while (Math.abs(n) === 1 && d === 1) { sl = randSlope(); n = sl[0]; d = sl[1]; }
      var b1 = nz(-6, 6), m2 = pick([2, 3, -2, 5]), b2 = nz(-8, 8);
      return { prompt: 'Write the equation, in the form ' + T('y = mx + b') + ', of the line that is <b>perpendicular</b> to ' + T(sifTex(n, d, b1)) + ' and has the same ' + T('y') + '-intercept as ' + T(sifTex(m2, 1, b2)) + '.', type: 'expr', answers: sif(-d, n, b2), check: 'exact',
        hint: 'Perpendicular slope = negative reciprocal of ' + fs(n, d) + '. The y-intercept is borrowed from the second line.',
        solution: steps([T('m = ' + frac(-d, n)), T('b = ' + b2), T(sifTex(-d, n, b2)) + '.']) };
    },
    function () { // parallel line through a point, fractional slope
      var sl = randSlope(), n = sl[0], d = sl[1]; while (d === 1) { sl = randSlope(); n = sl[0]; d = sl[1]; }
      var b0 = nz(-6, 6), x1 = d * nz(-2, 2), y1 = nz(-7, 7); var b = y1 - n * x1 / d;
      return { prompt: 'Determine the equation of the line through ' + T(pt(x1, y1)) + ' that is <b>parallel</b> to ' + T(sifTex(n, d, b0)) + '. Use the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Same slope as the given line. Substitute the point to find b.',
        solution: steps([T(y1 + ' = ' + frac(n, d) + '(' + x1 + ') + b'), T('b = ' + y1 + ' - (' + (n * x1 / d) + ') = ' + b), T(sifTex(n, d, b)) + '.']) };
    },
    function () { // general form from a graph with two points (both inside the ±8 grid)
      var g = gridPts(), n = g.n, d = g.d, b = g.b, x1 = g.x1, y1 = g.y1, x2 = g.x2, y2 = g.y2, gf = general(n, d, 0, b);
      return { prompt: 'The line passes through the two marked points, which have integer coordinates. Determine its equation in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).' + Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, lines: [{ m: n / d, b: b }], points: [[x1, y1], [x2, y2]] }), type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'Find the slope, write y = mx + b, then clear the fraction and move everything to the left.',
        solution: steps([T('m = ' + frac(n, d) + ',\\ b = ' + b), T(sifTex(n, d, b)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // perpendicular to the line through two points, through a third point
      var run = pick([2, 3, 4, 5]), rise = nz(-4, 4), ax = nz(-5, 5), ay = nz(-5, 5), px = nz(-6, 6), py = nz(-6, 6); var g = gcd(run, rise); var n = rise / g, d = run / g;
      var b = py + d * px / n; // slope -d/n through P -> b = py - (-d/n) px
      if (b !== Math.round(b)) { px = n * pick([1, -1, 2]); b = py + d * px / n; }
      return { prompt: 'Determine the equation of the line through ' + T('P' + pt(px, py)) + ' that is <b>perpendicular</b> to the line through ' + T('A' + pt(ax, ay)) + ' and ' + T('B' + pt(ax + run, ay + rise)) + '. Use the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(-d, n, b), check: 'exact',
        hint: 'Slope of AB first (' + fs(rise, run) + '), then the negative reciprocal, then substitute P.',
        solution: steps([T('m_{AB} = ' + frac(rise, run)) + ', so ' + T('m_{\\perp} = ' + frac(-d, n)) + '.', T(py + ' = ' + frac(-d, n) + '(' + px + ') + b') + ', so ' + T('b = ' + b) + '.', T(sifTex(-d, n, b)) + '.']) };
    },
    function () { // (17) equation from a table in slope y-intercept form (x-step may not be 1; x = 0 may be missing; follow-up: find x for a given y)
      var sl = randSlope(), n = sl[0], d = sl[1], b = nz(-7, 7), stepK = pick([1, 1, 2, 3]), x0 = Math.random() < 0.5 ? 0 : d * nz(-2, 2);
      var xs = [0, 1, 2, 3].map(function (i) { return x0 + i * d * stepK; }), ys = xs.map(function (x) { return n * x / d + b; });
      var slope = T('m = \\dfrac{' + ys[1] + ' - (' + ys[0] + ')}{' + xs[1] + ' - (' + xs[0] + ')} = ' + frac(n, d));
      var bStep = x0 === 0 ? T('b = ' + b) + ' (the value at x = 0).' : 'Substitute ' + T(pt(xs[0], ys[0])) + ': ' + T(ys[0] + ' = ' + frac(n, d) + '(' + xs[0] + ') + b') + ', so ' + T('b = ' + b) + '.';
      if (Math.random() < 0.33) { // follow-up: determine x when y = ...
        var k = pick([1, -1]) * ri(8, 30), xq = d * k, yq = n * k + b;
        return { prompt: 'The table comes from a linear relation.' + Fig.table(xs, ys) + 'Determine ' + T('x') + ' when ' + T('y = ' + yq) + '.', type: 'num', answers: [String(xq)], tol: 0,
          hint: 'Find the equation y = mx + b first, then substitute y = ' + yq + ' and solve for x.',
          solution: steps([slope, bStep, T(sifTex(n, d, b)), T(yq + ' = ' + frac(n, d) + 'x' + sgn(b)) + ', so ' + T('x = ' + xq) + '.']) };
      }
      return { prompt: 'The table comes from a linear relation.' + Fig.table(xs, ys) + 'Determine its equation in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: (x0 === 0 ? 'The y-intercept is the value at x = 0. ' : 'There is no x = 0 row, so find b by substituting one row. ') + 'The slope is the change in y over the change in x between rows.',
        solution: steps([slope, bStep, T(sifTex(n, d, b)) + '.']) };
    },
    function () { // (6) general form from a point and a slope
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-8, 8), y1 = nz(-9, 9), gf = general(n, d, x1, y1);
      return { prompt: 'Find the equation, in general form ' + T('Ax + By + C = 0') + ', of the line through ' + T(pt(x1, y1)) + ' with slope ' + T(frac(n, d)) + '.', type: 'expr', answers: [gf.tex], check: 'exact', note: 'Integers with no common factor and ' + T('A') + ' positive.',
        hint: 'Start in point-slope form, clear any fraction by multiplying every term by the denominator, then move everything to the left side.',
        solution: steps([T(psDisp(n, d, x1, y1)), (d === 1 ? 'Expand and move everything to the left: ' : 'Multiply every term by ' + d + ', expand and move everything to the left: ') + T(gfSp(gf.tex)) + '.']) };
    },
    function () { // (7) general form from two points
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-7, 7), y1 = nz(-7, 7), k = pick([1, -1, 2, -2]), x2 = x1 + d * k, y2 = y1 + n * k, gf = general(n, d, x1, y1);
      return { prompt: 'Find the equation, in general form ' + T('Ax + By + C = 0') + ', of the line through ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + '.', type: 'expr', answers: [gf.tex], check: 'exact', note: 'Integers with no common factor and ' + T('A') + ' positive.',
        hint: 'Slope from the two points first, then point-slope form with either point, then rearrange.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), T(psDisp(n, d, x1, y1)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // (8) general form from a slope and an intercept
      var sl = randSlope(), n = sl[0], d = sl[1], v = nz(-9, 9), xint = Math.random() < 0.5, gf = xint ? general(n, d, v, 0) : general(n, d, 0, v);
      return { prompt: 'Determine the equation, in general form ' + T('Ax + By + C = 0') + ', of the line with slope ' + T(frac(n, d)) + ' and ' + (xint ? 'an ' + T('x') + '-intercept of ' : 'a ' + T('y') + '-intercept of ') + T(String(v)) + '.', type: 'expr', answers: [gf.tex], check: 'exact', note: 'Integers with no common factor and ' + T('A') + ' positive.',
        hint: (xint ? 'An x-intercept of ' + v + ' is the point (' + v + ', 0). ' : 'A y-intercept of ' + v + ' is the point (0, ' + v + '). ') + 'Use point-slope form, then rearrange.',
        solution: steps(['The line passes through ' + T(xint ? pt(v, 0) : pt(0, v)) + '.', T(psDisp(n, d, xint ? v : 0, xint ? 0 : v)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // (9) general form of a line through a point, parallel to a general-form line
      var A = ri(1, 6), B = nz(-6, 6), C = nz(-20, 20); while (gcd(A, B) !== 1) { A = ri(1, 6); B = nz(-6, 6); }
      var px = nz(-8, 8), py = nz(-8, 8), gf = general(-A, B, px, py); // slope -A/B
      return { prompt: 'Write the equation, in general form ' + T('Ax + By + C = 0') + ', of the line through ' + T(pt(px, py)) + ' and <b>parallel</b> to ' + T(gfDisp(A, B, C)) + '.', type: 'expr', answers: [gf.tex], check: 'exact', note: 'Integers with no common factor and ' + T('A') + ' positive.',
        hint: 'Parallel lines have the same slope, −A/B = ' + fs(-A, B) + '. Use point-slope form through the point and rearrange. (Shortcut: keep A and B, and find the new C from the point.)',
        solution: steps([T('m = -\\dfrac{A}{B} = ' + frac(-A, B)), T(psDisp(-A, B, px, py)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // (18) rate of change from a graph
      var ctx = pick([{ x: 'Time (h)', y: 'Distance (km)', unit: 'km/h', rates: [15, 20, 25, 30, 40, 45, 50, 60, 75, 80] }, { x: 'Time (min)', y: 'Volume (L)', unit: 'L/min', rates: [2, 3, 4, 5, 6, 8, 10, 12] }, { x: 'Mass (kg)', y: 'Cost ($)', unit: '$/kg', rates: [2, 3, 4, 5, 6, 8, 9, 12] }]);
      var rate = pick(ctx.rates), t1 = ri(1, 4), t2 = t1 + ri(2, 5), off = pick([0, 0, rate, 2 * rate, -rate]), d1 = rate * t1 + off; if (d1 <= 0) d1 = rate * t1; var d2 = d1 + rate * (t2 - t1);
      var fig = Fig.pathGraph([[t1, d1, '(' + t1 + ', ' + d1 + ')'], [t2, d2, '(' + t2 + ', ' + d2 + ')']], { xlabel: ctx.x, ylabel: ctx.y, xticks: [t1, t2], yticks: [d1, d2] });
      return { prompt: 'The graph shows a linear relation.' + fig + 'Determine the rate of change, in ' + ctx.unit + '. (Number only.)', type: 'num', answers: [String(rate)], tol: 0,
        hint: 'Rate of change = slope = rise ÷ run between the two labelled points.',
        solution: steps([T('m = \\dfrac{' + d2 + ' - ' + d1 + '}{' + t2 + ' - ' + t1 + '} = \\dfrac{' + (d2 - d1) + '}{' + (t2 - t1) + '} = ' + rate), 'The rate of change is ' + rate + ' ' + ctx.unit + '.']) };
    }
  ];

  var B_MAS = [
    function () { // E = mS + b from two data points (commission)
      var c = commission();
      return { prompt: c.text + ' Write an equation in the form ' + T('E = mS + b') + ', where ' + T('E') + ' is the weekly earnings and ' + T('S') + ' is the sales, in dollars.', type: 'expr', answers: ['E=' + c.rate + 'S+' + c.base], check: 'exact', note: 'Type it as ' + T('E = mS + b') + ' with numbers for m and b (decimals are fine).',
        hint: 'Two points: (S, E) = (' + c.s1 + ', ' + c.e1 + ') and (' + c.s2 + ', ' + c.e2 + '). Slope = change in earnings ÷ change in sales.',
        solution: c.model };
    },
    function () { // fuel model from two readings: when is the tank empty / how much fuel at the start
      var rate, D, start, tries = 0;
      do { rate = pick([0.08, 0.1, 0.12, 0.15, 0.2, 0.25]); D = pick([400, 500, 600, 750, 800, 1000]); start = Math.round(rate * D * 100) / 100; } while ((start < 50 || start > 200) && ++tries < 100);
      var k1 = pick([50, 100, 150]), k2 = k1 + pick([100, 150, 200]), f1 = Math.round((start - rate * k1) * 100) / 100, f2 = Math.round((start - rate * k2) * 100) / 100, empty = Math.random() < 0.5;
      var model = [T('m = \\dfrac{' + num(f2) + ' - ' + num(f1) + '}{' + k2 + ' - ' + k1 + '} = \\dfrac{' + num(f2 - f1) + '}{' + (k2 - k1) + '} = ' + num(-rate)) + ' L/km.', T(num(f1) + ' = ' + num(-rate) + '(' + k1 + ') + b') + ', so ' + T('b = ' + num(start)) + ': ' + T('F = ' + num(-rate) + 'd + ' + num(start)) + '.'];
      return { prompt: 'A truck has ' + num(f1) + ' L of fuel after driving ' + k1 + ' km and ' + num(f2) + ' L after ' + k2 + ' km. Fuel use is linear. ' + (empty ? 'After how many kilometres in total will the tank be empty? (Number only.)' : 'How much fuel, in litres, was in the tank at the start of the trip (0 km)? (Number only.)'), type: 'num', answers: [num(empty ? D : start)], tol: 0.01,
        hint: 'Find the rate of change (L per km, negative) from the two readings, then write F = md + b. ' + (empty ? 'The tank is empty when F = 0: solve for d.' : 'The fuel at the start is the value at d = 0, the F-intercept b.'),
        solution: steps(model.concat(empty ? [T('0 = ' + num(-rate) + 'd + ' + num(start)) + ', so ' + T('d = \\dfrac{' + num(start) + '}{' + num(rate) + '} = ' + D) + ' km.'] : ['At the start the tank held ' + num(start) + ' L.'])) };
    },
    function () { // cost model from a rate and a point, then predict
      var ctx = pick([['A plumber charges a call-out fee plus $%r per hour. A %h-hour job costs $%c.', 'C', 'h', 'hours'], ['A phone plan charges a monthly fee plus $%r per gigabyte. A month with %h GB costs $%c.', 'C', 'g', 'gigabytes'], ['A tutor charges a booking fee plus $%r per session. %h sessions cost $%c.', 'C', 'n', 'sessions']]);
      var rate = pick([25, 30, 35, 40, 45, 60]), h = pick([3, 4, 5, 6]), fee = pick([20, 30, 40, 50, 75]), cost = fee + rate * h, ask = h + pick([2, 3, 4, 5]);
      var text = ctx[0].replace('%r', rate).replace('%h', h).replace('%c', cost);
      if (Math.random() < 0.5) return { prompt: text + ' Write an equation for the cost ' + T('C') + ' in terms of ' + T(ctx[2]) + ', the number of ' + ctx[3] + '.', type: 'expr', answers: ['C=' + rate + ctx[2] + '+' + fee], check: 'exact', note: 'Type it as ' + T('C = m' + ctx[2] + ' + b') + '.',
        hint: 'The rate is the slope. Substitute the known job to find the fee (the intercept).',
        solution: steps([T(cost + ' = ' + rate + '(' + h + ') + b') + ', so ' + T('b = ' + fee) + '.', T('C = ' + rate + ctx[2] + ' + ' + fee) + '.']) };
      return { prompt: text + ' Determine the cost, in dollars, of ' + ask + ' ' + ctx[3] + '. (Number only.)', type: 'num', answers: [String(fee + rate * ask)], tol: 0,
        hint: 'Find the fee first: cost − rate × ' + h + '. Then fee + rate × ' + ask + '.',
        solution: steps([T('\\text{fee} = ' + cost + ' - ' + rate + '(' + h + ') = ' + fee), T('C = ' + fee + ' + ' + rate + '(' + ask + ') = ' + (fee + rate * ask)) + '.']) };
    },
    function () { // perpendicular bisector in general form
      var x1 = nz(-6, 6), y1 = nz(-6, 6), run = pick([2, 4, 6]), rise = pick([2, 4, -2, -4, 6]); var x2 = x1 + run, y2 = y1 + rise, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var g = gcd(run, rise), n = rise / g, d = run / g; var gf = general(-d, n, mx, my);
      return { prompt: 'Determine the equation of the <b>perpendicular bisector</b> of the segment joining ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + ', in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'It passes through the midpoint of AB and its slope is the negative reciprocal of the slope of AB.',
        solution: steps([T('M = ' + pt(mx, my)), T('m_{AB} = ' + frac(rise, run)) + ', so ' + T('m_{\\perp} = ' + frac(-d, n)) + '.', T(psDisp(-d, n, mx, my)), T(gfSp(gf.tex)) + '.']) };
    },
    function () { // average rate of change then predict with the model
      var y1 = pick([2010, 2012, 2014, 2016]), gap = pick([4, 5, 6, 8]), p1 = ri(20, 80) * 1000, rate = pick([-500, -400, -250, 150, 300, 450, 600]), p2 = p1 + rate * gap, ahead = gap + pick([2, 4, 5, 6]);
      return { prompt: 'A town had a population of ' + sp(p1) + ' in ' + y1 + ' and ' + sp(p2) + ' in ' + (y1 + gap) + '. If the change stays linear, what population does the model predict for ' + (y1 + ahead) + '? (Number only.)', type: 'num', answers: [String(p1 + rate * ahead)], tol: 0,
        hint: 'Rate = change ÷ years. Then extend: start + rate × (years after ' + y1 + ').',
        solution: steps([T('m = \\dfrac{' + tx(p2) + ' - ' + tx(p1) + '}{' + gap + '} = ' + rate) + ' people per year.', T('P = ' + tx(p1) + ' + ' + rate + '(' + ahead + ') = ' + tx(p1 + rate * ahead)) + '.']) };
    },
    function () { // (10) general form: perpendicular to one line, sharing an intercept with another / through a point
      if (Math.random() < 0.5) { // perpendicular to A x + B y + C = 0, same y-intercept as a second general-form line
        var A = ri(1, 6), B = nz(-6, 6), C = nz(-12, 12); while (gcd(A, B) !== 1 || Math.abs(A) === Math.abs(B)) { A = ri(1, 6); B = nz(-6, 6); }
        var A2 = ri(1, 6), B2 = pick([1, -1, 2, -2, 3, -3]), yi = nz(-9, 9), C2 = -B2 * yi, gf = general(B, A, 0, yi); // perpendicular slope B/A
        return { prompt: 'Write the equation, in general form ' + T('Ax + By + C = 0') + ', of a line <b>perpendicular</b> to ' + T(gfDisp(A, B, C)) + ' and with the same ' + T('y') + '-intercept as ' + T(gfDisp(A2, B2, C2)) + '.', type: 'expr', answers: [gf.tex], check: 'exact', note: 'Integers with no common factor and ' + T('A') + ' positive.',
          hint: 'Slope of the first line is −A/B = ' + fs(-A, B) + ', so the new slope is ' + fs(B, A) + '. The y-intercept of the second line: set x = 0.',
          solution: steps([T('m_1 = ' + frac(-A, B)) + ', so ' + T('m_{\\perp} = ' + frac(B, A)) + '.', 'Second line, x = 0: ' + T(B2 + 'y' + sgn(C2) + ' = 0') + ', so ' + T('b = ' + yi) + '.', T(sifTex(B, A, yi)), T(gfSp(gf.tex)) + '.']) };
      }
      // same x-intercept as a general-form line, and through a given point
      var A3 = ri(1, 7), xi = nz(-8, 8), B3 = nz(-6, 6), C3 = -A3 * xi; while (gcd(gcd(A3, B3), C3) !== 1) { B3 = nz(-6, 6); A3 = ri(1, 7); C3 = -A3 * xi; }
      var px = nz(-8, 8), py = nz(-9, 9); while (px === xi) px = nz(-8, 8);
      var rise = py, run = px - xi, g = gcd(rise, run), n = rise / g, d = run / g, gf2 = general(n, d, xi, 0);
      return { prompt: 'Write the equation, in general form ' + T('Ax + By + C = 0') + ', of the line with the same ' + T('x') + '-intercept as ' + T(gfDisp(A3, B3, C3)) + ' and passing through ' + T(pt(px, py)) + '.', type: 'expr', answers: [gf2.tex], check: 'exact', note: 'Integers with no common factor and ' + T('A') + ' positive.',
        hint: 'Find the x-intercept (set y = 0): that gives a second point (x, 0). Then it is a two-point problem.',
        solution: steps(['x-intercept of the given line: ' + T(A3 + 'x' + sgn(C3) + ' = 0') + ', so ' + T(pt(xi, 0)) + '.', T('m = \\dfrac{' + py + ' - 0}{' + px + ' - (' + xi + ')} = ' + frac(n, d)), T(psDisp(n, d, xi, 0)), T(gfSp(gf2.tex)) + '.']) };
    },
    function () { // (18b) journey graph: average speed for the whole trip, or the speed on the fastest leg
      var speeds = [20, 30, 40, 50, 60, 80], t, dist, s, top;
      do { t = [0]; dist = [0]; s = [];
        for (var i = 0; i < 3; i++) { var dt = ri(1, 3), v = (i === 1 && Math.random() < 0.3) ? 0 : pick(speeds); t.push(t[i] + dt); dist.push(dist[i] + v * dt); s.push(v); }
        top = Math.max.apply(null, s);
      } while (s.filter(function (x) { return x === top; }).length !== 1);
      var names = ['O', 'P', 'Q', 'R'], pts = t.map(function (ti, j) { return [ti, dist[j], j === 0 ? 'O' : names[j] + ' (' + ti + ', ' + dist[j] + ')']; });
      var fig = Fig.pathGraph(pts, { xlabel: 'Time (h)', ylabel: 'Distance (km)', xticks: t.slice(1), yticks: dist.slice(1).filter(function (v, j, a) { return a.indexOf(v) === j; }) });
      if (Math.random() < 0.5) { // whole trip
        var avg = dist[3] / t[3];
        return { prompt: 'The graph shows a cyclist\'s distance from home.' + fig + 'Calculate the average speed for the whole trip from ' + T('O') + ' to ' + T('R') + ', in km/h, to the nearest tenth. (Number only.)', type: 'num', answers: [tenth(avg), num(avg)], tol: 0.05,
          hint: 'Average speed = total distance ÷ total time, which is the slope of the line joining O and R.',
          solution: steps([T('\\dfrac{' + dist[3] + ' - 0}{' + t[3] + ' - 0} = ' + num(avg)) + (tenth(avg) === num(avg) ? '' : ' ' + T('\\approx ' + tenth(avg))) + ' km/h.']) };
      }
      var jt = s.indexOf(top), legName = function (j) { return names[j] + names[j + 1]; };
      return { prompt: 'The graph shows a cyclist\'s distance from home.' + fig + 'On which leg (' + T('OP') + ', ' + T('PQ') + ' or ' + T('QR') + ') was the cyclist fastest? Enter the average speed on that leg, in km/h. (Number only.)', type: 'num', answers: [String(top)], tol: 0,
        hint: 'The average speed on a leg is the slope of that segment: change in distance ÷ change in time. The legs take different amounts of time, so compute all three slopes before comparing.',
        solution: steps([0, 1, 2].map(function (j) { return legName(j) + ': ' + T('\\dfrac{' + dist[j + 1] + ' - ' + dist[j] + '}{' + t[j + 1] + ' - ' + t[j] + '} = \\dfrac{' + (dist[j + 1] - dist[j]) + '}{' + (t[j + 1] - t[j]) + '} = ' + s[j]) + ' km/h.'; }).concat(['The fastest leg is ' + legName(jt) + ', at ' + top + ' km/h.'])) };
    },
    function () { // (19) commission data: rate as a percent, base salary, sales for a target
      var c = commission(), w = ri(0, 2);
      if (w === 0) return { prompt: c.text + ' State the commission rate as a percent. (Number only, no % sign.)', type: 'num', answers: [num(c.rate * 100)], tol: 0,
        hint: 'The rate is the slope: change in earnings ÷ change in sales. Multiply by 100 for a percent.',
        solution: steps([T('m = \\dfrac{' + c.e2 + ' - ' + c.e1 + '}{' + c.s2 + ' - ' + c.s1 + '} = ' + c.rate), 'The commission rate is ' + num(c.rate * 100) + '%.']) };
      if (w === 1) return { prompt: c.text + ' Determine the fixed weekly base salary, in dollars. (Number only.)', type: 'num', answers: [String(c.base)], tol: 0,
        hint: 'Find the rate first, then base = earnings − rate × sales for either week. (The base is the E-intercept.)',
        solution: steps([T('m = \\dfrac{' + c.e2 + ' - ' + c.e1 + '}{' + c.s2 + ' - ' + c.s1 + '} = ' + c.rate), T('b = ' + c.e1 + ' - ' + c.rate + '(' + c.s1 + ') = ' + c.base), 'The base salary is $' + c.base + ' per week.']) };
      var S = pick([10000, 12000, 15000, 20000, 25000]), target = c.base + c.rate * S;
      return { prompt: c.text + ' Determine the sales needed, in dollars, to earn $' + sp(target) + ' in a week. (Number only.)', type: 'num', answers: [String(S)], tol: 0,
        hint: 'Write E = mS + b first, then substitute E = ' + target + ' and solve for S.',
        solution: steps([T('E = ' + c.rate + 'S + ' + c.base), T(target + ' = ' + c.rate + 'S + ' + c.base), T('S = \\dfrac{' + (target - c.base) + '}{' + c.rate + '} = ' + tx(S)) + ', so $' + sp(S) + ' in sales.']) };
    },
    function () { // (20) draining tank W = mt + b / balloon table h = mt + b
      if (Math.random() < 0.55) {
        var r = pick([2, 3, 4, 5, 6, 8, 10]), T0 = pick([12, 15, 18, 20, 24, 25, 30]), b = r * T0, t1 = pick([2, 3, 4, 5]), t2 = t1 + pick([3, 4, 5, 6]); while (t2 >= T0) { t1 = 2; t2 = t1 + 3; }
        var w1 = b - r * t1, w2 = b - r * t2, text = 'Water drains from a tank at a constant rate. After ' + t1 + ' minutes the water level is ' + w1 + ' cm; after ' + t2 + ' minutes it is ' + w2 + ' cm.';
        var model = [T('m = \\dfrac{' + w2 + ' - ' + w1 + '}{' + t2 + ' - ' + t1 + '} = \\dfrac{' + (w2 - w1) + '}{' + (t2 - t1) + '} = ' + (-r)), T(w1 + ' = ' + (-r) + '(' + t1 + ') + b') + ', so ' + T('b = ' + b) + '.', T('W = -' + r + 't + ' + b)];
        if (Math.random() < 0.5) return { prompt: text + ' Write an equation in the form ' + T('W = mt + b') + ', where ' + T('W') + ' is the water level in cm after ' + T('t') + ' minutes.', type: 'expr', answers: ['W=-' + r + 't+' + b], check: 'exact', note: 'Type it as ' + T('W = mt + b') + ' with numbers for m and b.',
          hint: 'Two points: (t, W) = (' + t1 + ', ' + w1 + ') and (' + t2 + ', ' + w2 + '). The slope is negative because the level is falling.',
          solution: steps(model.slice(0, 2).concat([T('W = -' + r + 't + ' + b) + '.'])) };
        return { prompt: text + ' After how many minutes will the tank be empty? (Number only.)', type: 'num', answers: [String(T0)], tol: 0,
          hint: 'Find W = mt + b from the two points, then set W = 0 and solve for t.',
          solution: steps(model.concat([T('0 = -' + r + 't + ' + b) + ', so ' + T('t = ' + T0) + ' minutes.'])) };
      }
      var rate = pick([20, 25, 30, 35, 40, 45]), h0 = pick([1200, 1250, 1300, 1450, 1500, 1600]), ts0 = pick([0, 1, 2]), st = pick([2, 3, 4, 5]);
      var ts = [0, 1, 2, 3].map(function (i) { return ts0 + i * st; }), hs = ts.map(function (tt) { return h0 - rate * tt; });
      var ground = h0 / rate, tbl = Fig.table(ts, hs, 't (min)', 'h (m)');
      var mStep = T('m = \\dfrac{' + hs[1] + ' - ' + hs[0] + '}{' + ts[1] + ' - ' + ts[0] + '} = ' + (-rate)), bStep = ts0 === 0 ? T('b = ' + h0) + ' (the height at t = 0).' : T(hs[0] + ' = ' + (-rate) + '(' + ts[0] + ') + b') + ', so ' + T('b = ' + h0) + '.';
      if (Math.random() < 0.5) return { prompt: 'A hot-air balloon descends at a constant rate. The table shows its height ' + T('h') + ', in metres, after ' + T('t') + ' minutes.' + tbl + 'Write an equation in the form ' + T('h = mt + b') + '.', type: 'expr', answers: ['h=-' + rate + 't+' + h0], check: 'exact', note: 'Type it as ' + T('h = mt + b') + ' with numbers for m and b.',
        hint: 'Slope from two rows (negative, it is descending); b is the height at t = 0.',
        solution: steps([mStep, bStep, T('h = -' + rate + 't + ' + h0) + '.']) };
      return { prompt: 'A hot-air balloon descends at a constant rate. The table shows its height ' + T('h') + ', in metres, after ' + T('t') + ' minutes.' + tbl + 'After how many minutes does the balloon reach the ground? Answer to the nearest tenth of a minute. (Number only.)', type: 'num', answers: [tenth(ground), num(ground)], tol: 0.05,
        hint: 'Find h = mt + b, then set h = 0 and solve for t.',
        solution: steps([mStep, bStep, T('h = -' + rate + 't + ' + h0), T('0 = -' + rate + 't + ' + h0) + ', so ' + T('t = \\dfrac{' + h0 + '}{' + rate + '} \\approx ' + tenth(ground)) + ' minutes.']) };
    },
    function () { // (21) odometer: f(t) = mt + b
      var v = ri(80, 110), t1 = ri(2, 4), t2 = t1 + ri(3, 5), b = ri(20000, 90000), r1 = b + v * t1, r2 = b + v * t2;
      var text = 'On a road trip, after ' + t1 + ' hours the odometer read ' + sp(r1) + ' km and after ' + t2 + ' hours it read ' + sp(r2) + ' km. The speed was constant.';
      var model = [T('m = \\dfrac{' + tx(r2) + ' - ' + tx(r1) + '}{' + t2 + ' - ' + t1 + '} = \\dfrac{' + (r2 - r1) + '}{' + (t2 - t1) + '} = ' + v), T(tx(r1) + ' = ' + v + '(' + t1 + ') + b') + ', so ' + T('b = ' + tx(b)) + '.'];
      if (Math.random() < 0.67) return { prompt: text + ' Determine an equation in the form ' + T('f(t) = mt + b') + ' for the odometer reading after ' + T('t') + ' hours.', type: 'expr', answers: ['f(t)=' + v + 't+' + b], check: 'exact', note: 'Start your answer with ' + T('f(t) =') + '.',
        hint: 'Two points: (t, reading) = (' + t1 + ', ' + sp(r1) + ') and (' + t2 + ', ' + sp(r2) + '). Slope = km per hour; b is the reading at t = 0.',
        solution: steps(model.concat([T('f(t) = ' + v + 't + ' + tx(b)) + '.'])) };
      return { prompt: text + ' What did the odometer read at the start of the trip? (Number only.)', type: 'num', answers: [String(b)], tol: 0,
        hint: 'The start is t = 0: find the slope (speed), then b = reading − speed × time.',
        solution: steps(model.concat(['At t = 0 the reading was ' + sp(b) + ' km.'])) };
    }
  ];


  /* ---------- Math 15 templates (the Waystone Hills) ---------- */
  var MCNOTE = 'Type the letter of your choice.';
  function letters(L) { return [L, L.toLowerCase()]; }
  function mc4(opts, right) { var L = ['A', 'B', 'C', 'D'], ord = shuffle(opts.map(function (o, i) { return i; })), letter = 'A';
    var html = '<div class="mc-opts">' + ord.map(function (k, i) { if (k === right) letter = L[i]; return '<div><b>' + L[i] + '.</b> ' + opts[k] + '</div>'; }).join('') + '</div>';
    return { html: html, letter: letter }; }
  function lineTex(m, b) { return 'y = ' + (m === 1 ? '' : m === -1 ? '-' : m) + 'x' + (b === 0 ? '' : b < 0 ? ' - ' + (-b) : ' + ' + b); }
  function gfTex(A, B, C) { // A x + B y + C = 0 for display
    var s = (A === 1 ? '' : A === -1 ? '-' : A) + 'x';
    s += B < 0 ? ' - ' + (B === -1 ? '' : -B) + 'y' : ' + ' + (B === 1 ? '' : B) + 'y';
    if (C) s += C < 0 ? ' - ' + (-C) : ' + ' + C; return s + ' = 0'; }
  var WHO = ['Kai', 'Nell', 'Omar', 'Jess', 'Rowan', 'Tamsin'];
  var M15 = {
    tableValue: function () { // a row of a table of values (L1 #3-12)
      var m = nz(-4, 4), b = ri(-6, 6), x = ri(-3, 3), y = m * x + b;
      return { prompt: 'The waystone carving shows the rule ' + T(lineTex(m, b)) + '. Complete the table of values: when ' + T('x = ' + x) + ', what is ' + T('y') + '?', type: 'num', answers: [String(y)], tol: 0,
        hint: 'Substitute the x-value into the rule. Watch the signs: multiply first, then add.',
        solution: steps([T('y = ' + m + '(' + x + ')' + (b < 0 ? ' - ' + (-b) : b ? ' + ' + b : '') + (b ? ' = ' + (m * x) + (b < 0 ? ' - ' + (-b) : ' + ' + b) : '') + ' = ' + y) + '.']) };
    },
    onLine: function () { // does the point lie on the line? (L1 #9-12)
      var m = nz(-4, 4), b = ri(-6, 6), x = ri(-4, 4), yes = Math.random() < 0.5, y = m * x + b + (yes ? 0 : pick([-2, -1, 1, 2]));
      var o = mc4(['Yes, it lies on the line', 'No, it does not lie on the line'], yes ? 0 : 1);
      return { prompt: 'A traveller stands at the point ' + T(pt(x, y)) + '. Does this point lie on the old road ' + T(lineTex(m, b)) + '?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Substitute the x-coordinate into the equation. If you get the y-coordinate, the point is on the line.',
        solution: steps([T('y = ' + m + '(' + x + ')' + (b < 0 ? ' - ' + (-b) : ' + ' + b) + ' = ' + (m * x + b)) + '.', (yes ? 'That matches the y-coordinate ' + y + ': the point is on the line.' : 'The point has y = ' + y + ', not ' + (m * x + b) + ': it is not on the line.'), 'Answer: ' + o.letter + '.']) };
    },
    feeEq: function () { // write a fee-plus-rate equation (L9 Ex 1-4)
      var f = pick([5, 8, 10, 12, 15, 20, 25]), r = pick([2, 3, 4, 5, 6, 7]), what = pick([['A hill guide', 'kilometre walked', 'd', 'kilometres'], ['A pack-mule stable', 'hour of hire', 'h', 'hours'], ['A waystone mason', 'stone carved', 's', 'stones']]);
      return { prompt: what[0] + ' charges a fixed fee of $' + f + ' plus $' + r + ' for each ' + what[1] + '. Write an equation for the total cost ' + T('C') + ', in dollars, for ' + T(what[2]) + ' ' + what[3] + '.', type: 'expr', answers: ['C=' + r + what[2] + '+' + f], check: 'exact', note: 'Type it as ' + T('C = m' + what[2] + ' + b') + ' with numbers for m and b.',
        hint: 'The rate (per ' + what[1] + ') is the slope m; the fixed fee is the starting value b.',
        solution: steps(['Slope = $' + r + ' per ' + what[1] + '; starting value = $' + f + '.', T('C = ' + r + what[2] + ' + ' + f) + '.']) };
    },
    feeBack: function () { // use a fee-plus-rate equation backwards (L9 #5-7)
      var f = pick([6, 8, 10, 12, 15, 20]), r = pick([2, 3, 4, 5, 6]), n = ri(4, 15), C = f + r * n;
      return { prompt: 'The toll at a hill bridge is ' + T('C = ' + r + 'n + ' + f) + ', where ' + T('C') + ' is the cost in dollars for a wagon carrying ' + T('n') + ' crates. A merchant paid $' + C + '. How many crates was the wagon carrying?', type: 'num', answers: [String(n)], tol: 0,
        hint: 'Put ' + C + ' in for C, then undo: subtract the fixed part, then divide by the rate.',
        solution: steps([T(C + ' = ' + r + 'n + ' + f), T((C - f) + ' = ' + r + 'n'), T('n = ' + n) + ' crates.']) };
    },
    planCompare: function () { // break-even of two plans (L9 #10)
      var r1 = ri(2, 5), r2 = r1 + ri(1, 4), n = ri(3, 12), f2 = ri(2, 10), f1 = f2 + (r2 - r1) * n;
      return { prompt: 'Two carters haul stone up the Waystone Hills. Brannoc charges $' + f1 + ' plus $' + r1 + ' per load. Wenna charges $' + f2 + ' plus $' + r2 + ' per load. For how many loads do they charge the same amount?', type: 'num', answers: [String(n)], tol: 0,
        hint: 'Write both costs: ' + T('C = ' + r1 + 'n + ' + f1) + ' and ' + T('C = ' + r2 + 'n + ' + f2) + '. Set them equal and solve for n.',
        solution: steps([T(r1 + 'n + ' + f1 + ' = ' + r2 + 'n + ' + f2), T((f1 - f2) + ' = ' + (r2 - r1) + 'n'), T('n = ' + n) + ' loads.']) };
    },
    sameLine: function () { // which general-form equation is the same line (EP10)
      var m = nz(-4, 4), b = nz(-6, 6); // y = mx + b  ->  m x - y + b = 0, normalised so A > 0
      function norm(A, B, C) { return A < 0 ? [-A, -B, -C] : [A, B, C]; }
      var right = norm(m, -1, b), w1 = norm(m, 1, b), w2 = norm(m, -1, -b), w3 = norm(1, -m, b);
      var opts = [gfTex.apply(null, right), gfTex.apply(null, w1), gfTex.apply(null, w2), gfTex.apply(null, w3)].map(T);
      if (opts[0] === opts[3] || opts[0] === opts[2] || opts[0] === opts[1]) return M15.sameLine();
      var o = mc4(opts, 0);
      return { prompt: 'Which equation in general form describes the same line as ' + T(lineTex(m, b)) + '?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Move every term to one side so the right side is 0, then make the x-coefficient positive.',
        solution: steps([T(lineTex(m, b)) + ' becomes ' + T('0 = ' + (m === 1 ? '' : m === -1 ? '-' : m) + 'x - y' + (b < 0 ? ' - ' + (-b) : ' + ' + b)) + '.', 'Written with A positive: ' + opts[0] + '.', 'Answer: ' + o.letter + '.']) };
    },
    rewriteError: function () { // a student's error rewriting general form (EP02 #9)
      var A = ri(1, 5), B = pick([1, 2, 3, 4]), C = nz(-8, 8); if (gcd(gcd(A, B), Math.abs(C)) > 1) return M15.rewriteError();
      var who = pick(WHO), kind = pick(['sign', 'divide']);
      var rightT = sifTex(-A, B, -C, B), wrongT = kind === 'sign' ? sifTex(A, B, -C, B) : sifTex(-A, 1, -C, B);
      if (wrongT === rightT) return M15.rewriteError();
      var o = mc4(['When the x-term moved across the equals sign, its sign was not changed', 'Only the constant was divided by the y-coefficient; the x-term was not', 'The y-intercept was added instead of subtracted', 'There is no error'], kind === 'sign' ? 0 : 1);
      return { prompt: who + ' rewrote ' + T(gfTex(A, B, C)) + ' in the form ' + T('y = mx + b') + ' and got ' + T(wrongT) + '. The correct answer is ' + T(rightT) + '. What did ' + who + ' do wrong?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Isolate the y-term first (move the x-term and the constant to the other side, changing their signs), then divide every term by the y-coefficient.',
        solution: steps([T((B === 1 ? '' : B) + 'y = ' + (-A) + 'x' + (-C < 0 ? ' - ' + C : ' + ' + (-C))), 'Divide every term by ' + B + ': ' + T(rightT) + '.', 'Answer: ' + o.letter + '.']) };
    }
  };

  /* Math 15 levels, chosen from the shared library above (indices refer to Lorebound's arrays) */
  QGen.GENS.RF6_BEG = [A_BEG[0], A_BEG[1], A_BEG[6], A_BEG[4], A_BEG[8], A_BEG[5], M15.tableValue, M15.onLine];
  QGen.GENS.RF6_PRG = [A_PRG[0], A_PRG[1], A_PRG[2], A_PRG[5], A_BEG[2], A_BEG[9], A_PRG[7]];
  QGen.GENS.RF6_MAS = [A_MAS[0], A_MAS[1], A_MAS[4], A_MAS[6], A_MAS[8], A_BEG[7], M15.sameLine, M15.rewriteError];
  QGen.GENS.RF7_BEG = [B_BEG[2], B_BEG[3], A_BEG[3], B_BEG[4], M15.feeEq];
  QGen.GENS.RF7_PRG = [B_PRG[1], B_PRG[4], B_PRG[6], B_PRG[7], B_PRG[9], A_PRG[4], B_PRG[0], M15.feeBack];
  QGen.GENS.RF7_MAS = [B_MAS[1], B_MAS[2], B_MAS[4], B_MAS[5], B_MAS[7], B_PRG[8], M15.planCompare];
})();
