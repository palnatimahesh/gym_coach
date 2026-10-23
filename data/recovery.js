var RECOVERY = {

  testosterone: {
    title: 'Testosterone Optimization Protocol',
    subtitle: 'Natural. Sustainable. Powerful.',
    intro: 'Testosterone is built in the gym and optimized in your lifestyle. These aren\'t hacks - they are the foundational biology of a high-performing male.',

    bigLevers: [
      {
        title: 'Sleep - The #1 Testosterone Booster',
        priority: 1,
        impact: 'HIGH',
        details: [
          '70% of daily testosterone is released during sleep.',
          'Every hour below 7 hours = measurable T reduction.',
          'Target: 7.5-9 hours. Non-negotiable.',
          'Sleep in cool room (65-68F / 18-20C).',
          'Blackout curtains. No screens 60 min before bed.',
          'Same sleep/wake time every day - circadian entrainment.'
        ],
        action: 'Set a hard sleep deadline tonight.'
      },
      {
        title: 'Heavy Compound Lifting',
        priority: 2,
        impact: 'HIGH',
        details: [
          'Squats and deadlifts produce the highest acute T spike of any exercise.',
          'Multi-joint movements recruiting large muscle mass = hormonal signal.',
          'Intensity matters: 70-90% 1RM for hormonal response.',
          'Keep rest between sets 90-120s for optimal GH/T release.',
          'Avoid chronic cardio overload - it suppresses T.'
        ],
        action: 'Squat and deadlift must be in your program every week.'
      },
      {
        title: 'Cold Exposure',
        priority: 3,
        impact: 'MEDIUM-HIGH',
        details: [
          'Cold showers: start with 30s cold at end of shower.',
          'Progress: Week 1-2: 30s. Week 3-4: 60s. Week 5+: 2-3 min.',
          'Cold water increases LH (luteinizing hormone) which drives T production.',
          'Also powerfully boosts dopamine (+250%) and norepinephrine.',
          'Improves resilience, willpower, and mood.'
        ],
        schedule: [
          { week: 1, protocol: '30 sec cold at end of warm shower' },
          { week: 2, protocol: '60 sec cold' },
          { week: 3, protocol: '90 sec cold - make it the first thing, not last' },
          { week: 4, protocol: '2 min cold shower from start' },
          { week: '5+', protocol: 'Full cold shower or ice bath 3-4x/week' }
        ],
        action: 'Start tonight. 30 seconds. Cold water. End of shower.'
      },
      {
        title: 'Sunlight - Morning Protocol',
        priority: 4,
        impact: 'HIGH',
        details: [
          'Get 10-30 min of morning sunlight within 1 hour of waking.',
          'Sets cortisol pulse (healthy morning cortisol = low evening cortisol = better sleep).',
          'Stimulates testosterone production via Vitamin D pathway.',
          'Regulates circadian rhythm - directly impacts sleep quality.'
        ],
        action: 'Walk outside within 30 min of waking. No sunglasses.'
      },
      {
        title: 'Nutrition Protocol',
        priority: 5,
        impact: 'MEDIUM-HIGH',
        details: [
          'Dietary fat is the precursor to testosterone. Don\'t fear fat.',
          'Eat: eggs, red meat, olive oil, avocado, nuts, fatty fish.',
          'Zinc: oysters, beef, pumpkin seeds. Critical for T production.',
          'Magnesium: dark leafy greens, almonds, dark chocolate. Improves sleep + T.',
          'Vitamin D: supplement 2000-5000 IU daily if low sun exposure.',
          'Avoid: excessive alcohol (aromatizes T to estrogen), ultra-processed foods, seed oils.',
          'Don\'t chronically undereat - T crashes with severe calorie restriction.'
        ],
        supplements: [
          { name: 'Zinc', dose: '25-40mg/day', timing: 'With food or before bed', note: 'Most men are deficient' },
          { name: 'Magnesium Glycinate', dose: '300-400mg', timing: 'Before bed', note: 'Improves sleep and T' },
          { name: 'Vitamin D3 + K2', dose: '3000-5000 IU D3 / 100mcg K2', timing: 'Morning with fat', note: 'K2 directs calcium properly' },
          { name: 'Ashwagandha (KSM-66)', dose: '300-600mg', timing: 'Before bed', note: 'Reduces cortisol, improves T by 15-22% in studies' }
        ]
      },
      {
        title: 'Stress & Cortisol Management',
        priority: 6,
        impact: 'HIGH',
        details: [
          'Cortisol and testosterone are inversely related - manage one, manage the other.',
          'Chronic stress = chronically elevated cortisol = suppressed T.',
          'Meditation: 10-20 min daily (proven to reduce cortisol 15-25%).',
          'Training is good stress (acute). Overtraining is bad stress (chronic).',
          'Take deload weeks every 4-6 weeks seriously.'
        ]
      }
    ]
  },

  dopamineReset: {
    title: 'Dopamine Reset Protocol',
    subtitle: 'Rewire Your Reward System',
    intro: 'Modern life has hijacked your dopamine system. Infinite scroll, junk food, porn, gambling, instant entertainment - all produce supernormal stimuli that blunt your receptors and kill motivation for real achievements. A dopamine reset restores baseline sensitivity.',

    howItWorks: 'Dopamine isn\'t about pleasure - it\'s about motivation and drive. When your receptors are constantly flooded with cheap, easy dopamine hits, your brain downregulates sensitivity. Real achievement (gym, learning, relationships) no longer feels rewarding. You\'re dopamine-broke.',

    levels: [
      {
        level: 1,
        name: 'Soft Reset',
        duration: '7 days',
        description: 'Remove the biggest offenders while keeping structure.',
        rules: [
          'No social media scrolling (posting for work is fine)',
          'No video games',
          'No junk food / sugar (switch to whole foods only)',
          'Gym every day as scheduled',
          'Limited entertainment - only intentional watching (no autoplay)',
          'Read instead of scroll'
        ],
        what_you_can_do: ['Exercise', 'Read physical books', 'Cook', 'Walk in nature', 'Socialize in person', 'Work on meaningful goals'],
        coachNote: 'Days 1-3 will feel boring and uncomfortable. That\'s receptor rebound. Push through. By day 5 you will feel clarity you haven\'t felt in months.'
      },
      {
        level: 2,
        name: 'Hard Reset',
        duration: '30 days',
        description: 'Serious protocol for serious resets.',
        rules: [
          'No social media (none)',
          'No pornography',
          'No video games',
          'No alcohol',
          'No refined sugar',
          'No music during workouts (embrace silence/discomfort)',
          'Phone grayscale mode',
          'News: maximum 10 min/day',
          'Cold showers daily'
        ],
        allowed: ['Gym training', 'Walking in nature', 'Books', 'Journaling', 'Cooking whole foods', 'Meaningful conversations', 'Creative work'],
        coachNote: 'This is not punishment. This is the most powerful cognitive upgrade you can do without drugs or surgery. Your motivation, focus, and joy will be restored.'
      }
    ],

    dailyProtocol: [
      { time: '6:00 AM', action: 'Wake. No phone for 60 min.', why: 'Protect morning cortisol rhythm. No dopamine spike before you\'ve earned it.' },
      { time: '6:10 AM', action: 'Cold shower', why: 'Dopamine +250%. Norepinephrine +300%. Best mood tool available.' },
      { time: '6:30 AM', action: 'Sunlight + walk 10 min', why: 'Serotonin + vitamin D + circadian reset.' },
      { time: '7:00 AM', action: 'Workout or high-priority work', why: 'Use the morning dopamine window before it gets wasted on noise.' },
      { time: 'Throughout', action: 'Delay gratification deliberately', why: 'Order hard task before easy reward. Every time you do this, you win.' },
      { time: 'Evening', action: 'Journal: 3 things completed, 1 thing grateful for', why: 'Converts action to memory. Reinforces effort-based reward loop.' },
      { time: '9:00 PM', action: 'No screens. Read. Wind down.', why: 'Blue light suppresses melatonin. Protect sleep = protect T = protect dopamine.' }
    ],

    earlySignsOfRecovery: [
      'Food starts tasting better (taste receptor sensitivity restored)',
      'Boredom becomes tolerable - you can sit quietly',
      'Motivation to train increases naturally',
      'Morning mood improves significantly',
      'Procrastination decreases',
      'Enjoyment of simple things returns (nature, music, conversation)'
    ]
  },

  deloadProtocol: {
    title: 'Deload Week Protocol',
    frequency: 'Every 4-6 weeks of hard training',
    description: 'A deload is not a break. It\'s active recovery. You train, but you reduce volume and intensity. This allows connective tissue, nervous system, and hormonal systems to fully recover.',
    rules: [
      'Keep all exercises the same - only reduce volume',
      '50% of normal sets. Same reps.',
      'Reduce weight to 60-70% of normal',
      'Focus on movement quality - every rep is perfect',
      'Add extra mobility work',
      'Sleep an extra hour if possible',
      'You will feel \'lazy\' - that\'s normal and good'
    ],
    signals_you_need_one: [
      'Motivation to train is low (not laziness - physical fatigue)',
      'Performance decreasing despite sleep',
      'Joints aching more than usual',
      'Mood is flat or irritable',
      'Sleep quality declining despite clean habits'
    ]
  },

  sleepOptimization: {
    title: 'Sleep Optimization',
    targets: { minimum: 7, optimal: 8.5, deep_sleep: '20-25% of total' },
    protocols: [
      'Same bedtime and wake time - 7 days/week',
      'Room temperature: 65-68F (18-20C)',
      'Complete darkness - blackout curtains or eye mask',
      'No alcohol within 3 hours of bed (destroys sleep quality)',
      'No large meals within 2 hours',
      'Magnesium glycinate 400mg 30 min before bed',
      'No screens 60 min before bed (or use blue-light glasses)',
      'If you can\'t sleep: 4-7-8 breathing or body scan meditation'
    ]
  }
};

if (typeof module !== 'undefined') module.exports = RECOVERY;
