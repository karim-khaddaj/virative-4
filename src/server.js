import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { insertSubmission } from './db.js';
import { sendNotification, emailEnabled } from './mailer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

const app = express();
const PORT = process.env.PORT || 3000;

// Behind a proxy (Render/Railway/Nginx) so rate-limit reads the real IP.
app.set('trust proxy', 1);

// Security headers. CSP is tuned for this site: Google Fonts + inline-free
// scripts. Adjust connect-src if you point the form at another origin.
app.use(
  helmet({
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https://vumbnail.com'],
    connectSrc: ["'self'"],
    frameSrc: ["'self'", 'https://player.vimeo.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'self'"],
  },
},
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '16kb' }));

// ---- helpers ----------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, max) => String(v ?? '').trim().slice(0, max);

function validate(body) {
  const errors = {};
  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const company = clip(body.company, 160);
  const message = clip(body.message, 4000);

  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (message.length < 5) errors.message = 'Please add a short message.';

  return { ok: Object.keys(errors).length === 0, errors, value: { name, email, company, message } };
}

// ---- rate limiting ----------------------------------------------------
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many messages. Please try again later.' },
});

// ---- API --------------------------------------------------------------
app.post('/api/contact', contactLimiter, async (req, res) => {
  const body = req.body || {};

  // Honeypot: real users never fill this hidden field.
  if (clip(body.website, 50) !== '') {
    return res.json({ ok: true }); // silently accept & drop
  }

  const { ok, errors, value } = validate(body);
  if (!ok) return res.status(400).json({ ok: false, errors });

  try {
    const id = insertSubmission({
      ...value,
      ip: req.ip,
      user_agent: clip(req.get('user-agent'), 400),
    });
    // Fire-and-forget email; submission is already safely stored.
    sendNotification(value).catch(() => {});
    return res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error('[contact] failed to store submission:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emailEnabled });
});

// ---- static frontend --------------------------------------------------
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// SPA-style fallback to index for any unmatched GET (keeps deep links working).
app.get('*', (req, res) => {
  res.sendFile(join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Virative running on http://localhost:${PORT}`);
  console.log(`Email notifications: ${emailEnabled ? 'enabled' : 'disabled (set SMTP_* env vars to enable)'}`);
});
