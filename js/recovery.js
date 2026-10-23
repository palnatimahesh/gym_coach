/* --- RECOVERY & HORMONES PAGE --- ES5 --- */


var SUPPLEMENTS = [
  { id: 'creatine',    name: 'Creatine',            dose: '5g',         timing: 'Any time',    color: '#3b82f6' },
  { id: 'zinc',        name: 'Zinc',                dose: '25-40mg',    timing: 'With food',   color: '#f59e0b' },
  { id: 'magnesium',   name: 'Magnesium Glycinate',  dose: '300-400mg',  timing: 'Before bed',  color: '#8b5cf6' },
  { id: 'vitamin_d',   name: 'Vitamin D3 + K2',     dose: '3000-5000IU', timing: 'Morning',    color: '#10b981' },
  { id: 'omega3',      name: 'Omega-3',             dose: '2-3g EPA+DHA', timing: 'With meal', color: '#6366f1' },
  { id: 'ashwagandha', name: 'Ashwagandha',         dose: '300-600mg',  timing: 'Before bed',  color: '#ef4444' }
];

function renderSupplementChecklist() {
  var today   = HistoryStore.localDate();
  var suppKey = 'ac_supp_' + today;
  var checked = {};
  try { checked = JSON.parse(Store.rawGet(suppKey) || '{}'); } catch(e) {}

  var doneCount = Object.keys(checked).filter(function(k) { return checked[k]; }).length;
  var totalCount = SUPPLEMENTS.length;

  return '<div style="margin-bottom:14px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<div>' +
        '<h3 style="font-size:1rem;font-weight:600">Daily Supplements</h3>' +
        '<div style="font-size:0.72rem;color:var(--text-muted)">' + doneCount + '/' + totalCount + ' taken today</div>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm" onclick="resetSupplements()">Reset</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
      SUPPLEMENTS.map(function(s) {
        var done  = checked[s.id] || false;
        return '<div onclick="toggleSupplement(\'' + s.id + '\')" style="' +
          'background:' + (done ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)') + ';' +
          'border:1px solid ' + (done ? 'rgba(16,185,129,0.3)' : 'var(--border)') + ';' +
          'border-radius:var(--radius-md);padding:10px;cursor:pointer;transition:0.2s">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">' +
            '<span style="font-size:0.82rem;font-weight:600;color:' + (done ? 'var(--green)' : 'var(--text-primary)') + '">' + s.name + '</span>' +
            '<div style="width:18px;height:18px;border-radius:50%;background:' + (done ? 'var(--green)' : 'var(--bg-secondary)') + ';border:2px solid ' + (done ? 'var(--green)' : 'var(--border)') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
              (done ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.72rem;color:' + s.color + '">' + s.dose + '</div>' +
          '<div style="font-size:0.68rem;color:var(--text-muted)">' + s.timing + '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div class="progress-bar" style="margin-top:8px">' +
      '<div class="progress-fill" style="width:' + Math.round(doneCount/totalCount*100) + '%;background:var(--green)"></div>' +
    '</div>' +
  '</div>';
}

function toggleSupplement(id) {
  if (typeof SoundSystem !== 'undefined') SoundSystem.tick();
  var today   = HistoryStore.localDate();
  var suppKey = 'ac_supp_' + today;
  var checked = {};
  try { checked = JSON.parse(Store.rawGet(suppKey) || '{}'); } catch(e) {}
  checked[id] = !checked[id];
  try { Store.rawSet(suppKey, JSON.stringify(checked)); } catch(e) {}
  renderRecovery();
}

function resetSupplements() {
  var today   = HistoryStore.localDate();
  var suppKey = 'ac_supp_' + today;
  try { Store.rawRemove(suppKey); } catch(e) {}
  renderRecovery();
}

function renderRecovery() {
  el('recovery-content').innerHTML = renderSupplementChecklist() +
    '<div class="top-header">' +
      '<h2>Recovery Hub</h2>' +
      '<span class="badge badge-red">Hormonal Health</span>' +
    '</div>' +
    '<div class="coach-tip mb-16">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Coach says:</div>' +
        '<p>Training breaks your body down. Recovery builds it back stronger. Neglect recovery and you plateau.</p>' +
      '</div>' +
    '</div>' +
    '<div class="tabs" id="rec-tabs">' +
      '<button class="tab active" onclick="switchRecTab(\'testosterone\',this)">Testosterone</button>' +
      '<button class="tab" onclick="switchRecTab(\'dopamine\',this)">Dopamine</button>' +
      '<button class="tab" onclick="switchRecTab(\'deload\',this)">Deload</button>' +
    '</div>' +
    '<div id="rec-tab-content">' + renderTestosteroneTab() + '</div>';
}

function switchRecTab(tab, btn) {
  var tabs = qsa('.tab', el('rec-tabs'));
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  btn.classList.add('active');
  var content = el('rec-tab-content');
  if (tab === 'testosterone') content.innerHTML = renderTestosteroneTab();
  else if (tab === 'dopamine') content.innerHTML = renderDopamineTab();
  else if (tab === 'deload')   content.innerHTML = renderDeloadTab();
}

function renderTestosteroneTab() {
  var data = RECOVERY.testosterone;
  var html = '<div class="section-header"><h3>' + data.title + '</h3></div>';
  html += '<p style="font-size:0.87rem;margin-bottom:16px">' + data.intro + '</p>';
  data.bigLevers.forEach(function(lever) {
    html += renderTLever(lever);
  });
  return html;
}

function renderTLever(lever) {
  var impactColors = { 'HIGH': 'var(--red)', 'MEDIUM-HIGH': 'var(--yellow)', 'MEDIUM': 'var(--green)' };
  var color    = impactColors[lever.impact] || 'var(--text-muted)';
  var impactRgb= lever.impact === 'HIGH' ? '239,68,68' : '245,158,11';
  var icons    = { 1: '&#x1F634;', 2: '&#x1F3CB;', 3: '&#x1F9CA;', 4: '&#x2600;', 5: '&#x1F969;', 6: '&#x1F9D8;' };
  var ico      = icons[lever.priority] || '&#x1F4A1;';

  var html =
    '<div class="exercise-card mb-10">' +
      '<div class="exercise-header" onclick="this.closest(\'.exercise-card\').classList.toggle(\'expanded\')">' +
        '<div class="exercise-icon" style="width:44px;height:44px;background:rgba(239,68,68,0.1);color:var(--red);font-size:1.2rem">' + ico + '</div>' +
        '<div class="exercise-meta">' +
          '<div class="name">#' + lever.priority + ' ' + lever.title + '</div>' +
          '<div class="sub"><span class="badge" style="background:rgba(' + impactRgb + ',0.15);color:' + color + ';font-size:0.65rem">Impact: ' + lever.impact + '</span></div>' +
        '</div>' +
        '<div class="exercise-chevron">' + icon('chevron_down', 18) + '</div>' +
      '</div>' +
      '<div class="exercise-body">' +
        '<div class="exercise-section"><div class="exercise-section-title">' + icon('info', 12) + ' Details</div>' +
          '<ul class="form-list">' + lever.details.map(function(d) { return '<li>' + d + '</li>'; }).join('') + '</ul>' +
        '</div>';

  if (lever.supplements) {
    html += '<div class="exercise-section"><div class="exercise-section-title">' + icon('star', 12) + ' Key Supplements</div>';
    lever.supplements.forEach(function(s) {
      html +=
        '<div style="background:var(--bg-secondary);border-radius:var(--radius-sm);padding:10px;margin-bottom:6px">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
            '<span style="font-size:0.88rem;font-weight:600">' + s.name + '</span>' +
            '<span class="badge badge-accent" style="font-size:0.68rem">' + s.dose + '</span>' +
          '</div>' +
          '<div style="font-size:0.78rem;color:var(--text-muted)">' + s.timing + '</div>' +
          '<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px">' + s.note + '</div>' +
        '</div>';
    });
    html += '</div>';
  }

  if (lever.schedule) {
    html += '<div class="exercise-section"><div class="exercise-section-title">' + icon('layers', 12) + ' Cold Exposure Progression</div>';
    lever.schedule.forEach(function(s) {
      html +=
        '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<span style="font-size:0.85rem;color:var(--text-secondary)">Week ' + s.week + '</span>' +
          '<span style="font-size:0.85rem;color:var(--accent)">' + s.protocol + '</span>' +
        '</div>';
    });
    html += '</div>';
  }

  if (lever.action) {
    html += '<div class="hack-item mt-12">' + icon('zap', 13) + ' <span><strong>Action Now:</strong> ' + lever.action + '</span></div>';
  }

  html += '</div></div>';
  return html;
}

function renderDopamineTab() {
  var data = RECOVERY.dopamineReset;
  var html =
    '<div class="section-header"><h3>' + data.title + '</h3></div>' +
    '<div class="card-accent mb-16" style="background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.25)">' +
      '<p style="font-size:0.88rem;font-style:italic;color:var(--text-secondary)">' + data.howItWorks + '</p>' +
    '</div>' +
    '<div class="section-header"><h3>Reset Levels</h3></div>';

  data.levels.forEach(function(level) {
    var allowed = level.what_you_can_do || level.allowed || [];
    html +=
      '<div class="exercise-card mb-10">' +
        '<div class="exercise-header" onclick="this.closest(\'.exercise-card\').classList.toggle(\'expanded\')">' +
          '<div class="exercise-icon" style="width:44px;height:44px;background:rgba(99,102,241,0.1);color:#6366f1;font-size:1.2rem">' +
            (level.level === 1 ? '&#x1F7E1;' : '&#x2B1B;') +
          '</div>' +
          '<div class="exercise-meta">' +
            '<div class="name">Level ' + level.level + ': ' + level.name + '</div>' +
            '<div class="sub"><span class="badge badge-purple" style="font-size:0.68rem">' + level.duration + '</span></div>' +
          '</div>' +
          '<div class="exercise-chevron">' + icon('chevron_down', 18) + '</div>' +
        '</div>' +
        '<div class="exercise-body">' +
          '<p style="font-size:0.87rem;margin-bottom:12px">' + level.description + '</p>' +
          '<div class="exercise-section"><div class="exercise-section-title">' + icon('warning', 12) + ' Rules (Remove These)</div>' +
            level.rules.map(function(r) { return '<div class="mistake-item" style="margin-bottom:4px">' + icon('close', 12) + ' ' + r + '</div>'; }).join('') +
          '</div>' +
          '<div class="exercise-section"><div class="exercise-section-title">' + icon('check', 12) + ' What You CAN Do</div>' +
            allowed.map(function(a) { return '<div class="hack-item" style="margin-bottom:4px">' + icon('check', 12) + ' ' + a + '</div>'; }).join('') +
          '</div>' +
          (level.coachNote ?
            '<div class="coach-tip" style="margin-top:12px">' +
              '<div class="coach-avatar" style="width:28px;height:28px;font-size:0.75rem">&#x1F9E0;</div>' +
              '<div><p style="font-size:0.83rem">' + level.coachNote + '</p></div>' +
            '</div>' : '') +
        '</div>' +
      '</div>';
  });

  html += '<div class="section-header mt-16"><h3>Daily Reset Protocol</h3></div>';
  data.dailyProtocol.forEach(function(item) {
    html +=
      '<div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">' +
        '<div style="min-width:65px;padding:4px 8px;background:rgba(99,102,241,0.1);border-radius:var(--radius-sm);text-align:center">' +
          '<div style="font-size:0.72rem;font-weight:700;color:#6366f1">' + item.time + '</div>' +
        '</div>' +
        '<div style="flex:1;background:var(--bg-card);border-radius:var(--radius-sm);padding:10px">' +
          '<div style="font-size:0.87rem;font-weight:500;margin-bottom:3px">' + item.action + '</div>' +
          '<div style="font-size:0.78rem;color:var(--text-muted)">' + item.why + '</div>' +
        '</div>' +
      '</div>';
  });

  html +=
    '<div class="section-header mt-16"><h3>Signs It\'s Working</h3></div>' +
    '<div class="card">' +
      data.earlySignsOfRecovery.map(function(sign) {
        return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<span style="color:var(--green);flex-shrink:0">' + icon('check', 14) + '</span>' +
          '<span style="font-size:0.87rem;color:var(--text-secondary)">' + sign + '</span>' +
        '</div>';
      }).join('') +
    '</div>';

  return html;
}

function renderDeloadTab() {
  var deload = RECOVERY.deloadProtocol;
  var sleep  = RECOVERY.sleepOptimization;
  var html   =
    '<div class="section-header"><h3>' + deload.title + '</h3></div>' +
    '<div class="coach-tip mb-16">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Why Deload?</div><p>' + deload.description + '</p></div>' +
    '</div>' +
    '<div class="card mb-16"><div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Frequency</div>' +
      '<div style="font-size:0.95rem;font-weight:600;color:var(--accent)">' + deload.frequency + '</div>' +
    '</div>' +
    '<div class="section-header"><h3>Deload Rules</h3></div>' +
    deload.rules.map(function(r) {
      return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
        '<span style="color:var(--accent);flex-shrink:0">' + icon('check', 14) + '</span>' +
        '<span style="font-size:0.87rem;color:var(--text-secondary)">' + r + '</span>' +
      '</div>';
    }).join('') +
    '<div class="section-header mt-16"><h3>You Need a Deload If...</h3></div>' +
    deload.signals.map(function(s) {
      return '<div class="mistake-item mb-4">' + icon('warning', 12) + ' ' + s + '</div>';
    }).join('') +
    '<div class="section-header mt-20"><h3>' + sleep.title + '</h3></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">' +
      '<div class="stat-tile"><div class="value text-red">' + sleep.targets.minimum + 'h</div><div class="label">Minimum</div></div>' +
      '<div class="stat-tile"><div class="value text-accent">' + sleep.targets.optimal + 'h</div><div class="label">Optimal</div></div>' +
      '<div class="stat-tile"><div class="value text-purple">' + sleep.targets.deep_sleep + '</div><div class="label">Deep</div></div>' +
    '</div>' +
    sleep.protocols.map(function(p) {
      return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
        '<span style="color:var(--purple);flex-shrink:0">' + icon('moon', 14) + '</span>' +
        '<span style="font-size:0.87rem;color:var(--text-secondary)">' + p + '</span>' +
      '</div>';
    }).join('');
  return html;
}
