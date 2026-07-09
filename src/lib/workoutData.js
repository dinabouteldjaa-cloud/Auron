// ─────────────────────────────────────────────────────────────
// workoutData.js — Comprehensive workout data
// ─────────────────────────────────────────────────────────────

export const EXERCISES = {
  'Bench Press':         { icon:'🏋️', muscles:'Chest, Triceps, Shoulders', category:'Chest', howTo:['Lie flat, feet on floor','Grip bar slightly wider than shoulders','Lower to mid-chest with control','Press up explosively'], tips:"Never bounce the bar off your chest." },
  'Incline Bench Press': { icon:'🏋️', muscles:'Upper Chest, Shoulders',    category:'Chest', howTo:['Set bench to 30-45 degrees','Lower bar to upper chest','Press up and slightly back'], tips:'Over 45 degrees shifts load to shoulders.' },
  'Push Ups':            { icon:'💪', muscles:'Chest, Triceps, Core',       category:'Chest', howTo:['Start in plank, hands wider than shoulders','Keep body straight','Lower chest to floor','Push back up'], tips:"Don't let hips sag." },
  'Chest Fly':           { icon:'🦋', muscles:'Chest',                       category:'Chest', howTo:['Lie on bench with dumbbells above chest','Lower arms wide in arc','Squeeze chest to bring back'], tips:'Focus on the stretch at the bottom.' },
  'Dips':                { icon:'💪', muscles:'Chest, Triceps',              category:'Chest', howTo:['Grip parallel bars','Lean forward for chest focus','Lower until arms parallel','Push back up'], tips:'Lean forward = chest, upright = triceps.' },
  'Cable Crossover':     { icon:'🦋', muscles:'Chest',                       category:'Chest', howTo:['Set cables high, stand centre','Pull handles together in front','Squeeze at peak contraction'], tips:'Great finisher exercise.' },
  'Pull Ups':            { icon:'💪', muscles:'Lats, Biceps',                category:'Back',  howTo:['Hang with overhand grip','Pull shoulder blades down first','Chin above bar','Lower fully'], tips:'Full range of motion is key.' },
  'Deadlift':            { icon:'🏋️', muscles:'Full Back, Hamstrings, Glutes',category:'Back', howTo:['Bar over mid-foot','Hinge at hips, grip outside legs','Chest up, brace core','Drive through floor','Lock out hips at top'], tips:"Never round the lower back." },
  'Bent Over Row':       { icon:'🏋️', muscles:'Back, Biceps',                category:'Back',  howTo:['Hinge forward, back flat','Pull bar to lower chest','Squeeze shoulder blades'], tips:'Keep back flat throughout.' },
  'Lat Pulldown':        { icon:'💪', muscles:'Lats, Biceps',                category:'Back',  howTo:['Grip bar wide, sit upright','Pull to upper chest','Slow return'], tips:'Imagine pulling elbows to back pockets.' },
  'Seated Cable Row':    { icon:'🚣', muscles:'Mid Back',                    category:'Back',  howTo:['Sit upright, feet on platform','Pull to abdomen','Squeeze blades at peak'], tips:"Don't use momentum." },
  'Face Pull':           { icon:'💪', muscles:'Rear Delts, Upper Back',      category:'Back',  howTo:['Cable at face height','Pull rope to face','Elbows high and wide','External rotate at end'], tips:'Great for shoulder health.' },
  'Squat':               { icon:'🏋️', muscles:'Quads, Glutes, Hamstrings',  category:'Legs',  howTo:['Bar on traps, feet shoulder-width','Brace core','Push knees out, sit back','Thighs parallel or below','Drive through floor'], tips:'Knees track over toes.' },
  'Romanian Deadlift':   { icon:'🏋️', muscles:'Hamstrings, Glutes',          category:'Legs',  howTo:['Hold bar, push hips back','Lower bar along legs','Feel hamstring stretch','Drive hips forward'], tips:'Hip hinge, not a squat.' },
  'Leg Press':           { icon:'🦵', muscles:'Quads, Glutes',               category:'Legs',  howTo:['Feet shoulder-width on platform','Lower until 90 degrees','Press without locking knees'], tips:'Higher feet = more glutes.' },
  'Lunges':              { icon:'🦵', muscles:'Quads, Glutes',               category:'Legs',  howTo:['Step forward','Lower back knee to floor','Front knee over ankle','Push back up'], tips:'Long stride = glutes, short = quads.' },
  'Hip Thrust':          { icon:'🦵', muscles:'Glutes, Hamstrings',          category:'Legs',  howTo:['Upper back on bench, bar on hips','Drive hips up','Squeeze glutes at top'], tips:'Best glute exercise there is.' },
  'Calf Raises':         { icon:'🦵', muscles:'Calves',                      category:'Legs',  howTo:['Rise onto balls of feet','Hold peak 1 second','Lower below step'], tips:'Use full range, high reps.' },
  'Overhead Press':      { icon:'🏋️', muscles:'Shoulders, Triceps',          category:'Shoulders', howTo:['Bar at shoulders','Press straight up','Lock out at top'], tips:'Brace core throughout.' },
  'Lateral Raise':       { icon:'💪', muscles:'Side Delts',                  category:'Shoulders', howTo:['Raise arms to sides','Parallel to floor','Pinky slightly higher'], tips:'Go lighter than you think.' },
  'Arnold Press':        { icon:'🏋️', muscles:'All Deltoid Heads',           category:'Shoulders', howTo:['Palms facing you at shoulder height','Press up, rotate palms out','Reverse on the way down'], tips:'Hits all three delt heads.' },
  'Bicep Curl':          { icon:'💪', muscles:'Biceps',                      category:'Arms',  howTo:['Arms fully extended','Curl to shoulders','Squeeze at top','Lower fully'], tips:"Don't swing." },
  'Hammer Curl':         { icon:'💪', muscles:'Biceps, Forearms',            category:'Arms',  howTo:['Neutral grip (thumbs up)','Curl without rotating wrist'], tips:'Builds arm thickness.' },
  'Tricep Pushdown':     { icon:'💪', muscles:'Triceps',                     category:'Arms',  howTo:['Elbows fixed at sides','Push down to full extension','Squeeze triceps'], tips:"Don't let elbows flare." },
  'Skull Crushers':      { icon:'🏋️', muscles:'Triceps',                     category:'Arms',  howTo:['Lie on bench, bar above chest','Lower to forehead','Extend back up'], tips:'Only forearms move.' },
  'Plank':               { icon:'🧘', muscles:'Core, Shoulders', timed:true, category:'Core',  howTo:['Forearms on floor','Straight line head to heels','Squeeze core and glutes'], tips:'Quality over duration.' },
  'Crunches':            { icon:'💪', muscles:'Abs',                         category:'Core',  howTo:['Knees bent, hands behind head','Curl shoulders off floor','Slow lower'], tips:'Short range is intentional.' },
  'Leg Raises':          { icon:'🦵', muscles:'Lower Abs',                   category:'Core',  howTo:['Lie flat','Raise legs to 90 degrees','Lower slowly without touching floor'], tips:'Slower = harder.' },
  'Russian Twist':       { icon:'🔄', muscles:'Obliques',                    category:'Core',  howTo:['Feet off floor, lean back','Rotate side to side'], tips:'Control the movement.' },
  'Mountain Climbers':   { icon:'🏔️', muscles:'Core, Cardio', timed:true,    category:'Core',  howTo:['Push-up position','Drive knees to chest alternately'], tips:'Fast = cardio, slow = core.' },
  'Running':             { icon:'🏃', muscles:'Full Body', timed:true,       category:'Running', howTo:['Warm up 5 min','Land midfoot','Arms at 90 degrees','Breathe rhythmically'], tips:'Conversational pace for aerobic base.' },
  'Cycling':             { icon:'🚴', muscles:'Quads, Hamstrings, Glutes', timed:true, category:'Cycling', howTo:['Seat height: slight bend at bottom','80-100 RPM cadence','Core engaged'], tips:'Higher cadence, lower resistance is joint-friendly.' },
  'Jump Rope':           { icon:'🪢', muscles:'Full Body, Calves', timed:true, category:'Cardio', howTo:['Hold handles at hip height','Stay on balls of feet','Small efficient jumps'], tips:'Burns ~10 kcal/min.' },
  'Swimming':            { icon:'🏊', muscles:'Full Body', timed:true,       category:'Swimming', howTo:['Warm up easy laps','Focus on long smooth strokes','Breathe every 2-3 strokes'], tips:'Zero joint impact.' },
  'HIIT':                { icon:'⚡', muscles:'Full Body', timed:true,       category:'HIIT',  howTo:['Warm up 5 min','90%+ effort 20-40 sec','Rest 10-20 sec','8-20 rounds'], tips:'True HIIT means maximum effort.' },
  'Walking':             { icon:'🚶', muscles:'Legs, Cardio', timed:true,    category:'Walking', howTo:['Head up, shoulders back','Swing arms naturally','Push off with toes','Aim for 5-6 km/h'], tips:'10,000 steps is around 400-500 kcal.' },
  'Rowing Machine':      { icon:'🚣', muscles:'Full Body, Back', timed:true, category:'Rowing', howTo:['Legs drive first','Then lean back','Then pull arms','Reverse sequence'], tips:'Legs 60%, back 20%, arms 20%.' },
  'Burpee':              { icon:'⚡', muscles:'Full Body', timed:true,       category:'CrossFit', howTo:['Drop hands to floor','Jump feet back','Push up optional','Jump feet forward','Jump up arms overhead'], tips:'Maintain steady pace.' },
  'Kettlebell Swing':    { icon:'🔔', muscles:'Glutes, Hamstrings, Core',    category:'CrossFit', howTo:['Hinge at hips','Swing between legs','Drive hips forward','Bell to chest height'], tips:'Power comes from hips.' },
  'Box Jump':            { icon:'📦', muscles:'Quads, Glutes, Power',        category:'CrossFit', howTo:['Stand facing box','Swing arms, bend knees','Explode upward','Land softly'], tips:'Land quietly = good form.' },
  'Thruster':            { icon:'🏋️', muscles:'Full Body',                   category:'CrossFit', howTo:['Bar at shoulders','Squat to parallel','Drive up explosively','Press overhead'], tips:'Squat and press are one movement.' },
  'Wall Ball':           { icon:'🏀', muscles:'Full Body', timed:true,       category:'CrossFit', howTo:['Squat with ball at chest','Explode up','Throw to wall target','Catch, squat immediately'], tips:'Keep chest up in squat.' },
  'Sun Salutation':      { icon:'🌅', muscles:'Full Body, Flexibility', timed:true, category:'Yoga', howTo:['Arms overhead inhale','Forward fold exhale','Plank','Upward dog inhale','Downward dog exhale','Step forward, rise'], tips:'Move with your breath.' },
  'Warrior Pose':        { icon:'⚔️', muscles:'Legs, Hips, Balance', timed:true, category:'Yoga', howTo:['Lunge forward','Front knee 90 degrees','Arms raised overhead','Hold 30-60 sec each side'], tips:'Focus on stability and breath.' },
  "Child's Pose":        { icon:'🧘', muscles:'Back, Hips', timed:true,     category:'Yoga', howTo:['Kneel, toes touching','Sit back on heels','Fold forward, arms extended'], tips:'Use any time as a rest pose.' },
  'Downward Dog':        { icon:'🧘', muscles:'Hamstrings, Calves, Shoulders', timed:true, category:'Yoga', howTo:['Hands and feet on floor','Lift hips up and back','Press heels toward floor'], tips:'Bend knees if hamstrings are tight.' },
  'The Hundred':         { icon:'🧘', muscles:'Core, Breathing', timed:true, category:'Pilates', howTo:['Legs in tabletop','Lift head and shoulders','Pump arms 100 times','Inhale 5, exhale 5'], tips:'Lower back pressed into mat.' },
  'Roll Up':             { icon:'🧘', muscles:'Abs, Spine',                  category:'Pilates', howTo:['Lie flat, arms overhead','Peel spine off mat slowly','Reach for toes','Roll down with control'], tips:'Spine articulation, not a sit-up.' },
  'Jab-Cross':           { icon:'🥊', muscles:'Shoulders, Core', timed:true, category:'Boxing', howTo:['Boxing stance','Jab: quick lead hand','Cross: powerful rear hand with hip rotation','Return to guard'], tips:'Power comes from rotation.' },
  'Shadow Boxing':       { icon:'🥊', muscles:'Full Body, Cardio', timed:true, category:'Boxing', howTo:['Move constantly on balls of feet','Mix jabs, crosses, hooks, uppercuts','Add footwork and head movement'], tips:'3-min rounds, 1-min rest.' },
  'Heavy Bag':           { icon:'🥊', muscles:'Full Body, Power', timed:true, category:'Boxing', howTo:['Wrap hands first','Use proper stance','Throw combinations','Keep guard up between punches'], tips:'Focus on technique, not just power.' },
  'Hamstring Stretch':   { icon:'🤸', muscles:'Hamstrings', timed:true,      category:'Stretching', howTo:['Sit or lie down','Bring one leg up','Keep knee straight','Hold 30-60 sec each side'], tips:'Never force the stretch.' },
  'Hip Flexor Stretch':  { icon:'🤸', muscles:'Hip Flexors', timed:true,    category:'Stretching', howTo:['Kneel one knee on floor','Shift hips forward','Keep torso upright'], tips:'Great after sitting or leg day.' },
  'Pigeon Pose':         { icon:'🕊️', muscles:'Hips, IT Band', timed:true,   category:'Stretching', howTo:['From downward dog','Knee forward behind wrist','Extend other leg back','Hold 1-2 min each side'], tips:'One of the best hip openers.' },
  'Chest Opener':        { icon:'🤸', muscles:'Chest, Posture', timed:true,  category:'Stretching', howTo:['Clasp hands behind back','Squeeze shoulder blades','Lift arms slightly'], tips:'Do after any pushing workout.' },
  'Handstand Hold':      { icon:'🤸', muscles:'Shoulders, Core', timed:true, category:'Calisthenics', howTo:['Hands shoulder-width','Kick up to wall first','Engage core and glutes','Work toward freestanding'], tips:'Master wall handstand first.' },
  'Pistol Squat':        { icon:'🦵', muscles:'Quads, Balance',              category:'Calisthenics', howTo:['Stand on one leg','Extend other leg forward','Lower on single leg','Drive back up'], tips:'Use a doorframe when learning.' },
  'L-Sit':               { icon:'💪', muscles:'Core, Triceps', timed:true,  category:'Calisthenics', howTo:['Hands beside hips','Push down to lift body','Extend legs parallel'], tips:'Extremely challenging. Start with bent knees.' },
  'Jump Squat':          { icon:'⚡', muscles:'Quads, Glutes, Power',        category:'HIIT',  howTo:['Squat down','Explode up off floor','Land softly, immediately squat'], tips:'Land with soft knees.' },
  'High Knees':          { icon:'🏃', muscles:'Core, Cardio', timed:true,   category:'HIIT',  howTo:['Run in place','Drive knees to hip height','Pump arms in opposition'], tips:'Higher knees = harder core.' },
  'Jumping Jacks':       { icon:'⭐', muscles:'Full Body, Cardio', timed:true, category:'HIIT', howTo:['Feet together, arms at sides','Jump feet apart, raise arms overhead','Jump back to start'], tips:'Classic warm-up move.' },
  'Burpee Box Jump':     { icon:'📦', muscles:'Full Body, Power', timed:true, category:'HIIT', howTo:['Perform burpee','At the jump, land on box','Step down, repeat'], tips:'Advanced combo. Reduce speed for safety.' },
  'Roundhouse Kick':     { icon:'🦵', muscles:'Legs, Core, Hips',           category:'Martial Arts', howTo:['Fighting stance','Raise knee of kicking leg','Pivot on standing foot','Extend leg in arc','Retract'], tips:'Power comes from hip rotation.' },
  'Kata Practice':       { icon:'🥋', muscles:'Full Body', timed:true,      category:'Martial Arts', howTo:['Ready stance','Perform sequence deliberately','Each movement intentional','Finish in start position'], tips:'Focus on precision over speed.' },
  'Kettlebell Clean':    { icon:'🔔', muscles:'Full Body, Power',            category:'Kettlebell', howTo:['Hike bell between legs','Drive hips, pull bell up','Catch in rack position','Elbow close to body'], tips:'The clean is the foundation of most KB moves.' },
  'Turkish Get Up':      { icon:'🔔', muscles:'Full Body, Stability',        category:'Kettlebell', howTo:['Lie down, bell locked overhead','Slowly rise to standing in stages','Reverse the movement back down'], tips:'Go slow. This is a strength skill.' },
  'Goblet Squat':        { icon:'🔔', muscles:'Quads, Glutes, Core',         category:'Kettlebell', howTo:['Hold bell at chest','Feet slightly wide','Squat deep, elbows inside knees','Drive back up'], tips:'Great for squat depth and posture.' },
  "Farmer's Carry":      { icon:'🏋️', muscles:'Grip, Traps, Core', timed:true, category:'Functional', howTo:['Hold heavy weights at sides','Walk with tall posture','Controlled steps','Keep shoulders back'], tips:'One of the most functional exercises.' },
  'Battle Ropes':        { icon:'🔗', muscles:'Arms, Core, Cardio', timed:true, category:'Functional', howTo:['Hold one end each','Alternate arm waves','Keep core braced','Vary patterns'], tips:'Brutal conditioning tool.' },
  'Medicine Ball Slam':  { icon:'⚽', muscles:'Full Body, Core, Power',      category:'Functional', howTo:['Hold ball overhead','Squat slightly','Slam ball to floor hard','Catch or pick up, repeat'], tips:'Great for power.' },
  'Tennis Forehand':     { icon:'🎾', muscles:'Shoulder, Core, Wrist',       category:'Tennis', howTo:['Turn sideways to net','Swing racket back','Step forward, rotate hips','Contact in front','Follow through'], tips:'Follow-through determines spin.' },
  'Badminton Smash':     { icon:'🏸', muscles:'Shoulder, Wrist, Core',       category:'Badminton', howTo:['Position behind shuttle','Jump if needed','Full swing overhead','Snap wrist at contact'], tips:'The most powerful shot in badminton.' },
  'Football Sprint':     { icon:'⚽', muscles:'Speed, Legs',  timed:true,   category:'Football', howTo:['Drive off back foot, lean forward','Pump arms aggressively','Lift knees high'], tips:'90% of football is bursts under 30m.' },
  'Basketball Dribbling':{ icon:'🏀', muscles:'Coordination, Hands', timed:true, category:'Basketball', howTo:['Use fingertips, not palm','Ball below waist','Athletic stance','Practice both hands'], tips:'Great ball handlers never look at the ball.' },
  'Volleyball Spike':    { icon:'🏐', muscles:'Shoulder, Jump, Core',        category:'Volleyball', howTo:['Approach: 3-4 steps','Jump off both feet','Wind up arm overhead','Snap wrist on contact'], tips:'Arm speed creates power.' },
  'Golf Swing':          { icon:'⛳', muscles:'Core, Shoulders, Rotation',   category:'Golf', howTo:['Address ball, slight knee bend','Takeaway: club and shoulders together','Coil torso on backswing','Hips lead downswing','Impact: weight forward, follow through'], tips:'Grip firmly but gently.' },
  'Zumba Basic Step':    { icon:'💃', muscles:'Full Body, Cardio', timed:true, category:'Dance', howTo:['Step side to side with hip sway','Add arm movements to the beat','Let the music guide rhythm'], tips:'Just move and have fun.' },
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

// ─────────────────────────────────────────────
// LIBRARY_GROUPS — user-facing grouping for the Workout Library.
// This is purely a presentation grouping layered on top of the
// existing sports data above; SPORTS_CATEGORIES is left untouched
// so nothing here is deleted and content can expand later.
// Only sports that currently have real workouts are ever shown —
// the WorkoutTab filters each group down to available sports.
// ─────────────────────────────────────────────
export const LIBRARY_GROUPS = [
  {
    key: 'strength',
    sportIds: ['gym', 'powerlifting', 'bodybuilding', 'crossfit', 'calisthenics', 'kettlebell', 'functional', 'strongman'],
  },
  {
    key: 'cardio',
    sportIds: ['running', 'walking', 'cycling', 'hiit', 'jumpRope', 'rowing', 'swimming', 'elliptical', 'stairclimber', 'treadmill'],
  },
  {
    key: 'mobility',
    sportIds: ['yoga', 'pilates', 'stretching', 'mobility', 'foam_rolling', 'tai_chi', 'breathwork', 'meditation'],
  },
  {
    key: 'sports',
    sportIds: [
      'boxing', 'muay_thai', 'mma', 'martial', 'bjj', 'wrestling', 'judo', 'kickboxing', 'karate', 'taekwondo',
      'tennis', 'badminton', 'squash', 'pickleball', 'tableTennis', 'padel',
      'football', 'basketball', 'volleyball', 'rugby', 'hockey', 'handball', 'baseball', 'cricket', 'lacrosse', 'futsal',
      'golf', 'archery', 'fencing', 'shooting', 'bowling', 'darts',
      'hiking', 'rockClimbing', 'trailRunning', 'triathlon', 'mountainBike', 'skiing', 'snowboard', 'skateboard', 'surfing_out', 'paragliding',
      'dance', 'zumba', 'hiphop', 'ballet', 'contemporary', 'salsa',
      'gymnastics', 'aerobics', 'trampoline', 'parkour', 'cheerleading',
      'openWater', 'diving', 'surfing', 'kayaking', 'waterPolo', 'kitesurfing',
      'horseRiding', 'polo',
    ],
  },
]

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

export const SPORT_I18N_KEYS = {
  'Gym & Strength': 'sport.Gym_and_Strength',
  'Cardio & Running': 'sport.Cardio_and_Running',
  'Water Sports': 'sport.Water_Sports',
  'Mind & Body': 'sport.Mind_and_Body',
  'Combat Sports': 'sport.Combat_Sports',
  'Racquet Sports': 'sport.Racquet_Sports',
  'Team Sports': 'sport.Team_Sports',
  'Outdoor & Adventure': 'sport.Outdoor_and_Adventure',
  'Dance & Performing': 'sport.Dance_and_Performing',
  'Precision & Skill': 'sport.Precision_and_Skill',
  'Gymnastics & Acrobatics': 'sport.Gymnastics_and_Acrobatics',
  'Equestrian & Animals': 'sport.Equestrian_and_Animals',
  'Weight Training': 'sport.Weight_Training',
  'Powerlifting': 'sport.Powerlifting',
  'Bodybuilding': 'sport.Bodybuilding',
  'CrossFit': 'sport.CrossFit',
  'Calisthenics': 'sport.Calisthenics',
  'Kettlebell': 'sport.Kettlebell',
  'Functional Fitness': 'sport.Functional_Fitness',
  'Strongman': 'sport.Strongman',
  'Running': 'sport.Running',
  'Walking': 'sport.Walking',
  'Cycling': 'sport.Cycling',
  'HIIT': 'sport.HIIT',
  'Elliptical': 'sport.Elliptical',
  'Stair Climber': 'sport.Stair_Climber',
  'Jump Rope': 'sport.Jump_Rope',
  'Treadmill': 'sport.Treadmill',
  'Swimming': 'sport.Swimming',
  'Open Water': 'sport.Open_Water',
  'Diving': 'sport.Diving',
  'Surfing': 'sport.Surfing',
  'Rowing': 'sport.Rowing',
  'Kayaking': 'sport.Kayaking',
  'Water Polo': 'sport.Water_Polo',
  'Kitesurfing': 'sport.Kitesurfing',
  'Yoga': 'sport.Yoga',
  'Pilates': 'sport.Pilates',
  'Meditation': 'sport.Meditation',
  'Stretching': 'sport.Stretching',
  'Tai Chi': 'sport.Tai_Chi',
  'Breathwork': 'sport.Breathwork',
  'Foam Rolling': 'sport.Foam_Rolling',
  'Mobility': 'sport.Mobility',
  'Boxing': 'sport.Boxing',
  'Muay Thai': 'sport.Muay_Thai',
  'MMA': 'sport.MMA',
  'Martial Arts': 'sport.Martial_Arts',
  'Brazilian Jiu-Jitsu': 'sport.Brazilian_Jiu_Jitsu',
  'Wrestling': 'sport.Wrestling',
  'Judo': 'sport.Judo',
  'Kickboxing': 'sport.Kickboxing',
  'Karate': 'sport.Karate',
  'Taekwondo': 'sport.Taekwondo',
  'Tennis': 'sport.Tennis',
  'Badminton': 'sport.Badminton',
  'Squash': 'sport.Squash',
  'Pickleball': 'sport.Pickleball',
  'Table Tennis': 'sport.Table_Tennis',
  'Padel': 'sport.Padel',
  'Football / Soccer': 'sport.Football___Soccer',
  'Basketball': 'sport.Basketball',
  'Volleyball': 'sport.Volleyball',
  'Rugby': 'sport.Rugby',
  'Field Hockey': 'sport.Field_Hockey',
  'Handball': 'sport.Handball',
  'Baseball': 'sport.Baseball',
  'Cricket': 'sport.Cricket',
  'Lacrosse': 'sport.Lacrosse',
  'Futsal': 'sport.Futsal',
  'Hiking': 'sport.Hiking',
  'Rock Climbing': 'sport.Rock_Climbing',
  'Trail Running': 'sport.Trail_Running',
  'Triathlon': 'sport.Triathlon',
  'Mountain Biking': 'sport.Mountain_Biking',
  'Skiing': 'sport.Skiing',
  'Snowboarding': 'sport.Snowboarding',
  'Skateboarding': 'sport.Skateboarding',
  'SUP / Paddleboard': 'sport.SUP___Paddleboard',
  'Paragliding': 'sport.Paragliding',
  'Dance': 'sport.Dance',
  'Zumba': 'sport.Zumba',
  'Hip Hop Dance': 'sport.Hip_Hop_Dance',
  'Ballet': 'sport.Ballet',
  'Contemporary': 'sport.Contemporary',
  'Salsa': 'sport.Salsa',
  'Golf': 'sport.Golf',
  'Archery': 'sport.Archery',
  'Fencing': 'sport.Fencing',
  'Target Shooting': 'sport.Target_Shooting',
  'Bowling': 'sport.Bowling',
  'Darts': 'sport.Darts',
  'Gymnastics': 'sport.Gymnastics',
  'Aerobics': 'sport.Aerobics',
  'Trampoline': 'sport.Trampoline',
  'Parkour': 'sport.Parkour',
  'Cheerleading': 'sport.Cheerleading',
  'Horse Riding': 'sport.Horse_Riding',
  'Polo': 'sport.Polo',
  'Push Day': 'sport.Push_Day',
  'Pull Day': 'sport.Pull_Day',
  'Leg Day': 'sport.Leg_Day',
  'Full Body': 'sport.Full_Body',
  'Upper Body': 'sport.Upper_Body',
  'Core Blast': 'sport.Core_Blast',
  'Classic WOD': 'sport.Classic_WOD',
  'Beginner WOD': 'sport.Beginner_WOD',
  'Calisthenics Basics': 'sport.Calisthenics_Basics',
  'Advanced Skills': 'sport.Advanced_Skills',
  'KB Foundations': 'sport.KB_Foundations',
  'KB Power Circuit': 'sport.KB_Power_Circuit',
  'Easy Run': 'sport.Easy_Run',
  'Interval Training': 'sport.Interval_Training',
  'Long Run': 'sport.Long_Run',
  '5K Training': 'sport.5K_Training',
  'Power Walk': 'sport.Power_Walk',
  'Walk-Run Intervals': 'sport.Walk_Run_Intervals',
  'Endurance Ride': 'sport.Endurance_Ride',
  'Cycling Intervals': 'sport.Cycling_Intervals',
  '20-Min HIIT': 'sport.20_Min_HIIT',
  'Tabata Protocol': 'sport.Tabata_Protocol',
  'HIIT for Beginners': 'sport.HIIT_for_Beginners',
  'Jump Rope Basics': 'sport.Jump_Rope_Basics',
  'Jump Rope HIIT': 'sport.Jump_Rope_HIIT',
  'Lap Swimming': 'sport.Lap_Swimming',
  'Endurance Swim': 'sport.Endurance_Swim',
  'Rowing Endurance': 'sport.Rowing_Endurance',
  'Rowing Power': 'sport.Rowing_Power',
  'Morning Flow': 'sport.Morning_Flow',
  'Yin Yoga': 'sport.Yin_Yoga',
  'Power Yoga': 'sport.Power_Yoga',
  'Core Pilates': 'sport.Core_Pilates',
  'Full Body Pilates': 'sport.Full_Body_Pilates',
  'Full Body Stretch': 'sport.Full_Body_Stretch',
  'Post-Workout Stretch': 'sport.Post_Workout_Stretch',
  'Boxing Basics': 'sport.Boxing_Basics',
  'Boxing Conditioning': 'sport.Boxing_Conditioning',
  'Muay Thai Basics': 'sport.Muay_Thai_Basics',
  'Martial Arts Basics': 'sport.Martial_Arts_Basics',
  'MMA Conditioning': 'sport.MMA_Conditioning',
  'Tennis Conditioning': 'sport.Tennis_Conditioning',
  'Badminton Training': 'sport.Badminton_Training',
  'Football Fitness': 'sport.Football_Fitness',
  'Basketball Conditioning': 'sport.Basketball_Conditioning',
  'Volleyball Training': 'sport.Volleyball_Training',
  'Golf Fitness': 'sport.Golf_Fitness',
  'Zumba Flow': 'sport.Zumba_Flow',
  'Gymnastics Basics': 'sport.Gymnastics_Basics',
  'Hiking Prep': 'sport.Hiking_Prep',
  'Hiker\'s Strength': 'sport.Hikers_Strength',
  'Climbing Conditioning': 'sport.Climbing_Conditioning',
  'Triathlon Training': 'sport.Triathlon_Training',
  'Powerlifting Basics': 'sport.Powerlifting_Basics',
  'Powerlifting Peak': 'sport.Powerlifting_Peak',
  'Chest Hypertrophy': 'sport.Chest_Hypertrophy',
  'Back & Lats': 'sport.Back_and_Lats',
}



// ─────────────────────────────────────────────
// French exercise translations
// ─────────────────────────────────────────────
export const EXERCISES_FR = {
  'Bench Press':         { muscles:'Pectoraux, Triceps, Épaules', howTo:['Allongé sur le banc, pieds au sol','Prise légèrement plus large que les épaules','Descendre la barre vers le milieu de la poitrine','Pousser vers le haut de manière explosive'], tips:'Ne rebondissez jamais la barre sur la poitrine.' },
  'Incline Bench Press': { muscles:'Pectoraux supérieurs, Épaules', howTo:['Incliner le banc à 30-45°','Descendre la barre vers le haut de la poitrine','Pousser vers le haut et légèrement en arrière'], tips:'Au-delà de 45° la charge passe sur les épaules.' },
  'Push Ups':            { muscles:'Pectoraux, Triceps, Core', howTo:['Position planche, mains plus larges que les épaules','Garder le corps droit','Descendre la poitrine vers le sol','Repousser vers le haut'], tips:'Ne laissez pas les hanches s\'affaisser.' },
  'Chest Fly':           { muscles:'Pectoraux', howTo:['Allongé avec haltères au-dessus de la poitrine','Descendre les bras en arc','Contracter pour ramener les haltères'], tips:'Concentrez-vous sur l\'étirement en bas.' },
  'Dips':                { muscles:'Pectoraux, Triceps', howTo:['Saisir les barres parallèles','Se pencher en avant pour cibler les pectoraux','Descendre jusqu\'à ce que les bras soient parallèles au sol','Repousser'], tips:'Penché en avant = pectoraux, droit = triceps.' },
  'Cable Crossover':     { muscles:'Pectoraux', howTo:['Régler les câbles en hauteur','Tirer les poignées ensemble devant la poitrine','Contracter au point de contraction maximal'], tips:'Excellent exercice de finition.' },
  'Pull Ups':            { muscles:'Dorsaux, Biceps', howTo:['Se suspendre prise en pronation','Tirer les omoplates vers le bas d\'abord','Monter jusqu\'au menton au-dessus de la barre','Redescendre lentement'], tips:'L\'amplitude complète est essentielle.' },
  'Deadlift':            { muscles:'Dos complet, Ischio-jambiers, Fessiers', howTo:['Barre sur le milieu du pied','Hanches fléchies, prise à l\'extérieur des jambes','Poitrine haute, gainage du core','Pousser dans le sol','Verrouiller les hanches en haut'], tips:'Ne jamais arrondir le bas du dos.' },
  'Bent Over Row':       { muscles:'Dos, Biceps', howTo:['Se pencher en avant, dos plat','Tirer la barre vers le bas de la poitrine','Contracter les omoplates au sommet'], tips:'Gardez le dos plat tout au long du mouvement.' },
  'Lat Pulldown':        { muscles:'Dorsaux, Biceps', howTo:['Saisir la barre largement, s\'asseoir droit','Tirer vers le haut de la poitrine','Retour lent en extension complète'], tips:'Imaginez tirer les coudes vers les poches arrière.' },
  'Seated Cable Row':    { muscles:'Dos moyen, Biceps', howTo:['Assis droit, pieds sur la plateforme','Tirer vers l\'abdomen, coudes en arrière','Contracter les omoplates au sommet'], tips:'N\'utilisez pas l\'élan.' },
  'Face Pull':           { muscles:'Deltoïdes postérieurs, Dos haut', howTo:['Câble à hauteur du visage, corde attachée','Tirer vers le visage, coudes hauts et larges','Rotation externe en fin de mouvement'], tips:'Excellent pour la santé des épaules.' },
  'Squat':               { muscles:'Quadriceps, Fessiers, Ischio-jambiers', howTo:['Barre sur les trapèzes, pieds écartés à la largeur des épaules','Bracing du core','Genoux vers l\'extérieur, s\'asseoir vers le bas','Cuisses parallèles au minimum','Pousser dans le sol pour se relever'], tips:'Les genoux suivent la direction des orteils.' },
  'Romanian Deadlift':   { muscles:'Ischio-jambiers, Fessiers', howTo:['Tenir la barre, reculer les hanches','Descendre la barre le long des jambes','Sentir l\'étirement des ischio-jambiers','Pousser les hanches vers l\'avant'], tips:'Mouvement de charnière de hanche, pas un squat.' },
  'Leg Press':           { muscles:'Quadriceps, Fessiers', howTo:['Pieds écartés sur la plateforme','Descendre à 90°','Pousser sans verrouiller les genoux'], tips:'Pieds haut = fessiers, bas = quadriceps.' },
  'Lunges':              { muscles:'Quadriceps, Fessiers', howTo:['Faire un grand pas en avant','Abaisser le genou arrière vers le sol','Genou avant au-dessus de la cheville','Repousser vers le haut'], tips:'Foulée longue = fessiers, courte = quadriceps.' },
  'Hip Thrust':          { muscles:'Fessiers, Ischio-jambiers', howTo:['Dos sur le banc, barre sur les hanches','Pousser les hanches vers le haut','Contracter les fessiers au sommet'], tips:'Le meilleur exercice pour les fessiers.' },
  'Calf Raises':         { muscles:'Mollets', howTo:['Se lever sur les pointes des pieds','Tenir la contraction 1 seconde','Descendre sous le niveau de la marche'], tips:'Amplitude complète, répétitions élevées.' },
  'Overhead Press':      { muscles:'Épaules, Triceps', howTo:['Barre à hauteur des épaules','Presser droit vers le haut','Verrouiller en haut'], tips:'Gainé tout au long du mouvement.' },
  'Lateral Raise':       { muscles:'Deltoïdes latéraux', howTo:['Lever les bras sur les côtés','Parallèle au sol','L\'auriculaire légèrement plus haut'], tips:'Moins de poids qu\'on ne le croit.' },
  'Arnold Press':        { muscles:'Tous les chefs du deltoïde', howTo:['Paumes face à soi à hauteur des épaules','Presser en tournant les paumes vers l\'extérieur','Inverser la rotation en descente'], tips:'Cible les trois chefs du deltoïde.' },
  'Bicep Curl':          { muscles:'Biceps', howTo:['Bras en extension complète','Curl vers les épaules','Contracter au sommet','Redescendre complètement'], tips:'Ne balancez pas le corps.' },
  'Hammer Curl':         { muscles:'Biceps, Avant-bras', howTo:['Prise neutre (pouces vers le haut)','Curl sans rotation du poignet'], tips:'Développe l\'épaisseur du bras.' },
  'Tricep Pushdown':     { muscles:'Triceps', howTo:['Coudes fixés sur les côtés','Pousser vers le bas jusqu\'en extension complète','Contracter les triceps'], tips:'Ne laissez pas les coudes s\'écarter.' },
  'Skull Crushers':      { muscles:'Triceps', howTo:['Allongé sur banc, barre au-dessus de la poitrine','Descendre vers le front en fléchissant les coudes','Revenir en extension'], tips:'Seuls les avant-bras bougent.' },
  'Plank':               { muscles:'Core, Épaules, Fessiers', howTo:['Avant-bras au sol','Corps droit de la tête aux talons','Contracter le core et les fessiers'], tips:'La qualité prime sur la durée.' },
  'Crunches':            { muscles:'Abdominaux', howTo:['Genoux fléchis, mains derrière la tête','Décoller les épaules en contractant les abdos','Redescendre lentement'], tips:'L\'amplitude courte est intentionnelle.' },
  'Leg Raises':          { muscles:'Abdominaux inférieurs', howTo:['Allongé à plat','Lever les jambes à 90°','Redescendre lentement sans toucher le sol'], tips:'Plus lent = plus difficile.' },
  'Russian Twist':       { muscles:'Obliques', howTo:['Pieds décollés, légèrement incliné','Rotation du tronc de côté en côté'], tips:'Contrôlez le mouvement.' },
  'Mountain Climbers':   { muscles:'Core, Cardio', howTo:['Position pompe','Ramener les genoux vers la poitrine en alternance'], tips:'Rapide = cardio, lent = core.' },
  'Running':             { muscles:'Corps entier, Cardiovasculaire', howTo:['Échauffement 5 min','Attérir sur le milieu du pied','Bras à 90°','Respirer de manière rythmique'], tips:'Allure conversationnelle pour la base aérobie.' },
  'Cycling':             { muscles:'Quadriceps, Ischio-jambiers, Fessiers', howTo:['Régler la selle','Cadence 80-100 RPM','Core engagé'], tips:'Cadence plus élevée ménage les articulations.' },
  'Jump Rope':           { muscles:'Corps entier, Mollets', howTo:['Tenir les poignées à hauteur des hanches','Rester sur les pointes des pieds','Petits sauts efficaces'], tips:'Brûle ~10 kcal/min.' },
  'Swimming':            { muscles:'Corps entier', howTo:['Échauffement avec des longueurs faciles','Focus sur des mouvements longs et fluides','Respirer tous les 2-3 mouvements'], tips:'Impact articulaire nul.' },
  'HIIT':                { muscles:'Corps entier', howTo:['Échauffement 5 min','Effort à 90%+ pendant 20-40 sec','Repos 10-20 sec','8-20 séries'], tips:'Le vrai HIIT c\'est un effort maximal.' },
  'Walking':             { muscles:'Jambes, Cardiovasculaire', howTo:['Tête haute, épaules en arrière','Balancer les bras naturellement','Pousser avec les orteils','Viser 5-6 km/h'], tips:'10 000 pas ≈ 400-500 kcal.' },
  'Rowing Machine':      { muscles:'Corps entier, Dos', howTo:['Les jambes d\'abord','Puis incliner le dos en arrière','Puis tirer les bras','Inverser la séquence'], tips:'Jambes 60%, dos 20%, bras 20%.' },
  'Burpee':              { muscles:'Corps entier', howTo:['Mains au sol','Sauter les pieds en arrière','Pompe (optionnel)','Sauter les pieds vers les mains','Sauter avec les bras au-dessus'], tips:'Gardez un rythme régulier.' },
  'Kettlebell Swing':    { muscles:'Fessiers, Ischio-jambiers, Core', howTo:['Charnière de hanche','Balancer entre les jambes','Pousser les hanches vers l\'avant','Le kettlebell monte à hauteur de la poitrine'], tips:'La puissance vient des hanches.' },
  'Box Jump':            { muscles:'Quadriceps, Fessiers, Puissance', howTo:['Face à la box','Balancer les bras, fléchir les genoux','Exploser vers le haut','Atterrir doucement avec les genoux fléchis'], tips:'Atterrir silencieusement = bonne technique.' },
  'Thruster':            { muscles:'Corps entier', howTo:['Barre à hauteur des épaules','Squat jusqu\'au parallèle','Exploser vers le haut','Utiliser l\'élan pour presser la barre au-dessus'], tips:'Squat et presse doivent être un seul mouvement.' },
  'Wall Ball':           { muscles:'Corps entier', howTo:['Squat avec la balle à la poitrine','Exploser vers le haut','Lancer la balle vers la cible','Attraper et immédiatement squatter'], tips:'Gardez la poitrine haute dans le squat.' },
  'Sun Salutation':      { muscles:'Corps entier, Souplesse', howTo:['Debout, mains au cœur','Inspirer, bras au-dessus','Expirer, flexion avant','Planche, descente au sol','Inspirer, chien tête en haut','Expirer, chien tête en bas'], tips:'Bougez avec votre respiration.' },
  'Warrior Pose':        { muscles:'Jambes, Hanches, Équilibre', howTo:['Fente avant, genou à 90°','Jambe arrière tendue','Bras levés au-dessus de la tête','Tenir 30-60 sec de chaque côté'], tips:'Focus sur la stabilité et la respiration.' },
  "Child's Pose":        { muscles:'Dos, Hanches', howTo:['À genoux, gros orteils qui se touchent','S\'asseoir sur les talons','Se plier en avant, bras tendus'], tips:'Utilisez cette pose comme repos à tout moment.' },
  'Downward Dog':        { muscles:'Ischio-jambiers, Mollets, Épaules', howTo:['Mains et pieds au sol','Lever les hanches vers le haut et l\'arrière','Ligne droite des mains aux hanches','Pousser les talons vers le sol'], tips:'Fléchir les genoux si les ischio sont tendus.' },
  'The Hundred':         { muscles:'Core, Respiration', howTo:['Jambes en tabletop','Lever la tête et les épaules','Pomper les bras 100 fois','Inspirer 5, expirer 5'], tips:'Dos bas collé au tapis.' },
  'Roll Up':             { muscles:'Abdominaux, Colonne vertébrale', howTo:['Allongé, bras au-dessus de la tête','Décoller vertèbre par vertèbre','Atteindre les orteils','Redescendre avec le même contrôle'], tips:'Articulation vertébrale, pas un abdo.' },
  'Jab-Cross':           { muscles:'Épaules, Core', howTo:['Position de garde boxe','Jab : coup rapide de la main avant','Cross : coup puissant de la main arrière avec rotation des hanches','Revenir en garde'], tips:'La puissance vient de la rotation.' },
  'Shadow Boxing':       { muscles:'Corps entier, Cardio', howTo:['Se déplacer en permanence sur les pointes','Enchaîner les coups, jabs, crochets, uppercuts','Ajouter du travail de pieds'], tips:'Séries de 3 min, repos 1 min.' },
  'Heavy Bag':           { muscles:'Corps entier, Puissance', howTo:['Bander les mains d\'abord','Utiliser la bonne garde','Enchaîner les combinaisons','Garder la garde entre les coups'], tips:'Focus sur la technique, pas que la puissance.' },
  'Hamstring Stretch':   { muscles:'Ischio-jambiers', howTo:['Assis ou allongé','Lever une jambe','Garder le genou aussi droit que possible','Tenir 30-60 sec de chaque côté'], tips:'Ne forcez jamais l\'étirement.' },
  'Hip Flexor Stretch':  { muscles:'Fléchisseurs de hanche', howTo:['Un genou au sol','Avancer les hanches jusqu\'à sentir l\'étirement','Garder le tronc droit'], tips:'Idéal après une longue position assise.' },
  'Pigeon Pose':         { muscles:'Hanches, Bande iliotibiale', howTo:['Depuis chien tête en bas','Genou avant derrière le poignet','Étendre la jambe arrière','Tenir 1-2 min de chaque côté'], tips:'Un des meilleurs étirements des hanches.' },
  'Chest Opener':        { muscles:'Pectoraux, Posture', howTo:['Joindre les mains derrière le dos','Contracter les omoplates','Lever légèrement les bras'], tips:'Faire après tout entraînement de poussée.' },
  'Handstand Hold':      { muscles:'Épaules, Core, Équilibre', howTo:['Mains écartées à la largeur des épaules','Monter contre un mur d\'abord','Engager le core et les fessiers','Travailler vers l\'équilibre sans mur'], tips:'Maîtriser le mur avant de le faire librement.' },
  'Pistol Squat':        { muscles:'Quadriceps, Équilibre', howTo:['Se tenir sur une jambe','Étendre l\'autre jambe vers l\'avant','Descendre sur une seule jambe','Remonter par le talon'], tips:'Utiliser un cadre de porte pour apprendre.' },
  'L-Sit':               { muscles:'Core, Triceps', howTo:['Mains à côté des hanches','Pousser vers le bas pour soulever le corps','Étendre les jambes parallèles au sol'], tips:'Extrêmement difficile. Commencer les genoux fléchis.' },
  'Jump Squat':          { muscles:'Quadriceps, Fessiers, Puissance', howTo:['Descendre en squat','Exploser vers le haut en sautant','Atterrir avec les genoux souples'], tips:'Atterrir avec des genoux souples.' },
  'High Knees':          { muscles:'Core, Cardio', howTo:['Courir sur place','Monter les genoux à hauteur des hanches','Pomper les bras en opposition'], tips:'Plus les genoux sont hauts, plus le core travaille.' },
  'Jumping Jacks':       { muscles:'Corps entier, Cardio', howTo:['Debout, pieds ensemble','Sauter pieds écartés, bras au-dessus','Revenir en position de départ'], tips:'Classique d\'échauffement.' },
  'Burpee Box Jump':     { muscles:'Corps entier, Puissance', howTo:['Faire un burpee','Au saut, atterrir sur la box','Descendre, recommencer'], tips:'Exercice avancé. Réduire la vitesse pour la sécurité.' },
  'Roundhouse Kick':     { muscles:'Jambes, Core, Hanches', howTo:['Position de garde','Lever le genou de la jambe qui frappe sur le côté','Pivoter sur le pied d\'appui','Étendre la jambe en arc','Rétracter la jambe'], tips:'La puissance vient de la rotation des hanches.' },
  'Kata Practice':       { muscles:'Corps entier', howTo:['Position de départ','Effectuer la séquence de manière délibérée','Chaque mouvement est intentionnel'], tips:'Focus sur la précision, pas la vitesse.' },
  'Kettlebell Clean':    { muscles:'Corps entier, Puissance', howTo:['Balancer le kettlebell entre les jambes','Pousser les hanches, tirer vers le haut','Attraper en position rack','Coude près du corps'], tips:'Le clean est la base de la plupart des mouvements KB.' },
  'Turkish Get Up':      { muscles:'Corps entier, Stabilité', howTo:['Allongé, kettlebell verrouillé au-dessus','Se lever lentement par étapes','Inverser le mouvement pour redescendre'], tips:'Aller lentement. C\'est une compétence de force.' },
  'Goblet Squat':        { muscles:'Quadriceps, Fessiers, Core', howTo:['Tenir le kettlebell à la poitrine','Pieds légèrement écartés','Squat profond, coudes à l\'intérieur des genoux','Remonter'], tips:'Excellent pour la profondeur du squat et la posture.' },
  'Battle Ropes':        { muscles:'Bras, Core, Cardio', howTo:['Tenir une extrémité de chaque côté','Vagues alternatives des bras','Garder le core gainé','Varier les patterns'], tips:'Outil de conditionnement brutal.' },
  'Medicine Ball Slam':  { muscles:'Corps entier, Core, Puissance', howTo:['Tenir la balle au-dessus de la tête','Légèrement fléchir les genoux','Claquer la balle au sol fort','Attraper ou ramasser, recommencer'], tips:'Excellent pour la puissance et l\'évacuation de stress.' },
  'Tennis Forehand':     { muscles:'Épaule, Core, Poignet', howTo:['De côté par rapport au filet','Balancer la raquette en arrière','Avancer, rotation des hanches et des épaules','Contact devant le corps','Suivre au-dessus de l\'épaule'], tips:'Le suivi détermine l\'effet et le contrôle.' },
  'Badminton Smash':     { muscles:'Épaule, Poignet, Core', howTo:['Positionner derrière le volant','Sauter si nécessaire','Plein élan au-dessus de la tête','Claquer le poignet au contact'], tips:'Le smash le plus puissant du badminton.' },
  'Football Sprint':     { muscles:'Vitesse, Jambes', howTo:['Pousser sur le pied arrière, se pencher en avant','Pomper les bras agressivement','Lever les genoux haut'], tips:'90% du football se joue en sprints sous 30m.' },
  'Basketball Dribbling':{ muscles:'Coordination, Mains', howTo:['Utiliser les doigts, pas la paume','Balle sous la taille','Position athlétique','Pratiquer des deux mains'], tips:'Les bons dribbleurs ne regardent jamais la balle.' },
  'Volleyball Spike':    { muscles:'Épaule, Saut, Core', howTo:['Approche : 3-4 pas','Sauter des deux pieds','Armer le bras au-dessus de la tête','Claquer le poignet au contact'], tips:'La vitesse du bras crée la puissance.' },
  'Golf Swing':          { muscles:'Core, Épaules, Rotation', howTo:['Adresser la balle, léger fléchissement des genoux','Takeaway : club, bras et épaules ensemble','Enrouler le tronc en backswing','Les hanches mènent en downswing','Impact : poids en avant, suivre'], tips:'La prise doit être comme tenir un petit oiseau.' },
  'Zumba Basic Step':    { muscles:'Corps entier, Cardio', howTo:['Pas de côté avec balancement des hanches','Ajouter des mouvements de bras sur le rythme','Laisser la musique guider le rythme'], tips:'Ne pas trop réfléchir — juste bouger et s\'amuser.' },
  'Cartwheel':           { muscles:'Corps entier, Coordination', howTo:['Pied dominant en avant','Planter la main avant, puis la main arrière','Lancer les jambes en arc','Atterrir pieds écartés, bras levés'], tips:'Garder les bras tendus tout au long du mouvement.' },
}

// Updated getExercise — returns translated data when lang='fr'
export function getExercise(name, lang) {
  const base = EXERCISES[name] || { icon:'💪', muscles:'', category:'General', howTo:[], tips:'', timed:false }
  if (lang === 'fr' && EXERCISES_FR[name]) {
    return { name, ...base, ...EXERCISES_FR[name] }
  }
  return { name, ...base }
}
