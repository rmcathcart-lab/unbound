// node tests/test_gens.js [runs]: every generator, every answer graded by the real grader; plus wrong-form checks
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console, Math, module: {}, window: {} }; vm.createContext(ctx);
for (const f of ['checker.js', 'grader.js', 'figures.js', 'questions.js', 'questions_u2.js', 'questions_u3.js', 'questions_u4.js', 'questions_u5.js', 'questions_u6.js', 'questions_u7.js', 'questions_u8.js'].filter(f => fs.existsSync(path.join(__dirname, '../src', f)))) vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', f), 'utf8').replace(/if \(typeof module[^\n]*/g, ''), ctx);
const N = +process.argv[2] || 400; let n = 0, bad = 0;
const keys = Object.keys(ctx.QGen.GENS).filter(k => !/^TUT/.test(k));
for (const k of keys) for (let i = 0; i < N; i++) {
  const q = ctx.QGen.make(k);
  for (const a of q.answers) { const r = ctx.gradeAnswer(q, a); n++; if (!r.ok) { bad++; if (bad < 15) console.log('REJECT', k, q.tpl, JSON.stringify(a), r.reason, q.prompt.replace(/<[^>]+>/g, ' ').slice(0, 120)); } }
  // a wrong number should be rejected
  if (q.type === 'num') { const r = ctx.gradeAnswer(q, String(Number(q.answers[0]) + 1)); if (r.ok) { bad++; console.log('ACCEPT WRONG', k, q.tpl); } }
}
console.log(keys.join(' '), '\n', n, 'answers graded,', bad, 'problems');
