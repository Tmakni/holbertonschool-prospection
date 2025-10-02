// Fonction "pure" de génération : testable et réutilisable
export function generateMessage({ name, company }) {
  const n = (name || '').trim();
  const c = (company || '').trim();

  if (!n || !c) {
    throw new Error('Missing name or company');
  }

  // Base de 3 templates de messages B2B
  const templates = [
    // Template 1 : Créa de contenu
    `Salut ${n}, j’espère que tu vas bien !  

Je te contacte car j’ai vu ton travail chez ${c}, et je pense qu’on pourrait aller plus loin sur la partie création de contenu.  
On accompagne déjà plusieurs entrepreneurs dans leur stratégie pour booster leur acquisition client.  

Tu serais dispo pour un call rapide cette semaine ?`,

    // Template 2 : Montage vidéo
    `Salut ${n},  

Je suis tombé sur ton contenu et je trouve qu’il a un vrai potentiel.  
Je travaille justement avec des profils comme toi sur le montage et la stratégie vidéo, afin d’obtenir des résultats concrets (pas juste des vues).  

On a collaboré avec différents créateurs, et ça pourrait coller avec ton activité chez ${c}.  
Tu veux qu’on en discute ?`,

    // Template 3 : Approche amicale + preuve sociale
    `Bonjour ${n},  

Moi c’est [Ton prénom], je suis spécialisé en accompagnement B2B.  
On aide déjà des entreprises comme ${c} à mieux structurer leur contenu et accélérer leur acquisition.  
On a notamment bossé avec [Nom1], [Nom2], etc.  

Tu serais dispo cette semaine pour en parler autour d’un call ?`
  ];

  // Choisir un message aléatoire dans la liste
  const message = templates[Math.floor(Math.random() * templates.length)];
  return message;
}

