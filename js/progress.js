/* --- PROGRESS PAGE: Body Measurements + Weight Log --- */

function renderProgress() {
  var latest  = HistoryStore.getLatestMeasurement();
  var weights = HistoryStore.getWeightLog();

  el('progress-content').innerHTML =
    '<div class="top-header">' +
      '<h2>Progress</h2>' +
      '<button class="btn btn-sm btn-primary" onclick="openMeasurementModal()">' +
        icon('zap', 14) + ' Log Today' +
      '</button>' +
    '</div>' +

    // Quick stats
    renderProgressStats(latest, weights) +

    // Weight trend
    renderWeightChart(weights) +

    // Strength + volume
    renderReadinessTrends() +
    renderStrengthSection() +

    // Measurements history
    renderMeasurementsTable() +

    // Body fat estimator
    renderBodyFatEstimator();
}

function renderProgressStats(latest, weights) {
  var weight  = latest ? esc(latest.weight || '--') : '--';
  var waist   = latest ? esc(latest.waist  || '--') : '--';
  var arms    = latest ? esc(latest.arms   || '--') : '--';

  // Calculate change from first entry
  var measurements = HistoryStore.getMeasurements();
  var first   = measurements.length > 1 ? measurements[measurements.length - 1] : null;
  var weightChange = (first && latest && first.weight && latest.weight)
    ? (parseFloat(latest.weight) - parseFloat(first.weight)).toFixed(1) : null;
  var waistChange  = (first && latest && first.waist && latest.waist)
    ? (parseFloat(latest.waist) - parseFloat(first.waist)).toFixed(1) : null;

  return '<div class="stats-row" style="margin-bottom:16px">' +
    statBox('Weight', weight + 'kg', weightChange, true) +
    statBox('Waist', waist + 'cm', waistChange, true) +
    statBox('Arms', arms + 'cm', null, false) +
  '</div>';
}

function statBox(label, value, change, lowerIsBetter) {
  var changeHtml = '';
  if (change !== null && change !== undefined) {
    var num  = parseFloat(change);
    var good = lowerIsBetter ? num < 0 : num > 0;
    var color= good ? 'var(--green)' : 'var(--red)';
    var sign = num > 0 ? '+' : '';
    changeHtml = '<div style="font-size:0.7rem;color:' + color + '">' + sign + change + '</div>';
  }
  return '<div class="stat-tile">' +
    '<div class="value">' + value + '</div>' +
    '<div class="label">' + label + '</div>' +
    changeHtml +
  '</div>';
}

function renderWeightChart(weights) {
  if (!weights || weights.length < 2) {
    return '<div class="card mb-16" style="text-align:center;padding:20px">' +
      '<p style="color:var(--text-muted);font-size:0.87rem">Log at least 2 weight entries to see your trend.</p>' +
    '</div>';
  }

  var recent = weights.slice(0, 30).reverse();
  var trend  = recent[recent.length - 1].value - recent[0].value;

  return '<div class="section-header"><h3>Weight Trend</h3>' +
    '<span style="font-size:0.78rem;color:' + (trend < 0 ? 'var(--green)' : 'var(--red)') + '">' +
      (trend > 0 ? '+' : '') + trend.toFixed(1) + 'kg in ' + recent.length + ' entries</span>' +
  '</div>' +
  '<div class="card mb-16" style="padding:16px">' +
    Charts.line(recent.map(function(w) { return { label: w.date.slice(5), value: w.value }; }),
      { unit: 'kg', label: 'Body weight trend' }) +
  '</div>';
}

function renderMeasurementsTable() {
  var list = HistoryStore.getMeasurements().slice(0, 10);
  if (!list.length) return '';

  var fields = ['weight','waist','chest','arms','shoulders','thighs'];
  var labels = { weight:'Weight', waist:'Waist', chest:'Chest', arms:'Arms', shoulders:'Shoulders', thighs:'Thighs' };
  var units  = { weight:'kg', waist:'cm', chest:'cm', arms:'cm', shoulders:'cm', thighs:'cm' };

  return '<div class="section-header"><h3>Measurements Log</h3></div>' +
  '<div class="card mb-16" style="overflow-x:auto">' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.8rem">' +
      '<tr>' +
        '<th style="text-align:left;padding:6px 4px;color:var(--text-muted);font-weight:600;border-bottom:1px solid var(--border)">Date</th>' +
        fields.map(function(f) {
          return '<th style="text-align:right;padding:6px 4px;color:var(--text-muted);font-weight:600;border-bottom:1px solid var(--border)">' + labels[f] + '</th>';
        }).join('') +
      '</tr>' +
      list.map(function(m, i) {
        // Calculate change from previous entry
        var prev = list[i + 1];
        return '<tr style="border-bottom:1px solid var(--border)">' +
          '<td style="padding:6px 4px;color:var(--text-secondary);white-space:nowrap">' + m.date.slice(5) + '</td>' +
          fields.map(function(f) {
            var val  = m[f] ? esc(m[f]) : '--';
            var diff = (prev && prev[f] && m[f]) ? (parseFloat(m[f]) - parseFloat(prev[f])).toFixed(1) : null;
            var diffColor = diff ? (parseFloat(diff) < 0 ? 'var(--green)' : 'var(--red)') : '';
            var sign = diff && parseFloat(diff) > 0 ? '+' : '';
            return '<td style="text-align:right;padding:6px 4px;color:var(--text-primary)">' +
              val + (val !== '--' ? '<span style="font-size:0.7rem;color:var(--text-muted)">' + units[f] + '</span>' : '') +
              (diff ? '<div style="font-size:0.68rem;color:' + diffColor + '">' + sign + diff + '</div>' : '') +
            '</td>';
          }).join('') +
        '</tr>';
      }).join('') +
    '</table>' +
  '</div>';
}

function renderBodyFatEstimator() {
  return '<div class="section-header"><h3>Body Fat Estimator</h3><span class="text-xs text-muted">US Navy method</span></div>' +
  '<div class="card mb-16">' +
    '<p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:14px">Enter measurements in cm and cm for an estimate.</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      inputField('bf-height', 'Height (cm)', 'number', '175') +
      inputField('bf-neck', 'Neck (cm)', 'number', '38') +
      inputField('bf-waist', 'Waist (cm)', 'number', '85') +
      inputField('bf-weight', 'Weight (kg)', 'number', '80') +
    '</div>' +
    '<button class="btn btn-secondary btn-full" onclick="calculateBodyFat()">Calculate Body Fat %</button>' +
    '<div id="bf-result" style="margin-top:10px"></div>' +
  '</div>';
}

function inputField(id, label, type, placeholder) {
  return '<div class="input-group" style="margin-bottom:0">' +
    '<label>' + label + '</label>' +
    '<input type="' + type + '" id="' + id + '" placeholder="' + placeholder + '" inputmode="decimal">' +
  '</div>';
}

function calculateBodyFat() {
  var height = parseFloat(el('bf-height') && el('bf-height').value) || 0;
  var neck   = parseFloat(el('bf-neck')   && el('bf-neck').value)   || 0;
  var waist  = parseFloat(el('bf-waist')  && el('bf-waist').value)  || 0;

  if (!height || !neck || !waist) { showToast('Enter all measurements', 'warning'); return; }

  // US Navy formula for males
  var bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  bf = Math.max(3, Math.min(45, bf));

  var category, color;
  if (bf < 6)       { category = 'Essential Fat';    color = '#6366f1'; }
  else if (bf < 14) { category = 'Athletic';         color = '#10b981'; }
  else if (bf < 18) { category = 'Fit';              color = '#3b82f6'; }
  else if (bf < 25) { category = 'Average';          color = '#f59e0b'; }
  else              { category = 'Above Average';    color = '#ef4444'; }

  var target = bf > 12 ? 'Target: 10-13% for lean athletic physique' : 'You are in athletic range. Maintain.';

  el('bf-result').innerHTML =
    '<div style="background:rgba(' + (color === '#10b981' ? '16,185,129' : '0,212,180') + ',0.1);border:1px solid rgba(' + (color === '#10b981' ? '16,185,129' : '0,212,180') + ',0.25);border-radius:var(--radius-md);padding:14px;text-align:center">' +
      '<div style="font-size:2.5rem;font-weight:800;color:' + color + '">' + bf.toFixed(1) + '%</div>' +
      '<div style="font-size:0.9rem;font-weight:600;color:' + color + ';margin-bottom:4px">' + category + '</div>' +
      '<div style="font-size:0.8rem;color:var(--text-muted)">' + target + '</div>' +
    '</div>';
}

//  MEASUREMENT MODAL 
function openMeasurementModal() {
  var latest  = HistoryStore.getLatestMeasurement() || {};
  var overlay = el('measurement-overlay') || createMeasurementOverlay();
  overlay.classList.add('open');

  overlay.innerHTML =
    '<div class="modal-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<h3>Log Today\'s Measurements</h3>' +
        '<button class="btn btn-ghost btn-sm" onclick="closeMeasurementModal()">' + icon('close', 16) + '</button>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        measureInput('m-weight',    'Weight (kg)',    latest.weight) +
        measureInput('m-waist',     'Waist (cm)',     latest.waist) +
        measureInput('m-chest',     'Chest (cm)',     latest.chest) +
        measureInput('m-arms',      'Arms (cm)',      latest.arms) +
        measureInput('m-shoulders', 'Shoulders (cm)', latest.shoulders) +
        measureInput('m-thighs',    'Thighs (cm)',    latest.thighs) +
      '</div>' +

      '<div class="input-group" style="margin-top:10px">' +
        '<label>Notes</label>' +
        '<input type="text" id="m-notes" placeholder="How you feel, diet notes..." style="width:100%">' +
      '</div>' +

      '<button class="btn btn-primary btn-full mt-12" onclick="saveMeasurement()">Save Measurements</button>' +
    '</div>';
}

function measureInput(id, label, prefill) {
  return '<div class="input-group" style="margin-bottom:0">' +
    '<label>' + label + '</label>' +
    '<input type="number" id="' + id + '" placeholder="0" value="' + esc(prefill || '') + '" inputmode="decimal" step="any">' +
  '</div>';
}

var MEASURE_LIMITS = {
  weight:    [20, 400, 'Weight'],
  waist:     [30, 250, 'Waist'],
  chest:     [40, 250, 'Chest'],
  arms:      [10, 100, 'Arms'],
  shoulders: [40, 250, 'Shoulders'],
  thighs:    [20, 150, 'Thighs']
};

function saveMeasurement() {
  var entry = { date: HistoryStore.localDate(), notes: el('m-notes') ? String(el('m-notes').value).slice(0, 200) : '' };
  var any = false;
  var fields = Object.keys(MEASURE_LIMITS);
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i], raw = el('m-' + f) ? String(el('m-' + f).value).trim() : '';
    if (raw === '') { entry[f] = ''; continue; }
    var v = parseFloat(raw), lim = MEASURE_LIMITS[f];
    if (isNaN(v) || v < lim[0] || v > lim[1]) {
      showToast(lim[2] + ' must be between ' + lim[0] + ' and ' + lim[1], 'warning');
      return;
    }
    entry[f] = Math.round(v * 10) / 10;
    any = true;
  }
  if (!any) { showToast('Enter at least one measurement', 'warning'); return; }

  // Also log weight separately for trend chart
  if (entry.weight !== '') HistoryStore.logWeight(entry.weight, STATE.settings.units);

  HistoryStore.saveMeasurement(entry);
  closeMeasurementModal();
  showToast('Measurements saved', 'success');
  renderProgress();
}

function closeMeasurementModal() {
  var overlay = el('measurement-overlay');
  if (overlay) { overlay.classList.remove('open'); overlay.innerHTML = ''; }
}

function createMeasurementOverlay() {
  var d     = document.createElement('div');
  d.id      = 'measurement-overlay';
  d.className = 'modal-overlay';
  d.onclick = function(e) { if (e.target === d) closeMeasurementModal(); };
  document.body.appendChild(d);
  return d;
}
