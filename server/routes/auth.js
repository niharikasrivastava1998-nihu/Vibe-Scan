import { Router } from 'express';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = Router();

export const configurePassport = (passport) => {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, { profile, tokens: { access_token: accessToken, refresh_token: refreshToken } });
      },
    ),
  );
};

router.get('/google', (req, res, next) => {
  if (!req._passport?.instance?._strategies?.google) {
    return res.status(501).json({ error: 'Google OAuth not configured.' });
  }
  return req._passport.instance.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!req._passport?.instance?._strategies?.google) {
    return res.status(501).json({ error: 'Google OAuth not configured.' });
  }

  return req._passport.instance.authenticate('google', { failureRedirect: '/' })(req, res, () => {
    res.redirect('http://localhost:5173?gmail=connected');
  });
});

export default router;
