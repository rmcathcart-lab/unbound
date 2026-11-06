/* ============================================================
 * Unbound Ledger — Google Apps Script backend
 * ------------------------------------------------------------
 * Standalone script deployed as a web app (Execute as: me · Who has access: Anyone).
 * Run setup() once from the editor: it creates the "Unbound Ledger" spreadsheet,
 * stores its id and a teacher key in Script properties, and logs both.
 * The game posts play events here; the teacher dashboard reads aggregated stats back.
 *
 * Sheets in the ledger spreadsheet (created automatically):
 *   Players  — one row per class code + student name (latest state + cloud save)
 *   Attempts — one row per answered question
 *
 * Script property TEACHER_KEY protects the ledger (Project Settings → Script properties).
 * Script property UNLOCKS holds the lands the teacher has opened, per class code ('*' = every class);
 * it is written from the in-game ledger (Lands open) and read by the game when a student signs in.
 * Script property FEATURES holds per-class switches: { "<class>": { board: bool, duels: bool } } (default: both on).
 * Sheet Duels records every finished duel (the live state of a duel lives in the script cache for up to 6 hours).
 * Script property BLOCKS maps a class code to its timetable block: { "<class>": "A" }. NOSCHOOL lists dates
 * ("2026-10-12") with no classes. Every answered question is tagged inClass Y/N against the bell schedule (BELL), so the
 * ledger can show work with or without play done outside class. A class with no block counts everything as in class.
 * Script property CLASSES lists the class codes the teacher accepts. While it is empty every code is
 * accepted; once it has codes, play events sent with any other code are ignored (keeps junk out of the sheet,
 * since the web app is open to Anyone).
 * ============================================================ */

var PLAYER_COLS = ['key', 'class', 'name', 'hero', 'heroClass', 'stage', 'lore', 'legend', 'deaths', 'lostForever',
  'killsBEG', 'killsPRG', 'killsMAS', 'bossKills', 'titles', 'landsCleared', 'playSeconds', 'attempts', 'correct',
  'firstSeen', 'lastSeen', 'lastLand', 'saveUpdated', 'save', 'level', 'achievements', 'bestStreak'];
var DUEL_COLS = ['finished', 'code', 'class', 'land', 'level', 'stake', 'aKey', 'aHero', 'bKey', 'bHero', 'winner', 'aResult', 'bResult'];
var ATTEMPT_COLS = ['time', 'class', 'name', 'hero', 'land', 'outcome', 'group', 'level', 'gen', 'boss', 'question', 'typed', 'result', 'loreBefore', 'streak', 'inClass'];

function ss_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var ss = SpreadsheetApp.create('Unbound Ledger'); props.setProperty('SHEET_ID', ss.getId());
  return ss;
}
function sheet_(name, cols) {
  var ss = ss_(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cols.length).setFontWeight('bold'); }
  else if (sh.getLastColumn() < cols.length) sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold'); // columns added in a later version
  return sh;
}
function teacherKey_() { return PropertiesService.getScriptProperties().getProperty('TEACHER_KEY') || ''; }
function json_(obj, callback) {
  var txt = JSON.stringify(obj);
  if (callback) return ContentService.createTextOutput(callback + '(' + txt + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.JSON);
}
function norm_(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
function keyOf_(klass, name) { return norm_(klass) + '|' + norm_(name); }
function clean_(s, max) { s = String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > max ? s.slice(0, max) : s; }

/* One-time setup: creates the sheets and a teacher key if none is set. */
function setup() {
  var ss = ss_(); sheet_('Players', PLAYER_COLS); sheet_('Attempts', ATTEMPT_COLS);
  var s1 = ss.getSheetByName('Sheet1'); if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TEACHER_KEY')) props.setProperty('TEACHER_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 12));
  Logger.log('Ledger spreadsheet: ' + ss.getUrl());
  Logger.log('Teacher key: ' + props.getProperty('TEACHER_KEY'));
}

/* ---------------- reads (JSONP) ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {}, cb = p.callback || '';
  try {
    var action = p.action || 'ping';
    if (action === 'ping') return json_({ ok: true, t: Date.now() }, cb);
    if (action === 'hello') return json_(hello_(p), cb);
    if (action === 'lands') return json_({ ok: true, lands: landsFor_(p['class']), classOk: classOk_(p['class']), features: featuresFor_(p['class']), times: timesFor_(p['class']) }, cb);
    if (action === 'board') return json_(board_(p['class'], p.name), cb);
    if (action === 'duel') return json_(duel_(p), cb);
    if (p.key !== teacherKey_() || !teacherKey_()) return json_({ ok: false, error: 'bad key' }, cb);
    if (action === 'ledger') { var led = ledger_(); led.unlocks = unlocks_(); led.classes = classes_(); led.features = features_(); led.duels = recentDuels_(); led.blocks = blocks_(); led.noSchool = noSchool_(); led.bell = BELL; return json_(led, cb); }
    if (action === 'setblock') return json_(setBlock_(p['class'], p.block), cb);
    if (action === 'setnoschool') return json_(setNoSchool_(p.dates), cb);
    if (action === 'setclasses') return json_(setClasses_(p.classes), cb);
    if (action === 'setlands') return json_(setLands_(p['class'], p.lands), cb);
    if (action === 'setfeatures') return json_(setFeatures_(p['class'], p.board, p.duels), cb);
    if (action === 'player') return json_(playerDetail_(p.id), cb);
    if (action === 'purge') return json_(purge_(p['class']), cb);
    return json_({ ok: false, error: 'unknown action' }, cb);
  } catch (err) { return json_({ ok: false, error: String(err) }, cb); }
}

/* The game says hello with a class code + name and gets the cloud save back (if any). */
function hello_(p) {
  if (!classOk_(p['class'])) return { ok: true, found: false, unknownClass: true, lands: [] };
  var key = keyOf_(p['class'], p.name);
  var row = findPlayer_(key);
  var lands = landsFor_(p['class']);
  if (!row) return { ok: true, found: false, lands: lands, features: featuresFor_(p['class']), times: timesFor_(p['class']) };
  var r = row.values;
  return { ok: true, found: true, lands: lands, features: featuresFor_(p['class']), times: timesFor_(p['class']), save: r[col_('save')] || '', saveUpdated: Number(r[col_('saveUpdated')] || 0), legend: Number(r[col_('legend')] || 0) };
}

/* ---------------- lands the teacher has opened ---------------- */
function unlocks_() {
  try { var u = JSON.parse(PropertiesService.getScriptProperties().getProperty('UNLOCKS') || '{}'); return (u && typeof u === 'object') ? u : {}; } catch (e) { return {}; }
}
function landsFor_(klass) {
  var u = unlocks_(), k = norm_(klass), out = [];
  (u['*'] || []).concat(k ? (u[k] || []) : []).forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); });
  return out;
}
/* Teacher-only: set the opened lands for one class code ('*' or empty = every class). lands = "L2,L3". */
function setLands_(klass, csv) {
  var k = String(klass || '').trim() === '*' ? '*' : norm_(klass) || '*';
  var ids = String(csv || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return /^L([1-9]|10)$/.test(x); });
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var u = unlocks_(); if (ids.length) u[k] = ids; else delete u[k];
    PropertiesService.getScriptProperties().setProperty('UNLOCKS', JSON.stringify(u));
    return { ok: true, unlocks: u };
  } finally { lock.releaseLock(); }
}

/* ---------------- class codes the teacher accepts ---------------- */
function classes_() {
  try { var c = JSON.parse(PropertiesService.getScriptProperties().getProperty('CLASSES') || '[]'); return Array.isArray(c) ? c : []; } catch (e) { return []; }
}
function classOk_(klass) { var c = classes_(); return !c.length || c.indexOf(norm_(klass)) >= 0; }
/* Teacher-only: replace the list of accepted class codes. classes = "10c-1,10c-2" (empty = accept any). */
function setClasses_(csv) {
  var out = [];
  String(csv || '').split(',').forEach(function (x) { var k = norm_(x).slice(0, 24); if (k && out.indexOf(k) < 0) out.push(k); });
  PropertiesService.getScriptProperties().setProperty('CLASSES', JSON.stringify(out));
  return { ok: true, classes: out };
}

/* ---------------- writes ---------------- */
function doPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (!body || !body.name || !body['class']) return json_({ ok: false, error: 'missing class or name' });
  if (!classOk_(body['class'])) return json_({ ok: false, error: 'unknown class' });
  if (String(body.name).length > 60 || String(body['class']).length > 40) return json_({ ok: false, error: 'too long' });
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (err) { return json_({ ok: false, error: 'busy' }); }
  try {
    var events = body.events || [], now = Date.now();
    var key = keyOf_(body['class'], body.name), block = blockFor_(body['class']), off = noSchool_();
    var attemptsRows = [], latestState = null, ticks = 0;
    events.forEach(function (ev) {
      if (!ev || !ev.t) return;
      if (ev.t === 'attempt') {
        attemptsRows.push([new Date(ev.at || now), String(body['class']).trim(), String(body.name).trim(), ev.hero || '', ev.land || '', ev.outcome || '', ev.group || '', ev.level || '', ev.gen || '', ev.boss ? 'Y' : '',
          clean_(ev.question, 600), clean_(ev.typed, 200), ev.result || '', Number(ev.lore || 0), Number(ev.streak || 0), inClass_(block, off, Number(ev.at || now), now) ? 'Y' : 'N']);
      } else if (ev.t === 'state') { latestState = ev; }
      else if (ev.t === 'tick') { ticks++; latestState = latestState || ev; }
    });
    if (attemptsRows.length) {
      var ash = sheet_('Attempts', ATTEMPT_COLS);
      ash.getRange(ash.getLastRow() + 1, 1, attemptsRows.length, ATTEMPT_COLS.length).setValues(attemptsRows);
    }
    upsertPlayer_(key, body, latestState, attemptsRows, now);
    return json_({ ok: true, wrote: attemptsRows.length });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}

function col_(name) { return PLAYER_COLS.indexOf(name); }
function findPlayer_(key) {
  var sh = sheet_('Players', PLAYER_COLS), last = sh.getLastRow();
  if (last < 2) return null;
  var keys = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) if (keys[i][0] === key) return { row: i + 2, values: sh.getRange(i + 2, 1, 1, PLAYER_COLS.length).getValues()[0] };
  return null;
}
function upsertPlayer_(key, body, st, attempts, now) {
  var sh = sheet_('Players', PLAYER_COLS), found = findPlayer_(key);
  var r = found ? found.values.slice() : PLAYER_COLS.map(function () { return ''; });
  if (!found) { r[col_('key')] = key; r[col_('class')] = String(body['class']).trim(); r[col_('name')] = String(body.name).trim(); r[col_('firstSeen')] = new Date(now); r[col_('attempts')] = 0; r[col_('correct')] = 0; r[col_('playSeconds')] = 0; }
  r[col_('lastSeen')] = new Date(now);
  if (attempts.length) {
    r[col_('attempts')] = Number(r[col_('attempts')] || 0) + attempts.length;
    r[col_('correct')] = Number(r[col_('correct')] || 0) + attempts.filter(function (a) { return a[12] === 'correct'; }).length;
    r[col_('hero')] = attempts[attempts.length - 1][3] || r[col_('hero')];
  }
  if (st) {
    var set = function (c, v) { if (v !== undefined && v !== null) r[col_(c)] = v; };
    set('hero', st.hero); set('heroClass', st.heroClass); set('stage', st.stage); set('lore', st.lore); set('legend', st.legend);
    set('deaths', st.deaths); set('lostForever', st.lostForever); set('killsBEG', st.killsBEG); set('killsPRG', st.killsPRG); set('killsMAS', st.killsMAS);
    set('bossKills', st.bossKills); set('titles', st.titles); set('landsCleared', st.landsCleared); set('lastLand', st.lastLand);
    set('level', st.level); set('achievements', st.ach); set('bestStreak', st.bestStreak);
    if (st.play !== undefined) r[col_('playSeconds')] = Math.max(Number(r[col_('playSeconds')] || 0), Number(st.play || 0));
    if (st.save && Number(st.saveUpdated || 0) >= Number(r[col_('saveUpdated')] || 0)) { r[col_('save')] = st.save; r[col_('saveUpdated')] = Number(st.saveUpdated || now); }
  }
  if (found) sh.getRange(found.row, 1, 1, PLAYER_COLS.length).setValues([r]);
  else sh.appendRow(r);
}

/* ---------------- teacher ledger ---------------- */
function ledger_() {
  var cache = CacheService.getScriptCache(), hit = cache.get('ledger');
  if (hit) return JSON.parse(hit);
  var psh = sheet_('Players', PLAYER_COLS), ash = sheet_('Attempts', ATTEMPT_COLS);
  var players = [], byKey = {};
  if (psh.getLastRow() > 1) psh.getRange(2, 1, psh.getLastRow() - 1, PLAYER_COLS.length).getValues().forEach(function (r) {
    var o = {}; PLAYER_COLS.forEach(function (c, i) { if (c === 'save') return; var v = r[i]; o[c] = (v instanceof Date) ? v.getTime() : v; });
    o.outcomes = {}; o.outcomesIn = {}; o.attemptsIn = 0; o.correctIn = 0; o.days = {}; players.push(o); byKey[o.key] = o;
  });
  var since = Date.now() - 35 * 86400000, dayOf = {}; // answers per day for the last five weeks: { "2026-10-08": [all, in class, right] }
  function add(map, oc, lv, res) { var cell = (map[oc] = map[oc] || {})[lv] = map[oc][lv] || { a: 0, c: 0, f: 0 }; cell.a++; if (res === 'correct') cell.c++; else if (res === 'form') cell.f++; }
  if (ash.getLastRow() > 1) ash.getRange(2, 1, ash.getLastRow() - 1, ATTEMPT_COLS.length).getValues().forEach(function (r) {
    var p = byKey[keyOf_(r[1], r[2])]; if (!p) return;
    var oc = r[5], lv = r[7], res = r[12], inside = r[15] !== 'N'; // rows from before class times were set count as in class
    if (inside) { p.attemptsIn++; if (res === 'correct') p.correctIn++; }
    var t = r[0] instanceof Date ? r[0].getTime() : Number(r[0]) || 0;
    if (t >= since) { var hk = Math.floor(t / 3600000), dk = dayOf[hk] || (dayOf[hk] = Utilities.formatDate(new Date(t), BELL_TZ, 'yyyy-MM-dd'));
      var dd = p.days[dk] || (p.days[dk] = [0, 0, 0]); dd[0]++; if (inside) dd[1]++; if (res === 'correct') dd[2]++; }
    if (!oc || !lv) return;
    add(p.outcomes, oc, lv, res); if (inside) add(p.outcomesIn, oc, lv, res);
  });
  var out = { ok: true, generated: Date.now(), sheetUrl: ss_().getUrl(), players: players };
  var txt = JSON.stringify(out);
  if (txt.length < 90000) cache.put('ledger', txt, 45);
  return out;
}
/* Teacher-only: delete every Players row and Attempts row for one class code (e.g. test data before launch). */
function purge_(klass) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var counts = { players: 0, attempts: 0 };
    [['Players', PLAYER_COLS, 1], ['Attempts', ATTEMPT_COLS, 1]].forEach(function (spec) {
      var sh = sheet_(spec[0], spec[1]), last = sh.getLastRow(); if (last < 2) return;
      var col = sh.getRange(2, spec[2] + 1, last - 1, 1).getValues(), rows = [];
      for (var i = 0; i < col.length; i++) if (norm_(col[i][0]) === k) rows.push(i + 2);
      for (var j = rows.length - 1; j >= 0; j--) sh.deleteRow(rows[j]);
      counts[spec[0].toLowerCase()] = rows.length;
    });
    CacheService.getScriptCache().remove('ledger');
    return { ok: true, players: counts.players, attempts: counts.attempts };
  } finally { lock.releaseLock(); }
}
function playerDetail_(key) {
  var ash = sheet_('Attempts', ATTEMPT_COLS), rows = [];
  if (ash.getLastRow() > 1) {
    var all = ash.getRange(2, 1, ash.getLastRow() - 1, ATTEMPT_COLS.length).getValues();
    for (var i = all.length - 1; i >= 0 && rows.length < 60; i--) {
      var r = all[i]; if (keyOf_(r[1], r[2]) !== key) continue;
      rows.push({ time: r[0] instanceof Date ? r[0].getTime() : r[0], land: r[4], outcome: r[5], group: r[6], level: r[7], boss: r[9] === 'Y', question: r[10], typed: r[11], result: r[12], inClass: r[15] !== 'N' });
    }
  }
  return { ok: true, key: key, attempts: rows };
}

/* ---------------- class times: the bell schedule (2026-27) ----------------
 * Mon/Wed are Day 1, Tue/Thu Day 2, Friday has its own shorter periods. [block, start, end] in local time. */
var BELL = {
  day1: [['A', '09:00', '10:28'], ['B', '10:33', '12:00'], ['C', '12:45', '14:13'], ['D', '14:18', '15:45']],
  day2: [['B', '09:00', '10:28'], ['A', '10:33', '12:00'], ['D', '12:45', '14:13'], ['C', '14:18', '15:45']],
  fri:  [['A', '09:00', '10:07'], ['B', '10:11', '11:18'], ['C', '11:48', '12:55'], ['D', '12:58', '14:05']]
};
var BELL_TZ = 'America/Edmonton', BELL_GRACE = 2; // minutes either side of the bells
function blocks_() { try { var b = JSON.parse(PropertiesService.getScriptProperties().getProperty('BLOCKS') || '{}'); return (b && typeof b === 'object') ? b : {}; } catch (e) { return {}; } }
function blockFor_(klass) { return blocks_()[norm_(klass)] || ''; }
function noSchool_() { try { var d = JSON.parse(PropertiesService.getScriptProperties().getProperty('NOSCHOOL') || '[]'); return Array.isArray(d) ? d : []; } catch (e) { return []; } }
function timesFor_(klass) { return { block: blockFor_(klass), noSchool: noSchool_() }; }
/* the block's period on the school day containing ms, as local minutes [start, end], or null */
function period_(block, off, ms) {
  var parts = Utilities.formatDate(new Date(ms), BELL_TZ, 'u|HH|mm|yyyy-MM-dd').split('|'), dow = Number(parts[0]);
  if (dow > 5 || off.indexOf(parts[3]) >= 0) return null;
  var day = dow === 5 ? BELL.fri : (dow === 1 || dow === 3) ? BELL.day1 : BELL.day2, mins = Number(parts[1]) * 60 + Number(parts[2]);
  for (var i = 0; i < day.length; i++) if (day[i][0] === block) { var a = day[i][1].split(':'), b = day[i][2].split(':'); return { now: mins, start: a[0] * 60 + Number(a[1]), end: b[0] * 60 + Number(b[1]) }; }
  return null;
}
function inPeriod_(block, off, ms, extraAfter) { var p = period_(block, off, ms); return !!p && p.now >= p.start - BELL_GRACE && p.now <= p.end + BELL_GRACE + (extraAfter || 0); }
/* In class: the answer was stamped inside the block's period by the student's device AND reached the server inside it
 * (allowing a few minutes for the game's 30-second batches). A changed device clock fails the second test. */
function inClass_(block, off, at, now) {
  if (!block) return true;
  return Math.abs(now - at) < 10 * 60000 && inPeriod_(block, off, at, 0) && inPeriod_(block, off, now, 5);
}
/* Teacher-only: a class code's block (A-D, or empty for none). */
function setBlock_(klass, block) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  var b = String(block || '').trim().toUpperCase(); if (b && !/^[ABCD]$/.test(b)) return { ok: false, error: 'bad block' };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { var all = blocks_(); if (b) all[k] = b; else delete all[k]; PropertiesService.getScriptProperties().setProperty('BLOCKS', JSON.stringify(all)); return { ok: true, blocks: all }; }
  finally { lock.releaseLock(); }
}
/* Teacher-only: replace the no-school dates. dates = "2026-10-12,2026-11-11". */
function setNoSchool_(csv) {
  var out = []; String(csv || '').split(',').forEach(function (x) { x = x.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(x) && out.indexOf(x) < 0) out.push(x); });
  out.sort(); PropertiesService.getScriptProperties().setProperty('NOSCHOOL', JSON.stringify(out.slice(-200)));
  return { ok: true, noSchool: out.slice(-200) };
}

/* ---------------- per-class switches: the leaderboard and duels ---------------- */
function features_() {
  try { var f = JSON.parse(PropertiesService.getScriptProperties().getProperty('FEATURES') || '{}'); return (f && typeof f === 'object') ? f : {}; } catch (e) { return {}; }
}
function featuresFor_(klass) { var f = features_()[norm_(klass)] || {}; return { board: f.board !== false, duels: f.duels !== false }; }
/* Teacher-only: board / duels = "1" or "0" for one class code. */
function setFeatures_(klass, board, duels) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var f = features_(); f[k] = { board: String(board) !== '0', duels: String(duels) !== '0' };
    PropertiesService.getScriptProperties().setProperty('FEATURES', JSON.stringify(f));
    return { ok: true, features: f };
  } finally { lock.releaseLock(); }
}

/* ---------------- the class leaderboard (hero names only, never real names) ---------------- */
function board_(klass, name) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  if (!classOk_(klass)) return { ok: false, error: 'unknown class' };
  if (!featuresFor_(klass).board) return { ok: true, off: true, players: [] };
  var cache = CacheService.getScriptCache(), ck = 'board|' + k, hit = cache.get(ck), rows;
  if (hit) rows = JSON.parse(hit);
  else {
    rows = [];
    var sh = sheet_('Players', PLAYER_COLS), last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, PLAYER_COLS.length).getValues().forEach(function (r) {
      if (norm_(r[col_('class')]) !== k) return;
      var att = Number(r[col_('attempts')] || 0), cor = Number(r[col_('correct')] || 0), cleared = String(r[col_('landsCleared')] || '').split(/\s+/).filter(function (x) { return /^L\d+$/.test(x); });
      rows.push({ key: r[col_('key')], hero: clean_(r[col_('hero')], 40) || 'A nameless hero', cls: String(r[col_('heroClass')] || ''), stage: Number(r[col_('stage')] || 1),
        level: Number(r[col_('level')] || 1), legend: Number(r[col_('legend')] || 0), lore: Number(r[col_('lore')] || 0), bosses: cleared.length,
        ach: Number(r[col_('achievements')] || 0), streak: Number(r[col_('bestStreak')] || 0), answers: att, acc: att ? Math.round(100 * cor / att) : 0,
        seen: r[col_('lastSeen')] instanceof Date ? r[col_('lastSeen')].getTime() : 0 });
    });
    var txt = JSON.stringify(rows); if (txt.length < 90000) cache.put(ck, txt, 30);
  }
  var me = keyOf_(klass, name);
  return { ok: true, players: rows.map(function (p) { var o = {}; Object.keys(p).forEach(function (x) { if (x !== 'key') o[x] = p[x]; }); o.me = p.key === me; return o; }) };
}

/* ---------------- duels at the well ----------------
 * A duel lives in the script cache (key "duel:<code>") while it runs:
 *   open (challenger waiting) -> joined (opponent entered the code) -> staked (challenger set the stake)
 *   -> live (opponent picked the difficulty; the question starts at startAt) -> done | cancelled | expired.
 * Each player answers once. The first right answer the server receives wins; a wrong answer locks that player out.
 * Nobody right before the clock runs out (or both wrong): both lose the stake. Results go to the Duels sheet,
 * and each game settles its own Lore from the result (it remembers which duels it has already settled). */
var DUEL_TIME = { BEG: 60, PRG: 150, MAS: 240 }, DUEL_PAIR_LIMIT = 3;
function duelGet_(code) { var c = CacheService.getScriptCache().get('duel:' + code); return c ? JSON.parse(c) : null; }
function duelPut_(d) { CacheService.getScriptCache().put('duel:' + d.code, JSON.stringify(d), 21600); }
function duelCode_() {
  var abc = 'ACDEFHJKLMNPRTUVWXY3479', code = '';
  for (var t = 0; t < 20; t++) { code = ''; for (var i = 0; i < 4; i++) code += abc.charAt(Math.floor(Math.random() * abc.length)); if (!duelGet_(code)) return code; }
  return code;
}
function duelTick_(d, now) { // timeouts; returns true when the duel changed
  if (d.state === 'open' && now - d.created > 15 * 60000) { d.state = 'expired'; return true; }
  if ((d.state === 'joined' || d.state === 'staked') && now - d.touched > 5 * 60000) { d.state = 'expired'; return true; }
  if (d.state === 'live' && now > d.startAt + d.limit * 1000 + 2500) { duelFinish_(d, now); return true; }
  return false;
}
function duelFinish_(d, now) {
  d.state = 'done'; d.finished = now;
  try { sheet_('Duels', DUEL_COLS).appendRow([new Date(now), d.code, d.cls, d.land, d.level, d.stake, d.a.key, d.a.hero, d.b.key, d.b.hero, d.winner || '', d.a.res || '', d.b.res || '']); } catch (e) {}
}
function duelView_(d, me, now) {
  var role = d.a.key === me ? 'a' : (d.b && d.b.key === me ? 'b' : ''), opp = role === 'a' ? d.b : d.a, you = role ? d[role] : null;
  var v = { ok: true, code: d.code, state: d.state, role: role, land: d.land, now: now, stake: d.stake || 0, level: d.level || '', seed: d.seed || 0, startAt: d.startAt || 0, limit: d.limit || 0,
    cap: d.b ? Math.floor(Math.min(d.a.lore, d.b.lore) / 2) : 0, you: you ? { hero: you.hero, res: you.res || '' } : null,
    opp: opp ? { hero: opp.hero, cls: opp.cls || '', stage: opp.stage || 1, res: opp.res || '' } : null, winner: d.winner || '' };
  if (d.state === 'done' && role) v.delta = d.winner ? (d.winner === role ? d.stake : -d.stake) : -d.stake;
  return v;
}
function duel_(p) {
  var op = String(p.op || 'poll'), now = Date.now(), k = norm_(p['class']), me = keyOf_(p['class'], p.name);
  if (!k || !p.name) return { ok: false, error: 'no player' };
  if (!classOk_(p['class'])) return { ok: false, error: 'unknown class' };
  if (op === 'mine') return duelMine_(me, now);
  if (!featuresFor_(p['class']).duels) return { ok: false, error: 'off' };
  var code = String(p.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (op === 'poll') { // a read: take the lock only if a timeout has to be written
    var d0 = duelGet_(code); if (!d0) return { ok: false, error: 'no duel' };
    if (!duelTick_(JSON.parse(JSON.stringify(d0)), now)) return duelView_(d0, me, now);
  }
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) { return { ok: false, error: 'busy' }; }
  try {
    var d;
    if (op === 'create') {
      d = { code: duelCode_(), cls: k, land: String(p.land || '').slice(0, 4), created: now, touched: now, state: 'open', stake: 0,
        a: { key: me, hero: clean_(p.hero, 40) || 'A nameless hero', cls: clean_(p.heroClass, 12), stage: Number(p.stage || 1), lore: Math.max(0, Math.floor(Number(p.lore) || 0)) }, b: null };
      duelPut_(d); return duelView_(d, me, now);
    }
    d = duelGet_(code); if (!d) return { ok: false, error: 'no duel' };
    duelTick_(d, now);
    var role = d.a.key === me ? 'a' : (d.b && d.b.key === me ? 'b' : '');
    if (op === 'join' && !role) {
      if (d.state !== 'open') { duelPut_(d); return { ok: false, error: d.state === 'expired' ? 'expired' : 'taken' }; }
      if (d.cls !== k) return { ok: false, error: 'other class' };
      if (String(p.land || '') !== d.land) return { ok: false, error: 'other land', land: d.land };
      var day = Utilities.formatDate(new Date(now), Session.getScriptTimeZone(), 'yyyy-MM-dd'), pk = 'pair|' + day + '|' + [d.a.key, me].sort().join('~'), cache = CacheService.getScriptCache();
      if (Number(cache.get(pk) || 0) >= DUEL_PAIR_LIMIT) return { ok: false, error: 'limit' };
      d.b = { key: me, hero: clean_(p.hero, 40) || 'A nameless hero', cls: clean_(p.heroClass, 12), stage: Number(p.stage || 1), lore: Math.max(0, Math.floor(Number(p.lore) || 0)) };
      d.state = 'joined'; d.touched = now; role = 'b';
    } else if (!role) return { ok: false, error: 'not yours' };
    else if (op === 'stake' && role === 'a' && d.state === 'joined') {
      var cap = Math.floor(Math.min(d.a.lore, d.b.lore) / 2);
      d.stake = Math.max(0, Math.min(cap, Math.floor(Number(p.stake) || 0))); d.state = 'staked'; d.touched = now;
    } else if (op === 'level' && role === 'b' && d.state === 'staked' && DUEL_TIME[p.level]) {
      d.level = p.level; d.limit = DUEL_TIME[p.level]; d.seed = Math.floor(Math.random() * 2147483647) + 1; d.startAt = now + 5000; d.state = 'live'; d.touched = now;
      var day2 = Utilities.formatDate(new Date(now), Session.getScriptTimeZone(), 'yyyy-MM-dd'), pk2 = 'pair|' + day2 + '|' + [d.a.key, d.b.key].sort().join('~'), c2 = CacheService.getScriptCache();
      c2.put(pk2, String(Number(c2.get(pk2) || 0) + 1), 21600);
    } else if (op === 'answer' && d.state === 'live' && !d[role].res && now >= d.startAt - 500) {
      d[role].res = String(p.correct) === '1' ? 'right' : 'wrong'; d[role].at = now;
      if (d[role].res === 'right' && !d.winner) d.winner = role;
      var other = role === 'a' ? 'b' : 'a';
      if (d.winner || d[other].res === 'wrong' && d[role].res === 'wrong') duelFinish_(d, now);
    } else if (op === 'cancel' && (d.state === 'open' || d.state === 'joined' || d.state === 'staked')) { d.state = 'cancelled'; d.touched = now; }
    duelPut_(d);
    return duelView_(d, me, now);
  } finally { lock.releaseLock(); }
}
/* Every finished duel this player was in during the last week, so a game that was closed mid-duel can settle it. */
function duelMine_(me, now) {
  var sh = sheet_('Duels', DUEL_COLS), last = sh.getLastRow(), out = [];
  if (last < 2) return { ok: true, duels: out };
  var from = Math.max(2, last - 499), rows = sh.getRange(from, 1, last - from + 1, DUEL_COLS.length).getValues();
  rows.forEach(function (r) {
    var t = r[0] instanceof Date ? r[0].getTime() : Number(r[0]); if (now - t > 7 * 86400000) return;
    var role = r[6] === me ? 'a' : (r[8] === me ? 'b' : ''); if (!role) return;
    var stake = Number(r[5] || 0), w = r[10];
    out.push({ code: r[1], finished: t, land: r[3], stake: stake, opp: role === 'a' ? r[9] : r[7], won: w === role, delta: w ? (w === role ? stake : -stake) : -stake });
  });
  return { ok: true, duels: out };
}
/* For the teacher's ledger: the last 60 duels, newest first (real names, since only the teacher sees this). */
function recentDuels_() {
  var sh = sheet_('Duels', DUEL_COLS), last = sh.getLastRow(); if (last < 2) return [];
  var from = Math.max(2, last - 59);
  return sh.getRange(from, 1, last - from + 1, DUEL_COLS.length).getValues().reverse().map(function (r) {
    var o = {}; DUEL_COLS.forEach(function (c, i) { o[c] = r[i] instanceof Date ? r[i].getTime() : r[i]; }); o.aName = String(o.aKey).split('|')[1] || ''; o.bName = String(o.bKey).split('|')[1] || ''; delete o.aKey; delete o.bKey; return o;
  });
}
