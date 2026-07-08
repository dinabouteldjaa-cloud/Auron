import { useState, useRef } from 'react'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'

// ─────────────────────────────────────────────────────────────
// Auron character image map
// Drop images in /public/auron/ — missing ones show placeholder.
// ─────────────────────────────────────────────────────────────
export const AURON_IMAGES = {
  introduction: '/auron/introduction.png', // full body — first time user welcome screen
  greeting:     '/auron/greeting.png',     // cropped — daily morning greeting in coach card
  happy:        '/auron/happy.png',
  motivating:   '/auron/motivating.png',
  thinking:     '/auron/thinking.png',
  celebrating:  '/auron/celebrating.png',
  concerned:    '/auron/concerned.png',
  resting:      '/auron/resting.png',
  nutrition:    '/auron/nutrition.png',
  workout:      '/auron/workout.png',
  habit:        '/auron/habit.png',
  mindset:      '/auron/mindset.png',
}

// ─────────────────────────────────────────────────────────────
// Mood → expression mapping
// ─────────────────────────────────────────────────────────────
export function getAuronMood({ isToday, totalCal, calorieGoal, streakDays, workoutCount, hour }) {
  if (!isToday)                           return 'mindset'
  if (totalCal > calorieGoal)            return 'concerned'
  if (streakDays >= 7)                   return 'celebrating'
  if (workoutCount > 0 && totalCal > 0)  return 'happy'
  if (workoutCount > 0)                  return 'workout'
  if (streakDays >= 3)                   return 'habit'
  if (streakDays >= 1)                   return 'motivating'
  if (totalCal === 0 && hour < 10)       return 'greeting'
  if (totalCal === 0 && hour >= 10)      return 'concerned'
  if (hour >= 20 && totalCal > 0)        return 'resting'
  if (hour >= 12 && totalCal === 0)      return 'motivating'
  return 'happy'
}

// ─────────────────────────────────────────────────────────────
// AuronCharacter — renders the right expression image
// Falls back to placeholder if the file isn't there yet
// size: 'hero' | 'compact' | 'welcome'
// ─────────────────────────────────────────────────────────────
export function AuronCharacter({ mood = 'happy', size = 'hero' }) {
  const [loaded, setLoaded] = useState(false)
  const [error,  setError]  = useState(false)

  const src = AURON_IMAGES[mood] || AURON_IMAGES.greeting

  const dim = size === 'welcome'
    ? { width: 240, height: 300 }
    : size === 'onboarding'
    ? { width: 150, height: 190 }
    : size === 'hero'
    ? { width: 110, height: 140 }
    : { width: 68, height: 80 }

  return (
    <div style={{ position: 'relative', ...dim, flexShrink: 0 }}>
      {!error && (
        <img
          key={src}
          src={src}
          alt={`Auron — ${mood}`}
          onLoad={() => { setLoaded(true); setError(false) }}
          onError={() => { setError(true); setLoaded(false) }}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain', objectPosition: 'bottom',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            position: 'absolute', inset: 0,
          }}
        />
      )}
      {(!loaded || error) && (
        <div style={{
          width: '100%', height: '100%',
          borderRadius: size === 'compact' ? 10 : 16,
          background: `linear-gradient(160deg, ${T.heroGrad1}, ${T.heroGrad2})`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={{
            width: size === 'welcome' ? 48 : size === 'hero' ? 32 : 20,
            height: size === 'welcome' ? 48 : size === 'hero' ? 32 : 20,
            borderRadius: 10,
            border: '1.5px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.12)',
          }} />
          {size !== 'compact' && (
            <div style={{ fontSize: size === 'welcome' ? 13 : 9, color: 'rgba(255,255,255,0.9)', fontWeight: 700, textAlign: 'center' }}>
              Auron
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AuronWelcomeScreen — full-screen intro, shown once per user
// ─────────────────────────────────────────────────────────────
export function AuronWelcomeScreen({ onDismiss }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: `linear-gradient(170deg, ${T.heroGrad1} 0%, ${T.heroGrad2} 50%, #9B8AF8 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
        <AuronCharacter mood="introduction" size="welcome" />
      </div>

      <div style={{
        background: '#fff', borderRadius: 20, padding: '16px 22px',
        marginBottom: 28, maxWidth: 280, textAlign: 'center',
        position: 'relative', zIndex: 1,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '10px solid #fff' }} />
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>Hi! I'm</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.purple, marginBottom: 4 }}>Auron 👋</div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55 }}>
          Your AI health companion. Here to support your fitness, nutrition and wellness — every step of the way.
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
        {['Supportive', 'Motivating', 'Smart', 'Reliable'].map(trait => (
          <div key={trait} style={{
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            fontSize: 13, color: '#fff', fontWeight: 500,
          }}>
            {trait}
          </div>
        ))}
      </div>

      <button
        onClick={onDismiss}
        style={{
          padding: '15px 48px', borderRadius: 30,
          background: '#fff', color: T.purple,
          border: 'none', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', position: 'relative', zIndex: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        Let's get started →
      </button>

      <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
        Let's build a healthier, stronger, happier you. Together. 💜
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CoachHero — main coach card shown on Today tab
// ─────────────────────────────────────────────────────────────
export function CoachHero({ mood = 'neutral', message = '', loading = false, actionLabel = '', onAction = null }) {
  const { t } = useTranslation()
  return (
    <div style={{ background: T.purpleLight, border: `1px solid ${T.borderStrong}`, borderRadius: 20, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px 0' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✦</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t('coach.name')}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 120 }}>
        <div style={{ width: 120, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 8 }}>
          <AuronCharacter mood={mood} size="hero" />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '10px 16px 14px 8px' }}>
          {loading ? (
            <div style={{ width: '100%', textAlign: 'left' }}>
              <style>{`@keyframes pulseName{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.purple, animation: 'pulseName 1.4s ease-in-out infinite' }}>
                {t('coach.name')}
              </span>
            </div>
          ) : message ? (
            <div style={{ fontSize: 14.5, color: T.text, lineHeight: 1.6, fontWeight: 500 }}>{message}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CoachInsightCard — compact card for the 2-col row
// ─────────────────────────────────────────────────────────────
export function CoachInsightCard({ message, mood = 'happy' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      border: `1px solid ${T.divider}`,
      boxShadow: T.shadowCard,
      padding: '14px 14px',
      display: 'flex', flexDirection: 'column',
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.purple }}>{t('coach.name') + ' Insight'}</span>
        <span style={{ fontSize: 11, color: T.purple }}>›</span>
      </div>
      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6, flex: 1 }}>
        {message || 'Log your first meal to get a personalised insight.'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <AuronCharacter mood={mood} size="compact" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TabAuronCard — reusable, stable, rule-based coach card for
// Nutrition / Medication / Workout / Progress / Profile tabs.
// Same stability approach as TodayTab's useCoachMessage:
// pass ctx=null while the tab's own data is still loading so
// the first visible message is already the correct one.
// ─────────────────────────────────────────────────────────────

function pick(arr, seed) {
  return arr[Math.abs(Math.round(seed)) % arr.length]
}

// ---- Nutrition -------------------------------------------------
function nutritionPriority(ctx) {
  const { totalCal, calorieGoal, proteinPct, foodLogsCount, hour, waterPct } = ctx
  if (foodLogsCount === 0 && hour >= 11) return { type: 'no_food' }
  if (totalCal > calorieGoal * 1.08 && calorieGoal > 0) return { type: 'over_cal', calOver: Math.round(totalCal - calorieGoal) }
  if (proteinPct < 35 && hour >= 15 && foodLogsCount > 0) return { type: 'protein_low' }
  if (waterPct != null && waterPct < 40 && hour >= 14) return { type: 'water_low' }
  if (foodLogsCount >= 3 && proteinPct >= 70 && (calorieGoal === 0 || totalCal <= calorieGoal * 1.05)) return { type: 'nutrition_great' }
  if (foodLogsCount >= 1) return { type: 'nutrition_ok' }
  return { type: 'nutrition_start' }
}
function nutritionMood(p) {
  return { no_food:'concerned', over_cal:'concerned', protein_low:'thinking', water_low:'thinking',
           nutrition_great:'happy', nutrition_ok:'nutrition', nutrition_start:'greeting' }[p.type] || 'nutrition'
}
function nutritionMessage(p, ctx, lang) {
  const fr = lang === 'fr'
  if (fr) {
    switch (p.type) {
      case 'no_food':        return ["Aucun repas enregistré pour l'instant. Notez votre prochain repas.", "N'oubliez pas d'enregistrer ce que vous mangez aujourd'hui."]
      case 'over_cal':       return [`${p.calOver} kcal au-dessus de l'objectif. Misez sur des options légères ce soir.`, `Objectif dépassé de ${p.calOver} kcal — pas grave, restez léger(e) pour la suite.`]
      case 'protein_low':    return ["Vos protéines sont un peu faibles aujourd'hui. Un œuf ou du yaourt grec aiderait.", "Pensez à ajouter une source de protéines à votre prochain repas."]
      case 'water_low':      return ["L'hydratation est en retard pour cette heure. Buvez un verre d'eau maintenant.", "Pensez à boire un peu plus d'eau aujourd'hui."]
      case 'nutrition_great':return ["Belle journée nutrition — repas et protéines bien équilibrés. Continuez !", "Vos repas sont bien équilibrés aujourd'hui. Beau travail."]
      case 'nutrition_ok':   return ["Bon départ aujourd'hui. Continuez à enregistrer vos repas.", "Repas enregistrés — pensez à viser vos objectifs de protéines."]
      default:                return ["Enregistrez votre premier repas pour commencer à suivre votre journée.", "Prêt(e) à suivre votre nutrition ? Ajoutez votre premier repas."]
    }
  }
  switch (p.type) {
    case 'no_food':        return ["No meals logged yet. Log your next meal to stay on track.", "Don't forget to log what you're eating today."]
    case 'over_cal':       return [`${p.calOver} kcal over your goal. Keep things light for the rest of the day.`, `You're ${p.calOver} kcal over — no big deal, just ease up a bit.`]
    case 'protein_low':    return ["Protein's a bit low today. An egg or some Greek yogurt would help.", "Consider adding a protein source to your next meal."]
    case 'water_low':      return ["Hydration is behind for this time of day. Grab a glass of water.", "Try to drink a bit more water today."]
    case 'nutrition_great':return ["Great nutrition day — meals and protein are well balanced. Keep it up!", "Your meals are well balanced today. Nice work."]
    case 'nutrition_ok':   return ["Good start today. Keep logging your meals.", "Meals logged — keep an eye on your protein target too."]
    default:                return ["Log your first meal to start tracking your day.", "Ready to track your nutrition? Add your first meal."]
  }
}

// ---- Medication --------------------------------------------------
function medicationPriority(ctx) {
  const { pendingMedsDueSoon, missedCount, takenCount, pendingCount, totalActive } = ctx
  if (pendingMedsDueSoon > 0) return { type: 'due_soon' }
  if (missedCount > 0) return { type: 'missed' }
  if (totalActive === 0) return { type: 'none_set' }
  if (pendingCount === 0 && takenCount > 0) return { type: 'all_taken' }
  if (takenCount > 0) return { type: 'in_progress' }
  return { type: 'reminder_default' }
}
function medicationMood(p) {
  return { due_soon:'concerned', missed:'concerned', none_set:'greeting', all_taken:'celebrating',
           in_progress:'motivating', reminder_default:'habit' }[p.type] || 'habit'
}
function medicationMessage(p, ctx, lang) {
  const fr = lang === 'fr'
  if (fr) {
    switch (p.type) {
      case 'due_soon':   return ["Un médicament est dû bientôt. Prenez-le quand vous êtes prêt(e).", "N'oubliez pas votre prise à venir."]
      case 'missed':     return ["Une prise a été manquée aujourd'hui. Marquez-la dès que possible.", "Pensez à rattraper la prise manquée si c'est encore raisonnable."]
      case 'none_set':   return ["Aucun médicament enregistré. Ajoutez-en un pour activer les rappels.", "Ajoutez votre premier médicament pour commencer à suivre vos prises."]
      case 'all_taken':  return ["Toutes vos prises du jour sont faites. Bien joué !", "Journée complète côté médicaments — bravo pour votre régularité."]
      case 'in_progress':return ["Vous avancez bien sur vos prises aujourd'hui.", "Continuez, il reste quelques prises à faire aujourd'hui."]
      default:            return ["Vos prises du jour vous attendent.", "Pensez à cocher vos médicaments au fil de la journée."]
    }
  }
  switch (p.type) {
    case 'due_soon':   return ["A medication is due soon. Take it when you're ready.", "Don't forget your upcoming dose."]
    case 'missed':     return ["A dose was missed today. Mark it as soon as you can.", "Consider catching up on the missed dose if it's still reasonable."]
    case 'none_set':   return ["No medications set up yet. Add one to enable reminders.", "Add your first medication to start tracking doses."]
    case 'all_taken':  return ["All of today's doses are done. Nice work!", "Full house on medications today — great consistency."]
    case 'in_progress':return ["You're on track with today's doses.", "Keep going — a few more doses to log today."]
    default:            return ["Today's doses are waiting for you.", "Check off your medications as you go through the day."]
  }
}

// ---- Workout -------------------------------------------------
function workoutPriority(ctx) {
  const { workoutDone, steps, streakDays, hour } = ctx
  if (streakDays >= 7) return { type: 'streak', days: streakDays }
  if (workoutDone) return { type: 'done' }
  if (steps < 3000 && hour >= 15) return { type: 'low_steps' }
  if (hour >= 17) return { type: 'evening_nudge' }
  return { type: 'default' }
}
function workoutMood(p) {
  return { streak:'celebrating', done:'workout', low_steps:'motivating', evening_nudge:'motivating', default:'habit' }[p.type] || 'workout'
}
function workoutMessage(p, ctx, lang) {
  const fr = lang === 'fr'
  if (fr) {
    switch (p.type) {
      case 'streak':       return [`${p.days} jours d'affilée ! Une vraie habitude est en train de se construire.`, `Série de ${p.days} jours — impressionnant, continuez.`]
      case 'done':         return ["Séance faite aujourd'hui — beau travail. Pensez à bien récupérer.", "Entraînement du jour terminé. Bien joué !"]
      case 'low_steps':    return ["Peu de mouvement pour l'instant. Une courte marche ferait du bien.", "Vous pouvez encore bouger un peu aujourd'hui — même 10 minutes comptent."]
      case 'evening_nudge':return ["Pas encore de séance aujourd'hui. Même un entraînement court compte.", "Il reste du temps pour bouger un peu ce soir."]
      default:               return ["Prêt(e) pour une séance aujourd'hui ? Choisissez un entraînement dans la bibliothèque.", "Chaque séance compte, même une courte."]
    }
  }
  switch (p.type) {
    case 'streak':       return [`${p.days} days in a row! You're building a real habit.`, `${p.days}-day streak — impressive, keep it going.`]
    case 'done':         return ["Workout done today — nice work. Make sure to recover well.", "Today's session is complete. Well done!"]
    case 'low_steps':    return ["Movement's a bit low so far. A short walk would help.", "There's still time to move a little today — even 10 minutes counts."]
    case 'evening_nudge':return ["No workout logged yet today. Even a short session counts.", "There's still time for a quick workout this evening."]
    default:               return ["Ready for a session today? Pick a workout from the library.", "Every session counts, even a short one."]
  }
}

// ---- Progress -------------------------------------------------
function progressPriority(ctx) {
  const { daysLogged, streakDays, avgWater, waterGoal } = ctx
  if (streakDays >= 7) return { type: 'strong_streak' }
  if (daysLogged <= 2) return { type: 'low_logging' }
  if (avgWater != null && waterGoal && avgWater < waterGoal * 0.5) return { type: 'water_gap' }
  if (daysLogged >= 5) return { type: 'consistent' }
  return { type: 'default' }
}
function progressMood(p) {
  return { strong_streak:'celebrating', low_logging:'concerned', water_gap:'thinking', consistent:'happy', default:'motivating' }[p.type] || 'mindset'
}
function progressMessage(p, ctx, lang) {
  const fr = lang === 'fr'
  if (fr) {
    switch (p.type) {
      case 'strong_streak':return [`${ctx.streakDays} jours de régularité ! Votre progression est solide.`, "Belle série en cours — la constance paie."]
      case 'low_logging':  return ["Peu de jours enregistrés cette semaine. Essayez de noter au moins un repas par jour.", "Enregistrer chaque jour, même brièvement, aide à voir votre vraie progression."]
      case 'water_gap':    return ["Votre hydratation moyenne est en dessous de l'objectif cette semaine.", "Pensez à boire un peu plus d'eau les prochains jours."]
      case 'consistent':   return ["Bonne semaine de régularité — continuez comme ça.", "Vous suivez bien votre semaine. Beau travail."]
      default:               return ["Continuez à enregistrer vos journées pour voir votre progression se dessiner.", "Chaque jour enregistré rend votre suivi plus utile."]
    }
  }
  switch (p.type) {
    case 'strong_streak':return [`${ctx.streakDays} days of consistency! Your progress is solid.`, "Great streak going — consistency is paying off."]
    case 'low_logging':  return ["Not many days logged this week. Try logging at least one meal daily.", "Logging daily, even briefly, helps you see real progress."]
    case 'water_gap':    return ["Your average hydration is below goal this week.", "Try drinking a bit more water over the next few days."]
    case 'consistent':   return ["Solid consistency this week — keep it up.", "You're tracking your week well. Nice work."]
    default:               return ["Keep logging your days to see your progress take shape.", "Every day you log makes your tracking more useful."]
  }
}

// ---- Profile -------------------------------------------------
function profilePriority(ctx) {
  const { missingCount, streakDays, activePrefsCount } = ctx
  if (missingCount >= 2) return { type: 'incomplete' }
  if (missingCount === 1) return { type: 'almost_done' }
  if (streakDays >= 7) return { type: 'streak' }
  if (activePrefsCount === 0) return { type: 'no_prefs' }
  return { type: 'complete' }
}
function profileMood(p) {
  return { incomplete:'concerned', almost_done:'thinking', streak:'celebrating', no_prefs:'thinking', complete:'happy' }[p.type] || 'greeting'
}
function profileMessage(p, ctx, lang) {
  const fr = lang === 'fr'
  if (fr) {
    switch (p.type) {
      case 'incomplete': return ["Votre profil est incomplet. Ajoutez vos infos pour des objectifs plus précis.", "Complétez votre profil pour des recommandations plus justes."]
      case 'almost_done':return ["Presque terminé ! Il manque juste un petit détail à votre profil.", "Une dernière info et votre profil sera complet."]
      case 'streak':      return [`${ctx.streakDays} jours de suite — belle régularité globale !`, "Votre constance générale est impressionnante."]
      case 'no_prefs':    return ["Ajoutez vos préférences alimentaires pour des suggestions plus adaptées.", "Renseignez vos restrictions ou préférences dans Santé & Alimentation."]
      default:              return ["Votre profil est complet. Merci de garder vos infos à jour.", "Tout est en ordre dans votre profil."]
    }
  }
  switch (p.type) {
    case 'incomplete': return ["Your profile's incomplete. Fill it in for more accurate goals.", "Complete your profile for better-tailored recommendations."]
    case 'almost_done':return ["Almost there! Just one more detail needed on your profile.", "One more field and your profile will be complete."]
    case 'streak':      return [`${ctx.streakDays} days in a row — great overall consistency!`, "Your overall consistency is impressive."]
    case 'no_prefs':    return ["Add your food preferences for better-tailored suggestions.", "Set your restrictions or preferences under Health & Food."]
    default:              return ["Your profile is complete. Keep your info up to date.", "Everything looks good on your profile."]
  }
}

const TAB_ENGINES = {
  nutrition:  { priority: nutritionPriority,  mood: nutritionMood,  message: nutritionMessage  },
  medication: { priority: medicationPriority, mood: medicationMood, message: medicationMessage },
  workout:    { priority: workoutPriority,    mood: workoutMood,    message: workoutMessage    },
  progress:   { priority: progressPriority,   mood: progressMood,   message: progressMessage   },
  profile:    { priority: profilePriority,    mood: profileMood,    message: profileMessage    },
}

// Coarse, stable seed — only changes when the underlying situation
// meaningfully changes, not on every render.
function buildTabSeed(ctx) {
  let s = 0
  for (const k in ctx) {
    const v = ctx[k]
    if (typeof v === 'number') s += Math.floor(v / 5) * (k.length + 1)
    else if (typeof v === 'boolean') s += v ? 7 : 0
  }
  return s
}

function useTabInsight(tab, ctx, lang) {
  const messageRef = useRef('')
  const moodRef     = useRef('greeting')
  const typeRef     = useRef(null)
  const seedRef     = useRef(null)
  const langRef     = useRef(null)
  const tabRef      = useRef(null)

  const engine = TAB_ENGINES[tab]
  if (!ctx || !engine) return { message: messageRef.current, mood: moodRef.current, ready: !!ctx }

  const priority = engine.priority(ctx)
  const seed     = buildTabSeed(ctx)

  if (
    priority.type !== typeRef.current ||
    seed          !== seedRef.current ||
    lang          !== langRef.current ||
    tab           !== tabRef.current
  ) {
    messageRef.current = pick(engine.message(priority, ctx, lang), seed)
    moodRef.current    = engine.mood(priority)
    typeRef.current    = priority.type
    seedRef.current    = seed
    langRef.current    = lang
    tabRef.current      = tab
  }

  return { message: messageRef.current, mood: moodRef.current, ready: true }
}

// ─────────────────────────────────────────────────────────────
// TabAuronCard — compact insight card for non-Today tabs.
// Pass ctx=null while the tab's own data is still loading to
// avoid an initial message flashing before real data resolves.
// ─────────────────────────────────────────────────────────────
export function TabAuronCard({ tab, ctx, lang }) {
  const { message, mood, ready } = useTabInsight(tab, ctx, lang)
  if (!ready || !message) return null

  return (
    <div style={{
      background: T.purpleLight, border: `1px solid ${T.borderStrong}`,
      borderRadius: 18, marginBottom: 16, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flexShrink: 0 }}>
        <AuronCharacter mood={mood} size="compact" />
      </div>
      <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5, fontWeight: 500 }}>
        {message}
      </div>
    </div>
  )
}
