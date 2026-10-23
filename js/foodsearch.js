/* FOOD SEARCH + BARCODE (Open Food Facts) - ES5
   Needs internet. Search text / barcodes are sent to world.openfoodfacts.org. Results are untrusted
   external data: always escaped, always validated before use. */

var FoodSearch = (function() {

  var HOST = 'https://world.openfoodfacts.org';
  var FIELDS = 'code,product_name,brands,nutriments,serving_quantity';
  var results = [];

  /* Overridable in tests */
  function getJson(url) {
    var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function() { if (ctl) ctl.abort(); }, 12000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function(r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('Food database unavailable (' + r.status + ')');
      return r.json();
    }, function() {
      clearTimeout(timer);
      throw new Error('No connection to the food database.');
    });
  }

  function n(v) { var x = parseFloat(v); return isNaN(x) || x < 0 ? null : x; }

  /* Open Food Facts product -> { name, brand, kcal, p, c, f (per 100 g), servingG } or null when unusable */
  function normalize(prod) {
    if (!prod || !prod.nutriments) return null;
    var nu = prod.nutriments;
    var kcal = n(nu['energy-kcal_100g']);
    if (kcal === null && n(nu['energy_100g']) !== null) kcal = Math.round(n(nu['energy_100g']) / 4.184);
    var p = n(nu['proteins_100g']), c = n(nu['carbohydrates_100g']), f = n(nu['fat_100g']);
    if (kcal === null && p === null && c === null && f === null) return null;
    if (kcal === null) kcal = Math.round(4 * (p || 0) + 4 * (c || 0) + 9 * (f || 0));
    var name = String(prod.product_name || '').trim();
    if (!name) return null;
    return {
      name: name.slice(0, 60), brand: String(prod.brands || '').split(',')[0].trim().slice(0, 30),
      kcal: kcal, p: p || 0, c: c || 0, f: f || 0, servingG: n(prod.serving_quantity)
    };
  }

  function scale(per100, grams) {
    var k = grams / 100;
    return { kcal: Math.round(per100.kcal * k), p: Math.round(per100.p * k * 10) / 10, c: Math.round(per100.c * k * 10) / 10, f: Math.round(per100.f * k * 10) / 10 };
  }

  function search(q) {
    q = String(q || '').trim().slice(0, 60);
    if (q.length < 2) return Promise.reject(new Error('Type at least 2 letters'));
    var url = HOST + '/cgi/search.pl?search_simple=1&action=process&json=1&page_size=12&fields=' + FIELDS + '&search_terms=' + encodeURIComponent(q);
    return api.getJson(url).then(function(res) {
      return (res.products || []).map(normalize).filter(Boolean);
    });
  }

  function byBarcode(code) {
    code = String(code || '').replace(/\D/g, '');
    if (code.length < 6 || code.length > 14) return Promise.reject(new Error('Not a valid barcode'));
    return api.getJson(HOST + '/api/v2/product/' + code + '.json?fields=' + FIELDS).then(function(res) {
      var p = res && res.status === 1 ? normalize(res.product) : null;
      if (!p) throw new Error('Product not found. Add it by hand below.');
      return p;
    });
  }

  /* Google code scanner (no camera permission needed). Resolves with the barcode text. */
  function scan() {
    var P = Native.plugin('BarcodeScanner');
    if (!P) return Promise.reject(new Error('Scanning works in the Android app.'));
    return P.isGoogleBarcodeScannerModuleAvailable().then(function(r) {
      if (!r.available) {
        return P.installGoogleBarcodeScannerModule().then(function() { throw new Error('Installing the scanner. Try again in a minute.'); });
      }
      return P.scan({ formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E'] });
    }).then(function(res) {
      var b = res.barcodes && res.barcodes[0];
      if (!b || !b.rawValue) throw new Error('No barcode found');
      return b.rawValue;
    });
  }

  /* ---- UI ---- */
  function card() {
    return '<div class="card mb-12"><div style="font-size:0.85rem;font-weight:700;margin-bottom:10px">Search food</div>' +
      '<div style="display:flex;gap:8px"><input type="search" id="food-q" placeholder="e.g. paneer, oats" maxlength="60" style="flex:1" onkeydown="if(event.key===\'Enter\')foodSearchRun()">' +
      '<button class="btn btn-secondary btn-sm" onclick="foodSearchRun()">Search</button>' +
      (Native.isNative() ? '<button class="btn btn-secondary btn-sm" onclick="foodScan()">Scan</button>' : '') + '</div>' +
      '<div id="food-results" style="margin-top:8px"></div></div>';
  }

  function setResults(list, message) {
    results = list;
    var host = document.getElementById('food-results');
    if (!host) return;
    if (message) { host.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted)">' + esc(message) + '</p>'; return; }
    host.innerHTML = list.map(function(r, i) {
      var g = r.servingG ? Math.round(r.servingG) : 100;
      return '<div style="padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:0.88rem;font-weight:600">' + esc(r.name) + (r.brand ? ' <span style="font-weight:400;color:var(--text-muted)">' + esc(r.brand) + '</span>' : '') + '</div>' +
        '<div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px">Per 100 g: ' + Math.round(r.kcal) + ' kcal, P ' + Math.round(r.p) + ' / C ' + Math.round(r.c) + ' / F ' + Math.round(r.f) + '</div>' +
        '<div style="display:flex;gap:8px;align-items:center"><input type="number" id="fg-' + i + '" value="' + g + '" min="1" max="2000" inputmode="decimal" style="width:90px"><span style="font-size:0.8rem;color:var(--text-muted)">grams</span>' +
        '<button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="foodAddResult(' + i + ')">Add</button></div></div>';
    }).join('');
  }

  var api = { getJson: getJson, normalize: normalize, scale: scale, search: search, byBarcode: byBarcode, scan: scan, card: card, setResults: setResults,
              results: function() { return results; } };
  return api;
})();

function foodSearchRun() {
  var q = document.getElementById('food-q');
  FoodSearch.setResults([], 'Searching...');
  FoodSearch.search(q ? q.value : '').then(function(list) {
    FoodSearch.setResults(list, list.length ? '' : 'No results. Add it by hand below.');
  }).catch(function(e) { FoodSearch.setResults([], e.message); });
}

function foodScan() {
  FoodSearch.scan().then(function(code) {
    FoodSearch.setResults([], 'Looking up ' + code + '...');
    return FoodSearch.byBarcode(code);
  }).then(function(p) { FoodSearch.setResults([p]); })
    .catch(function(e) { FoodSearch.setResults([], e.message); });
}

function foodAddResult(i) {
  var r = FoodSearch.results()[i];
  var inp = document.getElementById('fg-' + i);
  var grams = inp ? parseFloat(inp.value) : NaN;
  if (!r || isNaN(grams) || grams <= 0 || grams > 2000) { showToast('Enter the grams eaten', 'warning'); return; }
  var s = FoodSearch.scale(r, grams);
  var res = FoodLog.add({ name: r.name + ' (' + Math.round(grams) + 'g)', kcal: s.kcal, p: s.p, c: s.c, f: s.f });
  if (res.error) { showToast(res.error, 'warning'); return; }
  showToast('Added ' + r.name, 'success');
  renderNutrition();
}
