/* --- EXERCISE DICTIONARY PAGE --- ES5 compatible --- */

var dictState = {
  search: '',
  category: 'all',
  mode: STATE.mode
};

function renderDictionary() {
  dictState.mode = STATE.mode;
  var exercises = filterExercises();
  var total = Object.keys(EXERCISES).length;

  el('dictionary-content').innerHTML =
    '<div class="top-header">' +
      '<h2>Exercise Library</h2>' +
      '<span class="badge badge-muted">' + total + ' exercises</span>' +
    '</div>' +
    '<div class="mode-toggle mb-12">' +
      '<button class="mode-btn ' + (dictState.mode === 'gym'        ? 'active' : '') + '" onclick="setDictMode(\'gym\')">Gym</button>' +
      '<button class="mode-btn ' + (dictState.mode === 'home'       ? 'active' : '') + '" onclick="setDictMode(\'home\')">Home</button>' +
      '<button class="mode-btn ' + (dictState.mode === 'bodyweight' ? 'active' : '') + '" onclick="setDictMode(\'bodyweight\')">No Kit</button>' +
      '<button class="mode-btn ' + (dictState.mode === 'all'        ? 'active' : '') + '" onclick="setDictMode(\'all\')">All</button>' +
    '</div>' +
    '<div class="search-bar">' +
      icon('search', 18) +
      '<input type="search" placeholder="Search exercise, muscle, equipment..." ' +
        'id="dict-search" value="' + dictState.search + '" ' +
        'oninput="onDictSearch(this.value)" autocomplete="off">' +
    '</div>' +
    '<div class="chip-scroll" id="dict-chips">' + renderCategoryChips() + '</div>' +
    '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">' +
      exercises.length + ' exercise' + (exercises.length !== 1 ? 's' : '') + ' found' +
    '</div>' +
    '<div id="dict-list">' +
      (exercises.length ? exercises.map(function(ex) { return renderExerciseCard(ex); }).join('') : renderEmptyDict()) +
    '</div>';
}

function renderCategoryChips() {
  var cats = [
    { id: 'all',      label: 'All' },
    { id: 'push',     label: 'Push' },
    { id: 'pull',     label: 'Pull' },
    { id: 'legs',     label: 'Legs' },
    { id: 'core',     label: 'Core' },
    { id: 'mobility', label: 'Mobility' },
    { id: 'cardio',   label: 'Cardio' }
  ];
  return cats.map(function(c) {
    return '<button class="chip ' + (dictState.category === c.id ? 'active' : '') + '" onclick="setDictCategory(\'' + c.id + '\')">' +
      (c.id !== 'all' && CATEGORY_ICONS[c.id] ? CATEGORY_ICONS[c.id] + ' ' : '') + c.label +
    '</button>';
  }).join('');
}

function renderExerciseCard(ex) {
  var catStyle = CATEGORY_COLORS[ex.category] || { bg: 'rgba(255,255,255,0.05)', color: '#aaa' };
  var modeIcons = ex.mode.map(function(m) {
    return '<span class="badge ' + (m === 'gym' ? 'badge-accent' : 'badge-green') + '" style="font-size:0.65rem">' + m + '</span>';
  }).join(' ');
  var hasPR = STATE.personalRecords[ex.id];
  var muscle = (ex.muscle || '').replace(/_/g, ' ');
  var equip  = (ex.equipment || '').replace(/_/g, ' ');

  return '<div class="exercise-card" id="ex-card-' + ex.id + '">' +
    '<div class="exercise-header" onclick="toggleExCard(\'' + ex.id + '\')">' +
      '<div class="exercise-icon" style="background:' + catStyle.bg + ';color:' + catStyle.color + ';width:44px;height:44px">' +
        (CATEGORY_ICONS[ex.category] || '') +
      '</div>' +
      '<div class="exercise-meta">' +
        '<div class="name" style="display:flex;align-items:center;gap:6px">' +
          ex.name +
          (ex.testosterone ? '<span style="font-size:0.7rem;color:var(--red)">T</span>' : '') +
          (hasPR ? icon('star', 12) : '') +
        '</div>' +
        '<div class="sub" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
          modeIcons +
          getDifficultyBadge(ex.difficulty) +
          '<span class="badge badge-muted">' + muscle + '</span>' +
          (equip ? '<span style="font-size:0.72rem;color:var(--text-muted)">' + equip + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="exercise-chevron">' + icon('chevron_down', 18) + '</div>' +
    '</div>' +
    '<div class="exercise-body" id="ex-body-' + ex.id + '">' +
      renderExerciseDetail(ex) +
    '</div>' +
  '</div>';
}

function renderExerciseDetail(ex) {
  var hasPR  = STATE.personalRecords[ex.id];
  var units  = STATE.settings.units;
  var muscle = (ex.muscle || '').replace(/_/g, ' ');
  var html   = '';

  // Stats row
  html +=
    '<div style="display:flex;gap:8px;margin-top:14px;margin-bottom:14px;flex-wrap:wrap">' +
      '<div class="card-sm" style="flex:1;text-align:center;min-width:70px"><div style="font-size:1.1rem;font-weight:700;color:var(--accent)">' + ex.sets + '</div><div style="font-size:0.7rem;color:var(--text-muted)">Sets</div></div>' +
      '<div class="card-sm" style="flex:1;text-align:center;min-width:70px"><div style="font-size:1rem;font-weight:700;color:var(--green)">' + ex.reps + '</div><div style="font-size:0.7rem;color:var(--text-muted)">Reps</div></div>' +
      '<div class="card-sm" style="flex:1;text-align:center;min-width:70px"><div style="font-size:1rem;font-weight:700;color:var(--yellow)">' + (ex.rest || '--') + (ex.rest ? 's' : '') + '</div><div style="font-size:0.7rem;color:var(--text-muted)">Rest</div></div>' +
      (hasPR ? '<div class="card-sm" style="flex:1;text-align:center;min-width:70px;border-color:rgba(245,158,11,.3)"><div style="font-size:0.9rem;font-weight:700;color:var(--yellow)">' + hasPR.weight + units + '</div><div style="font-size:0.7rem;color:var(--text-muted)">My PR</div></div>' : '') +
    '</div>';

  // Grip
  html +=
    '<div class="exercise-section">' +
      '<div class="exercise-section-title">' + icon('dumbbell', 12) + ' Grip &amp; Setup</div>' +
      '<div style="font-size:0.87rem;color:var(--text-secondary);line-height:1.6;background:var(--bg-secondary);padding:10px;border-radius:var(--radius-sm)">' + ex.grip + '</div>' +
    '</div>';

  // Breathing
  html +=
    '<div class="exercise-section">' +
      '<div class="exercise-section-title">' + icon('sun', 12) + ' Breathing</div>' +
      '<div style="font-size:0.87rem;color:var(--text-secondary);line-height:1.6;background:rgba(99,102,241,0.08);padding:10px;border-radius:var(--radius-sm);border:1px solid rgba(99,102,241,0.15)">' + ex.breathing + '</div>' +
    '</div>';

  // Form cues
  html +=
    '<div class="exercise-section">' +
      '<div class="exercise-section-title">' + icon('check', 12) + ' Form Cues</div>' +
      '<ul class="form-list">' +
        ex.form.map(function(f) { return '<li>' + f + '</li>'; }).join('') +
      '</ul>' +
    '</div>';

  // Hacks
  if (ex.hacks && ex.hacks.length) {
    html +=
      '<div class="exercise-section">' +
        '<div class="exercise-section-title">' + icon('zap', 12) + ' Coach Hacks</div>' +
        ex.hacks.map(function(h) { return '<div class="hack-item">' + icon('zap', 13) + ' ' + h + '</div>'; }).join('') +
      '</div>';
  }

  // Mistakes
  if (ex.commonMistakes && ex.commonMistakes.length) {
    html +=
      '<div class="exercise-section">' +
        '<div class="exercise-section-title">' + icon('warning', 12) + ' Common Mistakes</div>' +
        ex.commonMistakes.map(function(m) { return '<div class="mistake-item">' + icon('warning', 12) + ' ' + m + '</div>'; }).join('') +
      '</div>';
  }

  // Alternatives
  if (ex.alternatives && ex.alternatives.length) {
    var reasonLabels = {
      equipment_occupied: 'Equip. Occupied', too_hard: 'Too Hard',
      too_easy: 'Too Easy', injury: 'Injury', no_equipment: 'No Equip.',
      variation: 'Variation', knee_issue: 'Knee Issue'
    };
    html +=
      '<div class="exercise-section">' +
        '<div class="exercise-section-title">' + icon('swap', 12) + ' Alternatives</div>' +
        ex.alternatives.map(function(a) {
          var altEx = EXERCISES[a.id];
          if (!altEx) return '';
          var modeOk = altEx.mode.indexOf(dictState.mode === 'all' ? altEx.mode[0] : dictState.mode) !== -1;
          return '<div class="alt-exercise" onclick="scrollToExercise(\'' + a.id + '\')">' +
            '<div>' +
              '<div class="alt-name">' + altEx.name + '</div>' +
              '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">' +
                a.reason.map(function(r) { return '<span class="badge badge-muted" style="font-size:0.65rem">' + (reasonLabels[r] || r) + '</span>'; }).join('') +
                '<span class="badge ' + (modeOk ? 'badge-green' : 'badge-muted') + '" style="font-size:0.65rem">' + altEx.mode.join(', ') + '</span>' +
              '</div>' +
            '</div>' +
            icon('chevron_down', 14) +
          '</div>';
        }).filter(Boolean).join('') +
      '</div>';
  }

  // Phase tags
  if (ex.phase && ex.phase.length) {
    html +=
      '<div class="exercise-section">' +
        '<div class="exercise-section-title">' + icon('layers', 12) + ' Phase Availability</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          ex.phase.map(function(p) {
            var pc = PHASE_COLORS[p] || '#888';
            var pn = PROGRAMS.phases[p] ? ' -- ' + PROGRAMS.phases[p].name : '';
            return '<span class="badge" style="background:rgba(136,136,136,0.15);color:' + pc + ';font-size:0.7rem">Phase ' + p + pn + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  // Tags
  if (ex.tags && ex.tags.length) {
    html +=
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:12px">' +
        ex.tags.map(function(t) { return '<span class="badge badge-muted" style="font-size:0.68rem">' + t.replace(/_/g, ' ') + '</span>'; }).join('') +
      '</div>';
  }

  return html;
}

function toggleExCard(id) {
  var card = el('ex-card-' + id);
  if (!card) return;
  var wasExpanded = card.classList.contains('expanded');
  qsa('.exercise-card.expanded').forEach(function(c) { c.classList.remove('expanded'); });
  if (!wasExpanded) card.classList.add('expanded');
}

function scrollToExercise(id) {
  var card = el('ex-card-' + id);
  if (card) {
    card.classList.add('expanded');
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    dictState.search   = '';
    dictState.category = 'all';
    renderDictionary();
    setTimeout(function() {
      var c = el('ex-card-' + id);
      if (c) { c.classList.add('expanded'); c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, 100);
  }
}

function filterExercises() {
  return Object.keys(EXERCISES).map(function(k) { return EXERCISES[k]; }).filter(function(ex) {
    var modeOk;
    if (dictState.mode === 'all') {
      modeOk = true;
    } else if (dictState.mode === 'bodyweight') {
      modeOk = ex.mode.indexOf('home') !== -1 &&
        ['bodyweight', 'resistance_band', 'pullup_bar'].indexOf(ex.equipment) !== -1;
    } else {
      modeOk = ex.mode.indexOf(dictState.mode) !== -1;
    }
    var catOk    = dictState.category === 'all' || ex.category === dictState.category;
    var search   = dictState.search.toLowerCase();
    var searchOk = !search;
    if (!searchOk) {
      var fields = [ex.name, ex.muscle, ex.equipment, ex.category].concat(ex.tags || []);
      searchOk = fields.some(function(v) { return v && v.toLowerCase().indexOf(search) !== -1; });
    }
    return modeOk && catOk && searchOk;
  });
}

function onDictSearch(val) {
  dictState.search = val;
  var exercises = filterExercises();
  el('dict-list').innerHTML = exercises.length
    ? exercises.map(function(ex) { return renderExerciseCard(ex); }).join('')
    : renderEmptyDict();
}

function setDictCategory(cat) {
  dictState.category = cat;
  el('dict-chips').innerHTML = renderCategoryChips();
  var exercises = filterExercises();
  el('dict-list').innerHTML = exercises.length
    ? exercises.map(function(ex) { return renderExerciseCard(ex); }).join('')
    : renderEmptyDict();
}

function setDictMode(mode) {
  dictState.mode = mode;
  if (mode !== 'all') { STATE.mode = mode; Store.save('mode', mode); }
  renderDictionary();
}

function renderEmptyDict() {
  return '<div class="empty-state">' +
    icon('search', 40) +
    '<p>No exercises match your filters.</p>' +
    '<button class="btn btn-ghost btn-sm mt-12" onclick="setDictCategory(\'all\');setDictMode(\'all\')">Clear Filters</button>' +
  '</div>';
}
