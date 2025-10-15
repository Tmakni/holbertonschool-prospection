// Stockage temporaire en mémoire pour le développement
import fs from 'fs';
import path from 'path';

const db = {
    users: new Map(),
    contacts: new Map(),
    messages: new Map()
};

let isConnected = false;

export async function connectDB() {
    try {
        console.log('Utilisation du stockage en mémoire temporaire');
        // essayer de charger des utilisateurs existants depuis data/users.json (dev)
        try {
            const dataPath = path.join(process.cwd(), 'data', 'users.json');
            if (fs.existsSync(dataPath)) {
                const raw = fs.readFileSync(dataPath, 'utf8');
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    arr.forEach(u => {
                        // Normaliser la forme attendue par le reste de l'app
                        const id = u.id || u._id || (Date.now().toString(36) + Math.random().toString(36).substring(2));
                        const email = (u.email || '').toLowerCase();
                        // Si le fichier contient 'passwordHash' (hash bcrypt), on le conserve sous la clé 'password'
                        // car le code attend user.password (comparaison bcrypt.compare(password, user.password)).
                        const password = u.password || u.passwordHash || null;
                        const user = {
                            _id: id,
                            id,
                            email,
                            password,
                            name: u.name || u.email || 'utilisateur',
                            createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
                        };
                        db.users.set(id, user);
                    });
                    console.log(`Seed: chargé ${arr.length} utilisateurs depuis ${dataPath}`);
                }
            }
        } catch (e) {
            console.warn('Seed users failed', e && e.message);
        }

        isConnected = true;
        return true;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
    }
}

export function getDB() {
    if (!isConnected) {
        throw new Error('Database not connected');
    }
    return db;
}

// Helper pour générer des IDs uniques
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// User operations
export async function createUser(userData) {
    const id = generateId();
    const user = { _id: id, ...userData, createdAt: new Date() };
    db.users.set(id, user);
    return user;
}

export async function findUserByEmail(email) {
    return Array.from(db.users.values()).find(user => 
        user.email.toLowerCase() === email.toLowerCase()
    );
}

export async function findUserById(id) {
    return db.users.get(id);
}

// Contact operations
export async function createContact(contactData) {
    const id = generateId();
    const contact = { _id: id, ...contactData, createdAt: new Date() };
    db.contacts.set(id, contact);
    return contact;
}

export async function findContactsByUser(userId) {
    return Array.from(db.contacts.values())
        .filter(contact => contact.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
}

// Message operations
export async function createMessage(messageData) {
    const id = generateId();
    const message = { _id: id, ...messageData, createdAt: new Date() };
    db.messages.set(id, message);
    return message;
}

export async function findMessagesByUser(userId) {
    return Array.from(db.messages.values())
        .filter(message => message.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
}