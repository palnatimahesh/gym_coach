/* FOOD LOG - ES5
   Quick meal logging against the daily calorie / protein targets.
   Store key "meals": { "YYYY-MM-DD": [ { id, name, kcal, p, c, f } ] }  (60 days kept) */

var FoodLog = (function() {

  var KEEP_DAYS = 60;
  var LIMITS = { kcal: 5000, p: 400, c: 800, f: 400 };
  var LABELS = { kcal: 'calories', p: 'protein', c: 'carbs', f: 'fat' };

  function all() { return Store.get('meals', {}); }

  /* On/off switch. Until the user decides, it is on only if they already logged meals. */
  function enabled() {
    var v = Store.get('foodlog_on', null);
    if (v !== null) return v === true;
    var map = all();
    return Object.keys(map).some(function(d) { return map[d].length > 0; });
  }
  function setEnabled(on) { Store.save('foodlog_on', !!on); }

  function num(v) {
    if (v === '' || v === null || v === undefined) return null;
    var n = parseFloat(v);
    return isNaN(n) || n < 0 ? NaN : n;
  }

  /* raw: { name, kcal, p, c, f } as typed. Returns { entry } or { error } */
  function validate(raw) {
    var name = String(raw.name || '').trim().slice(0, 40);
    if (!name) return { error: 'Give the food a name' };
    var v = { kcal: num(raw.kcal), p: num(raw.p), c: num(raw.c), f: num(raw.f) };
    var keys = Object.keys(v);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (v[k] !== null && (isNaN(v[k]) || v[k] > LIMITS[k])) return { error: 'Check the ' + LABELS[k] + ' value' };
    }
    if (v.kcal === null && v.p === null && v.c === null && v.f === null) return { error: 'Enter calories or macros' };
    var p = v.p || 0, c = v.c || 0, f = v.f || 0;
    var kcal = v.kcal !== null ? v.kcal : (4 * p + 4 * c + 9 * f);
    return { entry: { name: name, kcal: Math.round(kcal), p: Math.round(p * 10) / 10, c: Math.round(c * 10) / 10, f: Math.round(f * 10) / 10 } };
  }

  function entries(date) { return all()[date || HistoryStore.localDate()] || []; }

  function add(raw, date) {
    var res = validate(raw);
    if (res.error) return res;
    var d = date || HistoryStore.localDate();
    var map = all();
    var e = res.entry;
    e.id = Date.now() + Math.floor(Math.random() * 1000);
    (map[d] = map[d] || []).push(e);
    var days = Object.keys(map).sort();
    while (days.length > KEEP_DAYS) delete map[days.shift()];
    Store.save('meals', map);
    return { entry: e };
  }

  function remove(id, date) {
    var d = date || HistoryStore.localDate();
    var map = all();
    var list = map[d] || [];
    var next = list.filter(function(e) { return e.id !== id; });
    if (next.length === list.length) return false;
    map[d] = next;
    Store.save('meals', map);
    return true;
  }

  function totals(date) {
    var t = { kcal: 0, p: 0, c: 0, f: 0 };
    entries(date).forEach(function(e) { t.kcal += e.kcal; t.p += e.p; t.c += e.c; t.f += e.f; });
    t.p = Math.round(t.p); t.c = Math.round(t.c); t.f = Math.round(t.f);
    return t;
  }

  /* Distinct recent foods (newest first) for one-tap re-adding */
  function recent(limit) {
    var map = all(), seen = {}, out = [];
    Object.keys(map).sort().reverse().forEach(function(d) {
      map[d].slice().reverse().forEach(function(e) {
        var key = e.name.toLowerCase();
        if (!seen[key] && out.length < (limit || 8)) { seen[key] = true; out.push(e); }
      });
    });
    return out;
  }

  return { enabled: enabled, setEnabled: setEnabled, validate: validate, add: add, remove: remove, entries: entries, totals: totals, recent: recent };
})();
