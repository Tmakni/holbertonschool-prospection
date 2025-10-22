import mysql from 'mysql2/promise';
import { nanoid } from 'nanoid';

/**
 * API pour la gestion des messages utilisant des procédures stockées MySQL pures
 * Cette API exécute uniquement des CALL vers des procédures stockées MySQL
 */

class MessagesAPI {
    constructor() {
        this.pool = null;
        this.initializePool();
    }

    async initializePool() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'prospection_ia',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                timezone: '+00:00',
                multipleStatements: true // Pour les procédures stockées
            });
            console.log('✓ Pool MySQL initialisé - Utilisation de procédures stockées pures');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du pool MySQL:', error);
            throw error;
        }
    }

    async getConnection() {
        if (!this.pool) {
            await this.initializePool();
        }
        return await this.pool.getConnection();
    }

    /**
     * Créer un nouveau message via procédure stockée MySQL
     */
    async createMessage({ userId, contactId, content, tone, objective, generatedBy = 'template' }) {
        const connection = await this.getConnection();
        try {
            const messageId = nanoid();
            
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL CreateMessage(?, ?, ?, ?, ?, ?, ?)',
                [messageId, userId, contactId || null, content, tone, objective, generatedBy]
            );

            // La procédure stockée retourne le message créé
            return rows[0][0]; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors de la création du message via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Récupérer tous les messages d'un utilisateur via procédure stockée MySQL
     */
    async getMessagesByUser(userId, limit = 50, offset = 0) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL GetMessagesByUser(?, ?, ?)',
                [userId, limit, offset]
            );

            return rows[0]; // Premier résultat de la procédure

        } catch (error) {
            console.error('Erreur lors de la récupération des messages via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Récupérer un message par son ID via procédure stockée MySQL
     */
    async getMessageById(messageId) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL GetMessageById(?)',
                [messageId]
            );

            return rows[0][0] || null; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors de la récupération du message via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Mettre à jour un message via procédure stockée MySQL
     */
    async updateMessage(messageId, { content, tone, objective }) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL UpdateMessage(?, ?, ?, ?)',
                [messageId, content || null, tone || null, objective || null]
            );

            return rows[0][0]; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors de la mise à jour via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Supprimer un message via procédure stockée MySQL
     */
    async deleteMessage(messageId, userId) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL DeleteMessage(?, ?)',
                [messageId, userId]
            );

            return rows[0][0]; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors de la suppression via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Statistiques des messages via procédure stockée MySQL
     */
    async getMessageStats(userId) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL GetMessageStats(?)',
                [userId]
            );

            return rows[0][0]; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors du calcul des statistiques via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Rechercher des messages via procédure stockée MySQL
     */
    async searchMessages(userId, searchTerm, limit = 20) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL SearchMessages(?, ?, ?)',
                [userId, searchTerm, limit]
            );

            return rows[0]; // Premier résultat de la procédure

        } catch (error) {
            console.error('Erreur lors de la recherche via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Logger un appel API AI via procédure stockée MySQL
     */
    async logAICall(userId, messageId, status, errorMessage = null, tokensUsed = null) {
        const connection = await this.getConnection();
        try {
            const logId = nanoid();
            
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL LogAICall(?, ?, ?, ?, ?, ?)',
                [logId, userId, messageId, status, errorMessage, tokensUsed]
            );

            return rows[0][0]; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors du logging AI via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Récupérer les logs AI via procédure stockée MySQL
     */
    async getAILogs(userId, limit = 50, offset = 0) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL GetAILogs(?, ?, ?)',
                [userId, limit, offset]
            );

            return rows[0]; // Premier résultat de la procédure

        } catch (error) {
            console.error('Erreur lors de la récupération des logs AI via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Utiliser les vues MySQL pour des données enrichies
     */
    async getMessagesFullView(userId, limit = 50) {
        const connection = await this.getConnection();
        try {
            // Utilisation directe de la vue MySQL
            const [rows] = await connection.execute(
                'SELECT * FROM v_messages_full WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
                [userId, limit]
            );

            return rows;

        } catch (error) {
            console.error('Erreur lors de la récupération via vue MySQL:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Utiliser la vue dashboard utilisateur
     */
    async getUserDashboard(userId) {
        const connection = await this.getConnection();
        try {
            // Utilisation directe de la vue MySQL
            const [rows] = await connection.execute(
                'SELECT * FROM v_user_dashboard WHERE user_id = ?',
                [userId]
            );

            return rows[0] || null;

        } catch (error) {
            console.error('Erreur lors de la récupération du dashboard via vue MySQL:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Tester la connexion à la base de données
     */
    async testConnection() {
        try {
            const connection = await this.getConnection();
            const [rows] = await connection.execute('SELECT 1 as test');
            connection.release();
            
            console.log('✓ Test de connexion MySQL réussi (Messages API)');
            return true;
        } catch (error) {
            console.error('✗ Test de connexion MySQL échoué (Messages API):', error.message);
            return false;
        }
    }

    /**
     * Fermer le pool de connexions
     */
    async closePool() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✓ Pool de connexions MySQL fermé (Messages API)');
        }
    }
}

// Exporter une instance singleton
export const messagesAPI = new MessagesAPI();
export default messagesAPI;