import 'dotenv/config';
import { Client } from 'pg';
import argon2 from 'argon2';

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  const password = 'admin123';
  const hash = await argon2.hash(password);
  console.log('Argon2 hash:', hash.substring(0, 30) + '...');

  await c.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@staffup.vn']);
  console.log('✅ Updated admin password with argon2 hash');

  // Verify
  const user = await c.query('SELECT id, email, password_hash FROM users WHERE email = $1', [
    'admin@staffup.vn',
  ]);
  const valid = await argon2.verify(user.rows[0].password_hash, password);
  console.log('✅ Password verification:', valid ? 'PASS' : 'FAIL');

  await c.end();
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
