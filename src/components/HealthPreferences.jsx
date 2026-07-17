import { useState, useEffect } from 'react'
import { useTranslation } from '../lib/i18n.jsx'
import { T } from '../lib/theme'

const C = {
  gold:         T.purple,
  goldLight:    T.purpleLight,
  goldDark:     T.purpleDark,
  dark:         T.pageBg,
  surface:      T.surface,
  surfaceLight: T.surfaceMid,
  border:       T.border,
  borderStrong: T.borderStrong,
  text:         T.text,
  textMuted:    T.textMuted,
  textDim:      T.textDim,
  green:        T.green,
  greenLight:   T.greenLight,
  red:          T.red,
  amber:        T.amber,
}

// ─────────────────────────────────────────────
// Static option sets
// ─────────────────────────────────────────────
const DIETARY_OPTIONS = [
  'Halal',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Mediterranean',
]

const ALLERGY_OPTIONS = [
  'Nuts',
  'Dairy',
  'Gluten',
  'Shellfish',
  'Eggs',
  'Soy',
]

const RESTRICTION_OPTIONS = [
  'Low sodium',
  'Low sugar',
  'Lactose-free',
  'Gluten-free',
  'Avoid spicy food',
  'Soft foods',
  'High protein',
  'Low fat',
  'High fiber',
]

const COMMON_AVOIDED_FOODS = [
  'Cheese', 'Milk', 'Yogurt', 'Red meat', 'Chicken',
  'Fish', 'Eggs', 'Bread', 'Rice', 'Pasta',
  'Onions', 'Garlic', 'Tomatoes',
]

// Stored as a comma-joined string in the existing `cuisine_preference`
// column (no DB migration needed) but always worked with as an array in
// the UI. Tolerates the old single-cuisine string shape too.
function parseCuisines(stored) {
  if (!stored) return []
  return stored.split(',').map(s => s.trim()).filter(Boolean)
}

const CUISINE_OPTIONS = [
  'Algerian', 'Moroccan', 'Tunisian', 'Middle Eastern',
  'Mediterranean', 'Indian', 'Asian', 'Italian', 'Mexican', 'American',
]

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, color: C.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        marginBottom: 12,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 16,
      border: `1px solid ${C.border}`, padding: '16px 18px',
      ...style,
    }}>
      {children}
    </div>
  )
}

// Multi-select chip grid
function ChipGroup({ options, selected = [], onChange, allowCustom = false, customLabel = 'Other' }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom]   = useState(false)

  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    onChange(next)
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed || selected.includes(trimmed)) { setCustomInput(''); return }
    onChange([...selected, trimmed])
    setCustomInput('')
    setShowCustom(false)
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13,
              border: `1px solid ${active ? C.gold : C.border}`,
              background: active ? C.goldLight : 'transparent',
              color: active ? C.gold : C.textMuted,
              transition: 'all 0.15s', cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        )
      })}

      {/* Custom chip that's already been added */}
      {selected
        .filter(v => !options.includes(v))
        .map(v => (
          <button
            key={v}
            onClick={() => toggle(v)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13,
              border: `1px solid ${C.gold}`,
              background: C.goldLight, color: C.gold,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {v}
            <span style={{ fontSize: 15, lineHeight: 1, color: C.goldDark }}>×</span>
          </button>
        ))
      }

      {/* Other / Add custom button */}
      {allowCustom && !showCustom && (
        <button
          onClick={() => setShowCustom(true)}
          style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 13,
            border: `1px dashed ${C.border}`, background: 'transparent',
            color: C.textMuted, cursor: 'pointer',
          }}
        >
          + {customLabel}
        </button>
      )}

      {allowCustom && showCustom && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%', marginTop: 4 }}>
          <input
            autoFocus
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') setShowCustom(false) }}
            placeholder={`Type and press Enter`}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              background: C.surfaceLight, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={addCustom}
            style={{ padding: '8px 14px', borderRadius: 10, background: C.gold, color: C.dark, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Add
          </button>
          <button
            onClick={() => { setShowCustom(false); setCustomInput('') }}
            style={{ padding: '8px 10px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// Single-select cuisine picker — "General" (empty) + presets + custom text
function CuisineSelect({ value, onChange, generalLabel, otherLabel, placeholder }) {
  // `value` is now an array of selected cuisines (possibly including custom
  // ones typed by the user). Empty array = "no preference" / general.
  const selected = Array.isArray(value) ? value : (value ? [value] : []) // tolerate old single-string shape during migration
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom]   = useState(false)

  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(c => c !== opt))
    else onChange([...selected, opt])
  }
  const clearAll = () => onChange([])

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed || selected.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) return
    onChange([...selected, trimmed])
    setCustomInput('')
    setShowCustom(false)
  }

  const customSelected = selected.filter(c => !CUISINE_OPTIONS.includes(c))

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: showCustom ? 10 : 0 }}>
        <button
          onClick={clearAll}
          style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 13,
            border: `1px solid ${selected.length === 0 ? C.gold : C.border}`,
            background: selected.length === 0 ? C.goldLight : 'transparent',
            color: selected.length === 0 ? C.gold : C.textMuted,
            transition: 'all 0.15s', cursor: 'pointer',
          }}
        >
          {generalLabel}
        </button>

        {CUISINE_OPTIONS.map(opt => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13,
                border: `1px solid ${active ? C.gold : C.border}`,
                background: active ? C.goldLight : 'transparent',
                color: active ? C.gold : C.textMuted,
                transition: 'all 0.15s', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {active && '✓'} {opt}
            </button>
          )
        })}

        {/* Custom cuisines already added, shown as removable chips */}
        {customSelected.map(c => (
          <button key={c} onClick={() => toggle(c)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13,
              border: `1px solid ${C.gold}`, background: C.goldLight, color: C.gold,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            ✓ {c} ×
          </button>
        ))}

        {!showCustom && (
          <button
            onClick={() => setShowCustom(true)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13,
              border: `1px dashed ${C.border}`, background: 'transparent',
              color: C.textMuted, cursor: 'pointer',
            }}
          >
            + {otherLabel}
          </button>
        )}
      </div>

      {showCustom && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            autoFocus
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') setShowCustom(false) }}
            placeholder={placeholder}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              background: C.surfaceLight, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={addCustom}
            style={{ padding: '8px 14px', borderRadius: 10, background: C.gold, color: C.dark, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            ✓
          </button>
          <button
            onClick={() => { setShowCustom(false); setCustomInput('') }}
            style={{ padding: '8px 10px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

// Avoided foods — separate component, supports both quick-add from common list and free input
function AvoidedFoodsEditor({ foods = [], onChange }) {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput]   = useState(false)

  const removeFood = (food) => onChange(foods.filter(f => f !== food))

  const addFood = (food) => {
    const trimmed = food.trim()
    if (!trimmed || foods.map(f => f.toLowerCase()).includes(trimmed.toLowerCase())) return
    onChange([...foods, trimmed])
    setInputValue('')
    setShowInput(false)
  }

  return (
    <div>
      {/* Current avoided foods as removable chips */}
      {foods.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {foods.map(food => (
            <div
              key={food}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20, fontSize: 13,
                background: C.surfaceLight, border: `1px solid ${C.border}`,
                color: C.text,
              }}
            >
              {food}
              <button
                onClick={() => removeFood(food)}
                style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 16, lineHeight: 1, cursor: 'pointer', padding: 0 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Common foods quick-add */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>Quick add:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {COMMON_AVOIDED_FOODS
            .filter(f => !foods.map(x => x.toLowerCase()).includes(f.toLowerCase()))
            .map(food => (
              <button
                key={food}
                onClick={() => addFood(food)}
                style={{
                  padding: '5px 12px', borderRadius: 16, fontSize: 12,
                  border: `1px solid ${C.border}`, background: 'transparent',
                  color: C.textMuted, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted }}
              >
                + {food}
              </button>
            ))
          }
        </div>
      </div>

      {/* Custom input */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 13,
            border: `1px dashed ${C.border}`, background: 'transparent',
            color: C.textMuted, cursor: 'pointer',
          }}
        >
          + Add custom food
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addFood(inputValue); if (e.key === 'Escape') setShowInput(false) }}
            placeholder="Type a food name..."
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              background: C.surfaceLight, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={() => addFood(inputValue)}
            style={{ padding: '8px 14px', borderRadius: 10, background: C.gold, color: C.dark, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Add
          </button>
          <button
            onClick={() => { setShowInput(false); setInputValue('') }}
            style={{ padding: '8px 10px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main HealthPreferences component
// ─────────────────────────────────────────────
export default function HealthPreferences({ preferences = {}, onSave, saving = false, saved = false }) {
  const { t } = useTranslation()
  const [dietary,      setDietary]      = useState(preferences.dietary_preferences  || [])
  const [allergies,    setAllergies]    = useState(preferences.allergies             || [])
  const [restrictions, setRestrictions] = useState(preferences.food_restrictions    || [])
  const [avoidedFoods, setAvoidedFoods] = useState(preferences.avoided_foods        || [])
  const [healthNotes,  setHealthNotes]  = useState(preferences.health_notes         || '')
  const [cuisine,      setCuisine]      = useState(parseCuisines(preferences.cuisine_preference))
  const [allergyOther, setAllergyOther] = useState(
    (preferences.allergies || []).filter(a => !ALLERGY_OPTIONS.includes(a))
  )

  // Sync if preferences prop changes (e.g. loaded from DB after mount)
  useEffect(() => {
    setDietary(preferences.dietary_preferences  || [])
    setAllergies(preferences.allergies          || [])
    setRestrictions(preferences.food_restrictions || [])
    setAvoidedFoods(preferences.avoided_foods   || [])
    setHealthNotes(preferences.health_notes     || '')
    setCuisine(parseCuisines(preferences.cuisine_preference))
  }, [preferences.updated_at]) // only re-sync on actual DB update

  const handleSave = () => {
    onSave({
      dietary_preferences:  dietary,
      allergies:            allergies,
      food_restrictions:    restrictions,
      avoided_foods:        avoidedFoods,
      health_notes:         healthNotes,
      cuisine_preference:   cuisine.join(', '),
    })
  }

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>
        Health &amp; Food Preferences
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.5 }}>
        Your preferences guide Auron's meal suggestions and coaching.
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '12px 14px', borderRadius: 12, marginBottom: 24,
        background: 'rgba(201,168,76,0.06)',
        border: `1px solid rgba(201,168,76,0.2)`,
      }}>
        <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Wellness guidance only
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          Auron provides wellness support and informational guidance only. Always follow the advice of your healthcare professionals.
        </div>
      </div>

      {/* Dietary Preferences */}
      <Section title="Dietary preferences">
        <Card>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Select all that apply. Meal suggestions will respect your dietary choices.
          </div>
          <ChipGroup
            options={DIETARY_OPTIONS}
            selected={dietary}
            onChange={setDietary}
          />
        </Card>
      </Section>

      {/* Cuisine preference */}
      <Section title={t('health.cuisineTitle')}>
        <Card>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            {t('health.cuisineDesc')}
          </div>
          <CuisineSelect
            value={cuisine}
            onChange={setCuisine}
            generalLabel={t('health.cuisineGeneral')}
            otherLabel={t('health.cuisineOther')}
            placeholder={t('health.cuisinePlaceholder')}
          />
        </Card>
      </Section>

      {/* Allergies */}
      <Section title="Allergies">
        <Card>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Auron will never suggest meals containing your listed allergens.
          </div>
          <ChipGroup
            options={ALLERGY_OPTIONS}
            selected={allergies}
            onChange={setAllergies}
            allowCustom
            customLabel="Other allergy"
          />
        </Card>
      </Section>

      {/* Food Restrictions */}
      <Section title="Food restrictions">
        <Card>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Dietary guidelines that Auron will follow in suggestions.
          </div>
          <ChipGroup
            options={RESTRICTION_OPTIONS}
            selected={restrictions}
            onChange={setRestrictions}
          />
        </Card>
      </Section>

      {/* Foods I Avoid */}
      <Section title="Foods I avoid">
        <Card>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
            Specific foods you don't want in any meal recommendation.
          </div>
          <AvoidedFoodsEditor
            foods={avoidedFoods}
            onChange={setAvoidedFoods}
          />
        </Card>
      </Section>

      {/* Health Notes */}
      <Section title="Personal health notes">
        <Card>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            Optional. Notes for yourself about your health or dietary context.
          </div>
          <textarea
            value={healthNotes}
            onChange={e => setHealthNotes(e.target.value)}
            placeholder="e.g. I'm managing high blood pressure. My doctor recommends low sodium."
            rows={4}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              background: C.surfaceLight, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, resize: 'vertical',
              outline: 'none', lineHeight: 1.6, fontFamily: 'inherit',
            }}
          />
          {/* Inline disclaimer under health notes */}
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 8, lineHeight: 1.5 }}>
            Auron does not provide medical advice. These notes are for your personal reference only.
          </div>
        </Card>
      </Section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%', padding: '13px', borderRadius: 24,
          background: saving ? C.surfaceLight : C.gold,
          color: saving ? C.textMuted : C.dark,
          border: 'none', fontSize: 14, fontWeight: 600,
          cursor: saving ? 'default' : 'pointer',
          opacity: saving ? 0.7 : 1,
          marginBottom: 8,
        }}
      >
        {saving ? t('health.saving') : saved ? t('health.saved') : t('health.save')}
      </button>

      {/* Summary of active preferences — shown when at least one is set */}
      {(dietary.length > 0 || allergies.length > 0 || restrictions.length > 0 || avoidedFoods.length > 0 || cuisine) && (
        <div style={{
          marginTop: 12, padding: '12px 16px', borderRadius: 12,
          background: C.surfaceLight, border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Active preferences
          </div>
          {cuisine && (
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
              <span style={{ color: C.gold }}>{t('health.cuisineTitle')}:</span> {cuisine}
            </div>
          )}
          {dietary.length > 0 && (
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
              <span style={{ color: C.gold }}>Diet:</span> {dietary.join(', ')}
            </div>
          )}
          {allergies.length > 0 && (
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
              <span style={{ color: C.red }}>Allergies:</span> {allergies.join(', ')}
            </div>
          )}
          {restrictions.length > 0 && (
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
              <span style={{ color: C.amber }}>Restrictions:</span> {restrictions.join(', ')}
            </div>
          )}
          {avoidedFoods.length > 0 && (
            <div style={{ fontSize: 12, color: C.textMuted }}>
              <span style={{ color: C.textMuted }}>Avoided:</span> {avoidedFoods.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
