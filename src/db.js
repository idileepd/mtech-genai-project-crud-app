// In-memory store for the fruit market. No auth, no database —
// pure fake JSON data with full CRUD support.

let nextId = 1000;

const products = [
  { id: 1, name: "Alphonso Mango", category: "fruit", price: 4.99, unit: "kg", stock: 120, origin: "India", emoji: "🥭", inSeason: true },
  { id: 2, name: "Hass Avocado", category: "fruit", price: 1.25, unit: "each", stock: 200, origin: "Mexico", emoji: "🥑", inSeason: true },
  { id: 3, name: "Cavendish Banana", category: "fruit", price: 0.79, unit: "kg", stock: 340, origin: "Ecuador", emoji: "🍌", inSeason: true },
  { id: 4, name: "Washington Apple", category: "fruit", price: 2.49, unit: "kg", stock: 150, origin: "USA", emoji: "🍎", inSeason: false },
  { id: 5, name: "Seedless Red Grapes", category: "fruit", price: 3.99, unit: "kg", stock: 80, origin: "Chile", emoji: "🍇", inSeason: true },
  { id: 6, name: "Thompson Orange", category: "fruit", price: 1.99, unit: "kg", stock: 95, origin: "Spain", emoji: "🍊", inSeason: false },
  { id: 7, name: "Organic Strawberries", category: "fruit", price: 3.49, unit: "box", stock: 60, origin: "USA", emoji: "🍓", inSeason: true },
  { id: 8, name: "Romain Lettuce", category: "vegetable", price: 1.89, unit: "head", stock: 110, origin: "USA", emoji: "🥬", inSeason: true },
  { id: 9, name: "Plum Tomato", category: "vegetable", price: 2.29, unit: "kg", stock: 130, origin: "Italy", emoji: "🍅", inSeason: true },
  { id: 10, name: "Carrot (Nantes)", category: "vegetable", price: 1.49, unit: "bunch", stock: 90, origin: "Netherlands", emoji: "🥕", inSeason: false },
  { id: 11, name: "Baby Spinach", category: "vegetable", price: 2.99, unit: "bag", stock: 70, origin: "USA", emoji: "🥬", inSeason: true },
  { id: 12, name: "Fresh Basil", category: "herb", price: 2.19, unit: "bunch", stock: 45, origin: "Israel", emoji: "🌿", inSeason: true },
];

// --- collection helpers -------------------------------------------------

function list(filters = {}) {
  let rows = [...products];
  if (filters.category) rows = rows.filter((p) => p.category === filters.category);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (p) => p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q)
    );
  }
  if (filters.minPrice != null) rows = rows.filter((p) => p.price >= filters.minPrice);
  if (filters.maxPrice != null) rows = rows.filter((p) => p.price <= filters.maxPrice);
  if (filters.inSeason != null) {
    const want = String(filters.inSeason) === "true";
    rows = rows.filter((p) => p.inSeason === want);
  }
  return rows;
}

function findById(id) {
  return products.find((p) => p.id === id) || null;
}

function insert(data) {
  const product = { id: nextId++, ...data };
  products.push(product);
  return product;
}

function update(id, data) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data, id };
  return products[idx];
}

function removeById(id) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}

// --- validation --------------------------------------------------------

const CATEGORIES = ["fruit", "vegetable", "herb"];

const FIELD_RULES = {
  name: { check: (v) => typeof v === "string" && v.trim().length >= 2, message: "name must be a string with at least 2 characters" },
  category: { check: (v) => CATEGORIES.includes(v), message: `category must be one of: ${CATEGORIES.join(", ")}` },
  price: { check: (v) => typeof v === "number" && v > 0, message: "price must be a positive number" },
  unit: { check: (v) => typeof v === "string" && v.trim().length > 0, message: "unit must be a non-empty string" },
  stock: { check: (v) => Number.isInteger(v) && v >= 0, message: "stock must be a non-negative integer" },
  origin: { check: (v) => typeof v === "string" && v.trim().length > 0, message: "origin must be a non-empty string" },
  emoji: { check: (v) => typeof v === "string" && v.trim().length > 0, message: "emoji must be a non-empty string" },
  inSeason: { check: (v) => typeof v === "boolean", message: "inSeason must be a boolean" },
};

// Fields that get a default in POST/PUT (so they are not required on create).
const OPTIONAL = ["stock", "origin", "emoji", "inSeason"];
// Fields that must always be present on POST/PUT.
const REQUIRED = ["name", "category", "price", "unit"];

function validateProduct(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  // Partial (PATCH): validate whichever fields were provided (required or not).
  // Full (POST/PUT): required fields must be present; optional fields are
  // only validated (and kept) when actually provided.
  const provided = Object.keys(body || {});
  const relevant = partial
    ? Object.keys(FIELD_RULES)
    : [...REQUIRED, ...provided.filter((f) => OPTIONAL.includes(f))];
  for (const field of relevant) {
    const value = body[field];
    if (value === undefined) {
      if (!partial && REQUIRED.includes(field)) errors.push(`missing required field: ${field}`);
      continue;
    }
    const rule = FIELD_RULES[field];
    if (!rule.check(value)) errors.push(rule.message);
    else data[field] = value;
  }

  return { errors, data };
}

module.exports = { list, findById, insert, update, removeById, validateProduct, CATEGORIES };