import { randomUUID } from 'node:crypto';
import { hash, opaqueToken, HttpError, requireAdmin } from './security.js';
export async function authenticate(req, db) {
  const cookies = (req.headers.cookie || '').split(';').map((part) => part.trim());
  const tokens = cookies.filter((part) => part.startsWith('__Host-esj_session='));
  if (tokens.length !== 1) throw new HttpError(401, 'authentication_required');
  const token = tokens[0].slice('__Host-esj_session='.length);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new HttpError(401, 'authentication_required');
  const { rows } = await db.query(`SELECT s.id AS "sessionId", u.id AS "userId", u.tenant_id AS "tenantId", u.role, u.email, t.name AS "tenantName"
    FROM sessions s JOIN users u ON u.id=s.user_id AND u.tenant_id=s.tenant_id
    JOIN tenants t ON t.id=u.tenant_id WHERE s.token_hash=$1 AND s.expires_at>now()`, [hash(token)]);
  return requireAdmin(rows[0]);
}
export async function createSession(user, db, res) {
  const token = opaqueToken();
  await db.query(`INSERT INTO sessions(id,user_id,tenant_id,token_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '8 hours')`, [randomUUID(), user.id, user.tenant_id, hash(token)]);
  res.setHeader('Set-Cookie', `__Host-esj_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
}
export function clearSession(res) {
  res.setHeader('Set-Cookie', '__Host-esj_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
}
