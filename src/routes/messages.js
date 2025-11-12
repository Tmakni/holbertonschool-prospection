import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { generateMessage } from '../utils/generateMessage.js';
import { generateMessageWithAI } from '../utils/openaiService.js';
import messagesAPI from '../api/messagesApi.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Générer un message avec OpenAI
router.post('/generate', async (req, res) => {
    try {
        const { 
            name,
            company,
            tone = 'Professionnel & cordial',
            objective = 'Prise de rendez-vous',
            highlights = [],
            additionalContext = '',
            useAI = true
        } = req.body;
        
        if (!name || !company) {
            return res.status(400).json({ ok: false, error: 'name et company requis' });
        }

        let content;        
        if (useAI && process.env.OPENAI_API_KEY) {
            try {
                // Utiliser OpenAI
                content = await generateMessageWithAI({
                    name,
                    company,
                    objective,
                    tone,
                    highlights: Array.isArray(highlights) ? highlights : [],
                    additionalContext
                });
            } catch (aiError) {
                console.warn('OpenAI failed, falling back to template:', aiError.message);
                // Fallback sur template basique
                content = generateMessage({ name, company });
            }
        } else {
            // Utiliser la génération basique
            content = generateMessage({ name, company });
        }

        // Sauvegarder le message avec l'API MySQL native
        const message = await messagesAPI.createMessage({
            userId: req.user.id || req.user.email,
            contactId: null,
            content,
            tone,
            objective,
            generatedBy: useAI ? 'ai' : 'template'
        });

        // Logger l'appel AI si applicable
        if (useAI && process.env.OPENAI_API_KEY) {
            await messagesAPI.logAICall(
                req.user.id || req.user.email,
                message.id,
                'success',
                null,
                Math.ceil(content.length / 4) // Estimation approximative des tokens
            );
        }

        res.json({ ok: true, message });
    } catch (error) {
        console.error('Message generation error:', error);
        res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
    }
});




// Récupérer l'historique des messages
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const messages = await messagesAPI.getMessagesByUser(
            req.user.id || req.user.email,
            parseInt(limit),
            parseInt(offset)
        );
        res.json({ ok: true, messages });
    } catch (error) {
        console.error('Erreur récupération messages:', error);
        res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }
});

// Récupérer les statistiques des messages
router.get('/stats', async (req, res) => {
    try {
        const stats = await messagesAPI.getMessageStats(req.user.id || req.user.email);
        res.json({ ok: true, stats });
    } catch (error) {
        console.error('Erreur statistiques messages:', error);
        res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }
});

// Rechercher dans les messages
router.get('/search', async (req, res) => {
    try {
        const { q: searchTerm, limit = 20 } = req.query;
        
        if (!searchTerm) {
            return res.status(400).json({ ok: false, error: 'Terme de recherche requis' });
        }

        const messages = await messagesAPI.searchMessages(
            req.user.id || req.user.email,
            searchTerm,
            parseInt(limit)
        );
        
        res.json({ ok: true, messages, searchTerm });
    } catch (error) {
        console.error('Erreur recherche messages:', error);
        res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }
});

// Récupérer un message spécifique
router.get('/:id', async (req, res) => {
    try {
        const message = await messagesAPI.getMessageById(req.params.id);
        
        if (!message) {
            return res.status(404).json({ ok: false, error: 'Message non trouvé' });
        }

        // Vérifier que le message appartient à l'utilisateur
        if (message.user_id !== (req.user.id || req.user.email)) {
            return res.status(403).json({ ok: false, error: 'Accès non autorisé' });
        }

        res.json({ ok: true, message });
    } catch (error) {
        console.error('Erreur récupération message:', error);
        res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }
});

// Mettre à jour un message
router.put('/:id', async (req, res) => {
    try {
        const { content, tone, objective } = req.body;
        
        // Vérifier d'abord que le message existe et appartient à l'utilisateur
        const existingMessage = await messagesAPI.getMessageById(req.params.id);
        
        if (!existingMessage) {
            return res.status(404).json({ ok: false, error: 'Message non trouvé' });
        }

        if (existingMessage.user_id !== (req.user.id || req.user.email)) {
            return res.status(403).json({ ok: false, error: 'Accès non autorisé' });
        }

        const updatedMessage = await messagesAPI.updateMessage(req.params.id, {
            content,
            tone,
            objective
        });

        res.json({ ok: true, message: updatedMessage });
    } catch (error) {
        console.error('Erreur mise à jour message:', error);
        res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
    }
});

// Supprimer un message
router.delete('/:id', async (req, res) => {
    try {
        const result = await messagesAPI.deleteMessage(
            req.params.id, 
            req.user.id || req.user.email
        );
        
        if (!result.deleted) {
            return res.status(404).json({ ok: false, error: 'Message non trouvé ou déjà supprimé' });
        }

        res.json({ ok: true, message: 'Message supprimé avec succès', messageId: result.messageId });
    } catch (error) {
        console.error('Erreur suppression message:', error);
        res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
    }
});

// Envoyer un message par email
router.post('/send-email', async (req, res) => {
    try {
        const { contactName, company, objective, tone, content } = req.body;
        const userEmail = req.user.email;
        
        if (!contactName || !company || !content || !userEmail) {
            return res.status(400).json({ ok: false, error: 'Données manquantes' });
        }

        // Pour maintenant, on retourne un succès (email simulé)
        // En production, intégrer nodemailer ou un service d'email
        console.log(`Email envoyé depuis ${userEmail} pour ${contactName}:`, content);
        
        // Sauvegarder le message avec l'API MySQL native
        const message = await messagesAPI.createMessage({
            userId: req.user.id || req.user.email,
            contactId: null,
            content,
            tone,
            objective,
            generatedBy: 'template' // ou 'ai' selon contexte
        });

        res.json({ 
            ok: true, 
            message: 'Email simulé (en production, intégrer nodemailer)',
            messageId: message.id,
            emailSent: true,
            sentTo: contactName
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
    }
});

export { router as messageRouter };
