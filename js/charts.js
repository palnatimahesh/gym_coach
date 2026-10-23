/* --- CHARTS: reusable SVG line/bar helpers + strength & volume section --- ES5 --- */

var Charts = (function() {

  function fmt(n) { return (Math.round(n * 10) / 10).toString(); }

  /* points: [{label, value}] oldest -> newest. Returns an <svg> string. */
  function line(points, o) {
    o = o || {};
    var color = o.color || '#00d4b4';
    var n = points.length;
    if (!n) return '';
    var vals = points.map(function(p) { return p.value; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var pad = (max - min) < 1 ? 1 : (max - min) * 0.1;
    min -= pad; max += pad;
    var range = max - min;
    var xy = points.map(function(p, i) {
      return { x: n > 1 ? (i * 100) / (n - 1) : 50, y: 100 - ((p.value - min) / range) * 100 };
    });
    var poly = xy.map(function(p) { return p.x + ',' + p.y; }).join(' ');
    var last = xy[n - 1];
    return '<svg viewBox="0 -5 100 115" style="width:100%;height:120px;overflow:visible" role="img" aria-label="' + esc(o.label || 'Trend chart') + '">' +
      '<line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
      '<line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
      '<line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>' +
      (n > 1 ? '<polygon points="' + xy[0].x + ',100 ' + poly + ' ' + last.x + ',100" fill="' + color + '" fill-opacity="0.1"/>' : '') +
      '<polyline points="' + poly + '" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last.x + '" cy="' + last.y + '" r="2.5" fill="' + color + '"/>' +
      '<text x="0" y="108" font-size="5" fill="#5b6772">' + esc(points[0].label) + '</text>' +
      '<text x="100" y="108" font-size="5" fill="#5b6772" text-anchor="end">' + esc(points[n - 1].label) + '</text>' +
    '</svg>' +
    '<div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted)">' +
      '<span>' + fmt(Math.min.apply(null, vals)) + (o.unit || '') + '</span>' +
      '<span>' + fmt(Math.max.apply(null, vals)) + (o.unit || '') + '</span>' +
    '</div>';
  }

  /* items: [{label, value}]. Returns an <svg> string. */
  function bars(items, o) {
    o = o || {};
    var color = o.color || '#6366f1';
    var n = items.length;
    if (!n) return '';
    var max = Math.max.apply(null, items.map(function(i) { return i.value; })) || 1;
    var slot = 100 / n, bw = slot * 0.7;
    var body = items.map(function(it, i) {
      var h = Math.max(it.value > 0 ? 1.5 : 0, (it.value / max) * 40);
      var x = i * slot + (slot - bw) / 2;
      return '<rect x="' + x + '" y="' + (46 - h) + '" width="' + bw + '" height="' + h + '" rx="1" fill="' + color + '" fill-opacity="' + (it.value > 0 ? 0.85 : 0.25) + '"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (44 - h) + '" font-size="4" fill="#94a3b0" text-anchor="middle">' + (it.value > 0 ? fmt(it.value) : '') + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="54" font-size="3.6" fill="#5b6772" text-anchor="middle">' + esc(it.label) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 100 58" style="width:100%;height:110px" role="img" aria-label="' + esc(o.label || 'Bar chart') + '">' +
      '<line x1="0" y1="46" x2="100" y2="46" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' + body + '</svg>';
  }

  return { line: line, bars: bars };
})();

/* ---- Readiness / effort / sleep / steps trends (Progress page, last 14 days) ---- */
function renderReadinessTrends() {
  var s = Readiness.series(14);
  var scored = s.filter(function(x) { return x.score !== null; });
  var hasEffort = s.some(function(x) { return x.effort > 0; });
  if (scored.length < 2 && !hasEffort) {
    return '<div class="card mb-16" style="text-align:center;padding:20px">' +
      '<p style="color:var(--text-muted);font-size:0.87rem">Do the morning check-in or connect Health to see readiness and effort trends.</p></div>';
  }
  function block(title, sub, inner) {
    return '<div class="section-header"><h3>' + title + '</h3><span class="text-xs text-muted">' + sub + '</span></div><div class="card mb-16" style="padding:16px">' + inner + '</div>';
  }
  function dayBars(field, color, label, scale) {
    return Charts.bars(s.map(function(x) { return { label: x.date.slice(8), value: x[field] === null ? 0 : Math.round(x[field] * scale * 10) / 10 }; }), { color: color, label: label });
  }
  var html = '';
  if (scored.length >= 2) {
    html += block('Readiness', '0-100', Charts.line(scored.map(function(x) { return { label: x.date.slice(5), value: x.score }; }), { color: '#19e68c', label: 'Readiness trend' }));
  }
  if (hasEffort) html += block('Effort', 'Last 14 days, 0-21', dayBars('effort', '#0093e7', 'Daily effort', 1));
  if (s.some(function(x) { return x.sleepH !== null; })) html += block('Sleep', 'Hours', dayBars('sleepH', '#6366f1', 'Sleep hours', 1));
  if (s.some(function(x) { return x.steps !== null; })) html += block('Steps', 'Thousands', dayBars('steps', '#00d4b4', 'Daily steps in thousands', 0.001));
  return html;
}

/* ---- Strength + volume section (Progress page) ---- */
var ChartState = { exId: null };

function setChartExercise(id) {
  ChartState.exId = id;
  renderProgress();
}

function renderStrengthSection() {
  var tracked = HistoryStore.getTrackedExercises();
  if (!tracked.length) {
    return '<div class="card mb-16" style="text-align:center;padding:20px">' +
      '<p style="color:var(--text-muted);font-size:0.87rem">Log weighted sets in a workout to see strength and volume trends.</p></div>';
  }
  var units = STATE.settings.units || 'kg';
  var sel = ChartState.exId;
  if (!sel || !tracked.some(function(t) { return t.id === sel; })) sel = tracked[0].id;

  var options = tracked.map(function(t) {
    return '<option value="' + esc(t.id) + '"' + (t.id === sel ? ' selected' : '') + '>' + esc(getExerciseName(t.id)) + ' (' + t.count + ')</option>';
  }).join('');

  var series = HistoryStore.getStrengthSeries(sel, 20);
  var strength;
  if (series.length < 2) {
    strength = '<p style="color:var(--text-muted);font-size:0.87rem;text-align:center;padding:12px 0">Log this lift in 2 sessions to see the trend.</p>';
  } else {
    var change = series[series.length - 1].value - series[0].value;
    var last   = series[series.length - 1];
    strength =
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">' +
        '<span style="font-size:0.78rem;color:var(--text-muted)">Best set: ' + last.top.weight + units + ' x ' + last.top.reps + '</span>' +
        '<span style="font-size:0.78rem;color:' + (change >= 0 ? 'var(--green)' : 'var(--red)') + '">' + (change > 0 ? '+' : '') + (Math.round(change * 10) / 10) + units + ' e1RM</span>' +
      '</div>' +
      Charts.line(series.map(function(p) { return { label: p.date.slice(5), value: p.value }; }),
        { unit: units, color: '#10b981', label: 'Estimated one rep max trend' });
  }

  var vol = HistoryStore.getWeeklyVolume(8);
  return '<div class="section-header"><h3>Strength</h3><span class="text-xs text-muted">Estimated 1RM</span></div>' +
    '<div class="card mb-16" style="padding:16px">' +
      '<div class="input-group" style="margin-bottom:10px"><select id="chart-ex" onchange="setChartExercise(this.value)">' + options + '</select></div>' +
      strength +
    '</div>' +
    '<div class="section-header"><h3>Weekly Volume</h3><span class="text-xs text-muted">Tonnes</span></div>' +
    '<div class="card mb-16" style="padding:16px">' +
      Charts.bars(vol.map(function(v) { return { label: v.week.slice(5), value: v.tonnes }; }), { label: 'Weekly volume in tonnes' }) +
    '</div>';
}
