import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { authMiddleware as sharedAuthMiddleware } from './middleware/authMiddleware.js';
import authRouter from './routes/auth.js';
import { messageRouter } from './routes/messages.js';
// emailRouter will be loaded dynamically to avoid startup failure on router issues
import { initializePool, testConnection } from './config/mysqlProcedures.js';
import { connectDB } from './config/memoryDb.js';

// =========================
// 1) Création de l'app
// =========================
const app = express();
app.use(express.json());

// chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'public');

// =========================
// 2) Logs et vérifs (que hors test)
// =========================
if (process.env.NODE_ENV !== 'test') {
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
    console.log(`Vérification ${file}:`, fs.existsSync(fullPath) ? 'OK' : 'MANQUANT');
  });
}

// =========================
// 3) Middlewares globaux
// =========================
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// logging seulement hors test
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
    }
    next();
  });
}

// =========================
// 4) Middleware d'auth
// =========================
// Utiliser le middleware partagé pour éviter les dépendances circulaires
export const authMiddleware = sharedAuthMiddleware;

// =========================
// 5) Routes simples
// =========================
app.post('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne' });
});

app.get('/test', (req, res) => {
  res.send('Le serveur fonctionne !');
});

// fichiers statiques (si le dossier existe)
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else {
  // en test on ne tue pas le process
  if (process.env.NODE_ENV !== 'test') {
    console.error("ERREUR: Le dossier public n'existe pas:", publicPath);
  }
}

// =========================
// 6) Fonction de démarrage
// =========================
async function startServer() {
  let mysqlConnected = false;

  // 6.1 init mémoire
  try {
    await connectDB();
    console.log('✓ Stockage mémoire initialisé');
  } catch (err) {
    console.error('✗ Erreur init memoryDb:', err.message);
  }

  // 6.2 init MySQL
  try {
    console.log('🔌 Tentative de connexion à MySQL...');
    await initializePool();
    const isConnected = await testConnection();

    if (isConnected) {
      mysqlConnected = true;
      console.log('✅ MySQL connecté et prêt');
    } else {
      console.log('⚠️ MySQL indisponible - utilisation du stockage mémoire');
    }
  } catch (err) {
    console.log('⚠️ MySQL indisponible - utilisation du stockage mémoire');
  }

  // 6.3 monter les routes API
  app.use('/api', authRouter);
  app.use('/api/messages', messageRouter);
  // Charger emails router dynamiquement pour éviter de bloquer le démarrage en cas d'erreur
  try {
    const { emailRouter } = await import('./routes/emails.gmail.js');
    app.use('/api/emails', emailRouter);
    console.log('✉️  emailRouter monté');
  } catch (e) {
    console.warn('⚠️  emailRouter non monté (erreur au chargement):', e.message);
  }

  // 6.4 routes front
  app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  app.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
  });

  app.get('/register', (req, res) => {
    res.sendFile(path.join(publicPath, 'register.html'));
  });

  // app protégée
  app.get('/app', authMiddleware, (req, res) => {
    res.redirect('/app/dashboard');
  });

  const sendAppPage = (file) => [
    authMiddleware,
    (req, res) => res.sendFile(path.join(publicPath, 'app', file)),
  ];

  app.get('/app/dashboard', ...sendAppPage('dashboard.html'));
  app.get('/app/import', ...sendAppPage('import.html'));
  app.get('/app/generate', ...sendAppPage('generate.html'));
  app.get('/app/send', ...sendAppPage('send.html'));
  app.get('/app/history', ...sendAppPage('history.html'));
  app.get('/app/settings', ...sendAppPage('settings.html'));

  // 404
  app.use((req, res) => {
    res.status(404).send('Page non trouvée');
  });

  // 6.5 écoute
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`\n✅ Serveur démarré sur http://localhost:${port}`);
    if (!mysqlConnected) {
      console.log("⚠️ MySQL non connecté (mode mémoire)");
    }
  });
}

// =========================
// 7) Mode PROD/DEV vs TEST
// =========================
if (process.env.NODE_ENV !== 'test') {
  // on démarre vraiment
  startServer();
} else {
  // en test : on MONTE les routes mais on ne démarre pas le serveur
  app.use('/api', authRouter);
  app.use('/api/messages', messageRouter);
  app.use('/api/emails', emailRouter);
}

// =========================
// 8) Export pour Jest
// =========================
export default app;
