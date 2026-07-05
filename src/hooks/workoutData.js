// ─────────────────────────────────────────────────────────────
// workoutData.js — Complete workout data
// ─────────────────────────────────────────────────────────────

// ── Exercise definitions with how-to instructions ────────────
export const EXERCISES = {
  // CHEST
  'Bench Press': {
    icon: '🏋️', muscles: 'Chest, Triceps, Shoulders', category: 'Chest', timed: false,
    howTo: [
      'Lie flat on the bench with feet on the floor',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack the bar and lower it slowly to mid-chest',
      'Press back up explosively until arms are almost locked',
      'Keep your back slightly arched, shoulders retracted',
    ],
    tips: 'Don\'t bounce the bar off your chest. Control the descent.',
  },
  'Incline Bench Press': {
    icon: '🏋️', muscles: 'Upper Chest, Shoulders', category: 'Chest', timed: false,
    howTo: [
      'Set bench to 30–45° incline',
      'Grip bar slightly wider than shoulders',
      'Lower bar to upper chest with control',
      'Press up and slightly back to starting position',
    ],
    tips: 'Incline angle emphasises upper chest. Don\'t go too steep — over 45° shifts load to shoulders.',
  },
  'Push Ups': {
    icon: '💪', muscles: 'Chest, Triceps, Core', category: 'Chest', timed: false,
    howTo: [
      'Start in plank position, hands slightly wider than shoulders',
      'Keep body in straight line from head to heels',
      'Lower chest to just above floor by bending elbows',
      'Push back up to start, fully extending arms',
    ],
    tips: 'Don\'t let hips sag or rise. Keep core tight throughout.',
  },
  'Chest Fly': {
    icon: '🦋', muscles: 'Chest', category: 'Chest', timed: false,
    howTo: [
      'Lie on bench holding dumbbells above chest, palms facing each other',
      'Lower arms out to sides in wide arc, slight bend in elbows',
      'Feel stretch in chest at bottom',
      'Squeeze chest to bring dumbbells back together',
    ],
    tips: 'This is an isolation move — use lighter weight and focus on the stretch.',
  },
  'Dips': {
    icon: '💪', muscles: 'Chest, Triceps', category: 'Chest', timed: false,
    howTo: [
      'Grip parallel bars and support your weight with arms extended',
      'Lean slightly forward for chest emphasis',
      'Lower until upper arms are parallel to floor',
      'Push back up without locking elbows completely',
    ],
    tips: 'Lean forward = more chest. Upright = more triceps.',
  },
  'Cable Crossover': {
    icon: '🦋', muscles: 'Chest', category: 'Chest', timed: false,
    howTo: [
      'Set cables to high position, stand in centre',
      'Grab both handles, step forward with one foot',
      'With slight elbow bend, bring hands together in front of chest',
      'Slowly return to starting position',
    ],
    tips: 'Great finisher. Focus on squeezing the chest at peak contraction.',
  },
  // BACK
  'Pull Ups': {
    icon: '💪', muscles: 'Lats, Biceps, Upper Back', category: 'Back', timed: false,
    howTo: [
      'Hang from bar with overhand grip, hands shoulder-width apart',
      'Pull shoulder blades down and back to initiate',
      'Pull until chin is above bar',
      'Lower with control, fully extending arms',
    ],
    tips: 'Don\'t use momentum. Full range of motion matters most.',
  },
  'Deadlift': {
    icon: '🏋️', muscles: 'Full Back, Hamstrings, Glutes', category: 'Back', timed: false,
    howTo: [
      'Stand with feet hip-width, bar over mid-foot',
      'Hinge at hips, grip bar just outside legs',
      'Chest up, back flat, take deep breath and brace core',
      'Drive through floor, extending hips and knees simultaneously',
      'Lock out at top — hips forward, shoulders back',
    ],
    tips: 'Never round your lower back. Start light and perfect form first.',
  },
  'Bent Over Row': {
    icon: '🏋️', muscles: 'Back, Biceps, Rear Delts', category: 'Back', timed: false,
    howTo: [
      'Hinge forward at hips, back parallel to floor or 45°',
      'Hold bar with overhand grip, arms straight',
      'Pull bar to lower chest/upper abdomen',
      'Squeeze shoulder blades at top',
      'Lower with control',
    ],
    tips: 'Keep back flat. Elbows should flare back, not out to sides.',
  },
  'Lat Pulldown': {
    icon: '💪', muscles: 'Lats, Biceps', category: 'Back', timed: false,
    howTo: [
      'Sit at cable machine, knees under pad, grip bar wider than shoulders',
      'Lean back slightly, pull bar to upper chest',
      'Lead with elbows, pull shoulder blades down',
      'Slow return to full arm extension',
    ],
    tips: 'Imagine pulling your elbows into your back pockets.',
  },
  'Seated Cable Row': {
    icon: '🚣', muscles: 'Mid Back, Lats, Biceps', category: 'Back', timed: false,
    howTo: [
      'Sit upright, feet on platform, grip the handle',
      'Pull handle to lower abdomen, driving elbows back',
      'Squeeze shoulder blades together at peak',
      'Extend arms fully, slight forward lean',
    ],
    tips: 'Don\'t use momentum. Keep torso upright throughout.',
  },
  'Face Pull': {
    icon: '💪', muscles: 'Rear Delts, Upper Back', category: 'Back', timed: false,
    howTo: [
      'Set cable to face height, use rope attachment',
      'Pull rope to face level, elbows high and wide',
      'External rotate at end — hands beside ears',
      'Control return',
    ],
    tips: 'Great for shoulder health. Use light to moderate weight.',
  },
  // LEGS
  'Squat': {
    icon: '🏋️', muscles: 'Quads, Glutes, Hamstrings, Core', category: 'Legs', timed: false,
    howTo: [
      'Bar on upper traps, feet shoulder-width, toes slightly out',
      'Brace core, take deep breath',
      'Push knees out, sit back and down',
      'Descend until thighs at least parallel to floor',
      'Drive through floor to stand up',
    ],
    tips: 'Knees should track over toes. Keep chest up throughout.',
  },
  'Romanian Deadlift': {
    icon: '🏋️', muscles: 'Hamstrings, Glutes, Lower Back', category: 'Legs', timed: false,
    howTo: [
      'Stand with bar at hip height, overhand grip',
      'Push hips back, lower bar along legs',
      'Feel stretch in hamstrings, keep back flat',
      'Drive hips forward to return to standing',
    ],
    tips: 'This is a hip hinge, not a squat. Keep bar close to legs throughout.',
  },
  'Leg Press': {
    icon: '🦵', muscles: 'Quads, Glutes, Hamstrings', category: 'Legs', timed: false,
    howTo: [
      'Sit in machine, feet on platform shoulder-width',
      'Lower platform until knees are at 90°',
      'Press back up without locking knees',
      'Control the weight throughout',
    ],
    tips: 'Foot position changes emphasis: higher = glutes, lower = quads.',
  },
  'Lunges': {
    icon: '🦵', muscles: 'Quads, Glutes, Balance', category: 'Legs', timed: false,
    howTo: [
      'Stand tall, step forward with one foot',
      'Lower back knee towards floor',
      'Front knee stays over ankle, not beyond toes',
      'Push through front foot to return',
      'Alternate legs',
    ],
    tips: 'Keep torso upright. Long stride works glutes more, short stride works quads more.',
  },
  'Hip Thrust': {
    icon: '🦵', muscles: 'Glutes, Hamstrings', category: 'Legs', timed: false,
    howTo: [
      'Sit with upper back against bench, bar across hips',
      'Feet flat on floor, hip-width apart',
      'Drive hips up until body is parallel to floor',
      'Squeeze glutes hard at top',
      'Lower with control',
    ],
    tips: 'Best glute builder. Focus on squeezing at the top.',
  },
  'Calf Raises': {
    icon: '🦵', muscles: 'Calves', category: 'Legs', timed: false,
    howTo: [
      'Stand on edge of step or flat floor',
      'Rise up onto balls of feet as high as possible',
      'Hold the peak contraction for 1 second',
      'Lower heels below step level for full stretch',
    ],
    tips: 'Calves respond well to high reps (15–25). Go through full range of motion.',
  },
  // SHOULDERS
  'Overhead Press': {
    icon: '🏋️', muscles: 'Shoulders, Triceps', category: 'Shoulders', timed: false,
    howTo: [
      'Stand or sit, bar at shoulder height',
      'Grip just outside shoulder width',
      'Press bar straight up, moving head back slightly',
      'Lock out at top, bring head through',
      'Lower with control to shoulders',
    ],
    tips: 'Brace your core and glutes to protect your lower back.',
  },
  'Lateral Raise': {
    icon: '💪', muscles: 'Side Delts', category: 'Shoulders', timed: false,
    howTo: [
      'Stand holding dumbbells at sides',
      'Raise arms out to sides until parallel to floor',
      'Slight bend in elbows, pinky slightly higher than thumb',
      'Control the descent — don\'t drop weights',
    ],
    tips: 'Go lighter than you think. Partial reps with lighter weight beats heavy with no control.',
  },
  'Arnold Press': {
    icon: '🏋️', muscles: 'All Deltoid Heads', category: 'Shoulders', timed: false,
    howTo: [
      'Hold dumbbells at shoulder height, palms facing you',
      'As you press up, rotate palms to face outward',
      'Fully extend arms overhead',
      'Reverse the rotation as you lower',
    ],
    tips: 'Named after Arnold Schwarzenegger. The rotation hits all three delt heads.',
  },
  // ARMS
  'Bicep Curl': {
    icon: '💪', muscles: 'Biceps', category: 'Arms', timed: false,
    howTo: [
      'Stand holding dumbbells, arms fully extended',
      'Keeping elbows at sides, curl weights to shoulders',
      'Squeeze biceps at top',
      'Lower with control to full extension',
    ],
    tips: 'Don\'t swing your body. Elbows should stay fixed.',
  },
  'Hammer Curl': {
    icon: '💪', muscles: 'Biceps, Brachialis, Forearms', category: 'Arms', timed: false,
    howTo: [
      'Hold dumbbells with neutral grip (thumbs up)',
      'Curl to shoulder height without rotating wrists',
      'Squeeze at top, lower with control',
    ],
    tips: 'Hits brachialis (under the bicep) — adds arm thickness.',
  },
  'Tricep Pushdown': {
    icon: '💪', muscles: 'Triceps', category: 'Arms', timed: false,
    howTo: [
      'Stand at cable machine, grip bar/rope with overhand grip',
      'Elbows at sides and fixed throughout',
      'Push bar down until arms fully extended',
      'Squeeze triceps at bottom',
      'Slowly return to starting position',
    ],
    tips: 'Don\'t let elbows flare. Full extension is key.',
  },
  'Skull Crushers': {
    icon: '🏋️', muscles: 'Triceps', category: 'Arms', timed: false,
    howTo: [
      'Lie on bench, hold EZ bar above chest with narrow grip',
      'Lower bar toward forehead by bending only at elbows',
      'Extend arms back to start position',
    ],
    tips: 'Keep upper arms perpendicular to floor. Only forearms move.',
  },
  // CORE
  'Plank': {
    icon: '🧘', muscles: 'Core, Shoulders, Glutes', category: 'Core', timed: true,
    howTo: [
      'Start in push-up position on forearms',
      'Body in straight line from head to heels',
      'Squeeze core and glutes throughout',
      'Hold the position, don\'t let hips sag',
    ],
    tips: 'Quality beats duration. A 30s plank with perfect form beats 2 min with bad form.',
  },
  'Crunches': {
    icon: '💪', muscles: 'Abs', category: 'Core', timed: false,
    howTo: [
      'Lie on back, knees bent, hands behind head or crossed',
      'Curl shoulders off floor using abs — not neck',
      'Pause at top, lower with control',
    ],
    tips: 'Short range of motion is intentional. Focus on the contraction, not height.',
  },
  'Leg Raises': {
    icon: '🦵', muscles: 'Lower Abs, Hip Flexors', category: 'Core', timed: false,
    howTo: [
      'Lie flat, hands under lower back for support',
      'Keep legs straight, raise to 90°',
      'Lower slowly without touching floor',
    ],
    tips: 'The slower the descent, the harder the contraction.',
  },
  'Russian Twist': {
    icon: '🔄', muscles: 'Obliques, Core', category: 'Core', timed: false,
    howTo: [
      'Sit with knees bent, feet off floor, lean back slightly',
      'Hold weight or clasp hands together',
      'Rotate torso side to side, touching floor each side',
    ],
    tips: 'The further you lean back, the harder it gets. Keep the movement controlled.',
  },
  'Mountain Climbers': {
    icon: '🏔️', muscles: 'Core, Shoulders, Cardio', category: 'Core', timed: true,
    howTo: [
      'Start in push-up position',
      'Drive one knee toward chest',
      'Quickly switch legs in alternating pattern',
      'Keep hips level, move as fast as good form allows',
    ],
    tips: 'Can be done slow for core focus or fast for cardio.',
  },
  // CARDIO
  'Running': {
    icon: '🏃', muscles: 'Full Body, Cardiovascular', category: 'Cardio', timed: true,
    howTo: [
      'Warm up with 5 min easy walk/jog',
      'Land midfoot, not on heel',
      'Arms at 90°, swinging front to back',
      'Breathe rhythmically — in for 3, out for 2',
      'Cool down with 5 min walk',
    ],
    tips: 'Conversational pace should let you talk in short sentences.',
  },
  'Cycling': {
    icon: '🚴', muscles: 'Quads, Hamstrings, Glutes', category: 'Cardio', timed: true,
    howTo: [
      'Adjust seat so leg has slight bend at bottom of pedal stroke',
      'Maintain 80–100 RPM cadence for fitness',
      'Keep core engaged, don\'t slouch',
      'Push and pull through the full pedal circle',
    ],
    tips: 'Higher cadence with lower resistance is easier on joints than grinding high resistance.',
  },
  'Jump Rope': {
    icon: '🪢', muscles: 'Full Body, Calves, Coordination', category: 'Cardio', timed: true,
    howTo: [
      'Hold handles at hip height, rope behind you',
      'Swing rope overhead, jump as it reaches feet',
      'Stay on balls of feet, knees slightly bent',
      'Small efficient jumps — just enough to clear rope',
    ],
    tips: 'Start with 30s on, 30s rest intervals. Burns ~10 kcal/min.',
  },
  'Swimming': {
    icon: '🏊', muscles: 'Full Body, Low Impact', category: 'Cardio', timed: true,
    howTo: [
      'Warm up with easy laps using any stroke',
      'Focus on technique — long smooth strokes',
      'Breathe every 2–3 strokes for freestyle',
      'Cool down with easy backstroke',
    ],
    tips: 'Excellent for recovery days — zero joint impact.',
  },
  'HIIT': {
    icon: '⚡', muscles: 'Full Body, High Intensity', category: 'Cardio', timed: true,
    howTo: [
      'Warm up for 5 minutes',
      'Work at 90%+ effort for 20–40 seconds',
      'Rest for 10–20 seconds',
      'Repeat 8–20 rounds',
      'Cool down for 5 minutes',
    ],
    tips: 'True HIIT is maximum effort during work intervals. If you can chat, go harder.',
  },
  'Walking': {
    icon: '🚶', muscles: 'Legs, Cardiovascular', category: 'Cardio', timed: true,
    howTo: [
      'Walk tall — head up, shoulders back',
      'Swing arms naturally at 90°',
      'Push off with toes at back of stride',
      'Aim for 3–4 mph / 5–6 km/h brisk pace',
    ],
    tips: '10,000 steps burns ~400–500 kcal depending on weight.',
  },
  // YOGA / FLEXIBILITY
  'Sun Salutation': {
    icon: '🌅', muscles: 'Full Body, Flexibility', category: 'Yoga', timed: true,
    howTo: [
      'Start standing, hands at heart centre',
      'Inhale — reach arms overhead',
      'Exhale — forward fold',
      'Step back to plank, lower to floor',
      'Inhale — upward dog, exhale — downward dog',
      'Step forward, rise to standing',
    ],
    tips: 'Move with breath. Each movement syncs with an inhale or exhale.',
  },
  'Warrior Pose': {
    icon: '⚔️', muscles: 'Legs, Hips, Balance', category: 'Yoga', timed: true,
    howTo: [
      'Step one foot forward into lunge position',
      'Front knee at 90°, back leg straight',
      'Arms raised overhead, gaze forward',
      'Hold 30–60 seconds each side',
    ],
    tips: 'Focus on breathing and stability rather than perfection.',
  },
  'Child\'s Pose': {
    icon: '🧘', muscles: 'Back, Hips, Rest', category: 'Yoga', timed: true,
    howTo: [
      'Kneel on floor, big toes touching',
      'Sit back onto heels, fold torso forward',
      'Arms extended or by sides',
      'Breathe deeply into back body',
    ],
    tips: 'Use this as a rest pose anytime during yoga or workout.',
  },
  // BOXING
  'Jab-Cross': {
    icon: '🥊', muscles: 'Shoulders, Core, Conditioning', category: 'Boxing', timed: true,
    howTo: [
      'Stand in boxing stance — feet shoulder-width, lead foot forward',
      'Jab: quick punch with lead hand, rotate shoulder',
      'Cross: powerful punch with rear hand, rotate hip and shoulder',
      'Return hands to guard position after each punch',
    ],
    tips: 'Speed comes from rotation, not just arm strength.',
  },
  'Shadow Boxing': {
    icon: '🥊', muscles: 'Full Body, Cardio', category: 'Boxing', timed: true,
    howTo: [
      'Move around constantly on balls of feet',
      'Throw punches — jabs, crosses, hooks, uppercuts',
      'Add footwork: step, pivot, circle',
      'Mix in defensive moves: slips, rolls',
    ],
    tips: '3-minute rounds with 1-minute rest mimics real boxing.',
  },
}

// Get exercise by name with fallback
export function getExercise(name) {
  return EXERCISES[name] || { name, icon:'💪', muscles:'', category:'General', howTo:[], tips:'', timed:false }
}

// ── Sports categories ────────────────────────
export const SPORTS = [
  { id:'gym',     name:'Gym',         icon:'🏋️', color:'#6C5CE7' },
  { id:'cardio',  name:'Cardio',      icon:'🏃', color:'#2ECC71' },
  { id:'yoga',    name:'Yoga',        icon:'🧘', color:'#A29BFE' },
  { id:'boxing',  name:'Boxing',      icon:'🥊', color:'#E05252' },
  { id:'cycling', name:'Cycling',     icon:'🚴', color:'#00BCD4' },
  { id:'swimming',name:'Swimming',    icon:'🏊', color:'#0984E3' },
  { id:'custom',  name:'Custom',      icon:'⚡', color:'#F5A623' },
]

// ── Library workouts ─────────────────────────
export const LIBRARY_WORKOUTS = [
  // GYM
  {
    id:'push_day', sport:'gym', name:'Push Day', icon:'💪', level:'Intermediate',
    duration:'45–60 min', muscles:'Chest · Shoulders · Triceps',
    description:'Classic push day targeting chest, shoulders and triceps with compound and isolation movements.',
    exercises:['Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Tricep Pushdown','Chest Fly','Dips'],
  },
  {
    id:'pull_day', sport:'gym', name:'Pull Day', icon:'🔙', level:'Intermediate',
    duration:'45–60 min', muscles:'Back · Biceps · Rear Delts',
    description:'Full back and bicep development with pulling movements from multiple angles.',
    exercises:['Pull Ups','Bent Over Row','Lat Pulldown','Seated Cable Row','Bicep Curl','Hammer Curl','Face Pull'],
  },
  {
    id:'leg_day', sport:'gym', name:'Leg Day', icon:'🦵', level:'Intermediate',
    duration:'50–65 min', muscles:'Quads · Hamstrings · Glutes · Calves',
    description:'Complete lower body session targeting all leg muscles with compound and isolation exercises.',
    exercises:['Squat','Romanian Deadlift','Leg Press','Lunges','Hip Thrust','Calf Raises'],
  },
  {
    id:'full_body', sport:'gym', name:'Full Body', icon:'🏋️', level:'Beginner',
    duration:'50–70 min', muscles:'All muscle groups',
    description:'Efficient full body workout hitting every major muscle group. Great for 2–3x per week training.',
    exercises:['Squat','Bench Press','Bent Over Row','Overhead Press','Romanian Deadlift','Plank'],
  },
  {
    id:'upper_body', sport:'gym', name:'Upper Body', icon:'💪', level:'Beginner',
    duration:'40–55 min', muscles:'Chest · Back · Shoulders · Arms',
    description:'Complete upper body workout covering chest, back, shoulders and arms.',
    exercises:['Bench Press','Bent Over Row','Overhead Press','Lateral Raise','Bicep Curl','Tricep Pushdown'],
  },
  {
    id:'chest_focus', sport:'gym', name:'Chest Focus', icon:'🦋', level:'Intermediate',
    duration:'40–50 min', muscles:'Chest, Triceps',
    description:'Dedicated chest session with multiple angles and techniques for maximum pec development.',
    exercises:['Bench Press','Incline Bench Press','Chest Fly','Cable Crossover','Push Ups','Dips'],
  },
  {
    id:'back_focus', sport:'gym', name:'Back & Lats', icon:'🏋️', level:'Intermediate',
    duration:'45–55 min', muscles:'Back, Lats, Biceps',
    description:'Width and thickness — targeting all back muscles for a V-taper physique.',
    exercises:['Pull Ups','Deadlift','Bent Over Row','Lat Pulldown','Seated Cable Row','Face Pull'],
  },
  {
    id:'core_blast', sport:'gym', name:'Core Blast', icon:'🧘', level:'Beginner',
    duration:'20–30 min', muscles:'Core · Abs · Obliques',
    description:'High-intensity core session for a stronger midsection and better posture.',
    exercises:['Plank','Crunches','Leg Raises','Russian Twist','Mountain Climbers'],
  },
  {
    id:'arnold_split', sport:'gym', name:'Arnold Press Special', icon:'💪', level:'Advanced',
    duration:'50–65 min', muscles:'Shoulders, All Heads',
    description:'Shoulder-focused session inspired by classic bodybuilding. Hits all three deltoid heads.',
    exercises:['Arnold Press','Overhead Press','Lateral Raise','Front Raise','Face Pull','Skull Crushers'],
  },
  // CARDIO
  {
    id:'hiit_20', sport:'cardio', name:'20-Min HIIT', icon:'⚡', level:'Intermediate',
    duration:'20 min', muscles:'Full Body',
    description:'High-intensity intervals alternating work and rest. Burns serious calories in minimal time.',
    exercises:['HIIT','Mountain Climbers','Jump Rope'],
  },
  {
    id:'easy_run', sport:'cardio', name:'Easy Run', icon:'🏃', level:'Beginner',
    duration:'30 min', muscles:'Legs, Cardiovascular',
    description:'Comfortable paced run to build aerobic base. You should be able to hold a conversation.',
    exercises:['Running'],
  },
  {
    id:'interval_run', sport:'cardio', name:'Interval Run', icon:'🏃', level:'Intermediate',
    duration:'35 min', muscles:'Legs, Full Body',
    description:'Alternate between sprint and recovery intervals to boost speed and endurance.',
    exercises:['Running','Walking'],
  },
  // YOGA
  {
    id:'morning_yoga', sport:'yoga', name:'Morning Flow', icon:'🌅', level:'Beginner',
    duration:'20 min', muscles:'Full Body, Flexibility',
    description:'Wake up your body and mind with this energising morning routine.',
    exercises:['Sun Salutation','Warrior Pose','Child\'s Pose'],
  },
  // BOXING
  {
    id:'boxing_basics', sport:'boxing', name:'Boxing Basics', icon:'🥊', level:'Beginner',
    duration:'30 min', muscles:'Full Body, Cardio',
    description:'Learn fundamental punches and footwork while getting a great cardio workout.',
    exercises:['Shadow Boxing','Jab-Cross'],
  },
  // CYCLING
  {
    id:'cycling_endurance', sport:'cycling', name:'Endurance Ride', icon:'🚴', level:'Beginner',
    duration:'45 min', muscles:'Legs, Cardiovascular',
    description:'Steady-state cycling session to build aerobic endurance.',
    exercises:['Cycling'],
  },
  // SWIMMING
  {
    id:'swim_laps', sport:'swimming', name:'Lap Swimming', icon:'🏊', level:'Beginner',
    duration:'30 min', muscles:'Full Body, Low Impact',
    description:'Low-impact full body workout. Excellent for recovery and joint health.',
    exercises:['Swimming'],
  },
]

export const LEVEL_COLOR = {
  Beginner:     '#2ECC71',
  Intermediate: '#F5A623',
  Advanced:     '#E05252',
}

// ── Additional exercises ─────────────────────
Object.assign(EXERCISES, {
  // PILATES
  'The Hundred': { icon:'🧘', muscles:'Core, Breathing', category:'Pilates', timed:true,
    howTo:['Lie on back, legs in tabletop position','Lift head and shoulders, extend legs to 45°','Pump arms up and down in small pulses','Inhale for 5 pulses, exhale for 5 pulses','Complete 10 full breath cycles (100 pumps)'],
    tips:'Keep lower back pressed into mat. The smaller the movement, the harder it works.' },
  'Roll Up': { icon:'🧘', muscles:'Abs, Spine Flexibility', category:'Pilates', timed:false,
    howTo:['Lie flat, arms overhead','Slowly peel spine off mat one vertebra at a time','Reach forward toward toes','Roll back down with same control'],
    tips:'Move slowly — this is spine articulation, not a sit up.' },
  'Single Leg Stretch': { icon:'🧘', muscles:'Core, Hip Flexors', category:'Pilates', timed:false,
    howTo:['Lie on back, bring both knees to chest','Extend one leg, hug the other','Switch legs in rhythmic alternation','Keep head and shoulders lifted'],
    tips:'Stabilise your pelvis — avoid rocking side to side.' },
  // CROSSFIT
  'Box Jump': { icon:'📦', muscles:'Quads, Glutes, Power', category:'CrossFit', timed:false,
    howTo:['Stand facing box, feet shoulder-width','Swing arms back, bend knees','Explode upward, pulling knees up','Land softly with bent knees','Step or jump back down'],
    tips:'Land quietly — loud landing = wasted energy.' },
  'Burpee': { icon:'⚡', muscles:'Full Body, Cardio', category:'CrossFit', timed:true,
    howTo:['Stand, drop hands to floor','Jump feet back to push-up position','Perform push up (optional)','Jump feet forward to hands','Jump up with arms overhead'],
    tips:'The burpee is a full body conditioning move. Maintain steady pace over max speed.' },
  'Kettlebell Swing': { icon:'🔔', muscles:'Glutes, Hamstrings, Core', category:'CrossFit', timed:false,
    howTo:['Stand with feet slightly wider than hips, kettlebell in front','Hinge at hips, swing bell between legs','Drive hips forward explosively','Bell swings to chest height','Let bell fall back, hinge and repeat'],
    tips:'This is a hip hinge, not a squat. Power comes from the hips.' },
  'Thruster': { icon:'🏋️', muscles:'Full Body, Quads, Shoulders', category:'CrossFit', timed:false,
    howTo:['Hold bar at shoulder height, squat depth','Drive up from squat explosively','Use momentum to press bar overhead','Lower bar back to shoulders as you descend'],
    tips:'The squat and press should feel like one fluid movement.' },
  'Wall Ball': { icon:'🏀', muscles:'Full Body, Quads', category:'CrossFit', timed:true,
    howTo:['Stand 1m from wall holding medicine ball at chest','Squat to parallel depth','Explode up, throw ball to target on wall','Catch ball, immediately descend into squat'],
    tips:'Keep your chest up in the squat. Don\'t let the ball pull you forward.' },
  // STRETCHING
  'Hamstring Stretch': { icon:'🤸', muscles:'Hamstrings', category:'Stretching', timed:true,
    howTo:['Sit or lie on back','Bring one leg up, hold behind thigh or calf','Keep knee as straight as possible','Hold 30–60 seconds each side'],
    tips:'Never force the stretch. Breathe deeply and relax into it.' },
  'Hip Flexor Stretch': { icon:'🤸', muscles:'Hip Flexors, Quads', category:'Stretching', timed:true,
    howTo:['Kneel with one knee on floor','Shift hips forward until stretch is felt in front hip','Keep torso upright','Hold 30–60 seconds each side'],
    tips:'Great after sitting all day or heavy leg training.' },
  'Chest Opener': { icon:'🤸', muscles:'Chest, Shoulders, Posture', category:'Stretching', timed:true,
    howTo:['Clasp hands behind back','Squeeze shoulder blades together','Lift arms slightly, open chest','Hold 20–30 seconds'],
    tips:'Do this after any pushing workout or desk work.' },
  'Pigeon Pose': { icon:'🕊️', muscles:'Hip Flexors, Glutes, IT Band', category:'Stretching', timed:true,
    howTo:['From downward dog, bring one knee forward behind wrist','Extend opposite leg behind you','Lower hips toward floor','Hold or fold forward for deeper stretch'],
    tips:'One of the best hip openers. Stay for 1–2 minutes each side.' },
  // HIIT EXERCISES
  'Jump Squat': { icon:'⚡', muscles:'Quads, Glutes, Power', category:'HIIT', timed:false,
    howTo:['Stand feet shoulder-width','Lower into squat position','Explode up jumping off ground','Land softly, immediately lower into next squat'],
    tips:'Land with soft knees — absorb impact through legs, not joints.' },
  'High Knees': { icon:'🏃', muscles:'Core, Hip Flexors, Cardio', category:'HIIT', timed:true,
    howTo:['Run in place','Drive knees up to hip height alternately','Pump arms in opposition','Stay on balls of feet'],
    tips:'The higher the knees, the harder the core works.' },
  'Jumping Jacks': { icon:'⭐', muscles:'Full Body, Cardio', category:'HIIT', timed:true,
    howTo:['Start standing, feet together arms at sides','Jump feet apart while raising arms overhead','Jump back to starting position','Repeat continuously'],
    tips:'Classic warm-up move. Keep a steady rhythm.' },
  // MARTIAL ARTS
  'Kata Practice': { icon:'🥋', muscles:'Full Body, Coordination', category:'Martial Arts', timed:true,
    howTo:['Stand in ready stance','Perform sequence of prescribed techniques','Each movement should be deliberate','Finish in starting position'],
    tips:'Kata means "form" — focus on precision over speed.' },
  'Roundhouse Kick': { icon:'🦵', muscles:'Legs, Core, Hip Flexors', category:'Martial Arts', timed:false,
    howTo:['Stand in fighting stance','Raise knee of kicking leg to side','Pivot on standing foot, rotate hip','Extend leg in arc, kick with shin or instep','Retract leg, return to stance'],
    tips:'Power comes from hip rotation, not just the leg.' },
  // SPORTS-SPECIFIC
  'Basketball Dribbling': { icon:'🏀', muscles:'Coordination, Hands, Agility', category:'Basketball', timed:true,
    howTo:['Bounce ball with fingertips, not palm','Keep ball below waist height','Stay in athletic stance, knees bent','Practice with both hands alternately'],
    tips:'Great ball handlers rarely look at the ball.' },
  'Tennis Forehand': { icon:'🎾', muscles:'Shoulder, Core, Wrist', category:'Tennis', timed:false,
    howTo:['Turn sideways to net, non-dominant shoulder forward','Swing racket back','Step forward, rotate hips and shoulders','Make contact in front of body','Follow through over shoulder'],
    tips:'The follow-through determines spin and control.' },
  'Football Sprint': { icon:'⚽', muscles:'Speed, Legs, Acceleration', category:'Football', timed:true,
    howTo:['Drive off back foot, lean forward','Pump arms aggressively','Lift knees, push off balls of feet','Maintain lean through acceleration phase','Gradually upright as reaching top speed'],
    tips:'90% of football is played in short explosive bursts under 30m.' },
  'Golf Swing': { icon:'⛳', muscles:'Core, Shoulders, Rotation', category:'Golf', timed:false,
    howTo:['Address ball, feet shoulder-width, slight knee bend','Takeaway: club, arms and shoulders together','Coil torso, weight shifts to trail side','Downswing: hips lead, drop club into slot','Impact: weight forward, face square, follow through'],
    tips:'Grip pressure should be like holding a small bird — firm but gentle.' },
  // DANCE
  'Zumba Basic Step': { icon:'💃', muscles:'Full Body, Cardio, Coordination', category:'Dance', timed:true,
    howTo:['Step side to side with hip sway','Add arm movements matching the beat','Let music guide your rhythm','Combine steps into flowing sequences'],
    tips:'Don\'t overthink it — just move to the music and have fun.' },
  // CALISTHENICS
  'Handstand Hold': { icon:'🤸', muscles:'Shoulders, Core, Balance', category:'Calisthenics', timed:true,
    howTo:['Place hands shoulder-width on floor','Kick up to handstand against wall first','Engage core and glutes','Point toes, body in straight line','Work toward wall-free balance'],
    tips:'Start against a wall. Master it there before going freestanding.' },
  'L-Sit': { icon:'💪', muscles:'Core, Triceps, Hip Flexors', category:'Calisthenics', timed:true,
    howTo:['Sit on floor, place hands beside hips','Push down, lift body off floor','Extend legs parallel to ground','Hold position with straight legs'],
    tips:'Use parallettes or dip bars to start. Extremely challenging move.' },
  'Pistol Squat': { icon:'🦵', muscles:'Quads, Balance, Glutes', category:'Calisthenics', timed:false,
    howTo:['Stand on one leg, extend other leg forward','Lower slowly on single leg to full depth','Keep heel on ground, torso upright','Drive back up through heel'],
    tips:'Use TRX or hold a door frame when learning. Builds incredible leg strength.' },
  // ROWING
  'Rowing Machine': { icon:'🚣', muscles:'Full Body, Back, Legs', category:'Rowing', timed:true,
    howTo:['Sit in machine, feet strapped, grip handle','Start with legs bent, arms extended (catch)','Drive legs first, lean back slightly, pull handle to lower ribs','Extend arms, lean forward, bend legs (recover)'],
    tips:'Legs 60%, back 20%, arms 20% — legs do most of the work.' },
  // GYMNASTICS
  'Cartwheel': { icon:'🤸', muscles:'Full Body, Coordination', category:'Gymnastics', timed:false,
    howTo:['Start with dominant foot forward, arms raised','Step and plant lead hand, then trail hand','Kick legs up and over in wheel motion','Land feet apart, arms up'],
    tips:'Keep arms straight and locked. Look at your hands throughout.' },
})

// Add more sports
const newSports = [
  { id:'pilates',     name:'Pilates',      icon:'🧘', color:'#A29BFE' },
  { id:'crossfit',    name:'CrossFit',     icon:'🔥', color:'#E05252' },
  { id:'stretching',  name:'Stretching',   icon:'🤸', color:'#00BCD4' },
  { id:'hiit',        name:'HIIT',         icon:'⚡', color:'#F5A623' },
  { id:'martial',     name:'Martial Arts', icon:'🥋', color:'#2D3436' },
  { id:'basketball',  name:'Basketball',   icon:'🏀', color:'#E67E22' },
  { id:'football',    name:'Football',     icon:'⚽', color:'#27AE60' },
  { id:'tennis',      name:'Tennis',       icon:'🎾', color:'#F1C40F' },
  { id:'golf',        name:'Golf',         icon:'⛳', color:'#2ECC71' },
  { id:'dance',       name:'Dance',        icon:'💃', color:'#E91E63' },
  { id:'calisthenics',name:'Calisthenics', icon:'💪', color:'#6C5CE7' },
  { id:'rowing',      name:'Rowing',       icon:'🚣', color:'#0984E3' },
  { id:'gymnastics',  name:'Gymnastics',   icon:'🤸', color:'#9B59B6' },
  { id:'running',     name:'Running',      icon:'🏃', color:'#2ECC71' },
]
newSports.forEach(s => { if (!SPORTS.find(e => e.id === s.id)) SPORTS.push(s) })

// More library workouts
const newWorkouts = [
  { id:'pilates_core', sport:'pilates', name:'Core Pilates', icon:'🧘', level:'Beginner', duration:'30 min', muscles:'Core · Abs · Spine', description:'Low-impact Pilates session focusing on core strength and body awareness.', exercises:['The Hundred','Roll Up','Single Leg Stretch','Plank'] },
  { id:'crossfit_wod', sport:'crossfit', name:'Classic WOD', icon:'🔥', level:'Advanced', duration:'20 min', muscles:'Full Body', description:'A classic CrossFit-style workout of the day. Go hard, rest when needed.', exercises:['Burpee','Kettlebell Swing','Box Jump','Thruster','Wall Ball'] },
  { id:'full_stretch', sport:'stretching', name:'Full Body Stretch', icon:'🤸', level:'Beginner', duration:'20 min', muscles:'Full Body Flexibility', description:'A complete stretching routine to improve flexibility and reduce soreness.', exercises:['Hamstring Stretch','Hip Flexor Stretch','Chest Opener','Pigeon Pose','Child\'s Pose'] },
  { id:'hiit_cardio', sport:'hiit', name:'HIIT Cardio Blast', icon:'⚡', level:'Intermediate', duration:'25 min', muscles:'Full Body, Cardio', description:'High intensity intervals with short rest. Maximum calorie burn in minimum time.', exercises:['Burpee','High Knees','Jump Squat','Jumping Jacks','Mountain Climbers','Jump Rope'] },
  { id:'martial_basics', sport:'martial', name:'Martial Arts Basics', icon:'🥋', level:'Beginner', duration:'30 min', muscles:'Full Body, Coordination', description:'Fundamental techniques for beginners covering stances, punches and kicks.', exercises:['Shadow Boxing','Jab-Cross','Roundhouse Kick','Kata Practice'] },
  { id:'run_30', sport:'running', name:'30-Min Easy Run', icon:'🏃', level:'Beginner', duration:'30 min', muscles:'Legs, Cardiovascular', description:'Steady comfortable pace to build your aerobic base. No stopping.', exercises:['Running'] },
  { id:'run_interval', sport:'running', name:'Interval Training', icon:'🏃', level:'Intermediate', duration:'40 min', muscles:'Speed, Endurance', description:'Sprint and recovery intervals to build speed and endurance simultaneously.', exercises:['Running','High Knees','Walking'] },
  { id:'cali_basics', sport:'calisthenics', name:'Calisthenics Basics', icon:'💪', level:'Beginner', duration:'35 min', muscles:'Full Body, Bodyweight', description:'Master your own bodyweight with these fundamental calisthenics movements.', exercises:['Push Ups','Pull Ups','Squat','Dips','Plank','Crunches'] },
  { id:'cali_advanced', sport:'calisthenics', name:'Advanced Skills', icon:'💪', level:'Advanced', duration:'40 min', muscles:'Full Body Strength', description:'Elite calisthenics movements requiring exceptional strength and balance.', exercises:['Handstand Hold','L-Sit','Pistol Squat','Pull Ups','Dips'] },
  { id:'row_endurance', sport:'rowing', name:'Rowing Endurance', icon:'🚣', level:'Intermediate', duration:'30 min', muscles:'Full Body, Back, Legs', description:'Sustained rowing machine session for full body conditioning and cardiovascular fitness.', exercises:['Rowing Machine'] },
  { id:'dance_zumba', sport:'dance', name:'Zumba Flow', icon:'💃', level:'Beginner', duration:'45 min', muscles:'Full Body, Fun', description:'Dance your way to fitness. No experience needed — just move to the music!', exercises:['Zumba Basic Step','Jumping Jacks'] },
]
newWorkouts.forEach(w => { if (!LIBRARY_WORKOUTS.find(e => e.id === w.id)) LIBRARY_WORKOUTS.push(w) })
