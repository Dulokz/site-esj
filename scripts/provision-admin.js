import { randomUUID } from 'node:crypto';
import { closeDatabase,transaction } from '../lib/platform/db.js';
import { passwordHash } from '../lib/platform/security.js';
try {
  const { PROVISION_EMAIL:email,PROVISION_PASSWORD:password,PROVISION_TENANT_NAME:name,PROVISION_TENANT_SLUG:slug }=process.env;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || name.length>200 || !/^[a-z0-9-]{2,80}$/.test(slug || '')) throw new Error();
  const encoded=await passwordHash(password);
  await transaction(async(tx)=>{
    const existing=await tx.query('SELECT id FROM tenants WHERE slug=$1',[slug]);
    const tenantId=existing.rows[0]?.id || randomUUID();
    if(!existing.rowCount) await tx.query('INSERT INTO tenants(id,name,slug) VALUES($1,$2,$3)',[tenantId,name,slug]);
    await tx.query("INSERT INTO users(id,tenant_id,email,password_hash,role) VALUES($1,$2,$3,$4,'admin')",[randomUUID(),tenantId,email.toLowerCase().trim(),encoded]);
  });
  console.log('Administrador provisionado. Nenhuma credencial foi exibida.');
} catch { console.error('Provisionamento não concluído. Verifique os campos, a senha (14–256 caracteres) e se o e-mail já existe.'); process.exitCode=1; }
finally { await closeDatabase(); }
