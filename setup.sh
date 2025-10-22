#!/bin/bash

# Script d'installation et setup pour Linux/macOS
# Utilisé pour initialiser rapidement la base de données MySQL

echo ""
echo "========================================"
echo "  Prospection IA - Setup MySQL"
echo "========================================"
echo ""

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé"
    echo "Veuillez installer Node.js depuis https://nodejs.org"
    exit 1
fi

# Vérifier que MySQL est accessible
if ! command -v mysql &> /dev/null; then
    echo "[AVERTISSEMENT] MySQL n'a pas pu être trouvé"
    echo "Veuillez vérifier que MySQL est installé et en cours d'exécution"
    echo ""
fi

# Installer les dépendances npm
echo "[1/3] Installation des dépendances npm..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de l'installation npm"
    exit 1
fi
echo "[OK] Dépendances installées"
echo ""

# Initialiser la base de données
echo "[2/3] Initialisation de la base de données MySQL..."
echo ""
node scripts/setup.js
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERREUR] Échec de l'initialisation de la base de données"
    echo "Veuillez vérifier:"
    echo "  1. Que MySQL est en cours d'exécution"
    echo "  2. Que le fichier .env est bien configuré"
    echo "  3. Les identifiants MySQL dans .env"
    exit 1
fi
echo "[OK] Base de données initialisée"
echo ""

# Démarrer le serveur
echo "[3/3] Démarrage du serveur..."
echo ""
npm start
