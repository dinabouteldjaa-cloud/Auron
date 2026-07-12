// ─────────────────────────────────────────────────────────────
// Shared Auron Score logic — used by TodayTab (today's live score)
// and ProgressTab (score history/trends). Keeping this in one place
// guarantees both tabs always agree on how "the score" is computed.
// ─────────────────────────────────────────────────────────────

export function computeDayScores({ loggedMealSlotCount, totalMealSlots, proteinTotal, proteinGoal, waterAmount, waterGoal, workoutDone, hasScheduledWorkout, medsScheduledCount, medsTakenCount }) {
  let nutritionScore = (loggedMealSlotCount / totalMealSlots) * 100
  if (proteinGoal > 0 && proteinTotal >= proteinGoal * 0.5) nutritionScore = Math.min(100, nutritionScore + 5)
  nutritionScore = Math.round(Math.max(0, Math.min(100, nutritionScore)))

  const waterScore = Math.round(waterGoal > 0 ? Math.max(0, Math.min(100, (waterAmount / waterGoal) * 100)) : 0)

  const workoutScore = workoutDone ? 100 : (hasScheduledWorkout ? 0 : null)

  const medsNoneScheduled = medsScheduledCount === 0
  const medicationScore = medsNoneScheduled ? null : Math.round((medsTakenCount / medsScheduledCount) * 100)

  const categories = [
    { key: 'nutrition',  weight: 35, value: nutritionScore, active: true },
    { key: 'water',      weight: 20, value: waterScore,     active: true },
    { key: 'workout',    weight: 25, value: workoutScore,   active: workoutScore != null },
    { key: 'medication', weight: 20, value: medicationScore,active: medicationScore != null },
  ]
  const activeCategories   = categories.filter(c => c.active)
  const totalActiveWeight  = activeCategories.reduce((s, c) => s + c.weight, 0) || 1
  const overallScore = Math.round(
    activeCategories.reduce((s, c) => s + (c.value * c.weight), 0) / totalActiveWeight
  )

  return { nutritionScore, waterScore, workoutScore, medicationScore, overallScore, categories }
}

export function scoreRank(score) {
  if (score >= 90) return { key: 'elite',     label: 'Elite' }
  if (score >= 80) return { key: 'excellent', label: 'Excellent' }
  if (score >= 70) return { key: 'good',      label: 'Good' }
  if (score >= 60) return { key: 'fair',      label: 'Fair' }
  return { key: 'attention', label: 'Needs Attention' }
}
