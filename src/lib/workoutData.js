// ─────────────────────────────────────────────────────────────
// workoutData.js — Comprehensive workout data
// 80+ sports, 60+ exercises with how-to instructions
// ─────────────────────────────────────────────────────────────

// ── Exercise definitions ──────────────────────────────────────
export const EXERCISES = {
  // CHEST
  'Bench Press':         { icon:'🏋️', muscles:'Chest, Triceps, Shoulders', category:'Chest', howTo:['Lie flat, feet on floor','Grip bar slightly wider than shoulders','Lower to mid-chest with control','Press up explosively'], tips:'Never bounce the bar off your chest.' },
  'Incline Bench Press': { icon:'🏋️', muscles:'Upper Chest, Shoulders',    category:'Chest', howTo:['Set bench to 30–45°','Lower bar to upper chest','Press up and slightly back'], tips:'Over 45° shifts load to shoulders.' },
  'Push Ups':            { icon:'💪', muscles:'Chest, Triceps, Core',       category:'Chest', howTo:['Start in plank, hands wider than shoulders','Keep body straight','Lower chest to floor','Push back up'], tips:'Don\'t let hips sag.' },
  'Chest Fly':           { icon:'🦋', muscles:'Chest',                       category:'Chest', howTo:['Lie on bench with dumbbells above chest','Lower arms wide in arc','Squeeze chest to bring back'], tips:'Focus on the stretch at the bottom.' },
  'Dips':                { icon:'💪', muscles:'Chest, Triceps',              category:'Chest', howTo:['Grip parallel bars','Lean forward for chest focus','Lower until arms parallel','Push back up'], tips:'Lean forward = chest, upright = triceps.' },
  'Cable Crossover':     { icon:'🦋', muscles:'Chest',                       category:'Chest', howTo:['Set cables high, stand centre','Pull handles together in front','Squeeze at peak contraction'], tips:'Great finisher exercise.' },
  // BACK
  'Pull Ups':            { icon:'💪', muscles:'Lats, Biceps',                category:'Back', howTo:['Hang with overhand grip','Pull shoulder blades down first','Chin above bar','Lower fully'], tips:'Full range of motion is key.' },
  'Deadlift':            { icon:'🏋️', muscles:'Full Back, Hamstrings, Glutes',category:'Back', howTo:['Bar over mid-foot','Hinge at hips, grip outside legs','Chest up, brace core','Drive through floor','Lock out hips at top'], tips:'Never round the lower back.' },
  'Bent Over Row':       { icon:'🏋️', muscles:'Back, Biceps',                category:'Back', howTo:['Hinge forward, back flat','Pull bar to lower chest','Squeeze shoulder blades'], tips:'Keep back flat throughout.' },
  'Lat Pulldown':        { icon:'💪', muscles:'Lats, Biceps',                category:'Back', howTo:['Grip bar wide, sit upright','Pull to upper chest','Slow return'], tips:'Imagine pulling elbows to back pockets.' },
  'Seated Cable Row':    { icon:'🚣', muscles:'Mid Back',                    category:'Back', howTo:['Sit upright, feet on platform','Pull to abdomen','Squeeze blades at peak'], tips:'Don\'t use momentum.' },
  'Face Pull':           { icon:'💪', muscles:'Rear Delts, Upper Back',      category:'Back', howTo:['Cable at face height','Pull rope to face','Elbows high and wide','External rotate at end'], tips:'Great for shoulder health.' },
  // LEGS
  'Squat':               { icon:'🏋️', muscles:'Quads, Glutes, Hamstrings',  category:'Legs', howTo:['Bar on traps, feet shoulder-width','Brace core','Push knees out, sit back','Thighs parallel or below','Drive through floor'], tips:'Knees track over toes.' },
  'Romanian Deadlift':   { icon:'🏋️', muscles:'Hamstrings, Glutes',          category:'Legs', howTo:['Hold bar, push hips back','Lower bar along legs','Feel hamstring stretch','Drive hips forward'], tips:'Hip hinge, not a squat.' },
  'Leg Press':           { icon:'🦵', muscles:'Quads, Glutes',               category:'Legs', howTo:['Feet shoulder-width on platform','Lower until 90°','Press without locking knees'], tips:'Higher feet = more glutes.' },
  'Lunges':              { icon:'🦵', muscles:'Quads, Glutes',               category:'Legs', howTo:['Step forward','Lower back knee to floor','Front knee over ankle','Push back up'], tips:'Long stride = glutes, short = quads.' },
  'Hip Thrust':          { icon:'🦵', muscles:'Glutes, Hamstrings',          category:'Legs', howTo:['Upper back on bench, bar on hips','Drive hips up','Squeeze glutes at top'], tips:'Best glute exercise there is.' },
  'Calf Raises':         { icon:'🦵', muscles:'Calves',                      category:'Legs', howTo:['Rise onto balls of feet','Hold peak 1 second','Lower below step'], tips:'Use full range, high reps.' },
  // SHOULDERS
  'Overhead Press':      { icon:'🏋️', muscles:'Shoulders, Triceps',          category:'Shoulders', howTo:['Bar at shoulders','Press straight up','Lock out at top'], tips:'Brace core throughout.' },
  'Lateral Raise':       { icon:'💪', muscles:'Side Delts',                  category:'Shoulders', howTo:['Raise arms to sides','Parallel to floor','Pinky slightly higher'], tips:'Go lighter than you think.' },
  'Arnold Press':        { icon:'🏋️', muscles:'All Deltoid Heads',           category:'Shoulders', howTo:['Palms facing you at shoulder height','Press up, rotate palms out','Reverse on the way down'], tips:'Hits all three delt heads.' },
  // ARMS
  'Bicep Curl':          { icon:'💪', muscles:'Biceps',                      category:'Arms', howTo:['Arms fully extended','Curl to shoulders','Squeeze at top','Lower fully'], tips:'Don\'t swing.' },
  'Hammer Curl':         { icon:'💪', muscles:'Biceps, Forearms',            category:'Arms', howTo:['Neutral grip (thumbs up)','Curl without rotating wrist'], tips:'Builds arm thickness.' },
  'Tricep Pushdown':     { icon:'💪', muscles:'Triceps',                     category:'Arms', howTo:['Elbows fixed at sides','Push down to full extension','Squeeze triceps'], tips:'Don\'t let elbows flare.' },
  'Skull Crushers':      { icon:'🏋️', muscles:'Triceps',                     category:'Arms', howTo:['Lie on bench, bar above chest','Lower to forehead','Extend back up'], tips:'Only forearms move.' },
  // CORE
  'Plank':               { icon:'🧘', muscles:'Core, Shoulders', timed:true, category:'Core', howTo:['Forearms on floor','Straight line head to heels','Squeeze core and glutes'], tips:'Quality over duration.' },
  'Crunches':            { icon:'💪', muscles:'Abs',                         category:'Core', howTo:['Knees bent, hands behind head','Curl shoulders off floor','Slow lower'], tips:'Short range is intentional.' },
  'Leg Raises':          { icon:'🦵', muscles:'Lower Abs',                   category:'Core', howTo:['Lie flat','Raise legs to 90°','Lower slowly without touching floor'], tips:'Slower = harder.' },
  'Russian Twist':       { icon:'🔄', muscles:'Obliques',                    category:'Core', howTo:['Feet off floor, lean back','Rotate side to side'], tips:'Control the movement.' },
  'Mountain Climbers':   { icon:'🏔️', muscles:'Core, Cardio', timed:true,    category:'Core', howTo:['Push-up position','Drive knees to chest alternately'], tips:'Fast = cardio, slow = core.' },
  // CARDIO
  'Running':             { icon:'🏃', muscles:'Full Body', timed:true,       category:'Running', howTo:['Warm up 5 min','Land midfoot','Arms at 90°','Breathe rhythmically'], tips:'Conversational pace for aerobic base.' },
  'Cycling':             { icon:'🚴', muscles:'Quads, Hamstrings, Glutes', timed:true, category:'Cycling', howTo:['Seat height: slight bend at bottom','80–100 RPM cadence','Core engaged'], tips:'Higher cadence, lower resistance is joint-friendly.' },
  'Jump Rope':           { icon:'🪢', muscles:'Full Body, Calves', timed:true, category:'Cardio', howTo:['Hold handles at hip height','Stay on balls of feet','Small efficient jumps'], tips:'Burns ~10 kcal/min.' },
  'Swimming':            { icon:'🏊', muscles:'Full Body', timed:true,       category:'Swimming', howTo:['Warm up easy laps','Focus on long smooth strokes','Breathe every 2–3 strokes'], tips:'Zero joint impact.' },
  'HIIT':                { icon:'⚡', muscles:'Full Body', timed:true,       category:'HIIT', howTo:['Warm up 5 min','90%+ effort 20–40 sec','Rest 10–20 sec','8–20 rounds'], tips:'True HIIT means maximum effort.' },
  'Walking':             { icon:'🚶', muscles:'Legs, Cardio', timed:true,    category:'Walking', howTo:['Head up, shoulders back','Swing arms naturally','Push off with toes','Aim for 5–6 km/h'], tips:'10,000 steps ≈ 400–500 kcal.' },
  'Rowing Machine':      { icon:'🚣', muscles:'Full Body, Back', timed:true, category:'Rowing', howTo:['Legs drive first','Then lean back','Then pull arms','Reverse sequence'], tips:'Legs 60%, back 20%, arms 20%.' },
  // CROSSFIT
  'Burpee':              { icon:'⚡', muscles:'Full Body', timed:true,       category:'CrossFit', howTo:['Drop hands to floor','Jump feet back','Push up','Jump feet forward','Jump up, arms overhead'], tips:'Maintain steady pace.' },
  'Kettlebell Swing':    { icon:'🔔', muscles:'Glutes, Hamstrings, Core',    category:'CrossFit', howTo:['Hinge at hips','Swing between legs','Drive hips forward','Bell to chest height'], tips:'Power comes from hips.' },
  'Box Jump':            { icon:'📦', muscles:'Quads, Glutes, Power',        category:'CrossFit', howTo:['Stand facing box','Swing arms, bend knees','Explode upward','Land softly'], tips:'Land quietly = good form.' },
  'Thruster':            { icon:'🏋️', muscles:'Full Body',                   category:'CrossFit', howTo:['Bar at shoulders','Squat to parallel','Drive up explosively','Press overhead'], tips:'Squat and press are one movement.' },
  'Wall Ball':           { icon:'🏀', muscles:'Full Body', timed:true,       category:'CrossFit', howTo:['Squat with ball at chest','Explode up','Throw to wall target','Catch, squat immediately'], tips:'Keep chest up in squat.' },
  // YOGA
  'Sun Salutation':      { icon:'🌅', muscles:'Full Body, Flexibility', timed:true, category:'Yoga', howTo:['Arms overhead inhale','Forward fold exhale','Plank','Upward dog inhale','Downward dog exhale','Step forward, rise'], tips:'Move with your breath.' },
  'Warrior Pose':        { icon:'⚔️', muscles:'Legs, Hips, Balance', timed:true, category:'Yoga', howTo:['Lunge forward','Front knee 90°','Arms raised overhead','Hold 30–60 sec each side'], tips:'Focus on stability and breath.' },
  'Child\'s Pose':       { icon:'🧘', muscles:'Back, Hips', timed:true,     category:'Yoga', howTo:['Kneel, toes touching','Sit back on heels','Fold forward, arms extended'], tips:'Use any time as a rest pose.' },
  'Downward Dog':        { icon:'🧘', muscles:'Hamstrings, Calves, Shoulders', timed:true, category:'Yoga', howTo:['Hands and feet on floor','Lift hips up and back','Straight line from hands to hips','Press heels toward floor'], tips:'Bend knees if hamstrings are tight.' },
  // PILATES
  'The Hundred':         { icon:'🧘', muscles:'Core, Breathing', timed:true, category:'Pilates', howTo:['Legs in tabletop','Lift head and shoulders','Pump arms 100 times','Inhale 5, exhale 5'], tips:'Lower back pressed into mat.' },
  'Roll Up':             { icon:'🧘', muscles:'Abs, Spine',                  category:'Pilates', howTo:['Lie flat, arms overhead','Peel spine off mat slowly','Reach for toes','Roll down with control'], tips:'Spine articulation, not a sit-up.' },
  // BOXING
  'Jab-Cross':           { icon:'🥊', muscles:'Shoulders, Core', timed:true, category:'Boxing', howTo:['Boxing stance','Jab: quick lead hand','Cross: powerful rear hand with hip rotation','Return to guard'], tips:'Power comes from rotation.' },
  'Shadow Boxing':       { icon:'🥊', muscles:'Full Body, Cardio', timed:true, category:'Boxing', howTo:['Move constantly on balls of feet','Mix jabs, crosses, hooks, uppercuts','Add footwork and head movement'], tips:'3-min rounds, 1-min rest.' },
  'Heavy Bag':           { icon:'🥊', muscles:'Full Body, Power', timed:true, category:'Boxing', howTo:['Wrap hands first','Use proper stance','Throw combinations','Keep guard up between punches'], tips:'Focus on technique, not just power.' },
  // STRETCHING
  'Hamstring Stretch':   { icon:'🤸', muscles:'Hamstrings', timed:true,      category:'Stretching', howTo:['Sit or lie down','Bring one leg up','Keep knee straight','Hold 30–60 sec each side'], tips:'Never force the stretch.' },
  'Hip Flexor Stretch':  { icon:'🤸', muscles:'Hip Flexors', timed:true,    category:'Stretching', howTo:['Kneel one knee on floor','Shift hips forward','Keep torso upright'], tips:'Great after sitting or leg day.' },
  'Pigeon Pose':         { icon:'🕊️', muscles:'Hips, IT Band', timed:true,   category:'Stretching', howTo:['From downward dog','Knee forward behind wrist','Extend other leg back','Hold 1–2 min each side'], tips:'One of the best hip openers.' },
  'Chest Opener':        { icon:'🤸', muscles:'Chest, Posture', timed:true,  category:'Stretching', howTo:['Clasp hands behind back','Squeeze shoulder blades','Lift arms slightly'], tips:'Do after any pushing workout.' },
  // CALISTHENICS
  'Handstand Hold':      { icon:'🤸', muscles:'Shoulders, Core', timed:true, category:'Calisthenics', howTo:['Hands shoulder-width','Kick up to wall first','Engage core and glutes','Work toward freestanding'], tips:'Master wall handstand first.' },
  'Pistol Squat':        { icon:'🦵', muscles:'Quads, Balance',              category:'Calisthenics', howTo:['Stand on one leg','Extend other leg forward','Lower on single leg','Drive back up'], tips:'Use a doorframe when learning.' },
  'L-Sit':               { icon:'💪', muscles:'Core, Triceps', timed:true,  category:'Calisthenics', howTo:['Hands beside hips','Push down to lift body','Extend legs parallel'], tips:'Extremely challenging. Start with bent knees.' },
  // HIIT
  'Jump Squat':          { icon:'⚡', muscles:'Quads, Glutes, Power',        category:'HIIT', howTo:['Squat down','Explode up off floor','Land softly, immediately squat'], tips:'Land with soft knees.' },
  'High Knees':          { icon:'🏃', muscles:'Core, Cardio', timed:true,   category:'HIIT', howTo:['Run in place','Drive knees to hip height','Pump arms in opposition'], tips:'Higher knees = harder core.' },
  'Jumping Jacks':       { icon:'⭐', muscles:'Full Body, Cardio', timed:true, category:'HIIT', howTo:['Feet together, arms at sides','Jump feet apart, raise arms overhead','Jump back to start'], tips:'Classic warm-up move.' },
  'Burpee Box Jump':     { icon:'📦', muscles:'Full Body, Power', timed:true, category:'HIIT', howTo:['Perform burpee','At the jump, land on box','Step down, repeat'], tips:'Advanced combo. Reduce speed for safety.' },
  // MARTIAL ARTS
  'Roundhouse Kick':     { icon:'🦵', muscles:'Legs, Core, Hips',           category:'Martial Arts', howTo:['Fighting stance','Raise knee of kicking leg','Pivot on standing foot','Extend leg in arc','Retract'], tips:'Power comes from hip rotation.' },
  'Kata Practice':       { icon:'🥋', muscles:'Full Body', timed:true,      category:'Martial Arts', howTo:['Ready stance','Perform sequence deliberately','Each movement intentional','Finish in start position'], tips:'Focus on precision over speed.' },
  // SPORTS-SPECIFIC
  'Kettlebell Clean':    { icon:'🔔', muscles:'Full Body, Power',            category:'Kettlebell', howTo:['Hike bell between legs','Drive hips, pull bell up','Catch in rack position','Elbow close to body'], tips:'The clean is the foundation of most KB moves.' },
  'Turkish Get Up':      { icon:'🔔', muscles:'Full Body, Stability',        category:'Kettlebell', howTo:['Lie down, bell locked overhead','Slowly rise to standing in stages','Reverse the movement back down'], tips:'Go slow. This is a strength skill.' },
  'Goblet Squat':        { icon:'🔔', muscles:'Quads, Glutes, Core',         category:'Kettlebell', howTo:['Hold bell at chest','Feet slightly wide','Squat deep, elbows inside knees','Drive back up'], tips:'Great for squat depth and posture.' },
  'Farmer\'s Carry':     { icon:'🏋️', muscles:'Grip, Traps, Core', timed:true, category:'Functional', howTo:['Hold heavy weights at sides','Walk with tall posture','Controlled steps','Don\'t let shoulders round'], tips:'One of the most functional exercises.' },
  'Battle Ropes':        { icon:'🔗', muscles:'Arms, Core, Cardio', timed:true, category:'Functional', howTo:['Hold one end each','Alternate arm waves','Keep core braced','Vary patterns: circles, slams'], tips:'Brutal conditioning tool.' },
  'Medicine Ball Slam':  { icon:'⚽', muscles:'Full Body, Core, Power',      category:'Functional', howTo:['Hold ball overhead','Squat slightly','Slam ball to floor hard','Catch or pick up, repeat'], tips:'Great for aggression and power.' },
  // WATER SPORTS
  'Water Polo Treading': { icon:'🏊', muscles:'Legs, Core', timed:true,     category:'Water Polo', howTo:['Eggbeater kick legs','Arms used for throwing or balance','Stay in place vertically'], tips:'Eggbeater kick is the key skill.' },
  // RACQUET
  'Tennis Forehand':     { icon:'🎾', muscles:'Shoulder, Core, Wrist',       category:'Tennis', howTo:['Turn sideways to net','Swing racket back','Step forward, rotate hips','Contact in front','Follow through'], tips:'Follow-through determines spin.' },
  'Badminton Smash':     { icon:'🏸', muscles:'Shoulder, Wrist, Core',       category:'Badminton', howTo:['Position behind shuttle','Jump if needed','Full swing overhead','Snap wrist at contact'], tips:'The most powerful shot in badminton.' },
  // TEAM SPORTS
  'Football Sprint':     { icon:'⚽', muscles:'Speed, Legs',  timed:true,   category:'Football', howTo:['Drive off back foot, lean forward','Pump arms aggressively','Lift knees high'], tips:'90% of football is bursts under 30m.' },
  'Basketball Dribbling':{ icon:'🏀', muscles:'Coordination, Hands', timed:true, category:'Basketball', howTo:['Use fingertips, not palm','Ball below waist','Athletic stance','Practice both hands'], tips:'Great ball handlers never look at the ball.' },
  'Volleyball Spike':    { icon:'🏐', muscles:'Shoulder, Jump, Core',        category:'Volleyball', howTo:['Approach: 3–4 steps','Jump off both feet','Wind up arm overhead','Snap wrist on contact'], tips:'Arm speed creates power, not just strength.' },
  // GOLF
  'Golf Swing':          { icon:'⛳', muscles:'Core, Shoulders, Rotation',   category:'Golf', howTo:['Address ball, slight knee bend','Takeaway: club and shoulders together','Coil torso on backswing','Hips lead downswing','Impact: weight forward, follow through'], tips:'Grip like you\'re holding a small bird.' },
  // DANCE
  'Zumba Basic Step':    { icon:'💃', muscles:'Full Body, Cardio', timed:true, category:'Dance', howTo:['Step side to side with hip sway','Add arm movements to the beat','Let the music guide rhythm'], tips:'Just move and have fun.' },
  // GYMNASTICS
  'Cartwheel':           { icon:'🤸', muscles:'Full Body, Coordination',     category:'Gymnastics', howTo:['Lead foot forward','Plant lead hand, then trail hand','Kick legs up and over','Land feet apart'], tips:'Keep arms straight throughout.' },
}

// ─────────────────────────────────────────────
// Sports — 80+ categories organized by type
// ─────────────────────────────────────────────
export const SPORTS_CATEGORIES = [
  {
    category: 'Gym & Strength',
    sports: [
      { id:'gym',          name:'Weight Training',  icon:'🏋️', color:'#6C5CE7' },
      { id:'powerlifting', name:'Powerlifting',      icon:'💪', color:'#5A4BD1' },
      { id:'bodybuilding', name:'Bodybuilding',      icon:'🦾', color:'#7C3AED' },
      { id:'crossfit',     name:'CrossFit',          icon:'🔥', color:'#E05252' },
      { id:'calisthenics', name:'Calisthenics',      icon:'🤸', color:'#6C5CE7' },
      { id:'kettlebell',   name:'Kettlebell',        icon:'🔔', color:'#8B5CF6' },
      { id:'functional',   name:'Functional Fitness',icon:'⚙️', color:'#7C6CE7' },
      { id:'strongman',    name:'Strongman',         icon:'🏆', color:'#DC2626' },
    ]
  },
  {
    category: 'Cardio & Running',
    sports: [
      { id:'running',      name:'Running',           icon:'🏃', color:'#2ECC71' },
      { id:'walking',      name:'Walking',           icon:'🚶', color:'#27AE60' },
      { id:'cycling',      name:'Cycling',           icon:'🚴', color:'#00BCD4' },
      { id:'hiit',         name:'HIIT',              icon:'⚡', color:'#F5A623' },
      { id:'elliptical',   name:'Elliptical',        icon:'🔄', color:'#10B981' },
      { id:'stairclimber', name:'Stair Climber',     icon:'🪜', color:'#059669' },
      { id:'jumpRope',     name:'Jump Rope',         icon:'🪢', color:'#34D399' },
      { id:'treadmill',    name:'Treadmill',         icon:'🏃', color:'#6EE7B7' },
    ]
  },
  {
    category: 'Water Sports',
    sports: [
      { id:'swimming',     name:'Swimming',          icon:'🏊', color:'#0984E3' },
      { id:'openWater',    name:'Open Water',        icon:'🌊', color:'#0369A1' },
      { id:'diving',       name:'Diving',            icon:'🤿', color:'#0EA5E9' },
      { id:'surfing',      name:'Surfing',           icon:'🏄', color:'#06B6D4' },
      { id:'rowing',       name:'Rowing',            icon:'🚣', color:'#1D4ED8' },
      { id:'kayaking',     name:'Kayaking',          icon:'🛶', color:'#2563EB' },
      { id:'waterPolo',    name:'Water Polo',        icon:'🏊', color:'#3B82F6' },
      { id:'kitesurfing',  name:'Kitesurfing',       icon:'🪁', color:'#60A5FA' },
    ]
  },
  {
    category: 'Mind & Body',
    sports: [
      { id:'yoga',         name:'Yoga',              icon:'🧘', color:'#A29BFE' },
      { id:'pilates',      name:'Pilates',           icon:'🧘', color:'#C084FC' },
      { id:'meditation',   name:'Meditation',        icon:'☮️', color:'#DDD6FE' },
      { id:'stretching',   name:'Stretching',        icon:'🤸', color:'#00BCD4' },
      { id:'tai_chi',      name:'Tai Chi',           icon:'☯️', color:'#8B5CF6' },
      { id:'breathwork',   name:'Breathwork',        icon:'💨', color:'#A5B4FC' },
      { id:'foam_rolling', name:'Foam Rolling',      icon:'🔵', color:'#7C3AED' },
      { id:'mobility',     name:'Mobility',          icon:'🦾', color:'#6D28D9' },
    ]
  },
  {
    category: 'Combat Sports',
    sports: [
      { id:'boxing',       name:'Boxing',            icon:'🥊', color:'#E05252' },
      { id:'muay_thai',    name:'Muay Thai',         icon:'🥊', color:'#DC2626' },
      { id:'mma',          name:'MMA',               icon:'🥋', color:'#B91C1C' },
      { id:'martial',      name:'Martial Arts',      icon:'🥋', color:'#2D3436' },
      { id:'bjj',          name:'Brazilian Jiu-Jitsu',icon:'🥋',color:'#1E40AF' },
      { id:'wrestling',    name:'Wrestling',         icon:'🤼', color:'#B45309' },
      { id:'judo',         name:'Judo',              icon:'🥋', color:'#92400E' },
      { id:'kickboxing',   name:'Kickboxing',        icon:'🦵', color:'#EF4444' },
      { id:'karate',       name:'Karate',            icon:'🥋', color:'#F97316' },
      { id:'taekwondo',    name:'Taekwondo',         icon:'🦵', color:'#3B82F6' },
    ]
  },
  {
    category: 'Racquet Sports',
    sports: [
      { id:'tennis',       name:'Tennis',            icon:'🎾', color:'#F1C40F' },
      { id:'badminton',    name:'Badminton',         icon:'🏸', color:'#FBBF24' },
      { id:'squash',       name:'Squash',            icon:'🎾', color:'#D97706' },
      { id:'pickleball',   name:'Pickleball',        icon:'🏓', color:'#F59E0B' },
      { id:'tableTennis',  name:'Table Tennis',      icon:'🏓', color:'#EF4444' },
      { id:'padel',        name:'Padel',             icon:'🎾', color:'#F97316' },
    ]
  },
  {
    category: 'Team Sports',
    sports: [
      { id:'football',     name:'Football / Soccer', icon:'⚽', color:'#27AE60' },
      { id:'basketball',   name:'Basketball',        icon:'🏀', color:'#E67E22' },
      { id:'volleyball',   name:'Volleyball',        icon:'🏐', color:'#F59E0B' },
      { id:'rugby',        name:'Rugby',             icon:'🏉', color:'#92400E' },
      { id:'hockey',       name:'Field Hockey',      icon:'🏑', color:'#065F46' },
      { id:'handball',     name:'Handball',          icon:'🤾', color:'#DC2626' },
      { id:'baseball',     name:'Baseball',          icon:'⚾', color:'#1D4ED8' },
      { id:'cricket',      name:'Cricket',           icon:'🏏', color:'#6B7280' },
      { id:'lacrosse',     name:'Lacrosse',          icon:'🥍', color:'#7C3AED' },
      { id:'futsal',       name:'Futsal',            icon:'⚽', color:'#10B981' },
    ]
  },
  {
    category: 'Outdoor & Adventure',
    sports: [
      { id:'hiking',       name:'Hiking',            icon:'🥾', color:'#92400E' },
      { id:'rockClimbing', name:'Rock Climbing',     icon:'🧗', color:'#78716C' },
      { id:'trailRunning', name:'Trail Running',     icon:'🏔️', color:'#6B7280' },
      { id:'triathlon',    name:'Triathlon',         icon:'🏅', color:'#0EA5E9' },
      { id:'mountainBike', name:'Mountain Biking',   icon:'🚵', color:'#78350F' },
      { id:'skiing',       name:'Skiing',            icon:'⛷️', color:'#E0F2FE' },
      { id:'snowboard',    name:'Snowboarding',      icon:'🏂', color:'#BAE6FD' },
      { id:'skateboard',   name:'Skateboarding',     icon:'🛹', color:'#6B7280' },
      { id:'surfing_out',  name:'SUP / Paddleboard', icon:'🏄', color:'#38BDF8' },
      { id:'paragliding',  name:'Paragliding',       icon:'🪂', color:'#818CF8' },
    ]
  },
  {
    category: 'Dance & Performing',
    sports: [
      { id:'dance',        name:'Dance',             icon:'💃', color:'#EC4899' },
      { id:'zumba',        name:'Zumba',             icon:'🎵', color:'#F43F5E' },
      { id:'hiphop',       name:'Hip Hop Dance',     icon:'🎤', color:'#8B5CF6' },
      { id:'ballet',       name:'Ballet',            icon:'🩰', color:'#FCA5A5' },
      { id:'contemporary', name:'Contemporary',      icon:'🎭', color:'#C084FC' },
      { id:'salsa',        name:'Salsa',             icon:'🌶️', color:'#EF4444' },
    ]
  },
  {
    category: 'Precision & Skill',
    sports: [
      { id:'golf',         name:'Golf',              icon:'⛳', color:'#2ECC71' },
      { id:'archery',      name:'Archery',           icon:'🏹', color:'#92400E' },
      { id:'fencing',      name:'Fencing',           icon:'🤺', color:'#6B7280' },
      { id:'shooting',     name:'Target Shooting',   icon:'🎯', color:'#374151' },
      { id:'bowling',      name:'Bowling',           icon:'🎳', color:'#6B7280' },
      { id:'darts',        name:'Darts',             icon:'🎯', color:'#1F2937' },
    ]
  },
  {
    category: 'Gymnastics & Acrobatics',
    sports: [
      { id:'gymnastics',   name:'Gymnastics',        icon:'🤸', color:'#9B59B6' },
      { id:'aerobics',     name:'Aerobics',          icon:'🏃', color:'#EC4899' },
      { id:'trampoline',   name:'Trampoline',        icon:'⬆️', color:'#F59E0B' },
      { id:'parkour',      name:'Parkour',           icon:'🏃', color:'#374151' },
      { id:'cheerleading', name:'Cheerleading',      icon:'📣', color:'#EC4899' },
    ]
  },
  {
    category: 'Equestrian & Animals',
    sports: [
      { id:'horseRiding',  name:'Horse Riding',      icon:'🐴', color:'#92400E' },
      { id:'polo',         name:'Polo',              icon:'🏇', color:'#78350F' },
    ]
  },
]

// Flat SPORTS array for compatibility
export const SPORTS = SPORTS_CATEGORIES.flatMap(cat => cat.sports)

export const LEVEL_COLOR = {
  Beginner:     '#2ECC71',
  Intermediate: '#F5A623',
  Advanced:     '#E05252',
}

// ─────────────────────────────────────────────
// Library workouts
// ─────────────────────────────────────────────
export const LIBRARY_WORKOUTS = [
  // GYM
  { id:'push_day',     sport:'gym',         name:'Push Day',           icon:'💪', level:'Intermediate', duration:'45–60 min', muscles:'Chest · Shoulders · Triceps',     description:'Classic push day targeting chest, shoulders and triceps.',           exercises:['Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Tricep Pushdown'] },
  { id:'pull_day',     sport:'gym',         name:'Pull Day',           icon:'🔙', level:'Intermediate', duration:'45–60 min', muscles:'Back · Biceps · Rear Delts',      description:'Full back and bicep development with compound and isolation moves.',   exercises:['Pull Ups','Bent Over Row','Lat Pulldown','Seated Cable Row','Bicep Curl','Face Pull'] },
  { id:'leg_day',      sport:'gym',         name:'Leg Day',            icon:'🦵', level:'Intermediate', duration:'50–65 min', muscles:'Quads · Hamstrings · Glutes',     description:'Complete lower body session. The workout everyone skips.',            exercises:['Squat','Romanian Deadlift','Leg Press','Lunges','Hip Thrust','Calf Raises'] },
  { id:'full_body',    sport:'gym',         name:'Full Body',          icon:'🏋️', level:'Beginner',     duration:'50–70 min', muscles:'All muscle groups',                description:'Efficient full body workout. Great for 2–3x per week training.',      exercises:['Squat','Bench Press','Bent Over Row','Overhead Press','Romanian Deadlift','Plank'] },
  { id:'upper_body',   sport:'gym',         name:'Upper Body',         icon:'💪', level:'Beginner',     duration:'40–55 min', muscles:'Chest · Back · Shoulders · Arms',  description:'Complete upper body session.',                                        exercises:['Bench Press','Bent Over Row','Overhead Press','Lateral Raise','Bicep Curl','Tricep Pushdown'] },
  { id:'core_blast',   sport:'gym',         name:'Core Blast',         icon:'🧘', level:'Beginner',     duration:'20–30 min', muscles:'Core · Abs · Obliques',            description:'High-intensity core session.',                                        exercises:['Plank','Crunches','Leg Raises','Russian Twist','Mountain Climbers'] },
  // CROSSFIT
  { id:'wod_classic',  sport:'crossfit',    name:'Classic WOD',        icon:'🔥', level:'Advanced',     duration:'20 min',    muscles:'Full Body',                        description:'CrossFit-style workout of the day. Go hard.',                        exercises:['Burpee','Kettlebell Swing','Box Jump','Thruster','Wall Ball'] },
  { id:'wod_beginner', sport:'crossfit',    name:'Beginner WOD',       icon:'🔥', level:'Beginner',     duration:'20 min',    muscles:'Full Body',                        description:'Introduction to CrossFit-style training.',                           exercises:['Burpee','Jump Squat','Mountain Climbers','Jumping Jacks'] },
  // CALISTHENICS
  { id:'cali_basics',  sport:'calisthenics',name:'Calisthenics Basics',icon:'💪', level:'Beginner',     duration:'35 min',    muscles:'Full Body, Bodyweight',            description:'Master your bodyweight with fundamental movements.',                 exercises:['Push Ups','Pull Ups','Squat','Dips','Plank'] },
  { id:'cali_advanced',sport:'calisthenics',name:'Advanced Skills',    icon:'💪', level:'Advanced',     duration:'40 min',    muscles:'Full Body Strength',               description:'Elite calisthenics requiring exceptional strength and balance.',     exercises:['Handstand Hold','L-Sit','Pistol Squat','Pull Ups','Dips'] },
  // KETTLEBELL
  { id:'kb_beginner',  sport:'kettlebell',  name:'KB Foundations',     icon:'🔔', level:'Beginner',     duration:'30 min',    muscles:'Full Body',                        description:'Learn the fundamental kettlebell movements safely.',                 exercises:['Kettlebell Swing','Goblet Squat','Kettlebell Clean'] },
  { id:'kb_power',     sport:'kettlebell',  name:'KB Power Circuit',   icon:'🔔', level:'Intermediate', duration:'35 min',    muscles:'Full Body, Power',                 description:'Build explosive power with a kettlebell circuit.',                   exercises:['Kettlebell Swing','Turkish Get Up','Kettlebell Clean','Goblet Squat'] },
  // FUNCTIONAL
  { id:'functional1',  sport:'functional',  name:'Functional Fitness', icon:'⚙️', level:'Intermediate', duration:'40 min',    muscles:'Full Body',                        description:'Real-world movement patterns for everyday strength.',                exercises:['Farmer\'s Carry','Battle Ropes','Medicine Ball Slam','Burpee','Squat'] },
  // RUNNING
  { id:'run_easy',     sport:'running',     name:'Easy Run',           icon:'🏃', level:'Beginner',     duration:'30 min',    muscles:'Legs, Cardiovascular',             description:'Comfortable paced run to build aerobic base.',                      exercises:['Running'] },
  { id:'run_interval', sport:'running',     name:'Interval Training',  icon:'🏃', level:'Intermediate', duration:'40 min',    muscles:'Speed, Endurance',                 description:'Sprint and recovery intervals to build speed.',                      exercises:['Running','High Knees','Walking'] },
  { id:'run_long',     sport:'running',     name:'Long Run',           icon:'🏃', level:'Intermediate', duration:'60–90 min', muscles:'Legs, Endurance',                  description:'Build your aerobic base and mental toughness.',                      exercises:['Running','Walking'] },
  { id:'run_5k',       sport:'running',     name:'5K Training',        icon:'🏃', level:'Beginner',     duration:'25–35 min', muscles:'Legs, Cardiovascular',             description:'Build up to running 5km without stopping.',                         exercises:['Running','Walking'] },
  // WALKING
  { id:'walk_power',   sport:'walking',     name:'Power Walk',         icon:'🚶', level:'Beginner',     duration:'45 min',    muscles:'Legs, Cardiovascular',             description:'Brisk walking for cardio and fat burn.',                            exercises:['Walking'] },
  { id:'walk_hiit',    sport:'walking',     name:'Walk-Run Intervals', icon:'🚶', level:'Beginner',     duration:'30 min',    muscles:'Legs, Cardio',                     description:'Alternate walking and jogging for beginners.',                      exercises:['Walking','Running'] },
  // CYCLING
  { id:'cycle_endur',  sport:'cycling',     name:'Endurance Ride',     icon:'🚴', level:'Beginner',     duration:'45 min',    muscles:'Legs, Cardiovascular',             description:'Steady-state cycling for aerobic endurance.',                        exercises:['Cycling'] },
  { id:'cycle_hiit',   sport:'cycling',     name:'Cycling Intervals',  icon:'🚴', level:'Intermediate', duration:'30 min',    muscles:'Legs, Cardio',                     description:'High and low intensity cycling intervals.',                          exercises:['Cycling'] },
  // HIIT
  { id:'hiit_20',      sport:'hiit',        name:'20-Min HIIT',        icon:'⚡', level:'Intermediate', duration:'20 min',    muscles:'Full Body',                        description:'Maximum calorie burn in minimum time.',                              exercises:['HIIT','Mountain Climbers','Jump Rope','High Knees'] },
  { id:'hiit_tabata',  sport:'hiit',        name:'Tabata Protocol',    icon:'⚡', level:'Advanced',     duration:'16 min',    muscles:'Full Body',                        description:'20 sec on, 10 sec off. 8 rounds per exercise.',                     exercises:['Jump Squat','Burpee','Mountain Climbers','High Knees','Jumping Jacks'] },
  { id:'hiit_beginner',sport:'hiit',        name:'HIIT for Beginners', icon:'⚡', level:'Beginner',     duration:'15 min',    muscles:'Full Body',                        description:'Introduction to high intensity training. Work at your own pace.',   exercises:['Jumping Jacks','High Knees','Jump Squat','Mountain Climbers'] },
  // JUMP ROPE
  { id:'rope_basics',  sport:'jumpRope',    name:'Jump Rope Basics',   icon:'🪢', level:'Beginner',     duration:'20 min',    muscles:'Full Body, Calves',                description:'Master the fundamentals of jump rope training.',                    exercises:['Jump Rope'] },
  { id:'rope_hiit',    sport:'jumpRope',    name:'Jump Rope HIIT',     icon:'🪢', level:'Intermediate', duration:'20 min',    muscles:'Full Body, Cardio',                description:'Jump rope intervals for maximum conditioning.',                     exercises:['Jump Rope','Jumping Jacks','High Knees'] },
  // SWIMMING
  { id:'swim_laps',    sport:'swimming',    name:'Lap Swimming',       icon:'🏊', level:'Beginner',     duration:'30 min',    muscles:'Full Body, Low Impact',            description:'Low-impact full body cardio.',                                       exercises:['Swimming'] },
  { id:'swim_endur',   sport:'swimming',    name:'Endurance Swim',     icon:'🏊', level:'Intermediate', duration:'45 min',    muscles:'Full Body, Endurance',             description:'Build swimming stamina with longer sets.',                           exercises:['Swimming'] },
  // ROWING
  { id:'row_endur',    sport:'rowing',      name:'Rowing Endurance',   icon:'🚣', level:'Intermediate', duration:'30 min',    muscles:'Full Body, Back',                  description:'Sustained rowing for full body conditioning.',                       exercises:['Rowing Machine'] },
  { id:'row_power',    sport:'rowing',      name:'Rowing Power',       icon:'🚣', level:'Advanced',     duration:'25 min',    muscles:'Full Body, Power',                 description:'High intensity rowing intervals.',                                   exercises:['Rowing Machine'] },
  // YOGA
  { id:'yoga_morning', sport:'yoga',        name:'Morning Flow',       icon:'🌅', level:'Beginner',     duration:'20 min',    muscles:'Full Body, Flexibility',           description:'Energising morning yoga routine.',                                   exercises:['Sun Salutation','Warrior Pose','Downward Dog','Child\'s Pose'] },
  { id:'yoga_yin',     sport:'yoga',        name:'Yin Yoga',           icon:'🧘', level:'Beginner',     duration:'45 min',    muscles:'Deep Tissue, Flexibility',         description:'Long-held passive poses for deep flexibility.',                      exercises:['Child\'s Pose','Pigeon Pose','Downward Dog'] },
  { id:'yoga_power',   sport:'yoga',        name:'Power Yoga',         icon:'🧘', level:'Intermediate', duration:'45 min',    muscles:'Strength, Flexibility',            description:'Dynamic, flowing yoga that builds strength.',                        exercises:['Sun Salutation','Warrior Pose','Downward Dog','Plank'] },
  // PILATES
  { id:'pilates_core', sport:'pilates',     name:'Core Pilates',       icon:'🧘', level:'Beginner',     duration:'30 min',    muscles:'Core, Spine, Posture',             description:'Low-impact Pilates for core strength and body awareness.',           exercises:['The Hundred','Roll Up','Plank'] },
  { id:'pilates_full', sport:'pilates',     name:'Full Body Pilates',  icon:'🧘', level:'Intermediate', duration:'45 min',    muscles:'Full Body, Core',                  description:'Complete Pilates session targeting all muscle groups.',              exercises:['The Hundred','Roll Up','Plank','Leg Raises'] },
  // STRETCHING
  { id:'stretch_full', sport:'stretching',  name:'Full Body Stretch',  icon:'🤸', level:'Beginner',     duration:'20 min',    muscles:'Full Body Flexibility',            description:'Complete stretching routine to reduce soreness.',                    exercises:['Hamstring Stretch','Hip Flexor Stretch','Chest Opener','Pigeon Pose','Child\'s Pose'] },
  { id:'stretch_post', sport:'stretching',  name:'Post-Workout Stretch',icon:'🤸',level:'Beginner',     duration:'15 min',    muscles:'Muscles Worked',                   description:'Cool down and stretch after any workout.',                           exercises:['Hamstring Stretch','Chest Opener','Pigeon Pose'] },
  // BOXING
  { id:'box_basics',   sport:'boxing',      name:'Boxing Basics',      icon:'🥊', level:'Beginner',     duration:'30 min',    muscles:'Full Body, Cardio',                description:'Learn fundamental punches and footwork.',                           exercises:['Shadow Boxing','Jab-Cross'] },
  { id:'box_advanced', sport:'boxing',      name:'Boxing Conditioning', icon:'🥊',level:'Advanced',     duration:'45 min',    muscles:'Full Body, Power',                 description:'Heavy bag work and combinations for serious boxers.',               exercises:['Heavy Bag','Shadow Boxing','Jab-Cross','Jump Rope'] },
  // MUAY THAI
  { id:'muay_basics',  sport:'muay_thai',   name:'Muay Thai Basics',   icon:'🥊', level:'Beginner',     duration:'30 min',    muscles:'Full Body, Kicks',                 description:'Introduction to the Art of Eight Limbs.',                           exercises:['Shadow Boxing','Roundhouse Kick','Jab-Cross'] },
  // MARTIAL ARTS
  { id:'martial1',     sport:'martial',     name:'Martial Arts Basics', icon:'🥋',level:'Beginner',     duration:'30 min',    muscles:'Full Body',                        description:'Fundamentals covering stances, punches and kicks.',                 exercises:['Shadow Boxing','Jab-Cross','Roundhouse Kick','Kata Practice'] },
  // MMA
  { id:'mma_cond',     sport:'mma',         name:'MMA Conditioning',   icon:'🥋', level:'Advanced',     duration:'45 min',    muscles:'Full Body, Power, Cardio',         description:'Mixed martial arts conditioning circuit.',                           exercises:['Burpee','Shadow Boxing','Roundhouse Kick','Battle Ropes','Mountain Climbers'] },
  // TENNIS
  { id:'tennis_cond',  sport:'tennis',      name:'Tennis Conditioning', icon:'🎾',level:'Intermediate', duration:'35 min',    muscles:'Agility, Shoulder, Core',          description:'Footwork and strength for tennis players.',                         exercises:['Tennis Forehand','High Knees','Lateral Raise','Plank'] },
  // BADMINTON
  { id:'badminton1',   sport:'badminton',   name:'Badminton Training',  icon:'🏸',level:'Beginner',     duration:'30 min',    muscles:'Shoulder, Legs, Agility',          description:'Build smash power and court movement.',                             exercises:['Badminton Smash','High Knees','Jumping Jacks'] },
  // FOOTBALL / SOCCER
  { id:'football_fit', sport:'football',    name:'Football Fitness',    icon:'⚽',level:'Intermediate', duration:'40 min',    muscles:'Speed, Legs, Agility',             description:'Sprint and conditioning drills for football players.',              exercises:['Football Sprint','High Knees','Jump Squat','Plank'] },
  // BASKETBALL
  { id:'bball_cond',   sport:'basketball',  name:'Basketball Conditioning',icon:'🏀',level:'Intermediate',duration:'35 min', muscles:'Legs, Agility, Cardio',            description:'Agility and conditioning for basketball players.',                  exercises:['Basketball Dribbling','Jump Squat','High Knees','Plank'] },
  // VOLLEYBALL
  { id:'volley_cond',  sport:'volleyball',  name:'Volleyball Training', icon:'🏐',level:'Intermediate', duration:'35 min',    muscles:'Legs, Shoulder, Jump',             description:'Jump training and shoulder power for volleyball.',                  exercises:['Volleyball Spike','Jump Squat','Lateral Raise','Plank'] },
  // GOLF
  { id:'golf_fitness', sport:'golf',        name:'Golf Fitness',        icon:'⛳',level:'Beginner',     duration:'30 min',    muscles:'Core, Rotation, Stability',        description:'Core strength and rotation for a better golf swing.',               exercises:['Golf Swing','Russian Twist','Plank','Hip Flexor Stretch'] },
  // DANCE
  { id:'dance_zumba',  sport:'dance',       name:'Zumba Flow',          icon:'💃',level:'Beginner',     duration:'45 min',    muscles:'Full Body, Coordination',          description:'Dance your way to fitness. No experience needed.',                  exercises:['Zumba Basic Step','Jumping Jacks'] },
  { id:'hiphop1',      sport:'hiphop',      name:'Hip Hop Dance',       icon:'🎤',level:'Beginner',     duration:'40 min',    muscles:'Full Body, Coordination',          description:'Fun cardio through hip hop movement.',                              exercises:['Zumba Basic Step','High Knees','Jumping Jacks'] },
  // GYMNASTICS
  { id:'gymn_basics',  sport:'gymnastics',  name:'Gymnastics Basics',   icon:'🤸',level:'Beginner',     duration:'30 min',    muscles:'Full Body, Coordination',          description:'Fundamental gymnastics skills for beginners.',                      exercises:['Cartwheel','Handstand Hold','Plank','Push Ups'] },
  // HIKING
  { id:'hike_prep',    sport:'hiking',      name:'Hiking Prep',         icon:'🥾',level:'Beginner',     duration:'40 min',    muscles:'Legs, Core, Endurance',            description:'Build leg strength and endurance for hiking.',                      exercises:['Walking','Lunges','Calf Raises','Hip Flexor Stretch'] },
  { id:'hike_strength',sport:'hiking',      name:'Hiker\'s Strength',   icon:'🥾',level:'Intermediate', duration:'45 min',    muscles:'Legs, Back, Core',                 description:'Functional strength for the trails.',                               exercises:['Squat','Romanian Deadlift','Calf Raises','Plank','Farmer\'s Carry'] },
  // ROCK CLIMBING
  { id:'climb_cond',   sport:'rockClimbing',name:'Climbing Conditioning',icon:'🧗',level:'Intermediate', duration:'45 min',   muscles:'Grip, Back, Core',                 description:'Upper body and grip strength for rock climbing.',                   exercises:['Pull Ups','Deadlift','Plank','Farmer\'s Carry','Calf Raises'] },
  // TRIATHLON
  { id:'tri_cond',     sport:'triathlon',   name:'Triathlon Training',  icon:'🏅',level:'Advanced',     duration:'60 min',    muscles:'Full Body, Endurance',             description:'Combined swim, bike, run conditioning.',                            exercises:['Swimming','Cycling','Running'] },
  // POWERLIFTING
  { id:'pl_beginner',  sport:'powerlifting',name:'Powerlifting Basics', icon:'💪',level:'Beginner',     duration:'60 min',    muscles:'Full Body, Strength',              description:'The three big lifts: squat, bench, deadlift.',                     exercises:['Squat','Bench Press','Deadlift'] },
  { id:'pl_advanced',  sport:'powerlifting',name:'Powerlifting Peak',   icon:'💪',level:'Advanced',     duration:'75 min',    muscles:'Full Body, Max Strength',          description:'Peak strength phase for competitive powerlifting.',                 exercises:['Squat','Bench Press','Deadlift','Romanian Deadlift','Plank'] },
  // BODYBUILDING
  { id:'bb_chest',     sport:'bodybuilding',name:'Chest Hypertrophy',   icon:'🦾',level:'Intermediate', duration:'50 min',    muscles:'Chest, Triceps',                   description:'High volume chest workout for muscle growth.',                      exercises:['Bench Press','Incline Bench Press','Chest Fly','Cable Crossover','Dips'] },
  { id:'bb_back',      sport:'bodybuilding',name:'Back Thickness',      icon:'🦾',level:'Intermediate', duration:'55 min',    muscles:'Back, Lats, Biceps',               description:'Width and thickness for a V-taper physique.',                       exercises:['Pull Ups','Deadlift','Bent Over Row','Lat Pulldown','Seated Cable Row'] },
]

export function getExercise(name) {
  return { name, ...(EXERCISES[name] || { icon:'💪', muscles:'', category:'General', howTo:[], tips:'', timed:false }) }
}
