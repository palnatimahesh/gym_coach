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
