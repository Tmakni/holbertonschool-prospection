import express from 'express';
import { authMiddleware } from '../server.js';
import { createMessage, findMessagesByUser } from '../models/Message.js';
import { findContactById } from '../models/Contact.js';
import { generateMessage } from '../utils/generateMessage.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Générer un message
router.post('/generate', async (req, res) => {
    try {
        const { contactId, tone, length } = req.body;
        
        // Vérifier que le contact existe
        const contact = await findContactById(contactId);
        if (!contact) {
            return res.status(404).json({ message: 'Contact non trouvé' });
        }

        // Générer le message
        const content = generateMessage({
            name: contact.name,
            tone,
            length
        });

        // Sauvegarder le message
        const message = await createMessage({
            userId: req.user.id,
            contactId,
            content,
            tone,
            length
        });

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer l'historique des messages
router.get('/', async (req, res) => {
    try {
        const messages = await findMessagesByUser(req.user.id);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

export { router as messageRouter };
