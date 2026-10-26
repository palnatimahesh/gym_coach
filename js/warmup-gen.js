/* TARGETED WARM-UP / COOL-DOWN GENERATOR - ES5
   Builds a short routine from the day's actual exercises instead of a generic 12-drill list:
   pulse raiser -> joint mobility -> activation -> ramp-up set (about 5-6 min), and a few stretches for the
   muscles just worked (about 5 min). The result is registered as WARMUPS.routines.auto_warmup / auto_cooldown
   so the existing guided player runs it unchanged. */

var WarmupGen = (function() {

  /* stage 1 = pulse raiser, 2 = mobility, 3 = activation. Catalog order = performing order. */
  var WARM = [
    { stage: 1, tags: ['upper', 'push', 'pull'],            name: 'Jumping Jacks',                     duration: '60s' },
    { stage: 1, tags: ['lower', 'squat', 'hinge', 'full'],  name: 'Jump Rope or High Knees',           duration: '60s' },
    { stage: 1, tags: ['run'],                              name: 'Easy Jog (very slow)',              duration: '90s' },
    { stage: 2, tags: ['upper', 'push', 'pull', 'full'],    name: 'Cat-Cow',                           reps: 8 },
    { stage: 2, tags: ['upper', 'push', 'pull', 'full'],    name: 'Thoracic Rotation (Thread Needle)', reps: '6 each side' },
    { stage: 2, tags: ['push', 'upper'],                    name: 'Arm Circles',                       duration: '20s each direction' },
    { stage: 2, tags: ['lower', 'hinge', 'full', 'run'],    name: "World's Greatest Stretch",          reps: '4 each side' },
    { stage: 2, tags: ['lower', 'squat', 'hinge'],          name: 'Hip Circles (standing)',            duration: '20s each direction' },
    { stage: 2, tags: ['squat', 'lower', 'run'],            name: 'Ankle Dorsiflexion Wall Drill',     reps: '8 each side' },
    { stage: 2, tags: ['hinge', 'lower', 'run'],            name: 'Leg Swings (Front/Back)',           reps: '10 each leg' },
    { stage: 2, tags: ['squat', 'lower', 'run'],            name: 'Leg Swings (Side to Side)',         reps: '10 each leg' },
    { stage: 3, tags: ['push', 'pull', 'upper'],            name: 'Band Pull Aparts',                  reps: 15 },
    { stage: 3, tags: ['push', 'upper'],                    name: 'Scapular Push-ups',                 reps: 10 },
    { stage: 3, tags: ['squat', 'hinge', 'lower', 'run'],   name: 'Glute Bridges',                     reps: 15 },
    { stage: 3, tags: ['squat', 'lower', 'full'],           name: 'Bodyweight Squats (fast)',          reps: 12 },
    { stage: 3, tags: ['full', 'push'],                     name: 'Inchworm to Push-up',               reps: 5 }
  ];

  var COOL = [
    { tags: ['lower', 'squat', 'run'],        name: 'Hip Flexor Stretch (kneeling)', duration: '40s each side' },
    { tags: ['lower', 'squat', 'run'],        name: 'Quad Stretch (standing)',       duration: '30s each' },
    { tags: ['hinge', 'lower', 'run'],        name: 'Hamstring Stretch (lying)',     duration: '40s each side' },
    { tags: ['hinge', 'squat', 'lower'],      name: 'Pigeon Pose',                   duration: '45s each side' },
    { tags: ['run', 'lower'],                 name: 'Calf Stretch - Straight leg',   duration: '30s each' },
    { tags: ['push', 'upper'],                name: 'Chest Opener (doorway)',        duration: '40s' },
    { tags: ['pull', 'upper'],                name: 'Overhead Lat Stretch',          duration: '30s each side' },
    { tags: ['push', 'pull', 'upper'],        name: 'Cross-Body Shoulder Stretch',   duration: '30s each' },
    { tags: ['full', 'upper', 'hinge'],       name: "Child's Pose",                  duration: '45s' },
    { tags: ['full', 'lower', 'upper'],       name: 'Spinal Twist (supine)',         duration: '40s each side' }
  ];

  var HINGE_RE = /deadlift|rdl|thrust|bridge|good_morning|swing|nordic/;
  var LOWER_MUSCLES = { quads: 1, hamstrings: 1, glutes: 1, calves: 1, hip_flexors: 1, adductors: 1, abductors: 1 };

  function tagsFor(session) {
    var t = {};
    (session.exercises || []).forEach(function(e) {
      var ex = EXERCISES[e.id];
      if (!ex) return;
      /* Muscle decides lower body (an RDL is filed under "pull" but trains hamstrings and glutes) */
      if (ex.category === 'legs' || LOWER_MUSCLES[ex.muscle] || /deadlift/.test(e.id)) {
        t.lower = true;
        var hinge = ex.muscle === 'hamstrings' || ex.muscle === 'glutes' || HINGE_RE.test(e.id);
        if (hinge) t.hinge = true;
        if (ex.muscle === 'quads' || (ex.category === 'legs' && !hinge)) t.squat = true;
      }
      else if (ex.category === 'push') { t.push = true; t.upper = true; }
      else if (ex.category === 'pull') { t.pull = true; t.upper = true; }
    });
    if (session.circuit || (t.upper && t.lower)) t.full = true;
    var text = ((session.focus || '') + ' ' + (session.split || '')).toLowerCase();
    if (!(session.exercises || []).length && /run|cardio|zone|jog|walk/.test(text)) t.run = true;
    if (!Object.keys(t).length) t.full = true;
    return t;
  }

  /* Id of the colour / label family used by the weekly schedule */
  function kindFor(session) {
    if (session.rest || session.massage) return 'mobility_only';
    var t = tagsFor(session);
    if (t.run && !t.upper && !t.lower) return 'running';
    if (t.full) return 'full_body';
    if (t.lower) return 'lower_body';
    if (t.upper) return 'upper_body';
    return 'full_body';
  }

  function score(item, tags) {
    var s = 0;
    item.tags.forEach(function(x) { if (tags[x]) s++; });
    return s;
  }

  /* Best n items (score > 0), returned in catalog order */
  function pick(list, tags, n) {
    var ranked = list.map(function(it, i) { return { it: it, i: i, s: score(it, tags) }; })
      .filter(function(r) { return r.s > 0; })
      .sort(function(a, b) { return b.s - a.s || a.i - b.i; })
      .slice(0, n)
      .sort(function(a, b) { return a.i - b.i; });
    return ranked.map(function(r) { return r.it; });
  }

  /* Reuse the coaching note from the full routines when the same drill exists there */
  function noteFor(name) {
    var found = '';
    var key = name.toLowerCase().split(' (')[0];
    Object.keys(WARMUPS.routines).forEach(function(rid) {
      if (rid.indexOf('auto_') === 0 || found) return;
      (WARMUPS.routines[rid].exercises || []).forEach(function(e) {
        if (!found && e.notes && e.name.toLowerCase().indexOf(key) === 0) found = e.notes;
      });
    });
    return found;
  }

  function clone(it) {
    var o = { name: it.name, notes: noteFor(it.name) };
    if (it.duration) o.duration = it.duration; else o.reps = it.reps;
    return o;
  }

  function minutes(exercises) {
    var secs = 0;
    exercises.forEach(function(e) {
      var info = parseStep(e);
      secs += info.timed ? info.secs * info.sides + 8 : (parseInt(String(e.reps), 10) || 8) * 3 * info.sides + 12;
    });
    return Math.max(1, Math.round(secs / 60));
  }

  function describe(tags) {
    var names = [];
    if (tags.run) names.push('running');
    if (tags.lower) names.push('lower body');
    if (tags.upper) names.push('upper body');
    if (tags.squat) names.push('squat pattern');
    if (tags.hinge) names.push('hinge pattern');
    return names.join(', ') || 'full body';
  }

  function warmup(session) {
    var tags = tagsFor(session);
    var pulse = pick(WARM.filter(function(i) { return i.stage === 1; }), tags, 1);
    var mobility = pick(WARM.filter(function(i) { return i.stage === 2; }), tags, 3);
    var activation = pick(WARM.filter(function(i) { return i.stage === 3; }), tags, 2);
    var list = pulse.concat(mobility, activation).map(clone);
    list.push({ name: 'Ramp-up set (first exercise)', reps: '8 at 40%', notes: 'One light set of your first lift with perfect form. The workout screen also suggests ramp sets.' });
    var routine = {
      id: 'auto_warmup', name: 'Warm-up: ' + (session.focus || 'Today'),
      duration: minutes(list) + ' min', exercises: list,
      reason: 'Built for today: ' + describe(tags) + '. ' + list.length + ' drills, about ' + minutes(list) + ' minutes.'
    };
    WARMUPS.routines.auto_warmup = routine;
    return routine;
  }

  function cooldown(session) {
    var tags = tagsFor(session);
    var list = [{ name: 'Diaphragmatic Breathing', duration: '60s', notes: 'Slow nasal breaths. Lets your heart rate and nervous system settle after training.' }]
      .concat(pick(COOL, tags, 4).map(clone));
    var routine = {
      id: 'auto_cooldown', name: 'Cooldown: ' + (session.focus || 'Today'),
      duration: minutes(list) + ' min', exercises: list,
      reason: 'Stretches for what you just trained (' + describe(tags) + '), about ' + minutes(list) + ' minutes.'
    };
    WARMUPS.routines.auto_cooldown = routine;
    return routine;
  }

  return { tagsFor: tagsFor, kindFor: kindFor, warmup: warmup, cooldown: cooldown, pick: pick, WARM: WARM, COOL: COOL };
})();
