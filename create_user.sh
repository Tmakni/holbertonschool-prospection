#!/bin/bash
sudo mysql -e "CREATE USER IF NOT EXISTS 'prospection_user'@'localhost' IDENTIFIED BY 'Prospection123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON prospection_ia.* TO 'prospection_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "Utilisateur prospection_user créé avec succès"