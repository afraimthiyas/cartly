# Cartly — React + Node.js + PostgreSQL (AWS-ready)

## Run locally
1. Start Postgres:        `docker compose up -d`
2. Backend:
   ```
   cd server && cp .env.example .env && npm install && npm run seed && npm run dev
   ```
3. Frontend (new terminal):
   ```
   cd client && cp .env.example .env && npm install && npm run dev
   ```
Open http://localhost:5173 (API on http://localhost:4000).

No Docker? Install PostgreSQL, create a `cartly` DB/user, and edit `DATABASE_URL` in `server/.env`.

## Cloud plan (next step)
- DB: AWS RDS PostgreSQL -> set `DATABASE_URL` + `PGSSL=true`, run `npm run seed` once
- API: Elastic Beanstalk / App Runner / EC2
- Frontend: `npm run build` -> S3 + CloudFront (set `VITE_API_URL` to the API URL)
- Product images: S3 bucket -> store the URLs in `products.image_url`
