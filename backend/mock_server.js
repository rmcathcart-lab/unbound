/* Runs backend/Code.gs locally for tests: an in-memory stand-in for SpreadsheetApp, CacheService, LockService,
 * PropertiesService, ContentService, Utilities and Session, served over HTTP the way the Apps Script web app is.
 *   node backend/mock_server.js [port] [delayMs]      GET ?action=… (JSONP) and POST (text/plain JSON) like /exec
 * Nothing here is deployed; it exists so the duel and leaderboard flows can be tested end to end. */
var fs = require('fs'), http = require('http'), url = require('url'), vm = require('vm'), path = require('path');
var PORT = Number(process.argv[2] || 8765), DELAY = Number(process.argv[3] || 400);

function Sheet(name) { this.name = name; this.rows = []; }
Sheet.prototype = {
  appendRow: function (r) { this.rows.push(r.slice()); return this; },
  setFrozenRows: function () { return this; },
  getLastRow: function () { return this.rows.length; },
  getLastColumn: function () { return this.rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0); },
  deleteRow: function (i) { this.rows.splice(i - 1, 1); },
  getRange: function (r, c, nr, nc) {
    var sh = this; nr = nr || 1; nc = nc || 1;
    var rg = {
      getValues: function () { var out = []; for (var i = 0; i < nr; i++) { var row = sh.rows[r - 1 + i] || [], o = []; for (var j = 0; j < nc; j++) { var v = row[c - 1 + j]; o.push(v === undefined ? '' : v); } out.push(o); } return out; },
      setValues: function (vals) { for (var i = 0; i < nr; i++) { var row = sh.rows[r - 1 + i] = sh.rows[r - 1 + i] || []; for (var j = 0; j < nc; j++) row[c - 1 + j] = vals[i][j]; } return rg; },
      setFontWeight: function () { return rg; }
    };
    return rg;
  }
};
var book = { sheets: {}, id: 'mock-sheet' };
var SpreadsheetApp = {
  create: function () { return SS; }, openById: function () { return SS; }
};
var SS = {
  getId: function () { return book.id; }, getUrl: function () { return 'https://docs.google.com/spreadsheets/d/mock'; },
  getSheetByName: function (n) { return book.sheets[n] || null; },
  insertSheet: function (n) { return (book.sheets[n] = new Sheet(n)); },
  getSheets: function () { return Object.keys(book.sheets).map(function (k) { return book.sheets[k]; }); },
  deleteSheet: function (s) { delete book.sheets[s.name]; }
};
var props = { TEACHER_KEY: 'testkey', SHEET_ID: 'mock-sheet' };
var PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return props[k] == null ? null : props[k]; }, setProperty: function (k, v) { props[k] = String(v); } }; } };
var cache = {};
var CacheService = { getScriptCache: function () { return {
  get: function (k) { var e = cache[k]; if (!e || e.exp < Date.now()) return null; return e.v; },
  put: function (k, v, ttl) { cache[k] = { v: String(v), exp: Date.now() + (ttl || 600) * 1000 }; },
  remove: function (k) { delete cache[k]; } }; } };
var LockService = { getScriptLock: function () { return { waitLock: function () {}, releaseLock: function () {} }; } };
var ContentService = { MimeType: { JAVASCRIPT: 'js', JSON: 'json' }, createTextOutput: function (t) { var o = { text: t, mime: 'json', setMimeType: function (m) { o.mime = m; return o; } }; return o; } };
var Utilities = { getUuid: function () { return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function () { return (Math.random() * 16 | 0).toString(16); }); },
  formatDate: function (d, tz, f) { // the patterns Code.gs uses: yyyy MM dd HH mm u (1 = Monday), in the given time zone
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz || 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
      .formatToParts(new Date(d)).forEach(function (p) { o[p.type] = p.value; });
    var u = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[o.weekday];
    return String(f).replace(/yyyy|MM|dd|HH|mm|u/g, function (t) { return { yyyy: o.year, MM: o.month, dd: o.day, HH: o.hour, mm: o.minute, u: String(u) }[t]; });
  } };
var Session = { getScriptTimeZone: function () { return 'America/Edmonton'; } };
var Logger = { log: function () {} };

var OFFSET = 0; // /__set?__offset=<ms> moves the backend's clock (to test class times)
function FakeDate() { var a = Array.prototype.slice.call(arguments); return a.length ? new (Function.prototype.bind.apply(Date, [null].concat(a)))() : new Date(Date.now() + OFFSET); }
FakeDate.now = function () { return Date.now() + OFFSET; }; FakeDate.UTC = Date.UTC; FakeDate.parse = Date.parse; FakeDate.prototype = Date.prototype;
var ctx = vm.createContext({ Intl: Intl, SpreadsheetApp: SpreadsheetApp, PropertiesService: PropertiesService, CacheService: CacheService, LockService: LockService, ContentService: ContentService, Utilities: Utilities, Session: Session, Logger: Logger, JSON: JSON, Math: Math, Date: FakeDate, String: String, Number: Number, Object: Object, Array: Array });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8'), ctx);
vm.runInContext('setup()', ctx);

var stats = { get: 0, post: 0, maxConcurrent: 0, open: 0 };
http.createServer(function (req, res) {
  var u = url.parse(req.url, true), body = '';
  if (u.pathname === '/__stats') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ stats: stats, sheets: Object.keys(book.sheets).reduce(function (o, k) { o[k] = book.sheets[k].rows; return o; }, {}), props: props })); return; }
  if (u.pathname === '/__rows' && req.method === 'POST') { // test-only: append rows to a sheet { sheet, cols, rows } (column 1 numbers become Dates)
    var raw = ''; req.on('data', function (c) { raw += c; }); req.on('end', function () { var b = JSON.parse(raw), sh = book.sheets[b.sheet] || SS.insertSheet(b.sheet); if (!sh.rows.length) sh.appendRow(b.cols);
      b.rows.forEach(function (r) { if (b.dateCols) b.dateCols.forEach(function (i) { if (typeof r[i] === 'number') r[i] = new Date(r[i]); }); sh.appendRow(r); }); vm.runInContext("CacheService.getScriptCache().remove('ledger')", ctx); res.end('ok ' + sh.rows.length); }); return; }
  if (u.pathname === '/__set') { Object.keys(u.query).forEach(function (k) { if (k === '__offset') OFFSET = Number(u.query[k]) || 0; else props[k] = u.query[k]; }); res.end('ok'); return; }
  req.on('data', function (c) { body += c; });
  req.on('end', function () {
    stats.open++; stats.maxConcurrent = Math.max(stats.maxConcurrent, stats.open);
    setTimeout(function () {
      var out;
      try { out = req.method === 'POST' ? (stats.post++, ctx.doPost({ postData: { contents: body } })) : (stats.get++, ctx.doGet({ parameter: u.query })); }
      catch (e) { out = { text: JSON.stringify({ ok: false, error: String(e) }), mime: 'json' }; }
      stats.open--;
      res.writeHead(200, { 'content-type': out.mime === 'js' ? 'application/javascript' : 'application/json', 'access-control-allow-origin': '*' });
      res.end(out.text);
    }, DELAY * (0.6 + Math.random() * 0.8));
  });
}).listen(PORT, function () { console.log('mock backend on ' + PORT); });
