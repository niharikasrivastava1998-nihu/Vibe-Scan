export default function HistorySidebar({ title, items, onSelect, onClear }) {
  return (
    <aside className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button onClick={onClear} className="text-xs text-slate-500">Clear</button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <button key={idx} onClick={() => onSelect(item)} className="w-full rounded border p-2 text-left text-sm dark:border-slate-700">
            <p className="truncate font-medium">{item.subject || item.platform || 'Entry'}</p>
            <p className="truncate text-xs text-slate-500">{item.sender || item.text}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
