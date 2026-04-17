const badge = { High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-green-100 text-green-700' };

export default function EmailList({ emails, onSelect }) {
  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <button key={email.id} onClick={() => onSelect(email)} className="w-full rounded-xl border border-slate-200 p-3 text-left dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{email.subject || '(No subject)'}</p>
            {email.urgencyLevel && <span className={`rounded-full px-2 py-1 text-xs ${badge[email.urgencyLevel]}`}>{email.urgencyLevel}</span>}
          </div>
          <p className="text-sm text-slate-500">{email.sender}</p>
          <p className="truncate text-sm">{email.snippet}</p>
        </button>
      ))}
    </div>
  );
}
