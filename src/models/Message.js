import { createMessage as dbCreateMessage, findMessagesByUser as dbFindMessagesByUser } from '../config/memoryDb.js';

export async function createMessage({ userId, contactId, content, tone, length }) {
    const message = {
        userId,
        contactId,
        content,
        tone,
        length
    };
    return await dbCreateMessage(message);
}

export async function findMessagesByUser(userId) {
    return await dbFindMessagesByUser(userId);
}