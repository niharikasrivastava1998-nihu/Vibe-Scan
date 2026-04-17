import { useState } from 'react';

export default function EmailAnalysis({ analysis, onUseReply }) {
  const [hiddenRisks, setHiddenRisks] = useState([]);

  if (!analysis) return null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Intent</p>
          <p className="font-medium">{analysis.intentLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Urgency</p>
          <p className="font-medium">{analysis.urgencyLevel}</p>
          <p className="text-xs text-slate-500">{analysis.urgencyReason}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Mood</p>
          <p className="font-medium">{analysis.senderMood}</p>
        </div>
      </div>

      {(analysis.riskFlags || []).map((flag, i) => {
        if (hiddenRisks.includes(i)) return null;
        return (
          <div key={`${flag.type}-${i}`} className="flex items-start justify-between rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
            <span>
              <strong>{flag.type}:</strong> {flag.detail}
            </span>
            <button onClick={() => setHiddenRisks((prev) => [...prev, i])} className="ml-3 text-xs">
              Dismiss
            </button>
          </div>
        );
      })}

      <div>
        <h4 className="mb-1 text-sm font-semibold">Key Points</h4>
        <ul className="list-disc pl-5 text-sm">
          {(analysis.keyPoints || []).map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-1 text-sm font-semibold">Action Items</h4>
        <ul className="list-disc pl-5 text-sm">
          {(analysis.actionItems || []).map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </div>

      {analysis.threadSummary && (
        <div className="rounded bg-slate-50 p-2 text-sm dark:bg-slate-800">
          <strong>Thread summary:</strong> {analysis.threadSummary}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {(analysis.suggestedReplies || []).map((reply) => (
          <div key={reply.style} className="rounded border p-3">
            <p className="font-semibold">{reply.style}</p>
            <p className="text-xs text-slate-500">{reply.subject}</p>
            <p className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-sm">{reply.body}</p>
            <button onClick={() => onUseReply(reply)} className="mt-2 text-sm text-accent">
              Use This Reply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
