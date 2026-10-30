const express = require("express");
const db = require("../db");

const router = express.Router();

const idParam = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  req.productId = id;
  next();
};

// GET /products?category=&search=&minPrice=&maxPrice=&inSeason=  → list + filters
router.get("/", (req, res) => {
  const q = req.query;
  const filters = {
    category: q.category || undefined,
    search: q.search || undefined,
    inSeason: q.inSeason !== undefined ? q.inSeason : undefined,
    minPrice: q.minPrice !== undefined ? Number(q.minPrice) : undefined,
    maxPrice: q.maxPrice !== undefined ? Number(q.maxPrice) : undefined,
  };
  res.json({ count: db.list(filters).length, products: db.list(filters) });
});

// GET /products/categories → distinct categories and counts
router.get("/categories", (req, res) => {
  const counts = db.list().reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json({ categories: Object.entries(counts).map(([name, count]) => ({ name, count })) });
});

// GET /products/stats → market overview
router.get("/stats", (req, res) => {
  const all = db.list();
  const inSeason = all.filter((p) => p.inSeason);
  const totalValue = all.reduce((sum, p) => sum + p.price * p.stock, 0);
  res.json({
    totalProducts: all.length,
    inSeasonProducts: inSeason.length,
    averagePrice: Number((all.reduce((s, p) => s + p.price, 0) / all.length).toFixed(2)),
    totalInventoryValue: Number(totalValue.toFixed(2)),
    cheapest: all.reduce((a, b) => (b.price < a.price ? b : a)).name,
    priciest: all.reduce((a, b) => (b.price > a.price ? b : a)).name,
  });
});

// GET /products/:id
router.get("/:id", idParam, (req, res) => {
  const product = db.findById(req.productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST /products {name, category, price, unit, stock?, origin?, emoji?, inSeason?}
router.post("/", (req, res) => {
  const { errors, data } = db.validateProduct(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join("; ") });
  const product = db.insert({
    name: data.name.trim(),
    category: data.category,
    price: data.price,
    unit: data.unit.trim(),
    stock: data.stock ?? 0,
    origin: data.origin ?? "Unknown",
    emoji: data.emoji ?? "🛒",
    inSeason: data.inSeason ?? true,
  });
  res.status(201).json(product);
});

// PUT /products/:id → full replace (all required fields)
router.put("/:id", idParam, (req, res) => {
  if (!db.findById(req.productId)) return res.status(404).json({ error: "Product not found" });
  const { errors, data } = db.validateProduct(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join("; ") });
  const product = db.update(req.productId, {
    name: data.name.trim(),
    category: data.category,
    price: data.price,
    unit: data.unit.trim(),
    stock: data.stock ?? 0,
    origin: data.origin ?? "Unknown",
    emoji: data.emoji ?? "🛒",
    inSeason: data.inSeason ?? true,
  });
  res.json(product);
});

// PATCH /products/:id → partial update (only provided fields)
router.patch("/:id", idParam, (req, res) => {
  if (!db.findById(req.productId)) return res.status(404).json({ error: "Product not found" });
  const { errors, data } = db.validateProduct(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join("; ") });
  const patch = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      patch[key] = typeof value === "string" ? value.trim() : value;
    }
  }
  const product = db.update(req.productId, patch);
  res.json(product);
});

// DELETE /products/:id
router.delete("/:id", idParam, (req, res) => {
  if (!db.removeById(req.productId)) return res.status(404).json({ error: "Product not found" });
  res.status(204).end();
});

module.exports = router;