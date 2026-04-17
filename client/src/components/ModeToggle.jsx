export default function ModeToggle({ mode, setMode }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
      {['social', 'email'].map((item) => (
        <button
          key={item}
          onClick={() => setMode(item)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === item ? 'bg-accent text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {item === 'social' ? 'Social Post Mode' : 'Email Mode'}
        </button>
      ))}
    </div>
  );
}
