/* Full-app smoke test. Inject into a copy of index.html (paths rewritten to ../) and open via a local server.
   Navigates every page, checks tabs / sub-tabs, and starts a circuit session. Result goes to <pre id="smoke">. */
(function() {
  var errs = [];
  window.confirm = function() { return true; };   // a real dialog would block the headless run
  window.onerror = function(m, s, l) { errs.push('onerror: ' + m + ' @' + String(s).split('/').pop() + ':' + l); };
  window.addEventListener('load', function() {
    setTimeout(function() {
      try {
        if (!document.getElementById('onb-modal')) errs.push('onboarding did not start on a fresh install');
        Onboarding.skip();
        PAGES.forEach(function(p) {
          navigate(p);
          var c = document.getElementById(p + '-content');
          if (!c || !c.innerHTML.length) errs.push('empty page ' + p);
          else if (c.innerHTML.indexOf('Something went wrong') !== -1) errs.push('render error ' + p + ': ' + c.textContent.slice(0, 120));
          var active = document.querySelectorAll('.nav-item.active');
          if (active.length !== 1 || active[0].getAttribute('data-section') !== sectionOf(p)) errs.push('bad active tab for ' + p);
          var sub = document.querySelectorAll('#subtabs .subtab').length;
          var expect = SECTIONS[sectionOf(p)].pages.length;
          if (expect > 1 && sub !== expect) errs.push('subtabs for ' + p + ': ' + sub + ' vs ' + expect);
          if (expect === 1 && document.getElementById('subtabs').style.display !== 'none') errs.push('subtabs visible on ' + p);
        });
        if (document.querySelectorAll('.nav-item').length !== 5) errs.push('tab count');
        document.documentElement.setAttribute('data-stage','nutrition');
        FoodLog.setEnabled(true);
        navigate('nutrition');
        NUTRITION_TABS.forEach(function(tb) {
          setNutritionTab(tb[0]);
          var nc = document.getElementById('nutrition-content');
          if (nc.innerHTML.indexOf('Something went wrong') !== -1 || nc.innerHTML.length < 500) errs.push('nutrition tab ' + tb[0] + ' failed');
        });
        setNutritionTab('today');
        document.getElementById('food-name').value = 'Smoke meal'; document.getElementById('food-kcal').value = '500'; foodAdd();
        if (FoodLog.totals().kcal !== 500) errs.push('food add failed');
        navigate('workout');
        var li = -1;
        PROGRAMS.phases[STATE.phase].schedule.forEach(function(s, i) { if (li < 0 && s.exercises && s.exercises.length) li = i; });
        Plan.openEditor(li);
        if (!document.querySelector('#plan-modal .plan-row')) errs.push('plan editor empty');
        Plan.closeEditor();
        ExerciseMedia.open('squat');
        if (!document.getElementById('media-modal')) errs.push('media modal missing');
        ExerciseMedia.close();
        navigate('dashboard');
        var dash = document.getElementById('dashboard-content');
        if (dash.querySelectorAll('.ring-arc').length !== 3) errs.push('expected 3 rings, got ' + dash.querySelectorAll('.ring-arc').length);
        if (dash.innerHTML.indexOf('Morning check-in') === -1) errs.push('check-in card missing');
        Readiness.QUESTIONS.forEach(function(q) { checkinPick(q.id, q.opts.length - 1); });
        if (dash.innerHTML.indexOf('Morning check-in') !== -1) errs.push('check-in card still shown after answering');
        if (!Readiness.getToday() || Readiness.getToday().score !== 100) errs.push('check-in not saved');
        if (dash.innerHTML.indexOf('Redo check-in') === -1) errs.push('redo link missing');
        function tap(sec, expectPage) {
          document.querySelector('[data-section="' + sec + '"]').click();
          if (STATE.currentPage !== expectPage) errs.push(sec + ' tab went to ' + STATE.currentPage + ', expected ' + expectPage);
        }
        SECTION_LAST = {};
        navigate('running'); tap('progress', 'progress'); tap('train', 'running'); tap('fuel', 'nutrition'); tap('more', 'settings');
        if (document.getElementById('settings-content').innerHTML.indexOf(APP_VERSION) === -1) errs.push('version not shown in settings');
        Progression.setPhase(5, 1); STATE.mode = 'gym';
        navigate('workout'); startSession(0);
        if (!activeWorkout.exercises.length) errs.push('circuit session empty');
        if (activeWorkout.exercises.some(function(e) { return e._round; })) errs.push('circuit should default to grouped sets');
        Progression.setCircuitStyle('rounds'); startSession(0);
        if (!activeWorkout.exercises.some(function(e) { return e._round; })) errs.push('rounds style did not expand');
        Progression.setCircuitStyle('grouped');
        /* Guided session end to end: warm-up -> all sets with automatic rest -> cooldown -> saved */
        document.documentElement.setAttribute('data-stage','guided');
        clearInterval(activeWorkout.elapsedInterval); clearInterval(activeWorkout.restTimer);
        activeWorkout = { exercises: [], currentExIdx: 0, sets: {}, title: '', startTime: null, restTimer: null, restRemaining: 0, paused: false, elapsedInterval: null, swappedExercises: {}, frozenElapsed: undefined };
        Progression.setPhase(1, 1);
        var gi = -1;
        PROGRAMS.phases[1].schedule.forEach(function(s, i) { if (gi < 0 && s.exercises && s.exercises.length > 2 && !s.massage) gi = i; });
        var before = HistoryStore.getSessions().length;
        Player.start(gi);
        if (!Player.isActive()) errs.push('guided session did not start');
        var go = document.getElementById('guided-overlay');
        if (!go || go.classList.contains('hidden') || Guide.routineId !== 'auto_warmup') errs.push('guided warm-up not shown first');
        guideComplete();
        var po = document.getElementById('player-overlay');
        if (!po || po.innerHTML.indexOf('Complete set') === -1 && po.innerHTML.indexOf('Start timer') === -1) errs.push('player did not open after the warm-up');
        document.documentElement.setAttribute('data-stage','guided-loop');
        var guard = 0, restsSeen = 0;
        while (document.getElementById('player-overlay') && guard++ < 400) {
          if (Player.isResting()) { restsSeen++; Player.skipRest(); continue; }
          Player.complete();
        }
        if (!restsSeen) errs.push('no rest screens appeared');
        var cg = document.getElementById('guided-overlay');
        if (!cg || cg.classList.contains('hidden') || Guide.routineId !== 'auto_cooldown') errs.push('cooldown did not follow the last set');
        guideComplete();
        var after = HistoryStore.getSessions();
        if (after.length !== before + 1 || !(after[0].doneSets > 0)) errs.push('guided session was not saved');
        if (Player.isActive()) errs.push('player still active after finishing');
        if (document.getElementById('workout-content').innerHTML.indexOf('Session Complete') === -1) errs.push('completion screen missing');
        tap('home', 'dashboard');
        if (document.getElementById('subtabs').style.display !== 'none') errs.push('home shows subtabs');
      } catch (e) {
        errs.push('EXC ' + e.message + ' | ' + String(e.stack).split('\n').slice(0, 3).join(' / '));
      }
      var pre = document.createElement('pre'); pre.id = 'smoke';
      pre.textContent = errs.length ? errs.length + ' PROBLEMS\n' + errs.join('\n') : 'NO ERRORS';
      document.documentElement.appendChild(pre);
    }, 800);
  });
})();
