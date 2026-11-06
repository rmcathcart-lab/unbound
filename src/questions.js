/* ===================== QUESTION GENERATORS =====================
 * Every creature owns a list of templates. Each template returns:
 *   { prompt: HTML with \( \) LaTeX, type: 'num' | 'expr', answers: [latex...],
 *     check: 'exact' | 'equivalent', tol: number, hint: text, solution: HTML, note: text }
 * The same creature always asks at the same outcome + level; the numbers change every time.
 */
var QGen = (function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  function factor(n) { // -> [[p,e],...]
    var out = [], d = 2;
    while (d * d <= n) { if (n % d === 0) { var e = 0; while (n % d === 0) { n /= d; e++; } out.push([d, e]); } d++; }
    if (n > 1) out.push([n, 1]);
    return out;
  }
  function facLatex(f) { return f.map(function (pe) { return pe[1] === 1 ? String(pe[0]) : pe[0] + '^{' + pe[1] + '}'; }).join('\\times'); }
  function facExpanded(f) { var t = []; f.forEach(function (pe) { for (var i = 0; i < pe[1]; i++) t.push(String(pe[0])); }); return t.join('\\times'); }
  function fmt(n) { // 3432 -> 3\,432 in LaTeX
    var s = String(n), neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var out = '', c = 0; for (var i = s.length - 1; i >= 0; i--) { out = s[i] + out; c++; if (c % 3 === 0 && i > 0) out = '\\,' + out; }
    return (neg ? '-' : '') + out;
  }
  function simpSqrt(n) { // n = a^2 * b  -> [a, b]
    var a = 1, b = n, f = factor(n);
    a = 1; b = 1;
    f.forEach(function (pe) { a *= Math.pow(pe[0], Math.floor(pe[1] / 2)); if (pe[1] % 2) b *= pe[0]; });
    return [a, b];
  }
  function simpCbrt(n) { var a = 1, b = 1; factor(n).forEach(function (pe) { a *= Math.pow(pe[0], Math.floor(pe[1] / 3)); var r = pe[1] % 3; b *= Math.pow(pe[0], r); }); return [a, b]; }
  function reduce(n, d) { var g = gcd(Math.abs(n), Math.abs(d)); return [n / g, d / g]; }
  function fracLatex(n, d) { if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function rad(coef, radicand, idx) { // latex mixed radical
    var root = idx === 3 ? '\\sqrt[3]{' + radicand + '}' : '\\sqrt{' + radicand + '}';
    if (coef === 1) return root; if (coef === -1) return '-' + root; return coef + root;
  }
  function radIdx(coef, radicand, idx) { // mixed radical of any index (2 = square root)
    var root = idx === 2 ? '\\sqrt{' + radicand + '}' : '\\sqrt[' + idx + ']{' + radicand + '}';
    if (coef === 1) return root; if (coef === -1) return '-' + root; return coef + root;
  }
  function facVariants(f) { // every way of writing a factorization: each prime as p^{e} or p×p×…
    var out = [''];
    f.forEach(function (pe) {
      var forms = pe[1] === 1 ? [String(pe[0])] : [pe[0] + '^{' + pe[1] + '}', new Array(pe[1] + 1).join(pe[0] + '\\times').slice(0, -6)];
      var next = []; out.forEach(function (o) { forms.forEach(function (fm) { next.push(o ? o + '\\times' + fm : fm); }); }); out = next;
    });
    return out;
  }
  var SQFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
  var CUBEFREE = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 20];
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }

  /* ---------- Math 15 Unit 1 · AN1 · Factors, primes, GCF and LCM, perfect squares and cubes ----------
   * Calibrated on Ryan's Math 15 Unit 1 lessons (u1l3-u1l8), unit test and exit slips. A handheld calculator is allowed in
   * the game, so nothing here is a plain "evaluate this root": every item needs a factor, a multiple or a radical rule. */
  function letters(L) { return [L, L.toLowerCase()]; }
  function mc(opts, right) { // opts: array of html strings; right: index -> { html, letter }
    var L = ['A', 'B', 'C', 'D', 'E'];
    return { html: '<div class="mc-opts">' + opts.map(function (o, i) { return '<div><b>' + L[i] + '.</b> ' + o + '</div>'; }).join('') + '</div>', letter: L[right] };
  }
  var MCNOTE = 'Type the letter of your choice.';
  function primeF(lo, hi) { // a number lo..hi with 2-3 prime factors, at least one repeated
    for (var t = 0; t < 200; t++) {
      var n = pick([2, 2, 3, 3, 5, 7]) * pick([2, 3, 5, 7, 11, 13]) * pick([2, 3, 4, 5, 7, 9]);
      if (n >= lo && n <= hi && factor(n).length >= 2 && factor(n).some(function (pe) { return pe[1] > 1; })) return n;
    }
    return 360;
  }

  var AN1_BEG = [
    function () { // prime factorization in exponent form (L3 #3-4)
      var n = primeF(40, 400), f = factor(n);
      return { prompt: 'Write ' + T(n) + ' as a <b>product of prime factors</b> in exponent form, for example ' + T('2^{3}\\times 5') + '.',
        type: 'expr', answers: facVariants(f), check: 'exact', requireOp: true, primeOnly: true,
        hint: 'Use a division ladder: divide by 2 as many times as you can, then 3, then 5, then 7.',
        solution: steps(['Divide by primes until you reach 1: ' + T(n + ' = ' + facExpanded(f)) + '.', 'Group repeated primes as powers: ' + T(n + ' = ' + facLatex(f)) + '.']) };
    },
    function () { // GCF of two numbers (test 2a)
      var g = pick([3, 4, 5, 6, 7, 8, 9, 12]), m = ri(2, 7), k = ri(2, 7);
      if (gcd(m, k) !== 1 || m === k) return AN1_BEG[1]();
      var a = g * m, b = g * k;
      return { prompt: 'Find the <b>greatest common factor</b> (GCF) of ' + T(a) + ' and ' + T(b) + '.', type: 'num', answers: [String(g)], tol: 0,
        hint: 'List the factors of each number (or prime-factor them) and find the biggest one they share.',
        solution: steps([T(a + ' = ' + facLatex(factor(a))) + ' and ' + T(b + ' = ' + facLatex(factor(b))) + '.', 'Shared primes at the lowest power: ' + T('\\text{GCF} = ' + g) + '.']) };
    },
    function () { // LCM of two numbers (test 2b)
      var a = ri(3, 16), b = ri(3, 16), l = lcm(a, b);
      if (a === b || a % b === 0 || b % a === 0 || l > 96 || l === a * b && Math.random() < 0.6) return AN1_BEG[2]();
      return { prompt: 'Find the <b>lowest common multiple</b> (LCM) of ' + T(a) + ' and ' + T(b) + '.', type: 'num', answers: [String(l)], tol: 0,
        hint: 'List multiples of the bigger number until you reach one the smaller number also divides.',
        solution: steps(['Multiples of ' + Math.max(a, b) + ': ' + T(Array.apply(null, Array(l / Math.max(a, b))).map(function (_, i) { return Math.max(a, b) * (i + 1); }).join(',\\ ')) + '.', 'The first one ' + Math.min(a, b) + ' also divides is ' + T(l) + ', so ' + T('\\text{LCM} = ' + l) + '.']) };
    },
    function () { // GCF or LCM from given factorizations (test 2c, slip 2)
      var a = primeF(36, 300), b = primeF(36, 300); if (a === b || gcd(a, b) < 2) return AN1_BEG[3]();
      var wantG = Math.random() < 0.5, ans = wantG ? gcd(a, b) : lcm(a, b);
      if (!wantG && ans > 3000) return AN1_BEG[3]();
      return { prompt: T(a + ' = ' + facLatex(factor(a))) + ' and ' + T(b + ' = ' + facLatex(factor(b))) + '.<br>Use these to find the <b>' + (wantG ? 'GCF' : 'LCM') + '</b> of ' + T(a) + ' and ' + T(b) + '.',
        type: 'num', answers: [String(ans)], tol: 0,
        hint: wantG ? 'GCF: take only the primes they share, at the LOWER power.' : 'LCM: take every prime that appears, at the HIGHER power.',
        solution: steps([(wantG ? 'Shared primes, lowest powers: ' : 'Every prime, highest powers: ') + T((wantG ? '\\text{GCF} = ' : '\\text{LCM} = ') + facLatex(factor(ans)) + ' = ' + fmt(ans)) + '.']) };
    },
    function () { // square, cube, both or neither (L5 #3, test 3b) - by factorization
      var kind = pick(['sq', 'cube', 'both', 'none']), n;
      if (kind === 'sq') n = pick([16, 25, 36, 49, 81, 100, 121, 144, 169, 196, 225]);
      else if (kind === 'cube') n = pick([8, 27, 125, 343, 1000]);
      else if (kind === 'both') n = pick([1, 64, 729]);
      else n = pick([12, 18, 24, 32, 48, 50, 72, 90, 98, 108, 128, 200, 250]);
      var o = mc(['a perfect square only', 'a perfect cube only', 'both a perfect square and a perfect cube', 'neither'], ['sq', 'cube', 'both', 'none'].indexOf(kind));
      var f = n === 1 ? [] : factor(n);
      return { prompt: 'Is ' + T(fmt(n)) + ' a perfect square, a perfect cube, both, or neither?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Prime-factor it. Every exponent even means a perfect square; every exponent a multiple of 3 means a perfect cube.',
        solution: steps([n === 1 ? T('1 = 1^{2} = 1^{3}') + '.' : T(fmt(n) + ' = ' + facLatex(f)) + '.', 'So ' + fmt(n) + ' is ' + ['a perfect square only', 'a perfect cube only', 'both a perfect square and a perfect cube', 'neither'][['sq', 'cube', 'both', 'none'].indexOf(kind)] + ': answer ' + o.letter + '.']) };
    },
    function () { // smallest prime factor / prime or composite (L3 #2)
      var p = pick([7, 11, 13, 17, 19]), q = pick([7, 11, 13, 17, 19, 23]); if (q < p) { var t = p; p = q; q = t; }
      var n = p * q;
      return { prompt: T(n) + ' is not prime. Find its <b>smallest prime factor</b>.', type: 'num', answers: [String(p)], tol: 0,
        hint: 'It is odd, so 2 does not work. Try 3, 5, 7, 11, 13 in turn.',
        solution: steps(['Not divisible by 2, 3 or 5.', T(n + ' = ' + p + '\\times' + q) + ', so the smallest prime factor is ' + p + '.']) };
    }
  ];

  var AN1_PRG = [
    function () { // GCF of three numbers (test 6a)
      var g = pick([3, 4, 5, 6, 7, 8, 9, 12, 15]), ms = shuffle([2, 3, 4, 5, 6, 7, 9, 10]).slice(0, 3);
      if (gcd(gcd(ms[0], ms[1]), ms[2]) !== 1) return AN1_PRG[0]();
      var ns = ms.map(function (m) { return g * m; }).sort(function (a, b) { return a - b; });
      if (ns[2] > 150) return AN1_PRG[0]();
      return { prompt: 'Find the <b>GCF</b> of ' + T(ns[0]) + ', ' + T(ns[1]) + ' and ' + T(ns[2]) + '.', type: 'num', answers: [String(g)], tol: 0,
        hint: 'Prime-factor all three. Keep only the primes that appear in every one, at the lowest power.',
        solution: steps(ns.map(function (n) { return T(n + ' = ' + facLatex(factor(n))); }).concat(['Common to all three: ' + T('\\text{GCF} = ' + g) + '.'])) };
    },
    function () { // LCM of three numbers (test 6b)
      var tri = shuffle([4, 5, 6, 8, 9, 10, 12, 14, 15, 18, 20, 25, 30]).slice(0, 3).sort(function (a, b) { return a - b; });
      var l = lcm(lcm(tri[0], tri[1]), tri[2]);
      if (l > 360 || tri[2] % tri[0] === 0 && tri[2] % tri[1] === 0) return AN1_PRG[1]();
      return { prompt: 'Find the <b>LCM</b> of ' + T(tri[0]) + ', ' + T(tri[1]) + ' and ' + T(tri[2]) + '.', type: 'num', answers: [String(l)], tol: 0,
        hint: 'Prime-factor all three. Take every prime that appears, at its highest power.',
        solution: steps(tri.map(function (n) { return T(n + ' = ' + facLatex(factor(n))); }).concat([T('\\text{LCM} = ' + facLatex(factor(l)) + ' = ' + l) + '.'])) };
    },
    function () { // GCF sharing problem (test 7a)
      var g = pick([4, 6, 8, 9, 12, 14]), m = ri(3, 9), k = ri(3, 9);
      if (gcd(m, k) !== 1 || m === k) return AN1_PRG[2]();
      var ctx = pick([['water bottles', 'granola bars', 'team bags'], ['pencils', 'erasers', 'supply kits'], ['apples', 'oranges', 'snack bags'], ['candles', 'bread loaves', 'travel packs']]);
      var a = g * m, b = g * k, askEach = Math.random() < 0.35;
      return { prompt: 'A farmer has ' + T(a) + ' ' + ctx[0] + ' and ' + T(b) + ' ' + ctx[1] + '. She shares them into identical ' + ctx[2] + ', using every item, and makes the <b>greatest</b> number of ' + ctx[2] + ' she can.<br>' + (askEach ? 'How many <b>' + ctx[0] + '</b> go in each one?' : 'How many ' + ctx[2] + ' does she make?'),
        type: 'num', answers: [String(askEach ? m : g)], tol: 0,
        hint: 'Every item used and identical ' + ctx[2] + ' means the number of ' + ctx[2] + ' divides both amounts. The greatest such number is the GCF.',
        solution: steps([T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + ', so ' + T('\\text{GCF} = ' + g) + ': ' + g + ' ' + ctx[2] + '.', 'Each gets ' + T(a + '\\div' + g + ' = ' + m) + ' ' + ctx[0] + ' and ' + T(b + '\\div' + g + ' = ' + k) + ' ' + ctx[1] + '.']) };
    },
    function () { // LCM "together again", answer in minutes (test 7b)
      var a = pick([12, 15, 18, 20, 24, 30, 36, 40]), b = pick([16, 18, 20, 25, 27, 45, 48, 50, 60]), l = lcm(a, b);
      if (a === b || a % b === 0 || b % a === 0 || l > 360 || l < 60) return AN1_PRG[3]();
      var ctx = pick([['Two ferries leave the dock together at 8:00 a.m.', 'Ferry A returns every', 'Ferry B every', 'How many minutes until both are at the dock together again?'],
        ['Two carts leave the mill together.', 'One cart returns every', 'the other every', 'How many minutes until they are both back at the mill together?'],
        ['Two bells in the old chapel ring together at dusk.', 'One rings every', 'the other every', 'How many minutes until they next ring together?']]);
      var h = Math.floor(l / 60), mn = l % 60;
      return { prompt: ctx[0] + ' ' + ctx[1] + ' ' + T(a) + ' minutes and ' + ctx[2] + ' ' + T(b) + ' minutes.<br>' + ctx[3], type: 'num', answers: [String(l)], tol: 0,
        hint: 'They are together again at a common multiple of both times. The first time is the LCM.',
        solution: steps([T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + '.', T('\\text{LCM} = ' + facLatex(factor(l)) + ' = ' + l) + ' minutes, which is ' + h + ' h ' + mn + ' min.']) };
    },
    function () { // smallest multiplier for a perfect square (L5 e3)
      var k = ri(2, 9), m = pick([2, 3, 5, 6, 7, 10]), n = k * k * m;
      if (n < 18 || n > 600) return AN1_PRG[4]();
      return { prompt: 'What is the <b>smallest</b> whole number you can multiply ' + T(n) + ' by to make a <b>perfect square</b>?', type: 'num', answers: [String(m)], tol: 0,
        hint: 'Prime-factor ' + n + '. A perfect square needs every exponent even. Which primes have an odd exponent?',
        solution: steps([T(n + ' = ' + facLatex(factor(n))) + '.', 'The primes with an odd exponent multiply to ' + m + '.', T(n + '\\times' + m + ' = ' + fmt(n * m) + ' = ' + (k * m) + '^{2}') + '.']) };
    },
    function () { // count the factors from the exponents (L3 extra)
      var f = [[2, ri(1, 4)], [3, ri(1, 2)]]; if (Math.random() < 0.5) f.push([5, 1]);
      var n = 1, c = 1; f.forEach(function (pe) { n *= Math.pow(pe[0], pe[1]); c *= pe[1] + 1; });
      var given = Math.random() < 0.5;
      return { prompt: (given ? T('n = ' + facLatex(f)) + '. How many <b>factors</b> does ' + T('n') + ' have? (You do not need to multiply it out.)' : 'How many <b>factors</b> does ' + T(fmt(n)) + ' have?'), type: 'num', answers: [String(c)], tol: 0,
        hint: 'Write the prime factorization. Add 1 to each exponent and multiply the results.',
        solution: steps([(given ? '' : T(fmt(n) + ' = ' + facLatex(f)) + '. ') + 'Add one to each exponent: ' + T(f.map(function (pe) { return '(' + pe[1] + '+1)'; }).join('') + ' = ' + c) + ' factors.']) };
    },
    function () { // area or volume backwards, two steps (test PRG)
      if (Math.random() < 0.5) {
        var s = ri(6, 15), A = s * s, ctx = pick(['photo', 'tile', 'rug', 'garden']);
        return { prompt: 'A square ' + ctx + ' has an area of ' + T(A + '\\text{ cm}^{2}') + '. What is its <b>perimeter</b>, in cm? (No need to type the units.)', type: 'num', answers: [String(4 * s)], tol: 0,
          hint: 'The side is the square root of the area. The perimeter is 4 sides.',
          solution: steps(['Side ' + T('= \\sqrt{' + A + '} = ' + s) + ' cm, because ' + T(s + '\\times' + s + ' = ' + A) + '.', 'Perimeter ' + T('= 4\\times' + s + ' = ' + 4 * s) + ' cm.']) };
      }
      var e = ri(2, 10), V = e * e * e;
      return { prompt: 'A cube-shaped storage crate has a volume of ' + T(fmt(V) + '\\text{ cm}^{3}') + '. What is its <b>total surface area</b>, in cm²? (No need to type the units.)', type: 'num', answers: [String(6 * e * e)], tol: 0,
        hint: 'The edge is the cube root of the volume. A cube has 6 square faces, each edge × edge.',
        solution: steps(['Edge ' + T('= \\sqrt[3]{' + fmt(V) + '} = ' + e) + ' cm.', 'Surface area ' + T('= 6\\times' + e + '^{2} = 6\\times' + e * e + ' = ' + 6 * e * e) + ' cm².']) };
    }
  ];

  var AN1_MAS = [
    function () { // smallest n so that k·n is a perfect square or cube, then the root (test 13c)
      var cube = Math.random() < 0.45;
      if (cube) {
        var f = [[2, ri(1, 4)], [3, ri(0, 2)], [5, ri(0, 1)]].filter(function (pe) { return pe[1] > 0; });
        var k = 1, n = 1; f.forEach(function (pe) { k *= Math.pow(pe[0], pe[1]); n *= Math.pow(pe[0], (3 - pe[1] % 3) % 3); });
        if (n === 1 || k < 12 || k * n > 1728 || k > 300) return AN1_MAS[0]();
        var r = Math.round(Math.cbrt(k * n));
        return { prompt: 'Find the <b>smallest</b> whole number ' + T('n') + ' so that ' + T(k + '\\times n') + ' is a <b>perfect cube</b>. Then give ' + T('\\sqrt[3]{' + k + '\\times n}') + '.<br>Type the cube root only.', type: 'num', answers: [String(r)], tol: 0,
          hint: 'Prime-factor ' + k + '. A perfect cube has every exponent a multiple of 3. Top each exponent up, then take one third of each.',
          solution: steps([T(k + ' = ' + facLatex(factor(k))) + '.', 'Top up to multiples of 3: ' + T('n = ' + facLatex(factor(n)) + ' = ' + n) + '.', T(k + '\\times' + n + ' = ' + fmt(k * n) + ' = ' + r + '^{3}') + ', so the cube root is ' + r + '.']) };
      }
      var a = ri(2, 9), m = pick([2, 3, 5, 6, 7, 10]), K = a * a * m * pick([1, 4]);
      var sq = simpSqrt(K), nn = sq[1], root = sq[0] * nn;
      if (K < 24 || K > 600 || nn === 1) return AN1_MAS[0]();
      return { prompt: 'Find the <b>smallest</b> whole number ' + T('n') + ' so that ' + T(K + '\\times n') + ' is a <b>perfect square</b>. Then give ' + T('\\sqrt{' + K + '\\times n}') + '.<br>Type the square root only.', type: 'num', answers: [String(root)], tol: 0,
        hint: 'Prime-factor ' + K + '. Multiply by the primes that have an odd exponent so every exponent is even.',
        solution: steps([T(K + ' = ' + facLatex(factor(K))) + '.', 'The primes with odd exponents give ' + T('n = ' + nn) + '.', T(K + '\\times' + nn + ' = ' + fmt(K * nn) + ' = ' + root + '^{2}') + ', so the square root is ' + root + '.']) };
    },
    function () { // GCF x LCM = a x b, backwards (test 14)
      var g = pick([2, 3, 4, 5, 6, 8]), m = ri(2, 7), k = ri(2, 7);
      if (gcd(m, k) !== 1 || m === k) return AN1_MAS[1]();
      var a = g * m, b = g * k, l = g * m * k;
      return { prompt: 'Two whole numbers have a GCF of ' + T(g) + ' and an LCM of ' + T(l) + '. One of the numbers is ' + T(a) + '. What is the other number?', type: 'num', answers: [String(b)], tol: 0,
        hint: 'For any two whole numbers, GCF × LCM = the first number × the second number.',
        solution: steps([T('\\text{GCF}\\times\\text{LCM} = ' + g + '\\times' + l + ' = ' + g * l) + '.', T(g * l + '\\div' + a + ' = ' + b) + '.', 'Check: GCF of ' + a + ' and ' + b + ' is ' + g + ', LCM is ' + l + '.']) };
    },
    function () { // largest square plots, how many (test 15)
      var g = pick([6, 8, 9, 10, 12, 15, 18, 20, 24]), m = ri(2, 8), k = ri(2, 8);
      if (gcd(m, k) !== 1 || m === k || g * Math.max(m, k) > 160) return AN1_MAS[2]();
      var a = g * m, b = g * k, ctx = pick([['A field', 'm', 'square plots'], ['A barn wall', 'cm', 'square panels'], ['A threshing floor', 'cm', 'square tiles']]);
      return { prompt: ctx[0] + ' measures ' + T(a + '\\text{ ' + ctx[1] + '}') + ' by ' + T(b + '\\text{ ' + ctx[1] + '}') + '. It is divided exactly into identical ' + ctx[2] + ' that are as <b>large</b> as possible, with nothing left over.<br>How many ' + ctx[2] + ' are there?', type: 'num', answers: [String(m * k)], tol: 0,
        hint: 'The side of the largest square is the GCF of the two lengths. Then count how many fit along each side and multiply.',
        solution: steps([T('\\text{GCF}(' + a + ', ' + b + ') = ' + g) + ', so each square is ' + g + ' ' + ctx[1] + ' by ' + g + ' ' + ctx[1] + '.', 'Along the sides: ' + T(a + '\\div' + g + ' = ' + m) + ' and ' + T(b + '\\div' + g + ' = ' + k) + '.', T(m + '\\times' + k + ' = ' + m * k) + ' ' + ctx[2] + '.']) };
    },
    function () { // stacks of boxes: LCM then a count (L3 e18)
      var a = pick([12, 15, 18, 20, 24, 30]), b = pick([16, 18, 20, 25, 27, 36, 40, 45]), l = lcm(a, b);
      if (a === b || a % b === 0 || b % a === 0 || l > 360) return AN1_MAS[3]();
      return { prompt: 'Grain sacks are stacked in two piles. Sacks in the first pile are ' + T(a + '\\text{ cm}') + ' tall and sacks in the second are ' + T(b + '\\text{ cm}') + ' tall. The two piles end up exactly the same height, as short as possible.<br>How many sacks are there <b>altogether</b> in the two piles?', type: 'num', answers: [String(l / a + l / b)], tol: 0,
        hint: 'The shortest equal height is the LCM of the two sack heights. Then divide to count each pile.',
        solution: steps([T('\\text{LCM}(' + a + ', ' + b + ') = ' + l) + ' cm.', 'First pile: ' + T(l + '\\div' + a + ' = ' + l / a) + ' sacks; second pile: ' + T(l + '\\div' + b + ' = ' + l / b) + ' sacks.', 'Altogether ' + T(l / a + l / b) + ' sacks.']) };
    },
    function () { // same-area square (slip 4)
      var s = pick([6, 10, 12, 14, 15, 18, 20, 21, 24, 30]), fs = [];
      for (var d = 2; d < s; d++) if ((s * s) % d === 0 && d * d < s * s && d !== s && d >= 3) fs.push(d);
      var w = pick(fs), L = s * s / w; if (w === L) return AN1_MAS[4]();
      return { prompt: 'A rectangular patio is ' + T(w + '\\text{ m}') + ' by ' + T(L + '\\text{ m}') + '. A square patio has the <b>same area</b>.<br>What is the <b>perimeter</b> of the square patio, in m? (No need to type the units.)', type: 'num', answers: [String(4 * s)], tol: 0,
        hint: 'Find the area of the rectangle. The square\'s side is the square root of that area.',
        solution: steps(['Area ' + T('= ' + w + '\\times' + L + ' = ' + s * s) + ' m².', 'Side ' + T('= \\sqrt{' + s * s + '} = ' + s) + ' m.', 'Perimeter ' + T('= 4\\times' + s + ' = ' + 4 * s) + ' m.']) };
    }
  ];

  /* ---------- Math 15 Unit 1 · AN2 · Real numbers and radicals ---------- */
  var AN2_BEG = [
    function () { // count the irrationals
      var pool = [
        ['\\sqrt{' + pick([16, 25, 36, 49, 64, 81, 100, 121]) + '}', false], ['\\sqrt{' + pick([2, 3, 5, 7, 10, 11, 13, 24]) + '}', true],
        ['\\pi', true], ['0.\\overline{' + ri(1, 8) + '}', false], ['\\frac{' + ri(1, 9) + '}{' + pick([3, 4, 7, 8, 9]) + '}', false],
        ['\\sqrt[3]{' + pick([8, 27, 64, 125]) + '}', false], ['\\sqrt[3]{' + pick([2, 5, 9, 10, 20]) + '}', true],
        ['0.' + ri(11, 89), false], ['0.979\\,779\\,777\\ldots', true], ['-\\sqrt{' + pick([4, 9, 144]) + '}', false], ['\\frac{22}{7}', false], ['2.\\overline{2}', false]];
      var items = shuffle(pool).slice(0, 4), count = items.filter(function (x) { return x[1]; }).length;
      return { prompt: 'How many of these numbers are <b>irrational</b>?<br>' + items.map(function (x) { return T(x[0]); }).join(', &nbsp; '), type: 'num', answers: [String(count)], tol: 0,
        hint: 'Rational numbers can be written as a fraction of integers: roots of perfect squares or cubes, terminating and repeating decimals. Roots that do not come out even, π, and decimals that never repeat are irrational.',
        solution: steps(items.map(function (x) { return T(x[0]) + ' is ' + (x[1] ? '<b>irrational</b>' : 'rational'); }).concat(['Irrational: ' + count + '.'])) };
    },
    function () { // innermost set (L4, setsort)
      var opts = ['natural numbers ' + T('N'), 'whole numbers ' + T('W') + ' (but not natural)', 'integers ' + T('I') + ' (but not whole)', 'rational numbers ' + T('Q') + ' (but not integers)', 'irrational numbers ' + T('\\overline{Q}')];
      var k = ri(2, 12), c = ri(2, 5), kind = ri(0, 4), x, why;
      if (kind === 0) { x = pick(['\\sqrt{' + k * k + '}', '\\frac{' + 3 * k + '}{3}', '\\sqrt[3]{' + c * c * c + '}']); why = 'it simplifies to a counting number'; }
      else if (kind === 1) { x = pick(['0', '\\sqrt{' + k * k + '}-' + k, '\\frac{0}{' + k + '}']); why = 'it equals 0, which is whole but not natural'; }
      else if (kind === 2) { x = pick(['-\\sqrt{' + k * k + '}', '\\sqrt[3]{-' + c * c * c + '}', '-\\frac{' + 2 * k + '}{2}']); why = 'it is a negative integer'; }
      else if (kind === 3) { x = pick(['\\frac{3}{8}', '-0.\\overline{6}', '\\sqrt{\\frac{4}{9}}', '2.75', '-\\frac{7}{4}']); why = 'it is a fraction of integers that is not an integer'; }
      else { x = pick(['\\sqrt{' + pick([2, 3, 5, 7, 14, 15]) + '}', '\\pi', '-\\sqrt[3]{' + pick([4, 9, 10]) + '}']); why = 'it never terminates and never repeats'; }
      var o = mc(opts, kind);
      return { prompt: 'Which is the <b>innermost</b> number set that ' + T(x) + ' belongs to?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Simplify it first. The sets nest: N inside W inside I inside Q, all inside R. The irrationals sit beside Q.',
        solution: steps(['Answer ' + o.letter + ': ' + T(x) + ' — ' + why + '.']) };
    },
    function () { // entire -> mixed, small (L6 #3, test 5)
      var a = ri(2, 5), b = pick([2, 3, 5, 6, 7, 10, 11, 13]), n = a * a * b;
      if (n < 8 || n > 99) return AN2_BEG[2]();
      return { prompt: 'Write ' + T('\\sqrt{' + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(a, b)], check: 'exact',
        hint: 'Find the largest perfect square (4, 9, 16, 25…) that divides ' + n + '.',
        solution: steps([T('\\sqrt{' + n + '} = \\sqrt{' + a * a + '\\times' + b + '} = \\sqrt{' + a * a + '}\\times\\sqrt{' + b + '}') + '.', T('= ' + rad(a, b)) + '.']) };
    },
    function () { // mixed -> entire (L6 #6-7)
      var a = ri(2, 9), b = pick([2, 3, 5, 6, 7, 10]);
      return { prompt: 'Write ' + T(rad(a, b)) + ' as an <b>entire radical</b>.', type: 'expr', answers: ['\\sqrt{' + a * a * b + '}'], check: 'exact',
        hint: 'Square the coefficient and multiply it in: ' + T('a\\sqrt{b} = \\sqrt{a^{2}\\times b}') + '.',
        solution: steps([T(rad(a, b) + ' = \\sqrt{' + a + '^{2}\\times' + b + '} = \\sqrt{' + a * a + '\\times' + b + '}') + '.', T('= \\sqrt{' + a * a * b + '}') + '.']) };
    },
    function () { // cube root entire <-> mixed, coefficient 2-3 (L7 #2-5)
      var a = pick([2, 3]), b = pick([2, 3, 4, 5, 6, 7, 9, 10]), n = a * a * a * b;
      if (Math.random() < 0.5) return { prompt: 'Write ' + T('\\sqrt[3]{' + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(a, b, 3)], check: 'exact',
        hint: 'Look for a perfect cube (8, 27, 64…) that divides ' + n + '.',
        solution: steps([T('\\sqrt[3]{' + n + '} = \\sqrt[3]{' + a * a * a + '\\times' + b + '} = ' + rad(a, b, 3)) + '.']) };
      return { prompt: 'Write ' + T(rad(a, b, 3)) + ' as an <b>entire radical</b>.', type: 'expr', answers: ['\\sqrt[3]{' + n + '}'], check: 'exact',
        hint: 'For a cube root, CUBE the coefficient before you move it inside.',
        solution: steps([T(a + ' = \\sqrt[3]{' + a * a * a + '}') + ', so ' + T(rad(a, b, 3) + ' = \\sqrt[3]{' + a * a * a + '\\times' + b + '} = \\sqrt[3]{' + n + '}') + '.']) };
    },
    function () { // real or not (test 4b)
      var not = pick(['\\sqrt{-' + pick([9, 16, 25, 36, 49]) + '}', '\\sqrt[4]{-' + pick([16, 81]) + '}', '\\sqrt{-' + pick([10, 12, 20]) + '}']);
      var real = shuffle(['-\\sqrt{' + pick([25, 36, 49]) + '}', '\\sqrt[3]{-' + pick([8, 27, 64]) + '}', '\\sqrt[5]{-32}', '\\sqrt{' + pick([7, 11, 15]) + '}', '-\\sqrt[3]{' + pick([10, 20]) + '}']).slice(0, 3);
      var right = ri(0, 3), list = real.slice(); list.splice(right, 0, not);
      var o = mc(list.map(function (x) { return T(x); }), right);
      return { prompt: 'Which of these is <b>not</b> a real number?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'An odd root (cube root, fifth root) of a negative number is a negative real number. An even root (square root, fourth root) of a negative number is not a real number.',
        solution: steps([T(not) + ' is an even root of a negative number: no real number times itself an even number of times is negative. Answer ' + o.letter + '.']) };
    }
  ];

  var AN2_PRG = [
    function () { // entire -> mixed, larger square roots (L6 #4, slip)
      var a = ri(4, 12), b = pick([2, 3, 5, 6, 7, 10]), n = a * a * b;
      if (n < 96 || n > 500) return AN2_PRG[0]();
      return { prompt: 'Write ' + T('\\sqrt{' + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(a, b)], check: 'exact',
        hint: 'Prime-factor ' + n + ' and pull out pairs, or find the LARGEST perfect square that divides it.',
        solution: steps([T(n + ' = ' + facLatex(factor(n))) + '.', T('\\sqrt{' + n + '} = \\sqrt{' + a * a + '\\times' + b + '} = ' + rad(a, b)) + '.']) };
    },
    function () { // coefficient already in front (L6 extra)
      var c = ri(2, 4), k = ri(2, 6), m = pick([2, 3, 5, 6, 7]), r = k * k * m, neg = Math.random() < 0.3;
      if (r > 250) return AN2_PRG[1]();
      var cc = neg ? -c : c;
      return { prompt: 'Write ' + T(rad(cc, r)) + ' as a mixed radical in <b>simplest form</b>.', type: 'expr', answers: [rad(cc * k, m)], check: 'exact',
        hint: 'Simplify the root first, then multiply the number in front by what came out.',
        solution: steps([T('\\sqrt{' + r + '} = \\sqrt{' + k * k + '\\times' + m + '} = ' + rad(k, m)) + '.', T(rad(cc, r) + ' = ' + cc + '\\times' + rad(k, m) + ' = ' + rad(cc * k, m)) + '.']) };
    },
    function () { // mixed -> entire with a sign (test 12a/b)
      var idx = pick([2, 3, 3]), a = pick([-3, -2, 2, 3, 4, -4]), b = idx === 3 ? pick([2, 3, 4, 5, 6, 7, 9]) : pick([2, 3, 5, 6, 7, 10]);
      if (idx === 3 && Math.abs(a) === 4) a = a < 0 ? -2 : 2;
      var inside = Math.pow(Math.abs(a), idx) * b, ans;
      if (idx === 3) ans = a < 0 ? ['\\sqrt[3]{-' + inside + '}', '-\\sqrt[3]{' + inside + '}'] : ['\\sqrt[3]{' + inside + '}'];
      else ans = a < 0 ? ['-\\sqrt{' + inside + '}'] : ['\\sqrt{' + inside + '}'];
      return { prompt: 'Write ' + T(rad(a, b, idx)) + ' as an <b>entire radical</b>.', type: 'expr', answers: ans, check: 'exact',
        hint: idx === 3 ? 'Cube the coefficient to move it inside a cube root. A negative can go inside a cube root, because a negative number cubed is negative.' : 'Square the coefficient to move it inside. A negative sign stays OUTSIDE a square root.',
        solution: steps([T(Math.abs(a) + (idx === 3 ? '^{3} = ' : '^{2} = ') + Math.pow(Math.abs(a), idx)) + '.', T(rad(a, b, idx) + ' = ' + ans[0]) + (a < 0 ? (idx === 3 ? ' (an odd index takes the negative inside)' : ' (the negative stays outside a square root)') : '') + '.']) };
    },
    function () { // cube roots: larger or negative radicand (L7)
      var a = pick([2, 3, 4, 5]), b = pick([2, 3, 4, 5, 6, 7, 9, 10]), neg = Math.random() < 0.5, n = a * a * a * b;
      if (n > 500 || (a === 2 && b === 4)) return AN2_PRG[3]();
      var coef = neg ? -a : a;
      return { prompt: 'Write ' + T('\\sqrt[3]{' + (neg ? '-' : '') + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(coef, b, 3)], check: 'exact',
        hint: 'Find the largest perfect cube that divides ' + n + '.' + (neg ? ' The cube root of a negative is negative, so the sign comes out in front.' : ''),
        solution: steps([T(n + ' = ' + a * a * a + '\\times' + b) + ' and ' + T(a * a * a + ' = ' + a + '^{3}') + '.', T('\\sqrt[3]{' + (neg ? '-' : '') + n + '} = ' + rad(coef, b, 3)) + '.']) };
    },
    function () { // 4th and 5th roots both ways (L7, test 11b)
      var idx = pick([4, 5]), a = idx === 4 ? pick([2, 3]) : 2, b = pick([2, 3, 5, 6, 7, 10, 15]), n = Math.pow(a, idx) * b;
      if (n > 500) return AN2_PRG[4]();
      var toMixed = Math.random() < 0.6, R = '\\sqrt[' + idx + ']{', mixed = radIdx(a, b, idx);
      if (toMixed) return { prompt: 'Write ' + T(R + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [mixed], check: 'exact',
        hint: 'Look for a perfect ' + (idx === 4 ? 'fourth power (16, 81…)' : 'fifth power (32, 243…)') + ' that divides ' + n + '.',
        solution: steps([T(n + ' = ' + Math.pow(a, idx) + '\\times' + b) + ' and ' + T(Math.pow(a, idx) + ' = ' + a + '^{' + idx + '}') + ', so ' + T(R + n + '} = ' + mixed) + '.']) };
      return { prompt: 'Write ' + T(mixed) + ' as an <b>entire radical</b>.', type: 'expr', answers: [R + n + '}'], check: 'exact',
        hint: 'Raise the coefficient to the power ' + idx + ' and multiply it in.',
        solution: steps([T(a + '^{' + idx + '} = ' + Math.pow(a, idx)) + ', so ' + T(mixed + ' = ' + R + Math.pow(a, idx) + '\\times' + b + '} = ' + R + n + '}') + '.']) };
    },
    function () { // exact side of a square from its area (L6 exact geometry)
      var k = ri(2, 7), m = pick([2, 3, 5, 6, 7, 10]), A = k * k * m;
      if (A > 300) return AN2_PRG[5]();
      var ctx = pick(['rug', 'tarp', 'window', 'garden', 'tile']);
      return { prompt: 'A square ' + ctx + ' has an area of ' + T(A + '\\text{ cm}^{2}') + '. Write its <b>exact</b> side length as a mixed radical in simplest form. (No need to type the units.)', type: 'expr', answers: [rad(k, m)], check: 'exact',
        hint: 'Side = square root of the area. Then simplify the root.',
        solution: steps(['Side ' + T('= \\sqrt{' + A + '} = \\sqrt{' + k * k + '\\times' + m + '} = ' + rad(k, m)) + ' cm.']) };
    }
  ];

  var AN2_MAS = [
    function () { // order mixed radicals: name the largest or smallest (test 16, slip 3)
      var cands = [], tries = 0;
      while (cands.length < 4 && tries++ < 100) { var a = ri(2, 6), b = pick([2, 3, 5, 6, 7, 10, 11]), v = a * a * b; if (v <= 200 && !cands.some(function (c) { return c[2] === v || c[1] === b; })) cands.push([a, b, v]); }
      if (cands.length < 4) return AN2_MAS[0]();
      var big = Math.random() < 0.5, target = cands.reduce(function (p, c) { return big ? (c[2] > p[2] ? c : p) : (c[2] < p[2] ? c : p); });
      var o = mc(cands.map(function (c) { return T(rad(c[0], c[1])); }), cands.indexOf(target));
      return { prompt: 'Without a calculator, which of these is the <b>' + (big ? 'greatest' : 'least') + '</b>?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'Write every one as an entire radical (square the coefficient and multiply it in), then compare the numbers under the roots.',
        solution: steps(cands.map(function (c) { return T(rad(c[0], c[1]) + ' = \\sqrt{' + c[0] * c[0] + '\\times' + c[1] + '} = \\sqrt{' + c[2] + '}'); }).concat(['The ' + (big ? 'greatest' : 'least') + ' is ' + T(rad(target[0], target[1])) + ': answer ' + o.letter + '.'])) };
    },
    function () { // find and fix the error (test 17)
      var who = pick(['Ravi', 'Mila', 'Jonah', 'Priya', 'Tess']);
      if (Math.random() < 0.5) {
        var a = ri(3, 7), b = pick([2, 3, 5, 6, 7]);
        return { prompt: who + ' wrote ' + T(rad(a, b) + ' = \\sqrt{' + a * b + '}') + '. That is wrong.<br>What is the correct <b>entire radical</b>?', type: 'expr', answers: ['\\sqrt{' + a * a * b + '}'], check: 'exact',
          hint: 'The coefficient has to become a square root before it can go inside: ' + T(a + ' = \\sqrt{' + a * a + '}') + '.',
          solution: steps([who + ' multiplied ' + a + ' straight in instead of ' + T(a + '^{2}') + '.', T(rad(a, b) + ' = \\sqrt{' + a * a + '\\times' + b + '} = \\sqrt{' + a * a * b + '}') + '.']) };
      }
      var c = pick([2, 3, 4, 5]), d = pick([2, 3, 4, 5, 6, 7]);
      return { prompt: who + ' wrote ' + T(rad(c, d, 3) + ' = \\sqrt[3]{' + c + '^{2}\\times' + d + '} = \\sqrt[3]{' + c * c * d + '}') + '. That is wrong.<br>What is the correct <b>entire radical</b>?', type: 'expr', answers: ['\\sqrt[3]{' + c * c * c * d + '}'], check: 'exact',
        hint: 'For a cube root the coefficient must be CUBED to go inside: ' + T(c + ' = \\sqrt[3]{' + c * c * c + '}') + '.',
        solution: steps([who + ' squared ' + c + ' as if it were a square root.', T(rad(c, d, 3) + ' = \\sqrt[3]{' + c * c * c + '\\times' + d + '} = \\sqrt[3]{' + c * c * c * d + '}') + '.']) };
    },
    function () { // exact perimeter of a square from its area (test 18)
      var k = ri(2, 6), m = pick([2, 3, 5, 6, 7, 10, 11]), A = k * k * m;
      if (A < 20 || A > 200) return AN2_MAS[2]();
      var ctx = pick(['window', 'patio', 'garden', 'rug', 'tarp']);
      return { prompt: 'A square ' + ctx + ' has an area of ' + T(A + '\\text{ m}^{2}') + '. Find its <b>exact perimeter</b> as a mixed radical in simplest form. (No need to type the units.)', type: 'expr', answers: [rad(4 * k, m)], check: 'exact',
        hint: 'First the exact side: the square root of the area, simplified. Then the perimeter is 4 times the side.',
        solution: steps(['Side ' + T('= \\sqrt{' + A + '} = \\sqrt{' + k * k + '\\times' + m + '} = ' + rad(k, m)) + ' m.', 'Perimeter ' + T('= 4\\times' + rad(k, m) + ' = ' + rad(4 * k, m)) + ' m.']) };
    },
    function () { // work backwards from the simplified form (L6/L7 extra)
      var cube = Math.random() < 0.4, a = cube ? pick([2, 3]) : ri(3, 9), b = cube ? pick([2, 3, 4, 5, 6, 7]) : pick([2, 3, 5, 6, 7]);
      var n = cube ? a * a * a * b : a * a * b, R = cube ? '\\sqrt[3]{x}' : '\\sqrt{x}';
      return { prompt: 'A radical simplifies to ' + T(R + ' = ' + rad(a, b, cube ? 3 : 2)) + '. What is the value of ' + T('x') + '?', type: 'num', answers: [String(n)], tol: 0,
        hint: 'Work backwards: turn ' + T(rad(a, b, cube ? 3 : 2)) + ' back into an entire radical.',
        solution: steps([T(rad(a, b, cube ? 3 : 2) + ' = ' + (cube ? '\\sqrt[3]{' + a + '^{3}\\times' + b + '}' : '\\sqrt{' + a + '^{2}\\times' + b + '}') + ' = ' + (cube ? '\\sqrt[3]{' : '\\sqrt{') + n + '}') + ', so ' + T('x = ' + n) + '.']) };
    },
    function () { // bigger negative cube root, by prime factorization (slip 4 MAS)
      var a = pick([3, 4, 5]), b = pick([2, 3, 4, 5, 6, 7, 9, 10, 11]), n = a * a * a * b;
      if (n > 1500) return AN2_MAS[4]();
      var s = simpCbrt(n); if (s[0] !== a || s[1] !== b) return AN2_MAS[4]();
      return { prompt: 'Write ' + T('\\sqrt[3]{-' + fmt(n) + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(-a, b, 3)], check: 'exact',
        hint: 'Prime-factor ' + fmt(n) + ' and pull out groups of three equal primes. The negative comes out in front.',
        solution: steps([T(fmt(n) + ' = ' + facLatex(factor(n))) + '.', T('\\sqrt[3]{-' + fmt(n) + '} = -\\sqrt[3]{' + a * a * a + '\\times' + b + '} = ' + rad(-a, b, 3)) + '.']) };
    }
  ];

  var GENS = { AN1_BEG: AN1_BEG, AN1_PRG: AN1_PRG, AN1_MAS: AN1_MAS, AN2_BEG: AN2_BEG, AN2_PRG: AN2_PRG, AN2_MAS: AN2_MAS };

  function make(key) {
    var list = GENS[key]; if (!list) throw new Error('no generator ' + key);
    var ti = Math.floor(Math.random() * list.length), q = list[ti](); q.key = key; q.tpl = ti; if (q.tol == null) q.tol = 0; return q;
  }
  function makeLike(q) { // another question from the same template: same answer form, different numbers
    var list = GENS[q.key]; if (!list || q.tpl == null) return null;
    for (var i = 0; i < 8; i++) { var r = list[q.tpl](); if (r && r.answers && r.answers[0] !== q.answers[0]) { r.key = q.key; r.tpl = q.tpl; return r; } }
    return null;
  }
  return { make: make, makeLike: makeLike, GENS: GENS, _util: { factor: factor, simpSqrt: simpSqrt } };
})();
/* ---------- the tutorial (The Proving Grounds): easy questions that teach the answer box and keypad ---------- */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function T(x) { return '\\(' + x + '\\)'; }
  var WORDS = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 10: 'ten', 11: 'eleven' };
  QGen.GENS.TUT_A = [function () { // a plain number answer
    var a = ri(3, 9), b = ri(3, 9);
    return { prompt: 'A warm-up. What is ' + T(a + '\\times ' + b) + '?<br>Type the number in the box and press <b>Strike</b> (or Enter).', type: 'num', answers: [String(a * b)], tol: 0,
      hint: 'Count up by ' + a + ', ' + b + ' times.', solution: T(a + '\\times ' + b + ' = ' + a * b) + '.' };
  }];
  QGen.GENS.TUT_B = [function () { // a fraction from the keypad
    var f = [[3, 4, 'three quarters'], [2, 3, 'two thirds'], [5, 8, 'five eighths'], [1, 6, 'one sixth'], [3, 5, 'three fifths']][ri(0, 4)];
    return { prompt: 'Write <b>' + f[2] + '</b> as a fraction.', type: 'expr', answers: ['\\frac{' + f[0] + '}{' + f[1] + '}'], check: 'exact',
      note: 'Press the <b>a/b</b> key: it makes a fraction with a box on top and a box below. Type the top number, press → (or tap the bottom box), then type the bottom number.',
      hint: 'The top number counts the parts you have; the bottom number counts the parts in the whole.', solution: f[2] + ' is ' + T('\\frac{' + f[0] + '}{' + f[1] + '}') + '.' };
  }];
  QGen.GENS.TUT_C = [function () { // a root from the keypad
    var n = [2, 3, 5, 6, 7, 10, 11][ri(0, 6)];
    return { prompt: 'Write <b>the square root of ' + n + '</b>.', type: 'expr', answers: ['\\sqrt{' + n + '}'], check: 'exact',
      note: 'Press the <b>√</b> key, then type ' + n + ' inside it.', hint: 'The √ key makes a root with a box inside. The number goes in the box.', solution: T('\\sqrt{' + n + '}') + '.' };
  }];
  QGen.GENS.TUT_D = [function () { // a power from the keypad
    var b = ri(2, 5), e = ri(3, 6);
    return { prompt: 'Write <b>' + WORDS[b] + ' to the power of ' + WORDS[e] + '</b> as a power (do not work it out).', type: 'expr', answers: [b + '^{' + e + '}'], check: 'exact',
      note: 'Type ' + b + ', press the <b>xⁿ</b> key, then type ' + e + ' in the raised box.', hint: 'The base is the big number; the exponent sits up and to the right.', solution: T(b + '^{' + e + '}') + ', which is ' + Math.pow(b, e) + ' if you work it out.' };
  }];
})();
if (typeof module !== 'undefined') module.exports = QGen;
