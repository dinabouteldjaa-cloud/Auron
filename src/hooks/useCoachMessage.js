import { useRef } from 'react'

// ─────────────────────────────────────────────────────────────
// useCoachMessage — time-aware, priority-based coaching
//
// Architecture:
//   buildPriority(ctx) → picks ONE most important insight for
//     the current moment, time-aware and situation-specific.
//   buildMessage(insight, ctx, lang, seed) → phrases it naturally.
//   Stable: message only changes when the situation actually changes.
// ─────────────────────────────────────────────────────────────

// Seeded pick — deterministic, no re-render flash
function pick(arr, seed) {
  return arr[Math.abs(Math.round(seed)) % arr.length]
}

// Stable seed that only changes when the situation meaningfully changes
// Deliberately coarse so minor fluctuations don't re-trigger
function buildSeed(ctx) {
  const { hour = 0, foodLogsCount = 0, waterPct = 0, workoutDone = false,
          totalCal = 0, calorieGoal = 1, pendingMedsDueSoon = 0,
          steps = 0, streakDays = 0 } = ctx
  return (
    hour * 100 +                                    // changes each hour
    foodLogsCount * 7 +                             // changes when meals logged
    Math.floor(waterPct / 20) * 13 +               // changes in ~20% chunks
    (workoutDone ? 31 : 0) +
    Math.floor((totalCal / Math.max(calorieGoal, 1)) * 10) * 3 +
    pendingMedsDueSoon * 17 +
    Math.floor(steps / 2000) * 5 +
    streakDays * 2
  )
}

// ─────────────────────────────────────────────────────────────
// PRIORITY ENGINE
// Returns { type, ...relevant data } for the most important insight
// ─────────────────────────────────────────────────────────────
export function buildPriority(ctx) {
  const {
    isToday, hour, minute = 0,
    totalCal, calorieGoal,
    proteinPct, waterPct, waterGoal, waterAmount, waterUnit,
    workoutDone, steps,
    foodLogsCount, sleepHours,
    pendingMeds, pendingMedsDueSoon, nextMedName, nextMedTime,
    streakDays,
    calOver, calRemaining,
    proteinShort,
  } = ctx

  if (!isToday) return { type: 'mindset' }

  const nowMinutes = hour * 60 + (minute || 0)

  // ── 1. MEDICATION — only when due within 30 min or overdue ──
  if (pendingMedsDueSoon > 0) {
    return { type: 'med_due', name: nextMedName, time: nextMedTime }
  }

  // ── 2. CALORIES OVER ─────────────────────────────────────────
  if (totalCal > calorieGoal * 1.08 && calorieGoal > 0) {
    return { type: 'over_cal', calOver: Math.round(calOver) }
  }

  // ── 3. MEAL REMINDERS — time-aware ───────────────────────────
  // Breakfast: 8:00–10:30, no food logged
  if (nowMinutes >= 480 && nowMinutes < 630 && foodLogsCount === 0) {
    return { type: 'meal_breakfast' }
  }
  // Lunch: 12:00–14:00, fewer than 1 meal logged
  if (nowMinutes >= 720 && nowMinutes < 840 && foodLogsCount < 1) {
    return { type: 'meal_lunch' }
  }
  // Dinner: 18:30–20:30, fewer than 2 meals logged
  if (nowMinutes >= 1110 && nowMinutes < 1230 && foodLogsCount < 2) {
    return { type: 'meal_dinner' }
  }
  // General: no food logged and it's been a significant part of the day
  if (foodLogsCount === 0 && hour >= 11) {
    return { type: 'no_food' }
  }

  // ── 4. WATER — only flag when meaningfully behind for the time ─
  // Expected water progress: roughly waterPct should track hour/16 * 100
  const expectedWaterPct = Math.min(100, (hour / 16) * 100)
  if (waterPct < expectedWaterPct * 0.5 && hour >= 13) {
    const deficit = Math.max(0, Math.round(waterGoal - waterAmount))
    return { type: 'water_low', deficit, unit: waterUnit }
  }

  // ── 5. PROTEIN — afternoon/evening flag ───────────────────────
  if (proteinPct < 35 && hour >= 15 && foodLogsCount > 0) {
    return { type: 'protein_low', shortBy: Math.round(proteinShort || 0) }
  }

  // ── 6. STEPS — flag in afternoon only ─────────────────────────
  if (steps < 3000 && hour >= 15 && hour < 20) {
    return { type: 'steps_low', steps }
  }

  // ── 7. WORKOUT — suggest if evening and not done ──────────────
  if (!workoutDone && hour >= 16 && hour < 20) {
    return { type: 'workout_missing' }
  }

  // ── 8. POSITIVE STATES ───────────────────────────────────────
  // Celebrating streak
  if (streakDays >= 7) return { type: 'streak', days: streakDays }

  // All going well
  const positives = [
    foodLogsCount >= 2,
    waterPct >= 70,
    proteinPct >= 60,
    workoutDone,
    steps >= 7000,
  ].filter(Boolean).length

  if (positives >= 4) return { type: 'all_good' }
  if (workoutDone && positives >= 3) return { type: 'workout_done' }
  if (positives >= 2) return { type: 'good_progress' }

  // ── 9. GREETING / DEFAULT ────────────────────────────────────
  if (hour < 10) return { type: 'greeting' }
  if (hour >= 21) return { type: 'evening' }
  return { type: 'default' }
}

// ─────────────────────────────────────────────────────────────
// Expression mapping
// ─────────────────────────────────────────────────────────────
export function getAuronMoodFromContext(ctx) {
  const p = buildPriority(ctx)
  switch (p.type) {
    case 'greeting':      return 'greeting'
    case 'med_due':       return 'concerned'
    case 'over_cal':      return 'concerned'
    case 'no_food':       return 'concerned'
    case 'meal_breakfast':return 'greeting'
    case 'meal_lunch':    return 'thinking'
    case 'meal_dinner':   return 'thinking'
    case 'water_low':     return 'thinking'
    case 'protein_low':   return 'thinking'
    case 'steps_low':     return 'motivating'
    case 'workout_missing':return 'motivating'
    case 'streak':        return 'celebrating'
    case 'all_good':      return 'happy'
    case 'workout_done':  return 'workout'
    case 'good_progress': return 'motivating'
    case 'evening':       return 'resting'
    case 'mindset':       return 'mindset'
    default:              return 'motivating'
  }
}

// ─────────────────────────────────────────────────────────────
// MESSAGE BUILDER — one specific message per insight type
// ─────────────────────────────────────────────────────────────
function buildMessage(ctx, lang, seed) {
  const priority = buildPriority(ctx)
  const { firstName: name, hour, streakDays, steps,
          waterGoal, waterAmount, waterUnit, waterPct,
          totalCal, calorieGoal, proteinPct, proteinShort,
          foodLogsCount, workoutDone, workoutMinutes } = ctx

  const fr = lang === 'fr'
  const hi = name || (fr ? '' : '')
  const greet = hi ? (fr ? `${hi}, ` : `${hi}, `) : ''
  const G = hi ? (fr ? `${hi} ! ` : `${hi}! `) : ''

  const { type } = priority

  if (fr) {
    switch (type) {
      case 'greeting':
        return pick([
          `${G}Bonne journée ! Commencez par enregistrer votre petit-déjeuner.`,
          `${G}Nouvelle journée ! Notez votre premier repas pour bien démarrer.`,
          `${greet}la journée commence. Premier réflexe : enregistrez votre petit-déjeuner.`,
        ], seed)

      case 'meal_breakfast':
        return pick([
          `${G}Il est l'heure du petit-déjeuner. Avez-vous déjà mangé ?`,
          `${greet}n'oubliez pas d'enregistrer votre petit-déjeuner.`,
          `Bon matin ${hi || ''}! Le petit-déjeuner est le carburant de votre matinée.`,
        ], seed)

      case 'meal_lunch':
        return pick([
          `${G}C'est l'heure du déjeuner — pensez à enregistrer votre repas.`,
          `${greet}n'oubliez pas de manger et de noter votre déjeuner.`,
          `Il est midi ${hi || ''}. Un bon repas maintenant aide à tenir l'après-midi.`,
        ], seed)

      case 'meal_dinner':
        return pick([
          `${G}C'est l'heure du dîner. Pensez à l'enregistrer.`,
          `${greet}n'oubliez pas votre dîner — vos macros ont besoin d'être complètes.`,
          `Ce soir ${hi || ''}, pensez à enregistrer votre repas pour finir la journée correctement.`,
        ], seed)

      case 'no_food':
        return pick([
          `${greet}aucun repas enregistré aujourd'hui. Prenez le temps de manger et de noter.`,
          `${G}Il est important de manger régulièrement. Aucun repas enregistré pour l'instant.`,
          `${greet}votre corps a besoin de carburant. Enregistrez votre prochain repas.`,
        ], seed)

      case 'med_due': {
        const medName = priority.name || 'votre médicament'
        const medTime = priority.time ? ` (${priority.time})` : ''
        return pick([
          `${greet}c'est l'heure de prendre ${medName}${medTime}.`,
          `N'oubliez pas ${medName}${medTime} — prenez-le maintenant.`,
          `${G}${medName} est dû${medTime}. Prenez-le avant de passer à autre chose.`,
        ], seed)
      }

      case 'over_cal':
        return pick([
          `${greet}vous avez dépassé votre objectif de ${priority.calOver} kcal. Allégez le reste de la journée.`,
          `Objectif calorique dépassé de ${priority.calOver} kcal. Misez sur des options légères ce soir.`,
          `${greet}${priority.calOver} kcal de trop aujourd'hui. Ce n'est pas grave — restez léger(e) ce soir.`,
        ], seed)

      case 'water_low': {
        const def = priority.deficit
        const u   = priority.unit || 'verres'
        return pick([
          `${greet}vous êtes en retard sur l'hydratation. Essayez de boire encore ${def} ${u}.`,
          `Pensez à boire davantage — il vous manque encore ${def} ${u} aujourd'hui.`,
          `${G}restez hydraté(e) ! Encore ${def} ${u} à boire pour aujourd'hui.`,
        ], seed)
      }

      case 'protein_low':
        return pick([
          `${greet}vos protéines sont faibles — il vous manque ${priority.shortBy}g. Ajoutez des œufs, du poulet ou du yaourt.`,
          `Protéines insuffisantes pour l'instant (${priority.shortBy}g manquants). Une collation riche en protéines aiderait.`,
          `${greet}pensez aux protéines — il vous en manque encore ${priority.shortBy}g pour atteindre votre objectif.`,
        ], seed)

      case 'steps_low':
        return pick([
          `${greet}seulement ${(priority.steps||0).toLocaleString()} pas pour l'instant. Une courte marche ferait la différence.`,
          `Vous bougez peu aujourd'hui. Une marche de 15 min peut booster votre compteur de pas.`,
          `${G}activez-vous un peu ! Vous n'avez que ${(priority.steps||0).toLocaleString()} pas pour l'instant.`,
        ], seed)

      case 'workout_missing':
        return pick([
          `${greet}pas encore d'entraînement aujourd'hui. Même 20 minutes font la différence.`,
          `Une séance rapide ce soir ? Vous pouvez encore atteindre votre objectif d'activité.`,
          `${greet}pensez à bouger — une séance courte vaut mieux que rien.`,
        ], seed)

      case 'workout_done': {
        const mins = workoutMinutes > 0 ? `${workoutMinutes} min` : ''
        return pick([
          `${greet}belle séance${mins ? ` de ${mins}` : ''} aujourd'hui ! Pensez à bien récupérer.`,
          `Entraînement fait${mins ? ` (${mins})` : ''} — bien joué ! La récupération est aussi importante.`,
          `${G}séance terminée${mins ? ` de ${mins}` : ''} ! Hydratez-vous et récupérez bien.`,
        ], seed)
      }

      case 'streak':
        return pick([
          `${priority.days} jours de suite ${hi || ''} ! Vous êtes en train de bâtir de vraies habitudes.`,
          `Incroyable — ${priority.days} jours consécutifs. La régularité paie toujours.`,
          `${G}${priority.days} jours d'affilée ! Ne vous arrêtez pas maintenant.`,
        ], seed)

      case 'all_good':
        return pick([
          `${greet}tout est au vert aujourd'hui — repas, eau, activité. Excellente journée !`,
          `${G}belle journée ! Repas, hydratation et activité sont tous bien engagés.`,
          `${greet}vous gérez très bien votre journée. Continuez comme ça.`,
        ], seed)

      case 'good_progress':
        return pick([
          `${greet}bonne progression aujourd'hui. Gardez le cap.`,
          `Vous avancez bien ${hi || ''}. Chaque bonne décision compte.`,
          `${greet}journée en bonne voie. Continuez à enregistrer vos habitudes.`,
        ], seed)

      case 'evening':
        return pick([
          `${greet}bonne soirée ! La récupération fait partie de la progression.`,
          `${G}belle journée. Reposez-vous bien ce soir.`,
          `${greet}la journée touche à sa fin. Dormez suffisamment pour mieux performer demain.`,
        ], seed)

      case 'mindset':
        return pick([
          `${greet}vous consultez un jour passé. Chaque donnée est une leçon.`,
          `Analyser ses habitudes passées, c'est déjà progresser ${hi || ''}.`,
        ], seed)

      default:
        return pick([
          `${greet}bonne journée en cours. Continuez à enregistrer vos habitudes.`,
          `${G}chaque petit effort compte. Vous avancez !`,
        ], seed)
    }
  }

  // ── English ──────────────────────────────────────────────────
  switch (type) {
    case 'greeting':
      return pick([
        `${G}Good morning! Start by logging your breakfast.`,
        `${greet}new day, fresh start. Log your first meal to kick things off.`,
        `Morning ${hi || ''}! Log breakfast and build on yesterday's progress.`,
      ], seed)

    case 'meal_breakfast':
      return pick([
        `${G}Breakfast time — have you eaten yet? Log it to track your day.`,
        `${greet}don't forget to log breakfast. It sets the tone for the day.`,
        `Good morning! Log your breakfast to get your nutrition tracking started.`,
      ], seed)

    case 'meal_lunch':
      return pick([
        `${G}It's around lunchtime — remember to eat and log your meal.`,
        `${greet}lunch time. A good meal now keeps your energy steady all afternoon.`,
        `Time for lunch ${hi || ''}! Log it to stay on track with your nutrition.`,
      ], seed)

    case 'meal_dinner':
      return pick([
        `${G}Dinner time — log your evening meal to complete your nutrition picture.`,
        `${greet}don't forget to log dinner. Your macros for the day need rounding out.`,
        `Evening ${hi || ''}! Time to log dinner and see how the day finished up.`,
      ], seed)

    case 'no_food':
      return pick([
        `${greet}no meals logged yet today. Make sure you're eating and tracking.`,
        `${G}your body needs fuel. Log your next meal to stay on track.`,
        `${greet}it's been a while with no food logged. Eat something and record it.`,
      ], seed)

    case 'med_due': {
      const medName = priority.name || 'your medication'
      const medTime = priority.time ? ` (${priority.time})` : ''
      return pick([
        `${greet}time to take ${medName}${medTime}.`,
        `Don't forget ${medName}${medTime} — take it now before you forget.`,
        `${G}${medName} is due${medTime}. Take it before moving on with your day.`,
      ], seed)
    }

    case 'over_cal':
      return pick([
        `${greet}you're ${priority.calOver} kcal over your goal. Keep it light for the rest of the day.`,
        `Calorie goal exceeded by ${priority.calOver} kcal. Opt for lighter options tonight.`,
        `${greet}${priority.calOver} kcal over — no big deal. Just keep dinner light.`,
      ], seed)

    case 'water_low': {
      const def = priority.deficit
      const u   = priority.unit || 'glasses'
      return pick([
        `${greet}you're behind on hydration. Try to drink ${def} more ${u} today.`,
        `Hydration is low for this time of day — ${def} more ${u} to go.`,
        `${G}drink up! You still need ${def} more ${u} to hit your water goal.`,
      ], seed)
    }

    case 'protein_low':
      return pick([
        `${greet}protein is low — ${priority.shortBy}g short of your goal. Try eggs, chicken, or Greek yogurt.`,
        `You're ${priority.shortBy}g short on protein. A high-protein snack would help right now.`,
        `${greet}protein needs attention — ${priority.shortBy}g to go to reach your daily target.`,
      ], seed)

    case 'steps_low':
      return pick([
        `${greet}only ${(priority.steps||0).toLocaleString()} steps so far. A short walk would make a real difference.`,
        `Movement is low today. Even a 15-minute walk can boost your step count.`,
        `${G}time to move! You've only hit ${(priority.steps||0).toLocaleString()} steps today.`,
      ], seed)

    case 'workout_missing':
      return pick([
        `${greet}no workout logged yet today. Even 20 minutes counts.`,
        `Still time for a session today. A short workout is better than none.`,
        `${greet}consider squeezing in a workout — you'll feel better for it.`,
      ], seed)

    case 'workout_done': {
      const mins = workoutMinutes > 0 ? `${workoutMinutes}-min ` : ''
      return pick([
        `${greet}great ${mins}workout today! Make sure you're recovering well.`,
        `${mins}session done — well earned. Focus on recovery now.`,
        `${G}workout logged${mins ? ` (${mins}session)` : ''}! Hydrate and rest up.`,
      ], seed)
    }

    case 'streak':
      return pick([
        `${priority.days} days straight ${hi || ''}! You're building real lasting habits.`,
        `Incredible — ${priority.days}-day streak. Consistency is your superpower.`,
        `${G}${priority.days} days in a row! Don't stop now.`,
      ], seed)

    case 'all_good':
      return pick([
        `${greet}everything's on track today — meals, water, and activity. Great day!`,
        `${G}solid day! Nutrition, hydration, and movement are all looking good.`,
        `${greet}you're managing your day really well. Keep it up.`,
      ], seed)

    case 'good_progress':
      return pick([
        `${greet}good progress today. Keep the momentum going.`,
        `You're doing well ${hi || ''}. Every good choice adds up.`,
        `${greet}day is on track. Keep logging your habits.`,
      ], seed)

    case 'evening':
      return pick([
        `${greet}good evening! Recovery is part of the process.`,
        `${G}great day. Rest up well tonight.`,
        `${greet}day is winding down. Get good sleep to perform better tomorrow.`,
      ], seed)

    case 'mindset':
      return pick([
        `${greet}looking back at a past day. Every data point is a lesson.`,
        `Reviewing past habits is already progress ${hi || ''}.`,
      ], seed)

    default:
      return pick([
        `${greet}good day in progress. Keep logging your habits.`,
        `${G}every small effort counts. You're moving forward!`,
      ], seed)
  }
}

// ─────────────────────────────────────────────────────────────
// Public hook — stable, zero flash
// ─────────────────────────────────────────────────────────────
export function useCoachMessage(ctx, lang) {
  const messageRef  = useRef('')
  const seedRef     = useRef(null)
  const typeRef     = useRef(null)
  const langRef     = useRef(null)

  // ctx is null while the caller's data is still loading — hold whatever
  // message we already have (empty string on first-ever render) rather
  // than computing a message from incomplete/default data that would
  // immediately get replaced once real data arrives (causes flicker).
  if (!ctx || !ctx.mood) return { message: messageRef.current, loading: !ctx }

  const seed     = buildSeed(ctx)
  const priority = buildPriority(ctx)

  // Only recompute when the situation type, seed bucket, or lang actually changes
  if (
    priority.type !== typeRef.current ||
    seed          !== seedRef.current ||
    lang          !== langRef.current
  ) {
    messageRef.current = buildMessage(ctx, lang, seed)
    typeRef.current    = priority.type
    seedRef.current    = seed
    langRef.current    = lang
  }

  return { message: messageRef.current, loading: false }
}
