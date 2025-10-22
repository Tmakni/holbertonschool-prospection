import { createMessage as dbCreateMessage, findMessagesByUser as dbFindMessagesByUser } from '../config/mysqlProcedures.js';
import { isMysqlAvailable } from '../config/mysqlProcedures.js';
import * as memoryDb from '../config/memoryDb.js';

// Utiliser MySQL si disponible, sinon memoryDb
const getCreateMessage = () => isMysqlAvailable() ? dbCreateMessage : memoryDb.createMessage;
const getFindMessagesByUser = () => isMysqlAvailable() ? dbFindMessagesByUser : memoryDb.findMessagesByUser;

export async function createMessage({ userId, contactId, content, tone, objective, campaign, length, generatedBy, generated_by }) {
    const message = {
        userId,
        contactId,
        content,
        tone,
        objective,
        campaign,
        length,
        generatedBy: generatedBy || generated_by || 'template'
    };
    return await getCreateMessage()(message);
}

export async function findMessagesByUser(userId) {
    return await getFindMessagesByUser()(userId);
}