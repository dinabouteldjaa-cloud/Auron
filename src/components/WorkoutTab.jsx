import { useState, useEffect, useRef, memo } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { toUserDateStr } from '../lib/dateUtils.js'
import { useTranslation } from '../lib/i18n.jsx'
import { Icon } from '@iconify/react'
import { EXERCISES, LIBRARY_WORKOUTS, SPORTS, SPORTS_CATEGORIES, LIBRARY_GROUPS, LEVEL_COLOR, getExercise, getExerciseIconName, getWorkoutIconType, getWorkoutCategoryIconSrc, getWorkoutCategoryIconFallbackSrc, getWorkoutPlanIcon } from '../lib/workoutData.js'
import { Dumbbell, Zap, Footprints, Bike, Waves, HeartPulse, Activity, CircleDot, ArrowUp, ArrowDown, Target, Flower2, Move, Shield, ShieldAlert, ShieldCheck, Trophy } from 'lucide-react'
import AuronWorkoutBuilder from './AuronWorkoutBuilder.jsx'
import { TabAuronCard } from './CoachAuron'

const C = T

// ─────────────────────────────────────────────
// ExerciseIcon — renders a custom Weight Training SVG silhouette when
// one is mapped for this exercise, falling back to the plain emoji
// icon otherwise (every non-Weight-Training exercise, or any load
// error). Same footprint as the emoji it replaces — drop-in swap,
// no layout changes.
// ─────────────────────────────────────────────
const ExerciseIcon = memo(function ExerciseIcon({ name, size = 20, color }) {
  const iconName = getExerciseIconName(name)
  // arcticons:plank-workout has more internal padding than the rest of the
  // set and reads visually smaller at the same box size — scale it up a
  // little so it matches the others.
  const renderSize = iconName === 'arcticons:plank-workout' ? Math.round(size * 1.2) : size
  return <Icon icon={iconName} width={renderSize} height={renderSize} color={color || C.purple} aria-label={name} />
})

// Bodyweight-only exercises never take a weight value — hide the weight
// card entirely for these rather than show an empty/dashed "Weight —".
function isBodyweightExercise(name) {
  const n = (name || '').toLowerCase()
  return /push.?up|plank|bodyweight|glute bridge|dead bug|bird dog|mountain climber|jumping jack|high knees|burpee|crunch|sit.?up|pull.?up|^dip|wall push|cat-cow|pelvic tilt|leg raise|russian twist|box jump|jump squat|pistol squat|walking lunge|reverse lunge|air squat|bodyweight squat/.test(n)
}

// Friendly category label for the exercise header — prefers the workout's
// own section tag (warm-up/cool-down), falls back to the exercise's own
// data category, and finally a generic "Strength".
function getExerciseCategoryLabel(exercise, data, t) {
  if (exercise?.section === 'warmup')   return t('workout.warmupSection')   || 'Warm-up'
  if (exercise?.section === 'cooldown') return t('workout.cooldownSection') || 'Cool-down'
  const cat = (data?.category || '').toLowerCase()
  if (/core/.test(cat))        return t('workout.categoryCore')     || 'Core'
  if (/stretch|mobility/.test(cat)) return t('workout.categoryStretch') || 'Stretch'
  if (/cardio|warm-up/.test(cat))   return t('workout.categoryCardio')  || 'Cardio'
  return t('workout.categoryStrength') || 'Strength'
}

const LUCIDE_WORKOUT_ICONS = { Dumbbell, Zap, Footprints, Bike, Waves, HeartPulse, Activity, CircleDot, ArrowUp, ArrowDown, Target, Flower2, Move, Shield, ShieldAlert, ShieldCheck, Trophy }

// ─────────────────────────────────────────────
// WorkoutIcon — renders a Lucide icon for a sport/workout card, resolved
// via getWorkoutIconType({ workoutId, sportId }). Always falls back to
// Dumbbell so a card is never left without an icon. Meant to sit inside
// the existing soft-purple rounded icon container already used across
// sport/workout cards — this component only renders the icon itself.
// ─────────────────────────────────────────────
function WorkoutIcon({ workoutId, sportId, size = 24, color, label }) {
  const type = getWorkoutIconType({ workoutId, sportId })
  const Icon = LUCIDE_WORKOUT_ICONS[type] || Dumbbell
  return <Icon size={size} color={color || C.purple} strokeWidth={2} aria-label={label} role={label ? 'img' : undefined} />
}

// ─────────────────────────────────────────────
// WorkoutPlanIcon — Iconify-based icon system for individual workout-plan
// cards (Push Day, Leg Day, etc). Replaces the old Lucide-only lookup for
// this purpose — Lucide didn't have enough variety and several plans were
// reusing unrelated icons. Icon names are resolved via getWorkoutPlanIcon()
// (static, module-scope mapping — no runtime icon search). Memoized so
// filtering/search/expanding a section doesn't re-render already-shown icons.
// ─────────────────────────────────────────────
// Centralized color for the Iconify-based workout-plan icon system —
// keep this the single source of truth rather than hardcoding the hex
// value at each call site.
const WORKOUT_PLAN_ICON_COLOR = '#735bd2'

const WorkoutPlanIcon = memo(function WorkoutPlanIcon({ workout, size = 24, color, label }) {
  const iconName = getWorkoutPlanIcon(workout)
  return <Icon icon={iconName} width={size} height={size} color={color || WORKOUT_PLAN_ICON_COLOR} aria-label={label} />
})

// ─────────────────────────────────────────────
// WorkoutCategoryIcon — primary icon system for category-level displays
// (Library grid cards, category detail headers). Uses the custom PNG
// pack in /public/workout-icons/ via getWorkoutCategoryIconSrc(); if a
// category has no custom icon (or the image fails to load), falls back
// to the existing Lucide WorkoutIcon so rendering never breaks.
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// WorkoutCategoryIcon — primary icon system for category-level displays
// (Library grid cards, category detail headers). Uses the optimized
// small WebP pack in /public/workout-icons/optimized/ first (falls back
// to the original PNG, then to the Lucide WorkoutIcon if both fail).
// Stable static paths (no cache-busting) so the browser/CDN can cache
// them normally. Memoized so filtering/search/expanding a group doesn't
// remount already-loaded icons.
// `eager`: pass true only for the icons visible on initial load (first
// group's first few cards) so they don't appear late; everything else
// lazy-loads as the user scrolls.
// ─────────────────────────────────────────────
const WorkoutCategoryIcon = memo(function WorkoutCategoryIcon({ category, size = 28, label, eager = false }) {
  const [stage, setStage] = useState('webp') // 'webp' -> 'png' -> 'failed'
  const primarySrc  = getWorkoutCategoryIconSrc(category)
  const fallbackSrc = getWorkoutCategoryIconFallbackSrc(category)
  const src = stage === 'webp' ? primarySrc : stage === 'png' ? fallbackSrc : null

  // No mapping at all, or both the WebP and PNG failed to load — use Lucide.
  if (!src || stage === 'failed') return <WorkoutIcon sportId={category} size={size} label={label} />

  return (
    <img
      key={src}
      src={src}
      alt={label || ''}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setStage(s => s === 'webp' ? 'png' : 'failed')}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  )
})

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
function useSportT() {
  const { t, lang } = useTranslation()
  const tSport    = id  => t(`sport.${id}`) || id
  const tCat      = key => t(`sport.cat.${key}`) || key
  const tWorkout  = id  => t(`w.${id}`) || id
  const tLevel    = lvl => {
    const map = { All: t('workout.level.all'), Beginner: t('workout.level.beginner'), Intermediate: t('workout.level.intermediate'), Advanced: t('workout.level.advanced') }
    return map[lvl] || lvl
  }
  // Map category string → i18n key
  const CAT_KEYS = {
    'Gym & Strength':'gym','Cardio & Running':'cardio','Water Sports':'water',
    'Mind & Body':'mind','Combat Sports':'combat','Racquet Sports':'racquet',
    'Team Sports':'team','Outdoor & Adventure':'outdoor','Dance & Performing':'dance',
    'Precision & Skill':'precision','Gymnastics & Acrobatics':'gymnastics','Equestrian':'equestrian',
  }
  const tCatName = name => t(`sport.cat.${CAT_KEYS[name]||name}`) || name
  // Translate muscle group string (replaces English parts with French)
  const MUSCLE_MAP_FR = {
    'Chest':'Pectoraux', 'Back':'Dos', 'Legs':'Jambes', 'Shoulders':'Épaules',
    'Arms':'Bras', 'Core':'Core', 'Abs':'Abdominaux', 'Obliques':'Obliques',
    'Glutes':'Fessiers', 'Hamstrings':'Ischio-jambiers', 'Quads':'Quadriceps',
    'Calves':'Mollets', 'Biceps':'Biceps', 'Triceps':'Triceps',
    'Lats':'Dorsaux', 'Traps':'Trapèzes', 'Forearms':'Avant-bras',
    'Full Body':'Corps entier', 'Cardiovascular':'Cardiovasculaire',
    'Cardio':'Cardio', 'Rear Delts':'Deltoïdes postérieurs',
    'Upper Back':'Dos supérieur', 'Lower Back':'Bas du dos',
    'Hip Flexors':'Fléchisseurs de hanche', 'Flexibility':'Souplesse',
    'Speed':'Vitesse', 'Endurance':'Endurance', 'Agility':'Agilité',
    'Balance':'Équilibre', 'Coordination':'Coordination', 'Power':'Puissance',
    'Stability':'Stabilité', 'All muscle groups':'Tous les groupes musculaires',
    'Upper Chest':'Pectoraux supérieurs', 'Lower Abs':'Abdominaux inférieurs',
    'Side Delts':'Deltoïdes latéraux', 'All Deltoid Heads':'Tous les chefs du deltoïde',
    'Spine':'Colonne vertébrale', 'Breathing':'Respiration',
    'Hip':'Hanches', 'Hips':'Hanches', 'IT Band':'Bande iliotibiale',
    'Posture':'Posture', 'Low Impact':'Faible impact',
    'Grip':'Préhension', 'Jump':'Saut',
  }
  const tMuscles = muscles => {
    if (lang !== 'fr' || !muscles) return muscles
    let result = muscles
    Object.entries(MUSCLE_MAP_FR).forEach(([en, fr]) => {
      result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), fr)
    })
    return result
  }
  return { tSport, tCat, tCatName, tWorkout, tLevel, tMuscles, lang }
}
function Card({ children, style={} }) {
  return <div style={{ background:C.surface, borderRadius:18, border:`1px solid ${C.divider}`, boxShadow:C.shadowCard, padding:'16px 18px', ...style }}>{children}</div>
}
function Label({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{children}</div>
}
function BackBtn({ onBack, label = 'Back' }) {
  return (
    <button onClick={onBack} style={{
      display:'flex', alignItems:'center', gap:6, cursor:'pointer', marginBottom:20,
      background:C.surfaceLight, border:`1px solid ${C.divider}`, borderRadius:20,
      padding:'8px 16px 8px 12px', color:C.text, fontSize:13.5, fontWeight:600,
    }}>
      <span style={{ fontSize:16, lineHeight:1 }}>‹</span> {label}
    </button>
  )
}

// ─────────────────────────────────────────────
// How-to — no conditional return before hook
// ─────────────────────────────────────────────
function ExerciseHowTo({ name }) {
  const { t, lang } = useTranslation()
  const [open, setOpen] = useState(false)
  const data = getExercise(name, lang)
  const howTo = data.howTo || []
  const tips  = data.tips  || ''
  if (!howTo.length) return null
  return (
    <div style={{ marginTop:8, paddingLeft:0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background:'none', border:'none', color:C.purple, fontSize:12, fontWeight:600, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
        {open ? t('workout.hideHowTo') : `▶ ${t('workout.howTo')}`}
      </button>
      {open && (
        <div style={{ marginTop:8, padding:'12px 14px', background:C.purpleLight, borderRadius:12 }}>
          <ol style={{ margin:0, padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:5 }}>
            {howTo.map((step, i) => (
              <li key={i} style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{step}</li>
            ))}
          </ol>
          {tips && (
            <div style={{ marginTop:8, fontSize:11, color:C.purple, fontStyle:'italic', borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              💡 {tips}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Library tab — Sports → Workouts → Detail
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Library tab — Sports → Workouts → Detail
// ─────────────────────────────────────────────
function LibraryTab({ onUseAsTemplate, recentWorkouts = [], onScreenChange }) {
  const { t } = useTranslation()
  const { tSport, tCatName, tWorkout, tLevel, tMuscles, lang } = useSportT()
  const [sport,   setSport]   = useState(null)
  const [workout, setWorkout] = useState(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')
  const [expandedGroups, setExpandedGroups] = useState({}) // { [groupKey]: true } once "View all" tapped
  const GROUP_PREVIEW_COUNT = 4

  // Report navigation depth up to WorkoutTab so it knows whether this is
  // a root screen (Auron visible) or a nested one (category/detail — Auron hidden).
  useEffect(() => {
    onScreenChange?.(workout ? 'detail' : sport ? 'category' : 'root')
  }, [sport, workout])

  // First-visible sport ids (first non-empty group's first preview batch) —
  // these render eagerly and get a <link rel="preload"> each. Everything
  // else in the grid lazy-loads as the user scrolls, instead of preloading
  // the whole 30-icon pack up front.
  const firstVisibleSportIds = (() => {
    for (const group of LIBRARY_GROUPS) {
      const available = group.sportIds.filter(id => LIBRARY_WORKOUTS.some(w => w.sport === id))
      if (available.length > 0) return available.slice(0, GROUP_PREVIEW_COUNT)
    }
    return []
  })()

  useEffect(() => {
    const links = firstVisibleSportIds.map(id => {
      const href = getWorkoutCategoryIconSrc(id)
      if (!href) return null
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = href
      document.head.appendChild(link)
      return link
    }).filter(Boolean)
    return () => links.forEach(l => l.remove())
  }, []) // once, on mount

  const tFilterLabel = f => ({ All: t('workout.level.all'), Beginner: t('workout.level.beginner'), Intermediate: t('workout.level.intermediate'), Advanced: t('workout.level.advanced') })[f] || f

  // ── Workout detail ────────────────────────
  if (workout) {
    const exercises = workout.exercises.map(item => {
      const exName = typeof item === 'string' ? item : item.name
      const data   = getExercise(exName, lang)
      return { ...data, ...(typeof item === 'string' ? {} : item), name: data.name || exName }
    })
    const sport_obj = SPORTS.find(s => s.id === workout.sport) || {}
    return (
      <div>
        <BackBtn onBack={() => setWorkout(null)} />
        <div style={{ background:`linear-gradient(135deg, ${sport_obj.color||C.purple}, ${sport_obj.color||C.purple}BB)`, borderRadius:20, padding:'22px 20px', marginBottom:20, color:'#fff' }}>
          <div style={{ fontSize:32, marginBottom:8 }}><WorkoutPlanIcon workout={workout} size={32} color="#fff" label={tWorkout(workout.id)} /></div>
          <div style={{ fontSize:22, fontWeight:700 }}>{tWorkout(workout.id)}</div>
          <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>{workout.description}</div>
          <div style={{ display:'flex', gap:16, marginTop:14, flexWrap:'wrap' }}>
            {[[t('workout.duration2'), workout.duration], [t('workout.level'), tLevel(workout.level)], [t('workout.muscles'), tMuscles(workout.muscles)]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:13, fontWeight:700 }}>{v}</div><div style={{ fontSize:10, opacity:0.7 }}>{l}</div></div>
            ))}
          </div>
          {workout.suggestedRestSec != null && (
            <div style={{ marginTop:12, fontSize:11.5, opacity:0.85 }}>
              ⏱ {t('workout.restBetween') || 'Rest between sets'}: {workout.suggestedRestSec === 0 ? (t('session.restOff')||'Off') : `${workout.suggestedRestSec}s`}
            </div>
          )}
        </div>

        {(() => {
          // Group into Warm-up / Main Workout / Cool-down when the workout
          // provides section tags; otherwise fall back to one flat list
          // (unchanged behaviour for every other sport's workouts).
          const hasSections = exercises.some(ex => ex.section)
          const sections = hasSections
            ? [
                { key:'warmup',   label:t('workout.warmupSection')||'Warm-up',     items:exercises.filter(ex=>ex.section==='warmup') },
                { key:'main',     label:t('workout.mainSection')||'Main Workout',   items:exercises.filter(ex=>ex.section==='main' || !ex.section) },
                { key:'cooldown', label:t('workout.cooldownSection')||'Cool-down',  items:exercises.filter(ex=>ex.section==='cooldown') },
              ].filter(s => s.items.length > 0)
            : [{ key:'all', label:`${t('workout.exercises')} (${exercises.length})`, items:exercises }]

          // Warm-up/cooldown items shouldn't be counted as if they were
          // normal exercises — show "N exercises + warm-up + cooldown"
          // when sections exist, otherwise fall back to a plain activity count.
          const countLabel = (() => {
            if (!hasSections) return null
            const mainCount = exercises.filter(ex => ex.section === 'main' || !ex.section).length
            const hasWarmup   = exercises.some(ex => ex.section === 'warmup')
            const hasCooldown = exercises.some(ex => ex.section === 'cooldown')
            const parts = [`${mainCount} ${mainCount === 1 ? (t('workout.exercise')||'exercise') : t('workout.exercises')}`]
            if (hasWarmup)   parts.push(t('workout.warmupSection') || 'warm-up')
            if (hasCooldown) parts.push(t('workout.cooldownSection') || 'cooldown')
            return parts.join(' + ')
          })()

          const renderExercise = (ex, i, arr) => {
            const isTimed = !!ex.timed
            const repDisplay = ex.repRange || ex.reps
            const unilateralText = ex.unilateral ? ` (${ex.unilateralLabel || t('workout.eachSide') || 'each side'})` : ''
            const prescription = ex.sets && ex.reps
              ? (isTimed
                  ? `${ex.sets} × ${repDisplay}${typeof repDisplay === 'number' || /^\d+$/.test(String(repDisplay)) ? 's' : ''}${unilateralText}`
                  : `${ex.sets} × ${repDisplay} ${t('session.reps') || 'reps'}${unilateralText}`)
              : (ex.timed ? t('workout.duration2') : t('session.reps'))
            const restLabel = ex.restSec != null
              ? (ex.restSec === 0 ? null : `${t('workout.restBetween')||'Rest'}: ${ex.restSec}s`)
              : null
            return (
              <div key={i} style={{ padding:'14px 16px', borderBottom: i < arr.length-1 ? `1px solid ${C.divider}` : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}><ExerciseIcon name={ex.name} size={20} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
                    <div style={{ fontSize:11, color:C.textMuted }}>{tMuscles(ex.muscles)} · {prescription}{restLabel ? ` · ${restLabel}` : ''}</div>
                    {ex.note && (
                      <div style={{ fontSize:11, color:C.purple, marginTop:3, lineHeight:1.4 }}>💡 {ex.note}</div>
                    )}
                  </div>
                </div>
                <ExerciseHowTo name={ex.name} />
              </div>
            )
          }

          return (
            <>
              {countLabel && (
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:14 }}>{countLabel}</div>
              )}
              {sections.map(section => (
                <div key={section.key} style={{ marginBottom:20 }}>
                  <Label>{section.label}</Label>
                  <Card style={{ padding:0, overflow:'hidden' }}>
                    {section.items.map((ex, i) => renderExercise(ex, i, section.items))}
                  </Card>
                </div>
              ))}
            </>
          )
        })()}

        <button onClick={() => onUseAsTemplate({ ...workout, startNow:true })}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.green, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
          {t('workout.startWorkoutNow')}
        </button>
        <button onClick={() => onUseAsTemplate({ ...workout, startNow:false })}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.purpleLight, border:`1px solid ${C.purple}44`, color:C.purple, fontSize:15, fontWeight:700, cursor:'pointer' }}>
          {t('workout.saveAsTemplate')}
        </button>
      </div>
    )
  }

  // ── Sport workouts list ───────────────────
  if (sport) {
    const s        = SPORTS.find(s => s.id === sport) || {}
    const LEVELS   = ['All','Beginner','Intermediate','Advanced']
    const totalForSport = LIBRARY_WORKOUTS.filter(w => w.sport === sport).length
    const workouts = LIBRARY_WORKOUTS.filter(w => w.sport === sport && (filter === 'All' || w.level === filter))
    const allLevelsForSport = LIBRARY_WORKOUTS.filter(w => w.sport === sport).map(w => w.level)
    const levelRange = (() => {
      const order = ['Beginner', 'Intermediate', 'Advanced']
      const present = order.filter(lv => allLevelsForSport.includes(lv))
      if (present.length === 0) return ''
      if (present.length === 1) return tLevel(present[0])
      return `${tLevel(present[0])} ${t('workout.to') || 'to'} ${tLevel(present[present.length - 1])}`
    })()
    return (
      <div>
        <BackBtn onBack={() => setSport(null)} label={t('workout.backToLibrary') || 'Back to Library'} />
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <WorkoutCategoryIcon category={sport} size={26} label={tSport(sport)} eager />
          </div>
          <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{tSport(sport)}</div>
        </div>
        {/* Subtitle — subtle, secondary framing of what's here */}
        <div style={{ fontSize:12.5, color:C.textMuted, marginBottom:18 }}>
          {totalForSport} {totalForSport === 1 ? (t('workout.plan1') || 'workout plan') : (t('workout.plansN') || 'workout plans')}
          {levelRange && <> · {levelRange}</>}
        </div>
        {/* Level filter */}
        <div style={{ display:'flex', gap:6, marginBottom:16 }}>
          {LEVELS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1px solid ${filter===f?C.purple:C.border}`, background:filter===f?C.purpleLight:'transparent', color:filter===f?C.purple:C.textMuted, fontWeight:filter===f?600:400 }}>
              {tFilterLabel(f)}
            </button>
          ))}
        </div>
        {workouts.length === 0 ? (
          totalForSport === 0 ? (
            <Card style={{ textAlign:'center', padding:'24px', color:C.textMuted }}>{t('workout.comingSoon')}</Card>
          ) : (
            <Card style={{ textAlign:'center', padding:'24px' }}>
              <div style={{ color:C.textMuted, marginBottom:12 }}>
                {t('workout.noLevelWorkouts').replace('{level}', tFilterLabel(filter))}
              </div>
              <button onClick={() => setFilter('All')}
                style={{ padding:'8px 16px', borderRadius:14, background:C.purpleLight, border:`1px solid ${C.purple}44`, color:C.purple, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                {t('workout.showAllLevels')}
              </button>
            </Card>
          )
        ) : workouts.map(w => (
          <button key={w.id} onClick={() => setWorkout(w)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', marginBottom:10, boxShadow:C.shadowCard, position:'relative' }}>
            {/* Reserved slot for future favorite toggle — intentionally empty for now */}
            <div style={{ position:'absolute', top:10, right:10, width:16, height:16 }} />
            <div style={{ width:50, height:50, borderRadius:14, background:`${s.color||C.purple}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <WorkoutPlanIcon workout={w} size={26} label={tWorkout(w.id)} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              {/* Primary — workout name + level badge */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontSize:15.5, fontWeight:700, color:C.text }}>{tWorkout(w.id)}</span>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${LEVEL_COLOR[w.level]||C.purple}22`, color:LEVEL_COLOR[w.level]||C.purple, fontWeight:600, flexShrink:0 }}>{tLevel(w.level)}</span>
              </div>
              {/* Secondary — muscle groups */}
              <div style={{ fontSize:12.5, color:C.textMuted, marginBottom:4 }}>{tMuscles(w.muscles)}</div>
              {/* Tertiary — duration + exercise count, reserved space below for future progress data (completed count, last done) */}
              <div style={{ fontSize:11, color:C.purple, fontWeight:500 }}>⏱ {w.duration} · {w.exercises.length} {t('workout.exercises')}</div>
            </div>
            <span style={{ fontSize:20, color:C.textDim, flexShrink:0 }}>›</span>
          </button>
        ))}
      </div>
    )
  }

  // ── Sports grid with search ───────────────
  const LEVELS = ['All','Beginner','Intermediate','Advanced']
  const allWorkouts = LIBRARY_WORKOUTS.filter(w =>
    (filter === 'All' || w.level === filter) &&
    (search === '' || w.name.toLowerCase().includes(search.toLowerCase()) || w.muscles.toLowerCase().includes(search.toLowerCase()))
  )
  const showSearch = search.length > 0

  return (
    <div>
      {/* Search + filter */}
      <div style={{ position:'relative', marginBottom:12 }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('workout.searchPlaceholder')}
          style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none' }} />
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto' }}>
        {LEVELS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${filter===f?C.purple:C.border}`, background:filter===f?C.purpleLight:'transparent', color:filter===f?C.purple:C.textMuted, fontWeight:filter===f?600:400 }}>
            {tFilterLabel(f)}
          </button>
        ))}
      </div>

      {/* Search results */}
      {showSearch ? (
        <div>
          <Label>{allWorkouts.length} {t('workout.results','results')}</Label>
          {allWorkouts.map(w => {
            const s = SPORTS.find(s => s.id === w.sport) || {}
            return (
              <button key={w.id} onClick={() => setWorkout(w)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', marginBottom:10, boxShadow:C.shadowCard }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${s.color||C.purple}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <WorkoutPlanIcon workout={w} size={24} label={tWorkout(w.id)} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{tWorkout(w.id)}</span>
                    <span style={{ fontSize:10, padding:'2px 6px', borderRadius:20, background:`${LEVEL_COLOR[w.level]||C.purple}22`, color:LEVEL_COLOR[w.level]||C.purple, fontWeight:600 }}>{tLevel(w.level)}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{tSport(w.sport)} · {tMuscles(w.muscles)}</div>
                  <div style={{ fontSize:11, color:C.purple }}>⏱ {w.duration} · {w.exercises.length} {t('workout.exercises')}</div>
                </div>
                <span style={{ fontSize:20, color:C.textDim }}>›</span>
              </button>
            )
          })}
          {allWorkouts.length === 0 && <Card style={{ textAlign:'center', padding:24, color:C.textMuted }}>{t('workout.noResults','')} "{search}"</Card>}
        </div>
      ) : (
      /* Library groups — only sports with real workouts are ever shown */
        <div>
          {/* Recent Workouts — quick re-access, hidden entirely if no history yet */}
          {!showSearch && recentWorkouts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Label>{t('workout.recentWorkouts') || 'Recent Workouts'}</Label>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {recentWorkouts.map((log, i) => {
                  const match = LIBRARY_WORKOUTS.find(w => w.name.toLowerCase() === (log.workout_name || '').toLowerCase())
                  return (
                    <button
                      key={i}
                      onClick={() => match && setWorkout(match)}
                      disabled={!match}
                      style={{
                        flexShrink: 0, minWidth: 140, padding: '12px 14px', borderRadius: 16,
                        background: C.surface, border: `1px solid ${C.divider}`, boxShadow: C.shadowCard,
                        textAlign: 'left', cursor: match ? 'pointer' : 'default',
                        display: 'flex', flexDirection: 'column', gap: 4, position: 'relative',
                      }}
                    >
                      {/* Reserved slot for a future favorite/star toggle — intentionally empty for now */}
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16 }} />
                      <WorkoutPlanIcon workout={match} size={20} label={log.workout_name} />
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, lineHeight: 1.25 }}>{log.workout_name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>
                        {log.duration_minutes ? `${log.duration_minutes} min` : t('workout.tapToView') || 'Logged'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {LIBRARY_GROUPS.map(group => {
            const availableSports = group.sportIds
              .map(id => SPORTS.find(s => s.id === id))
              .filter(Boolean)
              .filter(s => LIBRARY_WORKOUTS.some(w => w.sport === s.id))
            if (availableSports.length === 0) return null // hide empty groups entirely

            const isExpanded = !!expandedGroups[group.key]
            const visibleSports = isExpanded ? availableSports : availableSports.slice(0, GROUP_PREVIEW_COUNT)
            const hasMore = availableSports.length > GROUP_PREVIEW_COUNT

            return (
              <div key={group.key} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Label style={{ marginBottom: 0 }}>{t(`libgroup.${group.key}`)}</Label>
                  {hasMore && (
                    <button onClick={() => setExpandedGroups(prev => ({ ...prev, [group.key]: !isExpanded }))}
                      style={{ background: 'none', border: 'none', color: C.purple, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      {isExpanded ? (t('workout.showLess') || 'Show less') : (t('workout.viewAll') || 'View all')} {isExpanded ? '▲' : `(${availableSports.length}) ›`}
                    </button>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {visibleSports.map(s => {
                    // Total workout count for this sport, independent of the
                    // level filter — a sport never appears to be "coming soon"
                    // just because the current filter has no match.
                    const count = LIBRARY_WORKOUTS.filter(w => w.sport === s.id).length
                    return (
                      <button key={s.id} onClick={() => setSport(s.id)}
                        style={{ padding:'14px 12px', borderRadius:16, background:C.surface, border:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left', boxShadow:C.shadowCard, display:'flex', flexDirection:'column', gap:5, position:'relative' }}>
                        {/* Reserved slot for a future favorite/star toggle — intentionally empty for now */}
                        <div style={{ position:'absolute', top:10, right:10, width:16, height:16 }} />
                        <WorkoutCategoryIcon category={s.id} size={28} label={tSport(s.id)} eager={firstVisibleSportIds.includes(s.id)} />
                        <div style={{ fontSize:13, fontWeight:700, color:C.text, lineHeight:1.2 }}>{tSport(s.id)}</div>
                        <div style={{ fontSize:10, color:C.purple }}>
                          {count} {count===1?t('workout.workout1','workout'):t('workout.workouts','workouts')}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Exercise picker modal
// ─────────────────────────────────────────────
function ExercisePickerModal({ onAdd, onClose }) {
  const { t }  = useTranslation()
  const { tSport, tMuscles, lang } = useSportT()
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const all        = Object.entries(EXERCISES).map(([name, ex]) => ({ name, ...ex }))
  const categories = ['All', ...new Set(all.map(e => e.category))]
  const filtered   = search
    ? all.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscles||'').toLowerCase().includes(search.toLowerCase()))
    : category === 'All' ? all : all.filter(e => e.category === category)

  // Map exercise category names to sport ids for translation
  const CAT_TO_SPORT = {
    'Chest':'chest_ex','Back':'back_ex','Legs':'legs_ex','Shoulders':'shoulders_ex',
    'Arms':'arms_ex','Core':'core_ex','Cardio':'cardio_ex','Running':'running',
    'Cycling':'cycling','Swimming':'swimming','CrossFit':'crossfit','Yoga':'yoga',
    'Pilates':'pilates','Boxing':'boxing','Stretching':'stretching','HIIT':'hiit',
    'Martial Arts':'martial','Calisthenics':'calisthenics','Kettlebell':'kettlebell',
    'Functional':'functional','Basketball':'basketball','Tennis':'tennis',
    'Football':'football','Badminton':'badminton','Golf':'golf','Dance':'dance',
    'Gymnastics':'gymnastics','Rowing':'rowing','Walking':'walking',
  }
  const tCat = cat => {
    if (cat === 'All') return t('workout.level.all')
    const sportId = CAT_TO_SPORT[cat]
    return sportId ? t(`sport.${sportId}`, cat) : cat
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.6)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:'22px 22px 0 0', width:'100%', maxWidth:480, maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 20px 12px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.divider, margin:'0 auto 16px' }} />
          <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:12 }}>{t('session.addExercise')}</div>
          <div style={{ position:'relative', marginBottom:10 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('workout.searchExPlaceholder')} autoFocus
              style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:14, outline:'none' }} />
          </div>
          {!search && (
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{ padding:'6px 12px', borderRadius:20, fontSize:11, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${category===cat?C.purple:C.border}`, background:category===cat?C.purpleLight:'transparent', color:category===cat?C.purple:C.textMuted, fontWeight:category===cat?600:400 }}>
                  {tCat(cat)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'0 20px 24px' }}>
          {filtered.map((ex, i) => (
            <button key={i} onClick={() => { onAdd(ex); onClose() }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 0', background:'none', border:'none', borderBottom:`1px solid ${C.divider}`, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}><ExerciseIcon name={ex.name} size={20} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{ex.name}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{ex.category} · {tMuscles(ex.muscles)}</div>
              </div>
              <span style={{ fontSize:20, color:C.purple }}>+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Plan editor (My Plans)
// ─────────────────────────────────────────────
// Days resolved via t() at render time — keys match i18n sched.* keys
const DAY_DEFS = [
  { key:'mon', i18n:'sched.mon' },
  { key:'tue', i18n:'sched.tue' },
  { key:'wed', i18n:'sched.wed' },
  { key:'thu', i18n:'sched.thu' },
  { key:'fri', i18n:'sched.fri' },
  { key:'sat', i18n:'sched.sat' },
  { key:'sun', i18n:'sched.sun' },
]

function PlanEditor({ plan, onSave, onCancel }) {
  const { t } = useTranslation()
  const [name,       setName]       = useState(plan?.name || '')
  const [exercises,  setExercises]  = useState(
    (plan?.exercises || []).map(ex => ({
      name: ex.name || ex,
      icon: ex.icon || getExercise(ex.name||ex).icon || '💪',
      muscles: ex.muscles || getExercise(ex.name||ex).muscles || '',
      timed: ex.timed || getExercise(ex.name||ex).timed || false,
      sets: ex.sets || 3,
      reps: ex.reps || 10,
      notes: ex.notes || '',
    }))
  )
  const [showPicker, setShowPicker] = useState(false)
  const [notes,      setNotes]      = useState(plan?.notes || '')

  // Schedule
  const initSched = plan?.schedule || null
  const [schedEnabled, setSchedEnabled] = useState(!!initSched)
  const [schedDays,    setSchedDays]    = useState(initSched?.days || [])
  const [schedTime,    setSchedTime]    = useState(initSched?.time || '08:00')

  const toggleDay = day => setSchedDays(prev =>
    prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
  )

  const addEx    = ex  => setExercises(prev => [...prev, { name:ex.name, icon:ex.icon||'💪', muscles:ex.muscles||'', timed:ex.timed||false, sets:3, reps:ex.timed?30:10, notes:'' }])
  const removeEx = i   => setExercises(prev => prev.filter((_,j)=>j!==i))
  const updateEx = (i,f,v) => setExercises(prev => prev.map((e,j)=>j===i?{...e,[f]:v}:e))
  const moveUp   = i   => { if(i===0)return; const a=[...exercises]; [a[i-1],a[i]]=[a[i],a[i-1]]; setExercises(a) }
  const moveDown = i   => { if(i===exercises.length-1)return; const a=[...exercises]; [a[i],a[i+1]]=[a[i+1],a[i]]; setExercises(a) }

  const canSave  = name.trim() && exercises.length > 0

  const handleSave = () => {
    const schedule = schedEnabled && schedDays.length > 0
      ? { days: schedDays, time: schedTime, active: true }
      : null
    onSave({ name: name.trim(), exercises, notes: notes.trim(), schedule })
  }

  return (
    <div>
      <BackBtn onBack={onCancel} />
      <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:20 }}>
        {plan?.id ? t('workout.editPlan') : t('workout.newPlan')}
      </div>

      {/* Name */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:500 }}>{t('plan.planName')}</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t('session.nameWorkout')}
          style={{ width:'100%', padding:'11px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:15, fontWeight:600, outline:'none' }} />
      </div>

      {/* Exercises */}
      <Label>{t('workout.exercises')} ({exercises.length})</Label>
      {exercises.map((ex, i) => (
        <div key={i} style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.divider}`, padding:'12px 14px', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ fontSize:20 }}><ExerciseIcon name={ex.name} size={20} /></span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
              <div style={{ fontSize:11, color:C.textMuted }}>{tMuscles(ex.muscles)}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={() => moveUp(i)}   style={{ padding:'4px 8px', borderRadius:8, background:C.surfaceMid, border:'none', color:C.textMuted, cursor:'pointer', fontSize:12 }}>↑</button>
              <button onClick={() => moveDown(i)} style={{ padding:'4px 8px', borderRadius:8, background:C.surfaceMid, border:'none', color:C.textMuted, cursor:'pointer', fontSize:12 }}>↓</button>
              <button onClick={() => removeEx(i)} style={{ padding:'4px 8px', borderRadius:8, background:C.redLight, border:'none', color:C.red, cursor:'pointer', fontSize:12 }}>✕</button>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>{t('plan.sets')}</div>
              <input type="number" value={ex.sets} onChange={e=>updateEx(i,'sets',e.target.value)}
                style={{ width:'100%', padding:'7px 8px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', textAlign:'center' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>{ex.timed ? t('plan.sec') : t('plan.reps')}</div>
              <input type="number" value={ex.reps} onChange={e=>updateEx(i,'reps',e.target.value)}
                style={{ width:'100%', padding:'7px 8px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', textAlign:'center' }} />
            </div>
            <div style={{ flex:2 }}>
              <div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>{t('plan.note')}</div>
              <input value={ex.notes||''} onChange={e=>updateEx(i,'notes',e.target.value)} placeholder={t('plan.optional')}
                style={{ width:'100%', padding:'7px 8px', borderRadius:8, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:12, outline:'none' }} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={() => setShowPicker(true)}
        style={{ width:'100%', padding:12, borderRadius:14, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:16 }}>
        {t('plan.addExercise')}
      </button>

      {/* Notes */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:500 }}>{t('plan.planNotes')}</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder={t('plan.optional')}
          style={{ width:'100%', padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', lineHeight:1.5 }} />
      </div>

      {/* Schedule section */}
      <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.divider}`, padding:'16px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: schedEnabled ? 16 : 0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{t('plan.scheduleTitle')}</div>
            <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
              {schedEnabled ? t('plan.scheduleOn') : t('plan.scheduleOff')}
            </div>
          </div>
          <div onClick={() => setSchedEnabled(e => !e)}
            style={{ width:48, height:28, borderRadius:14, background:schedEnabled?C.purple:C.border, cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: schedEnabled?23:3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        {schedEnabled && (
          <>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, marginBottom:8 }}>{t('plan.daysLabel')}</div>
              <div style={{ display:'flex', gap:6 }}>
                {DAY_DEFS.map(d => {
                  const active = schedDays.includes(d.key)
                  return (
                    <button key={d.key} onClick={() => toggleDay(d.key)}
                      style={{ flex:1, padding:'9px 0', borderRadius:10, border:`1px solid ${active?C.purple:C.border}`, background:active?C.purple:'transparent', color:active?'#fff':C.textMuted, fontSize:11, fontWeight:active?700:400, cursor:'pointer', transition:'all 0.15s' }}>
                      {t(d.i18n)}
                    </button>
                  )
                })}
              </div>
              {schedDays.length === 0 && (
                <div style={{ fontSize:11, color:C.red, marginTop:6 }}>{t('plan.selectDay')}</div>
              )}
            </div>
            <div>
              <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, marginBottom:8 }}>{t('plan.scheduleTime')}</div>
              <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                style={{ padding:'10px 14px', borderRadius:12, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:15, fontWeight:600, outline:'none', cursor:'pointer' }} />
              <div style={{ fontSize:11, color:C.textDim, marginTop:6 }}>{t('plan.scheduleTimeHint')}</div>
            </div>
          </>
        )}
      </div>

      <button onClick={handleSave} disabled={!canSave}
        style={{ width:'100%', padding:14, borderRadius:16, background:canSave?C.purple:C.surfaceMid, border:'none', color:canSave?'#fff':C.textDim, fontSize:15, fontWeight:700, cursor:canSave?'pointer':'default' }}>
        {plan?.id ? t('plan.saveChanges') : t('plan.create')}
      </button>

      {showPicker && <ExercisePickerModal onAdd={addEx} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// My Plans tab
// ─────────────────────────────────────────────
function MyPlansTab({ userId, onStartPlan, preloadPlan, onPreloadConsumed, onBuildWithAuron, onScreenChange }) {
  const { t } = useTranslation()
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const consumedRef = useRef(false)

  useEffect(() => { fetchPlans() }, [userId])
  useEffect(() => {
    onScreenChange?.(editing ? 'editor' : 'root')
  }, [editing])
  useEffect(() => {
    if (preloadPlan && !consumedRef.current) {
      consumedRef.current = true
      setEditing({ preload: preloadPlan })
      onPreloadConsumed?.()
    }
  }, [preloadPlan])

  const fetchPlans = async () => {
    if (!userId) return
    const { data } = await supabase.from('workout_plans').select('*').eq('user_id', userId).order('created_at', { ascending:false })
    setPlans(data || [])
    setLoading(false)
  }

  const savePlan = async (data) => {
    if (editing?.id) {
      await supabase.from('workout_plans').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await supabase.from('workout_plans').insert({ user_id: userId, ...data, created_at: new Date().toISOString() })
    }
    setEditing(null)
    fetchPlans()
  }

  const deletePlan = async (id) => {
    await supabase.from('workout_plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  if (editing) {
    const initPlan = editing.preload
      ? { name: editing.preload.name, exercises: editing.preload.exercises.map(item => {
          const exName = typeof item === 'string' ? item : item.name
          const ex = getExercise(exName)
          return {
            name: exName,
            icon: ex.icon || '💪',
            muscles: ex.muscles || '',
            timed: ex.timed || false,
            sets: (typeof item === 'object' && item.sets) || 3,
            reps: (typeof item === 'object' && item.reps) || (ex.timed ? 30 : 10),
            notes: (typeof item === 'object' && item.note) || '',
          }
        }), notes:'' }
      : editing.id ? editing : null
    return <PlanEditor plan={initPlan} onSave={savePlan} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <button onClick={() => setEditing('new')}
        style={{ width:'100%', padding:14, borderRadius:16, background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        {t('workout.createPlan')}
      </button>
      <button onClick={onBuildWithAuron}
        style={{ width:'100%', padding:14, borderRadius:16, background:C.surface, border:`2px solid ${C.purple}`, color:C.purple, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:C.shadowCard }}>
        {t('workout.buildWithAuron')}
      </button>
      {loading ? (
        <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
      ) : plans.length === 0 ? (
        <Card style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>No plans yet</div>
          <div style={{ fontSize:13, color:C.textMuted }}>Create from scratch or save a Library workout as a plan.</div>
        </Card>
      ) : plans.map(plan => (
        <div key={plan.id} style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.divider}`, padding:'14px 16px', marginBottom:10, boxShadow:C.shadowCard }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📋</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{plan.name}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>{plan.exercises?.length||0} exercises</div>
              {plan.schedule?.days?.length > 0 && (
                <div style={{ fontSize:11, color:C.purple, marginTop:3, display:'flex', alignItems:'center', gap:4 }}>
                  <span>📅</span>
                  <span>{plan.schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(' · ')}</span>
                  {plan.schedule.time && <span>at {plan.schedule.time}</span>}
                </div>
              )}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => onStartPlan(plan)} style={{ flex:2, padding:'10px', borderRadius:12, background:C.green, border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>{t('workout.start')}</button>
            <button onClick={() => setEditing(plan)} style={{ flex:1, padding:'10px', borderRadius:12, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:13, cursor:'pointer' }}>{t('workout.edit')}</button>
            <button onClick={() => deletePlan(plan.id)} style={{ flex:1, padding:'10px', borderRadius:12, background:C.redLight, border:'none', color:C.red, fontSize:13, cursor:'pointer' }}>{t('workout.delete')}</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Rest Timer — fullscreen overlay
// ─────────────────────────────────────────────
function fmtRest(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function RestTimer({ duration, onDone, nextSetLabel, exerciseName }) {
  const { t } = useTranslation()
  const [remaining, setRemaining] = useState(duration)
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => {
      if (r <= 1) { clearInterval(id); onDone?.(); return 0 }
      return r - 1
    }), 1000)
    return () => clearInterval(id)
  }, [])
  const pct = (remaining / duration) * 100
  const r = 54
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(26,20,50,0.92)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.7)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{t('session.rest')}</div>
      <div style={{ position:'relative', width:160, height:160 }}>
        <svg viewBox="0 0 120 120" style={{ width:160, height:160, transform:'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={C.purple} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
            strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:52, fontWeight:700, color:'#fff', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{fmtRest(remaining)}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{t('session.seconds')}</div>
        </div>
      </div>

      {(nextSetLabel || exerciseName) && (
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:16, padding:'12px 20px', textAlign:'center', minWidth:180 }}>
          {nextSetLabel && (
            <div style={{ marginBottom: exerciseName ? 6 : 0 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('session.nextSet') || 'Next Set'}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{nextSetLabel}</div>
            </div>
          )}
          {exerciseName && (
            <div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('workout.exercises') ? (t('session.exercise')||'Exercise') : 'Exercise'}</div>
              <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.9)' }}>{exerciseName}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display:'flex', gap:12 }}>
        <button onClick={onDone}
          style={{ padding:'10px 32px', borderRadius:20, background:C.purple, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>{t('session.skipRest')}</button>
        <button onClick={() => setRemaining(r => r + 15)}
          style={{ padding:'10px 20px', borderRadius:20, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', fontSize:14, cursor:'pointer' }}>+15s</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Exercise transition — shown between exercises (not between sets of the
// same exercise). Confirms what was just completed and previews what's
// next, with its own countdown separate from the between-set RestTimer.
// ─────────────────────────────────────────────
function ExerciseTransitionScreen({ completedName, nextExercise, nextMuscles, duration, onDone }) {
  const { t } = useTranslation()
  const [remaining, setRemaining] = useState(duration)
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => {
      if (r <= 1) { clearInterval(id); onDone?.(); return 0 }
      return r - 1
    }), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(26,20,50,0.94)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24, textAlign:'center' }}>
      <div style={{ fontSize:15, fontWeight:700, color:C.green, display:'flex', alignItems:'center', gap:6 }}>
        ✓ {completedName} {t('session.complete') || 'Complete'}
      </div>

      <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:12 }}>
        {t('session.nextExercise') || 'Next Exercise'}
      </div>
      <div style={{ width:64, height:64, borderRadius:20, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <ExerciseIcon name={nextExercise} size={32} color="#fff" />
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{nextExercise}</div>
      {nextMuscles && <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:-8 }}>{nextMuscles}</div>}

      <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:8 }}>
        {(t('session.startsIn') || 'Starts in')} {remaining}s
      </div>

      <button onClick={onDone}
        style={{ marginTop:8, padding:'12px 32px', borderRadius:20, background:C.purple, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
        {t('session.skipRest') || 'Skip Rest'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Number input sheet — slides up from bottom
// ─────────────────────────────────────────────
function NumberSheet({ label, value, onConfirm, onClose }) {
  const { t } = useTranslation()
  const [val, setVal] = useState(String(value || ''))
  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:C.surface, borderRadius:'24px 24px 0 0', padding:'20px 24px 40px', width:'100%', maxWidth:420 }}>
        <div style={{ width:40, height:4, borderRadius:2, background:C.divider, margin:'0 auto 20px' }} />
        <div style={{ fontSize:13, color:C.textMuted, textAlign:'center', marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:24 }}>
          <button onClick={() => setVal(v => String(Math.max(0, (parseFloat(v)||0) - 1)))}
            style={{ width:44, height:44, borderRadius:'50%', background:C.surfaceMid, border:'none', fontSize:22, color:C.purple, cursor:'pointer', fontWeight:700 }}>−</button>
          <div style={{ fontSize:48, fontWeight:800, color:C.text, minWidth:120, textAlign:'center', fontVariantNumeric:'tabular-nums' }}>
            {val || '0'}
          </div>
          <button onClick={() => setVal(v => String((parseFloat(v)||0) + 1))}
            style={{ width:44, height:44, borderRadius:'50%', background:C.surfaceMid, border:'none', fontSize:22, color:C.purple, cursor:'pointer', fontWeight:700 }}>+</button>
        </div>
        {/* Quick values */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20 }}>
          {(label.includes('kg') ? [20,40,60,80,100] : label.includes('sec') ? [20,30,45,60,90] : [6,8,10,12,15]).map(n => (
            <button key={n} onClick={() => setVal(String(n))}
              style={{ padding:'6px 12px', borderRadius:20, background:String(val)===String(n)?C.purpleLight:C.surfaceMid, border:`1px solid ${String(val)===String(n)?C.purple:C.border}`, color:String(val)===String(n)?C.purple:C.textMuted, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {n}
            </button>
          ))}
        </div>
        <button onClick={() => { onConfirm(val); onClose() }}
          style={{ width:'100%', padding:14, borderRadius:16, background:C.purple, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>
          {t('session.confirm')}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SetRow — clean row, tap weight/reps to edit
// ─────────────────────────────────────────────
function SetRow({ set, idx, onChange, onRemove, timed, onDone }) {
  const { t }  = useTranslation()
  const [sheet, setSheet] = useState(null)

  const markDone = () => {
    const newDone = !set.done
    onChange({ ...set, done: newDone })
    if (newDone) onDone?.()
  }

  const bgRow = set.done
    ? 'rgba(46,204,113,0.06)'
    : idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:0, background:bgRow, borderRadius:10, marginBottom:2 }}>
        {/* Set badge */}
        <div style={{ width:44, display:'flex', alignItems:'center', justifyContent:'center', paddingLeft:4 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:set.done?C.green:C.surfaceMid, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:set.done?'#fff':C.textMuted }}>
            {set.done ? '✓' : idx+1}
          </div>
        </div>

        {timed ? (
          <button onClick={() => setSheet('duration')}
            style={{ flex:1, padding:'12px 8px', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
            <span style={{ fontSize:20, fontWeight:700, color:set.done?C.green:set.duration?C.text:C.textDim }}>
              {set.duration || '—'}
            </span>
            <span style={{ fontSize:12, color:C.textMuted }}> s</span>
          </button>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center' }}>
            <button onClick={() => setSheet('weight')}
              style={{ flex:1, padding:'12px 6px', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
              <span style={{ fontSize:20, fontWeight:700, color:set.done?C.green:set.weight?C.text:C.textDim }}>
                {set.weight || '—'}
              </span>
              <span style={{ fontSize:12, color:C.textMuted }}> kg</span>
            </button>
            <span style={{ color:C.border, fontSize:18, fontWeight:300 }}>×</span>
            <button onClick={() => setSheet('reps')}
              style={{ flex:1, padding:'12px 6px', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
              <span style={{ fontSize:20, fontWeight:700, color:set.done?C.green:set.reps?C.text:C.textDim }}>
                {set.reps || '—'}
              </span>
              <span style={{ fontSize:12, color:C.textMuted }}> reps</span>
            </button>
          </div>
        )}

        {/* Done button */}
        <button onClick={markDone}
          style={{ width:44, height:44, borderRadius:12, background:set.done?C.green:C.purpleLight, border:'none', color:set.done?'#fff':C.purple, fontSize:set.done?16:13, fontWeight:700, cursor:'pointer', flexShrink:0, margin:'4px 4px 4px 0' }}>
          {set.done ? '✓' : '→'}
        </button>
      </div>

      {sheet === 'weight'   && <NumberSheet label={t('session.weight')}   value={set.weight}   onConfirm={v => onChange({...set, weight:v})}   onClose={() => setSheet(null)} />}
      {sheet === 'reps'     && <NumberSheet label={t('session.reps')}     value={set.reps}     onConfirm={v => onChange({...set, reps:v})}     onClose={() => setSheet(null)} />}
      {sheet === 'duration' && <NumberSheet label={t('session.duration')} value={set.duration} onConfirm={v => onChange({...set, duration:v})} onClose={() => setSheet(null)} />}
    </>
  )
}

// ─────────────────────────────────────────────
// Session exercise card — premium look
// ─────────────────────────────────────────────
function SessionExCard({ ex, onUpdate, onRemove, restDuration, onRestStart }) {
  const { t, lang } = useTranslation()
  const { tMuscles } = useSportT()
  const data     = getExercise(ex.name, lang)
  const timed    = data.timed || ex.timed

  const doneSets = ex.sets.filter(s => s.done).length
  const allDone  = ex.sets.length > 0 && doneSets === ex.sets.length

  const addSet = () => {
    const p = ex.sets[ex.sets.length - 1] || {}
    onUpdate({ ...ex, sets: [...ex.sets, { weight:p.weight||'', reps:p.reps||'', duration:p.duration||'', done:false }] })
  }
  const updateSet = (i, s) => {
    const sets = [...ex.sets]; sets[i] = s; onUpdate({ ...ex, sets })
  }
  const removeSet = i => onUpdate({ ...ex, sets: ex.sets.filter((_,j) => j!==i) })

  return (
    <>
      <div style={{ background:C.surface, borderRadius:20, border:`1px solid ${allDone?C.green+'55':C.divider}`, marginBottom:16, overflow:'hidden', boxShadow:allDone?`0 0 0 2px ${C.green}22`:C.shadowCard }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px 10px', borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ width:42, height:42, borderRadius:12, background:allDone?`${C.green}18`:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            <ExerciseIcon name={ex.name} size={20} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{ex.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
              <span style={{ fontSize:11, color:C.textMuted }}>{tMuscles(data.muscles)}</span>
              <span style={{ fontSize:11, color:allDone?C.green:doneSets>0?C.amber:C.textDim }}>· {doneSets}/{ex.sets.length} {t('session.doneMark').replace('✓ ','')}</span>
            </div>
          </div>
          <button onClick={onRemove} style={{ background:'none', border:'none', color:C.textDim, fontSize:18, cursor:'pointer', padding:'4px' }}>✕</button>
        </div>

        {/* Column headers */}
        <div style={{ display:'flex', alignItems:'center', padding:'6px 4px 2px', borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ width:44, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>{t('workout.setLabel')}</div>
          {timed ? (
            <div style={{ flex:1, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>{t('session.duration')}</div>
          ) : (
            <>
              <div style={{ flex:1, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>{t('workout.weightLabel')}</div>
              <div style={{ width:16 }} />
              <div style={{ flex:1, fontSize:10, color:C.textDim, textAlign:'center', fontWeight:600, textTransform:'uppercase' }}>{t('workout.repsLabel')}</div>
            </>
          )}
          <div style={{ width:52 }} />
        </div>

        {/* Sets */}
        <div style={{ padding:'4px 8px 8px' }}>
          {ex.sets.map((set, i) => (
            <SetRow key={i} set={set} idx={i} timed={timed}
              onChange={s => updateSet(i, s)}
              onRemove={() => removeSet(i)}
              onDone={() => restDuration > 0 && onRestStart?.()}
            />
          ))}
          <button onClick={addSet}
            style={{ width:'100%', padding:'9px', marginTop:6, borderRadius:10, background:C.surfaceMid, border:`1px dashed ${C.border}`, color:C.textMuted, fontSize:13, fontWeight:500, cursor:'pointer' }}>
            {t('session.addSet')}</button>
        </div>

        {/* How to */}
        <div style={{ padding:'0 16px 4px', borderTop:`1px solid ${C.divider}` }}>
          <ExerciseHowTo name={ex.name} />
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// Fullscreen exercise view
// ─────────────────────────────────────────────
function FullscreenExercise({ exercise, setIdx, totalSets, exIdx, totalExercises, elapsed, paused, onTogglePause, onSetDone, onPrev, onNext, onFinish, restSecs, saving, fmt, isLast }) {
  const { t, lang } = useTranslation()
  const { tMuscles } = useSportT()
  const data      = getExercise(exercise.name, lang)
  const timed     = data.timed || exercise.timed
  const set       = exercise.sets[setIdx]
  const bodyweight = !timed && isBodyweightExercise(exercise.name)
  const [showHow, setShowHow] = useState(false)
  const [sheet,   setSheet]   = useState(null)
  const [weight,  setWeight]  = useState(set?.weight || '')
  const [reps,    setReps]    = useState(set?.reps   || '')
  const [dur,     setDur]     = useState(set?.duration || '')
  const [justDone, setJustDone] = useState(false)

  // Sync local state when set/exercise changes — but NOT showRest
  useEffect(() => {
    setWeight(set?.weight || '')
    setReps(set?.reps || '')
    setDur(set?.duration || '')
    setShowHow(false)
  }, [setIdx, exercise.name])

  const isLastSetOfExercise = setIdx === totalSets - 1
  const isFinishing = isLast && isLastSetOfExercise

  const handleDone = () => {
    setJustDone(true)
    setTimeout(() => setJustDone(false), 900)
    onSetDone({ weight, reps, duration: dur })
  }

  const doneCount = exercise.sets.filter(s => s.done).length
  const categoryLabel = getExerciseCategoryLabel(exercise, data, t)

  // Overall workout progress — exercises completed + fraction of current
  // exercise's sets done, out of the total exercise count.
  const overallPct = totalExercises > 0
    ? Math.min(100, ((exIdx + (doneCount / Math.max(totalSets, 1))) / totalExercises) * 100)
    : 0

  const primaryLabel = isFinishing
    ? t('session.finishWorkout')
    : isLastSetOfExercise
      ? (t('session.finishExercise') || 'Finish Exercise')
      : (t('session.completeSet') || 'Complete Set')

  return (
    <div style={{ position:'fixed', inset:0, background:C.pageBg||'#F0EFF8', zIndex:200, display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', overflow:'hidden' }}>
      {sheet && (
        <NumberSheet
          label={sheet==='weight'?t('session.weight'):sheet==='reps'?t('session.reps'):t('session.duration')}
          value={sheet==='weight'?weight:sheet==='reps'?reps:dur}
          onConfirm={v => { if(sheet==='weight') setWeight(v); else if(sheet==='reps') setReps(v); else setDur(v) }}
          onClose={() => setSheet(null)}
        />
      )}

      {/* Set-complete feedback — subtle, auto-dismissing */}
      {justDone && (
        <div style={{
          position:'fixed', top:90, left:'50%', transform:'translateX(-50%)', zIndex:600,
          background:C.green, color:'#fff', padding:'10px 22px', borderRadius:20,
          fontSize:13.5, fontWeight:700, boxShadow:`0 6px 20px ${C.green}55`,
          display:'flex', alignItems:'center', gap:6, animation:'auronFadeSlide 0.9s ease-out',
        }}>
          <style>{`@keyframes auronFadeSlide{0%{opacity:0;transform:translate(-50%,-8px)}15%{opacity:1;transform:translate(-50%,0)}75%{opacity:1}100%{opacity:0}}`}</style>
          ✓ {t('session.setComplete') || 'Set Complete'} — {t('session.keepGoing') || 'Keep Going!'}
        </div>
      )}

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 6px', flexShrink:0 }}>
        <button onClick={onFinish} style={{ background:'none', border:'none', color:C.textMuted, fontSize:14, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:4 }}>
          ✕ End
        </button>
        <div style={{ fontSize:15, fontWeight:700, color:C.purple, fontVariantNumeric:'tabular-nums' }}>{fmt(elapsed)}</div>
        <button onClick={onTogglePause} style={{ background:C.purpleLight, border:'none', borderRadius:10, padding:'6px 14px', color:C.purple, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {paused ? t('workout.resume') : t('workout.pause')}
        </button>
      </div>

      {/* Overall workout progress */}
      <div style={{ padding:'6px 20px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, color:C.textMuted, marginBottom:5, fontWeight:600 }}>
          <span>{(t('session.exercise')||'Exercise')} {exIdx+1} {t('session.of')||'of'} {totalExercises}</span>
          <span>{(t('session.set')||'Set')} {setIdx+1} {t('session.of')||'of'} {totalSets}</span>
        </div>
        <div style={{ height:5, background:C.surfaceMid, borderRadius:3, overflow:'hidden' }}>
          <div style={{ width:`${overallPct}%`, height:'100%', background:C.purple, borderRadius:3, transition:'width 0.3s ease' }} />
        </div>
        {/* Set dots for the current exercise */}
        <div style={{ display:'flex', gap:6, marginTop:8, overflowX:'auto' }}>
          {exercise.sets.map((s, i) => (
            <div key={i} style={{ width: i===setIdx?20:7, height:7, borderRadius:4, background:s.done?C.green:i===setIdx?C.purple:C.border, transition:'all 0.2s', flexShrink:0 }} />
          ))}
        </div>
      </div>

      {/* Main content — scrollable */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 24px' }}>
        {/* Exercise image/icon — prominent hero visual */}
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{
            width:104, height:104, borderRadius:28, margin:'0 auto 12px',
            background:`linear-gradient(135deg, ${C.purpleLight}, ${C.purple}22)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:`1px solid ${C.purple}22`,
          }}>
            <ExerciseIcon name={exercise.name} size={52} />
          </div>
          <div style={{ fontSize:25, fontWeight:800, color:C.text, lineHeight:1.2, marginBottom:5 }}>{exercise.name}</div>
          <div style={{ fontSize:13, color:C.textMuted }}>
            {tMuscles(data.muscles)}{tMuscles(data.muscles) ? ' • ' : ''}{categoryLabel}
          </div>
          {(exercise.repRange || exercise.unilateral) && (
            <div style={{ fontSize:12, color:C.textDim, marginTop:5 }}>
              {exercise.repRange && `${exercise.repRange} ${timed ? '' : (t('session.reps')||'reps')}`}
              {exercise.repRange && exercise.unilateral ? ' · ' : ''}
              {exercise.unilateral && (exercise.unilateralLabel || t('workout.eachSide') || 'each side')}
            </div>
          )}
          {exercise.note && (
            <div style={{ fontSize:12, color:C.purple, marginTop:6, lineHeight:1.5, padding:'0 8px' }}>💡 {exercise.note}</div>
          )}
        </div>

        {/* Current set — large, unmistakably highlighted */}
        <div style={{
          background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark||C.purple})`, borderRadius:20,
          padding:'14px 16px', marginBottom:16, textAlign:'center', boxShadow:`0 6px 18px ${C.purple}33`,
        }}>
          <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.75)', fontWeight:700, letterSpacing:'0.08em', marginBottom:2 }}>
            {(t('session.set')||'SET').toUpperCase()} {setIdx+1} / {totalSets}
          </div>
          <div style={{ fontSize:15, color:'#fff', fontWeight:600 }}>
            {timed
              ? `${dur || exercise.repRange || set?.duration || '—'} ${t('workout.duration2')?'sec':'sec'}`
              : `${reps || exercise.repRange || '—'} ${t('session.reps')||'reps'}`}
          </div>
        </div>

        {/* Weight & Reps / Duration — big tap targets */}
        {timed ? (
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('workout.duration2')}</div>
            <button onClick={() => setSheet('duration')}
              style={{ background:C.surface, border:`2px solid ${C.purple}`, borderRadius:20, padding:'16px 36px', cursor:'pointer', boxShadow:C.shadowCard }}>
              <span style={{ fontSize:44, fontWeight:800, color:dur?C.purple:C.textDim, fontVariantNumeric:'tabular-nums' }}>{dur||'—'}</span>
              <span style={{ fontSize:18, color:C.textMuted, marginLeft:6 }}>sec</span>
            </button>
          </div>
        ) : bodyweight ? (
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('session.reps')}</div>
            <button onClick={() => setSheet('reps')}
              style={{ background:C.surface, border:`2px solid ${reps?C.purple:C.border}`, borderRadius:20, padding:'16px 44px', cursor:'pointer', boxShadow:C.shadowCard }}>
              <span style={{ fontSize:44, fontWeight:800, color:reps?C.purple:C.textDim, fontVariantNumeric:'tabular-nums' }}>{reps||'—'}</span>
              <span style={{ fontSize:16, color:C.textMuted, marginLeft:8 }}>{t('session.reps').toLowerCase()}</span>
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:14, justifyContent:'center', alignItems:'center', marginBottom:20 }}>
            {/* Weight */}
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('session.weight').replace(' (kg)','')}</div>
              <button onClick={() => setSheet('weight')}
                style={{ width:'100%', background:C.surface, border:`2px solid ${weight?C.purple:C.border}`, borderRadius:18, padding:'14px 12px', cursor:'pointer', boxShadow:C.shadowCard }}>
                <div style={{ fontSize:36, fontWeight:800, color:weight?C.purple:C.textDim, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{weight||'—'}</div>
                <div style={{ fontSize:12, color:C.textMuted, marginTop:3 }}>{t('session.weight').replace(' (kg)','').toLowerCase()}</div>
              </button>
            </div>

            <div style={{ fontSize:26, color:C.border, fontWeight:300, flexShrink:0, marginTop:6 }}>×</div>

            {/* Reps */}
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('session.reps')}</div>
              <button onClick={() => setSheet('reps')}
                style={{ width:'100%', background:C.surface, border:`2px solid ${reps?C.purple:C.border}`, borderRadius:18, padding:'14px 12px', cursor:'pointer', boxShadow:C.shadowCard }}>
                <div style={{ fontSize:36, fontWeight:800, color:reps?C.purple:C.textDim, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{reps||'—'}</div>
                <div style={{ fontSize:12, color:C.textMuted, marginTop:3 }}>{t('session.reps').toLowerCase()}</div>
              </button>
            </div>
          </div>
        )}

        {/* How to perform — cleaner card */}
        {data.howTo?.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <button onClick={() => setShowHow(h=>!h)}
              style={{ width:'100%', background:C.surface, border:`1px solid ${C.divider}`, borderRadius:14, padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:C.shadowCard }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14, color:C.purple }}>▶</span>
                <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{t('workout.howTo')}</span>
              </div>
              <span style={{ color:C.purple, fontSize:16 }}>{showHow ? '▲' : '▼'}</span>
            </button>
            {showHow && (() => {
              const howTo  = data.howTo || []
              const tips   = data.tips  || ''
              return (
                <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.divider}`, padding:'16px', marginTop:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                    {t('workout.howTo')}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: tips ? 12 : 0 }}>
                    {howTo.map((step,i) => (
                      <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:C.text, lineHeight:1.5 }}>
                        <span style={{ color:C.purple, flexShrink:0 }}>•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  {tips && (
                    <div style={{ borderTop:`1px solid ${C.divider}`, paddingTop:10 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.purple, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
                        {t('workout.tips') || 'Tips'}
                      </div>
                      <div style={{ fontSize:12, color:C.purple, fontStyle:'italic' }}>💡 {tips}</div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        <div style={{ height:80 }} />
      </div>

      {/* Bottom action bar — fixed */}
      <div style={{ padding:'12px 20px 28px', background:C.pageBg||'#F0EFF8', borderTop:`1px solid ${C.divider}`, flexShrink:0 }}>
        <button onClick={handleDone}
          style={{ width:'100%', padding:'18px', borderRadius:20, background:`linear-gradient(135deg, ${C.green}, #1aad6b)`, border:'none', color:'#fff', fontSize:17, fontWeight:800, cursor:'pointer', letterSpacing:'0.02em', boxShadow:`0 6px 24px ${C.green}44` }}>
          {primaryLabel}
        </button>
        {/* Skip */}
        {!isFinishing && (
          <button onClick={() => onNext?.()}
            style={{ width:'100%', marginTop:8, padding:'10px', background:'none', border:'none', color:C.textMuted, fontSize:13, cursor:'pointer' }}>
            {t('session.skipSet')}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Active session — orchestrates fullscreen flow
// ─────────────────────────────────────────────
function WorkoutSession({ userId, timezone, plan, onSave, onCancel }) {
  const { t, lang } = useTranslation()
  const { tMuscles } = useSportT()
  const fromLibrary = !!plan?.fromLibrary

  const initExercises = () => (plan?.exercises || []).map(ex => {
    const name  = typeof ex === 'string' ? ex : (ex.name || ex)
    const data  = getExercise(name, lang)
    const count = parseInt(ex.sets) || 3
    const isObj = typeof ex === 'object'
    return {
      name, timed: data.timed || false,
      sets: Array.from({ length: count }, () => ({
        weight: '', reps: String(parseInt(ex.reps)||10), duration: String(parseInt(ex.reps)||30), done: false
      })),
      // Carry the exact prescription through to the active session —
      // used for per-exercise rest, rep-range display, and unilateral cues.
      section:          isObj ? ex.section : undefined,
      restSec:          isObj && ex.restSec != null ? ex.restSec : undefined,
      repRange:         isObj ? ex.repRange : undefined,
      unilateral:       isObj ? ex.unilateral : undefined,
      unilateralLabel:  isObj ? ex.unilateralLabel : undefined,
      note:             isObj ? ex.note : undefined,
    }
  })

  const [exercises,  setExercises]  = useState(initExercises)
  const [name,       setName]       = useState(plan?.name || '')
  const [notes,      setNotes]      = useState('')
  const [started,    setStarted]    = useState(false)
  const [paused,     setPaused]     = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [restSecs,   setRestSecs]   = useState(plan?.suggestedRestSec != null ? plan.suggestedRestSec : 60)
  const [showPicker, setShowPicker] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [showRest,   setShowRest]   = useState(false)  // ← lifted here so it survives re-renders
  // Fullscreen navigation state
  const [activeEx,   setActiveEx]   = useState(0)  // exercise index
  const [activeSet,  setActiveSet]  = useState(0)  // set index within exercise
  const startRef   = useRef(null)
  const pausedAt   = useRef(0)
  const pauseAccum = useRef(0)

  useEffect(() => {
    if (!started || paused) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current - pauseAccum.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [started, paused])

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const beginWorkout = () => { startRef.current = Date.now(); setStarted(true) }
  const togglePause  = () => {
    if (!paused) { pausedAt.current = Date.now(); setPaused(true) }
    else { pauseAccum.current += Date.now() - pausedAt.current; setPaused(false) }
  }

  const addExercise  = ex => setExercises(prev => [...prev, { name:ex.name, timed:getExercise(ex.name).timed||false, sets:[{weight:'',reps:'',duration:'',done:false}] }])
  const updateEx     = (i, ex) => setExercises(prev => prev.map((e,j)=>j===i?ex:e))
  const removeEx     = i => setExercises(prev => prev.filter((_,j)=>j!==i))
  const today        = toUserDateStr(timezone)
  const doneSetsTotal = exercises.reduce((s,e)=>s+e.sets.filter(s=>s.done).length,0)
  const totalVol      = exercises.reduce((s,e)=>s+e.sets.filter(s=>s.done).reduce((sv,set)=>sv+(parseFloat(set.weight)||0)*(parseInt(set.reps)||1),0),0)

  // Mark current set done and advance
  const [workoutDone, setWorkoutDone] = useState(false)
  // The rest duration for whichever exercise/set was just completed — an
  // exercise-specific prescribed restSec always wins over the universal
  // picker value, so different rest lengths line up with the plan exactly.
  const [activeRestSec, setActiveRestSec] = useState(null)
  // Exercise transition (rest BETWEEN exercises) — distinct from the
  // between-set RestTimer above; shows what was just finished and what's next.
  const [exerciseTransition, setExerciseTransition] = useState(null) // { completedName, nextExercise, nextMuscles } | null

  const handleSetDone = ({ weight, reps, duration }) => {
    const ex   = exercises[activeEx]
    const sets = ex.sets.map((s,i) => i===activeSet ? {...s, weight, reps, duration, done:true} : s)
    const updatedExercises = exercises.map((e,i) => i===activeEx ? {...e, sets} : e)
    setExercises(updatedExercises)

    const isLastEx  = activeEx === exercises.length - 1
    const isLastSet = activeSet === ex.sets.length - 1
    const isFinishing = isLastEx && isLastSet

    if (isFinishing) {
      setWorkoutDone(true)
      return
    }

    // The exercise's own prescribed rest (including 0 for cool-down/no-rest
    // steps) overrides the universal picker.
    const thisRestSec = ex.restSec != null ? ex.restSec : restSecs

    if (isLastSet) {
      // Moving to a NEW exercise — show the exercise-transition screen
      // instead of the plain between-set rest timer.
      const nextEx = exercises[activeEx + 1]
      setExerciseTransition({
        completedName: ex.name,
        nextExercise: nextEx.name,
        nextMuscles: tMuscles(getExercise(nextEx.name, lang).muscles),
        duration: thisRestSec > 0 ? thisRestSec : 20,
      })
    } else if (thisRestSec > 0) {
      setActiveRestSec(thisRestSec)
      setShowRest(true)
    }

    // Advance to next set or next exercise
    if (!isLastSet) {
      setActiveSet(s => s + 1)
    } else {
      setActiveEx(e => e + 1)
      setActiveSet(0)
    }
  }

  const handleNext = () => {
    const ex = exercises[activeEx]
    if (activeSet < ex.sets.length - 1) setActiveSet(s => s + 1)
    else if (activeEx < exercises.length - 1) { setActiveEx(e=>e+1); setActiveSet(0) }
  }

  const isLastExAndSet = activeEx === exercises.length - 1 && activeSet === (exercises[activeEx]?.sets.length||1) - 1

  const handleSave = async () => {
    setSaving(true)
    const workoutName = name.trim() || exercises.map(e=>e.name).join(', ').slice(0,60) || 'Workout'
    const minutes     = started ? Math.max(1, Math.round(elapsed/60)) : 0
    await supabase.from('workout_logs').insert({
      user_id: userId, log_date: today,
      workout_name: workoutName, workout_type: exercises[0]?getExercise(exercises[0].name).category:'General',
      duration_minutes: minutes, calories_burned: Math.round(minutes*6),
      exercises: exercises.map(ex => ({
        name: ex.name, category: getExercise(ex.name).category,
        sets: ex.sets.filter(s=>s.done).map(s=>({ weight:parseFloat(s.weight)||null, reps:parseInt(s.reps)||null, duration:parseInt(s.duration)||null })),
      })),
      notes: notes.trim()||null,
    })
    setSaving(false)
    onSave()
  }

  // ── Pre-start screen ─────────────────────────
  if (!started) {
    return (
      <div>
        <BackBtn onBack={onCancel} label={t('session.cancelWorkout')} />
        <div style={{ background:`linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`, borderRadius:20, padding:'24px 20px', marginBottom:20, color:'#fff' }}>
          {fromLibrary
            ? <div style={{ fontSize:22, fontWeight:800 }}>{name}</div>
            : <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name your workout..."
                style={{ width:'100%', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:18, fontWeight:700, outline:'none' }} />
          }
          <div style={{ fontSize:13, opacity:0.75, marginTop:8 }}>{exercises.length} exercises</div>
        </div>

        {/* Rest setting */}
        <div style={{ background:C.surface, borderRadius:14, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, color:C.textMuted, marginRight:4 }}>{t('session.restBetween')}</span>
          {[0,30,45,60,90,120].map(s => (
            <button key={s} onClick={() => setRestSecs(s)}
              style={{ padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1px solid ${restSecs===s?C.purple:C.border}`, background:restSecs===s?C.purpleLight:'transparent', color:restSecs===s?C.purple:C.textMuted, fontWeight:restSecs===s?700:400 }}>
              {s===0?t('session.restOff'):`${s}s`}
            </button>
          ))}
        </div>

        {/* Exercise list preview */}
        <Label>{t('workout.exercises')}</Label>
        {exercises.map((ex,i) => {
          const data = getExercise(ex.name, lang)
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:C.surface, borderRadius:14, border:`1px solid ${C.divider}`, marginBottom:8 }}>
              <span style={{ fontSize:20 }}><ExerciseIcon name={ex.name} size={20} /></span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{ex.name}</div>
                <div style={{ fontSize:11, color:C.textMuted }}>{ex.sets.length} {t('plan.sets').toLowerCase()} · {tMuscles(data.muscles)}</div>
              </div>
              <button onClick={() => removeEx(i)} style={{ background:'none', border:'none', color:C.textDim, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>
          )
        })}
        <button onClick={() => setShowPicker(true)}
          style={{ width:'100%', padding:12, borderRadius:14, background:C.purpleLight, border:`2px dashed ${C.purple}55`, color:C.purple, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:20 }}>
          {t('session.addExercise')}
        </button>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:1, padding:14, borderRadius:16, background:C.surfaceMid, border:'none', color:C.textMuted, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            {saving?t('session.saving'):t('session.logNoTimer')}
          </button>
          <button onClick={beginWorkout}
            style={{ flex:2, padding:14, borderRadius:16, background:C.green, border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 20px ${C.green}44` }}>
            {t('session.begin')}
          </button>
        </div>
        {showPicker && <ExercisePickerModal onAdd={addExercise} onClose={() => setShowPicker(false)} />}
      </div>
    )
  }

  // ── Active — fullscreen exercise view ────────
  if (exercises.length === 0) return null

  // Finish screen — triggered by explicit workoutDone flag (avoids stale closure bug)
  if (workoutDone) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center', padding:24 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🏆</div>
        <div style={{ fontSize:28, fontWeight:800, color:C.text, marginBottom:8 }}>{t('session.allDone')}</div>
        <div style={{ fontSize:15, color:C.textMuted, marginBottom:8 }}>{fmt(elapsed)} · {doneSetsTotal} {t('plan.sets').toLowerCase()}</div>
        {totalVol>0 && <div style={{ fontSize:13, color:C.textMuted, marginBottom:32 }}>{Math.round(totalVol)} kg</div>}
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder={t('session.notes')}
          style={{ width:'100%', maxWidth:360, padding:'12px 14px', borderRadius:14, background:C.surfaceMid, border:`1px solid ${C.border}`, color:C.text, fontSize:13, outline:'none', resize:'none', marginBottom:16 }} />
        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', maxWidth:360, padding:16, borderRadius:18, background:C.purple, border:'none', color:'#fff', fontSize:16, fontWeight:700, cursor:saving?'default':'pointer' }}>
          {saving?t('session.saving'):t('session.saveWorkout')}
        </button>
      </div>
    )
  }

  // Render rest timer as fullscreen overlay while exercise view is still mounted
  return (
    <>
      {exerciseTransition && (
        <ExerciseTransitionScreen
          completedName={exerciseTransition.completedName}
          nextExercise={exerciseTransition.nextExercise}
          nextMuscles={exerciseTransition.nextMuscles}
          duration={exerciseTransition.duration}
          onDone={() => setExerciseTransition(null)}
        />
      )}
      {!exerciseTransition && showRest && (
        <RestTimer
          duration={activeRestSec != null ? activeRestSec : restSecs}
          onDone={() => setShowRest(false)}
          nextSetLabel={`${t('session.set') || 'Set'} ${activeSet + 1} ${t('session.of') || 'of'} ${exercises[activeEx]?.sets.length}`}
          exerciseName={exercises[activeEx]?.name}
        />
      )}
      <FullscreenExercise
        exercise={exercises[activeEx]}
        setIdx={activeSet}
        totalSets={exercises[activeEx].sets.length}
        exIdx={activeEx}
        totalExercises={exercises.length}
        elapsed={elapsed}
        paused={paused}
        onTogglePause={togglePause}
        onSetDone={handleSetDone}
        onNext={handleNext}
        onFinish={() => { setStarted(false) }}
        restSecs={restSecs}
        saving={saving}
        fmt={fmt}
        isLast={activeEx===exercises.length-1}
      />
    </>
  )
}

// ─────────────────────────────────────────────
// Workout history card
// ─────────────────────────────────────────────
function WorkoutHistoryCard({ log, onDelete }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  return (
    <Card style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:C.greenLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>💪</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{log.workout_name}</div>
          <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>
            {[log.duration_minutes&&`${log.duration_minutes} min`, log.calories_burned&&`${log.calories_burned} kcal`].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {log.exercises?.length>0 && (
            <button onClick={()=>setExpanded(e=>!e)} style={{ padding:'6px 12px', borderRadius:10, background:C.purpleLight, border:'none', color:C.purple, fontSize:12, cursor:'pointer' }}>
              {expanded ? '▲' : `${log.exercises.length} ` + t('workout.exercises')}
            </button>
          )}
          {!confirm
            ? <button onClick={()=>setConfirm(true)} style={{ padding:'6px 10px', borderRadius:10, background:C.redLight, border:'none', color:C.red, fontSize:12, cursor:'pointer' }}>✕</button>
            : <button onClick={()=>onDelete(log.id)} style={{ padding:'6px 10px', borderRadius:10, background:C.red, border:'none', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>Delete?</button>
          }
        </div>
      </div>
      {expanded && log.exercises?.length>0 && (
        <div style={{ marginTop:12, borderTop:`1px solid ${C.divider}`, paddingTop:12 }}>
          {log.exercises.map((ex,i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, minWidth:140 }}>{ex.name}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>
                {ex.sets?.map((s,j)=><span key={j} style={{marginRight:8}}>{s.weight?`${s.weight}kg×${s.reps}`:s.duration?`${s.duration}s`:`×${s.reps}`}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────
// Today workout tab — shows scheduled plans + logs
// ─────────────────────────────────────────────
function TodayWorkoutTab({ userId, timezone, today, logs, logsLoading, onStartEmpty, onStartPlan, onDelete }) {
  const { t } = useTranslation()
  const [plans,   setPlans]   = useState([])
  const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat']
  const todayKey = DAY_KEYS[new Date(today + 'T12:00:00').getDay()]

  useEffect(() => {
    if (!userId) return
    supabase.from('workout_plans').select('*').eq('user_id', userId)
      .then(({ data }) => setPlans(data || []))
  }, [userId])

  const scheduledToday = plans.filter(p => p.schedule?.days?.includes(todayKey))

  return (
    <div>
      {/* Scheduled plans */}
      {scheduledToday.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <Label>Scheduled for today</Label>
          {scheduledToday.map(plan => (
            <div key={plan.id} style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.purple}44`, padding:'14px 16px', marginBottom:10, boxShadow:C.shadowCard }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <div style={{ width:44, height:44, borderRadius:13, background:C.purpleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📋</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{plan.name}</div>
                  <div style={{ fontSize:12, color:C.purple }}>
                    {plan.exercises?.length||0} {t('workout.exercises')}{plan.schedule?.time ? ` · ${plan.schedule.time}` : ''}
                  </div>
                </div>
              </div>
              <button onClick={() => onStartPlan(plan)}
                style={{ width:'100%', padding:'11px', borderRadius:12, background:C.purple, border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                {t('workout.startNow')}
              </button>
            </div>
          ))}
        </div>
      )}

      {logsLoading ? (
        <div style={{ textAlign:'center', padding:30, color:C.textMuted }}>Loading…</div>
      ) : logs.length > 0 ? (
        <>
          <Label>Today's workouts</Label>
          {logs.map(log => <WorkoutHistoryCard key={log.id} log={log} onDelete={onDelete} />)}
        </>
      ) : (
        <Card style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏃</div>
          <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>
            {scheduledToday.length > 0 ? t('workout.readyStart') : t('workout.noWorkoutToday')}
          </div>
          <div style={{ fontSize:13, color:C.textMuted }}>
            {scheduledToday.length > 0 ? t('workout.noWorkoutSub') : t('workout.noWorkoutSub')}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main WorkoutTab
// ─────────────────────────────────────────────
export default function WorkoutTab({ userId, profile }) {
  const { t, lang } = useTranslation()
  const timezone = profile?.timezone
  const today    = toUserDateStr(timezone)

  const [tab,          setTab]          = useState('library')
  const [session,      setSession]      = useState(null)
  const [logs,         setLogs]         = useState([])
  const [logsLoading,  setLogsLoading]  = useState(true)
  const [recentLogs,   setRecentLogs]   = useState([]) // last 30 days, for streak/recent-workouts/Auron context
  const [preloadPlan,  setPreloadPlan]  = useState(null)
  const [showBuilder,  setShowBuilder]  = useState(false)
  const [planRefreshKey, setPlanRefreshKey] = useState(0)
  const [libraryScreen, setLibraryScreen] = useState('root') // 'root' | 'category' | 'detail'
  const [plansScreen,   setPlansScreen]   = useState('root') // 'root' | 'editor'

  useEffect(() => { fetchLogs(); fetchRecentLogs() }, [userId])

  const fetchLogs = async () => {
    if (!userId) return
    setLogsLoading(true)
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', userId).eq('log_date', today).order('created_at', { ascending:false })
    setLogs(data || [])
    setLogsLoading(false)
  }

  const fetchRecentLogs = async () => {
    if (!userId) return
    const from = new Date()
    from.setDate(from.getDate() - 30)
    const fromStr = from.toISOString().split('T')[0]
    const { data } = await supabase.from('workout_logs')
      .select('log_date, workout_name, duration_minutes, calories_burned')
      .eq('user_id', userId).gte('log_date', fromStr)
      .order('log_date', { ascending: false })
    setRecentLogs(data || [])
  }

  const deleteLog = async id => {
    await supabase.from('workout_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const handleUseAsTemplate = workout => {
    if (workout.startNow) {
      setSession({ name: workout.name, exercises: workout.exercises, fromLibrary: true, suggestedRestSec: workout.suggestedRestSec })
    } else {
      setPreloadPlan({ name: workout.name, exercises: workout.exercises })
      setTab('plans')
    }
  }

  // ── Derived from recentLogs: streak, days-since-last, this week's count ──
  const recentDatesSet = new Set(recentLogs.map(l => l.log_date))
  let currentStreakDays = 0
  {
    let checkDate = new Date()
    // Grace: if today has no workout yet, start counting from yesterday
    // so an in-progress day doesn't zero out an otherwise real streak.
    if (!recentDatesSet.has(today)) checkDate.setDate(checkDate.getDate() - 1)
    for (let i = 0; i < 30; i++) {
      const ds = checkDate.toISOString().split('T')[0]
      if (recentDatesSet.has(ds)) { currentStreakDays++; checkDate.setDate(checkDate.getDate() - 1) }
      else break
    }
  }
  const daysSinceLastWorkout = (() => {
    if (recentLogs.length === 0) return null
    const lastDate = recentLogs[0].log_date // already ordered desc
    const diffMs = new Date(today + 'T12:00:00') - new Date(lastDate + 'T12:00:00')
    return Math.round(diffMs / 86400000)
  })()
  const weekCount = (() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 6)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    return new Set(recentLogs.filter(l => l.log_date >= weekAgoStr).map(l => l.log_date)).size
  })()
  // Recent workouts for quick re-access in the Library — distinct names, most recent first
  const recentWorkoutNames = (() => {
    const seen = new Set()
    const out = []
    for (const l of recentLogs) {
      if (l.workout_name && !seen.has(l.workout_name)) {
        seen.add(l.workout_name)
        out.push(l)
        if (out.length >= 5) break
      }
    }
    return out
  })()

  const workoutCtx = logsLoading ? null : {
    workoutDone: logs.length > 0,
    hour: new Date().getHours(),
    streakDays: currentStreakDays,
    daysSinceLastWorkout,
    weekCount,
  }

  // Auron is only shown on root-level screens — hidden on category pages,
  // workout detail, the plan editor, and the builder sub-screen. Active
  // sessions are already excluded entirely via the `if (session)` early
  // return below.
  const isRootScreen =
    tab === 'library' ? libraryScreen === 'root' :
    tab === 'plans'   ? (plansScreen === 'root' && !showBuilder) :
    tab === 'log'     ? true :
    false

  if (session) {
    return (
      <WorkoutSession
        userId={userId} timezone={timezone} plan={session}
        onSave={() => { fetchLogs(); setSession(null) }}
        onCancel={() => setSession(null)}
      />
    )
  }

  return (
    <div>
      {isRootScreen && <TabAuronCard tab="workout" ctx={workoutCtx} lang={lang} />}

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:C.surfaceMid, borderRadius:14, padding:4 }}>
        {[['library',t('workout.library')],['plans',t('workout.myPlans')],['log',t('workout.today')]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, padding:'9px 4px', borderRadius:11, fontSize:12, fontWeight:tab===id?700:400, cursor:'pointer', border:'none', background:tab===id?C.surface:'transparent', color:tab===id?C.purple:C.textMuted, boxShadow:tab===id?C.shadowCard:'none', transition:'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {tab==='library' && <LibraryTab onUseAsTemplate={handleUseAsTemplate} recentWorkouts={recentWorkoutNames} onScreenChange={setLibraryScreen} />}

      {tab==='plans' && (
        <>
          {showBuilder && (
            <AuronWorkoutBuilder
              userId={userId}
              onClose={() => setShowBuilder(false)}
              onPlanSaved={() => {
                setShowBuilder(false)
                // Force MyPlansTab to refetch by remounting with key
                setPreloadPlan(prev => prev) // no-op, refetch handled inside MyPlansTab via planRefreshKey
                setPlanRefreshKey(k => k + 1)
              }}
            />
          )}
          <MyPlansTab key={planRefreshKey} userId={userId}
            onStartPlan={plan => setSession({ ...plan, fromLibrary: false })}
            preloadPlan={preloadPlan}
            onPreloadConsumed={() => setPreloadPlan(null)}
            onBuildWithAuron={() => setShowBuilder(true)}
            onScreenChange={setPlansScreen}
          />
        </>
      )}

      {tab==='log' && (
        <TodayWorkoutTab
          userId={userId}
          timezone={timezone}
          today={today}
          logs={logs}
          logsLoading={logsLoading}
          onStartEmpty={() => setSession({ name:'', exercises:[], fromLibrary:false })}
          onStartPlan={plan => setSession({ ...plan, fromLibrary: false })}
          onDelete={deleteLog}
        />
      )}
    </div>
  )
}
