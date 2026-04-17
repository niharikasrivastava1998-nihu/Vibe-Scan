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
      <div className="grid gap-3 md:grid-cols-3">
        <ScoreCard label="Tone" value={`${result.toneScore} (${result.toneLabel})`} detail={result.emotionalImpact} />
        <ScoreCard label="Engagement" value={`${result.engagementScore}/10`} detail={result.engagementReason} />
        <ScoreCard label="Readability" value={result.readabilityScore} detail={`Risk: ${result.misinterpretationRisk?.level}`} />
      </div>
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
    </div>
  );
}
