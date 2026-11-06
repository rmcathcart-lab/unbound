/* Copied from the math15 repo (js/calc.js): the same TI-30XIIS emulator as the practice site. Unbound changes only the
 * title bar ("The Reckoner") and draws the close cross as an SVG (centred); the look comes from the .calc rules in style.css. Keep the engine in step with math15.
 *
 * On-screen scientific calculator with the key layout of the real TI-30XIIS (two-line display: entry on top, result below).
 * Every key sits where it is on the real calculator, with its 2nd function above it: DRG (angle mode menu DEG RAD GRD),
 * 2nd SCI/ENG (FLO SCI ENG), 2nd FIX on the decimal point (F 0–9), EE = 2nd x⁻¹, % = 2nd (, F◂▸D = 2nd PRB,
 * Ab/c◂▸d/e = 2nd Ab/c, x! in the PRB menu (nPr nCr !), °′″ menu (° ′ ″ r g ▸DMS) and R◂▸P, π with HYP,
 * MEMVAR/CLRVAR, STO▸/RCL (A–E), ANS, RESET, entry history with ▲ ▼, cursor editing with ◄ ► DEL and INS, CLEAR.
 * There is no MODE key, |x| key or x³ key on the TI-30XIIS (cube with ^ 3).
 * HW.Calc.toggle() shows/hides the floating calculator. Evaluation follows the TI order of operations
 * (powers before negation, so (−)2² = −4; implicit multiplication before × and ÷). */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {}, el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  /* the calculator icon used on every calculator button (practice, test mode; lessons/js/ui.js draws the same shape) */
  HW.CALC_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="7.5" y="5" width="9" height="4" rx=".6" fill="currentColor" opacity=".35"/><g fill="currentColor"><circle cx="9" cy="12.5" r="1"/><circle cx="12" cy="12.5" r="1"/><circle cx="15" cy="12.5" r="1"/><circle cx="9" cy="15.5" r="1"/><circle cx="12" cy="15.5" r="1"/><circle cx="15" cy="15.5" r="1"/><circle cx="9" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="15" cy="18.5" r="1"/></g></svg>';

  /* ---------------- exact fractions where possible ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function V(f, q) { return { f: f, q: q || null }; } // float value + optional exact [num, den]
  function fracOf(v) { // [n, d] with 1 < d < 1000, or null
    if (v.q && v.q[1] !== 1 && v.q[1] < 1000) return v.q;
    var x = v.f; if (!isFinite(x) || Math.abs(x) >= 1e7 || x % 1 === 0) return null;
    var h0 = 1, h1 = Math.floor(x), k0 = 0, k1 = 1, b = x - Math.floor(x);
    for (var i = 0; i < 30 && k1 < 1000; i++) {
      if (Math.abs(x - h1 / k1) <= 5e-10 * Math.max(1, Math.abs(x))) return k1 > 1 ? [h1, k1] : null;
      if (b < 1e-12) break;
      b = 1 / b; var a = Math.floor(b); b -= a;
      var h2 = a * h1 + h0, k2 = a * k1 + k0; h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    }
    return k1 < 1000 && k1 > 1 && Math.abs(x - h1 / k1) <= 5e-10 * Math.max(1, Math.abs(x)) ? [h1, k1] : null;
  }
  function fromQ(n, d) {
    if (d === 0) throw err('DIVIDE BY 0');
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1; n /= g; d /= g;
    if (Math.abs(n) > 1e12 || d > 1e12) return V(n / d, null);
    return V(n / d, [n, d]);
  }
  function err(msg) { var e = new Error(msg); e.calc = true; return e; }
  function num(v) { if (!isFinite(v.f)) throw err(isNaN(v.f) ? 'DOMAIN' : 'OVERFLOW'); return v; }
  var OPS = {
    add: function (a, b) { return a.q && b.q ? fromQ(a.q[0] * b.q[1] + b.q[0] * a.q[1], a.q[1] * b.q[1]) : V(a.f + b.f); },
    sub: function (a, b) { return a.q && b.q ? fromQ(a.q[0] * b.q[1] - b.q[0] * a.q[1], a.q[1] * b.q[1]) : V(a.f - b.f); },
    mul: function (a, b) { return a.q && b.q ? fromQ(a.q[0] * b.q[0], a.q[1] * b.q[1]) : V(a.f * b.f); },
    div: function (a, b) { if (b.f === 0) throw err('DIVIDE BY 0'); return a.q && b.q ? fromQ(a.q[0] * b.q[1], a.q[1] * b.q[0]) : V(a.f / b.f); },
    pow: function (a, b) {
      if (a.f === 0 && b.f < 0) throw err('DIVIDE BY 0');
      if (a.q && b.q && b.q[1] === 1 && Math.abs(b.q[0]) <= 64) { var e = b.q[0], n = Math.pow(a.q[0], Math.abs(e)), d = Math.pow(a.q[1], Math.abs(e)); if (Math.abs(n) < 1e15 && d < 1e15) return e >= 0 ? fromQ(n, d) : fromQ(d, n); }
      // A negative base with a fractional exponent: the real TI-30XIIS only accepts it when 1 ÷ exponent is a whole odd
      // number, e.g. (−8)^(1/3) = −2. (−8)^(2/3) is a DOMAIN error on the calculator (TI knowledge base 40237): take the root first.
      if (a.f < 0 && b.f % 1) {
        var inv = 1 / b.f, k = Math.round(inv);
        if (Math.abs(inv - k) < 1e-9 && Math.abs(k) % 2 === 1) return V(-Math.pow(-a.f, b.f));
        throw err('DOMAIN');
      }
      return V(Math.pow(a.f, b.f));
    },
    neg: function (a) { return a.q ? fromQ(-a.q[0], a.q[1]) : V(-a.f); }
  };
  function exactRoot(v, k) { // ˣ√ of an exact value: return exact if it is a perfect power
    if (v.q && v.q[0] >= 0) { var n = Math.round(Math.pow(v.q[0], 1 / k)), d = Math.round(Math.pow(v.q[1], 1 / k)); if (Math.pow(n, k) === v.q[0] && Math.pow(d, k) === v.q[1]) return fromQ(n, d); }
    return null;
  }
  function fact(n) { if (n < 0 || n % 1 || n > 69) throw err(n > 69 ? 'OVERFLOW' : 'DOMAIN'); var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

  /* ---------------- tokens ----------------
   * The entry line is a list of tokens; each has s (what the display shows) and k (kind). */
  var T = {
    d: function (c) { return { s: c, k: 'digit' }; },
    op: function (s, o) { return { s: s, k: 'op', o: o }; }, // binary operators
    fn: function (s, f) { return { s: s, k: 'fn', f: f }; }, // prefix functions that open a bracket
    post: function (s, p) { return { s: s, k: 'post', p: p }; },
    neg: function () { return { s: '⁻', k: 'neg' }; }, // small raised minus, like the TI's (−)
    lp: function () { return { s: '(', k: 'lp' }; }, rp: function () { return { s: ')', k: 'rp' }; },
    c: function (s, name) { return { s: s, k: 'const', n: name } },
    frac: function () { return { s: '┘', k: 'frac' }; }, // ┘ fraction bar
    comma: function () { return { s: ',', k: 'comma' }; }
  };

  function Calc() {
    this.entry = []; this.cur = 0; this.ins = false; this.second = false; this.mode = { angle: 'DEG', fix: -1, note: 'FLO' }; this.hyp = false;
    this.ans = V(0, [0, 1]); this.hist = []; this.hpos = -1; this.result = null; this.resultShown = false; this.showFrac = true;
    this.vars = { A: V(0, [0, 1]), B: V(0, [0, 1]), C: V(0, [0, 1]), D: V(0, [0, 1]), E: V(0, [0, 1]) };
    this.menu = null; this.error = null; this.on = true;
  }
  Calc.prototype = {
    entryText: function () { return this.entry.map(function (t) { return t.s; }).join(''); },
    clearEntry: function () { this.entry = []; this.cur = 0; },
    insert: function (tok) {
      if (this.resultShown) { // after ENTER: an operator continues from Ans, anything else starts fresh
        this.resultShown = false; this.hpos = -1;
        if (tok.k === 'op' || (tok.k === 'post')) { this.entry = [{ s: 'Ans', k: 'ans' }]; this.cur = 1; }
        else { this.entry = []; this.cur = 0; }
      }
      if (this.ins || this.cur >= this.entry.length) this.entry.splice(this.cur, 0, tok); else this.entry[this.cur] = tok;
      this.cur++;
      if (tok.k === 'fn') { /* the bracket is part of the function name, e.g. "sin(" */ }
    },
    del: function () { if (this.resultShown) { this.resultShown = false; } if (this.cur < this.entry.length) this.entry.splice(this.cur, 1); else if (this.entry.length) { this.entry.pop(); this.cur = this.entry.length; } },

    /* ---------- parsing (TI order of operations) ---------- */
    parse: function () {
      var toks = this.entry, i = 0, self = this;
      function peek() { return toks[i]; }
      function numberLit() { // digits with optional . and E, and fraction bars a┘b or a┘b┘c
        var s = '', parts = [];
        function readNum() {
          var t = '', seenE = false;
          while (i < toks.length) {
            var tk = toks[i];
            if (tk.k === 'digit' && /[0-9.]/.test(tk.s)) { t += tk.s; i++; }
            else if (tk.k === 'ee' && !seenE) { t += 'E'; seenE = true; i++; if (toks[i] && toks[i].k === 'neg') { t += '-'; i++; } }
            else break;
          }
          if (!t || t === '.' || /E-?$/.test(t) || (t.match(/\./g) || []).length > 1) throw err('SYNTAX');
          return t;
        }
        parts.push(readNum());
        while (toks[i] && toks[i].k === 'frac') { i++; parts.push(readNum()); }
        if (parts.length === 1) { s = parts[0]; var f = Number(s); if (/^\d*\.?\d*$/.test(s) && !/E/.test(s)) { var dec = (s.split('.')[1] || '').length; return fromQ(Math.round(f * Math.pow(10, dec)), Math.pow(10, dec)); } return V(f); }
        self.usedFrac = true;
        var ints = parts.map(function (p) { if (!/^\d+$/.test(p)) throw err('SYNTAX'); return Number(p); });
        if (ints.length === 2) return fromQ(ints[0], ints[1]);
        if (ints.length === 3) return fromQ(ints[0] * ints[2] + ints[1], ints[2]);
        throw err('SYNTAX');
      }
      function primary() {
        var tk = peek(); if (!tk) throw err('SYNTAX');
        if (tk.k === 'digit' || tk.k === 'ee') return numberLit();
        if (tk.k === 'lp') { i++; var v = expr(); if (peek() && peek().k === 'rp') i++; return v; }
        if (tk.k === 'fn') { i++; var a = expr(), b2 = null; if (peek() && peek().k === 'comma') { i++; b2 = expr(); } if (peek() && peek().k === 'rp') i++; if ((b2 === null) !== !tk.two) throw err('SYNTAX'); return tk.two ? self.applyFn2(tk.f, a, b2) : self.applyFn(tk.f, a); }
        if (tk.k === 'const') { i++; return tk.n === 'pi' ? V(Math.PI) : tk.n === 'e' ? V(Math.E) : V(0); }
        if (tk.k === 'ans') { i++; return self.ans; }
        if (tk.k === 'var') { i++; return self.vars[tk.n]; }
        throw err('SYNTAX');
      }
      function postfix() {
        var v = primary();
        while (peek() && peek().k === 'post') {
          var p = peek().p; i++;
          if (p === 'sq') v = OPS.mul(v, v);
          else if (p === 'inv') { if (v.f === 0) throw err('DIVIDE BY 0'); v = v.q ? fromQ(v.q[1], v.q[0]) : V(1 / v.f); }
          else if (p === 'fact') v = V(fact(v.f), [fact(v.f), 1]);
          else if (p === 'pct') v = OPS.div(v, V(100, [100, 1]));
          else if (p === 'dms') self.toDMS = true;
          else { v = self.angleIn(p, v); v.dms = true; } // ° ′ ″ r g: an angle in that unit, read in the current angle mode
        }
        return v;
      }
      function power() { // left to right, like the TI-30XIIS
        var v = postfix();
        while (peek() && peek().k === 'op' && (peek().o === 'pow' || peek().o === 'root')) {
          var o = peek().o; i++;
          var b = signedPostfix();
          if (o === 'pow') v = num(OPS.pow(v, b));
          else { // v ˣ√ b : the v-th root of b
            if (v.f === 0) throw err('DOMAIN');
            var ex = v.q && v.q[1] === 1 ? exactRoot(b, v.q[0]) : null;
            if (ex) v = ex; else if (b.f < 0 && v.q && v.q[1] === 1 && Math.abs(v.q[0]) % 2 === 1) v = V(-Math.pow(-b.f, 1 / v.f)); else if (b.f < 0) throw err('DOMAIN'); else v = V(Math.pow(b.f, 1 / v.f));
          }
        }
        return v;
      }
      function signedPostfix() { if (peek() && peek().k === 'neg') { i++; return OPS.neg(signedPostfix()); } return postfix(); }
      function negation() { if (peek() && peek().k === 'neg') { i++; return OPS.neg(negation()); } return power(); }
      function perm() {
        var v = negation();
        while (peek() && peek().k === 'op' && (peek().o === 'npr' || peek().o === 'ncr')) {
          var o = peek().o; i++; var r = negation(), n = v.f, k = r.f;
          if (n % 1 || k % 1 || n < 0 || k < 0 || k > n) throw err('DOMAIN');
          var p = fact(n) / fact(n - k); v = o === 'npr' ? V(p, [p, 1]) : V(Math.round(p / fact(k)), [Math.round(p / fact(k)), 1]);
        }
        return v;
      }
      function startsTerm(tk) { return tk && (tk.k === 'digit' || tk.k === 'ee' || tk.k === 'lp' || tk.k === 'fn' || tk.k === 'const' || tk.k === 'ans' || tk.k === 'var'); }
      function implicit() { // side by side means ×, except angle pieces like 30°15′ which add up, as on the TI
        var v = perm();
        while (startsTerm(peek())) { var w = perm(); if (v.dms && w.dms) { v = OPS.add(v, w); v.dms = true; } else v = OPS.mul(v, w); }
        return v;
      }
      function term() {
        var v = implicit();
        while (peek() && peek().k === 'op' && (peek().o === 'mul' || peek().o === 'div')) { var o = peek().o; i++; var b = implicit(); v = OPS[o](v, b); }
        return v;
      }
      function expr() {
        var v = term();
        while (peek() && peek().k === 'op' && (peek().o === 'add' || peek().o === 'sub')) { var o = peek().o; i++; var b = term(); v = OPS[o](v, b); }
        return v;
      }
      this.usedFrac = false; this.toDMS = false;
      if (!toks.length) return null;
      var out = expr();
      if (i < toks.length) throw err('SYNTAX');
      return num(out);
    },
    unit: function () { return this.mode.angle === 'DEG' ? Math.PI / 180 : this.mode.angle === 'RAD' ? 1 : Math.PI / 200; }, // radians per unit
    angleIn: function (p, v) {
      if (this.mode.angle === 'DEG' && p !== 'radu' && p !== 'gradu') return p === 'deg' ? V(v.f, v.q) : OPS.div(v, p === 'min' ? V(60, [60, 1]) : V(3600, [3600, 1]));
      var r = p === 'deg' ? Math.PI / 180 : p === 'min' ? Math.PI / 10800 : p === 'sec' ? Math.PI / 648000 : p === 'gradu' ? Math.PI / 200 : 1;
      return V(v.f * r / this.unit());
    },
    applyFn2: function (f, a, b) {
      var k = this.unit();
      switch (f) {
        case 'rpr': return V(Math.sqrt(a.f * a.f + b.f * b.f));
        case 'rpt': return V(Math.atan2(b.f, a.f) / k);
        case 'prx': return V(Math.abs(Math.cos(b.f * k)) < 1e-12 ? 0 : a.f * Math.cos(b.f * k));
        case 'pry': return V(Math.abs(Math.sin(b.f * k)) < 1e-12 ? 0 : a.f * Math.sin(b.f * k));
      }
      throw err('SYNTAX');
    },
    applyFn: function (f, a) {
      var k = this.unit();
      function clean(x) { return Math.abs(x) < 1e-12 ? 0 : x; }
      switch (f) {
        case 'sqrt': if (a.f < 0) throw err('DOMAIN'); return exactRoot(a, 2) || V(Math.sqrt(a.f));
        case 'log': if (a.f <= 0) throw err('DOMAIN'); return V(Math.log10(a.f));
        case 'ln': if (a.f <= 0) throw err('DOMAIN'); return V(Math.log(a.f));
        case 'tenx': return V(Math.pow(10, a.f));
        case 'ex': return V(Math.exp(a.f));
        case 'sin': return V(clean(Math.sin(a.f * k)));
        case 'cos': return V(clean(Math.cos(a.f * k)));
        case 'tan': if (Math.abs(Math.cos(a.f * k)) < 1e-12) throw err('DOMAIN'); return V(clean(Math.tan(a.f * k)));
        case 'asin': if (Math.abs(a.f) > 1) throw err('DOMAIN'); return V(Math.asin(a.f) / k);
        case 'acos': if (Math.abs(a.f) > 1) throw err('DOMAIN'); return V(Math.acos(a.f) / k);
        case 'atan': return V(Math.atan(a.f) / k);
        case 'sinh': return V(Math.sinh(a.f)); case 'cosh': return V(Math.cosh(a.f)); case 'tanh': return V(Math.tanh(a.f));
        case 'asinh': return V(Math.asinh(a.f)); case 'acosh': if (a.f < 1) throw err('DOMAIN'); return V(Math.acosh(a.f));
        case 'atanh': if (Math.abs(a.f) >= 1) throw err('DOMAIN'); return V(Math.atanh(a.f));
        case 'round': var dp = this.mode.fix >= 0 ? this.mode.fix : 9; return V(Math.round(a.f * Math.pow(10, dp)) / Math.pow(10, dp));
      }
      throw err('SYNTAX');
    },
    enter: function () {
      if (this.error) { this.error = null; return; }
      if (!this.entry.length) { if (this.hist.length) { this.entry = this.hist[0].entry.slice(); } else return; }
      try {
        var v = this.parse(); if (!v) return;
        if (Math.abs(v.f) >= 1e100) throw err('OVERFLOW');
        this.ans = v; this.result = v; this.showFrac = !!this.usedFrac; this.showDMS = !!this.toDMS;
        this.hist.unshift({ entry: this.entry.slice(), result: v, frac: this.showFrac, dms: this.showDMS }); if (this.hist.length > 30) this.hist.pop();
        this.resultShown = true; this.hpos = -1; this.cur = this.entry.length;
      } catch (e) { if (!e.calc) throw e; this.error = e.message + ' ERROR'; }
    },
    // F◂▸D: like the real calculator, a decimal converts when it matches a fraction with denominator below 1000 to 10 digits
    toggleFD: function () { this.showDMS = false; if (this.result) { this.showFrac = !this.showFrac; if (!fracOf(this.result)) this.showFrac = false; } },
    fmt: function (v) {
      if (!v) return '';
      var fq = this.showFrac ? fracOf(v) : null;
      if (fq) {
        var n = fq[0], d = fq[1];
        if (this.mixed && Math.abs(n) > d) { var w = Math.trunc(n / d), r = Math.abs(n % d); return w + '┘' + r + '┘' + d; }
        return n + '┘' + d;
      }
      var x = v.f; if (Math.abs(x) < 1e-99) x = 0;
      if (this.showDMS && Math.abs(x) < 1e7) { // ▸DMS: degrees°minutes′seconds″
        var sg = x < 0 ? '-' : '', t = Math.round(Math.abs(x) * 3600 * 1e4) / 1e4, dd = Math.floor(t / 3600 + 1e-12), mm = Math.floor((t - dd * 3600) / 60 + 1e-12), ss = Number((t - dd * 3600 - mm * 60).toFixed(4));
        return sg + dd + '°' + mm + "'" + ss + '"';
      }
      if (this.mode.note !== 'FLO' && x !== 0) { // SCI or ENG notation
        var e0 = Math.floor(Math.log10(Math.abs(x))), m0 = x / Math.pow(10, e0);
        if (Math.abs(Number(m0.toPrecision(10))) >= 10) { m0 /= 10; e0++; }
        if (this.mode.note === 'ENG') { var sh = ((e0 % 3) + 3) % 3; m0 *= Math.pow(10, sh); e0 -= sh; }
        var msx = this.mode.fix >= 0 ? m0.toFixed(this.mode.fix) : String(Number(m0.toPrecision(10)));
        if (this.mode.fix < 0 && !/\./.test(msx)) msx += '.';
        return { m: msx, e: e0 };
      }
      if (this.mode.note !== 'FLO') return { m: this.mode.fix >= 0 ? (0).toFixed(this.mode.fix) : '0.', e: 0 };
      if (this.mode.fix >= 0) { var s1 = x.toFixed(this.mode.fix); if (s1.replace(/[-.]/g, '').length <= 10) return { m: s1 }; }
      if (x !== 0 && (Math.abs(x) >= 1e10 || Math.abs(x) < 1e-9)) {
        var e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
        if (Math.abs(m) >= 9.9999999995) { m /= 10; e++; }
        var ms = String(Number(m.toPrecision(10))); if (!/\./.test(ms) && ms.length < 2) ms += '';
        return { m: ms, e: e };
      }
      var s = Number(x.toPrecision(10)).toString();
      if (/e/.test(s)) { var p = s.split('e'); return { m: p[0], e: Number(p[1]) }; }
      if (s.replace(/[-.]/g, '').length > 10) s = Number(x.toPrecision(10 - Math.max(0, Math.floor(Math.log10(Math.abs(x))) + 1 - 10))).toString();
      if (!/\./.test(s) && x % 1 === 0) s = s + '.';
      return { m: s };
    }
  };

  /* ---------------- the keypad ---------------- */
  // [primary label, 2nd label (yellow, above the key), primary action, 2nd action, class] — row by row as on the real TI-30XIIS
  var KEYS = [
    [['2nd', '', 'second', null, 'k-2nd'], ['DRG', 'SCI/ENG', 'drg', 'scieng', 'k-fn'], ['DEL', 'INS', 'del', 'ins', 'k-fn']],
    [['LOG', '10<sup>x</sup>', 'log', 'tenx', 'k-fn'], ['PRB', 'F◂▸D', 'prb', 'fd', 'k-fn'], ['°′″', 'R◂▸P', 'angle', 'rtop', 'k-fn']],
    [['LN', 'e<sup>x</sup>', 'ln', 'ex', 'k-fn'], ['A<sup>b</sup>/<sub>c</sub>', 'A<sup>b</sup>/<sub>c</sub>◂▸<sup>d</sup>/<sub>e</sub>', 'frac', 'mixed', 'k-fn'], ['DATA', 'STAT', 'data', 'stat', 'k-fn'], ['STATVAR', 'EXIT ST', 'statvar', 'exitstat', 'k-fn k-sm'], ['CLEAR', '', 'clear', null, 'k-clear']],
    [['π', 'HYP', 'pi', 'hyp', 'k-fn'], ['SIN', 'SIN<sup>-1</sup>', 'sin', 'asin', 'k-fn'], ['COS', 'COS<sup>-1</sup>', 'cos', 'acos', 'k-fn'], ['TAN', 'TAN<sup>-1</sup>', 'tan', 'atan', 'k-fn'], ['÷', 'K', 'div', 'konst', 'k-op']],
    [['^', '<sup>x</sup>√', 'pow', 'root', 'k-fn'], ['x<sup>-1</sup>', 'EE', 'inv', 'ee', 'k-fn'], ['(', '%', 'lp', 'pct', 'k-fn'], [')', ',', 'rp', 'comma', 'k-fn'], ['×', '', 'mul', null, 'k-op']],
    [['x<sup>2</sup>', '√', 'sq', 'sqrt', 'k-fn'], ['7', '', '7', null, 'k-num'], ['8', '', '8', null, 'k-num'], ['9', '', '9', null, 'k-num'], ['−', '', 'sub', null, 'k-op']],
    [['MEMVAR', 'CLRVAR', 'memvar', 'clrvar', 'k-fn k-sm'], ['4', '', '4', null, 'k-num'], ['5', '', '5', null, 'k-num'], ['6', '', '6', null, 'k-num'], ['+', '', 'add', null, 'k-op']],
    [['STO▸', 'RCL', 'sto', 'rcl', 'k-fn'], ['1', '', '1', null, 'k-num'], ['2', '', '2', null, 'k-num'], ['3', '', '3', null, 'k-num'], ['ENTER', '', 'enter', null, 'k-enter']],
    [['ON', 'OFF', 'on', 'off', 'k-on'], ['0', 'RESET', '0', 'reset', 'k-num'], ['.', 'FIX', '.', 'fix', 'k-num'], ['(−)', 'ANS', 'neg', 'ans', 'k-num']]
  ];

  // The arrow keys sit in a round 4-way pad at the top right, like the real TI-30XIIS (columns 4-5, rows 1-2).
  var ARROWS = [['▲', 'up', 'ca-up'], ['◄', 'left', 'ca-left'], ['►', 'right', 'ca-right'], ['▼', 'down', 'ca-down']];
  var NOT10C = { data: 'STAT', stat: 'STAT', statvar: 'STATVAR', exitstat: 'STAT', konst: 'K (constant)' };

  Calc.prototype.press = function (act) {
    var c = this;
    if (!c.on && act !== 'on') return;
    if (c.error) { c.error = null; if (act === 'clear' || act === 'enter' || act === 'left' || act === 'right' || act === 'del') return; c.clearEntry(); c.resultShown = false; }
    if (c.menu) return c.menuKey(act);
    var wasSecond = c.second; c.second = false;
    var hyp = c.hyp; if (act !== 'second') c.hyp = false;
    switch (act) {
      case 'second': c.second = !wasSecond; return;
      case 'on': c.on = true; c.clearEntry(); c.resultShown = false; return;
      case 'off': c.on = false; return;
      case 'clear': c.clearEntry(); c.resultShown = false; c.result = null; c.hpos = -1; return;
      case 'del': c.del(); return;
      case 'ins': c.ins = !c.ins; return;
      case 'left': if (c.resultShown) { c.resultShown = false; } c.cur = Math.max(0, c.cur - 1); return;
      case 'right': if (c.resultShown) { c.resultShown = false; } c.cur = Math.min(c.entry.length, c.cur + 1); return;
      case 'up': if (c.hist.length) { c.hpos = Math.min(c.hist.length - 1, c.hpos + 1); var h = c.hist[c.hpos]; c.entry = h.entry.slice(); c.cur = c.entry.length; c.result = h.result; c.showFrac = h.frac; c.showDMS = h.dms; c.resultShown = true; } return;
      case 'down': if (c.hpos > 0) { c.hpos--; var h2 = c.hist[c.hpos]; c.entry = h2.entry.slice(); c.cur = c.entry.length; c.result = h2.result; c.showFrac = h2.frac; c.showDMS = h2.dms; c.resultShown = true; } else { c.hpos = -1; c.clearEntry(); c.resultShown = false; c.result = null; } return;
      case 'enter': c.enter(); return;
      case 'fd': c.toggleFD(); return;
      case 'mixed': c.mixed = !c.mixed; return;
      case 'hyp': c.hyp = !hyp; return;
      // settings menus: arrow to a choice and press ENTER
      case 'drg': c.menu = { kind: 'drg', row: 0, col: [['DEG', 'RAD', 'GRAD'].indexOf(c.mode.angle)] }; return;
      case 'scieng': c.menu = { kind: 'scieng', row: 0, col: [['FLO', 'SCI', 'ENG'].indexOf(c.mode.note)] }; return;
      case 'fix': c.menu = { kind: 'fix', row: 0, col: [c.mode.fix + 1] }; return;
      case 'prb': c.menu = { kind: 'prb', row: 0, col: [0] }; return;
      case 'angle': c.menu = { kind: 'angle', row: 0, col: [0] }; return;
      case 'rtop': c.menu = { kind: 'rtop', row: 0, col: [0] }; return;
      case 'memvar': c.menu = { kind: 'memvar', row: 0, col: [0] }; return;
      case 'rcl': c.menu = { kind: 'rcl', row: 0, col: [0] }; return;
      case 'clrvar': c.menu = { kind: 'clrvar', row: 0, col: [0] }; return;
      case 'reset': c.menu = { kind: 'reset', row: 0, col: [1] }; return;
      case 'sto': if (!c.entry.length && !c.resultShown) return; c.menu = { kind: 'sto', row: 0, col: [0] }; return;
    }
    if (NOT10C[act]) { c.error = NOT10C[act] + ' is not used in Math 15'; return; }
    var tok = null;
    if (/^[0-9.]$/.test(act)) tok = T.d(act);
    else if (act === 'add') tok = T.op('+', 'add'); else if (act === 'sub') tok = T.op('-', 'sub');
    else if (act === 'mul') tok = T.op('*', 'mul'); else if (act === 'div') tok = T.op('/', 'div');
    else if (act === 'pow') tok = T.op('^', 'pow'); else if (act === 'root') tok = T.op('ˣ√', 'root');
    else if (act === 'neg') tok = T.neg();
    else if (act === 'lp') tok = T.lp(); else if (act === 'rp') tok = T.rp(); else if (act === 'comma') tok = T.comma();
    else if (act === 'pi') tok = T.c('π', 'pi');
    else if (act === 'ee') tok = { s: 'E', k: 'ee' };
    else if (act === 'frac') tok = T.frac();
    else if (act === 'ans') tok = { s: 'Ans', k: 'ans' };
    else if (act === 'sq') tok = T.post('²', 'sq');
    else if (act === 'inv') tok = T.post('⁻¹', 'inv'); else if (act === 'fact') tok = T.post('!', 'fact'); else if (act === 'pct') tok = T.post('%', 'pct');
    else if (act === 'sqrt') tok = T.fn('√(', 'sqrt'); else if (act === 'log') tok = T.fn('log(', 'log'); else if (act === 'ln') tok = T.fn('ln(', 'ln');
    else if (act === 'tenx') tok = T.fn('10^(', 'tenx'); else if (act === 'ex') tok = T.fn('e^(', 'ex');
    else if (/^a?(sin|cos|tan)$/.test(act)) {
      var base = act.replace(/^a/, ''), inv = act.length === 4;
      tok = hyp ? T.fn(base + 'h' + (inv ? '⁻¹(' : '('), act + 'h') : T.fn(inv ? base + '⁻¹(' : base + '(', act);
    }
    if (tok) c.insert(tok);
  };
  var MENUS = {
    drg: [['DEG', 'RAD', 'GRD']], scieng: [['FLO', 'SCI', 'ENG']], fix: [['F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']],
    prb: [['nPr', 'nCr', '!']], angle: [['°', "'", '"', 'r', 'g', '▸DMS']], rtop: [['R▸Pr', 'R▸Pθ', 'P▸Rx', 'P▸Ry']],
    clrvar: [['y', 'N']], reset: [['y', 'N']]
  };
  var ANGLE_POST = { '°': 'deg', "'": 'min', '"': 'sec', r: 'radu', g: 'gradu', '▸DMS': 'dms' };
  Calc.prototype.menuKey = function (act) {
    var c = this, m = c.menu;
    var rows = c.menuRows();
    if (act === 'clear') { c.menu = null; c.second = false; return; }
    if (act === 'second') { c.second = !c.second; return; }
    c.second = false;
    if (act === 'left') { m.col[m.row] = Math.max(0, m.col[m.row] - 1); return; }
    if (act === 'right') { m.col[m.row] = Math.min(rows[m.row].length - 1, m.col[m.row] + 1); return; }
    if (act === 'up' || act === 'down') return;
    if (act === m.kind || act === 'drg' && m.kind === 'drg') { c.menu = null; return; } // the same key again closes the menu
    if (act !== 'enter') return;
    var choice = rows[m.row][m.col[m.row]];
    c.menu = null;
    if (m.kind === 'drg') { c.mode.angle = choice === 'GRD' ? 'GRAD' : choice; return; }
    if (m.kind === 'scieng') { c.mode.note = choice; return; }
    if (m.kind === 'fix') { c.mode.fix = choice === 'F' ? -1 : Number(choice); return; }
    if (m.kind === 'reset') { if (choice === 'y') { var fresh = new Calc(); for (var k in fresh) if (Object.prototype.hasOwnProperty.call(fresh, k)) c[k] = fresh[k]; c.storeMsg = 'MEM CLEARED'; } return; }
    if (m.kind === 'clrvar') { if (choice === 'y') { for (var vn in c.vars) c.vars[vn] = V(0, [0, 1]); c.storeMsg = 'CLRVAR'; } return; }
    if (m.kind === 'prb') { c.insert(choice === '!' ? T.post('!', 'fact') : T.op(choice === 'nPr' ? ' nPr ' : ' nCr ', choice === 'nPr' ? 'npr' : 'ncr')); return; }
    if (m.kind === 'angle') { c.insert(T.post(choice, ANGLE_POST[choice])); return; }
    if (m.kind === 'rtop') { var t = T.fn(choice + '(', { 'R▸Pr': 'rpr', 'R▸Pθ': 'rpt', 'P▸Rx': 'prx', 'P▸Ry': 'pry' }[choice]); t.two = true; c.insert(t); return; }
    if (m.kind === 'rcl' || m.kind === 'memvar') { c.insert({ s: choice, k: 'var', n: choice }); return; }
    if (m.kind === 'sto') { // store the current entry (or the last result) in a letter
      if (!c.resultShown) c.enter();
      if (!c.error) { c.vars[choice] = c.ans; c.storeMsg = c.fmtPlain(c.ans) + '▸' + choice; }
    }
  };
  Calc.prototype.menuRows = function () {
    var m = this.menu; if (!m) return [];
    return MENUS[m.kind] || [['A', 'B', 'C', 'D', 'E']];
  };
  Calc.prototype.fmtPlain = function (v) { var f = this.fmt(v); return typeof f === 'string' ? f : f.m + (f.e != null ? 'E' + f.e : ''); };

  /* ---------------- the floating window ---------------- */
  var UI = null;
  function build() {
    var c = new Calc(), box = el('div', 'calc hidden'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Calculator (TI-30XIIS key layout)');
    box.tabIndex = -1;
    var head = el('div', 'calc-head', '<span class="calc-brand">The Reckoner <em>TI-30XIIS keys</em></span>');
    var close = el('button', 'calc-close', '<svg viewBox="0 0 16 16" aria-hidden="true" style="pointer-events:none"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>'); close.setAttribute('aria-label', 'Close calculator'); close.type = 'button'; close.title = 'Close calculator'; head.appendChild(close);
    var screen = el('div', 'calc-screen'), ind = el('div', 'calc-ind'), l1 = el('div', 'calc-l1'), l2 = el('div', 'calc-l2');
    screen.appendChild(ind); screen.appendChild(l1); screen.appendChild(l2);
    var pad = el('div', 'calc-pad');
    function wire(b, a1, a2) {
      b.type = 'button'; b.dataset.a = a1; if (a2) b.dataset.b = a2;
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); var act = (c.second && a2) ? a2 : a1; c.press(act); render(); b.classList.add('down'); setTimeout(function () { b.classList.remove('down'); }, 90); });
      b.addEventListener('click', function (e) { e.preventDefault(); });
      return b;
    }
    KEYS.forEach(function (row, ri) {
      row.forEach(function (k) {
        var long2 = k[1].replace(/<[^>]+>/g, '').length > 6;
        pad.appendChild(wire(el('button', 'ck ' + k[4], (k[1] ? '<span class="ck2' + (long2 ? ' sm' : '') + '">' + k[1] + '</span>' : '<span class="ck2">&nbsp;</span>') + '<span class="ck1">' + k[0] + '</span>'), k[2], k[3]));
      });
      if (ri === 0) {
        var dpad = el('div', 'calc-dpad'), ring = el('div', 'cd-ring');
        ARROWS.forEach(function (a) { var b = wire(el('button', 'ca ' + a[2], '<span>' + a[0] + '</span>'), a[1], null); b.setAttribute('aria-label', a[1]); ring.appendChild(b); });
        ring.appendChild(el('div', 'cd-hub'));
        dpad.appendChild(ring); pad.appendChild(dpad);
      }
    });
    box.appendChild(head); box.appendChild(screen); box.appendChild(pad);
    document.body.appendChild(box);
    function render() {
      ind.innerHTML = (c.second ? '<b>2nd</b>' : '<b class="off">2nd</b>') + (c.hyp ? '<span>HYP</span>' : '') + (c.mode.note !== 'FLO' ? '<span>' + c.mode.note + '</span>' : '') + '<span>' + c.mode.angle + '</span>' + (c.mode.fix >= 0 ? '<span>FIX</span>' : '') + (c.ins ? '<span>INS</span>' : '') + (c.menu ? '' : (c.hpos >= 0 ? '<span>▲</span>' : ''));
      if (!c.on) { l1.textContent = ''; l2.textContent = ''; box.classList.add('off'); return; }
      box.classList.remove('off');
      if (c.menu) {
        var rows = c.menuRows();
        l1.innerHTML = rows.map(function (r, ri) { return r.map(function (o, ci) { var sel = c.menu.col[ri] === ci; return '<span class="mi' + (sel ? ' sel' : '') + (ri === c.menu.row && sel ? ' cur' : '') + '">' + esc(o) + '</span>'; }).join(' '); })[0];
        var mk = c.menu.kind, pick = rows[0][c.menu.col[0]];
        l2.innerHTML = mk === 'memvar' || mk === 'rcl' ? esc(pick + '= ' + c.fmtPlain(c.vars[pick])) : mk === 'reset' ? 'RESET' : mk === 'clrvar' ? 'CLRVAR' : '';
        l2.classList.add('menu'); return;
      }
      l2.classList.remove('menu');
      if (c.error) { l1.innerHTML = '<span class="calc-err">' + c.error + '</span>'; l2.textContent = ''; return; }
      // entry line with cursor
      var html = '', toks = c.entry;
      for (var i = 0; i <= toks.length; i++) {
        if (i === c.cur && !c.resultShown) html += '<span class="calc-cur' + (c.ins ? ' ins' : '') + '">' + (toks[i] ? esc(toks[i].s) : '&nbsp;') + '</span>';
        else if (toks[i]) html += esc(toks[i].s);
      }
      l1.innerHTML = '<span class="calc-entry">' + html + '</span>';
      l1.scrollLeft = l1.scrollWidth;
      if (c.storeMsg) { l2.innerHTML = esc(c.storeMsg); c.storeMsg = null; return; }
      if (c.resultShown && c.result) {
        var f = c.fmt(c.result);
        l2.innerHTML = typeof f === 'string' ? esc(f) : esc(f.m) + (f.e != null ? '<span class="calc-x10">×10</span><sup>' + f.e + '</sup>' : '');
      } else l2.innerHTML = '';
    }
    function esc(s) { return String(s).replace(/[&<>]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]; }); }
    close.addEventListener('click', function () { api.hide(); });
    // drag by the head (desktop). A press anywhere on the close button, including the lines of its SVG cross, must not
    // start a drag: the pointer capture would retarget the click to the head and the calculator would not close.
    var drag = null;
    head.addEventListener('pointerdown', function (e) { if (close.contains(e.target)) return; var r = box.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }; head.setPointerCapture(e.pointerId); });
    head.addEventListener('pointermove', function (e) { if (!drag) return; var x = Math.max(0, Math.min(innerWidth - box.offsetWidth, e.clientX - drag.dx)), y = Math.max(0, Math.min(innerHeight - 40, e.clientY - drag.dy)); box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.right = 'auto'; box.style.bottom = 'auto'; });
    head.addEventListener('pointerup', function () { drag = null; });
    // physical keyboard while the calculator has focus
    var KB = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '.': '.', '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '^': 'pow', '(': 'lp', ')': 'rp', 'Enter': 'enter', '=': 'enter', 'Backspace': 'del', 'Delete': 'del', 'Escape': 'clear', 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down', '%': 'pct', '!': 'fact' };
    box.addEventListener('keydown', function (e) { var a = KB[e.key]; if (a) { e.preventDefault(); e.stopPropagation(); c.press(a); render(); } });
    box.addEventListener('pointerdown', function () { try { box.focus({ preventScroll: true }); } catch (e) {} });
    render();
    var api = {
      calc: c, node: box, render: render,
      show: function () { box.classList.remove('hidden'); document.body.classList.add('calc-open'); render(); try { box.focus({ preventScroll: true }); } catch (e) {} if (api.onToggle) api.onToggle(true); },
      hide: function () { box.classList.add('hidden'); document.body.classList.remove('calc-open'); if (api.onToggle) api.onToggle(false); },
      toggle: function () { if (box.classList.contains('hidden')) api.show(); else api.hide(); },
      isOpen: function () { return !box.classList.contains('hidden'); },
      press: function (seq) { seq.forEach(function (a) { c.press(a); }); render(); return { l1: l1.textContent, l2: l2.textContent }; }
    };
    return api;
  }
  HW.Calc = { engine: Calc, get: function () { if (!UI) UI = build(); return UI; }, toggle: function () { HW.Calc.get().toggle(); } };
})(window);
