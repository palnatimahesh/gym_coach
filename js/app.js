/* --- ATHLETIC COACH PWA - Core App --- ES5 --- */

/* --- POLYFILLS --- */
if (!Object.values) {
  Object.values = function(obj) {
    return Object.keys(obj).map(function(k) { return obj[k]; });
  };
}
if (!Object.entries) {
  Object.entries = function(obj) {
    return Object.keys(obj).map(function(k) { return [k, obj[k]]; });
  };
}
if (!Object.assign) {
  Object.assign = function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (src) Object.keys(src).forEach(function(k) { target[k] = src[k]; });
    }
    return target;
  };
}
if (!Array.from) {
  Array.from = function(arr, mapFn) {
    var result = Array.prototype.slice.call(arr);
    return mapFn ? result.map(mapFn) : result;
  };
}
if (!Array.prototype.find) {
  Array.prototype.find = function(fn) {
    for (var i = 0; i < this.length; i++) {
      if (fn(this[i], i, this)) return this[i];
    }
  };
}
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(fn) {
    for (var i = 0; i < this.length; i++) {
      if (fn(this[i], i, this)) return i;
    }
    return -1;
  };
}
if (!Array.prototype.includes) {
  Array.prototype.includes = function(val) { return this.indexOf(val) !== -1; };
}
if (!String.prototype.includes) {
  String.prototype.includes = function(val) { return this.indexOf(val) !== -1; };
}
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(val) { return this.indexOf(val) === 0; };
}
if (!String.prototype.padStart) {
  String.prototype.padStart = function(len, ch) {
    ch = ch || ' ';
    var s = String(this);
    while (s.length < len) s = ch + s;
    return s;
  };
}
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function(len, ch) {
    ch = ch || ' ';
    var s = String(this);
    while (s.length < len) s = s + ch;
    return s;
  };
}
function objValues(obj) {
  return Object.keys(obj).map(function(k) { return obj[k]; });
}
/* --- END POLYFILLS --- */

/* --- DATA GUARD --- */
window.addEventListener('load', function() {
  var missing = [];
  if (typeof EXERCISES    === 'undefined') missing.push('exercises');
  if (typeof PROGRAMS     === 'undefined') missing.push('programs');
  if (typeof WARMUPS      === 'undefined') missing.push('warmups');
  if (typeof RUNNING_PLAN === 'undefined') missing.push('running');
  if (typeof RECOVERY     === 'undefined') missing.push('recovery');

  if (missing.length > 0) {
    document.body.innerHTML =
      '<div style="padding:32px 20px;text-align:center;font-family:sans-serif;background:#0b0d10;color:#f0f0f8;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
        '<div style="font-size:2rem;margin-bottom:16px">&#x26A0;</div>' +
        '<h2 style="margin-bottom:8px">Loading Error</h2>' +
        '<p style="color:#94a3b0;margin-bottom:8px;font-size:0.9rem">Failed to load: ' + missing.join(', ') + '</p>' +
        '<p style="color:#94a3b0;margin-bottom:24px;font-size:0.85rem">Try refreshing the page.</p>' +
        '<button onclick="window.location.reload()" style="padding:12px 28px;background:#00d4b4;color:white;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer">Reload App</button>' +
      '</div>';
  }
});

/* --- STATE --- */
var STATE = {
  currentPage: 'dashboard',
  mode: 'gym',
  phase: 0,
  weekInPhase: 1,
  runningWeek: 1,
  streak: 0,
  lastWorkoutDate: null,
  completedWorkouts: [],
  personalRecords: {},
  checklist: {},
  settings: {
    units: 'kg',
    notifications: false,
    darkMode: true,
    noPhoneMode: false,
    bodyWeight: 80,
    level: 'experienced'
  }
};

/* --- CONSTANTS --- */
var PAGES = [
  'dashboard','workout','warmup','running','program',
  'progress','nutrition','recovery','settings',
  'dictionary','history','tools'
];

var CATEGORY_ICONS = {
  push: '&#x1F4AA;', pull: '&#x1F517;', legs: '&#x1F9B5;', core: '&#x26A1;',
  mobility: '&#x1F30A;', cardio: '&#x1F3C3;', recovery: '&#x1F50B;'
};

var CATEGORY_COLORS = {
  push:     { bg: 'rgba(0,212,180,0.1)',  color: '#00d4b4' },
  pull:     { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  legs:     { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  core:     { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  mobility: { bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6' },
  cardio:   { bg: 'rgba(99,102,241,0.1)',  color: '#6366f1' },
  recovery: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' }
};

var PHASE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

/* --- HTML ESCAPE (all user-entered text must pass through this) --- */
function esc(s) {
  return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* --- STORAGE --- */
var Store = {
  SCHEMA: 2,
  _mem: {},
  _warned: false,
  /* Raw layer: localStorage with in-memory fallback (private mode / blocked storage) */
  rawGet: function(k) {
    try { var v = localStorage.getItem(k); if (v !== null) return v; } catch(e) {}
    return Object.prototype.hasOwnProperty.call(Store._mem, k) ? Store._mem[k] : null;
  },
  rawSet: function(k, v) {
    Store._mem[k] = v;
    try { localStorage.setItem(k, v); return true; }
    catch(e) {
      if (!Store._warned) {
        Store._warned = true;
        if (typeof showToast === 'function') showToast('Storage full or blocked. Export a backup now.', 'warning');
      }
      return false;
    }
  },
  rawRemove: function(k) {
    delete Store._mem[k];
    try { localStorage.removeItem(k); } catch(e) {}
  },
  keys: function() {
    var out = {}, i;
    try { for (i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('ac_') === 0) out[k] = true; } } catch(e) {}
    Object.keys(Store._mem).forEach(function(k) { if (k.indexOf('ac_') === 0) out[k] = true; });
    return Object.keys(out);
  },
  save: function(key, val) { return Store.rawSet('ac_' + key, JSON.stringify(val)); },
  get: function(key, def) {
    if (def === undefined) def = null;
    var v = Store.rawGet('ac_' + key);
    if (v === null) return def;
    try { return JSON.parse(v); } catch(e) { return def; }
  },
  /* Ask the browser not to evict our data (mobile Chrome/Safari 15.2+) */
  persist: function() {
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch(e) {}
  },
  migrate: function() {
    var v = Store.get('schema', 1);
    if (v < 2) {
      /* v2: default level, resume phase, week anchor */
      var s = Store.get('settings', {});
      if (!s.level) { s.level = 'experienced'; Store.save('settings', s); }
    }
    if (v !== Store.SCHEMA) Store.save('schema', Store.SCHEMA);
  },
  loadAll: function() {
    Store.migrate();
    STATE.phase             = Store.get('phase', 0);
    STATE.weekInPhase       = Store.get('weekInPhase', 1);
    STATE.runningWeek       = Store.get('runningWeek', 1);
    STATE.streak            = Store.get('streak', 0);
    STATE.lastWorkoutDate   = Store.get('lastWorkoutDate', null);
    STATE.completedWorkouts = Store.get('completedWorkouts', []);
    STATE.personalRecords   = Store.get('personalRecords', {});
    STATE.mode              = Store.get('mode', 'gym');
    STATE.checklist         = Store.get('checklist', {});
    var savedSettings       = Store.get('settings', {});
    Object.keys(savedSettings).forEach(function(k) {
      STATE.settings[k] = savedSettings[k];
    });
    updateStreak();
    if (typeof Progression !== 'undefined') Progression.syncWeek();
  },
  saveAll: function() {
    Store.save('phase',             STATE.phase);
    Store.save('weekInPhase',       STATE.weekInPhase);
    Store.save('runningWeek',       STATE.runningWeek);
    Store.save('streak',            STATE.streak);
    Store.save('lastWorkoutDate',   STATE.lastWorkoutDate);
    Store.save('completedWorkouts', STATE.completedWorkouts);
    Store.save('personalRecords',   STATE.personalRecords);
    Store.save('mode',              STATE.mode);
    Store.save('checklist',         STATE.checklist);
    Store.save('settings',          STATE.settings);
  }
};

/* --- STREAK --- */
function updateStreak() {
  if (!STATE.lastWorkoutDate) return;
  var diff = dayDiff(STATE.lastWorkoutDate, todayStr());
  if (diff > 1) STATE.streak = 0;
}

function markWorkoutDone() {
  var today = todayStr();
  if (STATE.lastWorkoutDate === today) return;
  var diff = STATE.lastWorkoutDate ? dayDiff(STATE.lastWorkoutDate, today) : 99;
  STATE.streak = (diff === 1) ? STATE.streak + 1 : 1;
  STATE.lastWorkoutDate = today;
  STATE.completedWorkouts.push(today);
  Store.saveAll();
}

/* --- ROUTER --- */
/* Bottom tabs own sections; pages inside a section get a segmented sub-tab bar. */
var SECTIONS = {
  home:     { pages: ['dashboard'] },
  train:    { pages: ['workout', 'warmup', 'running', 'program'], names: { workout: 'Workout', warmup: 'Warmup', running: 'Run', program: 'Plan' } },
  progress: { pages: ['progress', 'history'], names: { progress: 'Stats', history: 'History' } },
  fuel:     { pages: ['nutrition', 'recovery', 'tools'], names: { nutrition: 'Nutrition', recovery: 'Recovery', tools: 'Tools' } },
  more:     { pages: ['settings', 'dictionary'], names: { settings: 'Settings', dictionary: 'Library' } }
};
var SECTION_LAST = {};

function sectionOf(page) {
  for (var k in SECTIONS) if (SECTIONS[k].pages.indexOf(page) !== -1) return k;
  return 'home';
}

function renderSubtabs(page) {
  var host = el('subtabs');
  if (!host) return;
  var sec = SECTIONS[sectionOf(page)];
  if (sec.pages.length < 2) { host.style.display = 'none'; host.innerHTML = ''; return; }
  host.style.display = 'flex';
  host.innerHTML = sec.pages.map(function(p) {
    var on = p === page;
    return '<button class="subtab' + (on ? ' active' : '') + '" role="tab" aria-selected="' + on + '" onclick="navigate(\'' + p + '\')">' + sec.names[p] + '</button>';
  }).join('');
}

function navigate(page) {
  if (PAGES.indexOf(page) === -1) return;

  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');

  var navItems = document.querySelectorAll('.nav-item');
  for (var j = 0; j < navItems.length; j++) navItems[j].classList.remove('active');

  var pageEl = document.getElementById('page-' + page);
  if (pageEl) { pageEl.classList.add('active'); pageEl.scrollTop = 0; }

  var section = sectionOf(page);
  SECTION_LAST[section] = page;
  var navEl = document.querySelector('[data-section="' + section + '"]');
  if (navEl) navEl.classList.add('active');
  renderSubtabs(page);

  STATE.currentPage = page;
  renderPage(page);
}

function renderPage(page) {
  try {
    switch(page) {
      case 'dashboard':  renderDashboard(); break;
      case 'program':    renderProgram();   break;
      case 'workout':    renderWorkout();   break;
      case 'dictionary': renderDictionary();break;
      case 'warmup':     renderWarmup();    break;
      case 'running':    renderRunning();   break;
      case 'recovery':   renderRecovery();  break;
      case 'history':    renderHistory();   break;
      case 'progress':   renderProgress();  break;
      case 'nutrition':  renderNutrition(); break;
      case 'tools':      renderTools();     break;
      case 'settings':   renderSettings();  break;
    }
  } catch(e) {
    var contentEl = el(page + '-content');
    if (contentEl) {
      contentEl.innerHTML =
        '<div style="padding:24px;text-align:center">' +
          '<h3 style="margin-bottom:8px">Something went wrong</h3>' +
          '<p style="font-size:0.87rem;color:#94a3b0;margin-bottom:16px">' + esc(e.message || 'Unknown error') + '</p>' +
          '<button class="btn btn-secondary" onclick="renderPage(\'' + page + '\')">Try Again</button>' +
        '</div>';
    }
    console.error('renderPage [' + page + ']:', e);
  }
}

/* --- UTILITIES --- */
function todayStr() {
  var d = new Date();
  var mm = String(d.getMonth() + 1);
  var dd = String(d.getDate());
  if (mm.length < 2) mm = '0' + mm;
  if (dd.length < 2) dd = '0' + dd;
  return d.getFullYear() + '-' + mm + '-' + dd;
}

function dayDiff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function formatTime(secs) {
  secs = Math.max(0, secs);
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function el(id) { return document.getElementById(id); }

function qs(sel, ctx) {
  return (ctx || document).querySelector(sel);
}

function qsa(sel, ctx) {
  var nodes = (ctx || document).querySelectorAll(sel);
  var arr   = [];
  for (var i = 0; i < nodes.length; i++) arr.push(nodes[i]);
  return arr;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? parseInt(result[1],16) + ',' + parseInt(result[2],16) + ',' + parseInt(result[3],16)
    : '255,255,255';
}

function getPhaseColor(phaseId) {
  return PHASE_COLORS[phaseId] || '#6366f1';
}

function getExerciseName(id) {
  return (typeof EXERCISES !== 'undefined' && EXERCISES[id]) ? EXERCISES[id].name : id;
}

function getDifficultyBadge(d) {
  var map = {
    1: ['badge-green',  'Beginner'],
    2: ['badge-yellow', 'Inter.'],
    3: ['badge-red',    'Advanced']
  };
  var entry = map[d] || ['badge-muted', '?'];
  return '<span class="badge ' + entry[0] + '">' + entry[1] + '</span>';
}

/* --- ICONS --- */
function icon(name, size) {
  size = size || 20;
  var icons = {
    home:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    layers:       '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    dumbbell:     '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M18 4v16M3 8h6M15 8h6M3 16h6M15 16h6"/></svg>',
    book:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    run:          '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="5" r="1"/><path d="M4 17l5-9 3 2 3-4 4 6"/><path d="M8 20l3-5 2 2 3-5"/></svg>',
    flame:        '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>',
    settings:     '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    check:        '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    chevron_down: '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    play:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    pause:        '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
    refresh:      '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
    swap:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>',
    warning:      '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    star:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    trophy:       '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H4a2 2 0 000 4c0 1.333.667 2.5 2 3.5"/><path d="M17 4h3a2 2 0 010 4c0 1.333-.667 2.5-2 3.5"/><path d="M7 4h10v8a5 5 0 01-10 0V4z"/></svg>',
    heart:        '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    sun:          '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    info:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    zap:          '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    search:       '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    filter:       '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    close:        '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    award:        '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    snow:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 7l-5-5-5 5"/><path d="M17 17l-5 5-5-5"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M7 7l-5 5 5 5"/><path d="M17 7l5 5-5 5"/></svg>',
    push:         '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M18 4v16M3 8h6M15 8h6M3 16h6M15 16h6"/></svg>',
    layers2:      '<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
  };
  var svg = icons[name] || icons['dumbbell'];
  return svg.replace(/SIZE/g, String(size));
}

/* --- MODAL: SWAP --- */
var swapCallback = null;

function openSwapModal(exerciseId, onSwap) {
  swapCallback = onSwap;
  var ex = EXERCISES[exerciseId];
  if (!ex || !ex.alternatives || !ex.alternatives.length) {
    showToast('No alternatives for this exercise.');
    return;
  }

  var reasonLabels = {
    equipment_occupied: 'Equip. Occupied', too_hard: 'Too Hard',
    too_easy: 'Too Easy', injury: 'Injury', no_equipment: 'No Equip.',
    variation: 'Variation', knee_issue: 'Knee Issue'
  };

  // Sort mode-compatible alternatives first
  var sorted = ex.alternatives.slice().sort(function(a, b) {
    var aOk = EXERCISES[a.id] && EXERCISES[a.id].mode.indexOf(STATE.mode) !== -1;
    var bOk = EXERCISES[b.id] && EXERCISES[b.id].mode.indexOf(STATE.mode) !== -1;
    return (bOk ? 1 : 0) - (aOk ? 1 : 0);
  });

  var alts = sorted.map(function(a) {
    var altEx = EXERCISES[a.id];
    if (!altEx) return '';
    var modeOk  = altEx.mode.indexOf(STATE.mode) !== -1;
    var reasons = a.reason.map(function(r) {
      return '<span class="badge badge-muted" style="font-size:0.68rem">' + (reasonLabels[r] || r) + '</span>';
    }).join(' ');
    return '<div class="alt-exercise" onclick="selectSwap(\'' + a.id + '\')" style="' + (modeOk ? 'border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.05)' : 'opacity:0.6') + '">' +
      '<div style="flex:1;min-width:0">' +
        '<div class="alt-name" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
          altEx.name +
          (modeOk ? '<span class="badge badge-green" style="font-size:0.65rem">' + STATE.mode + '</span>' : '<span class="badge badge-muted" style="font-size:0.65rem">' + altEx.mode.join('/') + '</span>') +
        '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">' + reasons + '</div>' +
      '</div>' +
      '<span style="flex-shrink:0;color:var(--text-muted)">' + icon('chevron_down', 14) + '</span>' +
    '</div>';
  }).filter(Boolean).join('');

  var modal   = el('swap-modal');
  var content = el('swap-modal-content');
  content.innerHTML =
    '<div class="modal-handle"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div><h3>Swap Exercise</h3><p style="font-size:0.83rem;color:var(--text-muted);margin-top:2px">Replacing: ' + ex.name + '</p></div>' +
      '<button class="btn btn-ghost btn-sm" onclick="closeSwapModal()">' + icon('close', 16) + '</button>' +
    '</div>' +
    '<div>' + alts + '</div>' +
    '<div class="divider"></div>' +
    '<button class="btn btn-ghost btn-full btn-sm" onclick="closeSwapModal()">Keep Original</button>';

  modal.classList.add('open');
}

function selectSwap(id) {
  closeSwapModal();
  if (swapCallback) swapCallback(id);
}

function closeSwapModal() {
  el('swap-modal').classList.remove('open');
  swapCallback = null;
}

/* --- TOAST --- */
function showToast(msg, type, onClick) {
  type = type || 'default';
  var existing = document.querySelector('.toast');
  if (existing) existing.parentNode.removeChild(existing);
  var t = document.createElement('div');
  t.className = 'toast';
  var colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', default: '#333355' };
  t.style.cssText = 'position:fixed;bottom:calc(var(--bottom-nav) + 16px);left:50%;transform:translateX(-50%);' +
    'background:' + (colors[type] || colors.default) + ';color:white;padding:10px 20px;border-radius:100px;' +
    'font-size:0.875rem;font-weight:600;z-index:300;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,0.4);';
  t.textContent = msg;
  if (onClick) { t.style.cursor = 'pointer'; t.addEventListener('click', onClick); }
  document.body.appendChild(t);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, onClick ? 8000 : 2500);
}

/* --- SOUND TOGGLE --- */
function toggleGlobalSound() {
  var on  = SoundSystem.toggle();
  var btn = el('global-sound-btn');
  if (btn) btn.classList.toggle('muted', !on);
  Store.save('soundEnabled', on);
  showToast('Sound ' + (on ? 'on' : 'off'));
}

/* --- WATER REMINDER --- */
function checkWaterReminder() {
  if (typeof HistoryStore === 'undefined') return;
  var water  = HistoryStore.getWaterToday();
  var target = (STATE.settings.bodyWeight || 80) * 0.035;
  var now    = Date.now();
  var last   = parseInt(Store.rawGet('ac_water_reminder') || '0');
  if (water < target * 0.5 && (now - last) > 3600000) {
    Store.rawSet('ac_water_reminder', String(now));
    showToast('Drink water. ' + water.toFixed(1) + 'L of ' + target.toFixed(1) + 'L target.', 'warning');
  }
}
setInterval(checkWaterReminder, 1800000);

/* --- PWA INSTALL --- */
var deferredInstall = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredInstall = e;
  var btn = el('install-btn');
  if (btn) btn.classList.remove('hidden');
});

function triggerInstall() {
  if (deferredInstall) {
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function(r) {
      if (r.outcome === 'accepted') showToast('App installed!', 'success');
    });
    deferredInstall = null;
  }
}

/* --- SERVICE WORKER --- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('./sw.js').catch(function() {});
    /* New SW took over: offer reload (never interrupt an active workout) */
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (!hadController) { hadController = true; return; }
      showToast('Update ready. Tap to reload.', 'success', function() { location.reload(); });
    });
  });
}

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', function() {
  Store.loadAll();
  Store.persist();

  // Restore sound
  var soundOn = Store.get('soundEnabled', true);
  if (!soundOn && typeof SoundSystem !== 'undefined') SoundSystem.disable();
  var sBtn = el('global-sound-btn');
  if (sBtn && !soundOn) sBtn.classList.add('muted');

  navigate('dashboard');
  setupNavigation();

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeSwapModal();
      if (typeof closeGuide === 'function') closeGuide();
    }
  });
});

function setupNavigation() {
  var navItems = document.querySelectorAll('[data-nav]');
  for (var i = 0; i < navItems.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        if (typeof SoundSystem !== 'undefined') SoundSystem.unlock();
        navigate(SECTION_LAST[btn.getAttribute('data-section')] || btn.getAttribute('data-nav'));
      });
    })(navItems[i]);
  }
}

