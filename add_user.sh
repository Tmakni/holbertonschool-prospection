#!/bin/bash
# Ajouter l'utilisateur tom.makni@gmail.com à la base de données MySQL
mysql -u root -pPassword123! -e "
USE prospection_ia;
INSERT INTO users (id, email, password, name, created_at, updated_at) 
VALUES (
    'user-tom-makni', 
    'tom.makni@gmail.com', 
    '\$2a\$10\$gPx69zjN9FJYHV5hPlmno.9.1lHESZxAaSWPQ2FR5lSz8f4i3S2xK', 
    'TOM Makni', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE name = 'TOM Makni';
"
echo "Utilisateur tom.makni@gmail.com ajouté à MySQL"