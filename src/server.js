// src/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMessage } from './utils/generateMessage.js';
import authRouter from './routes/auth.js'; // <-- nouveau

const app = express();
app.use(cors());
app.use(express.json());

// Résolution de chemins en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir les fichiers statiques du dossier public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Monte le routeur d'auth sous /api
app.use('/api', authRouter); // <-- important : active /api/register et /api/login

// Routes front spécifiques
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'app.html'));
});

// API: POST /api/generate -> génère un message
app.post('/api/generate', (req, res) => {
  try {
    const { name, company, template } = req.body || {};
    const message = generateMessage({ name, company, template });
    res.json({ ok: true, message });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Prospection IA -> http://localhost:${PORT}`);
});
