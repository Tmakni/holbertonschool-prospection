import express from 'express';
import { authMiddleware } from '../server.js';
import { createMessage, findMessagesByUser } from '../models/Message.js';
import { generateMessage } from '../utils/generateMessage.js';
import { generateMessageWithAI } from '../utils/openaiService.js';

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

        // Sauvegarder le message
        const message = await createMessage({
            userId: req.user.id || req.user.email,
            contactId: null,
            content,
            tone,
            objective
        });

        res.json({ ok: true, message });
    } catch (error) {
        console.error('Message generation error:', error);
        res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
    }
});




// Récupérer l'historique des messages

router.get('/', async (req, res) => {
    try {
        const messages = await findMessagesByUser(req.user.id || req.user.email);
        res.json({ ok: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }
});

export { router as messageRouter };
