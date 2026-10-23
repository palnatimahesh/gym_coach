var RUNNING_PLAN = {

  philosophy: 'Running is a skill. Knee damage from running comes from doing too much too soon. We build your tendons, cartilage, and running mechanics gradually. You will be running 5K in 10 weeks - pain-free.',

  kneeProtocol: {
    title: 'Knee-Safe Running Protocol',
    rules: [
      'Never increase weekly mileage by more than 10% per week.',
      'Walk before you jog. Jog before you run.',
      'Land midfoot - never heel strike. This is the #1 cause of knee damage in runners.',
      'Run slow. Conversational pace. If you can\'t talk, you\'re too fast.',
      'Strengthen before you run: glutes, hamstrings, and calves protect your knees.',
      'No running on consecutive days for the first 6 weeks.',
      'At first sign of knee pain - stop, ice, and assess.'
    ],
    kneeStrengthening: [
      { id: 'glute_bridge', note: 'Weak glutes = knee collapse. Do every run day.' },
      { id: 'calf_raise', note: 'Calves absorb 3x bodyweight per stride. Build them.' },
      { id: 'reverse_lunge', note: 'Quad control = knee stability.' },
      { id: 'rdl', note: 'Hamstring strength prevents ACL stress.' }
    ],
    preRunWarmup: [
      { name: 'Ankle circles', duration: '30 sec each direction' },
      { name: 'Leg swings (front/back)', duration: '20 each leg' },
      { name: 'Hip circles', duration: '15 each direction' },
      { name: 'High knees (slow)', duration: '20 steps' },
      { name: 'Butt kicks', duration: '20 steps' },
      { name: 'Light jog in place', duration: '30 sec' }
    ],
    postRunCooldown: [
      { name: 'Walk 5 minutes (mandatory)', duration: '5 min' },
      { name: 'Standing quad stretch', duration: '30s each' },
      { name: 'Calf stretch (straight leg)', duration: '30s each' },
      { name: 'Calf stretch (bent knee - soleus)', duration: '30s each' },
      { name: 'Hip flexor stretch', duration: '60s each' },
      { name: 'IT band stretch (cross-leg)', duration: '30s each' },
      { name: 'Ice knees if any sensitivity', duration: '10 min' }
    ]
  },

  landingMechanics: {
    title: 'Running Form - Protect Your Knees',
    cues: [
      { label: 'Foot Strike', text: 'Land on the ball of foot / midfoot. Heel striking sends 3x shock to knees. Imagine landing quietly on a marble floor.' },
      { label: 'Cadence', text: 'Aim for 170-180 steps/minute. Shorter, quicker strides reduce impact force. Count steps for 15 sec  4.' },
      { label: 'Lean', text: 'Slight forward lean from ankles - not waist. Gravity does the work.' },
      { label: 'Arms', text: 'Swing forward-back, not across body. Elbows at 90. Hands relaxed (hold a chip, don\'t crush it).' },
      { label: 'Hips', text: 'Drive hips forward - not hiking. Keep pelvis neutral.' },
      { label: 'Eyes', text: 'Look 20-30 feet ahead. Not at feet. Keeps spine aligned.' },
      { label: 'Breathing', text: '3:2 pattern (3 steps inhale, 2 steps exhale) or 2:2 at hard effort. Diaphragmatic - belly rises first.' }
    ]
  },

  weeks: [
    {
      week: 1,
      title: 'First Steps',
      phase: 'walk_jog',
      sessions: 3,
      description: 'Walk/jog intervals. Your tendons are not ready for continuous jogging yet.',
      coachNote: 'This will feel embarrassingly easy. Good. That\'s the point.',
      protocol: '5 min walk warm-up  8 rounds of (60s jog / 90s walk)  5 min cool-down walk',
      totalTime: 30,
      runningMinutes: 8,
      effort: '4/10 - comfortable, conversational',
      knee_exercises_before: ['glute_bridge', 'calf_raise'],
      warnings: ['Stop if any sharp knee pain', 'Soreness in calves/shins is normal']
    },
    {
      week: 2,
      title: 'Building Intervals',
      phase: 'walk_jog',
      sessions: 3,
      description: 'Longer jog intervals, shorter walks.',
      coachNote: 'Your calves will be sore. Roll them. This is normal adaptation.',
      protocol: '5 min walk  8 rounds of (90s jog / 60s walk)  5 min cool-down',
      totalTime: 30,
      runningMinutes: 12,
      effort: '4-5/10',
      knee_exercises_before: ['glute_bridge', 'reverse_lunge', 'calf_raise']
    },
    {
      week: 3,
      title: 'Jog More Walk Less',
      phase: 'walk_jog',
      sessions: 3,
      description: 'Shifting the balance toward jogging.',
      coachNote: 'You\'re building aerobic base. Slow is the only way. Patience.',
      protocol: '5 min walk  6 rounds of (2 min jog / 60s walk)  5 min cool-down',
      totalTime: 30,
      runningMinutes: 12,
      effort: '5/10'
    },
    {
      week: 4,
      title: 'First Continuous Run',
      phase: 'continuous',
      sessions: 3,
      description: 'First attempt at continuous running - but SLOW.',
      coachNote: 'If you need to walk, walk. No shame. Your lungs adapt faster than your tendons.',
      protocol: '5 min walk  20 min continuous jog (slow!)  5 min cool-down',
      totalTime: 30,
      runningMinutes: 20,
      effort: '5/10 - absolutely no faster'
    },
    {
      week: 5,
      title: 'Build the Base',
      phase: 'continuous',
      sessions: 3,
      description: 'Extending continuous running time.',
      protocol: '5 min walk  25 min jog  5 min cool-down',
      totalTime: 35,
      runningMinutes: 25,
      effort: '5-6/10',
      coachNote: 'Add 5 minutes this week. That\'s it. Trust the process.'
    },
    {
      week: 6,
      title: 'Tempo Introduction',
      phase: 'tempo',
      sessions: 3,
      description: 'Add one faster run per week.',
      coachNote: 'Tempo = uncomfortably comfortable. Not a sprint. You\'re teaching your body to run efficiently.',
      protocol: {
        session1: '30 min easy jog',
        session2: '10 min easy + 15 min tempo (7/10 effort) + 5 min easy',
        session3: '30 min easy jog'
      },
      totalTime: 40,
      runningMinutes: 30,
      effort: 'Easy 5/10 + Tempo 7/10'
    },
    {
      week: 7,
      title: 'Zone Stacking',
      phase: 'mixed',
      sessions: 3,
      protocol: {
        session1: '35 min easy run',
        session2: '5 min easy + 4x(3 min hard / 2 min easy) + 5 min easy',
        session3: '35 min easy run'
      },
      totalTime: 40,
      runningMinutes: 35,
      effort: 'Intervals: 8/10 effort'
    },
    {
      week: 8,
      title: '5K Test Week',
      phase: '5k',
      sessions: 3,
      protocol: {
        session1: '25 min easy',
        session2: 'Rest or 20 min easy',
        session3: '5K TIME TRIAL - run your first 5K'
      },
      coachNote: 'Don\'t chase time. Just finish. You\'ve built this systematically. Your knees are strong. Your lungs are ready. Just run.',
      milestone: true
    },
    {
      week: 9,
      title: '5K Recovery + Speed',
      phase: 'speed',
      sessions: 3,
      protocol: {
        session1: '30 min easy (recovery from 5K)',
        session2: '6 x 400m at 8/10 effort, 90s rest between',
        session3: '5K easy'
      }
    },
    {
      week: 10,
      title: 'Athletic Running',
      phase: 'athletic',
      sessions: 3,
      protocol: {
        session1: '5K at controlled pace',
        session2: 'HIIT: 10 x 30s sprint / 90s walk',
        session3: 'Long easy run: 40-45 min'
      },
      coachNote: 'You are now a runner. Maintain 3 runs/week as part of your athletic lifestyle.'
    }
  ],

  kneeWarnings: [
    { signal: 'Sharp pain during run', action: 'STOP immediately. Rest 3 days. If persists, see physio.' },
    { signal: 'Pain under kneecap (patella)', action: 'Stop running. Strengthen VMO (terminal knee extensions). Rest 1 week.' },
    { signal: 'IT band pain (outside knee)', action: 'Reduce mileage 50%. Add hip abductor work. Foam roll IT band.' },
    { signal: 'Shin splints (shin soreness)', action: 'Reduce mileage. Ice after. Calf strengthening. Normal in first 4 weeks.' },
    { signal: 'Mild general knee ache after run', action: 'Ice 10 min. Elevate. Rest next day. Monitor.' }
  ]
};

if (typeof module !== 'undefined') module.exports = RUNNING_PLAN;
