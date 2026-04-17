import { google } from 'googleapis';

export const buildOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

const header = (headers, name) =>
  headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

export const fetchGmailInbox = async (tokens) => {
  if (!tokens?.access_token) return [];

  const auth = buildOAuthClient();
  auth.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth });

  const msgList = await gmail.users.messages.list({ userId: 'me', maxResults: 20 });
  const ids = msgList.data.messages || [];

  return Promise.all(
    ids.map(async ({ id }) => {
      const detail = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
      const headers = detail.data.payload?.headers || [];
      const parts = detail.data.payload?.parts || [];
      const plainPart = parts.find((p) => p.mimeType === 'text/plain')?.body?.data;
      const body = plainPart
        ? Buffer.from(plainPart, 'base64').toString('utf-8')
        : detail.data.snippet || '';

      return {
        id,
        threadId: detail.data.threadId,
        sender: header(headers, 'From'),
        subject: header(headers, 'Subject'),
        date: header(headers, 'Date'),
        snippet: detail.data.snippet || '',
        body,
      };
    }),
  );
};
