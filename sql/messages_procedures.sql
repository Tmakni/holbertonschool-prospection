-- ========================================
-- PROCÉDURES STOCKÉES POUR LA GESTION DES MESSAGES
-- Base de données MySQL pure - Prospection IA
-- ========================================

USE prospection_ia;

DELIMITER //

-- ========================================
-- PROCÉDURE : Créer un nouveau message
-- ========================================
DROP PROCEDURE IF EXISTS CreateMessage//
CREATE PROCEDURE CreateMessage(
    IN p_id VARCHAR(255),
    IN p_user_id VARCHAR(255),
    IN p_contact_id VARCHAR(255),
    IN p_content LONGTEXT,
    IN p_tone VARCHAR(100),
    IN p_objective VARCHAR(100),
    IN p_generated_by VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO messages (
        id, 
        user_id, 
        contact_id, 
        content, 
        tone, 
        objective, 
        generated_by,
        created_at,
        updated_at
    ) VALUES (
        p_id,
        p_user_id,
        p_contact_id,
        p_content,
        p_tone,
        p_objective,
        COALESCE(p_generated_by, 'template'),
        NOW(),
        NOW()
    );
    
    -- Retourner le message créé avec les informations du contact
    SELECT 
        m.*,
        c.name AS contact_name,
        c.email AS contact_email,
        c.linkedin AS contact_linkedin,
        u.name AS user_name,
        u.email AS user_email
    FROM messages m
    LEFT JOIN contacts c ON m.contact_id = c.id
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.id = p_id;
    
    COMMIT;
END//

-- ========================================
-- PROCÉDURE : Récupérer les messages d'un utilisateur
-- ========================================
DROP PROCEDURE IF EXISTS GetMessagesByUser//
CREATE PROCEDURE GetMessagesByUser(
    IN p_user_id VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        m.id,
        m.content,
        m.tone,
        m.objective,
        m.generated_by,
        m.created_at,
        m.updated_at,
        c.name AS contact_name,
        c.email AS contact_email,
        c.linkedin AS contact_linkedin
    FROM messages m
    LEFT JOIN contacts c ON m.contact_id = c.id
    WHERE m.user_id = p_user_id
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END//

-- ========================================
-- PROCÉDURE : Récupérer un message par ID
-- ========================================
DROP PROCEDURE IF EXISTS GetMessageById//
CREATE PROCEDURE GetMessageById(
    IN p_message_id VARCHAR(255)
)
BEGIN
    SELECT 
        m.*,
        c.name AS contact_name,
        c.email AS contact_email,
        c.linkedin AS contact_linkedin,
        u.name AS user_name,
        u.email AS user_email
    FROM messages m
    LEFT JOIN contacts c ON m.contact_id = c.id
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.id = p_message_id;
END//

-- ========================================
-- PROCÉDURE : Mettre à jour un message
-- ========================================
DROP PROCEDURE IF EXISTS UpdateMessage//
CREATE PROCEDURE UpdateMessage(
    IN p_message_id VARCHAR(255),
    IN p_content LONGTEXT,
    IN p_tone VARCHAR(100),
    IN p_objective VARCHAR(100)
)
BEGIN
    DECLARE v_user_id VARCHAR(255);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Vérifier que le message existe et récupérer l'user_id
    SELECT user_id INTO v_user_id 
    FROM messages 
    WHERE id = p_message_id;
    
    IF v_user_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Message non trouvé';
    END IF;
    
    -- Mettre à jour le message
    UPDATE messages 
    SET 
        content = COALESCE(p_content, content),
        tone = COALESCE(p_tone, tone),
        objective = COALESCE(p_objective, objective),
        updated_at = NOW()
    WHERE id = p_message_id;
    
    -- Retourner le message mis à jour
    CALL GetMessageById(p_message_id);
    
    COMMIT;
END//

-- ========================================
-- PROCÉDURE : Supprimer un message
-- ========================================
DROP PROCEDURE IF EXISTS DeleteMessage//
CREATE PROCEDURE DeleteMessage(
    IN p_message_id VARCHAR(255),
    IN p_user_id VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Vérifier que le message appartient à l'utilisateur
    SELECT COUNT(*) INTO v_count
    FROM messages 
    WHERE id = p_message_id AND user_id = p_user_id;
    
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Message non trouvé ou accès non autorisé';
    END IF;
    
    -- Supprimer le message
    DELETE FROM messages 
    WHERE id = p_message_id AND user_id = p_user_id;
    
    -- Retourner le résultat
    SELECT 
        TRUE AS success,
        ROW_COUNT() > 0 AS deleted,
        p_message_id AS message_id;
    
    COMMIT;
END//

-- ========================================
-- PROCÉDURE : Statistiques des messages
-- ========================================
DROP PROCEDURE IF EXISTS GetMessageStats//
CREATE PROCEDURE GetMessageStats(
    IN p_user_id VARCHAR(255)
)
BEGIN
    SELECT 
        COUNT(*) AS total_messages,
        COUNT(CASE WHEN generated_by = 'ai' THEN 1 END) AS ai_messages,
        COUNT(CASE WHEN generated_by = 'template' THEN 1 END) AS template_messages,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) AS messages_this_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS messages_this_month,
        AVG(CHAR_LENGTH(content)) AS avg_content_length,
        MAX(created_at) AS last_message_date
    FROM messages 
    WHERE user_id = p_user_id;
END//

-- ========================================
-- PROCÉDURE : Rechercher dans les messages
-- ========================================
DROP PROCEDURE IF EXISTS SearchMessages//
CREATE PROCEDURE SearchMessages(
    IN p_user_id VARCHAR(255),
    IN p_search_term TEXT,
    IN p_limit INT
)
BEGIN
    SELECT 
        m.id,
        m.content,
        m.tone,
        m.objective,
        m.generated_by,
        m.created_at,
        c.name AS contact_name,
        c.email AS contact_email,
        -- Calculer un score de pertinence basique
        (
            (CASE WHEN m.content LIKE CONCAT('%', p_search_term, '%') THEN 3 ELSE 0 END) +
            (CASE WHEN m.tone LIKE CONCAT('%', p_search_term, '%') THEN 2 ELSE 0 END) +
            (CASE WHEN m.objective LIKE CONCAT('%', p_search_term, '%') THEN 2 ELSE 0 END) +
            (CASE WHEN c.name LIKE CONCAT('%', p_search_term, '%') THEN 1 ELSE 0 END)
        ) AS relevance_score
    FROM messages m
    LEFT JOIN contacts c ON m.contact_id = c.id
    WHERE m.user_id = p_user_id
    AND (
        m.content LIKE CONCAT('%', p_search_term, '%')
        OR m.tone LIKE CONCAT('%', p_search_term, '%')
        OR m.objective LIKE CONCAT('%', p_search_term, '%')
        OR c.name LIKE CONCAT('%', p_search_term, '%')
    )
    ORDER BY relevance_score DESC, m.created_at DESC
    LIMIT p_limit;
END//

-- ========================================
-- PROCÉDURE : Logger un appel API AI
-- ========================================
DROP PROCEDURE IF EXISTS LogAICall//
CREATE PROCEDURE LogAICall(
    IN p_id VARCHAR(255),
    IN p_user_id VARCHAR(255),
    IN p_message_id VARCHAR(255),
    IN p_status VARCHAR(50),
    IN p_error_message TEXT,
    IN p_tokens_used INT
)
BEGIN
    INSERT INTO ai_logs (
        id,
        user_id, 
        message_id, 
        status, 
        error_message, 
        tokens_used,
        created_at
    ) VALUES (
        p_id,
        p_user_id,
        p_message_id,
        p_status,
        p_error_message,
        p_tokens_used,
        NOW()
    );
    
    SELECT 
        TRUE AS success,
        p_id AS log_id;
END//

-- ========================================
-- PROCÉDURE : Obtenir les logs AI d'un utilisateur
-- ========================================
DROP PROCEDURE IF EXISTS GetAILogs//
CREATE PROCEDURE GetAILogs(
    IN p_user_id VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        al.*,
        m.content AS message_content,
        m.tone AS message_tone,
        m.objective AS message_objective
    FROM ai_logs al
    LEFT JOIN messages m ON al.message_id = m.id
    WHERE al.user_id = p_user_id
    ORDER BY al.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END//

DELIMITER ;

-- ========================================
-- CONFIRMATION
-- ========================================
SELECT 'Procédures stockées créées avec succès !' AS status;