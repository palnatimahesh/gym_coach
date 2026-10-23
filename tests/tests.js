/* Self-test for pure logic: log types, progression, week sync, backup, analytics. ES5. */
(function() {
  var results = [], fails = 0, pending = [], asyncTests = [];

  /* fn may return a promise (async test) */
  function t(name, fn) {
    function pass() { results.push('PASS  ' + name); }
    function fail(e) { fails++; results.push('FAIL  ' + name + '  ::  ' + (e && e.message ? e.message : e)); }
    try {
      var r = fn();
      if (r && typeof r.then === 'function') pending.push(r.then(pass, fail)); else pass();
    } catch (e) { fail(e); }
  }
  function ta(name, fn) { asyncTests.push({ name: name, fn: fn }); }
  function eq(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error((msg ? msg + ': ' : '') + 'expected ' + JSON.stringify(expected) + ' got ' + JSON.stringify(actual));
    }
  }
  function ok(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

  function reset() {
    try { localStorage.clear(); } catch (e) {}
    Store._mem = {};
    STATE.phase = 2; STATE.weekInPhase = 3; STATE.runningWeek = 1; STATE.lastWorkoutDate = null;
    STATE.completedWorkouts = []; STATE.settings.units = 'kg'; STATE.settings.level = 'experienced';
    STATE.currentPage = 'none';
  }
  function daysAgo(n) {
    var d = new Date(); d.setDate(d.getDate() - n);
    return HistoryStore.localDate(d);
  }
  var sid = 0;
  function seed(date, exId, sets, extra) {
    var s = { id: ++sid, date: date, title: 'T', exercises: [{ id: exId, name: exId, sets: sets }] };
    for (var k in (extra || {})) s[k] = extra[k];
    HistoryStore.saveSession(s);
  }
  function sets(w, reps) {
    return reps.map(function(r) { return { weight: String(w), reps: String(r), done: true }; });
  }

  /* ---------- log types ---------- */
  t('log type: timed vs reps', function() {
    eq(getLogTypeFor('plank', '45s'), 'timed');
    eq(getLogTypeFor('plank', '20'), 'bodyweight');
    eq(getLogTypeFor('mountain_climber', '30s'), 'timed');
    eq(getLogTypeFor('jump_rope', '45s'), 'timed');
  });
  t('log type: per side', function() {
    eq(getLogTypeFor('dead_bug', '10/side'), 'per_side');
    eq(getLogTypeFor('reverse_lunge', '8/side'), 'per_side');
    eq(getLogTypeFor('hip_flexor_stretch', '90s/side'), 'timed_bilateral');
    eq(getLogTypeFor('hip_flexor_stretch', '30s each side'), 'timed_bilateral');
  });
  t('log type: reps variants never become timers', function() {
    ok(['weighted', 'bodyweight'].indexOf(getLogTypeFor('reverse_lunge', '10')) !== -1, 'lunge reps');
    eq(getLogTypeFor('squat', '8-10'), 'weighted');
    eq(getLogTypeFor('squat', 'Work to 1-3RM'), 'weighted');
    eq(getLogTypeFor('squat', ''), 'weighted');
    eq(getLogTypeFor('pullup', '6-8'), 'weighted_bw');
    eq(getLogTypeFor('hanging_leg_raise', '10'), 'bodyweight');
  });
  t('log type: distance', function() {
    eq(getLogTypeFor('farmer_carry', '40m'), 'distance');
  });
  t('parseTimedSecs', function() {
    eq(parseTimedSecs('30s'), 30);
    eq(parseTimedSecs('30-60s'), 30);
    eq(parseTimedSecs('60s/side'), 60);
    eq(parseTimedSecs('2 min'), 120);
    eq(parseTimedSecs('10-12'), 0);
    eq(parseTimedSecs('40m'), 0);
  });
  t('parseRepRange', function() {
    eq(HistoryStore.parseRepRange('10-12'), { lo: 10, hi: 12 });
    eq(HistoryStore.parseRepRange('8/side'), { lo: 8, hi: 8 });
    eq(HistoryStore.parseRepRange('Work to 1-3RM'), { lo: 1, hi: 3 });
  });
  t('rest seconds by prescription', function() {
    ok(getRestSeconds({ id: 'squat', reps: '3-5' }) >= 180, 'heavy');
    ok(getRestSeconds({ id: 'plank', reps: '45s' }) <= 45, 'hold');
    eq(getRestSeconds({ id: 'squat', reps: '8', _rest: 0 }), 0);
    eq(getRestSeconds({ id: 'squat', reps: '8', _rest: 90 }), 90);
  });

  /* ---------- progression engine ---------- */
  t('double progression: add weight at top of range', function() {
    reset(); seed(daysAgo(3), 'squat', sets(100, [10, 10, 10]));
    eq(HistoryStore.getOverloadSuggestion('squat', '8-10').suggestedWeight, 105);
  });
  t('double progression: upper body +2.5', function() {
    reset(); seed(daysAgo(3), 'bench_press', sets(60, [8, 8]));
    eq(HistoryStore.getOverloadSuggestion('bench_press', '6-8').suggestedWeight, 62.5);
  });
  t('double progression: dumbbell +2', function() {
    reset(); seed(daysAgo(3), 'goblet_squat', sets(20, [12, 12, 12]));
    eq(HistoryStore.getOverloadSuggestion('goblet_squat', '10-12').suggestedWeight, 22);
  });
  t('double progression: same weight +1 rep', function() {
    reset(); seed(daysAgo(3), 'squat', sets(100, [8, 8, 9]));
    var o = HistoryStore.getOverloadSuggestion('squat', '8-10');
    eq(o.suggestedWeight, 100); eq(o.suggestedReps, 9);
  });
  t('double progression: miss range drops 5%', function() {
    reset(); seed(daysAgo(3), 'squat', sets(100, [5, 5]));
    eq(HistoryStore.getOverloadSuggestion('squat', '8-10').suggestedWeight, 95);
  });
  t('deload scales last working load', function() {
    reset(); seed(daysAgo(3), 'squat', sets(100, [10, 10]));
    eq(HistoryStore.getOverloadSuggestion('squat', '8-10', { loadPct: 65, deload: true }).suggestedWeight, 65);
  });
  t('reduced sessions are not a baseline', function() {
    reset();
    seed(daysAgo(10), 'squat', sets(100, [10, 10]));
    seed(daysAgo(3), 'squat', sets(65, [10, 10]), { reduced: true });
    eq(HistoryStore.getOverloadSuggestion('squat', '8-10').suggestedWeight, 105);
  });
  t('catch-up doubles the step once low end is reached', function() {
    reset(); seed(daysAgo(3), 'squat', sets(80, [8, 8]));
    eq(HistoryStore.getOverloadSuggestion('squat', '8-10', { catchUp: true, loadPct: 100 }).suggestedWeight, 90);
  });
  t('lbs doubles increments', function() {
    reset(); STATE.settings.units = 'lbs'; seed(daysAgo(3), 'bench_press', sets(100, [8, 8]));
    eq(HistoryStore.getOverloadSuggestion('bench_press', '6-8').suggestedWeight, 105);
  });
  t('timed/bodyweight sets give no overload', function() {
    reset(); seed(daysAgo(3), 'plank', [{ weight: '', reps: '45', done: true }]);
    eq(HistoryStore.getOverloadSuggestion('plank', '45s'), null);
  });

  /* ---------- week models ---------- */
  t('week models: deload placement', function() {
    ok(Progression.getModel(2, 6).deload, 'p2w6');
    ok(!Progression.getModel(2, 5).deload, 'p2w5');
    ok(Progression.getModel(3, 4).deload && Progression.getModel(3, 8).deload, 'p3');
    ok(Progression.getModel(4, 4).deload && Progression.getModel(4, 8).deload && !Progression.getModel(4, 5).deload, 'p4 cycle');
    eq(Progression.getModel(1, 99).label, 'Peak');
    eq(Progression.phaseWeeks(4), null);
    eq(Progression.phaseWeeks(2), 6);
  });
  t('circuit phase rounds and one-off re-entry load', function() {
    reset();
    eq(Progression.getModel(5, 2).rounds, 3); eq(Progression.getModel(5, 3).rounds, 4);
    Store.save('reentry', { week: 2, pct: 85 });
    eq(Progression.getModel(5, 2).loadPct, 85);
    eq(Progression.getModel(5, 3).loadPct, 100);
  });
  t('adjustSets', function() {
    eq(Progression.adjustSets('4', { setsMult: 0.5 }), '2');
    eq(Progression.adjustSets('3', { setsMult: 0.75 }), '2');
    eq(Progression.adjustSets('3', { setsMult: 1 }), '3');
    eq(Progression.adjustSets('2', { setsMult: 0.5 }), '2');
  });
  t('expandCircuit order and rests', function() {
    var out = Progression.expandCircuit([{ id: 'a', reps: '1' }, { id: 'b', reps: '1' }, { id: 'c', reps: '1' }], 2, { restStation: 30, restRound: 90 });
    eq(out.map(function(e) { return e.id + e._round; }), ['a1', 'b1', 'c1', 'a2', 'b2', 'c2']);
    eq(out.map(function(e) { return e._rest; }), [30, 30, 90, 30, 30, 0]);
    eq(out.map(function(e) { return e.sets; }), ['1', '1', '1', '1', '1', '1']);
  });
  t('phase 5 schedule resolves to real exercises', function() {
    var ph = PROGRAMS.phases[5];
    eq(ph.id, 5); eq(ph.schedule.length, 7);
    ph.schedule.forEach(function(s) {
      (s.exercises || []).concat(s.coreFinisher || []).forEach(function(e) { ok(EXERCISES[e.id], 'missing exercise ' + e.id); });
    });
  });
  t('all phases reference real exercises', function() {
    PROGRAMS.phases.forEach(function(ph) {
      ph.schedule.forEach(function(s) {
        (s.exercises || []).concat(s.coreFinisher || []).forEach(function(e) { ok(EXERCISES[e.id], 'phase ' + ph.id + ' missing ' + e.id); });
      });
    });
  });

  /* ---------- week sync ---------- */
  function lastMonday() { return HistoryStore.mondayOf(daysAgo(7)); }
  t('syncWeek advances after a trained week', function() {
    reset(); Store.save('weekAnchor', lastMonday()); seed(lastMonday(), 'squat', sets(100, [8]));
    Progression.syncWeek();
    eq(STATE.weekInPhase, 4); eq(Store.get('weekAnchor'), HistoryStore.mondayOf());
    Progression.syncWeek(); eq(STATE.weekInPhase, 4, 'idempotent');
  });
  t('syncWeek holds position after an empty week', function() {
    reset(); Store.save('weekAnchor', lastMonday());
    Progression.syncWeek();
    eq(STATE.weekInPhase, 3); eq(Store.get('weekAnchor'), HistoryStore.mondayOf());
  });
  t('syncWeek caps at phase length and flags completion', function() {
    reset(); STATE.phase = 1; STATE.weekInPhase = 4; Store.save('weekAnchor', lastMonday()); seed(lastMonday(), 'squat', sets(100, [8]));
    Progression.syncWeek();
    eq(STATE.weekInPhase, 4); eq(Store.get('phaseDone'), true);
  });
  t('syncWeek advances running week only after a logged run', function() {
    reset(); STATE.runningWeek = 2; Store.save('weekAnchor', lastMonday());
    Progression.syncWeek(); eq(STATE.runningWeek, 2, 'no run');
    Store.save('weekAnchor', lastMonday()); Store.save('runLog', [lastMonday()]);
    Progression.syncWeek(); eq(STATE.runningWeek, 3, 'run logged');
  });

  /* ---------- break handling ---------- */
  t('applyBreak (experienced) enters circuit and returns to old phase', function() {
    reset(); STATE.phase = 3; STATE.lastWorkoutDate = '2020-01-01';
    Progression.applyBreak('2_3_months');
    eq(STATE.phase, 5); eq(STATE.weekInPhase, 1);
    eq(Store.get('reentry'), { week: 1, pct: 80 }); eq(Store.get('resumePhase'), 3);
    Progression.finishPhase();
    eq(STATE.phase, 3); eq(STATE.weekInPhase, 1);
  });
  t('applyBreak short break starts late in circuit', function() {
    reset(); STATE.phase = 2; STATE.lastWorkoutDate = '2020-01-01';
    Progression.applyBreak('1_week');
    eq(STATE.phase, 5); eq(STATE.weekInPhase, 4);
  });
  t('applyBreak (beginner) uses beginner phase', function() {
    reset(); STATE.settings.level = 'beginner'; STATE.phase = 2; STATE.lastWorkoutDate = '2020-01-01';
    Progression.applyBreak('1_month');
    eq(STATE.phase, 0); eq(STATE.weekInPhase, 1);
  });
  t('welcome-back banner shows after 8+ days and can be dismissed', function() {
    reset(); STATE.lastWorkoutDate = daysAgo(20);
    ok(Progression.renderBanners().indexOf('Welcome back') !== -1, 'shown');
    Progression.dismissBreak();
    ok(Progression.renderBanners().indexOf('Welcome back') === -1, 'dismissed');
    reset(); STATE.lastWorkoutDate = daysAgo(3);
    ok(Progression.renderBanners().indexOf('Welcome back') === -1, 'not shown for short gap');
  });
  t('readiness and manual deload scale the session', function() {
    reset(); STATE.phase = 2; STATE.weekInPhase = 3;
    var base = Progression.getSessionModel();
    eq(base.setsMult, 1); ok(!base.reduced, 'green not reduced');
    Progression.setReadiness('red');
    var red = Progression.getSessionModel();
    eq(red.setsMult, 0.5); eq(red.loadPct, 80); ok(red.reduced, 'red reduced');
    reset(); Progression.forceDeload();
    ok(Progression.getSessionModel().deload, 'forced deload');
  });

  /* ---------- backup ---------- */
  t('esc', function() {
    eq(esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
    eq(esc(null), ''); eq(esc(0), '0');
  });
  t('backup round-trip', function() {
    reset(); Store.save('foo', { a: 1 });
    var b = buildBackup();
    ok(b.keys['ac_foo'], 'exported');
    Store.rawRemove('ac_foo');
    var r = restoreBackup(JSON.stringify(b));
    ok(r.ok, 'restored'); eq(Store.get('foo'), { a: 1 });
  });
  t('backup rejects junk', function() {
    eq(restoreBackup('not json').ok, false);
    eq(restoreBackup('{"x":1}').ok, false);
    eq(restoreBackup('{"keys":{"evil":"1"}}').ok, false);
  });
  t('backup ignores hostile keys and invalid values', function() {
    reset();
    var r = restoreBackup(JSON.stringify({ keys: { '__proto__': '{"p":1}', 'ac_ok': '{"v":1}', 'ac_bad': 'not json', 'evil': '1' } }));
    ok(r.ok, 'ok'); eq(r.count, 1);
    eq(Store.get('ok'), { v: 1 }); eq(Store.rawGet('ac_bad'), null); eq(Store.rawGet('evil'), null);
    eq(({}).p, undefined, 'prototype untouched');
  });
  t('backup accepts legacy v1 export', function() {
    reset();
    var r = restoreBackup(JSON.stringify({ phase: 2, streak: 3, settings: { units: 'lbs' } }));
    ok(r.ok, 'ok'); eq(Store.get('phase'), 2); eq(Store.get('streak'), 3);
  });
  t('backup rolls back when storage write fails', function() {
    reset(); Store.save('keep', 1);
    var orig = Store.rawSet;
    Store.rawSet = function(k, v) { return k === 'ac_zzz' ? false : orig.call(Store, k, v); };
    var r;
    try { r = restoreBackup(JSON.stringify({ keys: { ac_keep: '2', ac_zzz: '3' } })); }
    finally { Store.rawSet = orig; }
    eq(r.ok, false); eq(Store.get('keep'), 1); eq(Store.rawGet('ac_zzz'), null);
  });

  /* ---------- analytics + rendering helpers ---------- */
  t('strength series (oldest first, e1RM, ignores >12 reps)', function() {
    reset();
    seed(daysAgo(14), 'bench_press', sets(60, [8]).concat([{ weight: '40', reps: '15', done: true }]));
    seed(daysAgo(7), 'bench_press', sets(62.5, [8]));
    seed(daysAgo(1), 'bench_press', sets(65, [6]));
    var s = HistoryStore.getStrengthSeries('bench_press', 20);
    eq(s.map(function(p) { return p.value; }), [76, 79.2, 78]);
    ok(s[0].date < s[2].date, 'order');
    eq(s[0].top, { weight: 60, reps: 8 });
  });
  t('tracked exercises sorted by frequency', function() {
    reset();
    seed(daysAgo(3), 'squat', sets(100, [5])); seed(daysAgo(2), 'squat', sets(100, [5])); seed(daysAgo(1), 'bench_press', sets(60, [5]));
    seed(daysAgo(1), 'plank', [{ weight: '', reps: '45', done: true }]);
    eq(HistoryStore.getTrackedExercises().map(function(x) { return x.id; }), ['squat', 'bench_press']);
  });
  t('weekly volume', function() {
    reset(); seed(daysAgo(0), 'bench_press', sets(60, [8]));
    var v = HistoryStore.getWeeklyVolume(2);
    eq(v.length, 2); eq(v[1].tonnes, 0.5); eq(v[0].tonnes, 0);
  });
  t('charts render without throwing', function() {
    ok(Charts.line([{ label: 'a', value: 5 }]).indexOf('polyline') !== -1, 'single point');
    ok(Charts.line([{ label: 'a', value: 5 }, { label: 'b', value: 5 }]).indexOf('svg') !== -1, 'flat line');
    ok(Charts.bars([{ label: 'a', value: 0 }, { label: 'b', value: 0 }]).indexOf('svg') !== -1, 'zero bars');
    eq(Charts.line([]), '');
  });
  t('setSummary per kind', function() {
    eq(setSummary({ kind: 'timed', reps: '45' }), '45 s');
    eq(setSummary({ kind: 'timed_bilateral', reps: '60' }), '60 s per side');
    eq(setSummary({ kind: 'per_side', weight: '10', reps: '8' }), '10kg x 8 reps per side');
    eq(setSummary({ kind: 'distance', weight: '30', reps: '40' }), '30kg x 40 m');
    eq(setSummary({ kind: 'bodyweight', reps: '12' }), 'BW x 12 reps');
    eq(setSummary({ reps: '<b>' }), 'BW x &lt;b&gt; reps');
  });
  t('circuit rounds merge into one history entry', function() {
    activeWorkout = {
      exercises: [{ id: 'squat', _key: 'squat_0', reps: '8' }, { id: 'bench_press', _key: 'bench_press_1', reps: '8' }, { id: 'squat', _key: 'squat_2', reps: '8' }],
      sets: { squat_0: [{ weight: '100', reps: '8', done: true }], bench_press_1: [{ weight: '60', reps: '8', done: true }], squat_2: [{ weight: '100', reps: '7', done: true }] }
    };
    var m = mergeLoggedExercises();
    eq(m.length, 2); eq(m[0].id, 'squat'); eq(m[0].sets.length, 2); eq(m[0].sets[0].kind, 'weighted');
  });
  t('timed set auto-fills target seconds', function() {
    activeWorkout = { exercises: [{ id: 'plank', _key: 'plank_0', reps: '45s' }], sets: {} };
    var set = { reps: '', done: false };
    autoFillTimed('plank_0', set);
    eq(set.reps, '45');
  });

  /* ---------- readiness / effort / rings ---------- */
  var BEST = { sleep: 4, energy: 2, soreness: 2, stress: 2 };
  var WORST = { sleep: 0, energy: 0, soreness: 0, stress: 0 };
  t('readiness score and validation', function() {
    eq(Readiness.scoreFor(BEST), 100); eq(Readiness.scoreFor(WORST), 21);
    eq(Readiness.scoreFor({ sleep: 1 }), null);
    eq(Readiness.scoreFor({ sleep: 9, energy: 0, soreness: 0, stress: 0 }), null);
    eq(Readiness.scoreFor(null), null);
  });
  t('readiness zones', function() {
    eq(Readiness.zoneOf(33), 'red'); eq(Readiness.zoneOf(34), 'yellow');
    eq(Readiness.zoneOf(66), 'yellow'); eq(Readiness.zoneOf(67), 'green');
  });
  t('check-in drives the training plan and can be redone', function() {
    reset(); STATE.phase = 2; STATE.weekInPhase = 3;
    eq(Readiness.getToday(), null);
    var r = Readiness.saveCheckin(WORST);
    eq(r.zone, 'red');
    eq(Readiness.getToday().score, 21);
    var m = Progression.getSessionModel();
    eq(m.readiness, 'red'); eq(m.setsMult, 0.5); ok(m.reduced, 'reduced');
    Readiness.clearToday();
    eq(Readiness.getToday(), null); eq(Progression.getSessionModel().readiness, 'green');
    eq(Readiness.saveCheckin({ sleep: 1 }), null, 'incomplete not saved');
  });
  t('effort grows with work and stays within 0-21', function() {
    reset(); var d = HistoryStore.localDate();
    eq(Readiness.dayEffort(d), 0);
    seed(d, 'squat', sets(100, [5]), { doneSets: 20, duration: 2700 });
    eq(Readiness.dayEffort(d), 7.6);
    reset(); seed(d, 'squat', sets(100, [5]), { doneSets: 40, duration: 3600 });
    eq(Readiness.dayEffort(d), 11.7);
    reset(); seed(d, 'squat', sets(100, [5]), { doneSets: 5000, duration: 360000 });
    ok(Readiness.dayEffort(d) <= 21, 'capped');
    reset(); Store.save('runLog', [d]);
    eq(Readiness.dayEffort(d), 7.2);
  });
  t('target effort from RPE', function() {
    eq(Readiness.targetEffort('7-8'), { low: 10, high: 12 });
    eq(Readiness.targetEffort('5-6'), { low: 6, high: 8 });
    eq(Readiness.targetEffort('9'), { low: 13, high: 15 });
    eq(Readiness.targetEffort('x'), null);
  });
  t('week consistency', function() {
    reset(); STATE.phase = 2;
    var c0 = Readiness.consistency();
    ok(c0.planned > 0, 'planned'); eq(c0.done, 0);
    STATE.completedWorkouts = [HistoryStore.localDate(), HistoryStore.localDate()];
    var c1 = Readiness.consistency();
    eq(c1.done, 1, 'dedupes dates'); eq(c1.pct, Math.round(100 / c1.planned));
  });
  t('rings clamp and escape', function() {
    var full = Rings.ring({ pct: 150, display: '1', label: 'A' });
    ok(full.indexOf('stroke-dashoffset="0.00"') !== -1, 'clamped high');
    var empty = Rings.ring({ pct: -5, display: '0', label: 'A' });
    ok(empty.indexOf('stroke-dashoffset="0.00"') === -1, 'clamped low');
    ok(Rings.ring({ pct: NaN, display: '0', label: 'A' }).indexOf('NaN') === -1, 'NaN safe');
    ok(Rings.ring({ pct: 5, display: '<b>', label: '<i>' }).indexOf('<b>') === -1, 'escaped');
  });

  /* ---------- health sync (pure parts) ---------- */
  function at(y, mo, d, h, mi) { return new Date(y, mo, d, h, mi || 0).toISOString(); }
  t('unionMinutes merges overlaps (two sources never double count)', function() {
    var H = 3600000;
    eq(Health.unionMinutes([[0, 8 * H], [1 * H, 7 * H]]), 480, 'nested');
    eq(Health.unionMinutes([[0, 4 * H], [3 * H, 8 * H]]), 480, 'overlap');
    eq(Health.unionMinutes([[0, H], [2 * H, 3 * H]]), 120, 'gap');
    eq(Health.unionMinutes([]), 0);
  });
  t('summarize: sleep by wake date, ignores awake, merges sources', function() {
    var s = Health.summarize({ sleep: [
      { startDate: at(2026, 9, 19, 23, 0), endDate: at(2026, 9, 20, 3, 0), sleepState: 'light' },
      { startDate: at(2026, 9, 20, 3, 0), endDate: at(2026, 9, 20, 3, 30), sleepState: 'awake' },
      { startDate: at(2026, 9, 20, 3, 30), endDate: at(2026, 9, 20, 7, 0), sleepState: 'deep' },
      { startDate: at(2026, 9, 19, 23, 0), endDate: at(2026, 9, 20, 7, 0), sleepState: 'sleeping' }
    ] });
    eq(Object.keys(s), ['2026-10-20']);
    eq(s['2026-10-20'].sleepH, 8);
  });
  t('summarize: evening segment belongs to tomorrow', function() {
    var s = Health.summarize({ sleep: [{ startDate: at(2026, 9, 19, 22, 0), endDate: at(2026, 9, 19, 23, 30), sleepState: 'light' }] });
    eq(Object.keys(s), ['2026-10-20']);
    eq(s['2026-10-20'].sleepH, 1.5);
  });
  t('summarize: steps, hrv and rhr per day', function() {
    var s = Health.summarize({
      steps: [{ startDate: at(2026, 9, 20, 0), value: 8123.4 }, { startDate: at(2026, 9, 21, 0), value: 100 }],
      hrv: [{ startDate: at(2026, 9, 20, 5), endDate: at(2026, 9, 20, 5), value: 60 }, { startDate: at(2026, 9, 20, 6), endDate: at(2026, 9, 20, 6), value: 70 }],
      rhr: [{ startDate: at(2026, 9, 20, 6), value: 51 }, { startDate: at(2026, 9, 20, 7), value: 0 }, { startDate: at(2026, 9, 20, 8), value: 'x' }]
    });
    eq(s['2026-10-20'].steps, 8123); eq(s['2026-10-20'].hrv, 65); eq(s['2026-10-20'].rhr, 51);
    eq(s['2026-10-21'], { steps: 100 });
  });
  t('summarize tolerates junk', function() {
    eq(Health.summarize({}), {});
    eq(Health.summarize({ steps: [{ value: 5 }, { startDate: at(2026, 9, 20, 0), value: 'abc' }], sleep: [{ startDate: 'bad', endDate: 'bad' }] }), {});
  });
  t('health merge keeps old fields and caps history', function() {
    var m = Health.merge({ '2026-10-20': { steps: 1, hrv: 50 } }, { '2026-10-20': { steps: 2 }, '2026-10-21': { sleepH: 7 } });
    eq(m['2026-10-20'], { steps: 2, hrv: 50 }); eq(m['2026-10-21'], { sleepH: 7 });
    var big = {}; for (var i = 0; i < 120; i++) big['2026-01-' + (i < 10 ? '0' : '') + i + 'x'] = { steps: i };
    ok(Object.keys(Health.merge(big, {})).length <= 90, 'capped');
  });
  ta('browser: health and backup are inert', function() {
    eq(Native.isNative(), false); eq(Health.available(), false); eq(AutoBackup.enabled(), false);
    return Health.sync(true).then(function(r) { eq(r, null); return AutoBackup.run('x', true); }).then(function(r) { eq(r, false); });
  });

  /* ---------- readiness from health data ---------- */
  function seedHealth(today, baseHrv, baseRhr, todayVals) {
    var H = {};
    for (var i = 1; i <= 10; i++) { H[daysAgo(i)] = { sleepH: 7.5, hrv: baseHrv + (i % 2 ? 1 : -1), rhr: baseRhr }; }
    H[today] = todayVals;
    Store.save('health', H);
  }
  t('readiness from health: sleep only without baseline', function() {
    reset(); Store.save('health', (function() { var h = {}; h[HistoryStore.localDate()] = { sleepH: 7.5 }; return h; })());
    var r = Readiness.getToday();
    eq(r.score, 85); eq(r.source, 'health');
  });
  t('readiness from health: HRV above baseline raises score, below lowers it', function() {
    reset(); var d = HistoryStore.localDate();
    seedHealth(d, 60, 52, { sleepH: 7.5, hrv: 60, rhr: 52 });
    var base = Readiness.getToday().score;
    seedHealth(d, 60, 52, { sleepH: 7.5, hrv: 70, rhr: 52 });
    var hi = Readiness.getToday().score;
    seedHealth(d, 60, 52, { sleepH: 7.5, hrv: 50, rhr: 52 });
    var lo = Readiness.getToday().score;
    ok(hi > base && base > lo && base - lo > 10, 'hi ' + hi + ' base ' + base + ' lo ' + lo);
    seedHealth(d, 60, 52, { sleepH: 7.5, hrv: 60, rhr: 60 });
    ok(Readiness.getToday().score < base, 'elevated resting HR lowers score');
  });
  t('readiness: health leads (70%), check-in adjusts (30%)', function() {
    reset(); var d = HistoryStore.localDate(), h = {}; h[d] = { sleepH: 7.5 }; Store.save('health', h);
    Readiness.saveCheckin(BEST);
    var r = Readiness.getToday();
    eq(r.source, 'blend'); eq(r.score, 90);
    ok(Progression.getSessionModel().readiness === 'green', 'green zone');
  });
  t('poor sleep from health reduces tomorrow training load automatically', function() {
    reset(); var d = HistoryStore.localDate(), h = {}; h[d] = { sleepH: 4 }; Store.save('health', h);
    var m = Progression.getSessionModel();
    eq(m.readiness, 'red'); ok(m.reduced, 'reduced');
  });

  /* ---------- automatic backup (fake Filesystem plugin) ---------- */
  function fakeNative() {
    var files = {};
    window.Capacitor = {
      isNativePlatform: function() { return true; },
      Plugins: { Filesystem: {
        writeFile: function(o) { files[o.directory + '/' + o.path] = o.data; return Promise.resolve({}); },
        readFile: function(o) { var k = o.directory + '/' + o.path; return k in files ? Promise.resolve({ data: files[k] }) : Promise.reject(new Error('nf')); },
        deleteFile: function(o) { delete files[o.directory + '/' + o.path]; return Promise.resolve(); },
        readdir: function(o) {
          var pre = o.directory + '/' + o.path + '/';
          return Promise.resolve({ files: Object.keys(files).filter(function(k) { return k.indexOf(pre) === 0; }).map(function(k) { return { name: k.slice(pre.length) }; }) });
        }
      } }
    };
    return files;
  }
  ta('auto backup writes a daily file, prunes to 7, restores', function() {
    reset(); var files = fakeNative();
    Store.save('foo', { a: 1 });
    var d = HistoryStore.localDate();
    for (var i = 1; i <= 9; i++) files['DOCUMENTS/AthleticCoach/backup-2026-01-0' + i + '.json'] = '{}';
    files['DOCUMENTS/AthleticCoach/notes.txt'] = 'keep me';
    return AutoBackup.run('test', true).then(function(wrote) {
      ok(wrote, 'wrote');
      ok(('DOCUMENTS/AthleticCoach/backup-' + d + '.json') in files, 'today file');
      var names = Object.keys(files).filter(function(k) { return /backup-\d{4}-\d{2}-\d{2}\.json$/.test(k); });
      eq(names.length, 7, 'pruned to 7');
      ok('DOCUMENTS/AthleticCoach/notes.txt' in files, 'foreign files untouched');
      eq(Store.get('backupmeta').date, d);
      return AutoBackup.run('again', false);
    }).then(function(again) {
      eq(again, false, 'not repeated the same day');
      Store.rawRemove('ac_foo');
      return AutoBackup.restore('backup-' + d + '.json', 'DOCUMENTS');
    }).then(function(res) {
      ok(res.ok, 'restore ok'); eq(Store.get('foo'), { a: 1 });
      return AutoBackup.restore('../evil.json', 'DOCUMENTS');
    }).then(function(bad) {
      eq(bad.ok, false, 'path traversal rejected');
    }).then(function() { delete window.Capacitor; }, function(e) { delete window.Capacitor; throw e; });
  });
  ta('auto backup falls back to private storage and reports failures', function() {
    reset(); var files = fakeNative();
    var P = window.Capacitor.Plugins.Filesystem, orig = P.writeFile;
    P.writeFile = function(o) { return o.directory === 'DOCUMENTS' ? Promise.reject(new Error('denied')) : orig(o); };
    return AutoBackup.run('t', true).then(function(ok1) {
      ok(ok1, 'fallback worked'); eq(Store.get('backupmeta').where, 'DATA');
      P.writeFile = function() { return Promise.reject(new Error('disk full')); };
      return AutoBackup.run('t', true);
    }).then(function(ok2) {
      eq(ok2, false); ok(Store.get('backupmeta').error.indexOf('disk full') !== -1, 'error recorded');
    }).then(function() { delete window.Capacitor; }, function(e) { delete window.Capacitor; throw e; });
  });
  t('store write hook fires', function() {
    var seen = [];
    Store.onWrite = function(k) { seen.push(k); };
    Store.save('hook', 1);
    Store.onWrite = null;
    ok(seen.indexOf('ac_hook') !== -1, 'hook');
  });

  /* ---------- reminders, session saving, trends ---------- */
  t('reminder plan', function() {
    eq(Notify.plan({ train: { on: false, time: '17:30' }, water: { on: false } }), []);
    var p = Notify.plan({ train: { on: true, time: '07:05' }, water: { on: false } });
    eq(p.length, 1); eq(p[0].schedule.on, { hour: 7, minute: 5 });
    eq(Notify.plan({ train: { on: true, time: '25:00' }, water: { on: false } }), [], 'invalid hour');
    eq(Notify.plan({ train: { on: true, time: 'abc' }, water: { on: false } }), [], 'garbage');
    var both = Notify.plan({ train: { on: true, time: '18:00' }, water: { on: true } });
    eq(both.length, 7);
    var ids = both.map(function(n) { return n.id; });
    eq(ids.length, ids.filter(function(v, i) { return ids.indexOf(v) === i; }).length, 'unique ids');
  });
  t('reminders default off and persist', function() {
    reset();
    eq(Notify.get().train.on, false);
    Store.save('reminders', { train: { on: true, time: '06:30' }, water: { on: true } });
    eq(Notify.get().train.time, '06:30'); eq(Notify.get().water.on, true);
  });
  t('logSession saves partial work, note can be added later, empty can be deleted', function() {
    reset();
    activeWorkout = {
      startTime: Date.now() - 90000, title: 'Test', model: { reduced: false }, rpe: {},
      exercises: [{ id: 'squat', _key: 'squat_0', reps: '8' }],
      sets: { squat_0: [{ weight: '100', reps: '8', done: true }, { weight: '100', reps: '8', done: false }] }
    };
    var res = logSession();
    eq(res.doneCount, 1); eq(res.totalSets, 2); ok(res.duration >= 89, 'duration');
    var saved = HistoryStore.getSessions()[0];
    eq(saved.doneSets, 1); eq(saved.title, 'Test');
    saveSessionNote('felt good');
    eq(HistoryStore.getSessions()[0].note, 'felt good');
    eq(HistoryStore.updateSessionNote(-1, 'x'), false);
    ok(HistoryStore.deleteSession(res.id), 'deleted'); eq(HistoryStore.getSessions().length, 0);
    eq(HistoryStore.deleteSession(res.id), false);
  });
  t('readiness series covers n days oldest first', function() {
    reset(); var d = HistoryStore.localDate();
    var h = {}; h[d] = { sleepH: 7.5, steps: 5000 }; Store.save('health', h);
    var s = Readiness.series(14);
    eq(s.length, 14); eq(s[13].date, d); ok(s[0].date < s[13].date, 'order');
    eq(s[13].score, 85); eq(s[13].sleepH, 7.5); eq(s[13].steps, 5000); eq(s[0].score, null);
  });
  t('trend section renders for empty and populated data', function() {
    reset();
    ok(renderReadinessTrends().indexOf('check-in') !== -1, 'empty hint');
    var d = HistoryStore.localDate(), h = {};
    h[d] = { sleepH: 7, steps: 4000 }; h[daysAgo(1)] = { sleepH: 6.5, steps: 8000 };
    Store.save('health', h);
    var html = renderReadinessTrends();
    ok(html.indexOf('Readiness') !== -1 && html.indexOf('Sleep') !== -1 && html.indexOf('Steps') !== -1, 'sections');
  });

  /* ---------- food log + health display ---------- */
  t('food validation', function() {
    ok(FoodLog.validate({ name: '', kcal: 100 }).error, 'name required');
    ok(FoodLog.validate({ name: 'x' }).error, 'needs numbers');
    ok(FoodLog.validate({ name: 'x', kcal: -5 }).error, 'negative');
    ok(FoodLog.validate({ name: 'x', kcal: 9999 }).error, 'too big');
    ok(FoodLog.validate({ name: 'x', kcal: 'abc' }).error, 'not a number');
    eq(FoodLog.validate({ name: 'Rice', p: 10, c: 50, f: 5 }).entry.kcal, 285, 'kcal from macros');
    eq(FoodLog.validate({ name: 'Rice', kcal: 300 }).entry.kcal, 300);
    eq(FoodLog.validate({ name: new Array(80).join('a'), kcal: 1 }).entry.name.length, 40, 'name capped');
  });
  t('food log totals, remove and recent', function() {
    reset();
    FoodLog.add({ name: 'Eggs', kcal: 300, p: 24, c: 2, f: 20 });
    var added = FoodLog.add({ name: 'Rice', kcal: 400, p: 8, c: 85, f: 1 });
    eq(FoodLog.totals(), { kcal: 700, p: 32, c: 87, f: 21 });
    eq(FoodLog.entries().length, 2);
    ok(FoodLog.remove(added.entry.id), 'removed'); eq(FoodLog.totals().kcal, 300);
    eq(FoodLog.remove(12345), false);
    FoodLog.add({ name: 'eggs', kcal: 150 });
    eq(FoodLog.recent().length, 1, 'recent is distinct by name');
    eq(FoodLog.recent()[0].kcal, 150, 'newest first');
  });
  t('food log keeps 60 days', function() {
    reset();
    for (var i = 0; i < 70; i++) FoodLog.add({ name: 'f', kcal: 1 }, daysAgo(i));
    ok(Object.keys(Store.get('meals')).length <= 60, 'capped');
  });
  t('nutrition tabs render with logged food', function() {
    reset(); var host = document.createElement('div'); host.id = 'nutrition-content'; document.body.appendChild(host);
    FoodLog.add({ name: '<b>Oats</b>', kcal: 350, p: 12, c: 60, f: 6 });
    ['today', 'plan', 'meals', 'extras'].forEach(function(tab) {
      setNutritionTab(tab);
      ok(host.innerHTML.length > 500, tab + ' renders');
      eq(host.querySelectorAll('.subtab.active').length, 1, tab + ' active tab');
    });
    setNutritionTab('today');
    ok(host.innerHTML.indexOf('&lt;b&gt;Oats') !== -1 && host.innerHTML.indexOf('<b>Oats') === -1, 'name escaped');
    ok(host.querySelectorAll('.ring-arc').length === 2, 'two rings');
    document.body.removeChild(host);
  });
  t('health latest falls back to the newest day that has the value', function() {
    reset(); var h = {};
    h[daysAgo(2)] = { hrv: 55, steps: 9000 }; h[daysAgo(1)] = { hrv: 61 }; h[HistoryStore.localDate()] = { sleepH: 7 };
    Store.save('health', h);
    eq(Health.latest('hrv').value, 61); eq(Health.latest('hrv').date, daysAgo(1));
    eq(Health.latest('steps').value, 9000); eq(Health.latest('sleepH').value, 7);
    eq(Health.latest('rhr'), null);
    eq(Health.ageLabel(HistoryStore.localDate()), 'today'); eq(Health.ageLabel(daysAgo(1)), 'yesterday');
  });
  t('overnight HRV and resting HR belong to the wake-up day', function() {
    var s = Health.summarize({ hrv: [{ startDate: at(2026, 9, 19, 23, 30), endDate: at(2026, 9, 19, 23, 30), value: 60 }], rhr: [{ startDate: at(2026, 9, 20, 14, 0), value: 50 }] });
    eq(s['2026-10-20'].hrv, 60); eq(s['2026-10-20'].rhr, 50); eq(Object.keys(s).length, 1);
  });

  /* ---------- plan editor, media, onboarding, food search ---------- */
  t('plan editor: save, validate, apply, reset', function() {
    reset(); Plan.apply();
    var day = -1;
    PROGRAMS.phases[1].schedule.forEach(function(s, i) { if (day < 0 && s.exercises && s.exercises.length > 2) day = i; });
    ok(day >= 0, 'a lifting day exists');
    var orig = JSON.parse(JSON.stringify(PROGRAMS.phases[1].schedule[day].exercises));
    var main = orig.slice(0, 2).map(function(e) { return { id: e.id, sets: 5, reps: '5' }; });
    ok(Plan.save(1, day, main, []).ok, 'saved');
    eq(PROGRAMS.phases[1].schedule[day].exercises.length, 2); eq(PROGRAMS.phases[1].schedule[day].exercises[0].sets, 5);
    ok(Plan.isEdited(1, day), 'edited flag');
    ok(Plan.save(1, day, [{ id: 'nope', sets: 3, reps: '8' }], []).error, 'unknown exercise rejected');
    ok(Plan.save(1, day, [{ id: main[0].id, sets: 99, reps: '8' }], []).error, 'bad sets rejected');
    eq(PROGRAMS.phases[1].schedule[day].exercises.length, 2, 'failed saves change nothing');
    eq(Plan.cleanRow({ id: main[0].id, sets: '3', reps: '<script>8' }).reps, 'script8', 'reps sanitised');
    Plan.reset(1, day);
    eq(PROGRAMS.phases[1].schedule[day].exercises, orig); eq(Plan.isEdited(1, day), false);
    reset(); Plan.apply();
  });
  t('plan edits survive an apply() and a backup restore', function() {
    reset(); Plan.apply();
    var day = -1;
    PROGRAMS.phases[2].schedule.forEach(function(s, i) { if (day < 0 && s.exercises && s.exercises.length > 1) day = i; });
    var first = PROGRAMS.phases[2].schedule[day].exercises[0];
    Plan.save(2, day, [{ id: first.id, sets: 4, reps: '6' }], []);
    var b = buildBackup();
    Plan.reset(2, day);
    eq(PROGRAMS.phases[2].schedule[day].exercises.length > 1, true);
    ok(restoreBackup(JSON.stringify(b)).ok, 'restore');
    eq(PROGRAMS.phases[2].schedule[day].exercises.length, 1, 'edit re-applied');
    reset(); Plan.apply();
  });
  t('exercise media', function() {
    var f = ExerciseMedia.frames('squat');
    eq(f.length, 2); ok(/0\.jpg$/.test(f[0]) && /1\.jpg$/.test(f[1]), 'frames');
    ok(ExerciseMedia.videoUrl('overhead_press').indexOf('youtube.com/results') !== -1, 'youtube');
    ok(ExerciseMedia.videoUrl('overhead_press').indexOf('OHP') === -1, 'brackets stripped');
    Object.keys(EXERCISE_MEDIA.map).forEach(function(id) { ok(EXERCISES[id], 'media for unknown exercise ' + id); });
    ok(ExerciseMedia.block('squat').indexOf('Watch form video') !== -1, 'button');
    ok(ExerciseMedia.block('wall_sit').indexOf('ex-media') === -1, 'no image when unmapped');
  });
  t('onboarding sets level, goal, body, mode and starting phase', function() {
    reset(); STATE.phase = 0; STATE.completedWorkouts = [];
    ok(Onboarding.needed(), 'needed on a fresh install');
    Onboarding.start();
    ok(document.getElementById('onb-modal'), 'overlay');
    Onboarding.pick('level', 'experienced'); Onboarding.next();
    Onboarding.pick('goal', 'cut'); Onboarding.next();
    document.getElementById('onb-weight').value = '82'; document.getElementById('onb-height').value = '178'; document.getElementById('onb-age').value = '30';
    Onboarding.next();
    Onboarding.pick('mode', 'home'); Onboarding.next();
    eq(STATE.phase, 2); eq(STATE.weekInPhase, 1);
    eq(STATE.settings.level, 'experienced'); eq(STATE.settings.nutritionGoal, 'cut');
    eq(STATE.settings.bodyWeight, 82); eq(STATE.mode, 'home');
    Onboarding.next();
    eq(Store.get('onboarded'), true); eq(document.getElementById('onb-modal'), null);
    STATE.mode = 'gym';
  });
  t('onboarding rejects bad stats and never interrupts existing users', function() {
    reset(); STATE.phase = 0; Onboarding.start(); Onboarding.next(); Onboarding.next();
    document.getElementById('onb-weight').value = '5'; Onboarding.next();
    ok(document.getElementById('onb-weight'), 'stays on the body step');
    Onboarding.skip();
    reset(); STATE.phase = 3;
    eq(Onboarding.needed(), false); eq(Store.get('onboarded'), true);
    reset(); STATE.phase = 0; seed(daysAgo(1), 'squat', sets(100, [5]));
    eq(Onboarding.needed(), false, 'has history');
  });
  t('food search: normalize and scale', function() {
    var p = FoodSearch.normalize({ product_name: ' Oats ', brands: 'A, B', serving_quantity: '40', nutriments: { 'energy-kcal_100g': 370, proteins_100g: 13, carbohydrates_100g: 60, fat_100g: 7 } });
    eq(p.name, 'Oats'); eq(p.brand, 'A'); eq(p.servingG, 40); eq(p.kcal, 370);
    eq(FoodSearch.normalize({ product_name: 'KJ only', nutriments: { energy_100g: 418.4 } }).kcal, 100, 'kJ converted');
    eq(FoodSearch.normalize({ product_name: 'Macros', nutriments: { proteins_100g: 10, carbohydrates_100g: 10, fat_100g: 10 } }).kcal, 170, 'kcal from macros');
    eq(FoodSearch.normalize({ product_name: '', nutriments: { proteins_100g: 1 } }), null, 'no name');
    eq(FoodSearch.normalize({ product_name: 'x', nutriments: {} }), null, 'no data');
    eq(FoodSearch.normalize(null), null);
    eq(FoodSearch.scale({ kcal: 370, p: 13, c: 60, f: 7 }, 50), { kcal: 185, p: 6.5, c: 30, f: 3.5 });
  });
  ta('food search: query, barcode and error handling (stubbed network)', function() {
    var real = FoodSearch.getJson, lastUrl = '';
    function restore() { FoodSearch.getJson = real; }
    FoodSearch.getJson = function(url) {
      lastUrl = url;
      if (url.indexOf('/api/v2/product/') !== -1) return Promise.resolve(url.indexOf('111111') !== -1 ? { status: 1, product: { product_name: 'Bar', nutriments: { 'energy-kcal_100g': 400 } } } : { status: 0 });
      return Promise.resolve({ products: [{ product_name: 'Oats <b>', nutriments: { 'energy-kcal_100g': 370 } }, { product_name: '', nutriments: {} }, { product_name: 'Empty' }] });
    };
    return FoodSearch.search('rolled oats').then(function(list) {
      eq(list.length, 1, 'unusable products dropped'); eq(list[0].name, 'Oats <b>');
      ok(lastUrl.indexOf('search_terms=rolled%20oats') !== -1, 'query encoded');
      var host = document.createElement('div'); host.id = 'food-results'; document.body.appendChild(host);
      FoodSearch.setResults(list);
      ok(host.innerHTML.indexOf('&lt;b&gt;') !== -1 && host.innerHTML.indexOf('<b>') === -1, 'external name escaped');
      document.body.removeChild(host);
      return FoodSearch.search('a').then(function() { throw new Error('short query accepted'); }, function() {});
    }).then(function() {
      return FoodSearch.byBarcode('111111').then(function(p) { eq(p.name, 'Bar'); });
    }).then(function() {
      return FoodSearch.byBarcode('999999').then(function() { throw new Error('missing product accepted'); }, function(e) { ok(/not found/i.test(e.message), 'not found message'); });
    }).then(function() {
      return FoodSearch.byBarcode('12ab').then(function() { throw new Error('bad barcode accepted'); }, function() {});
    }).then(restore, function(e) { restore(); throw e; });
  });
  t('weekly backup reminder plan', function() {
    var p = Notify.plan({ train: { on: false, time: '17:30' }, water: { on: false }, backup: { on: true } });
    eq(p.length, 1); eq(p[0].schedule.on.weekday, 1);
  });

  /* ---------- navigation ---------- */
  t('every page belongs to exactly one section', function() {
    PAGES.forEach(function(p) {
      var owners = Object.keys(SECTIONS).filter(function(k) { return SECTIONS[k].pages.indexOf(p) !== -1; });
      eq(owners.length, 1, p + ' owners');
    });
    Object.keys(SECTIONS).forEach(function(k) {
      SECTIONS[k].pages.forEach(function(p) { ok(PAGES.indexOf(p) !== -1, k + ' lists unknown page ' + p); });
      if (SECTIONS[k].pages.length > 1) SECTIONS[k].pages.forEach(function(p) { ok(SECTIONS[k].names[p], 'no label for ' + p); });
    });
    eq(Object.keys(SECTIONS).length, 5, 'five bottom tabs');
  });
  t('sub-tab bar renders per section', function() {
    var host = document.createElement('div'); host.id = 'subtabs'; document.body.appendChild(host);
    renderSubtabs('workout');
    eq(host.querySelectorAll('.subtab').length, 4); ok(host.querySelector('.subtab.active').textContent === 'Workout', 'active');
    renderSubtabs('dashboard');
    eq(host.style.display, 'none');
    document.body.removeChild(host);
  });
  t('version constant is defined', function() { ok(/^\d{4}-\d{2}-\d{2}\.\d+$/.test(APP_VERSION), APP_VERSION); });

  /* ---------- storage fallback (last: touches window.localStorage) ---------- */
  t('store falls back to memory when localStorage is blocked', function() {
    reset();
    var desc = Object.getOwnPropertyDescriptor(window, 'localStorage');
    if (!desc || !desc.configurable) { results.push('SKIP  (localStorage not overridable here)'); return; }
    var wasWarned = Store._warned; Store._warned = true; // suppress toast
    Object.defineProperty(window, 'localStorage', { configurable: true, get: function() { throw new Error('blocked'); } });
    try {
      eq(Store.rawSet('ac_t', '1'), false);
      eq(Store.rawGet('ac_t'), '1');
      ok(Store.keys().indexOf('ac_t') !== -1, 'listed');
    } finally {
      Object.defineProperty(window, 'localStorage', desc);
      Store._warned = wasWarned;
    }
  });

  /* async tests run one after another, after every sync test (shared storage) */
  var chain = Promise.resolve();
  asyncTests.forEach(function(a) { chain = chain.then(function() { return a.fn(); }).then(function() { results.push("PASS  " + a.name); }, function(e) { fails++; results.push("FAIL  " + a.name + "  ::  " + (e && e.message ? e.message : e)); }); });
  chain.then(function() {
    reset();
    var summary = (fails ? 'FAILED: ' + fails : 'ALL PASSED') + ' (' + results.filter(function(r) { return r.indexOf('PASS') === 0; }).length + ' passed)';
    document.getElementById('out').textContent = summary + '\n\n' + results.join('\n');
    document.title = fails ? 'FAIL' : 'PASS';
  });
})();
