/* Self-test for pure logic: log types, progression, week sync, backup, analytics. ES5. */
(function() {
  var results = [], fails = 0;

  function t(name, fn) {
    try { fn(); results.push('PASS  ' + name); }
    catch (e) { fails++; results.push('FAIL  ' + name + '  ::  ' + e.message); }
  }
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

  reset();
  var summary = (fails ? 'FAILED: ' + fails : 'ALL PASSED') + ' (' + results.filter(function(r) { return r.indexOf('PASS') === 0; }).length + ' passed)';
  document.getElementById('out').textContent = summary + '\n\n' + results.join('\n');
  document.title = fails ? 'FAIL' : 'PASS';
})();
