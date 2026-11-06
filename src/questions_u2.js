/* ===================== LAND 2 · THE SALT WASTES · Math 15 Unit 2 · EXPONENTS (AN3) =====================
 * Registered into QGen.GENS as AN3L_* (exponent laws, zero and negative exponents) and AN3R_* (scientific notation,
 * rational exponents and radical form). Pitched like Ryan's Math 15 Unit 2 test (math15 js/lessons/u2test.js):
 *   BEG  one law at a time, as first taught (L1-L3, L5, L6, L8, L9);
 *   PRG  the typical assignment question: two laws with coefficients, negative exponents answered with positive ones,
 *        scientific notation products and "how many fit", 8^{2/3}, x^{3/4} <-> radical form;
 *   MAS  Math 15's hardest items: three-step simplifications, a missing exponent, the error in a worked solution,
 *        a rational exponent of a fraction or a negative base.
 * A handheld calculator is allowed in the game, so items ask for forms and laws, not just a number a calculator gives.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function pw(base, e) { return e === 1 ? base : base + '^{' + e + '}'; }
  function mono(c, vars) { // c * x^a y^b -> LaTeX
    var s = c === 1 ? '' : c === -1 ? '-' : String(c);
    vars.forEach(function (v) { if (v[1] !== 0) s += pw(v[0], v[1]); });
    if (s === '') s = '1'; if (s === '-') s = '-1';
    return s;
  }
  function frac(n, d) { var g = gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function rat(p, q) { q = q || 1; var g = gcd(p, q) || 1; p /= g; q /= g; if (q < 0) { p = -p; q = -q; } return [p, q]; }
  /* positive-exponent form of (cn/cd)·Π v^e ; every acceptable spelling */
  function posForm(cn, cd, vars) {
    var r = rat(cn, cd), sign = r[0] < 0 ? '-' : '', n = Math.abs(r[0]), d = r[1], top = '', bot = '';
    vars.forEach(function (v) { if (v[1] > 0) top += pw(v[0], v[1]); else if (v[1] < 0) bot += pw(v[0], -v[1]); });
    var topS = (n === 1 && top ? '' : String(n)) + top, botS = (d === 1 ? '' : String(d)) + bot;
    if (!botS) return [sign + topS];
    var out = [sign + '\\frac{' + topS + '}{' + botS + '}'];
    if (!bot && top && d > 1) out.push(sign + '\\frac{' + n + '}{' + d + '}' + top);
    return out;
  }
  var VARS = ['x', 'y', 'm', 'a', 'k', 'n', 'p', 't'];
  var MCNOTE = 'Type the letter of your choice.';
  function letters(L) { return [L, L.toLowerCase()]; }
  function mc(opts, right) { var L = ['A', 'B', 'C', 'D']; return { html: '<div class="mc-opts">' + opts.map(function (o, i) { return '<div><b>' + L[i] + '.</b> ' + o + '</div>'; }).join('') + '</div>', letter: L[right] }; }
  var POSNOTE = 'Use positive exponents only in your answer.';

  /* ---------- AN3 · the exponent laws, zero and negative exponents ---------- */
  var L_BEG = [
    function () { // product law with coefficients: 3x^4 · 5x^2 (L1)
      var c1 = ri(2, 6), c2 = ri(2, 6), a = ri(2, 6), b = ri(2, 6), v = pick(VARS);
      return { prompt: 'Simplify: ' + T('(' + mono(c1, [[v, a]]) + ')(' + mono(c2, [[v, b]]) + ')'), type: 'expr', answers: [mono(c1 * c2, [[v, a + b]])], check: 'exact',
        hint: 'Multiply the numbers in front. For the same base, keep the base and ADD the exponents.',
        solution: steps([T(c1 + '\\times' + c2 + ' = ' + c1 * c2) + '.', T(pw(v, a) + '\\cdot ' + pw(v, b) + ' = ' + v + '^{' + a + '+' + b + '} = ' + pw(v, a + b)) + '.', 'Answer: ' + T(mono(c1 * c2, [[v, a + b]])) + '.']) };
    },
    function () { // quotient law with coefficients: 15x^7 ÷ 3x^2 (L2)
      var c2 = ri(2, 6), k = ri(2, 6), b = ri(2, 5), a = b + ri(1, 6), v = pick(VARS), c1 = c2 * k;
      return { prompt: 'Simplify: ' + T('\\dfrac{' + mono(c1, [[v, a]]) + '}{' + mono(c2, [[v, b]]) + '}'), type: 'expr', answers: [mono(k, [[v, a - b]])], check: 'exact',
        hint: 'Divide the numbers in front. For the same base, keep the base and SUBTRACT the exponents (top minus bottom).',
        solution: steps([T(c1 + '\\div' + c2 + ' = ' + k) + '.', T(v + '^{' + a + '-' + b + '} = ' + pw(v, a - b)) + '.', 'Answer: ' + T(mono(k, [[v, a - b]])) + '.']) };
    },
    function () { // power of a power, or power of a product/quotient (L2-L3)
      var v = pick(VARS), kind = ri(0, 2);
      if (kind === 0) { var a = ri(2, 6), b = ri(2, 5);
        return { prompt: 'Simplify: ' + T('\\left(' + pw(v, a) + '\\right)^{' + b + '}'), type: 'expr', answers: [pw(v, a * b)], check: 'exact',
          hint: 'A power of a power: keep the base and MULTIPLY the exponents.',
          solution: steps([T('\\left(' + pw(v, a) + '\\right)^{' + b + '} = ' + v + '^{' + a + '\\times' + b + '} = ' + pw(v, a * b)) + '.']) }; }
      if (kind === 1) { var c = pick([2, 3, 4, 5, -2, -3]), e = c === 4 || c === 5 ? 2 : pick([2, 3]), p = ri(1, 3), ans = mono(Math.pow(c, e), [[v, p * e]]);
        return { prompt: 'Simplify: ' + T('\\left(' + mono(c, [[v, p]]) + '\\right)^{' + e + '}'), type: 'expr', answers: [ans], check: 'exact',
          hint: 'The exponent outside the brackets applies to EVERYTHING inside: the number' + (c < 0 ? ' (with its negative sign)' : '') + ' and the variable.',
          solution: steps([T('\\left(' + mono(c, [[v, p]]) + '\\right)^{' + e + '} = (' + c + ')^{' + e + '}\\cdot ' + v + '^{' + p + '\\times' + e + '}') + '.', T('(' + c + ')^{' + e + '} = ' + Math.pow(c, e)) + ', so the answer is ' + T(ans) + '.']) }; }
      var d = pick([2, 3, 4, 5]), e2 = 2, q = ri(1, 3), dd = Math.pow(d, e2);
      return { prompt: 'Simplify: ' + T('\\left(\\dfrac{' + pw(v, q) + '}{' + d + '}\\right)^{' + e2 + '}'), type: 'expr', answers: ['\\frac{' + pw(v, q * e2) + '}{' + dd + '}', '\\frac{1}{' + dd + '}' + pw(v, q * e2)], check: 'exact',
        hint: 'The exponent outside applies to the top AND the bottom of the fraction.',
        solution: steps([T('\\left(\\dfrac{' + pw(v, q) + '}{' + d + '}\\right)^{2} = \\dfrac{\\left(' + pw(v, q) + '\\right)^{2}}{' + d + '^{2}} = \\dfrac{' + pw(v, q * e2) + '}{' + dd + '}') + '.']) };
    },
    function () { // brackets and the minus sign: (-7)^2 vs -7^2 (L1); value or base
      var b = ri(2, 9), e = pick([2, 3, 4]); if (b > 5 && e > 2) e = 2;
      var kind = pick(['in', 'out', 'base']);
      if (kind === 'base') { var inside = Math.random() < 0.5, expr = inside ? '(-' + b + ')^{' + e + '}' : '-' + b + '^{' + e + '}';
        return { prompt: 'What is the <b>base</b> of ' + T(expr) + '?', type: 'num', answers: [String(inside ? -b : b)], tol: 0,
          hint: 'The base is what the exponent touches. Brackets make the negative sign part of the base; without brackets the exponent touches only the number.',
          solution: steps([inside ? 'The brackets hold ' + T('-' + b) + ', so the base is ' + T('-' + b) + '.' : 'There are no brackets, so the exponent touches only ' + T(b) + '; the base is ' + T(b) + ' and the minus sign is applied afterwards.']) }; }
      var val = kind === 'in' ? Math.pow(-b, e) : -Math.pow(b, e), ex = kind === 'in' ? '(-' + b + ')^{' + e + '}' : '-' + b + '^{' + e + '}';
      return { prompt: 'Evaluate: ' + T(ex), type: 'num', answers: [String(val)], tol: 0,
        hint: kind === 'in' ? 'The negative sign is inside the brackets, so it is multiplied ' + e + ' times.' : 'No brackets: work out ' + T(b + '^{' + e + '}') + ' first, then put the negative sign in front.',
        solution: steps([kind === 'in' ? T('(-' + b + ')^{' + e + '} = ' + Array(e + 1).join('(-' + b + ')').replace(/\)\(/g, ')\\times(') + ' = ' + val) + '.' : T('-' + b + '^{' + e + '} = -(' + Array(e + 1).join(b + '\\times').slice(0, -6) + ') = ' + val) + '.']) };
    },
    function () { // zero exponents: 9g^0 vs (9g)^0, -7^0 vs (-7)^0 (L5)
      var c = ri(2, 12), v = pick(VARS), kind = ri(0, 3), ex, ans, why;
      if (kind === 0) { ex = c + v + '^{0}'; ans = c; why = 'Only ' + T(v) + ' has the exponent 0, so ' + T(v + '^{0} = 1') + ' and the answer is ' + T(c + '\\times 1 = ' + c) + '.'; }
      else if (kind === 1) { ex = '(' + c + v + ')^{0}'; ans = 1; why = 'The whole bracket is raised to the power 0, so it equals ' + T(1) + '.'; }
      else if (kind === 2) { ex = '-' + c + '^{0}'; ans = -1; why = 'No brackets: ' + T(c + '^{0} = 1') + ', then the negative sign: ' + T(-1) + '.'; }
      else { ex = '(-' + c + ')^{0}'; ans = 1; why = 'The bracket ' + T('(-' + c + ')') + ' is the base, and any non-zero base to the power 0 is ' + T(1) + '.'; }
      return { prompt: 'Evaluate: ' + T(ex) + (kind < 2 ? ' (assume ' + T(v + '\\neq 0') + ')' : ''), type: 'num', answers: [String(ans)], tol: 0,
        hint: 'Anything (except 0) to the power 0 is 1. But check what the exponent 0 actually touches: brackets decide.',
        solution: steps([why]) };
    },
    function () { // negative exponents: 6^{-2}, 4x^{-3}, 6/y^{-2} (L6)
      var kind = ri(0, 2), v = pick(VARS);
      if (kind === 0) { var b = ri(2, 6), e = b > 4 ? 2 : pick([2, 3]), d = Math.pow(b, e);
        return { prompt: 'Write ' + T(b + '^{-' + e + '}') + ' as a fraction.', type: 'expr', answers: ['\\frac{1}{' + d + '}'], check: 'exact',
          hint: 'A negative exponent means "one over": ' + T('a^{-n} = \\dfrac{1}{a^{n}}') + '. It never makes the number negative.',
          solution: steps([T(b + '^{-' + e + '} = \\dfrac{1}{' + b + '^{' + e + '}} = \\dfrac{1}{' + d + '}') + '.']) }; }
      if (kind === 1) { var c = ri(2, 9), p = ri(2, 6);
        return { prompt: 'Simplify. ' + POSNOTE + '<br>' + T(c + pw(v, -p)), type: 'expr', answers: ['\\frac{' + c + '}{' + pw(v, p) + '}'], check: 'exact',
          hint: 'Only ' + T(v) + ' has the negative exponent, so only ' + T(pw(v, p)) + ' moves to the bottom. The ' + c + ' stays on top.',
          solution: steps([T(c + pw(v, -p) + ' = ' + c + '\\cdot\\dfrac{1}{' + pw(v, p) + '} = \\dfrac{' + c + '}{' + pw(v, p) + '}') + '.']) }; }
      var c2 = ri(2, 9), p2 = ri(2, 5);
      return { prompt: 'Simplify. ' + POSNOTE + '<br>' + T('\\dfrac{' + c2 + '}{' + pw(v, -p2) + '}'), type: 'expr', answers: [c2 + pw(v, p2)], check: 'exact',
        hint: 'A power with a negative exponent in the denominator moves to the numerator, and its exponent becomes positive.',
        solution: steps([T('\\dfrac{1}{' + pw(v, -p2) + '} = ' + pw(v, p2)) + ', so ' + T('\\dfrac{' + c2 + '}{' + pw(v, -p2) + '} = ' + c2 + pw(v, p2)) + '.']) };
    }
  ];

  var L_PRG = [
    function () { // (3a^3)^2 · 2a^2 (L4)
      var c = pick([2, 3, 4, -2, -3]), e = c === 4 ? 2 : pick([2, 3]), a = ri(1, 4), c2 = ri(2, 5), b = ri(1, 4), v = pick(VARS);
      var C = Math.pow(c, e) * c2, E = a * e + b;
      return { prompt: 'Simplify: ' + T('\\left(' + mono(c, [[v, a]]) + '\\right)^{' + e + '}\\left(' + mono(c2, [[v, b]]) + '\\right)'), type: 'expr', answers: [mono(C, [[v, E]])], check: 'exact',
        hint: 'Do the bracket first (power of a product), then multiply: multiply the numbers, add the exponents.',
        solution: steps([T('\\left(' + mono(c, [[v, a]]) + '\\right)^{' + e + '} = ' + mono(Math.pow(c, e), [[v, a * e]])) + '.', T(mono(Math.pow(c, e), [[v, a * e]]) + '\\cdot ' + mono(c2, [[v, b]]) + ' = ' + mono(C, [[v, E]])) + '.']) };
    },
    function () { // (4x^3)^2 / (2x^4) (L4)
      var c = pick([2, 3, 4, 6]), a = ri(2, 4), e = 2, d = pick([2, 3, 4]).valueOf(), b = ri(1, a * e - 1), v = pick(VARS);
      var top = c * c; if (top % d) d = pick([1, 2].filter(function (x) { return top % x === 0; })) || 1; if (d === 1) d = 2; if (top % d) return L_PRG[1]();
      var C = top / d, E = a * e - b;
      return { prompt: 'Simplify: ' + T('\\dfrac{\\left(' + mono(c, [[v, a]]) + '\\right)^{2}}{' + mono(d, [[v, b]]) + '}'), type: 'expr', answers: [mono(C, [[v, E]])], check: 'exact',
        hint: 'Square the bracket first (both the number and the power), then divide: divide the numbers, subtract the exponents.',
        solution: steps([T('\\left(' + mono(c, [[v, a]]) + '\\right)^{2} = ' + mono(top, [[v, a * e]])) + '.', T('\\dfrac{' + mono(top, [[v, a * e]]) + '}{' + mono(d, [[v, b]]) + '} = ' + mono(C, [[v, E]])) + '.']) };
    },
    function () { // two bases: (2x^2y)^3 · (xy^2) or quotient (L4)
      var c = pick([2, 3, -2]), e = pick([2, 3]), a = ri(1, 3), b = ri(1, 2), a2 = ri(1, 3), b2 = ri(1, 3);
      var C = Math.pow(c, e), A = a * e + a2, B = b * e + b2;
      return { prompt: 'Simplify: ' + T('\\left(' + mono(c, [['x', a], ['y', b]]) + '\\right)^{' + e + '}\\left(' + mono(1, [['x', a2], ['y', b2]]) + '\\right)'), type: 'expr', answers: [mono(C, [['x', A], ['y', B]])], check: 'exact',
        hint: 'Raise every factor in the bracket to the power ' + e + ' first. Then add exponents of x with x, and y with y.',
        solution: steps([T('\\left(' + mono(c, [['x', a], ['y', b]]) + '\\right)^{' + e + '} = ' + mono(C, [['x', a * e], ['y', b * e]])) + '.', 'Multiply: ' + T('x^{' + a * e + '+' + a2 + '}y^{' + b * e + '+' + b2 + '} = ' + mono(C, [['x', A], ['y', B]])) + '.']) };
    },
    function () { // negative exponents in a quotient, answer with positive exponents (L6-L7)
      var k = ri(2, 6), c2 = ri(2, 4), c1 = k * c2, a1 = ri(-3, 2), a2 = ri(2, 5), b1 = ri(3, 6), b2 = ri(1, 2);
      if (a1 === 0) a1 = -2;
      var A = a1 - a2, B = b1 - b2; // A < 0, B > 0
      var ans = posForm(k, 1, [['x', A], ['y', B]]);
      return { prompt: 'Simplify. ' + POSNOTE + '<br>' + T('\\dfrac{' + mono(c1, [['x', a1], ['y', b1]]) + '}{' + mono(c2, [['x', a2], ['y', b2]]) + '}'), type: 'expr', answers: ans, check: 'exact',
        hint: 'Divide the numbers, then subtract exponents base by base (top minus bottom). Any base left with a negative exponent moves to the bottom.',
        solution: steps([T(c1 + '\\div' + c2 + ' = ' + k) + ', ' + T('x^{' + a1 + '-' + a2 + '} = x^{' + A + '}') + ', ' + T('y^{' + b1 + '-' + b2 + '} = y^{' + B + '}') + '.', T('x^{' + A + '} = \\dfrac{1}{x^{' + (-A) + '}}') + ', so the answer is ' + T(ans[0]) + '.']) };
    },
    function () { // numbers: (2/3)^{-2}, 2^{-3} + 2^0, 5^{-2}·5^4/5^0 (L6-L7)
      var kind = ri(0, 2);
      if (kind === 0) { var p = ri(1, 4), q = ri(2, 5); if (gcd(p, q) !== 1 || p === q) return L_PRG[4](); var e = pick([2, 2, 3]); if (e === 3 && q > 3) e = 2;
        var ans = frac(Math.pow(q, e), Math.pow(p, e));
        return { prompt: 'Evaluate. Give an exact answer (a whole number or a fraction).<br>' + T('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + e + '}'), type: 'expr', answers: [ans], check: 'exact',
          hint: 'A negative exponent on a fraction flips the fraction. Then raise the top and the bottom to the positive power.',
          solution: steps([T('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + e + '} = \\left(\\dfrac{' + q + '}{' + p + '}\\right)^{' + e + '} = ' + ans) + '.']) }; }
      if (kind === 1) { var b = pick([2, 3, 4, 5]), e2 = b === 2 ? pick([2, 3]) : 2, d = Math.pow(b, e2), ans2 = frac(1 + d, d);
        return { prompt: 'Evaluate. Give an exact answer (a fraction).<br>' + T(b + '^{-' + e2 + '} + ' + b + '^{0}'), type: 'expr', answers: [ans2], check: 'exact',
          hint: T(b + '^{-' + e2 + '} = \\dfrac{1}{' + d + '}') + ' and anything to the power 0 is 1. Then add.',
          solution: steps([T(b + '^{-' + e2 + '} = \\dfrac{1}{' + d + '}') + ' and ' + T(b + '^{0} = 1') + '.', T('\\dfrac{1}{' + d + '} + 1 = \\dfrac{1}{' + d + '} + \\dfrac{' + d + '}{' + d + '} = ' + ans2) + '.']) }; }
      var bb = pick([2, 3, 5]), m = ri(-3, -1), n2 = ri(3, 5), z = Math.random() < 0.5, E = m + n2, val = Math.pow(bb, E);
      return { prompt: 'Evaluate: ' + T(z ? '\\dfrac{' + bb + '^{' + m + '}\\cdot ' + bb + '^{' + n2 + '}}{' + bb + '^{0}}' : bb + '^{' + m + '}\\cdot ' + bb + '^{' + n2 + '}'), type: 'num', answers: [String(val)], tol: 0,
        hint: 'Same base: add the exponents on top' + (z ? ', and the bottom is ' + T(bb + '^{0} = 1') : '') + '. Then work out the power.',
        solution: steps([T(bb + '^{' + m + '+' + n2 + '} = ' + bb + '^{' + E + '} = ' + val) + '.']) };
    },
    function () { // product with a negative exponent: (3x^4)(2x^{-6}) -> 6/x^2 (L7)
      var c1 = ri(2, 5), c2 = ri(2, 5), a = ri(2, 5), b = -(a + ri(1, 4)), v = pick(VARS), E = a + b;
      return { prompt: 'Simplify. ' + POSNOTE + '<br>' + T('\\left(' + mono(c1, [[v, a]]) + '\\right)\\left(' + mono(c2, [[v, b]]) + '\\right)'), type: 'expr', answers: posForm(c1 * c2, 1, [[v, E]]), check: 'exact',
        hint: 'Multiply the numbers and add the exponents (watch the negative). A negative result means the power goes to the bottom.',
        solution: steps([T(c1 + '\\times' + c2 + ' = ' + c1 * c2) + ' and ' + T(v + '^{' + a + '+(' + b + ')} = ' + v + '^{' + E + '}') + '.', T(c1 * c2 + v + '^{' + E + '} = ' + posForm(c1 * c2, 1, [[v, E]])[0]) + '.']) };
    }
  ];

  var L_MAS = [
    function () { // three-step simplification with zero and negative exponents (L7 #9, #12-14)
      var c = pick([2, 3]), a = ri(2, 4), b = ri(1, 3), d = pick([c, c * c, 2 * c * c]), k = ri(1, 3), v = 'x', w = 'y';
      // (c x^a y^-b)^2 * (5xy)^0 / (d x^k y^2)  ->  x^(2a-k) y^(-2b-2)
      var A = 2 * a - k, B = -2 * b - 2;
      var ans = posForm(c * c, d, [[v, A], [w, B]]);
      return { prompt: 'Simplify. ' + POSNOTE + '<br>' + T('\\dfrac{\\left(' + mono(c, [[v, a], [w, -b]]) + '\\right)^{2}\\left(5' + v + w + '\\right)^{0}}{' + mono(d, [[v, k], [w, 2]]) + '}'), type: 'expr', answers: ans, check: 'exact',
        hint: 'Three steps: anything to the power 0 is 1; square every factor in the first bracket; then divide base by base and move negative exponents to the bottom.',
        solution: steps([T('\\left(5' + v + w + '\\right)^{0} = 1') + '.', T('\\left(' + mono(c, [[v, a], [w, -b]]) + '\\right)^{2} = ' + mono(d, [[v, 2 * a], [w, -2 * b]])) + '.', 'Divide: ' + T(c * c + '\\div' + d + ' = ' + frac(c * c, d)) + ', ' + T(v + '^{' + 2 * a + '-' + k + '} = ' + v + '^{' + A + '}') + ', ' + T(w + '^{' + (-2 * b) + '-2} = ' + w + '^{' + B + '}') + '.', 'Positive exponents: ' + T(ans[0]) + '.']) };
    },
    function () { // missing exponent (L1 #11, L2 #10-11, EP7 #14)
      var v = pick(['a', 'b', 'm', 'x']), kind = ri(0, 3), n = ri(2, 7), a, b, s, eq, work;
      if (kind === 0) { a = ri(2, 4); b = ri(1, 6); s = a * n + b; eq = '\\left(' + v + '^{n}\\right)^{' + a + '}\\cdot ' + pw(v, b) + ' = ' + pw(v, s); work = a + 'n + ' + b + ' = ' + s; }
      else if (kind === 1) { a = ri(2, 4); b = ri(1, 5); s = a * n - b; if (s < 1) return L_MAS[1](); eq = '\\dfrac{\\left(' + v + '^{n}\\right)^{' + a + '}}{' + pw(v, b) + '} = ' + pw(v, s); work = a + 'n - ' + b + ' = ' + s; }
      else if (kind === 2) { a = ri(2, 6); s = n - a; if (s === 0) return L_MAS[1](); eq = pw(v, -a) + '\\cdot ' + v + '^{n} = ' + pw(v, s); work = '-' + a + ' + n = ' + s; }
      else { a = ri(2, 6); b = ri(8, 14); s = b - n + a; eq = '\\dfrac{' + pw(v, b) + '\\cdot ' + pw(v, a) + '}{' + v + '^{n}} = ' + pw(v, s); work = b + ' + ' + a + ' - n = ' + s; }
      return { prompt: 'Find the value of ' + T('n') + '.<br>' + T(eq), type: 'num', answers: [String(n)], tol: 0,
        hint: 'Use the laws to write the left side as one power of ' + T(v) + ', with ' + T('n') + ' in the exponent. Then the exponents on both sides must be equal.',
        solution: steps(['The exponents must match: ' + T(work) + '.', T('n = ' + n) + '.']) };
    },
    function () { // the error in a worked solution (EP7 #12-13, L6 #11)
      var c = pick([2, 3]), a = ri(2, 4), b = ri(1, 3), e = 2, v = 'x';
      var right = mono(c * c, [[v, a * e - b]]), errs = [
        { line: mono(c, [[v, a * e]]), why: 'Line 1 did not square the ' + c + ' in the bracket' },
        { line: mono(c * c, [[v, a + e]]), why: 'Line 1 added the exponents ' + a + ' and 2 instead of multiplying' }];
      var er = pick(errs), lines = [T('\\left(' + mono(c, [[v, a]]) + '\\right)^{2}\\cdot ' + pw(v, -b) + ' = ' + er.line + '\\cdot ' + pw(v, -b)) + ' &nbsp;(line 1)',
        T('= ' + mono(er.line === mono(c, [[v, a * e]]) ? c : c * c, [[v, (er.line === mono(c, [[v, a * e]]) ? a * e : a + e) - b]])) + ' &nbsp;(line 2)'];
      var opts = shuffle([er.why, 'Line 2 should have subtracted ' + b + ' from the exponent, not added it', 'The ' + pw(v, -b) + ' should have been dropped because its exponent is negative', 'There is no error; the answer is correct']);
      var o = mc(opts, opts.indexOf(er.why));
      return { prompt: 'A student simplified ' + T('\\left(' + mono(c, [[v, a]]) + '\\right)^{2}\\cdot ' + pw(v, -b)) + ' like this:<br>' + lines.join('<br>') + '<br>Which statement describes the error?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Redo line 1 yourself: the exponent 2 outside the bracket applies to the number and to the power of ' + v + '.',
        solution: steps([er.why + '.', 'Correct work: ' + T('\\left(' + mono(c, [[v, a]]) + '\\right)^{2} = ' + mono(c * c, [[v, a * e]])) + ', then ' + T(mono(c * c, [[v, a * e]]) + '\\cdot ' + pw(v, -b) + ' = ' + right) + '. Answer: ' + o.letter + '.']) };
    },
    function () { // negative exponent on a fraction with variables (L7)
      var p = ri(2, 5), q = ri(2, 5); if (gcd(p, q) !== 1) return L_MAS[3]();
      var a = ri(1, 3), e = 2, v = pick(['x', 'm', 'a']);
      var ans = posForm(q * q, p * p, [[v, -a * e]]);
      return { prompt: 'Simplify. ' + POSNOTE + '<br>' + T('\\left(\\dfrac{' + mono(p, [[v, a]]) + '}{' + q + '}\\right)^{-2}'), type: 'expr', answers: ans, check: 'exact',
        hint: 'Flip the fraction to make the exponent positive. Then square every factor, top and bottom.',
        solution: steps([T('\\left(\\dfrac{' + mono(p, [[v, a]]) + '}{' + q + '}\\right)^{-2} = \\left(\\dfrac{' + q + '}{' + mono(p, [[v, a]]) + '}\\right)^{2}') + '.', T('= \\dfrac{' + q * q + '}{' + mono(p * p, [[v, 2 * a]]) + '}') + '.']) };
    }
  ];

  /* ---------- AN3 · scientific notation, rational exponents and radical form ---------- */
  function sci(m, e) { return m + '\\times10^{' + e + '}'; }
  function mstr(x) { return String(Math.round(x * 1e6) / 1e6); }
  function stdStr(m, e) { // standard notation as LaTeX (thin spaces in big numbers)
    var v = m * Math.pow(10, e), dp = Math.max(0, -e + 4), s = v.toFixed(dp);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); return parts.join('.');
  }
  function mant() { return pick([1.2, 1.5, 2.4, 3.6, 4.5, 5.2, 6.8, 7.25, 8.1, 9.3, 2, 3, 4.7, 6.05]); }
  var R_BEG = [
    function () { // standard -> scientific (L8)
      var m = mant(), e = pick([3, 4, 5, 6, 7, -2, -3, -4, -5]);
      return { prompt: 'Write ' + T(stdStr(m, e)) + ' in <b>scientific notation</b>.', type: 'expr', answers: [sci(mstr(m), e)], check: 'exact',
        hint: 'Move the decimal point so exactly one non-zero digit is in front of it. Count the places you moved: ' + (e > 0 ? 'a big number gets a positive power of 10.' : 'a small number (less than 1) gets a negative power of 10.'),
        solution: steps(['The number in front is ' + T(mstr(m)) + '.', 'The decimal point moved ' + Math.abs(e) + ' places ' + (e > 0 ? 'left, so the power is ' + T('10^{' + e + '}') : 'right, so the power is ' + T('10^{' + e + '}')) + '.', T(stdStr(m, e) + ' = ' + sci(mstr(m), e)) + '.']) };
    },
    function () { // scientific -> standard (L8)
      var m = mant(), e = pick([3, 4, 5, -2, -3, -4]), v = m * Math.pow(10, e);
      return { prompt: 'Write ' + T(sci(mstr(m), e)) + ' in <b>standard notation</b> (as an ordinary number).', type: 'num', answers: [String(Math.round(v * 1e9) / 1e9)], tol: 0,
        hint: e > 0 ? 'A positive power of 10: move the decimal point ' + e + ' places to the right (the number gets bigger).' : 'A negative power of 10: move the decimal point ' + (-e) + ' places to the left (the number gets smaller).',
        solution: steps([T(sci(mstr(m), e) + ' = ' + stdStr(m, e)) + '.']) };
    },
    function () { // unit fraction exponents as a number: 49^{1/2}, 27^{1/3}, 32^{1/5} (L9)
      var c = pick([[2, 49], [2, 64], [2, 81], [2, 121], [3, 27], [3, 64], [3, 125], [4, 16], [4, 81], [5, 32], [3, 8], [2, 144]]), r = Math.round(Math.pow(c[1], 1 / c[0]));
      return { prompt: 'Evaluate: ' + T(c[1] + '^{\\frac{1}{' + c[0] + '}}'), type: 'num', answers: [String(r)], tol: 0,
        hint: 'An exponent of ' + T('\\frac{1}{' + c[0] + '}') + ' means the ' + (c[0] === 2 ? 'square' : c[0] === 3 ? 'cube' : c[0] + 'th') + ' root.',
        solution: steps([T(c[1] + '^{\\frac{1}{' + c[0] + '}} = ' + (c[0] === 2 ? '\\sqrt{' : '\\sqrt[' + c[0] + ']{') + c[1] + '} = ' + r) + ', because ' + T(r + '^{' + c[0] + '} = ' + c[1]) + '.']) };
    },
    function () { // x^{1/5} <-> radical form (L9)
      var n = pick([2, 3, 4, 5]), v = pick(['x', 'y', 'a']), root = (n === 2 ? '\\sqrt{' : '\\sqrt[' + n + ']{') + v + '}';
      if (Math.random() < 0.5) return { prompt: 'Write ' + T(v + '^{\\frac{1}{' + n + '}}') + ' in <b>radical form</b>.', type: 'expr', answers: [root], check: 'exact',
        hint: 'The bottom of the fraction exponent is the index of the root.', solution: steps([T(v + '^{\\frac{1}{' + n + '}} = ' + root) + '.']) };
      return { prompt: 'Write ' + T(root) + ' as a power with a <b>rational exponent</b>.', type: 'expr', answers: [v + '^{\\frac{1}{' + n + '}}'], check: 'exact',
        hint: 'The index of the root becomes the bottom of the exponent.', solution: steps([T(root + ' = ' + v + '^{\\frac{1}{' + n + '}}') + '.']) };
    }
  ];

  var R_PRG = [
    function () { // scientific notation product (L10 Example 8a)
      var m1 = pick([2, 3, 4, 1.5, 2.5, 5]), m2 = pick([2, 3, 4, 4.5, 6, 1.2]), e1 = ri(2, 8), e2 = ri(2, 8);
      var p = m1 * m2, e = e1 + e2, adj = p >= 10, M = adj ? p / 10 : p, E = adj ? e + 1 : e;
      return { prompt: 'Multiply. Write the answer in <b>scientific notation</b>.<br>' + T('\\left(' + sci(m1, e1) + '\\right)\\left(' + sci(m2, e2) + '\\right)'), type: 'expr', answers: [sci(mstr(M), E)], check: 'exact',
        hint: 'Multiply the numbers in front, and add the exponents of the powers of 10.' + (adj ? ' If the number in front is 10 or more, adjust it.' : ''),
        solution: steps([T(m1 + '\\times' + m2 + ' = ' + mstr(p)) + ' and ' + T('10^{' + e1 + '}\\times10^{' + e2 + '} = 10^{' + e + '}') + '.', adj ? T(mstr(p) + '\\times10^{' + e + '} = ' + sci(mstr(M), E)) + ' (the number in front must be less than 10).' : 'Answer: ' + T(sci(mstr(M), E)) + '.']) };
    },
    function () { // "how many fit": division (L10 Example 8b / #20)
      var m2 = pick([2, 4, 5, 1.5, 2.5]), q = pick([2, 3, 4, 6, 8]), e2 = ri(2, 5), e = e2 + ri(2, 6), m1 = m2 * q;
      if (m1 >= 10) { m1 = m1 / 10; e += 1; }
      var M = m1 / m2, E = e - e2; while (M < 1) { M *= 10; E -= 1; }
      var things = pick([['grains of sand', 'a bucket that holds', 'a grain has a volume of', 'cubic millimetres'], ['salt crystals', 'a sack that holds', 'each crystal has a mass of', 'milligrams']]);
      return { prompt: 'In the Salt Wastes, ' + things[1] + ' ' + T(sci(mstr(m1), e)) + ' ' + things[3] + ' is filled with ' + things[0] + ', and ' + things[2] + ' ' + T(sci(mstr(m2), e2)) + ' ' + things[3] + '. How many ' + things[0] + ' fit? Write the answer in <b>scientific notation</b>.',
        type: 'expr', answers: [sci(mstr(M), E)], check: 'exact',
        hint: '"How many fit" means divide the big amount by the size of one. Divide the numbers in front, subtract the exponents.',
        solution: steps([T('\\dfrac{' + sci(mstr(m1), e) + '}{' + sci(mstr(m2), e2) + '} = \\dfrac{' + mstr(m1) + '}{' + mstr(m2) + '}\\times10^{' + e + '-' + e2 + '}') + '.', 'Answer: ' + T(sci(mstr(M), E)) + '.']) };
    },
    function () { // 8^{2/3}, 16^{3/4} (L9)
      var c = pick([[8, 3, 2], [27, 3, 2], [16, 4, 3], [4, 2, 3], [9, 2, 3], [32, 5, 2], [25, 2, 3], [64, 3, 2], [81, 4, 3], [125, 3, 2]]), r = Math.round(Math.pow(c[0], 1 / c[1])), val = Math.pow(r, c[2]);
      return { prompt: 'Evaluate: ' + T(c[0] + '^{\\frac{' + c[2] + '}{' + c[1] + '}}'), type: 'num', answers: [String(val)], tol: 0,
        hint: 'Take the root first (the bottom of the exponent), then the power (the top). Smaller numbers that way.',
        solution: steps([T(c[0] + '^{\\frac{' + c[2] + '}{' + c[1] + '}} = \\left(' + (c[1] === 2 ? '\\sqrt{' : '\\sqrt[' + c[1] + ']{') + c[0] + '}\\right)^{' + c[2] + '} = ' + r + '^{' + c[2] + '} = ' + val) + '.']) };
    },
    function () { // x^{3/4} <-> radical form (L9)
      var n = pick([3, 4, 5]), m = ri(2, n + 2); if (gcd(m, n) !== 1) return R_PRG[3]();
      var v = pick(['x', 'y', 'a']), root = '\\sqrt[' + n + ']{' + v + '^{' + m + '}}', root2 = '\\left(\\sqrt[' + n + ']{' + v + '}\\right)^{' + m + '}';
      if (Math.random() < 0.5) return { prompt: 'Write ' + T(v + '^{\\frac{' + m + '}{' + n + '}}') + ' in <b>radical form</b>.', type: 'expr', answers: [root, root2], check: 'exact',
        hint: 'Power over root: the top of the exponent is the power, the bottom is the index of the root.', solution: steps([T(v + '^{\\frac{' + m + '}{' + n + '}} = ' + root) + ' (or ' + T(root2) + ').']) };
      return { prompt: 'Write ' + T(root) + ' as a power with a <b>rational exponent</b>.', type: 'expr', answers: [v + '^{\\frac{' + m + '}{' + n + '}}'], check: 'exact',
        hint: 'The power inside becomes the top of the exponent; the index of the root becomes the bottom.', solution: steps([T(root + ' = ' + v + '^{\\frac{' + m + '}{' + n + '}}') + '.']) };
    },
    function () { // ordering numbers in scientific notation (L8)
      var base = pick([3, 4, 5, -3, -4]), xs = shuffle([[2.4, base], [7.1, base - 1], [1.8, base + 1], [9.5, base - 2]]);
      var vals = xs.map(function (x) { return x[0] * Math.pow(10, x[1]); }), big = Math.random() < 0.5;
      var idx = vals.indexOf(big ? Math.max.apply(null, vals) : Math.min.apply(null, vals));
      var o = mc(xs.map(function (x) { return T(sci(x[0], x[1])); }), idx);
      return { prompt: 'Which number is the <b>' + (big ? 'greatest' : 'least') + '</b>?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Compare the powers of 10 first: the bigger exponent is the bigger number (even when exponents are negative: −2 is bigger than −4). Only if they match, compare the numbers in front.',
        solution: steps(['The exponents are ' + xs.map(function (x) { return x[1]; }).join(', ') + '. The ' + (big ? 'biggest' : 'smallest') + ' is ' + xs[idx][1] + ', so ' + T(sci(xs[idx][0], xs[idx][1])) + ' is the ' + (big ? 'greatest' : 'least') + ': answer ' + o.letter + '.']) };
    }
  ];

  var R_MAS = [
    function () { // rational exponent of a fraction: (9/4)^{-1/2}, (27/8)^{2/3} (L9 #12)
      var c = pick([[9, 4, 2], [25, 16, 2], [4, 49, 2], [27, 8, 3], [8, 125, 3], [16, 81, 4]]), r1 = Math.round(Math.pow(c[0], 1 / c[2])), r2 = Math.round(Math.pow(c[1], 1 / c[2]));
      var m = c[2] === 3 ? pick([1, 2]) : 1, neg = Math.random() < 0.6;
      var expo = (neg ? '-' : '') + '\\frac{' + m + '}{' + c[2] + '}', ans = neg ? frac(Math.pow(r2, m), Math.pow(r1, m)) : frac(Math.pow(r1, m), Math.pow(r2, m));
      return { prompt: 'Evaluate. Give an exact answer as a fraction.<br>' + T('\\left(\\dfrac{' + c[0] + '}{' + c[1] + '}\\right)^{' + expo + '}'), type: 'expr', answers: [ans], check: 'exact',
        hint: (neg ? 'The negative exponent flips the fraction. ' : '') + 'Then take the root of the top and the bottom (the bottom of the exponent), then the power (the top).',
        solution: steps([neg ? T('\\left(\\dfrac{' + c[0] + '}{' + c[1] + '}\\right)^{' + expo + '} = \\left(\\dfrac{' + c[1] + '}{' + c[0] + '}\\right)^{\\frac{' + m + '}{' + c[2] + '}}') + '.' : 'No flip: the exponent is positive.', 'Root: ' + T((c[2] === 2 ? '\\sqrt{' : '\\sqrt[' + c[2] + ']{') + c[0] + '} = ' + r1) + ' and ' + T((c[2] === 2 ? '\\sqrt{' : '\\sqrt[' + c[2] + ']{') + c[1] + '} = ' + r2) + '.', (m > 1 ? 'Power ' + m + ': ' : '') + T('= ' + ans) + '.']) };
    },
    function () { // negative base, negative rational exponent: (-125)^{-2/3} (L10 #22)
      var c = pick([[-8, 3], [-27, 3], [-125, 3], [-64, 3], [-32, 5], [-1000, 3]]), r = Math.round(-Math.pow(-c[0], 1 / c[1])), m = pick([1, 2]);
      var val = Math.pow(r, m), ans = val < 0 ? '-\\frac{1}{' + (-val) + '}' : '\\frac{1}{' + val + '}';
      return { prompt: 'Evaluate. Give an exact answer.<br>' + T('(' + c[0] + ')^{-\\frac{' + m + '}{' + c[1] + '}}'), type: 'expr', answers: [ans], check: 'exact',
        hint: 'Deal with the negative exponent first: it means "one over". The odd root of a negative number is negative. Then the power.',
        solution: steps([T('(' + c[0] + ')^{-\\frac{' + m + '}{' + c[1] + '}} = \\dfrac{1}{(' + c[0] + ')^{\\frac{' + m + '}{' + c[1] + '}}}') + '.', T('\\sqrt[' + c[1] + ']{' + c[0] + '} = ' + r) + (m > 1 ? ', then ' + T('(' + r + ')^{' + m + '} = ' + val) : '') + '.', 'Answer: ' + T(ans) + '.']) };
    },
    function () { // scientific notation quotient with negative exponents and an adjustment
      var m2 = pick([4, 5, 8, 2.5]), q = pick([0.3, 0.2, 0.5, 0.15, 0.6]), e1 = -ri(2, 6), e2 = ri(3, 7);
      var m1 = Math.round(m2 * q * 1e6) / 1e6; if (m1 < 1 || m1 >= 10) return R_MAS[2]();
      var M = m1 / m2, E = e1 - e2; while (M < 1) { M *= 10; E -= 1; }
      return { prompt: 'Divide. Write the answer in <b>scientific notation</b>.<br>' + T('\\dfrac{' + sci(mstr(m1), e1) + '}{' + sci(mstr(m2), e2) + '}'), type: 'expr', answers: [sci(mstr(M), E)], check: 'exact',
        hint: 'Divide the numbers in front and subtract the exponents (careful with the negatives). The number in front comes out less than 1, so adjust it.',
        solution: steps([T(mstr(m1) + '\\div' + mstr(m2) + ' = ' + mstr(m1 / m2)) + ' and ' + T('10^{' + e1 + '-' + e2 + '} = 10^{' + (e1 - e2) + '}') + '.', T(mstr(m1 / m2) + '\\times10^{' + (e1 - e2) + '} = ' + sci(mstr(M), E)) + '.']) };
    },
    function () { // a rational exponent law with variables: (x^{2/3})^{3} · x^{1/2}, or radical to simplest power
      var v = pick(['x', 'y', 'a']), p = ri(1, 3), q = pick([2, 3, 4]); if (gcd(p, q) !== 1) return R_MAS[3]();
      var k = q, extra = pick([[1, 2], [1, 3], [3, 4], [2, 5]]), S = [p * extra[1] + extra[0] * 1, extra[1]]; // p + a/b
      var r = rat(p * extra[1] + extra[0], extra[1]), ans = r[1] === 1 ? pw(v, r[0]) : v + '^{\\frac{' + r[0] + '}{' + r[1] + '}}';
      return { prompt: 'Simplify. Write the answer as a single power of ' + T(v) + '.<br>' + T('\\left(' + v + '^{\\frac{' + p + '}{' + q + '}}\\right)^{' + k + '}\\cdot ' + v + '^{\\frac{' + extra[0] + '}{' + extra[1] + '}}'), type: 'expr', answers: [ans], check: 'exact',
        hint: 'The same laws work for fraction exponents: multiply exponents for a power of a power, then add exponents (find a common denominator).',
        solution: steps([T('\\left(' + v + '^{\\frac{' + p + '}{' + q + '}}\\right)^{' + k + '} = ' + v + '^{' + p + '}') + '.', T(v + '^{' + p + '}\\cdot ' + v + '^{\\frac{' + extra[0] + '}{' + extra[1] + '}} = ' + v + '^{' + p + '+\\frac{' + extra[0] + '}{' + extra[1] + '}} = ' + ans) + '.']) };
    }
  ];

  var G = QGen.GENS;
  G.AN3L_BEG = L_BEG; G.AN3L_PRG = L_PRG; G.AN3L_MAS = L_MAS;
  G.AN3R_BEG = R_BEG; G.AN3R_PRG = R_PRG; G.AN3R_MAS = R_MAS;
})();
