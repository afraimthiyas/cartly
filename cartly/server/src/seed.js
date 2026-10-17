const fs = require("fs");
const path = require("path");
const pool = require("./db");
const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;
const products = [
  ["Classic Sneakers", "Everyday comfort sneakers.", 5999, img("sneakers"), "Shoes"],
  ["Leather Backpack", "Roomy backpack for work and travel.", 8900, img("backpack"), "Bags"],
  ["Wireless Headphones", "Noise-reducing over-ear headphones.", 12900, img("headphones"), "Electronics"],
  ["Smart Watch", "Track steps, sleep and notifications.", 14900, img("watch"), "Electronics"],
  ["Ceramic Mug", "Handmade 350ml mug.", 1500, img("mug"), "Home"],
  ["Sunglasses", "UV400 polarized lenses.", 3500, img("sunglasses"), "Accessories"],
  ["Desk Lamp", "Dimmable LED lamp.", 2800, img("lamp"), "Home"],
  ["Water Bottle", "Insulated steel bottle, 750ml.", 2200, img("bottle"), "Home"],
];
(async () => {
  await pool.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  await pool.query("TRUNCATE products RESTART IDENTITY CASCADE");
  for (const p of products)
    await pool.query(
      "INSERT INTO products (name, description, price_cents, image_url, category) VALUES ($1,$2,$3,$4,$5)", p);
  console.log("Seeded", products.length, "products");
  await pool.end();
})();
