import pg from 'pg';
let pool;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error('configuration_required');
  let url;
  try { url = new URL(process.env.DATABASE_URL); } catch { throw new Error('configuration_required'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.searchParams.get('sslmode') !== 'verify-full') throw new Error('configuration_required');
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 20000 });
  return pool;
}
export async function closeDatabase() { await pool?.end(); pool = undefined; }
export async function transaction(fn, db = database()) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout = '20000'");
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function lockTenant(db, tenantId) {
  await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [tenantId]);
}
