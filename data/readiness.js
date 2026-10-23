/* --- READINESS / EFFORT / CONSISTENCY --- ES5 ---
   Readiness: 0-100 from a 4-tap morning check-in (later: wearable data feeds the same shape).
   Effort:    0-21 daily load from logged sessions (sets, duration, RPE) - same scale idea as WHOOP strain.
   Week:      sessions done vs planned training days.
   Depends on: STATE, Store, HistoryStore, Progression, PROGRAMS (resolved at call time). */

var Readiness = (function() {

  /* Each option: [label, score]. Weights sum to 100. */
  var QUESTIONS = [
    { id: 'sleep',    label: 'Sleep last night', weight: 40, opts: [['<5h', 15], ['5-6h', 40], ['6-7h', 65], ['7-8h', 85], ['8h+', 100]] },
    { id: 'energy',   label: 'Energy',           weight: 25, opts: [['Low', 25], ['OK', 65], ['High', 100]] },
    { id: 'soreness', label: 'Soreness',         weight: 20, opts: [['Heavy', 25], ['Mild', 65], ['None', 100]] },
    { id: 'stress',   label: 'Stress',           weight: 15, opts: [['High', 25], ['Medium', 65], ['Low', 100]] }
  ];

  var ZONES = {
    red:    { label: 'Low',      color: 'var(--rec-red)' },
    yellow: { label: 'Moderate', color: 'var(--rec-yellow)' },
    green:  { label: 'Ready',    color: 'var(--rec-green)' }
  };

  function today() { return HistoryStore.localDate(); }

  function zoneOf(score) { return score < 34 ? 'red' : (score < 67 ? 'yellow' : 'green'); }

  /* answers: { sleep: idx, ... } -> score or null if incomplete/invalid */
  function scoreFor(answers) {
    var total = 0;
    for (var i = 0; i < QUESTIONS.length; i++) {
      var q = QUESTIONS[i], idx = answers ? answers[q.id] : undefined;
      if (typeof idx !== 'number' || idx < 0 || idx >= q.opts.length) return null;
      total += q.weight * q.opts[idx][1];
    }
    return Math.round(total / 100);
  }

  function getCheckins() { return Store.get('checkins', {}); }

  function saveCheckin(answers) {
    var score = scoreFor(answers);
    if (score === null) return null;
    var all = getCheckins();
    var clean = {};
    QUESTIONS.forEach(function(q) { clean[q.id] = answers[q.id]; });
    all[today()] = { answers: clean, score: score };
    var keys = Object.keys(all).sort();
    while (keys.length > 60) delete all[keys.shift()];
    Store.save('checkins', all);
    return { score: score, zone: zoneOf(score) };
  }

  function clearToday() {
    var all = getCheckins();
    delete all[today()];
    Store.save('checkins', all);
    Store.save('readiness', null);
  }

  /* ---- Wearable-derived readiness (Health Connect data in Store 'health') ---- */
  function clamp100(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  function sleepScore(h) { return h < 5 ? 15 : (h < 6 ? 40 : (h < 7 ? 65 : (h < 8 ? 85 : 100))); }

  function dateMinus(dateStr, days) {
    var p = dateStr.split('-');
    return HistoryStore.localDate(new Date(+p[0], +p[1] - 1, +p[2] - days));
  }

  /* mean / sd of a field over the 28 days before dateStr (needs >= 5 days) */
  function baseline(H, dateStr, field) {
    var from = dateMinus(dateStr, 28), vals = [];
    Object.keys(H).forEach(function(k) {
      if (k >= from && k < dateStr && typeof H[k][field] === 'number') vals.push(H[k][field]);
    });
    if (vals.length < 5) return null;
    var mean = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
    var sd = Math.sqrt(vals.reduce(function(a, b) { return a + (b - mean) * (b - mean); }, 0) / vals.length);
    return { mean: mean, sd: sd };
  }

  /* Sleep 40 / HRV 40 / resting HR 20, renormalised over what is available. Needs last night's sleep. */
  function fromHealth(dateStr) {
    var H = Store.get('health', {});
    var d = H[dateStr];
    if (!d || typeof d.sleepH !== 'number') return null;
    var parts = { sleep: sleepScore(d.sleepH) };
    var weights = { sleep: 40 };
    if (typeof d.hrv === 'number') {
      var bh = baseline(H, dateStr, 'hrv');
      if (bh) { parts.hrv = clamp100(50 + 25 * (d.hrv - bh.mean) / Math.max(bh.sd, 0.1 * bh.mean)); weights.hrv = 40; }
    }
    if (typeof d.rhr === 'number') {
      var br = baseline(H, dateStr, 'rhr');
      if (br) { parts.rhr = clamp100(50 - 25 * (d.rhr - br.mean) / Math.max(br.sd, 2)); weights.rhr = 20; }
    }
    var num = 0, den = 0;
    Object.keys(parts).forEach(function(k) { num += parts[k] * weights[k]; den += weights[k]; });
    return { score: Math.round(num / den), parts: parts };
  }

  /* { score, zone, label, color, source: 'health'|'checkin'|'blend', health, checkin } or null.
     With both sources, objective data leads (70%) and how you feel adjusts it (30%). */
  function getToday() {
    var hl = fromHealth(today());
    var c = getCheckins()[today()];
    var cs = (c && typeof c.score === 'number') ? c.score : null;
    if (!hl && cs === null) return null;
    var score, source;
    if (hl && cs !== null) { score = Math.round((7 * hl.score + 3 * cs) / 10); source = 'blend'; }
    else if (hl) { score = hl.score; source = 'health'; }
    else { score = cs; source = 'checkin'; }
    var z = zoneOf(score);
    return { score: score, zone: z, label: ZONES[z].label, color: ZONES[z].color, source: source, health: hl, checkin: cs };
  }

  /* ---- EFFORT (0-21) ---- */
  var RUN_POINTS = 25;

  function sessionPoints(s) {
    var sets = typeof s.doneSets === 'number' ? s.doneSets : 0;
    var mins = (s.duration || 0) / 60;
    var rpes = [];
    if (s.rpe) Object.keys(s.rpe).forEach(function(k) { var v = parseFloat(s.rpe[k]); if (v > 0 && v <= 10) rpes.push(v); });
    var avg = rpes.length ? rpes.reduce(function(a, b) { return a + b; }, 0) / rpes.length : 7;
    var factor = Math.max(0.7, Math.min(1.3, avg / 7));
    return (sets + mins * 0.15) * factor;
  }

  function dayEffort(dateStr) {
    var pts = 0;
    HistoryStore.getSessions().forEach(function(s) { if (s.date === dateStr) pts += sessionPoints(s); });
    if (Store.get('runLog', []).indexOf(dateStr) !== -1) pts += RUN_POINTS;
    if (pts <= 0) return 0;
    return Math.round(21 * (1 - Math.exp(-pts / 60)) * 10) / 10;
  }

  /* "7-8" -> { low: 10, high: 12 }; null when unparsable */
  function targetEffort(rpeStr) {
    var nums = String(rpeStr || '').match(/\d+(\.\d+)?/g);
    if (!nums) return null;
    var avg = nums.reduce(function(a, b) { return a + parseFloat(b); }, 0) / nums.length;
    var low = Math.max(4, Math.round(2 * avg - 5));
    return { low: low, high: low + 2 };
  }

  /* ---- WEEK CONSISTENCY ---- */
  function consistency() {
    var phase = PROGRAMS.phases[STATE.phase];
    var planned = 0;
    if (phase && phase.schedule) {
      planned = phase.schedule.filter(function(s) { return !s.rest && !s.walk && !s.massage; }).length;
    }
    var mon = HistoryStore.mondayOf(), now = today(), seen = {}, done = 0;
    (STATE.completedWorkouts || []).forEach(function(d) {
      if (d >= mon && d <= now && !seen[d]) { seen[d] = true; done++; }
    });
    return { done: done, planned: planned, pct: planned ? Math.min(100, Math.round(done / planned * 100)) : 0 };
  }

  /* One plain-language line for the Home screen */
  function coachLine() {
    var r = getToday();
    if (!r) return 'Do the 10-second check-in so today\'s plan can adapt to how you feel.';
    var model = Progression.getSessionModel();
    var t = targetEffort(model.rpe);
    var goal = t ? ' Aim for effort ' + t.low + '-' + t.high + '.' : '';
    var deload = model.deload ? ' Deload week: keep it light.' : '';
    if (r.zone === 'green')  return 'Ready to train. Follow the plan.' + goal + deload;
    if (r.zone === 'yellow') return 'Take it a little easier today: about a quarter fewer sets and lighter loads.' + deload;
    return 'Recovery is low. Half the sets and lighter loads, or swap for a walk and mobility.' + deload;
  }

  return {
    QUESTIONS: QUESTIONS,
    ZONES: ZONES,
    zoneOf: zoneOf,
    scoreFor: scoreFor,
    saveCheckin: saveCheckin,
    clearToday: clearToday,
    getToday: getToday,
    fromHealth: fromHealth,
    dayEffort: dayEffort,
    targetEffort: targetEffort,
    consistency: consistency,
    coachLine: coachLine
  };
})();
