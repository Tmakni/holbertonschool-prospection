import bcrypt from 'bcryptjs';

const password = 'Poupon33';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash pour Poupon33:', hash);