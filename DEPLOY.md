# Deploying Scholars Hub

You have two supported paths. Pick one.

- **A. One command, self-hosted** — Docker Compose runs the whole stack (Postgres + API + web) on any machine/VPS.
- **B. Managed cloud (free tiers)** — backend + Postgres on **Render**, frontend on **Vercel**.

Both use the production Spring profile (`prod`), which switches the backend from the
in-memory H2 database to **PostgreSQL** so your data survives restarts.

---

## A. Docker Compose (self-hosted)

Prerequisites: Docker Desktop (or Docker Engine + Compose).

```bash
cd "Scholars hub"
cp .env.example .env          # optional: edit the Postgres password
docker compose up --build
```

- Web app → http://localhost:8081
- API → http://localhost:8080/api
- Postgres → internal only (data persisted in the `db-data` volume)

Stop with `Ctrl+C`; `docker compose down` to remove containers (add `-v` to also wipe the DB).

To deploy this to a VPS: copy the folder up, install Docker, set a strong `POSTGRES_PASSWORD`
and your real domain in `.env` (`VITE_API_URL=https://api.yourdomain.com/api`,
`FRONTEND_ORIGIN=https://yourdomain.com`), then `docker compose up --build -d` and put a
reverse proxy (Caddy/Nginx) with HTTPS in front.

> Note: `VITE_API_URL` is baked in at **build** time. If you change it, rebuild the
> frontend image (`docker compose build frontend`).

---

## B. Render (backend + DB) + Vercel (frontend)

This repo must be pushed to GitHub first (see "Push to GitHub" below).

### B1. Backend + Postgres on Render

1. Render → **New → Blueprint** → select your repo. It reads [`render.yaml`](render.yaml)
   and creates a **Postgres** database and the **Docker web service** for `backend/`.
2. Render can't auto-format the JDBC URL, so set two env vars on the `scholars-hub-api`
   service (they're marked "sync: false" in the blueprint):
   - **`SPRING_DATASOURCE_URL`** — open the created database, copy its *Internal Database URL*
     (looks like `postgresql://user:pass@host:5432/scholarshub`) and rewrite it as:
     ```
     jdbc:postgresql://host:5432/scholarshub
     ```
     (drop the `user:pass@` part and change the scheme to `jdbc:postgresql`; the username and
     password are already injected separately by the blueprint.)
   - **`FRONTEND_ORIGIN`** — your Vercel URL, e.g. `https://scholars-hub.vercel.app`
     (you'll have this after B2; you can set it then and redeploy).
3. Deploy. When it's live, test: `https://<your-api>.onrender.com/api/subjects` returns JSON.

> Free Render services sleep when idle and cold-start in ~30–60s on the first request.

### B2. Frontend on Vercel

1. Vercel → **Add New → Project** → import the repo.
2. Set **Root Directory = `frontend`** (Vercel auto-detects Vite via [`vercel.json`](frontend/vercel.json)).
3. Add an environment variable:
   - **`VITE_API_URL`** = `https://<your-api>.onrender.com/api`
4. Deploy. Open the Vercel URL — the site loads its data from your Render API.
5. Go back to Render and set `FRONTEND_ORIGIN` to this Vercel URL (locks down CORS), redeploy.

Netlify works the same way: base directory `frontend`, build `npm run build`, publish `dist`,
env `VITE_API_URL`.

---

## Push to GitHub

```bash
cd "Scholars hub"
git init
git add .
git commit -m "Scholars Hub full-stack app"
git branch -M main
git remote add origin https://github.com/<you>/scholars-hub.git
git push -u origin main
```

`node_modules/`, `target/`, and `.env` are already git-ignored.

---

## Environment variables reference

| Variable | Where | Purpose |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE=prod` | backend | Switch to Postgres + production config |
| `SPRING_DATASOURCE_URL` | backend | `jdbc:postgresql://host:5432/db` |
| `SPRING_DATASOURCE_USERNAME` / `_PASSWORD` | backend | DB credentials |
| `FRONTEND_ORIGIN` | backend | Allowed CORS origin(s), comma-separated |
| `PORT` | backend | Provided by the host (Render sets it automatically) |
| `VITE_API_URL` | frontend (build time) | Base URL of the API, e.g. `https://…/api` |

## Production hardening checklist

- [ ] Replace plain-text passwords with **Spring Security + BCrypt** and token/session auth.
- [ ] Move PDF files to object storage (S3/GCS); serve via signed URLs after a purchase check.
- [ ] Payments are manual (UPI/bank + admin verification). Add a gateway (Razorpay) if you want auto-unlock.
- [ ] Set a strong `POSTGRES_PASSWORD`; never commit `.env`.
- [ ] Swap the Tailwind Play CDN for a compiled Tailwind build.
