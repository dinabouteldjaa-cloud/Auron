import { useState, useEffect } from 'react'
import { T } from './theme.js'
import { AuronCharacter } from '../components/CoachAuron'

const C = T

// ─────────────────────────────────────────────────────────────
// Per-tab guide content — short, friendly, specific tips.
// Only existing Auron moods used.
// ─────────────────────────────────────────────────────────────
const GUIDES = {
  today: {
    mood: 'greeting',
    title:   { en: 'Your Daily Hub',        fr: 'Ton tableau de bord' },
    bullets: {
      en: [
        'See your calories, water, medication and workouts for the day at a glance.',
        'Tap any card — like "View Nutrition" or "Log workout" — to jump straight to that section.',
        'Swipe the week strip at the top to check past days.',
        'Coach Auron shows one relevant tip based on your whole day, not just one number.',
      ],
      fr: [
        'Vois tes calories, ton eau, tes médicaments et tes séances en un coup d\'œil.',
        'Appuie sur une carte — comme "Voir la nutrition" ou "Enregistrer une séance" — pour y accéder directement.',
        'Fais glisser la bande de la semaine en haut pour consulter les jours passés.',
        'Coach Auron affiche un conseil pertinent basé sur toute ta journée, pas juste un chiffre.',
      ],
    },
  },
  calories: {
    mood: 'nutrition',
    title:   { en: 'Nutrition',             fr: 'Nutrition' },
    bullets: {
      en: [
        'Tap a meal (Breakfast, Lunch, Snack, Dinner) to add food to it.',
        'Search foods by name, or describe your meal and let AI estimate the calories.',
        'Track calories, protein, carbs and fat against your daily goals.',
        'Your goals are set in Profile → Goals & Targets.',
      ],
      fr: [
        'Appuie sur un repas (Petit-déj, Déjeuner, Collation, Dîner) pour y ajouter un aliment.',
        'Recherche un aliment par nom, ou décris ton repas pour que l\'IA estime les calories.',
        'Suis tes calories, protéines, glucides et lipides par rapport à tes objectifs.',
        'Tes objectifs se règlent dans Profil → Objectifs.',
      ],
    },
  },
  workouts: {
    mood: 'motivating',
    title:   { en: 'Progress',              fr: 'Progrès' },
    bullets: {
      en: [
        'Track your weekly consistency — how many days you logged meals, water or workouts.',
        'Watch your streak grow the more consistent days you have in a row.',
        'Log your weight here to see your trend over time.',
        'Missing data? Auron will point out the one thing worth fixing first.',
      ],
      fr: [
        'Suis ta régularité hebdomadaire — combien de jours tu as enregistré repas, eau ou séances.',
        'Regarde ta série grandir avec plus de jours consécutifs réguliers.',
        'Enregistre ton poids ici pour voir son évolution dans le temps.',
        'Données manquantes ? Auron te signale la première chose à corriger.',
      ],
    },
  },
  workout: {
    mood: 'workout',
    title:   { en: 'Workout',               fr: 'Entraînement' },
    bullets: {
      en: [
        '"Library" has ready-made workouts across many sports — tap one to preview, then start.',
        '"My Plans" is where you build and save your own workouts.',
        'Try "Build with Coach Auron" — answer a few questions and get a personalised plan.',
        '"Today" shows anything scheduled for today and lets you start it in one tap.',
      ],
      fr: [
        '"Bibliothèque" propose des entraînements prêts à l\'emploi — aperçu puis lancement.',
        '"Mes plans" te permet de créer et sauvegarder tes propres séances.',
        'Essaie "Créer avec Coach Auron" — réponds à quelques questions pour un plan personnalisé.',
        '"Aujourd\'hui" affiche ce qui est prévu et permet de le démarrer en un geste.',
      ],
    },
  },
  medication: {
    mood: 'habit',
    title:   { en: 'Medication',            fr: 'Médicaments' },
    bullets: {
      en: [
        'Add a medication with its schedule to start getting reminders here.',
        'Mark each dose as taken or missed as you go through the day.',
        '"Taken" and "Missed" counts help you see your adherence at a glance.',
        'This tab is for tracking only — always follow your doctor or pharmacist\'s advice.',
      ],
      fr: [
        'Ajoute un médicament avec son horaire pour recevoir des rappels ici.',
        'Marque chaque prise comme faite ou manquée au fil de la journée.',
        'Les compteurs "Pris" et "Manqués" t\'aident à voir ta régularité en un coup d\'œil.',
        'Cet onglet sert uniquement au suivi — suis toujours les conseils de ton médecin ou pharmacien.',
      ],
    },
  },
  profile: {
    mood: 'thinking',
    title:   { en: 'Profile',               fr: 'Profil' },
    bullets: {
      en: [
        'Update your personal info — age, weight, height and goal — anytime.',
        'Set your calorie and macro targets under Goals & Targets.',
        'Add dietary preferences or allergies under Health & Food.',
        'Switch language, notifications and other app settings here too.',
      ],
      fr: [
        'Mets à jour tes infos — âge, poids, taille et objectif — à tout moment.',
        'Règle tes objectifs de calories et macros dans Objectifs.',
        'Ajoute tes préférences alimentaires ou allergies dans Santé & Alimentation.',
        'Change aussi la langue, les notifications et d\'autres réglages ici.',
      ],
    },
  },
}

// ─────────────────────────────────────────────────────────────
// Hook — tracks whether the first-visit guide for a tab has
// already been shown to this user. Same localStorage pattern
// used for the onboarding "welcomed" flag.
// ─────────────────────────────────────────────────────────────
export function useTabGuide(tabKey, userId) {
  const storageKey = `auron_guide_${tabKey}_${userId}`
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!userId || !GUIDES[tabKey]) return
    const seen = localStorage.getItem(storageKey)
    if (!seen) setShow(true)
  }, [tabKey, userId])

  const dismiss = () => {
    localStorage.setItem(storageKey, '1')
    setShow(false)
  }

  const reopen = () => setShow(true)

  return { show, dismiss, reopen, hasGuide: !!GUIDES[tabKey] }
}

// ─────────────────────────────────────────────────────────────
// HowToGuideModal — bottom-sheet style, short and friendly
// ─────────────────────────────────────────────────────────────
export function HowToGuideModal({ tabKey, lang, onClose }) {
  const guide = GUIDES[tabKey]
  if (!guide) return null
  const fr = lang === 'fr'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.55)', zIndex: 600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: C.surface, borderRadius: '26px 26px 0 0', width: '100%', maxWidth: 480, padding: '20px 22px 32px', boxShadow: '0 -8px 32px rgba(0,0,0,0.18)' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.divider, margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <AuronCharacter mood={guide.mood} size="compact" />
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {fr ? 'Comment utiliser' : 'How to use'}
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.text }}>
              {fr ? guide.title.fr : guide.title.en}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
          {(fr ? guide.bullets.fr : guide.bullets.en).map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.purpleLight, color: C.purple, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55 }}>{b}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', padding: 15, borderRadius: 18, background: C.purple, border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {fr ? 'Compris !' : 'Got it!'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HelpIconButton — small "?" button for the header, reopens guide
// ─────────────────────────────────────────────────────────────
export function HelpIconButton({ onClick, hidden }) {
  if (hidden) return null
  return (
    <button
      onClick={onClick}
      aria-label="How to use this page"
      style={{
        width: 34, height: 34, borderRadius: '50%',
        background: C.purpleLight, border: 'none', color: C.purple,
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      ?
    </button>
  )
}
