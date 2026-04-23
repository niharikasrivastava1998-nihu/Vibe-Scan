import toast from 'react-hot-toast';
import ScoreCard from './ScoreCard';

export default function PostResults({ result, original }) {
  if (!result) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(result.rewrittenPost || '');
    toast.success('Rewrite copied');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ScoreCard label="Viral Chance" value={`${result.viralProbability ?? 0}%`} detail={result.estimatedReach} />
        <ScoreCard label="Engagement" value={`${result.engagementScore}/10`} detail={result.engagementReason} />
        <ScoreCard label="Tone" value={`${result.toneScore} (${result.toneLabel})`} detail={result.emotionalImpact} />
        <ScoreCard label="CTA Strength" value={`${result.ctaStrength ?? 0}/10`} detail={`Window: ${result.reachWindow || '24-72 hours'}`} />
      </div>

      {result.postSummary && (
        <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          <strong>Pre-post summary:</strong> {result.postSummary}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="font-semibold">Original</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm">{original}</p>
        </div>
        <div className="rounded-xl border border-accent p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">AI Rewrite</h3>
            <button onClick={copy} className="text-sm text-accent">Copy</button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{result.rewrittenPost}</p>
          <p className="mt-2 text-xs text-slate-500">{result.rewriteExplanation}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-900/20">
          <h4 className="mb-1 text-sm font-semibold">Strengths</h4>
          <ul className="list-disc pl-5 text-sm">
            {(result.strengths || []).map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-900/20">
          <h4 className="mb-1 text-sm font-semibold">Improve before posting</h4>
          <ul className="list-disc pl-5 text-sm">
            {(result.improvements || []).map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
