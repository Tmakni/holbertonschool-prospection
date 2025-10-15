import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuration de base
const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'public');

console.log('=== DIAGNOSTIC SERVEUR ===');
console.log('Dossier de travail:', process.cwd());
console.log('Dossier public:', publicPath);
console.log('Le dossier public existe:', fs.existsSync(publicPath) ? 'OUI' : 'NON');

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes de test
app.get('/hello', (req, res) => {
    res.send('Serveur en ligne!');
});

// Fichiers statiques
app.use(express.static(publicPath));

// Route par défaut
app.use('*', (req, res) => {
    res.status(404).send(`
        <h1>Page non trouvée</h1>
        <p>URL: ${req.originalUrl}</p>
        <a href="/debug.html">Page de test</a>
    `);
});

// Démarrage du serveur
const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`
=== SERVEUR DÉMARRÉ ===
Test les URLs suivantes:
1. http://localhost:${port}/hello
2. http://localhost:${port}/debug.html
3. http://127.0.0.1:${port}/hello
`);
});