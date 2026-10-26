/* --- TOOLS PAGE --- 1RM Calc, Deload Detector, Superset Builder --- */

function renderTools() {
  var deloadAlert = getDeloadStatus();

  el('tools-content').innerHTML =
    '<div class="top-header">' +
      '<h2>Coach Tools</h2>' +
      '<span class="badge badge-muted">Performance</span>' +
    '</div>' +

    // Deload alert at top if needed
    (deloadAlert.needed ? renderDeloadAlert(deloadAlert) : '') +

    // 1RM Calculator
    render1RMCalculator() +

    // Superset builder
    renderSupersetBuilder() +

    // Training age estimator
    renderTrainingAgeGuide();
}

//  DELOAD DETECTOR 
function getDeloadStatus() {
  var sessions = HistoryStore.getSessions();
  if (sessions.length < 4 || Progression.getSessionModel().deload) return { needed: false };

  // Count consecutive training weeks
  var weeksSinceDeload = STATE.weekInPhase || 1;
  var planned          = Progression.hasScheduledDeload(STATE.phase);

  // Check HRV trend simulation (based on session frequency)
  var sessionsLast14 = sessions.filter(function(s) {
    var d = new Date(s.date);
    var ago = new Date(); ago.setDate(ago.getDate() - 14);
    return d >= ago;
  }).length;

  var needed = (!planned && weeksSinceDeload >= 5) || (sessionsLast14 >= 10);
  var urgent = (!planned && weeksSinceDeload >= 7) || (sessionsLast14 >= 12);

  return {
    needed:   needed,
    urgent:   urgent,
    weeks:    weeksSinceDeload,
    message:  urgent
      ? 'You have trained hard for ' + weeksSinceDeload + ' weeks. Deload NOW  performance is declining.'
      : 'Week ' + weeksSinceDeload + ' of hard training. Consider a deload week this week.'
  };
}

function renderDeloadAlert(status) {
  var color = status.urgent ? 'var(--red)' : 'var(--yellow)';
  var bg    = status.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
  var border= status.urgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)';

  return '<div style="background:' + bg + ';border:1px solid ' + border + ';border-radius:var(--radius-lg);padding:14px;margin-bottom:16px">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '<div style="color:' + color + '">' + icon('warning', 20) + '</div>' +
      '<div style="font-size:0.88rem;font-weight:700;color:' + color + '">' + (status.urgent ? 'DELOAD REQUIRED' : 'Deload Recommended') + '</div>' +
    '</div>' +
    '<p style="font-size:0.83rem;margin-bottom:10px">' + status.message + '</p>' +
    '<div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:10px;margin-bottom:10px">' +
      '<div style="font-size:0.72rem;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Deload Protocol</div>' +
      ['Same exercises, same days', '50% of normal sets', '60-70% of normal load', 'Extra mobility and sleep', 'Cold shower daily'].map(function(r) {
        return '<div style="font-size:0.82rem;color:var(--text-secondary);padding:3px 0">' + icon('check', 12) + ' ' + r + '</div>';
      }).join('') +
    '</div>' +
    '<button class="btn btn-sm btn-secondary" onclick="startDeloadWeek()">Start Deload Week</button>' +
  '</div>';
}

function startDeloadWeek() {
  Progression.forceDeload();
  showToast('Deload week started. Sets halved, loads at 65%.', 'success');
  renderTools();
}

//  1RM CALCULATOR 
function render1RMCalculator() {
  var exercises = ['Bench Press','Squat','Deadlift','Overhead Press','Barbell Row','Pull-up'];
  var history   = Object.keys(STATE.personalRecords || {});

  return '<div class="section-header"><h3>1RM Calculator</h3><span class="text-xs text-muted">Epley formula</span></div>' +
  '<div class="card mb-16">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      '<div class="input-group" style="margin-bottom:0">' +
        '<label>Weight lifted</label>' +
        '<input type="number" id="rm-weight" placeholder="100" inputmode="decimal" style="width:100%">' +
      '</div>' +
      '<div class="input-group" style="margin-bottom:0">' +
        '<label>Reps completed</label>' +
        '<input type="number" id="rm-reps" placeholder="5" inputmode="numeric" style="width:100%">' +
      '</div>' +
    '</div>' +
    '<button class="btn btn-secondary btn-full mb-12" onclick="calculate1RM()">Calculate 1RM</button>' +
    '<div id="rm-result"></div>' +

    // PRs from workout history
    (history.length > 0 ? (
      '<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">' +
      '<div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Your Personal Records</div>' +
      history.slice(0, 6).map(function(id) {
        var pr  = STATE.personalRecords[id];
        var ex  = EXERCISES[id];
        return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)">' +
          '<span style="font-size:0.84rem;color:var(--text-secondary)">' + (ex ? ex.name : id) + '</span>' +
          '<div style="text-align:right">' +
            '<span style="font-size:0.84rem;font-weight:700;color:var(--yellow)">' + pr.weight + 'kg x ' + pr.reps + '</span>' +
            '<div style="font-size:0.72rem;color:var(--text-muted)">e1RM: ' + pr.oneRM + 'kg</div>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div>'
    ) : '') +
  '</div>';
}

function calculate1RM() {
  var weight = parseFloat(el('rm-weight') && el('rm-weight').value) || 0;
  var reps   = parseInt(el('rm-reps')   && el('rm-reps').value)   || 0;

  if (!weight || !reps) { showToast('Enter weight and reps', 'warning'); return; }

  var oneRM  = weight * (1 + reps / 30);
  var pcts   = [100, 95, 90, 85, 80, 75, 70, 60];
  var repMap = { 100:1, 95:2, 90:3, 85:4, 80:6, 75:8, 70:10, 60:15 };

  el('rm-result').innerHTML =
    '<div style="background:rgba(0,212,180,0.08);border:1px solid var(--accent-dim);border-radius:var(--radius-md);padding:12px">' +
      '<div style="text-align:center;margin-bottom:12px">' +
        '<div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Estimated 1RM</div>' +
        '<div style="font-size:2rem;font-weight:800;color:var(--accent)">' + oneRM.toFixed(1) + 'kg</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">' +
        pcts.map(function(p) {
          return '<div style="background:var(--bg-secondary);border-radius:var(--radius-sm);padding:6px;text-align:center">' +
            '<div style="font-size:0.75rem;color:var(--text-muted)">' + p + '%</div>' +
            '<div style="font-size:0.88rem;font-weight:700;color:var(--text-primary)">' + (oneRM * p / 100).toFixed(1) + '</div>' +
            '<div style="font-size:0.68rem;color:var(--text-muted)">x' + repMap[p] + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
}

//  SUPERSET BUILDER 
var SUPERSET_PAIRS = [
  { name: 'Push + Pull (Upper)', desc: 'Bench Press superset with Barbell Row. Agonist/antagonist  no strength loss, 40% time saved.', a: 'bench_press', b: 'barbell_row', benefit: 'Time-efficient. No fatigue overlap. Double the volume.', rest: '90s after both exercises' },
  { name: 'Squat + RDL', desc: 'Quad dominant paired with hamstring dominant. Complete lower body in half the time.', a: 'squat', b: 'rdl', benefit: 'Full posterior and anterior chain. 50% less gym time.', rest: '90s after both exercises' },
  { name: 'OHP + Pullup', desc: 'Vertical push + vertical pull. Perfect antagonist pair.', a: 'overhead_press', b: 'pullup', benefit: 'Shoulder health  pressing and pulling balanced.', rest: '90s after both' },
  { name: 'Core Superset', desc: 'Ab wheel + hanging leg raise back to back. Maximum core volume.', a: 'ab_wheel', b: 'hanging_leg_raise', benefit: 'Anti-extension + leg raise = complete core.', rest: '60s after both' },
  { name: 'Dumbbell Circuit', desc: 'DB Press + DB Row + DB Shoulder Press. Complete upper body with one station.', a: 'db_press', b: 'db_row', benefit: 'Ideal for busy gym  one dumbbell pair, full upper session.', rest: '60s after each pair' }
];

function renderSupersetBuilder() {
  return '<div class="section-header"><h3>Superset Pairs</h3><span class="text-xs text-muted">Save 40% time</span></div>' +
  '<div class="coach-tip mb-12">' +
    '<div class="coach-avatar" style="font-size:0.9rem">&#x1F9E0;</div>' +
    '<div>' +
      '<div class="coach-name">Why superset?</div>' +
      '<p>Agonist/antagonist supersets maintain strength output while doubling volume and cutting session time. Fat burn increases due to elevated heart rate.</p>' +
    '</div>' +
  '</div>' +
  SUPERSET_PAIRS.map(function(pair) {
    var exA = EXERCISES[pair.a];
    var exB = EXERCISES[pair.b];
    return '<div class="card mb-10">' +
      '<div style="font-size:0.9rem;font-weight:700;margin-bottom:4px">' + pair.name + '</div>' +
      '<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:10px">' + pair.desc + '</div>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">' +
        '<div style="flex:1;background:var(--bg-secondary);border-radius:var(--radius-sm);padding:8px;text-align:center">' +
          '<div style="font-size:0.75rem;font-weight:700;color:var(--accent)">A</div>' +
          '<div style="font-size:0.83rem;font-weight:500">' + (exA ? exA.name : pair.a) + '</div>' +
        '</div>' +
        '<div style="color:var(--text-muted);font-size:1.2rem;font-weight:700">+</div>' +
        '<div style="flex:1;background:var(--bg-secondary);border-radius:var(--radius-sm);padding:8px;text-align:center">' +
          '<div style="font-size:0.75rem;font-weight:700;color:var(--blue)">B</div>' +
          '<div style="font-size:0.83rem;font-weight:500">' + (exB ? exB.name : pair.b) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hack-item" style="margin-bottom:6px">' + icon('zap', 13) + ' ' + pair.benefit + '</div>' +
      '<div style="font-size:0.78rem;color:var(--text-muted)">' + icon('sun', 12) + ' Rest: ' + pair.rest + '</div>' +
    '</div>';
  }).join('');
}

//  TRAINING AGE GUIDE 
function renderTrainingAgeGuide() {
  var sessions = HistoryStore.getSessions();
  var months   = Math.round(sessions.length / 12); // ~3x/week = 12/month estimate

  var stages = [
    { label: 'Beginner', months: '0-6', gains: 'Fastest gains. Every session produces progress. Neurological adaptation.', focus: 'Learn every movement pattern. Volume low. Frequency high.' },
    { label: 'Intermediate', months: '6-24', gains: 'Weekly progress. Progressive overload is the only tool.', focus: 'Add weight every week. Track everything. Sleep is training.' },
    { label: 'Advanced', months: '24-60', gains: 'Monthly progress. Periodization required to avoid stagnation.', focus: 'DUP, conjugate, block periodization. HRV-guided intensity.' },
    { label: 'Elite', months: '60+', gains: 'Annual progress. Marginal gains compound over years.', focus: 'Everything matters. Recovery = nutrition + sleep + massage + HRV.' }
  ];

  var current = months < 6 ? 0 : months < 24 ? 1 : months < 60 ? 2 : 3;

  return '<div class="section-header mt-4"><h3>Training Stage</h3></div>' +
  '<div class="card mb-24">' +
    stages.map(function(s, i) {
      var isActive = i === current;
      return '<div style="padding:10px 0;border-bottom:1px solid var(--border);opacity:' + (isActive ? 1 : 0.5) + '">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<span class="badge ' + (isActive ? 'badge-accent' : 'badge-muted') + '">' + s.label + '</span>' +
          '<span style="font-size:0.75rem;color:var(--text-muted)">' + s.months + ' months</span>' +
          (isActive ? '<span class="badge badge-green" style="font-size:0.62rem">YOU</span>' : '') +
        '</div>' +
        '<div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:3px">' + s.gains + '</div>' +
        '<div style="font-size:0.78rem;color:var(--text-muted)">' + s.focus + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}
