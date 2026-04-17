import { useState } from 'react';

const API = 'http://localhost:3001';

export const useEmailConnect = () => {
  const [emails, setEmails] = useState([]);

  const connectGmail = () => {
    window.location.href = `${API}/auth/google`;
  };

  const fetchInbox = async (source = 'gmail') => {
    const res = await fetch(`${API}/api/email/inbox?source=${source}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch inbox');
    setEmails(data.emails || []);
    return data.emails || [];
  };

  const connectImap = async (payload) => {
    const res = await fetch(`${API}/api/email/imap/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'IMAP connect failed');
    setEmails(data.emails || []);
    return data.emails || [];
  };

  const sendEmail = async (payload) => {
    const res = await fetch(`${API}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Send failed');
    return data;
  };

  return { emails, connectGmail, fetchInbox, connectImap, sendEmail, setEmails };
};
