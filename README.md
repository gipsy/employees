# Employees

A full-stack web app for **managing a personal employee directory**: register, sign in, and maintain contact records (name, age, address) with list, detail, edit, and delete. React + Express + Prisma/MongoDB; JWT auth; each user’s data is isolated.

Live demo:

- **App:** [employees-client.onrender.com](https://employees-client.onrender.com/)
- **API:** [employees-vbhk.onrender.com](https://employees-vbhk.onrender.com/)

The repo is both a working product on Render and a reference stack for React + Express + Prisma + JWT auth.

## What it does

| Area | Behavior |
|------|----------|
| **Accounts** | Register with email, name, and password; log in to receive a short-lived access token and an httpOnly refresh cookie. |
| **Session** | On load, the client silently refreshes the access token so returning users stay signed in. |
| **Employees** | Create records with first name, last name, age, and address; list them on the home page; open a row for details. |
| **Changes** | From the detail page, edit fields or delete with a confirmation modal; success routes to a simple status screen. |
| **Isolation** | Employee rows are tied to the logged-in user on the server so one account cannot read or change another’s entries. |

The UI uses a dark Ant Design theme, Redux Toolkit Query for API calls, and client-side routing for login, register, list, add, edit, and detail flows.

## Tech stack

| Layer | Choices |
|-------|---------|
| **Frontend** | React 18, TypeScript, Create React App, Redux Toolkit (+ RTK Query), Ant Design, React Router |
| **Backend** | Node.js, Express (ES modules), cookie-parser, CORS, helmet, rate limiting on auth routes |
| **Data** | MongoDB via Prisma (`User`, `Employee` models) |
| **Auth** | bcrypt password hashes; JWT access token (Bearer); refresh token rotation in an httpOnly cookie with reuse detection |

## Repository layout

```text
employees/
├── app.js, bin/www.js     # Express app and HTTP server
├── controllers/           # Auth, employees, refresh handlers
├── middleware/            # Access-token auth for protected routes
├── prisma/                # Schema and migrations
├── routes/                # /api/user, /api/employees, /api/refresh
└── client/                # React SPA (build output can be hosted as static site)
```

## Local development

### Prerequisites

- Node.js 18+
- MongoDB connection string (see Environment)

### Install

```bash
npm install
npm install --prefix client
```

### Environment

Copy [`.env.example`](.env.example) to `.env` in the project root. For values that match production, copy them from the Render dashboard (web service **employees** → Environment).

Suggested local settings:

- `PORT=8000`
- `NODE_ENV=development`
- `CORS_ORIGINS=http://localhost:3000,http://localhost:5173`

Required API variables:

- `DATABASE_URL` — MongoDB URI for Prisma  
- `ACCESS_SECRET_KEY` / `REFRESH_SECRET_KEY` — JWT signing secrets (if production only has `JWT_SECRET_KEY`, use the same value for both locally)  

Point the client at the API in [`client/src/app/services/api.ts`](client/src/app/services/api.ts) (`baseUrl`; default `http://localhost:8000/api`).

### Run

```bash
# API (port 8000 if set in .env) + React dev server (port 3000)
npm run dev
```

Or separately:

```bash
npm run server          # nodemon API
npm run client          # react-scripts start in client/
```

## API overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/user/register` | — | Create account |
| POST | `/api/user/login` | — | Sign in; sets refresh cookie |
| GET | `/api/user/current` | Bearer | Current user (safe fields) |
| POST/GET | `/api/user/logout` | Cookie | Revoke refresh token |
| GET | `/api/refresh` | Cookie | New access token |
| GET | `/api/employees` | Bearer | List current user’s employees |
| GET | `/api/employees/:id` | Bearer | One employee |
| POST | `/api/employees/add` | Bearer | Create employee |
| PUT | `/api/employees/edit/:id` | Bearer | Update employee |
| POST | `/api/employees/remove/:id` | Bearer | Delete employee |

## Deployment

The app is hosted on [Render](https://render.com): static site **employees-client**, web service **employees** (`employees-vbhk`). The GitHub repo is [gipsy/employees](https://github.com/gipsy/employees).

## License

Private project (`package.json` marks packages as `"private": true`). Use and deploy according to your own terms unless a license file is added later.
