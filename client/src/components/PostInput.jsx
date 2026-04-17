const limits = { 'Twitter/X': 280, LinkedIn: 3000, Instagram: 2200, Facebook: 63206 };

export default function PostInput({ platform, setPlatform, text, setText, onAnalyze, loading }) {
  const limit = limits[platform];
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Post Input</h2>
        <select className="rounded border px-2 py-1 dark:bg-slate-900" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          {Object.keys(limits).map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <textarea className="h-36 w-full rounded border p-2 dark:bg-slate-900" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or write your post..." />
      <div className="flex items-center justify-between text-sm">
        <span className={`${text.length > limit ? 'text-red-600' : 'text-slate-500'}`}>{text.length}/{limit}</span>
        <button disabled={loading || !text.trim()} onClick={onAnalyze} className="rounded bg-accent px-4 py-2 text-white disabled:opacity-50">{loading ? 'Analyzing...' : 'Analyze Post'}</button>
      </div>
    </div>
  );
}
