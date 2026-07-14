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

  // ── Weight Training — warm-up cardio options ─────────────────
  'Brisk Walk or Easy Bike': { icon:'🚶', muscles:'Full Body, Cardio', timed:true, category:'Warm-up', howTo:['Pick either — a brisk walk or an easy bike spin','Keep effort light, just enough to raise your heart rate'], tips:'This is preparation, not the workout — keep it easy.' },
  'Easy Rowing or Bike':     { icon:'🚴', muscles:'Full Body, Cardio', timed:true, category:'Warm-up', howTo:['Pick either — easy rowing or an easy bike spin','Light, steady effort to raise body temperature'], tips:'Save your energy for the working sets.' },
  'Easy Rowing Machine':     { icon:'🚣', muscles:'Full Body, Cardio', timed:true, category:'Warm-up', howTo:['Light, steady rowing pace','Focus on smooth technique, not effort'], tips:'Just enough to break a light sweat.' },
  'Easy Bike':               { icon:'🚴', muscles:'Full Body, Cardio', timed:true, category:'Warm-up', howTo:['Easy, steady pedalling pace','Raise your heart rate gently before loading the legs'], tips:'Keep resistance light.' },
  'Easy Bike or Row':        { icon:'🚴', muscles:'Full Body, Cardio', timed:true, category:'Warm-up', howTo:['Pick either — easy bike or easy row','Light steady effort only'], tips:'This is preparation, not the workout.' },
  'Easy Walk':               { icon:'🚶', muscles:'Full Body, Cool-down', timed:true, category:'Cool-down', howTo:['Slow, relaxed walking pace','Let your heart rate settle gradually'], tips:'A great way to start bringing your body back down.' },
  'Slow Walk':               { icon:'🚶', muscles:'Full Body, Cool-down', timed:true, category:'Cool-down', howTo:['Very easy walking pace','Breathe normally, let the body cool down'], tips:'No effort required — this is pure recovery.' },

  // ── Weight Training — warm-up / activation drills ────────────
  'Bodyweight Squat':    { icon:'🦵', muscles:'Quads, Glutes', category:'Warm-up', howTo:['Feet shoulder-width apart','Sit back and down, chest up','Knees track over toes','Stand back up with control'], tips:'No weight needed — this is about waking up the pattern.' },
  'Arm Circles':         { icon:'💪', muscles:'Shoulders', category:'Warm-up', howTo:['Extend arms out to sides','Make small circles, then gradually larger','Reverse direction halfway through'], tips:'Great simple shoulder warm-up.' },
  'Hip Hinge Drill':     { icon:'🏋️', muscles:'Hamstrings, Glutes', category:'Warm-up', howTo:['Stand tall, soft knees','Push hips back while keeping back flat','Feel a stretch in the hamstrings','Drive hips forward to stand back up'], tips:'This is the movement pattern behind every deadlift variation.' },
  'Wall Push-Up':        { icon:'💪', muscles:'Chest, Shoulders, Triceps', category:'Warm-up', howTo:['Stand facing a wall, hands at chest height','Lower chest toward the wall','Push back to start'], tips:'A gentle way to activate the pushing muscles before bench work.' },
  'Band Pull-Aparts':    { icon:'💪', muscles:'Rear Delts, Upper Back', category:'Warm-up', howTo:['Hold a light band at chest height, arms extended','Pull the band apart until it touches your chest','Control the return'], tips:'Excellent shoulder health and posture activation.' },
  'Scapular Push-Ups':   { icon:'💪', muscles:'Shoulders, Upper Back', category:'Warm-up', howTo:['Start in a plank or push-up position, arms straight','Let shoulder blades pinch together, then push them apart','Elbows stay straight throughout'], tips:'Small movement — this activates the shoulder blades, not the arms.' },
  'Band Straight-Arm Pulldown': { icon:'💪', muscles:'Lats, Back', category:'Warm-up', howTo:['Hold band overhead, arms straight','Pull the band down to the thighs, arms staying straight','Control the return'], tips:'Great lat activation before pulling work.' },
  'Scapular Pull-Up or Scapular Pulldown': { icon:'💪', muscles:'Lats, Upper Back', category:'Warm-up', howTo:['Hang from the bar (or hold a pulldown bar)','Without bending the elbows, pull shoulder blades down and together','Release with control'], tips:'This primes the lats before real pulling work.' },
  'Light Cable Row':     { icon:'🚣', muscles:'Back, Biceps', category:'Warm-up', howTo:['Very light weight on the cable row','Focus purely on technique and full range of motion'], tips:'This is a warm-up set, not a working set.' },
  'Glute Bridge':        { icon:'🦵', muscles:'Glutes, Hamstrings', category:'Warm-up', howTo:['Lie on back, knees bent, feet flat','Drive hips up, squeezing glutes at the top','Lower with control'], tips:'Wakes up the glutes before squats and deadlifts.' },
  'Reverse Lunge':       { icon:'🦵', muscles:'Quads, Glutes', category:'Warm-up', howTo:['Step backward into a lunge','Front knee stays over the ankle','Push through the front foot to return to standing'], tips:'Gentler on the knees than a forward lunge — good for warming up.' },
  'Cat-Cow':             { icon:'🧘', muscles:'Spine, Core', category:'Warm-up', howTo:['On hands and knees','Arch the back, dropping belly, looking up (cow)','Round the back, tucking chin (cat)','Move slowly between the two'], tips:'Gently mobilises the whole spine.' },
  'Pelvic Tilt':         { icon:'🧘', muscles:'Core, Lower Back', category:'Warm-up', howTo:['Lie on back, knees bent','Flatten the lower back into the floor by tilting the pelvis','Release and repeat'], tips:'A subtle but effective core activation drill.' },
  'Bird Dog Practice':   { icon:'🧘', muscles:'Core, Balance', category:'Warm-up', howTo:['On hands and knees','Extend one arm and the opposite leg','Keep hips level, hold briefly','Return and switch sides'], tips:'Practice slowly here — this primes the movement for the main set.' },

  // ── Weight Training — main lifts ─────────────────────────────
  'Barbell Bench Press': { icon:'🏋️', muscles:'Chest, Triceps, Shoulders', category:'Chest', howTo:['Lie flat, feet on floor','Grip bar slightly wider than shoulders','Lower to mid-chest with control','Press up explosively'], tips:'Never bounce the bar off your chest.' },
  'Dumbbell Bench Press':{ icon:'🏋️', muscles:'Chest, Triceps, Shoulders', category:'Chest', howTo:['Lie on a bench holding dumbbells at chest level','Press up until arms are extended','Lower with control back to chest level'], tips:'Dumbbells allow a slightly deeper stretch than a barbell.' },
  'Incline Dumbbell Press': { icon:'🏋️', muscles:'Upper Chest, Shoulders', category:'Chest', howTo:['Set bench to 30-45 degrees','Press dumbbells up above the upper chest','Lower with control'], tips:'Targets the upper chest more than a flat press.' },
  'Cable Chest Fly':     { icon:'🦋', muscles:'Chest', category:'Chest', howTo:['Set cables to chest height, step forward','Bring handles together in front of the chest, slight elbow bend','Control the return to a full stretch'], tips:'Squeeze the chest at the point where your hands meet.' },
  'Seated Dumbbell Shoulder Press': { icon:'🏋️', muscles:'Shoulders, Triceps', category:'Shoulders', howTo:['Sit with back supported, dumbbells at shoulder height','Press overhead until arms are extended','Lower with control back to shoulders'], tips:'Keep core braced to protect the lower back.' },
  'Dumbbell Lateral Raise': { icon:'💪', muscles:'Side Delts', category:'Shoulders', howTo:['Hold dumbbells at your sides','Raise arms out to the sides to shoulder height','Lower with control'], tips:'Lighter weight with strict form beats heavier weight with momentum.' },
  'Triceps Rope Pushdown': { icon:'💪', muscles:'Triceps', category:'Arms', howTo:['Stand at the cable with a rope attachment','Elbows fixed at your sides','Push down until arms are fully extended, spreading the rope at the bottom'], tips:'Keep elbows pinned — only the forearms should move.' },
  'Lat Pulldown or Assisted Pull-Up': { icon:'💪', muscles:'Lats, Biceps', category:'Back', howTo:['Use the lat pulldown machine, or an assisted pull-up machine','Pull the bar to your upper chest (or pull your body up)','Control the return to a full stretch'], tips:'Choose whichever option lets you complete all reps with good form.' },
  'Chest-Supported Dumbbell Row': { icon:'🏋️', muscles:'Back, Biceps', category:'Back', howTo:['Lie chest-down on an incline bench holding dumbbells','Row the dumbbells up toward your hips','Squeeze the shoulder blades, then lower with control'], tips:'Chest support removes momentum, isolating the back muscles.' },
  'Dumbbell Curl':       { icon:'💪', muscles:'Biceps', category:'Arms', howTo:['Stand holding dumbbells, arms extended','Curl the weights up toward the shoulders','Lower with control'], tips:"Don't swing the body to help the weight up." },
  'Back Squat':          { icon:'🏋️', muscles:'Quads, Glutes, Hamstrings', category:'Legs', howTo:['Bar on the upper back, feet shoulder-width apart','Brace the core, sit back and down','Descend until thighs are at least parallel','Drive through the floor to stand'], tips:'Knees should track in line with the toes throughout.' },
  'Dumbbell Romanian Deadlift': { icon:'🏋️', muscles:'Hamstrings, Glutes', category:'Legs', howTo:['Hold dumbbells in front of thighs','Push hips back, lowering the weights along the legs','Feel the hamstring stretch, then drive hips forward to stand'], tips:'This is a hip hinge, not a squat — keep the weights close to the legs.' },
  'Walking Lunge':       { icon:'🦵', muscles:'Quads, Glutes', category:'Legs', howTo:['Step forward into a lunge','Push through the front foot to bring the back leg through into the next lunge','Continue alternating legs while moving forward'], tips:'Keep the torso upright throughout.' },
  'Seated or Lying Leg Curl': { icon:'🦵', muscles:'Hamstrings', category:'Legs', howTo:['Use either the seated or lying leg curl machine','Curl the pad toward your glutes','Control the return to full extension'], tips:'Avoid using momentum — control both the lift and the lowering.' },
  'Standing Calf Raise': { icon:'🦵', muscles:'Calves', category:'Legs', howTo:['Stand on the edge of a step or platform','Rise onto the balls of the feet as high as possible','Lower the heels below the step for a full stretch'], tips:'Full range of motion matters more than the weight used.' },

  // ── Weight Training — core stability ──────────────────────────
  'Front Plank':         { icon:'🧘', muscles:'Core, Shoulders', timed:true, category:'Core', howTo:['Forearms on the floor, elbows under shoulders','Body in a straight line from head to heels','Squeeze the core and glutes throughout'], tips:'Stop the set once good alignment can no longer be held.' },
  'Side Plank from Knees or Feet': { icon:'🧘', muscles:'Obliques, Core', timed:true, category:'Core', howTo:['Lie on your side, prop up on one forearm','Lift hips so the body forms a straight line','Support on the knees for an easier version, or feet for harder'], tips:'Choose the variation that lets you hold with good form.' },
  'Pallof Press':        { icon:'🧘', muscles:'Core, Obliques', category:'Core', howTo:['Hold a band or cable at chest height, anchored to your side','Press the handle straight out in front of you','Resist the pull rotating your torso, then return'], tips:'The goal is to resist rotation — the torso should stay square.' },
  'Suitcase Carry':      { icon:'🏋️', muscles:'Core, Grip, Obliques', timed:true, category:'Core', howTo:['Hold a weight in one hand at your side, like a suitcase','Walk tall, resisting the pull to one side','Keep shoulders level throughout'], tips:'Resisting the side-bend is the whole point of this exercise.' },
  'Bird Dog':            { icon:'🧘', muscles:'Core, Balance', category:'Core', howTo:['On hands and knees','Extend one arm and the opposite leg fully','Keep hips level, hold briefly','Return with control and switch sides'], tips:"Move slowly — this is about control, not speed." },

  // ── Weight Training — cool-down stretches & breathing ────────
  'Standing Quadriceps Stretch': { icon:'🤸', muscles:'Quads', timed:true, category:'Stretching', howTo:['Stand on one leg, hold onto something for balance if needed','Pull the opposite heel toward the glutes','Keep knees close together'], tips:'Hold steady, avoid pulling the foot too high.' },
  'Doorway Chest Stretch': { icon:'🤸', muscles:'Chest, Shoulders', timed:true, category:'Stretching', howTo:['Place forearm on a door frame, elbow bent to 90 degrees','Gently lean forward through the doorway','Feel the stretch across the chest'], tips:'A great release after any pressing work.' },
  'Seated Hamstring Stretch': { icon:'🤸', muscles:'Hamstrings', timed:true, category:'Stretching', howTo:['Sit with one leg extended, the other bent','Hinge forward from the hips over the extended leg','Keep the back as flat as possible'], tips:'Never force the stretch — ease in gradually.' },
  'Slow Diaphragmatic Breathing': { icon:'🧘', muscles:'Recovery, Breathing', timed:true, category:'Cool-down', howTo:['Lie or sit comfortably','Breathe in slowly through the nose, expanding the belly','Exhale slowly through the mouth'], tips:'This helps shift the body out of training mode and into recovery.' },
  'Diaphragmatic Breathing': { icon:'🧘', muscles:'Recovery, Breathing', timed:true, category:'Cool-down', howTo:['Lie comfortably on your back','Breathe in slowly through the nose, belly rising','Exhale slowly and fully through the mouth'], tips:'Slow breathing signals the nervous system to relax.' },
  'Slow Breathing':      { icon:'🧘', muscles:'Recovery, Breathing', timed:true, category:'Cool-down', howTo:['Sit or stand comfortably','Inhale slowly through the nose','Exhale slowly through the mouth'], tips:'A simple way to close out the session calmly.' },
  'Cross-Body Shoulder Stretch': { icon:'🤸', muscles:'Shoulders', timed:true, category:'Stretching', howTo:['Bring one arm across the chest','Use the other arm to gently pull it closer','Keep the shoulder relaxed, away from the ear'], tips:'Great release after pressing movements.' },
  'Cross-Body Rear Shoulder Stretch': { icon:'🤸', muscles:'Rear Delts, Shoulders', timed:true, category:'Stretching', howTo:['Bring one arm across the chest at shoulder height','Use the other arm to press it gently closer','Focus on the back of the shoulder'], tips:'Targets the rear delts worked during pulling exercises.' },
  'Overhead Triceps Stretch': { icon:'🤸', muscles:'Triceps', timed:true, category:'Stretching', howTo:['Raise one arm overhead, bend the elbow to drop the hand behind the head','Use the other hand to gently press the elbow back','Keep the torso upright'], tips:'Move gently — the triceps can be tight after pushing work.' },
  'Lat Stretch':         { icon:'🤸', muscles:'Lats, Back', timed:true, category:'Stretching', howTo:['Hold onto a bar or door frame','Sink hips back and down, letting the lats stretch','Keep arms extended'], tips:'A good release after pulling work.' },
  'Forearm Flexor Stretch': { icon:'🤸', muscles:'Forearms', timed:true, category:'Stretching', howTo:['Extend one arm in front, palm facing up','Use the other hand to gently pull the fingers back','Feel the stretch through the forearm'], tips:'Helps after curls and grip-heavy pulling work.' },
  'Half-Kneeling Hip Flexor Stretch': { icon:'🤸', muscles:'Hip Flexors', timed:true, category:'Stretching', howTo:['Kneel on one knee, other foot forward, flat on floor','Shift weight forward until a stretch is felt at the front of the hip','Keep the torso upright'], tips:'Great after squats and lunges.' },
  'Calf Stretch':        { icon:'🤸', muscles:'Calves', timed:true, category:'Stretching', howTo:['Stand facing a wall, one foot back with heel flat on the floor','Lean forward gently until a stretch is felt in the calf','Keep the back leg straight'], tips:'Hold steady, avoid bouncing.' },
  'Supine Knee-to-Chest Stretch': { icon:'🤸', muscles:'Lower Back, Glutes', timed:true, category:'Stretching', howTo:['Lie on your back','Pull one knee gently toward the chest','Keep the other leg relaxed on the floor'], tips:'A gentle release for the lower back.' },
  'Gentle Supine Trunk Rotation': { icon:'🤸', muscles:'Spine, Obliques', timed:true, category:'Stretching', howTo:['Lie on your back, knees bent','Let both knees fall gently to one side','Keep shoulders flat on the floor'], tips:'Move slowly — this is a gentle spinal release, not a deep twist.' },
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
      'hiking', 'rockClimbing', 'trailRunning', 'mountainBike', 'skiing', 'snowboard', 'skateboard', 'surfing_out', 'paragliding',
      'dance', 'zumba', 'ballet', 'contemporary', 'salsa',
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
// ─────────────────────────────────────────────
// Exercise prescription helper
// sets/reps map directly onto what the workout session already
// consumes (WorkoutSession.initExercises reads ex.sets / ex.reps),
// so populating real values here replaces the old generic 3x10
// defaults with the actual prescribed workout — no session logic
// needed to change.
// For timed moves, `reps` holds the duration in seconds (this is
// the same convention the session already uses as its duration
// fallback). `note` is an optional short coaching cue shown in the
// workout detail view only.
// ─────────────────────────────────────────────
function rx(name, sets, reps, extra) {
  if (extra === undefined) return { name, sets, reps }
  if (typeof extra === 'string') return { name, sets, reps, note: extra }
  // extra is an options object: { note, restSec, repRange, unilateral, unilateralLabel, section }
  return { name, sets, reps, ...extra }
}

export const LIBRARY_WORKOUTS = [
  // ── GYM (WEIGHT TRAINING) ─────────────────
  // ── Beginner ──
  { id:'full_body', sport:'gym', name:'Beginner Full Body', icon:'🏋️', level:'Beginner', duration:'45 min', muscles:'All muscle groups',
    description:'Learn fundamental movement patterns and build a balanced strength foundation across the whole body.',
    suggestedRestSec:75,
    exercises:[
      rx('Brisk Walk or Easy Bike', 1, 180, { section:'warmup', restSec:0, note:'3 minutes, easy effort.' }),
      rx('Bodyweight Squat', 2, 10, { section:'warmup', restSec:30 }),
      rx('Arm Circles', 1, 10, { section:'warmup', restSec:0, note:'10 forward + 10 backward.' }),
      rx('Hip Hinge Drill', 1, 10, { section:'warmup', restSec:0 }),
      rx('Wall Push-Up', 1, 10, { section:'warmup', restSec:30, note:'Rest 30s before starting the main workout.' }),

      rx('Goblet Squat', 3, 10, { section:'main', restSec:75 }),
      rx('Dumbbell Bench Press', 3, 10, { section:'main', restSec:75 }),
      rx('Seated Cable Row', 3, 12, { section:'main', restSec:60 }),
      rx('Dumbbell Romanian Deadlift', 3, 10, { section:'main', restSec:90 }),
      rx('Seated Dumbbell Shoulder Press', 2, 10, { section:'main', restSec:60 }),
      rx('Plank', 3, 30, { section:'main', restSec:45, note:'Use light-to-moderate resistance throughout. Finish each set with ~2–3 good reps still possible.' }),

      rx('Slow Walk', 1, 120, { section:'cooldown', restSec:0 }),
      rx('Standing Quadriceps Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Doorway Chest Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Seated Hamstring Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Slow Diaphragmatic Breathing', 1, 30, { section:'cooldown', restSec:0, note:'5 controlled breaths.' }),
    ] },

  { id:'upper_body', sport:'gym', name:'Upper Body Foundation', icon:'🏋️', level:'Beginner', duration:'45–50 min', muscles:'Chest · Back · Shoulders · Arms',
    description:'Build balanced upper-body pushing and pulling strength.',
    suggestedRestSec:75,
    exercises:[
      rx('Easy Bike or Row', 1, 180, { section:'warmup', restSec:0 }),
      rx('Arm Circles', 1, 10, { section:'warmup', restSec:0, note:'10 each direction.' }),
      rx('Band Pull-Aparts', 2, 12, { section:'warmup', restSec:30 }),
      rx('Wall Push-Up', 1, 10, { section:'warmup', restSec:30 }),
      rx('Light Cable Row', 1, 12, { section:'warmup', restSec:45, note:'Rest 45s before starting the main workout.' }),

      rx('Dumbbell Bench Press', 3, 10, { section:'main', restSec:90 }),
      rx('Lat Pulldown or Assisted Pull-Up', 3, 10, { section:'main', restSec:90 }),
      rx('Seated Dumbbell Shoulder Press', 3, 10, { section:'main', restSec:75 }),
      rx('Seated Cable Row', 3, 12, { section:'main', restSec:75 }),
      rx('Dumbbell Lateral Raise', 2, 13, { section:'main', restSec:45, repRange:'12–15' }),
      rx('Triceps Rope Pushdown', 2, 12, { section:'main', restSec:60 }),
      rx('Dumbbell Curl', 2, 12, { section:'main', restSec:60, note:'Choose manageable resistance — focus on learning the movement patterns rather than reaching muscular failure.' }),

      rx('Easy Walk', 1, 60, { section:'cooldown', restSec:0 }),
      rx('Doorway Chest Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Lat Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Cross-Body Shoulder Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Slow Breathing', 1, 30, { section:'cooldown', restSec:0, note:'5 controlled breaths.' }),
    ] },

  { id:'lower_body_foundation', sport:'gym', name:'Lower Body Foundation', icon:'🦵', level:'Beginner', duration:'45–50 min', muscles:'Quads · Hamstrings · Glutes · Calves',
    description:'Teach the basic lower-body movement patterns — squat, hinge and lunge — while building confidence and technique.',
    suggestedRestSec:75,
    exercises:[
      rx('Easy Bike', 1, 180, { section:'warmup', restSec:0 }),
      rx('Bodyweight Squat', 2, 10, { section:'warmup', restSec:30 }),
      rx('Glute Bridge', 2, 10, { section:'warmup', restSec:30 }),
      rx('Hip Hinge Drill', 1, 10, { section:'warmup', restSec:30, note:'Rest 30s before starting the main workout.' }),

      rx('Goblet Squat', 3, 10, { section:'main', restSec:75, repRange:'8–12', note:'Sit back and down, chest up — this is the pattern every lower-body lift builds on.' }),
      rx('Dumbbell Romanian Deadlift', 3, 10, { section:'main', restSec:75, repRange:'8–12', note:'Hinge at the hips, weights stay close to the legs — feel the stretch in the hamstrings, not the lower back.' }),
      rx('Reverse Lunge', 2, 10, { section:'main', restSec:60, repRange:'8–12', unilateral:true, unilateralLabel:'each leg', note:'Front knee stays over the ankle. Rest 60s after both legs.' }),
      rx('Seated or Lying Leg Curl', 3, 12, { section:'main', restSec:60, repRange:'8–12' }),
      rx('Standing Calf Raise', 3, 12, { section:'main', restSec:60, repRange:'8–12', note:'Full range of motion — pause briefly at the top of each rep.' }),

      rx('Standing Quadriceps Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Hamstring Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Hip Flexor Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Calf Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
    ] },

  { id:'core_blast', sport:'gym', name:'Core Stability', icon:'🧘', level:'Beginner', duration:'25–30 min', muscles:'Core · Abs · Obliques',
    description:'Improve trunk control, anti-extension, anti-rotation and lateral stability.',
    suggestedRestSec:45,
    exercises:[
      rx('Cat-Cow', 1, 8, { section:'warmup', restSec:0, note:'8 controlled reps.' }),
      rx('Pelvic Tilt', 1, 10, { section:'warmup', restSec:0 }),
      rx('Glute Bridge', 2, 10, { section:'warmup', restSec:30 }),
      rx('Bird Dog Practice', 1, 6, { section:'warmup', restSec:30, unilateral:true, unilateralLabel:'each side' }),

      rx('Dead Bug', 3, 8, { section:'main', restSec:45, unilateral:true, unilateralLabel:'each side' }),
      rx('Front Plank', 3, 35, { section:'main', restSec:45, repRange:'30–40s' }),
      rx('Bird Dog', 3, 8, { section:'main', restSec:45, unilateral:true, unilateralLabel:'each side' }),
      rx('Side Plank from Knees or Feet', 2, 25, { section:'main', restSec:45, repRange:'20–30s', unilateral:true, unilateralLabel:'each side', note:'Rest 45s after both sides.' }),
      rx('Pallof Press', 3, 10, { section:'main', restSec:60, unilateral:true, unilateralLabel:'each side', note:'Rest 60s after both sides.' }),
      rx('Suitcase Carry', 3, 30, { section:'main', restSec:60, unilateral:true, unilateralLabel:'each side', note:'Rest 60s after both sides. Prioritise breathing, control and trunk position — stop a set once good alignment can no longer be held.' }),

      rx('Child\'s Pose', 1, 45, { section:'cooldown', restSec:0 }),
      rx('Supine Knee-to-Chest Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Gentle Supine Trunk Rotation', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Diaphragmatic Breathing', 1, 30, { section:'cooldown', restSec:0, note:'6 slow breaths.' }),
    ] },

  // ── Intermediate ──
  { id:'push_day', sport:'gym', name:'Push Day', icon:'💪', level:'Intermediate', duration:'55–65 min', muscles:'Chest · Shoulders · Triceps',
    description:'Develop chest, shoulder and triceps strength and muscular development.',
    suggestedRestSec:90,
    exercises:[
      rx('Easy Rowing or Bike', 1, 180, { section:'warmup', restSec:0 }),
      rx('Arm Circles', 1, 10, { section:'warmup', restSec:0, note:'10 forward + 10 backward.' }),
      rx('Band Pull-Aparts', 2, 15, { section:'warmup', restSec:30 }),
      rx('Scapular Push-Ups', 2, 8, { section:'warmup', restSec:30 }),
      rx('Push Ups', 1, 8, { section:'warmup', restSec:45, note:'8 easy, controlled reps.' }),
      rx('Barbell Bench Press', 1, 5, { section:'warmup', restSec:45, note:'Progressive light warm-up sets before your first working set below — these do not count as working sets.' }),

      rx('Barbell Bench Press', 4, 7, { section:'main', restSec:120, repRange:'6–8' }),
      rx('Incline Dumbbell Press', 3, 9, { section:'main', restSec:90, repRange:'8–10' }),
      rx('Seated Dumbbell Shoulder Press', 3, 9, { section:'main', restSec:90, repRange:'8–10' }),
      rx('Cable Chest Fly', 3, 13, { section:'main', restSec:60, repRange:'12–15' }),
      rx('Dumbbell Lateral Raise', 3, 13, { section:'main', restSec:60, repRange:'12–15' }),
      rx('Triceps Rope Pushdown', 3, 11, { section:'main', restSec:60, repRange:'10–12', note:'Use controlled reps and keep ~1–2 in reserve on most sets.' }),

      rx('Easy Walk', 1, 60, { section:'cooldown', restSec:0 }),
      rx('Doorway Chest Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Cross-Body Shoulder Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Overhead Triceps Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Slow Breathing', 1, 30, { section:'cooldown', restSec:0, note:'5 controlled breaths.' }),
    ] },

  { id:'pull_day', sport:'gym', name:'Pull Day', icon:'🦾', level:'Intermediate', duration:'55–65 min', muscles:'Back · Biceps · Rear Delts',
    description:'Develop the back, rear shoulders and biceps through balanced vertical and horizontal pulling.',
    suggestedRestSec:90,
    exercises:[
      rx('Easy Rowing Machine', 1, 180, { section:'warmup', restSec:0 }),
      rx('Band Pull-Aparts', 2, 15, { section:'warmup', restSec:30 }),
      rx('Band Straight-Arm Pulldown', 2, 12, { section:'warmup', restSec:30 }),
      rx('Scapular Pull-Up or Scapular Pulldown', 2, 8, { section:'warmup', restSec:30 }),
      rx('Light Cable Row', 1, 15, { section:'warmup', restSec:45, note:'Rest 45s before starting the main workout.' }),

      rx('Lat Pulldown or Assisted Pull-Up', 4, 9, { section:'main', restSec:90, repRange:'8–10' }),
      rx('Seated Cable Row', 3, 9, { section:'main', restSec:90, repRange:'8–10' }),
      rx('Chest-Supported Dumbbell Row', 3, 10, { section:'main', restSec:90 }),
      rx('Face Pull', 3, 13, { section:'main', restSec:60, repRange:'12–15' }),
      rx('Dumbbell Curl', 3, 11, { section:'main', restSec:60, repRange:'10–12' }),
      rx('Hammer Curl', 2, 12, { section:'main', restSec:60, note:'Lead with controlled shoulder-blade movement — avoid body momentum on rows and curls.' }),

      rx('Easy Walk', 1, 60, { section:'cooldown', restSec:0 }),
      rx('Lat Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Cross-Body Rear Shoulder Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Forearm Flexor Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Slow Breathing', 1, 30, { section:'cooldown', restSec:0, note:'5 controlled breaths.' }),
    ] },

  { id:'leg_day', sport:'gym', name:'Leg Day', icon:'🦵', level:'Intermediate', duration:'60–70 min', muscles:'Quads · Hamstrings · Glutes',
    description:'Train the quadriceps, hamstrings, glutes and calves through complementary lower-body movement patterns.',
    suggestedRestSec:120,
    exercises:[
      rx('Easy Bike', 1, 240, { section:'warmup', restSec:0 }),
      rx('Bodyweight Squat', 2, 10, { section:'warmup', restSec:30 }),
      rx('Glute Bridge', 2, 10, { section:'warmup', restSec:30 }),
      rx('Reverse Lunge', 1, 6, { section:'warmup', restSec:30, unilateral:true, unilateralLabel:'each leg' }),
      rx('Hip Hinge Drill', 1, 10, { section:'warmup', restSec:30 }),
      rx('Back Squat', 1, 5, { section:'warmup', restSec:30, note:'Progressive light warm-up sets before your first working set below — these do not count as working sets.' }),

      rx('Back Squat', 4, 7, { section:'main', restSec:150, repRange:'6–8' }),
      rx('Romanian Deadlift', 3, 9, { section:'main', restSec:120, repRange:'8–10' }),
      rx('Leg Press', 3, 11, { section:'main', restSec:90, repRange:'10–12' }),
      rx('Walking Lunge', 3, 10, { section:'main', restSec:90, unilateral:true, unilateralLabel:'each leg', note:'Rest 90s after both legs are completed.' }),
      rx('Seated or Lying Leg Curl', 3, 11, { section:'main', restSec:60, repRange:'10–12' }),
      rx('Standing Calf Raise', 4, 13, { section:'main', restSec:60, repRange:'12–15', note:'Prioritise controlled range of motion — use loads that allow the prescribed reps without technical breakdown.' }),

      rx('Slow Walk', 1, 120, { section:'cooldown', restSec:0 }),
      rx('Standing Quadriceps Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Hamstring Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Half-Kneeling Hip Flexor Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Calf Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
    ] },

  // ── Advanced ──
  { id:'adv_full_body_strength', sport:'gym', name:'Advanced Full Body Strength', icon:'🏋️', level:'Advanced', duration:'65–75 min', muscles:'Full Body · Max Strength',
    description:'Develop maximal strength using the big compound lifts. A demanding session — recover well before repeating it.',
    suggestedRestSec:150,
    exercises:[
      rx('Easy Rowing or Bike', 1, 180, { section:'warmup', restSec:0 }),
      rx('Bodyweight Squat', 2, 10, { section:'warmup', restSec:30 }),
      rx('Hip Hinge Drill', 1, 10, { section:'warmup', restSec:30 }),
      rx('Arm Circles', 1, 10, { section:'warmup', restSec:30, note:'10 forward + 10 backward. Rest 30s before starting the main workout.' }),

      rx('Back Squat', 4, 5, { section:'main', restSec:180, repRange:'3–5' }),
      rx('Bench Press', 4, 5, { section:'main', restSec:180, repRange:'3–5' }),
      rx('Deadlift', 3, 3, { section:'main', restSec:180, repRange:'3', note:'Legs are already loaded from squatting — this is a lighter top set, not a max effort pull. Keep it crisp.' }),
      rx('Pull Ups', 3, 6, { section:'main', restSec:120, repRange:'5–6' }),
      rx('Overhead Press', 3, 6, { section:'main', restSec:120, repRange:'5–6' }),
      rx('Farmer\'s Carry', 3, 40, { section:'main', restSec:90, note:'By distance or time — tall posture, don\'t let the shoulders round.' }),

      rx('Slow Walk', 1, 120, { section:'cooldown', restSec:0 }),
      rx('Standing Quadriceps Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Hamstring Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Doorway Chest Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Lat Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
    ] },

  { id:'adv_upper_body_strength', sport:'gym', name:'Advanced Upper Body Strength', icon:'💪', level:'Advanced', duration:'60–70 min', muscles:'Chest · Back · Shoulders · Arms',
    description:'A demanding upper-body strength session for experienced lifters — heavy compounds first, targeted accessory work to finish.',
    suggestedRestSec:120,
    exercises:[
      rx('Easy Rowing Machine', 1, 180, { section:'warmup', restSec:0 }),
      rx('Band Pull-Aparts', 2, 15, { section:'warmup', restSec:30 }),
      rx('Scapular Push-Ups', 2, 8, { section:'warmup', restSec:30 }),
      rx('Band Straight-Arm Pulldown', 2, 12, { section:'warmup', restSec:30, note:'Rest 30s before starting the main workout.' }),

      rx('Bench Press', 4, 6, { section:'main', restSec:150, repRange:'4–6' }),
      rx('Pull Ups', 4, 6, { section:'main', restSec:150, repRange:'4–6' }),
      rx('Overhead Press', 3, 6, { section:'main', restSec:120, repRange:'4–6' }),
      rx('Bent Over Row', 3, 8, { section:'main', restSec:90, repRange:'6–8' }),
      rx('Incline Dumbbell Press', 3, 10, { section:'main', restSec:90, repRange:'8–10' }),
      rx('Dips', 3, 10, { section:'main', restSec:75, repRange:'8–10' }),
      rx('Face Pull', 3, 15, { section:'main', restSec:60, repRange:'12–15', note:'Keep accessory work controlled — this is about quality volume, not grinding to failure.' }),

      rx('Easy Walk', 1, 60, { section:'cooldown', restSec:0 }),
      rx('Doorway Chest Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Cross-Body Shoulder Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Overhead Triceps Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
      rx('Lat Stretch', 1, 30, { section:'cooldown', restSec:0, unilateral:true, unilateralLabel:'each side' }),
    ] },

  // ── CROSSFIT ──────────────────────────────
  { id:'wod_classic', sport:'crossfit', name:'Classic WOD', icon:'🔥', level:'Advanced', duration:'20 min', muscles:'Full Body',
    description:'5 rounds for time: burpees, kettlebell swings, box jumps, thrusters and wall balls. Scale the reps down if form starts to break down.',
    suggestedRestSec:75,
    exercises:[
      rx('Burpee', 5, 10, 'Round 1 of 5.'),
      rx('Kettlebell Swing', 5, 15, ''),
      rx('Box Jump', 5, 10, 'Step down between reps if jumping down feels risky.'),
      rx('Thruster', 5, 8, ''),
      rx('Wall Ball', 5, 12, 'Rest 60–90s between full rounds, less as fitness improves.'),
    ] },
  { id:'wod_beginner', sport:'crossfit', name:'Beginner WOD', icon:'🔥', level:'Beginner', duration:'20 min', muscles:'Full Body',
    description:'A gentler introduction to CrossFit-style circuits — 4 rounds at a controlled pace. Technique first, speed later.',
    suggestedRestSec:75,
    exercises:[
      rx('Burpee', 4, 6, ''),
      rx('Jump Squat', 4, 10, ''),
      rx('Mountain Climbers', 4, 20, ''),
      rx('Jumping Jacks', 4, 20, 'Rest 60–90s between rounds as needed.'),
    ] },

  // ── CALISTHENICS ──────────────────────────
  { id:'cali_basics', sport:'calisthenics', name:'Calisthenics Basics', icon:'💪', level:'Beginner', duration:'35 min', muscles:'Full Body, Bodyweight',
    description:'Fundamental bodyweight movements everyone should own before progressing to harder skills.',
    suggestedRestSec:60,
    exercises:[
      rx('Push Ups', 3, 12, 'Rest ~60s.'),
      rx('Pull Ups', 3, 6, 'Use an assisted band if needed. Rest ~90s.'),
      rx('Squat', 3, 15, 'Rest ~60s.'),
      rx('Dips', 3, 10, 'Rest ~75s.'),
      rx('Plank', 3, 30, 'Hold, breathe steadily.'),
    ] },
  { id:'cali_advanced', sport:'calisthenics', name:'Advanced Skills', icon:'💪', level:'Advanced', duration:'40 min', muscles:'Full Body Strength',
    description:'Advanced bodyweight skills requiring real strength and balance — expect these to take practice over several sessions.',
    suggestedRestSec:75,
    exercises:[
      rx('Handstand Hold', 4, 20, 'Against a wall until balance is solid freestanding. Rest ~60s.'),
      rx('L-Sit', 4, 15, 'Bent knees is fine while building strength. Rest ~60s.'),
      rx('Pistol Squat', 3, 6, 'Per leg — hold a support if needed. Rest ~90s.'),
      rx('Pull Ups', 4, 8, 'Rest ~90s.'),
      rx('Dips', 4, 10, 'Rest ~75s.'),
    ] },

  // ── KETTLEBELL ────────────────────────────
  { id:'kb_beginner', sport:'kettlebell', name:'KB Foundations', icon:'🔔', level:'Beginner', duration:'30 min', muscles:'Full Body',
    description:'The three kettlebell movements everyone should learn first, at a pace that lets you focus on technique.',
    suggestedRestSec:60,
    exercises:[
      rx('Kettlebell Swing', 3, 12, 'Power from the hips, not the arms. Rest ~60s.'),
      rx('Goblet Squat', 3, 12, 'Rest ~60s.'),
      rx('Kettlebell Clean', 3, 8, 'Per side. Rest ~75s.'),
    ] },
  { id:'kb_power', sport:'kettlebell', name:'KB Power Circuit', icon:'🔔', level:'Intermediate', duration:'35 min', muscles:'Full Body, Power',
    description:'Builds on the fundamentals with more volume and the Turkish get-up for full-body stability.',
    suggestedRestSec:75,
    exercises:[
      rx('Kettlebell Swing', 4, 15, 'Rest ~60s.'),
      rx('Turkish Get Up', 3, 5, 'Per side, slow and controlled. Rest ~90s.'),
      rx('Kettlebell Clean', 4, 8, 'Rest ~75s.'),
      rx('Goblet Squat', 4, 12, 'Rest ~60s.'),
    ] },

  // ── FUNCTIONAL ────────────────────────────
  { id:'functional1', sport:'functional', name:'Functional Fitness', icon:'⚙️', level:'Intermediate', duration:'40 min', muscles:'Full Body',
    description:'Real-world movement patterns — carrying, slamming, swinging — for everyday strength that carries over outside the gym.',
    suggestedRestSec:60,
    exercises:[
      rx('Farmer\'s Carry', 3, 40, 'Tall posture, don\'t let shoulders round. Rest ~60s.'),
      rx('Battle Ropes', 4, 30, 'Rest ~45s.'),
      rx('Medicine Ball Slam', 3, 15, 'Rest ~45s.'),
      rx('Burpee', 3, 10, 'Rest ~60s.'),
      rx('Squat', 3, 15, 'Rest ~60s.'),
    ] },

  // ── RUNNING ───────────────────────────────
  { id:'run_easy', sport:'running', name:'Easy Run', icon:'🏃', level:'Beginner', duration:'30 min', muscles:'Legs, Cardiovascular',
    description:'A comfortable, conversational-pace run to build your aerobic base. You should be able to talk in full sentences throughout.',
    exercises:[ rx('Running', 1, 1800, 'Continuous, easy pace — walk if you need to.') ] },
  { id:'run_interval', sport:'running', name:'Interval Training', icon:'🏃', level:'Intermediate', duration:'40 min', muscles:'Speed, Endurance',
    description:'6 rounds of 90 seconds brisk running with 90 seconds walking to recover. Repeat the full set, building speed each round.',
    suggestedRestSec:90,
    exercises:[
      rx('Running', 6, 90, '90s at a brisk, faster-than-easy pace.'),
      rx('Walking', 6, 90, '90s recovery walk between running efforts.'),
    ] },
  { id:'run_long', sport:'running', name:'Long Run', icon:'🏃', level:'Intermediate', duration:'60–90 min', muscles:'Legs, Endurance',
    description:'A longer, steady-state run to build aerobic endurance and mental toughness. Keep the pace easy — this is about time on your feet, not speed.',
    exercises:[ rx('Running', 1, 4500, 'Steady, easy pace for 60–90 min. Walk breaks are fine.') ] },
  { id:'run_5k', sport:'running', name:'5K Training', icon:'🏃', level:'Beginner', duration:'25–35 min', muscles:'Legs, Cardiovascular',
    description:'Building block for running a continuous 5K. Run as much as you can, walk when you need to, and aim to run a little more each week.',
    exercises:[ rx('Running', 1, 1500, 'Run continuously if possible; alternate walk/jog if still building up.') ] },

  // ── WALKING ───────────────────────────────
  { id:'walk_power', sport:'walking', name:'Power Walk', icon:'🚶', level:'Beginner', duration:'45 min', muscles:'Legs, Cardiovascular',
    description:'A brisk 45-minute walk for cardio and fat burn — low impact, accessible to almost everyone.',
    exercises:[ rx('Walking', 1, 2700, 'Brisk pace, arms swinging naturally.') ] },
  { id:'walk_hiit', sport:'walking', name:'Walk-Run Intervals', icon:'🚶', level:'Beginner', duration:'30 min', muscles:'Legs, Cardio',
    description:'Alternating walk and light jog intervals — a gentle way to build toward continuous running.',
    suggestedRestSec:0,
    exercises:[
      rx('Walking', 5, 180, '3 min walk.'),
      rx('Running', 5, 60, '1 min light jog. Repeat the pair 5 times.'),
    ] },

  // ── CYCLING ───────────────────────────────
  { id:'cycle_endur', sport:'cycling', name:'Endurance Ride', icon:'🚴', level:'Beginner', duration:'45 min', muscles:'Legs, Cardiovascular',
    description:'Steady-state cycling at a moderate, sustainable effort to build aerobic endurance.',
    exercises:[ rx('Cycling', 1, 2700, 'Moderate, steady effort — cadence 80–100 RPM.') ] },
  { id:'cycle_hiit', sport:'cycling', name:'Cycling Intervals', icon:'🚴', level:'Intermediate', duration:'30 min', muscles:'Legs, Cardio',
    description:'8 rounds of hard 1-minute efforts with easy recovery spins between — a proven way to build speed and power.',
    suggestedRestSec:90,
    exercises:[ rx('Cycling', 8, 60, '1 min hard effort, then ~90s easy recovery spin between rounds.') ] },

  // ── HIIT ──────────────────────────────────
  { id:'hiit_20', sport:'hiit', name:'20-Min HIIT', icon:'⚡', level:'Intermediate', duration:'20 min', muscles:'Full Body',
    description:'8 rounds of 40 seconds work with 20 seconds rest, rotating through 4 exercises. High effort, short and effective.',
    suggestedRestSec:20,
    exercises:[
      rx('HIIT', 8, 40, '40s work / 20s rest.'),
      rx('Mountain Climbers', 6, 30, '40s work / 20s rest.'),
      rx('Jump Rope', 6, 45, '40s work / 20s rest.'),
      rx('High Knees', 6, 30, '40s work / 20s rest.'),
    ] },
  { id:'hiit_tabata', sport:'hiit', name:'Tabata Protocol', icon:'⚡', level:'Advanced', duration:'16 min', muscles:'Full Body',
    description:'True Tabata: 20 seconds maximum effort, 10 seconds rest, 8 rounds per exercise. Brutal but short.',
    suggestedRestSec:10,
    exercises:[
      rx('Jump Squat', 8, 20, '20s on / 10s off.'),
      rx('Burpee', 8, 20, '20s on / 10s off.'),
      rx('Mountain Climbers', 8, 20, '20s on / 10s off.'),
      rx('High Knees', 8, 20, '20s on / 10s off.'),
      rx('Jumping Jacks', 8, 20, '20s on / 10s off.'),
    ] },
  { id:'hiit_beginner', sport:'hiit', name:'HIIT for Beginners', icon:'⚡', level:'Beginner', duration:'15 min', muscles:'Full Body',
    description:'5 rounds of 20 seconds work with a generous 40 seconds rest — a gentle introduction to interval training.',
    suggestedRestSec:40,
    exercises:[
      rx('Jumping Jacks', 5, 20, '20s work / 40s rest.'),
      rx('High Knees', 5, 20, '20s work / 40s rest.'),
      rx('Jump Squat', 5, 20, '20s work / 40s rest.'),
      rx('Mountain Climbers', 5, 20, '20s work / 40s rest. Work at your own pace.'),
    ] },

  // ── JUMP ROPE ─────────────────────────────
  { id:'rope_basics', sport:'jumpRope', name:'Jump Rope Basics', icon:'🪢', level:'Beginner', duration:'20 min', muscles:'Full Body, Calves',
    description:'Learn to find a steady rhythm before building speed — the fundamental skill behind every jump rope workout.',
    suggestedRestSec:45,
    exercises:[ rx('Jump Rope', 5, 60, 'Focus on rhythm, not speed. Rest ~45s between sets.') ] },
  { id:'rope_hiit', sport:'jumpRope', name:'Jump Rope HIIT', icon:'🪢', level:'Intermediate', duration:'20 min', muscles:'Full Body, Cardio',
    description:'Jump rope intervals mixed with bodyweight cardio for a well-rounded conditioning session.',
    suggestedRestSec:20,
    exercises:[
      rx('Jump Rope', 6, 45, ''),
      rx('Jumping Jacks', 6, 30, ''),
      rx('High Knees', 6, 30, 'Rest ~20s between each set.'),
    ] },

  // ── SWIMMING ──────────────────────────────
  { id:'swim_laps', sport:'swimming', name:'Lap Swimming', icon:'🏊', level:'Beginner', duration:'30 min', muscles:'Full Body, Low Impact',
    description:'Easy, technique-focused laps — zero joint impact, great for building base fitness or recovering.',
    exercises:[ rx('Swimming', 1, 1500, 'Easy pace, rest at the wall between lengths as needed.') ] },
  { id:'swim_endur', sport:'swimming', name:'Endurance Swim', icon:'🏊', level:'Intermediate', duration:'45 min', muscles:'Full Body, Endurance',
    description:'Longer continuous swimming to build real stamina — increase distance gradually week to week.',
    exercises:[ rx('Swimming', 1, 2400, 'Steady pace, minimal rest at the wall.') ] },

  // ── ROWING ────────────────────────────────
  { id:'row_endur', sport:'rowing', name:'Rowing Endurance', icon:'🚣', level:'Intermediate', duration:'30 min', muscles:'Full Body, Back',
    description:'Steady-state rowing to build conditioning. Focus on the legs-back-arms sequence on every stroke.',
    exercises:[ rx('Rowing Machine', 1, 1500, 'Steady pace — legs drive first, then lean back, then pull arms.') ] },
  { id:'row_power', sport:'rowing', name:'Rowing Power', icon:'🚣', level:'Advanced', duration:'25 min', muscles:'Full Body, Power',
    description:'6 rounds of hard 90-second pulls with equal rest — a demanding way to build rowing power.',
    suggestedRestSec:90,
    exercises:[ rx('Rowing Machine', 6, 90, 'Hard effort for 90s, then ~90s easy rest.') ] },

  // ── YOGA ──────────────────────────────────
  { id:'yoga_morning', sport:'yoga', name:'Morning Flow', icon:'🌅', level:'Beginner', duration:'20 min', muscles:'Full Body, Flexibility',
    description:'A gentle flow to wake the body up. Move with your breath — inhale to extend, exhale to fold.',
    exercises:[
      rx('Sun Salutation', 3, 60, 'One full round per set — inhale to extend, exhale to fold.'),
      rx('Warrior Pose', 2, 30, 'Hold each side, breathing steadily.'),
      rx('Downward Dog', 2, 30, 'Press heels toward the floor, relax the neck.'),
      rx('Child\'s Pose', 1, 60, 'Rest here — return anytime you need to during the flow.'),
    ] },
  { id:'yoga_yin', sport:'yoga', name:'Yin Yoga', icon:'🧘', level:'Beginner', duration:'45 min', muscles:'Deep Tissue, Flexibility',
    description:'Long, passive holds (1–3 minutes each) for deep flexibility. Breathe slowly and let gravity do the work — never force a stretch.',
    exercises:[
      rx('Child\'s Pose', 1, 120, 'Slow, deep breathing throughout.'),
      rx('Pigeon Pose', 2, 90, 'Per side. Ease in gradually.'),
      rx('Downward Dog', 2, 60, 'Bend knees if hamstrings are tight.'),
    ] },
  { id:'yoga_power', sport:'yoga', name:'Power Yoga', icon:'🧘', level:'Intermediate', duration:'45 min', muscles:'Strength, Flexibility',
    description:'A dynamic, flowing practice that builds strength alongside flexibility — expect to work up a sweat.',
    exercises:[
      rx('Sun Salutation', 4, 45, 'Keep the pace flowing between poses.'),
      rx('Warrior Pose', 2, 30, 'Per side.'),
      rx('Downward Dog', 3, 30, ''),
      rx('Plank', 3, 30, 'Hold with control.'),
    ] },

  // ── PILATES ───────────────────────────────
  { id:'pilates_core', sport:'pilates', name:'Core Pilates', icon:'🧘', level:'Beginner', duration:'30 min', muscles:'Core, Spine, Posture',
    description:'Low-impact core work built around control and breath, not speed or heavy load.',
    exercises:[
      rx('The Hundred', 1, 100, 'Pump the arms in time with 5-count breaths — lower back stays pressed into the mat.'),
      rx('Roll Up', 3, 8, 'Slow and controlled — this is spine articulation, not a sit-up.'),
      rx('Plank', 3, 30, 'Hold with control.'),
    ] },
  { id:'pilates_full', sport:'pilates', name:'Full Body Pilates', icon:'🧘', level:'Intermediate', duration:'45 min', muscles:'Full Body, Core',
    description:'A complete Pilates session working the whole body with an emphasis on control and precision.',
    exercises:[
      rx('The Hundred', 1, 100, 'Steady breathing throughout.'),
      rx('Roll Up', 3, 8, ''),
      rx('Plank', 3, 30, ''),
      rx('Leg Raises', 3, 12, 'Lower slowly — control over speed.'),
    ] },

  // ── STRETCHING ────────────────────────────
  { id:'stretch_full', sport:'stretching', name:'Full Body Stretch', icon:'🤸', level:'Beginner', duration:'20 min', muscles:'Full Body Flexibility',
    description:'A complete stretching routine to reduce soreness and improve mobility. Never force a stretch — ease in and breathe.',
    exercises:[
      rx('Hamstring Stretch', 1, 45, 'Per side, breathe deeply.'),
      rx('Hip Flexor Stretch', 1, 45, 'Per side.'),
      rx('Chest Opener', 1, 30, ''),
      rx('Pigeon Pose', 1, 90, 'Per side — one of the best hip openers, take your time.'),
      rx('Child\'s Pose', 1, 60, 'Finish here, relaxed breathing.'),
    ] },
  { id:'stretch_post', sport:'stretching', name:'Post-Workout Stretch', icon:'🤸', level:'Beginner', duration:'15 min', muscles:'Muscles Worked',
    description:'A short cool-down stretch to do after any workout — helps with recovery and next-day soreness.',
    exercises:[
      rx('Hamstring Stretch', 1, 30, 'Per side.'),
      rx('Chest Opener', 1, 30, ''),
      rx('Pigeon Pose', 1, 60, 'Per side.'),
    ] },

  // ── BOXING ────────────────────────────────
  { id:'box_basics', sport:'boxing', name:'Boxing Basics', icon:'🥊', level:'Beginner', duration:'30 min', muscles:'Full Body, Cardio',
    description:'Learn the fundamental punches and footwork over 3 rounds. Focus on form, not power, while the technique is new.',
    suggestedRestSec:60,
    exercises:[
      rx('Shadow Boxing', 3, 120, '2-min rounds, 1 min rest between.'),
      rx('Jab-Cross', 3, 60, '1-min rounds — keep hands up, return to guard after every punch.'),
    ] },
  { id:'box_advanced', sport:'boxing', name:'Boxing Conditioning', icon:'🥊', level:'Advanced', duration:'45 min', muscles:'Full Body, Power',
    description:'5 rounds of heavy bag work mixed with shadow boxing and combinations — real conditioning for experienced boxers.',
    suggestedRestSec:60,
    exercises:[
      rx('Heavy Bag', 5, 180, '3-min rounds, 1 min rest.'),
      rx('Shadow Boxing', 3, 120, ''),
      rx('Jab-Cross', 4, 90, ''),
      rx('Jump Rope', 3, 120, 'Between-round conditioning.'),
    ] },

  // ── MUAY THAI ─────────────────────────────
  { id:'muay_basics', sport:'muay_thai', name:'Muay Thai Basics', icon:'🥊', level:'Beginner', duration:'30 min', muscles:'Full Body, Kicks',
    description:'An introduction to the Art of Eight Limbs — punches and kicks over controlled rounds. Beginner-safe pace.',
    suggestedRestSec:60,
    exercises:[
      rx('Shadow Boxing', 3, 120, '2-min rounds, 1 min rest.'),
      rx('Roundhouse Kick', 3, 10, 'Per leg — slow and controlled while learning the technique.'),
      rx('Jab-Cross', 3, 90, ''),
    ] },

  // ── MARTIAL ARTS ──────────────────────────
  { id:'martial1', sport:'martial', name:'Martial Arts Basics', icon:'🥋', level:'Beginner', duration:'30 min', muscles:'Full Body',
    description:'Fundamentals covering stances, punches and kicks, finished with kata practice for precision. A safe, beginner pace throughout.',
    suggestedRestSec:60,
    exercises:[
      rx('Shadow Boxing', 3, 90, ''),
      rx('Jab-Cross', 3, 60, ''),
      rx('Roundhouse Kick', 3, 8, 'Per leg, controlled tempo.'),
      rx('Kata Practice', 2, 60, 'Slow and deliberate — precision over speed.'),
    ] },

  // ── MMA ───────────────────────────────────
  { id:'mma_cond', sport:'mma', name:'MMA Conditioning', icon:'🥋', level:'Advanced', duration:'45 min', muscles:'Full Body, Power, Cardio',
    description:'A demanding mixed martial arts conditioning circuit. Scale the rounds down if you\'re new to combat conditioning.',
    suggestedRestSec:45,
    exercises:[
      rx('Burpee', 5, 10, ''),
      rx('Shadow Boxing', 5, 90, ''),
      rx('Roundhouse Kick', 4, 10, 'Per leg.'),
      rx('Battle Ropes', 4, 30, ''),
      rx('Mountain Climbers', 4, 30, 'Rest ~45s between exercises.'),
    ] },

  // ── TENNIS ────────────────────────────────
  { id:'tennis_cond', sport:'tennis', name:'Tennis Conditioning', icon:'🎾', level:'Intermediate', duration:'35 min', muscles:'Agility, Shoulder, Core',
    description:'Off-court conditioning to build the footwork, shoulder endurance and core strength tennis demands.',
    suggestedRestSec:45,
    exercises:[
      rx('Tennis Forehand', 3, 20, 'Shadow swings, both sides.'),
      rx('High Knees', 4, 30, ''),
      rx('Lateral Raise', 3, 15, ''),
      rx('Plank', 3, 40, ''),
    ] },

  // ── BADMINTON ─────────────────────────────
  { id:'badminton1', sport:'badminton', name:'Badminton Training', icon:'🏸', level:'Beginner', duration:'30 min', muscles:'Shoulder, Legs, Agility',
    description:'Builds smash power and the quick court movement badminton needs, with beginner-friendly conditioning.',
    suggestedRestSec:45,
    exercises:[
      rx('Badminton Smash', 3, 15, 'Shadow swings.'),
      rx('High Knees', 4, 30, ''),
      rx('Jumping Jacks', 4, 30, ''),
    ] },

  // ── FOOTBALL / SOCCER ─────────────────────
  { id:'football_fit', sport:'football', name:'Football Fitness', icon:'⚽', level:'Intermediate', duration:'40 min', muscles:'Speed, Legs, Agility',
    description:'Sprint and conditioning work for football players — most of the game is short explosive bursts, so that\'s what this trains.',
    suggestedRestSec:40,
    exercises:[
      rx('Football Sprint', 6, 20, '20s sprint effort, ~40s recovery between.'),
      rx('High Knees', 4, 30, ''),
      rx('Jump Squat', 3, 12, ''),
      rx('Plank', 3, 40, ''),
    ] },

  // ── BASKETBALL ────────────────────────────
  { id:'bball_cond', sport:'basketball', name:'Basketball Conditioning', icon:'🏀', level:'Intermediate', duration:'35 min', muscles:'Legs, Agility, Cardio',
    description:'Agility and conditioning work to support quick direction changes and repeated jumping on the court.',
    suggestedRestSec:45,
    exercises:[
      rx('Basketball Dribbling', 3, 60, 'Both hands.'),
      rx('Jump Squat', 4, 12, ''),
      rx('High Knees', 4, 30, ''),
      rx('Plank', 3, 40, ''),
    ] },

  // ── VOLLEYBALL ────────────────────────────
  { id:'volley_cond', sport:'volleyball', name:'Volleyball Training', icon:'🏐', level:'Intermediate', duration:'35 min', muscles:'Legs, Shoulder, Jump',
    description:'Jump training and shoulder conditioning to support repeated spikes and blocks.',
    suggestedRestSec:45,
    exercises:[
      rx('Volleyball Spike', 3, 10, 'Shadow reps, full arm swing.'),
      rx('Jump Squat', 4, 12, ''),
      rx('Lateral Raise', 3, 15, ''),
      rx('Plank', 3, 40, ''),
    ] },

  // ── GOLF ──────────────────────────────────
  { id:'golf_fitness', sport:'golf', name:'Golf Fitness', icon:'⛳', level:'Beginner', duration:'30 min', muscles:'Core, Rotation, Stability',
    description:'Core strength and rotational work to support a more powerful, injury-resistant golf swing.',
    exercises:[
      rx('Golf Swing', 3, 15, 'Shadow swings, both directions.'),
      rx('Russian Twist', 3, 20, ''),
      rx('Plank', 3, 40, ''),
      rx('Hip Flexor Stretch', 1, 45, 'Per side.'),
    ] },

  // ── DANCE ─────────────────────────────────
  { id:'dance_zumba', sport:'dance', name:'Zumba Flow', icon:'💃', level:'Beginner', duration:'45 min', muscles:'Full Body, Coordination',
    description:'Dance your way to fitness — no experience needed. This is about moving to the music, not perfect form.',
    exercises:[
      rx('Zumba Basic Step', 4, 180, 'Follow your own rhythm, 3-min blocks.'),
      rx('Jumping Jacks', 3, 30, ''),
    ] },
  { id:'hiphop1', sport:'dance', name:'Hip Hop Dance', icon:'🎤', level:'Beginner', duration:'40 min', muscles:'Full Body, Coordination',
    description:'Fun cardio through hip hop movement — a beginner-friendly way to build coordination and get your heart rate up.',
    exercises:[
      rx('Zumba Basic Step', 4, 180, ''),
      rx('High Knees', 3, 30, ''),
      rx('Jumping Jacks', 3, 30, ''),
    ] },

  // ── GYMNASTICS ────────────────────────────
  { id:'gymn_basics', sport:'gymnastics', name:'Gymnastics Basics', icon:'🤸', level:'Beginner', duration:'30 min', muscles:'Full Body, Coordination',
    description:'Fundamental gymnastics skills for beginners. Practice on a soft mat and get a spot if you\'re new to these movements.',
    exercises:[
      rx('Cartwheel', 3, 6, 'Per side, on a mat.'),
      rx('Handstand Hold', 3, 15, 'Against a wall.'),
      rx('Plank', 3, 30, ''),
      rx('Push Ups', 3, 10, ''),
    ] },

  // ── HIKING ────────────────────────────────
  { id:'hike_prep', sport:'hiking', name:'Hiking Prep', icon:'🥾', level:'Beginner', duration:'40 min', muscles:'Legs, Core, Endurance',
    description:'Builds the leg strength and endurance hiking demands — walk on an incline if you can to mimic trail conditions.',
    exercises:[
      rx('Walking', 1, 1800, 'Incline if possible.'),
      rx('Lunges', 3, 12, 'Per leg.'),
      rx('Calf Raises', 3, 15, ''),
      rx('Hip Flexor Stretch', 1, 45, 'Per side.'),
    ] },
  { id:'hike_strength', sport:'hiking', name:'Hiker\'s Strength', icon:'🥾', level:'Intermediate', duration:'45 min', muscles:'Legs, Back, Core',
    description:'Functional strength work for the trails — legs, back and core, plus a loaded carry to build real-world resilience.',
    suggestedRestSec:75,
    exercises:[
      rx('Squat', 4, 12, ''),
      rx('Romanian Deadlift', 3, 10, ''),
      rx('Calf Raises', 3, 15, ''),
      rx('Plank', 3, 40, ''),
      rx('Farmer\'s Carry', 3, 40, ''),
    ] },

  // ── ROCK CLIMBING ─────────────────────────
  { id:'climb_cond', sport:'rockClimbing', name:'Climbing Conditioning', icon:'🧗', level:'Intermediate', duration:'45 min', muscles:'Grip, Back, Core',
    description:'Upper body and grip strength work that directly transfers to climbing performance.',
    suggestedRestSec:90,
    exercises:[
      rx('Pull Ups', 4, 6, ''),
      rx('Deadlift', 3, 8, ''),
      rx('Plank', 3, 40, ''),
      rx('Farmer\'s Carry', 3, 40, 'Grip strength carryover.'),
      rx('Calf Raises', 3, 15, ''),
    ] },

  // ── POWERLIFTING ──────────────────────────
  { id:'pl_beginner', sport:'powerlifting', name:'Powerlifting Basics', icon:'💪', level:'Beginner', duration:'60 min', muscles:'Full Body, Strength',
    description:'The three competition lifts using a classic beginner linear-progression structure. Add weight each session while form stays clean.',
    suggestedRestSec:120,
    exercises:[
      rx('Squat', 3, 5, 'Rest ~2 min.'),
      rx('Bench Press', 3, 5, 'Rest ~2 min.'),
      rx('Deadlift', 1, 5, 'One heavy top set. Rest ~2.5 min before if needed.'),
    ] },
  { id:'pl_advanced', sport:'powerlifting', name:'Powerlifting Peak', icon:'💪', level:'Advanced', duration:'75 min', muscles:'Full Body, Max Strength',
    description:'A peaking-phase session with heavier loads and lower reps on the big three, plus accessory work.',
    suggestedRestSec:150,
    exercises:[
      rx('Squat', 5, 3, 'Rest ~3 min.'),
      rx('Bench Press', 5, 3, 'Rest ~3 min.'),
      rx('Deadlift', 3, 3, 'Rest ~3 min.'),
      rx('Romanian Deadlift', 3, 8, 'Rest ~90s.'),
      rx('Plank', 3, 40, ''),
    ] },

  // ── BODYBUILDING ──────────────────────────
  { id:'bb_chest', sport:'bodybuilding', name:'Chest Hypertrophy', icon:'🦾', level:'Intermediate', duration:'50 min', muscles:'Chest, Triceps',
    description:'A high-volume chest session across multiple angles — built for muscle growth, not 1-rep max strength.',
    suggestedRestSec:75,
    exercises:[
      rx('Bench Press', 4, 8, 'Rest ~90s.'),
      rx('Incline Bench Press', 4, 10, 'Rest ~75s.'),
      rx('Chest Fly', 3, 12, 'Rest ~60s.'),
      rx('Cable Crossover', 3, 15, 'Rest ~45s.'),
      rx('Dips', 3, 12, 'Rest ~60s.'),
    ] },
  { id:'bb_back', sport:'bodybuilding', name:'Back Thickness', icon:'🦾', level:'Intermediate', duration:'55 min', muscles:'Back, Lats, Biceps',
    description:'Targets both width and thickness in the back for a fuller, more defined V-taper.',
    suggestedRestSec:75,
    exercises:[
      rx('Pull Ups', 4, 8, 'Rest ~90s.'),
      rx('Deadlift', 3, 6, 'Rest ~2 min.'),
      rx('Bent Over Row', 4, 10, 'Rest ~75s.'),
      rx('Lat Pulldown', 3, 12, 'Rest ~60s.'),
      rx('Seated Cable Row', 3, 12, 'Rest ~60s.'),
    ] },
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

// ─────────────────────────────────────────────────────────────
// Exercise icons — Iconify, movement-family based (v1 source of truth).
// Applies to every exercise across every workout (not just Weight
// Training). Exercises are matched by keyword against their movement
// family rather than mapped one-by-one, so related exercises share the
// same icon (e.g. every squat/lunge variant uses the same icon).
// Checked in priority order — first match wins. Always falls back to
// 'mdi:dumbbell' so an exercise is never left without an icon.
// ─────────────────────────────────────────────────────────────
export function getExerciseIconName(name) {
  const n = (name || '').toLowerCase()

  // Breathing & recovery
  if (/breath|meditat/.test(n)) return 'mdi:meditation'

  // Mobility & stretches (yoga poses, every *Stretch entry, spinal/hip mobility)
  if (/stretch|yoga|pose|salutation|pigeon|opener|rotation|cat-cow|downward dog|arm circle/.test(n)) return 'mdi:yoga'

  // Core (plank family, anti-rotation/anti-extension work)
  if (/plank|crunch|dead bug|twist|leg raise|the hundred|roll up|pallof|suitcase carry|bird dog|mountain climber|pelvic tilt/.test(n)) return 'hugeicons:body-part-six-pack'

  // Warm-up cardio / walking / cycling / easy row — checked before squat
  // patterns so compound names like "Walking Lunge" fall through to squat.
  if (!/lunge/.test(n) && /walk|bike|cycl|rowing|running|(^|\W)run(\W|$)|swim|jump rope|sprint|high knees|jumping jack|\bhiit\b/.test(n)) return 'mdi:run-fast'

  // Squats & lower-body squat patterns
  if (/squat|lunge|leg press|hip thrust/.test(n)) return 'game-icons:weight-lifting-up'

  // Deadlifts, Romanian deadlifts, hip-hinge patterns
  if (/deadlift|hip hinge|glute bridge/.test(n)) return 'mdi:weight-lifter'

  // Bench press, push-ups, dips, chest pressing
  if (/bench|push.?up|dip|chest|fly|crossover/.test(n)) return 'mdi:arm-flex'

  // Pull-ups & lat pulldowns
  if (/pull.?up|pulldown/.test(n)) return 'hugeicons:equipment-gym-02'

  // Rows (strength) — cardio "rowing" already handled above
  if (/row/.test(n)) return 'mdi:rowing'

  // Shoulder press & overhead press
  if (/shoulder press|overhead press|arnold press|handstand/.test(n)) return 'mdi:human-handsup'

  // Biceps & triceps isolation
  if (/curl|tricep|skull crusher/.test(n)) return 'mdi:arm-flex-outline'

  // Generic strength fallback
  return 'mdi:dumbbell'
}

// ─────────────────────────────────────────────────────────────
// Workout/sport-level icons — Lucide icon NAMES (not components; the
// WorkoutIcon component in WorkoutTab.jsx resolves the name to an
// actual icon). Same lookup-with-fallback pattern as the exercise icon
// system above, just one level up (sport/workout cards, not exercises).
// Checked in order: specific workout id -> sport id -> 'Dumbbell'.
// ─────────────────────────────────────────────────────────────
export const WORKOUT_ICON_BY_ID = {
  // Weight Training plans
  push_day: 'ArrowUp', pull_day: 'ArrowDown', leg_day: 'Footprints',
  full_body: 'Dumbbell', upper_body: 'Dumbbell', core_blast: 'Target',
  // CrossFit / HIIT
  wod_classic: 'Zap', wod_beginner: 'Zap', hiit_20: 'Zap', hiit_tabata: 'Zap', hiit_beginner: 'Zap',
  // Calisthenics / Kettlebell / Functional
  cali_basics: 'Activity', cali_advanced: 'Activity', kb_beginner: 'Dumbbell', kb_power: 'Dumbbell', functional1: 'Activity',
  // Cardio
  run_easy: 'Footprints', run_interval: 'Footprints', run_long: 'Footprints', run_5k: 'Footprints',
  walk_power: 'Footprints', walk_hiit: 'Footprints',
  cycle_endur: 'Bike', cycle_hiit: 'Bike',
  rope_basics: 'Zap', rope_hiit: 'Zap',
  swim_laps: 'Waves', swim_endur: 'Waves', row_endur: 'Waves', row_power: 'Waves',
  // Mobility
  yoga_morning: 'Flower2', yoga_yin: 'Flower2', yoga_power: 'Flower2',
  pilates_core: 'Flower2', pilates_full: 'Flower2', stretch_full: 'Move', stretch_post: 'Move',
  // Combat
  box_basics: 'Shield', box_advanced: 'Shield', muay_basics: 'ShieldAlert', martial1: 'Shield', mma_cond: 'ShieldCheck',
  // Sports training
  tennis_cond: 'Trophy', badminton1: 'Trophy', football_fit: 'Trophy', bball_cond: 'Trophy',
  volley_cond: 'Trophy', golf_fitness: 'Trophy', dance_zumba: 'Activity', hiphop1: 'Activity', gymn_basics: 'Activity',
  hike_prep: 'Footprints', hike_strength: 'Footprints', climb_cond: 'Activity',
  // Powerlifting / Bodybuilding
  pl_beginner: 'Dumbbell', pl_advanced: 'Dumbbell', bb_chest: 'Dumbbell', bb_back: 'Dumbbell',
}

export const WORKOUT_ICON_BY_SPORT = {
  gym: 'Dumbbell', powerlifting: 'Dumbbell', bodybuilding: 'Dumbbell', kettlebell: 'Dumbbell',
  crossfit: 'Zap', hiit: 'Zap', jumpRope: 'Zap',
  boxing: 'Shield', muay_thai: 'ShieldAlert', martial: 'Shield', mma: 'ShieldCheck',
  calisthenics: 'Activity', functional: 'Activity',
  running: 'Footprints', walking: 'Footprints', hiking: 'Footprints',
  cycling: 'Bike',
  swimming: 'Waves', rowing: 'Waves',
  yoga: 'Flower2', pilates: 'Flower2', stretching: 'Move',
  tennis: 'Trophy', badminton: 'Trophy', football: 'Trophy', basketball: 'Trophy',
  volleyball: 'Trophy', golf: 'Trophy', dance: 'Activity',
  gymnastics: 'Activity', rockClimbing: 'Activity',
}

// Returns a Lucide icon name for a workout or sport, always falling
// back to 'Dumbbell' so a card is never left without an icon.
// NOTE: this Lucide-based lookup remains as the graceful fallback used
// inside WorkoutCategoryIcon when a custom category PNG is missing/fails
// to load. For workout-PLAN cards (Push Day, Leg Day, etc.) the app now
// uses the broader Iconify-based system below instead.
export function getWorkoutIconType({ workoutId, sportId } = {}) {
  return WORKOUT_ICON_BY_ID[workoutId] || WORKOUT_ICON_BY_SPORT[sportId] || 'Dumbbell'
}

// ─────────────────────────────────────────────────────────────
// Workout-PLAN icons — Iconify (Tabler primary, Phosphor where Tabler
// has no meaningful equivalent). Lucide was too limited for the range
// of workout plans in the library; several cards were reusing unrelated
// icons. Centralized here, static names only (no runtime icon search),
// module-scope so nothing is recreated on re-render.
// ─────────────────────────────────────────────────────────────
export const WORKOUT_PLAN_ICON_BY_ID = {
  // Weight Training
  push_day: 'mdi:human-barbell',
  pull_day: 'hugeicons:equipment-gym-02',
  leg_day: 'mdi:weight-lifter',
  full_body: 'ion:body',
  upper_body: 'mdi:arm-flex',
  core_blast: 'hugeicons:body-part-six-pack',
  lower_body_foundation: 'game-icons:leg',
  adv_full_body_strength: 'mdi:dumbbell',
  adv_upper_body_strength: 'mdi:arm-flex',
  // CrossFit / HIIT
  wod_classic: 'tabler:bolt', wod_beginner: 'tabler:bolt',
  hiit_20: 'tabler:bolt', hiit_tabata: 'tabler:bolt', hiit_beginner: 'tabler:bolt',
  // Calisthenics / Kettlebell / Functional
  cali_basics: 'tabler:barbell', cali_advanced: 'tabler:barbell',
  kb_beginner: 'tabler:barbell', kb_power: 'tabler:barbell', functional1: 'tabler:barbell',
  // Cardio
  run_easy: 'tabler:run', run_interval: 'tabler:run', run_long: 'tabler:run', run_5k: 'tabler:run',
  walk_power: 'tabler:walk', walk_hiit: 'tabler:walk',
  cycle_endur: 'tabler:bike', cycle_hiit: 'tabler:bike',
  rope_basics: 'tabler:bolt', rope_hiit: 'tabler:bolt',
  swim_laps: 'tabler:swimming', swim_endur: 'tabler:swimming',
  row_endur: 'tabler:swimming', row_power: 'tabler:swimming',
  // Mobility
  yoga_morning: 'tabler:yoga', yoga_yin: 'tabler:yoga', yoga_power: 'tabler:yoga',
  pilates_core: 'ph:person-simple', pilates_full: 'ph:person-simple',
  stretch_full: 'tabler:stretching-2', stretch_post: 'tabler:stretching-2',
  // Combat
  box_basics: 'ph:boxing-glove', box_advanced: 'ph:boxing-glove',
  muay_basics: 'tabler:karate', martial1: 'tabler:karate', mma_cond: 'tabler:karate',
  // Sports training
  tennis_cond: 'tabler:ball-tennis', badminton1: 'tabler:ball-tennis',
  football_fit: 'tabler:ball-football', bball_cond: 'tabler:ball-basketball',
  volley_cond: 'tabler:ball-volleyball', golf_fitness: 'tabler:golf',
  dance_zumba: 'ph:person-simple', hiphop1: 'ph:person-simple', gymn_basics: 'tabler:stretching-2',
  hike_prep: 'tabler:walk', hike_strength: 'tabler:walk', climb_cond: 'tabler:barbell',
  // Powerlifting / Bodybuilding
  pl_beginner: 'tabler:barbell', pl_advanced: 'tabler:barbell',
  bb_chest: 'tabler:barbell', bb_back: 'tabler:barbell',
}

export const WORKOUT_PLAN_ICON_BY_SPORT = {
  gym: 'tabler:barbell', powerlifting: 'tabler:barbell', bodybuilding: 'tabler:barbell', kettlebell: 'tabler:barbell',
  crossfit: 'tabler:bolt', hiit: 'tabler:bolt', jumpRope: 'tabler:bolt',
  boxing: 'ph:boxing-glove', muay_thai: 'tabler:karate', martial: 'tabler:karate', mma: 'tabler:karate',
  calisthenics: 'tabler:barbell', functional: 'tabler:barbell',
  running: 'tabler:run', walking: 'tabler:walk', hiking: 'tabler:walk',
  cycling: 'tabler:bike',
  swimming: 'tabler:swimming', rowing: 'tabler:swimming',
  yoga: 'tabler:yoga', pilates: 'ph:person-simple', stretching: 'tabler:stretching-2',
  tennis: 'tabler:ball-tennis', badminton: 'tabler:ball-tennis', football: 'tabler:ball-football', basketball: 'tabler:ball-basketball',
  volleyball: 'tabler:ball-volleyball', golf: 'tabler:golf', dance: 'ph:person-simple',
  gymnastics: 'tabler:stretching-2', rockClimbing: 'tabler:barbell',
}

// Returns a static Iconify icon name for a workout plan card, always
// falling back to 'tabler:activity' — never breaks rendering.
export function getWorkoutPlanIcon(workout) {
  if (!workout) return 'tabler:activity'
  const byId    = WORKOUT_PLAN_ICON_BY_ID[workout.id]
  const bySport = WORKOUT_PLAN_ICON_BY_SPORT[workout.sport]
  if (!byId && !bySport && import.meta.env?.DEV) {
    console.warn(`[getWorkoutPlanIcon] no mapping for workout "${workout.id}" (sport "${workout.sport}") — using fallback icon`)
  }
  return byId || bySport || 'tabler:activity'
}

// ─────────────────────────────────────────────────────────────
// Category icon pack — custom PNGs in /public/workout-icons/, one
// per sport/category (not per individual workout plan). This is now
// the primary icon system for category-level displays (Library grid,
// category detail headers). Centralized here so no UI code hardcodes
// image paths; if a sport has no entry, callers fall back to the
// Lucide WorkoutIcon system above — rendering never breaks.
// ─────────────────────────────────────────────────────────────
export const WORKOUT_CATEGORY_ICON_FILES = {
  gym: 'weight-training.png',
  powerlifting: 'powerlifting.png',
  bodybuilding: 'bodybuilding.png',
  crossfit: 'crossfit.png',
  functional: 'functional-fitness.png',
  jumpRope: 'jump-rope.png',
  rowing: 'rowing.png',
  swimming: 'swimming.png',
  pilates: 'pilates.png',
  stretching: 'stretching.png',
  boxing: 'boxing.png',
  muay_thai: 'muay-thai.png',
  martial: 'martial-arts.png',
  mma: 'mma.png',
  tennis: 'tennis.png',
  badminton: 'badminton.png',
  football: 'football.png',
  basketball: 'basketball.png',
  volleyball: 'volleyball.png',
  rockClimbing: 'rock-climbing.png',
  running: 'running.png',
  walking: 'walking.png',
  hiit: 'hit.png',
  gymnastics: 'gymnastics.png',
  dance: 'dance.png',
  yoga: 'yoga.png',
  golf: 'golf.png',
  hiking: 'hiking.png',
  cycling: 'cycling.png',
  calisthenics: 'calisthenics.png',
  kettlebell: 'kettlebell.png',
}

// Returns the category icon path for a sport, or null if unmapped —
// callers should fall back to getWorkoutIconType()/WorkoutIcon in that case.
// Prefers the small optimized WebP (~96-128px) over the original
// full-resolution PNG, which is unnecessarily large for a 28-32px icon.
export function getWorkoutCategoryIconSrc(sportId) {
  const file = WORKOUT_CATEGORY_ICON_FILES[sportId]
  if (!file) return null
  const base = file.replace(/\.png$/, '')
  return `/workout-icons/optimized/${base}.webp`
}

// Fallback to the original full-resolution PNG if the optimized WebP is
// missing or fails to load — still better than dropping straight to Lucide.
export function getWorkoutCategoryIconFallbackSrc(sportId) {
  const file = WORKOUT_CATEGORY_ICON_FILES[sportId]
  return file ? `/workout-icons/${file}` : null
}
