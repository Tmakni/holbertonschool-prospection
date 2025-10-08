import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/memoryDb.js';
import authRouter from './routes/auth.js';
import { messageRouter } from './routes/messages.js';
import jwt from 'jsonwebtoken';
import { generateMessage } from './utils/generateMessage.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Connexion à la base de données
connectDB().catch(console.error);

// CORS et middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// paths ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// statics
app.use(express.static(path.join(__dirname, '..', 'public')));

// auth routes
app.use('/api', authRouter);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_very_secret';

// middleware auth réutilisable
export function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      if (req.accepts && req.accepts('html')) return res.redirect('/login.html');
      return res.status(401).json({ ok: false, error: 'not_authenticated' });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    if (req.accepts && req.accepts('html')) return res.redirect('/login.html');
    return res.status(401).json({ ok: false, error: 'invalid_token' });
  }
}

// protected example
app.post('/api/generate', authMiddleware, (req, res) => {
  try {
    const { name, company, template } = req.body || {};
    const message = generateMessage({ name, company, template });
    res.json({ ok: true, message });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.get('/api/me', authMiddleware, (req, res) => res.json({ ok: true, user: req.user }));

// Protection de toutes les routes /app/* 
app.use('/app', authMiddleware);

// Routes principales
app.get('/', async (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.redirect('/app');
        } catch (err) {
            // Token invalide, supprimer le cookie
            res.clearCookie('token');
        }
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'app.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Prospection IA -> http://localhost:${PORT}`));
