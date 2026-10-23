/* --- NUTRITION PAGE --- ES5 --- */

var NUTRITION_GOALS = {
  // Mifflin-St Jeor BMR then TDEE then apply deficit/surplus by goal
  // Activity multiplier: 1.55 (moderately active - training 4-5x/week)
  ACTIVITY_FACTOR: 1.55,

  goals: {
    recomp: {
      label: 'Recomposition',
      description: 'Lose fat AND build muscle simultaneously. Best for beginners and returners. Slight deficit.',
      calorie_modifier: -0.10,  // 10% below TDEE
      protein_per_kg: 2.4,      // high protein to preserve/build muscle in deficit
      fat_per_kg: 0.8,          // enough for testosterone - do not go lower
      badge: 'badge-accent',
      coach: 'Recomp is your best starting point. You lose fat and build muscle at the same time. It is slower than a pure bulk or pure cut but you never look worse - only better. High protein is the key.'
    },
    cut: {
      label: 'Fat Loss (Cut)',
      description: 'Aggressive fat loss while preserving muscle. 500 kcal deficit. Expect 0.5kg loss/week.',
      calorie_modifier: -0.20,  // 20% below TDEE
      protein_per_kg: 2.6,      // even higher protein to prevent muscle loss
      fat_per_kg: 0.7,
      badge: 'badge-yellow',
      coach: 'A 20% deficit causes real fat loss. The high protein (2.6g/kg) is non-negotiable - it is the only thing standing between you and losing muscle. Do not go below 0.7g fat per kg - testosterone will crash.'
    },
    lean_bulk: {
      label: 'Lean Bulk',
      description: 'Build muscle with minimal fat gain. 200-300 kcal surplus. Best after reaching target body fat.',
      calorie_modifier: +0.10,  // 10% above TDEE
      protein_per_kg: 2.2,
      fat_per_kg: 1.0,
      badge: 'badge-green',
      coach: 'A lean bulk adds 200-300 kcal above maintenance. You will gain muscle faster than recomp but some fat is inevitable. Do this only once you are at 12-15% body fat or below.'
    }
  }
};



function renderNutrition() {
  var settings   = STATE.settings;
  var bw         = settings.bodyWeight || 80;
  var heightCm   = settings.heightCm  || 175;
  var age        = settings.age       || 27;
  var goalKey    = settings.nutritionGoal || 'recomp';
  var goal       = NUTRITION_GOALS.goals[goalKey];

  // Mifflin-St Jeor BMR (male)
  var bmr  = (10 * bw) + (6.25 * heightCm) - (5 * age) + 5;
  // TDEE with activity factor
  var tdee = Math.round(bmr * NUTRITION_GOALS.ACTIVITY_FACTOR);
  // Target calories based on goal
  var targetCals = Math.round(tdee * (1 + goal.calorie_modifier));
  // Protein first (fixed per kg)
  var protein    = Math.round(bw * goal.protein_per_kg);
  // Fat second (fixed per kg)
  var fat        = Math.round(bw * goal.fat_per_kg);
  // Carbs fill remaining calories
  var proteinCals= protein * 4;
  var fatCals    = fat * 9;
  var carbCals   = Math.max(0, targetCals - proteinCals - fatCals);
  var carbs      = Math.round(carbCals / 4);
  // Recalculate actual total
  var actualCals = proteinCals + fatCals + (carbs * 4);
  var deficit    = tdee - actualCals;

  el('nutrition-content').innerHTML =
    '<div class="top-header"><h2>Nutrition</h2><span class="badge ' + goal.badge + '">' + goal.label + '</span></div>' +

    // Stats inputs
    '<div class="card mb-12">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">' +
        numberInput('bw-input',     'Weight (kg)', bw,       'updateBodyWeightN(this.value)') +
        numberInput('height-input', 'Height (cm)', heightCm, 'updateHeight(this.value)') +
        numberInput('age-input',    'Age',         age,      'updateAge(this.value)') +
      '</div>' +

      // TDEE breakdown
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' +
        '<div class="card-sm" style="flex:1;text-align:center;min-width:80px">' +
          '<div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">BMR</div>' +
          '<div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">' + Math.round(bmr) + '</div>' +
          '<div style="font-size:0.62rem;color:var(--text-muted)">base kcal</div>' +
        '</div>' +
        '<div class="card-sm" style="flex:1;text-align:center;min-width:80px">' +
          '<div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">TDEE</div>' +
          '<div style="font-size:1.1rem;font-weight:700;color:var(--text-secondary)">' + tdee + '</div>' +
          '<div style="font-size:0.62rem;color:var(--text-muted)">maintenance</div>' +
        '</div>' +
        '<div class="card-sm" style="flex:1;text-align:center;min-width:80px;border-color:' + (deficit > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)') + '">' +
          '<div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">' + (deficit > 0 ? 'Deficit' : 'Surplus') + '</div>' +
          '<div style="font-size:1.1rem;font-weight:700;color:' + (deficit > 0 ? 'var(--green)' : 'var(--yellow)') + '">' + Math.abs(deficit) + '</div>' +
          '<div style="font-size:0.62rem;color:var(--text-muted)">kcal/day</div>' +
        '</div>' +
      '</div>' +

      // Target macro tiles
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">' +
        macroTile(actualCals, 'Target',  'kcal', 'var(--accent)') +
        macroTile(protein,    'Protein', 'g',    'var(--red)') +
        macroTile(carbs,      'Carbs',   'g',    'var(--yellow)') +
        macroTile(fat,        'Fat',     'g',    'var(--green)') +
      '</div>' +
      renderMacroBar(protein, carbs, fat) +

      // Goal context
      '<div style="margin-top:10px;padding:10px;background:rgba(99,102,241,0.07);border-radius:var(--radius-sm);border-left:3px solid #6366f1">' +
        '<div style="font-size:0.72rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">Coach</div>' +
        '<div style="font-size:0.82rem;color:var(--text-secondary)">' + goal.coach + '</div>' +
      '</div>' +
    '</div>' +

    // Goal selector
    renderGoalSelector(goalKey) +

    // Weekly targets
    renderWeeklyTargets(protein, carbs, fat, actualCals) +

    // Foods
    renderTestosteroneFoods() +

    // Meal timing
    renderMealTiming() +

    // Supplements
    renderSupplements() +

    // Hydration
    renderHydration();
}

function numberInput(id, label, value, onchange) {
  return '<div class="input-group" style="margin-bottom:0">' +
    '<label>' + label + '</label>' +
    '<input type="number" id="' + id + '" value="' + value + '" ' +
      'style="width:100%" inputmode="decimal" oninput="' + onchange + '">' +
  '</div>';
}

function renderGoalSelector(activeKey) {
  var goals = NUTRITION_GOALS.goals;
  return '<div class="section-header"><h3>Your Goal</h3></div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">' +
      Object.keys(goals).map(function(k) {
        var g       = goals[k];
        var isActive= k === activeKey;
        var modifier= g.calorie_modifier;
        var sign    = modifier > 0 ? '+' : '';
        return '<div onclick="setNutritionGoal(\'' + k + '\')" style="' +
          'background:var(--bg-card);border:2px solid ' + (isActive ? 'var(--accent)' : 'var(--border)') + ';' +
          'border-radius:var(--radius-md);padding:12px 14px;cursor:pointer;transition:0.2s">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<div style="width:16px;height:16px;border-radius:50%;border:2px solid ' + (isActive ? 'var(--accent)' : 'var(--border)') + ';' +
                'background:' + (isActive ? 'var(--accent)' : 'transparent') + ';flex-shrink:0"></div>' +
              '<span style="font-size:0.92rem;font-weight:600;color:' + (isActive ? 'var(--accent)' : 'var(--text-primary)') + '">' + g.label + '</span>' +
            '</div>' +
            '<span class="badge ' + g.badge + '" style="font-size:0.68rem">' + sign + Math.round(modifier * 100) + '% calories</span>' +
          '</div>' +
          '<div style="font-size:0.8rem;color:var(--text-muted);margin-left:24px">' + g.description + '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function renderWeeklyTargets(protein, carbs, fat, cals) {
  var weeklyDeficit  = (NUTRITION_GOALS.goals[STATE.settings.nutritionGoal || 'recomp'].calorie_modifier * -1);
  var tdee           = Math.round(((STATE.settings.bodyWeight || 80) * 10 + 6.25 * (STATE.settings.heightCm || 175) - 5 * (STATE.settings.age || 27) + 5) * NUTRITION_GOALS.ACTIVITY_FACTOR);
  var dailyDiff      = Math.round(tdee * (NUTRITION_GOALS.goals[STATE.settings.nutritionGoal || 'recomp'].calorie_modifier * -1));
  var weeklyDiff     = dailyDiff * 7;
  var kgPerWeek      = (weeklyDiff / 7700).toFixed(2); // 7700 kcal = 1kg fat
  var projLabel      = parseFloat(kgPerWeek) > 0 ? kgPerWeek + 'kg fat/week' : Math.abs(parseFloat(kgPerWeek)) + 'kg gain/week';
  var projColor      = parseFloat(kgPerWeek) > 0 ? 'var(--green)' : 'var(--yellow)';

  return '<div class="section-header"><h3>Expected Progress</h3></div>' +
    '<div class="card mb-16">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
        '<div style="background:var(--bg-secondary);border-radius:var(--radius-sm);padding:10px;text-align:center">' +
          '<div style="font-size:1.2rem;font-weight:800;color:' + projColor + '">' + projLabel + '</div>' +
          '<div style="font-size:0.72rem;color:var(--text-muted)">if diet is consistent</div>' +
        '</div>' +
        '<div style="background:var(--bg-secondary);border-radius:var(--radius-sm);padding:10px;text-align:center">' +
          '<div style="font-size:1.2rem;font-weight:800;color:var(--accent)">' + protein + 'g</div>' +
          '<div style="font-size:0.72rem;color:var(--text-muted)">protein every day</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:0.82rem;color:var(--text-muted);line-height:1.6">' +
        'Protein is the only macro that is non-negotiable. Hit your protein target every day and everything else follows. ' +
        'Carbs and fat can flex based on the day, hunger, and training intensity.' +
      '</div>' +
    '</div>';
}

function setNutritionGoal(key) {
  STATE.settings.nutritionGoal = key;
  Store.save('settings', STATE.settings);
  renderNutrition();
}

function updateBodyWeightN(val) {
  var bw = parseFloat(val);
  if (!bw || bw < 30 || bw > 200) return;
  STATE.settings.bodyWeight = bw;
  Store.save('settings', STATE.settings);
  renderNutrition();
}

function updateHeight(val) {
  var h = parseFloat(val);
  if (!h || h < 100 || h > 250) return;
  STATE.settings.heightCm = h;
  Store.save('settings', STATE.settings);
  renderNutrition();
}

function updateAge(val) {
  var a = parseInt(val);
  if (!a || a < 15 || a > 80) return;
  STATE.settings.age = a;
  Store.save('settings', STATE.settings);
  renderNutrition();
}


function macroTile(val, label, unit, color) {
  return '<div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:10px 6px;text-align:center">' +
    '<div style="font-size:1.4rem;font-weight:800;color:' + color + ';letter-spacing:-0.04em">' + val + '</div>' +
    '<div style="font-size:0.68rem;color:var(--text-muted)">' + label + '</div>' +
    '<div style="font-size:0.65rem;color:' + color + '">' + unit + '</div>' +
  '</div>';
}

function renderMacroBar(protein, carbs, fat) {
  var total = (protein * 4) + (carbs * 4) + (fat * 9);
  var pPct  = Math.round((protein * 4 / total) * 100);
  var cPct  = Math.round((carbs   * 4 / total) * 100);
  var fPct  = 100 - pPct - cPct;

  return '<div style="margin-top:4px">' +
    '<div style="display:flex;height:10px;border-radius:100px;overflow:hidden;gap:2px">' +
      '<div style="width:' + pPct + '%;background:var(--red);border-radius:100px 0 0 100px"></div>' +
      '<div style="width:' + cPct + '%;background:var(--yellow)"></div>' +
      '<div style="width:' + fPct + '%;background:var(--green);border-radius:0 100px 100px 0"></div>' +
    '</div>' +
    '<div style="display:flex;gap:12px;margin-top:6px">' +
      macroLegend('var(--red)',    'Protein', pPct) +
      macroLegend('var(--yellow)', 'Carbs',   cPct) +
      macroLegend('var(--green)',  'Fat',      fPct) +
    '</div>' +
  '</div>';
}

function macroLegend(color, label, pct) {
  return '<div style="display:flex;align-items:center;gap:4px">' +
    '<div style="width:8px;height:8px;border-radius:50%;background:' + color + '"></div>' +
    '<span style="font-size:0.72rem;color:var(--text-muted)">' + label + ' ' + pct + '%</span>' +
  '</div>';
}

function updateBodyWeight(val) {
  var bw = parseFloat(val);
  if (!bw || bw < 30 || bw > 200) return;
  STATE.settings.bodyWeight = bw;
  Store.save('settings', STATE.settings);
  renderNutrition();
}

function renderTestosteroneFoods() {
  var foods = [
    { name: 'Whole Eggs (4 daily)',            benefit: 'Cholesterol is the direct precursor to testosterone. Yolk is the key - do not discard it.', badge: 'T-boost' },
    { name: 'Chicken (thigh + leg)',            benefit: 'Zinc + saturated fat + high protein. Thighs and legs have more fat and zinc than breast. 200-300g daily.', badge: 'T-boost' },
    { name: 'Mutton (goat meat)',               benefit: 'Highest zinc among your available meats. Saturated fat directly supports T synthesis. 3-4x per week.', badge: 'Zinc' },
    { name: 'Fish - Rohu, Katla, Surmai',       benefit: 'Omega-3 reduces SHBG and frees bound testosterone. Eat 3-4x per week. Rohu and katla widely available.', badge: 'Omega-3' },
    { name: 'Prawns (when available)',          benefit: 'Good zinc source and lean protein. Eat when fresh and available.', badge: 'Zinc' },
    { name: 'Desi Ghee (clarified butter)',     benefit: 'Saturated fat from ghee directly raises LH which drives testosterone production. 1-2 tsp daily on food.', badge: 'T-boost' },
    { name: 'Pumpkin seeds (kaddu ke beej)',    benefit: '7mg zinc per 100g. Cheapest and easiest daily zinc source. Eat a handful every day.', badge: 'Zinc' },
    { name: 'Groundnuts / Peanuts',            benefit: 'Monounsaturated fat + Vitamin E for Leydig cell health. Cheap and available everywhere.', badge: 'Fat' },
    { name: 'Pomegranate (anaar)',              benefit: 'Shown to raise salivary testosterone by 24% in studies. Rich in antioxidants that reduce cortisol.', badge: 'Antioxidant' },
    { name: 'Spinach, Methi, Palak',           benefit: 'Magnesium improves free testosterone and sleep quality. Eat daily as sabzi or dal.', badge: 'Magnesium' },
    { name: 'Dal (masoor, moong, chana)',       benefit: 'Plant-based protein + zinc + fibre. Gut health improves testosterone absorption. Eat at least once daily.', badge: 'Protein' },
    { name: 'Turmeric (haldi) + Black pepper', benefit: 'Curcumin reduces cortisol and inflammation. Black pepper increases absorption 20x. Add to every meal.', badge: 'Recovery' },
    { name: 'Coconut oil / Coconut',           benefit: 'Medium-chain saturated fats - fast conversion to testosterone precursors. Use for cooking or raw.', badge: 'Fat' },
    { name: 'Garlic (lahsun)',                 benefit: 'Allicin reduces cortisol which competes with testosterone. Raw garlic on empty stomach is most effective.', badge: 'Cortisol' }
  ];

  var badgeColors = {
    'T-boost':   'var(--red)',
    'Zinc':      'var(--yellow)',
    'Fat':       'var(--green)',
    'Omega-3':   '#6366f1',
    'Antioxidant':'#00d4b4',
    'Magnesium': '#3b82f6',
    'Protein':   '#10b981',
    'Recovery':  '#8b5cf6',
    'Cortisol':  '#f59e0b'
  };

  return '<div class="section-header"><h3>Testosterone Foods</h3><span class="text-xs text-muted">Indian diet - eat daily</span></div>' +
    '<div class="coach-tip mb-8" style="margin-top:0">' +
      '<div class="coach-avatar" style="font-size:1rem">&#x1F9E0;</div>' +
      '<div><div class="coach-name">Coach says:</div>' +
        '<p>Your diet is already well-suited for testosterone. Mutton and chicken thighs are excellent. Ghee and eggs are your most powerful daily tools. The goal is consistency - not perfection.</p>' +
      '</div>' +
    '</div>' +
    '<div class="card mb-16">' +
      foods.map(function(f) {
        var color = badgeColors[f.badge] || 'var(--accent)';
        return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
          '<span class="badge" style="background:rgba(255,255,255,0.06);color:' + color + ';font-size:0.65rem;flex-shrink:0;margin-top:2px">' + f.badge + '</span>' +
          '<div>' +
            '<div style="font-size:0.88rem;font-weight:500">' + f.name + '</div>' +
            '<div style="font-size:0.78rem;color:var(--text-muted)">' + f.benefit + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}


function renderMealTiming() {

  var morningPlan = [
    {
      time: '06:30',
      meal: 'Pre-Workout (Empty stomach or light)',
      desc: '2 raw garlic cloves + warm water. Optional: 1 banana OR 4-5 soaked almonds. Do NOT eat a full meal before - training fasted or semi-fasted burns more fat and keeps you lighter during the session.',
      tag: 'pre'
    },
    {
      time: '07:00 - 08:30',
      meal: 'Training',
      desc: 'Water throughout. Coconut water in last 15 min if session is over 60 min.',
      tag: 'train'
    },
    {
      time: 'Immediately after',
      meal: 'Post-Workout Window (Critical - within 30 min)',
      desc: 'This is your most important meal. Option A: 250g chicken (thigh/leg) + 1 cup white rice or 2 rotis. Option B: 1 scoop whey protein shake (25-30g protein) if you cannot cook immediately - then eat a full meal within 1 hour. The shake is a bridge, not a replacement.',
      tag: 'post',
      highlight: true
    },
    {
      time: '09:30 - 10:00',
      meal: 'Breakfast',
      desc: '4 whole eggs (anda bhurji / omelette / boiled) + 2 rotis with ghee OR 1 cup oats. This is your second meal of the day after the post-workout meal. Keep it light if you already had rice/chicken.',
      tag: 'meal'
    },
    {
      time: '13:00 - 14:00',
      meal: 'Lunch',
      desc: '1 cup dal (masoor/moong/chana) + sabzi + 2-3 rotis or 1 cup rice. Add ghee. This is your biggest carb meal of the day - you have earned it from the morning session.',
      tag: 'meal'
    },
    {
      time: '16:00 - 17:00',
      meal: 'Evening snack',
      desc: 'Handful peanuts or mixed nuts + 1 fruit (banana, pomegranate, apple). Or 2 boiled eggs. Keeps metabolism active and prevents overeating at dinner.',
      tag: 'snack'
    },
    {
      time: '19:00 - 20:00',
      meal: 'Dinner',
      desc: '200g chicken curry or mutton or fish (surmai/rohu) + sabzi + 1-2 rotis. Keep carbs moderate at dinner since you are not training again tonight. No need for extra rice.',
      tag: 'meal'
    },
    {
      time: '21:30',
      meal: 'Optional - Before Sleep',
      desc: '1 cup dahi (curd) with haldi. Or 2 boiled eggs. Slow protein overnight protects muscle during sleep. Only if genuinely hungry.',
      tag: 'optional'
    }
  ];

  var eveningPlan = [
    {
      time: '09:30 - 10:00',
      meal: 'Breakfast',
      desc: '4 whole eggs (anda bhurji / omelette / boiled) + 2 rotis with ghee OR 1 cup oats with milk. This is your first meal - make it count. Protein and complex carbs to fuel the day.',
      tag: 'meal'
    },
    {
      time: '13:00 - 14:00',
      meal: 'Lunch',
      desc: '1 cup dal + sabzi + 2-3 rotis or 1 cup rice. Add ghee. Moderate carbs - this gives you fuel for the evening session without being too heavy.',
      tag: 'meal'
    },
    {
      time: '16:00',
      meal: 'Pre-Workout (2-3 hrs before training)',
      desc: '1 banana + black coffee (no sugar). Or soaked chana handful. Light - just enough to fuel the session without sitting heavy in your stomach during training.',
      tag: 'pre'
    },
    {
      time: '17:30 - 19:00',
      meal: 'Training',
      desc: 'Water throughout. Coconut water in last 15 min if over 60 min.',
      tag: 'train'
    },
    {
      time: 'Immediately after',
      meal: 'Post-Workout Window (Critical - within 30 min)',
      desc: 'Option A: 250g chicken + 1 cup white rice or 2 rotis - this IS your dinner. Option B: 1 scoop whey shake immediately after, then sit down for dinner within 45 min. Whey is useful here if dinner will be delayed past 30 min post-workout.',
      tag: 'post',
      highlight: true
    },
    {
      time: '19:30 - 20:00',
      meal: 'Dinner',
      desc: '200g chicken curry or mutton or fish + sabzi + 1-2 rotis. If you had rice right after workout, skip rice at dinner. This meal IS your post-workout meal so prioritise protein - chicken thigh/leg or mutton over dal alone.',
      tag: 'meal'
    },
    {
      time: '21:30',
      meal: 'Optional - Before Sleep',
      desc: '1 cup dahi with haldi. Or 2 boiled eggs. After an evening workout your body is still in recovery mode - slow protein here is very useful.',
      tag: 'optional'
    }
  ];

  var tagColors = {
    pre:      { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  color: '#6366f1',      label: 'Pre' },
    train:    { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)',   color: 'var(--red)',   label: 'Train' },
    post:     { bg: 'rgba(0,212,180,0.1)',  border: 'rgba(0,212,180,0.4)',  color: 'var(--accent)',label: 'Post' },
    meal:     { bg: 'transparent',           border: 'var(--border)',          color: 'var(--accent)',label: '' },
    snack:    { bg: 'transparent',           border: 'var(--border)',          color: 'var(--yellow)',label: 'Snack' },
    optional: { bg: 'transparent',           border: 'var(--border)',          color: 'var(--text-muted)', label: 'Optional' }
  };

  function buildPlan(plan) {
    return plan.map(function(t) {
      var tc = tagColors[t.tag] || tagColors.meal;
      return '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);' +
        (t.highlight ? 'background:rgba(0,212,180,0.04);margin:0 -12px;padding:10px 12px;' : '') + '">' +
        '<div style="flex-shrink:0;min-width:56px">' +
          '<div style="font-size:0.72rem;font-weight:700;color:' + tc.color + '">' + t.time + '</div>' +
          (tc.label ? '<span class="badge" style="font-size:0.6rem;background:' + tc.bg + ';color:' + tc.color + ';border:1px solid ' + tc.border + ';margin-top:3px">' + tc.label + '</span>' : '') +
        '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:0.85rem;font-weight:600;margin-bottom:3px;color:' + (t.highlight ? 'var(--accent)' : 'var(--text-primary)') + '">' + t.meal + '</div>' +
          '<div style="font-size:0.78rem;color:var(--text-muted);line-height:1.55">' + t.desc + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  return '<div class="section-header"><h3>Meal Timing</h3><span class="text-xs text-muted">Pick your schedule</span></div>' +

    '<div class="tabs" id="meal-tabs" style="margin-bottom:0">' +
      '<button class="tab active" onclick="switchMealTab(\'morning\',this)">Morning Workout</button>' +
      '<button class="tab" onclick="switchMealTab(\'evening\',this)">Evening Workout</button>' +
    '</div>' +

    '<div id="meal-tab-content">' +

      // Morning plan (default shown)
      '<div id="meal-morning" class="card mb-4" style="border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:0 12px">' +
        buildPlan(morningPlan) +
      '</div>' +

      // Evening plan (hidden by default)
      '<div id="meal-evening" class="card mb-4" style="border-radius:0 0 var(--radius-lg) var(--radius-lg);padding:0 12px;display:none">' +
        buildPlan(eveningPlan) +
      '</div>' +

    '</div>' +

    // Protein shake note
    '<div class="card mb-16" style="border-color:rgba(0,212,180,0.25);background:rgba(0,212,180,0.05)">' +
      '<div class="exercise-section-title" style="color:var(--accent)">About Protein Shakes</div>' +
      '<div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:10px">' +
        'A whey shake is a <strong>tool, not a requirement</strong>. Use it only when you cannot eat real food within 30 min of finishing your workout.' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
        shakeRow('When to use', 'Post-workout if real food is more than 30-45 min away. Or between meals if struggling to hit protein target.') +
        shakeRow('What to buy', 'Plain whey concentrate or isolate. Unflavoured or chocolate. Avoid mass gainers - they are full of sugar.') +
        shakeRow('How much', '1 scoop = 25-30g protein. Mix with water, not milk, post-workout for faster absorption.') +
        shakeRow('Indian options', 'MuscleBlaze Biozyme, MyProtein Impact Whey, Optimum Nutrition Gold Standard. All reputable. Buy from official site or Amazon.') +
        shakeRow('Do you need it?', 'If you can hit 160-200g protein from eggs, chicken, mutton, dal and fish - no. Shake is convenient, not magic.') +
      '</div>' +
    '</div>' +

    // Avoid list
    '<div class="card mb-16" style="border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.05)">' +
      '<div class="exercise-section-title" style="color:var(--red)">Avoid These</div>' +
      '<div style="font-size:0.83rem;color:var(--text-secondary);line-height:1.9">' +
        'Maida products (white bread, biscuits, packaged rotis) &mdash; spike insulin, crash energy<br>' +
        'Sweetened chai 3+ cups with sugar &mdash; switch to black coffee or unsweetened chai<br>' +
        'Dalda / vanaspati / refined seed oils &mdash; use ghee, coconut oil or mustard oil<br>' +
        'Packaged namkeen, chips, biscuits &mdash; dead calories with zero nutrition<br>' +
        'Alcohol &mdash; reduces testosterone measurably even 1-2 drinks per session<br>' +
        'Heavy meals right before training &mdash; you will feel sick and perform worse' +
      '</div>' +
    '</div>';
}

function shakeRow(label, text) {
  return '<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--border)">' +
    '<span style="font-size:0.78rem;font-weight:700;color:var(--accent);min-width:90px;flex-shrink:0">' + label + '</span>' +
    '<span style="font-size:0.78rem;color:var(--text-muted)">' + text + '</span>' +
  '</div>';
}

function switchMealTab(tab, btn) {
  var tabs = qsa('.tab', el('meal-tabs'));
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  btn.classList.add('active');
  var morning = el('meal-morning');
  var evening = el('meal-evening');
  if (morning) morning.style.display = tab === 'morning' ? 'block' : 'none';
  if (evening) evening.style.display = tab === 'evening' ? 'block' : 'none';
}



function renderSupplements() {
  var sups = [
    { name: 'Creatine Monohydrate', dose: '5g daily', timing: 'Any time  consistency matters', priority: 1, note: 'Most researched supplement. Strength +10-15%. Brain performance.' },
    { name: 'Zinc', dose: '25-40mg', timing: 'With food or before bed', priority: 1, note: 'Most men are deficient. Direct T precursor.' },
    { name: 'Magnesium Glycinate', dose: '300-400mg', timing: 'Before bed', priority: 1, note: 'Improves sleep quality + free testosterone.' },
    { name: 'Vitamin D3 + K2', dose: '3000-5000 IU D3', timing: 'Morning with fat', priority: 1, note: 'Deficiency is pandemic. K2 directs calcium correctly.' },
    { name: 'Omega-3 (EPA/DHA)', dose: '2-3g EPA+DHA', timing: 'With meals', priority: 2, note: 'Reduces SHBG  frees bound testosterone.' },
    { name: 'Ashwagandha KSM-66', dose: '300-600mg', timing: 'Before bed', priority: 2, note: 'Cortisol down 25%, T up 15-22% in clinical trials.' },
    { name: 'Vitamin C', dose: '500-1000mg', timing: 'Morning', priority: 3, note: 'Reduces cortisol. Immune. Collagen for joint health.' }
  ];

  var priorityLabels = { 1: 'Essential', 2: 'Important', 3: 'Optional' };
  var priorityColors = { 1: 'var(--red)', 2: 'var(--yellow)', 3: 'var(--green)' };

  return '<div class="section-header"><h3>Supplement Stack</h3><span class="text-xs text-muted">Evidence-based only</span></div>' +
  '<div class="card mb-16">' +
    sups.map(function(s) {
      var color = priorityColors[s.priority] || 'var(--text-muted)';
      return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">' +
          '<span style="font-size:0.88rem;font-weight:600">' + s.name + '</span>' +
          '<span class="badge" style="background:rgba(255,255,255,0.06);color:' + color + ';font-size:0.65rem;flex-shrink:0;margin-left:6px">' + priorityLabels[s.priority] + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-bottom:3px">' +
          '<span style="font-size:0.78rem;color:var(--accent)">' + s.dose + '</span>' +
          '<span style="font-size:0.78rem;color:var(--text-muted)">' + s.timing + '</span>' +
        '</div>' +
        '<div style="font-size:0.78rem;color:var(--text-muted)">' + s.note + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function renderHydration() {
  var water  = HistoryStore.getWaterToday();
  var target = (STATE.settings.bodyWeight || 80) * 0.035; // 35ml per kg
  target     = Math.max(2.5, Math.min(4, target));
  var pct    = Math.min(100, Math.round((water / target) * 100));

  return '<div class="section-header"><h3>Hydration Today</h3></div>' +
  '<div class="card mb-16">' +
    '<div class="flex-between mb-8">' +
      '<div>' +
        '<div style="font-size:1.8rem;font-weight:800;color:var(--blue)">' + water.toFixed(1) + 'L</div>' +
        '<div style="font-size:0.8rem;color:var(--text-muted)">Target: ' + target.toFixed(1) + 'L</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn btn-sm btn-secondary" onclick="addWaterAndRefresh(0.25)">+250ml</button>' +
        '<button class="btn btn-sm btn-secondary" onclick="addWaterAndRefresh(0.5)">+500ml</button>' +
        '<button class="btn btn-sm btn-secondary" onclick="addWaterAndRefresh(1)">+1L</button>' +
      '</div>' +
    '</div>' +
    '<div class="progress-bar">' +
      '<div class="progress-fill" style="width:' + pct + '%;background:var(--blue)"></div>' +
    '</div>' +
    '<div class="flex-between mt-4">' +
      '<span style="font-size:0.72rem;color:var(--text-muted)">0L</span>' +
      '<span style="font-size:0.72rem;color:' + (pct >= 100 ? 'var(--green)' : 'var(--text-muted)') + '">' +
        (pct >= 100 ? 'Target reached!' : pct + '% of target') +
      '</span>' +
      '<span style="font-size:0.72rem;color:var(--text-muted)">' + target.toFixed(1) + 'L</span>' +
    '</div>' +
    '<div style="margin-top:10px;padding:8px;background:rgba(59,130,246,0.07);border-radius:var(--radius-sm)">' +
      '<p style="font-size:0.78rem;color:var(--text-muted);margin:0">Dehydration of just 2% reduces strength by 10-20% and testosterone signalling. Drink before you are thirsty.</p>' +
    '</div>' +
  '</div>';
}

function addWaterAndRefresh(litres) {
  HistoryStore.addWater(litres);
  showToast('+' + (litres * 1000) + 'ml logged', 'success');
  renderNutrition();
}
