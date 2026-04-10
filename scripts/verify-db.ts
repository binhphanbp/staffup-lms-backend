import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });

  await c.connect();
  console.log('✅ Connected to DB');

  // Check pgvector
  const ext = await c.query("SELECT extname, extversion FROM pg_extension WHERE extname='vector'");
  console.log('pgvector:', ext.rows.length > 0 ? `v${ext.rows[0].extversion}` : '❌ NOT INSTALLED');

  // Check tables
  const tables = await c.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
  );
  console.log(
    'Tables:',
    tables.rows.map((r) => r.tablename),
  );

  // Check AI chatbot tables specifically
  const aiTables = ['company_documents', 'document_chunks', 'chat_sessions', 'chat_messages'];
  for (const t of aiTables) {
    const exists = tables.rows.some((r) => r.tablename === t);
    console.log(`  ${exists ? '✅' : '❌'} ${t}`);
  }

  await c.end();
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
