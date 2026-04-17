import { useState } from 'react';

import { API_BASE_URL } from '../config';

export const useEmailConnect = () => {
  const [emails, setEmails] = useState([]);

  const connectGmail = () => {
    const redirect = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE_URL}/auth/google?redirect=${redirect}`;
  };

  const fetchInbox = async (source = 'gmail') => {
    const res = await fetch(`${API_BASE_URL}/api/email/inbox?source=${source}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch inbox');
    setEmails(data.emails || []);
    return data.emails || [];
  };

  const connectImap = async (payload) => {
    const res = await fetch(`${API_BASE_URL}/api/email/imap/connect`, {
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
    const res = await fetch(`${API_BASE_URL}/api/email/send`, {
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
