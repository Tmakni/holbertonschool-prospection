import { createContact as dbCreateContact, findContactsByUser as dbFindContactsByUser } from '../config/mysqlProcedures.js';
import { isMysqlAvailable } from '../config/mysqlProcedures.js';
import * as memoryDb from '../config/memoryDb.js';

// Utiliser MySQL si disponible, sinon memoryDb
const getCreateContact = () => isMysqlAvailable() ? dbCreateContact : memoryDb.createContact;
const getFindContactsByUser = () => isMysqlAvailable() ? dbFindContactsByUser : memoryDb.findContactsByUser;

export async function createContact({ userId, name, email, linkedin }) {
    const contact = {
        userId,
        name,
        email: email.toLowerCase(),
        linkedin
    };
    return await getCreateContact()(contact);
}

export async function findContactsByUser(userId) {
    return await getFindContactsByUser()(userId);
}

export async function findContactById(id) {
    const contact = await getFindContactsByUser()(id);
    return contact.find(c => c._id === id);
}