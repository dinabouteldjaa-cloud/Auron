import { useState } from 'react'
import { useMedications } from '../hooks/useMedications'

const T = {
  surface:      '#FFFFFF',
  surfaceMid:   '#ECEAF8',
  surfaceLight: '#F5F4FC',
  purple:       '#6C5CE7',
  purpleLight:  'rgba(108,92,231,0.12)',
  purpleMid:    'rgba(108,92,231,0.25)',
  purpleDark:   '#4B3FC7',
  green:        '#2ECC71',
  greenLight:   'rgba(46,204,113,0.12)',
  red:          '#E05252',
  redLight:     'rgba(224,82,82,0.12)',
  amber:        '#F5A623',
  amberLight:   'rgba(245,166,35,0.12)',
  text:         '#1A1A2E',
  textMuted:    '#7A7A9A',
  textDim:      '#ADADC8',
  border:       'rgba(108,92,231,0.12)',
  borderStrong: 'rgba(108,92,231,0.28)',
  divider:      '#EBEBF5',
  shadowCard:   '0 1px 8px rgba(26,26,46,0.06)',
  shadowStrong: '0 4px 24px rgba(108,92,231,0.18)',
}

const FREQ_LABELS = {
  daily:       'Once daily',
  twice_daily: 'Twice daily',
  weekly:      'Once a week',
  as_needed:   'As needed',
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.divider}`, boxShadow: T.shadowCard, padding: '16px 18px', ...style }}>
      {children}
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    taken:   { bg: T.greenLight, color: T.green,    label: 'Taken ✓'   },
    missed:  { bg: T.redLight,   color: T.red,      label: 'Missed'     },
    pending: { bg: T.purpleLight,color: T.purple,   label: 'Pending'    },
    skipped: { bg: T.amberLight, color: T.amber,    label: 'Skipped'    },
  }[status] || { bg: T.purpleLight, color: T.purple, label: 'Pending' }

  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────
// Add / Edit Medication Modal
// ─────────────────────────────────────────────
function MedModal({ med, onSave, onClose }) {
  const [form, setForm] = useState({
    medication_name: med?.medication_name || '',
    dosage:          med?.dosage          || '',
    frequency:       med?.frequency       || 'daily',
    reminder_time:   med?.reminder_time   || '',
    notes:           med?.notes           || '',
    start_date:      med?.start_date      || new Date().toISOString().split('T')[0],
    end_date:        med?.end_date        || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = key => val => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    if (!form.medication_name.trim()) { setError('Medication name is required.'); return }
    setSaving(true); setError('')
    const { error } = await onSave({
      medication_name: form.medication_name.trim(),
      dosage:          form.dosage.trim(),
      frequency:       form.frequency,
      reminder_time:   form.reminder_time || null,
      notes:           form.notes.trim(),
      start_date:      form.start_date || null,
      end_date:        form.end_date || null,
    })
    if (error) { setError(error.message); setSaving(false) }
    else onClose()
  }

  const inputStyle = {
    width: '100%', padding: '10px 13px', borderRadius: 11,
    background: T.surfaceMid, border: `1px solid ${T.border}`,
    color: T.text, fontSize: 14, outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '22px 22px 0 0', padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: T.shadowStrong }}>

        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: '0 auto 20px' }} />

        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>
          {med ? 'Edit medication' : 'Add medication'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Medication name *</div>
            <input value={form.medication_name} onChange={e => set('medication_name')(e.target.value)} placeholder="e.g. Vitamin D3" style={inputStyle} />
          </div>

          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Dose</div>
            <input value={form.dosage} onChange={e => set('dosage')(e.target.value)} placeholder="e.g. 1000 IU, 2 tablets" style={inputStyle} />
          </div>

          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, fontWeight: 500 }}>Frequency</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(FREQ_LABELS).map(([val, label]) => (
                <button key={val} onClick={() => set('frequency')(val)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  border: `1px solid ${form.frequency === val ? T.purple : T.border}`,
                  background: form.frequency === val ? T.purpleLight : 'transparent',
                  color: form.frequency === val ? T.purple : T.textMuted,
                  transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Reminder time</div>
            <input type="time" value={form.reminder_time} onChange={e => set('reminder_time')(e.target.value)} style={{ ...inputStyle, colorScheme: 'light' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Start date</div>
              <input type="date" value={form.start_date} onChange={e => set('start_date')(e.target.value)} style={{ ...inputStyle, colorScheme: 'light' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>End date (optional)</div>
              <input type="date" value={form.end_date} onChange={e => set('end_date')(e.target.value)} style={{ ...inputStyle, colorScheme: 'light' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Notes</div>
            <textarea value={form.notes} onChange={e => set('notes')(e.target.value)} rows={3} placeholder="Any notes about this medication..." style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>

        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6, margin: '16px 0', padding: '10px 12px', background: T.surfaceMid, borderRadius: 10 }}>
          Auron provides wellness support only. Always follow your healthcare provider's advice regarding medications.
        </div>

        {error && (
          <div style={{ fontSize: 13, color: T.red, marginBottom: 12, padding: '10px 13px', borderRadius: 10, background: T.redLight }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: 13, borderRadius: 24, background: saving ? T.surfaceMid : T.purple, color: saving ? T.textMuted : '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}
        >
          {saving ? 'Saving...' : med ? 'Save changes' : 'Add medication'}
        </button>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Medication row card
// ─────────────────────────────────────────────
function MedCard({ med, status, onMarkTaken, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const isTaken = status === 'taken'

  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: isTaken ? T.greenLight : T.purpleLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          💊
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{med.medication_name}</div>
            <StatusBadge status={status} />
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
            {med.dosage && <span>{med.dosage} · </span>}
            {FREQ_LABELS[med.frequency] || med.frequency}
            {med.reminder_time && <span> · {med.reminder_time.slice(0,5)}</span>}
          </div>
          {med.notes && (
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontStyle: 'italic' }}>{med.notes}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={() => onMarkTaken(med.id, med.reminder_time)}
          style={{
            flex: 1, padding: '9px', borderRadius: 12,
            background: isTaken ? T.greenLight : T.purple,
            color: isTaken ? T.green : '#fff',
            border: `1px solid ${isTaken ? T.green + '44' : 'transparent'}`,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isTaken ? '✓ Taken' : 'Mark as taken'}
        </button>

        <button onClick={() => onEdit(med)} style={{ padding: '9px 14px', borderRadius: 12, background: T.surfaceMid, border: 'none', color: T.textMuted, fontSize: 13, cursor: 'pointer' }}>
          Edit
        </button>

        {!confirming ? (
          <button onClick={() => setConfirming(true)} style={{ padding: '9px 14px', borderRadius: 12, background: 'transparent', border: `1px solid ${T.border}`, color: T.red, fontSize: 13, cursor: 'pointer' }}>
            ✕
          </button>
        ) : (
          <button onClick={() => { onDelete(med.id); setConfirming(false) }} style={{ padding: '9px 14px', borderRadius: 12, background: T.redLight, border: `1px solid ${T.red}33`, color: T.red, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Confirm
          </button>
        )}
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Main MedicationTab
// ─────────────────────────────────────────────
export default function MedicationTab({ userId }) {
  const {
    medications, loading,
    addMedication, updateMedication, deleteMedication, markTaken,
    getStatusForMed, takenCount, missedCount, nextMed,
  } = useMedications(userId)

  const [modal,   setModal]   = useState(false)  // false | 'add' | med object
  const [section, setSection] = useState('today') // today | all

  const today = new Date().toISOString().split('T')[0]

  const handleSave = async (data) => {
    if (modal === 'add') return addMedication(data)
    return updateMedication(modal.id, data)
  }

  // Summary stats
  const totalActive = medications.length
  const pendingCount = medications.filter(m => getStatusForMed(m.id) === 'pending').length

  return (
    <div>

      {/* ── Summary row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Taken today',  value: takenCount,   color: T.green,  bg: T.greenLight  },
          { label: 'Pending',      value: pendingCount, color: T.purple, bg: T.purpleLight },
          { label: 'Missed',       value: missedCount,  color: T.red,    bg: T.redLight    },
        ].map(item => (
          <div key={item.label} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.divider}`, boxShadow: T.shadowCard, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ── Next up card ── */}
      {nextMed && (
        <div style={{
          background: `linear-gradient(135deg, ${T.purpleLight}, rgba(108,92,231,0.05))`,
          border: `1px solid ${T.border}`,
          borderRadius: 16, padding: '14px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: T.purple, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>⏰ Next up</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{nextMed.medication_name}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              {nextMed.dosage && `${nextMed.dosage} · `}
              {nextMed.reminder_time ? nextMed.reminder_time.slice(0, 5) : 'No time set'}
            </div>
          </div>
          <button
            onClick={() => markTaken(nextMed.id, nextMed.reminder_time)}
            style={{ padding: '9px 16px', borderRadius: 20, background: T.purple, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Mark taken
          </button>
        </div>
      )}

      {/* ── Section tabs + Add button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['today', "Today's meds"], ['all', 'All medications']].map(([id, label]) => (
            <button key={id} onClick={() => setSection(id)} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              border: `1px solid ${section === id ? T.purple : T.border}`,
              background: section === id ? T.purpleLight : 'transparent',
              color: section === id ? T.purple : T.textMuted,
              fontWeight: section === id ? 600 : 400,
            }}>
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModal('add')}
          style={{ padding: '8px 16px', borderRadius: 20, background: T.purple, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          + Add
        </button>
      </div>

      {/* ── Medication list ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.textMuted }}>Loading...</div>
      ) : medications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: T.surface, borderRadius: 18, border: `1px dashed ${T.border}` }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💊</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>No medications yet</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Tap "Add" to log your first medication.</div>
          <button onClick={() => setModal('add')} style={{ padding: '10px 24px', borderRadius: 24, background: T.purple, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Add medication
          </button>
        </div>
      ) : (
        <div>
          {/* Today view — show all active meds with their today status */}
          {section === 'today' && medications.map(med => (
            <MedCard
              key={med.id}
              med={med}
              status={getStatusForMed(med.id)}
              onMarkTaken={markTaken}
              onEdit={m => setModal(m)}
              onDelete={deleteMedication}
            />
          ))}

          {/* All view — same list, different label */}
          {section === 'all' && (
            <>
              {medications.map(med => (
                <MedCard
                  key={med.id}
                  med={med}
                  status={getStatusForMed(med.id)}
                  onMarkTaken={markTaken}
                  onEdit={m => setModal(m)}
                  onDelete={deleteMedication}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: T.textDim, marginTop: 20, lineHeight: 1.6, textAlign: 'center' }}>
        Auron provides wellness support and informational guidance only.<br />
        Always follow the advice of your healthcare professionals.
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <MedModal
          med={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(false)}
        />
      )}

    </div>
  )
}
