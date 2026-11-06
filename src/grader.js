/* ===================== GRADER =====================
 * Wraps the math checker (shared with the exit-slip app) for the game.
 * grade(q, raw) -> { ok: bool, reason: 'blank' | 'unreadable' | 'form' | 'wrong' | '' , value }
 */
function gradeAnswer(q, raw) {
  raw = String(raw == null ? '' : raw).trim();
  if (!raw) return { ok: false, reason: 'blank' };
  var work = raw;
  // "x = 4" or working like "8+2 = 10": mark the last part
  var wantsEq = q.type === 'expr' && q.answers.some(function (a) { return a.indexOf('=') >= 0; });
  if (!wantsEq && work.indexOf('=') >= 0) { var parts = work.split('='), last = parts[parts.length - 1].trim(); if (last) work = last; }
  // forgive units / degree signs typed after the answer
  var bare = work.replace(/\\text\{[^}]*\}/g, '').replace(/\\mathrm\{[^}]*\}/g, '').replace(/\^\{?\\circ\}?|°|\\degree/g, '');
  if (q.type === 'num') bare = bare.replace(/(\s|\\,|\\ )*(mm|cm|km|m|in|ft|yd|mi|mL|ml|L|kg|g|s|h|min|units?|degrees?|deg)(\^\{?[23]\}?)?\s*$/, '');
  if (bare.trim()) work = bare;
  var S = mathParseLenient_(work);
  if (!S) return { ok: false, reason: 'unreadable' };
  if (q.type === 'num') {
    var v;
    try { v = mathValue_(mathStrip_(S)); } catch (e) { return { ok: false, reason: 'unreadable' }; }
    if (!isFinite(v)) return { ok: false, reason: 'unreadable' };
    for (var i = 0; i < q.answers.length; i++) {
      var target = mathValue_(mathStrip_(mathParse_(q.answers[i])));
      if (mathClose_(v, target, q.tol || 0)) return { ok: true, reason: '', value: v };
    }
    return { ok: false, reason: 'wrong', value: v };
  }
  if (q.primeOnly) return gradePrimes_(q, work);
  var mode = q.check || 'exact', trees = q.answers.map(function (a) { return mathParse_(a); });
  // a bare list "4, -2/3" typed for a solution set: compare it as a set (any order)
  var St = mathStrip_(S), isSolList = function (t) { t = mathStrip_(t); return t.t === 'set' && t.a.length && t.a.every(function (x) { return mathStrip_(x).t === 'eq'; }); };
  if (St.t === 'tuple' && trees.some(isSolList) && !trees.some(function (t) { return mathStrip_(t).t === 'tuple'; })) S = { t: 'set', a: St.a };
  if (St.t === 'eq' && trees.some(isSolList)) S = { t: 'set', a: [St] };
  var opMissing = q.requireOp && !/\\times|\\cdot|\*|×|·|\^/.test(work);
  if (!opMissing) for (var j = 0; j < trees.length; j++) { try { if (mathSame_(S, trees[j], mode)) return { ok: true, reason: '' }; } catch (e) {} }
  if (mode === 'exact') { for (var k = 0; k < trees.length; k++) { try { if (mathSame_(S, trees[k], 'equivalent')) return { ok: false, reason: 'form' }; } catch (e2) {} } }
  return { ok: false, reason: 'wrong' };
}
/* "write n as a product of prime factors": every factor must be a prime (powers of primes are fine) and the product must be n.
   2^{2}\times3^{2}, 2\times2\times3\times3 and 3^2*2^2 all pass; 4\times9 has the right value but is graded 'form'. */
function primeTokens_(str) {
  var t = String(str).replace(/\\left|\\right|[{}\s]|\\,|\\ /g, '').replace(/\\times|\\cdot|\\ast|×|·|⋅/g, '*');
  if (!t) return null; var parts = t.split('*'), out = [];
  for (var i = 0; i < parts.length; i++) { var m = /^\(?(\d+)\)?(?:\^\(?(\d+)\)?)?$/.exec(parts[i]); if (!m) return null; out.push([parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1]); }
  return out;
}
function isPrime_(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
function gradePrimes_(q, work) {
  var want = primeTokens_(q.answers[0]), target = 1; if (!want) return { ok: false, reason: 'wrong' };
  want.forEach(function (p) { target *= Math.pow(p[0], p[1]); });
  var got = primeTokens_(work);
  if (!got) { var v = NaN; try { v = mathValue_(mathStrip_(mathParseLenient_(work))); } catch (e) {} return { ok: false, reason: Math.abs(v - target) < 1e-9 ? 'form' : (isFinite(v) ? 'wrong' : 'unreadable') }; }
  var prod = 1, allPrime = true; got.forEach(function (p) { prod *= Math.pow(p[0], p[1]); if (!isPrime_(p[0]) || p[1] < 1) allPrime = false; });
  if (prod !== target) return { ok: false, reason: 'wrong' };
  return allPrime && (got.length > 1 || got[0][1] > 1 || (want.length === 1 && want[0][1] === 1)) ? { ok: true, reason: '' } : { ok: false, reason: 'form' };
}
if (typeof module !== 'undefined') module.exports = gradeAnswer;
