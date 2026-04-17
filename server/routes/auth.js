import { Router } from 'express';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = Router();

export const configurePassport = (passport) => {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
        accessType: 'offline',
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, {
          profile,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        });
      },
    ),
  );
};

const googleNotConfigured = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ error: 'Google OAuth not configured.' });
  }
  return next();
};

router.get(
  '/google',
  googleNotConfigured,
  (req, res, next) => {
    const frontEndRedirect = req.query.redirect || 'http://localhost:5173';
    req.session.frontEndRedirect = frontEndRedirect;
    next();
  },
  (req, res, next) => req._passport.instance.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent',
  })(req, res, next),
);

router.get('/google/callback', googleNotConfigured, (req, res, next) => {
  req._passport.instance.authenticate('google', { failureRedirect: '/' })(req, res, () => {
    const redirectUrl = req.session.frontEndRedirect || 'http://localhost:5173';
    res.redirect(`${redirectUrl}?gmail=connected`);
  });
});

router.get('/me', (req, res) => {
  res.json({
    connected: Boolean(req.user?.tokens?.access_token),
    profile: req.user?.profile || null,
  });
});

export default router;
