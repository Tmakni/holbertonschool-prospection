import { createUser as dbCreateUser, findUserByEmail as dbFindUserByEmail, findUserById as dbFindUserById } from '../config/mysqlProcedures.js';

// FORCER l'utilisation de MySQL uniquement - plus de fallback mémoire
const getCreateUser = () => dbCreateUser;
const getFindUserByEmail = () => dbFindUserByEmail;
const getFindUserById = () => dbFindUserById;

export async function createUser({ email, password, name }) {
    const user = {
        email: email.toLowerCase(),
        password,
        name,
    };
    return await getCreateUser()(user);
}

export async function findUserByEmail(email) {
    return await getFindUserByEmail()(email);
}

export async function findUserById(id) {
    return await getFindUserById()(id);
}