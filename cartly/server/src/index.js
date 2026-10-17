require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.get("/api/products", async (_, res) => {
  const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
  res.json(rows);
});

app.get("/api/products/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
});

app.post("/api/orders", async (req, res) => {
  const { name, email, items } = req.body;
  if (!name || !email || !Array.isArray(items) || !items.length)
    return res.status(400).json({ error: "name, email and items are required" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids = items.map((i) => i.id);
    const { rows } = await client.query("SELECT id, price_cents FROM products WHERE id = ANY($1)", [ids]);
    const prices = Object.fromEntries(rows.map((r) => [r.id, r.price_cents]));
    let total = 0;
    for (const i of items) {
      if (!prices[i.id] || i.qty < 1) throw new Error("Invalid item");
      total += prices[i.id] * i.qty;
    }
    const o = await client.query(
      "INSERT INTO orders (customer_name, email, total_cents) VALUES ($1,$2,$3) RETURNING id", [name, email, total]);
    for (const i of items)
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price_cents) VALUES ($1,$2,$3,$4)",
        [o.rows[0].id, i.id, i.qty, prices[i.id]]);
    await client.query("COMMIT");
    res.status(201).json({ orderId: o.rows[0].id, total_cents: total });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.listen(process.env.PORT || 4000, () => console.log("Cartly API on :" + (process.env.PORT || 4000)));
