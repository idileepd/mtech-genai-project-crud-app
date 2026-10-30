const { createApp } = require("./app");

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`🍎 Fruit Market API listening on http://localhost:${port}`);
  console.log(`   Swagger UI: http://localhost:${port}/docs`);
});