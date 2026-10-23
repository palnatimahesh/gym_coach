/* Full-app smoke test. Inject into a copy of index.html (paths rewritten to ../) and open via a local server.
   Navigates every page, checks tabs / sub-tabs, and starts a circuit session. Result goes to <pre id="smoke">. */
(function() {
  var errs = [];
  window.onerror = function(m, s, l) { errs.push('onerror: ' + m + ' @' + String(s).split('/').pop() + ':' + l); };
  window.addEventListener('load', function() {
    setTimeout(function() {
      try {
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
        navigate('nutrition');
        NUTRITION_TABS.forEach(function(tb) {
          setNutritionTab(tb[0]);
          var nc = document.getElementById('nutrition-content');
          if (nc.innerHTML.indexOf('Something went wrong') !== -1 || nc.innerHTML.length < 500) errs.push('nutrition tab ' + tb[0] + ' failed');
        });
        setNutritionTab('today');
        document.getElementById('food-name').value = 'Smoke meal'; document.getElementById('food-kcal').value = '500'; foodAdd();
        if (FoodLog.totals().kcal !== 500) errs.push('food add failed');
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
