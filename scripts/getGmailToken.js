import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';

// Configure avec tes credentials OAuth2 de Google Cloud Console
const CLIENT_ID = 'YOUR_GMAIL_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_GMAIL_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Génère l'URL d'autorisation
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force l'affichage du consentement pour obtenir le refresh token
});

console.log('\n🔐 Configuration Gmail API OAuth2\n');
console.log('1. Un serveur local va démarrer sur http://localhost:3000');
console.log('2. Ouvre cette URL dans ton navigateur:\n');
console.log(authUrl + '\n');
console.log('3. Autorise l\'application');
console.log('4. Tu seras redirigé automatiquement et le token sera affiché ici\n');
console.log('Attente de l\'autorisation...\n');

// Créer un serveur HTTP temporaire pour capturer le code
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:3000`);
    
    if (url.pathname === '/oauth2callback') {
      const code = url.searchParams.get('code');
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>❌ Erreur: Code non reçu</h1>');
        server.close();
        return;
      }

      // Échanger le code contre des tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      // Afficher la page de succès
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head><title>Succès!</title></head>
          <body style="font-family: Arial; padding: 50px; text-align: center;">
            <h1>✅ Autorisation réussie!</h1>
            <p>Tu peux fermer cette fenêtre et retourner au terminal.</p>
          </body>
        </html>
      `);
      
      // Afficher les tokens dans le terminal
      console.log('\n✅ Tokens obtenus avec succès!\n');
      console.log('Ajoute ces valeurs dans ton fichier .env:\n');
      console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
      console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log(`GMAIL_USER_EMAIL=ton_email@gmail.com`);
      console.log('\n');
      
      // Fermer le serveur
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>❌ Erreur lors de l\'authentification</h1>');
    server.close();
    process.exit(1);
  }
});

server.listen(3000, () => {
  console.log('Serveur de callback démarré sur http://localhost:3000');
});
