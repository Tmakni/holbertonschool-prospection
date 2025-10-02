// src/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, addUser } from '../utils/usersStore.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_very_secret';
const JWT_EXPIRES = '7d';

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'email et password requis' });

    const emailLower = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return res.status(400).json({ ok: false, error: 'email invalide' });
    }

    const existing = await findUserByEmail(emailLower);
    if (existing) return res.status(409).json({ ok: false, error: 'un compte avec cet email existe déjà' });

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const user = {
      id: Date.now().toString(),
      email: emailLower,
      passwordHash: hashed,
      createdAt: new Date().toISOString()
    };

    await addUser(user);
    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ ok: false, error: 'erreur serveur' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'email et password requis' });

    const emailLower = String(email).trim().toLowerCase();
    console.log('login attempt for', emailLower);

    const user = await findUserByEmail(emailLower);
    console.log('found user?', !!user);
    if (!user) return res.status(401).json({ ok: false, error: 'identifiants invalides' });

    const match = await bcrypt.compare(password, user.passwordHash);
    console.log('password match?', match);
    if (!match) return res.status(401).json({ ok: false, error: 'identifiants invalides' });

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({ ok: true, user: { id: user.id, email: user.email, createdAt: user.createdAt }, token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ ok: false, error: 'erreur serveur' });
  }
});

export default router;
