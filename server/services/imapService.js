import Imap from 'imap';
import { simpleParser } from 'mailparser';

export const fetchImapInbox = (config) =>
  new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.email,
      password: config.password,
      host: config.host,
      port: Number(config.port),
      tls: true,
    });

    imap.once('ready', () => {
      imap.openBox('INBOX', true, () => {
        imap.search(['ALL'], (err, results) => {
          if (err) return reject(err);
          const last20 = results.slice(-20);
          if (!last20.length) {
            imap.end();
            return resolve([]);
          }

          const fetch = imap.fetch(last20, { bodies: '' });
          const emails = [];

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (_, parsed) => {
                emails.push({
                  id: parsed.messageId || String(Date.now()),
                  sender: parsed.from?.text || '',
                  subject: parsed.subject || '',
                  date: parsed.date?.toISOString?.() || '',
                  snippet: (parsed.text || '').slice(0, 140),
                  body: parsed.text || '',
                });
              });
            });
          });

          fetch.once('error', reject);
          fetch.once('end', () => {
            imap.end();
            resolve(emails.reverse());
          });
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
