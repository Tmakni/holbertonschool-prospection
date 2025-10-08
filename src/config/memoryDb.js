// Stockage temporaire en mémoire pour le développement
const db = {
    users: new Map(),
    contacts: new Map(),
    messages: new Map()
};

let isConnected = false;

export async function connectDB() {
    try {
        console.log('Utilisation du stockage en mémoire temporaire');
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