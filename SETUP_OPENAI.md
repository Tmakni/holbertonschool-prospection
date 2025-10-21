# ✨ Intégration OpenAI - Guide de configuration

## 1️⃣ Obtenir une clé API OpenAI

1. Va sur https://platform.openai.com/api-keys
2. Clique sur "Create new secret key"
3. Copie la clé (tu ne pourras pas la voir à nouveau !)
4. Colle-la dans ton `.env` :

```bash
OPENAI_API_KEY=sk-XYZ...
```

## 2️⃣ Fichiers modifiés/créés

✅ **Créés :**
- `src/utils/openaiService.js` - Service d'intégration OpenAI
- `OPENAI_INTEGRATION.md` - Documentation complète des API
- `testOpenAI.sh` - Script de test

✅ **Modifiés :**
- `src/routes/messages.js` - Nouvelles routes avec OpenAI
- `src/models/Message.js` - Nouveaux champs (objective, campaign)

## 3️⃣ Nouvelles routes API

### POST `/api/messages/generate`
Génère un message avec OpenAI basé sur :
- Contact (name, company)
- Ton du message
- Objectif (rendez-vous, relance, présentation)
- Campagne
- Points clés à mentionner
- Contexte additionnel

**Exemple :**
```bash
curl -X POST http://localhost:3000/api/messages/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "contactId": "contact-123",
    "tone": "Professionnel & cordial",
    "objective": "Prise de rendez-vous",
    "campaign": "Q4 2025",
    "highlights": ["Succès client", "SaaS"],
    "useAI": true
  }'
```

### POST `/api/messages/generate-variations`
Génère 2-5 variations d'un même message pour A/B testing.

**Exemple :**
```bash
curl -X POST http://localhost:3000/api/messages/generate-variations \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "contactId": "contact-123",
    "tone": "Convaincant",
    "count": 3
  }'
```

### GET `/api/messages`
Récupère l'historique des messages générés par l'utilisateur.

## 4️⃣ Utilisation dans le Frontend

Dans `public/app/generate.html`, ajoute ceci au bouton "Générer le message" :

```javascript
async function generateMessage() {
  try {
    const response = await fetch('/api/messages/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactId: document.querySelector('[name="contact"]').value,
        tone: document.querySelector('[name="tone"]').value,
        objective: document.querySelector('[name="objective"]').value,
        campaign: document.querySelector('[name="campaign"]').value,
        highlights: Array.from(document.querySelectorAll('.highlight-btn.selected'))
          .map(btn => btn.textContent),
        additionalContext: document.querySelector('textarea').value,
        useAI: true
      })
    });

    const result = await response.json();
    if (result.ok) {
      // Affiche le message généré
      document.querySelector('.apercu-ia p').textContent = result.message.content;
    } else {
      alert('Erreur: ' + result.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la génération');
  }
}
```

## 5️⃣ Tester l'intégration

```bash
# Démarrer le serveur
npm start

# Dans une autre terminal, lancer les tests
bash testOpenAI.sh
```

## 6️⃣ Informations importantes

### Modèle utilisé
- **GPT-3.5-turbo** : Bon rapport qualité/prix, latence basse (~1 sec)
- Alternative : GPT-4 (meilleur mais plus lent et cher)

### Coûts
- ~$0.0002 à $0.0005 par message généré
- 1 API key peut coûter $5-10/mois avec utilisation modérée

### Fallback
Si OpenAI échoue :
```javascript
// Le système retournera automatiquement un message basique
"useAI": false  // Force l'utilisation des templates
```

## 7️⃣ Prochaines étapes

1. ✅ Configurer la clé OpenAI dans `.env`
2. ✅ Tester les routes avec `testOpenAI.sh`
3. 🔄 **Intégrer les boutons dans `public/app/generate.html`** (À faire)
4. 🔄 **Ajouter la sélection des contacts** (À faire)
5. 🔄 **Implémenter l'affichage des variations** (À faire)

## 📞 Support

Si tu as des erreurs :

1. **"API key not found"** → Ajoute la clé dans `.env`
2. **"Invalid API key"** → Vérifie que la clé commence par `sk-`
3. **"Rate limit exceeded"** → Tu as trop d'appels, attends quelques minutes
4. **"Contact not found"** → Assure-toi que le contact existe

---

**Prêt à générer tes messages avec l'IA ! 🚀**
