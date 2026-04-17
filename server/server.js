import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import analyzeRoutes from './routes/analyze.js';
import emailRoutes from './routes/email.js';
import authRoutes, { configurePassport } from './routes/auth.js';

dotenv.config();

const app = express();
configurePassport(passport);

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded: max 20 analyses/hour.' },
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', name: 'VibeScan v2 API' });
});

app.use('/api/analyze', analysisLimiter, analyzeRoutes);
app.use('/api/email', emailRoutes);
app.use('/auth', authRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`VibeScan API running on port ${port}`);
});
