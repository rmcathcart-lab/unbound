function fmtNum_(v) { return String(Math.round(v * 1e6) / 1e6); }
function mathParseLenient_(s) {   // forgive empty exponent boxes and unbalanced brackets
  var tries = [s];
  var t = String(s).replace(/\^\{\s*(\\placeholder\{\})?\s*\}/g, '').replace(/\\placeholder\{\}/g, '');
  tries.push(t);
  var open = (t.match(/\(/g) || []).length, close = (t.match(/\)/g) || []).length;
  if (open > close) tries.push(t + new Array(open - close + 1).join(')'));
  if (close > open) { var u = t, extra = close - open; while (extra-- > 0) u = u.replace(/\)(?![\s\S]*\))/, ''); tries.push(u); }
  for (var i = 0; i < tries.length; i++) { try { return mathParse_(tries[i]); } catch (e) {} }
  return null;
}

/* ================= MATH CHECKER =================
 * Reads what a student typed (LaTeX from the math keyboard, or plain text like 3/4, x^2, sqrt(63))
 * and compares it with the answer key.
 *   mathParse_(s)          -> expression tree (throws on unreadable input)
 *   mathKey_(tree)         -> canonical "form" string (order of terms/factors doesn't matter)
 *   mathSame_(a, b, mode)  -> 'exact' = same form, 'equivalent' = same value/expression
 *   mathValue_(tree)       -> number (no variables)
 */
function mathPre_(s) {
  s = String(s == null ? '' : s);
  s = s.replace(/(\d)(?:\s|\\,|\\ |\\;)+(?=\d{3}(?!\d))/g, '$1');   // 308 000 or 308\,000 -> 308000
  var sup = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (m) { return '^{' + m.split('').map(function (c) { return sup[c]; }).join('') + '}'; });
  s = s.replace(/\\left|\\right|\\displaystyle|\\,|\\;|\\:|\\!|\\ |~/g, ' ')
    .replace(/\\[dt]frac/g, '\\frac')
    .replace(/\\cdot|\\times|×|·|∙|⋅/g, '*')
    .replace(/\\div|÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/\\pi|π/g, ' \\pi ')
    .replace(/∛\s*(\d+(?:\.\d+)?)/g, '\\sqrt[3]{$1}').replace(/∛/g, 'cbrt')
    .replace(/√\s*(\d+(?:\.\d+)?)/g, '\\sqrt{$1}').replace(/√/g, '\\sqrt')
    .replace(/\\lbrace|\\\{/g, ' \\setopen ').replace(/\\rbrace|\\\}/g, ' \\setclose ')
    .replace(/\\lt|</g, '<').replace(/\\gt|>/g, '>')
    .replace(/\{,\}/g, '.');          // European decimal comma from some keyboards
  return s;
}

function mathTokens_(s) {
  var t = [], i = 0, m;
  while (i < s.length) {
    var c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if ((m = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i)))) { t.push({ k: 'num', v: m[0] }); i += m[0].length; continue; }
    if (c === '\\') {
      m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
      if (!m) { i++; continue; }
      var cmd = m[1]; i += m[0].length;
      if (cmd === 'frac' || cmd === 'sqrt' || cmd === 'pi' || cmd === 'setopen' || cmd === 'setclose') t.push({ k: cmd });
      else if (cmd === 'placeholder') throw new Error('empty box');
      else if (cmd === 'mathrm' || cmd === 'text' || cmd === 'operatorname' || cmd === 'mathit') t.push({ k: 'ignoregroup' });
      else throw new Error('unknown \\' + cmd);
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      if (/^sqrt/i.test(s.slice(i))) { t.push({ k: 'sqrt' }); i += 4; continue; }
      if (/^cbrt/i.test(s.slice(i))) { t.push({ k: 'cbrt' }); i += 4; continue; }
      if (/^pi(?![a-z])/i.test(s.slice(i))) { t.push({ k: 'pi' }); i += 2; continue; }
      if (/^or(?![a-z])/i.test(s.slice(i))) { t.push({ k: ',' }); i += 2; continue; }
      if (/^and(?![a-z])/i.test(s.slice(i))) { t.push({ k: ',' }); i += 3; continue; }
      t.push({ k: 'var', v: c }); i++; continue;
    }
    if ('+-*/^=(),{}[]<>'.indexOf(c) >= 0) { t.push({ k: c }); i++; continue; }
    if (c === ';') { t.push({ k: ',' }); i++; continue; }
    throw new Error('unexpected ' + c);
  }
  return t;
}

function mathParse_(input) {
  var latex = /[\\{}]/.test(String(input));
  var toks = mathTokens_(mathPre_(input)), p = 0;
  if (!toks.length) throw new Error('empty');
  function peek(k) { return p < toks.length && toks[p].k === k; }
  function eat(k) { if (!peek(k)) throw new Error('expected ' + k); return toks[p++]; }
  function startsPrimary() {
    if (p >= toks.length) return false;
    var k = toks[p].k;
    return k === 'num' || k === 'var' || k === '(' || k === '{' || k === 'frac' || k === 'sqrt' || k === 'cbrt' || k === 'pi' || k === 'setopen' || k === 'ignoregroup';
  }
  function relation() {
    var a = expr();
    if (peek('=') || peek('<') || peek('>')) { var op = toks[p++].k; var b = expr(); return { t: op === '=' ? 'eq' : 'ineq', op: op, a: a, b: b }; }
    return a;
  }
  function top() { // "x = -5, x = 3" (or "or") -> solution set; "9, 13" -> pair
    var items = [relation()];
    while (peek(',')) { p++; items.push(relation()); }
    if (items.length === 1) return items[0];
    return items.some(function (x) { return x.t === 'eq' || x.t === 'ineq'; }) ? { t: 'set', a: items } : { t: 'tuple', a: items };
  }
  function list() {
    var items = [expr()];
    while (peek(',')) { p++; items.push(expr()); }
    return items.length === 1 ? items[0] : { t: 'tuple', a: items };
  }
  function expr() {
    var terms = [term()];
    while (peek('+') || peek('-')) { var op = toks[p++].k; var x = term(); terms.push(op === '-' ? { t: 'neg', a: x } : x); }
    return terms.length === 1 ? terms[0] : { t: 'add', a: terms };
  }
  function term() {
    var f = unary();
    for (;;) {
      if (peek('*')) { p++; f = { t: 'mul', a: [f, unary()] }; }
      else if (peek('/')) { p++; f = { t: 'div', a: f, b: unary() }; }
      else if (startsPrimary()) {
        var mixed = f.t === 'num' && !f.fromPow && toks[p].k === 'frac';
        var nxt = power();
        if (mixed && nxt.t === 'div' && mathStrip_(nxt.a).t === 'num' && mathStrip_(nxt.b).t === 'num') f = { t: 'add', a: [f, nxt], mixed: true };   // 1\frac{1}{2} = 1½
        else f = { t: 'mul', a: [f, nxt] };
      }
      else return f;
    }
  }
  function unary() {
    if (peek('-')) { p++; return { t: 'neg', a: unary() }; }
    if (peek('+')) { p++; return unary(); }
    return power();
  }
  function power() {
    var b = primary();
    if (peek('^')) {
      p++;
      var e;
      if (peek('{')) { p++; e = relationNoRel(); eat('}'); }
      else if (peek('-')) { p++; e = { t: 'neg', a: primary() }; }
      else if (peek('num') && latex) { var n = toks[p++].v; e = { t: 'num', v: Number(n.charAt(0)) }; if (n.length > 1) { toks.splice(p, 0, { k: 'num', v: n.slice(1) }); } } // x^23 in LaTeX means x^2 * 3
      else e = primary();
      b = { t: 'pow', a: b, b: e };
    }
    return b;
  }
  function relationNoRel() { return list(); }
  function group() { // {...} or (...) or single primary for \frac12
    if (peek('{')) { p++; var g = list(); eat('}'); return g; }
    if (peek('num')) { var n = toks[p++].v; if (n.length > 1 && n.indexOf('.') < 0) { toks.splice(p, 0, { k: 'num', v: n.slice(1) }); n = n.charAt(0); } return { t: 'num', v: Number(n) }; }
    return primary();
  }
  function primary() {
    if (p >= toks.length) throw new Error('unexpected end');
    var tk = toks[p];
    if (tk.k === 'num') { p++; return { t: 'num', v: Number(tk.v) }; }
    if (tk.k === 'var') { p++; return { t: 'var', n: tk.v }; }
    if (tk.k === 'pi') { p++; return { t: 'pi' }; }
    if (tk.k === '(' || tk.k === '[') { p++; var inner = list(); if (peek(')')) p++; else eat(']'); return inner.t === 'tuple' ? inner : { t: 'paren', a: inner }; }
    if (tk.k === '{') { p++; var g = list(); eat('}'); return g; }
    if (tk.k === 'ignoregroup') { p++; return group(); }
    if (tk.k === 'setopen') { p++; var items = peek('setclose') ? [] : [expr()]; while (peek(',')) { p++; items.push(expr()); } eat('setclose'); return { t: 'set', a: items }; }
    if (tk.k === 'frac') { p++; var num = group(), den = group(); return { t: 'div', a: num, b: den }; }
    if (tk.k === 'cbrt') { p++; return { t: 'root', n: { t: 'num', v: 3 }, a: peek('(') ? primary() : group() }; }
    if (tk.k === 'sqrt') {
      p++;
      var idx = { t: 'num', v: 2 };
      if (peek('[')) { p++; idx = expr(); eat(']'); }
      var rad = peek('(') ? primary() : group();
      return { t: 'root', n: idx, a: rad };
    }
    throw new Error('unexpected ' + tk.k);
  }
  var tree = top();
  if (p < toks.length) throw new Error('extra ' + toks[p].k);
  return tree;
}

function mathUnVar_(x) { // inside a solution list, "x = 2" and "2" mean the same thing
  var s = mathStrip_(x);
  if (s.t === 'eq' && mathStrip_(s.a).t === 'var') return s.b;
  if (s.t === 'eq' && mathStrip_(s.b).t === 'var') return s.a;
  return x;
}
function mathStrip_(n) { while (n && n.t === 'paren') n = n.a; return n; }

/* ---- canonical form key (for "exact" checking) ---- */
function mathKey_(n) {
  n = mathStrip_(n);
  switch (n.t) {
    case 'num': return mathNumStr_(n.v);
    case 'var': return n.n;
    case 'pi': return 'π';
    case 'neg': case 'mul': return mathMulKey_(n);
    case 'add':
      var terms = [];
      (function flat(x) { x = mathStrip_(x); if (x.t === 'add') x.a.forEach(flat); else terms.push(mathKey_(x)); })(n);
      return 'add(' + terms.sort().join(',') + ')';
    case 'div':
      var sa = mathSignSplit_(n.a), sb = mathSignSplit_(n.b), sign = sa.sign * sb.sign;
      var k = 'div(' + sa.key + ',' + sb.key + ')';
      return sign < 0 ? 'mul(-1,' + k + ')' : k;
    case 'pow': return 'pow(' + mathKey_(n.a) + ',' + mathKey_(n.b) + ')';
    case 'root': return 'root(' + mathKey_(n.n) + ',' + mathKey_(n.a) + ')';
    case 'tuple': return 'tuple(' + n.a.map(mathKey_).join(',') + ')';
    case 'set': return 'set(' + n.a.map(function (x) { return mathKey_(mathUnVar_(x)); }).sort().join(',') + ')';
    case 'eq': var l = mathKey_(n.a), r = mathKey_(n.b); return 'eq(' + [l, r].sort().join(',') + ')';
    case 'ineq': return 'ineq(' + mathKey_(n.a) + n.op + mathKey_(n.b) + ')';
  }
  throw new Error('bad node');
}
function mathNumStr_(v) { return String(Math.round(v * 1e9) / 1e9); }
function mathMulKey_(n) {
  var coef = 1, fac = [];
  (function flat(x) {
    x = mathStrip_(x);
    if (x.t === 'neg') { coef = -coef; flat(x.a); }
    else if (x.t === 'mul') x.a.forEach(flat);
    else if (x.t === 'num') coef *= x.v;
    else fac.push(mathKey_(x));
  })(n);
  if (!fac.length) return mathNumStr_(coef);
  fac.sort();
  if (coef === 1 && fac.length === 1) return fac[0];
  return 'mul(' + (coef === 1 ? '' : mathNumStr_(coef) + ',') + fac.join(',') + ')';
}
function mathSignSplit_(x) { // pull a leading minus out of a numerator/denominator
  var k = mathKey_(x);
  if (/^-\d/.test(k)) return { sign: -1, key: k.slice(1) };
  var m = /^mul\(-1,(.*)\)$/.exec(k);
  if (m) return { sign: -1, key: m[1].indexOf(',') >= 0 ? 'mul(' + m[1] + ')' : m[1] };
  m = /^mul\(-([\d.]+),(.*)\)$/.exec(k);
  if (m) return { sign: -1, key: 'mul(' + m[1] + ',' + m[2] + ')' };
  return { sign: 1, key: k };
}

/* ---- evaluation (for "equivalent" checking and numeric answers) ---- */
function mathEval_(n, env) {
  n = mathStrip_(n);
  switch (n.t) {
    case 'num': return n.v;
    case 'var': if (!(n.n in env)) throw new Error('has variable ' + n.n); return env[n.n];
    case 'pi': return Math.PI;
    case 'neg': return -mathEval_(n.a, env);
    case 'add': return n.a.reduce(function (s, x) { return s + mathEval_(x, env); }, 0);
    case 'mul': return n.a.reduce(function (s, x) { return s * mathEval_(x, env); }, 1);
    case 'div': return mathEval_(n.a, env) / mathEval_(n.b, env);
    case 'pow': return Math.pow(mathEval_(n.a, env), mathEval_(n.b, env));
    case 'root':
      var k = mathEval_(n.n, env), v = mathEval_(n.a, env);
      if (v < 0 && Math.round(k) % 2 === 1) return -Math.pow(-v, 1 / k);
      return Math.pow(v, 1 / k);
  }
  throw new Error('cannot evaluate ' + n.t);
}
function mathVars_(n, out) {
  out = out || {};
  if (!n || typeof n !== 'object') return out;
  if (n.t === 'var') out[n.n] = true;
  ['a', 'b', 'n'].forEach(function (f) {
    var c = n[f];
    if (Array.isArray(c)) c.forEach(function (x) { mathVars_(x, out); }); else if (c && typeof c === 'object') mathVars_(c, out);
  });
  return out;
}
function mathValue_(n) { return mathEval_(n, {}); }
function mathClose_(a, b, tol) {
  if (!isFinite(a) || !isFinite(b)) return false;
  return Math.abs(a - b) <= (tol || 0) + 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
}
var MATH_POINTS_ = [1.37, 2.19, 0.71, 3.03, 1.83, 2.61];
function mathEquiv_(A, B) {
  A = mathStrip_(A); B = mathStrip_(B);
  if (A.t === 'tuple' || B.t === 'tuple') {
    if (A.t !== B.t || A.a.length !== B.a.length) return false;
    return A.a.every(function (x, i) { return mathEquiv_(x, B.a[i]); });
  }
  if (A.t === 'set' || B.t === 'set') {
    if (A.t !== B.t) return false;
    A = { t: 'set', a: A.a.map(mathUnVar_) }; B = { t: 'set', a: B.a.map(mathUnVar_) };
    var used = [];
    return A.a.length === B.a.length && A.a.every(function (x) {
      for (var i = 0; i < B.a.length; i++) if (used.indexOf(i) < 0 && mathEquiv_(x, B.a[i])) { used.push(i); return true; }
      return false;
    });
  }
  if (A.t === 'ineq' || B.t === 'ineq') return A.t === B.t && mathKey_(A) === mathKey_(B);
  var vars = Object.keys(mathVars_(A)).concat(Object.keys(mathVars_(B))).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
  var isEq = A.t === 'eq' || B.t === 'eq';
  if (isEq && (A.t !== 'eq' || B.t !== 'eq')) {
    // student typed "x = 4" where "4" is expected: compare the value side (a bare "4" never matches an equation)
    if (A.t !== 'eq') return false;
    var E = A, O = B;
    var side = mathStrip_(E.a).t === 'var' ? E.b : (mathStrip_(E.b).t === 'var' ? E.a : null);
    return side ? mathEquiv_(side, O) : false;
  }
  var ratio = null;
  for (var k = 0; k < MATH_POINTS_.length; k++) {
    var env = {};
    vars.forEach(function (v, j) { env[v] = MATH_POINTS_[(k + j * 2) % MATH_POINTS_.length] + j * 0.37; });
    var a, b;
    try {
      if (isEq) { a = mathEval_(A.a, env) - mathEval_(A.b, env); b = mathEval_(B.a, env) - mathEval_(B.b, env); }
      else { a = mathEval_(A, env); b = mathEval_(B, env); }
    } catch (e) { return false; }
    if (isEq) { // same line/equation if one side is a constant multiple of the other
      if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) continue;
      if (Math.abs(a) < 1e-12 || Math.abs(b) < 1e-12) return false;
      var r = a / b;
      if (ratio === null) ratio = r; else if (!mathClose_(r, ratio)) return false;
    } else if (!mathClose_(a, b)) return false;
  }
  return true;
}
function mathSame_(A, B, mode) {
  if (mode === 'exact') {
    var ka = mathKey_(A), kb = mathKey_(B);
    if (ka === kb) return true;
    // "x = 4" typed where "4" is expected (or the reverse)
    var sa = mathStrip_(A), sb = mathStrip_(B);
    if (sa.t === 'eq' && sb.t !== 'eq' && mathStrip_(sa.a).t === 'var') return mathKey_(sa.b) === kb;
    return false;
  }
  return mathEquiv_(A, B);
}
