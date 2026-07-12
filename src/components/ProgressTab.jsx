import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'
import { useTranslation } from '../lib/i18n.jsx'
import { TabAuronCard } from './CoachAuron'
import { toUserDateStr } from '../lib/dateUtils.js'
import { computeDayScores, scoreRank } from '../lib/scoring.js'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.divider}`, boxShadow: T.shadowCard, padding: '16px 18px', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
      {children}
    </div>
  )
}

function getDateRange(days, timezone) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return toUserDateStr(timezone) === toUserDateStr(timezone) // ensure tz
      ? (() => { const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()
      : d.toISOString().split('T')[0]
  })
}

// ─────────────────────────────────────────────
// Mini bar chart — pure SVG, no deps
// ─────────────────────────────────────────────
function BarChart({ data, goal, color, height = 80, showLabels = true }) {
  if (!data || data.length === 0) return null
  const max    = Math.max(goal * 1.2, ...data.map(d => d.value), 1)
  const width  = 100 / data.length

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 400 ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
        {/* Goal line */}
        {goal > 0 && (
          <line
            x1="0" y1={height - (goal / max) * height}
            x2="400" y2={height - (goal / max) * height}
            stroke={color} strokeWidth="1" strokeDasharray="6,4" opacity="0.4"
          />
        )}
        {data.map((d, i) => {
          const barH = d.value > 0 ? Math.max(3, (d.value / max) * height) : 0
          const x = i * (400 / data.length) + 4
          const w = (400 / data.length) - 8
          const isToday = i === data.length - 1
          return (
            <rect
              key={i} x={x} y={height - barH} width={w} height={barH}
              rx="3" fill={isToday ? color : color + '88'}
            />
          )
        })}
      </svg>
      {/* Day labels */}
      {showLabels && (
        <div style={{ display: 'flex', marginTop: 4 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === data.length - 1 ? color : T.textDim }}>
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Line chart — SVG
// ─────────────────────────────────────────────
function LineChart({ data, color, height = 80, showLabels = true }) {
  if (!data || data.length < 2) return null
  const values = data.map(d => d.value)
  const min    = Math.min(...values.filter(v => v > 0)) * 0.98
  const max    = Math.max(...values) * 1.02
  const range  = max - min || 1

  const toX = i  => (i / (data.length - 1)) * 380 + 10
  const toY = v  => height - ((v - min) / range) * (height - 10) - 5

  const points = data.map((d, i) => d.value > 0 ? `${toX(i)},${toY(d.value)}` : null).filter(Boolean)
  if (points.length < 2) return null

  const path = points.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 400 ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={`${path} L${toX(data.length-1)},${height} L${toX(0)},${height} Z`}
          fill={`url(#grad_${color.replace('#','')})`} />
        {/* Line */}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => d.value > 0 && (
          <circle key={i} cx={toX(i)} cy={toY(d.value)} r={i === data.length - 1 ? 4 : 2.5}
            fill={color} stroke={T.surface} strokeWidth="1.5" />
        ))}
      </svg>
      {showLabels && (
        <div style={{ display: 'flex', marginTop: 4 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === data.length - 1 ? color : T.textDim }}>
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Streak heatmap — 7 weeks × 7 days
// ─────────────────────────────────────────────
function StreakHeatmap({ loggedDates, timezone }) {
  const today    = toUserDateStr(timezone)
  const days     = []
  for (let i = 48; i >= 0; i--) {
    const d   = new Date()
    d.setDate(d.getDate() - i)
    const ds  = (() => { const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()
    days.push({ ds, isToday: ds === today, logged: loggedDates.has(ds), dow: d.getDay() })
  }

  // Pad start to align with Sunday
  const firstDow = days[0].dow
  const padded   = [...Array(firstDow).fill(null), ...days]

  const DAYS_SHORT = ['S','M','T','W','T','F','S']

  return (
    <div>
      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
        {DAYS_SHORT.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 9, color: T.textDim }}>{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {padded.map((day, i) => (
          <div key={i} style={{
            aspectRatio: '1', borderRadius: 4,
            background: !day ? 'transparent'
              : day.isToday  ? T.purple
              : day.logged   ? T.green + 'CC'
              : T.surfaceMid,
            border: day?.isToday ? 'none' : `1px solid ${T.divider}`,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: T.textMuted, justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: T.green + 'CC' }} /> Active</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: T.purple }} /> Today</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: T.surfaceMid, border: `1px solid ${T.divider}` }} /> Rest</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Weight logger
// ─────────────────────────────────────────────
function WeightLogger({ userId, timezone, weightData, onLogged, rangeLabel }) {
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [unit,   setUnit]   = useState('kg')
  const { t } = useTranslation()

  const handleLog = async () => {
    if (!weight || isNaN(weight)) return
    setSaving(true)
    const today = toUserDateStr(timezone)
    const kg    = unit === 'lbs' ? parseFloat(weight) * 0.453592 : parseFloat(weight)
    await supabase.from('weight_logs').upsert(
      { user_id: userId, log_date: today, weight_kg: Math.round(kg * 10) / 10 },
      { onConflict: 'user_id,log_date' }
    )
    setSaving(false)
    setWeight('')
    onLogged?.()
  }

  const latest = weightData?.[weightData.length - 1]
  const first  = weightData?.find(d => d.value > 0)
  const change = latest && first && latest.value !== first.value
    ? +(latest.value - first.value).toFixed(1) : null

  return (
    <div>
      {/* Latest + change */}
      {latest?.value > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            {t('progress.currentWeight') || 'Current Weight'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: T.text }}>{latest.value} <span style={{ fontSize: 14, color: T.textMuted }}>kg</span></div>
            {change !== null && (
              <div style={{ fontSize: 13, fontWeight: 600, color: change > 0 ? T.red : T.green }}>
                {change > 0 ? '▲' : '▼'} {Math.abs(change)} kg {rangeLabel || ''}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: T.textMuted, marginBottom: 14 }}>
          {t('progress.noWeightYet') || 'Log your weight to start tracking your trend.'}
        </div>
      )}

      {/* Chart */}
      {weightData && weightData.some(d => d.value > 0) && (
        <div style={{ marginBottom: 14 }}>
          <LineChart data={weightData} color={T.blue} height={70} />
        </div>
      )}

      {/* Log input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" step="0.1"
          style={{ flex: 1, padding: '10px 13px', borderRadius: 12, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.text, fontSize: 16, fontWeight: 600, outline: 'none' }} />
        <button onClick={() => setUnit(u => u === 'kg' ? 'lbs' : 'kg')}
          style={{ padding: '10px 14px', borderRadius: 12, background: T.surfaceMid, border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {unit}
        </button>
        <button onClick={handleLog} disabled={saving || !weight}
          style={{ padding: '10px 18px', borderRadius: 12, background: weight ? T.purple : T.surfaceMid, color: weight ? '#fff' : T.textDim, border: 'none', fontSize: 13, fontWeight: 600, cursor: weight ? 'pointer' : 'default' }}>
          {saving ? '…' : (t('progress.addWeight') || 'Add Weight')}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main ProgressTab
// ─────────────────────────────────────────────
export default function ProgressTab({ userId, profile }) {
  const { t, lang } = useTranslation()
  const timezone  = profile?.timezone
  const [range,   setRange]   = useState(7)   // 7 or 30 days — controls chart display only
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)

  // Data
  const [calData,     setCalData]     = useState([])
  const [proteinData, setProteinData] = useState([])
  const [waterData,   setWaterData]   = useState([])
  const [workoutData, setWorkoutData] = useState([])
  const [weightData,  setWeightData]  = useState([])
  const [scoreData,   setScoreData]   = useState([]) // full 30-day score series, sliced for display
  const [loggedDates, setLoggedDates] = useState(new Set())
  const [streakDays,  setStreakDays]  = useState(0)
  const [weekSummary, setWeekSummary] = useState(null)
  const [scoreSummary,setScoreSummary]= useState(null) // { avgWeek, avgMonth, trendPct, workoutDaysThisWeek }

  const calorieGoal = profile?.calorie_goal  || 2200
  const proteinGoal = profile?.protein_goal  || 150
  const waterGoal   = profile?.water_unit === 'ml' ? (profile?.water_goal_ml || 2000) : (profile?.water_goal || 8)

  const MEAL_SLOT_IDS = ['breakfast', 'lunch', 'snack', 'dinner']

  const shortDay = (dateStr) => {
    const d    = new Date(dateStr + 'T12:00:00')
    return ['S','M','T','W','T','F','S'][d.getDay()]
  }

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId, range, refresh])

  const fetchAll = async () => {
    setLoading(true)
    // Always fetch a full 30-day window for score history — `range` only
    // controls how many of the most recent days are displayed in charts.
    const allDates = getDateRange(30, timezone)
    const dates     = allDates.slice(-range)
    const fromStr   = allDates[0]

    const [food, water, workout, weight, weightAll, medsList, medLogs, allActivity] = await Promise.all([
      supabase.from('food_logs').select('log_date,calories,protein,meal_slot').eq('user_id', userId).gte('log_date', fromStr),
      supabase.from('water_logs').select('log_date,cups,amount_ml').eq('user_id', userId).gte('log_date', fromStr),
      supabase.from('workout_logs').select('log_date,duration_minutes').eq('user_id', userId).gte('log_date', fromStr),
      supabase.from('weight_logs').select('log_date,weight_kg').eq('user_id', userId).gte('log_date', fromStr).order('log_date'),
      supabase.from('weight_logs').select('log_date,weight_kg').eq('user_id', userId).order('log_date'),
      supabase.from('medications').select('id').eq('user_id', userId).eq('active', true),
      supabase.from('medication_logs').select('log_date,medication_id,status').eq('user_id', userId).gte('log_date', fromStr),
      // For streak — all sources last 60 days
      Promise.all([
        supabase.from('food_logs').select('log_date').eq('user_id', userId).gte('log_date', (() => { const d=new Date(); d.setDate(d.getDate()-60); const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()),
        supabase.from('workout_logs').select('log_date').eq('user_id', userId).gte('log_date', (() => { const d=new Date(); d.setDate(d.getDate()-60); const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()),
        supabase.from('water_logs').select('log_date').eq('user_id', userId).gte('log_date', (() => { const d=new Date(); d.setDate(d.getDate()-60); const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()).gt('cups', 0),
        supabase.from('medication_logs').select('log_date').eq('user_id', userId).eq('status','taken').gte('log_date', (() => { const d=new Date(); d.setDate(d.getDate()-60); const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()),
      ])
    ])

    // Group food logs by date (totals) and by meal slot (for the score)
    const foodByDate    = {}
    const proteinByDate = {}
    const mealSlotsByDate = {} // date -> Set of slot ids logged
    ;(food.data || []).forEach(r => {
      foodByDate[r.log_date]    = (foodByDate[r.log_date]    || 0) + (r.calories || 0)
      proteinByDate[r.log_date] = (proteinByDate[r.log_date] || 0) + (r.protein  || 0)
      if (r.meal_slot) {
        if (!mealSlotsByDate[r.log_date]) mealSlotsByDate[r.log_date] = new Set()
        mealSlotsByDate[r.log_date].add(r.meal_slot)
      }
    })

    // Water by date
    const waterByDate = {}
    ;(water.data || []).forEach(r => {
      waterByDate[r.log_date] = profile?.water_unit === 'ml' ? (r.amount_ml || 0) : (r.cups || 0)
    })

    // Workout by date
    const workoutByDate = {}
    ;(workout.data || []).forEach(r => {
      workoutByDate[r.log_date] = (workoutByDate[r.log_date] || 0) + (r.duration_minutes || 30)
    })

    // Weight by date
    const weightByDate = {}
    ;(weightAll.data || []).forEach(r => { weightByDate[r.log_date] = r.weight_kg })

    // Medication taken-count by date (scheduled count = current active medications)
    const medsScheduledCount = (medsList.data || []).length
    const medsTakenByDate = {}
    ;(medLogs.data || []).forEach(r => {
      if (r.status === 'taken') medsTakenByDate[r.log_date] = (medsTakenByDate[r.log_date] || 0) + 1
    })

    // ── Per-day Auron Score across the full 30-day window ──
    const scoreByDate = {}
    allDates.forEach(ds => {
      const loggedMealSlotCount = mealSlotsByDate[ds]?.size || 0
      const { overallScore } = computeDayScores({
        loggedMealSlotCount, totalMealSlots: MEAL_SLOT_IDS.length,
        proteinTotal: proteinByDate[ds] || 0, proteinGoal,
        waterAmount: waterByDate[ds] || 0, waterGoal,
        workoutDone: !!workoutByDate[ds],
        hasScheduledWorkout: false, // historical schedule isn't tracked — never treat past days as a missed plan
        medsScheduledCount, medsTakenCount: medsTakenByDate[ds] || 0,
      })
      scoreByDate[ds] = overallScore
    })

    // Build chart arrays (sliced to the selected display range)
    setCalData(dates.map(ds => ({ label: shortDay(ds), value: Math.round(foodByDate[ds] || 0) })))
    setProteinData(dates.map(ds => ({ label: shortDay(ds), value: Math.round(proteinByDate[ds] || 0) })))
    setWaterData(dates.map(ds => ({ label: shortDay(ds), value: Math.round(waterByDate[ds] || 0) })))
    setWorkoutData(dates.map(ds => ({ label: shortDay(ds), value: workoutByDate[ds] || 0 })))
    setWeightData(dates.map(ds => ({ label: shortDay(ds), value: weightByDate[ds] || 0 })))
    setScoreData(dates.map(ds => ({ label: shortDay(ds), value: scoreByDate[ds] || 0 })))

    // Streak + heatmap
    const [actFood, actWorkout, actWater, actMeds] = allActivity
    const allActiveDates = new Set([
      ...(actFood.data    || []).map(r => r.log_date),
      ...(actWorkout.data || []).map(r => r.log_date),
      ...(actWater.data   || []).map(r => r.log_date),
      ...(actMeds.data    || []).map(r => r.log_date),
    ])
    setLoggedDates(allActiveDates)

    let streak = 0
    for (let i = 0; i < 60; i++) {
      const d  = new Date()
      d.setDate(d.getDate() - i)
      const ds = (() => { const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dy}` })()
      if (allActiveDates.has(ds)) streak++
      else break
    }
    setStreakDays(streak)

    // Weekly summary (last 7 real days, always — independent of chart range)
    const last7 = allDates.slice(-7)
    const avgCal   = last7.reduce((s, ds) => s + (foodByDate[ds] || 0), 0) / 7
    const daysLogged = last7.filter(ds => foodByDate[ds] > 0).length
    const totalWorkout = last7.reduce((s, ds) => s + (workoutByDate[ds] || 0), 0)
    const avgWater = last7.reduce((s, ds) => s + (waterByDate[ds] || 0), 0) / 7
    const workoutDaysThisWeek = last7.filter(ds => workoutByDate[ds] > 0).length
    setWeekSummary({ avgCal: Math.round(avgCal), daysLogged, totalWorkout, avgWater: Math.round(avgWater * 10) / 10, workoutDaysThisWeek })

    // ── Auron Score summary — this week, this month, trend vs last week ──
    const scoresLast7  = last7.map(ds => scoreByDate[ds])
    const scoresPrev7  = allDates.slice(-14, -7).map(ds => scoreByDate[ds])
    const scoresMonth  = allDates.map(ds => scoreByDate[ds])
    const avg = arr => arr.length ? Math.round(arr.reduce((s,v) => s+v, 0) / arr.length) : 0
    const avgWeek  = avg(scoresLast7)
    const avgMonth = avg(scoresMonth)
    const avgPrev  = avg(scoresPrev7)
    const trendPct = avgPrev > 0 ? Math.round(((avgWeek - avgPrev) / avgPrev) * 100) : null
    setScoreSummary({ avgWeek, avgMonth, trendPct, workoutDaysThisWeek })

    setLoading(false)
  }

  // ── Render ──────────────────────────────────
  const progressCtx = loading ? null : {
    daysLogged: weekSummary?.daysLogged ?? 0,
    streakDays,
    avgWater: weekSummary?.avgWater ?? null,
    waterGoal,
    scoreTrendPct: scoreSummary?.trendPct ?? null,
    workoutDaysThisWeek: scoreSummary?.workoutDaysThisWeek ?? null,
  }

  const rank = scoreSummary ? scoreRank(scoreSummary.avgWeek) : null

  return (
    <div style={{ paddingBottom: 8 }}>

      <TabAuronCard tab="progress" ctx={progressCtx} lang={lang} />

      {/* Header stats row — consistency-focused */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: `🔥 ${t('progress.streak') || 'Streak'}`, value: `${streakDays}d`, color: T.amber },
          { label: `✦ ${t('progress.avgScore') || 'Avg Score'}`, value: scoreSummary ? `${scoreSummary.avgWeek}` : '—', color: T.purple },
          { label: `📅 ${t('progress.daysLogged') || 'Days Logged'}`, value: weekSummary ? `${weekSummary.daysLogged}/7` : '—', color: T.green },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Range selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[[7, t('progress.days7') || '7 days'], [30, t('progress.days30') || '30 days']].map(([r, label]) => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: '7px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
            border: `1px solid ${range === r ? T.purple : T.border}`,
            background: range === r ? T.purpleLight : 'transparent',
            color: range === r ? T.purple : T.textMuted,
            fontWeight: range === r ? 600 : 400,
          }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.textMuted }}>{t('progress.loading') || 'Loading…'}</div>
      ) : (
        <>
          {/* ── Auron Score — the primary progress metric ── */}
          <Card style={{ marginBottom: 14, borderColor: T.borderStrong }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <SectionLabel>✦ {t('progress.auronScore') || 'Auron Score'}</SectionLabel>
              {rank && (
                <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, background: T.purpleLight, padding: '3px 10px', borderRadius: 20 }}>
                  {t(`score.rank.${rank.key}`) || rank.label}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: T.surfaceLight, borderRadius: 12, padding: '10px 13px' }}>
                <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 2 }}>{t('progress.avgWeek') || 'This week'}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.purple }}>{scoreSummary?.avgWeek ?? '—'}%</div>
                {scoreSummary?.trendPct != null && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: scoreSummary.trendPct > 0 ? T.green : scoreSummary.trendPct < 0 ? T.red : T.textMuted, marginTop: 2 }}>
                    {scoreSummary.trendPct > 0 ? '▲' : scoreSummary.trendPct < 0 ? '▼' : '–'} {Math.abs(scoreSummary.trendPct)}% {t('progress.vsLastWeek') || 'vs last week'}
                  </div>
                )}
              </div>
              <div style={{ background: T.surfaceLight, borderRadius: 12, padding: '10px 13px' }}>
                <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 2 }}>{t('progress.avgMonth') || 'This month'}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{scoreSummary?.avgMonth ?? '—'}%</div>
              </div>
            </div>
            <LineChart data={scoreData} color={T.purple} height={70} />
          </Card>

          {/* Calories chart */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <SectionLabel>{t('progress.calories') || 'Calories'}</SectionLabel>
              <div style={{ fontSize: 11, color: T.textMuted }}>{t('progress.goal') || 'Goal'}: {calorieGoal} kcal</div>
            </div>
            <BarChart data={calData} goal={calorieGoal} color={T.purple} height={90} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: T.textMuted }}>
              <span>{t('progress.avg') || 'Avg'}: <strong style={{ color: T.text }}>{weekSummary?.avgCal || 0} kcal</strong></span>
              <span>{t('progress.logged') || 'Logged'}: <strong style={{ color: T.text }}>{weekSummary?.daysLogged || 0}/{range} {t('progress.daysWord') || 'days'}</strong></span>
            </div>
          </Card>

          {/* Protein chart */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <SectionLabel>{t('progress.protein') || 'Protein'}</SectionLabel>
              <div style={{ fontSize: 11, color: T.textMuted }}>{t('progress.goal') || 'Goal'}: {proteinGoal}g</div>
            </div>
            <BarChart data={proteinData} goal={proteinGoal} color={T.blue} height={70} />
          </Card>

          {/* Water + Workout side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <Card>
              <SectionLabel>{t('progress.water') || 'Water'}</SectionLabel>
              <BarChart data={waterData} goal={waterGoal} color={T.blue} height={60} />
            </Card>
            <Card>
              <SectionLabel>{t('progress.workout') || 'Workout'}</SectionLabel>
              <BarChart data={workoutData} goal={60} color={T.green} height={60} />
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 8 }}>
                {weekSummary?.totalWorkout || 0} {t('progress.minTotal') || 'min total'}
              </div>
            </Card>
          </div>

          {/* Weight tracker — intentional current-weight framing */}
          <Card style={{ marginBottom: 14 }}>
            <SectionLabel>{t('progress.weight') || 'Weight'}</SectionLabel>
            <WeightLogger
              userId={userId}
              timezone={timezone}
              weightData={weightData}
              onLogged={() => setRefresh(r => r + 1)}
              rangeLabel={range === 30 ? (t('progress.thisMonth') || 'this month') : (t('progress.thisWeek') || 'this week')}
            />
          </Card>

          {/* Activity heatmap */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <SectionLabel>{t('progress.activity') || 'Activity'}</SectionLabel>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>🔥 {streakDays} {t('progress.dayStreak') || 'day streak'}</div>
            </div>
            <StreakHeatmap loggedDates={loggedDates} timezone={timezone} />
          </Card>

          {/* Weekly summary — consistency-focused metrics */}
          {weekSummary && (
            <Card>
              <SectionLabel>{t('progress.thisWeekLabel') || 'This week'}</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: '✦',  label: t('progress.avgScore') || 'Avg Score', value: `${scoreSummary?.avgWeek ?? '—'}%` },
                  { icon: '📅', label: t('progress.daysLogged') || 'Days logged', value: `${weekSummary.daysLogged} / 7` },
                  { icon: '🏋️', label: t('progress.workoutTime') || 'Workout time', value: `${weekSummary.totalWorkout} min` },
                  { icon: '💧', label: t('progress.avgWaterLabel') || 'Avg water', value: `${weekSummary.avgWater} ${profile?.water_unit || 'cups'}` },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${T.divider}` }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
