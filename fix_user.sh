#!/bin/bash
# Nettoyer et recréer l'utilisateur avec le bon ID

mysql -u root -pPassword123! << 'EOF'
USE prospection_ia;

-- Supprimer l'ancien utilisateur
DELETE FROM users WHERE email = 'tom.makni@gmail.com';

-- Créer l'utilisateur avec l'ID du token JWT actuel
CALL CreateUser('mh1x5fol1djyjn12g4w', 'tom.makni@gmail.com', '$2a$10$gPx69zjN9FJYHV5hPlmno.9.1lHESZxAaSWPQ2FR5lSz8f4i3S2xK', 'TOM Makni');

-- Vérifier que l'utilisateur a été créé
SELECT 'Utilisateur créé:' AS info;
SELECT * FROM users WHERE id = 'mh1x5fol1djyjn12g4w';

EOF

echo "Utilisateur recréé avec le bon ID"