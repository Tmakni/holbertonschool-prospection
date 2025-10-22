-- ========================================
-- VUES MYSQL POUR SIMPLIFIER LES REQUÊTES
-- Base de données MySQL pure - Prospection IA
-- ========================================

USE prospection_ia;

-- ========================================
-- VUE : Messages avec détails complets
-- ========================================
DROP VIEW IF EXISTS v_messages_full;
CREATE VIEW v_messages_full AS
SELECT 
    m.id,
    m.user_id,
    m.contact_id,
    m.content,
    m.tone,
    m.objective,
    m.campaign,
    m.length,
    m.generated_by,
    m.created_at,
    m.updated_at,
    -- Informations utilisateur
    u.name AS user_name,
    u.email AS user_email,
    -- Informations contact
    c.name AS contact_name,
    c.email AS contact_email,
    c.linkedin AS contact_linkedin,
    -- Statistiques
    CHAR_LENGTH(m.content) AS content_length,
    CASE 
        WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Aujourd\'hui'
        WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Cette semaine'
        WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Ce mois'
        ELSE 'Plus ancien'
    END AS period_category
FROM messages m
LEFT JOIN users u ON m.user_id = u.id
LEFT JOIN contacts c ON m.contact_id = c.id;

-- ========================================
-- VUE : Statistiques par utilisateur
-- ========================================
DROP VIEW IF EXISTS v_user_message_stats;
CREATE VIEW v_user_message_stats AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    COUNT(m.id) AS total_messages,
    COUNT(CASE WHEN m.generated_by = 'ai' THEN 1 END) AS ai_messages,
    COUNT(CASE WHEN m.generated_by = 'template' THEN 1 END) AS template_messages,
    COUNT(CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) AS messages_this_week,
    COUNT(CASE WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS messages_this_month,
    AVG(CHAR_LENGTH(m.content)) AS avg_content_length,
    MAX(m.created_at) AS last_message_date,
    MIN(m.created_at) AS first_message_date
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
GROUP BY u.id, u.name, u.email;

-- ========================================
-- VUE : Messages récents avec priorité
-- ========================================
DROP VIEW IF EXISTS v_recent_messages;
CREATE VIEW v_recent_messages AS
SELECT 
    m.*,
    u.name AS user_name,
    c.name AS contact_name,
    c.email AS contact_email,
    CASE 
        WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 'Très récent'
        WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Récent'
        WHEN m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Cette semaine'
        ELSE 'Ancien'
    END AS freshness,
    CASE 
        WHEN m.generated_by = 'ai' THEN 3
        WHEN m.generated_by = 'template' THEN 2
        ELSE 1
    END AS priority_score
FROM messages m
JOIN users u ON m.user_id = u.id
LEFT JOIN contacts c ON m.contact_id = c.id
WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY m.created_at DESC;

-- ========================================
-- VUE : Analyse des tendances de génération
-- ========================================
DROP VIEW IF EXISTS v_generation_trends;
CREATE VIEW v_generation_trends AS
SELECT 
    DATE(created_at) AS generation_date,
    generated_by,
    COUNT(*) AS message_count,
    AVG(CHAR_LENGTH(content)) AS avg_length,
    COUNT(DISTINCT user_id) AS unique_users,
    -- Répartition par ton
    COUNT(CASE WHEN tone = 'Professionnel & cordial' THEN 1 END) AS professional_count,
    COUNT(CASE WHEN tone = 'Convaincant & persuasif' THEN 1 END) AS persuasive_count,
    COUNT(CASE WHEN tone = 'Amical & décontracté' THEN 1 END) AS friendly_count,
    -- Répartition par objectif
    COUNT(CASE WHEN objective = 'Prise de rendez-vous' THEN 1 END) AS appointment_count,
    COUNT(CASE WHEN objective = 'Présentation produit' THEN 1 END) AS product_count,
    COUNT(CASE WHEN objective = 'Suivi commercial' THEN 1 END) AS followup_count
FROM messages 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY DATE(created_at), generated_by
ORDER BY generation_date DESC, message_count DESC;

-- ========================================
-- VUE : Messages avec analyse de performance
-- ========================================
DROP VIEW IF EXISTS v_message_performance;
CREATE VIEW v_message_performance AS
SELECT 
    m.id,
    m.user_id,
    m.content,
    m.tone,
    m.objective,
    m.generated_by,
    m.created_at,
    CHAR_LENGTH(m.content) AS content_length,
    -- Score de qualité basique (à améliorer selon vos critères)
    CASE 
        WHEN CHAR_LENGTH(m.content) BETWEEN 200 AND 500 THEN 3
        WHEN CHAR_LENGTH(m.content) BETWEEN 100 AND 199 THEN 2
        WHEN CHAR_LENGTH(m.content) BETWEEN 500 AND 800 THEN 2
        ELSE 1
    END AS length_score,
    -- Présence d'éléments importants
    CASE WHEN m.content LIKE '%rendez-vous%' OR m.content LIKE '%RDV%' THEN 1 ELSE 0 END AS has_rdv_mention,
    CASE WHEN m.content LIKE '%merci%' OR m.content LIKE '%remercie%' THEN 1 ELSE 0 END AS is_polite,
    CASE WHEN m.content LIKE '%cordialement%' OR m.content LIKE '%salutations%' THEN 1 ELSE 0 END AS has_closing,
    -- Informations du contact
    c.name AS contact_name,
    u.name AS user_name
FROM messages m
LEFT JOIN contacts c ON m.contact_id = c.id
LEFT JOIN users u ON m.user_id = u.id;

-- ========================================
-- VUE : Logs AI avec détails
-- ========================================
DROP VIEW IF EXISTS v_ai_logs_detailed;
CREATE VIEW v_ai_logs_detailed AS
SELECT 
    al.id,
    al.user_id,
    al.message_id,
    al.status,
    al.error_message,
    al.tokens_used,
    al.created_at,
    -- Informations utilisateur
    u.name AS user_name,
    u.email AS user_email,
    -- Informations message
    m.tone AS message_tone,
    m.objective AS message_objective,
    CHAR_LENGTH(m.content) AS message_length,
    -- Statistiques
    CASE 
        WHEN al.status = 'success' THEN 'Succès'
        WHEN al.status = 'failed' THEN 'Échec'
        WHEN al.status = 'rate_limited' THEN 'Limite atteinte'
        ELSE 'Inconnu'
    END AS status_fr,
    CASE 
        WHEN al.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'Aujourd\'hui'
        WHEN al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Cette semaine'
        ELSE 'Plus ancien'
    END AS period
FROM ai_logs al
LEFT JOIN users u ON al.user_id = u.id
LEFT JOIN messages m ON al.message_id = m.id;

-- ========================================
-- VUE : Dashboard utilisateur
-- ========================================
DROP VIEW IF EXISTS v_user_dashboard;
CREATE VIEW v_user_dashboard AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.created_at AS user_since,
    -- Statistiques messages
    COALESCE(stats.total_messages, 0) AS total_messages,
    COALESCE(stats.ai_messages, 0) AS ai_messages,
    COALESCE(stats.template_messages, 0) AS template_messages,
    COALESCE(stats.messages_this_week, 0) AS messages_this_week,
    COALESCE(stats.messages_this_month, 0) AS messages_this_month,
    stats.last_message_date,
    -- Statistiques contacts
    COALESCE(contact_stats.total_contacts, 0) AS total_contacts,
    -- Statistiques AI
    COALESCE(ai_stats.total_ai_calls, 0) AS total_ai_calls,
    COALESCE(ai_stats.successful_ai_calls, 0) AS successful_ai_calls,
    COALESCE(ai_stats.failed_ai_calls, 0) AS failed_ai_calls,
    COALESCE(ai_stats.total_tokens_used, 0) AS total_tokens_used
FROM users u
LEFT JOIN v_user_message_stats stats ON u.id = stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total_contacts
    FROM contacts 
    GROUP BY user_id
) contact_stats ON u.id = contact_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) AS total_ai_calls,
        COUNT(CASE WHEN status = 'success' THEN 1 END) AS successful_ai_calls,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed_ai_calls,
        SUM(COALESCE(tokens_used, 0)) AS total_tokens_used
    FROM ai_logs 
    GROUP BY user_id
) ai_stats ON u.id = ai_stats.user_id;

-- ========================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- ========================================

-- Index pour les vues les plus utilisées
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_generated_by ON messages(generated_by);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_created ON ai_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status ON ai_logs(status);

-- ========================================
-- CONFIRMATION
-- ========================================
SELECT 'Vues MySQL créées avec succès !' AS status;