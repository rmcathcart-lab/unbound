/* ===================== LAND 8 · THE CROSSROADS · SYSTEMS OF LINEAR EQUATIONS (RF9) =====================
 * The shared template library (the same templates as Lorebound's Land 8), with the Math 15 levels chosen from it at the
 * bottom, plus Math 15 templates. Ryan tags every Math 15 Unit 8 question RF9; the game splits it in two:
 * RF9A_* (solving: graphing, checking a point, classifying, substitution, elimination) and RF9B_* (word problems).
 * Math 15 pitch: no calculator, whole-number answers, friendly arithmetic.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function sg(a, b) { return pick([1, -1]) * ri(a, b); } // random magnitude a..b with a random sign
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { a = Math.abs(a); b = Math.abs(b); return a / gcd(a, b) * b; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function tenth(x) { return String(Math.round(x * 10) / 10); }
  function hund(x) { return String(Math.round(x * 100) / 100); }
  function ambiguous(v, scale) { var f = Math.abs(v * scale); f = f - Math.floor(f); return Math.abs(f - 0.5) < 0.02; } // rounding would be a coin toss
  function sp(n) { // 36000 -> "36 000" (four-digit numbers stay unspaced, as in the booklet: $2340, $36 000)
    var neg = n < 0, s = String(Math.abs(n)); if (s.length < 5) return (neg ? '-' : '') + s;
    var out = '', c = 0; for (var i = s.length - 1; i >= 0; i--) { out = s[i] + out; c++; if (c % 3 === 0 && i > 0) out = ' ' + out; } return (neg ? '-' : '') + out;
  }
  function tx(n) { return sp(n).replace(/ /g, '\\,'); }
  function money(v) { v = Math.round(v * 100) / 100; return '$' + (v === Math.round(v) ? sp(v) : v.toFixed(2)); }
  function dec2(v) { v = Math.round(v * 100) / 100; return v === Math.round(v) ? String(v) : v.toFixed(2); } // 4.5 -> "4.50"
  function coef(a, v) { if (v === '') return String(a); return a === 1 ? v : a === -1 ? '-' + v : a + v; }
  /* [[3,'x'],[-2,'y'],[7,'']] -> "3x - 2y + 7" (zero terms dropped) */
  function terms(list) {
    var s = '';
    list.forEach(function (t) { var a = +num(t[0]), v = t[1]; if (a === 0) return; if (!s) s = coef(a, v); else s += (a < 0 ? ' - ' : ' + ') + coef(Math.abs(a), v); });
    return s || '0';
  }
  function eqS(a, b, c, vx, vy) { return terms([[a, vx || 'x'], [b, vy || 'y']]) + ' = ' + num(c); }            // standard form Ax + By = C
  function eqG(a, b, c, vx, vy) { return terms([[a, vx || 'x'], [b, vy || 'y'], [c, '']]) + ' = 0'; }             // general form Ax + By + C = 0
  function sysTex(e1, e2) { return T('\\begin{cases} ' + e1 + ' \\\\ ' + e2 + ' \\end{cases}'); }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function ptS(x, y) { return '(' + x + ', ' + y + ')'; }
  function words(w) { return [w, w.charAt(0).toUpperCase() + w.slice(1)]; } // a typed word is read as a product of letters, so list both capitalisations
  function letters(L) { return [L, L.toLowerCase()]; }
  var BLUE = '#8fd3ff';
  var HOW = { one: ['1'].concat(words('one'), words('one solution')), none: ['0'].concat(words('none'), words('zero'), words('no solution')), inf: words('infinitely many').concat(words('infinite'), words('infinitely many solutions'), words('infinite solutions'), ['Infinitely Many']) };
  var HOW_TXT = { one: 'one solution', none: 'no solution', inf: 'infinitely many solutions' };
  var HOW_NOTE = 'Type 0, 1, or the words <i>infinitely many</i>.';
  var PAIR_NOTE = 'Type an ordered pair like ' + T('(3, -2)') + '.';
  var HOW_HINT = 'Different slopes: one solution. Equal slopes, different y-intercepts: no solution (parallel lines). Equal slopes and equal y-intercepts: infinitely many solutions (the same line).';
  /* slope n/d times variable */
  function mx(n, d, v) { var f = frac(n, d); if (f === '1') return v || 'x'; if (f === '-1') return '-' + (v || 'x'); return f + (v || 'x'); }
  /* slope y-intercept form y = (n/d) x + bn/bd */
  function si(n, d, bn, bd) {
    bd = bd || 1; var s = 'y = ' + (n === 0 ? '' : mx(n, d)), bt = frac(bn, bd);
    if (bn === 0) return n === 0 ? 'y = 0' : s;
    if (n === 0) return s + bt;
    return s + (bt.charAt(0) === '-' ? ' - ' + bt.slice(1) : ' + ' + bt);
  }
  /* general form (integers, no common factor, A > 0) of y = (n/d) x + bn/bd */
  function gen(n, d, bn, bd) { bd = bd || 1; var A = n * bd, B = -d * bd, C = bn * d, g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return [A, B, C]; }
  /* one / none / inf for A1 x + B1 y = C1, A2 x + B2 y = C2 (integers) */
  function kindOf(E1, E2) {
    if (E1[0] * E2[1] - E2[0] * E1[1] !== 0) return 'one';
    return (E1[0] * E2[2] - E2[0] * E1[2] === 0 && E1[1] * E2[2] - E2[1] * E1[2] === 0) ? 'inf' : 'none';
  }
  function det(E1, E2) { return E1[0] * E2[1] - E2[0] * E1[1]; }
  /* "3(2) - 4(-1) = 10" for checking a point in A x + B y = C */
  function sub(E, x, y) { var A = E[0], B = E[1]; return (A === 1 ? '' : A === -1 ? '-' : A) + '(' + x + ')' + (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + '(' + y + ')'; }
  function chk(E, x, y) { return T(sub(E, x, y) + ' = ' + num(E[0] * x + E[1] * y)) + ' ✓'; }
  function checkBoth(E1, E2, x, y) { return 'Check in both original equations: ' + chk(E1, x, y) + ' and ' + chk(E2, x, y) + '.'; }
  function mk(E, x, y) { return [E[0], E[1], E[0] * x + E[1] * y]; } // complete A x + B y = ? through the point

  /* elimination steps for E1, E2 (= [A, B, C] meaning A v0 + B v1 = C); k = index of the variable eliminated */
  function elim(E1, E2, V, k) {
    var j = 1 - k;
    if (E1[k] === 0 || E2[k] === 0) { // one equation already lacks V[k]
      var Z = E1[k] === 0 ? E1 : E2;
      return { steps: ['Eq. ' + (Z === E1 ? 1 : 2) + ' has no ' + T(V[k]) + '-term: ' + T(coef(Z[j], V[j]) + ' = ' + Z[2]) + ', so ' + T(V[j] + ' = ' + frac(Z[2], Z[j])) + '.'], n: Z[2], d: Z[j] };
    }
    var L = lcm(E1[k], E2[k]), m1 = L / Math.abs(E1[k]), m2 = L / Math.abs(E2[k]);
    var S1 = E1.map(function (c) { return c * m1; }), S2 = E2.map(function (c) { return c * m2; });
    var add = S1[k] * S2[k] < 0, R = S1.map(function (c, i) { return add ? c + S2[i] : c - S2[i]; }), out = [];
    if (m1 !== 1 && m2 !== 1) out.push('To eliminate ' + T(V[k]) + ': the LCM of ' + Math.abs(E1[k]) + ' and ' + Math.abs(E2[k]) + ' is ' + L + ', so multiply Eq. 1 by ' + m1 + ' and Eq. 2 by ' + m2 + '.');
    if (m1 !== 1) out.push('Eq. 1 × ' + m1 + ': ' + T(eqS(S1[0], S1[1], S1[2], V[0], V[1])));
    if (m2 !== 1) out.push('Eq. 2 × ' + m2 + ': ' + T(eqS(S2[0], S2[1], S2[2], V[0], V[1])));
    out.push((add ? 'Add' : 'Subtract') + ' the equations to eliminate ' + T(V[k]) + ' (the ' + T(V[k]) + '-coefficients are ' + (add ? 'opposite' : 'equal') + '): ' + T(coef(R[j], V[j]) + ' = ' + R[2]) + (R[j] === 1 ? '' : ', so ' + T(V[j] + ' = ' + frac(R[2], R[j]))) + '.');
    return { steps: out, n: R[2], d: R[j] };
  }
  /* back-substitute a known integer value of V[j] into E (equation number en) to find V[1-j] */
  function back(E, en, V, j, val) {
    var k = 1 - j, A = E[j], B = E[k], C = E[2], rest = C - A * val;
    var left = j === 0 ? (A === 1 ? '' : A === -1 ? '-' : A) + '(' + val + ')' + (B < 0 ? ' - ' : ' + ') + coef(Math.abs(B), V[k]) : coef(B, V[k]) + (A < 0 ? ' - ' : ' + ') + (Math.abs(A) === 1 ? '' : Math.abs(A)) + '(' + val + ')';
    return 'Substitute ' + T(V[j] + ' = ' + val) + ' into Eq. ' + en + ': ' + T(left + ' = ' + C) + (Math.abs(B) === 1 && B === 1 ? '' : ', so ' + T(coef(B, V[k]) + ' = ' + rest)) + ', so ' + T(V[k] + ' = ' + frac(rest, B)) + '.';
  }
  /* full elimination solve with an integer solution (x, y); k optional (cheapest variable by default) */
  function solveElim(E1, E2, V, x, y, k) {
    if (k == null) k = lcm(E1[1], E2[1]) <= lcm(E1[0], E2[0]) ? 1 : 0;
    var e = elim(E1, E2, V, k), j = 1 - k, val = j === 0 ? x : y;
    var useFirst = E1[k] !== 0;
    return e.steps.concat([back(useFirst ? E1 : E2, useFirst ? 1 : 2, V, j, val), checkBoth(E1, E2, x, y)]);
  }
  /* substitution solve: E1[ui] = ±1, so isolate V[ui] from Eq. 1 and substitute into Eq. 2 */
  function solveSubst(E1, E2, V, x, y, ui, already) {
    var oi = 1 - ui, s = E1[ui], al = -s * E1[oi], be = s * E1[2]; // V[ui] = al V[oi] + be
    var expr = terms([[al, V[oi]], [be, '']]), F = E2, ca = F[oi] + F[ui] * al, cb = F[2] - F[ui] * be, vals = [x, y];
    var out = [];
    out.push(already ? 'Eq. 1 already gives ' + T(V[ui] + ' = ' + expr) + '.' : 'Isolate ' + T(V[ui]) + ' in Eq. 1: ' + T(V[ui] + ' = ' + expr) + '.');
    var subd = (oi === 0 ? coef(F[oi], V[oi]) + (F[ui] < 0 ? ' - ' : ' + ') + (Math.abs(F[ui]) === 1 ? '' : Math.abs(F[ui])) + '(' + expr + ')'
      : (F[ui] === 1 ? '' : F[ui] === -1 ? '-' : F[ui]) + '(' + expr + ')' + (F[oi] < 0 ? ' - ' : ' + ') + coef(Math.abs(F[oi]), V[oi]));
    out.push('Substitute into Eq. 2: ' + T(subd + ' = ' + F[2]));
    out.push('Expand and collect: ' + T(coef(ca, V[oi]) + (F[ui] * be === 0 ? '' : (F[ui] * be < 0 ? ' - ' : ' + ') + Math.abs(F[ui] * be)) + ' = ' + F[2]) + ', so ' + T(coef(ca, V[oi]) + ' = ' + cb) + ' and ' + T(V[oi] + ' = ' + vals[oi]) + '.');
    out.push('Back-substitute: ' + T(V[ui] + ' = ' + terms([[al, '(' + vals[oi] + ')'], [be, '']]) + ' = ' + vals[ui]) + '.');
    out.push(checkBoth(E1, E2, x, y));
    return out;
  }
  /* exact solution by Cramer-free elimination of each variable in turn (fractions allowed) */
  function solveExact(E1, E2, V) {
    var ex = elim(E1, E2, V, 1), ey = elim(E1, E2, V, 0);
    return { steps: ex.steps.concat(ey.steps), xn: ex.n, xd: ex.d, yn: ey.n, yd: ey.d };
  }
  /* multiple-choice block: options are display strings, returns {html, letter} */
  function mc(correct, wrong) {
    var opts = shuffle([{ s: correct, ok: true }].concat(wrong.map(function (w) { return { s: w, ok: false }; }))), L = 'ABCD', letter = 'A';
    var html = opts.map(function (o, i) { if (o.ok) letter = L[i]; return L[i] + '.&nbsp;' + o.s; }).join(' &nbsp;&nbsp; ');
    return { html: html, letter: letter, opts: opts };
  }
  var SL = [[1, 1], [-1, 1], [2, 1], [-2, 1], [3, 1], [-3, 1], [1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [3, 2], [-3, 2]];
  var VARS = [['x', 'y'], ['x', 'y'], ['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q'], ['u', 'v']];
  /* integer system with solution (x, y): coefficients from lo..hi with random signs, never parallel */
  function randSys(lo, hi, x, y, test) {
    for (var t = 0; t < 400; t++) {
      var E1 = mk([sg(lo, hi), sg(lo, hi)], x, y), E2 = mk([sg(lo, hi), sg(lo, hi)], x, y);
      if (det(E1, E2) !== 0 && (!test || test(E1, E2))) return [E1, E2];
    }
    return [mk([2, 3], x, y), mk([3, -4], x, y)];
  }

  /* ======================== RF9A · solving systems ======================== */
  var A_BEG = [
    function () { // read the solution off a finished graph (L1 Ex 1)
      var x0 = ri(-5, 5), y0 = ri(-5, 5), s1, s2;
      do { s1 = pick(SL); s2 = pick(SL); } while (Math.abs(s1[0] / s1[1] - s2[0] / s2[1]) < 1 || s1[0] * s2[0] > 0 && Math.random() < 0.5);
      var b1 = y0 * s1[1] - s1[0] * x0, b2 = y0 * s2[1] - s2[0] * x0;
      var fig = Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, lines: [{ m: s1[0] / s1[1], b: b1 / s1[1] }, { m: s2[0] / s2[1], b: b2 / s2[1], color: BLUE }] });
      return { prompt: 'A system of two linear equations has been graphed below. The system has an integer solution.' + fig + 'State the solution as an ordered pair.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'The solution is the point of intersection. Read its x-coordinate first, then its y-coordinate.',
        solution: steps(['The lines cross at ' + T(ptS(x0, y0)) + ', so ' + T('x = ' + x0) + ' and ' + T('y = ' + y0) + '.', 'The two lines are ' + T(si(s1[0], s1[1], b1, s1[1])) + ' and ' + T(si(s2[0], s2[1], b2, s2[1])) + '; substituting ' + T('x = ' + x0) + ' into each gives ' + T('y = ' + y0) + ' both times ✓.']) };
    },
    function () { // count the solutions from a graph (L1 Ex 5)
      var kind = pick(['one', 'none', 'inf']), s1, s2, b1, b2, tries = 0;
      do {
        s1 = pick(SL.slice(0, 9)); b1 = ri(-4, 4);
        if (kind === 'one') { s2 = pick(SL.slice(0, 9)); b2 = ri(-4, 4); } else { s2 = s1; b2 = kind === 'inf' ? b1 : ri(-5, 5); }
        var ok = true;
        if (kind === 'one') { var m1 = s1[0] / s1[1], m2 = s2[0] / s2[1]; if (Math.abs(m1 - m2) < 1) ok = false; else { var xi = (b2 - b1) / (m1 - m2), yi = m1 * xi + b1; if (Math.abs(xi) > 6 || Math.abs(yi) > 6) ok = false; } }
        if (kind === 'none' && Math.abs(b2 - b1) < 3) ok = false;
      } while (!ok && ++tries < 300);
      var G = gen(s2[0], s2[1], b2), k = kind === 'inf' ? pick([2, 3]) : pick([1, 1, 2]);
      var e1 = si(s1[0], s1[1], b1), e2 = eqG(k * G[0], k * G[1], k * G[2]);
      var fig = Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, lines: [{ m: s1[0] / s1[1], b: b1 }, { m: s2[0] / s2[1], b: b2, color: BLUE, dashed: kind === 'inf' }] });
      var why = kind === 'one' ? 'The lines cross at exactly one point.' : kind === 'none' ? 'The lines are parallel and distinct: they never meet.' : 'Only one line is visible: the two equations describe the same line (coincident lines), so every point on it is a solution.';
      return { prompt: 'The system ' + T(e1) + ' and ' + T(e2) + ' has been graphed below.' + fig + 'How many solutions does the system have?', type: 'expr', answers: HOW[kind].slice(), check: 'exact', note: HOW_NOTE,
        hint: 'Look at the two lines: crossing once, parallel and never touching, or lying on top of each other?',
        solution: steps([why, 'In slope y-intercept form the second equation is ' + T(si(s2[0], s2[1], b2)) + ': slope ' + T(frac(s2[0], s2[1])) + ' against ' + T(frac(s1[0], s1[1])) + ', y-intercept ' + T(String(b2)) + ' against ' + T(String(b1)) + '.', 'The system has ' + HOW_TXT[kind] + '.']) };
    },
    function () { // which ordered pair satisfies both equations? (L6 Ex 2, L1 Q6)
      var x0 = nz(-6, 6), y0 = nz(-6, 6); while (Math.abs(x0) === Math.abs(y0)) y0 = nz(-6, 6);
      var V = pick([['x', 'y'], ['x', 'y'], ['a', 'b']]), S;
      do { S = [mk([pick([1, 1, 2, 3]), sg(1, 4)], x0, y0), mk([pick([1, 1, 2, -1]), sg(1, 4)], x0, y0)]; } while (det(S[0], S[1]) === 0);
      var cands = shuffle([[y0, x0], [x0, -y0], [-x0, y0], [-x0, -y0], [-y0, -x0]]).slice(0, 3);
      var m = mc(T(ptS(x0, y0)), cands.map(function (c) { return T(ptS(c[0], c[1])); }));
      var fails = cands.map(function (c) {
        var e = S[0][0] * c[0] + S[0][1] * c[1] !== S[0][2] ? 0 : 1, E = S[e];
        return T(ptS(c[0], c[1])) + ' fails Eq. ' + (e + 1) + ': ' + T(sub(E, c[0], c[1]) + ' = ' + (E[0] * c[0] + E[1] * c[1]) + ' \\ne ' + E[2]) + '.';
      });
      return { prompt: 'Solve the system of equations ' + T(eqS(S[0][0], S[0][1], S[0][2], V[0], V[1])) + ' and ' + T(eqS(S[1][0], S[1][1], S[1][2], V[0], V[1])) + ' and select the ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + ' that satisfies both equations.<br>' + m.html + '<br>Type the letter.', type: 'expr', answers: letters(m.letter), check: 'exact', note: 'Type A, B, C or D.',
        hint: 'Substitute each pair into BOTH equations. A pair that balances only one of them is not a solution.',
        solution: steps(['The solution ' + T(ptS(x0, y0)) + ' balances both: ' + chk(S[0], x0, y0) + ' and ' + chk(S[1], x0, y0) + '.'].concat(fails, ['The answer is ' + m.letter + '.'])) };
    },
    function () { // classify from y = mx + b (L1 Ex 7, Q10, Q12)
      var kind = pick(['one', 'none', 'inf']), n1 = sg(1, 4), d1 = pick([1, 1, 2, 3]), g1 = gcd(n1, d1); n1 /= g1; d1 /= g1;
      var b1 = nz(-8, 8), n2 = n1, d2 = d1, b2 = b1, tries = 0;
      if (kind === 'one') { do { n2 = sg(1, 4); d2 = pick([1, 1, 2, 3]); var g2 = gcd(n2, d2); n2 /= g2; d2 /= g2; } while (n2 * d1 === n1 * d2 && ++tries < 50); b2 = nz(-8, 8); }
      if (kind === 'none') { do b2 = nz(-9, 9); while (b2 === b1); }
      var e2, form = pick([0, 1, 2]);
      if (d2 === 1 && (form === 0 || kind === 'inf' && form === 2)) e2 = eqS(n2, -1, -b2);                     // 4x - y = 7
      else if (form === 2 && kind !== 'inf' && d2 === 1) e2 = si(n2, 1, b2);                                   // y = mx + b
      else { var c = d2 * (d2 === 1 ? pick([2, 3]) : pick([1, 2])); e2 = c + 'y = ' + terms([[c * n2 / d2, 'x'], [c * b2, '']]); } // 3y = 2x - 9
      var e1 = si(n1, d1, b1);
      return { prompt: 'Without graphing, determine whether the system ' + T(e1) + ' and ' + T(e2) + ' has no solution, one solution, or infinitely many solutions.', type: 'expr', answers: HOW[kind].slice(), check: 'exact', note: HOW_NOTE,
        hint: 'Write the second equation as y = mx + b too, then compare the slopes first and the y-intercepts second.',
        solution: steps(['Second equation: ' + T(si(n2, d2, b2)) + '.', 'Slopes: ' + T(frac(n1, d1)) + ' and ' + T(frac(n2, d2)) + (kind === 'one' ? ' (different).' : ' (equal); y-intercepts: ' + T(String(b1)) + ' and ' + T(String(b2)) + (kind === 'inf' ? ' (equal).' : ' (different).')), 'The system has ' + HOW_TXT[kind] + (kind === 'one' ? ': the lines cross once.' : kind === 'none' ? ': the lines are parallel and distinct.' : ': both equations describe the same line.')]) };
    },
    function () { // substitution when one variable is already isolated (L2 Asg 2a, L1 Q3)
      var x0 = nz(-6, 6), y0 = nz(-6, 6), m = sg(1, 3), A, B, isoY = Math.random() < 0.7, V = pick(VARS);
      do { A = sg(1, 5); B = sg(1, 5); } while ((isoY ? A + B * m : B + A * m) === 0);
      var E1, E2, e1;
      if (isoY) { var k = y0 - m * x0; E1 = [-m, 1, k]; e1 = V[1] + ' = ' + terms([[m, V[0]], [k, '']]); }
      else { var k2 = x0 - m * y0; E1 = [1, -m, k2]; e1 = V[0] + ' = ' + terms([[m, V[1]], [k2, '']]); }
      E2 = mk([A, B], x0, y0);
      return { prompt: 'Solve the system ' + T(e1) + ' and ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + ' by substitution. Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'The first equation already says what ' + (isoY ? V[1] : V[0]) + ' equals. Replace ' + (isoY ? V[1] : V[0]) + ' in the second equation with that expression (in brackets), solve, then back-substitute.',
        solution: steps(solveSubst(E1, E2, V, x0, y0, isoY ? 1 : 0, true)) };
    },
    function () { // elimination by adding or subtracting directly (L3 Ex 1-2, Asg 1-2)
      var x0 = nz(-7, 7), y0 = nz(-7, 7), V = pick(VARS), mode = pick(['add', 'sub']), k = Math.random() < 0.6 ? 1 : 0, E1, E2, t = 0;
      do {
        var p = sg(1, 7), q = sg(1, 7), share = pick([1, 1, -1]) * ri(1, 6);
        var r1 = [0, 0], r2 = [0, 0]; r1[k] = share; r1[1 - k] = p; r2[k] = mode === 'add' ? -share : share; r2[1 - k] = q;
        E1 = mk(r1, x0, y0); E2 = mk(r2, x0, y0);
      } while ((det(E1, E2) === 0 || Math.abs(E1[1 - k]) === Math.abs(E2[1 - k])) && ++t < 100);
      return { prompt: 'Solve the system by elimination:<br>' + sysTex(eqS(E1[0], E1[1], E1[2], V[0], V[1]), eqS(E2[0], E2[1], E2[2], V[0], V[1])) + '<br>Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'One variable already has ' + (mode === 'add' ? 'opposite' : 'equal') + ' coefficients, so ' + (mode === 'add' ? 'add' : 'subtract') + ' the equations to eliminate it. ' + (mode === 'sub' ? 'Subtract every term, the constant included.' : ''),
        solution: steps(solveElim(E1, E2, V, x0, y0, k)) };
    },
    function () { // sum and difference, then evaluate an expression (L6 Ex 8, Asg 6 Q8, L2 Q5)
      var x0 = ri(2, 15), y0 = ri(-6, 12); while (y0 === x0 || y0 === 0) y0 = ri(-6, 12);
      var c = pick([1, 1, 1, 2, 3]), S = x0 + c * y0, D = x0 - c * y0, p = pick([1, 2, 3]), q = pick([1, 2, 3, -1]); while (p === 1 && Math.abs(q) === c) q = pick([2, 3, -1, 4]);
      var ex = terms([[p, 'x'], [q, 'y']]);
      return { prompt: 'If ' + T(eqS(1, c, S)) + ' and ' + T(eqS(1, -c, D)) + ', then ' + T(ex) + ' is equal to what? (Number only.)', type: 'num', answers: [String(p * x0 + q * y0)], tol: 0,
        hint: 'The ' + (c === 1 ? 'y' : c + 'y') + ' terms are opposite: add the equations to find x, subtract them to find y, then evaluate ' + ex.replace(/\s/g, '') + '.',
        solution: steps(['Add: ' + T('2x = ' + (S + D)) + ', so ' + T('x = ' + x0) + '.', 'Subtract: ' + T(coef(2 * c, 'y') + ' = ' + (S - D)) + ', so ' + T('y = ' + y0) + '.', T(ex + ' = ' + (p === 1 ? '' : p === -1 ? '-' : p) + '(' + x0 + ')' + (q < 0 ? ' - ' : ' + ') + (Math.abs(q) === 1 ? '' : Math.abs(q)) + '(' + y0 + ') = ' + (p * x0 + q * y0)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // substitution from general form: isolate the variable with coefficient ±1 (EP2 Part B; EP2 Q16 for the expression)
      var x0 = nz(-6, 6), y0 = nz(-6, 6), ui = pick([0, 1]), s = pick([1, -1]), V = pick(VARS), E1, E2, t = 0;
      do { var r = [0, 0]; r[ui] = s; r[1 - ui] = sg(2, 6); E1 = mk(r, x0, y0); E2 = mk([sg(2, 6), sg(2, 6)], x0, y0); } while (det(E1, E2) === 0 && ++t < 100);
      var g1 = eqG(E1[0], E1[1], -E1[2], V[0], V[1]), g2 = eqG(E2[0], E2[1], -E2[2], V[0], V[1]), sol = solveSubst(E1, E2, V, x0, y0, ui);
      sol.unshift('In standard form: ' + T(eqS(E1[0], E1[1], E1[2], V[0], V[1])) + ' (Eq. 1) and ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + ' (Eq. 2).');
      var hint = 'Isolate ' + V[ui] + ' in the first equation (its coefficient is ' + s + ', so no fractions appear), substitute into the second, solve, then back-substitute.';
      if (Math.random() < 0.35) {
        var P = pick([2, 3, 5, 7, 12]), Q = pick([2, 3, 4, 5, -2, -3]), val = P * x0 + Q * y0, ex = terms([[P, V[0]], [Q, V[1]]]);
        return { prompt: 'The system ' + T(g1) + ' and ' + T(g2) + ' is solved by substitution. Determine the value of ' + T(ex) + '. (Number only.)', type: 'num', answers: [String(val)], tol: 0, hint: hint,
          solution: steps(sol.concat([T(ex + ' = ' + P + '(' + x0 + ')' + (Q < 0 ? ' - ' : ' + ') + Math.abs(Q) + '(' + y0 + ') = ' + val) + '.'])) };
      }
      return { prompt: 'Solve the system ' + T(g1) + ' and ' + T(g2) + ' by substitution. Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE, hint: hint, solution: steps(sol) };
    },
    function () { // expand the brackets first, then substitute (L2 Ex 3, Asg 1b-d; L6 Ex 9)
      var x0 = nz(-6, 6), y0 = nz(-6, 6), V = pick([['x', 'y'], ['x', 'y'], ['a', 'b'], ['m', 'n']]), ui = pick([0, 1]), oi = 1 - ui, P1, P2, E1, E2, t = 0;
      function part(c, v, h) { return h === 0 ? coef(c, v) : (c === 1 ? '' : c === -1 ? '-' : c) + '(' + v + (h < 0 ? ' - ' : ' + ') + Math.abs(h) + ')'; }
      function disp(parts) { var s = ''; parts.forEach(function (p) { var str = part(p[0], p[1], p[2]); if (!s) s = str; else s += p[0] < 0 ? ' - ' + part(-p[0], p[1], p[2]) : ' + ' + str; }); return s; }
      do {
        P1 = [[1, V[ui], 0], [sg(2, 4), V[oi], sg(1, 5)]]; if (Math.random() < 0.5) P1.reverse();
        P2 = [[sg(2, 5), V[0], pick([0, sg(1, 4)])], [sg(2, 5), V[1], sg(1, 5)]]; if (Math.random() < 0.4) P2[1][2] = 0, P2[0][2] = sg(1, 4);
        var e1 = [0, 0, 0], e2 = [0, 0, 0];
        P1.forEach(function (p) { var i = p[1] === V[0] ? 0 : 1; e1[i] += p[0]; e1[2] -= p[0] * p[2]; });
        P2.forEach(function (p) { var i = p[1] === V[0] ? 0 : 1; e2[i] += p[0]; e2[2] -= p[0] * p[2]; });
        E1 = [e1[0], e1[1], e1[0] * x0 + e1[1] * y0]; E2 = [e2[0], e2[1], e2[0] * x0 + e2[1] * y0];
        var R1 = E1[2] - e1[2], R2 = E2[2] - e2[2]; // right side of the bracketed form
      } while ((det(E1, E2) === 0 || R1 === 0 || R2 === 0) && ++t < 200);
      var b1 = disp(P1) + ' = ' + R1, b2 = disp(P2) + ' = ' + R2;
      var sol = ['Expand and collect: Eq. 1 is ' + T(eqS(E1[0], E1[1], E1[2], V[0], V[1])) + ' and Eq. 2 is ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + '.'].concat(solveSubst(E1, E2, V, x0, y0, ui));
      sol[sol.length - 1] = 'Check in the original equations: ' + T(b1.replace(new RegExp(V[0], 'g'), '(' + x0 + ')').replace(new RegExp(V[1], 'g'), '(' + y0 + ')')) + ' ✓ and the second balances too.';
      var hint = 'Expand the brackets and collect like terms first. In Eq. 1 the coefficient of ' + V[ui] + ' is then 1, so isolate ' + V[ui] + ' and substitute.';
      if (Math.random() < 0.4) {
        var w = pick([0, 1]);
        return { prompt: 'If ' + T(b1) + ' and ' + T(b2) + ', then ' + T(V[w]) + ' is equal to what? (Number only.)', type: 'num', answers: [String(w === 0 ? x0 : y0)], tol: 0, hint: hint, solution: steps(sol) };
      }
      return { prompt: 'Solve the system ' + T(b1) + ' and ' + T(b2) + '. Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE, hint: hint, solution: steps(sol) };
    },
    function () { // elimination after scaling ONE equation (L3 Ex 3, Asg 4; EP3 Part B)
      var x0 = nz(-7, 7), y0 = nz(-7, 7), V = pick(VARS), k = pick([0, 1]), E1, E2, t = 0;
      do {
        var base = sg(1, 3), mult = pick([2, 3, 4, 5]) * pick([1, -1]), r1 = [0, 0], r2 = [0, 0];
        r1[k] = base * mult; r2[k] = base; r1[1 - k] = sg(1, 7); r2[1 - k] = sg(1, 7);
        E1 = mk(r1, x0, y0); E2 = mk(r2, x0, y0);
        if (Math.random() < 0.5) { var tmp = E1; E1 = E2; E2 = tmp; }
      } while ((det(E1, E2) === 0 || Math.abs(E1[1 - k]) === Math.abs(E2[1 - k]) || lcm(E1[1 - k], E2[1 - k]) <= lcm(E1[k], E2[k])) && ++t < 200);
      return { prompt: 'Solve the system by elimination:<br>' + sysTex(eqS(E1[0], E1[1], E1[2], V[0], V[1]), eqS(E2[0], E2[1], E2[2], V[0], V[1])) + '<br>Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'Neither variable lines up yet, but one ' + V[k] + '-coefficient divides into the other: multiply that ONE equation (every term, the constant too) so the ' + V[k] + '-terms match or are opposite.',
        solution: steps(solveElim(E1, E2, V, x0, y0, k)) };
    },
    function () { // classify from general form using -A/B and -C/B (EP1 Part B; L1 Q16; EP1 Q14)
      var kind = pick(['one', 'none', 'inf']), A, B, C, t = 0;
      do { A = ri(1, 7); B = sg(1, 7); } while (gcd(A, B) !== 1 && ++t < 50);
      C = nz(-12, 12);
      var k1 = pick([1, 1, 2, 3]), k2, E1, E2;
      do k2 = pick([1, 2, 3, 4]); while (k2 === k1);
      E1 = [k1 * A, k1 * B, k1 * C];
      if (kind === 'inf') E2 = [k2 * A, k2 * B, k2 * C];
      else if (kind === 'none') { var C2 = C; while (C2 === C) C2 = nz(-12, 12); E2 = [k2 * A, k2 * B, k2 * C2]; }
      else { var A2, B2, tt = 0; do { if (Math.random() < 0.4) { A2 = Math.abs(B); B2 = A * (B < 0 ? -1 : 1); } else { A2 = ri(1, 7); B2 = sg(1, 7); } } while ((A2 * E1[1] - E1[0] * B2 === 0) && ++tt < 50); E2 = [A2, B2, nz(-12, 12)]; }
      if (Math.random() < 0.5) { var tmp = E1; E1 = E2; E2 = tmp; }
      var m1 = frac(-E1[0], E1[1]), m2 = frac(-E2[0], E2[1]), c1 = frac(-E1[2], E1[1]), c2 = frac(-E2[2], E2[1]);
      return { prompt: 'Without graphing, classify the system ' + T(eqG(E1[0], E1[1], E1[2])) + ' and ' + T(eqG(E2[0], E2[1], E2[2])) + '. How many solutions does it have?', type: 'expr', answers: HOW[kind].slice(), check: 'exact', note: HOW_NOTE,
        hint: 'For Ax + By + C = 0 the slope is −A/B and the y-intercept is −C/B. ' + HOW_HINT,
        solution: steps(['First line: ' + T('m = ' + m1) + ', y-intercept ' + T(c1) + '.', 'Second line: ' + T('m = ' + m2) + ', y-intercept ' + T(c2) + '.', (kind === 'one' ? 'The slopes are different, so the lines cross once.' : kind === 'none' ? 'Equal slopes, different y-intercepts: parallel and distinct lines.' : 'Equal slopes and equal y-intercepts: one equation is a multiple of the other, so it is the same line written twice.'), 'The system has ' + HOW_TXT[kind] + '.']) };
    },
    function () { // decimals: multiply by 10 first (L1 Q3f; L3 Q3-5; EP2 Q4b)
      var x0 = nz(-6, 6), y0 = nz(-6, 6), both = Math.random() < 0.4, E1, E2, t = 0;
      do {
        E1 = mk([sg(1, 9), sg(1, 9)], x0, y0); E2 = both ? mk([sg(1, 9), sg(1, 9)], x0, y0) : mk([sg(1, 5), sg(1, 5)], x0, y0);
      } while ((det(E1, E2) === 0 || E1[0] % 10 === 0 || E1[2] % 10 === 0 && Math.random() < 0.7 || both && E2[2] % 10 === 0) && ++t < 200);
      var d1 = eqS(E1[0] / 10, E1[1] / 10, E1[2] / 10), d2 = both ? eqS(E2[0] / 10, E2[1] / 10, E2[2] / 10) : eqS(E2[0], E2[1], E2[2]);
      var sol = ['Multiply ' + (both ? 'each equation' : 'the first equation') + ' by 10: ' + T(eqS(E1[0], E1[1], E1[2])) + (both ? ' and ' + T(eqS(E2[0], E2[1], E2[2])) : '') + '.'].concat(solveElim(E1, E2, ['x', 'y'], x0, y0));
      sol[sol.length - 1] = 'Check in the original equations: ' + T(d1.split(' = ')[0].replace('x', '(' + x0 + ')').replace('y', '(' + y0 + ')') + ' = ' + num(E1[2] / 10)) + ' ✓ and the second balances too.';
      return { prompt: 'Solve the system ' + T(d1) + ' and ' + T(d2) + '. Enter the solution as an ordered pair.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'Clear the decimals first: multiply every term of a decimal equation by 10. Then solve the integer system by elimination or substitution.',
        solution: steps(sol) };
    },
    function () { // an equation which arises during elimination (L6 Ex 7, Asg 6 Q7; L3 Q10)
      var V = pick([['p', 'q'], ['a', 'b'], ['x', 'y'], ['m', 'n']]), E1, E2, K, E, opts, t = 0, m1, m2, add, K2, Ew;
      do {
        E1 = [sg(2, 6), sg(1, 4), nz(-20, 20)]; E2 = [sg(1, 5), sg(1, 4), nz(-20, 20)];
        var L = lcm(E1[1], E2[1]); m1 = L / Math.abs(E1[1]); m2 = L / Math.abs(E2[1]); add = E1[1] * E2[1] < 0;
        K = add ? m1 * E1[0] + m2 * E2[0] : m1 * E1[0] - m2 * E2[0]; E = add ? m1 * E1[2] + m2 * E2[2] : m1 * E1[2] - m2 * E2[2];
        K2 = add ? m1 * E1[0] - m2 * E2[0] : m1 * E1[0] + m2 * E2[0];                                      // wrong operation on the p-terms
        Ew = m2 !== 1 ? (add ? m1 * E1[2] + E2[2] : m1 * E1[2] - E2[2]) : (add ? E1[2] + m2 * E2[2] : E1[2] - m2 * E2[2]); // a constant left unscaled
        opts = [[K, E], [-K, E], [K, Ew], [K2, E]];
        var bad = K === 0 || K2 === 0 || E === 0 || m1 * m2 === 1;
        for (var i = 0; i < 4 && !bad; i++) for (var j = i + 1; j < 4; j++) if (opts[i][0] * opts[j][1] === opts[j][0] * opts[i][1]) bad = true;
      } while (bad && ++t < 300);
      var m = mc(T(coef(K, V[0]) + ' = ' + E), opts.slice(1).map(function (o) { return T(coef(o[0], V[0]) + ' = ' + o[1]); }));
      var S1 = E1.map(function (c) { return c * m1; }), S2 = E2.map(function (c) { return c * m2; });
      return { prompt: 'In solving the system ' + T(eqS(E1[0], E1[1], E1[2], V[0], V[1])) + ' and ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + ' by elimination, an equation which arises could be<br>' + m.html + '<br>Type the letter.', type: 'expr', answers: letters(m.letter), check: 'exact', note: 'Type A, B, C or D.',
        hint: 'All four choices contain only ' + V[0] + ', so ' + V[1] + ' was eliminated. Scale the equations so the ' + V[1] + '-terms match (multiply EVERY term, constants too), then add or subtract.',
        solution: steps([(m1 !== 1 ? 'Eq. 1 × ' + m1 + ': ' + T(eqS(S1[0], S1[1], S1[2], V[0], V[1])) + '. ' : '') + (m2 !== 1 ? 'Eq. 2 × ' + m2 + ': ' + T(eqS(S2[0], S2[1], S2[2], V[0], V[1])) + '.' : ''), (add ? 'Add' : 'Subtract') + ' to eliminate ' + T(V[1]) + ': ' + T(coef(K, V[0]) + ' = ' + E) + '.', 'The answer is ' + m.letter + '. (The other choices come from a sign slip, an unscaled constant, or adding where you should subtract.)']) };
    },
    function () { // clearing fractions to make a substitution (L2 Q6; L6 Ex 6, Asg 6 Q6)
      var pair = pick([[2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3], [4, 5], [5, 4], [4, 6], [6, 4], [6, 5]]), a = pair[0], b = pair[1], c = sg(1, 5);
      var L = lcm(a, b), P = L / a, Q = L / b, R = L * c;
      function opt(p, q, r) { return T('x = \\frac{1}{' + p + '}(' + q + 'y' + (r < 0 ? ' - ' + Math.abs(r) : ' + ' + r) + ')'); }
      var m = mc(opt(P, Q, R), [opt(Q, P, R), opt(P, Q, c), opt(P, Q, -R)]);
      return { prompt: 'When solving a system of equations, one of which is ' + T('\\frac{x}{' + a + '} - \\frac{y}{' + b + '} = ' + c) + ', a substitution which can be made is<br>' + m.html + '<br>Type the letter.', type: 'expr', answers: letters(m.letter), check: 'exact', note: 'Type A, B, C or D.',
        hint: 'Multiply every term by the LCD, ' + L + ', to clear the fractions (the constant too), then isolate x.',
        solution: steps(['Multiply every term by ' + L + ': ' + T(P + 'x - ' + Q + 'y = ' + R) + '.', T(P + 'x = ' + Q + 'y' + (R < 0 ? ' - ' + Math.abs(R) : ' + ' + R)) + ', so ' + T('x = \\frac{1}{' + P + '}(' + Q + 'y' + (R < 0 ? ' - ' + Math.abs(R) : ' + ' + R) + ')') + '.', 'The answer is ' + m.letter + '.']) };
    }
  ];

  var A_MAS = [
    function () { // elimination after scaling BOTH equations (L3 Ex 4; EP3 Part C; EP3 Q19 for the expression)
      var x0 = nz(-6, 6), y0 = nz(-6, 6), V = pick(VARS);
      var S = randSys(2, 9, x0, y0, function (E1, E2) { function nd(a, b) { a = Math.abs(a); b = Math.abs(b); return a !== b && a % b !== 0 && b % a !== 0; } return nd(E1[0], E2[0]) && nd(E1[1], E2[1]) && Math.min(lcm(E1[0], E2[0]), lcm(E1[1], E2[1])) <= 30; });
      var E1 = S[0], E2 = S[1], sol = solveElim(E1, E2, V, x0, y0);
      var hint = 'No coefficient divides into its partner, so scale BOTH equations: use the LCM of the coefficients of the variable you eliminate.';
      if (Math.random() < 0.3) {
        var P = pick([10, 12, 20, 25]), Q = pick([2, 3, 4, 6]), val = P * x0 + Q * y0, ex = terms([[P, V[0]], [Q, V[1]]]);
        return { prompt: 'The system ' + T(eqS(E1[0], E1[1], E1[2], V[0], V[1])) + ' and ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + ' has solution ' + T('(' + V[0] + ', ' + V[1] + ')') + '. Determine the value of ' + T(ex) + '. (Number only.)', type: 'num', answers: [String(val)], tol: 0, hint: hint,
          solution: steps(sol.concat([T(ex + ' = ' + P + '(' + x0 + ') + ' + Q + '(' + y0 + ') = ' + val) + '.'])) };
      }
      return { prompt: 'Solve the system by elimination:<br>' + sysTex(eqS(E1[0], E1[1], E1[2], V[0], V[1]), eqS(E2[0], E2[1], E2[2], V[0], V[1])) + '<br>Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE, hint: hint, solution: steps(sol) };
    },
    function () { // fractions: multiply each equation by its own LCD, then eliminate (L6 Ex 10; L3 Ex 5b, Q9; EP3 Q8a)
      var x0 = nz(-8, 8), y0 = nz(-8, 8), V = pick([['x', 'y'], ['x', 'y'], ['p', 'q'], ['m', 'n']]), D = [2, 3, 4, 5, 6], E1, E2, L1, L2, t = 0, f1, f2;
      function term(p, d, v) { return d === 1 ? coef(p, v) : (p < 0 ? '-' : '') + '\\frac{' + (Math.abs(p) === 1 ? '' : Math.abs(p)) + v + '}{' + d + '}'; }
      function build() {
        if (Math.random() < 0.3) { // (a x + b y) / d = r
          var a = sg(1, 5), b = sg(1, 5), d = pick(D), rn = a * x0 + b * y0;
          return { tex: '\\frac{' + terms([[a, V[0]], [b, V[1]]]) + '}{' + d + '} = ' + frac(rn, d), L: d, E: [a, b, rn] };
        }
        var p1 = sg(1, 3), d1 = pick(D.concat([1])), p2 = sg(1, 3), d2 = pick(D); while (gcd(p1, d1) !== 1) p1 = sg(1, 3); while (gcd(p2, d2) !== 1) p2 = sg(1, 3);
        var rn = p1 * x0 * d2 + p2 * y0 * d1, rd = d1 * d2, L = lcm(lcm(d1, d2), rd / (gcd(rn, rd) || rd));
        var tex = term(p1, d1, V[0]) + (p2 < 0 ? ' - ' + term(-p2, d2, V[1]) : ' + ' + term(p2, d2, V[1])) + ' = ' + frac(rn, rd);
        return { tex: tex, L: L, E: [L * p1 / d1, L * p2 / d2, L * rn / rd] };
      }
      do { f1 = build(); f2 = build(); E1 = f1.E; E2 = f2.E; } while ((det(E1, E2) === 0 || f1.L * f2.L === 1 || Math.abs(E1[0]) > 30 || Math.abs(E2[0]) > 30 || Math.abs(E1[1]) > 30 || Math.abs(E2[1]) > 30) && ++t < 300);
      function clr(f) { var g = gcd(gcd(f.E[0], f.E[1]), f.E[2]) || 1; return f.L === 1 ? 'already integers' + (g > 1 ? ', divide by ' + g : '') : 'multiply by ' + f.L + (g > 1 ? ', then divide by ' + g : ''); }
      var g1 = gcd(gcd(E1[0], E1[1]), E1[2]) || 1, g2 = gcd(gcd(E2[0], E2[1]), E2[2]) || 1;
      E1 = E1.map(function (c) { return c / g1; }); E2 = E2.map(function (c) { return c / g2; });
      var sol = ['Clear the fractions: Eq. 1 (' + clr(f1) + ') becomes ' + T(eqS(E1[0], E1[1], E1[2], V[0], V[1])) + '; Eq. 2 (' + clr(f2) + ') becomes ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + '.'].concat(solveElim(E1, E2, V, x0, y0));
      sol[sol.length - 1] = 'Check ' + T(V[0] + ' = ' + x0) + ', ' + T(V[1] + ' = ' + y0) + ' in both original equations ✓. The solution is ' + T(ptS(x0, y0)) + '.';
      return { prompt: 'Solve the system ' + T(f1.tex) + ' and ' + T(f2.tex) + '. Enter the solution as an ordered pair ' + T('(' + V[0] + ', ' + V[1] + ')') + '.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'Multiply EACH equation, on its own, by its lowest common denominator (every term, the right side too). Then eliminate as usual.',
        solution: steps(sol) };
    },
    function () { // brackets and variables on both sides: tidy into Ax + By = C first (EP6 Q14b; EP3 Part E)
      var x0 = nz(-5, 5), y0 = nz(-5, 5), E1, E2, t = 0, s1, s2;
      function side(c, i, j, r) { var inner = terms([[i, 'x'], [j, 'y']]); return (c === 1 ? '' : c === -1 ? '-' : c) + '(' + inner + ')' + (r === 0 ? '' : r < 0 ? ' - ' + Math.abs(r) : ' + ' + r); }
      function build() {
        var p = ri(2, 4), s = ri(2, 5), i1 = pick([1, 1, 2]), j1 = pick([1, -1, 2, -2, 3, -3]), i2 = pick([1, 1, 2]), j2 = pick([1, -1, 2, -3]);
        var A = p * i1 - s * i2, B = p * j1 - s * j2, r = nz(-9, 9), u = r + A * x0 + B * y0; // p(i1 x + j1 y) + r = s(i2 x + j2 y) + u
        return { tex: side(p, i1, j1, r) + ' = ' + side(s, i2, j2, u), A: A, B: B, C: u - r, raw: [p * i1, p * j1, r, s * i2, s * j2, u] };
      }
      do { s1 = build(); s2 = build(); E1 = [s1.A, s1.B, s1.C]; E2 = [s2.A, s2.B, s2.C]; } while ((s1.A === 0 || s1.B === 0 || s2.A === 0 || s2.B === 0 || det(E1, E2) === 0 || Math.abs(s1.A) > 9 || Math.abs(s2.A) > 9 || Math.abs(s1.B) > 12 || Math.abs(s2.B) > 12) && ++t < 400);
      function ex(s) { var w = s.raw; return T(terms([[w[0], 'x'], [w[1], 'y'], [w[2], '']]) + ' = ' + terms([[w[3], 'x'], [w[4], 'y'], [w[5], '']])) + ', so ' + T(eqS(s.A, s.B, s.C)); }
      var sol = ['Eq. 1: ' + ex(s1) + '.', 'Eq. 2: ' + ex(s2) + '.'].concat(solveElim(E1, E2, ['x', 'y'], x0, y0));
      return { prompt: 'Solve the system ' + T(s1.tex) + ' and ' + T(s2.tex) + '. Enter the solution as an ordered pair.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'Expand every bracket, then move the x- and y-terms to the left and the numbers to the right, so each equation is in the form Ax + By = C. Then eliminate.',
        solution: steps(sol) };
    },
    function () { // a coefficient that forces a special case (L1 Q18-19; EP1 Q5-7, Q15, Q17; EP2 Q15; EP3 Q18)
      var w = ri(0, 3), u, v, c, t = 0, k1, k2, gform = Math.random() < 0.35;
      do { u = sg(1, 6); v = sg(1, 6); c = nz(-12, 12); } while (gcd(gcd(u, v), c) !== 1 && ++t < 50);
      do { k1 = sg(1, 4); k2 = sg(1, 4); } while (k1 === k2 || k1 === -k2 || Math.abs(k1) === 1 && Math.abs(k2) === 1);
      var E1 = [k1 * u, k1 * v, k1 * c], E2 = [k2 * u, k2 * v, k2 * c], ans, unknown, want, sol;
      if (w === 2 || w === 3) { var cc = c; while (cc === c) cc = nz(-12, 12); E1[2] = k1 * cc; } // parallel, distinct
      function show(E, hide) { // hide: 0 = x-coefficient, 1 = y-coefficient, 2 = constant
        var a = E[0], b = E[1], cst = E[2];
        var xs = hide === 0 ? 'kx' : coef(a, 'x'), ys = hide === 1 ? 'ky' : coef(Math.abs(b), 'y'), op = hide === 1 ? ' + ' : (b < 0 ? ' - ' : ' + ');
        if (gform) return xs + op + ys + (hide === 2 ? ' + k' : cst === 0 ? '' : (cst < 0 ? ' + ' + Math.abs(cst) : ' - ' + cst)) + ' = 0';
        return xs + op + ys + ' = ' + (hide === 2 ? 'k' : cst);
      }
      var mult = frac(k1, k2), par = function (v) { return v < 0 ? '(' + v + ')' : String(v); };
      if (w === 0) { ans = E1[1]; unknown = 1; want = 'infinitely many solutions'; }
      else if (w === 1) { ans = E1[2]; unknown = 2; want = 'infinitely many solutions'; if (gform) ans = -E1[2]; }
      else if (w === 2) { ans = E1[0]; unknown = 0; want = 'no solution'; }
      else { ans = E1[1]; unknown = 1; want = 'no solution'; }
      var e1 = show(E1, unknown), e2 = show(E2, -1);
      sol = [(want === 'no solution' ? 'No solution needs equal slopes (parallel lines) with the constants NOT in the same ratio.' : 'Infinitely many solutions needs the equations to be multiples of each other: every coefficient and the constant scale by the same multiplier.'),
        'Compare the known coefficients: the multiplier from the second equation to the first is ' + T(mult) + '.',
        T('k = ' + mult + ' \\times ' + par(unknown === 0 ? E2[0] : unknown === 1 ? E2[1] : (gform ? -E2[2] : E2[2])) + ' = ' + ans) + '.'];
      if (want === 'no solution') sol.push('The constants are ' + T(String(gform ? -E1[2] : E1[2])) + ' and ' + T(String(gform ? -E2[2] : E2[2])) + ', not in the ratio ' + T(mult) + ', so the lines are parallel and distinct ✓.');
      return { prompt: 'Determine the value of ' + T('k') + ' for which the system ' + T(e1) + ' and ' + T(e2) + ' has <b>' + want + '</b>. (Number only.)', type: 'num', answers: [String(ans)], tol: 0,
        hint: want === 'no solution' ? 'Make the slopes equal: the x- and y-coefficients of the two equations must be in the same ratio (the constants must not be).' : 'The first equation must be the second one multiplied by a single number. Find that multiplier from a pair of coefficients you know.',
        solution: steps(sol) };
    },
    function () { // a chained equation A = B = 0 (L6 Ex 11, Asg 6 Q10; L2 Q7)
      var a1, b1, a2, b2, c1, c2, D, t = 0, mN, mD, nN, nD, ex, val, intSol = Math.random() < 0.4;
      do {
        a1 = ri(1, 3); b1 = sg(1, 5); a2 = ri(1, 4); b2 = sg(1, 5); D = a1 * b2 - a2 * b1;
        if (intSol) { var m0 = nz(-9, 12), n0 = nz(-9, 9); c1 = -(a1 * m0 + b1 * n0); c2 = -(a2 * m0 + b2 * n0); }
        else { c1 = nz(-50, 50); c2 = nz(-50, 50); }
        // a1 m + b1 n = -c1, a2 m + b2 n = -c2
        mN = -c1 * b2 + c2 * b1; nN = -a1 * c2 + a2 * c1; mD = D; nD = D;
        ex = pick([[1, -1], [1, 1], [2, -1]]); val = D ? (ex[0] * mN + ex[1] * nN) / D : 0;
      } while ((D === 0 || ambiguous(val, 10) || c1 === 0 || c2 === 0 || Math.abs(val) > 99) && ++t < 300);
      var exT = terms([[ex[0], 'm'], [ex[1], 'n']]), E1 = [a1, b1, -c1], E2 = [a2, b2, -c2], X = solveExact(E1, E2, ['m', 'n']);
      var g0 = terms([[a1, 'm'], [b1, 'n'], [c1, '']]), g1 = terms([[a2, 'm'], [b2, 'n'], [c2, '']]);
      return { prompt: 'If ' + T(g0 + ' = ' + g1 + ' = 0') + ', then the value of ' + T(exT) + ', to the nearest tenth, is what? (Number only.)', type: 'num', answers: [tenth(val), num(val)], tol: 0.05,
        hint: 'A chained statement A = B = 0 is two equations: A = 0 and B = 0. Move the constants to the right and solve the system, then evaluate.',
        solution: steps(['Two equations: ' + T(eqS(a1, b1, -c1, 'm', 'n')) + ' and ' + T(eqS(a2, b2, -c2, 'm', 'n')) + '.'].concat(X.steps, [T(exT + ' = ' + frac(ex[0] * mN + ex[1] * nN, D) + (num(val) === tenth(val) ? '' : ' \\approx ' + tenth(val))) + '.'])) };
    },
    function () { // unknown coefficients from points (L2 Q3; L6 Ex 12, Asg 6 Q11; EP3 Q15)
      var w = ri(0, 2);
      if (w === 0) { // p x + q y + K = 0 through two lattice points
        var p, q, K, P = [], t = 0;
        do {
          p = sg(1, 5); q = sg(1, 5); K = pick([4, 6, 8, 10, 12, 15, 20]); P = [];
          for (var x = -8; x <= 8; x++) { var r = -K - p * x; if (r % q === 0 && Math.abs(r / q) <= 9) P.push([x, r / q]); }
          P = shuffle(P);
        } while ((P.length < 2 || gcd(gcd(p, q), K) !== 1 || P[0][0] * P[1][1] - P[1][0] * P[0][1] === 0) && ++t < 300);
        var A = P[0], B = P[1], ask = pick(['p', 'q']);
        var X = solveExact([A[0], A[1], -K], [B[0], B[1], -K], ['p', 'q']);
        return { prompt: 'The straight line ' + T('px + qy + ' + K + ' = 0') + ' passes through the points ' + T(ptS(A[0], A[1])) + ' and ' + T(ptS(B[0], B[1])) + '. Determine the value of ' + T(ask) + '. (Number only.)', type: 'num', answers: [String(ask === 'p' ? p : q)], tol: 0,
          hint: 'Substitute each point for x and y: that gives two equations in p and q. Solve that system.',
          solution: steps(['Point 1: ' + T(eqS(A[0], A[1], -K, 'p', 'q')) + '. Point 2: ' + T(eqS(B[0], B[1], -K, 'p', 'q')) + '.'].concat(X.steps, ['The line is ' + T(eqG(p, q, K)) + ', so ' + T(ask + ' = ' + (ask === 'p' ? p : q)) + '.'])) };
      }
      if (w === 1) { // a x + y = b through two points: ab to the nearest hundredth
        var x1, y1, x2, y2, a, b, v, t2 = 0;
        do { x1 = ri(-4, 6); x2 = ri(-4, 8); y1 = ri(-6, 8); y2 = ri(-8, 8); if (x1 === x2) continue; a = (y2 - y1) / (x1 - x2); b = a * x1 + y1; v = a * b; } while ((x1 === x2 || a === 0 || b === 0 || ambiguous(v, 100) || Math.round(a) === a && Math.random() < 0.7) && ++t2 < 300);
        var an = y2 - y1, ad = x1 - x2, bn = an * x1 + y1 * ad;
        var lin = function (x, y) { return (x === 0 ? '' : coef(x, 'a') + ' + ') + '(' + y + ') = b'; };
        return { prompt: 'The line ' + T('ax + y = b') + ' passes through the points ' + T(ptS(x1, y1)) + ' and ' + T(ptS(x2, y2)) + '. Determine the value of ' + T('ab') + ', to the nearest hundredth. (Number only.)', type: 'num', answers: [hund(v), num(v)], tol: 0.005,
          hint: 'Substitute both points to get two equations in a and b, then subtract them to eliminate b. Keep a as an exact fraction until the end.',
          solution: steps(['Substitute both points: ' + T(lin(x1, y1)) + ' and ' + T(lin(x2, y2)) + '.', 'Subtract: ' + T((x1 - x2) + 'a = ' + (y2 - y1)) + ', so ' + T('a = ' + frac(an, ad)) + '.', T('b = ' + frac(an, ad) + '(' + x1 + ') + ' + '(' + y1 + ') = ' + frac(bn, ad)) + '.', T('ab = ' + frac(an * bn, ad * ad) + ' \\approx ' + hund(v)) + '.']) };
      }
      // (x0, y0) solves A x + B y = R1 and B x - A y = R2: find A or B
      var A2 = sg(1, 6), B2 = sg(1, 6), x0 = sg(1, 5), y0 = sg(1, 5), R1 = A2 * x0 + B2 * y0, R2 = B2 * x0 - A2 * y0, ask2 = pick(['A', 'B']);
      var X2 = solveExact([x0, y0, R1], [-y0, x0, R2], ['A', 'B']);
      return { prompt: 'The ordered pair ' + T(ptS(x0, y0)) + ' is the solution of the system ' + T('Ax + By = ' + R1) + ' and ' + T('Bx - Ay = ' + R2) + '. Determine the value of ' + T(ask2) + '. (Number only.)', type: 'num', answers: [String(ask2 === 'A' ? A2 : B2)], tol: 0,
        hint: 'Substitute x = ' + x0 + ' and y = ' + y0 + ' into both equations. That makes a system in A and B; solve it by elimination.',
        solution: steps(['Substitute: ' + T(eqS(x0, y0, R1, 'A', 'B')) + ' and ' + T(eqS(-y0, x0, R2, 'A', 'B')) + '.'].concat(X2.steps, ['So ' + T('A = ' + A2) + ' and ' + T('B = ' + B2) + '.'])) };
    },
    function () { // exact (fraction) solutions (L1 Ex 4, Q4; EP2 Part E)
      var V = pick([['x', 'y'], ['x', 'y'], ['u', 'v']]), E1, E2, D, xn, yn, t = 0;
      do { E1 = [sg(1, 7), sg(1, 7), nz(-12, 12)]; E2 = [sg(1, 7), sg(1, 7), nz(-12, 12)]; D = det(E1, E2); xn = E1[2] * E2[1] - E2[2] * E1[1]; yn = E1[0] * E2[2] - E2[0] * E1[2]; }
      while ((D === 0 || Math.abs(D) > 30 || (xn % D === 0 && yn % D === 0) || xn === 0 || yn === 0) && ++t < 300);
      var X = solveExact(E1, E2, V), ans = '(' + frac(xn, D) + ',' + frac(yn, D) + ')';
      return { prompt: 'Solve the system ' + T(eqS(E1[0], E1[1], E1[2], V[0], V[1])) + ' and ' + T(eqS(E2[0], E2[1], E2[2], V[0], V[1])) + '. Give the solution as an ordered pair of exact values (fractions, not decimals).', type: 'expr', answers: [ans], check: 'equivalent', note: 'For example ' + T('\\left(\\frac{23}{19}, -\\frac{4}{19}\\right)') + '.',
        hint: 'This solution is not a lattice point, so a graph cannot give it. Eliminate one variable to find the other as a fraction, then eliminate the other variable the same way (it avoids substituting a fraction).',
        solution: steps(X.steps.concat(['The solution is ' + T('\\left(' + frac(xn, D) + ', ' + frac(yn, D) + '\\right)') + '.'])) };
    }
  ];

  /* ======================== RF9B · modelling with systems ======================== */
  var NAMES = ['Amara', 'Ben', 'Mia', 'Devon', 'Priya', 'Jamal', 'Nadia', 'Owen', 'Zara', 'Lucas'];
  function two() { var a = pick(NAMES), b = pick(NAMES); while (b === a) b = pick(NAMES); return [a, b]; }

  var B_BEG = [
    function () { // number relationships (L4 Ex 1, Q2)
      var w = ri(0, 2), L, s, prompt, sys, chkW, askL = Math.random() < 0.5;
      if (w === 0) { s = ri(-5, 25); L = s + ri(2, 30); prompt = 'The sum of two numbers is ' + (L + s) + '. Their difference is ' + (L - s) + '.'; sys = [T('L + s = ' + (L + s)), T('L - s = ' + (L - s))]; chkW = T(L + ' + (' + s + ') = ' + (L + s)) + ' and ' + T(L + ' - (' + s + ') = ' + (L - s)); }
      else if (w === 1) { s = ri(3, 20); var k = ri(1, 9); L = 2 * s + k; prompt = 'The difference between two numbers is ' + (L - s) + '. The larger number is ' + k + ' more than twice the smaller number.'; sys = [T('L - s = ' + (L - s)), T('L = 2s + ' + k)]; chkW = T(L + ' - ' + s + ' = ' + (L - s)) + ' and ' + T(L + ' = 2(' + s + ') + ' + k); }
      else {
        var p, q, K, t = 0;
        do { s = ri(-8, 15); L = s + ri(3, 20); p = ri(2, 4); q = ri(2, 5); K = p * L - q * s; } while ((K === 0 || p === q) && ++t < 100);
        prompt = 'The sum of two numbers is ' + (L + s) + '. ' + (p === 2 ? 'Twice' : p === 3 ? 'Three times' : 'Four times') + ' the larger number is ' + Math.abs(K) + (K > 0 ? ' more' : ' less') + ' than ' + (q === 2 ? 'twice' : q === 3 ? 'three times' : q === 4 ? 'four times' : 'five times') + ' the smaller number.';
        sys = [T('L + s = ' + (L + s)), T(p + 'L = ' + q + 's' + (K > 0 ? ' + ' + K : ' - ' + Math.abs(K)))];
        chkW = T(L + ' + (' + s + ') = ' + (L + s)) + ' and ' + T(p + '(' + L + ') = ' + p * L + ' = ' + q + '(' + s + ')' + (K > 0 ? ' + ' + K : ' - ' + Math.abs(K)));
      }
      return { prompt: prompt + ' Determine the ' + (askL ? 'larger' : 'smaller') + ' number. (Number only.)', type: 'num', answers: [String(askL ? L : s)], tol: 0,
        hint: 'Let L be the larger number and s the smaller. Write one equation for each sentence, then solve the system.',
        solution: steps(['Let ' + T('L') + ' be the larger number and ' + T('s') + ' the smaller.', 'System: ' + sys.join(' and ') + '.', 'Solving gives ' + T('L = ' + L) + ' and ' + T('s = ' + s) + '.', 'Check against the words: ' + chkW + ' ✓. The ' + (askL ? 'larger' : 'smaller') + ' number is ' + (askL ? L : s) + '.']) };
    },
    function () { // write the second equation of the model: one counts, the other totals value (L1 Q14a; L4 Ex 3; EP4 Part C)
      var ctx = pick([
        function () { var pa = pick([8, 10, 12, 14, 18]), ps = pick([5, 6, 7, 8, 11]); while (ps >= pa) ps = pick([5, 6, 7]); var a = ri(60, 220), s = ri(40, 200); return { text: 'All ' + (a + s) + ' tickets for a school play were sold. Adult tickets cost $' + pa + ' each and student tickets cost $' + ps + ' each. Total receipts were ' + money(pa * a + ps * s) + '.', v: ['a', 's'], def: 'Let a be the number of adult tickets and s the number of student tickets.', cnt: 'a+s=' + (a + s), val: pa + 'a+' + ps + 's=' + (pa * a + ps * s), cntT: 'a + s = ' + (a + s), valT: pa + 'a + ' + ps + 's = ' + (pa * a + ps * s), what: 'tickets' }; },
        function () { var n = ri(10, 60), q = ri(10, 60); return { text: 'Jamal has been saving nickels and quarters. He has ' + (n + q) + ' coins in total, worth ' + money((5 * n + 25 * q) / 100) + '.', v: ['n', 'q'], def: 'Let n be the number of nickels and q the number of quarters.', cnt: 'n+q=' + (n + q), val: '0.05n+0.25q=' + num((5 * n + 25 * q) / 100), cntT: 'n + q = ' + (n + q), valT: '0.05n + 0.25q = ' + dec2((5 * n + 25 * q) / 100), what: 'coins', alt: '5n+25q=' + (5 * n + 25 * q) }; },
        function () { var f = ri(5, 30), t = ri(5, 25); return { text: 'Maria has a total of ' + money(5 * f + 20 * t) + ' in five-dollar bills and twenty-dollar bills. She has ' + (f + t) + ' bills in total.', v: ['f', 't'], def: 'Let f be the number of five-dollar bills and t the number of twenty-dollar bills.', cnt: 'f+t=' + (f + t), val: '5f+20t=' + (5 * f + 20 * t), cntT: 'f + t = ' + (f + t), valT: '5f + 20t = ' + (5 * f + 20 * t), what: 'bills' }; },
        function () { var h = ri(60, 160), d = ri(50, 150); return { text: 'A concession stand sold ' + (h + d) + ' items in total, hot dogs at $4.50 each and drinks at $2.00 each, and took in ' + money(4.5 * h + 2 * d) + '.', v: ['h', 'd'], def: 'Let h be the number of hot dogs and d the number of drinks.', cnt: 'h+d=' + (h + d), val: '4.5h+2d=' + num(4.5 * h + 2 * d), cntT: 'h + d = ' + (h + d), valT: '4.50h + 2.00d = ' + dec2(4.5 * h + 2 * d), what: 'items' }; }
      ])();
      var askVal = Math.random() < 0.7, given = askVal ? ctx.cntT : ctx.valT, want = askVal ? ctx.val : ctx.cnt;
      var answers = [want]; if (askVal && ctx.alt) answers.push(ctx.alt);
      return { prompt: ctx.text + ' ' + ctx.def + ' The ' + (askVal ? 'number of ' + ctx.what : 'money') + ' is represented by ' + T(given) + '. State the equation formed from the ' + (askVal ? 'money (the value)' : 'number of ' + ctx.what) + '.', type: 'expr', answers: answers, check: 'equivalent', note: 'Type the equation using ' + T(ctx.v[0]) + ' and ' + T(ctx.v[1]) + '.',
        hint: askVal ? 'Value equation: (price of one) × (how many) for each kind, added up, equals the total money.' : 'Counting equation: the two counts add up to the total number of ' + ctx.what + '. No prices belong in it.',
        solution: steps(['One equation counts, the other totals value.', 'Counting: ' + T(ctx.cntT) + '. Value: ' + T(ctx.valT) + '.', 'The equation asked for is ' + T(askVal ? ctx.valT : ctx.cntT) + '.']) };
    },
    function () { // translating a relationship sentence into an equation (EP4 Part B; L1 Q5; L4 Q5)
      var k = ri(2, 9), m = pick([2, 3, 4]), M = { 2: 'twice', 3: 'three times', 4: 'four times' }, c = pick([
        { s: 'There are ' + M[m] + ' as many students as teachers on a field trip.', v: ['s', 't'], d: 's be the number of students and t the number of teachers', a: 's=' + m + 't', at: 's = ' + m + 't', test: 'if t = 3 there are ' + 3 * m + ' students: ' + T('s = ' + m + '(3) = ' + 3 * m) + ' ✓' },
        { s: 'A jar holds nickels and dimes. There are ' + k + ' more nickels than dimes.', v: ['n', 'd'], d: 'n be the number of nickels and d the number of dimes', a: 'n=d+' + k, at: 'n = d + ' + k, test: 'if d = 10 there are ' + (10 + k) + ' nickels: ' + T('n = 10 + ' + k) + ' ✓' },
        { s: 'A notebook costs $' + k + ' more than a pen.', v: ['n', 'p'], d: 'n be the cost of a notebook and p the cost of a pen, in dollars', a: 'n=p+' + k, at: 'n = p + ' + k, test: 'a $2 pen means a $' + (2 + k) + ' notebook: ' + T('n = 2 + ' + k) + ' ✓' },
        { s: 'A notebook costs $' + k + ' less than ' + (m === 2 ? 'two' : m === 3 ? 'three' : 'four') + ' pens.', v: ['n', 'p'], d: 'n be the cost of a notebook and p the cost of a pen, in dollars', a: 'n=' + m + 'p-' + k, at: 'n = ' + m + 'p - ' + k, test: 'a $10 pen means a $' + (10 * m - k) + ' notebook: ' + T('n = ' + m + '(10) - ' + k) + ' ✓' },
        { s: 'The length of a rectangle is ' + k + ' m more than ' + M[m] + ' its width.', v: ['l', 'w'], d: 'l be the length and w the width, in metres', a: 'l=' + m + 'w+' + k, at: 'l = ' + m + 'w + ' + k, test: 'a width of 5 m gives a length of ' + (5 * m + k) + ' m ✓' },
        { s: 'At a theatre, a main-floor seat costs ' + M[m] + ' as much as a balcony seat.', v: ['m', 'b'], d: 'm be the cost of a main-floor seat and b the cost of a balcony seat, in dollars', a: 'm=' + m + 'b', at: 'm = ' + m + 'b', test: 'a $20 balcony seat means a $' + 20 * m + ' main-floor seat ✓' },
        { s: 'Amara\'s exam mark was ' + (k + 5) + ' percentage points higher than her coursework mark.', v: ['e', 'c'], d: 'e be the exam mark and c the coursework mark, in percent', a: 'e=c+' + (k + 5), at: 'e = c + ' + (k + 5), test: 'coursework 70 gives exam ' + (75 + k) + ' ✓' }
      ]);
      return { prompt: c.s + ' Let ' + c.d + '. Write an equation that relates ' + T(c.v[0]) + ' and ' + T(c.v[1]) + '.', type: 'expr', answers: [c.a], check: 'equivalent', note: 'Type the equation using ' + T(c.v[0]) + ' and ' + T(c.v[1]) + '.',
        hint: 'Test your equation with a small pair of numbers that obeys the sentence. "Twice as many A as B" puts the 2 beside B, not A.',
        solution: steps([T(c.at) + '.', 'Test: ' + c.test + '.']) };
    },
    function () { // two purchases at the same prices (L1 Ex 3, Q8; L1 Q15)
      var ctx = pick([['movie ticket', 'bag of popcorn', 'movie tickets', 'bags of popcorn', 't', 'p', [9, 16], [3, 8]], ['adult entry fee', 'child entry fee', 'adult tickets', 'child tickets', 'a', 'c', [6, 15], [2, 6]], ['notebook', 'pen', 'notebooks', 'pens', 'n', 'p', [3, 9], [1, 4]], ['burger', 'drink', 'burgers', 'drinks', 'b', 'd', [6, 12], [2, 5]]]);
      var P = ri(ctx[6][0], ctx[6][1]), Q = ri(ctx[7][0], ctx[7][1]), nm = two(), a, b, c, d, t = 0;
      do { a = ri(1, 4); b = ri(1, 4); c = ri(1, 4); d = ri(1, 4); } while ((a * d - b * c === 0) && ++t < 50);
      var E1 = [a, b, a * P + b * Q], E2 = [c, d, c * P + d * Q], askP = Math.random() < 0.6, V = [ctx[4], ctx[5]];
      function buy(n, x, y) { return n + ' pays $' + (x * P + y * Q) + ' for ' + x + ' ' + (x === 1 ? ctx[0] : ctx[2]) + ' and ' + y + ' ' + (y === 1 ? ctx[1] : ctx[3]) + '.'; }
      return { prompt: buy(nm[0], a, b) + ' ' + buy(nm[1], c, d) + ' The prices are the same for both. Determine the cost, in dollars, of one ' + (askP ? ctx[0] : ctx[1]) + '. (Number only.)', type: 'num', answers: [String(askP ? P : Q)], tol: 0,
        hint: 'Let ' + V[0] + ' be the price of one ' + ctx[0] + ' and ' + V[1] + ' the price of one ' + ctx[1] + '. Write one equation for each person, then eliminate one variable.',
        solution: steps(['Let ' + T(V[0]) + ' be the price of one ' + ctx[0] + ' and ' + T(V[1]) + ' the price of one ' + ctx[1] + ', in dollars.', 'Eq. 1: ' + T(eqS(a, b, E1[2], V[0], V[1])) + '. Eq. 2: ' + T(eqS(c, d, E2[2], V[0], V[1])) + '.'].concat(solveElim(E1, E2, V, P, Q), ['One ' + (askP ? ctx[0] : ctx[1]) + ' costs $' + (askP ? P : Q) + '.'])) };
    },
    function () { // break-even point (L1 Ex 8; EP1 Q10)
      var item = pick([['custom mugs', 'mug'], ['water bottles printed with the school crest', 'bottle'], ['hoodies', 'hoodie'], ['tote bags', 'bag']]), gap = pick([4, 5, 6, 8, 10]), n0 = ri(6, 24) * 5, F = gap * n0, c = ri(2, 6), s = c + gap, w = ri(0, 2);
      var text = 'A club is fundraising by selling ' + item[0] + '. There is a fixed setup cost of $' + F + ' plus $' + c + ' per ' + item[1] + ' produced, and each ' + item[1] + ' sells for $' + s + '. So for ' + T('n') + ' ' + item[1] + 's, cost ' + T('d = ' + F + ' + ' + c + 'n') + ' and revenue ' + T('d = ' + s + 'n') + '.';
      var base = ['Break even when cost = revenue: ' + T(F + ' + ' + c + 'n = ' + s + 'n') + ', so ' + T(gap + 'n = ' + F) + ' and ' + T('n = ' + n0) + '.'];
      if (w === 0) return { prompt: text + ' Determine algebraically the number of ' + item[1] + 's that must be sold to break even. (Number only.)', type: 'num', answers: [String(n0)], tol: 0,
        hint: 'The break-even point is where the cost line and the revenue line intersect: set the two expressions for d equal.', solution: steps(base.concat(['The club must sell ' + n0 + ' ' + item[1] + 's to break even.'])) };
      var n1 = w === 1 ? n0 + ri(2, 20) * 5 : Math.max(5, n0 - ri(1, Math.min(10, n0 / 5 - 1)) * 5), P = s * n1 - (F + c * n1);
      return { prompt: text + (w === 1 ? ' How much profit, in dollars, is made if ' + n1 + ' ' + item[1] + 's are sold? (Number only.)' : ' Only ' + n1 + ' ' + item[1] + 's are sold. How much money, in dollars, does the club lose? (Number only.)'), type: 'num', answers: [String(Math.abs(P))], tol: 0,
        hint: 'Profit = revenue − cost at n = ' + n1 + '. ' + (w === 2 ? 'Below the break-even point the result is negative: that is a loss.' : ''),
        solution: steps(['Revenue: ' + T(s + '(' + n1 + ') = ' + s * n1) + '. Cost: ' + T(F + ' + ' + c + '(' + n1 + ') = ' + (F + c * n1)) + '.', 'Revenue − cost ' + T('= ' + P) + (P < 0 ? ', a loss of $' + (-P) + '.' : ', a profit of $' + P + '.')]) };
    },
    function () { // two tables share a row: the solution (L6 Ex 1, simplified)
      var x0 = ri(-3, 4), y0 = ri(-5, 8), m1 = sg(1, 3), m2, t = 0; do m2 = sg(1, 3); while (m2 === m1 && ++t < 20);
      var st1 = pick([1, 2]), st2 = pick([1, 2]), o1 = ri(0, 3), o2 = ri(0, 3); while (o2 === o1) o2 = ri(0, 3);
      var xs1 = [0, 1, 2, 3, 4].map(function (i) { return x0 + (i - o1) * st1; }), xs2 = [0, 1, 2, 3, 4].map(function (i) { return x0 + (i - o2) * st2; });
      var ys1 = xs1.map(function (x) { return y0 + m1 * (x - x0); }), ys2 = xs2.map(function (x) { return y0 + m2 * (x - x0); }), nm = two();
      var tb = '<div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start"><div><b>' + nm[0] + '\'s line</b>' + Fig.table(xs1, ys1) + '</div><div><b>' + nm[1] + '\'s line</b>' + Fig.table(xs2, ys2) + '</div></div>';
      var b1 = y0 - m1 * x0, b2 = y0 - m2 * x0;
      return { prompt: 'Each table of values comes from one equation of a system of linear equations.' + tb + 'State the solution of the system as an ordered pair.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE,
        hint: 'The solution satisfies both equations, so it is the ordered pair that appears in both tables.',
        solution: steps(['The pair ' + T(ptS(x0, y0)) + ' is in both tables, so it lies on both lines.', 'The lines are ' + T(si(m1, 1, b1)) + ' and ' + T(si(m2, 1, b2)) + ': different slopes, so this is the only solution.', 'Solution: ' + T(ptS(x0, y0)) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // coins and bills: one equation counts, the other totals value (L4 Ex 3, Q6; EP4 Q6)
      var ctx = pick([[5, 20, 'five-dollar bills', 'twenty-dollar bills', 'f', 't'], [5, 10, 'five-dollar bills', 'ten-dollar bills', 'f', 't'], [10, 20, 'ten-dollar bills', 'twenty-dollar bills', 'a', 'b'], [0.05, 0.25, 'nickels', 'quarters', 'n', 'q'], [0.1, 0.25, 'dimes', 'quarters', 'd', 'q'], [0.25, 1, 'quarters', 'loonies', 'q', 'l'], [1, 2, 'loonies', 'toonies', 'l', 't']]);
      var a = ri(8, 60), b = ri(8, 60), N = a + b, V = Math.round((ctx[0] * a + ctx[1] * b) * 100) / 100, who = pick(NAMES), askA = Math.random() < 0.5;
      var cents = ctx[0] < 1 || ctx[1] < 1, u0 = cents ? Math.round(ctx[0] * 100) : ctx[0], u1 = cents ? Math.round(ctx[1] * 100) : ctx[1], tot = cents ? Math.round(V * 100) : V;
      var isCoin = cents || ctx[0] === 1, story = isCoin ? who + ' has been saving ' + ctx[2] + ' and ' + ctx[3] + '. ' + who + ' has ' + N + ' coins in total, worth ' + money(V) + '.' : who + ' has a total of ' + money(V) + ' in ' + ctx[2] + ' and ' + ctx[3] + ', with ' + N + ' bills in total.';
      return { prompt: story + ' How many ' + (askA ? ctx[2] : ctx[3]) + ' are there? (Number only.)', type: 'num', answers: [String(askA ? a : b)], tol: 0,
        hint: 'Let ' + ctx[4] + ' and ' + ctx[5] + ' be the two counts. One equation counts the ' + (isCoin ? 'coins' : 'bills') + ' (' + ctx[4] + ' + ' + ctx[5] + ' = ' + N + '); the other totals their value' + (cents ? ' (in cents is easiest)' : '') + '.',
        solution: steps(['Let ' + T(ctx[4]) + ' be the number of ' + ctx[2] + ' and ' + T(ctx[5]) + ' the number of ' + ctx[3] + '.', 'Count: ' + T(ctx[4] + ' + ' + ctx[5] + ' = ' + N) + '. Value' + (cents ? ' in cents' : '') + ': ' + T(u0 + ctx[4] + ' + ' + u1 + ctx[5] + ' = ' + tot) + '.', 'Multiply the count equation by ' + u0 + ' and subtract: ' + T((u1 - u0) + ctx[5] + ' = ' + (tot - u0 * N)) + ', so ' + T(ctx[5] + ' = ' + b) + ' and ' + T(ctx[4] + ' = ' + N + ' - ' + b + ' = ' + a) + '.', 'Check: ' + a + ' + ' + b + ' = ' + N + ' ✓, and the value is ' + money(V) + ' ✓. There are ' + (askA ? a + ' ' + ctx[2] : b + ' ' + ctx[3]) + '.']) };
    },
    function () { // tickets / items sold at two prices (L1 Q14; L6 Asg Q16; EP4 Q5, Q1a)
      var ctx = pick([['tickets', 'adult tickets', 'student tickets', [10, 14, 18, 20], [5, 6, 8, 11], 'a', 's', 'A community theatre sold'], ['items', 'hot dogs', 'drinks', [4.5, 5, 3.5], [2, 1.5, 2.5], 'h', 'd', 'A concession stand sold'], ['items', 'scones', 'muffins', [4, 3.75], [3.25, 2.5], 's', 'm', 'A bakery sold']]);
      var p1 = pick(ctx[3]), p2 = pick(ctx[4]), a = ri(40, 180), b = ri(40, 180), N = a + b, R = Math.round((p1 * a + p2 * b) * 100) / 100, askA = Math.random() < 0.5;
      var c1 = Math.round(p1 * 100), c2 = Math.round(p2 * 100), dollars = c1 % 100 === 0 && c2 % 100 === 0;
      var U1 = dollars ? c1 / 100 : c1, U2 = dollars ? c2 / 100 : c2, Rt = dollars ? R : Math.round(R * 100);
      var pr = function (v) { return '$' + (dollars ? v : v.toFixed(2)); };
      return { prompt: ctx[7] + ' ' + N + ' ' + ctx[0] + ': ' + ctx[1] + ' at ' + pr(p1) + ' each and ' + ctx[2] + ' at ' + pr(p2) + ' each. It took in ' + money(R) + '. How many ' + (askA ? ctx[1] : ctx[2]) + ' were sold? (Number only.)', type: 'num', answers: [String(askA ? a : b)], tol: 0,
        hint: 'One equation counts the ' + ctx[0] + ', the other totals the money. Multiply the counting equation by one of the prices and subtract to eliminate a variable.',
        solution: steps(['Let ' + T(ctx[5]) + ' be the number of ' + ctx[1] + ' and ' + T(ctx[6]) + ' the number of ' + ctx[2] + '.', 'Count: ' + T(ctx[5] + ' + ' + ctx[6] + ' = ' + N) + '. Money' + (dollars ? '' : ' in cents') + ': ' + T(U1 + ctx[5] + ' + ' + U2 + ctx[6] + ' = ' + Rt) + '.', 'Count × ' + U2 + ', then subtract: ' + T((U1 - U2) + ctx[5] + ' = ' + (Rt - U2 * N)) + ', so ' + T(ctx[5] + ' = ' + a) + ' and ' + T(ctx[6] + ' = ' + b) + '.', 'Check against the words: both counts are whole and positive and add to ' + N + ' ✓. ' + (askA ? a + ' ' + ctx[1] : b + ' ' + ctx[2]) + ' were sold.']) };
    },
    function () { // perimeter and a length-width relationship (L4 Ex 2, Q1; L6 Asg Q17; EP6 Q18a)
      if (Math.random() < 0.25) { // isosceles triangle
        var base = ri(4, 20), m = pick([1, 2]), k = ri(2, 9), side = m * base + k, P = base + 2 * side, askB = Math.random() < 0.5;
        return { prompt: 'An isosceles triangle has a perimeter of ' + P + ' cm. Each of its two equal sides is ' + k + ' cm more than ' + (m === 2 ? 'twice the length of the base' : 'the length of the base') + '. Determine the length of ' + (askB ? 'the base' : 'each equal side') + ', in cm. (Number only.)', type: 'num', answers: [String(askB ? base : side)], tol: 0,
          hint: 'Let b be the base and s each equal side. Perimeter: b + 2s = ' + P + '. Relationship: s = ' + (m === 2 ? '2b' : 'b') + ' + ' + k + '. Substitute.',
          solution: steps(['System: ' + T('b + 2s = ' + P) + ' and ' + T('s = ' + (m === 2 ? '2b' : 'b') + ' + ' + k) + '.', 'Substitute: ' + T('b + 2(' + (m === 2 ? '2b' : 'b') + ' + ' + k + ') = ' + P) + ', so ' + T((1 + 2 * m) + 'b = ' + (P - 2 * k)) + ' and ' + T('b = ' + base) + '.', T('s = ' + side) + '. Check: ' + base + ' + 2(' + side + ') = ' + P + ' ✓.']) };
      }
      var w = ri(4, 30), mm = pick([1, 2, 2, 3]), kk = ri(2, 12), L = mm * w + kk, Pr = 2 * (L + w), unit = pick(['m', 'm', 'cm']), thing = unit === 'cm' ? 'rectangular banner' : pick(['rectangular garden', 'rectangular dog run', 'rectangular patio']), ask = pick(['w', 'l', 'A']);
      var rel = mm === 1 ? 'Its length is ' + kk + ' ' + unit + ' more than its width' : 'Its length is ' + kk + ' ' + unit + ' more than ' + (mm === 2 ? 'twice' : 'three times') + ' its width';
      return { prompt: 'A ' + thing + ' has a perimeter of ' + Pr + ' ' + unit + '. ' + rel + '. Determine ' + (ask === 'w' ? 'its width, in ' + unit : ask === 'l' ? 'its length, in ' + unit : 'its area, in square ' + (unit === 'm' ? 'metres' : 'centimetres')) + '. (Number only.)', type: 'num', answers: [String(ask === 'w' ? w : ask === 'l' ? L : L * w)], tol: 0,
        hint: 'Let l be the length and w the width. Perimeter: 2l + 2w = ' + Pr + '. Relationship: l = ' + (mm === 1 ? '' : mm) + 'w + ' + kk + '. Substitute the second into the first.',
        solution: steps(['System: ' + T('2l + 2w = ' + Pr) + ' and ' + T('l = ' + coef(mm, 'w') + ' + ' + kk) + '.', 'Substitute: ' + T('2(' + coef(mm, 'w') + ' + ' + kk + ') + 2w = ' + Pr) + ', so ' + T((2 * mm + 2) + 'w = ' + (Pr - 2 * kk)) + ' and ' + T('w = ' + w) + '.', T('l = ' + L) + '.' + (ask === 'A' ? ' Area ' + T('= ' + L + ' \\times ' + w + ' = ' + L * w) + '.' : '') + ' Check: ' + T('2(' + L + ') + 2(' + w + ') = ' + Pr) + ' ✓.']) };
    },
    function () { // mixture by cost per kilogram (L5 Ex 1, Q1, Q8; EP5 Q3, Q15, Q20)
      var ctx = pick([['premium coffee beans', 'standard coffee beans'], ['cashews', 'peanuts'], ['green tea', 'black tea'], ['dark chocolate pieces', 'milk chocolate pieces']]), p1, p2, x, y, M, avg, t = 0;
      do { p1 = pick([18, 20, 22, 24, 25, 26, 28, 30]); p2 = pick([6, 8, 10, 12, 14, 15, 16]); x = ri(2, 12) * 5; y = ri(2, 12) * 5; M = x + y; avg = (p1 * x + p2 * y) / M; } while (Math.abs(avg * 100 - Math.round(avg * 100)) > 1e-9 && ++t < 300);
      if (Math.abs(avg * 100 - Math.round(avg * 100)) > 1e-9) { p1 = 24; p2 = 14; x = 18; y = 42; M = 60; avg = 17; }
      var askX = Math.random() < 0.5, useTotal = Math.random() < 0.35, V = p1 * x + p2 * y;
      return { prompt: 'A shop blends ' + ctx[0] + ' costing $' + p1 + '/kg with ' + ctx[1] + ' costing $' + p2 + '/kg. The blend weighs ' + M + ' kg ' + (useTotal ? 'and is worth ' + money(V) + ' in total' : 'and is worth ' + money(avg) + '/kg') + '. How many kilograms of ' + (askX ? ctx[0] : ctx[1]) + ' are in the blend? (Number only.)', type: 'num', answers: [String(askX ? x : y)], tol: 0,
        hint: 'One equation totals the mass, the other totals the value. ' + (useTotal ? '' : 'The total value is ' + M + ' × ' + dec2(avg) + ' dollars.'),
        solution: steps(['Let ' + T('p') + ' be the kg of ' + ctx[0] + ' and ' + T('s') + ' the kg of ' + ctx[1] + '.', 'Mass: ' + T('p + s = ' + M) + '. Value: ' + T(p1 + 'p + ' + p2 + 's = ' + num(V)) + (useTotal ? '' : ' (that is ' + M + ' × ' + dec2(avg) + ')') + '.', 'Mass × ' + p2 + ' and subtract: ' + T((p1 - p2) + 'p = ' + (V - p2 * M)) + ', so ' + T('p = ' + x) + ' and ' + T('s = ' + y) + '.', 'Check: ' + T(p1 + '(' + x + ') + ' + p2 + '(' + y + ') = ' + V) + ' ✓. The blend has ' + (askX ? x + ' kg of ' + ctx[0] : y + ' kg of ' + ctx[1]) + '.']) };
    },
    function () { // two rates and a combined total: time and output (L4 Ex 5; EP4 Q19)
      var ctx = pick([['A factory has an older machine that packs %1 boxes per hour and a newer machine that packs %2 boxes per hour. Yesterday the two machines ran for a combined total of %H hours and packed %O boxes.', 'the older machine', 'the newer machine', 'boxes'], ['Working on their own, Amir spreads mulch over %1 square metres per hour and Bo over %2 square metres per hour. On Saturday the two of them logged %H hours of work between them and covered %O square metres.', 'Amir', 'Bo', 'square metres'], ['A print shop has a small press that prints %1 posters per hour and a large press that prints %2 posters per hour. On Monday the presses ran for a combined %H hours and printed %O posters.', 'the small press', 'the large press', 'posters']]);
      var r1 = pick([8, 11, 20, 25, 30, 40]), r2 = r1 + pick([3, 5, 10, 15]), h1 = ri(2, 12), h2 = ri(2, 12), H = h1 + h2, O = r1 * h1 + r2 * h2, ask1 = Math.random() < 0.5;
      var text = ctx[0].replace('%1', r1).replace('%2', r2).replace('%H', H).replace('%O', O);
      return { prompt: text + ' For how many hours did ' + (ask1 ? ctx[1] : ctx[2]) + ' work? (Number only.)', type: 'num', answers: [String(ask1 ? h1 : h2)], tol: 0,
        hint: 'One equation totals the time (hours), the other totals the output (rate × hours for each).',
        solution: steps(['Let ' + T('x') + ' be the hours for ' + ctx[1] + ' and ' + T('y') + ' the hours for ' + ctx[2] + '.', 'Time: ' + T('x + y = ' + H) + '. Output: ' + T(r1 + 'x + ' + r2 + 'y = ' + O) + '.', 'Time × ' + r1 + ' and subtract: ' + T((r2 - r1) + 'y = ' + (O - r1 * H)) + ', so ' + T('y = ' + h2) + ' and ' + T('x = ' + h1) + '.', 'Check: ' + T(r1 + '(' + h1 + ') + ' + r2 + '(' + h2 + ') = ' + O) + ' ✓.']) };
    },
    function () { // when do two plans cost the same? (L6 Ex 15, Asg 6 Q13; EP4 Q9)
      var ctx = pick([['Garage A charges $%F1 flat plus $%r1 per hour. Garage B charges $%F2 flat plus $%r2 per hour.', 'hours parked', [1.5, 2, 2.5, 3], 1], ['Plan 1 costs $%F1 per month plus $%r1 per GB of data. Plan 2 costs $%F2 per month plus $%r2 per GB.', 'GB of data used per month', [0.5, 0.9, 1, 1.5, 2], 1], ['Gym A charges a $%F1 membership fee plus $%r1 per visit. Gym B charges a $%F2 fee plus $%r2 per visit.', 'visits', [3, 4, 5, 6, 8], 1], ['Plan A charges $%F1 per month plus $%r1 per minute of calling. Plan B charges $%F2 per month plus $%r2 per minute.', 'minutes of calling', [0.04, 0.05, 0.06, 0.08, 0.1], 50]]);
      var r1, r2, x0, F1, F2, t = 0;
      do { r1 = pick(ctx[2]); r2 = pick(ctx[2]); x0 = ri(2, 20) * ctx[3]; F2 = ri(2, 30); F1 = Math.round((F2 + (r2 - r1) * x0) * 100) / 100; } while ((r2 <= r1 || F1 !== Math.round(F1) || F1 <= F2) && ++t < 400);
      var C = Math.round((F1 + r1 * x0) * 100) / 100, askC = Math.random() < 0.4;
      var text = ctx[0].replace('%F1', dec2(F1)).replace('%F2', dec2(F2)).replace('%r1', dec2(r1)).replace('%r2', dec2(r2));
      return { prompt: text + ' ' + (askC ? 'Determine the cost, in dollars, at which the two cost the same. (Number only.)' : 'Determine algebraically the number of ' + ctx[1] + ' at which the two cost the same. (Number only.)'), type: 'num', answers: [num(askC ? C : x0)], tol: 0.001,
        hint: 'Write y = (flat amount) + (rate)x for each, then set the two expressions for y equal and solve for x.',
        solution: steps(['Let ' + T('x') + ' be the ' + ctx[1] + ' and ' + T('y') + ' the total cost in dollars: ' + T('y = ' + F1 + ' + ' + coef(+num(r1), 'x')) + ' and ' + T('y = ' + F2 + ' + ' + coef(+num(r2), 'x')) + '.', 'Set them equal: ' + T(F1 + ' + ' + coef(+num(r1), 'x') + ' = ' + F2 + ' + ' + coef(+num(r2), 'x')) + ', so ' + T(num(F1 - F2) + ' = ' + coef(+num(r2 - r1), 'x')) + (r2 - r1 === 1 ? '' : ' and ' + T('x = ' + x0)) + '.', 'Cost there: ' + T('y = ' + F1 + ' + ' + num(r1) + '(' + x0 + ') = ' + num(C)) + ', so both cost ' + money(C) + '.']) };
    },
    function () { // from two tables to the point of intersection (L6 Ex 1)
      var x0, y0, m1, m2, b1, b2, xs1, xs2, t = 0, st = 2;
      do {
        x0 = ri(-6, 9); y0 = ri(-8, 12); m1 = sg(1, 3); m2 = sg(1, 4); b1 = y0 - m1 * x0; b2 = y0 - m2 * x0;
        var s1 = ri(-4, 0), s2 = ri(-3, 1); xs1 = [0, 1, 2, 3].map(function (i) { return s1 + st * i; }); xs2 = [0, 1, 2, 3, 4].map(function (i) { return s2 + st * i; });
      } while ((m1 === m2 || xs1.indexOf(x0) >= 0 || xs2.indexOf(x0) >= 0 || Math.abs(b1) > 12 || Math.abs(b2) > 12) && ++t < 400);
      var ys1 = xs1.map(function (x) { return m1 * x + b1; }), ys2 = xs2.map(function (x) { return m2 * x + b2; }), nm = two();
      var tb = '<div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start"><div><b>' + nm[0] + '\'s line</b>' + Fig.table(xs1, ys1) + '</div><div><b>' + nm[1] + '\'s line</b>' + Fig.table(xs2, ys2) + '</div></div>';
      var sol = [nm[0] + ': ' + T('m = \\dfrac{' + ys1[1] + ' - (' + ys1[0] + ')}{' + xs1[1] + ' - (' + xs1[0] + ')} = ' + m1) + ', so ' + T(si(m1, 1, b1)) + '.', nm[1] + ': ' + T('m = ' + m2) + ', so ' + T(si(m2, 1, b2)) + '.', 'Set equal: ' + T(terms([[m1, 'x'], [b1, '']]) + ' = ' + terms([[m2, 'x'], [b2, '']])) + ', so ' + T(coef(m1 - m2, 'x') + ' = ' + (b2 - b1)) + ', ' + T('x = ' + x0) + ', ' + T('y = ' + y0) + '.'];
      var plain = 'Each table shows points on one line of a system.' + tb;
      var hint = 'Find each line\'s equation y = mx + b from its table (slope from two rows; b is the value at x = 0, or substitute a row). Then solve the system.';
      if (Math.random() < 0.5) return { prompt: plain + 'Determine the point where the two lines intersect, and state the value of ' + T('x + y') + ' at that point. (Number only.)', type: 'num', answers: [String(x0 + y0)], tol: 0, hint: hint, solution: steps(sol.concat(['The lines meet at ' + T(ptS(x0, y0)) + ', so ' + T('x + y = ' + (x0 + y0)) + '.'])) };
      return { prompt: plain + 'Determine the point where the two lines intersect. Enter it as an ordered pair.', type: 'expr', answers: [pt(x0, y0)], check: 'equivalent', note: PAIR_NOTE, hint: hint, solution: steps(sol.concat(['The lines meet at ' + T(ptS(x0, y0)) + '.'])) };
    }
  ];

  var B_MAS = [
    function () { // mixing by percent concentration, including pure water / pure concentrate (L5 Ex 2, Q3; L6 Asg Q15; EP5 Parts A-B)
      var ctx = pick([['saline solution', 'mL', 'saline'], ['acid solution', 'mL', 'acid'], ['antifreeze coolant', 'L', 'antifreeze'], ['copper alloy', 'kg', 'copper'], ['fertilizer solution', 'L', 'concentrate']]);
      var p1, p2, x, y, V, c, t = 0, pure = ri(0, 3), unitStep = ctx[1] === 'mL' ? 25 : 2;
      do {
        p1 = pure === 0 ? 0 : pick([10, 15, 20, 25, 30, 35, 40]); p2 = pure === 1 ? 100 : pick([45, 50, 60, 70, 80]);
        x = ri(2, 16) * unitStep; y = ri(2, 16) * unitStep; V = x + y; c = (p1 * x + p2 * y) / V;
      } while ((c !== Math.round(c) || c === p1 || c === p2) && ++t < 500);
      if (c !== Math.round(c)) { p1 = 30; p2 = 80; x = 150; y = 100; V = 250; c = 50; pure = 2; ctx = ['saline solution', 'mL', 'saline']; }
      var n1 = p1 === 0 ? 'pure water (0% ' + ctx[2] + ')' : 'a ' + p1 + '% ' + ctx[0], n2 = p2 === 100 ? 'pure ' + ctx[2] + ' (100%)' : 'a ' + p2 + '% ' + ctx[0], askX = Math.random() < 0.5;
      return { prompt: 'A technician needs ' + V + ' ' + ctx[1] + ' of a ' + c + '% ' + ctx[0] + '. She mixes ' + n1 + ' with ' + n2 + '. How many ' + ctx[1] + ' of ' + (askX ? (p1 === 0 ? 'water' : 'the ' + p1 + '% ' + ctx[0]) : (p2 === 100 ? 'pure ' + ctx[2] : 'the ' + p2 + '% ' + ctx[0])) + ' are needed? (Number only.)', type: 'num', answers: [String(askX ? x : y)], tol: 0,
        hint: 'Two equations: the amounts add to ' + V + ', and the ' + ctx[2] + ' contents (concentration × amount) add to ' + c + '% of ' + V + '.' + (p1 === 0 || p2 === 100 ? ' Water carries 0% ' + ctx[2] + '; pure ' + ctx[2] + ' is 100%.' : '') + ' Multiply the content equation by 100 to clear the decimals.',
        solution: steps(['Let ' + T('x') + ' be the ' + ctx[1] + ' of the ' + p1 + '% ingredient and ' + T('y') + ' the ' + ctx[1] + ' of the ' + p2 + '% ingredient.', 'Amount: ' + T('x + y = ' + V) + '. Content: ' + T(terms([[p1 / 100, 'x'], [p2 / 100, 'y']]) + ' = ' + num(c * V / 100)) + ' (that is ' + c + '% of ' + V + ').', (p1 === 0 ? 'The water adds no ' + ctx[2] + ', so the content equation alone gives ' + T('y = ' + y) + '; then ' + T('x = ' + V + ' - ' + y + ' = ' + x) + '.' : 'Clear decimals (× 100): ' + T(terms([[p1, 'x'], [p2, 'y']]) + ' = ' + c * V) + '. Amount × ' + p1 + ' and subtract: ' + T((p2 - p1) + 'y = ' + (c * V - p1 * V)) + ', so ' + T('y = ' + y) + ' and ' + T('x = ' + x) + '.'), 'Check: ' + T(terms([[p1, '(' + x + ')'], [p2, '(' + y + ')']]) + ' = ' + c * V) + ' ✓. Use ' + x + ' ' + ctx[1] + ' and ' + y + ' ' + ctx[1] + '.']) };
    },
    function () { // with and against a current or wind (L5 Ex 4-5, Q6; EP5 Part D)
      var ctx = pick([['A ferry', 'downstream (with the current)', 'upstream (against the current)', 'the current', 'its speed in still water', 'km', 'km/h', 'hours'], ['A small plane', 'with a tailwind', 'against a headwind', 'the wind', 'its speed in still air', 'km', 'km/h', 'hours'], ['A freight barge', 'downstream', 'upstream', 'the current', 'its speed in still water', 'km', 'km/h', 'hours']]);
      var plane = ctx[0] === 'A small plane', t1, t2, D, v1, v2, t = 0;
      do {
        t1 = pick(plane ? [1.5, 2, 2.5, 3] : [2, 3, 4, 1.5, 2.5]); t2 = t1 + pick(plane ? [0.5, 1] : [1, 2, 0.5]);
        D = plane ? ri(6, 30) * 50 : ri(4, 30) * 6; v1 = D / t1; v2 = D / t2;
      } while ((v1 !== Math.round(v1) || v2 !== Math.round(v2) || (v1 + v2) % 2 !== 0 || v1 === v2 || (plane ? v2 < 120 : v2 < 4)) && ++t < 600);
      if (t >= 600) { D = 96; t1 = 4; t2 = 6; v1 = 24; v2 = 16; }
      var b = (v1 + v2) / 2, c = (v1 - v2) / 2, askC = Math.random() < 0.55;
      return { prompt: ctx[0] + ' takes ' + t1 + ' hours to travel ' + D + ' km ' + ctx[1] + ' and ' + t2 + ' hours to travel the same ' + D + ' km ' + ctx[2] + '. Determine ' + (askC ? 'the speed of ' + ctx[3] : ctx[4]) + ', in km/h. (Number only.)', type: 'num', answers: [String(askC ? c : b)], tol: 0,
        hint: 'Let b be ' + ctx[4] + ' and c the speed of ' + ctx[3] + '. With it, the ground speed is b + c; against it, b − c. Each ground speed is distance ÷ time.',
        solution: steps(['Ground speeds: ' + T('b + c = \\dfrac{' + D + '}{' + t1 + '} = ' + v1) + ' and ' + T('b - c = \\dfrac{' + D + '}{' + t2 + '} = ' + v2) + '.', 'Add: ' + T('2b = ' + (v1 + v2)) + ', so ' + T('b = ' + b) + '. Subtract: ' + T('2c = ' + (v1 - v2)) + ', so ' + T('c = ' + c) + '.', 'Check: ' + T(t1 + '(' + b + ' + ' + c + ') = ' + D) + ' ✓ and ' + T(t2 + '(' + b + ' - ' + c + ') = ' + D) + ' ✓.', 'The speed of ' + ctx[3] + ' is ' + c + ' km/h; ' + ctx[4] + ' is ' + b + ' km/h.']) };
    },
    function () { // a two-leg trip with stops (L5 Ex 3, Q9; EP5 Q11)
      var s1 = pick([80, 90, 100, 110]), s2 = pick([40, 50, 60, 30]), h1 = ri(4, 16) / 2, h2 = ri(2, 10) / 2, stops = pick([[60, 30], [30], [60], [45, 15], [40, 20]]);
      var stopMin = stops.reduce(function (a, b) { return a + b; }, 0), D = s1 * h1 + s2 * h2, total = h1 + h2 + stopMin / 60, who = pick(NAMES), ask = pick(['h', 'r', 'd']);
      var stopTxt = stops.length === 2 ? 'a ' + (stops[0] === 60 ? '1-hour' : stops[0] + '-minute') + ' fuel stop and a ' + stops[1] + '-minute rest break' : 'one ' + (stops[0] === 60 ? '1-hour' : stops[0] + '-minute') + ' stop';
      var tot = Math.round(total * 60), totTxt = tot % 60 === 0 ? tot / 60 + ' hours' : tot % 30 === 0 ? num(tot / 60) + ' hours' : Math.floor(tot / 60) + ' hours ' + tot % 60 + ' minutes';
      var Q = ask === 'h' ? 'How many hours did ' + who + ' spend driving on the highway?' : ask === 'r' ? 'How many hours did ' + who + ' spend driving on secondary roads?' : 'How many kilometres did ' + who + ' drive on secondary roads?';
      return { prompt: who + ' drove ' + D + ' km in ' + totTxt + ' total, including ' + stopTxt + '. While actually driving, ' + who + ' averaged ' + s1 + ' km/h on the highway and ' + s2 + ' km/h on secondary roads. ' + Q + ' (Number only.)', type: 'num', answers: [num(ask === 'h' ? h1 : ask === 'r' ? h2 : s2 * h2)], tol: 0.001,
        hint: 'Stopped time is not driving time: subtract the stops first. Then one equation totals the driving hours and the other totals the distance (speed × time for each part).',
        solution: steps(['Driving time: ' + totTxt + ' − ' + stopMin + ' min = ' + num(h1 + h2) + ' h.', 'Let ' + T('h') + ' be hours on the highway and ' + T('r') + ' hours on secondary roads: ' + T('h + r = ' + num(h1 + h2)) + ' and ' + T(s1 + 'h + ' + s2 + 'r = ' + D) + '.', 'Time × ' + s2 + ' and subtract: ' + T((s1 - s2) + 'h = ' + num(D - s2 * (h1 + h2))) + ', so ' + T('h = ' + num(h1)) + ' and ' + T('r = ' + num(h2)) + '.', 'Check: ' + T(s1 + '(' + num(h1) + ') + ' + s2 + '(' + num(h2) + ') = ' + D) + ' ✓.' + (ask === 'd' ? ' Secondary-road distance: ' + T(s2 + '(' + num(h2) + ') = ' + num(s2 * h2)) + ' km.' : '')]) };
    },
    function () { // investment: principal and interest (L4 Ex 4, Q9; EP6 Q18b)
      var rates = pick([[8, 5], [6, 4], [4.5, 3], [7, 3], [5, 2], [9, 4], [6, 2.5]]), x = ri(2, 30) * 500, y = ri(2, 30) * 500, P = x + y, I = Math.round((rates[0] * x + rates[1] * y)) / 100, who = pick(NAMES), askHi = Math.random() < 0.5;
      return { prompt: who + ' invested ' + money(P) + ' in two accounts. One account earned ' + rates[0] + '% interest and the other earned ' + rates[1] + '% interest. ' + who + ' earned a total of ' + money(I) + ' in interest for the year. How much, in dollars, was invested at ' + (askHi ? rates[0] : rates[1]) + '%? (Number only.)', type: 'num', answers: [String(askHi ? x : y)], tol: 0,
        hint: 'One equation totals the principal, the other totals the interest. Convert the percents to decimals (' + rates[0] + '% = ' + num(rates[0] / 100) + ').',
        solution: steps(['Let ' + T('x') + ' be the dollars at ' + rates[0] + '% and ' + T('y') + ' the dollars at ' + rates[1] + '%.', 'Principal: ' + T('x + y = ' + tx(P)) + '. Interest: ' + T(num(rates[0] / 100) + 'x + ' + num(rates[1] / 100) + 'y = ' + num(I)) + '.', 'Principal × ' + num(rates[1] / 100) + ' and subtract: ' + T(num((rates[0] - rates[1]) / 100) + 'x = ' + num(I - rates[1] * P / 100)) + ', so ' + T('x = ' + tx(x)) + ' and ' + T('y = ' + tx(y)) + '.', 'Check: ' + T(num(rates[0] / 100) + '(' + tx(x) + ') + ' + num(rates[1] / 100) + '(' + tx(y) + ') = ' + num(I)) + ' ✓. ' + money(askHi ? x : y) + ' was invested at ' + (askHi ? rates[0] : rates[1]) + '%.']) };
    },
    function () { // digits of a two-digit number (L4 Q12; EP4 Q7)
      var t, u, tries = 0; do { t = ri(1, 9); u = ri(1, 9); } while (t === u && ++tries < 50); if (t === u) { t = 4; u = 9; }
      var S = t + u, K = 9 * (u - t), orig = 10 * t + u;
      return { prompt: 'A two-digit number has digits whose sum is ' + S + '. If the digits are reversed, the new number is ' + Math.abs(K) + (K > 0 ? ' more' : ' less') + ' than the original number. Determine the original number. (Number only.)', type: 'num', answers: [String(orig)], tol: 0,
        hint: 'Let t be the tens digit and u the units digit. The number is 10t + u; reversed it is 10u + t. One equation from the sum of the digits, one from the reversal.',
        solution: steps(['System: ' + T('t + u = ' + S) + ' and ' + T('(10u + t) - (10t + u) = ' + K) + ', i.e. ' + T('9u - 9t = ' + K) + ', so ' + T('u - t = ' + (u - t)) + '.', 'Add: ' + T('2u = ' + (S + u - t)) + ', so ' + T('u = ' + u) + ' and ' + T('t = ' + t) + '.', 'The number is ' + orig + '. Check: ' + t + ' + ' + u + ' = ' + S + ' ✓, and ' + (10 * u + t) + ' − ' + orig + ' = ' + K + ' ✓.']) };
    },
    function () { // two legs on a river: which system? / distance against the current (L6 Ex 13, Asg 6 Q12)
      var s1 = pick([4, 5, 6, 8]), s2 = s1 + pick([4, 6, 8, 10]), t1 = ri(2, 6), t2 = ri(1, 5), x = s1 * t1, y = s2 * t2, D = x + y, T0 = t1 + t2, who = pick(['A rowing club', 'Jamal', 'A canoe team', 'Priya']);
      var text = who + ' paddled ' + D + ' km down a river. On sections against the current the speed was ' + s1 + ' km/h, and on sections with the current it was ' + s2 + ' km/h. The whole trip took ' + T0 + ' hours. Let ' + T('x') + ' km be paddled against the current and ' + T('y') + ' km with the current.';
      var sol = ['Distance: ' + T('x + y = ' + D) + '. Time (time = distance ÷ speed): ' + T('\\dfrac{x}{' + s1 + '} + \\dfrac{y}{' + s2 + '} = ' + T0) + '.'];
      if (Math.random() < 0.45) {
        var sy = function (a, b) { return T(a + ',\\ \\ ' + b); };
        var m = mc(sy('x + y = ' + D, '\\frac{x}{' + s1 + '} + \\frac{y}{' + s2 + '} = ' + T0), [sy('x + y = ' + D, s1 + 'x + ' + s2 + 'y = ' + T0), sy('x + y = ' + T0, s1 + 'x + ' + s2 + 'y = ' + D), sy('x + y = ' + T0, '\\frac{x}{' + s1 + '} + \\frac{y}{' + s2 + '} = ' + D)]);
        return { prompt: text + ' Which system could be used to determine ' + T('x') + ' and ' + T('y') + '?<br>' + m.html.replace(/ &nbsp;&nbsp; /g, '<br>') + '<br>Type the letter.', type: 'expr', answers: letters(m.letter), check: 'exact', note: 'Type A, B, C or D.',
          hint: 'x and y are distances, so they add to the total distance. Time on each section is distance ÷ speed, and the times add to the total time.',
          solution: steps(sol.concat(['The answer is ' + m.letter + '. Multiplying a distance by a speed does not give a time.'])) };
      }
      var L = lcm(s1, s2);
      return { prompt: text + ' Determine the distance paddled against the current, in km. (Number only.)', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Distance equation: x + y = ' + D + '. Time equation: x/' + s1 + ' + y/' + s2 + ' = ' + T0 + '. Clear the fractions (× ' + L + ') and eliminate.',
        solution: steps(sol.concat(['× ' + L + ': ' + T(terms([[L / s1, 'x'], [L / s2, 'y']]) + ' = ' + L * T0) + '.', (L / s2 === 1 ? 'Subtract the distance equation' : 'Distance × ' + (L / s2) + ' and subtract') + ': ' + T(coef(L / s1 - L / s2, 'x') + ' = ' + (L * T0 - L / s2 * D)) + ', so ' + T('x = ' + x) + ' and ' + T('y = ' + y) + '.', 'Check: ' + x + '/' + s1 + ' + ' + y + '/' + s2 + ' = ' + t1 + ' + ' + t2 + ' = ' + T0 + ' h ✓. ' + x + ' km were paddled against the current.'])) };
    },
    function () { // special cases in context: no solution / infinitely many (EP4 Part F; EP6 Q8e; L1 Ex 6)
      var w = ri(0, 2), kind, prompt, sol;
      if (w === 0) { // two receipts at the same prices
        var a = ri(1, 4), b = ri(1, 4), P = ri(2, 9), Q = ri(1, 6), k = ri(2, 3), r = pick(['inf', 'none', 'one']), C1 = a * P + b * Q, C2, nm = two(), c2 = k * a, d2 = k * b;
        if (r === 'inf') C2 = k * C1; else if (r === 'none') C2 = k * C1 + pick([-3, -2, 2, 3, 5]); else { d2 = k * b + pick([1, 2]); C2 = c2 * P + d2 * Q; }
        kind = r;
        prompt = nm[0] + ' pays $' + C1 + ' for ' + a + ' notebook' + (a > 1 ? 's' : '') + ' and ' + b + ' pen' + (b > 1 ? 's' : '') + '. ' + nm[1] + ' pays $' + C2 + ' for ' + c2 + ' notebooks and ' + d2 + ' pens at the same prices. Let ' + T('n') + ' and ' + T('p') + ' be the prices of a notebook and a pen. How many solutions does the system ' + T(eqS(a, b, C1, 'n', 'p')) + ' and ' + T(eqS(c2, d2, C2, 'n', 'p')) + ' have?';
        sol = r === 'inf' ? ['The second equation is the first multiplied by ' + k + ' (' + T(k + ' \\times ' + C1 + ' = ' + C2) + '): the same line twice.', nm[1] + '\'s receipt adds no new information, so the prices cannot be pinned down: infinitely many solutions.']
          : r === 'none' ? ['The left side of the second equation is ' + k + ' times the first, but ' + T(k + ' \\times ' + C1 + ' = ' + k * C1 + ' \\ne ' + C2) + ': parallel, distinct lines.', 'No prices can make both receipts true (one of them must be wrong): no solution.']
            : ['The coefficients are not in the same ratio (' + T(a + ':' + b) + ' versus ' + T(c2 + ':' + d2) + '), so the slopes differ.', 'The lines cross once: one solution (a notebook is $' + P + ' and a pen is $' + Q + ').'];
      } else if (w === 1) { // two springs or two plans with equal rates
        var rate = pick([1.5, 2, 2.5, 3]), A = ri(12, 25), B = A + pick([-6, -4, -3, 3, 4, 6]), same = Math.random() < 0.3;
        if (same) B = A;
        kind = same ? 'inf' : 'none';
        prompt = 'Two springs hang from the same hook. With a mass of ' + T('m') + ' kg attached, the first spring\'s length is ' + T('L = ' + A + ' + ' + rate + 'm') + ' cm and the second spring\'s length is modelled by ' + (same ? T('2L - ' + num(2 * rate) + 'm = ' + 2 * A) : T('L = ' + B + ' + ' + rate + 'm')) + '. How many solutions does this system have?';
        sol = same ? ['Dividing the second equation by 2 gives ' + T('L = ' + A + ' + ' + rate + 'm') + '. Same slope (' + rate + ' cm per kg) and same intercept (' + A + ' cm): the two models are the same line.', 'The springs are always the same length: infinitely many solutions.'] : ['Same slope (' + rate + ' cm per kg) but different intercepts (' + A + ' and ' + B + ' cm): parallel lines.', 'The springs stretch at the same rate from different starting lengths, so they are never the same length: no solution.'];
      } else { // two candles
        var h1, h2, r1, r2, tc = 0;
        do { h1 = ri(18, 30); h2 = h1 - ri(3, 6); r1 = pick([2.5, 3, 3.5, 4]); r2 = Math.random() < 0.5 ? r1 : r1 - pick([1, 1.5]); } while (r2 !== r1 && (h1 - h2) / (r1 - r2) >= Math.min(h1 / r1, h2 / r2) && ++tc < 100);
        kind = r1 === r2 ? 'none' : 'one';
        prompt = 'Two candles are lit at the same moment. The taller one starts at ' + h1 + ' cm and burns down ' + r1 + ' cm every hour; the shorter one starts at ' + h2 + ' cm and burns down ' + r2 + ' cm every hour. The system ' + T('h = ' + h1 + ' - ' + r1 + 't') + ' and ' + T('h = ' + h2 + ' - ' + r2 + 't') + ' models their heights. How many solutions does the system have?';
        sol = kind === 'none' ? ['Equal slopes (' + T('-' + r1) + ') with different intercepts (' + h1 + ' and ' + h2 + '): parallel lines.', 'The taller candle stays exactly ' + (h1 - h2) + ' cm taller, so they are never the same height: no solution.'] : ['Different slopes (' + T('-' + r1) + ' and ' + T('-' + r2) + '): the lines cross once.', 'The taller candle burns faster, so it catches the shorter one exactly once: one solution, at ' + T('t = \\dfrac{' + (h1 - h2) + '}{' + num(r1 - r2) + '} = ' + num((h1 - h2) / (r1 - r2))) + ' hours, while both candles are still burning.'];
      }
      return { prompt: prompt, type: 'expr', answers: HOW[kind].slice(), check: 'exact', note: HOW_NOTE,
        hint: 'Compare the slopes (rates) first, then the intercepts (starting values). ' + HOW_HINT,
        solution: steps(sol) };
    }
  ];


  /* ---------- Math 15 templates (the Crossroads) ---------- */
  var MCNOTE = 'Type the letter of your choice.';
  function lineT(m, b) { return 'y = ' + (m === 1 ? '' : m === -1 ? '-' : m) + 'x' + (b === 0 ? '' : b < 0 ? ' - ' + (-b) : ' + ' + b); }
  var WHO = ['Kai', 'Nell', 'Omar', 'Jess', 'Rowan', 'Tamsin'];
  var M15 = {
    isSolution: function () { // is a given point the solution? (L1 Ex 4, #6-8)
      var x = ri(-4, 4), y = ri(-4, 4), m = nz(-3, 3), b = y - m * x, a = ri(1, 3), c = nz(-3, 3), d = a * x + c * y;
      var yes = Math.random() < 0.5, px = x, py = y;
      if (!yes) { if (Math.random() < 0.5) { py = y + pick([-1, 1]) * ri(1, 2); } else { px = x + 1; py = m * px + b; } } // a near miss (on one line only, or neither)
      var good = (py === m * px + b) && (a * px + c * py === d);
      if (good !== yes) return M15.isSolution();
      var o = mc('Yes, it satisfies both equations', ['No, it does not satisfy both equations']);
      var right = yes ? o.letter : (o.letter === 'A' ? 'B' : 'A');
      return { prompt: 'Two roads meet at the Crossroads: ' + sysTex(lineT(m, b), eqS(a, c, d)) + 'Is the point ' + T(ptS(px, py)) + ' the solution of this system?<br>' + o.html, type: 'expr', answers: letters(right), check: 'exact', note: MCNOTE,
        hint: 'Substitute the point into BOTH equations. It is the solution only if both come out true.',
        solution: steps(['First: ' + T(m + '(' + px + ')' + (b < 0 ? ' - ' + (-b) : ' + ' + b) + ' = ' + (m * px + b)) + (m * px + b === py ? ' ✓' : ' ≠ ' + py) + '.',
          'Second: ' + T(a + '(' + px + ') + ' + c + '(' + py + ') = ' + (a * px + c * py)) + (a * px + c * py === d ? ' ✓' : ' ≠ ' + d) + '.',
          yes ? 'Both are true: it is the solution.' : 'Not both true: it is not the solution.', 'Answer: ' + right + '.']) };
    },
    whichIsolate: function () { // which variable to isolate to avoid fractions (L4 #1)
      var V = pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), slot = ri(0, 3), co = [pick([2, 3, 4, 5]), pick([2, 3, 4, 5]) * pick([1, -1]), pick([2, 3, 5]), pick([2, 3, 4]) * pick([1, -1])];
      co[slot] = slot % 2 ? pick([1, -1]) : 1;
      var e1 = eqS(co[0], co[1], ri(1, 20), V[0], V[1]), e2 = eqS(co[2], co[3], ri(1, 20), V[0], V[1]);
      var opts = [T(V[0]) + ' in the first equation', T(V[1]) + ' in the first equation', T(V[0]) + ' in the second equation', T(V[1]) + ' in the second equation'];
      var o = mc(opts[slot], opts.filter(function (s, i) { return i !== slot; }));
      return { prompt: 'To solve ' + sysTex(e1, e2) + 'by substitution without fractions, which variable should you isolate first?<br>' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: 'Type A, B, C or D.',
        hint: 'Look for a variable whose coefficient is 1 or −1. Isolating it means no dividing, so no fractions.',
        solution: steps([opts[slot] + ' has coefficient ' + co[slot] + ', so it can be isolated without dividing.', 'Answer: ' + o.letter + '.']) };
    },
    kNone: function () { // a value of k that gives no solution (L2 #10-11)
      var m = nz(-5, 5), b1 = ri(-6, 6), b2 = ri(-6, 6); if (b1 === b2) return M15.kNone();
      return { prompt: 'The system ' + sysTex('y = kx' + (b1 < 0 ? ' - ' + (-b1) : b1 ? ' + ' + b1 : ''), lineT(m, b2)) + 'has no solution. Determine the value of ' + T('k') + '. (Number only.)', type: 'num', answers: [String(m)], tol: 0,
        hint: 'No solution means parallel lines: the same slope, different y-intercepts.',
        solution: steps(['The y-intercepts (' + b1 + ' and ' + b2 + ') are different, so the lines are parallel when the slopes match.', T('k = ' + m) + '.']) };
    },
    elimError: function () { // find the error in a worked elimination (EP05 #8)
      var x = ri(-4, 5), y = ri(-4, 5), a = ri(1, 4), b = pick([2, 3, 4]), c = ri(1, 4); if (a === c) return M15.elimError();
      var e1 = [a, b, a * x + b * y], e2 = [c, -b, c * x - b * y], who = pick(WHO), kind = pick(['sub', 'sign']);
      var shown = kind === 'sub' ? T(coef(a - c, 'x') + ' + ' + (2 * b) + 'y = ' + (e1[2] - e2[2])) : T(coef(a + c, 'x') + ' = ' + (e1[2] - e2[2]));
      if (kind === 'sign' && e1[2] - e2[2] === e1[2] + e2[2]) return M15.elimError();
      var o = mc(kind === 'sub' ? 'They subtracted the equations, but the y-terms are opposites, so they should have added them' : 'They added the left sides but subtracted the right sides',
        [kind === 'sub' ? 'They added the left sides but subtracted the right sides' : 'They subtracted the equations, but the y-terms are opposites, so they should have added them', 'They multiplied only one side of an equation', 'There is no error']);
      return { prompt: who + ' tried to eliminate ' + T('y') + ' from ' + sysTex(eqS(e1[0], e1[1], e1[2]), eqS(e2[0], e2[1], e2[2])) + 'and wrote ' + shown + '. What went wrong?<br>' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: 'Type A, B, C or D.',
        hint: 'The y-coefficients are ' + b + ' and ' + (-b) + '. Opposites cancel when you ADD the equations — both sides.',
        solution: steps(['Adding: ' + T(coef(a + c, 'x') + ' = ' + (e1[2] + e2[2])) + ', so ' + T('x = ' + x) + ' and then ' + T('y = ' + y) + '.', 'Answer: ' + o.letter + '.']) };
    },
    ages: function () { // translate and solve a number / age problem (L7 Part A)
      var nm = shuffle(NAMES).slice(0, 2), y = ri(8, 20), d = ri(2, 9), o = y + d;
      return { prompt: nm[0] + ' is ' + d + ' years older than ' + nm[1] + '. The sum of their ages is ' + (y + o) + '. How old is ' + nm[1] + '? (Number only.)', type: 'num', answers: [String(y)], tol: 0,
        hint: 'Let a = ' + nm[0] + '\'s age and b = ' + nm[1] + '\'s age: a = b + ' + d + ' and a + b = ' + (y + o) + '. Substitute.',
        solution: steps([T('(b + ' + d + ') + b = ' + (y + o)), T('2b = ' + (2 * y)), T('b = ' + y) + '.']) };
    },
    twoPlans: function () { // which plan is cheaper for a given amount (L2 #14, L8 #20)
      var r1 = ri(2, 5), r2 = r1 + ri(1, 3), n0 = ri(4, 10), f2 = ri(3, 12), f1 = f2 + (r2 - r1) * n0;
      var n = n0 + pick([-3, -2, 2, 3, 4]); if (n < 1) return M15.twoPlans();
      var c1 = f1 + r1 * n, c2 = f2 + r2 * n, cheapA = c1 < c2; if (Math.abs(c2 - c1) === r2 - r1) return M15.twoPlans();
      var o = mc(cheapA ? 'Road Inn, by $' + (c2 - c1) : 'Fork Tavern, by $' + (c1 - c2), [cheapA ? 'Fork Tavern, by $' + (c2 - c1) : 'Road Inn, by $' + (c1 - c2), 'They cost the same', cheapA ? 'Fork Tavern, by $' + (r2 - r1) : 'Road Inn, by $' + (r2 - r1)]);
      return { prompt: 'The Road Inn charges $' + f1 + ' plus $' + r1 + ' per night for a stable stall. The Fork Tavern charges $' + f2 + ' plus $' + r2 + ' per night. A traveller needs a stall for ' + n + ' nights. Which is cheaper, and by how much?<br>' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: 'Type A, B, C or D.',
        hint: 'Write each cost as C = (rate)n + (fee), put n = ' + n + ' into both, and compare.',
        solution: steps(['Road Inn: ' + T(r1 + '(' + n + ') + ' + f1 + ' = ' + c1) + '. Fork Tavern: ' + T(r2 + '(' + n + ') + ' + f2 + ' = ' + c2) + '.', 'They would cost the same at ' + n0 + ' nights; at ' + n + ' nights the ' + (cheapA ? 'Road Inn' : 'Fork Tavern') + ' is cheaper by $' + Math.abs(c2 - c1) + '.', 'Answer: ' + o.letter + '.']) };
    }
  };

  /* Math 15 levels, chosen from the shared library above (indices refer to Lorebound's arrays) */
  QGen.GENS.RF9A_BEG = [A_BEG[0], A_BEG[1], A_BEG[2], A_BEG[4], A_BEG[5], M15.isSolution, M15.whichIsolate];
  QGen.GENS.RF9A_PRG = [A_BEG[3], A_PRG[0], A_PRG[2], A_PRG[3], A_PRG[5], A_BEG[6]];
  QGen.GENS.RF9A_MAS = [A_MAS[0], A_MAS[3], A_MAS[5], A_MAS[2], M15.kNone, M15.elimError];
  QGen.GENS.RF9B_BEG = [B_BEG[0], B_BEG[2], B_BEG[3], B_BEG[5], B_BEG[1], M15.ages];
  QGen.GENS.RF9B_PRG = [B_PRG[0], B_PRG[1], B_PRG[2], B_PRG[3], B_PRG[4], B_PRG[5], B_PRG[6], B_BEG[4]];
  QGen.GENS.RF9B_MAS = [B_MAS[0], B_MAS[1], B_MAS[4], B_MAS[6], M15.twoPlans];
})();
