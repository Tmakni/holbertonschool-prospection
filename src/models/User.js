import { createUser as dbCreateUser, findUserByEmail as dbFindUserByEmail, findUserById as dbFindUserById } from '../config/memoryDb.js';

export async function createUser({ email, password, name }) {
    const user = {
        email: email.toLowerCase(),
        password,
        name,
    };
    return await dbCreateUser(user);
}

export async function findUserByEmail(email) {
    return await dbFindUserByEmail(email);
}

export async function findUserById(id) {
    return await dbFindUserById(id);
}