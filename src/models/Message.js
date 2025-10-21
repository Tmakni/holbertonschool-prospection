import { createMessage as dbCreateMessage, findMessagesByUser as dbFindMessagesByUser } from '../config/memoryDb.js';

export async function createMessage({ userId, contactId, content, tone, objective, campaign, length }) {
    const message = {
        userId,
        contactId,
        content,
        tone,
        objective,
        campaign,
        length
    };
    return await dbCreateMessage(message);
}

export async function findMessagesByUser(userId) {
    return await dbFindMessagesByUser(userId);
}