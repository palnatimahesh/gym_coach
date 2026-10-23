/* PLAN EDITOR - ES5
   Lets the user change the exercises, sets and reps of any training day. Edits are stored separately
   (Store "planedits") and applied on top of the built-in programme, so "reset to default" is always possible.
   Every screen reads PROGRAMS directly, so applying edits in place updates the whole app. */

var Plan = (function() {

  var original = null;   // pristine copy of every day's exercises + core finisher
  var draft = null;      // { phase, day, main: [], core: [] } while the editor is open

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function key(p, d) { return p + ':' + d; }
  function edits() { return Store.get('planedits', {}); }

  function snapshot() {
    if (original) return;
    original = {};
    PROGRAMS.phases.forEach(function(ph) {
      ph.schedule.forEach(function(s, d) {
        if (s.exercises) original[key(ph.id, d)] = { main: clone(s.exercises), core: clone(s.coreFinisher || []) };
      });
    });
  }

  /* Put defaults + saved edits into PROGRAMS (safe to call repeatedly) */
  function apply() {
    snapshot();
    var e = edits();
    PROGRAMS.phases.forEach(function(ph) {
      ph.schedule.forEach(function(s, d) {
        var base = original[key(ph.id, d)];
        if (!base) return;
        var o = e[key(ph.id, d)] || base;
        s.exercises = clone(o.main);
        if (o.core.length || s.coreFinisher) s.coreFinisher = clone(o.core);
      });
    });
  }

  /* Clean one row from the editor: unknown exercises are rejected, numbers are bounded */
  function cleanRow(r) {
    if (!r || !EXERCISES[r.id]) return null;
    var sets = parseInt(r.sets, 10);
    var reps = String(r.reps === undefined ? '' : r.reps).replace(/[^0-9a-zA-Z\/\- ]/g, '').trim().slice(0, 12);
    if (isNaN(sets) || sets < 1 || sets > 10 || !reps) return null;
    var out = { id: r.id, sets: sets, reps: reps };
    if (r.note) out.note = String(r.note).slice(0, 120);
    return out;
  }

  function cleanList(list, max) {
    var out = [];
    (list || []).forEach(function(r) { var c = cleanRow(r); if (c && out.length < max) out.push(c); });
    return out;
  }

  /* Returns { ok } or { error } */
  function save(phaseId, day, main, core) {
    var m = cleanList(main, 14), c = cleanList(core, 6);
    if (!m.length) return { error: 'A session needs at least one exercise (check sets 1-10 and reps).' };
    snapshot();
    if (!original[key(phaseId, day)]) return { error: 'This day has no exercises to edit.' };
    var all = edits();
    all[key(phaseId, day)] = { main: m, core: c };
    Store.save('planedits', all);
    apply();
    return { ok: true };
  }

  function reset(phaseId, day) {
    var all = edits();
    delete all[key(phaseId, day)];
    Store.save('planedits', all);
    apply();
  }

  function isEdited(phaseId, day) { return !!edits()[key(phaseId, day)]; }

  /* ---- editor UI ---- */
  function rowHtml(list, i, group) {
    var r = list[i], ex = EXERCISES[r.id];
    return '<div class="plan-row">' +
      '<div class="plan-name">' + esc(ex ? ex.name : r.id) + '</div>' +
      '<input type="number" min="1" max="10" value="' + esc(r.sets) + '" aria-label="Sets" onchange="Plan.setField(\'' + group + '\',' + i + ',\'sets\',this.value)">' +
      '<span>x</span>' +
      '<input type="text" maxlength="12" value="' + esc(r.reps) + '" aria-label="Reps" onchange="Plan.setField(\'' + group + '\',' + i + ',\'reps\',this.value)">' +
      '<button class="plan-btn" aria-label="Move up" onclick="Plan.move(\'' + group + '\',' + i + ',-1)">&#9650;</button>' +
      '<button class="plan-btn" aria-label="Move down" onclick="Plan.move(\'' + group + '\',' + i + ',1)">&#9660;</button>' +
      '<button class="plan-btn" aria-label="Remove" onclick="Plan.remove(\'' + group + '\',' + i + ')">&times;</button>' +
    '</div>';
  }

  function pickerHtml(group) {
    var cats = {};
    Object.keys(EXERCISES).forEach(function(id) {
      var c = EXERCISES[id].category || 'other';
      (cats[c] = cats[c] || []).push(id);
    });
    var opts = Object.keys(cats).sort().map(function(c) {
      return '<optgroup label="' + esc(c) + '">' + cats[c].sort(function(a, b) { return EXERCISES[a].name < EXERCISES[b].name ? -1 : 1; })
        .map(function(id) { return '<option value="' + esc(id) + '">' + esc(EXERCISES[id].name) + '</option>'; }).join('') + '</optgroup>';
    }).join('');
    return '<div class="plan-add"><select id="plan-pick-' + group + '">' + opts + '</select>' +
      '<button class="btn btn-secondary btn-sm" onclick="Plan.add(\'' + group + '\')">Add</button></div>';
  }

  function render() {
    var o = document.getElementById('plan-modal');
    if (!o || !draft) return;
    var ses = PROGRAMS.phases[draft.phase].schedule[draft.day];
    o.innerHTML = '<div class="modal-sheet" style="max-height:88vh;overflow-y:auto"><div class="modal-handle"></div>' +
      '<h3 style="margin-bottom:2px">Edit: ' + esc(ses.focus) + '</h3>' +
      '<p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px">Sets x reps. Use 30s for a timer or 8/side for per-side work. Changes apply to this day every week of this phase.</p>' +
      '<div class="plan-head">Main exercises</div>' + draft.main.map(function(_, i) { return rowHtml(draft.main, i, 'main'); }).join('') + pickerHtml('main') +
      '<div class="plan-head">Core finisher</div>' + (draft.core.length ? draft.core.map(function(_, i) { return rowHtml(draft.core, i, 'core'); }).join('') : '<div style="font-size:0.78rem;color:var(--text-muted);padding:4px 0">None</div>') + pickerHtml('core') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">' +
        '<button class="btn btn-primary" onclick="Plan.commit()">Save</button>' +
        '<button class="btn btn-ghost" onclick="Plan.closeEditor()">Cancel</button>' +
      '</div>' +
      (isEdited(draft.phase, draft.day) ? '<button class="link-btn" onclick="Plan.resetDay()">Reset this day to default</button>' : '') +
    '</div>';
  }

  function openEditor(day) {
    var ses = PROGRAMS.phases[STATE.phase].schedule[day];
    if (!ses || !ses.exercises) return;
    closeEditor();
    draft = { phase: STATE.phase, day: day, main: clone(ses.exercises), core: clone(ses.coreFinisher || []) };
    var o = document.createElement('div');
    o.id = 'plan-modal';
    o.className = 'modal-overlay open';
    o.onclick = function(e) { if (e.target === o) closeEditor(); };
    document.body.appendChild(o);
    render();
  }

  function closeEditor() {
    var o = document.getElementById('plan-modal');
    if (o && o.parentNode) o.parentNode.removeChild(o);
    draft = null;
  }

  function list(group) { return group === 'core' ? draft.core : draft.main; }

  function setField(group, i, field, value) { if (draft && list(group)[i]) list(group)[i][field] = value; }
  function move(group, i, dir) {
    var l = list(group), j = i + dir;
    if (j < 0 || j >= l.length) return;
    var t = l[i]; l[i] = l[j]; l[j] = t;
    render();
  }
  function remove(group, i) { list(group).splice(i, 1); render(); }
  function add(group) {
    var sel = document.getElementById('plan-pick-' + group);
    if (!sel || !EXERCISES[sel.value]) return;
    var ex = EXERCISES[sel.value];
    list(group).push({ id: sel.value, sets: ex.sets || 3, reps: String(ex.reps || '10') });
    render();
  }

  function commit() {
    var res = save(draft.phase, draft.day, draft.main, draft.core);
    if (res.error) { showToast(res.error, 'warning'); return; }
    closeEditor();
    showToast('Session updated', 'success');
    renderPage(STATE.currentPage);
  }

  function resetDay() {
    if (!confirm('Reset this day to the built-in plan?')) return;
    reset(draft.phase, draft.day);
    closeEditor();
    showToast('Reset to default', 'success');
    renderPage(STATE.currentPage);
  }

  return {
    apply: apply, save: save, reset: reset, isEdited: isEdited, cleanRow: cleanRow,
    openEditor: openEditor, closeEditor: closeEditor, setField: setField, move: move, remove: remove, add: add,
    commit: commit, resetDay: resetDay
  };
})();
