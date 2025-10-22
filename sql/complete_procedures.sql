-- ========================================
-- PROCÉDURES STOCKÉES COMPLÈTES POUR TOUS LES MODÈLES
-- Base de données MySQL pure - Prospection IA
-- ========================================

USE prospection_ia;

DELIMITER //

-- ========================================
-- PROCÉDURES UTILISATEURS
-- ========================================

-- Créer un nouvel utilisateur
DROP PROCEDURE IF EXISTS CreateUser//
CREATE PROCEDURE CreateUser(
    IN p_id VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_name VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO users (id, email, password, name, created_at, updated_at) 
    VALUES (p_id, LOWER(p_email), p_password, p_name, NOW(), NOW());
    
    -- Retourner l'utilisateur créé
    SELECT id, email, password, name, created_at, updated_at
    FROM users 
    WHERE id = p_id;
    
    COMMIT;
END//

-- Trouver un utilisateur par email
DROP PROCEDURE IF EXISTS FindUserByEmail//
CREATE PROCEDURE FindUserByEmail(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT id, email, password, name, created_at, updated_at
    FROM users 
    WHERE email = LOWER(p_email)
    LIMIT 1;
END//

-- Trouver un utilisateur par ID
DROP PROCEDURE IF EXISTS FindUserById//
CREATE PROCEDURE FindUserById(
    IN p_id VARCHAR(255)
)
BEGIN
    SELECT id, email, password, name, created_at, updated_at
    FROM users 
    WHERE id = p_id
    LIMIT 1;
END//

-- ========================================
-- PROCÉDURES CONTACTS
-- ========================================

-- Créer un nouveau contact
DROP PROCEDURE IF EXISTS CreateContact//
CREATE PROCEDURE CreateContact(
    IN p_id VARCHAR(255),
    IN p_user_id VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_linkedin VARCHAR(500)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO contacts (id, user_id, name, email, linkedin, created_at, updated_at)
    VALUES (p_id, p_user_id, p_name, p_email, p_linkedin, NOW(), NOW());
    
    -- Retourner le contact créé
    SELECT id, user_id, name, email, linkedin, created_at, updated_at
    FROM contacts 
    WHERE id = p_id;
    
    COMMIT;
END//

-- Trouver les contacts d'un utilisateur
DROP PROCEDURE IF EXISTS FindContactsByUser//
CREATE PROCEDURE FindContactsByUser(
    IN p_user_id VARCHAR(255)
)
BEGIN
    SELECT id, user_id, name, email, linkedin, created_at, updated_at
    FROM contacts 
    WHERE user_id = p_user_id
    ORDER BY created_at DESC;
END//

-- Trouver un contact par ID
DROP PROCEDURE IF EXISTS FindContactById//
CREATE PROCEDURE FindContactById(
    IN p_id VARCHAR(255)
)
BEGIN
    SELECT id, user_id, name, email, linkedin, created_at, updated_at
    FROM contacts 
    WHERE id = p_id
    LIMIT 1;
END//

-- Mettre à jour un contact
DROP PROCEDURE IF EXISTS UpdateContact//
CREATE PROCEDURE UpdateContact(
    IN p_id VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_linkedin VARCHAR(500)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE contacts 
    SET name = COALESCE(p_name, name),
        email = COALESCE(p_email, email),
        linkedin = COALESCE(p_linkedin, linkedin),
        updated_at = NOW()
    WHERE id = p_id;
    
    -- Retourner le contact mis à jour
    SELECT id, user_id, name, email, linkedin, created_at, updated_at
    FROM contacts 
    WHERE id = p_id;
    
    COMMIT;
END//

-- Supprimer un contact
DROP PROCEDURE IF EXISTS DeleteContact//
CREATE PROCEDURE DeleteContact(
    IN p_id VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    DELETE FROM contacts WHERE id = p_id;
    
    SELECT 
        TRUE AS success,
        ROW_COUNT() > 0 AS deleted,
        p_id AS contact_id;
    
    COMMIT;
END//

DELIMITER ;

-- ========================================
-- CONFIRMATION
-- ========================================
SELECT 'Procédures stockées utilisateurs et contacts créées avec succès !' AS status;