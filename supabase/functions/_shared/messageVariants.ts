// supabase/functions/_shared/messageVariants.ts
//
// Shared by every reminder Edge Function to pick which of a category's
// 3 message variants to use. This file ONLY affects wording — it has
// no bearing on whether, when, or to whom a notification is sent.
// Every trigger condition, cron schedule, dedup key, and rollback
// behavior in each function is completely unaffected by this module.
//
// Rotation, not randomness: the variant is derived from the user's
// local calendar date (already computed by every function for its
// dedup key), plus a small per-user offset. Since the date advances by
// exactly one day between any two real sends of the same reminder
// type, the picked index also advances by exactly one position each
// time — guaranteeing the SAME variant can never appear on two
// consecutive days for a given user, without storing any extra state
// or using Math.random anywhere.

// Small, stable string hash (djb2) — deterministic, not random. Only
// used to give each user a different (but fixed) starting offset in
// the rotation, so not every user sees the same variant on the same day.
function stableHash(seed: string): number {
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

// dateStr must be "YYYY-MM-DD" (the local date already computed by the
// calling function). seed is typically the user id, so different users
// don't all land on the same variant on the same calendar day.
export function pickVariantForDate<T>(dateStr: string, seed: string, variants: T[]): T {
  const epochDay = Math.floor(Date.parse(dateStr + 'T00:00:00Z') / 86400000)
  const offset = stableHash(seed) % variants.length
  const idx = ((epochDay + offset) % variants.length + variants.length) % variants.length
  return variants[idx]
}

type Entry = { title: string; body: string | ((arg: string) => string) }

// Renders a variant entry's body, filling in the dynamic part (a
// medication/workout name, remaining calories, etc.) only for the
// variants that actually use one — some variants are static text.
export function renderBody(entry: Entry, arg = ''): string {
  return typeof entry.body === 'function' ? entry.body(arg) : entry.body
}

// ── Message variants — wording only, copied verbatim from spec ─────

export const MEDICATION_VARIANTS: Entry[] = [
  { title: 'Quick reminder 💊', body: (name) => `Time for your ${name}. Take care of yourself 💜` },
  { title: 'Tiny health check ✨', body: (name) => `Your ${name} is due. Future you says thanks!` },
  { title: 'Auron remembered 👀', body: (name) => `Time for ${name}. I've got the remembering part covered 😌` },
]

export const SCHEDULED_WORKOUT_VARIANTS: Entry[] = [
  { title: "You've got this 💪", body: (name) => `${name} is ready. Let's make it count!` },
  { title: "It's go time 🔥", body: (name) => `Your ${name} session is waiting. Let's get after it!` },
  { title: 'Sooo… about that workout 👀', body: (name) => `${name} is calling your name. Pretending you didn't see this is also cardio, right? 😭` },
]

export const INACTIVITY_3_VARIANTS: Entry[] = [
  { title: 'Ready for a comeback? 💪', body: "It's been a few days. Even a short workout today is a win!" },
  { title: "Let's get moving 🔥", body: 'No need to go crazy—one good session is all it takes to restart the momentum.' },
  { title: 'Auron checking in… 👀', body: 'The weights are starting to wonder where you went 😭 Ready for a comeback?' },
]

export const INACTIVITY_7_VARIANTS: Entry[] = [
  { title: 'Fresh start? 💜', body: 'Forget the missed days. One workout today is all that matters.' },
  { title: 'Your comeback starts here 💪', body: "A week off happens. Let's get the momentum going again!" },
  { title: "Okay… it's been a minute 😭", body: 'No judgment. Your workout gear might be getting lonely though 👀' },
]

export const HYDRATION_VARIANTS: Entry[] = [
  { title: 'Water check 💧', body: (x) => `You've got ${x} L to go today. Keep sipping!` },
  { title: 'Hydration time 💦', body: "A little more water and you're closer to your goal. You've got this!" },
  { title: 'Your water bottle called 📞💧', body: (x) => `Apparently you've been ignoring it 👀 You've still got ${x} L to go!` },
]

// arg = the already-built "remaining targets" phrase, e.g.
// "450 calories and 25g of protein" or just "25g of protein".
export const NUTRITION_PROGRESS_VARIANTS: Entry[] = [
  { title: 'Finish strong 🍽️', body: (rem) => `You've got ${rem} left today. You're almost there!` },
  { title: 'Fuel check ⚡', body: (rem) => `Still a little short on ${rem}. Give your body the fuel it needs!` },
  { title: 'Your macros are looking for you 👀', body: (rem) => `You've still got ${rem} to go. Let's finish strong 💪` },
]

export const NO_FOOD_LOGGED_VARIANTS: Entry[] = [
  { title: "How's nutrition going? 🥗", body: 'Nothing logged today yet. Add your meals when you get a chance!' },
  { title: 'Quick food check 🍽️', body: "Haven't logged anything today? Take a second to catch Auron up." },
  { title: 'You ate today… right? 👀', body: "Auron's food log is looking suspiciously empty 😭 Add your meals when you can!" },
]
