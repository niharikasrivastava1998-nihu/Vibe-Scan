import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ReplyComposer({ seed, onSend }) {
  const [form, setForm] = useState({ to: '', subject: seed?.subject || '', body: seed?.body || '' });

  const send = async () => {
    if (!form.to || !form.subject || !form.body) return toast.error('Fill To/Subject/Body');
    await onSend(form);
    toast.success('Email sent');
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="mb-3 font-semibold">Reply Composer</h3>
      {['to', 'subject'].map((f) => <input key={f} placeholder={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="mb-2 w-full rounded border p-2 dark:bg-slate-900" />)}
      <textarea placeholder="body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="h-32 w-full rounded border p-2 dark:bg-slate-900" />
      <div className="mt-2 flex gap-2">
        <button onClick={send} className="rounded bg-accent px-3 py-2 text-sm text-white">Send Email</button>
        <button onClick={() => navigator.clipboard.writeText(form.body).then(() => toast.success('Copied'))} className="rounded border px-3 py-2 text-sm">Copy to Clipboard</button>
      </div>
    </div>
  );
}
