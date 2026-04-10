import 'dotenv/config';
import { Client } from 'pg';
import crypto from 'crypto';

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  console.log('✅ Connected to DB\n');

  // 1. Create default department if needed
  let deptId: number;
  const depts = await c.query('SELECT id, name FROM departments ORDER BY id');
  if (depts.rows.length === 0) {
    const dept = await c.query(
      `INSERT INTO departments (name, created_at, updated_at)
       VALUES ('Ban Giám đốc', NOW(), NOW())
       RETURNING id, name`,
    );
    deptId = dept.rows[0].id;
    console.log('✅ Created department:', dept.rows[0]);
  } else {
    deptId = depts.rows[0].id;
    console.log('✅ Department exists:', depts.rows[0]);
  }

  // 2. Create roles if needed
  const roles = await c.query('SELECT id, name FROM roles ORDER BY id');
  let adminRoleId: number;
  if (roles.rows.length === 0) {
    const roleInsert = await c.query(
      `INSERT INTO roles (name, description, created_at, updated_at) VALUES
       ('admin', 'Quản trị viên hệ thống', NOW(), NOW()),
       ('trainer', 'Giảng viên', NOW(), NOW()),
       ('learner', 'Học viên', NOW(), NOW())
       RETURNING id, name`,
    );
    adminRoleId = roleInsert.rows[0].id;
    console.log(
      '✅ Created roles:',
      roleInsert.rows.map((r: any) => r.name),
    );
  } else {
    const adminRole = roles.rows.find((r: any) => r.name === 'admin') || roles.rows[0];
    adminRoleId = adminRole.id;
    console.log(
      '✅ Roles exist:',
      roles.rows.map((r: any) => r.name),
    );
  }

  // 3. Create admin user if needed
  const users = await c.query('SELECT id, email, full_name FROM users ORDER BY id');
  if (users.rows.length === 0) {
    const password = 'admin123';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const user = await c.query(
      `INSERT INTO users (department_id, email, password_hash, full_name, position_title, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING id, email, full_name`,
      [deptId, 'admin@staffup.vn', passwordHash, 'Admin StaffUp', 'System Administrator'],
    );
    console.log('✅ Created admin user:', user.rows[0]);

    // Assign admin role
    await c.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user.rows[0].id, adminRoleId],
    );
    console.log('✅ Assigned admin role');
  } else {
    console.log(
      '✅ Users exist:',
      users.rows.map((u: any) => u.email),
    );
  }

  // 4. Update company_documents uploaded_by_user_id
  const firstUser = (await c.query('SELECT id FROM users ORDER BY id LIMIT 1')).rows[0];
  if (firstUser) {
    await c.query(
      'UPDATE company_documents SET uploaded_by_id = $1 WHERE uploaded_by_id IS NULL OR uploaded_by_id != $1',
      [firstUser.id],
    );
    console.log(`✅ Updated company_documents uploaded_by_id = ${firstUser.id}`);
  }

  // 5. Summary
  const docCount = (await c.query('SELECT count(*) FROM company_documents')).rows[0].count;
  const chunkCount = (await c.query('SELECT count(*) FROM document_chunks')).rows[0].count;
  console.log(`\n📊 Summary:`);
  console.log(`  📄 Company Documents: ${docCount}`);
  console.log(`  📦 Document Chunks: ${chunkCount}`);
  console.log(`  👤 Users: ${(await c.query('SELECT count(*) FROM users')).rows[0].count}`);
  console.log(`  🔑 Roles: ${(await c.query('SELECT count(*) FROM roles')).rows[0].count}`);

  await c.end();
  console.log('\n🎉 Database setup complete!');
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
