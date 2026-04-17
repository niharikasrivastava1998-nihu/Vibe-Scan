import { google } from 'googleapis';

export const buildOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

export const fetchGmailInbox = async (tokens) => {
  if (!tokens?.access_token) return [];
  const auth = buildOAuthClient();
  auth.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  const msgList = await gmail.users.messages.list({ userId: 'me', maxResults: 20 });
  const ids = msgList.data.messages || [];

  const messages = await Promise.all(
    ids.map(async ({ id }) => {
      const detail = await gmail.users.messages.get({ userId: 'me', id, format: 'metadata' });
      const headers = detail.data.payload?.headers || [];
      const getHeader = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
      return {
        id,
        sender: getHeader('From'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        snippet: detail.data.snippet || '',
      };
    }),
  );

  return messages;
};
