/* --- WORKOUT HISTORY PAGE --- */

function renderHistory() {
  var sessions = HistoryStore.getSessions();
  var thisWeek = HistoryStore.getSessionsThisWeek();

  el('history-content').innerHTML =
    '<div class="top-header">' +
      '<h2>History</h2>' +
      '<span class="badge badge-muted">' + sessions.length + ' sessions</span>' +
    '</div>' +

    // This week summary
    '<div class="stats-row" style="margin-bottom:16px">' +
      statTile(thisWeek.length, 'This Week', 'var(--accent)') +
      statTile(sessions.length, 'Total', 'var(--green)') +
      statTile(getTotalVolume(sessions), 'Tonnes', 'var(--yellow)') +
    '</div>' +

    // Weekly heatmap
    renderWeeklyHeatmap(sessions) +

    // Session list
    '<div class="section-header" style="margin-top:16px"><h3>Sessions</h3></div>' +
    (sessions.length === 0 ? renderEmptyHistory() : sessions.map(renderSessionCard).join(''));
}

function statTile(val, label, color) {
  return '<div class="stat-tile">' +
    '<div class="value" style="color:' + color + '">' + val + '</div>' +
    '<div class="label">' + label + '</div>' +
  '</div>';
}

/* One logged set as text, respecting its kind (reps / timed / per side / distance) */
function setSummary(s) {
  var u = STATE.settings.units || 'kg';
  var w = s.weight ? esc(s.weight) + u : '';
  var r = esc(s.reps || '--');
  switch (s.kind) {
    case 'timed':           return r + ' s';
    case 'timed_bilateral': return r + ' s per side';
    case 'per_side':        return (w ? w + ' x ' : '') + r + ' reps per side';
    case 'distance':        return (w ? w + ' x ' : '') + r + ' m';
    default:                return (w || 'BW') + ' x ' + r + ' reps';
  }
}

function getTotalVolume(sessions) {
  var kg = 0;
  sessions.forEach(function(s) {
    if (!s.exercises) return;
    s.exercises.forEach(function(e) {
      if (!e.sets) return;
      e.sets.forEach(function(set) {
        if (set.done && set.weight && set.reps && set.kind !== 'distance') {
          kg += parseFloat(set.weight) * parseInt(set.reps);
        }
      });
    });
  });
  return (kg / 1000).toFixed(1);
}

function renderWeeklyHeatmap(sessions) {
  var weeks    = 8;
  var days     = 7;
  var today    = new Date();
  var todayMon = today.getDay() === 0 ? 6 : today.getDay() - 1;
  var cells    = [];

  // Build date grid  8 weeks back
  for (var w = weeks - 1; w >= 0; w--) {
    for (var d = 0; d < days; d++) {
      var date = new Date(today);
      date.setDate(today.getDate() - (w * 7) - (todayMon - d));
      var dateStr = HistoryStore.localDate(date);
      var hasSession = sessions.some(function(s) { return s.date === dateStr; });
      var isToday    = dateStr === HistoryStore.localDate(today);
      var isFuture   = date > today;
      cells.push({ dateStr: dateStr, hasSession: hasSession, isToday: isToday, isFuture: isFuture });
    }
  }

  var dayLabels = ['M','T','W','T','F','S','S'];
  var html =
    '<div class="section-header"><h3>Activity</h3><span class="text-xs text-muted">8 weeks</span></div>' +
    '<div style="display:flex;gap:2px;margin-bottom:4px">' +
      dayLabels.map(function(d) {
        return '<div style="width:' + (100/7) + '%;text-align:center;font-size:0.62rem;color:var(--text-muted)">' + d + '</div>';
      }).join('') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(' + days + ',1fr);grid-template-rows:repeat(' + weeks + ',1fr);gap:3px;margin-bottom:8px">';

  cells.forEach(function(c) {
    var bg = c.isFuture    ? 'var(--bg-secondary)'
           : c.isToday     ? 'var(--accent)'
           : c.hasSession  ? 'rgba(0,212,180,0.5)'
           : 'var(--bg-card)';
    var border = c.isToday ? '1px solid var(--accent)' : '1px solid var(--border)';
    html += '<div style="aspect-ratio:1;border-radius:3px;background:' + bg + ';border:' + border + '" title="' + c.dateStr + '"></div>';
  });

  html += '</div>';
  return html;
}

function renderSessionCard(session) {
  var date     = new Date(session.date);
  var dateStr  = date.toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric' });
  var exCount  = (session.exercises || []).length;
  var doneSets = session.doneSets || 0;
  var duration = session.duration ? formatTime(session.duration) : '--';
  var note     = session.note || '';
  // Average RPE across exercises
  var rpeVals  = session.rpe ? Object.values(session.rpe) : [];
  var avgRpe   = rpeVals.length > 0 ? (rpeVals.reduce(function(a,b){return a+b;},0)/rpeVals.length).toFixed(1) : null;

  return '<div class="exercise-card mb-8" id="hist-' + session.date + '-' + session.id + '">' +
    '<div class="exercise-header" onclick="toggleHistoryCard(\'' + session.date + '-' + (session.id||0) + '\')">' +
      '<div class="exercise-icon" style="background:var(--accent-dim);color:var(--accent);width:44px;height:44px">' +
        icon('dumbbell', 20) +
      '</div>' +
      '<div class="exercise-meta">' +
        '<div class="name">' + esc(session.title || 'Workout') + '</div>' +
        '<div class="sub" style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<span>' + dateStr + '</span>' +
          '<span>' + icon('sun', 11) + ' ' + duration + '</span>' +
          '<span>' + doneSets + ' sets</span>' +
          (avgRpe ? '<span style="color:' + (parseFloat(avgRpe)>=8?'var(--red)':parseFloat(avgRpe)>=5?'var(--yellow)':'var(--green)') + '">RPE ' + avgRpe + '</span>' : '') +
        '</div>' +
        (note ? '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;font-style:italic">"' + esc(note) + '"</div>' : '') +
      '</div>' +
      '<div class="exercise-chevron">' + icon('chevron_down', 16) + '</div>' +
    '</div>' +

    '<div class="exercise-body" id="hist-body-' + session.date + '-' + (session.id||0) + '">' +
      (session.exercises || []).map(function(e) {
        var doneSets = (e.sets || []).filter(function(s){ return s.done; });
        if (!doneSets.length) return '';
        return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<span style="font-size:0.87rem;color:var(--text-secondary)">' + esc(e.name || e.id) + '</span>' +
            '<span style="font-size:0.78rem;color:var(--text-muted)">' + doneSets.length + ' sets</span>' +
          '</div>' +
          doneSets.map(function(s, i) {
            return '<div style="font-size:0.78rem;color:var(--text-muted);margin-left:8px">' +
              'Set ' + (i+1) + ': ' + setSummary(s) +
            '</div>';
          }).join('') +
        '</div>';
      }).filter(Boolean).join('') +
    '</div>' +
  '</div>';
}

function toggleHistoryCard(id) {
  var card = el('hist-' + id);
  var body = el('hist-body-' + id);
  if (!card || !body) return;
  var isOpen = card.classList.contains('expanded');
  qsa('.exercise-card.expanded').forEach(function(c) { c.classList.remove('expanded'); });
  if (!isOpen) card.classList.add('expanded');
}

function renderEmptyHistory() {
  return '<div class="empty-state">' +
    icon('dumbbell', 40) +
    '<p>No sessions logged yet. Complete your first workout to see history here.</p>' +
  '</div>';
}
