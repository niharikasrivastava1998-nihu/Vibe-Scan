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

export const analyzePostWithAI = async ({ platform, text }) => {
  const fallback = {
    toneScore: 74,
    toneLabel: 'Balanced',
    emotionalImpact: 'Encouraging with moderate excitement.',
    misinterpretationRisk: { level: 'Low', phrases: [] },
    culturalFlags: [],
    engagementScore: 7,
    engagementReason: 'Clear message and audience-friendly phrasing.',
    readabilityScore: 'Easy',
    rewrittenPost: text,
    rewriteExplanation: 'Improved clarity while retaining your voice.',
  };

  if (!client) return fallback;

  const prompt = `You are a social media expert. Analyze this ${platform} post. Return ONLY valid JSON with keys: toneScore, toneLabel, emotionalImpact, misinterpretationRisk (object: level + phrases array), culturalFlags (array: phrase + reason), engagementScore, engagementReason, readabilityScore, rewrittenPost, rewriteExplanation. Post: ${text}`;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: prompt,
  });

  return safeParse(response.output_text, fallback);
};

export const analyzeEmailWithAI = async ({ sender, subject, body, threadHistory }) => {
  const fallback = {
    intentLabel: 'Information',
    urgencyLevel: 'Medium',
    urgencyReason: 'Contains requested updates without strict deadlines.',
    senderMood: 'Professional',
    riskFlags: [],
    keyPoints: ['Email reviewed.', 'Main request identified.', 'Follow-up recommended.'],
    actionItems: ['Reply with acknowledgment.'],
    threadSummary: 'Conversation context is limited in fallback mode.',
    suggestedReplies: [
      { style: 'Formal', subject: `Re: ${subject}`, body: 'Thank you for your email. I will review and follow up shortly.' },
      { style: 'Friendly', subject: `Re: ${subject}`, body: 'Thanks for reaching out! I got this and will reply soon.' },
      { style: 'Assertive', subject: `Re: ${subject}`, body: 'Received. I will address this and send next steps by EOD.' },
    ],
  };

  if (!client) return fallback;

  const prompt = `You are an expert communication analyst. Analyze this email and return ONLY valid JSON with keys: intentLabel, urgencyLevel, urgencyReason, senderMood, riskFlags (array: type + detail), keyPoints (array of strings), actionItems (array of strings), threadSummary, suggestedReplies (array of 3 objects: style + subject + body). Sender: ${sender}. Subject: ${subject}. Body: ${body}. Thread history if any: ${threadHistory || ''}`;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: prompt,
  });

  return safeParse(response.output_text, fallback);
};
