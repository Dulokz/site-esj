import { readFile } from 'node:fs/promises';
import { closeDatabase, transaction } from '../lib/platform/db.js';
try {
  const sql = await readFile(new URL('../db/001-platform.sql',import.meta.url),'utf8');
  await transaction((tx)=>tx.query(sql));
  console.log('Migração aplicada.');
} catch { console.error('Não foi possível aplicar a migração. Verifique conexão, TLS e permissões do banco.'); process.exitCode=1; }
finally { await closeDatabase(); }
