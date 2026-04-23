import { Router } from 'express';
import { analyzeEmailWithAI, analyzePostWithAI } from '../services/openaiService.js';

const router = Router();

router.post('/post', async (req, res) => {
  const { platform, text, goal, audience, imageMeta } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Post text is required.' });
  }

  try {
    const result = await analyzePostWithAI({
      platform: platform || 'Twitter/X',
      text,
      goal,
      audience,
      imageMeta: Array.isArray(imageMeta) ? imageMeta : [],
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Post analysis failed.', detail: error.message });
  }
});

router.post('/email', async (req, res) => {
  const { subject, sender, body, threadHistory, campaignType, audience } = req.body;
  if (!subject || !sender || !body) {
    return res.status(400).json({ error: 'subject, sender, and body are required.' });
  }

  try {
    const result = await analyzeEmailWithAI({ subject, sender, body, threadHistory, campaignType, audience });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Email analysis failed.', detail: error.message });
  }
});

export default router;
