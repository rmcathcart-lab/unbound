/* ===================== LAND 4 · THE HOLLOWDEEP MINES · Math 15 Unit 4 · FACTORING (AN5) =====================
 * Registered into QGen.GENS as AN5A_* (the reverse of multiplying, common factors, x^2 + bx + c) and AN5B_* (difference
 * of squares, perfect square trinomials, ax^2 + bx + c, choosing a strategy, solving by factoring). Pitched like Ryan's
 * Math 15 Unit 4 test (math15 js/lessons/u4test.js):
 *   BEG  each lesson's core skill as first taught: the GCF of two monomials, a GCF out of a binomial, x^2 + bx + c with
 *        c > 0, the pair with a given product and sum, x^2 - 49, x^2 +- 2qx + q^2, "is it a perfect square trinomial?",
 *        the zero product property on a factored equation, which method to try first;
 *   PRG  the typical assignment question: x^2 + bx + c with c < 0, a GCF with two variables, a negative GCF, a GCF then
 *        a trinomial, 4x^2 - 81, (2x - 5)^2-type squares, ax^2 + bx + c with a = 2 or 3, x^2 + 3x = 10, x^2 - 6x = 0;
 *   MAS  Math 15's hardest items: two-stage factoring (3x^3 - 12x, 2x^2 + 20x + 50), a negative leading term, the
 *        greatest k so x^2 + kx + c factors, k for a perfect square, 2x^2 + 5x - 3 = 0, 3x^2 = 12x, the error in a
 *        worked factoring, a rectangle's area factored into sides and used for its perimeter.
 * Factored answers are checked with factors in any order; an expanded answer is graded 'form'.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  var MCNOTE = 'Type the letter of your choice.';
  function letters(L) { return [L, L.toLowerCase()]; }
  function mc(opts, right) { var L = ['A', 'B', 'C', 'D']; return { html: '<div class="mc-opts">' + opts.map(function (o, i) { return '<div><b>' + L[i] + '.</b> ' + o + '</div>'; }).join('') + '</div>', letter: L[right] }; }

  /* ---------- polynomials in x and y: { 'a,b': coefficient of x^a y^b } ---------- */
  function P(list) { var p = {}; list.forEach(function (t) { var k = (t[1] || 0) + ',' + (t[2] || 0); p[k] = (p[k] || 0) + t[0]; if (p[k] === 0) delete p[k]; }); return p; }
  function pAdd(a, b) { var out = {}; [a, b].forEach(function (p) { Object.keys(p).forEach(function (k) { out[k] = (out[k] || 0) + p[k]; if (out[k] === 0) delete out[k]; }); }); return out; }
  function pScale(a, s) { var out = {}; Object.keys(a).forEach(function (k) { if (a[k] * s !== 0) out[k] = a[k] * s; }); return out; }
  function pMul(a, b) { var out = {}; Object.keys(a).forEach(function (ka) { Object.keys(b).forEach(function (kb) { var ea = ka.split(',').map(Number), eb = kb.split(',').map(Number), k = (ea[0] + eb[0]) + ',' + (ea[1] + eb[1]); out[k] = (out[k] || 0) + a[ka] * b[kb]; if (out[k] === 0) delete out[k]; }); }); return out; }
  function pTerms(p) { return Object.keys(p).map(function (k) { var e = k.split(',').map(Number); return { c: p[k], a: e[0], b: e[1] }; }).sort(function (u, v) { return (v.a + v.b) - (u.a + u.b) || v.a - u.a; }); }
  function mono(c, a, b, V) { V = V || ['x', 'y']; var s = ''; if (a) s += V[0] + (a > 1 ? '^{' + a + '}' : ''); if (b) s += V[1] + (b > 1 ? '^{' + b + '}' : ''); var ac = Math.abs(c); return (s === '' ? String(ac) : (ac === 1 ? '' : String(ac))) + s; }
  function pTex(p, V) { var ts = pTerms(p); if (!ts.length) return '0'; return ts.map(function (t, i) { var m = mono(t.c, t.a, t.b, V); return (i === 0 ? (t.c < 0 ? '-' : '') : (t.c < 0 ? ' - ' : ' + ')) + m; }).join(''); }
  function lin(a, b) { return P([[a, 1, 0], [b, 0, 0]]); }            // ax + b
  function br(p, V) { return '(' + pTex(p, V) + ')'; }
  function sq(p, V) { return [br(p, V) + '^{2}', br(p, V) + br(p, V)]; } // both spellings of a square
  function fracTex(n, d) { var s = (n < 0) !== (d < 0) && n !== 0 ? '-' : '', g = gcd(n, d) || 1; n = Math.abs(n) / g; d = Math.abs(d) / g; return d === 1 ? s + n : s + '\\frac{' + n + '}{' + d + '}'; }
  function solTex(list, V) { V = V || 'x'; return list.map(function (r) { return V + '=' + (typeof r === 'string' ? r : String(r)); }).join(', '); }
  function solHuman(list, V) { V = V || 'x'; return list.map(function (r) { return T(V + ' = ' + r); }).join(' or '); }
  function sgnNum(n) { return n < 0 ? ' - ' + Math.abs(n) : ' + ' + n; }
  var FORM_NOTE = 'Enter the factored form, e.g. <code>2(x-3)(x+5)</code>. The order of the factors does not matter.';
  var SOL_NOTE = 'Enter every solution, separated by commas, e.g. <code>x=4, x=-2</code>.';

  /* ---------- AN5 · A: the reverse of multiplying, common factors, x^2 + bx + c ---------- */
  var A_BEG = [
    function () { // the GCF of two monomials (L2)
      var g = pick([2, 3, 4, 5, 6]), m = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]]), e1 = ri(1, 3), e2 = e1 + ri(0, 2);
      var a = g * m[0], b = g * m[1];
      return { prompt: 'Determine the greatest common factor of ' + T(pTex(P([[a, e1, 0]]))) + ' and ' + T(pTex(P([[b, e2, 0]]))) + '.', type: 'expr', answers: [pTex(P([[g, e1, 0]]))], check: 'exact',
        hint: 'Take the greatest number that divides both coefficients, and the <b>lowest</b> power of x that appears in both.',
        solution: steps(['The GCF of ' + a + ' and ' + b + ' is ' + g + '.', 'The lowest power of x is ' + T('x^{' + e1 + '}') + '.', 'GCF = ' + T(pTex(P([[g, e1, 0]]))) + '.']) };
    },
    function () { // a GCF out of a binomial: 6x^2 - 4x, 5x + 15 (L2)
      var g = pick([2, 3, 4, 5, 6, 7]), a = pick([1, 2, 3, 4]), b = nz(-7, 7); if (gcd(a, b) !== 1) return A_BEG[1]();
      var e = pick([0, 1, 1]), common = P([[g, e, 0]]), inner = lin(a, b), expr = pMul(common, inner);
      return { prompt: 'Factor: ' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'Find the GCF of both terms. Write it in front, and what is left of each term goes inside the brackets.',
        solution: steps(['The GCF of the terms is ' + T(pTex(common)) + '.', 'Divide each term by it: ' + T(pTex(expr) + ' = ' + pTex(common) + br(inner)) + '.', 'Check by expanding: ' + T(pTex(common) + br(inner) + ' = ' + pTex(expr)) + '.']) };
    },
    function () { // x^2 + bx + c with c > 0 (L3)
      var s = pick([1, -1]), r = s * ri(1, 7), q = s * ri(1, 7);
      var V = pick(['x', 'x', 'x', 'm', 'n']), f1 = lin(1, r), f2 = lin(1, q), tri = pMul(f1, f2);
      return { prompt: 'Factor: ' + T(pTex(tri, [V])), type: 'expr', answers: [br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'Find two integers that multiply to ' + (r * q) + ' and add to ' + (r + q) + '. Since the constant is positive, both have the same sign as the middle term.',
        solution: steps(['Product ' + T(String(r * q)) + ', sum ' + T(String(r + q)) + ': the integers are ' + T(String(r)) + ' and ' + T(String(q)) + '.', T(pTex(tri, [V]) + ' = ' + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // the pair with a given product and sum (L3, L4)
      var r = nz(-9, 9), q = nz(-9, 9); if (r === q || r === -q || Math.abs(r * q) > 48) return A_BEG[3]();
      function key(u, v) { return Math.min(u, v) + ',' + Math.max(u, v); }
      var cand = [[-r, -q], [r, -q], [1, r * q], [-1, -r * q], [r + 1, q - 1]], seen = {}, wrong = [];
      seen[key(r, q)] = 1;
      cand.forEach(function (c) { var k = key(c[0], c[1]); if (seen[k] || (c[0] * c[1] === r * q && c[0] + c[1] === r + q)) return; seen[k] = 1; wrong.push(c[0] + ' and ' + c[1]); });
      var right = r + ' and ' + q, opts = shuffle([right].concat(wrong.slice(0, 3))), o = mc(opts, opts.indexOf(right));
      return { prompt: 'A kobold needs two integers with a <b>product</b> of ' + T(String(r * q)) + ' and a <b>sum</b> of ' + T(String(r + q)) + '. Which pair is it?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Check both conditions for each pair: multiply them, then add them.',
        solution: steps([T(r + ' \\times ' + (q < 0 ? '(' + q + ')' : q) + ' = ' + (r * q)) + ' and ' + T(r + (q < 0 ? ' - ' + (-q) : ' + ' + q) + ' = ' + (r + q)) + '.', 'Answer: ' + o.letter + '.']) };
    },
    function () { // multiplying and factoring are reverses: which product gives the trinomial? (L1)
      var r = ri(1, 7), q = ri(1, 7); if (r === q) return A_BEG[4]();
      var s = pick([1, -1]); r *= s; q *= s;
      var tri = pMul(lin(1, r), lin(1, q)), right = br(lin(1, r)) + br(lin(1, q));
      function key(u, v) { return Math.min(u, v) + ',' + Math.max(u, v); }
      var seen = {}; seen[key(r, q)] = 1; var wrong = [];
      [[-r, -q], [r * q, 1], [r, -q], [-r, q], [r + 1, q + 1]].forEach(function (c) { var k = key(c[0], c[1]); if (seen[k]) return; seen[k] = 1; wrong.push(br(lin(1, c[0])) + br(lin(1, c[1]))); });
      wrong = wrong.slice(0, 3);
      var opts = shuffle([right].concat(wrong)), o = mc(opts.map(function (x) { return T(x); }), opts.indexOf(right));
      return { prompt: 'Factoring undoes multiplying. Which product is equal to ' + T(pTex(tri)) + '?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Expand each choice with FOIL, or look for two numbers that multiply to the last term and add to the middle coefficient.',
        solution: steps(['Expand: ' + T(right + ' = ' + pTex(tri)) + '.', 'Answer: ' + o.letter + '.']) };
    }
  ];

  var A_PRG = [
    function () { // x^2 + bx + c with c < 0 (L4)
      var r = ri(1, 9), q = -ri(1, 9); if (r === -q) return A_PRG[0]();
      if (Math.random() < 0.5) { r = -r; q = -q; }
      var V = pick(['x', 'x', 'y', 'k']), f1 = lin(1, r), f2 = lin(1, q), tri = pMul(f1, f2);
      return { prompt: 'Factor: ' + T(pTex(tri, [V])), type: 'expr', answers: [br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'The constant is negative, so the two integers have <b>opposite</b> signs. The larger one (ignoring sign) takes the sign of the middle term.',
        solution: steps(['Product ' + T(String(r * q)) + ', sum ' + T(String(r + q)) + ': the integers are ' + T(String(r)) + ' and ' + T(String(q)) + '.', T(pTex(tri, [V]) + ' = ' + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // GCF with two variables: 9x^3y + 12x^2y^2 (L2)
      var g = pick([2, 3, 4, 5]), ex = ri(1, 2), ey = ri(1, 2), a = pick([1, 2, 3, 4, 5]), b = pick([1, 2, 3, 4, 5]) * pick([1, -1]);
      if (gcd(a, b) !== 1 || (a === 1 && b === 1)) return A_PRG[1]();
      var common = P([[g, ex, ey]]), inner = P([[a, 1, 0], [b, 0, 1]]), expr = pMul(common, inner);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'The GCF takes the greatest common number, the lowest power of x and the lowest power of y.',
        solution: steps(['GCF: ' + T(String(g)) + ', ' + T(mono(1, ex, 0)) + ' and ' + T(mono(1, 0, ey)) + ', so ' + T(pTex(common)) + '.', T(pTex(expr) + ' = ' + pTex(common) + br(inner)) + '.']) };
    },
    function () { // a negative GCF (L2)
      var g = pick([2, 3, 4, 5]), a = pick([1, 2, 3, 4]), b = ri(1, 7); if (gcd(a, b) !== 1) return A_PRG[2]();
      var e = pick([0, 1]), common = P([[-g, e, 0]]), inner = lin(a, -b), expr = pMul(common, inner);
      return { prompt: 'Factor out a <b>negative</b> common factor: ' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'Take out ' + T(pTex(common)) + '. Dividing by a negative changes the sign of every term left in the brackets.',
        solution: steps(['Take out ' + T(pTex(common)) + '.', T(pTex(expr) + ' = ' + pTex(common) + br(inner)) + '.', 'Check: ' + T(pTex(common) + br(inner) + ' = ' + pTex(expr)) + '.']) };
    },
    function () { // a GCF, then a trinomial (L8)
      var g = pick([2, 3, 4, 5]), r = nz(-6, 6), q = nz(-6, 6); if (r === -q) return A_PRG[3]();
      var f1 = lin(1, r), f2 = lin(1, q), expr = pScale(pMul(f1, f2), g);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [g + br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'First take out the common factor ' + g + '. Then factor the trinomial left in the brackets.',
        solution: steps([T(pTex(expr) + ' = ' + g + '(' + pTex(pMul(f1, f2)) + ')') + '.', 'Factor the trinomial: ' + T(pTex(pMul(f1, f2)) + ' = ' + br(f1) + br(f2)) + '.', T(pTex(expr) + ' = ' + g + br(f1) + br(f2)) + '.']) };
    },
    function () { // a monomial GCF out of a trinomial (L2)
      var g = pick([2, 3, 4, 5, 6]), inner = P([[1, 2, 0], [nz(-6, 6), 1, 0], [nz(-9, 9), 0, 0]]);
      var cs = pTerms(inner).map(function (t) { return t.c; }); if (cs.reduce(function (a, c) { return gcd(a, c); }) !== 1) return A_PRG[4]();
      var disc = cs[1] * cs[1] - 4 * cs[2]; if (disc >= 0 && Math.round(Math.sqrt(disc)) ** 2 === disc) return A_PRG[4](); // the trinomial must not factor further
      var common = P([[g, 1, 0]]), expr = pMul(common, inner);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'Every term has a factor of ' + g + ' and a factor of x.',
        solution: steps(['GCF: ' + T(pTex(common)) + '.', T(pTex(expr) + ' = ' + pTex(common) + br(inner)) + '.', 'The trinomial in the brackets does not factor further.']) };
    }
  ];

  var A_MAS = [
    function () { // a GCF, then a trinomial with c < 0 and bigger numbers (L8)
      var g = pick([2, 3, 4, 5]), r = ri(2, 9), q = -ri(2, 9); if (r === -q) return A_MAS[0]();
      if (Math.random() < 0.5) { r = -r; q = -q; }
      var V = pick(['x', 'n', 't']), f1 = lin(1, r), f2 = lin(1, q), expr = pScale(pMul(f1, f2), g);
      return { prompt: 'Factor completely: ' + T(pTex(expr, [V])), type: 'expr', answers: [g + br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'Take out the GCF first. Then find two integers with the product and sum you need for the trinomial left over.',
        solution: steps([T(pTex(expr, [V]) + ' = ' + g + '(' + pTex(pMul(f1, f2), [V]) + ')') + '.', 'Product ' + T(String(r * q)) + ', sum ' + T(String(r + q)) + ': ' + T(String(r)) + ' and ' + T(String(q)) + '.', T(g + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // a negative leading term: -x^2 + x + 12 (L8)
      var r = ri(1, 7), q = -ri(1, 7); if (r === -q) return A_MAS[1]();
      var f1 = lin(1, r), f2 = lin(1, q), expr = pScale(pMul(f1, f2), -1);
      var A1 = '-' + br(f1) + br(f2), A2 = '-1' + br(f1) + br(f2), A3 = br(pScale(f1, -1)) + br(f2), A4 = br(f1) + br(pScale(f2, -1));
      return { prompt: 'Factor completely by first taking out ' + T('-1') + ': ' + T(pTex(expr)), type: 'expr', answers: [A1, A2, A3, A4], check: 'exact', note: FORM_NOTE,
        hint: 'Write it as ' + T('-1(\\ldots)') + ' with every sign changed inside, then factor the trinomial in the brackets.',
        solution: steps([T(pTex(expr) + ' = -(' + pTex(pMul(f1, f2)) + ')') + '.', T(pTex(pMul(f1, f2)) + ' = ' + br(f1) + br(f2)) + '.', T(pTex(expr) + ' = ' + A1) + '.']) };
    },
    function () { // the greatest k so x^2 + kx + c factors (u4test MAS; c with two factor pairs)
      var c = pick([6, 10, 14, 15, 21, 22, 35]), pairs = [];
      for (var d = 1; d * d <= c; d++) if (c % d === 0) pairs.push([d, c / d]);
      var ks = []; pairs.forEach(function (p) { ks.push(p[0] + p[1], -(p[0] + p[1])); });
      var ask = pick(['max', 'count']);
      return { prompt: 'The trinomial ' + T('x^{2} + kx + ' + c) + ' can be factored over the integers. ' + (ask === 'max' ? 'What is the <b>greatest</b> possible integer value of ' + T('k') + '?' : 'How many integer values of ' + T('k') + ' are possible?'), type: 'num', answers: [String(ask === 'max' ? Math.max.apply(null, ks) : ks.length)], tol: 0,
        hint: 'List every pair of integers that multiply to ' + c + ' (negatives too). k is the sum of a pair.',
        solution: steps(['Pairs with product ' + c + ': ' + pairs.map(function (p) { return p[0] + ' and ' + p[1] + ', ' + (-p[0]) + ' and ' + (-p[1]); }).join('; ') + '.', 'Their sums: ' + ks.join(', ') + '.', ask === 'max' ? 'Greatest: ' + T(String(Math.max.apply(null, ks))) + '.' : T(String(ks.length)) + ' values of k.']) };
    },
    function () { // find the error in a worked factoring (u4test MAS, L10 #24)
      var r = ri(2, 8), q = -ri(2, 8); if (r === -q) return A_MAS[3]();
      var tri = pMul(lin(1, r), lin(1, q)), who = pick(['Jamal', 'Priya', 'Mateo', 'Aisha']);
      var kind = pick(['swap', 'sum']), studentAns, rightOpt;
      var opts = ['The two integers have the right product but the wrong signs, so their sum is wrong', 'The integers multiply to the wrong number', 'A common factor should have been taken out first', 'There is no error'];
      if (kind === 'swap') { studentAns = br(lin(1, -r)) + br(lin(1, -q)); rightOpt = 0; }
      else { studentAns = br(lin(1, r + 1)) + br(lin(1, q - 1)); rightOpt = 1; if ((r + 1) * (q - 1) === r * q) return A_MAS[3](); }
      var o = mc(opts, rightOpt);
      return { prompt: who + ' factored ' + T(pTex(tri)) + ' as ' + T(studentAns) + '. What went wrong?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Expand ' + who + '\'s answer and compare it with the trinomial. Is the constant right? Is the middle term right?',
        solution: steps(['Expanding gives ' + T(pTex(pMul(kind === 'swap' ? lin(1, -r) : lin(1, r + 1), kind === 'swap' ? lin(1, -q) : lin(1, q - 1)))) + ', not ' + T(pTex(tri)) + '.', 'The correct factoring is ' + T(br(lin(1, r)) + br(lin(1, q))) + '.', 'Answer: ' + o.letter + '.']) };
    },
    function () { // a rectangle's area factored into sides, then its perimeter (L7 #10, a = 1)
      var r = ri(1, 9), q = ri(1, 9); if (r === q) return A_MAS[4]();
      var area = pMul(lin(1, r), lin(1, q)), per = pScale(pAdd(lin(1, r), lin(1, q)), 2);
      return { prompt: 'A rectangular ore chamber has an area of ' + T('(' + pTex(area) + ')') + ' square metres. Its side lengths are binomials with integer constants. Write a simplified expression for its <b>perimeter</b>.', type: 'expr', answers: [pTex(per)], check: 'equivalent',
        hint: 'Factor the area to find the length and the width. The perimeter is 2 × (length + width).',
        solution: steps([T(pTex(area) + ' = ' + br(lin(1, r)) + br(lin(1, q))) + ', so the sides are ' + T(pTex(lin(1, r))) + ' and ' + T(pTex(lin(1, q))) + '.', 'Perimeter ' + T('= 2[' + br(lin(1, r)) + ' + ' + br(lin(1, q)) + '] = ' + pTex(per)) + '.']) };
    }
  ];

  /* ---------- AN5 · B: special products, ax^2 + bx + c, choosing a strategy, solving ---------- */
  var B_BEG = [
    function () { // x^2 - 49 (L5)
      var a = ri(2, 12), V = pick(['x', 'x', 'y', 'n']), f1 = lin(1, -a), f2 = lin(1, a);
      return { prompt: 'Factor: ' + T(V + '^{2} - ' + (a * a)), type: 'expr', answers: [br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'A difference of squares ' + T('a^{2} - b^{2}') + ' factors as ' + T('(a - b)(a + b)') + '. What number squared is ' + (a * a) + '?',
        solution: steps([T(V + '^{2} - ' + (a * a) + ' = ' + V + '^{2} - ' + a + '^{2}') + '.', T('= ' + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // x^2 +- 2qx + q^2 (L6)
      var q = ri(2, 10) * pick([1, -1]), V = pick(['x', 'x', 'm']), f = lin(1, q), tri = pMul(f, f);
      return { prompt: 'Factor the perfect square trinomial: ' + T(pTex(tri, [V])), type: 'expr', answers: sq(f, [V]), check: 'exact', note: FORM_NOTE,
        hint: 'First and last terms are perfect squares: ' + T(V + '^{2}') + ' and ' + T(String(q * q)) + '. The middle term is twice ' + T(V + ' \\times ' + Math.abs(q)) + '.',
        solution: steps([T(String(q * q) + ' = ' + Math.abs(q) + '^{2}') + ' and ' + T(String(Math.abs(2 * q)) + V + ' = 2(' + V + ')(' + Math.abs(q) + ')') + '.', T(pTex(tri, [V]) + ' = ' + br(f, [V]) + '^{2}') + '.']) };
    },
    function () { // is it a perfect square trinomial? (L6, the three-part test)
      var q = ri(2, 9), kind = pick(['yes', 'yes', 'mid', 'last', 'neg']), b = 2 * q, c = q * q;
      if (kind === 'mid') b = 2 * q + pick([-2, 2, q]);
      if (kind === 'last') c = q * q + pick([-3, -1, 2, 4]);
      var s = 'x^{2} + ' + b + 'x ' + (kind === 'neg' ? '- ' : '+ ') + c, o = mc(['Yes', 'No'], kind === 'yes' ? 0 : 1);
      var why = kind === 'yes' ? 'The first and last terms are squares and the middle term is ' + T('2(x)(' + q + ')') + ', so yes.' :
        kind === 'mid' ? 'The middle term should be ' + T(2 * q + 'x') + ', not ' + T(b + 'x') + ', so no.' :
        kind === 'neg' ? 'The last term is negative, so it cannot be a square: no.' : T(String(c)) + ' is not a perfect square, so no.';
      return { prompt: 'A miner keeps only trinomials that are <b>perfect squares</b>. Is ' + T(s) + ' a perfect square trinomial?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Check all three: is the first term a square, is the last term a positive square, and is the middle term twice the product of their square roots?',
        solution: steps([why, 'Answer: ' + o.letter + '.']) };
    },
    function () { // the zero product property (L9)
      var r = nz(-9, 9), q = nz(-9, 9); if (r === q) return B_BEG[3]();
      return { prompt: 'Solve: ' + T(br(lin(1, -r)) + br(lin(1, -q)) + ' = 0'), type: 'expr', answers: [solTex([r, q])], check: 'equivalent', note: SOL_NOTE,
        hint: 'If a product is 0, one of the factors must be 0. Set each bracket equal to 0.',
        solution: steps([T(pTex(lin(1, -r)) + ' = 0') + ' or ' + T(pTex(lin(1, -q)) + ' = 0') + '.', solHuman([r, q]) + '.']) };
    },
    function () { // which method first (L8)
      var kind = pick(['gcf', 'dos', 'pst', 'tri']), e, right;
      var g = ri(2, 6), a = ri(2, 9), r = ri(1, 6), q = ri(1, 6);
      if (kind === 'gcf') { e = pTex(P([[g, 2, 0], [g * nz(1, 5), 1, 0]])); right = 0; }
      else if (kind === 'dos') { e = 'x^{2} - ' + a * a; right = 1; }
      else if (kind === 'pst') { e = pTex(pMul(lin(1, a), lin(1, a))); right = 2; }
      else { if (r === q) q = r + 1; e = pTex(pMul(lin(1, r), lin(1, -q))); right = 3; }
      var o = mc(['Take out a common factor', 'Difference of squares', 'Perfect square trinomial', 'Two integers with a product and sum (x² + bx + c)'], right);
      return { prompt: 'Which strategy should you use to factor ' + T(e) + '?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Always look for a common factor first. Two squares with a minus between them: difference of squares. Square, twice-product, square: perfect square.',
        solution: steps([['Every term shares a common factor, so take it out first.', 'It is one square minus another.', 'First and last terms are squares and the middle is twice their product.', 'It is x² + bx + c with no common factor and not a special product.'][right], 'Answer: ' + o.letter + '.']) };
    }
  ];

  var B_PRG = [
    function () { // 4x^2 - 81 (L5)
      var a = ri(2, 6), b = ri(1, 11); if (gcd(a, b) !== 1) return B_PRG[0]();
      var f1 = lin(a, -b), f2 = lin(a, b);
      return { prompt: 'Factor: ' + T((a * a) + 'x^{2} - ' + (b * b)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: T((a * a) + 'x^{2}') + ' is ' + T('(' + a + 'x)^{2}') + ' and ' + T(String(b * b)) + ' is ' + T(b + '^{2}') + '.',
        solution: steps([T((a * a) + 'x^{2} - ' + (b * b) + ' = (' + a + 'x)^{2} - ' + b + '^{2}') + '.', T('= ' + br(f1) + br(f2)) + '.']) };
    },
    function () { // (2x - 5)^2-type perfect squares (L6)
      var a = ri(2, 5), b = ri(1, 9) * pick([1, -1]); if (gcd(a, Math.abs(b)) !== 1) return B_PRG[1]();
      var f = lin(a, b), tri = pMul(f, f);
      return { prompt: 'Factor: ' + T(pTex(tri)), type: 'expr', answers: sq(f).concat(sq(pScale(f, -1))), check: 'exact', note: FORM_NOTE,
        hint: 'Is it a perfect square trinomial? ' + T(pTex(P([[a * a, 2, 0]]))) + ' = ' + T('(' + a + 'x)^{2}') + ' and ' + T(String(b * b)) + ' = ' + T(Math.abs(b) + '^{2}') + '. Check the middle term.',
        solution: steps(['Middle term: ' + T('2(' + a + 'x)(' + Math.abs(b) + ') = ' + Math.abs(2 * a * b) + 'x') + '. It matches.', T(pTex(tri) + ' = ' + br(f) + '^{2}') + '.']) };
    },
    function () { // ax^2 + bx + c with a = 2 or 3, by decomposition (L7)
      var a = pick([2, 3]), m = nz(-7, 7), n = nz(-7, 7); if (gcd(a, m) !== 1) return B_PRG[2]();
      var f1 = lin(a, m), f2 = lin(1, n), tri = pMul(f1, f2), ac = a * a * n * m / a, B = a * n + m;
      return { prompt: 'Factor: ' + T(pTex(tri)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'Multiply a × c = ' + (a * m * n) + '. Find two integers with that product that add to ' + B + ', split the middle term with them, then group.',
        solution: steps(['a × c = ' + T(String(a * m * n)) + '; the integers ' + T(String(a * n)) + ' and ' + T(String(m)) + ' have that product and sum ' + T(String(B)) + '.', 'Split and group: ' + T(pTex(P([[a, 2, 0], [a * n, 1, 0]])) + sgnNum(m) + 'x' + sgnNum(m * n)) + '.', T('= ' + a + 'x' + br(lin(1, n)) + sgnNum(m) + br(lin(1, n)) + ' = ' + br(f1) + br(f2)) + '.']) };
    },
    function () { // solve x^2 + 3x = 10 (L9)
      var r = nz(-8, 8), q = nz(-8, 8); if (r === q) return B_PRG[3]();
      var b = -(r + q), c = r * q; // x^2 + bx + c = 0
      if (c === 0) return B_PRG[3]();
      var lhs = pTex(P([[1, 2, 0], [b, 1, 0]])), rhs = String(-c);
      return { prompt: 'Solve by factoring: ' + T(lhs + ' = ' + rhs), type: 'expr', answers: [solTex([r, q])], check: 'equivalent', note: SOL_NOTE,
        hint: 'Move everything to one side so the equation equals 0, factor, then set each factor equal to 0.',
        solution: steps([T(pTex(P([[1, 2, 0], [b, 1, 0], [c, 0, 0]])) + ' = 0') + '.', T(br(lin(1, -r)) + br(lin(1, -q)) + ' = 0') + '.', solHuman([r, q]) + '.']) };
    },
    function () { // solve x^2 - 6x = 0 or x^2 - 36 = 0 (L9)
      var a = ri(2, 9), kind = pick(['gcf', 'dos']);
      if (kind === 'gcf') return { prompt: 'Solve: ' + T('x^{2} - ' + a + 'x = 0'), type: 'expr', answers: [solTex([0, a])], check: 'equivalent', note: SOL_NOTE,
        hint: 'Take out the common factor x. Do not divide both sides by x, or you lose a solution.',
        solution: steps([T('x(x - ' + a + ') = 0') + '.', solHuman([0, a]) + '.']) };
      return { prompt: 'Solve: ' + T('x^{2} - ' + (a * a) + ' = 0'), type: 'expr', answers: [solTex([a, -a])], check: 'equivalent', note: SOL_NOTE,
        hint: 'Factor the difference of squares, then set each factor equal to 0.',
        solution: steps([T('(x - ' + a + ')(x + ' + a + ') = 0') + '.', solHuman([a, -a]) + '.']) };
    }
  ];

  var B_MAS = [
    function () { // two-stage factoring: 3x^3 - 12x, 2x^2 + 20x + 50 (L8)
      var g = pick([2, 3, 4, 5]), a = ri(1, 6), kind = pick(['dos', 'pst']);
      if (kind === 'dos') {
        var common = P([[g, 1, 0]]), expr = pMul(common, P([[1, 2, 0], [-a * a, 0, 0]]));
        return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(lin(1, -a)) + br(lin(1, a))], check: 'exact', note: FORM_NOTE,
          hint: 'Take out the GCF first. What is left is a difference of squares.',
          solution: steps([T(pTex(expr) + ' = ' + pTex(common) + '(x^{2} - ' + a * a + ')') + '.', T('= ' + pTex(common) + br(lin(1, -a)) + br(lin(1, a))) + '.']) };
      }
      var s = pick([1, -1]) * a, f = lin(1, s), tri = pScale(pMul(f, f), g);
      return { prompt: 'Factor completely: ' + T(pTex(tri)), type: 'expr', answers: [g + br(f) + '^{2}', g + br(f) + br(f)], check: 'exact', note: FORM_NOTE,
        hint: 'Take out the GCF first. What is left is a perfect square trinomial.',
        solution: steps([T(pTex(tri) + ' = ' + g + '(' + pTex(pMul(f, f)) + ')') + '.', T('= ' + g + br(f) + '^{2}') + '.']) };
    },
    function () { // solve 2x^2 + 5x - 3 = 0 (L9 with L7)
      var a = pick([2, 3]), m = nz(-5, 5), n = nz(-6, 6); if (gcd(a, m) !== 1) return B_MAS[1]();
      var tri = pMul(lin(a, m), lin(1, n)), r1 = fracTex(-m, a), r2 = String(-n);
      return { prompt: 'Solve by factoring: ' + T(pTex(tri) + ' = 0'), type: 'expr', answers: [solTex([r1, r2])], check: 'equivalent', note: SOL_NOTE + ' Use a fraction where needed, e.g. <code>x=1/2</code>.',
        hint: 'Factor the trinomial (a × c method), then set each factor equal to 0. One solution is a fraction.',
        solution: steps([T(br(lin(a, m)) + br(lin(1, n)) + ' = 0') + '.', T(pTex(lin(a, m)) + ' = 0') + ' gives ' + T('x = ' + r1) + '; ' + T(pTex(lin(1, n)) + ' = 0') + ' gives ' + T('x = ' + r2) + '.']) };
    },
    function () { // solve 3x^2 = 12x (L9)
      var g = pick([2, 3, 4, 5]), a = ri(2, 8) * pick([1, -1]);
      return { prompt: 'Solve by factoring: ' + T(g + 'x^{2} = ' + (g * a) + 'x'), type: 'expr', answers: [solTex([0, a])], check: 'equivalent', note: SOL_NOTE,
        hint: 'Move everything to one side, then take out the common factor. Dividing by x would lose the solution x = 0.',
        solution: steps([T(pTex(P([[g, 2, 0], [-g * a, 1, 0]])) + ' = 0') + '.', T(g + 'x' + br(lin(1, -a)) + ' = 0') + '.', solHuman([0, a]) + '.']) };
    },
    function () { // a garden bed / chamber floor area ax^2 + bx + c factored into sides, then perimeter (L7 #10)
      var a = pick([2, 3]), m = ri(1, 5), n = ri(1, 6); if (gcd(a, m) !== 1) return B_MAS[3]();
      var s1 = lin(a, m), s2 = lin(1, n), area = pMul(s1, s2), per = pScale(pAdd(s1, s2), 2);
      return { prompt: 'The floor of a lamp-lit chamber is a rectangle with area ' + T('(' + pTex(area) + ')') + ' square metres. Factor the area to find its side lengths, then write a simplified expression for its <b>perimeter</b>.', type: 'expr', answers: [pTex(per)], check: 'equivalent',
        hint: 'Factor ' + T(pTex(area)) + ' with the a × c method. Perimeter = 2(length + width).',
        solution: steps([T(pTex(area) + ' = ' + br(s1) + br(s2)) + '.', 'Perimeter ' + T('= 2[' + br(s1) + ' + ' + br(s2) + '] = ' + pTex(per)) + '.']) };
    },
    function () { // k for a perfect square trinomial (u4test MAS)
      var a = pick([1, 1, 2, 3, 4]), b = ri(2, 9); if (gcd(a, b) !== 1) return B_MAS[4]();
      var A = a * a, C = b * b, k = 2 * a * b;
      return { prompt: 'For what <b>positive</b> value of ' + T('k') + ' is ' + T((A === 1 ? '' : A) + 'x^{2} + kx + ' + C) + ' a perfect square trinomial?', type: 'num', answers: [String(k)], tol: 0,
        hint: 'The first term is ' + T('(' + (a === 1 ? '' : a) + 'x)^{2}') + ' and the last is ' + T(b + '^{2}') + '. The middle term is twice their product.',
        solution: steps(['Square roots: ' + T((a === 1 ? '' : a) + 'x') + ' and ' + T(String(b)) + '.', T('k = 2 \\times ' + a + ' \\times ' + b + ' = ' + k) + '.']) };
    }
  ];

  var G = QGen.GENS;
  G.AN5A_BEG = A_BEG; G.AN5A_PRG = A_PRG; G.AN5A_MAS = A_MAS;
  G.AN5B_BEG = B_BEG; G.AN5B_PRG = B_PRG; G.AN5B_MAS = B_MAS;
})();
