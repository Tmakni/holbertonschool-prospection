import fetch from 'node-fetch';
import fs from 'fs';

async function run() {
  try {
    const base = 'http://localhost:3000';
    console.log('Registering...');
    let res = await fetch(base + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'script@test.com', password: 'password123', name: 'Script' })
    });
    console.log('register status', res.status);
    console.log('register headers', Object.fromEntries(res.headers.entries()));
    const text1 = await res.text();
    console.log('register body', text1);

    console.log('\nLogging in...');
    res = await fetch(base + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'script@test.com', password: 'password123' })
    });
    console.log('login status', res.status);
    console.log('login headers', Object.fromEntries(res.headers.entries()));
    const text2 = await res.text();
    console.log('login body', text2);
  } catch (e) {
    console.error('error', e);
  }
}

run();
