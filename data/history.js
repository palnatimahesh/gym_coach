/* --- HISTORY DATA LAYER --- ES5 --- */
/* All read/write goes through HistoryStore, which sits on Store (app.js) raw layer. */

var HistoryStore = (function() {

  var KEYS = {
    sessions:     'ac_sessions',      // array of workout session objects (newest first)
    measurements: 'ac_measurements',  // array of body measurement entries
    water:        'ac_water',         // { date: litres }
    weight:       'ac_weight',        // array of { date, value, unit }
    checklist:    'ac_checklist'
  };
  var MAX_SESSIONS = 300;

  function load(key, def) {
    var v = Store.rawGet(key);
    if (v === null) return def;
    try { return JSON.parse(v); } catch(e) { return def; }
  }

  function save(key, val) { return Store.rawSet(key, JSON.stringify(val)); }

  /* Local date string YYYY-MM-DD (never UTC - avoids off-by-one near midnight) */
  function localDate(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  /* '10-12' -> {lo:10,hi:12}; '8/side' -> {lo:8,hi:8}; 'Work to 1-3RM' -> {lo:1,hi:3} */
  function parseRepRange(spec) {
    var s = String(spec || '');
    var r = s.match(/(\d+)\s*-\s*(\d+)/);
    if (r) return { lo: parseInt(r[1], 10), hi: parseInt(r[2], 10) };
    var n = s.match(/(\d+)/);
    if (n) return { lo: parseInt(n[1], 10), hi: parseInt(n[1], 10) };
    return { lo: 8, hi: 12 };
  }

  /* Smallest sensible load jump per exercise (kg; doubled when units are lb) */
  function increment(exerciseId) {
    var ex = (typeof EXERCISES !== 'undefined') ? EXERCISES[exerciseId] : null;
    var inc = 2.5;
    if (ex) {
      if (ex.equipment === 'dumbbell') inc = 2;
      else if (ex.category === 'legs' || exerciseId === 'deadlift' || exerciseId === 'rdl' || exerciseId === 'trap_bar_deadlift') inc = 5;
      else if (ISOLATION_MUSCLES[ex.muscle]) inc = 1.25;
    }
    return (typeof STATE !== 'undefined' && STATE.settings.units === 'lbs') ? inc * 2 : inc;
  }

  function roundLoad(w) { return Math.round(w * 2) / 2; }

  var ISOLATION_MUSCLES = { biceps: true, triceps: true, side_delt: true, rear_delt: true, forearms: true, calves: true };

  /* Monday (YYYY-MM-DD) of the week containing dateStr (default today). Built from parts: no UTC drift. */
  function mondayOf(dateStr) {
    var d = new Date();
    if (dateStr) { var p = dateStr.split('-'); d = new Date(+p[0], +p[1] - 1, +p[2]); }
    return localDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1)));
  }

  /* Epley estimate */
  function e1rm(w, r) { return w * (1 + r / 30); }

  /* Done sets with a real load and rep count */
  function loadedSets(e) {
    return (e.sets || []).filter(function(s) { return s.done && parseFloat(s.weight) > 0 && parseInt(s.reps, 10) > 0; });
  }

  return {
    localDate: localDate,
    mondayOf: mondayOf,
    parseRepRange: parseRepRange,

    /* ---- ANALYTICS ---- */
    /* Lifts that have at least one loaded set, most-logged first */
    getTrackedExercises: function() {
      var counts = {};
      load(KEYS.sessions, []).forEach(function(s) {
        (s.exercises || []).forEach(function(e) { if (loadedSets(e).length) counts[e.id] = (counts[e.id] || 0) + 1; });
      });
      return Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; })
        .map(function(id) { return { id: id, count: counts[id] }; });
    },

    /* Best estimated 1RM per session, oldest -> newest. Reduced (deload) sessions are kept; the chart should show them. */
    getStrengthSeries: function(exerciseId, limit) {
      var out = [];
      load(KEYS.sessions, []).forEach(function(s) {
        var best = 0, top = null;
        (s.exercises || []).forEach(function(e) {
          if (e.id !== exerciseId) return;
          loadedSets(e).forEach(function(x) {
            var w = parseFloat(x.weight), r = parseInt(x.reps, 10);
            if (r > 12) return; // Epley is unreliable above 12 reps
            var est = e1rm(w, r);
            if (est > best) { best = est; top = { weight: w, reps: r }; }
          });
        });
        if (top) out.push({ date: s.date, value: Math.round(best * 10) / 10, top: top });
      });
      out = out.slice(0, limit || 30);
      return out.reverse();
    },

    /* Tonnes lifted per week for the last N weeks, oldest -> newest */
    getWeeklyVolume: function(weeks) {
      weeks = weeks || 8;
      var now = new Date();
      var keys = [], vol = {};
      for (var i = weeks - 1; i >= 0; i--) {
        var k = mondayOf(localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7)));
        keys.push(k); vol[k] = 0;
      }
      load(KEYS.sessions, []).forEach(function(s) {
        var k = mondayOf(s.date);
        if (!(k in vol)) return;
        (s.exercises || []).forEach(function(e) {
          loadedSets(e).forEach(function(x) { vol[k] += parseFloat(x.weight) * parseInt(x.reps, 10); });
        });
      });
      return keys.map(function(k) { return { week: k, tonnes: Math.round(vol[k] / 100) / 10 }; });
    },

    /* ---- SESSIONS ---- */
    getSessions: function() { return load(KEYS.sessions, []); },

    saveSession: function(session) {
      var sessions = load(KEYS.sessions, []);
      sessions.unshift(session);
      if (sessions.length > MAX_SESSIONS) sessions = sessions.slice(0, MAX_SESSIONS);
      return save(KEYS.sessions, sessions);
    },

    updateSessionNote: function(id, note) {
      var all = load(KEYS.sessions, []);
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) { all[i].note = String(note || '').slice(0, 300); return save(KEYS.sessions, all); }
      }
      return false;
    },

    deleteSession: function(id) {
      var all = load(KEYS.sessions, []);
      var next = all.filter(function(s) { return s.id !== id; });
      return next.length === all.length ? false : save(KEYS.sessions, next);
    },

    /* skipReduced: ignore deload / low-readiness sessions (their loads are not a baseline) */
    getLastSession: function(exerciseId, skipReduced) {
      var sessions = load(KEYS.sessions, []);
      for (var i = 0; i < sessions.length; i++) {
        if (skipReduced && sessions[i].reduced) continue;
        var exs = sessions[i].exercises || [];
        for (var j = 0; j < exs.length; j++) {
          if (exs[j].id === exerciseId && exs[j].sets && exs[j].sets.length) return exs[j];
        }
      }
      return null;
    },

    getExerciseHistory: function(exerciseId, limit) {
      limit = limit || 10;
      var out = [];
      load(KEYS.sessions, []).forEach(function(s) {
        (s.exercises || []).forEach(function(e) {
          if (e.id === exerciseId && e.sets && e.sets.length) out.push({ date: s.date, sets: e.sets });
        });
      });
      return out.slice(0, limit);
    },

    getSessionsThisWeek: function() {
      var now    = new Date();
      var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      var from   = localDate(monday);
      return load(KEYS.sessions, []).filter(function(s) { return s.date >= from; });
    },

    /* ---- MEASUREMENTS ---- */
    getMeasurements: function() { return load(KEYS.measurements, []); },

    saveMeasurement: function(entry) {
      var list  = load(KEYS.measurements, []);
      var today = entry.date || localDate();
      entry.date = today;
      var idx = list.findIndex(function(m) { return m.date === today; });
      if (idx >= 0) list[idx] = entry; else list.unshift(entry);
      if (list.length > 365) list = list.slice(0, 365);
      save(KEYS.measurements, list);
    },

    getLatestMeasurement: function() {
      var list = load(KEYS.measurements, []);
      return list.length ? list[0] : null;
    },

    /* ---- WEIGHT LOG ---- */
    getWeightLog: function() { return load(KEYS.weight, []); },

    logWeight: function(value, unit) {
      var v = parseFloat(value);
      if (isNaN(v) || v < 20 || v > 400) return false;
      var log   = load(KEYS.weight, []);
      var today = localDate();
      var idx   = log.findIndex(function(w) { return w.date === today; });
      var entry = { date: today, value: v, unit: unit || 'kg' };
      if (idx >= 0) log[idx] = entry; else log.unshift(entry);
      if (log.length > 365) log = log.slice(0, 365);
      save(KEYS.weight, log);
      return true;
    },

    /* ---- WATER ---- */
    getWaterToday: function() { return load(KEYS.water, {})[localDate()] || 0; },

    addWater: function(litres) {
      var today = localDate();
      var water = load(KEYS.water, {});
      water[today] = Math.min(6, (water[today] || 0) + litres);
      var keys = Object.keys(water).sort().reverse();
      if (keys.length > 30) {
        var trimmed = {};
        keys.slice(0, 30).forEach(function(k) { trimmed[k] = water[k]; });
        water = trimmed;
      }
      save(KEYS.water, water);
      return water[today];
    },

    resetWaterToday: function() {
      var water = load(KEYS.water, {});
      water[localDate()] = 0;
      save(KEYS.water, water);
    },

    /* ---- DOUBLE PROGRESSION ----
       Hit top of rep range on every set at working weight -> add load.
       Below bottom of range -> drop ~5%. Otherwise same load, +1 rep.
       Deload week (model.deload) -> scale last working load by model.loadPct. */
    getOverloadSuggestion: function(exerciseId, repsSpec, model) {
      var last = this.getLastSession(exerciseId, true);
      if (!last || !last.sets) return null;

      var done = last.sets.filter(function(s) { return s.done && parseFloat(s.weight) > 0 && parseInt(s.reps, 10) > 0; });
      if (!done.length) return null;

      var range      = parseRepRange(repsSpec);
      var lastWeight = Math.max.apply(null, done.map(function(s) { return parseFloat(s.weight); }));
      var atWeight   = done.filter(function(s) { return parseFloat(s.weight) === lastWeight; });
      var minReps    = Math.min.apply(null, atWeight.map(function(s) { return parseInt(s.reps, 10); }));
      var lastReps   = parseInt(atWeight[atWeight.length - 1].reps, 10);

      var out = { lastWeight: lastWeight, lastReps: lastReps, maxReps: minReps, suggestedReps: null };

      var catchUp = !!(model && model.catchUp);
      if (model && model.loadPct < 100) {
        out.suggestedWeight = roundLoad(lastWeight * model.loadPct / 100);
        out.tip = (model.deload ? 'Deload week. ' : 'Reduced load today. ') + 'Use ' + out.suggestedWeight + ' for crisp, easy reps.';
      } else if (minReps >= (catchUp ? range.lo : range.hi)) {
        out.suggestedWeight = roundLoad(lastWeight + increment(exerciseId) * (catchUp ? 2 : 1));
        out.tip = (catchUp ? 'Re-building: ' : 'All sets hit ' + range.hi + ' reps. ') + 'Add weight today.';
      } else if (minReps < range.lo) {
        out.suggestedWeight = roundLoad(lastWeight * 0.95);
        out.tip = 'Missed the ' + range.lo + '-' + range.hi + ' range. Drop ~5% and rebuild.';
      } else {
        out.suggestedWeight = lastWeight;
        out.suggestedReps   = Math.min(range.hi, minReps + 1);
        out.tip = 'Same weight. Aim for ' + out.suggestedReps + ' reps on every set.';
      }
      return out;
    }
  };
})();
