/* --- RINGS: reusable circular gauge (SVG arc + HTML centre) --- ES5 --- */

var Rings = (function() {

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  /* opts: { pct 0-100, display, label, sub, color, size, stroke, ariaLabel } */
  function ring(opts) {
    var size   = opts.size || 96;
    var stroke = opts.stroke || 8;
    var pct    = clamp(isNaN(opts.pct) ? 0 : opts.pct, 0, 100);
    var r      = (size - stroke) / 2;
    var c      = 2 * Math.PI * r;
    var off    = c * (1 - pct / 100);
    var color  = opts.color || 'var(--accent)';
    var half   = size / 2;

    return '<div class="ring-wrap">' +
      '<div class="ring" style="width:' + size + 'px;height:' + size + 'px" role="img" aria-label="' + esc(opts.ariaLabel || (opts.label + ' ' + opts.display)) + '">' +
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
          '<circle cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="' + stroke + '"/>' +
          '<circle class="ring-arc" cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" ' +
            'stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '" style="--c:' + c.toFixed(2) + '" transform="rotate(-90 ' + half + ' ' + half + ')"/>' +
        '</svg>' +
        '<div class="ring-center"><div class="ring-value" style="color:' + color + '">' + esc(opts.display) + '</div></div>' +
      '</div>' +
      '<div class="ring-label">' + esc(opts.label) + '</div>' +
      (opts.sub ? '<div class="ring-sub">' + esc(opts.sub) + '</div>' : '') +
    '</div>';
  }

  return { ring: ring };
})();
