-- ========================================
-- PROCÉDURES STOCKÉES POUR USERS ET CONTACTS
-- Base de données MySQL pure - Prospection IA
-- ========================================

USE prospection_ia;

DELIMITER //

-- ========================================
-- PROCÉDURES POUR LES UTILISATEURS
-- ========================================

-- Créer un utilisateur
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
    SELECT * FROM users WHERE id = p_id;
    
    COMMIT;
END//

-- Trouver un utilisateur par email
DROP PROCEDURE IF EXISTS FindUserByEmail//
CREATE PROCEDURE FindUserByEmail(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT * FROM users WHERE email = LOWER(p_email);
END//

-- Trouver un utilisateur par ID
DROP PROCEDURE IF EXISTS FindUserById//
CREATE PROCEDURE FindUserById(
    IN p_id VARCHAR(255)
)
BEGIN
    SELECT * FROM users WHERE id = p_id;
END//

-- ========================================
-- PROCÉDURES POUR LES CONTACTS
-- ========================================

-- Créer un contact
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
    VALUES (
        p_id,
        p_user_id,
        p_name,
        CASE WHEN p_email IS NOT NULL THEN LOWER(p_email) ELSE NULL END,
        p_linkedin,
        NOW(),
        NOW()
    );
    
    -- Retourner le contact créé
    SELECT * FROM contacts WHERE id = p_id;
    
    COMMIT;
END//

-- Trouver les contacts d'un utilisateur
DROP PROCEDURE IF EXISTS FindContactsByUser//
CREATE PROCEDURE FindContactsByUser(
    IN p_user_id VARCHAR(255)
)
BEGIN
    SELECT * FROM contacts 
    WHERE user_id = p_user_id 
    ORDER BY created_at DESC;
END//

-- Trouver un contact par ID
DROP PROCEDURE IF EXISTS FindContactById//
CREATE PROCEDURE FindContactById(
    IN p_id VARCHAR(255)
)
BEGIN
    SELECT * FROM contacts WHERE id = p_id;
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
    DECLARE v_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Vérifier que le contact existe
    SELECT COUNT(*) INTO v_count FROM contacts WHERE id = p_id;
    
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contact non trouvé';
    END IF;
    
    -- Mettre à jour le contact
    UPDATE contacts 
    SET 
        name = p_name,
        email = CASE WHEN p_email IS NOT NULL THEN LOWER(p_email) ELSE NULL END,
        linkedin = p_linkedin,
        updated_at = NOW()
    WHERE id = p_id;
    
    -- Retourner le contact mis à jour
    SELECT * FROM contacts WHERE id = p_id;
    
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
    
    -- Vérifier que le contact existe
    SELECT COUNT(*) INTO v_count FROM contacts WHERE id = p_id;
    
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contact non trouvé';
    END IF;
    
    -- Supprimer le contact
    DELETE FROM contacts WHERE id = p_id;
    
    -- Retourner le résultat
    SELECT 
        TRUE AS success,
        ROW_COUNT() > 0 AS deleted,
        p_id AS contact_id;
    
    COMMIT;
END//

-- ========================================
-- PROCÉDURES UTILITAIRES
-- ========================================

-- Tester la connexion
DROP PROCEDURE IF EXISTS TestConnection//
CREATE PROCEDURE TestConnection()
BEGIN
    SELECT 
        1 AS test,
        NOW() AS current_time,
        'Connection successful' AS status;
END//

-- Obtenir les statistiques globales
DROP PROCEDURE IF EXISTS GetGlobalStats//
CREATE PROCEDURE GetGlobalStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM contacts) AS total_contacts,
        (SELECT COUNT(*) FROM messages) AS total_messages,
        (SELECT COUNT(*) FROM ai_logs) AS total_ai_logs,
        NOW() AS stats_date;
END//

DELIMITER ;

-- ========================================
-- CONFIRMATION
-- ========================================
SELECT 'Procédures stockées pour Users et Contacts créées avec succès !' AS status;