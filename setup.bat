@echo off
REM Script d'installation et setup pour Windows
REM Utilisé pour initialiser rapidement la base de données MySQL

echo.
echo ========================================
echo   Prospection IA - Setup MySQL
echo ========================================
echo.

REM Vérifier que Node.js est installé
where node >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installé ou pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org
    pause
    exit /b 1
)

REM Vérifier que MySQL est accessible
where mysql >nul 2>nul
if errorlevel 1 (
    echo [AVERTISSEMENT] MySQL n'a pas pu être trouvé dans le PATH
    echo Mais ce n'est pas grave, vous pouvez continuer
    echo.
)

REM Installer les dépendances npm
echo [1/3] Installation des dépendances npm...
call wsl npm install
if errorlevel 1 (
    echo [ERREUR] Échec de l'installation npm
    pause
    exit /b 1
)
echo [OK] Dépendances installées
echo.

REM Initialiser la base de données
echo [2/3] Initialisation de la base de données MySQL...
echo.
call wsl node scripts/setup.js
if errorlevel 1 (
    echo.
    echo [ERREUR] Échec de l'initialisation de la base de données
    echo Veuillez vérifier:
    echo   1. Que MySQL est en cours d'exécution
    echo   2. Que le fichier .env est bien configuré
    echo   3. Les identifiants MySQL dans .env
    pause
    exit /b 1
)
echo [OK] Base de données initialisée
echo.

REM Démarrer le serveur
echo [3/3] Démarrage du serveur...
echo.
call wsl npm start

pause
