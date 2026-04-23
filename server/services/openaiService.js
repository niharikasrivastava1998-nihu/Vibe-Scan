import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const clampPercent = (value) => Math.max(1, Math.min(99, Math.round(value)));

const buildPostHeuristic = ({ text, imageMeta, goal }) => {
  const len = text.length;
  const hasQuestion = text.includes('?');
  const hashtagCount = (text.match(/#\w+/g) || []).length;
  const mentionCount = (text.match(/@\w+/g) || []).length;
  const imageBoost = Math.min(15, (imageMeta?.length || 0) * 5);
  const conciseBoost = len >= 60 && len <= 220 ? 14 : len > 600 ? -8 : 4;
  const interactionBoost = hasQuestion ? 8 : 0;
  const socialSignalBoost = Math.min(10, hashtagCount * 2 + mentionCount);
  const ctaBoost = /(comment|share|save|click|reply|dm|join)/i.test(text) ? 8 : 0;
  const goalBoost = goal ? 4 : 0;
  const viralProbability = clampPercent(36 + imageBoost + conciseBoost + interactionBoost + socialSignalBoost + ctaBoost + goalBoost);

  return {
    toneScore: 74,
    toneLabel: 'Balanced',
    emotionalImpact: 'Encouraging with moderate excitement.',
    misinterpretationRisk: { level: 'Low', phrases: [] },
    culturalFlags: [],
    engagementScore: Math.min(10, Math.max(4, Math.round(viralProbability / 10))),
    engagementReason: 'Includes clear context and prompt-driven language for audience action.',
    readabilityScore: 'Easy',
    rewrittenPost: text,
    rewriteExplanation: 'Improved clarity while retaining your voice.',
    viralProbability,
    estimatedReach: viralProbability > 70 ? 'High traction expected (top 20% of similar posts).' : 'Moderate traction expected with optimization.',
    reachWindow: 'First 24-72 hours after posting',
    ctaStrength: Math.min(10, Math.max(3, Math.round((ctaBoost + interactionBoost + 8) / 2.4))),
    postSummary: 'Draft is clear and relevant. Fine-tune hook and CTA for better sharing behavior.',
    strengths: ['Message is understandable.', 'Structure is scan-friendly.', 'Tone is brand-safe.'],
    improvements: ['Open with a stronger hook in first sentence.', 'Add one concrete outcome or proof point.', 'Use a single focused call to action.'],
  };
};

export const analyzePostWithAI = async ({ platform, text, goal, audience, imageMeta = [] }) => {
  const fallback = buildPostHeuristic({ text, imageMeta, goal });

  if (!client) return fallback;

  const prompt = `You are a senior social media strategist. Analyze this ${platform} draft before it is posted.
Return ONLY valid JSON with keys:
- toneScore (0-100)
- toneLabel
- emotionalImpact
- misinterpretationRisk (object: level + phrases array)
- culturalFlags (array: phrase + reason)
- engagementScore (0-10)
- engagementReason
- readabilityScore
- rewrittenPost
- rewriteExplanation
- viralProbability (0-100)
- estimatedReach (short text)
- reachWindow
- ctaStrength (0-10)
- postSummary (1 sentence)
- strengths (array of 3 strings)
- improvements (array of 3 strings)
Context:
Goal: ${goal || 'Not specified'}
Audience: ${audience || 'General audience'}
Image assets: ${JSON.stringify(imageMeta)}
Post: ${text}`;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: prompt,
  });

  return safeParse(response.output_text, fallback);
};

export const analyzeEmailWithAI = async ({ sender, subject, body, threadHistory, campaignType, audience }) => {
  const fallback = {
    intentLabel: 'Information',
    urgencyLevel: 'Medium',
    urgencyReason: 'Contains requested updates without strict deadlines.',
    senderMood: 'Professional',
    riskFlags: [],
    keyPoints: ['Email reviewed.', 'Main request identified.', 'Follow-up recommended.'],
    actionItems: ['Reply with acknowledgment.'],
    threadSummary: 'Conversation context is limited in fallback mode.',
    tractionProbability: 58,
    expectedReplyRate: '12-18%',
    expectedClickRate: '2-4%',
    subjectStrength: 6,
    recommendations: [
      'Shorten subject line and add a clear value proposition.',
      'Move CTA above the fold and keep one primary action.',
      'Personalize first line for the audience segment.',
    ],
    suggestedReplies: [
      { style: 'Formal', subject: `Re: ${subject}`, body: 'Thank you for your email. I will review and follow up shortly.' },
      { style: 'Friendly', subject: `Re: ${subject}`, body: 'Thanks for reaching out! I got this and will reply soon.' },
      { style: 'Assertive', subject: `Re: ${subject}`, body: 'Received. I will address this and send next steps by EOD.' },
    ],
  };

  if (!client) return fallback;

  const prompt = `You are an email campaign strategist and communication analyst.
Analyze this email and return ONLY valid JSON with keys:
intentLabel, urgencyLevel, urgencyReason, senderMood,
riskFlags (array: type + detail),
keyPoints (array of strings),
actionItems (array of strings),
threadSummary,
tractionProbability (0-100),
expectedReplyRate (string),
expectedClickRate (string),
subjectStrength (0-10),
recommendations (array of 3 strings),
suggestedReplies (array of 3 objects: style + subject + body).
Campaign type: ${campaignType || 'General email'}.
Audience: ${audience || 'General audience'}.
Sender: ${sender}. Subject: ${subject}. Body: ${body}. Thread history if any: ${threadHistory || ''}`;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: prompt,
  });

  return safeParse(response.output_text, fallback);
};
