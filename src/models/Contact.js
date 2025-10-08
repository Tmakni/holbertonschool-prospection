import { createContact as dbCreateContact, findContactsByUser as dbFindContactsByUser } from '../config/memoryDb.js';

export async function createContact({ userId, name, email, linkedin }) {
    const contact = {
        userId,
        name,
        email: email.toLowerCase(),
        linkedin
    };
    return await dbCreateContact(contact);
}

export async function findContactsByUser(userId) {
    return await dbFindContactsByUser(userId);
}

export async function findContactById(id) {
    const contact = await dbFindContactsByUser(id);
    return contact.find(c => c._id === id);
}