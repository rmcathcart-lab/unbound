/* ===================== LAND 3 · THE DEEP QUARRY · Math 15 Unit 3 · POLYNOMIAL OPERATIONS (AN4) =====================
 * Registered into QGen.GENS as AN4A_* (terms, degree, like terms, adding and subtracting, a monomial times a polynomial)
 * and AN4B_* (two binomials, special products, a binomial times a trinomial, area and volume). Pitched like Ryan's Math 15
 * Unit 3 test (math15 js/lessons/u3test.js):
 *   BEG  each lesson's core skill as first taught: degree / coefficient / constant, collecting like terms, adding,
 *        3x(2x - 5), FOIL on (x + 2)(x + 5), (x + 4)(x - 4), which special-product pattern;
 *   PRG  the typical assignment question: subtracting, distribute then collect, negative multipliers, binomials with
 *        negative terms and coefficients, (x - 7)^2 and (2x - 3)^2, binomial x trinomial, a rectangle's area and its value;
 *   MAS  Math 15's hardest items: 2(x + 3)(x - 1) - (x - 2)^2, a box's volume, a missing term or coefficient,
 *        k so (x + k)(x - 6) has no x-term, the error in a worked expansion.
 * Answers are polynomials in any order (the exact checker sorts terms); unexpanded answers are graded 'form'.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var x = 0; while (x === 0) x = ri(a, b); return x; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  var MCNOTE = 'Type the letter of your choice.';
  function letters(L) { return [L, L.toLowerCase()]; }
  function mc(opts, right) { var L = ['A', 'B', 'C', 'D']; return { html: '<div class="mc-opts">' + opts.map(function (o, i) { return '<div><b>' + L[i] + '.</b> ' + o + '</div>'; }).join('') + '</div>', letter: L[right] }; }

  /* ---------- one-variable polynomials: arrays of coefficients, index = degree ---------- */
  function P() { return Array.prototype.slice.call(arguments).reverse(); } // P(2, -3, 1) = 2x^2 - 3x + 1
  function trim(p) { p = p.slice(); while (p.length > 1 && p[p.length - 1] === 0) p.pop(); return p; }
  function add(a, b) { var n = Math.max(a.length, b.length), r = []; for (var i = 0; i < n; i++) r.push((a[i] || 0) + (b[i] || 0)); return trim(r); }
  function scale(a, k) { return a.map(function (c) { return c * k; }); }
  function sub(a, b) { return add(a, scale(b, -1)); }
  function mul(a, b) { var r = []; for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) r[i + j] = (r[i + j] || 0) + a[i] * b[j]; for (var k = 0; k < r.length; k++) r[k] = r[k] || 0; return trim(r); }
  function tex(p, v) { // descending, e.g. 2x^{2}-3x+1
    v = v || 'x'; var s = '';
    for (var i = p.length - 1; i >= 0; i--) {
      var c = p[i]; if (!c) continue;
      var body = i === 0 ? String(Math.abs(c)) : (Math.abs(c) === 1 ? '' : Math.abs(c)) + v + (i > 1 ? '^{' + i + '}' : '');
      s += (s ? (c < 0 ? '-' : '+') : (c < 0 ? '-' : '')) + body;
    }
    return s || '0';
  }
  function br(p, v) { return '(' + tex(p, v) + ')'; }
  function bin(a, b) { return P(a, b); } // ax + b
  function deg(p) { return trim(p).length - 1; }
  var V = ['x', 'x', 'x', 'a', 'n', 'm', 'y'];

  var A_BEG = [
    function () { // degree, leading coefficient or constant (L1)
      var v = pick(V), p = trim([nz(-9, 9), nz(-8, 8), ri(-6, 6), nz(-5, 5)].slice(0, ri(3, 4))), terms = [];
      for (var i = 0; i < p.length; i++) if (p[i]) terms.push(i);
      // write the terms in a jumbled order so the degree is not simply the first term's
      var order = shuffle(terms), s = '';
      order.forEach(function (i) { var c = p[i], body = i === 0 ? String(Math.abs(c)) : (Math.abs(c) === 1 ? '' : Math.abs(c)) + v + (i > 1 ? '^{' + i + '}' : ''); s += (s ? (c < 0 ? '-' : '+') : (c < 0 ? '-' : '')) + body; });
      var d = deg(p), kind = pick(['deg', 'lead', 'const']);
      if (kind === 'const' && !p[0]) kind = 'deg';
      var ans = kind === 'deg' ? d : kind === 'lead' ? p[d] : p[0];
      var what = kind === 'deg' ? 'the <b>degree</b>' : kind === 'lead' ? 'the <b>coefficient of the term with the highest degree</b>' : 'the <b>constant term</b>';
      return { prompt: 'For the polynomial ' + T(s) + ', what is ' + what + '?', type: 'num', answers: [String(ans)], tol: 0,
        hint: kind === 'deg' ? 'The degree is the highest exponent on ' + v + ' in any term, wherever that term is written.' : kind === 'lead' ? 'Find the term with the highest power of ' + v + '. Its coefficient is the number in front, with its sign.' : 'The constant term is the term with no variable, with its sign.',
        solution: steps([kind === 'deg' ? 'The highest power of ' + v + ' is ' + T(v + '^{' + d + '}') + ', so the degree is ' + d + '.' : kind === 'lead' ? 'The highest-degree term is ' + T(tex([].concat(Array(d).fill(0), [p[d]]), v)) + ', so the coefficient is ' + T(p[d]) + '.' : 'The term with no variable is ' + T(p[0]) + '.']) };
    },
    function () { // collect like terms, one variable (L1)
      var v = pick(V), a = nz(-6, 7), b = nz(-6, 7), c = nz(-8, 9), d = nz(-8, 9), e = Math.random() < 0.5 ? nz(-4, 5) : 0, f = e ? nz(-4, 5) : 0;
      var parts = shuffle([[a, 1], [b, 1], [c, 0], [d, 0]].concat(e ? [[e, 2], [f, 2]] : [])), s = '';
      parts.forEach(function (t) { var c0 = t[0], body = t[1] === 0 ? String(Math.abs(c0)) : (Math.abs(c0) === 1 ? '' : Math.abs(c0)) + v + (t[1] > 1 ? '^{2}' : ''); s += (s ? (c0 < 0 ? '-' : '+') : (c0 < 0 ? '-' : '')) + body; });
      var res = trim([c + d, a + b, e + f]);
      return { prompt: 'Simplify by collecting like terms: ' + T(s), type: 'expr', answers: [tex(res, v)], check: 'exact',
        hint: 'Like terms have exactly the same variable and exponent. Add their coefficients (keep each sign with its term); the variable part stays the same.',
        solution: steps([(e ? T(v + '^{2}') + ' terms: ' + T(e + ' + (' + f + ') = ' + (e + f)) + '. ' : '') + T(v) + ' terms: ' + T(a + ' + (' + b + ') = ' + (a + b)) + '. Numbers: ' + T(c + ' + (' + d + ') = ' + (c + d)) + '.', 'Answer: ' + T(tex(res, v)) + '.']) };
    },
    function () { // add two polynomials (L1)
      var v = pick(V), p = P(nz(-5, 6), nz(-7, 7), nz(-9, 9)), q = P(nz(-5, 6), nz(-7, 7), nz(-9, 9)), r = add(p, q);
      return { prompt: 'Add: ' + T(br(p, v) + '+' + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Adding: drop the brackets (nothing changes sign), then collect like terms.',
        solution: steps([T(tex(p, v) + (q[2] < 0 ? '' : '+') + tex(q, v)) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // a monomial times a monomial or a binomial: 3x(2x - 5) (L2)
      var v = pick(V), k = nz(-5, 6), m = Math.random() < 0.6 ? 1 : 2, q = P(nz(-5, 6), nz(-9, 9)), mono = scale(Array(m).fill(0).concat([1]), k);
      var r = mul(mono, q);
      return { prompt: 'Expand: ' + T(tex(mono, v) + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Multiply ' + T(tex(mono, v)) + ' by EACH term inside the brackets. Multiply the numbers and add the exponents.',
        solution: steps([T(tex(mono, v) + '\\cdot ' + tex(P(q[1], 0), v) + ' = ' + tex(mul(mono, P(q[1], 0)), v)) + ' and ' + T(tex(mono, v) + '\\cdot (' + q[0] + ') = ' + tex(scale(mono, q[0]), v)) + '.', 'Answer: ' + T(tex(r, v)) + '.']) };
    },
    function () { // a monomial times a trinomial (L2)
      var v = pick(V), k = nz(-4, 5), q = P(nz(-4, 5), nz(-6, 6), nz(-7, 7)), mono = P(k, 0), r = mul(mono, q);
      return { prompt: 'Expand: ' + T(tex(mono, v) + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Three terms inside, so three products. Watch the signs: a negative times a negative is positive.',
        solution: steps(['Multiply each term by ' + T(tex(mono, v)) + ': ' + T(tex(r, v)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // subtract a polynomial (L1)
      var v = pick(V), p = P(nz(-5, 7), nz(-8, 8), nz(-9, 9)), q = P(nz(-5, 7), nz(-8, 8), nz(-9, 9)), r = sub(p, q);
      return { prompt: 'Subtract: ' + T(br(p, v) + '-' + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Subtracting a bracket changes the sign of EVERY term inside it. Then collect like terms.',
        solution: steps(['Change every sign in the second bracket: ' + T(tex(p, v) + (q[2] > 0 ? '' : '+') + tex(scale(q, -1), v)) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // distribute then collect: a(x + b) - c(x - d)  (L2)
      var v = pick(V), a = nz(-5, 6), b = nz(-7, 7), c = nz(2, 6), d = nz(-7, 7), sgn = pick([1, -1]);
      var r = add(scale(P(1, b), a), scale(P(1, d), sgn * c));
      return { prompt: 'Expand and simplify: ' + T(a + br(P(1, b), v) + (sgn > 0 ? '+' : '-') + c + br(P(1, d), v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Distribute each number into its own bracket first (watch the sign in front of the second number), then collect like terms.',
        solution: steps([T(a + br(P(1, b), v) + ' = ' + tex(scale(P(1, b), a), v)) + ' and ' + T((sgn > 0 ? '' : '-') + c + br(P(1, d), v) + ' = ' + tex(scale(P(1, d), sgn * c), v)) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // negative monomial times a trinomial, then add a term: -2x(x^2 - 3x + 4) + 5x^2  (L2)
      var v = pick(V), k = nz(-5, -2), q = P(1, nz(-6, 6), nz(-7, 7)), extra = nz(-6, 6), mono = P(k, 0), r = add(mul(mono, q), P(extra, 0, 0));
      return { prompt: 'Expand and simplify: ' + T(tex(mono, v) + br(q, v) + (extra > 0 ? '+' : '-') + Math.abs(extra) + v + '^{2}'), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'The multiplier is negative: it changes the sign of every term it multiplies. Then collect the ' + T(v + '^{2}') + ' terms.',
        solution: steps([T(tex(mono, v) + br(q, v) + ' = ' + tex(mul(mono, q), v)) + '.', 'Add ' + T((extra > 0 ? '' : '-') + Math.abs(extra) + v + '^{2}') + ': ' + T(tex(r, v)) + '.']) };
    },
    function () { // like terms in two variables (L1)
      var a = nz(-6, 7), b = nz(-6, 7), c = nz(-6, 7), d = nz(-6, 7), e = nz(-5, 5), f = nz(-5, 5);
      var terms = shuffle([[a, 'x^{2}'], [b, 'xy'], [c, 'x^{2}'], [d, 'xy'], [e, 'y^{2}'], [f, 'y^{2}']]), s = '';
      terms.forEach(function (t) { s += (s ? (t[0] < 0 ? '-' : '+') : (t[0] < 0 ? '-' : '')) + (Math.abs(t[0]) === 1 ? '' : Math.abs(t[0])) + t[1]; });
      var R = [[a + c, 'x^{2}'], [b + d, 'xy'], [e + f, 'y^{2}']], out = '';
      R.forEach(function (t) { if (!t[0]) return; out += (out ? (t[0] < 0 ? '-' : '+') : (t[0] < 0 ? '-' : '')) + (Math.abs(t[0]) === 1 ? '' : Math.abs(t[0])) + t[1]; });
      if (!out) return A_PRG[3]();
      return { prompt: 'Simplify by collecting like terms: ' + T(s), type: 'expr', answers: [out], check: 'exact',
        hint: T('x^{2}') + ', ' + T('xy') + ' and ' + T('y^{2}') + ' are three different kinds of term. Collect each kind separately.',
        solution: steps([T('x^{2}') + ': ' + T(a + '+(' + c + ') = ' + (a + c)) + '; ' + T('xy') + ': ' + T(b + '+(' + d + ') = ' + (b + d)) + '; ' + T('y^{2}') + ': ' + T(e + '+(' + f + ') = ' + (e + f)) + '.', 'Answer: ' + T(out) + '.']) };
    },
    function () { // two monomial-times-binomial products added: 3x(x - 2) + 2(x^2 + 4x - 1)  (L2)
      var v = pick(V), a = nz(-4, 5), p = P(1, nz(-6, 6)), b = nz(-4, 5), q = P(nz(1, 3), nz(-6, 6), nz(-7, 7));
      var r = add(mul(P(a, 0), p), scale(q, b));
      return { prompt: 'Expand and simplify: ' + T(tex(P(a, 0), v) + br(p, v) + (b > 0 ? '+' : '-') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Expand each part separately, then collect like terms.',
        solution: steps([T(tex(P(a, 0), v) + br(p, v) + ' = ' + tex(mul(P(a, 0), p), v)) + '.', T((b > 0 ? '' : '-') + Math.abs(b) + br(q, v) + ' = ' + tex(scale(q, b), v)) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    }
  ];

  var A_MAS = [
    function () { // missing coefficient: 3x(ax + 2) = 12x^2 + 6x  (EP)
      var v = 'x', k = nz(2, 6), a = nz(-5, 6), b = nz(-7, 7), r = mul(P(k, 0), P(a, b));
      return { prompt: 'Find the value of ' + T('a') + ':<br>' + T(k + 'x(ax' + (b < 0 ? '-' : '+') + Math.abs(b) + ') = ' + tex(r, v)), type: 'num', answers: [String(a)], tol: 0,
        hint: 'Expand the left side with ' + T('a') + ' still in it: ' + T(k + 'x\\cdot ax = ' + k + 'ax^{2}') + '. Then match the ' + T('x^{2}') + ' terms on both sides.',
        solution: steps(['The ' + T('x^{2}') + ' term on the left is ' + T(k + 'ax^{2}') + '.', 'Match: ' + T(k + 'a = ' + r[2]) + ', so ' + T('a = ' + a) + '.']) };
    },
    function () { // perimeter of a shape with expression sides, simplified (L1 application)
      var p = P(nz(2, 5), nz(-3, 6)), q = P(nz(1, 4), nz(1, 8)), r = scale(add(p, q), 2);
      return { prompt: 'A rectangular quarry floor has length ' + T(tex(p)) + ' metres and width ' + T(tex(q)) + ' metres. Write a simplified expression for its <b>perimeter</b>.', type: 'expr', answers: [tex(r)], check: 'exact',
        hint: 'Perimeter = 2 × length + 2 × width (or add all four sides). Then collect like terms.',
        solution: steps([T('2(' + tex(p) + ') + 2(' + tex(q) + ') = ' + tex(scale(p, 2)) + (q[1] < 0 ? '' : '+') + tex(scale(q, 2))) + '.', 'Collect: ' + T(tex(r)) + '.']) };
    },
    function () { // three-part expand and simplify: 2x(x - 3) - x(x + 5) + 4(x - 1)  (L2 EP)
      var v = pick(V), a = nz(2, 4), b = nz(-6, 6), c = nz(1, 3), d = nz(-6, 6), e = nz(-5, 5), f = nz(-6, 6);
      var r = add(add(mul(P(a, 0), P(1, b)), scale(mul(P(c, 0), P(1, d)), -1)), scale(P(1, f), e));
      return { prompt: 'Expand and simplify: ' + T(tex(P(a, 0), v) + br(P(1, b), v) + '-' + tex(P(c, 0), v) + br(P(1, d), v) + (e > 0 ? '+' : '-') + (Math.abs(e) === 1 ? '' : Math.abs(e)) + br(P(1, f), v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Three products. The minus in front of the second one changes the sign of both of its terms. Expand all three, then collect.',
        solution: steps([T(tex(P(a, 0), v) + br(P(1, b), v) + ' = ' + tex(mul(P(a, 0), P(1, b)), v)) + '.', T('-' + tex(P(c, 0), v) + br(P(1, d), v) + ' = ' + tex(scale(mul(P(c, 0), P(1, d)), -1), v)) + '.', T((e > 0 ? '' : '-') + Math.abs(e) + br(P(1, f), v) + ' = ' + tex(scale(P(1, f), e), v)) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // the error in a subtraction (L1 / L7)
      var v = 'x', p = P(nz(2, 6), nz(-7, 7), nz(-8, 8)), q = P(nz(1, 5), nz(-6, 6), nz(-8, 8)), right = sub(p, q), wrongA = add(p, P(-q[2], q[1], q[0])); // only the first term's sign changed
      if (tex(wrongA, v) === tex(right, v)) return A_MAS[3]();
      var opts = shuffle(['The student changed the sign of only the first term in the second bracket', 'The student added the ' + T('x^{2}') + ' coefficients instead of subtracting them', 'The student combined ' + T('x^{2}') + ' and ' + T('x') + ' terms, which are not like terms', 'There is no error']);
      var o = mc(opts, opts.indexOf('The student changed the sign of only the first term in the second bracket'));
      return { prompt: 'A student wrote:<br>' + T(br(p, v) + '-' + br(q, v) + ' = ' + tex(wrongA, v)) + '<br>Which statement describes the error?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Do the subtraction yourself: every term in the second bracket changes sign. Compare with the student\'s answer term by term.',
        solution: steps(['Correct: ' + T(tex(p, v) + (q[2] > 0 ? '' : '+') + tex(scale(q, -1), v) + ' = ' + tex(right, v)) + '.', 'The student\'s ' + T('x^{2}') + ' term is right but the ' + T('x') + ' and constant terms are not: only the first sign was changed. Answer: ' + o.letter + '.']) };
    }
  ];

  var B_BEG = [
    function () { // FOIL (x + a)(x + b), small numbers (L3)
      var v = pick(V), a = nz(-7, 9), b = nz(-7, 9), r = mul(P(1, a), P(1, b));
      return { prompt: 'Expand and simplify: ' + T(br(P(1, a), v) + br(P(1, b), v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'FOIL: First, Outside, Inside, Last. Then collect the two middle terms.',
        solution: steps(['First ' + T(v + '\\cdot ' + v + ' = ' + v + '^{2}') + ', Outside ' + T(tex(P(b, 0), v)) + ', Inside ' + T(tex(P(a, 0), v)) + ', Last ' + T(a * b) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // difference of squares (x + a)(x - a) (L4)
      var v = pick(V), a = ri(2, 11), c = Math.random() < 0.3 ? ri(2, 3) : 1, r = mul(P(c, a), P(c, -a));
      return { prompt: 'Expand: ' + T(br(P(c, a), v) + br(P(c, -a), v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'The middle terms cancel: ' + T('(a + b)(a - b) = a^{2} - b^{2}') + '.',
        solution: steps(['Outside and Inside cancel: ' + T(tex(P(-c * a, 0), v) + '+' + tex(P(c * a, 0), v) + ' = 0') + '.', T(br(P(c, a), v) + br(P(c, -a), v) + ' = ' + tex(r, v)) + '.']) };
    },
    function () { // which special-product pattern (L4 Example 5, no expanding)
      var v = 'x', a = ri(2, 9), kind = pick(['dos', 'sq', 'sq2', 'none']), expr;
      if (kind === 'dos') expr = '(x+' + a + ')(x-' + a + ')';
      else if (kind === 'sq') expr = '(x' + pick(['+', '-']) + a + ')^{2}';
      else if (kind === 'sq2') expr = '(x-' + a + ')(x-' + a + ')';
      else { var b = a + ri(1, 3); expr = '(x+' + a + ')(x-' + b + ')'; }
      var opts = ['a difference of squares', 'a perfect square', 'neither'], right = kind === 'dos' ? 0 : kind === 'none' ? 2 : 1, o = mc(opts, right);
      return { prompt: 'Without expanding, which special product is ' + T(expr) + '?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Same two terms with opposite signs between them: a difference of squares. The same binomial twice (or squared): a perfect square. Different numbers: neither.',
        solution: steps([kind === 'dos' ? 'The brackets have the same terms with opposite signs, so the product is a difference of squares.' : kind === 'none' ? 'The numbers in the brackets are different, so it is neither special product.' : 'The same binomial is multiplied by itself, so it is a perfect square.', 'Answer: ' + o.letter + '.']) };
    },
    function () { // the area of a rectangle with expression sides (L6, simple)
      var a = ri(1, 9), b = ri(1, 9), r = mul(P(1, a), P(1, b));
      return { prompt: 'A rectangular block of quarry stone has length ' + T('(x+' + a + ')') + ' and width ' + T('(x+' + b + ')') + '. Write a simplified expression for the <b>area</b> of its face.', type: 'expr', answers: [tex(r)], check: 'exact',
        hint: 'Area = length × width. Multiply the two binomials (FOIL) and collect.',
        solution: steps([T('(x+' + a + ')(x+' + b + ') = x^{2}+' + b + 'x+' + a + 'x+' + a * b) + '.', T('= ' + tex(r)) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // binomials with coefficients and negatives (L3)
      var v = pick(V), p = P(nz(2, 4), nz(-7, 7)), q = P(nz(1, 3), nz(-7, 7)), r = mul(p, q);
      return { prompt: 'Expand and simplify: ' + T(br(p, v) + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'FOIL, keeping each sign with its term. Then collect the middle terms.',
        solution: steps(['F ' + T(tex(P(p[1] * q[1], 0, 0), v)) + ', O ' + T(tex(P(p[1] * q[0], 0), v)) + ', I ' + T(tex(P(p[0] * q[1], 0), v)) + ', L ' + T(p[0] * q[0]) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // perfect squares (x - 7)^2, (2x - 3)^2 (L4)
      var v = pick(V), c = pick([1, 1, 2, 3]), a = nz(-9, 9), p = P(c, a), r = mul(p, p);
      return { prompt: 'Expand: ' + T(br(p, v) + '^{2}'), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Squaring a binomial means multiplying it by itself: ' + T(br(p, v) + br(p, v)) + '. There are THREE terms in the answer; do not forget the middle one.',
        solution: steps([T(br(p, v) + '^{2} = ' + br(p, v) + br(p, v)) + '.', 'First ' + T(tex(P(c * c, 0, 0), v)) + ', middle ' + T(tex(P(2 * c * a, 0), v)) + ' (twice), last ' + T(a * a) + '.', T('= ' + tex(r, v)) + '.']) };
    },
    function () { // binomial times trinomial (L5)
      var v = pick(V), p = P(1, nz(-5, 5)), q = P(1, nz(-5, 5), nz(-6, 6)), r = mul(p, q);
      return { prompt: 'Expand and simplify: ' + T(br(p, v) + br(q, v)), type: 'expr', answers: [tex(r, v)], check: 'exact',
        hint: 'Multiply each term of the binomial by each of the three terms of the trinomial (six products, or use a grid). Then collect like terms.',
        solution: steps([T(v + br(q, v) + ' = ' + tex(mul(P(1, 0), q), v)) + ' and ' + T((p[0] < 0 ? '-' : '') + Math.abs(p[0]) + br(q, v) + ' = ' + tex(scale(q, p[0]), v)) + '.', 'Collect: ' + T(tex(r, v)) + '.']) };
    },
    function () { // area of a rectangle, then its value for a given x (L6)
      var a = ri(1, 6), b = ri(-4, 6) || 2, c = pick([2, 3]), r = mul(P(c, a), P(1, b)), x = ri(3, 8), val = r[2] * x * x + r[1] * x + r[0];
      if (x + b <= 0) return B_PRG[3]();
      return { prompt: 'A slab of stone is ' + T('(' + tex(P(c, a)) + ')') + ' cm long and ' + T('(' + tex(P(1, b)) + ')') + ' cm wide. Expand to find an expression for its area, then find the area when ' + T('x = ' + x) + '. Type the area in square centimetres.', type: 'num', answers: [String(val)], tol: 0,
        hint: 'Area = ' + T('(' + tex(P(c, a)) + ')(' + tex(P(1, b)) + ') = ' + tex(r)) + '. Now put ' + T(x) + ' in for every ' + T('x') + '.',
        solution: steps(['Area ' + T('= ' + tex(r)) + '.', 'At ' + T('x = ' + x) + ': ' + T(r[2] + '(' + x + ')^{2}' + (r[1] < 0 ? '-' : '+') + Math.abs(r[1]) + '(' + x + ')' + (r[0] < 0 ? '-' : '+') + Math.abs(r[0]) + ' = ' + val) + ' square centimetres.']) };
    },
    function () { // area with a square cut from a corner: big - small (L6)
      var a = ri(3, 9), b = ri(2, 8), s = ri(1, 3), big = mul(P(1, a), P(1, b)), small = P(s * s), r = sub(big, small);
      return { prompt: 'A rectangular courtyard measures ' + T('(x+' + a + ')') + ' by ' + T('(x+' + b + ')') + ' metres. A square well ' + T(s) + ' metre' + (s > 1 ? 's' : '') + ' on each side is cut from one corner. Write a simplified expression for the area that is left.', type: 'expr', answers: [tex(r)], check: 'exact',
        hint: 'Area left = big rectangle − small square. Expand the rectangle first.',
        solution: steps(['Rectangle: ' + T('(x+' + a + ')(x+' + b + ') = ' + tex(big)) + '. Square: ' + T(s + '^{2} = ' + s * s) + '.', 'Left: ' + T(tex(big) + '-' + s * s + ' = ' + tex(r)) + '.']) };
    }
  ];

  var B_MAS = [
    function () { // 2(x + 3)(x - 1) - (x - 2)^2  (L5 Part C)
      var k = pick([2, 3, -2]), a = nz(-5, 5), b = nz(-5, 5), c = nz(-6, 6);
      var r = sub(scale(mul(P(1, a), P(1, b)), k), mul(P(1, c), P(1, c)));
      return { prompt: 'Expand and simplify: ' + T(k + br(P(1, a)) + br(P(1, b)) + '-' + br(P(1, c)) + '^{2}'), type: 'expr', answers: [tex(r)], check: 'exact',
        hint: 'Expand each product first (keep the second one in brackets so the minus sign reaches every term), multiply the first by ' + k + ', then subtract and collect.',
        solution: steps([T(br(P(1, a)) + br(P(1, b)) + ' = ' + tex(mul(P(1, a), P(1, b)))) + ', times ' + k + ': ' + T(tex(scale(mul(P(1, a), P(1, b)), k))) + '.', T(br(P(1, c)) + '^{2} = ' + tex(mul(P(1, c), P(1, c)))) + '.', T(tex(scale(mul(P(1, a), P(1, b)), k)) + '-(' + tex(mul(P(1, c), P(1, c))) + ') = ' + tex(r)) + '.']) };
    },
    function () { // a box's volume with three expression edges (L6 Example 4)
      var a = ri(1, 4), b = ri(2, 6), r = mul(mul(P(1, 0), P(1, a)), P(1, b));
      return { prompt: 'A stone crate has edges ' + T('x') + ', ' + T('(x+' + a + ')') + ' and ' + T('(x+' + b + ')') + ' metres. Write a simplified expression for its <b>volume</b>.', type: 'expr', answers: [tex(r)], check: 'exact',
        hint: 'Volume = length × width × height. Multiply two of the factors first, then multiply that result by the third.',
        solution: steps([T('(x+' + a + ')(x+' + b + ') = ' + tex(mul(P(1, a), P(1, b)))) + '.', T('x(' + tex(mul(P(1, a), P(1, b))) + ') = ' + tex(r)) + '.']) };
    },
    function () { // missing term: (x + a)(x - b) = x^2 + kx - c, find a or k (EP 3 #15, #17)
      var a = nz(2, 9), b = nz(2, 9), r = mul(P(1, a), P(1, -b)), findA = Math.random() < 0.5;
      if (r[1] === 0) return B_MAS[2]();
      if (findA) return { prompt: 'Find the value of ' + T('a') + ':<br>' + T('(x+a)(x-' + b + ') = ' + tex(r)), type: 'num', answers: [String(a)], tol: 0,
        hint: 'The last terms multiply to make the constant: ' + T('a\\times(-' + b + ') = -' + a * b) + '.',
        solution: steps([T('a\\times(-' + b + ') = -' + a * b) + ', so ' + T('a = ' + a) + '.', 'Check the middle: ' + T(a + 'x - ' + b + 'x = ' + tex(P(r[1], 0))) + '.']) };
      return { prompt: 'Find the value of ' + T('k') + ':<br>' + T('(x+' + a + ')(x-' + b + ') = x^{2}+kx-' + a * b), type: 'num', answers: [String(r[1])], tol: 0,
        hint: 'The middle term comes from Outside + Inside: ' + T('-' + b + 'x + ' + a + 'x') + '.',
        solution: steps([T('-' + b + 'x + ' + a + 'x = ' + tex(P(r[1], 0))) + ', so ' + T('k = ' + r[1]) + '.']) };
    },
    function () { // k so (x + k)(x - c) has no x-term (EP 3 #18)
      var c = ri(2, 12);
      return { prompt: 'What value of ' + T('k') + ' makes ' + T('(x+k)(x-' + c + ')') + ' have <b>no ' + T('x') + '-term</b> when it is expanded?', type: 'num', answers: [String(c)], tol: 0,
        hint: 'Expand with ' + T('k') + ' in it: the ' + T('x') + '-terms are ' + T('-' + c + 'x + kx') + '. They cancel when they add to 0.',
        solution: steps([T('(x+k)(x-' + c + ') = x^{2} - ' + c + 'x + kx - ' + c + 'k') + '.', T('-' + c + 'x + kx = 0') + ' when ' + T('k = ' + c) + ' (a difference of squares).']) };
    },
    function () { // binomial x trinomial minus a trinomial (L5 Part C)
      var a = nz(-4, 4), q = P(1, nz(-4, 4), nz(-5, 5)), t = P(1, nz(-6, 6), nz(-7, 7)), r = sub(mul(P(1, a), q), t);
      return { prompt: 'Expand and simplify: ' + T(br(P(1, a)) + br(q) + '-' + br(t)), type: 'expr', answers: [tex(r)], check: 'exact',
        hint: 'Expand the product first (six products), then subtract every term of the last bracket, then collect.',
        solution: steps([T(br(P(1, a)) + br(q) + ' = ' + tex(mul(P(1, a), q))) + '.', 'Subtract: ' + T(tex(mul(P(1, a), q)) + '-(' + tex(t) + ') = ' + tex(r)) + '.']) };
    }
  ];

  var G = QGen.GENS;
  G.AN4A_BEG = A_BEG; G.AN4A_PRG = A_PRG; G.AN4A_MAS = A_MAS;
  G.AN4B_BEG = B_BEG; G.AN4B_PRG = B_PRG; G.AN4B_MAS = B_MAS;
})();
