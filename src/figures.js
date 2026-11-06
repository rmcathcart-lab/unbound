/* ===================== FIGURES =====================
 * Small SVG diagrams for questions. Every helper takes DISPLAY labels (strings such as "3x + 5")
 * plus NUMERIC sizes used only for proportions, and returns an <svg class="fig"> string.
 * Labels are plain SVG text (x^{2} is shown as x²), drawn in the game's parchment-and-gold palette.
 */
var Fig = (function () {
  var STROKE = '#d6a860', FILL = 'rgba(214,168,96,.08)', INK = '#e8dcc0', FONT = 'font-family="Helvetica, Arial, sans-serif" font-size="14" fill="' + INK + '"';
  function lab(s) { return String(s).replace(/\^\{?2\}?/g, '²').replace(/\^\{?3\}?/g, '³').replace(/\\,/g, ' ').replace(/[{}]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function text(x, y, s, anchor, extra) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" ' + FONT + (extra || '') + '>' + lab(s) + '</text>'; }
  function svg(W, H, inner, aria) { return '<svg class="fig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="' + (aria || 'figure') + '">' + inner + '</svg>'; }
  function poly(pts, dashed) { return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="2"' + (dashed ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  function fit(w, h, maxW, maxH) { var k = Math.min(maxW / w, maxH / h); return [w * k, h * k]; }

  /* Rectangle: width label along the bottom, height label on the right. opts.inside: text in the middle. */
  function rect(wLabel, hLabel, wNum, hNum, opts) {
    opts = opts || {}; var d = fit(wNum, hNum, 230, 150), w = Math.max(90, d[0]), h = Math.max(60, d[1]);
    var x0 = 30, y0 = 20, W = x0 + w + 80, H = y0 + h + 36;
    var s = poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]);
    s += text(x0 + w / 2, y0 + h + 22, wLabel) + text(x0 + w + 10, y0 + h / 2 + 5, hLabel, 'start');
    if (opts.inside) s += text(x0 + w / 2, y0 + h / 2 + 5, opts.inside, 'middle', ' font-style="italic"');
    return svg(W, H, s, 'rectangle ' + lab(wLabel) + ' by ' + lab(hLabel));
  }

  /* L-shape made of two rectangles: A stands on the left (wA wide, hA tall), B lies to its right along the bottom (wB wide, hB tall). */
  function lshape(A, B) { // A = { w, h, wLabel, hLabel }, B = { w, h, wLabel, hLabel }  (numbers for proportion)
    var totW = A.w + B.w, totH = Math.max(A.h, B.h), d = fit(totW, totH, 250, 160), k = d[0] / totW;
    var x0 = 80, yTop = 24, wA = Math.max(50, A.w * k), hA = Math.max(70, A.h * k), wB = Math.max(70, B.w * k), hB = Math.max(45, Math.min(B.h * k, hA - 25));
    var base = yTop + hA, W = x0 + wA + wB + 80, H = base + 40;
    var s = poly([[x0, yTop], [x0 + wA, yTop], [x0 + wA, base - hB], [x0 + wA + wB, base - hB], [x0 + wA + wB, base], [x0, base]]);
    s += '<line x1="' + (x0 + wA) + '" y1="' + (base - hB) + '" x2="' + (x0 + wA) + '" y2="' + base + '" stroke="' + STROKE + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += text(x0 + wA / 2, yTop - 6, A.wLabel) + text(x0 - 8, yTop + hA / 2 + 5, A.hLabel, 'end');
    s += text(x0 + wA + wB / 2, base + 22, B.wLabel) + text(x0 + wA + wB + 10, base - hB / 2 + 5, B.hLabel, 'start');
    return svg(W, H, s, 'L-shaped floor');
  }

  /* Rectangle with a square cut out of it. */
  function cutout(wLabel, hLabel, wNum, hNum, sLabel, sNum, hole) {
    var d = fit(wNum, hNum, 240, 150), w = Math.max(120, d[0]), h = Math.max(80, d[1]), k = w / wNum, side = Math.max(44, Math.min(sNum * k, Math.min(w, h) - 24));
    var x0 = 30, y0 = 20, W = x0 + w + 80, H = y0 + h + 36;
    var hx = x0 + (hole === 'corner' ? w - side - 14 : (w - side) / 2), hy = y0 + (hole === 'corner' ? 14 : (h - side) / 2);
    var s = poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]);
    s += '<rect x="' + hx + '" y="' + hy + '" width="' + side + '" height="' + side + '" fill="#0d0b0a" stroke="' + STROKE + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += text(hx + side / 2, hy + side / 2 + 5, sLabel) + text(x0 + w / 2, y0 + h + 22, wLabel) + text(x0 + w + 10, y0 + h / 2 + 5, hLabel, 'start');
    return svg(W, H, s, 'rectangle with a square cut out');
  }

  /* Triangle with three side labels (numbers give proportions; falls back to a generic scalene). */
  function triangle(aLabel, bLabel, cLabel, a, b, c) {
    var ok = (a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a);
    if (ok) { var s2 = (a + b + c) / 2, area = Math.sqrt(Math.max(0, s2 * (s2 - a) * (s2 - b) * (s2 - c))); if (area / (a * a) < 0.22) ok = false; }
    if (!ok) { a = 5; b = 4.3; c = 3.6; }
    // base = a along the bottom; apex from law of cosines
    var cx = (a * a + b * b - c * c) / (2 * a), cy = Math.sqrt(Math.max(0.1, b * b - cx * cx));
    var d = fit(Math.max(a, cx, a - cx), cy, 220, 140), k = Math.min(d[0] / Math.max(a, cx, a - cx), 140 / cy);
    var x0 = 80, y0 = 160, px = x0 + cx * k, py = y0 - cy * k, W = x0 + a * k + 90, H = 190;
    var pts = [[x0, y0], [x0 + a * k, y0], [px, py]];
    var s = poly(pts);
    s += text(x0 + a * k / 2, y0 + 20, aLabel);                                   // a: base
    s += text((x0 + px) / 2 - 10, (y0 + py) / 2 - 2, bLabel, 'end');             // b: left side
    s += text((x0 + a * k + px) / 2 + 10, (y0 + py) / 2 - 2, cLabel, 'start');   // c: right side
    return svg(W, H, s, 'triangle');
  }

  /* Rectangular prism (oblique) with length, width and height labels. */
  function prism(lLabel, wLabel, hLabel, l, w, h) {
    var d = fit(l + w * 0.5, h + w * 0.4, 230, 150), k = d[0] / (l + w * 0.5);
    var L = Math.max(80, l * k), Hh = Math.max(50, h * k), D = Math.max(28, w * 0.5 * k), dy = D * 0.7;
    var x0 = 30, y0 = 20 + dy, W = x0 + L + D + 80, H = y0 + Hh + 40;
    var front = [[x0, y0], [x0 + L, y0], [x0 + L, y0 + Hh], [x0, y0 + Hh]];
    var top = [[x0, y0], [x0 + D, y0 - dy], [x0 + L + D, y0 - dy], [x0 + L, y0]];
    var side = [[x0 + L, y0], [x0 + L + D, y0 - dy], [x0 + L + D, y0 + Hh - dy], [x0 + L, y0 + Hh]];
    var s = poly(top) + poly(side) + poly(front);
    s += text(x0 + L / 2, y0 + Hh + 22, lLabel) + text(x0 + L + D + 8, y0 + Hh / 2 - dy / 2 + 5, hLabel, 'start') + text(x0 + L + D / 2 + 10, y0 + Hh + 6 - dy + 14, wLabel, 'start');
    return svg(W, H, s, 'rectangular prism');
  }

  /* Coordinate grid. opts = { xmin, xmax, ymin, ymax, step (axis label step), points: [[x,y,label,open?]], segments: [[x1,y1,x2,y2,label]],
   * lines: [{m,b,label} | {x: c} | {y: c} | {a,b,c}], curves: [{f: function(x), from, to, label}], arrows (on segments), size (px per unit) } */
  function grid(o) {
    o = o || {}; var xmin = o.xmin != null ? o.xmin : -6, xmax = o.xmax != null ? o.xmax : 6, ymin = o.ymin != null ? o.ymin : -6, ymax = o.ymax != null ? o.ymax : 6;
    var u = o.size || Math.max(16, Math.min(26, Math.floor(300 / Math.max(xmax - xmin, ymax - ymin)))), pad = 28;
    var W = (xmax - xmin) * u + pad * 2, H = (ymax - ymin) * u + pad * 2;
    var X = function (x) { return pad + (x - xmin) * u; }, Y = function (y) { return pad + (ymax - y) * u; };
    var s = '<defs><marker id="fig-ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="' + STROKE + '"/></marker></defs>';
    s += '<rect x="' + X(xmin) + '" y="' + Y(ymax) + '" width="' + (xmax - xmin) * u + '" height="' + (ymax - ymin) * u + '" fill="rgba(232,220,192,.03)"/>';
    var gx, gy;
    for (gx = xmin; gx <= xmax; gx++) s += '<line x1="' + X(gx) + '" y1="' + Y(ymin) + '" x2="' + X(gx) + '" y2="' + Y(ymax) + '" stroke="rgba(232,220,192,' + (gx === 0 ? '.6' : '.12') + ')" stroke-width="' + (gx === 0 ? 1.6 : 1) + '"/>';
    for (gy = ymin; gy <= ymax; gy++) s += '<line x1="' + X(xmin) + '" y1="' + Y(gy) + '" x2="' + X(xmax) + '" y2="' + Y(gy) + '" stroke="rgba(232,220,192,' + (gy === 0 ? '.6' : '.12') + ')" stroke-width="' + (gy === 0 ? 1.6 : 1) + '"/>';
    var st = o.step || ((xmax - xmin) > 12 ? 2 : 1), sm = ' font-size="11" fill="' + INK + '" opacity=".8"';
    for (gx = Math.ceil(xmin / st) * st; gx <= xmax; gx += st) if (gx !== 0) s += '<text x="' + X(gx) + '" y="' + (Y(Math.max(0, ymin)) + (ymin <= 0 && ymax >= 0 ? 14 : -4)) + '" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"' + sm + '>' + gx + '</text>';
    for (gy = Math.ceil(ymin / st) * st; gy <= ymax; gy += st) if (gy !== 0) s += '<text x="' + (X(Math.max(0, xmin)) - 5) + '" y="' + (Y(gy) + 4) + '" text-anchor="end" font-family="Helvetica, Arial, sans-serif"' + sm + '>' + gy + '</text>';
    s += text(X(xmax) + 10, Y(Math.max(0, ymin)) + 5, o.xlabel || 'x', 'start', ' font-style="italic"') + text(X(Math.max(0, xmin)), Y(ymax) - 8, o.ylabel || 'y', 'middle', ' font-style="italic"');
    function clipLine(m, b) { // y = m x + b within the window -> endpoints
      var pts = [];
      [[xmin, m * xmin + b], [xmax, m * xmax + b]].forEach(function (p) { if (p[1] >= ymin - 1e-9 && p[1] <= ymax + 1e-9) pts.push(p); });
      if (m !== 0) [[(ymin - b) / m, ymin], [(ymax - b) / m, ymax]].forEach(function (p) { if (p[0] > xmin + 1e-9 && p[0] < xmax - 1e-9) pts.push(p); });
      pts.sort(function (p, q) { return p[0] - q[0]; }); return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
    }
    (o.lines || []).forEach(function (L) {
      var e = null;
      if (L.x != null) e = [[L.x, ymin], [L.x, ymax]]; else if (L.y != null) e = [[xmin, L.y], [xmax, L.y]];
      else if (L.a != null) { if (L.b === 0) e = [[-L.c / L.a, ymin], [-L.c / L.a, ymax]]; else e = clipLine(-L.a / L.b, -L.c / L.b); }
      else e = clipLine(L.m, L.b);
      if (!e) return;
      s += '<line x1="' + X(e[0][0]) + '" y1="' + Y(e[0][1]) + '" x2="' + X(e[1][0]) + '" y2="' + Y(e[1][1]) + '" stroke="' + (L.color || STROKE) + '" stroke-width="2.2"' + (L.dashed ? ' stroke-dasharray="6 4"' : '') + '/>';
      if (L.label) s += text(X(e[1][0]) - 6, Y(e[1][1]) + (e[1][1] > e[0][1] ? 16 : -8), L.label, 'end', ' font-style="italic" fill="' + (L.color || STROKE) + '"');
    });
    (o.curves || []).forEach(function (C) {
      var d = '', n = 60, f0 = C.from != null ? C.from : xmin, f1 = C.to != null ? C.to : xmax;
      for (var i = 0; i <= n; i++) { var x = f0 + (f1 - f0) * i / n, y = C.f(x); if (y < ymin - 2 || y > ymax + 2) { d += ' M'; continue; } d += (d === '' || /M$/.test(d) ? (d.replace(/ M$/, '') + ' M') : ' L') + X(x) + ' ' + Y(y); }
      s += '<path d="' + d.replace(/^ M/, 'M').replace(/ M M/g, ' M') + '" fill="none" stroke="' + (C.color || STROKE) + '" stroke-width="2.2"/>';
    });
    (o.segments || []).forEach(function (g) {
      s += '<line x1="' + X(g[0]) + '" y1="' + Y(g[1]) + '" x2="' + X(g[2]) + '" y2="' + Y(g[3]) + '" stroke="' + STROKE + '" stroke-width="2.2"' + (o.arrows ? ' marker-end="url(#fig-ar)"' : '') + '/>';
      if (g[4]) s += text((X(g[0]) + X(g[2])) / 2 + 8, (Y(g[1]) + Y(g[3])) / 2 - 6, g[4], 'start', ' font-style="italic"');
    });
    (o.points || []).forEach(function (p) {
      s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4.5" fill="' + (p[3] ? '#0d0b0a' : (p[4] || STROKE)) + '" stroke="' + (p[4] || STROKE) + '" stroke-width="2"/>';
      if (p[2]) s += text(X(p[0]) + 8, Y(p[1]) - 7, p[2], 'start', ' font-size="13"');
    });
    return svg(W, H, s, o.aria || 'coordinate grid');
  }
  /* table of values */
  function table(xs, ys, xName, yName) {
    var cell = function (v, hd) { return '<td class="' + (hd ? 'hd' : '') + '">' + lab(v) + '</td>'; };
    return '<table class="fig-table"><tr>' + cell(xName || 'x', true) + xs.map(function (v) { return cell(v); }).join('') + '</tr><tr>' + cell(yName || 'y', true) + ys.map(function (v) { return cell(v); }).join('') + '</tr></table>';
  }
  /* a real-world piecewise graph: pts = [[x,y,label]], joined in order; axes labelled */
  function pathGraph(pts, o) {
    o = o || {}; var xmax = o.xmax || Math.max.apply(null, pts.map(function (p) { return p[0]; })), ymax = o.ymax || Math.max.apply(null, pts.map(function (p) { return p[1]; }));
    var W = 380, H = 240, pad = 44, X = function (x) { return pad + x / xmax * (W - pad - 34); }, Y = function (y) { return H - 32 - y / ymax * (H - 32 - 30); };
    var s = '<line x1="' + pad + '" y1="' + Y(0) + '" x2="' + (W - 10) + '" y2="' + Y(0) + '" stroke="' + INK + '" stroke-width="1.4"/><line x1="' + pad + '" y1="' + Y(0) + '" x2="' + pad + '" y2="' + (Y(ymax) - 6) + '" stroke="' + INK + '" stroke-width="1.4"/>';
    var xs = o.xticks || [], ys = o.yticks || [];
    xs.forEach(function (v) { s += '<line x1="' + X(v) + '" y1="' + (Y(0) - 3) + '" x2="' + X(v) + '" y2="' + (Y(0) + 3) + '" stroke="' + INK + '"/>' + text(X(v), Y(0) + 14, v, 'middle', ' font-size="11"'); });
    ys.forEach(function (v) { s += '<line x1="' + (pad - 3) + '" y1="' + Y(v) + '" x2="' + (pad + 3) + '" y2="' + Y(v) + '" stroke="' + INK + '"/>' + text(pad - 6, Y(v) + 4, v, 'end', ' font-size="11"'); });
    s += '<polyline points="' + pts.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '" fill="none" stroke="' + STROKE + '" stroke-width="2.4"/>';
    pts.forEach(function (p) { s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="3.5" fill="' + STROKE + '"/>'; if (p[2]) { var end = p[0] === xmax && String(p[2]).length > 2, st = p[0] === 0 && p[1] === 0; s += text(X(p[0]) + (end ? 4 : st ? 7 : 0), Y(p[1]) - (st ? 6 : 9), p[2], end ? 'end' : st ? 'start' : 'middle', ' font-size="12" font-weight="700"'); } });
    s += text(W / 2, H - 4, o.xlabel || '', 'middle', ' font-size="12"') + '<text transform="translate(12 ' + (H / 2) + ') rotate(-90)" text-anchor="middle" ' + FONT + ' font-size="12">' + lab(o.ylabel || '') + '</text>';
    return svg(W, H, s, 'graph');
  }

  return { rect: rect, lshape: lshape, cutout: cutout, triangle: triangle, prism: prism, grid: grid, table: table, pathGraph: pathGraph, lab: lab };
})();
