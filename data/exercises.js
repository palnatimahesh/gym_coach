var EXERCISES = {

  // --- PUSH ---
  bench_press: {
    id: 'bench_press', name: 'Barbell Bench Press',
    category: 'push', muscle: 'chest', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 2,
    testosterone: true,
    sets: '4', reps: '6-8', rest: 90,
    grip: 'Slightly wider than shoulder-width. Bar over lower palm, wrists straight - never bent back.',
    breathing: 'Inhale as bar descends, brace core, exhale forcefully on press.',
    form: [
      'Retract and depress scapula - "bend the bar" cue to engage lats.',
      'Arch lower back naturally, feet flat or on toes for leg drive.',
      'Touch bar to lower chest (nipple line), slight pause.',
      'Drive through chest, not shoulders - imagine pushing yourself away from the bar.'
    ],
    hacks: [
      'Leg drive: push floor away to transfer force through body.',
      'Tuck elbows 45-75 - protects rotator cuff, more pec activation.',
      'Squeeze the bar as hard as possible - full body tension.'
    ],
    commonMistakes: ['Flared elbows', 'Bouncing bar off chest', 'Losing arch mid-rep', 'Lifting butt off bench'],
    alternatives: [
      { id: 'db_press', reason: ['equipment_occupied', 'too_hard', 'injury'] },
      { id: 'pushup_weighted', reason: ['equipment_occupied', 'no_equipment'] },
      { id: 'cable_fly', reason: ['too_easy', 'variation'] }
    ],
    phase: [2, 3, 4],
    tags: ['compound', 'testosterone', 'strength']
  },

  db_press: {
    id: 'db_press', name: 'Dumbbell Bench Press',
    category: 'push', muscle: 'chest', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 2,
    testosterone: true,
    sets: '4', reps: '8-12', rest: 75,
    grip: 'Neutral or pronated. Thumbs wrapped. Dumbbells touch at top, controlled flare down.',
    breathing: 'Inhale on descent, exhale on press. Never hold breath for more than 1 rep.',
    form: [
      'Start dumbbells at shoulder height, elbows at 45-75.',
      'Controlled descent - 3 seconds down, 1 second up.',
      'Full ROM: feel stretch at bottom, squeeze at top.',
      'Keep wrists stacked over elbows throughout.'
    ],
    hacks: [
      'Greater ROM than barbell - use this for hypertrophy.',
      'Rotate wrists slightly inward at top for extra squeeze.',
      'Unilateral imbalance correction: lead with weaker side.'
    ],
    commonMistakes: ['Dumbbells too wide at bottom', 'No squeeze at top', 'Rushing descent'],
    alternatives: [
      { id: 'bench_press', reason: ['too_easy', 'variation'] },
      { id: 'pushup_weighted', reason: ['no_equipment'] },
      { id: 'incline_db_press', reason: ['variation'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['compound', 'strength', 'hypertrophy']
  },

  incline_db_press: {
    id: 'incline_db_press', name: 'Incline Dumbbell Press',
    category: 'push', muscle: 'upper_chest', equipment: 'dumbbell',
    mode: ['gym'],
    difficulty: 2,
    sets: '3', reps: '10-12', rest: 60,
    grip: '30-45 bench angle. Dumbbells at collarbone height. Elbows slightly below shoulder line.',
    breathing: 'Controlled inhale down, sharp exhale up.',
    form: [
      'Bench at 30-45 - anything higher shifts to front delt.',
      'Drive dumbbells up and slightly together.',
      'Avoid letting elbows drop below bench level.'
    ],
    hacks: ['Keep chin tucked - helps upper chest recruitment.', '30 is superior to 45 for clavicular head activation.'],
    commonMistakes: ['Bench too steep', 'Elbows too wide'],
    alternatives: [
      { id: 'incline_pushup', reason: ['no_equipment'] },
      { id: 'cable_fly', reason: ['equipment_occupied'] }
    ],
    phase: [2, 3, 4],
    tags: ['upper_chest', 'aesthetics']
  },

  overhead_press: {
    id: 'overhead_press', name: 'Overhead Press (OHP)',
    category: 'push', muscle: 'shoulders', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 3,
    testosterone: true,
    sets: '4', reps: '5-8', rest: 90,
    grip: 'Just outside shoulder width. Bar rests on heel of palm. Wrists straight.',
    breathing: 'Big belly breath, brace, exhale at lockout.',
    form: [
      'Start bar at upper chest/collarbone.',
      'Press straight up - bar travels slightly back as it clears head.',
      'Lock out fully, shrug at top to activate upper traps.',
      'Squeeze glutes and core - no lower back hyperextension.'
    ],
    hacks: [
      'Push your face through the "window" made by your arms at lockout.',
      'Lat engagement prevents lower back arch.',
      'Wear shoes with flat soles - better force transfer.'
    ],
    commonMistakes: ['Back hyperextension', 'Forward bar path', 'No lockout'],
    alternatives: [
      { id: 'db_shoulder_press', reason: ['equipment_occupied', 'injury'] },
      { id: 'pike_pushup', reason: ['no_equipment'] }
    ],
    phase: [2, 3, 4],
    tags: ['compound', 'testosterone', 'shoulder_strength']
  },

  db_shoulder_press: {
    id: 'db_shoulder_press', name: 'Dumbbell Shoulder Press',
    category: 'push', muscle: 'shoulders', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 2,
    sets: '3', reps: '10-12', rest: 60,
    grip: 'Pronated grip. Start at ear level. Press to lockout.',
    breathing: 'Exhale as you press up, inhale on the way down.',
    form: ['Sit upright - no leaning back.', 'Control the descent - 2 seconds down.', 'Don\'t touch dumbbells at top - maintain tension.'],
    hacks: ['Arnold press variation recruits more delt heads.', 'Seated removes leg drive - pure shoulder isolation.'],
    commonMistakes: ['Leaning back too much', 'Partial reps'],
    alternatives: [
      { id: 'overhead_press', reason: ['variation'] },
      { id: 'pike_pushup', reason: ['no_equipment'] },
      { id: 'lateral_raise', reason: ['injury', 'too_hard'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['shoulders', 'aesthetics']
  },

  lateral_raise: {
    id: 'lateral_raise', name: 'Lateral Raise',
    category: 'push', muscle: 'side_delt', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '4', reps: '15-20', rest: 45,
    grip: 'Slight internal rotation - pour water from jug. Lead with elbows, not wrists.',
    breathing: 'Exhale on the way up, inhale on way down.',
    form: ['Slight forward lean (10) for better delt activation.', 'Stop at shoulder height - not higher.', 'Slow eccentric (3 sec down) for maximum hypertrophy.'],
    hacks: ['Cable lateral raises > dumbbells for constant tension.', 'Lean into a pole for unilateral variation.', 'Partial reps at top for burn-out sets.'],
    commonMistakes: ['Swinging/momentum', 'Raising above shoulder', 'Shrugging traps'],
    alternatives: [
      { id: 'cable_lateral_raise', reason: ['variation', 'too_easy'] },
      { id: 'band_lateral_raise', reason: ['no_equipment'] }
    ],
    phase: [2, 3, 4],
    tags: ['isolation', 'aesthetics', 'shoulder_width']
  },

  pushup: {
    id: 'pushup', name: 'Push-up',
    category: 'push', muscle: 'chest', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '15-20', rest: 45,
    grip: 'Slightly wider than shoulders. Fingers forward or slightly out. Full fist or flat palm.',
    breathing: 'Inhale down, exhale up - never hold.',
    form: [
      'Rigid plank position - no sagging hips or pike.',
      'Chest touches floor, elbows at 45 to body.',
      'Full lockout at top without locking joints.',
      'Spread fingers wide for stability.'
    ],
    hacks: [
      'Rotate hands outward slightly to protect wrists.',
      'Archer push-up for progressive overload.',
      'Elevate feet for more upper chest.',
      'Slow (4-1-1) tempo triples difficulty.'
    ],
    commonMistakes: ['Hips sagging', 'Head dropping', 'Half reps'],
    alternatives: [
      { id: 'incline_pushup', reason: ['too_hard'] },
      { id: 'db_press', reason: ['too_easy', 'gym'] },
      { id: 'pushup_weighted', reason: ['too_easy'] }
    ],
    phase: [0, 1, 2, 3, 4],
    tags: ['bodyweight', 'compound', 'endurance']
  },

  pushup_weighted: {
    id: 'pushup_weighted', name: 'Weighted Push-up',
    category: 'push', muscle: 'chest', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 2,
    sets: '4', reps: '10-15', rest: 60,
    grip: 'Same as standard push-up.',
    breathing: 'Controlled. Exhale forcefully on push.',
    form: ['Place plate on upper back or use weighted vest.', 'All push-up cues apply.'],
    hacks: ['Partner can apply resistance on upper back for home use.'],
    commonMistakes: ['Plate sliding forward', 'Compromised form with load'],
    alternatives: [
      { id: 'bench_press', reason: ['variation', 'gym'] },
      { id: 'pushup', reason: ['too_hard'] }
    ],
    phase: [2, 3, 4],
    tags: ['bodyweight', 'progressive_overload']
  },

  incline_pushup: {
    id: 'incline_pushup', name: 'Incline Push-up',
    category: 'push', muscle: 'chest', equipment: 'bodyweight',
    mode: ['home'],
    difficulty: 1,
    sets: '3', reps: '15-20', rest: 30,
    grip: 'Hands on elevated surface (bench, table, wall). Wider than shoulders.',
    breathing: 'Inhale down, exhale up.',
    form: ['Body diagonal, not vertical.', 'Chest to surface edge.', 'Same rib/scap positioning as floor push-up.'],
    hacks: ['Lower the surface = harder. Wall push-up = easiest.'],
    commonMistakes: ['Hips dropping', 'Head poking forward'],
    alternatives: [{ id: 'pushup', reason: ['too_easy'] }],
    phase: [0, 1],
    tags: ['beginner', 'rehabilitation']
  },

  pike_pushup: {
    id: 'pike_pushup', name: 'Pike Push-up',
    category: 'push', muscle: 'shoulders', equipment: 'bodyweight',
    mode: ['home'],
    difficulty: 2,
    sets: '3', reps: '10-15', rest: 60,
    grip: 'Shoulder width. Inverted V position. Head toward floor.',
    breathing: 'Inhale on descent, exhale on push.',
    form: ['Hips high, straight line from wrists to hips.', 'Top of head toward floor.', 'Full ROM - barely touch crown to floor.'],
    hacks: ['Elevate feet to progress toward handstand push-up.'],
    commonMistakes: ['Not enough hip height', 'Partial range'],
    alternatives: [{ id: 'db_shoulder_press', reason: ['gym'] }, { id: 'overhead_press', reason: ['gym'] }],
    phase: [1, 2, 3],
    tags: ['bodyweight', 'shoulder_strength']
  },

  cable_fly: {
    id: 'cable_fly', name: 'Cable Fly',
    category: 'push', muscle: 'chest', equipment: 'cable',
    mode: ['gym'],
    difficulty: 1,
    sets: '3', reps: '12-15', rest: 45,
    grip: 'Single handle each side. Slight elbow bend fixed throughout.',
    breathing: 'Exhale on squeeze, inhale on return.',
    form: ['Slight forward lean.', 'Arc movement - hugging a tree.', 'Squeeze and hold 1 second at chest level.'],
    hacks: ['High cable = lower chest. Low cable = upper chest. Cross-body = inner chest.'],
    commonMistakes: ['Bending elbows too much (becomes a press)', 'No squeeze at peak'],
    alternatives: [{ id: 'db_fly', reason: ['equipment_occupied'] }, { id: 'pushup', reason: ['no_equipment'] }],
    phase: [2, 3, 4],
    tags: ['isolation', 'hypertrophy', 'aesthetics']
  },

  // --- PULL ---
  deadlift: {
    id: 'deadlift', name: 'Conventional Deadlift',
    category: 'pull', muscle: 'full_posterior', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 3,
    testosterone: true,
    sets: '4', reps: '4-6', rest: 120,
    grip: 'Double overhand or mixed grip. Hook grip for heavy. Hands just outside legs.',
    breathing: 'Big breath INTO belly, 360 brace (valsalva), exhale at lockout or between reps.',
    form: [
      'Bar over mid-foot. Hip hinge to bar - don\'t squat it.',
      'Shoulders slightly ahead of bar. Lat engagement: "protect your armpits".',
      'Drive floor away - don\'t think "pull up".',
      'Lock hips and knees simultaneously at top. No hyperextension.',
      'Hinge back on descent - bar stays in contact with legs.'
    ],
    hacks: [
      'Chalk or straps for grip failure.',
      '"Leg press the earth" cue for drive.',
      'Sit back into hamstrings on setup.',
      'Squeeze oranges in armpits for lat tension.'
    ],
    commonMistakes: ['Bar drifting from legs', 'Rounding lower back', 'Jerking off floor', 'Hyperextending at top'],
    alternatives: [
      { id: 'rdl', reason: ['equipment_occupied', 'injury', 'too_hard'] },
      { id: 'trap_bar_deadlift', reason: ['knee_issue'] },
      { id: 'db_deadlift', reason: ['no_barbell'] }
    ],
    phase: [2, 3, 4],
    tags: ['compound', 'testosterone', 'posterior_chain', 'king_lift']
  },

  rdl: {
    id: 'rdl', name: 'Romanian Deadlift (RDL)',
    category: 'pull', muscle: 'hamstrings', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 2,
    sets: '3', reps: '8-12', rest: 75,
    grip: 'Pronated, shoulder width. Bar against legs throughout.',
    breathing: 'Inhale and brace before descent, exhale on return.',
    form: [
      'Start standing. Slight knee bend, fixed.',
      'Push hips back - bar slides down thighs.',
      'Feel deep hamstring stretch at bottom (mid-shin for most).',
      'Drive hips forward to return - squeeze glutes.'
    ],
    hacks: ['Don\'t look for the floor - look 10 feet ahead.', 'Feel the stretch, not just the position.'],
    commonMistakes: ['Knees bending too much (becomes squat)', 'Rounding back', 'Going past natural ROM'],
    alternatives: [
      { id: 'db_rdl', reason: ['equipment_occupied'] },
      { id: 'good_morning', reason: ['variation'] },
      { id: 'nordic_curl', reason: ['no_barbell'] }
    ],
    phase: [2, 3, 4],
    tags: ['hamstrings', 'glutes', 'posterior_chain']
  },

  pullup: {
    id: 'pullup', name: 'Pull-up',
    category: 'pull', muscle: 'back', equipment: 'pullup_bar',
    mode: ['gym', 'home'],
    difficulty: 3,
    testosterone: true,
    sets: '4', reps: '6-10', rest: 90,
    grip: 'Pronated (overhand), slightly wider than shoulders.',
    breathing: 'Exhale as you pull up, inhale on controlled descent.',
    form: [
      'Dead hang start - full arm extension.',
      'Depress scapula before pulling - initiate with lats.',
      'Chin over bar. Chest toward bar ideally.',
      'Slow eccentric: 3-4 seconds descent.'
    ],
    hacks: [
      '"Elbows to hips" cue instead of "pull up".',
      'Scapular pull-ups to build base strength.',
      'Negative pull-ups for beginners (jump up, slow down).',
      'Hollow body position for full activation.'
    ],
    commonMistakes: ['Kipping/swinging', 'Chin barely clears bar', 'Short eccentric', 'Shrugging instead of depressing'],
    alternatives: [
      { id: 'lat_pulldown', reason: ['too_hard'] },
      { id: 'chinup', reason: ['variation', 'too_hard'] },
      { id: 'inverted_row', reason: ['too_hard'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['compound', 'testosterone', 'back_width', 'bodyweight']
  },

  chinup: {
    id: 'chinup', name: 'Chin-up',
    category: 'pull', muscle: 'back', equipment: 'pullup_bar',
    mode: ['gym', 'home'],
    difficulty: 2,
    sets: '4', reps: '8-12', rest: 75,
    grip: 'Supinated (underhand), shoulder width.',
    breathing: 'Same as pull-up.',
    form: ['Supinated grip recruits more bicep.', 'Same scapular depression cue.', 'Full ROM - dead hang to chin over bar.'],
    hacks: ['Easier than pull-up - good entry point.', 'More bicep involvement.'],
    commonMistakes: ['Elbows flaring out', 'Partial reps'],
    alternatives: [
      { id: 'pullup', reason: ['variation'] },
      { id: 'lat_pulldown', reason: ['too_hard'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['compound', 'back', 'biceps']
  },

  lat_pulldown: {
    id: 'lat_pulldown', name: 'Lat Pulldown',
    category: 'pull', muscle: 'back', equipment: 'cable',
    mode: ['gym'],
    difficulty: 1,
    sets: '4', reps: '10-12', rest: 60,
    grip: 'Wide pronated. Pull to upper chest - not behind neck.',
    breathing: 'Exhale as bar comes down, inhale on return.',
    form: ['Slight backward lean (15).', 'Lead with elbows - pull bar to chest.', 'Squeeze lats at bottom, full stretch at top.'],
    hacks: ['Imagine pulling elbows into your pockets.', 'Neutral grip = more strength, less lat isolation.'],
    commonMistakes: ['Behind neck (dangerous)', 'Too much lean back', 'Letting bar shoot up'],
    alternatives: [
      { id: 'pullup', reason: ['too_easy', 'variation'] },
      { id: 'resistance_band_pulldown', reason: ['no_equipment'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['back_width', 'cable']
  },

  barbell_row: {
    id: 'barbell_row', name: 'Barbell Bent-over Row',
    category: 'pull', muscle: 'back', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 3,
    testosterone: true,
    sets: '4', reps: '6-8', rest: 90,
    grip: 'Double overhand, shoulder width. Underhand for more bicep.',
    breathing: 'Brace and inhale before each rep, exhale on pull.',
    form: [
      'Hinge 45-70 forward. Back flat, bar over mid-foot.',
      'Pull to lower chest/upper abs - not chin.',
      'Elbows drive back and up.',
      'Squeeze rhomboids and traps at top. Hold 1 second.'
    ],
    hacks: [
      '"Row bar into hip pocket" for better lat recruitment.',
      'Kroc row variation for mental toughness and grip.',
      'Dead stop rows prevent momentum.'
    ],
    commonMistakes: ['Too upright (becomes shrug)', 'Jerking with hips', 'Bar hitting thighs too low'],
    alternatives: [
      { id: 'db_row', reason: ['equipment_occupied', 'lower_back_issue'] },
      { id: 'cable_row', reason: ['equipment_occupied'] },
      { id: 'inverted_row', reason: ['no_barbell'] }
    ],
    phase: [2, 3, 4],
    tags: ['compound', 'testosterone', 'back_thickness']
  },

  db_row: {
    id: 'db_row', name: 'Single Arm Dumbbell Row',
    category: 'pull', muscle: 'back', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 2,
    sets: '4', reps: '10-12', rest: 60,
    grip: 'Neutral. Dumbbell hangs below shoulder. Pull to hip, not armpit.',
    breathing: 'Exhale on pull, inhale on return.',
    form: ['Support on bench with same-side knee and hand.', 'Back parallel to floor.', 'Full stretch at bottom, full contraction at top.', 'No rotation - square hips.'],
    hacks: ['Elbow past torso at top = full lat engagement.', 'Heavy Kroc rows (controlled sloppy) for raw strength.'],
    commonMistakes: ['Rotating torso', 'Pulling to armpit instead of hip', 'No stretch at bottom'],
    alternatives: [
      { id: 'barbell_row', reason: ['variation'] },
      { id: 'cable_row', reason: ['variation'] },
      { id: 'inverted_row', reason: ['no_equipment'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['back', 'unilateral']
  },

  cable_row: {
    id: 'cable_row', name: 'Seated Cable Row',
    category: 'pull', muscle: 'back', equipment: 'cable',
    mode: ['gym'],
    difficulty: 1,
    sets: '3', reps: '12-15', rest: 60,
    grip: 'Close neutral grip (V-bar). Shoulder width pronated for variation.',
    breathing: 'Exhale as you row, inhale on extension.',
    form: ['Sit tall, slight natural lumbar curve.', 'Row handle to lower sternum.', 'Squeeze scapula together at peak.', 'Controlled return to full arm extension.'],
    hacks: ['Single arm for greater ROM and scapular rotation.'],
    commonMistakes: ['Leaning back too far', 'Not squeezing at peak', 'Rushing the return'],
    alternatives: [
      { id: 'db_row', reason: ['equipment_occupied'] },
      { id: 'barbell_row', reason: ['variation'] },
      { id: 'inverted_row', reason: ['no_equipment'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['back', 'cable', 'mid_back']
  },

  inverted_row: {
    id: 'inverted_row', name: 'Inverted Row (Australian Pull-up)',
    category: 'pull', muscle: 'back', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '12-15', rest: 45,
    grip: 'Pronated, bar at hip height. Body rigid underneath.',
    breathing: 'Exhale on pull, inhale on descent.',
    form: ['Rigid plank body line.', 'Pull chest to bar.', 'Harder: feet elevated. Easier: knees bent.'],
    hacks: ['Add weight vest or plate on chest to progress.', 'Towel over bar for grip strength.'],
    commonMistakes: ['Hips sagging', 'Partial pull'],
    alternatives: [{ id: 'pullup', reason: ['too_easy'] }, { id: 'db_row', reason: ['gym'] }],
    phase: [0, 1, 2, 3],
    tags: ['bodyweight', 'beginner', 'back']
  },

  face_pull: {
    id: 'face_pull', name: 'Face Pull',
    category: 'pull', muscle: 'rear_delt', equipment: 'cable',
    mode: ['gym'],
    difficulty: 1,
    sets: '3', reps: '15-20', rest: 45,
    grip: 'Rope attachment. Overhand. Pull to face level, elbows above wrists.',
    breathing: 'Exhale on pull, inhale on return.',
    form: ['Set cable at face height or above.', 'External rotation at peak - "most muscular" pose with arms.', 'Squeeze rear delts and rotator cuff.'],
    hacks: ['Mandatory for shoulder health. Do this every push session.', 'Slow eccentric.'],
    commonMistakes: ['Elbows below wrists', 'No external rotation', 'Too heavy - lose form'],
    alternatives: [{ id: 'band_pull_apart', reason: ['no_equipment'] }, { id: 'rear_delt_fly', reason: ['variation'] }],
    phase: [1, 2, 3, 4],
    tags: ['shoulder_health', 'rear_delt', 'rotator_cuff']
  },

  // --- LEGS ---
  squat: {
    id: 'squat', name: 'Barbell Back Squat',
    category: 'legs', muscle: 'quads', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 3,
    testosterone: true,
    sets: '4', reps: '5-8', rest: 120,
    grip: 'High bar: traps. Low bar: rear delts. Hands as close to shoulders as shoulder mobility allows.',
    breathing: 'Valsalva maneuver: big belly breath, 360 brace BEFORE descent. Exhale at lockout.',
    form: [
      'Stance: shoulder width or slightly wider. Toes 15-30 out.',
      'Break hips and knees simultaneously.',
      'Knees track over toes - push them out.',
      'Hit parallel or below - crease of hip below knee.',
      'Drive up through mid-foot. "Spread the floor apart."'
    ],
    hacks: [
      'Heel wedges or plates under heels if ankle mobility limits depth.',
      '"Proud chest" throughout - prevents forward lean.',
      'Box squat to train sitting back.',
      'Pause squats build strength out of the hole.'
    ],
    commonMistakes: ['Knees caving', 'Heels rising', 'Butt wink at bottom', 'Forward torso collapse', 'Half depth'],
    alternatives: [
      { id: 'goblet_squat', reason: ['too_hard', 'knee_issue', 'no_barbell'] },
      { id: 'leg_press', reason: ['equipment_occupied', 'knee_issue'] },
      { id: 'bulgarian_split_squat', reason: ['variation'] }
    ],
    phase: [2, 3, 4],
    tags: ['compound', 'testosterone', 'king_lift', 'quads', 'full_body']
  },

  goblet_squat: {
    id: 'goblet_squat', name: 'Goblet Squat',
    category: 'legs', muscle: 'quads', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '12-15', rest: 60,
    grip: 'Hold dumbbell or kettlebell vertically at chest. Elbows inside knees at bottom.',
    breathing: 'Inhale before descent, exhale on rise.',
    form: ['Heels slightly wider than hips.', 'Sit between your heels - deep squat.', 'Elbows push knees out at bottom.', 'Tall chest throughout.'],
    hacks: ['Best teaching tool for squat mechanics.', 'Counterbalance allows deeper squat.'],
    commonMistakes: ['Not going deep enough', 'Losing chest position'],
    alternatives: [
      { id: 'squat', reason: ['too_easy', 'gym'] },
      { id: 'bodyweight_squat', reason: ['no_equipment'] }
    ],
    phase: [0, 1, 2],
    tags: ['beginner', 'mobility', 'quads']
  },

  bulgarian_split_squat: {
    id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat',
    category: 'legs', muscle: 'quads', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 3,
    sets: '3', reps: '8-10', rest: 75,
    grip: 'Dumbbells at sides or barbell on back.',
    breathing: 'Inhale down, exhale up.',
    form: [
      'Rear foot elevated on bench. Front foot 2-3 feet forward.',
      'Descend straight down - knee tracks over toes.',
      'Front thigh parallel at bottom.',
      'Drive through front heel to rise.'
    ],
    hacks: [
      'Hardest unilateral leg exercise - fixes imbalances.',
      'Lean slightly forward for more glute, upright for more quad.',
      'Pause at bottom for extra difficulty.'
    ],
    commonMistakes: ['Front foot too close (forward knee travel)', 'Rear knee smashing floor', 'Torso collapse'],
    alternatives: [
      { id: 'reverse_lunge', reason: ['too_hard'] },
      { id: 'squat', reason: ['variation'] }
    ],
    phase: [2, 3, 4],
    tags: ['unilateral', 'quads', 'glutes', 'balance']
  },

  leg_press: {
    id: 'leg_press', name: 'Leg Press',
    category: 'legs', muscle: 'quads', equipment: 'machine',
    mode: ['gym'],
    difficulty: 1,
    sets: '4', reps: '10-15', rest: 75,
    grip: 'Feet hip width, mid-platform. Higher = glutes, lower = quads.',
    breathing: 'Inhale as weight descends, exhale as you press.',
    form: ['Don\'t lock knees fully at top.', 'Full ROM - 90 knee angle at bottom.', 'Back flat against pad - no lifting off.'],
    hacks: ['Foot placement drastically changes muscle emphasis.', 'Single leg variation for balance and imbalance correction.'],
    commonMistakes: ['Locking knees', 'Too little depth', 'Pushing through toes only'],
    alternatives: [
      { id: 'squat', reason: ['variation'] },
      { id: 'goblet_squat', reason: ['no_machine'] }
    ],
    phase: [1, 2, 3, 4],
    tags: ['machine', 'quads', 'knee_friendly']
  },

  reverse_lunge: {
    id: 'reverse_lunge', name: 'Reverse Lunge',
    category: 'legs', muscle: 'quads', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '12', rest: 45,
    grip: 'Bodyweight or dumbbells at sides.',
    breathing: 'Inhale on descent, exhale on return.',
    form: ['Step back - rear knee to floor.', 'Front shin vertical.', 'Drive through front heel to return.'],
    hacks: ['Easier on knees than forward lunge.', 'Better for beginners.'],
    commonMistakes: ['Front knee caving', 'Torso too far forward'],
    alternatives: [{ id: 'bulgarian_split_squat', reason: ['too_easy'] }, { id: 'forward_lunge', reason: ['variation'] }],
    phase: [1, 2, 3, 4],
    tags: ['unilateral', 'beginner', 'knee_friendly']
  },

  hip_thrust: {
    id: 'hip_thrust', name: 'Barbell Hip Thrust',
    category: 'legs', muscle: 'glutes', equipment: 'barbell',
    mode: ['gym'],
    difficulty: 2,
    testosterone: true,
    sets: '4', reps: '10-12', rest: 75,
    grip: 'Bar across hip crease. Pad for comfort.',
    breathing: 'Exhale and drive at top, inhale on descent.',
    form: [
      'Upper back on bench edge. Feet flat, hip width.',
      'Drive hips up - full extension. Squeeze glutes HARD.',
      'Chin tucked - don\'t hyperextend lower back.',
      'Knees at 90 at top.'
    ],
    hacks: ['Posterior pelvic tilt at top for max glute activation.', 'Pause 2 seconds at top.', 'Single leg for unilateral strength.'],
    commonMistakes: ['Lower back hyperextension instead of glute squeeze', 'Feet too far (hamstring dominant)', 'No pause at top'],
    alternatives: [
      { id: 'glute_bridge', reason: ['no_barbell', 'beginner'] },
      { id: 'cable_kickback', reason: ['variation'] }
    ],
    phase: [2, 3, 4],
    tags: ['glutes', 'posterior_chain', 'testosterone']
  },

  glute_bridge: {
    id: 'glute_bridge', name: 'Glute Bridge',
    category: 'legs', muscle: 'glutes', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '15-20', rest: 30,
    grip: 'Bodyweight. Arms flat at sides.',
    breathing: 'Exhale as hips rise.',
    form: ['Lie on back, knees bent, feet flat.', 'Drive hips to ceiling, squeeze glutes.', 'Neutral spine - no lower back arch.'],
    hacks: ['Single leg version for progression.', 'Feet on bench for more ROM (hip thrust progression).'],
    commonMistakes: ['Hamstring dominant - feet too far', 'No glute squeeze at top'],
    alternatives: [{ id: 'hip_thrust', reason: ['too_easy'] }],
    phase: [0, 1, 2],
    tags: ['beginner', 'glutes', 'activation', 'rehabilitation']
  },

  calf_raise: {
    id: 'calf_raise', name: 'Standing Calf Raise',
    category: 'legs', muscle: 'calves', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '4', reps: '20-25', rest: 30,
    grip: 'Toes on edge of step. Full ROM.',
    breathing: 'Exhale up, inhale down.',
    form: ['Full depression (heel below step) to full plantarflexion.', 'Pause 1 sec at top - squeeze.', 'Slow: 2-3 sec descent.'],
    hacks: ['Calves need high volume (20+ reps). Train them daily.', 'Straight knee = gastrocnemius, bent = soleus.'],
    commonMistakes: ['Partial reps (no heel drop)', 'Rushing reps'],
    alternatives: [{ id: 'seated_calf_raise', reason: ['variation'] }, { id: 'jump_rope', reason: ['variation'] }],
    phase: [0, 1, 2, 3, 4],
    tags: ['calves', 'high_rep', 'endurance']
  },

  trap_bar_deadlift: {
    id: 'trap_bar_deadlift', name: 'Trap Bar Deadlift',
    category: 'legs', muscle: 'quads', equipment: 'trap_bar',
    mode: ['gym'],
    difficulty: 2,
    sets: '4', reps: '5-8', rest: 120,
    grip: 'Neutral grip handles inside the hex. Centered in bar.',
    breathing: 'Valsalva, exhale at lockout.',
    form: ['More upright torso than conventional.', 'Quad-dominant - sit into it more.', 'Drives knees forward.'],
    hacks: ['Easier to learn than conventional. Great for knee-friendly heavy pulling.', 'Excellent for athletes.'],
    commonMistakes: ['Treating it like a deadlift (too hip-hinged) - it\'s more of a squat-pull hybrid'],
    alternatives: [{ id: 'deadlift', reason: ['variation'] }, { id: 'squat', reason: ['no_trap_bar'] }],
    phase: [2, 3, 4],
    tags: ['compound', 'knee_friendly', 'athletic']
  },

  // --- CORE ---
  plank: {
    id: 'plank', name: 'Plank',
    category: 'core', muscle: 'core', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '30-60s', rest: 45,
    grip: 'Forearms or hands. Neutral spine. Body straight from head to heel.',
    breathing: 'Nasal breathing throughout. Never hold breath.',
    form: ['Squeeze everything: glutes, quads, core.', 'Neutral neck - don\'t look up or drop head.', 'Posterior pelvic tilt slightly - no sagging or piking.'],
    hacks: ['Hollow body plank > standard plank for core activation.', 'RKC plank: contract every muscle maximally for 10 sec.'],
    commonMistakes: ['Hips too high', 'Head drooping', 'Holding breath'],
    alternatives: [{ id: 'ab_wheel', reason: ['too_easy'] }, { id: 'dead_bug', reason: ['variation'] }],
    phase: [0, 1, 2, 3, 4],
    tags: ['core', 'stability', 'beginner']
  },

  ab_wheel: {
    id: 'ab_wheel', name: 'Ab Wheel Rollout',
    category: 'core', muscle: 'core', equipment: 'ab_wheel',
    mode: ['gym', 'home'],
    difficulty: 3,
    sets: '3', reps: '8-12', rest: 60,
    grip: 'Both hands on wheel. Arms shoulder width. Start kneeling.',
    breathing: 'Exhale bracing as you roll out, inhale returning.',
    form: ['Hollow body position - posterior pelvic tilt.', 'Roll to full extension without touching floor.', 'Pull back with lats and core simultaneously.', 'No lower back collapse.'],
    hacks: ['Hardest core exercise. Progress from partial to full rollout.', 'Standing rollouts = elite level.'],
    commonMistakes: ['Lower back collapse at extension', 'Using hip flexors instead of core'],
    alternatives: [{ id: 'plank', reason: ['too_hard'] }, { id: 'dragon_flag', reason: ['too_easy'] }],
    phase: [2, 3, 4],
    tags: ['core', 'advanced', 'anti_extension']
  },

  dead_bug: {
    id: 'dead_bug', name: 'Dead Bug',
    category: 'core', muscle: 'core', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '10', rest: 45,
    grip: 'Arms extended to ceiling. Legs 90/90.',
    breathing: 'Exhale fully as limbs extend - force lower back to floor.',
    form: ['Lower back MUST stay on floor - test with hand.', 'Extend opposite arm + leg simultaneously.', 'Slow and controlled - 3 sec out.'],
    hacks: ['Best exercise for anti-extension core stability.', 'Press arm into floor for added difficulty.'],
    commonMistakes: ['Lower back lifting off floor', 'Too fast - losing control'],
    alternatives: [{ id: 'plank', reason: ['variation'] }, { id: 'bird_dog', reason: ['variation'] }],
    phase: [0, 1, 2],
    tags: ['core', 'stability', 'rehabilitation', 'beginner']
  },

  hanging_leg_raise: {
    id: 'hanging_leg_raise', name: 'Hanging Leg Raise',
    category: 'core', muscle: 'core', equipment: 'pullup_bar',
    mode: ['gym', 'home'],
    difficulty: 2,
    sets: '3', reps: '10-15', rest: 60,
    grip: 'Overhand, shoulder width. Dead hang.',
    breathing: 'Exhale as legs rise, inhale on descent.',
    form: ['Posterior pelvic tilt - curl pelvis UP as legs rise.', 'Slow descent - 3 seconds.', 'Don\'t swing - control.'],
    hacks: ['Bent knee version is easier (tucks).', 'Toes-to-bar is elite level.'],
    commonMistakes: ['Hip flexor dominant (legs swing up without pelvic tilt)', 'Swinging the body'],
    alternatives: [{ id: 'lying_leg_raise', reason: ['too_hard'] }, { id: 'ab_wheel', reason: ['variation'] }],
    phase: [1, 2, 3, 4],
    tags: ['core', 'lower_abs', 'grip_strength']
  },

  cable_crunch: {
    id: 'cable_crunch', name: 'Cable Crunch',
    category: 'core', muscle: 'core', equipment: 'cable',
    mode: ['gym'],
    difficulty: 1,
    sets: '4', reps: '15-20', rest: 45,
    grip: 'Rope attachment. Hold beside head.',
    breathing: 'Exhale HARD as you crunch, inhale on return.',
    form: ['Kneel facing cable. Hips fixed - don\'t move.', 'Flex spine - pull ribs to pelvis.', 'Slow return.'],
    hacks: ['Only ab exercise you can progressively overload easily.', 'Keep hips stationary - not a hip hinge.'],
    commonMistakes: ['Moving hips (hip flexors dominate)', 'Too heavy - losing ROM'],
    alternatives: [{ id: 'plank', reason: ['no_cable'] }, { id: 'ab_wheel', reason: ['no_cable'] }],
    phase: [2, 3, 4],
    tags: ['core', 'progressive_overload', 'isolation']
  },

  // --- MOBILITY ---
  hip_flexor_stretch: {
    id: 'hip_flexor_stretch', name: 'Hip Flexor Stretch (90/90)',
    category: 'mobility', muscle: 'hip_flexors', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '2', reps: '60s each side', rest: 15,
    grip: 'N/A',
    breathing: 'Long exhale to sink deeper into stretch.',
    form: ['90/90 position or kneeling lunge.', 'Posterior pelvic tilt - tuck pelvis under.', 'Feel stretch in front of rear hip.', 'Don\'t arch lower back.'],
    hacks: ['Sitting kills hip flexors. This is mandatory daily.', 'Hold and breathe for 60-90 sec per side.'],
    commonMistakes: ['Arching lower back (loses stretch)', 'Not tilting pelvis'],
    alternatives: [],
    phase: [0, 1, 2, 3, 4],
    tags: ['mobility', 'daily', 'hip', 'posture']
  },

  thoracic_rotation: {
    id: 'thoracic_rotation', name: 'Thoracic Rotation (Thread the Needle)',
    category: 'mobility', muscle: 'thoracic_spine', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '2', reps: '10 each side', rest: 15,
    grip: 'N/A',
    breathing: 'Exhale as you rotate.',
    form: ['Start in quadruped (hands/knees).', 'Thread one arm under body.', 'Rotate toward ceiling.', 'Hold peak 2 sec.'],
    hacks: ['Critical for shoulder health and squat/press performance.'],
    commonMistakes: ['Rotating from lumbar, not thoracic'],
    alternatives: [],
    phase: [0, 1, 2, 3, 4],
    tags: ['mobility', 'thoracic', 'shoulder_health']
  },

  ankle_mobility: {
    id: 'ankle_mobility', name: 'Ankle Mobility Drill',
    category: 'mobility', muscle: 'ankle', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '2', reps: '15 each side', rest: 10,
    grip: 'N/A',
    breathing: 'Normal.',
    form: ['Stand with toes 4-5 inches from wall.', 'Drive knee toward wall without heel lifting.', 'Progress distance away from wall.'],
    hacks: ['Critical for squat depth and running mechanics.', 'Banded distraction adds 2x improvement.'],
    commonMistakes: ['Heel lifting (cheating)'],
    alternatives: [],
    phase: [0, 1, 2, 3, 4],
    tags: ['mobility', 'ankle', 'squat_prep', 'running_prep']
  },

  worlds_greatest_stretch: {
    id: 'worlds_greatest_stretch', name: 'World\'s Greatest Stretch',
    category: 'mobility', muscle: 'full_body', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '2', reps: '5 each side', rest: 15,
    grip: 'N/A',
    breathing: 'Deep exhale on each position.',
    form: [
      'Start in lunge position.',
      'Same-side elbow to floor.',
      'Rotate arm to ceiling.',
      'Straighten leg (hamstring stretch).',
      'Return and repeat other side.'
    ],
    hacks: ['Single best warmup exercise - hits hips, thoracic, hamstrings, calves in sequence.'],
    commonMistakes: ['Rushing - hold each position'],
    alternatives: [],
    phase: [0, 1, 2, 3, 4],
    tags: ['mobility', 'warmup', 'full_body', 'must_do']
  },

  // --- CARDIO/RUNNING PREP ---
  jump_rope: {
    id: 'jump_rope', name: 'Jump Rope',
    category: 'cardio', muscle: 'full_body', equipment: 'jump_rope',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '3 min', rest: 60,
    grip: 'Handles at hip level. Wrists rotate - not arms.',
    breathing: 'Rhythmic nasal breathing. Exhale on landing.',
    form: ['Land on balls of feet - never flat foot.', 'Small hops - 1-2 inches off ground.', 'Slight knee bend on landing - shock absorption.', 'Elbows close to body.'],
    hacks: ['Best low-impact cardio for knee conditioning.', 'Builds landing mechanics for running.', 'Double-unders for intensity.'],
    commonMistakes: ['Landing flat-footed', 'Big jumps', 'Arms too wide'],
    alternatives: [{ id: 'shadow_boxing', reason: ['no_rope'] }, { id: 'high_knees', reason: ['no_equipment'] }],
    phase: [0, 1, 2, 3, 4],
    tags: ['cardio', 'knee_friendly', 'coordination', 'endurance']
  },

  high_knees: {
    id: 'high_knees', name: 'High Knees',
    category: 'cardio', muscle: 'full_body', equipment: 'bodyweight',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '30s', rest: 30,
    grip: 'N/A',
    breathing: 'Rhythmic exhale each step.',
    form: ['Drive knee to hip height.', 'Arms pump opposite to legs.', 'Land midfoot - light.'],
    hacks: ['Slower high knees = running drill. Faster = conditioning.'],
    commonMistakes: ['Not driving knee high enough', 'Landing on heels'],
    alternatives: [{ id: 'jump_rope', reason: ['variation'] }],
    phase: [0, 1, 2, 3, 4],
    tags: ['cardio', 'warmup', 'running_drill']
  },

  box_jump: {
    id: 'box_jump', name: 'Box Jump',
    category: 'cardio', muscle: 'legs', equipment: 'plyo_box',
    mode: ['gym'],
    difficulty: 2,
    sets: '4', reps: '5', rest: 90,
    grip: 'N/A',
    breathing: 'Exhale on jump, inhale on descent.',
    form: ['Athletic stance. Swing arms, bend knees.', 'Explode up - land softly with bent knees.', 'Step down (never jump down) to protect knees.', 'Full extension at top.'],
    hacks: ['Power exercise - always do fresh, not fatigued.', 'Teaches triple extension (ankle, knee, hip) for athletic performance.'],
    commonMistakes: ['Landing stiff', 'Jumping down (knee damage)', 'Too high too soon'],
    alternatives: [{ id: 'squat_jump', reason: ['no_box'] }, { id: 'broad_jump', reason: ['variation'] }],
    phase: [2, 3, 4],
    tags: ['power', 'athletic', 'plyometric', 'knee_conditioning']
  },

  //  BODYWEIGHT HOME EXERCISES 
  squat_jump: {
    id: 'squat_jump', name: 'Squat Jump',
    category: 'legs', muscle: 'quads', equipment: 'bodyweight',
    mode: ['gym', 'home'], difficulty: 1,
    sets: '4', reps: '10', rest: 60,
    grip: 'N/A  feet shoulder width, toes slightly out.',
    breathing: 'Inhale descent, exhale explosively on jump.',
    form: ['Squat to parallel, explode up.', 'Land softly  bend knees on landing.', 'Immediately into next rep.'],
    hacks: ['Swing arms for more height.', 'Land quietly  trains deceleration.'],
    commonMistakes: ['Landing stiff-legged', 'Not reaching depth'],
    alternatives: [{ id: 'box_jump', reason: ['gym'] }, { id: 'goblet_squat', reason: ['too_hard'] }],
    phase: [1, 2, 3, 4], tags: ['bodyweight', 'plyometric', 'power', 'home']
  },

  wall_sit: {
    id: 'wall_sit', name: 'Wall Sit',
    category: 'legs', muscle: 'quads', equipment: 'bodyweight',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '45-60s', rest: 45,
    grip: 'Back flat on wall. Thighs parallel to floor.',
    breathing: 'Steady nasal breathing throughout.',
    form: ['90 degree knee angle.', 'Back flat  no rounding.', 'Hands off thighs.'],
    hacks: ['Add single leg for progression.', 'Great quad endurance builder.'],
    commonMistakes: ['Knees going past toes', 'Back peeling off wall'],
    alternatives: [{ id: 'goblet_squat', reason: ['variation'] }],
    phase: [0, 1, 2], tags: ['bodyweight', 'endurance', 'home', 'quads']
  },

  step_up: {
    id: 'step_up', name: 'Step Up',
    category: 'legs', muscle: 'quads', equipment: 'bodyweight',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '12/side', rest: 45,
    grip: 'Bodyweight or hold household items for load.',
    breathing: 'Exhale on step up, inhale on return.',
    form: ['Full foot on step.', 'Drive through heel.', 'Control the descent.'],
    hacks: ['Higher step = more glute. Lower = more quad.', 'Use stairs at home.'],
    commonMistakes: ['Pushing off back foot', 'Knee caving'],
    alternatives: [{ id: 'reverse_lunge', reason: ['variation'] }],
    phase: [0, 1, 2, 3], tags: ['bodyweight', 'unilateral', 'home', 'functional']
  },

  single_leg_glute_bridge: {
    id: 'single_leg_glute_bridge', name: 'Single Leg Glute Bridge',
    category: 'legs', muscle: 'glutes', equipment: 'bodyweight',
    mode: ['home'], difficulty: 2,
    sets: '3', reps: '15/side', rest: 30,
    grip: 'N/A  one leg extended, one foot flat.',
    breathing: 'Exhale as hip rises.',
    form: ['Drive through planted heel.', 'Keep hips level  do not rotate.', 'Squeeze glute at top 1 sec.'],
    hacks: ['Best home glute builder without equipment.', 'Elevate foot for more range.'],
    commonMistakes: ['Hip rotation', 'Not squeezing at top'],
    alternatives: [{ id: 'glute_bridge', reason: ['too_hard'] }, { id: 'hip_thrust', reason: ['gym'] }],
    phase: [0, 1, 2, 3, 4], tags: ['bodyweight', 'glutes', 'unilateral', 'home']
  },

  nordic_curl: {
    id: 'nordic_curl', name: 'Nordic Curl (Bodyweight)',
    category: 'legs', muscle: 'hamstrings', equipment: 'bodyweight',
    mode: ['home'], difficulty: 3,
    sets: '3', reps: '5-8', rest: 90,
    grip: 'Anchor feet under sofa/bed. Kneel upright.',
    breathing: 'Inhale on controlled descent, exhale on return.',
    form: ['Fall forward controlling the descent with hamstrings.', 'Push up with hands at bottom.', 'Drag yourself back up with hamstrings.'],
    hacks: ['One of the most effective hamstring exercises available.', 'Reduces ACL injury risk significantly.'],
    commonMistakes: ['Dropping too fast', 'Using arms to pull back up'],
    alternatives: [{ id: 'rdl', reason: ['gym'] }],
    phase: [2, 3, 4], tags: ['bodyweight', 'hamstrings', 'advanced', 'home']
  },

  diamond_pushup: {
    id: 'diamond_pushup', name: 'Diamond Push-up',
    category: 'push', muscle: 'triceps', equipment: 'bodyweight',
    mode: ['home'], difficulty: 2,
    sets: '3', reps: '10-15', rest: 45,
    grip: 'Index fingers and thumbs touching  diamond shape.',
    breathing: 'Inhale down, exhale up.',
    form: ['Elbows stay close to body.', 'Chest between hands.', 'Full ROM.'],
    hacks: ['Best bodyweight tricep exercise.', 'Elevate hands to reduce difficulty.'],
    commonMistakes: ['Elbows flaring out', 'Partial reps'],
    alternatives: [{ id: 'pushup', reason: ['too_hard'] }],
    phase: [1, 2, 3, 4], tags: ['bodyweight', 'triceps', 'home']
  },

  wide_pushup: {
    id: 'wide_pushup', name: 'Wide Grip Push-up',
    category: 'push', muscle: 'chest', equipment: 'bodyweight',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '15-20', rest: 45,
    grip: 'Hands wider than shoulder width.',
    breathing: 'Inhale down, exhale up.',
    form: ['Chest to floor.', 'Elbows flare to 90.', 'Full lockout at top.'],
    hacks: ['More chest, less tricep vs standard.'],
    commonMistakes: ['Hips sagging', 'Partial reps'],
    alternatives: [{ id: 'pushup', reason: ['variation'] }],
    phase: [0, 1, 2, 3], tags: ['bodyweight', 'chest', 'home']
  },

  bodyweight_tricep_dip: {
    id: 'bodyweight_tricep_dip', name: 'Chair Tricep Dip',
    category: 'push', muscle: 'triceps', equipment: 'bodyweight',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '15-20', rest: 45,
    grip: 'Hands on chair edge behind you. Fingers forward.',
    breathing: 'Inhale on descent, exhale on press up.',
    form: ['Hips close to chair.', 'Elbows track backward  not flared.', 'Lower to 90 degrees.'],
    hacks: ['Extend legs forward to increase difficulty.', 'Place feet on second chair for maximum difficulty.'],
    commonMistakes: ['Elbows flaring out', 'Going too deep (shoulder strain)'],
    alternatives: [{ id: 'diamond_pushup', reason: ['variation'] }],
    phase: [0, 1, 2, 3], tags: ['bodyweight', 'triceps', 'home']
  },

  superman: {
    id: 'superman', name: 'Superman Hold',
    category: 'core', muscle: 'lower_back', equipment: 'bodyweight',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '10', rest: 30,
    grip: 'Prone. Arms extended overhead.',
    breathing: 'Exhale as you lift, inhale on descent.',
    form: ['Simultaneously lift arms, chest and legs off floor.', 'Hold 2 seconds at top.', 'Squeeze glutes.'],
    hacks: ['Alternating arm/leg version for more control.', 'Critical for lower back health.'],
    commonMistakes: ['Only lifting upper or lower, not both', 'No hold at top'],
    alternatives: [{ id: 'dead_bug', reason: ['variation'] }],
    phase: [0, 1, 2, 3, 4], tags: ['bodyweight', 'lower_back', 'home', 'rehabilitation']
  },

  mountain_climber: {
    id: 'mountain_climber', name: 'Mountain Climber',
    category: 'core', muscle: 'core', equipment: 'bodyweight',
    mode: ['home'], difficulty: 2,
    sets: '3', reps: '30s', rest: 30,
    grip: 'Push-up position. Hands shoulder width.',
    breathing: 'Rhythmic exhale with each knee drive.',
    form: ['Rigid plank position throughout.', 'Drive knees toward chest alternately.', 'Hips stay level.'],
    hacks: ['Slow = core exercise. Fast = cardio + core.', 'Cross-body version targets obliques.'],
    commonMistakes: ['Hips bouncing up and down', 'Losing plank position'],
    alternatives: [{ id: 'plank', reason: ['too_hard'] }],
    phase: [1, 2, 3, 4], tags: ['bodyweight', 'core', 'cardio', 'home']
  },

  bicycle_crunch: {
    id: 'bicycle_crunch', name: 'Bicycle Crunch',
    category: 'core', muscle: 'core', equipment: 'bodyweight',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '20/side', rest: 30,
    grip: 'Hands lightly behind head. Do not pull neck.',
    breathing: 'Exhale on each rotation.',
    form: ['Shoulder off floor  not just head.', 'Rotate to bring elbow to opposite knee.', 'Extend opposite leg fully.', 'Slow and controlled  feel the oblique.'],
    hacks: ['Slow tempo = double the activation.', 'Full leg extension is mandatory.'],
    commonMistakes: ['Pulling neck with hands', 'Not extending leg', 'Too fast  momentum'],
    alternatives: [{ id: 'cable_crunch', reason: ['gym'] }],
    phase: [0, 1, 2, 3, 4], tags: ['bodyweight', 'core', 'obliques', 'home']
  },

  hollow_body_hold: {
    id: 'hollow_body_hold', name: 'Hollow Body Hold',
    category: 'core', muscle: 'core', equipment: 'bodyweight',
    mode: ['home'], difficulty: 2,
    sets: '3', reps: '30s', rest: 45,
    grip: 'Arms overhead. Legs straight.',
    breathing: 'Slow nasal breathing. Never hold breath.',
    form: ['Posterior pelvic tilt  lower back pressed to floor.', 'Arms and legs hovering.', 'Body forms a banana curve.'],
    hacks: ['Foundation of all gymnastic strength.', 'Tuck knees to reduce difficulty.'],
    commonMistakes: ['Lower back arching off floor', 'Holding breath'],
    alternatives: [{ id: 'plank', reason: ['too_hard'] }],
    phase: [1, 2, 3, 4], tags: ['bodyweight', 'core', 'advanced', 'anti_extension', 'home']
  },

  band_pull_apart: {
    id: 'band_pull_apart', name: 'Band Pull Apart',
    category: 'pull', muscle: 'rear_delt', equipment: 'resistance_band',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '20', rest: 30,
    grip: 'Overhand. Arms straight at shoulder height.',
    breathing: 'Exhale on pull, inhale on return.',
    form: ['Pull band apart to chest width.', 'Squeeze shoulder blades at end.', 'Control the return.'],
    hacks: ['Best home substitute for face pull.', 'Do 20 reps every morning for shoulder health.'],
    commonMistakes: ['Bending elbows', 'Not squeezing at peak'],
    alternatives: [{ id: 'face_pull', reason: ['gym'] }],
    phase: [0, 1, 2, 3, 4], tags: ['bodyweight', 'shoulder_health', 'home', 'resistance_band']
  },

  resistance_band_row: {
    id: 'resistance_band_row', name: 'Resistance Band Row',
    category: 'pull', muscle: 'back', equipment: 'resistance_band',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '15', rest: 45,
    grip: 'Band anchored to door. Overhand or neutral grip.',
    breathing: 'Exhale on row, inhale on return.',
    form: ['Sit tall or stand.', 'Row to lower chest.', 'Squeeze scapula at peak.'],
    hacks: ['Use a door anchor or wrap band around a pole.', 'Single arm for more rotation.'],
    commonMistakes: ['Leaning back too much', 'No scapular squeeze'],
    alternatives: [{ id: 'inverted_row', reason: ['variation'] }, { id: 'cable_row', reason: ['gym'] }],
    phase: [0, 1, 2, 3], tags: ['home', 'back', 'resistance_band']
  },

  towel_row: {
    id: 'towel_row', name: 'Towel Row (Door)',
    category: 'pull', muscle: 'back', equipment: 'bodyweight',
    mode: ['home'], difficulty: 2,
    sets: '3', reps: '10-12', rest: 60,
    grip: 'Towel over door handle. Lean back, arms extended.',
    breathing: 'Exhale on row, inhale on descent.',
    form: ['Feet against door base.', 'Lean back 45 degrees.', 'Row chest to door.', 'Elbows drive back.'],
    hacks: ['Free inverted row at home.', 'Walk feet further forward to increase difficulty.'],
    commonMistakes: ['Not leaning back enough', 'Partial range'],
    alternatives: [{ id: 'inverted_row', reason: ['gym'] }, { id: 'resistance_band_row', reason: ['easier'] }],
    phase: [0, 1, 2, 3, 4], tags: ['bodyweight', 'back', 'home', 'no_equipment']
  },

  farmer_carry: {
    id: 'farmer_carry', name: 'Farmer\'s Carry',
    category: 'core', muscle: 'full_body', equipment: 'dumbbell',
    mode: ['gym', 'home'],
    difficulty: 1,
    sets: '3', reps: '40m walk', rest: 60,
    grip: 'Heavy dumbbells/kettlebells. Deadhanging - do not rest on thighs.',
    breathing: 'Rhythmic nasal breathing.',
    form: ['Stand tall. Shoulders packed down.', 'Core braced - walk with purpose.', 'Small steps, controlled.'],
    hacks: ['Best grip strength, core, and trap builder.', 'Unilateral = suitcase carry for obliques.', 'Overhead carry = shoulder stability.'],
    commonMistakes: ['Leaning to one side', 'Losing shoulder position', 'Short distance (too easy)'],
    alternatives: [{ id: 'plank', reason: ['no_space'] }],
    phase: [1, 2, 3, 4],
    tags: ['functional', 'grip', 'core', 'endurance']
  }

,

  // --- ARMS ---

  barbell_curl: {
    id: 'barbell_curl', name: 'Barbell Bicep Curl',
    category: 'pull', muscle: 'biceps', equipment: 'barbell',
    mode: ['gym'], difficulty: 1,
    sets: '3', reps: '10-12', rest: 60,
    grip: 'Shoulder width underhand (supinated). Thumbs wrapped. Wrists straight throughout.',
    breathing: 'Exhale on the curl up, inhale on controlled descent.',
    form: [
      'Elbows pinned to sides - they should not move forward or back.',
      'Full extension at bottom - do not cut the eccentric short.',
      'Squeeze at the top for 1 second. Do not swing.',
      'Stand tall. No lower back arch to assist the lift.'
    ],
    hacks: [
      'Slow eccentric (3 sec down) doubles hypertrophy stimulus.',
      'Pinch paper under armpit - if it drops your elbows are swinging.',
      'Slightly wider grip hits short head (thickness). Closer hits long head (peak).'
    ],
    commonMistakes: ['Elbows drifting forward', 'Swinging body', 'Partial ROM at bottom', 'Wrists bending backward'],
    alternatives: [
      { id: 'db_curl', reason: ['variation', 'equipment_occupied'] },
      { id: 'hammer_curl', reason: ['variation'] },
      { id: 'resistance_band_curl', reason: ['no_barbell'] }
    ],
    phase: [2, 3, 4], tags: ['biceps', 'arms', 'aesthetics']
  },

  db_curl: {
    id: 'db_curl', name: 'Dumbbell Bicep Curl',
    category: 'pull', muscle: 'biceps', equipment: 'dumbbell',
    mode: ['gym', 'home'], difficulty: 1,
    sets: '3', reps: '10-12', rest: 60,
    grip: 'Underhand (supinated). One dumbbell each hand. Thumbs wrapped.',
    breathing: 'Exhale curling up, inhale lowering down.',
    form: [
      'Alternate arms or both together.',
      'Supinate (rotate palm up) as you curl for peak contraction.',
      'Full extension at bottom. Full squeeze at top.',
      'Elbow stays fixed at side throughout.'
    ],
    hacks: [
      'Incline DB curl (on incline bench) gives longer stretch and greater ROM.',
      'Rotate wrist outward at top for maximum bicep peak activation.',
      'Concentration curl variation for isolation.'
    ],
    commonMistakes: ['No supination', 'Partial ROM', 'Swinging shoulders'],
    alternatives: [
      { id: 'barbell_curl', reason: ['variation'] },
      { id: 'hammer_curl', reason: ['variation'] },
      { id: 'resistance_band_curl', reason: ['no_equipment'] }
    ],
    phase: [1, 2, 3, 4], tags: ['biceps', 'arms', 'unilateral', 'aesthetics']
  },

  hammer_curl: {
    id: 'hammer_curl', name: 'Hammer Curl',
    category: 'pull', muscle: 'biceps', equipment: 'dumbbell',
    mode: ['gym', 'home'], difficulty: 1,
    sets: '3', reps: '10-12', rest: 60,
    grip: 'Neutral grip - thumbs pointing up like holding a hammer.',
    breathing: 'Exhale up, inhale down.',
    form: [
      'Thumbs up throughout - do not rotate to supinated grip.',
      'Elbow fixed at side.',
      'Full ROM - full extension to full flex.',
      'Both arms simultaneously or alternating.'
    ],
    hacks: [
      'Hits brachialis and brachioradialis - makes arm look thicker.',
      'Cross-body hammer curl for brachialis isolation.',
      'Usually stronger than supinated curl - use for heavier loading.'
    ],
    commonMistakes: ['Rotating to supinated grip mid-rep', 'Swinging'],
    alternatives: [
      { id: 'db_curl', reason: ['variation'] },
      { id: 'barbell_curl', reason: ['variation'] }
    ],
    phase: [2, 3, 4], tags: ['biceps', 'brachialis', 'forearms', 'arms']
  },

  resistance_band_curl: {
    id: 'resistance_band_curl', name: 'Resistance Band Curl',
    category: 'pull', muscle: 'biceps', equipment: 'resistance_band',
    mode: ['home'], difficulty: 1,
    sets: '3', reps: '15-20', rest: 45,
    grip: 'Stand on band. Underhand grip. Shoulder width.',
    breathing: 'Exhale up, inhale down.',
    form: ['Stand on middle of band.', 'Curl both hands up.', 'Maintain constant tension throughout.'],
    hacks: ['Bands provide more resistance at peak contraction - different stimulus to free weights.'],
    commonMistakes: ['Band too loose at bottom', 'Elbow drifting'],
    alternatives: [{ id: 'db_curl', reason: ['gym'] }],
    phase: [0, 1, 2], tags: ['biceps', 'home', 'resistance_band']
  },

  tricep_pushdown: {
    id: 'tricep_pushdown', name: 'Cable Tricep Pushdown',
    category: 'push', muscle: 'triceps', equipment: 'cable',
    mode: ['gym'], difficulty: 1,
    sets: '3', reps: '12-15', rest: 60,
    grip: 'Overhand on straight bar or rope attachment. Elbows tucked to sides.',
    breathing: 'Exhale on pushdown, inhale on return.',
    form: [
      'Elbows pinned at sides and fixed - only forearms move.',
      'Full extension at bottom - lock out the elbow.',
      'Slow return - 2-3 sec eccentric.',
      'Rope: spread the rope at the bottom for peak contraction.'
    ],
    hacks: [
      'Rope attachment gives full pronation at bottom - more long head activation.',
      'Lean slightly forward for better leverage.',
      'Reverse grip (underhand) shifts emphasis to medial head.'
    ],
    commonMistakes: ['Elbows flaring out', 'No full extension', 'Wrists breaking'],
    alternatives: [
      { id: 'skull_crusher', reason: ['variation'] },
      { id: 'diamond_pushup', reason: ['no_cable'] },
      { id: 'overhead_tricep_ext', reason: ['variation'] }
    ],
    phase: [2, 3, 4], tags: ['triceps', 'arms', 'cable', 'aesthetics']
  },

  skull_crusher: {
    id: 'skull_crusher', name: 'Skull Crusher (EZ Bar)',
    category: 'push', muscle: 'triceps', equipment: 'barbell',
    mode: ['gym'], difficulty: 2,
    sets: '3', reps: '10-12', rest: 60,
    grip: 'Narrow overhand grip on EZ bar. Hands 6-8 inches apart.',
    breathing: 'Inhale as bar lowers, exhale as you press up.',
    form: [
      'Lie flat on bench. Bar starts directly over shoulders.',
      'Only elbows move - lower bar toward forehead.',
      'Stop just above forehead.',
      'Press back to full extension. Elbows stay vertical.'
    ],
    hacks: [
      'Lower slightly behind head for more long head stretch.',
      'EZ bar easier on wrists than straight bar.',
      'Superset with close-grip bench for maximum tricep volume.'
    ],
    commonMistakes: ['Elbows flaring wide', 'Partial ROM'],
    alternatives: [
      { id: 'tricep_pushdown', reason: ['too_hard', 'injury'] },
      { id: 'overhead_tricep_ext', reason: ['variation'] },
      { id: 'diamond_pushup', reason: ['no_equipment'] }
    ],
    phase: [2, 3, 4], tags: ['triceps', 'arms', 'long_head', 'aesthetics']
  },

  overhead_tricep_ext: {
    id: 'overhead_tricep_ext', name: 'Overhead Tricep Extension',
    category: 'push', muscle: 'triceps', equipment: 'dumbbell',
    mode: ['gym', 'home'], difficulty: 1,
    sets: '3', reps: '12-15', rest: 60,
    grip: 'Both hands grip one dumbbell under top plate (diamond grip). Arms overhead.',
    breathing: 'Inhale as dumbbell lowers behind head, exhale pressing up.',
    form: [
      'Sit or stand upright. Dumbbell overhead, arms fully extended.',
      'Elbows point forward - do not flare.',
      'Lower dumbbell behind head until forearms touch biceps.',
      'Press back to full extension. Only forearms move.'
    ],
    hacks: [
      'Best exercise for long head of tricep - full stretch position.',
      'Long head is 2/3 of tricep mass - essential for arm size.',
      'Cable version with rope behind head provides constant tension.'
    ],
    commonMistakes: ['Elbows flaring out', 'Lower back arching', 'Partial ROM behind head'],
    alternatives: [
      { id: 'skull_crusher', reason: ['variation'] },
      { id: 'tricep_pushdown', reason: ['gym'] },
      { id: 'diamond_pushup', reason: ['no_equipment'] }
    ],
    phase: [1, 2, 3, 4], tags: ['triceps', 'long_head', 'arms', 'home']
  },

  close_grip_bench: {
    id: 'close_grip_bench', name: 'Close Grip Bench Press',
    category: 'push', muscle: 'triceps', equipment: 'barbell',
    mode: ['gym'], difficulty: 2,
    sets: '3', reps: '8-10', rest: 75,
    grip: 'Hands shoulder width or slightly narrower. Thumbs wrapped. Wrists straight.',
    breathing: 'Inhale on descent, exhale on press.',
    form: [
      'Elbows tuck to 45 degrees.',
      'Bar touches lower chest / upper abs.',
      'Full ROM. Full lockout at top.',
      'Maintain shoulder retraction throughout.'
    ],
    hacks: [
      'Heavier than isolation tricep work - builds arm mass faster.',
      'Also trains inner chest - two-for-one.',
      'Superset with barbell curl = classic arm day.'
    ],
    commonMistakes: ['Grip too narrow (wrist strain)', 'Elbows flaring', 'Bar touching too high'],
    alternatives: [
      { id: 'skull_crusher', reason: ['variation'] },
      { id: 'diamond_pushup', reason: ['no_barbell'] }
    ],
    phase: [2, 3, 4], tags: ['triceps', 'compound', 'arms', 'chest']
  }

};

// Export for use across modules
if (typeof module !== 'undefined') module.exports = EXERCISES;
