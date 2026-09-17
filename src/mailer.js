import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  CONTACT_TO,
  CONTACT_FROM,
} = process.env;

const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_TO);

let transporter = null;
if (configured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true', // true for 465, false for 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export const emailEnabled = configured;

// Sends a notification of a new inquiry. Never throws — a mail
// failure must not lose the submission (already saved in the DB).
export async function sendNotification(sub) {
  if (!transporter) return { sent: false, reason: 'smtp_not_configured' };
  try {
    await transporter.sendMail({
      from: CONTACT_FROM || `"Virative Site" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: sub.email,
      subject: `New inquiry — ${sub.company || sub.name}`,
      text:
        `Name: ${sub.name}\n` +
        `Email: ${sub.email}\n` +
        `Company: ${sub.company || '—'}\n\n` +
        `${sub.message}\n`,
    });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] failed to send notification:', err.message);
    return { sent: false, reason: 'send_failed' };
  }
}
