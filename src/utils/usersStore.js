import { promises as fs } from 'fs';
const FILE = './data/users.json';

async function readAll() {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}
async function writeAll(users) {
  await fs.writeFile(FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function findUserByEmail(emailLower) {
  const users = await readAll();
  return users.find(u => String(u.email).trim().toLowerCase() === String(emailLower).trim().toLowerCase()) || null;
}

export async function addUser(user) {
  const users = await readAll();
  users.push(user);
  await writeAll(users);
  return user;
}
