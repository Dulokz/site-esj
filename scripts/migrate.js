import { readdir, readFile } from 'node:fs/promises';
import { closeDatabase, transaction } from '../lib/platform/db.js';
try {
  const directory = new URL('../db/', import.meta.url);
  const files = (await readdir(directory)).filter((name) => /^\d{3}-[a-z0-9-]+\.sql$/i.test(name)).sort();
  await transaction(async (tx) => {
    await tx.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const name of files) {
      const applied = await tx.query('SELECT name FROM schema_migrations WHERE name=$1', [name]);
      if (applied.rowCount) continue;
      await tx.query(await readFile(new URL(name, directory), 'utf8'));
      await tx.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
    }
  });
  console.log('Migrações aplicadas.');
} catch { console.error('Não foi possível aplicar a migração. Verifique conexão, TLS e permissões do banco.'); process.exitCode=1; }
finally { await closeDatabase(); }
