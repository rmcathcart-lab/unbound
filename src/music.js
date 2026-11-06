/* ===================== MUSIC =====================
 * Chiptune music written as code: four voices in the style of an old console (two pulse waves, a triangle bass,
 * a noise drum kit), played live with the Web Audio API. A whole song is a few kilobytes of notes, not an audio file.
 *
 * Notation, one string per bar per voice: "D5:4 A4:2 r:2" = note:length, length in 16th notes (16 to a bar),
 * r = rest. Chords (one per bar) drive the bass and the arpeggios automatically.
 *
 * Music.play(name) starts a song (looping), Music.stop() fades it out, Music.render(name, ctx, loops) schedules
 * it into any AudioContext (an OfflineAudioContext renders it to a file). */
var Music = (function () {
  'use strict';
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(n) { var m = /^([A-G])([#b]?)(-?\d)$/.exec(n); if (!m) throw new Error('bad note ' + n); return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function parseBar(s) { var out = [], t = 0; s.trim().split(/\s+/).forEach(function (tok) { var p = tok.split(':'), len = +p[1]; if (p[0] !== 'r') out.push({ at: t, len: len, m: midi(p[0]) }); t += len; }); if (t !== 16) throw new Error('bar is ' + t + ' steps: ' + s); return out; }

  var CHORDS = { Dm: ['D', 'F', 'A'], Bb: ['Bb', 'D', 'F'], C: ['C', 'E', 'G'], A: ['A', 'C#', 'E'], F: ['F', 'A', 'C'], Gm: ['G', 'Bb', 'D'], Am: ['A', 'C', 'E'], G: ['G', 'B', 'D'], E: ['E', 'G#', 'B'], Em: ['E', 'G', 'B'] };
  function chordPcs(c) { return CHORDS[c].map(function (n) { return midi(n + '4') % 12; }); }

  /* ---------- the songs ---------- */
  var HOOK = ['A4:6 D5:2 F5:4 E5:4', 'D5:4 C5:4 D5:8', 'A4:6 C5:2 F5:4 A5:4', 'G5:4 F5:4 E5:8',
              'A4:6 D5:2 F5:4 E5:4', 'D5:4 C5:4 D5:8', 'A4:6 C5:2 F5:4 E5:4', 'D5:4 C5:4 D5:8'];
  var BARROW = ['E4:6 A4:2 C5:4 B4:4', 'D5:6 C5:2 B4:8', 'A4:6 C5:2 F5:4 E5:4', 'D5:4 B4:4 G#4:8',
                'E4:6 A4:2 C5:4 B4:4', 'D5:6 C5:2 B4:8', 'A4:6 C5:2 F5:4 E5:4', 'B4:4 G#4:4 A4:8'];
  var SONGS = {
    /* The title theme, D minor. Built around one 8-bar hook that keeps coming back:
     *   A D F-E | D C D | A C F-A | G F E      (the question: ends up in the air)
     *   A D F-E | D C D | A C F-E | D C D      (the answer: lands home on D)
     * Every hook bar uses one of two rhythms (long-short-quarter-quarter, quarter-quarter-half), and the chords
     * loop Dm-Bb-F-C underneath, so the ear always knows where it is. */
    title: {
      bpm: 96,
      chords: ['Dm', 'Bb', 'F', 'C',
               'Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'C',
               'Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'C',
               'Bb', 'C', 'Dm', 'Dm', 'Bb', 'C', 'A', 'A',
               'Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'C'],
      lead: [].concat(
        ['r:16', 'r:16', 'r:16', 'r:16'],                                     // intro: the groove on its own
        HOOK, HOOK,                                                           // the hook, then again with harmony
        ['F5:8 D5:4 F5:4', 'G5:8 E5:4 G5:4', 'A5:6 G5:2 F5:4 E5:4', 'D5:12 r:4', // the bridge: longer notes, climbing,
         'F5:8 D5:4 F5:4', 'G5:8 E5:4 G5:4', 'A5:6 G5:2 E5:4 C#5:4', 'A4:4 C#5:4 E5:8'], // then a turn that sets up the hook
        HOOK),                                                                // the hook one last time, full band
      harmony: [[13, 20], [29, 36]],
      arps: [[1, 12], [21, 28]],
      drums: { soft: [[1, 4]], beat: [[5, 12]], drive: [[13, 20], [21, 27], [29, 36]], roll: [28] },
      bass: { pedal: [[1, 4]], walk: [[5, 36]] }
    },

    /* Land 1, the Barrow Marches: fog-choked graves. A minor, slower, misty, with a bell tolling in the fog.
     * The chords walk down A-G-F-E (the old graveyard descent), and the hook opens with the title's motif,
     * moved into A minor (E A C-B), before going its own way:
     *   E A C-B | D C B | A C F-E | D B G#      (hangs on G#, the note that wants to go home)
     *   E A C-B | D C B | A C F-E | B G# A      (goes home to A)
     * The middle section is a slow procession in plain quarter notes. */
    'land-l1': {
      bpm: 84, scale: [9, 11, 0, 2, 4, 5, 7],
      chords: ['Am', 'G', 'F', 'E',
               'Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E',
               'Dm', 'Am', 'Dm', 'E', 'Dm', 'Am', 'F', 'E',
               'Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E',
               'Am', 'G', 'F', 'E'],
      lead: [].concat(
        ['r:16', 'r:16', 'r:16', 'r:16'],
        BARROW, 
        ['F5:4 E5:4 D5:4 A4:4', 'C5:4 B4:4 A4:8', 'F5:4 E5:4 D5:4 F5:4', 'E5:12 r:4',
         'F5:4 E5:4 D5:4 A4:4', 'C5:4 B4:4 A4:4 C5:4', 'D5:4 C5:4 A4:4 F4:4', 'G#4:4 B4:4 E5:8'],
        BARROW,
        ['r:16', 'r:16', 'r:16', 'r:16']),
      harmony: [[21, 28]],
      arps: [[1, 32]], arpStep: 2,                       // slow 8th-note arpeggios: mist, not motion
      bells: [[1, 0, 'A5'], [3, 0, 'A5'], [16, 0, 'E5'], [20, 0, 'E5'], [29, 0, 'A5'], [31, 0, 'A5']],
      drums: { soft: [[1, 4], [29, 32]], march: [[5, 28]] },
      bass: { pedal: [[1, 4], [29, 32]], march: [[5, 28]] },
      voices: { lead: { duty: 0.5, gain: 0.135 }, arp: { duty: 0.25, gain: 0.05 } },   // hollower, flute-like lead
      echo: { time: 0.536, fb: 0.32, wet: 0.24 }                                       // a dotted-eighth echo, fog-long
    }
  };
  function inRanges(bar, rs) { return (rs || []).some(function (r) { return Array.isArray(r) ? bar >= r[0] && bar <= r[1] : bar === r; }); }

  /* diatonic third below, in D minor (C# over an A chord) */
  function thirdBelow(m, chord, scale) {
    var cp = chordPcs(chord), base = scale || [2, 4, 5, 7, 9, 10, 0], pcs = base.map(function (p) { var up = (p + 1) % 12; return cp.indexOf(p) < 0 && cp.indexOf(up) >= 0 && base.indexOf(up) < 0 ? up : p; }), sc = [];
    for (var o = 2; o <= 7; o++) pcs.forEach(function (p) { sc.push(12 * o + p); });
    sc.sort(function (x, y) { return x - y; });
    var i = sc.length - 1; while (i > 0 && sc[i] > m) i--;
    return sc[Math.max(0, i - 2)];
  }

  /* under a long note, the highest chord tone at least a minor third below: held notes never rub against the chord */
  function chordBelow(m, chord) { var cp = chordPcs(chord); for (var x = m - 3; x > m - 12; x--) if (cp.indexOf(x % 12) >= 0) return x; return m - 12; }

  /* ---------- compile a song into timed events ---------- */
  function compile(name) {
    var song = SONGS[name], step = 60 / song.bpm / 4, ev = [];
    song.chords.forEach(function (ch, bi) {
      var bar = bi + 1, t0 = bi * 16 * step, pcs = chordPcs(ch), root = pcs[0];
      var lead = parseBar(song.lead[bi]);
      lead.forEach(function (n) { ev.push({ v: 'lead', t: t0 + n.at * step, d: n.len * step, m: n.m }); });
      if (inRanges(bar, song.harmony)) lead.forEach(function (n) { ev.push({ v: 'harm', t: t0 + n.at * step, d: n.len * step, m: n.len >= 8 ? chordBelow(n.m, ch) : thirdBelow(n.m, ch, song.scale) }); });
      if (inRanges(bar, song.arps)) { // 16th-note arpeggio up and down the chord, octave 4
        var tones = pcs.map(function (p) { return 60 + p - (p > 5 ? 12 : 0); }); tones.sort(function (a, b) { return a - b; });
        var pat = [tones[0], tones[1], tones[2], tones[0] + 12], as = song.arpStep || 1;
        for (var s = 0; s < 16; s += as) ev.push({ v: 'arp', t: t0 + s * step, d: step * as * 0.9, m: pat[(s / as) % pat.length] });
      }
      var r2 = 36 + root + (root > 7 ? -12 : 0); // bass root around D2
      if (inRanges(bar, song.bass.pedal)) { ev.push({ v: 'bass', t: t0, d: 8 * step, m: r2 }); ev.push({ v: 'bass', t: t0 + 8 * step, d: 8 * step, m: r2 }); }
      if (inRanges(bar, song.bass.march)) [[0, r2], [4, r2 + 7], [8, r2 + 12], [12, r2 + 7]].forEach(function (b) { ev.push({ v: 'bass', t: t0 + b[0] * step, d: step * 3.4, m: b[1] }); });
      if (inRanges(bar, song.bass.walk)) [[0, r2], [2, r2], [4, r2 + 12], [6, r2], [8, r2 + 7], [10, r2], [12, r2 + 12], [14, r2 + 7]].forEach(function (b) { ev.push({ v: 'bass', t: t0 + b[0] * step, d: step * 1.8, m: b[1] }); });
      var dr = song.drums, hit = function (k, s, g) { ev.push({ v: k, t: t0 + s * step, g: g || 1 }); };
      if (inRanges(bar, dr.soft)) { hit('kick', 0, 0.6); hit('hat', 8, 0.5); }
      if (inRanges(bar, dr.beat)) { hit('kick', 0); hit('snare', 4); hit('kick', 8); hit('snare', 12); for (var h = 0; h < 16; h += 2) hit('hat', h, 0.6); }
      if (inRanges(bar, dr.drive)) { hit('kick', 0); hit('snare', 4); hit('kick', 8); hit('kick', 10); hit('snare', 12); for (var h2 = 0; h2 < 16; h2 += 2) hit('hat', h2, h2 % 4 ? 0.5 : 0.8); }
      if (inRanges(bar, dr.march)) { hit('kick', 0, 0.8); hit('kick', 8, 0.6); hit('snare', 12, 0.45); hit('hat', 4, 0.35); hit('hat', 10, 0.25); }
      (song.bells || []).forEach(function (b) { if (b[0] === bar) ev.push({ v: 'bell', t: t0 + b[1] * step, d: 3, m: midi(b[2]) }); });
      if (inRanges(bar, dr.roll)) { hit('kick', 0); for (var r = 0; r < 16; r++) hit('snare', r, 0.35 + 0.65 * r / 15); }
    });
    return { events: ev.sort(function (a, b) { return a.t - b.t; }), length: song.chords.length * 16 * step };
  }

  /* ---------- the voices ---------- */
  var waves = {};
  function pulseWave(ctx, duty) { // a pulse wave of the given duty cycle, built from its Fourier series
    var key = duty; if (waves[key] && waves[key].ctx === ctx) return waves[key].w;
    var N = 64, re = new Float32Array(N), im = new Float32Array(N);
    for (var n = 1; n < N; n++) { re[n] = Math.sin(2 * Math.PI * n * duty) / (n * Math.PI); im[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (n * Math.PI); }
    var w = ctx.createPeriodicWave(re, im); waves[key] = { ctx: ctx, w: w }; return w;
  }
  var noiseBufs = [];
  function noiseBuf(ctx) { for (var i = 0; i < noiseBufs.length; i++) if (noiseBufs[i].ctx === ctx) return noiseBufs[i].b; var b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0); for (var j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1; noiseBufs.push({ ctx: ctx, b: b }); return b; }
  var VOICE = { lead: { duty: 0.25, gain: 0.19, vib: true, echo: true }, harm: { duty: 0.5, gain: 0.05, echo: true }, arp: { duty: 0.125, gain: 0.065 }, bass: { tri: true, gain: 0.24 } };

  function note(ctx, bus, e, t) {
    var v = Object.assign({}, VOICE[e.v], bus.voices && bus.voices[e.v]), o = ctx.createOscillator(), a = ctx.createGain(), end = t + e.d;
    if (v.tri) o.type = 'triangle'; else o.setPeriodicWave(pulseWave(ctx, v.duty));
    o.frequency.setValueAtTime(hz(e.m), t);
    if (v.vib && e.d > 0.45) { var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(0, t + 0.25); lg.gain.linearRampToValueAtTime(hz(e.m) * 0.012, t + 0.5); lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end + 0.1); }
    var g = v.gain, rel = Math.min(0.06, e.d * 0.3);
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g, t + 0.006); a.gain.linearRampToValueAtTime(g * 0.72, t + 0.08); a.gain.setValueAtTime(g * 0.72, end - rel); a.gain.linearRampToValueAtTime(0, end);
    o.connect(a); a.connect(v.echo ? bus.echoIn : bus.dry); o.start(t); o.stop(end + 0.02);
  }
  function bell(ctx, bus, e, t) { // a bell tolling in the fog: a fundamental and two inharmonic partials, a long decay
    [[1, 0.07], [2.76, 0.025], [5.4, 0.01]].forEach(function (p) {
      var o = ctx.createOscillator(), a = ctx.createGain(); o.type = 'sine'; o.frequency.value = hz(e.m) * p[0];
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(p[1], t + 0.004); a.gain.exponentialRampToValueAtTime(0.0005, t + e.d / p[0] * 1.6);
      o.connect(a); a.connect(bus.echoIn); o.start(t); o.stop(t + e.d * 1.7);
    });
  }
  function sound(ctx, bus, e, t) { if (e.v === 'bell') bell(ctx, bus, e, t); else if (VOICE[e.v]) note(ctx, bus, e, t); else drum(ctx, bus, e, t); }
  function drum(ctx, bus, e, t) {
    var g = e.g || 1;
    if (e.v === 'kick') { // a triangle that drops in pitch, plus a click of noise
      var o = ctx.createOscillator(), a = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      a.gain.setValueAtTime(0.5 * g, t); a.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.connect(a); a.connect(bus.dry); o.start(t); o.stop(t + 0.2);
    }
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), n = ctx.createGain(); src.buffer = noiseBuf(ctx);
    var spec = e.v === 'kick' ? [600, 'lowpass', 0.06, 0.03] : e.v === 'snare' ? [1800, 'bandpass', 0.13, 0.11] : [7500, 'highpass', 0.035, 0.035];
    f.type = spec[1]; f.frequency.value = spec[0]; n.gain.setValueAtTime(spec[3] * g, t); n.gain.exponentialRampToValueAtTime(0.0005, t + spec[2]);
    src.connect(f); f.connect(n); n.connect(bus.dry); src.start(t, Math.random() * 0.5); src.stop(t + spec[2] + 0.02);
  }
  function makeBus(ctx, out, song) { // dry path + a dotted-eighth echo for the melody voices, softened at the top for classrooms
    var master = ctx.createGain(), tone = ctx.createBiquadFilter(), dry = ctx.createGain(), echoIn = ctx.createGain(), dl = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(), dfl = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 6500; tone.Q.value = 0.5;
    var ec = (song && song.echo) || { time: 0.47, fb: 0.2, wet: 0.16 }; dl.delayTime.value = ec.time; fb.gain.value = ec.fb; wet.gain.value = ec.wet; dfl.type = 'lowpass'; dfl.frequency.value = 2400;
    echoIn.connect(dry); echoIn.connect(dl); dl.connect(dfl); dfl.connect(fb); fb.connect(dl); dfl.connect(wet); wet.connect(dry);
    dry.connect(tone); tone.connect(master); master.connect(out);
    return { master: master, dry: dry, echoIn: echoIn, voices: song && song.voices };
  }

  /* schedule `loops` passes of a song into ctx starting at `at` (seconds); returns the bus and the song length */
  function render(name, ctx, loops, at, out, only) { // only: optional filter, e.g. to hear one voice alone
    var c = compile(name), bus = makeBus(ctx, out || ctx.destination, SONGS[name]), t0 = at || 0;
    for (var l = 0; l < (loops || 1); l++) c.events.forEach(function (e) { if (only && !only(e)) return; sound(ctx, bus, e, t0 + l * c.length + e.t); });
    return { bus: bus, length: c.length };
  }

  /* ---------- live playback: schedules a bar or so ahead, loops forever ---------- */
  var cur = null;
  function play(name, ctx, out) {
    if (!SONGS[name] || !ctx) return; if (cur && cur.name === name) return; stop();
    var c = compile(name), bus = makeBus(ctx, out || ctx.destination, SONGS[name]), start = ctx.currentTime + 0.1, i = 0, loop = 0;
    bus.master.gain.setValueAtTime(0, ctx.currentTime); bus.master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    var me = { name: name, bus: bus, ctx: ctx, timer: null };
    function pump() { // queue everything due in the next 1.5 s
      var horizon = ctx.currentTime + 1.5;
      while (true) { if (i >= c.events.length) { i = 0; loop++; } var e = c.events[i], t = start + loop * c.length + e.t; if (t > horizon) break; if (t >= ctx.currentTime - 0.01) sound(ctx, bus, e, t); i++; }
    }
    pump(); me.timer = setInterval(pump, 400); cur = me;
  }
  function stop(fade) {
    if (!cur) return; var c = cur; cur = null; clearInterval(c.timer);
    var t = c.ctx.currentTime, f = fade == null ? 1 : fade; c.bus.master.gain.cancelScheduledValues(t); c.bus.master.gain.setValueAtTime(c.bus.master.gain.value, t); c.bus.master.gain.linearRampToValueAtTime(0, t + f);
    setTimeout(function () { try { c.bus.master.disconnect(); } catch (e) {} }, (f + 0.2) * 1000);
  }
  return { SONGS: SONGS, VOICE: VOICE, compile: compile, render: render, play: play, stop: stop, playing: function () { return cur ? cur.name : null; } };
})();
if (typeof module === 'object' && module.exports) module.exports = Music;
