import express from 'express';
import { authMiddleware } from '../server.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Envoyer un email en masse
router.post('/send-bulk', async (req, res) => {
    try {
        const { 
            recipientEmail, 
            recipientName, 
            message, 
            senderEmail, 
            emailService, 
            subject,
            csvContent
        } = req.body;
        
        const userEmail = req.user?.email || 'unknown';

        if (!recipientEmail || !message || !senderEmail || !subject) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Données manquantes (recipientEmail, message, senderEmail, subject)' 
            });
        }

        // Validation basique
        if (!recipientEmail.includes('@') || !senderEmail.includes('@')) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Adresses email invalides' 
            });
        }

        // Pour maintenant, simulations avec logs
        // En production, intégrer nodemailer ou un service d'email
        
        const emailLog = {
            from: senderEmail,
            to: recipientEmail,
            subject: subject,
            message: message,
            service: emailService,
            csvIncluded: !!csvContent,
            timestamp: new Date(),
            userEmail: userEmail,
            status: 'sent'
        };

        // Log l'envoi
        console.log(`📧 Email envoyé:`);
        console.log(`   De: ${senderEmail}`);
        console.log(`   À: ${recipientEmail} (${recipientName})`);
        console.log(`   Objet: ${subject}`);
        console.log(`   Service: ${emailService}`);
        console.log(`   Contenu: ${message.substring(0, 100)}...`);
        if (csvContent) {
            console.log(`   CSV attaché: ${csvContent.split('\n').length} lignes`);
        }

        res.json({ 
            ok: true, 
            message: `Email envoyé avec succès à ${recipientName}`,
            emailLog: emailLog
        });

    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ 
            ok: false, 
            error: error.message || 'Erreur serveur' 
        });
    }
});

export { router as emailRouter };
