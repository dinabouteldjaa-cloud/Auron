// ─────────────────────────────────────────────────────────────
// Auron i18n — Translation system
// Languages: English (en), French (fr)
// Usage:
//   const { t, lang, setLang } = useTranslation()
//   t('today.greeting') → "Good morning" / "Bonjour"
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from 'react'

// ── Translation dictionary ────────────────────────────────────
const translations = {
  en: {
    // Navigation
    'nav.home':       'Home',
    'nav.nutrition':  'Nutrition',
    'nav.progress':   'Progress',
    'nav.meds':       'Meds',
    'nav.profile':    'Profile',

    // Greeting (time-based)
    'greeting.morning':   'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening':   'Good evening',
    'greeting.late':      'Up late',

    // Today tab
    'today.title':          'Today',
    'today.calories':       'Calories',
    'today.left':           'left',
    'today.over':           'over',
    'today.macros':         'Macros',
    'today.protein':        'Protein',
    'today.carbs':          'Carbs',
    'today.fats':           'Fats',
    'today.viewNutrition':  'View Nutrition',
    'today.activity':       'Activity',
    'today.steps':          'Steps',
    'today.sleep':          'Sleep',
    'today.logWorkout':     'Log Workout',
    'today.viewProgress':   'View Progress',
    'today.water':          'Water',
    'today.settings':       '⚙ Settings',
    'today.meals':          'Meals',
    'today.workout':        'Workout',

    // Meals
    'meals.breakfast':      'Breakfast',
    'meals.lunch':          'Lunch',
    'meals.snack':          'Snack',
    'meals.dinner':         'Dinner',
    'meals.nothingLogged':  'Nothing logged',
    'meals.items':          'items',
    'meals.item':           'item',

    // Medication
    'meds.title':         'Medication',
    'meds.nextUp':        'Next up',
    'meds.taken':         '✓ Taken',
    'meds.missed':        '✗ Missed',
    'meds.noMeds':        'No meds',
    'meds.openTracker':   'Open Medication Tracker',
    'meds.markTaken':     'Mark as taken',
    'meds.seeAll':        'See all',
    'meds.today':         "Today's meds",
    'meds.all':           'All medications',
    'meds.add':           '+ Add',
    'meds.pending':       'Pending',
    'meds.edit':          'Edit',
    'meds.noMedsYet':     'No medications yet',
    'meds.addFirst':      'Tap "Add" to log your first medication.',
    'meds.addMed':        'Add medication',
    'meds.editMed':       'Edit medication',
    'meds.name':          'Medication name',
    'meds.dose':          'Dose',
    'meds.frequency':     'Frequency',
    'meds.reminderTime':  'Reminder time',
    'meds.startDate':     'Start date',
    'meds.endDate':       'End date (optional)',
    'meds.notes':         'Notes',
    'meds.saveChanges':   'Save changes',
    'meds.saving':        'Saving...',
    'meds.confirm':       'Confirm',
    'meds.takenToday':    'Taken today',

    // Auth
    'auth.welcomeBack':   'Welcome back',
    'auth.createAccount': 'Create account',
    'auth.resetPassword': 'Reset password',
    'auth.email':         'Email address',
    'auth.password':      'Password',
    'auth.fullName':      'Full name',
    'auth.signIn':        'Sign in',
    'auth.signUp':        'Create account',
    'auth.sendReset':     'Send reset link',
    'auth.waiting':       'Please wait...',
    'auth.noAccount':     "Don't have an account? Sign up",
    'auth.hasAccount':    'Already have an account? Sign in',
    'auth.forgot':        'Forgot your password?',
    'auth.backToSignIn':  'Back to sign in',
    'auth.tagline':       'Your premium fitness companion',
    'auth.resetSent':     'Password reset link sent — check your inbox.',
    'auth.accountCreated':'Account created! Check your email to confirm, then sign in.',

    // Profile
    'profile.title':        'Profile',
    'profile.personalInfo': 'Personal info',
    'profile.fullName':     'Full name',
    'profile.age':          'Age',
    'profile.gender':       'Gender',
    'profile.weight':       'Weight (kg)',
    'profile.height':       'Height (cm)',
    'profile.nationality':  'Nationality',
    'profile.saveChanges':  'Save changes',
    'profile.saved':        'Saved ✓',
    'profile.saving':       'Saving...',
    'profile.language':     'Language',
    'profile.selectLang':   'Select your language',
    'profile.account':      'Account',
    'profile.signOut':      'Sign out',
    'profile.memberSince':  'Member since',

    // Language names
    'lang.en': 'English',
    'lang.fr': 'Français',

    // Coach Auron
    'coach.name':       'Coach Auron',
    'coach.openAI':     'Open AI Coach',
    'coach.comingSoon': 'Animated coach coming soon',

    // General
    'general.comingSoon': 'Coming soon',
    'general.cancel':     'Cancel',
    'general.save':       'Save',
    'general.loading':    'Loading...',
    'general.disclaimer': 'Auron provides wellness support and informational guidance only. Always follow the advice of your healthcare professionals.',
  },

  fr: {
    // Navigation
    'nav.home':       'Accueil',
    'nav.nutrition':  'Nutrition',
    'nav.progress':   'Progrès',
    'nav.meds':       'Médicaments',
    'nav.profile':    'Profil',

    // Greeting
    'greeting.morning':   'Bonjour',
    'greeting.afternoon': 'Bon après-midi',
    'greeting.evening':   'Bonsoir',
    'greeting.late':      'Encore debout',

    // Today tab
    'today.title':          'Aujourd\'hui',
    'today.calories':       'Calories',
    'today.left':           'restantes',
    'today.over':           'dépassées',
    'today.macros':         'Macros',
    'today.protein':        'Protéines',
    'today.carbs':          'Glucides',
    'today.fats':           'Lipides',
    'today.viewNutrition':  'Voir la nutrition',
    'today.activity':       'Activité',
    'today.steps':          'Pas',
    'today.sleep':          'Sommeil',
    'today.logWorkout':     'Ajouter séance',
    'today.viewProgress':   'Voir les progrès',
    'today.water':          'Eau',
    'today.settings':       '⚙ Paramètres',
    'today.meals':          'Repas',
    'today.workout':        'Entraînement',

    // Meals
    'meals.breakfast':      'Petit-déjeuner',
    'meals.lunch':          'Déjeuner',
    'meals.snack':          'Collation',
    'meals.dinner':         'Dîner',
    'meals.nothingLogged':  'Rien d\'enregistré',
    'meals.items':          'aliments',
    'meals.item':           'aliment',

    // Medication
    'meds.title':         'Médicaments',
    'meds.nextUp':        'Prochain',
    'meds.taken':         '✓ Pris',
    'meds.missed':        '✗ Manqué',
    'meds.noMeds':        'Aucun méd.',
    'meds.openTracker':   'Ouvrir le suivi',
    'meds.markTaken':     'Marquer comme pris',
    'meds.seeAll':        'Tout voir',
    'meds.today':         'Médicaments du jour',
    'meds.all':           'Tous les médicaments',
    'meds.add':           '+ Ajouter',
    'meds.pending':       'En attente',
    'meds.edit':          'Modifier',
    'meds.noMedsYet':     'Aucun médicament',
    'meds.addFirst':      'Appuyez sur "Ajouter" pour enregistrer votre premier médicament.',
    'meds.addMed':        'Ajouter un médicament',
    'meds.editMed':       'Modifier le médicament',
    'meds.name':          'Nom du médicament',
    'meds.dose':          'Dosage',
    'meds.frequency':     'Fréquence',
    'meds.reminderTime':  'Heure du rappel',
    'meds.startDate':     'Date de début',
    'meds.endDate':       'Date de fin (optionnel)',
    'meds.notes':         'Notes',
    'meds.saveChanges':   'Enregistrer',
    'meds.saving':        'Enregistrement...',
    'meds.confirm':       'Confirmer',
    'meds.takenToday':    'Pris aujourd\'hui',

    // Auth
    'auth.welcomeBack':   'Bienvenue',
    'auth.createAccount': 'Créer un compte',
    'auth.resetPassword': 'Réinitialiser le mot de passe',
    'auth.email':         'Adresse e-mail',
    'auth.password':      'Mot de passe',
    'auth.fullName':      'Nom complet',
    'auth.signIn':        'Se connecter',
    'auth.signUp':        'Créer un compte',
    'auth.sendReset':     'Envoyer le lien',
    'auth.waiting':       'Veuillez patienter...',
    'auth.noAccount':     'Pas de compte ? S\'inscrire',
    'auth.hasAccount':    'Déjà un compte ? Se connecter',
    'auth.forgot':        'Mot de passe oublié ?',
    'auth.backToSignIn':  'Retour à la connexion',
    'auth.tagline':       'Votre compagnon fitness premium',
    'auth.resetSent':     'Lien envoyé — vérifiez votre boîte mail.',
    'auth.accountCreated':'Compte créé ! Confirmez votre e-mail puis connectez-vous.',

    // Profile
    'profile.title':        'Profil',
    'profile.personalInfo': 'Informations personnelles',
    'profile.fullName':     'Nom complet',
    'profile.age':          'Âge',
    'profile.gender':       'Genre',
    'profile.weight':       'Poids (kg)',
    'profile.height':       'Taille (cm)',
    'profile.nationality':  'Nationalité',
    'profile.saveChanges':  'Enregistrer',
    'profile.saved':        'Enregistré ✓',
    'profile.saving':       'Enregistrement...',
    'profile.language':     'Langue',
    'profile.selectLang':   'Choisissez votre langue',
    'profile.account':      'Compte',
    'profile.signOut':      'Se déconnecter',
    'profile.memberSince':  'Membre depuis',

    // Language names
    'lang.en': 'English',
    'lang.fr': 'Français',

    // Coach Auron
    'coach.name':       'Coach Auron',
    'coach.openAI':     'Ouvrir le coach IA',
    'coach.comingSoon': 'Coach animé bientôt disponible',

    // General
    'general.comingSoon': 'Bientôt disponible',
    'general.cancel':     'Annuler',
    'general.save':       'Enregistrer',
    'general.loading':    'Chargement...',
    'general.disclaimer': 'Auron fournit uniquement un soutien bien-être et des conseils informatifs. Suivez toujours les recommandations de votre professionnel de santé.',
  },
}

// ── Language Context ──────────────────────────────────────────
export const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
})

// ── Provider — wrap the whole app ────────────────────────────
export function LanguageProvider({ children, initialLang = 'en' }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('auron_lang') || initialLang || 'en'
  })

  const setLang = (newLang) => {
    if (!translations[newLang]) return
    setLangState(newLang)
    localStorage.setItem('auron_lang', newLang)
  }

  // t() — look up a key, fall back to English, then the key itself
  const t = (key, replacements = {}) => {
    const dict = translations[lang] || translations.en
    let str = dict[key] ?? translations.en[key] ?? key
    // Support simple replacements: t('hello', { name: 'Dina' }) → "Hello Dina"
    Object.entries(replacements).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v)
    })
    return str
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export function useTranslation() {
  return useContext(LanguageContext)
}

// ── Supported languages list ─────────────────────────────────
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]
