#!/bin/bash
# Test complet : créer un utilisateur et tester la génération de message

mysql -u root -pPassword123! << 'EOF'
USE prospection_ia;

-- Créer un utilisateur de test avec l'ID spécifique du token JWT
CALL CreateUser('mh1x5fol1djyjn12g4w', 'tom.makni@gmail.com', '$2a$10$gPx69zjN9FJYHV5hPlmno.9.1lHESZxAaSWPQ2FR5lSz8f4i3S2xK', 'TOM Makni');

-- Vérifier que l'utilisateur a été créé
SELECT 'Utilisateur créé:' AS info;
SELECT * FROM users WHERE id = 'mh1x5fol1djyjn12g4w';

EOF

echo "Utilisateur créé avec l'ID du token JWT actuel"