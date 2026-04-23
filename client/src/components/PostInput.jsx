const limits = { 'Twitter/X': 280, LinkedIn: 3000, Instagram: 2200, Facebook: 63206 };

export default function PostInput({
  platform,
  setPlatform,
  text,
  setText,
  goal,
  setGoal,
  audience,
  setAudience,
  images,
  onImageUpload,
  onAnalyze,
  loading,
}) {
  const limit = limits[platform];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Social Post Predictor</h2>
        <select className="rounded border px-2 py-1 dark:bg-slate-900" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          {Object.keys(limits).map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <input
          className="rounded border p-2 dark:bg-slate-900"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal (e.g., leads, comments, shares)"
        />
        <input
          className="rounded border p-2 dark:bg-slate-900"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Target audience"
        />
      </div>

      <textarea className="h-36 w-full rounded border p-2 dark:bg-slate-900" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or write your post..." />

      <div className="rounded border border-dashed p-3 dark:border-slate-600">
        <p className="mb-2 text-sm font-medium">Upload creative images (optional)</p>
        <input type="file" accept="image/*" multiple onChange={onImageUpload} className="text-sm" />
        {images.length > 0 && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {images.map((image) => (
              <div key={image.id} className="rounded border p-2 text-xs">
                <p className="font-medium">{image.name}</p>
                <p className="text-slate-500">{image.type || 'image'} • {(image.size / 1024).toFixed(1)} KB</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`${text.length > limit ? 'text-red-600' : 'text-slate-500'}`}>{text.length}/{limit}</span>
        <button disabled={loading || !text.trim()} onClick={onAnalyze} className="rounded bg-accent px-4 py-2 text-white disabled:opacity-50">{loading ? 'Predicting...' : 'Predict Traction'}</button>
      </div>
    </div>
  );
}
