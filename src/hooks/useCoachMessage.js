// ─────────────────────────────────────────────────────────────
// useCoachMessage — Two-layer coaching system
//
// Layer 1: Expression — overall Auron emotion (8 states)
// Layer 2: Message — multi-factor analysis, strengths first,
//          then one improvement opportunity. Never single-metric.
// ─────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─────────────────────────────────────────────────────────────
// LAYER 1 — Expression
// Looks at the overall picture, not just one metric
// ─────────────────────────────────────────────────────────────
export function getAuronMoodFromContext(ctx) {
  const {
    isToday, hour,
    totalCal, calorieGoal,
    proteinPct, waterPct,
    workoutDone, steps,
    streakDays, pendingMeds,
    foodLogsCount,
  } = ctx

  if (!isToday) return 'mindset'

  const overCalories   = totalCal > calorieGoal * 1.05
  const hasFood        = foodLogsCount > 0 || totalCal > 0
  const missingMeds    = pendingMeds > 0 && hour >= 12
  const goodProtein    = proteinPct >= 70
  const goodWater      = waterPct >= 70
  const goodSteps      = steps >= 7000
  const hasActivity    = workoutDone || steps >= 3000

  // Score the day holistically
  let positives = 0
  let negatives = 0

  if (hasFood && !overCalories) positives++
  if (goodProtein)  positives++
  if (goodWater)    positives++
  if (workoutDone)  positives++
  if (goodSteps)    positives++
  if (streakDays >= 3) positives++

  if (overCalories)              negatives += 2
  if (missingMeds)               negatives += 2
  if (!hasFood && hour >= 10)    negatives += 2
  if (waterPct < 30 && hour >= 16) negatives++
  if (proteinPct < 30 && hour >= 16 && hasFood) negatives++

  // Expression decision
  if (!hasFood && hour < 10) return 'greeting'
  if (negatives >= 2)        return 'concerned'
  if (streakDays >= 7 && positives >= 4) return 'celebrating'
  if (workoutDone && positives >= 4) return 'happy'
  if (workoutDone && !hasFood) return 'workout'
  if (positives >= 3 && negatives === 0) return 'happy'
  if (streakDays >= 3 && negatives <= 1) return 'habit'
  if (streakDays >= 1 && negatives <= 1) return 'motivating'
  if (negatives === 1 && positives >= 1) return 'thinking'
  if (hour >= 20 && hasFood)  return 'resting'
  if (!hasFood && hour >= 10) return 'concerned'
  return 'motivating'
}

// ─────────────────────────────────────────────────────────────
// LAYER 2 — Message builder
// Combines 2–4 observations. Strengths first, gap second.
// ─────────────────────────────────────────────────────────────

// Observations — what's going well
function getStrengths(ctx, lang) {
  const {
    totalCal, calorieGoal, proteinPct, waterPct,
    workoutDone, workoutMinutes, steps, streakDays,
    foodLogsCount, sleepHours,
  } = ctx
  const fr = lang === 'fr'
  const strengths = []

  const calPct = calorieGoal > 0 ? (totalCal / calorieGoal) * 100 : 0

  if (workoutDone) {
    if (workoutMinutes >= 45)
      strengths.push(fr ? `séance de ${workoutMinutes} min accomplie` : `${workoutMinutes}-min workout done`)
    else if (workoutMinutes > 0)
      strengths.push(fr ? `entraînement de ${workoutMinutes} min enregistré` : `${workoutMinutes}-min session logged`)
    else
      strengths.push(fr ? `séance terminée` : `workout completed`)
  }

  if (steps >= 8000)
    strengths.push(fr ? `${steps.toLocaleString()} pas — objectif presque atteint` : `${steps.toLocaleString()} steps — nearly at goal`)
  else if (steps >= 5000)
    strengths.push(fr ? `${steps.toLocaleString()} pas en bonne voie` : `${steps.toLocaleString()} steps, good progress`)

  if (proteinPct >= 80)
    strengths.push(fr ? `protéines bien suivies` : `protein on track`)
  else if (proteinPct >= 60)
    strengths.push(fr ? `bons progrès en protéines` : `solid protein intake`)

  if (waterPct >= 80)
    strengths.push(fr ? `hydratation excellente` : `great hydration`)
  else if (waterPct >= 60)
    strengths.push(fr ? `bonne hydratation` : `good hydration`)

  if (calPct >= 60 && calPct <= 105)
    strengths.push(fr ? `calories bien gérées` : `calories well managed`)

  if (foodLogsCount >= 3)
    strengths.push(fr ? `${foodLogsCount} repas enregistrés` : `${foodLogsCount} meals logged`)
  else if (foodLogsCount >= 2)
    strengths.push(fr ? `${foodLogsCount} repas enregistrés` : `${foodLogsCount} meals logged`)

  if (streakDays >= 7)
    strengths.push(fr ? `série de ${streakDays} jours` : `${streakDays}-day streak`)
  else if (streakDays >= 3)
    strengths.push(fr ? `${streakDays} jours d'affilée` : `${streakDays} days straight`)

  if (sleepHours >= 7)
    strengths.push(fr ? `${sleepHours}h de sommeil` : `${sleepHours}h of sleep`)

  return strengths
}

// What needs attention — pick the single most important one
function getTopGap(ctx, lang) {
  const {
    totalCal, calorieGoal, calOver, calRemaining,
    proteinPct, proteinShort, waterPct, waterAmount, waterGoal, waterUnit,
    workoutDone, steps, sleepHours, pendingMeds, nextMedName,
    foodLogsCount, hour,
  } = ctx
  const fr = lang === 'fr'

  // Priority order — most urgent first
  if (pendingMeds > 0 && hour >= 12)
    return fr
      ? `vous avez encore ${nextMedName ? nextMedName : 'un médicament'} à prendre`
      : `you still have ${nextMedName ? nextMedName : 'medication'} to take`

  if (totalCal > calorieGoal * 1.05)
    return fr
      ? `vous avez dépassé votre objectif de ${calOver} kcal — allégez le reste`
      : `you're ${calOver} kcal over your goal — keep it light for the rest of the day`

  if (foodLogsCount === 0 && hour >= 10)
    return fr
      ? `pensez à enregistrer vos repas pour rester sur la bonne voie`
      : `don't forget to log your meals to stay on track`

  if (proteinPct < 40 && hour >= 15)
    return fr
      ? `les protéines sont faibles à ${Math.round(proteinShort)}g de l'objectif — ajoutez de la viande, des œufs ou du yaourt`
      : `protein is low — ${Math.round(proteinShort)}g short of your goal. Try chicken, eggs, or Greek yogurt`

  if (waterPct < 40 && hour >= 14)
    return fr
      ? `l'hydratation est faible — encore ${waterGoal - waterAmount} ${waterUnit} à boire`
      : `hydration is behind — try to drink ${waterGoal - waterAmount} more ${waterUnit}`

  if (!workoutDone && hour >= 17)
    return fr
      ? `une courte séance d'entraînement pourrait encore faire la différence`
      : `a short workout could still make a difference today`

  if (steps < 5000 && hour >= 16)
    return fr
      ? `une petite marche vous aiderait à atteindre votre objectif de pas`
      : `a short walk could help you reach your step goal`

  if (calRemaining > 500 && hour >= 14)
    return fr
      ? `il reste ${calRemaining} kcal — assurez-vous de bien manger`
      : `you have ${calRemaining} kcal left — make sure you're fuelling properly`

  if (sleepHours > 0 && sleepHours < 6)
    return fr
      ? `vous avez dormi peu — essayez de vous coucher plus tôt ce soir`
      : `you slept less than 6 hours — try to get to bed earlier tonight`

  return null // no significant gap
}

// ─────────────────────────────────────────────────────────────
// Compose the final message
// ─────────────────────────────────────────────────────────────
function buildMessage(mood, ctx, lang) {
  const { firstName: name, hour, streakDays,
          totalCal, calorieGoal, workoutDone, workoutMinutes,
          waterPct, waterGoal, waterAmount, waterUnit,
          proteinPct, proteinShort, pendingMeds, steps } = ctx
  const fr  = lang === 'fr'
  const hi  = name || (fr ? 'toi' : 'you')
  const n   = name ? `${name}, ` : ''

  const strengths = getStrengths(ctx, lang)
  const gap       = getTopGap(ctx, lang)

  // Helper — join 1-3 strengths into a natural phrase
  const joinStrengths = (arr) => {
    const s = arr.slice(0, 3)
    if (s.length === 0) return fr ? 'bonne journée en cours' : 'good progress today'
    if (s.length === 1) return s[0]
    if (s.length === 2) return fr ? `${s[0]} et ${s[1]}` : `${s[0]} and ${s[1]}`
    return fr ? `${s[0]}, ${s[1]} et ${s[2]}` : `${s[0]}, ${s[1]}, and ${s[2]}`
  }

  const strengthPhrase = joinStrengths(strengths)

  // ── Mood-specific openers with multi-factor awareness ──
  if (fr) {
    switch (mood) {
      case 'greeting':
        return pick([
          `Bonjour ${hi} ! Nouvelle journée, nouvelles opportunités. Commencez par enregistrer votre petit-déjeuner.`,
          `${n}la journée commence ! Vous avez ${calorieGoal} kcal pour aujourd'hui — faites-en quelque chose.`,
          `Bonjour ${hi} ! C'est parti pour une nouvelle journée — premier repas, premier pas.`,
        ])

      case 'happy':
        if (gap)
          return pick([
            `${strengthPhrase.charAt(0).toUpperCase() + strengthPhrase.slice(1)} — belle journée ${hi}. ${gap.charAt(0).toUpperCase() + gap.slice(1)}.`,
            `${n}${strengthPhrase}. Tout est bon. ${gap.charAt(0).toUpperCase() + gap.slice(1)}.`,
          ])
        return pick([
          `Excellente journée ${hi} — ${strengthPhrase}. Continuez comme ça.`,
          `${n}tout est aligné : ${strengthPhrase}. C'est ça la régularité.`,
          `Belle journée ${hi}. ${strengthPhrase}. Vous pouvez être fier(e).`,
        ])

      case 'celebrating':
        return pick([
          `${streakDays} jours d'affilée ${hi} ! ${strengthPhrase}. C'est une vraie transformation.`,
          `Incroyable ${hi} — ${streakDays} jours sans interruption et ${strengthPhrase}. Ne vous arrêtez pas !`,
          `${n}${streakDays} jours ! ${strengthPhrase}. La plupart des gens ont déjà abandonné.`,
        ])

      case 'concerned':
        return pick([
          `${n}${gap}.${strengths.length > 0 ? ` Par ailleurs, ${strengthPhrase}.` : ''}`,
          `Attention ${hi} — ${gap}.${strengths.length > 0 ? ` Côté positif : ${strengthPhrase}.` : ''}`,
          `${n}point important : ${gap}.${strengths.length > 0 ? ` Le reste se passe bien : ${strengthPhrase}.` : ''}`,
        ])

      case 'workout':
        if (gap)
          return pick([
            `${n}${strengthPhrase}. La récupération est la prochaine priorité — ${gap}.`,
            `Belle séance ${hi}. Maintenant, ${gap}.`,
            `${n}séance terminée — bien joué. Pour la suite : ${gap}.`,
          ])
        return pick([
          `${n}${strengthPhrase}. Continuez à nourrir votre récupération.`,
          `Séance enregistrée ${hi} ! ${strengthPhrase}. Maintenant reposez-vous bien.`,
        ])

      case 'habit':
        if (gap)
          return pick([
            `${n}${strengthPhrase} — belle régularité. Pour peaufiner : ${gap}.`,
            `${streakDays} jours de suite ${hi}, avec ${strengthPhrase}. Petit point : ${gap}.`,
          ])
        return pick([
          `${n}${strengthPhrase} et ${streakDays} jours de suite. Vous construisez de vraies habitudes.`,
          `Belle constance ${hi} — ${strengthPhrase}. Encore ${7 - streakDays > 0 ? 7 - streakDays : 1} jours pour une semaine complète.`,
        ])

      case 'motivating':
        if (gap)
          return pick([
            `${n}${strengthPhrase}. Pour aller encore plus loin : ${gap}.`,
            `Bonne journée ${hi} — ${strengthPhrase}. Un dernier effort : ${gap}.`,
          ])
        return pick([
          `${n}${strengthPhrase}. Vous avancez bien — continuez.`,
          `Bonne progression ${hi} — ${strengthPhrase}. Chaque jour compte.`,
        ])

      case 'thinking':
        return pick([
          `${n}${strengthPhrase}. Cependant, ${gap}.`,
          `Bonne base ${hi} — ${strengthPhrase}. Point à améliorer : ${gap}.`,
          `${n}la journée avance bien avec ${strengthPhrase}. Mais ${gap}.`,
        ])

      case 'resting':
        if (gap)
          return pick([
            `${n}${strengthPhrase} — bonne journée. Dernière chose : ${gap}.`,
            `Belle soirée ${hi}. ${strengthPhrase}. Avant de dormir : ${gap}.`,
          ])
        return pick([
          `${n}${strengthPhrase}. Belle journée — reposez-vous bien.`,
          `Bonsoir ${hi}. ${strengthPhrase}. La récupération fait partie de la progression.`,
        ])

      case 'mindset':
        return pick([
          `${n}vous regardez un jour passé. Chaque donnée est une leçon pour aujourd'hui.`,
          `Analyser le passé aide à progresser ${hi}. Qu'est-ce que vous pouvez améliorer aujourd'hui ?`,
        ])

      default:
        return `${n}prêt(e) quand vous voulez. Commencez par enregistrer un repas.`
    }
  }

  // ── English ──────────────────────────────────────────────────
  switch (mood) {
    case 'greeting':
      return pick([
        `Good morning ${hi}! New day, fresh start. Log breakfast to get things going.`,
        `${n}the day is just starting — you've got ${calorieGoal} kcal to work with. Make them count.`,
        `Morning ${hi}! Log your first meal and let's build on yesterday.`,
        `${n}new day, new opportunity. Start with breakfast and keep that streak going.`,
      ])

    case 'happy':
      if (gap)
        return pick([
          `${strengthPhrase.charAt(0).toUpperCase() + strengthPhrase.slice(1)} — great day ${hi}. One thing to note: ${gap}.`,
          `${n}${strengthPhrase}. Everything's looking good. Just a heads up: ${gap}.`,
          `Strong day ${hi} — ${strengthPhrase}. Worth mentioning: ${gap}.`,
        ])
      return pick([
        `Excellent day ${hi} — ${strengthPhrase}. Keep this up.`,
        `${n}${strengthPhrase}. This is what a great day looks like.`,
        `Everything's aligned ${hi}: ${strengthPhrase}. You should feel good about today.`,
        `${n}you've nailed it — ${strengthPhrase}. This is consistency in action.`,
      ])

    case 'celebrating':
      return pick([
        `${streakDays} days straight ${hi}! ${strengthPhrase}. Most people quit long before this.`,
        `${n}${streakDays}-day streak with ${strengthPhrase}. You're genuinely transforming your habits.`,
        `Incredible ${hi} — ${streakDays} days and ${strengthPhrase}. Don't stop now.`,
      ])

    case 'concerned':
      return pick([
        `${n}${gap}.${strengths.length > 0 ? ` On the bright side: ${strengthPhrase}.` : ''}`,
        `Worth flagging ${hi}: ${gap}.${strengths.length > 0 ? ` Good news: ${strengthPhrase}.` : ''}`,
        `${n}important: ${gap}.${strengths.length > 0 ? ` Everything else is going well — ${strengthPhrase}.` : ''}`,
      ])

    case 'workout':
      if (gap)
        return pick([
          `${n}${strengthPhrase}. Recovery is the next priority — ${gap}.`,
          `Nice work ${hi} — ${strengthPhrase}. Next up: ${gap}.`,
          `${n}session done — well earned. One more thing: ${gap}.`,
          `Great effort ${hi}. ${strengthPhrase}. To round out the day: ${gap}.`,
        ])
      return pick([
        `${n}${strengthPhrase}. Keep fuelling your recovery well.`,
        `Session logged ${hi}! ${strengthPhrase}. Rest up and come back strong.`,
        `${n}${strengthPhrase}. Strong day — your body will thank you tomorrow.`,
      ])

    case 'habit':
      if (gap)
        return pick([
          `${n}${strengthPhrase} — solid consistency. One thing to tighten up: ${gap}.`,
          `${streakDays} days straight ${hi}, with ${strengthPhrase}. Small note: ${gap}.`,
          `${n}${strengthPhrase} and a ${streakDays}-day streak. Just watch: ${gap}.`,
        ])
      return pick([
        `${n}${strengthPhrase} and ${streakDays} days straight. Real habits are forming.`,
        `Solid consistency ${hi} — ${strengthPhrase}. ${7 - streakDays > 0 ? (7 - streakDays) + ' more days for a full week.' : 'Full week achieved!'}`,
        `${n}${streakDays}-day streak with ${strengthPhrase}. You're in the zone now.`,
      ])

    case 'motivating':
      if (gap)
        return pick([
          `${n}${strengthPhrase}. To take it further: ${gap}.`,
          `Good progress ${hi} — ${strengthPhrase}. One push left: ${gap}.`,
          `${n}solid day building with ${strengthPhrase}. Worth working on: ${gap}.`,
        ])
      return pick([
        `${n}${strengthPhrase}. You're moving in the right direction.`,
        `Good progress ${hi} — ${strengthPhrase}. Every day adds up.`,
        `${n}${strengthPhrase}. Keep showing up and the results will follow.`,
      ])

    case 'thinking':
      return pick([
        `${n}${strengthPhrase}. Something to work on: ${gap}.`,
        `Good base ${hi} — ${strengthPhrase}. One thing to improve: ${gap}.`,
        `${n}the day's going well with ${strengthPhrase}. But ${gap}.`,
        `Decent progress ${hi}. ${strengthPhrase}. Focus area: ${gap}.`,
      ])

    case 'resting':
      if (gap)
        return pick([
          `${n}${strengthPhrase} — good day overall. Before bed: ${gap}.`,
          `Good evening ${hi}. ${strengthPhrase}. One last thing: ${gap}.`,
          `${n}${strengthPhrase}. Wind down and rest — just note: ${gap}.`,
        ])
      return pick([
        `${n}${strengthPhrase}. Great day — rest up and come back strong tomorrow.`,
        `Good evening ${hi}. ${strengthPhrase}. Recovery is part of the process.`,
        `${n}${strengthPhrase}. You've done the work today. Sleep well.`,
      ])

    case 'mindset':
      return pick([
        `${n}looking back at a past day. Every piece of data is a lesson for today.`,
        `Past data helps you improve ${hi}. What will you do differently today?`,
        `${n}reflection is powerful. Use what you see here to build better habits.`,
        `Analyzing your past ${hi} — good habit. Apply those insights right now.`,
      ])

    default:
      return `${n}ready when you are. Log your first meal to get started.`
  }
}

// ─────────────────────────────────────────────────────────────
// Public hook — instant, no API, two-layer system
// ─────────────────────────────────────────────────────────────
export function useCoachMessage(ctx, lang) {
  if (!ctx || !ctx.mood) return { message: '', loading: false }
  const message = buildMessage(ctx.mood, ctx, lang)
  return { message, loading: false }
}
