/* warmups.js */
var WARMUPS = {
  routines: {

    upper_body: {
      id: 'upper_body', name: 'Upper Body Warmup', duration: '10-12 min',
      forSessions: ['push','pull','upper','bench','press','row'],
      exercises: [
        { name: 'Jumping Jacks',                     duration: '60s',              notes: 'Elevates heart rate and warms shoulders. Cold muscles under load = injury. Non-negotiable.' },
        { name: 'Shadow Boxing',                     duration: '60s',              notes: 'Light punches. Warms shoulder joint dynamically through full range.' },
        { name: 'Arm Swings (cross body)',           duration: '30s',              notes: 'Arms straight across chest then wide behind. Opens chest and rear delt.' },
        { name: 'Neck Circles',                      reps: '5 each direction',     notes: 'Slow. Full circle. Neck tension transfers directly into shoulder pressing mechanics.' },
        { name: 'Cat-Cow',                           reps: 8,                      notes: 'Full spine warm-up. Inhale arch, exhale round. 2 sec each position.' },
        { name: 'Thoracic Rotation (Thread Needle)', reps: '8 each side',          notes: 'On hands and knees. Thread arm under, rotate to ceiling. Opens thoracic spine for pressing and rowing.' },
        { name: 'Arm Circles',                       duration: '30s each direction',notes: 'Small to large. Forward then backward. Gradually increases ROM.' },
        { name: 'Shoulder Dislocations',             reps: 12,                     notes: 'Band or stick. Wide grip over and back. Uncomfortable is fine. Dramatically increases shoulder ROM.' },
        { name: 'Band Pull Aparts',                  reps: 20,                     notes: 'Activates rear delts and external rotators before pressing. Use resistance band or cable face pull.' },
        { name: 'External Rotation with band',       reps: '15 each side',         notes: 'Elbow at 90 at side. Rotate forearm outward. Critical for rotator cuff health before heavy pressing.' },
        { name: 'Wrist Circles',                     duration: '30s each direction',notes: 'Essential before bench press or OHP. Prevents wrist pain under load.' },
        { name: 'Scapular Push-ups',                 reps: 12,                     notes: 'Arms straight. Move only shoulder blades forward and back. Activates serratus anterior. Prevents shoulder impingement.' },
        { name: 'Warmup Set (first exercise)',        reps: '10 at 40% load',       notes: 'Do 1 light set of your first exercise with perfect form. Final prep for the nervous system.' }
      ]
    },

    lower_body: {
      id: 'lower_body', name: 'Lower Body Warmup', duration: '12-15 min',
      forSessions: ['legs','lower','squat','deadlift','hinge'],
      exercises: [
        { name: 'Jump Rope or High Knees',         duration: '90s',               notes: 'Mandatory. Raises core temp, lubricates knees, activates fast-twitch fibres. Do not skip.' },
        { name: 'Bodyweight Squats (fast)',         reps: 15,                      notes: 'Quick tempo. Not for depth - for blood flow to quads, glutes and knees.' },
        { name: 'Alternating Reverse Lunges',      reps: '10 each leg',           notes: 'Dynamic. Step back and return. Warms hip flexors and quads together.' },
        { name: 'Ankle Circles',                   duration: '30s each direction', notes: 'Sit or stand. Slow full circles. Limited ankle mobility = restricted squat depth = knee compensation.' },
        { name: 'Ankle Dorsiflexion Wall Drill',   reps: '12 each side',          notes: 'Toes 4-5 inches from wall. Drive knee toward wall without heel lifting. Improves squat depth.' },
        { name: 'Hip Circles (standing)',          duration: '30s each direction', notes: 'Hold wall. Large slow circles from the hip. Opens hip capsule.' },
        { name: 'Leg Swings (Front/Back)',         reps: '20 each leg',           notes: 'Hold wall. Pendulum swing. Gradually increase range. Hamstrings and hip flexors.' },
        { name: 'Leg Swings (Side to Side)',       reps: '15 each leg',           notes: 'Lateral pendulum. Opens hip adductors and abductors.' },
        { name: "World's Greatest Stretch",        reps: '5 each side',           notes: 'Lunge - elbow to floor, rotate to ceiling, straighten leg. Hits hips, thoracic, hamstrings in one move.' },
        { name: 'Glute Bridges',                   reps: 15,                      notes: 'MANDATORY before squats. Without glute activation, knees cave and lower back compensates. Squeeze hard at top.' },
        { name: 'Clamshells',                      reps: '15 each side',          notes: 'Lie on side, knees bent. Open top knee. Activates glute medius - prevents knee cave during squat.' },
        { name: 'Fire Hydrants',                   reps: '15 each side',          notes: 'On hands and knees. Lift knee out to side at 90 degrees. Hip abductor and glute activation.' },
        { name: 'Knee Circles',                    reps: '10 each direction each leg', notes: 'Stand on one leg. Trace circles with bent knee. Lubricates knee joint before loading.' },
        { name: 'Goblet Squat (light)',            reps: 10,                      notes: 'Hold 3 sec at bottom. Elbows push knees out. Pattern rehearsal - not a working set.' },
        { name: 'Romanian Deadlift (light)',        reps: 8,                       notes: 'Very light. Feel the hamstring stretch. Prime the hinge pattern before loading.' }
      ]
    },

    full_body: {
      id: 'full_body', name: 'Full Body Warmup', duration: '10-12 min',
      forSessions: ['full_body','athletic','activation'],
      exercises: [
        { name: 'Jump Rope or High Knees',  duration: '2 min',             notes: 'Mandatory. Light sweat before touching a weight. Cold muscle + load = injury. No excuses.' },
        { name: 'Jumping Jacks',            duration: '30s',               notes: 'Arms overhead to open chest and shoulders.' },
        { name: "World's Greatest Stretch", reps: '5 each side',           notes: 'Single best warmup exercise. Hips, thoracic, hamstrings, calves in one move.' },
        { name: 'Thoracic Rotation',        reps: '10 each side',          notes: 'Opens thoracic spine for both pressing and squatting.' },
        { name: 'Neck Circles',             reps: '5 each direction',      notes: 'Slow. Releases tension from sitting and stress.' },
        { name: 'Hip Circles',              duration: '30s each side',     notes: 'Large slow circles. Opens hip capsule.' },
        { name: 'Ankle Circles',            duration: '30s each',          notes: 'Prevents squat depth restriction.' },
        { name: 'Arm Circles',              duration: '30s each direction', notes: 'Small to large. Shoulders and rotator cuff.' },
        { name: 'Wrist Circles',            duration: '20s each direction', notes: 'If pressing today - essential.' },
        { name: 'Glute Bridges',            reps: 15,                      notes: 'Activate glutes before any compound movement.' },
        { name: 'Inchworm to Push-up',      reps: 5,                       notes: 'Walk hands out, push-up, walk back, stand. Full chain activation.' },
        { name: 'Bodyweight Squat (deep)',  reps: 10,                      notes: '3 sec descent. Full depth. Arms out for counterbalance. Movement pattern primer.' }
      ]
    },

    running: {
      id: 'running', name: 'Pre-Run Warmup', duration: '8-10 min',
      forSessions: ['running','cardio','zone2','hiit'],
      exercises: [
        { name: 'Ankle Circles',                duration: '30s each direction',      notes: 'Slow full circles. Lubricates ankle before impact loading.' },
        { name: 'Knee Circles',                 reps: '10 each direction each leg',  notes: 'Stand on one leg. Lubricate knee joint before running load.' },
        { name: 'Hip Circles',                  duration: '30s each direction',      notes: 'Standing. Large slow circles.' },
        { name: 'Glute Bridges',                reps: 15,                            notes: 'MANDATORY. Inactive glutes = knees absorb all impact = injury. Do these every single run day.' },
        { name: 'Calf Raises (slow)',            reps: 15,                            notes: 'Slow up, slow down. Warms Achilles and calf. Running loads calf 3x bodyweight per stride.' },
        { name: 'Leg Swings (Front/Back)',      reps: '20 each leg',                 notes: 'Hold wall. Pendulum. Hamstrings and hip flexors.' },
        { name: 'Leg Swings (Side to Side)',    reps: '15 each leg',                 notes: 'IT band and hip abductors.' },
        { name: 'High Knees (slow march)',      reps: '20 steps',                    notes: 'Knee to hip height. Arm pump opposite to leg. Running drill - teaches correct mechanics.' },
        { name: 'Butt Kicks',                   reps: '20 steps',                    notes: 'Heel to glute. Hamstring activation and warm-up.' },
        { name: 'A-Skip',                       reps: '20m',                         notes: 'Skip with exaggerated knee drive and arm pump. Classic running drill.' },
        { name: 'Lateral Shuffles',             reps: '10m each direction',          notes: 'Side to side. Hip stabiliser activation. Protects knee during running.' },
        { name: 'Easy Jog (very slow)',         duration: '90s',                     notes: 'Your slowest comfortable pace. Bridge between warmup and run. Do not start fast.' }
      ]
    },

    mobility_only: {
      id: 'mobility_only', name: 'Cooldown & Recovery', duration: '20-25 min',
      forSessions: ['recovery','cooldown','post_workout'],
      exercises: [
        { name: 'Diaphragmatic Breathing',             duration: '2 min',         notes: '4 sec inhale nose, 1 sec hold, 6 sec exhale mouth. Shifts nervous system to parasympathetic. Do this before stretching - it doubles the effectiveness.' },
        { name: "Child's Pose",                        duration: '60s',           notes: 'Arms extended. Breathe into lower back. Decompresses spine after loading.' },
        { name: 'Cat-Cow',                             reps: 8,                   notes: 'Slow. Restore spinal mobility post-workout.' },
        { name: "World's Greatest Stretch",            reps: '5 each side',       notes: 'Hold each position 3 breaths. Post-workout you can go deeper.' },
        { name: '90/90 Hip Stretch',                   duration: '90s each side', notes: 'Both legs at 90 degrees. Lean forward over front shin. Hip external and internal rotators.' },
        { name: 'Hip Flexor Stretch (kneeling)',       duration: '90s each side', notes: 'Rear knee down. Tuck pelvis under. Front of rear hip. Counteracts squatting and sitting.' },
        { name: 'Pigeon Pose',                         duration: '90s each side', notes: 'Front shin across. Fold forward. Best glute stretch available. Essential after leg day.' },
        { name: 'Hamstring Stretch (lying)',           duration: '60s each side', notes: 'On back. Pull leg toward chest. Flex foot. Breathe into it.' },
        { name: 'Calf Stretch - Straight leg',        duration: '45s each',      notes: 'Foot on wall, leg straight. Gastrocnemius (upper calf). After every run and every leg session.' },
        { name: 'Calf Stretch - Bent knee',           duration: '45s each',      notes: 'Same position, bend knee slightly. Soleus and Achilles. Both positions are needed.' },
        { name: 'IT Band Stretch (lying figure-4)',    duration: '60s each',      notes: 'On back. Cross ankle over opposite knee. Pull both toward chest. Outer hip and IT band.' },
        { name: 'Quad Stretch (standing)',             duration: '30s each',      notes: 'Heel to glute. Hip forward. Important after squats, lunges, running.' },
        { name: 'Chest Opener (doorway)',              duration: '60s',           notes: 'Arms at 90 on doorframe. Step through. Reverses forward shoulder posture from pressing.' },
        { name: 'Overhead Lat Stretch',               duration: '45s each side', notes: 'Hold bar overhead. Shift laterally. Tight lats cause shoulder impingement.' },
        { name: 'Cross-Body Shoulder Stretch',        duration: '30s each',      notes: 'Arm across chest. Rear delt and external rotators.' },
        { name: 'Spinal Twist (supine)',              duration: '60s each side', notes: 'On back. Knee across body. Look away. Decompresses lumbar discs after heavy loading.' },
        { name: 'Neck Lateral Stretch',               duration: '30s each side', notes: 'Ear to shoulder. Gentle pressure with hand. Releases trap tension from compound lifting.' },
        { name: 'Wrist and Forearm Stretch',          duration: '30s each direction', notes: 'After pressing: pull fingers back, then push down. Prevents tendinitis from accumulated pressing volume.' },
        { name: "Child's Pose (final)",               duration: '60s',           notes: 'End here. Breathe. Session is done.' }
      ]
    }
  },

  stretchLibrary: [
    { id: 'hamstring_stretch', name: 'Lying Hamstring Stretch', muscle: 'hamstrings', duration: '60s each side',
      technique: 'Lie on back. Pull one leg toward chest. Flex foot. Keep other leg flat on floor.',
      breathing: 'Exhale deeply on each hold. Never force - breathe into the stretch.',
      tips: ['Slightly bent knee is fine if very tight.', 'Hold a towel around the foot if you cannot reach it.'] },
    { id: 'hip_flexor_stretch', name: 'Kneeling Hip Flexor Stretch', muscle: 'hip_flexors', duration: '90s each side',
      technique: 'Kneel on one knee. Other foot forward. Posterior pelvic tilt - tuck pelvis under, do not arch back. Lean forward slightly.',
      breathing: 'Long exhale drops you deeper into the stretch.',
      tips: ['Most important stretch for anyone who sits.', 'Tight hip flexors inhibit glutes and cause lower back pain.'] },
    { id: 'pigeon_pose', name: 'Pigeon Pose', muscle: 'glutes', duration: '90s each side',
      technique: 'Front leg bent at 90 degrees across body. Rear leg extended behind. Fold forward. Hips square to floor.',
      breathing: 'Exhale and melt into the floor. The more you relax, the deeper it goes.',
      tips: ['Best glute stretch available.', 'Use lying figure-4 if too intense.', 'Essential after squats and deadlifts.'] },
    { id: 'calf_stretch_gastro', name: 'Calf Stretch - Gastrocnemius', muscle: 'calves', duration: '45s each',
      technique: 'Stand facing wall. Straight leg, heel flat. Lean until you feel stretch in the thick part of the calf.',
      breathing: 'Normal.',
      tips: ['Gastrocnemius crosses the knee - must stretch with straight leg.', 'Do after every run.'] },
    { id: 'calf_stretch_soleus', name: 'Calf Stretch - Soleus', muscle: 'calves', duration: '45s each',
      technique: 'Same wall position but bend the knee slightly. Stretch drops lower toward Achilles tendon.',
      breathing: 'Normal.',
      tips: ['Stretches soleus and Achilles. Both calf stretches are needed.', 'Tight soleus = Achilles tendinitis.'] },
    { id: 'chest_opener', name: 'Doorway Chest Stretch', muscle: 'chest', duration: '60s',
      technique: 'Arms at 90 degrees on doorframe. Step through. Feel chest and front shoulder open.',
      breathing: 'Exhale and open chest further.',
      tips: ['Counter-stretch to bench pressing.', 'High hands = lower chest. Low hands = upper chest.'] },
    { id: 'lat_stretch', name: 'Overhead Lat Stretch', muscle: 'lats', duration: '45s each side',
      technique: 'Hold bar or doorframe overhead. Let bodyweight hang and shift laterally.',
      breathing: 'Exhale to deepen.',
      tips: ['Tight lats pull shoulder into internal rotation and cause impingement.', 'Critical after rows and pullups.'] },
    { id: 'spinal_twist', name: 'Supine Spinal Twist', muscle: 'spine', duration: '60s each side',
      technique: 'Lie on back. Bring one knee to chest. Guide across body. Arms out. Look away from knee.',
      breathing: 'Exhale to allow gravity to rotate deeper.',
      tips: ['Decompresses lumbar discs after heavy loading.', 'Do every morning - 2 minutes.'] },
    { id: 'quad_stretch', name: 'Standing Quad Stretch', muscle: 'quads', duration: '30s each',
      technique: 'Stand on one leg. Pull ankle to glute. Push hip forward. Torso upright.',
      breathing: 'Normal.',
      tips: ['Hold wall for balance.', 'Important post-squat, post-lunge, post-run.'] },
    { id: 'it_band_stretch', name: 'IT Band Stretch (Figure-4)', muscle: 'it_band', duration: '60s each',
      technique: 'Lie on back. Cross ankle over opposite knee. Pull both legs toward chest. Feel outer hip.',
      breathing: 'Exhale to deepen.',
      tips: ['IT band tightness is the most common cause of runner\'s knee.', 'Do after every run and leg session.'] },
    { id: 'neck_stretch', name: 'Lateral Neck Stretch', muscle: 'neck', duration: '30s each side',
      technique: 'Drop ear toward shoulder. Optionally place hand on head for gentle overpressure. Do not pull hard.',
      breathing: 'Exhale on the stretch.',
      tips: ['Releases trap tension from heavy bar positions and farmers carry.', 'Tilt only - do not rotate.'] },
    { id: 'wrist_stretch', name: 'Wrist and Forearm Stretch', muscle: 'forearms', duration: '30s each direction',
      technique: 'Extend arm. 1) Pull fingers back toward you. 2) Push fingers down and away. Both directions both wrists.',
      breathing: 'Normal.',
      tips: ['Essential after any pressing session.', 'Prevents wrist tendinitis.', 'Wrist injuries end training for weeks - take it seriously.'] }
  ],

  foamRolling: [
    { area: 'IT Band',             technique: 'Side lying. Roller from hip to just above knee. Pause on tight spots 30s and breathe.',                                                     warning: 'Painful - that is normal. Go slow and breathe through it.' },
    { area: 'Quads',               technique: 'Face down. Roller under front of thigh. Slowly from hip to above knee. Pause on tight areas.',                                              warning: '' },
    { area: 'Hamstrings',          technique: 'Seated. Roller under thigh. Cross ankle over for pressure. Roll from glute to above knee.',                                                warning: '' },
    { area: 'Calves',              technique: 'Seated. Roller under one calf. Cross other ankle over for extra pressure. Slowly from ankle to back of knee.',                             warning: 'Roll slowly - calves are very tight especially in runners.' },
    { area: 'Glutes and Piriformis', technique: 'Seated on roller. Cross one ankle over opposite knee. Lean to that side. Roll glute and piriformis. Pause on knots.',                   warning: '' },
    { area: 'Thoracic Spine',      technique: 'Sit, lean back on roller at mid-back. Arms crossed or behind head. Gently extend over roller. Move up vertebra by vertebra.',             warning: 'Only mid-back (thoracic). Avoid lower back (lumbar).' },
    { area: 'Lats',                technique: 'Side lying. Arm extended overhead. Roller at armpit. Slowly roll from armpit to bottom of rib cage.',                                     warning: '' },
    { area: 'Upper Traps',         technique: 'Lie on back. Roller at base of skull. Slowly nod head yes and no. Releases trap tension.',                                                warning: 'Very gentle. Do not roll the neck itself.' },
    { area: 'Chest (Pec Minor)',   technique: 'Face down. Lacrosse ball or tennis ball under the pec just inside the shoulder. Lean in and make small arm circles.',                     warning: 'Avoid pressing directly on the shoulder joint.' },
    { area: 'Plantar Fascia (foot)', technique: 'Stand on one leg. Tennis ball under foot. Roll from heel to ball of foot with moderate pressure.',                                       warning: 'Important for runners. Tight plantar fascia chains up through calf to knee.' }
  ]
};

if (typeof module !== 'undefined') module.exports = WARMUPS;
