#!/usr/bin/env node
/**
 * Setup script - Initialise la base de données MySQL
 * Utilisation: node scripts/setup.js
 */

import mysql from 'mysql2/promise.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
    console.log('🚀 Démarrage de l\'initialisation de la base de données...\n');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
    };

    try {
        // Connexion sans base de données spécifiée
        console.log(`📱 Connexion à MySQL (${config.host}:${config.port})...`);
        const connection = await mysql.createConnection(config);
        console.log('✓ Connexion établie\n');

        // Lire le fichier SQL
        const sqlFilePath = path.join(__dirname, '..', 'database.sql');
        console.log(`📄 Lecture du fichier SQL (${sqlFilePath})...`);
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        console.log('✓ Fichier SQL lu\n');

        // Exécuter les commandes SQL
        console.log('⚙️  Exécution des scripts SQL...\n');
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            const trimmed = statement.trim();
            if (!trimmed) continue;
            
            try {
                await connection.execute(trimmed);
                const preview = trimmed.substring(0, 50).replace(/\n/g, ' ');
                console.log(`  ✓ ${preview}...`);
            } catch (err) {
                console.error(`  ✗ Erreur: ${err.message}`);
                throw err;
            }
        }

        console.log('\n✅ Base de données initialisée avec succès!\n');

        // Vérifier la base de données
        const dbName = process.env.DB_NAME || 'prospection_ia';
        await connection.execute(`USE ${dbName}`);
        
        const [tables] = await connection.execute(
            `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '${dbName}'`
        );

        console.log(`📊 Tables créées dans la base "${dbName}":`);
        tables.forEach(table => {
            console.log(`  • ${table.TABLE_NAME}`);
        });

        await connection.end();
        console.log('\n✨ Setup terminé avec succès!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erreur lors de la setup:', error.message);
        console.error('\nVérifiez que:');
        console.error('  1. MySQL est en cours d\'exécution');
        console.error(`  2. Les identifiants MySQL sont corrects (user: ${config.user})`);
        console.error('  3. Les variables d\'environnement sont configurées dans .env');
        process.exit(1);
    }
}

setup();
