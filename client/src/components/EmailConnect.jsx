import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EmailConnect({ onGmail, onImap, onPaste, onLoadGmail }) {
  const [imap, setImap] = useState({ host: '', port: 993, email: '', password: '' });
  const [paste, setPaste] = useState('');

  const connectImap = () => {
    if (!imap.host || !imap.port || !imap.email || !imap.password) {
      toast.error('Complete IMAP host/port/email/password');
      return;
    }
    onImap(imap);
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h2 className="font-semibold">Connect Your Inbox</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={onGmail} className="rounded bg-accent px-3 py-2 text-sm text-white">Connect Gmail</button>
        <button onClick={onLoadGmail} className="rounded border px-3 py-2 text-sm">Load Gmail Inbox</button>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {['host', 'port', 'email', 'password'].map((k) => (
          <input
            key={k}
            type={k === 'password' ? 'password' : 'text'}
            placeholder={k}
            value={imap[k]}
            onChange={(e) => setImap({ ...imap, [k]: e.target.value })}
            className="rounded border p-2 dark:bg-slate-900"
          />
        ))}
      </div>
      <button onClick={connectImap} className="rounded border px-3 py-2 text-sm">Connect via IMAP</button>

      <textarea
        placeholder="Paste email text"
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        className="h-24 w-full rounded border p-2 dark:bg-slate-900"
      />
      <button onClick={() => onPaste(paste)} className="rounded border px-3 py-2 text-sm">Analyze Pasted Email</button>
    </div>
  );
}
