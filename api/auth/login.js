import { api } from '../../lib/platform/api.js';
import { objectBody, verifyPassword, HttpError, hash } from '../../lib/platform/security.js';
import { rateLimit } from '../../lib/platform/store.js';
import { createSession } from '../../lib/platform/auth.js';
const dummy = 'scrypt:00000000000000000000000000000000:' + '00'.repeat(64);
export default api('POST', async ({ body, db, req, res }) => {
  objectBody(body, ['email', 'password']);
  if (typeof body.email !== 'string' || body.email.length > 254 || typeof body.password !== 'string' || body.password.length > 256) throw new HttpError(400, 'invalid_parameters');
  const email = body.email.trim().toLowerCase();
  // Trust only the Vercel-provided address header on Vercel; local socket otherwise.
  const address = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] || 'unknown' : req.socket?.remoteAddress || 'local';
  await rateLimit(db, `login-ip:${hash(String(address))}`, 20, 900);
  await rateLimit(db, `login-email:${email}`, 10, 900);
  const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  const valid = await verifyPassword(body.password, rows[0]?.password_hash || dummy);
  if (!valid || rows[0]?.role !== 'admin') throw new HttpError(401, 'invalid_login');
  await createSession(rows[0], db, res);
  return { authenticated: true };
}, { auth: false });
