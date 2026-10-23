/* ONBOARDING - ES5
   First-run setup: experience, goal, body stats, equipment. Starts the plan at the right phase.
   Existing users (any logged work or a non-default phase) are never interrupted. */

var Onboarding = (function() {

  var STEPS = ['level', 'goal', 'body', 'equipment', 'done'];
  var LEVELS = [
    { id: 'beginner',     label: 'Beginner',     sub: 'New or returning after a long time. Starts with activation.', phase: 0, level: 'beginner' },
    { id: 'intermediate', label: 'Intermediate', sub: 'Trained before, comfortable with the main lifts.',          phase: 1, level: 'experienced' },
    { id: 'experienced',  label: 'Experienced',  sub: 'Train consistently. Starts in the build phase.',            phase: 2, level: 'experienced' }
  ];
  var GOALS = [
    { id: 'recomp',    label: 'Lose fat and build muscle', sub: 'Recomposition, slight deficit' },
    { id: 'cut',       label: 'Lose fat',                  sub: 'Cut, 20% deficit' },
    { id: 'lean_bulk', label: 'Build muscle',              sub: 'Lean bulk, small surplus' }
  ];
  var MODES = [
    { id: 'gym',        label: 'Full gym',        sub: 'Barbells, cables, machines' },
    { id: 'home',       label: 'Home equipment',  sub: 'Dumbbells, bands, a bench' },
    { id: 'bodyweight', label: 'Bodyweight only', sub: 'No equipment' }
  ];

  var st = null;

  function needed() {
    if (Store.get('onboarded', false)) return false;
    if (HistoryStore.getSessions().length || (STATE.completedWorkouts || []).length || STATE.phase !== 0) {
      Store.save('onboarded', true);
      return false;
    }
    return true;
  }

  function option(group, o, selected) {
    return '<button class="onb-opt' + (selected === o.id ? ' active' : '') + '" onclick="Onboarding.pick(\'' + group + '\',\'' + o.id + '\')">' +
      '<div class="onb-opt-title">' + esc(o.label) + '</div><div class="onb-opt-sub">' + esc(o.sub) + '</div></button>';
  }

  function field(id, label, value) {
    return '<div class="input-group" style="margin-bottom:0"><label>' + label + '</label>' +
      '<input type="number" id="' + id + '" value="' + esc(value) + '" inputmode="decimal" step="any"></div>';
  }

  function body() {
    var step = STEPS[st.i], inner = '', title = '', canBack = st.i > 0;
    if (step === 'level') {
      title = 'What is your training experience?';
      inner = LEVELS.map(function(o) { return option('level', o, st.level); }).join('');
    } else if (step === 'goal') {
      title = 'What is your main goal?';
      inner = GOALS.map(function(o) { return option('goal', o, st.goal); }).join('');
    } else if (step === 'body') {
      title = 'Your body stats';
      inner = '<p style="font-size:0.82rem;margin-bottom:12px">Used to set your calorie and protein targets.</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
          field('onb-weight', 'Weight (kg)', st.weight) + field('onb-height', 'Height (cm)', st.height) + field('onb-age', 'Age', st.age) +
        '</div>';
    } else if (step === 'equipment') {
      title = 'What can you train with?';
      inner = MODES.map(function(o) { return option('mode', o, st.mode); }).join('');
    } else {
      title = 'You are set';
      var native = Native.isNative() && !Health.connected();
      inner = '<p style="font-size:0.88rem;margin-bottom:14px">Plan: <b>' + esc(PROGRAMS.phases[st.phase].name) + '</b>. Do the 10-second check-in on the Home screen each morning' +
        (native ? ', or connect Health so readiness is calculated for you.' : '.') + '</p>' +
        (native ? '<button class="btn btn-secondary btn-full" style="margin-bottom:8px" onclick="Onboarding.connectHealth()">Connect Health</button>' : '');
    }
    var last = step === 'done';
    return '<div class="onb-card">' +
      '<div class="onb-dots">' + STEPS.map(function(_, k) { return '<span class="' + (k <= st.i ? 'on' : '') + '"></span>'; }).join('') + '</div>' +
      '<h2 style="margin-bottom:12px">' + title + '</h2>' + inner +
      '<div style="display:grid;grid-template-columns:' + (canBack && !last ? '1fr 2fr' : '1fr') + ';gap:8px;margin-top:16px">' +
        (canBack && !last ? '<button class="btn btn-ghost" onclick="Onboarding.back()">Back</button>' : '') +
        '<button class="btn btn-primary" onclick="Onboarding.next()">' + (last ? 'Start training' : 'Next') + '</button>' +
      '</div>' +
      (st.i === 0 ? '<button class="link-btn" onclick="Onboarding.skip()">Skip setup</button>' : '') +
    '</div>';
  }

  function render() {
    var o = document.getElementById('onb-modal');
    if (!o) return;
    o.innerHTML = body();
  }

  function start() {
    var s = STATE.settings;
    st = { i: 0, level: 'intermediate', goal: s.nutritionGoal || 'recomp', mode: STATE.mode || 'gym',
           weight: s.bodyWeight || 80, height: s.heightCm || 175, age: s.age || 27, phase: 1 };
    var o = document.getElementById('onb-modal');
    if (!o) {
      o = document.createElement('div');
      o.id = 'onb-modal';
      o.className = 'onb-overlay';
      document.body.appendChild(o);
    }
    render();
  }

  function pick(group, id) { st[group] = id; render(); }

  function readBody() {
    function v(id) { var e = document.getElementById(id); return e ? parseFloat(e.value) : NaN; }
    var w = v('onb-weight'), h = v('onb-height'), a = v('onb-age');
    if (isNaN(w) || w < 30 || w > 300 || isNaN(h) || h < 120 || h > 230 || isNaN(a) || a < 14 || a > 90) return false;
    st.weight = w; st.height = h; st.age = a;
    return true;
  }

  function levelDef() { return LEVELS.filter(function(l) { return l.id === st.level; })[0] || LEVELS[1]; }

  function apply() {
    var def = levelDef();
    STATE.settings.level = def.level;
    STATE.settings.nutritionGoal = st.goal;
    STATE.settings.bodyWeight = st.weight;
    STATE.settings.heightCm = st.height;
    STATE.settings.age = st.age;
    Store.save('settings', STATE.settings);
    STATE.mode = st.mode;
    Store.save('mode', st.mode);
    Progression.setPhase(def.phase, 1);
    st.phase = def.phase;
  }

  function next() {
    var step = STEPS[st.i];
    if (step === 'body' && !readBody()) { showToast('Check your weight, height and age', 'warning'); return; }
    if (step === 'equipment') { apply(); }
    if (step === 'done') { finish(); return; }
    st.i++;
    render();
  }

  function back() { if (st.i > 0) { st.i--; render(); } }

  function close() {
    var o = document.getElementById('onb-modal');
    if (o && o.parentNode) o.parentNode.removeChild(o);
    st = null;
  }

  function finish() {
    Store.save('onboarded', true);
    close();
    renderPage(STATE.currentPage);
  }

  function skip() { Store.save('onboarded', true); close(); }

  function connectHealth() {
    Health.connect().then(function() { showToast('Health connected', 'success'); render(); })
      .catch(function(e) { showToast((e && e.message) || 'Could not connect', 'warning'); });
  }

  function maybeStart() { if (needed()) start(); }

  function restart() {
    if (confirm('Redo setup? This restarts your plan at week 1 of the starting phase. Your history is kept.')) start();
  }

  return { needed: needed, start: start, maybeStart: maybeStart, restart: restart, pick: pick, next: next, back: back, skip: skip, connectHealth: connectHealth, levels: LEVELS };
})();
