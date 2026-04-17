import { useEffect, useState } from 'react';
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
import { useRateLimit } from '../hooks/useRateLimit';

export default function Home() {
  const [mode, setMode] = useState('social');
  const [platform, setPlatform] = useState('Twitter/X');
  const [postText, setPostText] = useState('');
  const [emailAnalysis, setEmailAnalysis] = useState(null);
  const [composeSeed, setComposeSeed] = useState(null);
  const [dark, setDark] = useState(false);

  const { loading: postLoading, result: postResult, analyze, setResult: setPostResult } = usePostAnalysis();
  const { loading: emailLoading, analyzeEmail } = useEmailAnalysis();
  const { emails, connectGmail, fetchInbox, connectImap, sendEmail, setEmails } = useEmailConnect();
  const postHistory = useHistory('vibescan_post_history');
  const emailHistory = useHistory('vibescan_email_history');
  const rate = useRateLimit();

  useEffect(() => {
    if (window.location.search.includes('gmail=connected')) {
      toast.success('Gmail connected. Loading inbox...');
      loadGmailInbox();
    }
  }, []);

  const withRateLimit = async (operation) => {
    if (!rate.canAnalyze) {
      toast.error('Rate limit reached (20/hour).');
      return null;
    }
    rate.register();
    return operation();
  };

  const analyzePost = async () => {
    if (!postText.trim()) {
      toast.error('Post text is required');
      return;
    }

    await withRateLimit(async () => {
      try {
        const data = await analyze({ platform, text: postText });
        postHistory.push({
          platform,
          subject: platform,
          text: postText,
          result: data,
        });
      } catch (error) {
        toast.error(error.message);
      }
    });
  };

  const runEmailAnalysis = async (email) => {
    if (!email?.body && !email?.snippet) {
      toast.error('Email body is required for analysis.');
      return null;
    }

    return withRateLimit(async () => {
      try {
        const data = await analyzeEmail({
          sender: email.sender || 'Unknown sender',
          subject: email.subject || 'No subject',
          body: email.body || email.snippet,
          threadHistory: email.threadHistory || '',
        });

        setEmailAnalysis(data);
        emailHistory.push({
          sender: email.sender,
          subject: email.subject,
          analysis: data,
        });

        return data;
      } catch (error) {
        toast.error(error.message);
        return null;
      }
    });
  };

  const classifyUrgency = async (list) => {
    const limited = list.slice(0, 20);
    const enriched = [];

    for (const email of limited) {
      const data = await runEmailAnalysis(email);
      enriched.push({
        ...email,
        urgencyLevel: data?.urgencyLevel || 'Low',
      });
    }

    setEmails(enriched);
  };

  const loadGmailInbox = async () => {
    try {
      const list = await fetchInbox('gmail');
      await classifyUrgency(list);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadImapInbox = async (imapConfig) => {
    try {
      const list = await connectImap(imapConfig);
      await classifyUrgency(list);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const analyzePastedEmail = async (text) => {
    if (!text.trim()) {
      toast.error('Please paste email text first.');
      return;
    }

    await runEmailAnalysis({
      sender: 'Pasted Email',
      subject: 'Manual Input',
      body: text,
      snippet: text.slice(0, 120),
    });
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white p-4 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-accent">VibeScan v2</h1>
            <div className="flex items-center gap-2">
              <ModeToggle mode={mode} setMode={setMode} />
              <button
                className="rounded border px-3 py-2 text-sm"
                onClick={() => setDark((prev) => !prev)}
              >
                {dark ? 'Light' : 'Dark'} mode
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Analyses this hour</span>
              <span>{rate.usage}/{rate.limit}</span>
            </div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
              <div className="h-2 rounded bg-accent" style={{ width: `${Math.min(100, rate.progress)}%` }} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {mode === 'social' ? (
                <>
                  <PostInput
                    platform={platform}
                    setPlatform={setPlatform}
                    text={postText}
                    setText={setPostText}
                    onAnalyze={analyzePost}
                    loading={postLoading}
                  />
                  {postLoading ? (
                    <div className="h-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <PostResults result={postResult} original={postText} />
                  )}
                </>
              ) : (
                <>
                  <EmailConnect
                    onGmail={connectGmail}
                    onLoadGmail={loadGmailInbox}
                    onImap={loadImapInbox}
                    onPaste={analyzePastedEmail}
                  />
                  <EmailList emails={emails} onSelect={runEmailAnalysis} />
                  {emailLoading ? (
                    <div className="h-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <EmailAnalysis analysis={emailAnalysis} onUseReply={setComposeSeed} />
                  )}
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
                  setPostResult(item.result || null);
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
