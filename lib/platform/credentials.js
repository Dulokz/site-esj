import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { HttpError } from './security.js';
export function encryptionKey() {
  const raw = process.env.META_TOKEN_ENCRYPTION_KEY || '';
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32 || key.toString('base64') !== raw) throw new HttpError(503, 'configuration_required');
  return key;
}
export function encryptCredential(secret, tenantId, id, key = encryptionKey()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(`meta_whatsapp:${tenantId}:${id}:v1`));
  return { ciphertext: Buffer.concat([cipher.update(JSON.stringify(secret), 'utf8'), cipher.final()]).toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}
export function decryptCredential(row, tenantId, key = encryptionKey()) {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(row.iv, 'base64'));
  decipher.setAAD(Buffer.from(`meta_whatsapp:${tenantId}:${row.id}:v1`));
  decipher.setAuthTag(Buffer.from(row.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(row.ciphertext, 'base64')), decipher.final()]).toString('utf8'));
}
export class CredentialStore {
  constructor(db) { this.db = db; }
  async storeCredential({ tenantId, provider, secret }) {
    if (provider !== 'meta_whatsapp') throw new Error('invalid_provider');
    const id = randomUUID();
    const encrypted = encryptCredential(secret, tenantId, id);
    await this.db.query("INSERT INTO credentials(id,tenant_id,provider,key_version,ciphertext,iv,tag) VALUES($1,$2,$3,'v1',$4,$5,$6)", [id, tenantId, provider, encrypted.ciphertext, encrypted.iv, encrypted.tag]);
    return id;
  }
  async get(tenantId, id) {
    const { rows } = await this.db.query('SELECT * FROM credentials WHERE id=$1 AND tenant_id=$2', [id, tenantId]);
    if (!rows[0]) throw new HttpError(409, 'credential_unavailable');
    return decryptCredential(rows[0], tenantId);
  }
  async delete(tenantId, id) { await this.db.query('DELETE FROM credentials WHERE id=$1 AND tenant_id=$2', [id, tenantId]); }
}
