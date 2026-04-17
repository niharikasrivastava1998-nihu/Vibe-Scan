export default function EmailAnalysis({ analysis, onUseReply }) {
  if (!analysis) return null;
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="grid gap-3 md:grid-cols-3">
        <div><p className="text-xs text-slate-500">Intent</p><p>{analysis.intentLabel}</p></div>
        <div><p className="text-xs text-slate-500">Urgency</p><p>{analysis.urgencyLevel}</p></div>
        <div><p className="text-xs text-slate-500">Mood</p><p>{analysis.senderMood}</p></div>
      </div>
      {analysis.riskFlags?.map((flag, i) => <div key={i} className="rounded border border-red-200 bg-red-50 p-2 text-sm">{flag.type}: {flag.detail}</div>)}
      <ul className="list-disc pl-5 text-sm">{analysis.keyPoints?.map((k, i) => <li key={i}>{k}</li>)}</ul>
      <div className="grid gap-3 md:grid-cols-3">
        {analysis.suggestedReplies?.map((reply) => (
          <div key={reply.style} className="rounded border p-3">
            <p className="font-semibold">{reply.style}</p>
            <p className="text-xs text-slate-500">{reply.subject}</p>
            <p className="mt-2 line-clamp-5 text-sm whitespace-pre-wrap">{reply.body}</p>
            <button onClick={() => onUseReply(reply)} className="mt-2 text-sm text-accent">Use This Reply</button>
          </div>
        ))}
      </div>
    </div>
  );
}
