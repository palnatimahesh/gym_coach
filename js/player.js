/* GUIDED SESSION PLAYER - ES5
   Runs a whole day as one flow: targeted warm-up -> every set of every exercise (big timer / stepper UI,
   automatic rest, automatic next set or exercise) -> targeted cooldown -> session saved.
   It drives the normal activeWorkout state, so everything is logged exactly as in the manual logger. */

var Player = (function() {

  var P = { active: false, resting: false, steps: [], idx: 0, restTimer: null, restEnd: 0, restTotal: 0, session: null };

  function $(id) { return document.getElementById(id); }

  function overlay() {
    var o = $('player-overlay');
    if (!o) {
      o = document.createElement('div');
      o.id = 'player-overlay';
      o.className = 'guided-overlay';
      document.body.appendChild(o);
    }
    o.classList.remove('hidden');
    return o;
  }

  function closeOverlay() {
    var o = $('player-overlay');
    if (o && o.parentNode) o.parentNode.removeChild(o);
  }

  function keyOf(ex, i) { return ex._key || (ex.id + '_' + i); }

  /* Every (exercise, set) in performing order */
  function buildSteps() {
    var out = [];
    activeWorkout.exercises.forEach(function(ex, i) {
      var sets = activeWorkout.sets[keyOf(ex, i)] || [];
      for (var s = 0; s < sets.length; s++) out.push({ exIdx: i, setIdx: s });
    });
    return out;
  }

  function isLoadable(kind, exId) {
    if (kind === 'weighted' || kind === 'weighted_bw' || kind === 'distance') return true;
    return kind === 'per_side' && !REPS_ONLY_EQUIPMENT[(EXERCISES[exId] || {}).equipment];
  }

  /* Fill the set with something sensible so the common case is a single tap */
  function prefill(ex, setIdx, set, kind) {
    var key = keyOf(ex, P.steps[P.idx].exIdx);
    var prev = setIdx > 0 ? activeWorkout.sets[key][setIdx - 1] : null;
    var tip = null;
    if (set.weight || set.reps) return tip;
    if (prev && prev.done) { set.weight = prev.weight; set.reps = prev.reps; return tip; }
    var o = isLoadable(kind, ex.id) ? HistoryStore.getOverloadSuggestion(ex.id, ex.reps, activeWorkout.model) : null;
    if (o) {
      if (o.suggestedWeight) set.weight = String(o.suggestedWeight);
      if (o.suggestedReps) set.reps = String(o.suggestedReps);
      tip = o.tip;
    }
    if (!set.reps && !isTimedKind(kind)) set.reps = String(HistoryStore.parseRepRange(ex.reps).lo);
    return tip;
  }

  function header(label, pct) {
    return '<div class="guided-header"><div><div class="routine-name">' + esc(P.session ? P.session.focus : 'Session') + '</div>' +
      '<div class="step-label">' + label + '</div></div>' +
      '<button class="btn btn-ghost btn-sm" onclick="Player.exit()" aria-label="Leave guided session">' + icon('close', 16) + '</button></div>' +
      '<div class="guided-progress"><div class="guided-progress-fill" style="width:' + pct + '%"></div></div>';
  }

  function stepper(field, value, step, unit, label) {
    return '<div class="pl-field"><div class="pl-label">' + label + '</div><div class="pl-stepper">' +
      '<button class="pl-btn" onclick="Player.adj(\'' + field + '\',-' + step + ')" aria-label="Less">-</button>' +
      '<div class="pl-val-wrap"><input class="pl-val" id="pl-' + field + '" type="number" inputmode="decimal" value="' + esc(value) + '" oninput="Player.setField(\'' + field + '\',this.value)">' +
      '<div class="pl-unit">' + unit + '</div></div>' +
      '<button class="pl-btn" onclick="Player.adj(\'' + field + '\',' + step + ')" aria-label="More">+</button></div></div>';
  }

  function renderStep() {
    var st = P.steps[P.idx];
    if (!st) { startCooldown(); return; }
    var ex = activeWorkout.exercises[st.exIdx];
    var key = keyOf(ex, st.exIdx);
    var sets = activeWorkout.sets[key];
    var set = sets[st.setIdx];
    var kind = getLogTypeFor(ex.id, ex.reps);
    var data = EXERCISES[ex.id] || { name: ex.id };
    var tip = prefill(ex, st.setIdx, set, kind);
    var units = STATE.settings.units;
    var timed = isTimedKind(kind);
    var secs = parseTimedSecs(ex.reps) || 30;
    var target = timed ? secs + 's' + (kind === 'timed_bilateral' ? ' each side' : '') : (kind === 'distance' ? ex.reps : ex.reps + (kind === 'per_side' ? ' per side' : ' reps'));
    var label = (ex._round ? 'Round ' + ex._round + ' of ' + ex._rounds + ' - ' : '') +
      'Exercise ' + (st.exIdx + 1) + ' of ' + activeWorkout.exercises.length + ' - Set ' + (st.setIdx + 1) + ' of ' + sets.length;

    var controls = '';
    if (timed) {
      controls = '<div class="pl-target">' + esc(target) + '</div>' +
        '<button class="btn btn-primary btn-full pl-main" onclick="Player.startTimed()">' + icon('play', 18) + ' Start timer</button>' +
        '<button class="link-btn" onclick="Player.complete()">Mark done without timer</button>';
    } else {
      if (isLoadable(kind, ex.id)) controls += stepper('weight', set.weight, units === 'lbs' ? 5 : 2.5, units, kind === 'weighted_bw' ? 'Added load' : 'Load');
      controls += stepper('reps', set.reps, 1, kind === 'distance' ? 'm' : (kind === 'per_side' ? 'reps per side' : 'reps'), 'Reps');
      controls += '<div class="pl-target">Target ' + esc(target) + '</div>' +
        '<button class="btn btn-primary btn-full pl-main" onclick="Player.complete()">' + icon('check', 18) + ' Complete set</button>';
    }

    overlay().innerHTML = header(label, Math.round(P.idx / P.steps.length * 100)) +
      '<div class="guided-body" style="justify-content:flex-start;padding-top:8px">' +
        '<h2 style="text-align:center;margin-bottom:6px">' + esc(data.name) + '</h2>' +
        (ex.note ? '<p style="text-align:center;font-size:0.8rem;color:var(--text-muted);margin-bottom:8px">' + esc(ex.note) + '</p>' : '') +
        (tip ? '<div class="pl-tip">' + esc(tip) + '</div>' : '') +
        ExerciseMedia.block(ex.id) + controls +
      '</div>' +
      '<div class="guided-footer">' +
        '<button class="btn btn-ghost btn-sm" onclick="Player.back()" ' + (P.idx === 0 ? 'disabled' : '') + '>Back</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="Player.skipExercise()">Skip exercise</button>' +
      '</div>';
  }

  function setRef() {
    var st = P.steps[P.idx];
    var ex = activeWorkout.exercises[st.exIdx];
    return { ex: ex, key: keyOf(ex, st.exIdx), set: activeWorkout.sets[keyOf(ex, st.exIdx)][st.setIdx], setIdx: st.setIdx };
  }

  function setField(field, value) { if (P.active && !P.resting) setRef().set[field] = value; }

  function adj(field, delta) {
    var r = setRef();
    var cur = parseFloat(r.set[field]);
    var next = Math.max(0, (isNaN(cur) ? 0 : cur) + delta);
    r.set[field] = String(Math.round(next * 100) / 100);
    var input = $('pl-' + field);
    if (input) input.value = r.set[field];
  }

  function complete() {
    if (!P.active || P.resting) return;
    var r = setRef();
    var kind = getLogTypeFor(r.ex.id, r.ex.reps);
    if (!isTimedKind(kind) && !(parseFloat(r.set.reps) > 0)) { showToast('Enter the reps you did', 'warning'); return; }
    if (!r.set.done) completeSet(r.key, r.setIdx);
    afterSet();
  }

  /* Called after a set is completed (also by the set timer). A rest screen may already be showing. */
  function afterSet() {
    if (!P.active || P.resting) return;
    advance();
  }

  function startTimed() {
    var r = setRef();
    startSetTimer(r.key, r.setIdx);
  }

  function advance() {
    P.idx++;
    if (P.idx >= P.steps.length) { startCooldown(); return; }
    activeWorkout.currentExIdx = P.steps[P.idx].exIdx;
    renderStep();
  }

  function back() { if (P.idx > 0 && !P.resting) { P.idx--; activeWorkout.currentExIdx = P.steps[P.idx].exIdx; renderStep(); } }

  function skipExercise() {
    if (P.resting) return;
    var cur = P.steps[P.idx].exIdx;
    while (P.idx < P.steps.length && P.steps[P.idx].exIdx === cur) P.idx++;
    if (P.idx >= P.steps.length) { startCooldown(); return; }
    activeWorkout.currentExIdx = P.steps[P.idx].exIdx;
    renderStep();
  }

  /* ---- rest ---- */
  function nextUp() {
    var nx = P.steps[P.idx + 1];
    if (!nx) return 'Last set done. Cooldown is next.';
    var ex = activeWorkout.exercises[nx.exIdx];
    var same = nx.exIdx === P.steps[P.idx].exIdx;
    return (same ? 'Next: set ' + (nx.setIdx + 1) + ' of ' : 'Next exercise: ') + ((EXERCISES[ex.id] || {}).name || ex.id);
  }

  function rest(seconds) {
    P.resting = true;
    P.restTotal = seconds;
    P.restEnd = Date.now() + seconds * 1000;
    var circ = 2 * Math.PI * 88;
    overlay().innerHTML = header('Rest', Math.round((P.idx + 1) / P.steps.length * 100)) +
      '<div class="guided-body"><div class="guided-ring"><svg viewBox="0 0 200 200"><circle class="ring-bg" cx="100" cy="100" r="88"/>' +
      '<circle class="ring-track" cx="100" cy="100" r="88" id="pl-ring" stroke="var(--strain)" stroke-dasharray="' + circ + '" stroke-dashoffset="0"/></svg>' +
      '<div class="ring-inner"><div class="ring-time" id="pl-time" style="color:var(--strain)">' + formatTime(seconds) + '</div><div class="ring-label">rest</div></div></div>' +
      '<p class="pl-next">' + esc(nextUp()) + '</p></div>' +
      '<div class="guided-footer"><button class="btn btn-secondary" onclick="Player.addRest(15)">+15s</button>' +
      '<button class="btn btn-primary" onclick="Player.skipRest()">Skip rest</button></div>';
    clearInterval(P.restTimer);
    P.restTimer = setInterval(tickRest, 250);
  }

  function tickRest() {
    var left = Math.max(0, Math.ceil((P.restEnd - Date.now()) / 1000));
    var t = $('pl-time'), ring = $('pl-ring');
    if (t) t.textContent = formatTime(left);
    if (ring) ring.style.strokeDashoffset = (2 * Math.PI * 88) * (1 - left / P.restTotal);
    if (left <= 3 && left > 0) SoundSystem.countdown(left);
    if (left <= 0) { SoundSystem.restDone(); Native.haptic('success'); endRest(); }
  }

  function endRest() {
    clearInterval(P.restTimer);
    P.restTimer = null;
    P.resting = false;
    advance();
  }

  function addRest(s) { P.restEnd += s * 1000; P.restTotal += s; }
  function skipRest() { if (P.resting) endRest(); }

  /* ---- stages ---- */
  function afterWarmup() {
    if (!P.active) return;
    P.idx = 0;
    activeWorkout.currentExIdx = P.steps.length ? P.steps[0].exIdx : 0;
    renderStep();
  }

  function startCooldown() {
    closeOverlay();
    var cd = WarmupGen.cooldown(P.session);
    if (!cd.exercises.length) { finish(); return; }
    startGuidedWarmup('auto_cooldown', 'cooldown');
    Guide.onComplete = finish;
    Guide.onSkip = finish;
  }

  function finish() {
    if (!P.active) return;
    clearInterval(P.restTimer);
    P.active = false;
    P.resting = false;
    closeOverlay();
    if (STATE.currentPage !== 'workout') navigate('workout');
    completeWorkout();   // renders the completion screen into the workout page
  }

  function exit() {
    if (!P.active) { closeOverlay(); return; }
    if (!confirm('Leave guided mode? Your sets are kept and you can carry on in the normal logger.')) return;
    clearInterval(P.restTimer);
    P.active = false;
    P.resting = false;
    cancelSetTimer();
    Guide.onComplete = null; Guide.onSkip = null;
    stopGuide();
    closeGuide();
    closeOverlay();
    renderWorkout();
  }

  /* dayIdx: index of the day in the current phase schedule */
  function start(dayIdx) {
    navigate('workout');
    if (activeWorkout.exercises.length && activeWorkout.startTime) {
      if (!confirm('A session is in progress. Continue it in guided mode?')) return;
      resume();
      return;
    }
    startSession(dayIdx);
    if (!activeWorkout.exercises.length) return;
    P.session = PROGRAMS.phases[STATE.phase].schedule[dayIdx];
    P.steps = buildSteps();
    P.idx = 0;
    P.active = true;
    SoundSystem.unlock();
    var wu = WarmupGen.warmup(P.session);
    if (!wu.exercises.length) { afterWarmup(); return; }
    startGuidedWarmup('auto_warmup', 'warmup');
    Guide.onComplete = afterWarmup;
    Guide.onSkip = afterWarmup;
  }

  /* Continue an in-progress session: jump to the first set that is not done yet */
  function resume() {
    P.session = { focus: activeWorkout.title || 'Session', exercises: activeWorkout.exercises, coreFinisher: [] };
    P.steps = buildSteps();
    P.idx = 0;
    while (P.idx < P.steps.length) {
      var st = P.steps[P.idx];
      if (!activeWorkout.sets[keyOf(activeWorkout.exercises[st.exIdx], st.exIdx)][st.setIdx].done) break;
      P.idx++;
    }
    P.active = true;
    if (P.idx >= P.steps.length) { startCooldown(); return; }
    activeWorkout.currentExIdx = P.steps[P.idx].exIdx;
    renderStep();
  }

  return {
    isActive: function() { return P.active; },
    buildSteps: buildSteps, start: start, resume: resume, exit: exit, complete: complete, afterSet: afterSet,
    startTimed: startTimed, adj: adj, setField: setField, back: back, skipExercise: skipExercise,
    rest: rest, addRest: addRest, skipRest: skipRest, isResting: function() { return P.resting; },
    state: function() { return P; }
  };
})();
