/* ===================== LAND 5 · COGWRIGHT'S RUIN · Math 15 Unit 5 · RELATIONS AND FUNCTIONS =====================
 * Registered into QGen.GENS as RF2_* (relations: the Cartesian plane, patterns and variables, intercepts, domain and
 * range; Math 15's RF1, RF2, RF4, RF5) and RF8_* (functions: the function test, function notation, reading and
 * interpreting real-world graphs; RF1, RF2, RF8).
 * The template library is shared with Lorebound (Math 10C, questions_u5.js) so fixes carry across; the arrays below it are
 * re-chosen for Math 15 and pitched like Ryan's Math 15 Unit 5 test (math15 js/lessons/u5test.js):
 *   BEG  each lesson's core skill as first taught: coordinates and quadrants, independent / dependent and discrete /
 *        continuous variables, a growing pattern's next figure, domain and range of a table, intercepts read from a
 *        table, evaluating f(x), writing y = mx + b as f(x) = ..., reading f(a) off a graph, the function test on a table;
 *   PRG  the typical assignment question: a pattern's equation and far term, intercepts of y = mx + b and in context,
 *        domain / range from a graph, a quadratic f at a negative input, solving f(x) = k (rule or graph), how many of
 *        four relations are functions, a rate of change on a story graph;
 *   MAS  Math 15's hardest items, easier than Lorebound's: an open endpoint, a one-sided range, a realistic domain or
 *        range from a context, interpreting C(a) = b, a student's f(4) error, the steepest piece of a story graph.
 * Circles, quadratic intercepts, f(x - k), f(kx) and radical answers are left out (they are Math 10C).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function sgn(v) { return v < 0 ? ' - ' + Math.abs(v) : ' + ' + v; }                 // " + 3" / " - 3"
  function lin(m, b, v) { // m x + b in LaTeX with v as the variable
    var s = m === 1 ? v : m === -1 ? '-' + v : m + v; if (b !== 0) s += sgn(b); return s;
  }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function uniqSorted(arr) { var out = []; arr.forEach(function (v) { if (out.indexOf(v) < 0) out.push(v); }); return out.sort(function (a, b) { return a - b; }); }
  function setL(arr) { return '\\{' + arr.join(',') + '\\}'; }            // answer form of a set
  function setD(arr) { return '\\{' + arr.join(', ') + '\\}'; }           // display form of a set
  function sgnD(v) { return v < 0 ? ' - ' + num(-v) : ' + ' + num(v); }    // like sgn, decimals allowed
  function poly2(a, b, c, v) { // a v^2 + b v + c in LaTeX (a != 0)
    var s = (a === 1 ? '' : a === -1 ? '-' : a) + v + '^{2}';
    if (b !== 0) s += (b === 1 ? ' + ' : b === -1 ? ' - ' : sgn(b)) + v;
    if (c !== 0) s += sgn(c);
    return s;
  }
  function simpSqrt(n) { var a = 1, b = n; for (var p = 2; p * p <= b; p++) { while (b % (p * p) === 0) { a *= p; b /= p * p; } } return [a, b]; } // n = a^2 b
  function letters(L) { return [L.toUpperCase(), L.toLowerCase()]; }
  var SET_NOTE = 'Use the { } key, e.g. ' + T('\\{-2, 0, 5\\}') + '. List the values in increasing order, each value once.';
  var NAMES = ['Mira', 'Theo', 'Anika', 'Jonah', 'Priya', 'Caleb', 'Sofia', 'Eli'];

  /* ---------- RF2 · relations: patterns, intercepts, domain and range ---------- */
  var A_BEG = [
    function () { // linear pattern from a table -> equation
      var a = ri(2, 6), b = ri(1, 5), ctx = pick([['toothpicks', 'T', 'squares', 'n'], ['tiles', 'N', 'figure number', 'f'], ['chairs', 'C', 'tables pushed together', 't']]);
      var xs = [1, 2, 3, 4], ys = xs.map(function (x) { return a * x + b; });
      return { prompt: 'The table shows the number of ' + ctx[0] + ' (' + T(ctx[1]) + ') for each number of ' + ctx[2] + ' (' + T(ctx[3]) + ') in a growing pattern.' + Fig.table(xs, ys, ctx[3], ctx[1]) + 'Write an equation for ' + T(ctx[1]) + ' in terms of ' + T(ctx[3]) + '.', type: 'expr', answers: [ctx[1] + '=' + lin(a, b, ctx[3])], check: 'equivalent', note: 'Type the whole equation, e.g. ' + T(ctx[1] + ' = 2' + ctx[3] + ' + 5') + '.',
        hint: 'How much does ' + ctx[1] + ' go up each time ' + ctx[3] + ' goes up by 1? That is the constant change (how much it goes up each time). Then find what you must add to make ' + ctx[3] + ' = 1 work.',
        solution: steps(['Each step adds ' + a + ', so the equation has the form ' + T(ctx[1] + ' = ' + a + ctx[3] + ' + b') + '.', 'At ' + T(ctx[3] + ' = 1') + ': ' + T(a + ' + b = ' + ys[0]) + ', so ' + T('b = ' + b) + '.', T(ctx[1] + ' = ' + lin(a, b, ctx[3])) + '.']) };
    },
    function () { // evaluate a relation
      var a = pick([2, 3, 4, 5, -2, -3]), b = nz(-9, 9), x = nz(-6, 8);
      return { prompt: 'For the relation ' + T('y = ' + lin(a, b, 'x')) + ', determine the <b>output</b> when the input is ' + T('x = ' + x) + '.', type: 'num', answers: [String(a * x + b)], tol: 0,
        hint: 'Substitute the input for x and work out the value.',
        solution: steps([T('y = ' + a + '(' + x + ')' + sgn(b) + ' = ' + (a * x) + sgn(b) + ' = ' + (a * x + b)) + '.']) };
    },
    function () { // reverse: which input gives this output
      var a = pick([2, 3, 4, 5, 6]), b = nz(-9, 9), x = nz(-5, 9), y = a * x + b;
      return { prompt: 'For the relation ' + T('y = ' + lin(a, b, 'x')) + ', what <b>input</b> produces an output of ' + T(String(y)) + '?', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Set y equal to ' + y + ' and solve for x.',
        solution: steps([T(y + ' = ' + lin(a, b, 'x')), T(a + 'x = ' + (y - b)), T('x = ' + x) + '.']) };
    },
    function () { // table of a linear relation -> value far along
      var a = pick([2, 3, 4, 5, -2, -3]), b = ri(-6, 10), far = pick([12, 15, 20, 25, 30]);
      var xs = [1, 2, 3, 4, 5], ys = xs.map(function (x) { return a * x + b; });
      return { prompt: 'The table shows a <b>linear</b> relation.' + Fig.table(xs, ys) + 'Determine the value of ' + T('y') + ' when ' + T('x = ' + far) + '.', type: 'num', answers: [String(a * far + b)], tol: 0,
        hint: 'Find the constant change in y, write the equation y = (change)x + b, then substitute x = ' + far + '.',
        solution: steps(['y changes by ' + a + ' each time x goes up by 1, so ' + T('y = ' + a + 'x + b') + '.', 'Using ' + T(pt(1, ys[0])) + ': ' + T(a + ' + b = ' + ys[0]) + ', so ' + T('b = ' + b) + ' and ' + T('y = ' + lin(a, b, 'x')) + '.', T('y = ' + a + '(' + far + ')' + sgn(b) + ' = ' + (a * far + b)) + '.']) };
    },
    function () { // independent variable
      var c = pick([['the number of hours a student works, h, and the pay they receive, P', 'h', 'P'], ['the number of people at a party, p, and the number of pizzas needed, z', 'p', 'z'], ['the time a candle has burned, t, and its height, H', 't', 'H'], ['the speed of a car, v, and its stopping distance, d', 'v', 'd']]);
      return { prompt: 'A relation connects ' + c[0] + '. Which variable is the <b>independent</b> variable? Type its letter.', type: 'expr', answers: [c[1]], check: 'exact',
        hint: 'The independent variable is the one you choose or control; the other depends on it.',
        solution: steps([T(c[2]) + ' depends on ' + T(c[1]) + ', so ' + T(c[1]) + ' is independent and ' + T(c[2]) + ' is dependent.']) };
    },
    function () { // ordered pair from the relation
      var a = pick([2, 3, 4, -2, -3, 5]), b = nz(-8, 8), x = nz(-5, 6);
      return { prompt: 'The relation is ' + T('y = ' + lin(a, b, 'x')) + '. Write the ordered pair that has ' + T('x = ' + x) + '.', type: 'expr', answers: [pt(x, a * x + b)], check: 'exact', note: 'Type an ordered pair like ' + T('(2, -5)') + '.',
        hint: 'The ordered pair is (input, output). Substitute to get the output.',
        solution: steps([T('y = ' + a + '(' + x + ')' + sgn(b) + ' = ' + (a * x + b)), 'The ordered pair is ' + T(pt(x, a * x + b)) + '.']) };
    },
    function () { // quadrants and coordinates from a labelled grid
      var labs = ['A', 'B', 'C', 'D', 'E', 'F'], raw = [];
      [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(function (q) { raw.push([q[0] * ri(1, 6), q[1] * ri(1, 6)]); });
      var onY = [0, nz(-6, 6)], onX = [nz(-6, 6), 0], firstY = Math.random() < 0.5;
      raw.push(firstY ? onY : onX); if (Math.random() < 0.5) raw.push(firstY ? onX : onY);
      var pts = shuffle(raw).map(function (p, i) { return [p[0], p[1], labs[i]]; });
      var fig = Fig.grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, points: pts });
      var intro = 'The points ' + pts.map(function (p) { return p[2]; }).join(', ') + ' are plotted. Each grid square is 1 unit.' + fig;
      var QN = ['I', 'II', 'III', 'IV'], QD = ['top right (x > 0 and y > 0)', 'top left (x < 0 and y > 0)', 'bottom left (x < 0 and y < 0)', 'bottom right (x > 0 and y < 0)'];
      var quadOf = function (p) { return p[0] > 0 && p[1] > 0 ? 0 : p[0] < 0 && p[1] > 0 ? 1 : p[0] < 0 && p[1] < 0 ? 2 : p[0] > 0 && p[1] < 0 ? 3 : -1; };
      var v = pick(['coords', 'coords', 'quadLetter', 'axisLetter']), qi = ri(0, 3), P = pts.filter(function (p) { return quadOf(p) === qi; })[0];
      if (v === 'axisLetter') {
        var ax = pick(pts.filter(function (p) { return p[0] === 0 || p[1] === 0; })), axName = ax[0] === 0 ? 'y' : 'x';
        return { prompt: intro + 'Which point lies on the ' + T(axName) + '-axis? Type its letter.', type: 'expr', answers: letters(ax[2]), check: 'exact',
          hint: 'A point on the ' + axName + '-axis has ' + (axName === 'y' ? 'x = 0 (it is neither left nor right of the origin).' : 'y = 0 (it is neither above nor below the origin).'),
          solution: steps(['Point ' + ax[2] + ' is at ' + T(pt(ax[0], ax[1])) + ', which has ' + (axName === 'y' ? 'x = 0' : 'y = 0') + '.', 'So ' + ax[2] + ' lies on the ' + axName + '-axis.']) };
      }
      if (v === 'quadLetter') {
        return { prompt: intro + 'Which point lies in Quadrant ' + QN[qi] + '? Type its letter.', type: 'expr', answers: letters(P[2]), check: 'exact',
          hint: 'Quadrants are numbered counter-clockwise starting from the top right: I (top right), II (top left), III (bottom left), IV (bottom right).',
          solution: steps(['Quadrant ' + QN[qi] + ' is the ' + QD[qi] + '.', 'The point there is ' + P[2] + ' at ' + T(pt(P[0], P[1])) + '.']) };
      }
      return { prompt: intro + 'State the coordinates of the point in Quadrant ' + QN[qi] + '.', type: 'expr', answers: [pt(P[0], P[1])], check: 'exact', note: 'Type an ordered pair like ' + T('(-3, 4)') + '.',
        hint: 'Quadrant ' + QN[qi] + ' is the ' + QD[qi] + '. Read across for x, then up or down for y.',
        solution: steps(['Quadrant ' + QN[qi] + ' is the ' + QD[qi] + ', so the point is ' + P[2] + '.', 'It is ' + Math.abs(P[0]) + ' unit' + (Math.abs(P[0]) === 1 ? '' : 's') + ' ' + (P[0] > 0 ? 'right' : 'left') + ' and ' + Math.abs(P[1]) + ' unit' + (Math.abs(P[1]) === 1 ? '' : 's') + ' ' + (P[1] > 0 ? 'up' : 'down') + ': ' + T(pt(P[0], P[1])) + '.']) };
    },
    function () { // rate and fixed fee from a table
      var m = pick([0.5, 0.75, 1.2, 1.5, 2.5]), b = pick([2.5, 3, 3.5, 4]), ds = [0, 2, 4, 6, 8], Fs = ds.map(function (d) { return num(b + m * d); }), wantRate = Math.random() < 0.5;
      return { prompt: 'A taxi charges a fixed pickup fee plus an amount per kilometre. The table shows the fare, ' + T('F') + ' dollars, for a trip of ' + T('d') + ' kilometres.' + Fig.table(ds, Fs, 'd', 'F') + (wantRate ? 'Determine the charge per kilometre (number only).' : 'Determine the fixed pickup fee (number only).'), type: 'num', answers: [num(wantRate ? m : b)], tol: 0.001,
        hint: wantRate ? 'Each time d goes up by 2 km, how much does F go up? Divide that change by 2.' : 'The pickup fee is what you pay before travelling any distance: look at d = 0.',
        solution: steps(['At ' + T('d = 0') + ' the fare is ' + num(b) + ', so the fixed pickup fee is $' + num(b) + '.', 'From ' + T('d = 0') + ' to ' + T('d = 2') + ' the fare rises by ' + num(2 * m) + ', so the charge per kilometre is ' + T(num(2 * m) + ' \\div 2 = ' + num(m)) + '.', 'The relation is ' + T('F = ' + num(b) + ' + ' + num(m) + 'd') + '; the answer is ' + num(wantRate ? m : b) + '.']) };
    },
    function () { // discrete or continuous
      var pool = [['the number of pages in a book', 'D'], ['the time it takes to run a marathon', 'C'], ['the number of siblings a student has', 'D'], ['the volume of water in a bathtub', 'C'], ['the number of pets a family owns', 'D'], ['the height of a plant', 'C'], ['the number of cars in a parking lot', 'D'], ['the temperature of a cup of coffee', 'C'], ['the number of goals scored in a soccer game', 'D'], ['the mass of a pumpkin', 'C'], ['the number of students on a bus', 'D'], ['the distance a cyclist has travelled', 'C'], ['the number of text messages sent in a day', 'D'], ['the length of a shadow', 'C']];
      var c = pick(pool), isD = c[1] === 'D';
      return { prompt: 'Consider the variable: <b>' + c[0] + '</b>.<br>Classify the variable as discrete or continuous. Type D or C.', type: 'expr', answers: isD ? ['D', 'd', 'discrete', 'Discrete'] : ['C', 'c', 'continuous', 'Continuous'], check: 'exact',
        hint: 'Discrete data can only take certain separate values (usually counted: 0, 1, 2, ...). Continuous data can take any value in an interval (usually measured).',
        solution: steps([isD ? 'You count ' + c[0] + ' in whole numbers; there is no value between 2 and 3.' : 'You measure ' + c[0] + '; it can take any value, including decimals.', 'So it is ' + (isD ? 'discrete (D)' : 'continuous (C)') + '.']) };
    },
    function () { // how many of four relations are linear
      var linGens = [
        function () { var m = pick([2, 3, 4, -2, -3, 5]), b = nz(-9, 9); return ['y = ' + lin(m, b, 'x'), 'x has exponent 1 and nothing else is done to it, so it is linear']; },
        function () { var a = pick([2, 3, 4, 5]), b = pick([2, 3, 4, 5, -2, -3]), c = pick([6, 8, 10, 12, 15, 20]); return [a + 'x' + (b < 0 ? ' - ' : ' + ') + Math.abs(b) + 'y = ' + c, 'both variables have exponent 1 (general form), so it is linear']; },
        function () { var k = nz(-9, 9), c = pick([2, 3, 4, 5]); return ['y = \\dfrac{x' + sgn(k) + '}{' + c + '}', 'dividing x + ' + k + ' by ' + c + ' is the same as multiplying by a constant, so it is linear']; },
        function () { var c = pick([2, 3, 4, 5]), m = pick([2, 3, 4, 5]), b = nz(-9, 9); return [c + 'y = ' + lin(c * m, c * b, 'x'), 'dividing both sides by ' + c + ' gives y = ' + lin(m, b, 'x') + ', so it is linear']; }
      ];
      var nonGens = [
        function () { var k = nz(-9, 9); return ['y = x^{2}' + sgn(k), 'x is squared, so it is not linear']; },
        function () { var k = nz(-9, 9); return ['y = x^{3}' + sgn(k), 'x is cubed, so it is not linear']; },
        function () { var k = pick([2, 3, 5, 6, 7, 8, 10, 12]); return ['y = \\dfrac{' + k + '}{x}', 'x is in the denominator, so it is not linear']; },
        function () { var b = pick([2, 3, 4, 5, 10]); return ['y = ' + b + '^{x}', 'x is in the exponent, so it is not linear']; },
        function () { var k = pick([4, 6, 8, 10, 12, 15]); return ['xy = ' + k, 'x and y are multiplied together, so it is not linear']; }
      ];
      var nLin = ri(1, 3), items = shuffle(linGens).slice(0, nLin).map(function (g) { return g().concat(['linear']); }).concat(shuffle(nonGens).slice(0, 4 - nLin).map(function (g) { return g().concat(['not linear']); }));
      items = shuffle(items); var tags = ['(a)', '(b)', '(c)', '(d)'];
      return { prompt: 'How many of these four relations are <b>linear</b>?<br>' + items.map(function (it, i) { return tags[i] + ' ' + T(it[0]); }).join('<br>'), type: 'num', answers: [String(nLin)], tol: 0,
        hint: 'A linear relation has x and y only to the power 1, not multiplied together, and not in a denominator or an exponent. Its graph is a straight line.',
        solution: steps(items.map(function (it, i) { return tags[i] + ' ' + T(it[0]) + ': ' + it[1] + '.'; }).concat([nLin + ' of the four relations ' + (nLin === 1 ? 'is' : 'are') + ' linear.'])) };
    },
    function () { // function test: which input is repeated with two outputs
      var rep = nz(-9, 9), xs = [], y1 = ri(-9, 9), y2 = ri(-9, 9); while (y2 === y1) y2 = ri(-9, 9);
      while (xs.length < 3) { var x = nz(-9, 9); if (x === rep || xs.indexOf(x) >= 0) continue; xs.push(x); }
      var pairs = xs.map(function (x, i) { return [x, i === 0 && Math.random() < 0.6 ? y1 : ri(-9, 9)]; }); // sometimes a repeated OUTPUT as a distractor
      pairs.push([rep, y1]); pairs.push([rep, y2]); pairs = shuffle(pairs);
      var tableForm = Math.random() < 0.5;
      var shown = tableForm ? 'The table shows a relation that is <b>not</b> a function.' + Fig.table(pairs.map(function (p) { return p[0]; }), pairs.map(function (p) { return p[1]; })) : 'The relation ' + T(pairs.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ')) + ' is <b>not</b> a function. ';
      return { prompt: shown + 'Which input is paired with two different outputs?', type: 'num', answers: [String(rep)], tol: 0,
        hint: 'In a function, every input (x-value) has exactly one output. Look for an x-value that appears twice with different y-values. A repeated y-value is fine.',
        solution: steps(['The input ' + T(String(rep)) + ' appears twice: ' + T(pt(rep, y1)) + ' and ' + T(pt(rep, y2)) + '.', 'One input with two different outputs breaks the function rule, so the answer is ' + T(String(rep)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // x-intercept of a line in general form
      var A = pick([2, 3, 4, 5]), xi = nz(-8, 8), B = pick([1, 2, 3, 4, -2, -3]), C = -A * xi; // A x + B y + C = 0 -> x-int = -C/A
      var eq = A + 'x' + (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + 'y' + sgn(C) + ' = 0';
      return { prompt: 'Determine the ' + T('x') + '-intercept of the line ' + T(eq) + '. Write it as an <b>ordered pair</b>.', type: 'expr', answers: [pt(xi, 0)], check: 'exact',
        hint: 'On the x-axis, y = 0. Substitute y = 0 and solve for x.',
        solution: steps(['Set ' + T('y = 0') + ': ' + T(A + 'x' + sgn(C) + ' = 0'), T('x = ' + xi), 'The intercept is ' + T(pt(xi, 0)) + '.']) };
    },
    function () { // y-intercept of y = (ax - b)/c as an exact fraction
      var a = ri(2, 7), b = nz(-11, 11), c = pick([2, 3, 4, 5, 6, 8]);
      while (b % c === 0) b = nz(-11, 11);
      return { prompt: 'Determine the ' + T('y') + '-intercept of ' + T('y = \\dfrac{' + a + 'x' + sgn(b) + '}{' + c + '}') + ' as an exact fraction.', type: 'num', answers: [frac(b, c)], tol: 0,
        hint: 'On the y-axis, x = 0.',
        solution: steps([T('y = \\dfrac{' + a + '(0)' + sgn(b) + '}{' + c + '} = ' + frac(b, c)) + '.']) };
    },
    function () { // x-intercepts of a factorable quadratic
      var p = nz(-7, 7), q = nz(-7, 7); while (q === p) q = nz(-7, 7);
      var bb = -(p + q), cc = p * q;
      return { prompt: 'Determine the ' + T('x') + '-intercepts of ' + T('y = x^{2}' + (bb === 0 ? '' : (bb === 1 ? ' + x' : bb === -1 ? ' - x' : sgn(bb) + 'x')) + sgn(cc)) + '. Type both values.', type: 'expr', answers: ['x=' + p + ', x=' + q], check: 'equivalent', note: 'Type both solutions, e.g. ' + T('x = 3, x = -1') + '.',
        hint: 'Set y = 0 and factor the trinomial. Two numbers that multiply to ' + cc + ' and add to ' + bb + '.',
        solution: steps([T('0 = (x' + sgn(-p) + ')(x' + sgn(-q) + ')'), T('x = ' + p) + ' or ' + T('x = ' + q) + '.']) };
    },
    function () { // range of a discrete relation
      var pts = [], ys = [], n = 5;
      while (pts.length < n) { var x = ri(-6, 6), y = ri(-6, 6); if (pts.some(function (p) { return p[0] === x; })) continue; pts.push([x, y]); if (ys.indexOf(y) < 0) ys.push(y); }
      ys.sort(function (a, b) { return a - b; });
      return { prompt: 'State the <b>range</b> of this relation as a set: ' + T(pts.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ')), type: 'expr', answers: ['\\{' + ys.join(',') + '\\}'], check: 'equivalent', note: SET_NOTE,
        hint: 'The range is the set of all y-values (second coordinates). Do not repeat a value.',
        solution: steps(['The y-values are ' + pts.map(function (p) { return p[1]; }).join(', ') + '.', 'Without repeats, in order: ' + T('\\{' + ys.join(', ') + '\\}') + '.']) };
    },
    function () { // domain of a discrete relation
      var pts = [], xs = [], n = 5;
      while (pts.length < n) { var x = ri(-7, 7), y = ri(-6, 6); pts.push([x, y]); if (xs.indexOf(x) < 0) xs.push(x); }
      xs.sort(function (a, b) { return a - b; });
      return { prompt: 'State the <b>domain</b> of this relation as a set: ' + T(pts.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ')), type: 'expr', answers: ['\\{' + xs.join(',') + '\\}'], check: 'equivalent', note: SET_NOTE,
        hint: 'The domain is the set of all x-values (first coordinates).',
        solution: steps(['The x-values are ' + pts.map(function (p) { return p[0]; }).join(', ') + '.', 'Without repeats: ' + T('\\{' + xs.join(', ') + '\\}') + '.']) };
    },
    function () { // intercept meaning in context, numerically
      var base = pick([120, 150, 200, 250]), rate = pick([0.2, 0.25, 0.4, 0.5]), target = base + rate * pick([400, 600, 800, 1000, 1200]);
      return { prompt: 'A moving company charges ' + T('C = ' + base + ' + ' + rate + 'n') + ' dollars for a move of ' + T('n') + ' km. For what distance does the move cost $' + target + '?', type: 'num', answers: [num((target - base) / rate)], tol: 0,
        hint: 'Substitute C = ' + target + ' and solve for n.',
        solution: steps([T(target + ' = ' + base + ' + ' + rate + 'n'), T(rate + 'n = ' + (target - base)), T('n = ' + num((target - base) / rate)) + ' km.']) };
    },
    function () { // NR: A = output at x = k, B = input giving y0; find A + B
      var a = pick([2, 3, 4, 5, -2, -3]), b = nz(-9, 9), k = nz(-6, 6), x0 = nz(-6, 6); var A = a * k + b, y0 = a * x0 + b;
      return { prompt: 'For the relation ' + T('y = ' + lin(a, b, 'x')) + ':<br>' + T('A') + ' = the output when the input is ' + T('x = ' + k) + '<br>' + T('B') + ' = the input that produces an output of ' + T(String(y0)) + '<br>Determine the value of ' + T('A + B') + '.', type: 'num', answers: [String(A + x0)], tol: 0,
        hint: 'Find A by substituting x = ' + k + '. Find B by setting y = ' + y0 + ' and solving for x. Then add.',
        solution: steps([T('A = ' + a + '(' + k + ')' + sgn(b) + ' = ' + A), T(y0 + ' = ' + lin(a, b, 'x') + ' \\Rightarrow ' + a + 'x = ' + (y0 - b) + ' \\Rightarrow x = ' + x0) + ', so ' + T('B = ' + x0) + '.', T('A + B = ' + A + ' + (' + x0 + ') = ' + (A + x0)) + '.']) };
    },
    function () { // value of the y-intercept of a line in general form (integer or decimal coefficients)
      var A, B, yi, C, dec = Math.random() < 0.4;
      if (dec) { A = pick([0.2, 0.4, 0.5, 0.6, 0.8]); B = pick([0.5, 1.5, 2.5, -0.5, -1.5, -2.5]); yi = nz(-4, 4); }
      else { A = pick([1, 2, 3, 4, 5, 6]); B = pick([2, 3, 4, 5, -2, -3, -4, -5]); yi = nz(-6, 6); }
      C = -B * yi;
      var eq = num(A) + 'x' + (B < 0 ? ' - ' : ' + ') + num(Math.abs(B)) + 'y' + sgnD(C) + ' = 0';
      return { prompt: 'Determine the <b>value</b> of the ' + T('y') + '-intercept of the line ' + T(eq) + '.', type: 'num', answers: [String(yi)], tol: 0.001,
        hint: 'On the y-axis, x = 0. Substitute x = 0 and solve for y. The question asks for the value, not the ordered pair.',
        solution: steps(['Set ' + T('x = 0') + ': ' + T(num(B) + 'y' + sgnD(C) + ' = 0'), T(num(B) + 'y = ' + num(-C)), T('y = ' + yi) + '. The y-intercept has value ' + yi + '.']) };
    },
    function () { // value of the x-intercept of y = (ax + b)/c as an exact fraction
      var a = ri(2, 7), b = nz(-11, 11), c = pick([2, 3, 4, 5, 6, 8]); while (b % a === 0) b = nz(-11, 11);
      return { prompt: 'Determine the <b>value</b> of the ' + T('x') + '-intercept of ' + T('y = \\dfrac{' + a + 'x' + sgn(b) + '}{' + c + '}') + ' as an exact fraction.', type: 'num', answers: [frac(-b, a)], tol: 0,
        hint: 'On the x-axis, y = 0. A fraction equals 0 only when its numerator is 0.',
        solution: steps([T('0 = \\dfrac{' + a + 'x' + sgn(b) + '}{' + c + '}') + ', so ' + T(a + 'x' + sgn(b) + ' = 0') + '.', T(a + 'x = ' + (-b)), T('x = ' + frac(-b, a)) + '.']) };
    },
    function () { // intercepts of a circle, or how many intercepts a graph has
      if (Math.random() < 0.5) {
        var r = ri(3, 9), v = pick(['x', 'y']), other = v === 'x' ? 'y' : 'x';
        return { prompt: 'Determine the ' + T(v) + '-intercepts of ' + T('x^{2} + y^{2} = ' + (r * r)) + '. Type both values.', type: 'expr', answers: [v + '=' + r + ', ' + v + '=-' + r], check: 'equivalent', note: 'Type both, e.g. ' + T(v + ' = 3, ' + v + ' = -3') + '.',
          hint: 'On the ' + v + '-axis, ' + other + ' = 0. Substitute and remember there are two square roots.',
          solution: steps(['Set ' + T(other + ' = 0') + ': ' + T(v + '^{2} = ' + (r * r)), T(v + ' = ' + r) + ' or ' + T(v + ' = -' + r) + '.']) };
      }
      var k = ri(1, 9), s = pick([2, 3, 4, 5]), aa = pick([1, 4, 9]), rr = ri(2, 8);
      var it = pick([
        ['y = x^{2} + ' + k, 'x', 0, T('0 = x^{2} + ' + k) + ' gives ' + T('x^{2} = -' + k) + ', impossible since a square is never negative'],
        ['y = x^{2} - ' + (k * k), 'x', 2, T('0 = x^{2} - ' + (k * k)) + ' gives ' + T('x = \\pm ' + k)],
        [(aa === 1 ? '' : aa) + 'x^{2} - y^{2} = ' + (aa * s * s), 'y', 0, T('x = 0') + ' gives ' + T('-y^{2} = ' + (aa * s * s)) + ', impossible since ' + T('-y^{2}') + ' is never positive'],
        [(aa === 1 ? '' : aa) + 'x^{2} - y^{2} = ' + (aa * s * s), 'x', 2, T('y = 0') + ' gives ' + T((aa === 1 ? '' : aa) + 'x^{2} = ' + (aa * s * s)) + ', so ' + T('x = \\pm ' + s)],
        ['x^{2} + y^{2} = ' + (rr * rr), 'y', 2, T('x = 0') + ' gives ' + T('y^{2} = ' + (rr * rr)) + ', so ' + T('y = \\pm ' + rr)],
        ['y = (x' + sgn(-k) + ')^{2}', 'x', 1, T('0 = (x' + sgn(-k) + ')^{2}') + ' gives the single value ' + T('x = ' + k)]
      ]);
      return { prompt: 'How many ' + T(it[1]) + '-intercepts does the graph of ' + T(it[0]) + ' have?', type: 'num', answers: [String(it[2])], tol: 0,
        hint: 'Set the other variable equal to 0 and count how many solutions the equation has (it may be 0, 1 or 2).',
        solution: steps([it[3] + '.', 'So there ' + (it[2] === 1 ? 'is 1 ' + it[1] + '-intercept' : 'are ' + it[2] + ' ' + it[1] + '-intercepts') + '.']) };
    },
    function () { // range (as a set) or a x b count from a dot graph with a repeated y
      var countForm = Math.random() < 0.4, n = ri(5, 6), pts = [], xs = [];
      while (pts.length < n - 1) { var x = ri(-6, 6); if (xs.indexOf(x) >= 0) continue; xs.push(x); pts.push([x, ri(-6, 6)]); }
      var y = pick(pts)[1], x2 = ri(-6, 6); while (xs.indexOf(x2) >= 0) x2 = ri(-6, 6); pts.push([x2, y]); // forced repeated y-value
      if (countForm && Math.random() < 0.6) { var p = pick(pts), q = pick(pts); if (p !== q && p[1] !== q[1]) q[0] = p[0]; } // sometimes a repeated x too
      pts = shuffle(pts);
      var dom = uniqSorted(pts.map(function (p) { return p[0]; })), rng = uniqSorted(pts.map(function (p) { return p[1]; }));
      var fig = Fig.grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, points: pts });
      if (countForm) {
        return { prompt: 'The relation graphed below is a set of ' + pts.length + ' points. Each grid square is 1 unit.' + fig + 'Let ' + T('a') + ' = the number of elements in the <b>domain</b> and ' + T('b') + ' = the number of elements in the <b>range</b>. Determine ' + T('a \\times b') + '.', type: 'num', answers: [String(dom.length * rng.length)], tol: 0,
          hint: 'List the x-values once each (domain) and the y-values once each (range). A repeated value only counts once.',
          solution: steps(['Domain: ' + T(setD(dom)) + ', so ' + T('a = ' + dom.length) + '.', 'Range: ' + T(setD(rng)) + ', so ' + T('b = ' + rng.length) + '.', T('a \\times b = ' + dom.length + ' \\times ' + rng.length + ' = ' + (dom.length * rng.length)) + '.']) };
      }
      return { prompt: 'State the <b>range</b> of the relation graphed below as a set (increasing order, each value once). Each grid square is 1 unit.' + fig, type: 'expr', answers: [setL(rng)], check: 'equivalent', note: SET_NOTE,
        hint: 'The range is the set of y-values (heights) of the points. A height that two points share is listed only once.',
        solution: steps(['The points are ' + T(pts.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ')) + '.', 'Their y-values, in increasing order and without repeats: ' + T(setD(rng)) + '.']) };
    },
    function () { // how many of four relations (sets of ordered pairs) are functions
      var relSet = function (kind) {
        var pairs = [], xs = [];
        if (kind === 'repx') { var x = ri(-5, 5), y1 = ri(-5, 5), y2 = ri(-5, 5); while (y2 === y1) y2 = ri(-5, 5); pairs.push([x, y1], [x, y2]); xs.push(x); }
        if (kind === 'repy') { var y = ri(-5, 5), x1 = ri(-5, 5), x2 = ri(-5, 5); while (x2 === x1) x2 = ri(-5, 5); pairs.push([x1, y], [x2, y]); xs.push(x1, x2); }
        while (pairs.length < 4) { var px = ri(-5, 5), py = ri(-5, 5); if (xs.indexOf(px) >= 0) continue; xs.push(px); pairs.push([px, py]); }
        return shuffle(pairs);
      };
      var kinds = shuffle(['repx', 'repy', pick(['repx', 'repy', 'plain']), pick(['repx', 'repy', 'plain'])]), rels = kinds.map(relSet), tags = ['(a)', '(b)', '(c)', '(d)'];
      var repeatedX = function (pairs) { var seen = {}; for (var i = 0; i < pairs.length; i++) { if (seen[pairs[i][0]]) return pairs[i][0]; seen[pairs[i][0]] = 1; } return null; };
      var count = rels.filter(function (r) { return repeatedX(r) === null; }).length;
      var show = function (r) { return T('\\{' + r.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ') + '\\}'); };
      return { prompt: 'How many of these four relations are <b>functions</b>?<br>' + rels.map(function (r, i) { return tags[i] + ' ' + show(r); }).join('<br>'), type: 'num', answers: [String(count)], tol: 0,
        hint: 'A relation is a function when no x-value (input) is repeated. Repeated y-values are allowed.',
        solution: steps(rels.map(function (r, i) { var rx = repeatedX(r); return tags[i] + ': ' + (rx === null ? 'every x-value is different, so it is a function' : 'the input ' + rx + ' appears twice with different outputs, so it is not a function') + '.'; }).concat([count + ' of the four relations ' + (count === 1 ? 'is a function' : 'are functions') + '.'])) };
    },
    function () { // vertical line test on a circle: two y-values for one x
      var r, a, b;
      if (Math.random() < 0.7) { r = 5; a = pick([3, -3, 4, -4]); b = Math.abs(a) === 3 ? 4 : 3; } else { r = pick([3, 4, 5, 6, 7]); a = 0; b = r; }
      var up = function (x) { return Math.sqrt(Math.max(0, r * r - x * x)); }, dn = function (x) { return -Math.sqrt(Math.max(0, r * r - x * x)); };
      var fig = Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, curves: [{ f: up, from: -r, to: r }, { f: dn, from: -r, to: r }], lines: [{ x: a, dashed: true }], points: [[a, b], [a, -b]] });
      return { prompt: 'The graph of ' + T('x^{2} + y^{2} = ' + (r * r)) + ' is shown with the vertical line ' + T('x = ' + a) + '. Each grid square is 1 unit.' + fig + 'State the two ' + T('y') + '-values on the graph when ' + T('x = ' + a) + '. Type both.', type: 'expr', answers: ['y=' + b + ', y=-' + b], check: 'equivalent', note: 'Type both, e.g. ' + T('y = 4, y = -4') + '.',
        hint: 'The vertical line crosses the circle twice, so this relation is not a function. Substitute x = ' + a + ' into the equation and solve for y, or read the two crossing points from the graph.',
        solution: steps([T('(' + a + ')^{2} + y^{2} = ' + (r * r)), T('y^{2} = ' + (r * r - a * a)), T('y = ' + b) + ' or ' + T('y = -' + b) + '. One input gives two outputs, so the graph fails the vertical line test.']) };
    }
  ];

  var A_MAS = [
    function () { // range / domain bound of a circle
      var h = nz(-6, 6), k = nz(-6, 6), r = ri(3, 9), which = pick(['range', 'domain']);
      var lo = which === 'range' ? k - r : h - r, hi = which === 'range' ? k + r : h + r, v = which === 'range' ? 'y' : 'x';
      var want = pick(['a', 'b']);
      return { prompt: 'A circle has centre ' + T(pt(h, k)) + ' and radius ' + T(String(r)) + '. Its ' + which + ' is ' + T('\\{' + v + ' \\mid a \\le ' + v + ' \\le b,\\ ' + v + ' \\in R\\}') + '. Determine the value of ' + T(want) + '.', type: 'num', answers: [String(want === 'a' ? lo : hi)], tol: 0,
        hint: 'The circle reaches r units above and below (and left and right of) its centre.',
        solution: steps(['The ' + v + '-values run from ' + T((which === 'range' ? k : h) + ' - ' + r + ' = ' + lo) + ' to ' + T((which === 'range' ? k : h) + ' + ' + r + ' = ' + hi) + '.', T(want + ' = ' + (want === 'a' ? lo : hi)) + '.']) };
    },
    function () { // product of intercepts of a x^2 - b y = c
      var a = pick([1, 2, 3]), root = ri(2, 6), b = pick([2, 3, 4, 5]); var c = a * root * root; // x-int ±root, y-int -c/b
      while (c % b !== 0) { b = pick([1, 2, 3, 4, 5, 6]); }
      var yi = -c / b, prod = root * (-root) * yi;
      return { prompt: 'The graph of ' + T((a === 1 ? '' : a) + 'x^{2} - ' + (b === 1 ? '' : b) + 'y = ' + c) + ' has ' + T('x') + '-intercepts ' + T('p') + ' and ' + T('q') + ', and ' + T('y') + '-intercept ' + T('r') + '. Determine the value of ' + T('pqr') + '.', type: 'num', answers: [String(prod)], tol: 0,
        hint: 'x-intercepts: set y = 0. y-intercept: set x = 0. Then multiply the three numbers.',
        solution: steps(['y = 0: ' + T((a === 1 ? '' : a) + 'x^{2} = ' + c) + ', so ' + T('x = \\pm ' + root) + '.', 'x = 0: ' + T('-' + b + 'y = ' + c) + ', so ' + T('y = ' + yi) + '.', T('pqr = (' + root + ')(-' + root + ')(' + yi + ') = ' + prod) + '.']) };
    },
    function () { // endpoints of a segment graph: smallest / largest value in the range or domain
      var x1 = ri(-6, -1), x2 = ri(1, 6), y1 = nz(-6, 6), y2 = nz(-6, 6); while (y2 === y1) y2 = nz(-6, 6);
      var which = pick(['range', 'domain']), want = pick(['smallest', 'largest']);
      var vals = which === 'range' ? [y1, y2] : [x1, x2], ans = want === 'smallest' ? Math.min(vals[0], vals[1]) : Math.max(vals[0], vals[1]);
      return { prompt: 'The graph is a line segment with endpoints ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + ' (both included).' + Fig.grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, segments: [[x1, y1, x2, y2]], points: [[x1, y1], [x2, y2]] }) + 'What is the <b>' + want + '</b> value in its <b>' + which + '</b>?', type: 'num', answers: [String(ans)], tol: 0,
        hint: (which === 'range' ? 'The range is the set of y-values the graph reaches: everything between the lowest and highest point.' : 'The domain is the set of x-values the graph covers: from the left end to the right end.'),
        solution: steps(['The ' + which + ' is ' + T('\\{' + (which === 'range' ? 'y' : 'x') + ' \\mid ' + Math.min(vals[0], vals[1]) + ' \\le ' + (which === 'range' ? 'y' : 'x') + ' \\le ' + Math.max(vals[0], vals[1]) + ',\\ ' + (which === 'range' ? 'y' : 'x') + ' \\in R\\}') + '.', 'The ' + want + ' value is ' + T(String(ans)) + '.']) };
    },
    function () { // projectile that factors: when does it land
      var r = ri(2, 6), s = ri(1, 4), k = pick([5, 5, 4, 2]); // h = -k(t - r)(t + s) = -k t^2 + k(r - s) t + k r s
      var b = k * (r - s), c = k * r * s, name = pick(['ball', 'arrow', 'stone', 'flare']);
      var eq = 'h = -' + k + 't^{2}' + (b === 0 ? '' : sgn(b) + 't') + sgn(c);
      return { prompt: 'A ' + name + ' is launched from a ledge. Its height, ' + T('h') + ' metres, after ' + T('t') + ' seconds is ' + T(eq) + '. When does it hit the ground? (seconds)', type: 'num', answers: [String(r)], tol: 0,
        hint: 'The ground is h = 0. Factor out ' + (-k) + ' and then factor the trinomial. Only the positive time makes sense.',
        solution: steps([T('0 = -' + k + '(t^{2}' + (r - s === 0 ? '' : sgn(-(r - s)) + 't') + sgn(-r * s) + ')'), T('0 = -' + k + '(t - ' + r + ')(t + ' + s + ')'), T('t = ' + r) + ' (the negative time, ' + T('t = -' + s) + ', is before the launch).']) };
    },
    function () { // maximum height of a symmetric model / time of the maximum
      var tv = ri(1, 5), k = 5, c = pick([0, 2, 4, 6, 9]); var b = 2 * k * tv, hmax = k * tv * tv + c, askTime = Math.random() < 0.4;
      return { prompt: 'A ball is thrown upward. Its height, ' + T('h') + ' metres, after ' + T('t') + ' seconds is ' + T('h = -5t^{2} + ' + b + 't' + (c ? ' + ' + c : '')) + '. ' + (askTime ? 'After how many seconds does it reach its <b>maximum height</b>? (seconds, number only)' : 'What is its <b>maximum height</b>? (metres)'), type: 'num', answers: [String(askTime ? tv : hmax)], tol: 0,
        hint: 'The highest point is halfway between the two times when ' + (c ? 'the ball is back at its starting height (h = ' + c + ')' : 'the height is 0') + (askTime ? '. Find those two times first.' : ': at ' + T('t = ' + tv) + '. Substitute that time.'),
        solution: steps([T('-5t^{2} + ' + b + 't = 0 \\Rightarrow -5t(t - ' + (2 * tv) + ') = 0') + ', so the ' + (c ? 'starting height' : 'ground') + ' is reached at ' + T('t = 0') + ' and ' + T('t = ' + (2 * tv)) + '.', 'The peak is halfway, at ' + T('t = ' + tv) + (askTime ? ' seconds. That is the answer.' : '.'), T('h = -5(' + tv + ')^{2} + ' + b + '(' + tv + ')' + (c ? ' + ' + c : '') + ' = ' + hmax) + ' m' + (askTime ? ' is the maximum height.' : '.')]) };
    },
    function () { // domain in context from a falling model h = H - 5t^2
      var k = ri(3, 16), H = 5 * k * k, obj = pick(['sandbag', 'crate', 'stone']);
      return { prompt: 'A ' + obj + ' is dropped from a balloon. Its height is ' + T('h(t) = ' + H + ' - 5t^{2}') + ' metres, ' + T('t') + ' seconds after release. The domain that fits the situation is ' + T('\\{t \\mid 0 \\le t \\le b,\\ t \\in R\\}') + '. Determine ' + T('b') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'The situation ends when the ' + obj + ' lands: h = 0.',
        solution: steps([T('0 = ' + H + ' - 5t^{2}'), T('t^{2} = ' + (k * k)), T('t = ' + k) + ' (time cannot be negative), so ' + T('b = ' + k) + '.']) };
    },
    function () { // one-sided bound of the range from a parabola or V with arrows
      var h = ri(-3, 3), k = ri(-4, 4), up = Math.random() < 0.5, vee = Math.random() < 0.4, fig, desc;
      if (vee) {
        var e = Math.min(up ? 8 - k : k + 8, 8 - Math.abs(h)), yEnd = up ? k + e : k - e;
        fig = Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, segments: [[h, k, h - e, yEnd], [h, k, h + e, yEnd]], arrows: true, points: [[h, k]] });
        desc = 'V-shaped graph';
      } else {
        var f = function (x) { return up ? (x - h) * (x - h) + k : -(x - h) * (x - h) + k; }, w = Math.sqrt(up ? 8 - k : k + 8), d = 0.35;
        fig = Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, curves: [{ f: f, from: h - w, to: h + w }], segments: [[h - w + d, f(h - w + d), h - w, f(h - w)], [h + w - d, f(h + w - d), h + w, f(h + w)]], arrows: true, points: [[h, k]] });
        desc = 'parabola';
      }
      return { prompt: 'The graph shown continues in the direction of the arrows. Each grid square is 1 unit.' + fig + 'The range is ' + T('\\{y \\mid y ' + (up ? '\\ge' : '\\le') + ' k,\\ y \\in R\\}') + '. Determine ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'The ' + desc + ' has a ' + (up ? 'lowest' : 'highest') + ' point, its vertex. The range ' + (up ? 'starts' : 'ends') + ' at that y-value and the arrows show it goes on forever the other way.',
        solution: steps(['The vertex is at ' + T(pt(h, k)) + ' and the arms go ' + (up ? 'up' : 'down') + ' forever.', 'Every y-value on the graph is ' + (up ? 'at least' : 'at most') + ' ' + k + ', so ' + T('k = ' + k) + '.']) };
    },
    function () { // hollow endpoint: which x-value is not in the domain
      var x1 = ri(-6, -1), x2 = ri(1, 6), y1 = nz(-6, 6), y2 = nz(-6, 6); while (y2 === y1) y2 = nz(-6, 6);
      var openLeft = Math.random() < 0.5, ans = openLeft ? x1 : x2;
      var fig = Fig.grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, segments: [[x1, y1, x2, y2]], points: [[x1, y1, '', openLeft], [x2, y2, '', !openLeft]] });
      return { prompt: 'The graph is a line segment. One endpoint is drawn as an <b>open</b> (hollow) circle, meaning that point is <b>not</b> included; the solid endpoint is included. Each grid square is 1 unit.' + fig + 'Which ' + T('x') + '-value is NOT in the domain: the left end or the right end? Type that ' + T('x') + '-value.', type: 'num', answers: [String(ans)], tol: 0,
        hint: 'Find the hollow circle. Its x-value is left out of the domain; everything between the ends, and the solid end, is included.',
        solution: steps(['The hollow endpoint is at ' + T(pt(ans, openLeft ? y1 : y2)) + ', the ' + (openLeft ? 'left' : 'right') + ' end.', 'The domain is ' + T('\\{x \\mid ' + x1 + (openLeft ? ' < ' : ' \\le ') + 'x' + (openLeft ? ' \\le ' : ' < ') + x2 + ',\\ x \\in R\\}') + ', so ' + T('x = ' + ans) + ' is not included.']) };
    },
    function () { // practical range of a linear model, or how many ordered pairs a discrete relation has
      if (Math.random() < 0.5) {
        var b0 = pick([5, 6, 8, 10, 12]), m = pick([2, 3, 4, 5]), dmin = pick([1, 2, 3, 5]), dmax = pick([10, 15, 20, 25, 30]), lo = b0 + m * dmin, hi = b0 + m * dmax, want = pick(['a', 'b']);
        return { prompt: 'A courier charges ' + T('C = ' + b0 + ' + ' + m + 'd') + ' dollars to deliver a parcel ' + T('d') + ' km, for deliveries with ' + T(dmin + ' \\le d \\le ' + dmax) + '. The range is ' + T('\\{C \\mid a \\le C \\le b,\\ C \\in R\\}') + '. Determine ' + T(want) + '.', type: 'num', answers: [String(want === 'a' ? lo : hi)], tol: 0,
          hint: 'The range is the set of possible costs. The cheapest delivery is the shortest one and the dearest is the longest one: substitute d = ' + dmin + ' and d = ' + dmax + '.',
          solution: steps([T('C(' + dmin + ') = ' + b0 + ' + ' + m + '(' + dmin + ') = ' + lo) + ' and ' + T('C(' + dmax + ') = ' + b0 + ' + ' + m + '(' + dmax + ') = ' + hi) + '.', 'The range is ' + T('\\{C \\mid ' + lo + ' \\le C \\le ' + hi + ',\\ C \\in R\\}') + ', so ' + T(want + ' = ' + (want === 'a' ? lo : hi)) + '.']) };
      }
      var p = pick([8, 10, 12, 15, 20, 25]), nmax = pick([120, 150, 180, 200, 240, 300]), ctx = pick([['theatre', 'tickets'], ['bake sale', 'pies'], ['car wash', 'washes']]);
      return { prompt: 'A ' + ctx[0] + ' sells ' + ctx[1] + ' at $' + p + ' each. Its revenue is ' + T('R = ' + p + 'n') + ', where ' + T('n') + ' is the number of ' + ctx[1] + ' sold and ' + T('0 \\le n \\le ' + nmax + ',\\ n \\in I') + '. How many ordered pairs does the relation contain?', type: 'num', answers: [String(nmax + 1)], tol: 0,
        hint: 'n ∈ I means n must be a whole number (you cannot sell half of one). Count the integers from 0 to ' + nmax + ', including both ends. Each gives one ordered pair (n, R).',
        solution: steps(['The possible inputs are ' + T('n = 0, 1, 2, \\ldots, ' + nmax) + '.', 'From 0 to ' + nmax + ' inclusive there are ' + T(nmax + ' + 1 = ' + (nmax + 1)) + ' integers, so the relation has ' + (nmax + 1) + ' ordered pairs.']) };
    },
    function () { // symmetry of a quadratic model: the other time at the same height
      var tv = ri(2, 6), t1 = ri(1, tv - 1), t2 = 2 * tv - t1, b = 10 * tv, c = pick([0, 1, 2, 3, 5]), h1 = -5 * t1 * t1 + b * t1 + c, h2 = -5 * t2 * t2 + b * t2 + c;
      var eq = 'h = -5t^{2} + ' + b + 't' + (c ? ' + ' + c : '');
      return { prompt: 'A ball is thrown upward. Its height, ' + T('h') + ' metres, after ' + T('t') + ' seconds is ' + T(eq) + '. The ball is at the same height at ' + T('t = ' + t1) + ' and at one other time. Determine that time (seconds, number only).', type: 'num', answers: [String(t2)], tol: 0,
        hint: 'The flight is symmetric about the time of the maximum height, which is halfway between the two times when the ball is at its starting height. The other time is the same distance from the peak as t = ' + t1 + ', on the other side.',
        solution: steps([T('-5t^{2} + ' + b + 't = 0 \\Rightarrow -5t(t - ' + (2 * tv) + ') = 0') + ', so the starting height is reached at ' + T('t = 0') + ' and ' + T('t = ' + (2 * tv)) + '; the peak is at ' + T('t = ' + tv) + '.', T('t = ' + t1) + ' is ' + (tv - t1) + ' s before the peak, so the matching time is ' + (tv - t1) + ' s after it: ' + T('t = ' + tv + ' + ' + (tv - t1) + ' = ' + t2) + '.', 'Check: ' + T('h(' + t1 + ') = ' + h1) + ' and ' + T('h(' + t2 + ') = ' + h2) + '.']) };
    }
  ];

  /* ---------- RF8 · functions: notation, graphs, rate of change ---------- */
  var B_BEG = [
    function () { // evaluate a quadratic function at a negative
      var a = ri(2, 12), x = -ri(2, 6), nm = pick(['g', 'f', 'h']);
      return { prompt: 'If ' + T(nm + '(x) = ' + a + ' - x^{2}') + ', evaluate ' + T(nm + '(' + x + ')') + '.', type: 'num', answers: [String(a - x * x)], tol: 0,
        hint: 'Replace every x with ' + x + '. Remember that squaring a negative number gives a positive.',
        solution: steps([T(nm + '(' + x + ') = ' + a + ' - (' + x + ')^{2} = ' + a + ' - ' + (x * x) + ' = ' + (a - x * x)) + '.']) };
    },
    function () { // evaluate a linear function (three wordings)
      var m = pick([2, 3, 4, 5, -2, -3]), b = nz(-9, 9), x = nz(-6, 8), nm = pick(['f', 'g', 'p']), w = pick(['plain', 'image', 'value']);
      var ask = w === 'image' ? 'determine the <b>image</b> of ' + T(String(x)) + ' under ' + T(nm) + '.' : w === 'value' ? 'determine the value of ' + T(nm) + ' when ' + T('x = ' + x) + '.' : 'determine ' + T(nm + '(' + x + ')') + '.';
      return { prompt: 'If ' + T(nm + '(x) = ' + lin(m, b, 'x')) + ', ' + ask, type: 'num', answers: [String(m * x + b)], tol: 0,
        hint: nm + '(' + x + ') means "the output when the input is ' + x + '".',
        solution: steps([T(nm + '(' + x + ') = ' + m + '(' + x + ')' + sgn(b) + ' = ' + (m * x + b)) + '.']) };
    },
    function () { // solve f(x) = k
      var m = pick([2, 3, 4, 5, -2, -4]), b = nz(-9, 9), x = nz(-6, 8), k = m * x + b, nm = pick(['f', 'g', 'h']);
      return { prompt: 'If ' + T(nm + '(x) = ' + lin(m, b, 'x')) + ', determine the value of ' + T('x') + ' for which ' + T(nm + '(x) = ' + k) + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'This time the output is known. Set the expression equal to ' + k + ' and solve.',
        solution: steps([T(lin(m, b, 'x') + ' = ' + k), T(m + 'x = ' + (k - b)), T('x = ' + x) + '.']) };
    },
    function () { // read f(a) from a graph of a line
      var m = pick([1, -1, 2, -2, 0.5, -0.5]), b = ri(-3, 3), a = pick([-4, -2, 2, 4]); var y = m * a + b;
      if (y !== Math.round(y)) { a = pick([-4, -2, 2, 4]); y = m * a + b; }
      return { prompt: 'The graph of ' + T('y = f(x)') + ' is shown. Each grid square is 1 unit.' + Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, ylabel: 'f(x)', lines: [{ m: m, b: b }] }) + 'Determine ' + T('f(' + a + ')') + '.', type: 'num', answers: [String(y)], tol: 0,
        hint: 'Go to x = ' + a + ' on the horizontal axis, up or down to the line, and read the y-value.',
        solution: steps(['At ' + T('x = ' + a) + ' the line is at height ' + T(String(y)) + ', so ' + T('f(' + a + ') = ' + y) + '.']) };
    },
    function () { // write in function notation
      var m = pick([2, 3, 5, -2, -3, 4]), b = nz(-8, 8), nm = pick(['f', 'g', 'C']);
      return { prompt: 'Write the relation ' + T('y = ' + lin(m, b, 'x')) + ' in function notation, using ' + T(nm) + ' as the name of the function.', type: 'expr', answers: [nm + '(x)=' + lin(m, b, 'x')], check: 'exact', note: 'Type it as ' + T(nm + '(x) = \\ldots') + '.',
        hint: 'Function notation replaces y with ' + nm + '(x).',
        solution: steps([T(nm + '(x) = ' + lin(m, b, 'x')) + '.']) };
    },
    function () { // meaning of f(0): starting value
      var H = pick([1200, 980, 1500, 800]), k = pick([4, 5, 9]), obj = pick(['sandbag', 'drone package', 'rope']);
      return { prompt: 'A ' + obj + ' is released from a balloon. Its height is ' + T('h(t) = ' + H + ' - ' + k + 't^{2}') + ' metres after ' + T('t') + ' seconds. Determine ' + T('h(0)') + ', the height at the moment of release.', type: 'num', answers: [String(H)], tol: 0,
        hint: 'Substitute t = 0.',
        solution: steps([T('h(0) = ' + H + ' - ' + k + '(0)^{2} = ' + H) + ' m.']) };
    },
    function () { // mapping notation on a finite domain -> list the range
      var nm = pick(['f', 'g', 'h']), dom, rule, vals, how;
      if (Math.random() < 0.5) {
        var m = pick([2, 3, 4, 5, -2, -3]), b = nz(-6, 6); dom = pick([[0, 1, 2, 3], [1, 2, 3, 4], [-2, -1, 0, 1, 2], [-1, 0, 1, 2], [-3, -1, 1, 3], [0, 2, 4, 6]]);
        rule = lin(m, b, 'x'); vals = dom.map(function (x) { return m * x + b; }); how = dom.map(function (x, i) { return T(m + '(' + x + ')' + sgn(b) + ' = ' + vals[i]); }).join(', ');
      } else {
        var c = nz(-9, 9), s = pick([1, 1, 2]); dom = pick([[-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1], [-1, 0, 1, 2, 3], [-2, 0, 2], [-3, -1, 1, 3]]);
        rule = (s === 1 ? '' : s) + 'x^{2}' + sgn(c); vals = dom.map(function (x) { return s * x * x + c; }); how = dom.map(function (x, i) { return T((s === 1 ? '' : s) + '(' + x + ')^{2}' + sgn(c) + ' = ' + vals[i]); }).join(', ');
      }
      var rng = uniqSorted(vals);
      return { prompt: 'The function ' + T(nm + ': x \\to ' + rule) + ' has domain ' + T(setD(dom)) + '. List the elements of the range.', type: 'expr', answers: [setL(rng)], check: 'equivalent', note: SET_NOTE,
        hint: 'x → ' + rule.replace(/\^\{2\}/g, '²') + ' means "send x to ' + rule.replace(/\^\{2\}/g, '²') + '". Apply the rule to every element of the domain; list each output once.',
        solution: steps(['Apply the rule to each input: ' + how + '.', 'The range is the set of outputs' + (rng.length < vals.length ? ' (a repeated output is listed once)' : '') + ': ' + T(setD(rng)) + '.']) };
    },
    function () { // function notation -> equation in two variables
      var nm = pick(['h', 'g', 'f']), v = pick(['t', 'x', 'n']), expr, quadratic = Math.random() < 0.6;
      if (quadratic) { var b = nz(-6, 6), c = nz(-9, 9); expr = poly2(1, b, c, v); } else { var m = pick([2, 3, 4, 5, -2, -3]), b2 = nz(-9, 9); expr = lin(m, b2, v); }
      return { prompt: 'Express ' + T(nm + '(' + v + ') = ' + expr) + ' as an equation in two variables.', type: 'expr', answers: ['y=' + expr, nm + '=' + expr], check: 'exact', note: 'Type it as ' + T('y = \\ldots') + ', keeping the variable ' + T(v) + '.',
        hint: nm + '(' + v + ') is the output, the dependent variable. Replace it with y (the rule on the right stays the same).',
        solution: steps([T(nm + '(' + v + ')') + ' names the output, so replace it with ' + T('y') + '.', T('y = ' + expr) + '.']) };
    },
    function () { // general form -> function notation
      var A = ri(1, 6), B = pick([2, 3, 4, 5, -2, -3, -4, -5]), b = nz(-5, 5), C = -B * b; // A x + B y + C = 0 -> y = -A/B x + b
      var g = gcd(A, B), n = -A / g, d = B / g; if (d < 0) { n = -n; d = -d; }
      var eq = (A === 1 ? '' : A) + 'x' + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'y' + sgn(C) + ' = 0';
      var answers, shown;
      if (d === 1) { answers = ['f(x)=' + lin(n, b, 'x')]; shown = lin(n, b, 'x'); }
      else {
        var an = Math.abs(n), sg = n < 0 ? '-' : '';
        answers = [sg + '\\frac{' + an + '}{' + d + '}x', sg + '\\frac{' + an + 'x}{' + d + '}', '\\frac{' + n + '}{' + d + '}x', '\\frac{' + n + 'x}{' + d + '}'].map(function (t) { return 'f(x)=' + t + sgn(b); });
        shown = sg + '\\dfrac{' + an + '}{' + d + '}x' + sgn(b);
      }
      return { prompt: 'Express ' + T(eq) + ' in function notation, using ' + T('f') + ' as the name of the function.', type: 'expr', answers: answers, check: 'exact', note: 'Type it as ' + T('f(x) = \\ldots') + ' with the right side simplified.',
        hint: 'First solve the equation for y (get y alone on one side). Then replace y with f(x).',
        solution: steps([T(B + 'y = ' + lin(-A, -C, 'x')), T('y = ' + shown), 'Replace y with f(x): ' + T('f(x) = ' + shown) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // f(x - k) simplified
      var a = pick([1, 2, 3]), b = nz(-5, 5), c = nz(-6, 6), k = pick([1, 2, 3, -1, -2]), nm = pick(['f', 'g']);
      // f(x+k) = a(x+k)^2 + b(x+k) + c = a x^2 + (2ak + b) x + (a k^2 + b k + c)
      var B2 = 2 * a * k + b, C2 = a * k * k + b * k + c;
      var fx = (a === 1 ? '' : a) + 'x^{2}' + (b === 0 ? '' : b === 1 ? ' + x' : b === -1 ? ' - x' : sgn(b) + 'x') + sgn(c);
      var ans = (a === 1 ? '' : a) + 'x^{2}' + (B2 === 0 ? '' : B2 === 1 ? '+x' : B2 === -1 ? '-x' : (B2 < 0 ? '-' : '+') + Math.abs(B2) + 'x') + (C2 === 0 ? '' : (C2 < 0 ? '-' : '+') + Math.abs(C2));
      var arg = 'x' + sgn(k);
      return { prompt: 'If ' + T(nm + '(x) = ' + fx) + ', determine a simplified expression for ' + T(nm + '(' + arg + ')') + '.', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Replace every x with (' + arg + '), expand the square, then collect like terms.',
        solution: steps([T(nm + '(' + arg + ') = ' + (a === 1 ? '' : a) + '(' + arg + ')^{2}' + (b === 0 ? '' : (b < 0 ? ' - ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + '(' + arg + ')') + sgn(c)), T('(' + arg + ')^{2} = x^{2}' + sgn(2 * k) + 'x + ' + (k * k)), T('= ' + ans) + '.']) };
    },
    function () { // f(a + 3) for a linear function
      var m = pick([2, 3, 4, 5, -2, -3]), b = nz(-7, 7), k = pick([1, 2, 3, 4, -1, -2]), nm = pick(['f', 'g', 'h']), v = pick(['a', 't', 'k']);
      var ans = lin(m, m * k + b, v);
      return { prompt: 'If ' + T(nm + '(x) = ' + lin(m, b, 'x')) + ', determine a simplified expression for ' + T(nm + '(' + v + sgn(k) + ')') + '.', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Substitute the whole expression (' + v + sgn(k) + ') for x, distribute, then collect the constants.',
        solution: steps([T(nm + '(' + v + sgn(k) + ') = ' + m + '(' + v + sgn(k) + ')' + sgn(b)), T('= ' + m + v + sgn(m * k) + sgn(b)), T('= ' + ans) + '.']) };
    },
    function () { // solve f(x) = k from a graph of a line
      var m = pick([1, -1, 2, -2, 0.5, -0.5]), b = ri(-3, 3), x = pick([-4, -2, 2, 4, 1, -1, 3, -3]); var k = m * x + b;
      while (k !== Math.round(k) || Math.abs(k) > 6) { x = pick([-4, -2, 2, 4]); k = m * x + b; }
      return { prompt: 'The graph of ' + T('y = f(x)') + ' is shown. Each grid square is 1 unit.' + Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, ylabel: 'f(x)', lines: [{ m: m, b: b }] }) + 'Solve ' + T('f(x) = ' + k) + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Find the height y = ' + k + ' on the vertical axis, go across to the line, and read the x-value under it.',
        solution: steps(['The line is at height ' + T(String(k)) + ' when ' + T('x = ' + x) + ', so the solution is ' + T('x = ' + x) + '.']) };
    },
    function () { // solve f(x) = k for a quadratic, two answers
      var r = ri(2, 7), c = nz(-9, 9), k = c + r * r; var cc = -c; // f(x) = x^2 - cc... let f(x) = x^2 + c ; f(x) = k -> x^2 = k - c = r^2
      return { prompt: 'If ' + T('f(x) = x^{2}' + sgn(c)) + ', solve ' + T('f(x) = ' + k) + '. Type every solution.', type: 'expr', answers: ['x=' + r + ', x=-' + r], check: 'equivalent', note: 'Type both solutions, e.g. ' + T('x = 3, x = -3') + '.',
        hint: 'Set x² ' + sgn(c) + ' equal to ' + k + ', isolate x², and remember there are two square roots.',
        solution: steps([T('x^{2}' + sgn(c) + ' = ' + k), T('x^{2} = ' + (r * r)), T('x = ' + r) + ' or ' + T('x = -' + r) + '.']) };
    },
    function () { // linear function from a table, evaluate far
      var m = pick([2, 3, 4, 5, -2, -3, -4]), b = nz(-9, 9), far = pick([10, 12, 15, 20, 25]);
      var xs = [0, 1, 2, 3], ys = xs.map(function (x) { return m * x + b; });
      return { prompt: 'The table shows some values of a <b>linear</b> function ' + T('f') + '.' + Fig.table(xs, ys, 'x', 'f(x)') + 'Determine ' + T('f(' + far + ')') + '.', type: 'num', answers: [String(m * far + b)], tol: 0,
        hint: 'f(0) gives the constant; the change per step gives the constant change (how much it goes up each time). Then substitute.',
        solution: steps([T('f(0) = ' + b) + ' and each step changes f(x) by ' + m + ', so ' + T('f(x) = ' + lin(m, b, 'x')) + '.', T('f(' + far + ') = ' + m + '(' + far + ')' + sgn(b) + ' = ' + (m * far + b)) + '.']) };
    },
    function () { // input giving a required output, quadratic model in context (factorable)
      var r = ri(3, 8), c = pick([2, 4, 6]); var H = 5 * r * r + c; // h(t) = H - 5t^2 ; h = c when t = r
      return { prompt: 'The height of a dropped ball is ' + T('h(t) = ' + H + ' - 5t^{2}') + ' metres after ' + T('t') + ' seconds. After how many seconds is the ball ' + T(String(c)) + ' m above the ground?', type: 'num', answers: [String(r)], tol: 0,
        hint: 'Set h(t) = ' + c + ' and solve for t. Keep the positive time.',
        solution: steps([T(c + ' = ' + H + ' - 5t^{2}'), T('5t^{2} = ' + (H - c)), T('t^{2} = ' + (r * r)) + ', so ' + T('t = ' + r) + ' s.']) };
    },
    function () { // reading a zigzag graph of y = m(x)
      var xs, ys, dx, tries = 0;
      do { // lattice zigzag: every change in y is a multiple of the x-step, so values at integer x are integers
        xs = pick([[-6, -2, 2, 6], [-6, -3, 0, 3, 6]]); dx = xs[1] - xs[0]; ys = [ri(-6, 6)]; var dir = pick([1, -1]), ok = true;
        for (var i = 1; i < xs.length; i++) { var cands = []; for (var kk = 1; kk <= 3; kk++) { var yy = ys[i - 1] + dir * kk * dx; if (yy >= -6 && yy <= 6) cands.push(yy); } if (!cands.length) { ok = false; break; } ys.push(pick(cands)); dir = -dir; }
      } while (!ok && ++tries < 200);
      var segs = [], vtx = []; for (var j = 0; j < xs.length; j++) { vtx.push([xs[j], ys[j]]); if (j + 1 < xs.length) segs.push([xs[j], ys[j], xs[j + 1], ys[j + 1]]); }
      var mAt = function (x) { for (var i = 0; i + 1 < xs.length; i++) if (x >= xs[i] && x <= xs[i + 1]) return ys[i] + (ys[i + 1] - ys[i]) / dx * (x - xs[i]); return NaN; };
      var solve = function (v) { var out = []; for (var i = 0; i + 1 < xs.length; i++) { var lo = Math.min(ys[i], ys[i + 1]), hi = Math.max(ys[i], ys[i + 1]); if (v < lo || v > hi) continue; var x = ys[i + 1] === ys[i] ? xs[i] : xs[i] + (v - ys[i]) * dx / (ys[i + 1] - ys[i]); x = Math.round(x * 1e6) / 1e6; if (out.indexOf(x) < 0) out.push(x); } return out.sort(function (a, b) { return a - b; }); };
      var fig = Fig.grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, ylabel: 'm(x)', segments: segs, points: vtx });
      var intro = 'The graph of ' + T('y = m(x)') + ' is shown. Each grid square is 1 unit.' + fig, lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
      var v = pick(['eval', 'solve', 'count', 'yint', 'range']);
      if (v === 'solve') { // need a value with at least two integer solutions
        var good = []; for (var val = lo; val <= hi; val++) { var s = solve(val); if (s.length >= 2 && s.every(function (x) { return x === Math.round(x); })) good.push(val); }
        if (!good.length) v = 'eval'; else {
          var target = pick(good), sols = solve(target);
          return { prompt: intro + 'State every value of ' + T('x') + ' for which ' + T('m(x) = ' + target) + '. Type all solutions.', type: 'expr', answers: [sols.map(function (x) { return 'x=' + x; }).join(', ')], check: 'equivalent', note: 'Type every solution, e.g. ' + T('x = -2, x = 6') + '.',
            hint: 'Draw the horizontal line y = ' + target + '. Every place it meets the graph gives a solution: read the x-value under each crossing.',
            solution: steps(['The graph reaches height ' + target + ' at ' + sols.length + ' points.', 'Reading the x-values: ' + sols.map(function (x) { return T('x = ' + x); }).join(', ') + '.']) };
        }
      }
      if (v === 'count') {
        var val2 = ri(-8, 8), cnt = solve(val2).length;
        return { prompt: intro + 'How many solutions does ' + T('m(x) = ' + val2) + ' have?', type: 'num', answers: [String(cnt)], tol: 0,
          hint: 'Imagine the horizontal line y = ' + val2 + '. Count how many times it meets the graph (it may be none at all).',
          solution: steps([cnt === 0 ? 'The graph never reaches height ' + val2 + ' (its range is ' + T('\\{m(x) \\mid ' + lo + ' \\le m(x) \\le ' + hi + '\\}') + ').' : 'The horizontal line ' + T('y = ' + val2) + ' crosses the graph at ' + T('x = ' + solve(val2).join(',\\ ')) + '.', 'So ' + T('m(x) = ' + val2) + ' has ' + cnt + ' solution' + (cnt === 1 ? '' : 's') + '.']) };
      }
      if (v === 'yint') {
        var y0 = mAt(0);
        return { prompt: intro + 'Write the ' + T('y') + '-intercept in function notation: ' + T('m(0) = \\,?') + ' Type the value.', type: 'num', answers: [String(y0)], tol: 0,
          hint: 'The y-intercept is where the graph crosses the vertical axis, at x = 0. In function notation that height is m(0).',
          solution: steps(['At ' + T('x = 0') + ' the graph is at height ' + y0 + '.', T('m(0) = ' + y0) + '.']) };
      }
      if (v === 'range') {
        var want = pick(['a', 'b']);
        return { prompt: intro + 'The range of ' + T('m') + ' is ' + T('R = \\{m(x) \\mid a \\le m(x) \\le b\\}') + '. Determine ' + T(want) + '.', type: 'num', answers: [String(want === 'a' ? lo : hi)], tol: 0,
          hint: 'The range runs from the lowest point of the graph to the highest point.',
          solution: steps(['The lowest point is at height ' + lo + ' and the highest at ' + hi + '.', 'So ' + T('a = ' + lo) + ' and ' + T('b = ' + hi) + '; the answer is ' + (want === 'a' ? lo : hi) + '.']) };
      }
      var a = ri(-6, 6), ya = mAt(a);
      return { prompt: intro + 'Determine ' + T('m(' + a + ')') + '.', type: 'num', answers: [String(ya)], tol: 0,
        hint: 'm(' + a + ') is the height of the graph when x = ' + a + '. Go to x = ' + a + ' and read up or down to the graph.',
        solution: steps(['At ' + T('x = ' + a) + ' the graph is at height ' + ya + '.', T('m(' + a + ') = ' + ya) + '.']) };
    },
    function () { // f(kx) and f(-x): substitute a multiple of x
      var k = pick([2, 3, -1, -2]), nm = pick(['f', 'g', 'F']), arg = k === -1 ? '-x' : k + 'x', fx, ans, work;
      if (Math.random() < 0.5) { var m = pick([2, 3, 4, 5, -2, -3]), b = nz(-7, 7); fx = lin(m, b, 'x'); ans = lin(m * k, b, 'x'); work = T(nm + '(' + arg + ') = ' + m + '(' + arg + ')' + sgn(b)); }
      else { var a = pick([1, 2, 3]), b2 = nz(-5, 5), c = nz(-6, 6); fx = poly2(a, b2, c, 'x'); ans = poly2(a * k * k, b2 * k, c, 'x'); work = T(nm + '(' + arg + ') = ' + (a === 1 ? '' : a) + '(' + arg + ')^{2}' + (b2 < 0 ? ' - ' : ' + ') + (Math.abs(b2) === 1 ? '' : Math.abs(b2)) + '(' + arg + ')' + sgn(c)) + ', and ' + T('(' + arg + ')^{2} = ' + (k * k) + 'x^{2}'); }
      return { prompt: 'If ' + T(nm + '(x) = ' + fx) + ', determine a simplified expression for ' + T(nm + '(' + arg + ')') + '.', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Replace every x in the rule with (' + arg + '), keeping the brackets, then simplify. Remember that squaring ' + arg + ' squares the ' + (k === -1 ? 'sign' : 'coefficient') + ' too.',
        solution: steps([work, T('= ' + ans) + '.']) };
    },
    function () { // break-even / target profit from P = p t - E
      var p = pick([5, 8, 10, 12, 15, 20]), n = ri(40, 300), E = p * n, profit = Math.random() < 0.5, target = p * ri(20, 80), ctx = pick(['A drama club', 'A school band', 'A charity gala']);
      var ans = profit ? n + target / p : n;
      return { prompt: ctx + ' sells tickets at $' + p + ' each. Its profit, ' + T('P') + ' dollars, from selling ' + T('t') + ' tickets is ' + T('P = ' + p + 't - ' + E) + '. ' + (profit ? 'How many tickets must be sold to earn a profit of $' + target + '?' : 'How many tickets must be sold to <b>break even</b>?'), type: 'num', answers: [String(ans)], tol: 0,
        hint: profit ? 'Set P = ' + target + ' and solve for t.' : 'Breaking even means the profit is 0: set P = 0 and solve for t.',
        solution: steps([T((profit ? target : 0) + ' = ' + p + 't - ' + E), T(p + 't = ' + (E + (profit ? target : 0))), T('t = ' + ans) + ' tickets.']) };
    }
  ];

  var B_MAS = [
    function () { // rate of change from a real-world graph segment
      var ctxs = [['the number of cars in a parking lot', 'Time (hours)', 'Cars', 'cars per hour'], ['the amount of water in a tank', 'Time (minutes)', 'Litres', 'litres per minute'], ['the number of hikers on a trail', 'Time (hours)', 'Hikers', 'hikers per hour']];
      var c = pick(ctxs), t = [0, 2, 4, 6, 8, 10], vals = [ri(1, 3) * 50]; var labs = ['P', 'Q', 'R', 'S', 'T', 'U'];
      for (var i = 1; i < t.length; i++) { var d = pick([-150, -100, -50, 0, 50, 100, 150]); var v = Math.max(0, vals[i - 1] + d); vals.push(v); }
      var seg = ri(0, 4); while (vals[seg + 1] === vals[seg]) seg = ri(0, 4);
      var rate = (vals[seg + 1] - vals[seg]) / 2;
      var pts = t.map(function (tt, i) { return [tt, vals[i], labs[i]]; });
      return { prompt: 'The graph shows ' + c[0] + ' during one morning.' + Fig.pathGraph(pts, { xlabel: c[1], ylabel: c[2], xticks: t, yticks: [0, 100, 200, 300, 400, 500] }) + 'Determine the <b>rate of change</b> from <b>' + labs[seg] + '</b> to <b>' + labs[seg + 1] + '</b>, in ' + c[3] + '. (Enter the number only; use a negative sign if it is decreasing.)', type: 'num', answers: [String(rate)], tol: 0,
        hint: 'Rate of change = (change in the vertical value) ÷ (change in time) between the two points.',
        solution: steps(['From ' + labs[seg] + ' ' + T(pt(t[seg], vals[seg])) + ' to ' + labs[seg + 1] + ' ' + T(pt(t[seg + 1], vals[seg + 1])) + '.', T('\\text{rate} = \\dfrac{' + vals[seg + 1] + ' - ' + vals[seg] + '}{' + t[seg + 1] + ' - ' + t[seg] + '} = \\dfrac{' + (vals[seg + 1] - vals[seg]) + '}{2} = ' + rate) + ' ' + c[3] + '.']) };
    },
    function () { // average rate of change from two data points, then use it: in what year is a target reached
      var y1 = pick([2012, 2014, 2015, 2016]), gap = pick([4, 5, 6, 8]), p1 = ri(20, 60) * 1000 + pick([0, 200, 400, 600, 800]), rate = pick([-450, -300, -250, 150, 200, 350, 500]), p2 = p1 + rate * gap;
      var more = ri(2, 8), target = p2 + rate * more, yr = y1 + gap + more;
      return { prompt: 'A town had a population of ' + p1.toLocaleString('en-CA') + ' in ' + y1 + ' and ' + p2.toLocaleString('en-CA') + ' in ' + (y1 + gap) + '. Assume the population keeps changing at the same average rate. In what year will the population be ' + target.toLocaleString('en-CA') + '?', type: 'num', answers: [String(yr)], tol: 0,
        hint: 'Find the average rate of change (people per year) first. Then work out how many years it takes to change from ' + p2.toLocaleString('en-CA') + ' to ' + target.toLocaleString('en-CA') + ' at that rate.',
        solution: steps([T('\\text{rate} = \\dfrac{' + p2 + ' - ' + p1 + '}{' + (y1 + gap) + ' - ' + y1 + '} = \\dfrac{' + (p2 - p1) + '}{' + gap + '} = ' + rate) + ' people per year.', 'Change still needed: ' + T(target + ' - ' + p2 + ' = ' + (target - p2)) + '.', 'Years needed: ' + T('\\dfrac{' + (target - p2) + '}{' + rate + '} = ' + more) + ', so the year is ' + T((y1 + gap) + ' + ' + more + ' = ' + yr) + '.']) };
    },
    function () { // linear function from two values: write f(x)
      var m = pick([2, 3, 4, -2, -3, 5]), b = nz(-9, 9), x1 = nz(-5, 5), x2 = x1 + pick([2, 3, 4, 5]); var nm = pick(['f', 'g']);
      return { prompt: T(nm) + ' is a <b>linear</b> function with ' + T(nm + '(' + x1 + ') = ' + (m * x1 + b)) + ' and ' + T(nm + '(' + x2 + ') = ' + (m * x2 + b)) + '. Determine ' + T(nm + '(x)') + '.', type: 'expr', answers: [nm + '(x)=' + lin(m, b, 'x')], check: 'exact', note: 'Type it as ' + T(nm + '(x) = mx + b') + ' with numbers in place of m and b.',
        hint: 'Two points on the line: (' + x1 + ', ' + (m * x1 + b) + ') and (' + x2 + ', ' + (m * x2 + b) + '). Find the slope, then the constant.',
        solution: steps([T('m = \\dfrac{' + (m * x2 + b) + ' - (' + (m * x1 + b) + ')}{' + x2 + ' - (' + x1 + ')} = \\dfrac{' + (m * (x2 - x1)) + '}{' + (x2 - x1) + '} = ' + m), 'Then ' + T((m * x1 + b) + ' = ' + m + '(' + x1 + ') + b') + ', so ' + T('b = ' + b) + '.', T(nm + '(x) = ' + lin(m, b, 'x')) + '.']) };
    },
    function () { // sum of two values read from a graph of points
      var pts = [], used = {}; while (pts.length < 6) { var x = ri(-5, 5), y = ri(-5, 5); if (used[x]) continue; used[x] = 1; pts.push([x, y]); }
      var a = pts[ri(0, 5)], b2 = pts[ri(0, 5)]; while (b2 === a) b2 = pts[ri(0, 5)];
      return { prompt: 'The graph of the function ' + T('y = f(x)') + ' is a set of six points. Each grid square is 1 unit.' + Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, ylabel: 'f(x)', points: pts }) + 'Determine ' + T('f(' + a[0] + ') + f(' + b2[0] + ')') + '.', type: 'num', answers: [String(a[1] + b2[1])], tol: 0,
        hint: 'Read the y-value of the point above or below each x, then add.',
        solution: steps([T('f(' + a[0] + ') = ' + a[1]) + ' and ' + T('f(' + b2[0] + ') = ' + b2[1]) + '.', T(a[1] + ' + (' + b2[1] + ') = ' + (a[1] + b2[1])) + '.']) };
    },
    function () { // interpreting two cost models: the distance at which they charge the same
      var rs = shuffle([0.25, 0.3, 0.4, 0.5, 0.6]).slice(0, 2).sort(function (a, b) { return b - a; }), r1 = rs[0], r2 = rs[1];
      var n = pick([400, 500, 600, 800, 1000, 1200, 1500]), b1 = pick([100, 120, 150, 180, 200]), b2 = b1 + Math.round((r1 - r2) * n);
      return { prompt: 'Two moving companies charge ' + T('A(n) = ' + b1 + ' + ' + r1 + 'n') + ' and ' + T('B(n) = ' + b2 + ' + ' + r2 + 'n') + ' dollars for a move of ' + T('n') + ' km. For what distance do the two companies charge the same amount? (km, number only)', type: 'num', answers: [String(n)], tol: 0,
        hint: 'The charges are equal when A(n) = B(n). Set the two expressions equal and solve for n.',
        solution: steps([T(b1 + ' + ' + r1 + 'n = ' + b2 + ' + ' + r2 + 'n'), T(num(r1 - r2) + 'n = ' + (b2 - b1)), T('n = \\dfrac{' + (b2 - b1) + '}{' + num(r1 - r2) + '} = ' + n) + ' km. (Company B has the higher fixed fee but the lower rate, so it is cheaper for longer moves.)']) };
    },
    function () { // where two function values are equal
      var m1 = pick([2, 3, 4, 5]), m2 = pick([-1, -2, -3, 1]), x = nz(-5, 6); while (m2 === m1) m2 = pick([-1, -2, -3]);
      var b1 = nz(-8, 8), b2 = b1 + (m1 - m2) * x; // f(x) = g(x) at x
      return { prompt: 'Let ' + T('f(x) = ' + lin(m1, b1, 'x')) + ' and ' + T('g(x) = ' + lin(m2, b2, 'x')) + '. Determine the value of ' + T('x') + ' for which ' + T('f(x) = g(x)') + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Set the two expressions equal and solve the equation.',
        solution: steps([T(lin(m1, b1, 'x') + ' = ' + lin(m2, b2, 'x')), T((m1 - m2) + 'x = ' + (b2 - b1)), T('x = ' + x) + '.']) };
    },
    function () { // p(x) = c - x^2 with p(a^(1/2)) = k: find a
      var a = pick([4, 9, 16, 25, 36, 49]), c = ri(5, 60); while (c === a) c = ri(5, 60); var k = c - a;
      return { prompt: 'Let ' + T('p(x) = ' + c + ' - x^{2}') + '. Given that ' + T('p\\left(a^{1/2}\\right) = ' + k) + ', determine ' + T('a') + '.', type: 'num', answers: [String(a)], tol: 0,
        hint: 'a^{1/2} means √a, and squaring a square root undoes it: (√a)² = a. Substitute x = a^{1/2} and solve for a.',
        solution: steps([T('p\\left(a^{1/2}\\right) = ' + c + ' - \\left(a^{1/2}\\right)^{2} = ' + c + ' - a'), T(c + ' - a = ' + k), T('a = ' + c + ' - (' + k + ') = ' + a) + ' (and ' + a + ' is indeed a perfect square).']) };
    },
    function () { // f(t) = k with a radical answer, or f(45) for f(x) = a sqrt(x) in simplest radical form
      if (Math.random() < 0.5) {
        var s = pick([2, 3, 4, 5]), r = pick([2, 3, 5, 6, 7, 10]), n = s * s * r, c = ri(1, 20), k = n - c, nm = pick(['f', 'g']);
        return { prompt: 'Let ' + T(nm + '(x) = x^{2} - ' + c) + '. If ' + T(nm + '(t) = ' + k) + ' and ' + T('t > 0') + ', determine ' + T('t') + ' in simplest radical form.', type: 'expr', answers: [s + '\\sqrt{' + r + '}'], check: 'exact', note: 'Type a mixed radical, e.g. ' + T('2\\sqrt{3}') + '.',
          hint: 'Set t² − ' + c + ' = ' + k + ', isolate t², then take the positive square root and simplify it (look for the largest perfect-square factor of ' + n + ').',
          solution: steps([T('t^{2} - ' + c + ' = ' + k), T('t^{2} = ' + n), T('t = \\sqrt{' + n + '} = \\sqrt{' + (s * s) + ' \\times ' + r + '} = ' + s + '\\sqrt{' + r + '}') + ' (positive root only, since t > 0).']) };
      }
      var a = ri(2, 9), s2 = pick([2, 3, 4, 5]), r2 = pick([2, 3, 5, 6, 7]), x = s2 * s2 * r2;
      return { prompt: 'Let ' + T('f(x) = ' + a + '\\sqrt{x}') + '. Determine ' + T('f(' + x + ')') + ' as an exact value in simplest radical form.', type: 'expr', answers: [(a * s2) + '\\sqrt{' + r2 + '}'], check: 'exact', note: 'Type a mixed radical, e.g. ' + T('6\\sqrt{5}') + '.',
        hint: 'Substitute x = ' + x + ', then simplify √' + x + ' by pulling out its largest perfect-square factor, and multiply by ' + a + '.',
        solution: steps([T('f(' + x + ') = ' + a + '\\sqrt{' + x + '} = ' + a + '\\sqrt{' + (s2 * s2) + ' \\times ' + r2 + '} = ' + a + ' \\times ' + s2 + '\\sqrt{' + r2 + '} = ' + (a * s2) + '\\sqrt{' + r2 + '}') + '.']) };
    },
    function () { // real-world path graph: hours increasing, or which point starts the steepest segment
      var ctxs = [['the number of cars in a parking lot', 'Time (hours)', 'Cars'], ['the number of hikers on a trail', 'Time (hours)', 'Hikers'], ['the number of people in a swimming pool', 'Time (hours)', 'People']];
      var c = pick(ctxs), t = [0, 2, 4, 6, 8, 10], labs = ['P', 'Q', 'R', 'S', 'T', 'U'], vals, ds, tries = 0, okay;
      do {
        vals = [ri(1, 3) * 50]; ds = [];
        for (var i = 1; i < t.length; i++) { var d = pick([-150, -100, -50, 0, 50, 100, 150]); var v = vals[i - 1] + d; if (v < 0 || v > 500) { d = 0; v = vals[i - 1]; } vals.push(v); ds.push(d); }
        var inc = ds.filter(function (d) { return d > 0; }).length, mags = ds.map(Math.abs), top = Math.max.apply(null, mags);
        okay = inc >= 1 && inc <= 4 && mags.filter(function (m) { return m === top; }).length === 1;
      } while (!okay && ++tries < 300);
      var pts = t.map(function (tt, i) { return [tt, vals[i], labs[i]]; }), fig = Fig.pathGraph(pts, { xlabel: c[1], ylabel: c[2], xticks: t, yticks: [0, 100, 200, 300, 400, 500] });
      var intro = 'The graph shows ' + c[0] + ' during one day.' + fig;
      if (Math.random() < 0.5) {
        var hours = ds.filter(function (d) { return d > 0; }).length * 2, which = ds.map(function (d, i) { return d > 0 ? labs[i] + ' to ' + labs[i + 1] : null; }).filter(Boolean);
        return { prompt: intro + 'For how many hours in total was ' + c[0] + ' <b>increasing</b>?', type: 'num', answers: [String(hours)], tol: 0,
          hint: 'A segment that rises from left to right shows an increase. Each segment covers 2 hours; add up the rising ones.',
          solution: steps(['The rising segments are ' + which.join(', ') + ' (' + which.length + ' segment' + (which.length === 1 ? '' : 's') + ').', 'Each covers 2 hours, so the total is ' + T(which.length + ' \\times 2 = ' + hours) + ' hours.']) };
      }
      var si = mags.indexOf(top), rate = ds[si] / 2;
      return { prompt: intro + 'Which point begins the segment with the <b>fastest rate of change</b> (the steepest segment, up or down)? Type its letter.', type: 'expr', answers: letters(labs[si]), check: 'exact',
        hint: 'Rate of change is rise over run. All segments have the same run (2 hours), so the steepest one has the biggest change in the vertical value, ignoring sign.',
        solution: steps(['The changes over each 2-hour segment are ' + ds.map(function (d, i) { return labs[i] + '–' + labs[i + 1] + ': ' + d; }).join(', ') + '.', 'The biggest change (ignoring sign) is ' + ds[si] + ' from ' + labs[si] + ' to ' + labs[si + 1] + ', a rate of ' + T('\\dfrac{' + ds[si] + '}{2} = ' + rate) + ' per hour.', 'That segment begins at point ' + labs[si] + '.']) };
    },
    function () { // rate of change with a unit conversion: minutes on the axis, answer in km/h
      var dts = [10, 15, 20, 30, 40, 60], dt = pick(dts), t1 = pick([0, 5, 10, 15, 20, 30]), dd = ri(1, 20); while ((dd * 60) % dt !== 0) dd = ri(1, 20);
      var d1 = ri(0, 10), t2 = t1 + dt, d2 = d1 + dd, rate = dd * 60 / dt, who = pick(['A cyclist', 'A jogger', 'A delivery van']);
      var fig = Fig.pathGraph([[t1, d1, 'A'], [t2, d2, 'B']], { xlabel: 'Time (minutes)', ylabel: 'Distance (km)', xticks: [t1, t2], yticks: [d1, d2] });
      return { prompt: who + '\'s trip is shown on a distance–time graph. The segment joins ' + T('A' + pt(t1, d1)) + ' to ' + T('B' + pt(t2, d2)) + ', where time is in <b>minutes</b> and distance is in <b>km</b>.' + fig + 'Determine the rate of change in <b>km/h</b> (number only).', type: 'num', answers: [String(rate)], tol: 0.001,
        hint: 'Rate = change in distance ÷ change in time. The time is in minutes, so either convert ' + dt + ' minutes to hours first, or multiply the km-per-minute rate by 60.',
        solution: steps([T('\\text{change in distance} = ' + d2 + ' - ' + d1 + ' = ' + dd) + ' km and ' + T('\\text{change in time} = ' + t2 + ' - ' + t1 + ' = ' + dt) + ' min ' + T('= \\dfrac{' + dt + '}{60}') + ' h.', T('\\text{rate} = ' + dd + ' \\div \\dfrac{' + dt + '}{60} = \\dfrac{' + dd + ' \\times 60}{' + dt + '} = ' + rate) + ' km/h.']) };
    }
  ];


  /* ---------- Math 15 templates (Cogwright's Ruin) ---------- */
  var M15 = {
    gearPattern: function () { // a growing pattern: start and step, a later figure (L2)
      var a = ri(2, 6), d = ri(2, 5), n = pick([6, 7, 8, 10, 12]), thing = pick(['gears', 'cogs', 'rivets', 'springs']);
      var xs = [1, 2, 3, 4], ys = xs.map(function (x) { return a + d * (x - 1); });
      return { prompt: 'In the Cogwright\'s workshop, a growing pattern of ' + thing + ' is laid out on a bench. The table shows how many ' + thing + ' are in each figure.' + Fig.table(xs, ys, 'Figure', thing.charAt(0).toUpperCase() + thing.slice(1)) + 'If the pattern continues, how many ' + thing + ' are in Figure ' + n + '?', type: 'num', answers: [String(a + d * (n - 1))], tol: 0,
        hint: 'The pattern starts at ' + a + ' and adds the same number each time. How many times is it added to get from Figure 1 to Figure ' + n + '?',
        solution: steps(['Each figure adds ' + d + '.', 'From Figure 1 to Figure ' + n + ' is ' + (n - 1) + ' steps: ' + T(a + ' + ' + d + ' \\times ' + (n - 1) + ' = ' + (a + d * (n - 1))) + '.']) };
    },
    tableIntercepts: function () { // intercepts read from a table listed out of order (L4)
      var m = pick([-3, -2, -1, 1, 2, 3]), x0 = nz(-4, 4), b = -m * x0, xs = [x0 - 2, x0 - 1, x0, x0 + 1, x0 + 2];
      if (xs.indexOf(0) < 0) xs[pick([0, 4])] = 0;
      xs = uniqSorted(xs); var rows = shuffle(xs.map(function (x) { return [x, m * x + b]; }));
      var which = pick(['x', 'y']), ans = which === 'x' ? pt(x0, 0) : pt(0, b);
      return { prompt: 'A machine\'s settings (' + T('x') + ') and readings (' + T('y') + ') follow a straight line. The table is listed out of order.' + Fig.table(rows.map(function (r) { return r[0]; }), rows.map(function (r) { return r[1]; })) + 'State the <b>' + which + '-intercept</b> as an ordered pair.', type: 'expr', answers: [ans], check: 'exact', note: 'Type an ordered pair, e.g. (3,0).',
        hint: which === 'x' ? 'The x-intercept is the point where y = 0.' : 'The y-intercept is the point where x = 0.',
        solution: steps([(which === 'x' ? 'Find the column where ' + T('y = 0') : 'Find the column where ' + T('x = 0')) + '.', 'The ' + which + '-intercept is ' + T(ans) + '.']) };
    },
    lineIntercepts: function () { // intercepts of y = mx + b (L4)
      var m = pick([-4, -3, -2, 2, 3, 4, 5]), x0 = nz(-6, 6), b = -m * x0, which = pick(['x', 'y']);
      return { prompt: 'Determine the <b>' + which + '-intercept</b> of the line ' + T('y = ' + lin(m, b, 'x')) + '. Type its value.', type: 'num', answers: [String(which === 'x' ? x0 : b)], tol: 0,
        hint: which === 'x' ? 'At the x-intercept, y = 0. Substitute 0 for y and solve for x.' : 'At the y-intercept, x = 0. Substitute 0 for x.',
        solution: steps(which === 'x' ? [T('0 = ' + lin(m, b, 'x')), T(m + 'x = ' + (-b)), T('x = ' + x0) + '.'] : [T('y = ' + m + '(0)' + sgn(b) + ' = ' + b) + '.']) };
    },
    interpretC: function () { // interpret C(a) = b in context (L9 Ex 5)
      var a = pick([3, 4, 5, 6, 8, 10]), fee = pick([5, 8, 10, 12, 15]), per = pick([2, 3, 4, 5]), b = fee + per * a;
      var opts = ['Repairing ' + a + ' clocks costs $' + b, 'Repairing ' + b + ' clocks costs $' + a, 'Each clock costs $' + b + ' to repair', 'The fixed fee is $' + b], o = mc(opts, 0);
      return { prompt: 'The Cogwright\'s apprentice charges ' + T('C(n) = ' + per + 'n + ' + fee) + ' dollars to repair ' + T('n') + ' clocks. What does ' + T('C(' + a + ') = ' + b) + ' mean?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: 'The number in the brackets is the input (the number of clocks). The value of C is the output (the cost).',
        solution: steps(['The input ' + a + ' is the number of clocks; the output ' + b + ' is the cost in dollars.', 'Answer: ' + o.letter + '.']) };
    },
    fourError: function () { // a student's f(k) error (L10 #8): solved the reverse question, or added instead of multiplying
      var m = pick([2, 3, 4, -2, -3]), b = nz(-6, 6), k = pick([2, 3, 4, 5]), fk = m * k + b, who = pick(['Rowan', 'Isla', 'Dev', 'Mara']);
      var kind = pick(['reverse', 'add']), wrongVal = kind === 'reverse' ? (k - b) / m : m + k + b;
      if (wrongVal !== Math.round(wrongVal) || wrongVal === fk) return M15.fourError();
      var opts = ['They found the input that makes ' + T('f(x) = ' + k) + ', not the output when ' + T('x = ' + k), 'They added ' + T(String(m)) + ' and ' + T(String(k)) + ' instead of multiplying them', 'They left out the constant term ' + T(String(b)), 'There is no mistake'];
      var o = mc(opts, kind === 'reverse' ? 0 : 1);
      return { prompt: 'For ' + T('f(x) = ' + lin(m, b, 'x')) + ', ' + who + ' wrote ' + T('f(' + k + ') = ' + wrongVal) + '. The correct value is ' + T('f(' + k + ') = ' + fk) + '. What mistake did ' + who + ' make?' + o.html, type: 'expr', answers: letters(o.letter), check: 'exact', note: MCNOTE,
        hint: T('f(' + k + ')') + ' means: put ' + k + ' in for x and work out the output. Try to get ' + who + '\'s ' + wrongVal + ' from the rule.',
        solution: steps([T('f(' + k + ') = ' + m + '(' + k + ')' + sgn(b) + ' = ' + fk) + '.', kind === 'reverse' ? 'Solving ' + T(lin(m, b, 'x') + ' = ' + k) + ' gives ' + T('x = ' + wrongVal) + ': that answers the reverse question.' : T(m + ' + ' + k + sgn(b) + ' = ' + wrongVal) + ': ' + m + ' and ' + k + ' were added, not multiplied.', 'Answer: ' + o.letter + '.']) };
    }
  };
  var MCNOTE = 'Type the letter of your choice.';
  function mc(opts, right) { var L = ['A', 'B', 'C', 'D']; return { html: '<div class="mc-opts">' + opts.map(function (o, i) { return '<div><b>' + L[i] + '.</b> ' + o + '</div>'; }).join('') + '</div>', letter: L[right] }; }

  /* Math 15 levels, chosen from the shared library above (indices refer to Lorebound's arrays) */
  QGen.GENS.RF2_BEG = [A_BEG[6], A_BEG[4], A_BEG[8], A_BEG[1], A_PRG[4], A_PRG[3], M15.gearPattern, M15.tableIntercepts];
  QGen.GENS.RF2_PRG = [A_BEG[0], A_BEG[3], A_BEG[7], A_PRG[10], A_PRG[5], A_MAS[2], M15.lineIntercepts];
  QGen.GENS.RF2_MAS = [A_MAS[7], A_MAS[6], A_MAS[8], A_MAS[5], A_PRG[6]];
  QGen.GENS.RF8_BEG = [B_BEG[1], B_BEG[3], B_BEG[4], B_BEG[5], A_BEG[10]];
  QGen.GENS.RF8_PRG = [B_BEG[0], B_BEG[2], B_PRG[2], A_PRG[11], B_PRG[4], B_PRG[6], B_MAS[0]];
  QGen.GENS.RF8_MAS = [B_MAS[8], B_MAS[3], B_MAS[1], B_PRG[8], M15.interpretC, M15.fourError];
})();
