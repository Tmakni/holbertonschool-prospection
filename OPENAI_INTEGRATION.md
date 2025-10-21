# OpenAI Integration - Message Generation

## Configuration

1. **Ajoute ta clé OpenAI** dans le fichier `.env` :
```bash
OPENAI_API_KEY=sk-ton-api-key-ici
```

Obtiens une clé gratuite sur : https://platform.openai.com/api-keys

2. **Les routes disponibles** :

### `POST /api/messages/generate`
Génère un seul message de prospection personnalisé avec OpenAI.

**Payload :**
```json
{
  "contactId": "contact-uuid",
  "tone": "Professionnel & cordial",
  "objective": "Prise de rendez-vous",
  "campaign": "Découverte Q4",
  "highlights": ["Succès récent du client", "Cas d'usage SaaS", "Invitation démo"],
  "additionalContext": "Le client travaille dans le secteur FinTech",
  "useAI": true
}
```

**Paramètres :**
- `contactId` (requis) : ID du contact
- `tone` : Ton du message parmi :
  - "Professionnel & cordial"
  - "Convaincant"
  - "Informel"
  - "Direct & synthétique"
- `objective` : Objectif du message :
  - "Prise de rendez-vous"
  - "Relance"
  - "Présentation produit"
- `campaign` : Nom de la campagne
- `highlights` : Points clés à mentionner (array)
- `additionalContext` : Instructions supplémentaires
- `useAI` : Utiliser OpenAI (true) ou fallback basique (false)

**Réponse :**
```json
{
  "ok": true,
  "message": {
    "_id": "message-uuid",
    "userId": "user-uuid",
    "contactId": "contact-uuid",
    "content": "Bonjour Marie,\n\nJ'ai suivi votre dernière levée de fonds...",
    "tone": "Professionnel & cordial",
    "objective": "Prise de rendez-vous",
    "campaign": "Découverte Q4",
    "createdAt": "2025-10-21T12:34:56.789Z"
  }
}
```

### `POST /api/messages/generate-variations`
Génère plusieurs variations d'un message pour tester différentes approches.

**Payload :**
```json
{
  "contactId": "contact-uuid",
  "tone": "Professionnel & cordial",
  "objective": "Prise de rendez-vous",
  "campaign": "Découverte Q4",
  "highlights": ["Succès récent du client"],
  "count": 3
}
```

**Paramètres :**
- Mêmes que `/generate` sauf :
- `count` : Nombre de variations (max 5)

**Réponse :**
```json
{
  "ok": true,
  "variations": [
    "Bonjour Marie, j'ai suivi votre...",
    "Hi Marie, I noticed your recent...",
    "Salut Marie, ton travail chez..."
  ]
}
```

### `GET /api/messages`
Récupère l'historique des messages générés.

**Réponse :**
```json
{
  "ok": true,
  "messages": [
    {
      "_id": "message-uuid",
      "userId": "user-uuid",
      "contactId": "contact-uuid",
      "content": "...",
      "tone": "Professionnel & cordial",
      "objective": "Prise de rendez-vous",
      "campaign": "Découverte Q4",
      "createdAt": "2025-10-21T12:34:56.789Z"
    }
  ]
}
```

## Exemple cURL

```bash
# Générer un message
curl -X POST http://localhost:3000/api/messages/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "contactId": "contact-123",
    "tone": "Professionnel & cordial",
    "objective": "Prise de rendez-vous",
    "campaign": "Découverte Q4",
    "highlights": ["Succès récent"],
    "useAI": true
  }'

# Générer des variations
curl -X POST http://localhost:3000/api/messages/generate-variations \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "contactId": "contact-123",
    "tone": "Convaincant",
    "count": 3
  }'
```

## Utilisation dans le Frontend

Dans `public/app/generate.html`, tu peux ajouter un appel API :

```javascript
// Dans le bouton "Générer le message"
async function generateMessage() {
  const formData = {
    contactId: document.querySelector('select[name="contact"]').value,
    tone: document.querySelector('select[name="tone"]').value,
    objective: document.querySelector('select[name="objective"]').value,
    campaign: document.querySelector('select[name="campaign"]').value,
    highlights: Array.from(document.querySelectorAll('.highlight-btn.selected')).map(btn => btn.textContent),
    additionalContext: document.querySelector('textarea').value,
    useAI: true
  };

  const response = await fetch('/api/messages/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const result = await response.json();
  if (result.ok) {
    document.querySelector('.apercu-ia').textContent = result.message.content;
  } else {
    alert('Erreur: ' + result.error);
  }
}
```

## Coûts

OpenAI facture par tokens utilisés. Les prix actuels (approximatifs) :
- **GPT-3.5-turbo** : ~$0.0005 par 1000 tokens (entrée), ~$0.0015 par 1000 tokens (sortie)
- Un message = ~100-200 tokens

Un message coûte environ **$0.0002 à $0.0005**

## Fallback

Si OpenAI échoue ou si `useAI: false`, le système retournera un message généré avec les templates basiques.
