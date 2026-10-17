import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/products`).then((r) => r.json()).then(setProducts).catch(() => setError("Cannot reach API"));
  }, []);
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  const add = (p) =>
    setCart((c) => (c.find((i) => i.id === p.id)
      ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
      : [...c, { ...p, qty: 1 }]));
  const change = (id, d) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  const total = cart.reduce((s, i) => s + i.price_cents * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  async function checkout(e) {
    e.preventDefault();
    const res = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items: cart.map((i) => ({ id: i.id, qty: i.qty })) }),
    });
    const data = await res.json();
    if (res.ok) { setDone(data); setCart([]); setOpen(false); } else setError(data.error);
  }

  return (
    <>
      <header>
        <h1>Cartly</h1>
        <button onClick={() => setOpen(true)}>Cart ({count})</button>
      </header>
      {error && <p className="error">{error}</p>}
      {done && <p className="ok">Order #{done.orderId} placed. Total {money(done.total_cents)}. Thank you!</p>}
      <main className="grid">
        {products.map((p) => (
          <article key={p.id} className="card">
            <img src={p.image_url} alt={p.name} loading="lazy" />
            <div className="info">
              <small>{p.category}</small>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="row"><strong>{money(p.price_cents)}</strong><button onClick={() => add(p)}>Add</button></div>
            </div>
          </article>
        ))}
      </main>
      {open && (
        <aside className="drawer">
          <div className="row"><h2>Your cart</h2><button onClick={() => setOpen(false)}>✕</button></div>
          {!cart.length && <p>Cart is empty.</p>}
          {cart.map((i) => (
            <div key={i.id} className="item">
              <img src={i.image_url} alt="" />
              <div><b>{i.name}</b><br />{money(i.price_cents)}</div>
              <div className="qty"><button onClick={() => change(i.id, -1)}>−</button>{i.qty}<button onClick={() => change(i.id, 1)}>+</button></div>
            </div>
          ))}
          {cart.length > 0 && (
            <form onSubmit={checkout}>
              <h3>Total: {money(total)}</h3>
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <button className="primary">Place order</button>
            </form>
          )}
        </aside>
      )}
    </>
  );
}
