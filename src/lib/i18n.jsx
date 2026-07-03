import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Nav
    'nav.home':'Home','nav.nutrition':'Nutrition','nav.progress':'Progress','nav.meds':'Meds','nav.profile':'Profile',
    // Greetings
    'greeting.morning':'Good morning','greeting.afternoon':'Good afternoon','greeting.evening':'Good evening','greeting.late':'Up late',
    // Today
    'today.title':'Today','today.calories':'Calories','today.left':'left','today.over':'over',
    'today.macros':'Macros','today.protein':'Protein','today.carbs':'Carbs','today.fats':'Fats',
    'today.viewNutrition':'View Nutrition','today.activity':'Activity','today.steps':'Steps',
    'today.sleep':'Sleep','today.logWorkout':'Log Workout →','today.viewProgress':'View Progress →',
    'today.water':'Water','today.settings':'⚙ Settings','today.meals':'Meals','today.workout':'Workout',
    'today.todayLabel':'Today','today.yesterday':'Yesterday',
    'today.noWorkout':'No workout logged today','today.noWorkoutDay':'No workouts this day',
    'today.logWorkoutHint':'Go to the Workouts tab to log one',
    'today.greatJob':'Great job!','today.keepMoving':'Keep moving!',
    'today.of':'of','today.min':'min','today.steps10k':'/ 10,000 steps','today.min60':'/ 60 min',
    'today.thisWeek':'This week','today.lastWeek':'Last week','today.weeksAgo':'w ago',
    'today.streakDays':'day streak',
    // Meals
    'meals.breakfast':'Breakfast','meals.lunch':'Lunch','meals.snack':'Snack','meals.dinner':'Dinner',
    'meals.nothingLogged':'Nothing logged','meals.items':'items','meals.item':'item',
    'meals.time.breakfast':'6–10am','meals.time.lunch':'11am–2pm','meals.time.snack':'2–5pm','meals.time.dinner':'5–9pm',
    // Coach
    'coach.name':'Coach Auron','coach.openAI':'✨ Open AI Coach ›','coach.comingSoon':'Animated coach coming soon',
    // Medication - Today card
    'meds.title':'Medication','meds.nextUp':'⏰ Next up','meds.takenLabel':'✓ Taken','meds.missedLabel':'✗ Missed',
    'meds.noMeds':'No meds','meds.openTracker':'📅 Open Medication Tracker ›','meds.seeAll':'See all ›',
    'meds.markTaken':'Mark as taken','meds.today':'today',
    'meds.markName':'✓ Mark {name} as taken',
    // Medication tab
    'meds.takenToday':'Taken today','meds.pending':'Pending','meds.missed':'Missed',
    'meds.nextUpFull':'⏰ NEXT UP','meds.markTakenBtn':'Mark taken',
    'meds.todaysMeds':"Today's meds",'meds.allMeds':'All medications','meds.add':'+ Add',
    'meds.noMedsYet':'No medications yet','meds.addFirst':'Tap "Add" to log your first medication.',
    'meds.addMedBtn':'Add medication',
    'meds.takenStatus':'✓ Taken','meds.pendingStatus':'Pending','meds.missedStatus':'Missed','meds.skippedStatus':'Skipped',
    'meds.edit':'Edit','meds.confirm':'Confirm',
    'meds.addTitle':'Add medication','meds.editTitle':'Edit medication',
    'meds.nameLabel':'Medication name *','meds.dosePlaceholder':'e.g. 1000 IU, 2 tablets',
    'meds.namePlaceholder':'e.g. Vitamin D3','meds.doseLabel':'Dose',
    'meds.frequencyLabel':'Frequency','meds.reminderLabel':'Reminder time',
    'meds.dose1':'Dose 1','meds.dose':'Dose',
    'meds.startDate':'Start date','meds.endDate':'End date (optional)',
    'meds.notesLabel':'Notes','meds.notesPlaceholder':'Any notes about this medication...',
    'meds.saveChanges':'Save changes','meds.saving':'Saving...',
    'meds.noTimeSet':'No time set',
    // Frequency options
    'freq.daily':'Once daily','freq.twice_daily':'Twice daily','freq.three_daily':'3× a day',
    'freq.four_daily':'4× a day','freq.every_morning':'Every morning','freq.every_night':'Every night',
    'freq.with_meals':'With meals','freq.weekly':'Once a week','freq.as_needed':'As needed',
    // Water
    'water.goal':'Daily water goal reached!','water.viewOnly':'View only — switch to today to log water',
    'water.cups':'cups','water.ml':'ml',
    // Calories tab
    'cal.describeBtn':'✨ Describe a meal — AI estimates calories',
    'cal.caloriesLabel':'Calories today','cal.remaining':'Remaining','cal.kcalOver':'kcal over','cal.kcalLeft':'kcal left',
    'cal.macrosToday':'Macros today','cal.foodLog':'Food log','cal.addFood':'+ Add food',
    'cal.aiSuggest':'✨ Coach Auron suggests','cal.respecting':'Respecting:','cal.askAI':'Ask AI',
    'cal.thinking':'Thinking...','cal.refresh':'↺ Refresh',
    'cal.tapAsk':'Tap "Ask AI" for a personalised meal suggestion based on what you\'ve eaten today.',
    'cal.describeTitle':'AI Calorie Estimator','cal.describeSubtitle':'Describe your meal and Auron will estimate the calories and macros.',
    'cal.logTo':'Log to:','cal.describePlaceholder':'e.g. A large plate of spaghetti bolognese with ground beef...',
    'cal.estimateBtn':'Estimate calories ✨','cal.estimating':'Estimating...',
    'cal.analyzing':'Analyzing your meal...','cal.logMeal':'+ Log this meal',
    'cal.noResults':'No results for',
    'cal.addingTo':'Adding to:','cal.searchFood':'Search food...',
    'cal.back':'← Back',
    'cal.highConf':'high confidence','cal.medConf':'medium confidence','cal.lowConf':'low confidence',
    'cal.nothingLogged':'Log your first meal in the Calories tab',
    // Profile
    'profile.title':'Profile','profile.personalInfo':'Personal info','profile.fullName':'Full name',
    'profile.age':'Age','profile.gender':'Gender','profile.weight':'Weight (kg)','profile.height':'Height (cm)',
    'profile.nationality':'Nationality','profile.saveChanges':'Save changes',
    'profile.saved':'Saved ✓','profile.saving':'Saving...','profile.namePlaceholder':'Your full name',
    'profile.agePlaceholder':'25','profile.genderSelect':'Select...',
    'profile.genderMale':'Male','profile.genderFemale':'Female','profile.genderOther':'Other','profile.genderPrefer':'Prefer not to say',
    'profile.nationalityPlaceholder':'e.g. Qatari, British, French...',
    'profile.calorieTargets':'Calorie & macro targets','profile.dailyCalGoal':'Daily calorie goal','profile.kcal':'kcal',
    'profile.protein':'Protein (g)','profile.carbsG':'Carbs (g)','profile.fatG':'Fat (g)',
    'profile.calculator':'🧮 Calculate my targets','profile.hideCalc':'▴ Hide calculator',
    'profile.calcTitle':'Calorie calculator','profile.calcAge':'Age','profile.calcGender':'Gender',
    'profile.calcMale':'Male','profile.calcFemale':'Female',
    'profile.calcWeight':'Weight (kg)','profile.calcHeight':'Height (cm)',
    'profile.activityLabel':'Activity level',
    'profile.act1':'Sedentary (desk job)','profile.act2':'Light (1–3 days/week)','profile.act3':'Moderate (3–5 days/week)',
    'profile.act4':'Active (6–7 days/week)','profile.act5':'Very active (athlete)',
    'profile.goalLabel':'Goal',
    'profile.goalLoseFast':'Lose 1 kg/week','profile.goalLose':'Lose 0.5 kg/week',
    'profile.goalMaintain':'Maintain weight','profile.goalGain':'Gain 0.5 kg/week','profile.goalGainFast':'Gain 1 kg/week',
    'profile.calculate':'Calculate','profile.applyTargets':'Apply these targets ✓',
    'profile.bmr':'BMR','profile.bmrSub':'kcal at rest',
    'profile.maintenance':'Maintenance','profile.maintenanceSub':'kcal/day',
    'profile.target':'Target','profile.targetSub':'kcal/day, goal: {goal}',
    'profile.proteinResult':'Protein','profile.perDay':'per day',
    'profile.fitnessGoal':'Fitness goal',
    'profile.loseWeight':'Lose weight','profile.buildMuscle':'Build muscle',
    'profile.endurance':'Improve endurance','profile.generalHealth':'General health','profile.maintain':'Maintain weight',
    'profile.workoutPrefs':'Workout preferences','profile.workoutComingSoon':'Workout preferences are coming in a future update.',
    'profile.healthPrefs':'Health & food preferences',
    'profile.language':'Language','profile.selectLang':'Select your language',
    'profile.account':'Account','profile.email':'Email','profile.memberSince':'Member since',
    'profile.signOut':'Sign out',
    // Health preferences
    'health.title':'Health & Food Preferences',
    'health.disclaimer':'Auron provides wellness support and informational guidance only. Always follow the advice of your healthcare professionals.',
    'health.dietary':'Dietary preferences','health.allergies':'Allergies',
    'health.restrictions':'Food restrictions','health.avoided':'Foods I avoid',
    'health.notes':'Personal health notes','health.notesPlaceholder':'e.g. Diabetic, managing high blood pressure...',
    'health.addAllergy':'+ Other allergy','health.addFood':'+ Add food to avoid',
    'health.addFoodPlaceholder':'Type a food and press Enter','health.addAllergyPlaceholder':'Type an allergy and press Enter',
    'health.save':'Save preferences','health.saving':'Saving...','health.saved':'Saved ✓',
    'health.active':'{n} active',
    // Auth
    'auth.welcomeBack':'Welcome back','auth.createAccount':'Create account','auth.resetPassword':'Reset password',
    'auth.email':'Email address','auth.password':'Password','auth.fullName':'Full name',
    'auth.signIn':'Sign in','auth.signUp':'Create account','auth.sendReset':'Send reset link',
    'auth.waiting':'Please wait...','auth.noAccount':"Don't have an account? Sign up",
    'auth.hasAccount':'Already have an account? Sign in','auth.forgot':'Forgot your password?',
    'auth.backToSignIn':'Back to sign in','auth.tagline':'Your premium fitness companion',
    'auth.resetSent':'Password reset link sent — check your inbox.',
    'auth.accountCreated':'Account created! Check your email to confirm, then sign in.',
    // General
    'general.comingSoon':'Coming soon','general.loading':'Loading...',
    'general.disclaimer':'Auron provides wellness support and informational guidance only.\nAlways follow the advice of your healthcare professionals.',
    'lang.en':'English','lang.fr':'Français',
  },

  fr: {
    // Nav
    'nav.home':'Accueil','nav.nutrition':'Nutrition','nav.progress':'Progrès','nav.meds':'Médicaments','nav.profile':'Profil',
    // Greetings
    'greeting.morning':'Bonjour','greeting.afternoon':'Bon après-midi','greeting.evening':'Bonsoir','greeting.late':'Encore debout',
    // Today
    'today.title':'Aujourd\'hui','today.calories':'Calories','today.left':'restantes','today.over':'dépassées',
    'today.macros':'Macros','today.protein':'Protéines','today.carbs':'Glucides','today.fats':'Lipides',
    'today.viewNutrition':'Voir la nutrition','today.activity':'Activité','today.steps':'Pas',
    'today.sleep':'Sommeil','today.logWorkout':'Ajouter séance →','today.viewProgress':'Voir les progrès →',
    'today.water':'Eau','today.settings':'⚙ Paramètres','today.meals':'Repas','today.workout':'Entraînement',
    'today.todayLabel':'Aujourd\'hui','today.yesterday':'Hier',
    'today.noWorkout':'Aucune séance enregistrée aujourd\'hui','today.noWorkoutDay':'Aucune séance ce jour-là',
    'today.logWorkoutHint':'Allez dans l\'onglet Entraînements pour en ajouter une',
    'today.greatJob':'Bien joué !','today.keepMoving':'Continuez !',
    'today.of':'sur','today.min':'min','today.steps10k':'/ 10 000 pas','today.min60':'/ 60 min',
    'today.thisWeek':'Cette semaine','today.lastWeek':'Semaine dernière','today.weeksAgo':'sem. avant',
    'today.streakDays':'jours consécutifs',
    // Meals
    'meals.breakfast':'Petit-déjeuner','meals.lunch':'Déjeuner','meals.snack':'Collation','meals.dinner':'Dîner',
    'meals.nothingLogged':'Rien d\'enregistré','meals.items':'aliments','meals.item':'aliment',
    'meals.time.breakfast':'6h–10h','meals.time.lunch':'11h–14h','meals.time.snack':'14h–17h','meals.time.dinner':'17h–21h',
    // Coach
    'coach.name':'Coach Auron','coach.openAI':'✨ Ouvrir le coach IA ›','coach.comingSoon':'Coach animé bientôt disponible',
    // Medication - Today card
    'meds.title':'Médicaments','meds.nextUp':'⏰ Prochain','meds.takenLabel':'✓ Pris','meds.missedLabel':'✗ Manqué',
    'meds.noMeds':'Aucun méd.','meds.openTracker':'📅 Ouvrir le suivi médicaments ›','meds.seeAll':'Tout voir ›',
    'meds.markTaken':'Marquer comme pris','meds.today':'aujourd\'hui',
    'meds.markName':'✓ Marquer {name} comme pris',
    // Medication tab
    'meds.takenToday':'Pris aujourd\'hui','meds.pending':'En attente','meds.missed':'Manqué',
    'meds.nextUpFull':'⏰ PROCHAIN','meds.markTakenBtn':'Marquer pris',
    'meds.todaysMeds':'Médicaments du jour','meds.allMeds':'Tous les médicaments','meds.add':'+ Ajouter',
    'meds.noMedsYet':'Aucun médicament','meds.addFirst':'Appuyez sur "Ajouter" pour enregistrer votre premier médicament.',
    'meds.addMedBtn':'Ajouter un médicament',
    'meds.takenStatus':'✓ Pris','meds.pendingStatus':'En attente','meds.missedStatus':'Manqué','meds.skippedStatus':'Ignoré',
    'meds.edit':'Modifier','meds.confirm':'Confirmer',
    'meds.addTitle':'Ajouter un médicament','meds.editTitle':'Modifier le médicament',
    'meds.nameLabel':'Nom du médicament *','meds.dosePlaceholder':'ex. 1000 UI, 2 comprimés',
    'meds.namePlaceholder':'ex. Vitamine D3','meds.doseLabel':'Dosage',
    'meds.frequencyLabel':'Fréquence','meds.reminderLabel':'Heure du rappel',
    'meds.dose1':'Dose 1','meds.dose':'Dose',
    'meds.startDate':'Date de début','meds.endDate':'Date de fin (optionnel)',
    'meds.notesLabel':'Notes','meds.notesPlaceholder':'Remarques sur ce médicament...',
    'meds.saveChanges':'Enregistrer','meds.saving':'Enregistrement...',
    'meds.noTimeSet':'Pas d\'heure',
    // Frequency options
    'freq.daily':'Une fois par jour','freq.twice_daily':'Deux fois par jour','freq.three_daily':'3× par jour',
    'freq.four_daily':'4× par jour','freq.every_morning':'Chaque matin','freq.every_night':'Chaque soir',
    'freq.with_meals':'Avec les repas','freq.weekly':'Une fois par semaine','freq.as_needed':'Si besoin',
    // Water
    'water.goal':'Objectif eau atteint !','water.viewOnly':'Lecture seule — revenez à aujourd\'hui pour enregistrer',
    'water.cups':'verres','water.ml':'ml',
    // Calories tab
    'cal.describeBtn':'✨ Décrire un repas — estimation IA',
    'cal.caloriesLabel':'Calories du jour','cal.remaining':'Restantes','cal.kcalOver':'kcal dépassées','cal.kcalLeft':'kcal restantes',
    'cal.macrosToday':'Macros du jour','cal.foodLog':'Journal alimentaire','cal.addFood':'+ Ajouter un aliment',
    'cal.aiSuggest':'✨ Coach Auron suggère','cal.respecting':'En tenant compte de :','cal.askAI':'Demander à l\'IA',
    'cal.thinking':'Réflexion...','cal.refresh':'↺ Actualiser',
    'cal.tapAsk':'Appuyez sur "Demander à l\'IA" pour une suggestion personnalisée.',
    'cal.describeTitle':'Estimateur de calories IA','cal.describeSubtitle':'Décrivez votre repas et Auron estimera les calories et les macros.',
    'cal.logTo':'Enregistrer dans :','cal.describePlaceholder':'ex. Une grande assiette de spaghetti bolognaise avec de la viande hachée...',
    'cal.estimateBtn':'Estimer les calories ✨','cal.estimating':'Estimation...',
    'cal.analyzing':'Analyse de votre repas...','cal.logMeal':'+ Enregistrer ce repas',
    'cal.noResults':'Aucun résultat pour',
    'cal.addingTo':'Ajouter à :','cal.searchFood':'Rechercher un aliment...',
    'cal.back':'← Retour',
    'cal.highConf':'confiance élevée','cal.medConf':'confiance moyenne','cal.lowConf':'confiance faible',
    'cal.nothingLogged':'Enregistrez votre premier repas dans l\'onglet Calories',
    // Profile
    'profile.title':'Profil','profile.personalInfo':'Informations personnelles','profile.fullName':'Nom complet',
    'profile.age':'Âge','profile.gender':'Genre','profile.weight':'Poids (kg)','profile.height':'Taille (cm)',
    'profile.nationality':'Nationalité','profile.saveChanges':'Enregistrer',
    'profile.saved':'Enregistré ✓','profile.saving':'Enregistrement...','profile.namePlaceholder':'Votre nom complet',
    'profile.agePlaceholder':'25','profile.genderSelect':'Sélectionner...',
    'profile.genderMale':'Homme','profile.genderFemale':'Femme','profile.genderOther':'Autre','profile.genderPrefer':'Préfère ne pas dire',
    'profile.nationalityPlaceholder':'ex. Français, Qatarien...',
    'profile.calorieTargets':'Objectifs calories & macros','profile.dailyCalGoal':'Objectif calorique quotidien','profile.kcal':'kcal',
    'profile.protein':'Protéines (g)','profile.carbsG':'Glucides (g)','profile.fatG':'Lipides (g)',
    'profile.calculator':'🧮 Calculer mes objectifs','profile.hideCalc':'▴ Masquer le calculateur',
    'profile.calcTitle':'Calculateur de calories','profile.calcAge':'Âge','profile.calcGender':'Genre',
    'profile.calcMale':'Homme','profile.calcFemale':'Femme',
    'profile.calcWeight':'Poids (kg)','profile.calcHeight':'Taille (cm)',
    'profile.activityLabel':'Niveau d\'activité',
    'profile.act1':'Sédentaire (bureau)','profile.act2':'Léger (1–3 j/sem)','profile.act3':'Modéré (3–5 j/sem)',
    'profile.act4':'Actif (6–7 j/sem)','profile.act5':'Très actif (athlète)',
    'profile.goalLabel':'Objectif',
    'profile.goalLoseFast':'Perdre 1 kg/sem','profile.goalLose':'Perdre 0,5 kg/sem',
    'profile.goalMaintain':'Maintenir le poids','profile.goalGain':'Prendre 0,5 kg/sem','profile.goalGainFast':'Prendre 1 kg/sem',
    'profile.calculate':'Calculer','profile.applyTargets':'Appliquer ces objectifs ✓',
    'profile.bmr':'MB','profile.bmrSub':'kcal au repos',
    'profile.maintenance':'Maintenance','profile.maintenanceSub':'kcal/jour',
    'profile.target':'Objectif','profile.targetSub':'kcal/jour',
    'profile.proteinResult':'Protéines','profile.perDay':'par jour',
    'profile.fitnessGoal':'Objectif fitness',
    'profile.loseWeight':'Perdre du poids','profile.buildMuscle':'Développer les muscles',
    'profile.endurance':'Améliorer l\'endurance','profile.generalHealth':'Santé générale','profile.maintain':'Maintenir le poids',
    'profile.workoutPrefs':'Préférences d\'entraînement','profile.workoutComingSoon':'Les préférences d\'entraînement arrivent bientôt.',
    'profile.healthPrefs':'Santé & préférences alimentaires',
    'profile.language':'Langue','profile.selectLang':'Choisissez votre langue',
    'profile.account':'Compte','profile.email':'E-mail','profile.memberSince':'Membre depuis',
    'profile.signOut':'Se déconnecter',
    // Health preferences
    'health.title':'Santé & Préférences alimentaires',
    'health.disclaimer':'Auron fournit uniquement un soutien bien-être. Suivez toujours les recommandations de votre professionnel de santé.',
    'health.dietary':'Préférences alimentaires','health.allergies':'Allergies',
    'health.restrictions':'Restrictions alimentaires','health.avoided':'Aliments à éviter',
    'health.notes':'Notes de santé personnelles','health.notesPlaceholder':'ex. Diabétique, hypertension...',
    'health.addAllergy':'+ Autre allergie','health.addFood':'+ Ajouter un aliment à éviter',
    'health.addFoodPlaceholder':'Tapez un aliment et appuyez sur Entrée','health.addAllergyPlaceholder':'Tapez une allergie et appuyez sur Entrée',
    'health.save':'Enregistrer les préférences','health.saving':'Enregistrement...','health.saved':'Enregistré ✓',
    'health.active':'{n} actif(s)',
    // Auth
    'auth.welcomeBack':'Bienvenue','auth.createAccount':'Créer un compte','auth.resetPassword':'Réinitialiser le mot de passe',
    'auth.email':'Adresse e-mail','auth.password':'Mot de passe','auth.fullName':'Nom complet',
    'auth.signIn':'Se connecter','auth.signUp':'Créer un compte','auth.sendReset':'Envoyer le lien',
    'auth.waiting':'Veuillez patienter...','auth.noAccount':'Pas de compte ? S\'inscrire',
    'auth.hasAccount':'Déjà un compte ? Se connecter','auth.forgot':'Mot de passe oublié ?',
    'auth.backToSignIn':'Retour à la connexion','auth.tagline':'Votre compagnon fitness premium',
    'auth.resetSent':'Lien envoyé — vérifiez votre boîte mail.',
    'auth.accountCreated':'Compte créé ! Confirmez votre e-mail puis connectez-vous.',
    // General
    'general.comingSoon':'Bientôt disponible','general.loading':'Chargement...',
    'general.disclaimer':'Auron fournit uniquement un soutien bien-être et des conseils informatifs.\nSuivez toujours les recommandations de votre professionnel de santé.',
    'lang.en':'English','lang.fr':'Français',
  },
}

export const LanguageContext = createContext({ lang:'en', setLang:()=>{}, t:(k)=>k })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('auron_lang') || 'en')

  const setLang = (l) => {
    if (!translations[l]) return
    setLangState(l)
    localStorage.setItem('auron_lang', l)
  }

  const t = (key, replacements = {}) => {
    const dict = translations[lang] || translations.en
    let str = dict[key] ?? translations.en[key] ?? key
    Object.entries(replacements).forEach(([k, v]) => { str = str.replace(`{${k}}`, v) })
    return str
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useTranslation() { return useContext(LanguageContext) }

export const LANGUAGES = [
  { code:'en', label:'English', flag:'🇬🇧' },
  { code:'fr', label:'Français', flag:'🇫🇷' },
]
