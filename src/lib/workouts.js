export const WORKOUT_CATEGORIES = [
  'All', 'Strength', 'HIIT', 'Cardio', 'Mobility', 'Sports', 'Swimming', 'Martial Arts', 'Yoga', 'Cycling', 'Combat'
]

export const WORKOUTS = [
  // STRENGTH
  { id: 1,  name: 'Upper Body Strength',    type: 'Strength',     duration: 45, cal: 320, level: 'Intermediate', exercises: ['Bench Press 4×8', 'Pull-ups 3×10', 'Shoulder Press 4×10', 'Tricep Dips 3×12', 'Bicep Curls 3×12', 'Face Pulls 3×15'] },
  { id: 2,  name: 'Leg Day',                type: 'Strength',     duration: 50, cal: 420, level: 'Intermediate', exercises: ['Squats 4×10', 'Romanian Deadlift 4×8', 'Leg Press 3×12', 'Walking Lunges 3×16', 'Calf Raises 4×20', 'Leg Curl 3×12'] },
  { id: 3,  name: 'Core & Abs',             type: 'Strength',     duration: 25, cal: 180, level: 'Beginner',     exercises: ['Plank 3×60s', 'Crunches 3×20', 'Leg Raises 3×15', 'Russian Twist 3×20', 'Dead Bug 3×10', 'Bicycle Crunch 3×20'] },
  { id: 4,  name: 'Push Day (PPL)',          type: 'Strength',     duration: 55, cal: 360, level: 'Intermediate', exercises: ['Flat Bench Press 4×8', 'Incline DB Press 3×10', 'Cable Fly 3×12', 'Shoulder Press 4×10', 'Lateral Raises 3×15', 'Tricep Pushdown 3×12'] },
  { id: 5,  name: 'Pull Day (PPL)',          type: 'Strength',     duration: 55, cal: 350, level: 'Intermediate', exercises: ['Deadlift 4×5', 'Barbell Row 4×8', 'Lat Pulldown 3×10', 'Seated Cable Row 3×12', 'Face Pulls 3×15', 'Hammer Curls 3×12'] },
  { id: 6,  name: 'Full Body Strength',      type: 'Strength',     duration: 60, cal: 450, level: 'Intermediate', exercises: ['Squat 3×8', 'Bench Press 3×8', 'Deadlift 3×6', 'OHP 3×10', 'Pull-ups 3×8', 'Plank 3×45s'] },
  { id: 7,  name: 'Glutes & Hamstrings',    type: 'Strength',     duration: 45, cal: 320, level: 'Beginner',     exercises: ['Hip Thrust 4×12', 'Sumo Deadlift 3×10', 'Bulgarian Split Squat 3×10', 'Cable Kickback 3×15', 'Lying Leg Curl 3×12', 'Glute Bridge 3×20'] },
  { id: 8,  name: 'Chest & Triceps',        type: 'Strength',     duration: 45, cal: 300, level: 'Intermediate', exercises: ['Bench Press 4×8', 'Incline Fly 3×12', 'Cable Crossover 3×15', 'Dips 3×10', 'Skull Crushers 3×12', 'Overhead Tricep Extension 3×12'] },
  { id: 9,  name: 'Back & Biceps',          type: 'Strength',     duration: 45, cal: 310, level: 'Intermediate', exercises: ['Deadlift 3×5', 'Pull-ups 3×8', 'Barbell Row 3×10', 'Lat Pulldown 3×12', 'Barbell Curl 3×10', 'Concentration Curl 3×12'] },

  // HIIT
  { id: 10, name: 'Full Body HIIT',         type: 'HIIT',         duration: 30, cal: 380, level: 'Advanced',     exercises: ['Burpees 4×15', 'Jump Squats 4×20', 'Mountain Climbers 4×30s', 'Box Jumps 3×12', 'High Knees 4×45s'] },
  { id: 11, name: 'Tabata Cardio Blast',    type: 'HIIT',         duration: 20, cal: 280, level: 'Advanced',     exercises: ['Sprint 8×20s', 'Rest 8×10s', 'Jump Rope 8×20s', 'Rest 8×10s', 'Burpees 8×20s', 'Rest 8×10s'] },
  { id: 12, name: 'Bodyweight HIIT',        type: 'HIIT',         duration: 25, cal: 300, level: 'Intermediate', exercises: ['Push-ups 3×15', 'Jump Lunges 3×20', 'Plank Jacks 3×30s', 'Speed Skaters 3×20', 'Tuck Jumps 3×12'] },
  { id: 13, name: 'Athletic Power HIIT',    type: 'HIIT',         duration: 35, cal: 420, level: 'Advanced',     exercises: ['Power Cleans 4×5', 'Box Jumps 4×8', 'Battle Ropes 4×30s', 'Sled Push 4×20m', 'Med Ball Slams 4×10'] },

  // CARDIO
  { id: 14, name: '5K Run Program',         type: 'Cardio',       duration: 35, cal: 360, level: 'Beginner',     exercises: ['Warm up walk 5min', 'Run 2km', 'Walk 1min', 'Run 2km', 'Cool down 5min'] },
  { id: 15, name: '10K Training Run',       type: 'Cardio',       duration: 60, cal: 600, level: 'Intermediate', exercises: ['Easy jog 10min', 'Tempo run 20min', 'Easy jog 10min', 'Tempo run 10min', 'Cool down walk 10min'] },
  { id: 16, name: 'Treadmill Intervals',    type: 'Cardio',       duration: 30, cal: 320, level: 'Intermediate', exercises: ['Walk 5min', 'Sprint 1min', 'Walk 2min ×8', 'Cool down 5min'] },
  { id: 17, name: 'Jump Rope Cardio',       type: 'Cardio',       duration: 20, cal: 250, level: 'Beginner',     exercises: ['Basic jump 3min', 'Rest 1min', 'Alternate feet 3min', 'Rest 1min', 'Double unders 2min', 'Rest 1min', 'Basic jump 3min'] },
  { id: 18, name: 'Stair Climber Session',  type: 'Cardio',       duration: 25, cal: 280, level: 'Beginner',     exercises: ['Warm up 3min', 'Moderate pace 10min', 'High intensity 5min', 'Moderate pace 5min', 'Cool down 2min'] },

  // MOBILITY
  { id: 19, name: 'Morning Mobility',       type: 'Mobility',     duration: 20, cal: 80,  level: 'Beginner',     exercises: ['Hip circles 2×30s', 'Shoulder rolls 2×30s', 'Cat-cow 2×60s', 'Pigeon pose 2×45s', 'Thoracic rotations 2×30s'] },
  { id: 20, name: 'Full Body Stretch',      type: 'Mobility',     duration: 30, cal: 90,  level: 'Beginner',     exercises: ['Hamstring stretch 2×45s', 'Hip flexor stretch 2×45s', 'Chest opener 2×30s', 'Spinal twist 2×30s', 'Child\'s pose 2×60s'] },
  { id: 21, name: 'Hip Mobility Flow',      type: 'Mobility',     duration: 25, cal: 85,  level: 'Beginner',     exercises: ['90/90 stretch 3×60s', 'Deep squat hold 3×45s', 'Cossack squat 3×10', 'Hip CARs 2×5 each', 'Frog stretch 2×60s'] },

  // YOGA
  { id: 22, name: 'Morning Yoga Flow',      type: 'Yoga',         duration: 30, cal: 120, level: 'Beginner',     exercises: ['Sun salutation A ×5', 'Sun salutation B ×3', 'Warrior I & II', 'Triangle pose', 'Seated forward fold', 'Savasana 5min'] },
  { id: 23, name: 'Power Yoga',             type: 'Yoga',         duration: 45, cal: 220, level: 'Intermediate', exercises: ['Vinyasa flow 10min', 'Warrior sequence', 'Balance poses', 'Core work', 'Hip openers', 'Savasana'] },
  { id: 24, name: 'Yin Yoga Recovery',      type: 'Yoga',         duration: 45, cal: 100, level: 'Beginner',     exercises: ['Dragon pose 5min', 'Sleeping swan 4min each', 'Caterpillar 5min', 'Sphinx pose 4min', 'Shavasana 5min'] },

  // SPORTS
  { id: 25, name: 'Basketball Training',    type: 'Sports',       duration: 60, cal: 500, level: 'Intermediate', exercises: ['Dribbling drills 10min', 'Shooting practice 15min', 'Defensive slides 10min', 'Fast break drills 10min', 'Scrimmage 15min'] },
  { id: 26, name: 'Football (Soccer)',      type: 'Sports',       duration: 60, cal: 520, level: 'Intermediate', exercises: ['Passing drills 10min', 'Dribbling course 10min', 'Shooting practice 15min', 'Small-sided game 25min'] },
  { id: 27, name: 'Tennis Conditioning',   type: 'Sports',       duration: 50, cal: 420, level: 'Intermediate', exercises: ['Footwork ladder 10min', 'Forehand/backhand drills 15min', 'Serve practice 10min', 'Match play 15min'] },
  { id: 28, name: 'Volleyball Training',   type: 'Sports',       duration: 55, cal: 400, level: 'Beginner',     exercises: ['Serving practice 10min', 'Passing drills 15min', 'Blocking practice 10min', 'Scrimmage 20min'] },
  { id: 29, name: 'Padel Training',        type: 'Sports',       duration: 60, cal: 480, level: 'Beginner',     exercises: ['Wall practice 10min', 'Forehand/backhand 15min', 'Net play 10min', 'Match play 25min'] },

  // SWIMMING
  { id: 30, name: 'Beginner Swim',         type: 'Swimming',     duration: 30, cal: 250, level: 'Beginner',     exercises: ['Freestyle 4×50m', 'Rest 30s', 'Backstroke 4×25m', 'Rest 30s', 'Kickboard 4×25m'] },
  { id: 31, name: 'Swim Endurance',        type: 'Swimming',     duration: 45, cal: 400, level: 'Intermediate', exercises: ['Warm up 200m', 'Freestyle 4×100m', 'Rest 45s', 'IM 2×100m', 'Cool down 100m'] },
  { id: 32, name: 'Swim Intervals',        type: 'Swimming',     duration: 40, cal: 380, level: 'Advanced',     exercises: ['Warm up 300m', 'Sprint 8×25m', 'Rest 20s', 'Pull buoy 4×50m', 'Cool down 200m'] },

  // CYCLING
  { id: 33, name: 'Beginner Cycling',      type: 'Cycling',      duration: 30, cal: 280, level: 'Beginner',     exercises: ['Easy spin 5min', 'Moderate pace 15min', 'Light intervals 5min', 'Cool down 5min'] },
  { id: 34, name: 'Cycling Intervals',     type: 'Cycling',      duration: 45, cal: 450, level: 'Intermediate', exercises: ['Warm up 10min', 'Sprint 30s', 'Recovery 90s ×10', 'Tempo 10min', 'Cool down 5min'] },
  { id: 35, name: 'Long Endurance Ride',   type: 'Cycling',      duration: 90, cal: 700, level: 'Intermediate', exercises: ['Easy pace 20min', 'Moderate pace 50min', 'Cool down 20min'] },

  // MARTIAL ARTS
  { id: 36, name: 'Boxing Workout',        type: 'Combat',       duration: 45, cal: 500, level: 'Intermediate', exercises: ['Jump rope 5min', 'Shadow boxing 3×3min', 'Heavy bag 4×3min', 'Speed bag 3×2min', 'Core work 10min'] },
  { id: 37, name: 'Muay Thai Conditioning',type: 'Combat',       duration: 50, cal: 550, level: 'Intermediate', exercises: ['Jump rope 5min', 'Shadow boxing 3min', 'Pad work 4×3min', 'Knee strikes 3×2min', 'Clinch work 3×2min', 'Cool down'] },
  { id: 38, name: 'MMA Fitness',           type: 'Combat',       duration: 45, cal: 520, level: 'Advanced',     exercises: ['Warm up 5min', 'Striking combos 3×3min', 'Takedown drills 3×3min', 'Ground & pound 3×2min', 'Sparring 2×3min'] },
  { id: 39, name: 'Kickboxing Cardio',     type: 'Combat',       duration: 40, cal: 460, level: 'Beginner',     exercises: ['Warm up 5min', 'Jab-cross combo 3×2min', 'Roundhouse kicks 3×2min', 'Defense drills 2×2min', 'Combo flow 3×2min', 'Cool down'] },

  // MARTIAL ARTS
  { id: 40, name: 'BJJ Conditioning',      type: 'Martial Arts', duration: 50, cal: 480, level: 'Intermediate', exercises: ['Shrimping 3×20m', 'Hip escapes 3×20m', 'Guard passing drills 10min', 'Rolling 3×5min', 'Cool down'] },
  { id: 41, name: 'Judo Strength',         type: 'Martial Arts', duration: 45, cal: 420, level: 'Intermediate', exercises: ['Uchi komi 5min', 'Grip fighting 3×3min', 'Throwing drills 10min', 'Randori 3×4min', 'Cool down'] },
]
