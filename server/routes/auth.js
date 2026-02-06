import { Router } from 'express';
import argon2 from 'argon2';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, setRefreshCookie, clearRefreshCookie } from '../utils/tokens.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await argon2.hash(password);
    const user = await User.create({ email, password: hashedPassword, name });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) });
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) });
    user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.some(rt => rt.token === token)) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) });
    await user.save();

    const accessToken = generateAccessToken(user);
    setRefreshCookie(res, newRefreshToken);
    res.json({ accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
        await user.save();
      }
    }
  } catch (err) {
    // Ignore token errors on logout
  }
  clearRefreshCookie(res);
  res.json({ message: 'Logged out' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
