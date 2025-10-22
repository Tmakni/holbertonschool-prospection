import mysql from 'mysql2/promise';
import { nanoid } from 'nanoid';

/**
 * API MYSQL COMPLÈTE AVEC PROCÉDURES STOCKÉES PURES
 * Cette API remplace complètement l'ancien mysql.js
 * Utilise uniquement des appels de procédures stockées MySQL
 */

class MySQLAPI {
    constructor() {
        this.pool = null;
        this.isAvailable = false;
        this.initializePool();
    }

    async initializePool() {
        if (this.pool) return this.pool;

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
                enableKeepAlive: true,
                keepAliveInitialDelayMs: 0,
                multipleStatements: true, // Pour les procédures stockées
                timezone: '+00:00'
            });

            console.log('✓ MySQL pool initialisé - API avec procédures stockées pures');
            return this.pool;
        } catch (error) {
            console.error('Erreur initialisation pool:', error.message);
            throw error;
        }
    }

    async getConnection() {
        if (!this.pool) {
            await this.initializePool();
        }
        return await this.pool.getConnection();
    }

    // ========== UTILISATEURS ==========

    async createUser({ email, password, name }) {
        const connection = await this.getConnection();
        try {
            const id = nanoid();
            
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL CreateUser(?, ?, ?, ?)',
                [id, email, password, name]
            );

            return rows[0][0]; // Premier résultat de la première requête

        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async findUserByEmail(email) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL FindUserByEmail(?)',
                [email]
            );

            return rows[0][0] || null;

        } catch (error) {
            console.error('Erreur lors de la recherche utilisateur par email via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async findUserById(id) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL FindUserById(?)',
                [id]
            );

            return rows[0][0] || null;

        } catch (error) {
            console.error('Erreur lors de la recherche utilisateur par ID via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // ========== CONTACTS ==========

    async createContact({ userId, name, email, linkedin }) {
        const connection = await this.getConnection();
        try {
            const id = nanoid();
            
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL CreateContact(?, ?, ?, ?, ?)',
                [id, userId, name, email || null, linkedin || null]
            );

            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors de la création du contact via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async findContactsByUser(userId) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL FindContactsByUser(?)',
                [userId]
            );

            return rows[0];

        } catch (error) {
            console.error('Erreur lors de la recherche contacts par utilisateur via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async findContactById(id) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL FindContactById(?)',
                [id]
            );

            return rows[0][0] || null;

        } catch (error) {
            console.error('Erreur lors de la recherche contact par ID via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateContact({ id, name, email, linkedin }) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL UpdateContact(?, ?, ?, ?)',
                [id, name, email || null, linkedin || null]
            );

            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors de la mise à jour du contact via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteContact(id) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL DeleteContact(?)',
                [id]
            );

            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors de la suppression du contact via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // ========== MESSAGES ==========

    async createMessage({ userId, contactId, content, tone, objective, campaign, length, generatedBy }) {
        const connection = await this.getConnection();
        try {
            const id = nanoid();
            
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL CreateMessage(?, ?, ?, ?, ?, ?, ?)',
                [id, userId, contactId || null, content, tone, objective, generatedBy || 'template']
            );

            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors de la création du message via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async findMessagesByUser(userId) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL GetMessagesByUser(?, ?, ?)',
                [userId, 50, 0]
            );

            return rows[0];

        } catch (error) {
            console.error('Erreur lors de la recherche messages par utilisateur via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async findMessageById(id) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL GetMessageById(?)',
                [id]
            );

            return rows[0][0] || null;

        } catch (error) {
            console.error('Erreur lors de la recherche message par ID via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateMessage({ id, content, tone, objective }) {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL UpdateMessage(?, ?, ?, ?)',
                [id, content, tone, objective]
            );

            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors de la mise à jour du message via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // ========== AI LOGS ==========

    async logAICall({ userId, messageId, status, errorMessage, tokensUsed }) {
        const connection = await this.getConnection();
        try {
            const id = nanoid();
            
            // Appel de la procédure stockée MySQL pure
            const [rows] = await connection.execute(
                'CALL LogAICall(?, ?, ?, ?, ?, ?)',
                [id, userId, messageId || null, status, errorMessage || null, tokensUsed || null]
            );

            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors du logging AI via procédure stockée:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // ========== UTILITAIRES ==========

    async closePool() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✓ MySQL pool fermé');
        }
    }

    async testConnection() {
        try {
            const connection = await this.getConnection();
            
            // Test simple sans procédure stockée
            const [rows] = await connection.execute('SELECT 1 as test');
            
            connection.release();
            this.isAvailable = true;
            console.log('✓ Connexion MySQL réussie');
            return true;
        } catch (error) {
            this.isAvailable = false;
            console.error('✗ Test de connexion MySQL échoué:', error.message.split('\n')[0]);
            return false;
        }
    }

    isMysqlAvailable() {
        return this.isAvailable && this.pool !== null;
    }

    async getGlobalStats() {
        const connection = await this.getConnection();
        try {
            // Appel de la procédure stockée pour les stats globales
            const [rows] = await connection.execute('CALL GetGlobalStats()');
            
            return rows[0][0];

        } catch (error) {
            console.error('Erreur lors de la récupération des stats globales:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

// Exporter une instance singleton et les fonctions individuelles pour compatibilité
const mysqlAPI = new MySQLAPI();

// ========== EXPORTS POUR COMPATIBILITÉ AVEC L'ANCIEN CODE ==========

// Pool management
export const initializePool = () => mysqlAPI.initializePool();
export const closePool = () => mysqlAPI.closePool();
export const testConnection = () => mysqlAPI.testConnection();
export const isMysqlAvailable = () => mysqlAPI.isMysqlAvailable();

// Users
export const createUser = (data) => mysqlAPI.createUser(data);
export const findUserByEmail = (email) => mysqlAPI.findUserByEmail(email);
export const findUserById = (id) => mysqlAPI.findUserById(id);

// Contacts
export const createContact = (data) => mysqlAPI.createContact(data);
export const findContactsByUser = (userId) => mysqlAPI.findContactsByUser(userId);
export const findContactById = (id) => mysqlAPI.findContactById(id);
export const updateContact = (data) => mysqlAPI.updateContact(data);
export const deleteContact = (id) => mysqlAPI.deleteContact(id);

// Messages
export const createMessage = (data) => mysqlAPI.createMessage(data);
export const findMessagesByUser = (userId) => mysqlAPI.findMessagesByUser(userId);
export const findMessageById = (id) => mysqlAPI.findMessageById(id);
export const updateMessage = (data) => mysqlAPI.updateMessage(data);

// AI Logs
export const logAICall = (data) => mysqlAPI.logAICall(data);

// Instance principale
export default mysqlAPI;
export { mysqlAPI };