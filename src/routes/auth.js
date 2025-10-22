import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_very_secret';
const JWT_EXPIRES = '7d';

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation des champs
        if (!email || !password || !name) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Tous les champs sont requis' 
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Cet email est déjà utilisé' 
            });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer l'utilisateur
        const user = await createUser({
            email,
            password: hashedPassword,
            name
        });

        // Générer le token
        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            path: '/'
        });

        return res.json({
            ok: true,
            user: { 
                id: user._id, 
                email: user.email,
                name: user.name 
            },
            redirect: '/app'
        });
    } catch (err) {
        console.error('register error', err);
        return res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'email et password requis' });

    const emailLower = String(email).trim().toLowerCase();
    const user = await findUserByEmail(emailLower);
    if (!user) return res.status(401).json({ ok: false, error: 'identifiants invalides' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ ok: false, error: 'identifiants invalides' });

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
      // secure: true // active seulement en prod HTTPS
    });

    return res.json({ ok: true, user: { id: user.id, email: user.email }, redirect: '/app' });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ ok: false, error: 'erreur serveur' });
  }
});

// logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ ok: true });
});

// Get current user
router.get('/user', (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ ok: false, error: 'non authentifié' });
    
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, user: payload });
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'token invalide' });
  }
});

export default router;
