import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ModeToggle from '../components/ModeToggle';
import PostInput from '../components/PostInput';
import PostResults from '../components/PostResults';
import EmailConnect from '../components/EmailConnect';
import EmailList from '../components/EmailList';
import EmailAnalysis from '../components/EmailAnalysis';
import ReplyComposer from '../components/ReplyComposer';
import HistorySidebar from '../components/HistorySidebar';
import { usePostAnalysis } from '../hooks/usePostAnalysis';
import { useEmailAnalysis } from '../hooks/useEmailAnalysis';
import { useEmailConnect } from '../hooks/useEmailConnect';
import { useHistory } from '../hooks/useHistory';

const HOUR = 60 * 60 * 1000;

export default function Home() {
  const [mode, setMode] = useState('social');
  const [platform, setPlatform] = useState('Twitter/X');
  const [postText, setPostText] = useState('');
  const [emailAnalysis, setEmailAnalysis] = useState(null);
  const [composeSeed, setComposeSeed] = useState(null);
  const [dark, setDark] = useState(false);
  const [hits, setHits] = useState([]);

  const { loading: postLoading, result: postResult, analyze } = usePostAnalysis();
  const { loading: emailLoading, analyzeEmail } = useEmailAnalysis();
  const { emails, connectGmail, fetchInbox, connectImap, sendEmail, setEmails } = useEmailConnect();
  const postHistory = useHistory('vibescan_post_history');
  const emailHistory = useHistory('vibescan_email_history');

  const addHit = () => setHits((prev) => [...prev.filter((t) => Date.now() - t < HOUR), Date.now()]);
  const usage = useMemo(() => Math.min(20, hits.filter((t) => Date.now() - t < HOUR).length), [hits]);

  const analyzePost = async () => {
    if (!postText.trim()) return toast.error('Post text is required');
    if (usage >= 20) return toast.error('Rate limit reached');
    addHit();
    try {
      const data = await analyze({ platform, text: postText });
      postHistory.push({ platform, text: postText, result: data, subject: platform });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const runEmailAnalysis = async (email) => {
    if (usage >= 20) return toast.error('Rate limit reached');
    addHit();
    try {
      const data = await analyzeEmail({
        sender: email.sender || 'Unknown',
        subject: email.subject || 'No subject',
        body: email.body || email.snippet || '',
      });
      setEmailAnalysis(data);
      emailHistory.push({ sender: email.sender, subject: email.subject, analysis: data });
      return data;
    } catch (e) {
      toast.error(e.message);
      return null;
    }
  };

  const loadGmail = async () => {
    try {
      const list = await fetchInbox('gmail');
      const enriched = await Promise.all(list.map(async (e) => ({ ...e, urgencyLevel: (await runEmailAnalysis(e))?.urgencyLevel || 'Low' })));
      setEmails(enriched);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const loadImap = async (imap) => {
    try {
      const list = await connectImap(imap);
      const enriched = await Promise.all(list.map(async (e) => ({ ...e, urgencyLevel: (await runEmailAnalysis(e))?.urgencyLevel || 'Low' })));
      setEmails(enriched);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white p-4 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-accent">VibeScan v2</h1>
            <div className="flex items-center gap-2">
              <ModeToggle mode={mode} setMode={setMode} />
              <button className="rounded border px-3 py-2 text-sm" onClick={() => setDark((d) => !d)}>{dark ? 'Light' : 'Dark'} mode</button>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs"><span>Analyses this hour</span><span>{usage}/20</span></div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded bg-accent" style={{ width: `${(usage / 20) * 100}%` }} /></div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {mode === 'social' ? (
                <>
                  <PostInput platform={platform} setPlatform={setPlatform} text={postText} setText={setPostText} onAnalyze={analyzePost} loading={postLoading} />
                  {postLoading ? <div className="h-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <PostResults result={postResult} original={postText} />}
                </>
              ) : (
                <>
                  <EmailConnect onGmail={connectGmail} onImap={loadImap} onPaste={(text) => runEmailAnalysis({ sender: 'Pasted', subject: 'Manual Paste', body: text })} />
                  <button onClick={loadGmail} className="rounded border px-3 py-2 text-sm">Load Gmail Inbox</button>
                  <EmailList emails={emails} onSelect={runEmailAnalysis} />
                  {emailLoading ? <div className="h-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <EmailAnalysis analysis={emailAnalysis} onUseReply={setComposeSeed} />}
                  {composeSeed && <ReplyComposer seed={composeSeed} onSend={sendEmail} />}
                </>
              )}
            </motion.main>

            <HistorySidebar
              title={mode === 'social' ? 'Post History' : 'Email History'}
              items={mode === 'social' ? postHistory.items : emailHistory.items}
              onSelect={(item) => {
                if (mode === 'social') {
                  setPostText(item.text || '');
                } else {
                  setEmailAnalysis(item.analysis || null);
                }
              }}
              onClear={mode === 'social' ? postHistory.clear : emailHistory.clear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
