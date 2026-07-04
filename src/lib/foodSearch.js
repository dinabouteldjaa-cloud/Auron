// ─────────────────────────────────────────────────────────────
// foodSearch.js — Multi-source food search
//
// Sources (in order):
//   1. USDA FoodData Central — free, no key, 600k+ foods
//   2. Open Food Facts — open source, branded products
//   3. Local fallback DB — instant results while APIs load
// ─────────────────────────────────────────────────────────────

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'
const USDA_KEY  = 'DEMO_KEY' // free tier: 30 req/hour, 50/day. Replace with your key from https://fdc.nal.usda.gov/api-key-signup

// ── USDA FoodData Central ────────────────────────────────────
export async function searchUSDA(query, limit = 20) {
  try {
    const res = await fetch(
      `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=${limit}&api_key=${USDA_KEY}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    if (!data.foods) return []

    return data.foods.map(food => {
      const get = (name) => {
        const n = food.foodNutrients?.find(n =>
          n.nutrientName?.toLowerCase().includes(name.toLowerCase())
        )
        return Math.round(n?.value || 0)
      }
      return {
        id:     `usda_${food.fdcId}`,
        name:   food.description,
        brand:  food.brandOwner || food.brandName || '',
        cal:    get('energy'),
        p:      get('protein'),
        c:      get('carbohydrate'),
        f:      get('total lipid'),
        fiber:  get('fiber'),
        sugar:  get('sugars'),
        sodium: get('sodium'),
        serving: food.servingSize ? `${food.servingSize}${food.servingSizeUnit || 'g'}` : '100g',
        source: 'USDA',
      }
    }).filter(f => f.cal > 0)
  } catch {
    return []
  }
}

// ── Open Food Facts ──────────────────────────────────────────
export async function searchOpenFoodFacts(query, limit = 15) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}&fields=product_name,brands,nutriments,serving_size`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    if (!data.products) return []

    return data.products
      .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'])
      .map(p => ({
        id:     `off_${Math.random().toString(36).slice(2)}`,
        name:   p.product_name,
        brand:  p.brands || '',
        cal:    Math.round(p.nutriments['energy-kcal_100g'] || 0),
        p:      Math.round(p.nutriments['proteins_100g']    || 0),
        c:      Math.round(p.nutriments['carbohydrates_100g'] || 0),
        f:      Math.round(p.nutriments['fat_100g']         || 0),
        fiber:  Math.round(p.nutriments['fiber_100g']       || 0),
        sugar:  Math.round(p.nutriments['sugars_100g']      || 0),
        sodium: Math.round(p.nutriments['sodium_100g'] * 1000 || 0),
        serving: p.serving_size || '100g',
        source: 'Open Food Facts',
      }))
      .filter(f => f.cal > 0)
  } catch {
    return []
  }
}

// ── Combined search — USDA + Open Food Facts in parallel ─────
export async function searchFoods(query) {
  if (!query || query.trim().length < 2) return LOCAL_DB.slice(0, 20)

  // Run both searches in parallel, local results shown immediately
  const [usda, off] = await Promise.all([
    searchUSDA(query, 25),
    searchOpenFoodFacts(query, 15),
  ])

  // Merge: USDA first (more accurate), then branded products, deduplicate by name
  const seen  = new Set()
  const merged = []

  for (const item of [...usda, ...off]) {
    const key = item.name.toLowerCase().slice(0, 30)
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(item)
    }
  }

  // If no API results, search local DB
  if (merged.length === 0) {
    return LOCAL_DB.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20)
  }

  return merged
}

// ── Local fallback DB — common foods, instant results ────────
export const LOCAL_DB = [
  // Proteins
  { id:'l1',  name:'Chicken breast, cooked (100g)',   cal:165, p:31, c:0,  f:4,  fiber:0, sugar:0, sodium:74,  serving:'100g', source:'Local' },
  { id:'l2',  name:'Chicken thigh, cooked (100g)',    cal:209, p:26, c:0,  f:11, fiber:0, sugar:0, sodium:88,  serving:'100g', source:'Local' },
  { id:'l3',  name:'Salmon fillet (100g)',            cal:208, p:20, c:0,  f:13, fiber:0, sugar:0, sodium:59,  serving:'100g', source:'Local' },
  { id:'l4',  name:'Tuna, canned in water (100g)',    cal:116, p:26, c:0,  f:1,  fiber:0, sugar:0, sodium:320, serving:'100g', source:'Local' },
  { id:'l5',  name:'Ground beef 80% lean (100g)',     cal:254, p:17, c:0,  f:20, fiber:0, sugar:0, sodium:75,  serving:'100g', source:'Local' },
  { id:'l6',  name:'Eggs, whole (1 large)',           cal:72,  p:6,  c:0,  f:5,  fiber:0, sugar:0, sodium:71,  serving:'50g',  source:'Local' },
  { id:'l7',  name:'Egg whites (100g)',               cal:52,  p:11, c:1,  f:0,  fiber:0, sugar:1, sodium:166, serving:'100g', source:'Local' },
  { id:'l8',  name:'Shrimp, cooked (100g)',           cal:99,  p:24, c:0,  f:1,  fiber:0, sugar:0, sodium:111, serving:'100g', source:'Local' },
  { id:'l9',  name:'Turkey breast (100g)',            cal:135, p:30, c:0,  f:1,  fiber:0, sugar:0, sodium:50,  serving:'100g', source:'Local' },
  { id:'l10', name:'Whey protein shake (1 scoop)',    cal:130, p:25, c:5,  f:2,  fiber:0, sugar:3, sodium:100, serving:'30g',  source:'Local' },
  // Dairy
  { id:'l11', name:'Greek yogurt, plain (150g)',      cal:100, p:17, c:6,  f:1,  fiber:0, sugar:6, sodium:60,  serving:'150g', source:'Local' },
  { id:'l12', name:'Cottage cheese (100g)',           cal:98,  p:11, c:3,  f:4,  fiber:0, sugar:3, sodium:364, serving:'100g', source:'Local' },
  { id:'l13', name:'Whole milk (250ml)',              cal:149, p:8,  c:12, f:8,  fiber:0, sugar:12,sodium:107, serving:'250ml',source:'Local' },
  { id:'l14', name:'Skimmed milk (250ml)',            cal:83,  p:8,  c:12, f:0,  fiber:0, sugar:12,sodium:103, serving:'250ml',source:'Local' },
  { id:'l15', name:'Cheddar cheese (30g)',            cal:120, p:7,  c:0,  f:10, fiber:0, sugar:0, sodium:180, serving:'30g',  source:'Local' },
  { id:'l16', name:'Mozzarella (30g)',                cal:85,  p:6,  c:1,  f:6,  fiber:0, sugar:0, sodium:140, serving:'30g',  source:'Local' },
  // Grains
  { id:'l17', name:'Brown rice, cooked (100g)',       cal:216, p:5,  c:45, f:2,  fiber:4, sugar:0, sodium:5,   serving:'100g', source:'Local' },
  { id:'l18', name:'White rice, cooked (100g)',       cal:206, p:4,  c:45, f:0,  fiber:0, sugar:0, sodium:1,   serving:'100g', source:'Local' },
  { id:'l19', name:'Pasta, cooked (100g)',            cal:158, p:6,  c:31, f:1,  fiber:2, sugar:0, sodium:1,   serving:'100g', source:'Local' },
  { id:'l20', name:'Oats, dry (50g)',                 cal:188, p:6,  c:32, f:4,  fiber:5, sugar:1, sodium:2,   serving:'50g',  source:'Local' },
  { id:'l21', name:'Whole wheat bread (1 slice)',     cal:81,  p:4,  c:14, f:1,  fiber:2, sugar:2, sodium:146, serving:'38g',  source:'Local' },
  { id:'l22', name:'Quinoa, cooked (100g)',           cal:222, p:8,  c:39, f:4,  fiber:5, sugar:2, sodium:13,  serving:'100g', source:'Local' },
  { id:'l23', name:'Pita bread (1 piece)',            cal:165, p:5,  c:33, f:1,  fiber:1, sugar:1, sodium:322, serving:'60g',  source:'Local' },
  { id:'l24', name:'Tortilla wrap (1 medium)',        cal:146, p:4,  c:24, f:4,  fiber:2, sugar:1, sodium:286, serving:'45g',  source:'Local' },
  // Vegetables
  { id:'l25', name:'Broccoli (100g)',                 cal:34,  p:3,  c:7,  f:0,  fiber:3, sugar:2, sodium:33,  serving:'100g', source:'Local' },
  { id:'l26', name:'Spinach (100g)',                  cal:23,  p:3,  c:4,  f:0,  fiber:2, sugar:0, sodium:79,  serving:'100g', source:'Local' },
  { id:'l27', name:'Sweet potato (150g)',             cal:130, p:3,  c:30, f:0,  fiber:4, sugar:6, sodium:41,  serving:'150g', source:'Local' },
  { id:'l28', name:'Carrot (1 medium)',               cal:25,  p:1,  c:6,  f:0,  fiber:2, sugar:3, sodium:42,  serving:'61g',  source:'Local' },
  { id:'l29', name:'Mixed salad (100g)',              cal:20,  p:1,  c:3,  f:0,  fiber:2, sugar:2, sodium:20,  serving:'100g', source:'Local' },
  { id:'l30', name:'Tomato (1 medium)',               cal:22,  p:1,  c:5,  f:0,  fiber:1, sugar:3, sodium:6,   serving:'123g', source:'Local' },
  { id:'l31', name:'Cucumber (100g)',                 cal:16,  p:1,  c:4,  f:0,  fiber:1, sugar:2, sodium:2,   serving:'100g', source:'Local' },
  { id:'l32', name:'Bell pepper (1 medium)',          cal:37,  p:1,  c:9,  f:0,  fiber:3, sugar:6, sodium:5,   serving:'119g', source:'Local' },
  // Fruits
  { id:'l33', name:'Banana (1 medium)',               cal:105, p:1,  c:27, f:0,  fiber:3, sugar:14,sodium:1,   serving:'118g', source:'Local' },
  { id:'l34', name:'Apple (1 medium)',                cal:95,  p:0,  c:25, f:0,  fiber:4, sugar:19,sodium:2,   serving:'182g', source:'Local' },
  { id:'l35', name:'Orange (1 medium)',               cal:62,  p:1,  c:15, f:0,  fiber:3, sugar:12,sodium:0,   serving:'131g', source:'Local' },
  { id:'l36', name:'Strawberries (100g)',             cal:32,  p:1,  c:8,  f:0,  fiber:2, sugar:5, sodium:1,   serving:'100g', source:'Local' },
  { id:'l37', name:'Blueberries (100g)',              cal:57,  p:1,  c:14, f:0,  fiber:2, sugar:10,sodium:1,   serving:'100g', source:'Local' },
  { id:'l38', name:'Mango (100g)',                    cal:60,  p:1,  c:15, f:0,  fiber:2, sugar:14,sodium:1,   serving:'100g', source:'Local' },
  { id:'l39', name:'Dates (3 pieces)',                cal:66,  p:0,  c:18, f:0,  fiber:2, sugar:16,sodium:0,   serving:'24g',  source:'Local' },
  // Fats & nuts
  { id:'l40', name:'Avocado (half)',                  cal:120, p:1,  c:6,  f:11, fiber:5, sugar:0, sodium:5,   serving:'68g',  source:'Local' },
  { id:'l41', name:'Almonds (30g)',                   cal:174, p:6,  c:6,  f:15, fiber:4, sugar:1, sodium:0,   serving:'30g',  source:'Local' },
  { id:'l42', name:'Walnuts (30g)',                   cal:196, p:5,  c:4,  f:20, fiber:2, sugar:1, sodium:1,   serving:'30g',  source:'Local' },
  { id:'l43', name:'Peanut butter (2 tbsp)',          cal:188, p:8,  c:6,  f:16, fiber:2, sugar:3, sodium:152, serving:'32g',  source:'Local' },
  { id:'l44', name:'Olive oil (1 tbsp)',              cal:119, p:0,  c:0,  f:14, fiber:0, sugar:0, sodium:0,   serving:'14g',  source:'Local' },
  { id:'l45', name:'Pumpkin seeds (30g)',             cal:163, p:8,  c:4,  f:14, fiber:2, sugar:0, sodium:5,   serving:'30g',  source:'Local' },
  // Legumes
  { id:'l46', name:'Lentils, cooked (100g)',          cal:116, p:9,  c:20, f:0,  fiber:8, sugar:2, sodium:2,   serving:'100g', source:'Local' },
  { id:'l47', name:'Chickpeas, cooked (100g)',        cal:164, p:9,  c:27, f:3,  fiber:8, sugar:5, sodium:7,   serving:'100g', source:'Local' },
  { id:'l48', name:'Black beans, cooked (100g)',      cal:132, p:9,  c:24, f:1,  fiber:9, sugar:0, sodium:1,   serving:'100g', source:'Local' },
  { id:'l49', name:'Edamame (100g)',                  cal:122, p:11, c:10, f:5,  fiber:5, sugar:2, sodium:6,   serving:'100g', source:'Local' },
  // Common meals
  { id:'l50', name:'Hummus (2 tbsp)',                 cal:70,  p:2,  c:6,  f:5,  fiber:2, sugar:0, sodium:142, serving:'30g',  source:'Local' },
  { id:'l51', name:'Scrambled eggs (2 eggs)',         cal:182, p:12, c:2,  f:14, fiber:0, sugar:1, sodium:342, serving:'110g', source:'Local' },
  { id:'l52', name:'Grilled cheese sandwich',        cal:290, p:11, c:30, f:15, fiber:2, sugar:4, sodium:540, serving:'150g', source:'Local' },
  { id:'l53', name:'Caesar salad (200g)',             cal:280, p:8,  c:12, f:24, fiber:2, sugar:3, sodium:580, serving:'200g', source:'Local' },
  { id:'l54', name:'Spaghetti bolognese (300g)',      cal:420, p:22, c:52, f:12, fiber:4, sugar:6, sodium:480, serving:'300g', source:'Local' },
  { id:'l55', name:'Pizza margherita (1 slice)',      cal:272, p:11, c:33, f:10, fiber:2, sugar:4, sodium:551, serving:'107g', source:'Local' },
  { id:'l56', name:'Cheeseburger (1 medium)',         cal:535, p:27, c:40, f:29, fiber:2, sugar:8, sodium:791, serving:'200g', source:'Local' },
  { id:'l57', name:'Grilled chicken salad',          cal:300, p:35, c:15, f:10, fiber:4, sugar:5, sodium:480, serving:'300g', source:'Local' },
  // Middle Eastern / Arabic foods
  { id:'l58', name:'Shawarma wrap (chicken)',         cal:430, p:28, c:42, f:16, fiber:3, sugar:4, sodium:820, serving:'250g', source:'Local' },
  { id:'l59', name:'Falafel (3 pieces)',              cal:222, p:9,  c:22, f:12, fiber:5, sugar:2, sodium:390, serving:'90g',  source:'Local' },
  { id:'l60', name:'Tabouleh (100g)',                 cal:107, p:2,  c:12, f:6,  fiber:3, sugar:2, sodium:180, serving:'100g', source:'Local' },
  { id:'l61', name:'Fattoush salad (200g)',           cal:160, p:3,  c:22, f:7,  fiber:4, sugar:5, sodium:380, serving:'200g', source:'Local' },
  { id:'l62', name:'Mansaf with rice (350g)',         cal:580, p:32, c:62, f:20, fiber:2, sugar:3, sodium:620, serving:'350g', source:'Local' },
  { id:'l63', name:'Labneh (2 tbsp)',                 cal:60,  p:4,  c:3,  f:4,  fiber:0, sugar:2, sodium:200, serving:'30g',  source:'Local' },
  { id:'l64', name:'Pita with hummus (1 serving)',   cal:260, p:8,  c:38, f:9,  fiber:5, sugar:1, sodium:480, serving:'130g', source:'Local' },
  { id:'l65', name:'Kabsa with chicken (400g)',       cal:650, p:38, c:70, f:20, fiber:4, sugar:4, sodium:720, serving:'400g', source:'Local' },
  // Drinks
  { id:'l66', name:'Coffee, black (240ml)',           cal:2,   p:0,  c:0,  f:0,  fiber:0, sugar:0, sodium:5,   serving:'240ml',source:'Local' },
  { id:'l67', name:'Coffee with milk (240ml)',        cal:60,  p:3,  c:6,  f:2,  fiber:0, sugar:6, sodium:50,  serving:'240ml',source:'Local' },
  { id:'l68', name:'Orange juice (250ml)',            cal:112, p:2,  c:26, f:0,  fiber:0, sugar:21,sodium:2,   serving:'250ml',source:'Local' },
  { id:'l69', name:'Protein shake (ready-made)',      cal:160, p:30, c:8,  f:2,  fiber:1, sugar:4, sodium:180, serving:'330ml',source:'Local' },
  { id:'l70', name:'Latte (grande, 2% milk)',         cal:190, p:13, c:19, f:7,  fiber:0, sugar:18,sodium:170, serving:'480ml',source:'Local' },
]
