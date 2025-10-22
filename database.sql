-- Base de données pour Prospection IA
-- Créer la base de données
CREATE DATABASE IF NOT EXISTS prospection_ia;
USE prospection_ia;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY COMMENT 'ID unique de l''utilisateur',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email de l''utilisateur (unique)',
    password VARCHAR(255) NOT NULL COMMENT 'Mot de passe hashé',
    name VARCHAR(255) NOT NULL COMMENT 'Nom de l''utilisateur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stockage des utilisateurs';

-- Table des contacts
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(255) PRIMARY KEY COMMENT 'ID unique du contact',
    user_id VARCHAR(255) NOT NULL COMMENT 'Référence à l''utilisateur',
    name VARCHAR(255) NOT NULL COMMENT 'Nom du contact',
    email VARCHAR(255) COMMENT 'Email du contact',
    linkedin VARCHAR(500) COMMENT 'Profil LinkedIn du contact',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    CONSTRAINT fk_contacts_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stockage des contacts';

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY COMMENT 'ID unique du message',
    user_id VARCHAR(255) NOT NULL COMMENT 'Référence à l''utilisateur',
    contact_id VARCHAR(255) COMMENT 'Référence au contact',
    content LONGTEXT NOT NULL COMMENT 'Contenu du message',
    tone VARCHAR(100) COMMENT 'Ton du message (ex: Professionnel, Convaincant)',
    objective VARCHAR(100) COMMENT 'Objectif du message (ex: Prise de rendez-vous)',
    campaign VARCHAR(255) COMMENT 'Campagne associée',
    length VARCHAR(50) COMMENT 'Longueur du message (court, moyen, long)',
    generated_by VARCHAR(50) DEFAULT 'template' COMMENT 'Source: template ou IA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    INDEX idx_user_id (user_id),
    INDEX idx_contact_id (contact_id),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_messages_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_contacts FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stockage des messages générés';

-- Table d'audit des appels API OpenAI
CREATE TABLE IF NOT EXISTS ai_logs (
    id VARCHAR(255) PRIMARY KEY COMMENT 'ID unique du log',
    user_id VARCHAR(255) NOT NULL COMMENT 'Référence à l''utilisateur',
    message_id VARCHAR(255) COMMENT 'Référence au message généré',
    status VARCHAR(50) COMMENT 'Statut: success, failed, rate_limited',
    error_message TEXT COMMENT 'Message d''erreur si applicable',
    tokens_used INT COMMENT 'Nombre de tokens utilisés (approx)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de la requête',
    INDEX idx_user_id (user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_ai_logs_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_logs_messages FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs des appels API OpenAI';

-- Créer un utilisateur de test (optionnel)
INSERT IGNORE INTO users (id, email, password, name) VALUES
('test-user-001', 'test@example.com', '$2a$10$YourHashedPasswordHere', 'Test User');
