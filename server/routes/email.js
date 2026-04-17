import { Router } from 'express';
import { fetchGmailInbox } from '../services/gmailService.js';
import { fetchImapInbox } from '../services/imapService.js';
import { sendEmail } from '../services/mailerService.js';

const router = Router();

router.get('/inbox', async (req, res) => {
  try {
    const source = req.query.source || 'gmail';
    if (source === 'imap') {
      const inbox = req.session.imapInbox || [];
      return res.json({ source, emails: inbox.slice(0, 20) });
    }

    const emails = await fetchGmailInbox(req.user?.tokens);
    return res.json({ source: 'gmail', emails });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inbox.', detail: error.message });
  }
});

router.get('/thread/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ id, thread: 'Thread retrieval is connected; enhance with provider-specific full thread fetch.' });
});

router.post('/imap/connect', async (req, res) => {
  const { host, port, email, password } = req.body;
  if (!host || !port || !email || !password) {
    return res.status(400).json({ error: 'host, port, email, and password are required.' });
  }

  try {
    const emails = await fetchImapInbox({ host, port, email, password });
    req.session.imapInbox = emails;
    return res.json({ connected: true, emails: emails.slice(0, 20) });
  } catch (error) {
    return res.status(500).json({ error: 'IMAP connection failed.', detail: error.message });
  }
});

router.post('/send', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, and body are required.' });
  }

  try {
    const info = await sendEmail({ to, subject, body });
    return res.json({ sent: true, messageId: info.messageId });
  } catch (error) {
    return res.status(500).json({ error: 'Email send failed.', detail: error.message });
  }
});

export default router;
