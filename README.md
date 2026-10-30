# 🍎 Fruit Market API — CRUD demo

A dead-simple Express CRUD application. **No login, no auth, no database** —
just fake JSON data (a fruit & vegetable market) with full Create / Read /
Update / Delete support and interactive Swagger UI.

## Run it

```bash
npm install
npm start            # http://localhost:3001  (override with PORT=xxxx)
```

## Endpoints

| Method | URL | Description |
|---|---|---|
| GET | `/` | Home page with links |
| GET | `/health` | Health check |
| GET | `/docs` | Interactive Swagger UI |
| GET | `/products` | List all (filters below) |
| GET | `/products/:id` | Get one product |
| GET | `/products/categories` | Categories + counts |
| GET | `/products/stats` | Market statistics |
| POST | `/products` | Create a product |
| PUT | `/products/:id` | Replace a product (all fields) |
| PATCH | `/products/:id` | Partially update a product |
| DELETE | `/products/:id` | Delete a product |

### List filters

```
GET /products?category=fruit
GET /products?search=mango
GET /products?minPrice=1&maxPrice=3
GET /products?inSeason=true
```

### Product shape

```json
{
  "id": 1,
  "name": "Alphonso Mango",
  "category": "fruit",            // fruit | vegetable | herb
  "price": 4.99,
  "unit": "kg",
  "stock": 120,
  "origin": "India",
  "emoji": "🥭",
  "inSeason": true
}
```

### Example create

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Dragon Fruit","category":"fruit","price":5.49,"unit":"each","stock":30,"origin":"Vietnam","emoji":"🐉","inSeason":true}'
```

Validation is included: missing/invalid fields return `400` with a readable
message, unknown ids return `404`, unknown routes return `404`.