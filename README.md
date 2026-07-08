# Scholars Hub

A full-stack tuition / notes-selling website:

- **`frontend/`** — React (Vite) single-page app: public site, student dashboard, and an admin portal (subjects, PDF notes, students, payments, analytics, site settings).
- **`backend/`** — Spring Boot REST API (Java 17) backing all of it with a JPA data model and an in-memory H2 database seeded on startup.

```
Scholars hub/
├── frontend/          # React + Vite app
│   └── src/
│       ├── App.jsx    # the whole UI
│       └── api.js      # talks to the backend
└── backend/           # Spring Boot API
    └── src/main/java/com/scholarshub/
        ├── model/      # JPA entities: User, Subject, Chapter, Pdf, Payment, SiteSettings
        ├── repo/       # Spring Data repositories
        ├── controller/ # REST endpoints
        └── config/     # CORS + data seeder
```

## Prerequisites

- **Node.js** 18+ (for the frontend)
- **Java** 17+ and **Maven** 3.9+ (for the backend). No Maven? Install it with `brew install maven`, or open `backend/` in IntelliJ / VS Code (Java extensions) and run it from there.

## Run the backend (port 8080)

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080/api` with the demo content already seeded.
H2 console (optional): `http://localhost:8080/h2-console` — JDBC URL `jdbc:h2:mem:scholarshub`, user `sa`, no password.

> The database is in-memory, so **data resets every time the backend restarts** and the seed data is reloaded. Point `spring.datasource.url` at a file-based H2 or a real Postgres/MySQL in `application.properties` to persist.

## Run the frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. If the backend runs somewhere else, set `VITE_API_URL`:

```bash
VITE_API_URL=http://localhost:8080/api npm run dev
```

If the backend is **not** running, the frontend still works against an in-memory fallback (nothing is persisted).

## Demo logins

| Role    | Email               | Password   |
| ------- | ------------------- | ---------- |
| Admin   | `admin@academy.in`  | `admin123` |
| Student | `student@demo.in`   | `demo123`  |

The admin portal is reachable from the **Admin** link in the site footer.

## Buying a note (manual payment flow)

Paid notes are unlocked via a **manual UPI / bank payment** that the admin verifies — no
payment gateway required:

1. A logged-in student clicks **Unlock** on a paid note. The checkout shows the academy's
   UPI ID, bank details, and QR code (all editable under **Admin → Site settings → Payment details**).
2. The student pays directly, then enters their **UPI reference / UTR number** and submits.
   This creates a **PENDING** payment.
3. The admin opens **Admin → Payments**, and clicks **Verify** (or **Reject**). Verifying
   unlocks the note for that student and records the sale. The admin can also grant access
   manually under **Admin → Students**.

## API endpoints

| Method | Path                 | Purpose                                  |
| ------ | -------------------- | ---------------------------------------- |
| GET/PUT| `/api/settings`      | Site settings document (singleton)       |
| GET/PUT| `/api/subjects`      | List / replace subjects (+chapters)      |
| GET/PUT| `/api/pdfs`          | List / replace PDF notes                 |
| GET/PUT| `/api/users`         | List / replace users                     |
| GET/PUT| `/api/payments`      | List / replace payment records           |
| POST   | `/api/auth/login`    | `{ email, password }` → user + role      |
| POST   | `/api/auth/register` | `{ name, email, password }` → new student|

The frontend loads each collection with `GET` and persists changes with `PUT` (the admin
portal edits whole collections). Real, per-resource `AuthController` endpoints are included
for a production auth flow.

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for two ready-to-go paths:

- **Docker Compose** — `docker compose up --build` runs Postgres + API + web locally or on a VPS.
- **Render + Vercel** — managed free-tier hosting (backend + Postgres on Render, frontend on Vercel).

Both switch the backend to **PostgreSQL** via the `prod` Spring profile so data persists.

## Notes for production

- Passwords are stored in plain text to mirror the demo. Add **Spring Security + BCrypt** and JWT/session auth.
- PDF files are metadata-only here. Wire uploads to cloud storage (S3/GCS) and serve via short-lived signed URLs after a purchase check.
- Payments are **manual** (UPI/bank + admin verification). Add a gateway (e.g. Razorpay) if you want automatic unlock.
- The frontend uses the **Tailwind Play CDN** (in `index.html`) for zero-config styling; swap it for a compiled Tailwind (PostCSS) setup for production.
