// src/utils/usersStore.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// fichier placé à la racine du projet sous /data/users.json
const USERS_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

async function ensureFile() {
  // crée le dossier data/ et le fichier si besoin
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch (err) {
    await fs.writeFile(USERS_FILE, JSON.stringify([]), 'utf8');
  }
}

export async function readUsers() {
  await ensureFile();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (err) {
    // si le JSON est corrompu, le sauvegarder en backup et réinitialiser
    await fs.rename(USERS_FILE, USERS_FILE + '.broken.' + Date.now());
    await fs.writeFile(USERS_FILE, JSON.stringify([]), 'utf8');
    return [];
  }
}

export async function writeUsers(users) {
  await ensureFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const users = await readUsers();
  const emailLower = String(email).trim().toLowerCase();
  // comparaison en lowercase pour éviter les problèmes de casse
  return users.find(u => String(u.email || '').trim().toLowerCase() === emailLower) || null;
}

export async function addUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}
