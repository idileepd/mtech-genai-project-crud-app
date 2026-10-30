const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const products = require("./routes/products");

function createApp() {
  const app = express();
  app.use(express.json());

  // Swagger UI at /docs
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "Fruit Market API — Swagger UI",
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );

  // Home
  app.get("/", (req, res) => {
    res.send(
      "<h1>🍎 Fruit Market API</h1>" +
        "<p>A simple CRUD demo — fake JSON data, no login required.</p>" +
        "<ul>" +
        "<li>Interactive docs: <a href=\"/docs\">/docs (Swagger UI)</a></li>" +
        "<li>All products: <a href=\"/products\">/products</a></li>" +
        "<li>Fruit only: <a href=\"/products?category=fruit\">/products?category=fruit</a></li>" +
        "<li>Market stats: <a href=\"/products/stats\">/products/stats</a></li>" +
        "<li>Health: <a href=\"/health\">/health</a></li>" +
        "</ul>"
    );
  });

  app.get("/health", (req, res) => res.json({ ok: true, service: "fruit-market-api" }));

  app.use("/products", products);

  // 404 for unknown routes
  app.use((req, res) => res.status(404).json({ error: "Route not found" }));

  // Malformed JSON body handler
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };