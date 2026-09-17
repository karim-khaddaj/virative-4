# Virative

Media agency website — animated frontend + Express/SQLite backend that captures contact inquiries.

## Stack
- **Frontend:** static HTML/CSS/JS in `public/` (no build step)
- **Backend:** Node + Express (`src/server.js`)
- **Database:** SQLite via `node-sqlite3-wasm` — a real `.db` file, no native compiler needed
- **Extras:** Helmet security headers, rate limiting, honeypot spam trap, optional email notifications

## Run locally
Requires Node 18.18+.

```bash
npm install
npm start          # http://localhost:3000
# or: npm run dev  (auto-restarts on file changes)
```

## Where inquiries go
Every valid submission is saved to `data/virative.db` (created automatically).
View them with any SQLite tool, or add a quick admin route later using the
`listSubmissions()` helper already in `src/db.js`.

### Optional email alerts
Copy `.env.example` to `.env` and fill in your SMTP details. When set, each new
inquiry also emails `CONTACT_TO`. Leave blank and the form still works — it just
saves to the database without emailing.

```bash
cp .env.example .env
```

## Deploy (Render / Railway / any VPS)
- Build command: `npm install`
- Start command: `npm start`
- Set `PORT` if the host requires it (most set it automatically)
- For persistent inquiries across restarts, attach a disk and point `DB_PATH`
  at it, e.g. `DB_PATH=/var/data/virative.db`
- Add your `SMTP_*` and `CONTACT_TO` values as environment variables to enable emails

## Editing content
- Copy / sections: `public/index.html`
- Styling & colours: `public/styles.css` (accent + glow are CSS variables at the top)
- Animations (wordmark, reveals, form): `public/main.js`

## Project structure
```
virative/
├── public/        index.html, styles.css, main.js
├── src/           server.js, db.js, mailer.js
├── data/          virative.db  (created at runtime, gitignored)
├── .env.example
└── package.json
```
