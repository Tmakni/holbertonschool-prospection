import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { google } from 'googleapis';

const router = express.Router();

// Protéger toutes les routes
router.use(authMiddleware);

// Gmail OAuth2 config
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || '';
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';
const GMAIL_USER_EMAIL = process.env.GMAIL_USER_EMAIL || '';

let oauth2Client = null;
let gmail = null;

if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
  oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  );
  oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  console.log('✉️  Gmail API configurée et prête');
} else {
  console.warn('⚠️  Gmail API non configurée - Variables GMAIL_* manquantes dans .env');
}

function createEmailMessage(to, subject, message) {
  const emailLines = [
    `To: ${to}`,
    `From: ${GMAIL_USER_EMAIL || 'me'}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    message,
  ];
  const email = emailLines.join('\r\n');
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    gmailConfigured: !!gmail,
    env: {
      hasClientId: !!GMAIL_CLIENT_ID,
      hasClientSecret: !!GMAIL_CLIENT_SECRET,
      hasRefreshToken: !!GMAIL_REFRESH_TOKEN,
    },
  });
});

router.post('/send', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ ok: false, error: 'Paramètres manquants (to, subject, message)' });
    }
    if (!gmail) return res.status(500).json({ ok: false, error: 'Gmail API non configurée' });

    const raw = createEmailMessage(to, subject, message);
    const result = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });

    console.log('📧 Email envoyé via Gmail API:', { to, subject, messageId: result.data.id });
    res.json({ ok: true, gmail: { messageId: result.data.id, threadId: result.data.threadId } });
  } catch (error) {
    console.error('Email send error:', error);
    if (error.response) console.error('Gmail API Error:', error.response.data);
    res.status(500).json({ ok: false, error: error.message || 'Erreur envoi' });
  }
});

router.post('/send-bulk', async (req, res) => {
  try {
    const { recipientEmail, message: msg, subject } = req.body;
    if (!recipientEmail || !subject || !msg) {
      return res.status(400).json({ ok: false, error: 'Paramètres manquants (recipientEmail, subject, message)' });
    }
    if (!gmail) return res.status(500).json({ ok: false, error: 'Gmail API non configurée' });

    const raw = createEmailMessage(recipientEmail, subject, msg);
    const result = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });

    console.log('📧 Email envoyé (bulk):', { to: recipientEmail, subject, messageId: result.data.id });
    res.json({ ok: true, gmail: { messageId: result.data.id, threadId: result.data.threadId } });
  } catch (error) {
    console.error('Email send-bulk error:', error);
    if (error.response) console.error('Gmail API Error:', error.response.data);
    res.status(500).json({ ok: false, error: error.message || 'Erreur envoi' });
  }
});

export { router as emailRouter };
