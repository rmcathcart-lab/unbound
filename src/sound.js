/* ===================== SOUND =====================
 * Every sound is synthesised with the Web Audio API (no audio files, so the single-file build stays small).
 * Sfx.play(name) for effects, Sfx.ambient(themeName | null) for the wind/fire bed in a land, Sfx.toggle() to mute.
 * The audio context is created on the first key press or tap, as browsers require. */
var Sfx = (function () {
  var ctx = null, master = null, muted = false, amb = null, lastStep = 0, lastAlert = 0;
  try { muted = localStorage.getItem('unbound:mute') === '1'; } catch (e) {}
  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } return ctx; }
    try { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { try { window.addEventListener(ev, function () { ensure(); }, { passive: true }); } catch (e) {} });
  function now() { return ctx.currentTime; }
  function noiseBuffer(sec) { var b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  /* a tone: type, freq (or [f0, f1] glide), duration, gain, optional attack/filter */
  function tone(type, f, dur, g, o) {
    o = o || {}; var t = now() + (o.delay || 0), osc = ctx.createOscillator(), amp = ctx.createGain(); osc.type = type;
    var f0 = Array.isArray(f) ? f[0] : f, f1 = Array.isArray(f) ? f[1] : f; osc.frequency.setValueAtTime(f0, t); if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(g, t + (o.attack || 0.01)); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var node = osc; if (o.filter) { var fl = ctx.createBiquadFilter(); fl.type = o.filter; fl.frequency.value = o.cutoff || 1200; fl.Q.value = o.q || 1; osc.connect(fl); node = fl; }
    node.connect(amp); amp.connect(master); osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(dur, g, o) {
    o = o || {}; var t = now() + (o.delay || 0), src = ctx.createBufferSource(), amp = ctx.createGain(), fl = ctx.createBiquadFilter();
    src.buffer = noiseBuffer(dur + 0.1); fl.type = o.filter || 'bandpass'; fl.frequency.setValueAtTime(o.cutoff || 1500, t); if (o.cutoffEnd) fl.frequency.exponentialRampToValueAtTime(o.cutoffEnd, t + dur); fl.Q.value = o.q || 0.8;
    amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(g, t + (o.attack || 0.005)); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl); fl.connect(amp); amp.connect(master); src.start(t); src.stop(t + dur + 0.1);
  }
  var FX = {
    step: function () { noise(0.07, 0.08, { filter: 'lowpass', cutoff: 700, q: 0.5 }); },
    pickup: function () { [660, 880, 1320].forEach(function (f, i) { tone('sine', f, 0.35, 0.18, { delay: i * 0.09 }); }); },
    page: function () { noise(0.25, 0.12, { filter: 'highpass', cutoff: 2500 }); [880, 1175, 1760].forEach(function (f, i) { tone('triangle', f, 0.5, 0.12, { delay: 0.1 + i * 0.1 }); }); },
    chest: function () { noise(0.3, 0.2, { filter: 'lowpass', cutoff: 400, cutoffEnd: 120 }); [1568, 2093, 2637, 3136].forEach(function (f, i) { tone('sine', f, 0.3, 0.08, { delay: 0.25 + i * 0.06 }); }); },
    trap: function () { tone('sawtooth', [220, 60], 0.6, 0.25, { filter: 'lowpass', cutoff: 900 }); noise(0.4, 0.2, { filter: 'bandpass', cutoff: 300, q: 2 }); },
    swing: function () { noise(0.18, 0.14, { filter: 'bandpass', cutoff: 600, cutoffEnd: 2600, q: 1.2, attack: 0.03 }); },
    strike: function () { noise(0.22, 0.35, { filter: 'bandpass', cutoff: 2800, cutoffEnd: 500, q: 0.7 }); tone('square', [180, 60], 0.12, 0.12); },
    correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone('triangle', f, 0.45, 0.16, { delay: i * 0.08 }); }); noise(0.5, 0.06, { filter: 'highpass', cutoff: 5000, delay: 0.25 }); },
    wrong: function () { tone('sawtooth', [160, 90], 0.5, 0.22, { filter: 'lowpass', cutoff: 700 }); tone('square', [166, 95], 0.5, 0.1, { filter: 'lowpass', cutoff: 500 }); },
    shield: function () { noise(0.35, 0.3, { filter: 'bandpass', cutoff: 1800, cutoffEnd: 300, q: 1.5 }); tone('triangle', [1200, 300], 0.35, 0.15); },
    death: function () { tone('sawtooth', [110, 35], 1.8, 0.3, { filter: 'lowpass', cutoff: 500, attack: 0.05 }); tone('sine', [220, 55], 1.8, 0.2, { attack: 0.05 }); noise(1.2, 0.12, { filter: 'lowpass', cutoff: 250, attack: 0.3 }); },
    flee: function () { noise(0.35, 0.2, { filter: 'bandpass', cutoff: 600, cutoffEnd: 2400, q: 0.6 }); },
    alert: function () { tone('sawtooth', [90, 140], 0.25, 0.2, { filter: 'lowpass', cutoff: 600 }); noise(0.3, 0.18, { filter: 'bandpass', cutoff: 500, q: 1.2 }); },
    levelup: function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone('triangle', f, 0.6, 0.14, { delay: i * 0.07 }); }); tone('sine', 1568, 1.2, 0.08, { delay: 0.45, attack: 0.1 }); },
    buy: function () { [2093, 2637].forEach(function (f, i) { tone('sine', f, 0.25, 0.14, { delay: i * 0.07 }); }); noise(0.12, 0.08, { filter: 'highpass', cutoff: 4000 }); },
    bonfire: function () { for (var i = 0; i < 8; i++) noise(0.05, 0.1, { filter: 'bandpass', cutoff: 1800 + Math.random() * 2500, q: 3, delay: Math.random() * 0.9 }); tone('sine', [330, 440], 0.9, 0.08, { attack: 0.2 }); },
    gate: function () { tone('sawtooth', [70, 45], 1.2, 0.25, { filter: 'lowpass', cutoff: 300, attack: 0.05 }); noise(1, 0.2, { filter: 'lowpass', cutoff: 400, cutoffEnd: 120, attack: 0.1 }); noise(0.15, 0.25, { filter: 'bandpass', cutoff: 900, delay: 1.0 }); },
    boss: function () { [55, 55, 82].forEach(function (f, i) { tone('sawtooth', f, 0.5, 0.25, { delay: i * 0.4, filter: 'lowpass', cutoff: 400 }); noise(0.25, 0.25, { filter: 'lowpass', cutoff: 200, delay: i * 0.4 }); }); },
    click: function () { noise(0.04, 0.08, { filter: 'highpass', cutoff: 3000 }); },
    timer: function () { tone('square', 1200, 0.05, 0.08); }
  };
  function play(name) {
    if (muted) return; try { if (!ensure() || ctx.state !== 'running') return; } catch (e) { return; }
    if (name === 'step') { var t = ctx.currentTime; if (t - lastStep < 0.28) return; lastStep = t; }
    if (name === 'alert') { var t2 = ctx.currentTime; if (t2 - lastAlert < 1.5) return; lastAlert = t2; }
    try { if (FX[name]) FX[name](); } catch (e) {}
  }
  /* ambient bed: filtered wind, plus a slow fire crackle; one per land theme */
  function ambient(theme) {
    if (amb) { try { amb.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4); var old = amb; setTimeout(function () { try { old.src.stop(); old.lfo.stop(); } catch (e) {} }, 1500); } catch (e) {} amb = null; }
    if (!theme || muted) return; try { if (!ensure() || ctx.state !== 'running') return; } catch (e) { return; }
    var src = ctx.createBufferSource(); src.buffer = noiseBuffer(4); src.loop = true;
    var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = theme === 'volcano' ? 220 : theme === 'crypt' ? 160 : 380; fl.Q.value = 0.7;
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.08; lg.gain.value = theme === 'volcano' ? 90 : 160; lfo.connect(lg); lg.connect(fl.frequency);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(theme === 'crypt' ? 0.05 : 0.09, ctx.currentTime + 2);
    src.connect(fl); fl.connect(g); g.connect(master); src.start(); lfo.start();
    amb = { src: src, gain: g, lfo: lfo };
  }
  function setMuted(m) { muted = !!m; try { localStorage.setItem('unbound:mute', muted ? '1' : '0'); } catch (e) {} if (master) master.gain.setTargetAtTime(muted ? 0 : 0.5, ctx.currentTime, 0.05); if (muted) ambient(null); }
  function toggle() { setMuted(!muted); return muted; }
  return { play: play, ambient: ambient, toggle: toggle, isMuted: function () { return muted; }, ensure: ensure };
})();
