# Cartly

A simple full-stack e-commerce app: browse products with images, add them to a cart, and place an order. Built to run locally first, then deploy to AWS.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| Local DB | Docker Compose |
| Cloud (planned) | AWS RDS, App Runner / Elastic Beanstalk, S3 + CloudFront |

## Features

- Product catalogue with images, categories and prices
- Cart with quantity controls, saved in the browser (localStorage)
- Checkout that stores the order and its items in PostgreSQL
- Prices are re-checked on the server, so the client cannot change totals

## Project structure

```
cartly/
├── docker-compose.yml        # PostgreSQL for local development
├── client/                   # React (Vite) frontend
│   ├── src/App.jsx
│   ├── src/main.jsx
│   └── src/styles.css
└── server/                   # Express API
    └── src/
        ├── index.js          # routes
        ├── db.js             # PostgreSQL pool
        ├── schema.sql        # tables
        └── seed.js           # creates tables + sample products
```

## Run locally

### 1. Database

With Docker:

```
docker compose up -d
```

This starts PostgreSQL on port 5432 with user, password and database all set to `cartly`.

Without Docker: install PostgreSQL, then create the user and database:

```sql
CREATE USER cartly WITH PASSWORD 'cartly';
CREATE DATABASE cartly OWNER cartly;
```

If port 5432 is already in use, change the mapping in `docker-compose.yml` to `"5433:5432"` and use port 5433 in `DATABASE_URL`.

### 2. Backend

```
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

The API runs at http://localhost:4000. Check it with http://localhost:4000/api/products.

### 3. Frontend

```
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173.

## Environment variables

`server/.env`

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgres://cartly:cartly@localhost:5432/cartly` | PostgreSQL connection |
| `PGSSL` | `false` | set to `true` for AWS RDS |
| `CLIENT_ORIGIN` | `http://localhost:5173` | allowed CORS origin |

`client/.env`

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | where the React app calls the API |

Never commit real `.env` files. They are listed in `.gitignore`.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | health check |
| GET | `/api/products` | list all products |
| GET | `/api/products/:id` | get one product |
| POST | `/api/orders` | create an order |

Example order request:

```json
{
  "name": "Afrah",
  "email": "afrah@example.com",
  "items": [{ "id": 1, "qty": 2 }, { "id": 3, "qty": 1 }]
}
```

## Deploy to AWS (planned)

1. **Database:** create an RDS PostgreSQL instance, set `DATABASE_URL` and `PGSSL=true`, then run `npm run seed` once.
2. **API:** deploy the `server` folder to App Runner, Elastic Beanstalk or EC2, with the environment variables above.
3. **Frontend:** run `npm run build` in `client`, upload `dist` to S3 behind CloudFront, and set `VITE_API_URL` to the API URL before building.
4. **Images:** move product images to an S3 bucket and store the URLs in `products.image_url`.

## Roadmap

- User accounts and login
- Product search and category filters
- Admin page to add and edit products
- Image upload to S3
- Payments (Stripe)
