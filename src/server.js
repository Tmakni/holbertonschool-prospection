import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';
import { messageRouter } from './routes/messages.js';
import { connectDB } from './config/memoryDb.js';

// Configuration de base
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'public');

// Vérification des fichiers critiques
console.log('=== DIAGNOSTIC DÉMARRAGE ===');
console.log('Dossier actuel:', process.cwd());
console.log('Dossier public:', publicPath);

const filesToCheck = [
    'index.html',
    'login.html',
    'register.html',
    'app/dashboard.html'
];

filesToCheck.forEach(file => {
    const fullPath = path.join(publicPath, file);
    console.log(`Vérifification ${file}:`, fs.existsSync(fullPath) ? 'OK' : 'MANQUANT');
});

// Middleware
// express.json already applied above
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Logging détaillé
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Auth middleware (vérifie le cookie JWT)
export function authMiddleware(req, res, next) {
    try {
        const token = req.cookies && req.cookies.token;
        if (!token) return res.status(401).json({ ok: false, error: 'non authentifié' });
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme_very_secret');
        req.user = payload;
        next();
    } catch (err) {
        console.warn('authMiddleware error', err && err.message);
        return res.status(401).json({ ok: false, error: 'token invalide' });
    }
}

// Route de test simple pour l'API
app.post('/api/test', (req, res) => {
    console.log('Test API appelé');
    res.json({ message: 'API fonctionne' });
});

if (!fs.existsSync(publicPath)) {
    console.error('ERREUR: Le dossier public n\'existe pas:', publicPath);
    process.exit(1);
}

// Route de test basique
app.get('/test', (req, res) => {
    res.send('Le serveur fonctionne !');
});

// Servir les fichiers statiques
app.use(express.static(publicPath));

// Avant de monter les routes API et démarrer le serveur, s'assurer que la DB (mémoire) est prête
connectDB().then(() => {
    // Monter les routes API
    app.use('/api', authRouter);
    app.use('/api/messages', messageRouter);

    // Routes principales
    app.get('/', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });

    // Raccourcis pour les URLs sans extension utilisées par le front
    app.get('/login', (req, res) => {
        res.sendFile(path.join(publicPath, 'login.html'));
    });

    app.get('/register', (req, res) => {
        res.sendFile(path.join(publicPath, 'register.html'));
    });

    // Landing de l'app (tableau de bord statique pour dev)
    app.get('/app', authMiddleware, (req, res) => {
        res.redirect('/app/dashboard');
    });

    const sendAppPage = (file) => [authMiddleware, (req, res) => res.sendFile(path.join(publicPath, 'app', file))];

    // Routes protégées de l'application
    app.get('/app/dashboard', ...sendAppPage('dashboard.html'));
    app.get('/app/import', ...sendAppPage('import.html'));
    app.get('/app/generate', ...sendAppPage('generate.html'));
    app.get('/app/send', ...sendAppPage('send.html'));
    app.get('/app/history', ...sendAppPage('history.html'));
    app.get('/app/settings', ...sendAppPage('settings.html'));

    // Gestion des 404 (doit être la dernière route)
    app.use((req, res) => {
        res.status(404).send('Page non trouvée');
    });

    // Démarrage du serveur
    const port = 3000;
    app.listen(port, '0.0.0.0', () => {
        console.log(`Serveur démarré sur http://localhost:${port}`);
        console.log(`Vous pouvez aussi essayer : http://127.0.0.1:${port}`);
    });

}).catch(err => {
    console.error('Impossible d\'initialiser la base:', err);
    process.exit(1);
});
